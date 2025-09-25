export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  animationQuality: 'excellent' | 'good' | 'poor';
  memoryUsage: number;
}

export interface PerformanceThresholds {
  targetFPS: number;
  maxFrameTime: number;
  memoryWarningMB: number;
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private maxHistorySize = 60; // Keep last 60 measurements
  private isMonitoring = false;
  private rafId: number | null = null;

  private thresholds: PerformanceThresholds = {
    targetFPS: 60,
    maxFrameTime: 16.67, // ~60fps
    memoryWarningMB: 50
  };

  constructor(customThresholds?: Partial<PerformanceThresholds>) {
    if (customThresholds) {
      this.thresholds = { ...this.thresholds, ...customThresholds };
    }
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.fpsHistory = [];
    this.frameTimeHistory = [];

    this.measureFrame();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private measureFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;

    this.frameCount++;
    this.frameTimeHistory.push(frameTime);

    // Calculate FPS every 10 frames for stability
    if (this.frameCount % 10 === 0) {
      const avgFrameTime = this.frameTimeHistory.slice(-10).reduce((a, b) => a + b, 0) / 10;
      const fps = Math.round(1000 / avgFrameTime);

      this.fpsHistory.push(fps);

      // Keep history size manageable
      if (this.fpsHistory.length > this.maxHistorySize) {
        this.fpsHistory = this.fpsHistory.slice(-this.maxHistorySize);
      }
      if (this.frameTimeHistory.length > this.maxHistorySize) {
        this.frameTimeHistory = this.frameTimeHistory.slice(-this.maxHistorySize);
      }
    }

    this.lastFrameTime = currentTime;
    this.rafId = requestAnimationFrame(this.measureFrame);
  };

  getCurrentMetrics(): PerformanceMetrics {
    const avgFPS = this.fpsHistory.length > 0
      ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
      : 0;

    const avgFrameTime = this.frameTimeHistory.length > 0
      ? Math.round((this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length) * 100) / 100
      : 0;

    const animationQuality: PerformanceMetrics['animationQuality'] =
      avgFPS >= this.thresholds.targetFPS ? 'excellent' :
      avgFPS >= this.thresholds.targetFPS * 0.8 ? 'good' : 'poor';

    // Estimate memory usage (simplified)
    const memoryUsage = this.estimateMemoryUsage();

    return {
      fps: avgFPS,
      frameTime: avgFrameTime,
      animationQuality,
      memoryUsage
    };
  }

  private estimateMemoryUsage(): number {
    // Use performance.memory if available (Chrome)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
    }

    // Fallback estimation based on component complexity
    return Math.round(this.frameTimeHistory.length * 0.1 + this.fpsHistory.length * 0.05);
  }

  getPerformanceReport(): string {
    const metrics = this.getCurrentMetrics();
    return `Performance Report:
- Average FPS: ${metrics.fps}
- Frame Time: ${metrics.frameTime}ms
- Quality: ${metrics.animationQuality}
- Memory: ${metrics.memoryUsage}MB
- Target FPS: ${this.thresholds.targetFPS}`;
  }

  // Utility method for debugging
  logPerformanceWarnings(): void {
    const metrics = this.getCurrentMetrics();

    if (metrics.fps < this.thresholds.targetFPS * 0.8) {
      console.warn(`⚠️ Low FPS detected: ${metrics.fps} (target: ${this.thresholds.targetFPS})`);
    }

    if (metrics.frameTime > this.thresholds.maxFrameTime * 1.5) {
      console.warn(`⚠️ High frame time: ${metrics.frameTime}ms (target: <${this.thresholds.maxFrameTime}ms)`);
    }

    if (metrics.memoryUsage > this.thresholds.memoryWarningMB) {
      console.warn(`⚠️ Memory usage high: ${metrics.memoryUsage}MB`);
    }
  }
}

// Global performance monitor instance for hero viewfinder
export const heroViewfinderMonitor = new PerformanceMonitor({
  targetFPS: 60,
  maxFrameTime: 16.67,
  memoryWarningMB: 25 // Lower threshold for hero performance
});

// Hook for React components
export const usePerformanceMonitoring = (autoStart = false) => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    animationQuality: 'good',
    memoryUsage: 0
  });

  React.useEffect(() => {
    if (autoStart) {
      heroViewfinderMonitor.startMonitoring();
    }

    const interval = setInterval(() => {
      setMetrics(heroViewfinderMonitor.getCurrentMetrics());
    }, 1000); // Update metrics every second

    return () => {
      clearInterval(interval);
      if (autoStart) {
        heroViewfinderMonitor.stopMonitoring();
      }
    };
  }, [autoStart]);

  return {
    metrics,
    startMonitoring: () => heroViewfinderMonitor.startMonitoring(),
    stopMonitoring: () => heroViewfinderMonitor.stopMonitoring(),
    logWarnings: () => heroViewfinderMonitor.logPerformanceWarnings()
  };
};

// Import React for the hook
import React from 'react';