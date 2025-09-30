/**
 * Performance Monitor
 *
 * Real-time FPS tracking and performance monitoring for the visual effects system.
 * Automatically detects performance degradation and triggers effect adjustments.
 */

import type { PerformanceMetrics, PerformanceTier } from './types';
import { effectsManager } from './EffectsManager';

const FPS_SAMPLE_SIZE = 60; // Number of frames to average
const PERFORMANCE_CHECK_INTERVAL = 1000; // Check performance every second

class PerformanceMonitor {
  private isMonitoring: boolean = false;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private frameTimes: number[] = [];
  private rafId: number | null = null;
  private checkIntervalId: number | null = null;
  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
    droppedFrames: 0,
    memoryUsage: 0,
    timestamp: Date.now(),
  };

  constructor() {
    this.measureFrame = this.measureFrame.bind(this);
    this.checkPerformance = this.checkPerformance.bind(this);
  }

  /**
   * Start performance monitoring.
   */
  public start(): void {
    if (this.isMonitoring) {
      console.log('Performance monitor already running');
      return;
    }

    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.frameTimes = [];
    this.frameCount = 0;

    // Start RAF loop
    this.rafId = requestAnimationFrame(this.measureFrame);

    // Start periodic performance checks
    this.checkIntervalId = window.setInterval(
      this.checkPerformance,
      PERFORMANCE_CHECK_INTERVAL
    );

    console.log('Performance monitor started');
  }

  /**
   * Stop performance monitoring.
   */
  public stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }

    console.log('Performance monitor stopped');
  }

  /**
   * Measure frame time using requestAnimationFrame.
   */
  private measureFrame(timestamp: number): void {
    if (!this.isMonitoring) return;

    const frameTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Track frame time
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > FPS_SAMPLE_SIZE) {
      this.frameTimes.shift();
    }

    this.frameCount++;

    // Continue measuring
    this.rafId = requestAnimationFrame(this.measureFrame);
  }

  /**
   * Check performance metrics and update tier if needed.
   */
  private checkPerformance(): void {
    if (this.frameTimes.length === 0) return;

    // Calculate average frame time
    const avgFrameTime =
      this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;

    // Calculate FPS
    const fps = Math.round(1000 / avgFrameTime);

    // Count dropped frames (frames taking longer than 16.67ms for 60fps)
    const droppedFrames = this.frameTimes.filter((time) => time > 16.67).length;

    // Estimate memory usage (if available)
    const memoryUsage = this.estimateMemoryUsage();

    // Update metrics
    this.metrics = {
      fps,
      frameTime: avgFrameTime,
      droppedFrames,
      memoryUsage,
      timestamp: Date.now(),
    };

    // Determine performance tier
    const tier = this.calculatePerformanceTier(fps, droppedFrames);

    // Update effects manager
    effectsManager.updatePerformanceTier(tier);
  }

  /**
   * Calculate performance tier based on FPS and dropped frames.
   */
  private calculatePerformanceTier(fps: number, droppedFrames: number): PerformanceTier {
    if (fps >= 58 && droppedFrames < 3) {
      return 'excellent';
    } else if (fps >= 50 && droppedFrames < 10) {
      return 'good';
    } else if (fps >= 40) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Estimate memory usage if Performance API is available.
   */
  private estimateMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      // Convert to MB
      return Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  /**
   * Get current performance metrics.
   */
  public getMetrics(): Readonly<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get current FPS.
   */
  public getFPS(): number {
    return this.metrics.fps;
  }

  /**
   * Check if performance is good (>= 55fps).
   */
  public isPerformanceGood(): boolean {
    return this.metrics.fps >= 55;
  }

  /**
   * Get performance tier.
   */
  public getPerformanceTier(): PerformanceTier {
    return this.calculatePerformanceTier(this.metrics.fps, this.metrics.droppedFrames);
  }

  /**
   * Reset metrics tracking.
   */
  public reset(): void {
    this.frameTimes = [];
    this.frameCount = 0;
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      droppedFrames: 0,
      memoryUsage: 0,
      timestamp: Date.now(),
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();
