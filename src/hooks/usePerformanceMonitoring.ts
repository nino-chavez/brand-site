/**
 * Performance Monitoring React Hook
 *
 * Clean observer pattern integration for React components to subscribe to
 * unified performance monitoring without tight coupling. Replaces scattered
 * monitoring hooks with a single, comprehensive interface.
 *
 * @fileoverview Task 6: Performance Monitoring Integration Hook
 * @version 1.0.0
 * @since Task 6.2 - Observer Pattern Implementation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPerformanceMonitoringService,
  type UnifiedPerformanceMetrics,
  type PerformanceDegradationAlert,
  type PerformanceAutoAction,
  type PerformanceObserver,
  type PerformanceMonitoringConfig
} from '../services/PerformanceMonitoringService';
import type { QualityLevel } from '../utils/canvasPerformanceMonitor';

// ===== HOOK CONFIGURATION TYPES =====

/**
 * Configuration for performance monitoring hook
 */
export interface UsePerformanceMonitoringConfig {
  // Observer configuration
  observerId?: string;
  autoStart?: boolean;
  enableMetricsUpdates?: boolean;
  enableAlerts?: boolean;
  enableQualityUpdates?: boolean;
  enableOptimizationUpdates?: boolean;

  // Monitoring configuration
  monitoringConfig?: Partial<PerformanceMonitoringConfig>;

  // Callback configuration
  onMetricsUpdate?: (metrics: UnifiedPerformanceMetrics) => void;
  onAlert?: (alert: PerformanceDegradationAlert) => void;
  onQualityChange?: (oldLevel: QualityLevel, newLevel: QualityLevel, reason: string) => void;
  onOptimization?: (action: PerformanceAutoAction) => void;

  // Data retention
  keepHistorySize?: number;
  keepAlertsSize?: number;
}

/**
 * Performance monitoring hook return interface
 */
export interface UsePerformanceMonitoringReturn {
  // Current metrics and state
  metrics: UnifiedPerformanceMetrics;
  alerts: PerformanceDegradationAlert[];
  appliedOptimizations: PerformanceAutoAction[];
  isMonitoring: boolean;
  isInitialized: boolean;

  // Historical data
  metricsHistory: UnifiedPerformanceMetrics[];
  activeAlerts: PerformanceDegradationAlert[];

  // Control methods
  startMonitoring: () => void;
  stopMonitoring: () => void;
  setQualityLevel: (level: QualityLevel, reason?: string) => void;
  trackOperation: (name: string, duration: number, metadata?: any) => void;

  // Utility methods
  getDeviceCapabilities: () => any;
  getMonitoringOverhead: () => number;
  validateAccuracy: () => { accurate: boolean; issues: string[]; accuracy: number };
  reset: () => void;

  // Status indicators
  performanceGrade: { grade: 'A' | 'B' | 'C' | 'D'; color: string; score: number };
  systemHealth: { healthy: boolean; issues: string[]; recommendations: string[] };
}

// ===== PERFORMANCE MONITORING HOOK =====

/**
 * Unified Performance Monitoring Hook
 *
 * Provides clean observer pattern integration for React components to subscribe
 * to comprehensive performance monitoring. Replaces multiple scattered monitoring
 * hooks with a single, unified interface.
 *
 * Features:
 * - Automatic service initialization and cleanup
 * - Configurable observer subscriptions
 * - Real-time metrics and alerts
 * - Historical data management
 * - Performance grade calculation
 * - System health assessment
 * - Zero-config defaults with full customization
 *
 * @param config Hook configuration options
 * @returns Performance monitoring interface
 */
export function usePerformanceMonitoring(
  config: UsePerformanceMonitoringConfig = {}
): UsePerformanceMonitoringReturn {
  // Configuration with defaults
  const {
    observerId = `perf-hook-${Math.random().toString(36).substr(2, 9)}`,
    autoStart = false,
    enableMetricsUpdates = true,
    enableAlerts = true,
    enableQualityUpdates = true,
    enableOptimizationUpdates = true,
    monitoringConfig,
    onMetricsUpdate,
    onAlert,
    onQualityChange,
    onOptimization,
    keepHistorySize = 60,
    keepAlertsSize = 10
  } = config;

  // State management
  const [metrics, setMetrics] = useState<UnifiedPerformanceMetrics>(() =>
    getDefaultMetrics()
  );
  const [alerts, setAlerts] = useState<PerformanceDegradationAlert[]>([]);
  const [appliedOptimizations, setAppliedOptimizations] = useState<PerformanceAutoAction[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<UnifiedPerformanceMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Service reference
  const serviceRef = useRef<ReturnType<typeof getPerformanceMonitoringService> | null>(null);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Initialize service and observer
  useEffect(() => {
    const initializeService = async () => {
      try {
        // Get service instance
        serviceRef.current = getPerformanceMonitoringService(monitoringConfig);

        // Initialize service
        await serviceRef.current.initialize();
        setIsInitialized(true);

        // Create observer
        observerRef.current = {
          id: observerId,
          onMetricsUpdate: enableMetricsUpdates ? (newMetrics) => {
            setMetrics(newMetrics);

            // Update history
            setMetricsHistory(prev => {
              const updated = [...prev, newMetrics];
              return updated.length > keepHistorySize
                ? updated.slice(-keepHistorySize)
                : updated;
            });

            // Call custom callback
            onMetricsUpdate?.(newMetrics);
          } : undefined,

          onDegradationAlert: enableAlerts ? (alert) => {
            setAlerts(prev => {
              const updated = [...prev, alert];
              return updated.length > keepAlertsSize
                ? updated.slice(-keepAlertsSize)
                : updated;
            });

            // Call custom callback
            onAlert?.(alert);
          } : undefined,

          onQualityChange: enableQualityUpdates ? (oldLevel, newLevel, reason) => {
            // Update metrics to reflect quality change
            setMetrics(prev => ({ ...prev, qualityLevel: newLevel }));

            // Call custom callback
            onQualityChange?.(oldLevel, newLevel, reason);
          } : undefined,

          onOptimizationApplied: enableOptimizationUpdates ? (action) => {
            setAppliedOptimizations(prev => [...prev, action]);

            // Call custom callback
            onOptimization?.(action);
          } : undefined
        };

        // Subscribe observer
        serviceRef.current.subscribe(observerRef.current);

        // Auto-start if configured
        if (autoStart) {
          serviceRef.current.startMonitoring();
          setIsMonitoring(true);
        }

      } catch (error) {
        console.error('Failed to initialize performance monitoring:', error);
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      if (serviceRef.current && observerRef.current) {
        serviceRef.current.unsubscribe(observerRef.current.id);
        if (isMonitoring) {
          serviceRef.current.stopMonitoring();
        }
      }
    };
  }, [
    observerId,
    autoStart,
    enableMetricsUpdates,
    enableAlerts,
    enableQualityUpdates,
    enableOptimizationUpdates,
    keepHistorySize,
    keepAlertsSize,
    onMetricsUpdate,
    onAlert,
    onQualityChange,
    onOptimization
  ]);

  // Control methods
  const startMonitoring = useCallback(() => {
    if (serviceRef.current && !isMonitoring) {
      serviceRef.current.startMonitoring();
      setIsMonitoring(true);
    }
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    if (serviceRef.current && isMonitoring) {
      serviceRef.current.stopMonitoring();
      setIsMonitoring(false);
    }
  }, [isMonitoring]);

  const setQualityLevel = useCallback((level: QualityLevel, reason: string = 'manual') => {
    if (serviceRef.current) {
      serviceRef.current.setQualityLevel(level, reason);
    }
  }, []);

  const trackOperation = useCallback((name: string, duration: number, metadata?: any) => {
    if (serviceRef.current) {
      serviceRef.current.trackOperation(name, duration, metadata);
    }
  }, []);

  // Utility methods
  const getDeviceCapabilities = useCallback(() => {
    return serviceRef.current?.getDeviceCapabilities() || null;
  }, []);

  const getMonitoringOverhead = useCallback(() => {
    return serviceRef.current?.getMonitoringOverhead() || 0;
  }, []);

  const validateAccuracy = useCallback(() => {
    return serviceRef.current?.validateAccuracy() || {
      accurate: false,
      issues: ['Service not available'],
      accuracy: 0
    };
  }, []);

  const reset = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.reset();
      setMetrics(getDefaultMetrics());
      setAlerts([]);
      setAppliedOptimizations([]);
      setMetricsHistory([]);
      setIsMonitoring(false);
    }
  }, []);

  // Derived state - active alerts (recent only)
  const activeAlerts = alerts.filter(alert =>
    (metrics.timestamp - alert.timestamp) < 30000 // Last 30 seconds
  );

  // Derived state - performance grade
  const performanceGrade = calculatePerformanceGrade(metrics);

  // Derived state - system health
  const systemHealth = calculateSystemHealth(metrics, activeAlerts);

  return {
    // Current state
    metrics,
    alerts,
    appliedOptimizations,
    isMonitoring,
    isInitialized,

    // Historical data
    metricsHistory,
    activeAlerts,

    // Control methods
    startMonitoring,
    stopMonitoring,
    setQualityLevel,
    trackOperation,

    // Utility methods
    getDeviceCapabilities,
    getMonitoringOverhead,
    validateAccuracy,
    reset,

    // Derived state
    performanceGrade,
    systemHealth
  };
}

// ===== SPECIALIZED HOOKS =====

/**
 * Simplified hook for basic FPS monitoring
 */
export function useFPSMonitoring(autoStart: boolean = false) {
  const { metrics, isMonitoring, startMonitoring, stopMonitoring } = usePerformanceMonitoring({
    autoStart,
    enableAlerts: false,
    enableQualityUpdates: false,
    enableOptimizationUpdates: false,
    keepHistorySize: 10
  });

  return {
    currentFPS: metrics.currentFPS,
    averageFPS: metrics.averageFPS,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
}

/**
 * Hook for memory monitoring only
 */
export function useMemoryMonitoring(autoStart: boolean = false) {
  const { metrics, alerts, isMonitoring, startMonitoring, stopMonitoring } = usePerformanceMonitoring({
    autoStart,
    enableQualityUpdates: false,
    enableOptimizationUpdates: false,
    keepHistorySize: 20
  });

  const memoryAlerts = alerts.filter(alert => alert.type === 'memory-leak');

  return {
    memoryUsageMB: metrics.memoryUsageMB,
    memoryPercentage: metrics.memoryPercentage,
    memoryAlerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
}

/**
 * Hook for canvas performance monitoring
 */
export function useCanvasPerformanceMonitoring(autoStart: boolean = false) {
  const {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    trackOperation,
    setQualityLevel
  } = usePerformanceMonitoring({
    autoStart,
    keepHistorySize: 30
  });

  const canvasAlerts = alerts.filter(alert =>
    alert.type === 'fps-drop' || alert.type === 'gpu-overload'
  );

  return {
    canvasRenderFPS: metrics.canvasRenderFPS,
    gpuUtilization: metrics.gpuUtilization,
    transformOverhead: metrics.transformOverhead,
    activeOperations: metrics.activeOperations,
    qualityLevel: metrics.qualityLevel,
    canvasAlerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    trackOperation,
    setQualityLevel
  };
}

/**
 * Hook for quality management only
 */
export function useQualityManagement(initialLevel: QualityLevel = 'high') {
  const {
    metrics,
    setQualityLevel,
    isInitialized,
    performanceGrade
  } = usePerformanceMonitoring({
    autoStart: true,
    enableAlerts: false,
    enableOptimizationUpdates: false
  });

  // Set initial quality level once initialized
  useEffect(() => {
    if (isInitialized) {
      setQualityLevel(initialLevel, 'initial');
    }
  }, [isInitialized, initialLevel, setQualityLevel]);

  return {
    currentQuality: metrics.qualityLevel,
    isOptimized: metrics.isOptimized,
    performanceGrade,
    setQualityLevel
  };
}

// ===== UTILITY FUNCTIONS =====

function getDefaultMetrics(): UnifiedPerformanceMetrics {
  return {
    currentFPS: 60,
    averageFPS: 60,
    frameTime: 16.67,
    droppedFrames: 0,
    totalFrames: 0,
    memoryUsageMB: 0,
    memoryPercentage: 0,
    heapSizeMB: 0,
    garbageCollections: 0,
    canvasRenderFPS: 60,
    averageMovementTime: 16.67,
    transformOverhead: 0,
    canvasMemoryMB: 0,
    gpuUtilization: 0,
    activeOperations: 0,
    networkLatency: 0,
    isLowPowerMode: false,
    compositeLayerCount: 0,
    qualityLevel: 'highest',
    isOptimized: false,
    timestamp: Date.now(),
    sessionDuration: 0
  };
}

function calculatePerformanceGrade(metrics: UnifiedPerformanceMetrics): {
  grade: 'A' | 'B' | 'C' | 'D';
  color: string;
  score: number;
} {
  // Calculate performance score (0-100)
  const fpsScore = (metrics.averageFPS / 60) * 30;
  const memoryScore = Math.max(0, 25 - (metrics.memoryPercentage / 100) * 25);
  const gpuScore = Math.max(0, 25 - (metrics.gpuUtilization / 100) * 25);
  const frameTimeScore = Math.max(0, 20 - Math.max(0, (metrics.frameTime - 16.67) / 16.67) * 20);

  const totalScore = Math.round(fpsScore + memoryScore + gpuScore + frameTimeScore);

  // Determine grade and color
  if (totalScore >= 90) return { grade: 'A', color: 'text-green-400', score: totalScore };
  if (totalScore >= 80) return { grade: 'B', color: 'text-yellow-400', score: totalScore };
  if (totalScore >= 70) return { grade: 'C', color: 'text-orange-400', score: totalScore };
  return { grade: 'D', color: 'text-red-400', score: totalScore };
}

function calculateSystemHealth(
  metrics: UnifiedPerformanceMetrics,
  alerts: PerformanceDegradationAlert[]
): { healthy: boolean; issues: string[]; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check FPS health
  if (metrics.averageFPS < 45) {
    issues.push(`Low FPS: ${metrics.averageFPS}`);
    recommendations.push('Reduce animation complexity');
  }

  // Check memory health
  if (metrics.memoryPercentage > 80) {
    issues.push(`High memory usage: ${metrics.memoryPercentage}%`);
    recommendations.push('Monitor memory leaks');
  }

  // Check GPU health
  if (metrics.gpuUtilization > 85) {
    issues.push(`High GPU utilization: ${Math.round(metrics.gpuUtilization)}%`);
    recommendations.push('Reduce visual effects');
  }

  // Check for critical alerts
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  if (criticalAlerts.length > 0) {
    issues.push(`${criticalAlerts.length} critical performance alert(s)`);
    recommendations.push('Address critical performance issues');
  }

  return {
    healthy: issues.length === 0,
    issues,
    recommendations
  };
}

// ===== LEGACY COMPATIBILITY =====

/**
 * Legacy compatibility hook for existing usePerformanceMonitoring usage
 * @deprecated Use the new usePerformanceMonitoring hook instead
 */
export function useLegacyPerformanceMonitoring(autoStart: boolean = false) {
  console.warn('useLegacyPerformanceMonitoring is deprecated. Use usePerformanceMonitoring instead.');

  const { metrics, startMonitoring, stopMonitoring } = usePerformanceMonitoring({
    autoStart,
    enableAlerts: false
  });

  return {
    metrics: {
      fps: metrics.currentFPS,
      frameTime: metrics.frameTime,
      animationQuality: metrics.averageFPS >= 55 ? 'excellent' :
                       metrics.averageFPS >= 45 ? 'good' : 'poor',
      memoryUsage: metrics.memoryUsageMB
    },
    startMonitoring,
    stopMonitoring,
    logWarnings: () => console.log('Performance warnings logged to service')
  };
}

export default usePerformanceMonitoring;