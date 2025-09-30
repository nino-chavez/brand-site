/**
 * Performance Observer Utilities
 *
 * Utility functions and components for integrating with the unified
 * PerformanceMonitoringService observer pattern. Provides migration
 * helpers and integration utilities for existing components.
 *
 * @fileoverview Task 6: Performance Observer Integration Utilities
 * @version 1.0.0
 * @since Task 6.2 - Observer Pattern Implementation
 */

import {
  getPerformanceMonitoringService,
  type UnifiedPerformanceMetrics,
  type PerformanceDegradationAlert,
  type PerformanceAutoAction,
  type PerformanceObserver
} from '../services/PerformanceMonitoringService';
import type { QualityLevel } from '../utils/canvasPerformanceMonitor';

// ===== OBSERVER FACTORY FUNCTIONS =====

/**
 * Create a metrics observer for components that only need metrics updates
 */
export function createMetricsObserver(
  id: string,
  callback: (metrics: UnifiedPerformanceMetrics) => void
): PerformanceObserver {
  return {
    id,
    onMetricsUpdate: callback
  };
}

/**
 * Create an alerts observer for components that handle performance alerts
 */
export function createAlertsObserver(
  id: string,
  callback: (alert: PerformanceDegradationAlert) => void
): PerformanceObserver {
  return {
    id,
    onDegradationAlert: callback
  };
}

/**
 * Create a quality observer for components that manage visual quality
 */
export function createQualityObserver(
  id: string,
  callback: (oldLevel: QualityLevel, newLevel: QualityLevel, reason: string) => void
): PerformanceObserver {
  return {
    id,
    onQualityChange: callback
  };
}

/**
 * Create a comprehensive observer for components that need all updates
 */
export function createComprehensiveObserver(
  id: string,
  callbacks: {
    onMetrics?: (metrics: UnifiedPerformanceMetrics) => void;
    onAlert?: (alert: PerformanceDegradationAlert) => void;
    onQuality?: (oldLevel: QualityLevel, newLevel: QualityLevel, reason: string) => void;
    onOptimization?: (action: PerformanceAutoAction) => void;
  }
): PerformanceObserver {
  return {
    id,
    onMetricsUpdate: callbacks.onMetrics,
    onDegradationAlert: callbacks.onAlert,
    onQualityChange: callbacks.onQuality,
    onOptimizationApplied: callbacks.onOptimization
  };
}

// ===== OBSERVER MANAGER =====

/**
 * Observer Manager for handling multiple observers with lifecycle management
 */
export class PerformanceObserverManager {
  private observers = new Map<string, PerformanceObserver>();
  private service = getPerformanceMonitoringService();

  /**
   * Add an observer to the manager
   */
  addObserver(observer: PerformanceObserver): void {
    this.observers.set(observer.id, observer);
    this.service.subscribe(observer);
  }

  /**
   * Remove an observer from the manager
   */
  removeObserver(observerId: string): void {
    if (this.observers.has(observerId)) {
      this.service.unsubscribe(observerId);
      this.observers.delete(observerId);
    }
  }

  /**
   * Remove all observers
   */
  removeAllObservers(): void {
    this.observers.forEach((_, id) => {
      this.service.unsubscribe(id);
    });
    this.observers.clear();
  }

  /**
   * Get all registered observer IDs
   */
  getObserverIds(): string[] {
    return Array.from(this.observers.keys());
  }

  /**
   * Check if an observer is registered
   */
  hasObserver(observerId: string): boolean {
    return this.observers.has(observerId);
  }
}

// ===== MIGRATION HELPERS =====

/**
 * Migration helper for components using the old PerformanceMonitor class
 */
export function migrateFromPerformanceMonitor(
  componentId: string,
  onMetricsUpdate: (metrics: { fps: number; frameTime: number; memoryUsage: number }) => void
): () => void {
  const observer = createMetricsObserver(componentId, (metrics) => {
    // Transform unified metrics to legacy format
    onMetricsUpdate({
      fps: metrics.currentFPS,
      frameTime: metrics.frameTime,
      memoryUsage: metrics.memoryUsageMB
    });
  });

  const service = getPerformanceMonitoringService();
  service.subscribe(observer);

  // Return cleanup function
  return () => {
    service.unsubscribe(componentId);
  };
}

/**
 * Migration helper for components using the old CanvasPerformanceMonitor
 */
export function migrateFromCanvasPerformanceMonitor(
  componentId: string,
  onMetricsUpdate: (metrics: any) => void,
  onQualityChange?: (level: QualityLevel) => void
): () => void {
  const observer = createComprehensiveObserver(componentId, {
    onMetrics: (metrics) => {
      // Transform to canvas-specific format
      onMetricsUpdate({
        canvasRenderFPS: metrics.canvasRenderFPS,
        averageMovementTime: metrics.averageMovementTime,
        transformOverhead: metrics.transformOverhead,
        canvasMemoryMB: metrics.canvasMemoryMB,
        gpuUtilization: metrics.gpuUtilization,
        activeOperations: metrics.activeOperations
      });
    },
    onQuality: onQualityChange ? (_, newLevel) => {
      onQualityChange(newLevel);
    } : undefined
  });

  const service = getPerformanceMonitoringService();
  service.subscribe(observer);

  return () => {
    service.unsubscribe(componentId);
  };
}

/**
 * Migration helper for the old PerformanceMonitor React component
 */
export function migrateFromPerformanceMonitorComponent(
  componentId: string,
  onPerformanceDegradation?: (alert: any) => void,
  onBatteryOptimization?: (shouldOptimize: boolean) => void
): () => void {
  const observer = createComprehensiveObserver(componentId, {
    onAlert: onPerformanceDegradation ? (alert) => {
      // Transform alert format
      onPerformanceDegradation({
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        metrics: alert.metrics,
        recommendations: alert.recommendations,
        autoActions: alert.autoActions
      });
    } : undefined,
    onOptimization: onBatteryOptimization ? (action) => {
      if (action.action === 'battery-save') {
        onBatteryOptimization(action.applied);
      }
    } : undefined
  });

  const service = getPerformanceMonitoringService();
  service.subscribe(observer);

  return () => {
    service.unsubscribe(componentId);
  };
}

// ===== INTEGRATION UTILITIES =====

/**
 * Create a performance monitoring wrapper for existing functions
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  operationName: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const service = getPerformanceMonitoringService();
    const start = performance.now();

    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start;
          service.trackOperation(operationName, duration, { args, async: true });
        });
      }

      // Handle sync functions
      const duration = performance.now() - start;
      service.trackOperation(operationName, duration, { args, async: false });
      return result;

    } catch (error) {
      const duration = performance.now() - start;
      service.trackOperation(`${operationName}-error`, duration, { args, error: error.message });
      throw error;
    }
  }) as T;
}

/**
 * Create a performance monitoring decorator for class methods
 */
export function performanceMonitored(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = withPerformanceMonitoring(name, originalMethod);
    return descriptor;
  };
}

/**
 * Batch observer subscription for multiple components
 */
export function subscribeObservers(...observers: PerformanceObserver[]): () => void {
  const service = getPerformanceMonitoringService();

  observers.forEach(observer => {
    service.subscribe(observer);
  });

  return () => {
    observers.forEach(observer => {
      service.unsubscribe(observer.id);
    });
  };
}

/**
 * Create a throttled observer to reduce update frequency
 */
export function createThrottledObserver(
  id: string,
  throttleMs: number,
  callback: (metrics: UnifiedPerformanceMetrics) => void
): PerformanceObserver {
  let lastUpdate = 0;

  return {
    id,
    onMetricsUpdate: (metrics) => {
      const now = performance.now();
      if (now - lastUpdate >= throttleMs) {
        lastUpdate = now;
        callback(metrics);
      }
    }
  };
}

/**
 * Create a buffered observer that batches updates
 */
export function createBufferedObserver(
  id: string,
  bufferSize: number,
  callback: (metricsBatch: UnifiedPerformanceMetrics[]) => void
): PerformanceObserver {
  const buffer: UnifiedPerformanceMetrics[] = [];

  return {
    id,
    onMetricsUpdate: (metrics) => {
      buffer.push(metrics);

      if (buffer.length >= bufferSize) {
        callback([...buffer]);
        buffer.length = 0; // Clear buffer
      }
    }
  };
}

/**
 * Create a conditional observer that only updates when conditions are met
 */
export function createConditionalObserver(
  id: string,
  condition: (metrics: UnifiedPerformanceMetrics) => boolean,
  callback: (metrics: UnifiedPerformanceMetrics) => void
): PerformanceObserver {
  return {
    id,
    onMetricsUpdate: (metrics) => {
      if (condition(metrics)) {
        callback(metrics);
      }
    }
  };
}

// ===== SPECIALIZED OBSERVERS =====

/**
 * Create an observer for FPS degradation alerts only
 */
export function createFPSObserver(
  id: string,
  fpsThreshold: number,
  callback: (fps: number, isLow: boolean) => void
): PerformanceObserver {
  return createConditionalObserver(id,
    (metrics) => metrics.currentFPS <= fpsThreshold || metrics.averageFPS <= fpsThreshold,
    (metrics) => callback(metrics.currentFPS, metrics.currentFPS <= fpsThreshold)
  );
}

/**
 * Create an observer for memory usage monitoring
 */
export function createMemoryObserver(
  id: string,
  memoryThresholdMB: number,
  callback: (memoryMB: number, percentage: number, isHigh: boolean) => void
): PerformanceObserver {
  return {
    id,
    onMetricsUpdate: (metrics) => {
      const isHigh = metrics.memoryUsageMB > memoryThresholdMB;
      callback(metrics.memoryUsageMB, metrics.memoryPercentage, isHigh);
    }
  };
}

/**
 * Create an observer for quality management
 */
export function createQualityMonitorObserver(
  id: string,
  callback: (qualityLevel: QualityLevel, isOptimized: boolean, reason?: string) => void
): PerformanceObserver {
  return {
    id,
    onMetricsUpdate: (metrics) => {
      callback(metrics.qualityLevel, metrics.isOptimized, metrics.optimizationReason);
    },
    onQualityChange: (_, newLevel, reason) => {
      callback(newLevel, false, reason);
    }
  };
}

/**
 * Create an observer for canvas performance monitoring
 */
export function createCanvasObserver(
  id: string,
  callback: (canvasMetrics: {
    renderFPS: number;
    gpuUtilization: number;
    activeOperations: number;
    transformOverhead: number;
  }) => void
): PerformanceObserver {
  return {
    id,
    onMetricsUpdate: (metrics) => {
      callback({
        renderFPS: metrics.canvasRenderFPS,
        gpuUtilization: metrics.gpuUtilization,
        activeOperations: metrics.activeOperations,
        transformOverhead: metrics.transformOverhead
      });
    }
  };
}

// ===== DEBUGGING AND VALIDATION =====

/**
 * Create a debug observer that logs all performance updates
 */
export function createDebugObserver(id: string, logLevel: 'info' | 'warn' | 'error' = 'info'): PerformanceObserver {
  return {
    id,
    onMetricsUpdate: (metrics) => {
      console[logLevel](`[${id}] Metrics:`, {
        fps: metrics.currentFPS,
        memory: `${metrics.memoryUsageMB}MB`,
        gpu: `${Math.round(metrics.gpuUtilization)}%`,
        quality: metrics.qualityLevel
      });
    },
    onDegradationAlert: (alert) => {
      console.warn(`[${id}] Alert:`, alert.message, alert);
    },
    onQualityChange: (oldLevel, newLevel, reason) => {
      console[logLevel](`[${id}] Quality: ${oldLevel} → ${newLevel} (${reason})`);
    },
    onOptimizationApplied: (action) => {
      console[logLevel](`[${id}] Optimization:`, action.action, action.impact);
    }
  };
}

/**
 * Create a validation observer that checks for performance monitoring accuracy
 */
export function createValidationObserver(
  id: string,
  callback: (validation: { accurate: boolean; issues: string[]; accuracy: number }) => void
): PerformanceObserver {
  let lastValidation = 0;

  return {
    id,
    onMetricsUpdate: (metrics) => {
      // Validate every 5 seconds
      if (performance.now() - lastValidation > 5000) {
        const service = getPerformanceMonitoringService();
        const validation = service.validateAccuracy();
        callback(validation);
        lastValidation = performance.now();
      }
    }
  };
}

// ===== GLOBAL OBSERVER INSTANCE =====

/**
 * Global observer manager instance for application-wide usage
 */
export const globalObserverManager = new PerformanceObserverManager();

/**
 * Register a global observer that will be automatically cleaned up
 */
export function registerGlobalObserver(observer: PerformanceObserver): void {
  globalObserverManager.addObserver(observer);
}

/**
 * Clean up all global observers (call on application shutdown)
 */
export function cleanupGlobalObservers(): void {
  globalObserverManager.removeAllObservers();
}

export default {
  createMetricsObserver,
  createAlertsObserver,
  createQualityObserver,
  createComprehensiveObserver,
  PerformanceObserverManager,
  migrateFromPerformanceMonitor,
  migrateFromCanvasPerformanceMonitor,
  migrateFromPerformanceMonitorComponent,
  withPerformanceMonitoring,
  performanceMonitored,
  subscribeObservers,
  createThrottledObserver,
  createBufferedObserver,
  createConditionalObserver,
  createFPSObserver,
  createMemoryObserver,
  createQualityMonitorObserver,
  createCanvasObserver,
  createDebugObserver,
  createValidationObserver,
  globalObserverManager,
  registerGlobalObserver,
  cleanupGlobalObservers
};