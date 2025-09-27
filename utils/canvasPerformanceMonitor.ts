/**
 * Canvas Performance Monitor
 *
 * Advanced performance monitoring and optimization system for 2D canvas operations.
 * Implements real-time FPS tracking, automatic quality degradation, memory monitoring,
 * and canvas bounds optimization for the photography lightbox system.
 *
 * @fileoverview Task 8: Performance Optimization and Monitoring
 * @version 1.0.0
 * @since 2025-09-27
 */

import type { CanvasPosition, CanvasPerformanceMetrics } from '../types/canvas';

// Performance thresholds and constants
export const PERFORMANCE_THRESHOLDS = {
  TARGET_FPS: 60,
  MIN_FPS_DEGRADATION: 45,
  CRITICAL_FPS: 30,
  MAX_FRAME_TIME: 16.67, // 60fps target
  MEMORY_WARNING_MB: 100,
  MEMORY_CRITICAL_MB: 200,
  GPU_UTILIZATION_HIGH: 85,
  SAMPLE_SIZE: 60, // 1 second at 60fps
  OPTIMIZATION_COOLDOWN: 2000 // 2 seconds between optimizations
} as const;

// Quality degradation levels
export type QualityLevel = 'highest' | 'high' | 'medium' | 'low' | 'minimal';

// Performance monitoring state
interface PerformanceMonitorState {
  frameTimings: number[];
  memoryReadings: number[];
  gpuUtilization: number[];
  currentFPS: number;
  averageFrameTime: number;
  memoryUsage: number;
  qualityLevel: QualityLevel;
  isOptimized: boolean;
  lastOptimization: number;
  droppedFrames: number;
  totalFrames: number;
  canvasOperations: Map<string, number>;
  boundingBoxCache: Map<string, DOMRect>;
}

// Viewport bounds for optimization
interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Advanced Canvas Performance Monitor
 *
 * Features:
 * - Real-time FPS monitoring with RAF precision
 * - Automatic quality degradation when performance drops
 * - Memory usage tracking and leak detection
 * - GPU utilization estimation
 * - Canvas bounds optimization for off-screen elements
 * - Performance debugging tools
 */
export class CanvasPerformanceMonitor {
  private state: PerformanceMonitorState;
  private rafId: number | null = null;
  private observer: PerformanceObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private onMetricsUpdate: ((metrics: CanvasPerformanceMetrics) => void) | null = null;
  private onQualityChange: ((level: QualityLevel) => void) | null = null;
  private debugMode: boolean = false;

  constructor(
    onMetricsUpdate?: (metrics: CanvasPerformanceMetrics) => void,
    onQualityChange?: (level: QualityLevel) => void
  ) {
    this.state = {
      frameTimings: [],
      memoryReadings: [],
      gpuUtilization: [],
      currentFPS: PERFORMANCE_THRESHOLDS.TARGET_FPS,
      averageFrameTime: PERFORMANCE_THRESHOLDS.MAX_FRAME_TIME,
      memoryUsage: 0,
      qualityLevel: 'highest',
      isOptimized: false,
      lastOptimization: 0,
      droppedFrames: 0,
      totalFrames: 0,
      canvasOperations: new Map(),
      boundingBoxCache: new Map()
    };

    this.onMetricsUpdate = onMetricsUpdate || null;
    this.onQualityChange = onQualityChange || null;

    this.initializePerformanceObserver();
    this.initializeResizeObserver();
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.rafId) return; // Already running

    const startTime = performance.now();
    let lastFrameTime = startTime;

    const measureFrame = (currentTime: number) => {
      const frameTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      this.updateFrameMetrics(frameTime);
      this.updateMemoryMetrics();
      this.updateGPUMetrics();
      this.checkPerformanceThresholds();
      this.reportMetrics();

      this.rafId = requestAnimationFrame(measureFrame);
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
  }

  /**
   * Track canvas operation performance
   */
  trackOperation(operationName: string, duration: number): void {
    const currentCount = this.state.canvasOperations.get(operationName) || 0;
    this.state.canvasOperations.set(operationName, currentCount + duration);

    // Check for expensive operations
    if (duration > PERFORMANCE_THRESHOLDS.MAX_FRAME_TIME) {
      this.logDebug(`Expensive operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
      this.state.droppedFrames++;
    }
  }

  /**
   * Track canvas transition performance
   */
  trackTransition(
    from: CanvasPosition,
    to: CanvasPosition,
    movement: string,
    duration: number
  ): void {
    const distance = Math.sqrt(
      Math.pow(to.x - from.x, 2) +
      Math.pow(to.y - from.y, 2)
    );

    const expectedDuration = this.calculateExpectedDuration(distance, to.scale - from.scale);
    const efficiency = expectedDuration / duration;

    this.trackOperation(`transition-${movement}`, duration);

    if (efficiency < 0.8) {
      this.logDebug(`Slow transition detected: ${movement} efficiency ${(efficiency * 100).toFixed(1)}%`);
    }
  }

  /**
   * Optimize canvas bounds - hide off-screen sections
   */
  optimizeCanvasBounds(
    canvasPosition: CanvasPosition,
    viewport: ViewportBounds,
    sections: Array<{ id: string; element: HTMLElement; position: CanvasPosition }>
  ): void {
    const currentTime = performance.now();

    // Throttle optimization to avoid excessive calculations
    if (currentTime - this.state.lastOptimization < 100) return;

    this.state.lastOptimization = currentTime;

    sections.forEach(section => {
      const isVisible = this.isSectionVisible(
        section.position,
        canvasPosition,
        viewport
      );

      // Apply optimization based on visibility
      if (isVisible) {
        this.enableSection(section.element);
      } else {
        this.disableSection(section.element);
      }
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): CanvasPerformanceMetrics {
    return {
      canvasRenderFPS: this.state.currentFPS,
      averageMovementTime: this.state.averageFrameTime,
      transformOverhead: this.getAverageOperationTime('transform'),
      canvasMemoryMB: this.state.memoryUsage,
      gpuUtilization: this.getAverageGPUUtilization(),
      activeOperations: this.state.canvasOperations.size
    };
  }

  /**
   * Enable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Get performance debug info
   */
  getDebugInfo(): any {
    return {
      state: { ...this.state },
      thresholds: PERFORMANCE_THRESHOLDS,
      recentOperations: Array.from(this.state.canvasOperations.entries()),
      memoryTrend: this.getMemoryTrend(),
      frameTimeHistogram: this.getFrameTimeHistogram(),
      recommendations: this.getOptimizationRecommendations()
    };
  }

  // Private methods

  private updateFrameMetrics(frameTime: number): void {
    this.state.totalFrames++;
    this.state.frameTimings.push(frameTime);

    // Keep only recent samples
    if (this.state.frameTimings.length > PERFORMANCE_THRESHOLDS.SAMPLE_SIZE) {
      this.state.frameTimings.shift();
    }

    // Calculate current FPS and average frame time
    this.state.currentFPS = 1000 / frameTime;
    this.state.averageFrameTime =
      this.state.frameTimings.reduce((a, b) => a + b, 0) /
      this.state.frameTimings.length;

    // Track dropped frames
    if (frameTime > PERFORMANCE_THRESHOLDS.MAX_FRAME_TIME * 1.5) {
      this.state.droppedFrames++;
    }
  }

  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memoryMB = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      this.state.memoryUsage = memoryMB;
      this.state.memoryReadings.push(memoryMB);

      // Keep only recent samples
      if (this.state.memoryReadings.length > PERFORMANCE_THRESHOLDS.SAMPLE_SIZE) {
        this.state.memoryReadings.shift();
      }
    }
  }

  private updateGPUMetrics(): void {
    // Estimate GPU utilization based on frame performance
    const targetFrameTime = PERFORMANCE_THRESHOLDS.MAX_FRAME_TIME;
    const actualFrameTime = this.state.averageFrameTime;
    const utilization = Math.min(100, (actualFrameTime / targetFrameTime) * 60);

    this.state.gpuUtilization.push(utilization);

    if (this.state.gpuUtilization.length > PERFORMANCE_THRESHOLDS.SAMPLE_SIZE) {
      this.state.gpuUtilization.shift();
    }
  }

  private checkPerformanceThresholds(): void {
    const avgFPS = 1000 / this.state.averageFrameTime;
    let newQualityLevel = this.state.qualityLevel;
    let shouldOptimize = false;

    // Determine quality level based on performance
    if (avgFPS < PERFORMANCE_THRESHOLDS.CRITICAL_FPS) {
      newQualityLevel = 'minimal';
      shouldOptimize = true;
    } else if (avgFPS < PERFORMANCE_THRESHOLDS.MIN_FPS_DEGRADATION) {
      newQualityLevel = 'low';
      shouldOptimize = true;
    } else if (avgFPS < PERFORMANCE_THRESHOLDS.TARGET_FPS * 0.9) {
      newQualityLevel = 'medium';
    } else if (avgFPS >= PERFORMANCE_THRESHOLDS.TARGET_FPS * 0.95) {
      newQualityLevel = 'high';
    } else {
      newQualityLevel = 'highest';
    }

    // Apply quality changes
    if (newQualityLevel !== this.state.qualityLevel) {
      this.state.qualityLevel = newQualityLevel;
      this.onQualityChange?.(newQualityLevel);
    }

    // Apply optimization if needed
    if (shouldOptimize && !this.state.isOptimized) {
      this.applyPerformanceOptimization();
    } else if (!shouldOptimize && this.state.isOptimized && avgFPS > PERFORMANCE_THRESHOLDS.TARGET_FPS * 0.95) {
      this.removePerformanceOptimization();
    }
  }

  private applyPerformanceOptimization(): void {
    const now = performance.now();
    if (now - this.state.lastOptimization < PERFORMANCE_THRESHOLDS.OPTIMIZATION_COOLDOWN) {
      return;
    }

    this.state.isOptimized = true;
    this.state.lastOptimization = now;

    this.logDebug('Applying performance optimization');

    // Dispatch optimization event
    window.dispatchEvent(new CustomEvent('canvas-performance-optimize', {
      detail: { level: this.state.qualityLevel }
    }));
  }

  private removePerformanceOptimization(): void {
    this.state.isOptimized = false;
    this.logDebug('Removing performance optimization');

    // Dispatch restoration event
    window.dispatchEvent(new CustomEvent('canvas-performance-restore', {
      detail: { level: this.state.qualityLevel }
    }));
  }

  private isSectionVisible(
    sectionPosition: CanvasPosition,
    canvasPosition: CanvasPosition,
    viewport: ViewportBounds
  ): boolean {
    // Calculate section position relative to viewport
    const relativeX = (sectionPosition.x - canvasPosition.x) * canvasPosition.scale;
    const relativeY = (sectionPosition.y - canvasPosition.y) * canvasPosition.scale;

    // Add buffer for smooth transitions
    const buffer = 100;

    return (
      relativeX > -buffer &&
      relativeX < viewport.width + buffer &&
      relativeY > -buffer &&
      relativeY < viewport.height + buffer
    );
  }

  private enableSection(element: HTMLElement): void {
    element.style.visibility = 'visible';
    element.style.willChange = 'transform';
  }

  private disableSection(element: HTMLElement): void {
    element.style.visibility = 'hidden';
    element.style.willChange = 'auto';
  }

  private reportMetrics(): void {
    if (this.onMetricsUpdate) {
      this.onMetricsUpdate(this.getMetrics());
    }
  }

  private calculateExpectedDuration(distance: number, scaleChange: number): number {
    // Estimate expected duration based on distance and scale change
    const baseTime = Math.max(300, distance * 2);
    const scaleTime = Math.abs(scaleChange) * 200;
    return baseTime + scaleTime;
  }

  private getAverageOperationTime(operation: string): number {
    return this.state.canvasOperations.get(operation) || 0;
  }

  private getAverageGPUUtilization(): number {
    if (this.state.gpuUtilization.length === 0) return 0;
    return this.state.gpuUtilization.reduce((a, b) => a + b, 0) / this.state.gpuUtilization.length;
  }

  private getMemoryTrend(): 'stable' | 'increasing' | 'decreasing' {
    if (this.state.memoryReadings.length < 10) return 'stable';

    const recent = this.state.memoryReadings.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const change = last - first;

    if (Math.abs(change) < 1) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  private getFrameTimeHistogram(): Record<string, number> {
    const histogram: Record<string, number> = {
      '0-16ms': 0,
      '16-33ms': 0,
      '33-50ms': 0,
      '50ms+': 0
    };

    this.state.frameTimings.forEach(time => {
      if (time <= 16) histogram['0-16ms']++;
      else if (time <= 33) histogram['16-33ms']++;
      else if (time <= 50) histogram['33-50ms']++;
      else histogram['50ms+']++;
    });

    return histogram;
  }

  private getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.state.currentFPS < PERFORMANCE_THRESHOLDS.MIN_FPS_DEGRADATION) {
      recommendations.push('Reduce animation complexity');
    }

    if (this.state.memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_WARNING_MB) {
      recommendations.push('Optimize memory usage');
    }

    if (this.state.droppedFrames / this.state.totalFrames > 0.05) {
      recommendations.push('Reduce transform operations');
    }

    return recommendations;
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.trackOperation(entry.name, entry.duration);
          }
        }
      });

      this.observer.observe({ entryTypes: ['measure'] });
    }
  }

  private initializeResizeObserver(): void {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        // Clear bounding box cache on resize
        this.state.boundingBoxCache.clear();
      });
    }
  }

  private logDebug(message: string): void {
    if (this.debugMode) {
      console.log(`[CanvasPerformanceMonitor] ${message}`);
    }
  }
}

// Utility functions

/**
 * Create a performance measurement wrapper
 */
export function measureCanvasOperation<T>(
  name: string,
  operation: () => T,
  monitor?: CanvasPerformanceMonitor
): T {
  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;

  monitor?.trackOperation(name, duration);

  return result;
}

/**
 * Performance-aware requestAnimationFrame wrapper
 */
export function optimizedRAF(
  callback: FrameRequestCallback,
  qualityLevel: QualityLevel = 'highest'
): number {
  // Adjust frame rate based on quality level
  const frameDelays = {
    highest: 0,    // 60fps
    high: 0,       // 60fps
    medium: 16,    // ~30fps
    low: 33,       // ~20fps
    minimal: 50    // ~15fps
  };

  const delay = frameDelays[qualityLevel];

  if (delay === 0) {
    return requestAnimationFrame(callback);
  }

  return window.setTimeout(() => {
    requestAnimationFrame(callback);
  }, delay);
}

/**
 * Export for global access
 */
export default CanvasPerformanceMonitor;