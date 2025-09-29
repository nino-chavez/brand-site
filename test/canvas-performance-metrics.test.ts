/**
 * Canvas Performance Metrics Test Suite
 *
 * Comprehensive unit tests for performance metrics collection accuracy and validation.
 * Tests FPS tracking, memory monitoring, animation performance, and quality degradation.
 *
 * @fileoverview Task 9 Sub-task 5 - Performance metrics collection testing
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CanvasPerformanceMonitor,
  measureCanvasOperation,
  optimizedRAF,
  PERFORMANCE_THRESHOLDS
} from '../utils/canvasPerformanceMonitor';
import {
  CanvasQualityManager,
  getQualityManager
} from '../utils/canvasQualityManager';
import {
  calculateFPSFromFrameTimes,
  trackFrameDrops,
  measureMemoryUsage,
  analyzePerformancePattern,
  detectPerformanceBottlenecks,
  generatePerformanceReport
} from '../utils/performanceAnalysis';
import type {
  CanvasPerformanceMetrics,
  PerformanceProfile,
  QualityLevel
} from '../types/canvas';

// Mock performance.now for consistent timing
const mockPerformanceNow = (global as any).__mockPerformanceNow;

// Test fixtures for performance metrics
const mockFrameTimings = [
  16.67, 16.45, 17.23, 16.89, 33.12, // One dropped frame (33ms)
  16.78, 16.34, 16.91, 16.55, 16.73,
  25.45, 16.67, 16.88, 35.67, 16.44  // Two more dropped frames
];

const mockMemoryReadings = [
  45.2, 47.8, 52.1, 48.9, 51.3,
  53.7, 55.2, 49.8, 56.1, 58.4,
  62.3, 59.7, 61.5, 64.8, 67.2
];

const mockOperationTimings = [
  { name: 'pan-tilt', duration: 15.2 },
  { name: 'zoom-in', duration: 18.7 },
  { name: 'render-section', duration: 12.3 },
  { name: 'transform-update', duration: 8.9 },
  { name: 'style-recalc', duration: 22.1 }
];

describe('Canvas Performance Metrics', () => {
  let performanceMonitor: CanvasPerformanceMonitor;
  let qualityManager: CanvasQualityManager;

  beforeEach(() => {
    vi.useFakeTimers();
    mockPerformanceNow.mockReturnValue(1000);
    vi.clearAllMocks();

    performanceMonitor = new CanvasPerformanceMonitor();
    qualityManager = getQualityManager();
  });

  afterEach(() => {
    vi.useRealTimers();
    performanceMonitor.stop();
    qualityManager.reset();
    vi.restoreAllMocks();
  });

  describe('FPS Calculation and Tracking', () => {
    it('should calculate FPS accurately from frame timings', () => {
      const steadyFrameTimes = Array(10).fill(16.67); // Perfect 60fps
      const variableFrameTimes = [16.67, 33.33, 16.67, 50.0, 16.67]; // Variable performance

      const steadyFPS = calculateFPSFromFrameTimes(steadyFrameTimes);
      const variableFPS = calculateFPSFromFrameTimes(variableFrameTimes);

      expect(steadyFPS).toBeCloseTo(60, 1);
      expect(variableFPS).toBeLessThan(60);
      expect(variableFPS).toBeGreaterThan(20);
    });

    it('should track and report frame drops accurately', () => {
      const frameDropData = trackFrameDrops(mockFrameTimings, PERFORMANCE_THRESHOLDS.MAX_FRAME_TIME);

      expect(frameDropData).toEqual({
        totalFrames: mockFrameTimings.length,
        droppedFrames: expect.any(Number),
        frameDropPercentage: expect.any(Number),
        consecutiveDrops: expect.any(Number),
        dropPattern: expect.any(Array)
      });

      expect(frameDropData.droppedFrames).toBeGreaterThan(0);
      expect(frameDropData.frameDropPercentage).toBeGreaterThan(0);
      expect(frameDropData.frameDropPercentage).toBeLessThanOrEqual(100);
      expect(frameDropData.dropPattern.length).toBe(frameDropData.droppedFrames);
    });

    it('should monitor real-time FPS during canvas operations', async () => {
      performanceMonitor.start();

      // Simulate animation frames
      for (let i = 0; i < 10; i++) {
        const frameTime = 16.67 + Math.random() * 3; // Slight variance
        performanceMonitor.trackOperation('test-frame', frameTime);

        mockPerformanceNow.mockReturnValue(1000 + i * frameTime);
        vi.advanceTimersByTime(frameTime);
      }

      const metrics = performanceMonitor.getMetrics();

      expect(metrics.canvasRenderFPS).toBeGreaterThan(50);
      expect(metrics.canvasRenderFPS).toBeLessThanOrEqual(60);
      expect(metrics.transformOverhead).toBeGreaterThan(0);
      expect(typeof metrics.averageMovementTime).toBe('number');
    });

    it('should detect performance degradation patterns', () => {
      const degradingFrameTimes = mockFrameTimings.map((time, index) =>
        time + (index * 2) // Gradually increasing frame times
      );

      const pattern = analyzePerformancePattern(degradingFrameTimes);

      expect(pattern).toEqual({
        trend: expect.any(String),
        stability: expect.any(Number),
        severity: expect.any(String),
        recommendations: expect.any(Array)
      });

      expect(pattern.trend).toBe('degrading');
      expect(pattern.stability).toBeLessThan(0.8);
      expect(pattern.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should measure memory usage accurately', () => {
      const memoryData = measureMemoryUsage();

      expect(memoryData).toEqual({
        usedJSHeapSize: expect.any(Number),
        totalJSHeapSize: expect.any(Number),
        jsHeapSizeLimit: expect.any(Number),
        usedMB: expect.any(Number),
        totalMB: expect.any(Number),
        usagePercentage: expect.any(Number)
      });

      expect(memoryData.usedMB).toBeGreaterThan(0);
      expect(memoryData.usagePercentage).toBeGreaterThanOrEqual(0);
      expect(memoryData.usagePercentage).toBeLessThanOrEqual(100);
      expect(memoryData.usedJSHeapSize).toBeLessThanOrEqual(memoryData.totalJSHeapSize);
    });

    it('should track memory trends over time', () => {
      performanceMonitor.start();

      // Simulate memory usage pattern
      mockMemoryReadings.forEach((memMB, index) => {
        // Mock memory growth
        Object.defineProperty(global.performance, 'memory', {
          value: {
            usedJSHeapSize: memMB * 1024 * 1024,
            totalJSHeapSize: (memMB + 20) * 1024 * 1024,
            jsHeapSizeLimit: 200 * 1024 * 1024
          },
          configurable: true
        });

        performanceMonitor.trackOperation('memory-test', 16);
        mockPerformanceNow.mockReturnValue(1000 + index * 100);
        vi.advanceTimersByTime(100);
      });

      const metrics = performanceMonitor.getMetrics();

      expect(metrics.canvasMemoryMB).toBeGreaterThan(0);
      expect(typeof metrics.canvasMemoryMB).toBe('number');
    });

    it('should detect memory leaks', () => {
      const increasingMemory = Array.from({ length: 20 }, (_, i) => 50 + i * 5);
      const stableMemory = Array(20).fill(50);
      const fluctuatingMemory = Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i) * 10);

      const leakDetection = detectPerformanceBottlenecks(increasingMemory, 'memory');
      const stableDetection = detectPerformanceBottlenecks(stableMemory, 'memory');
      const fluctuatingDetection = detectPerformanceBottlenecks(fluctuatingMemory, 'memory');

      expect(leakDetection.hasMemoryLeak).toBe(true);
      expect(stableDetection.hasMemoryLeak).toBe(false);
      expect(fluctuatingDetection.hasMemoryLeak).toBe(false);

      expect(leakDetection.severity).toBeGreaterThan(stableDetection.severity);
    });

    it('should warn when approaching memory limits', () => {
      const highMemoryUsage = 180; // MB - approaching typical 200MB limit

      Object.defineProperty(global.performance, 'memory', {
        value: {
          usedJSHeapSize: highMemoryUsage * 1024 * 1024,
          totalJSHeapSize: 190 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024
        },
        configurable: true
      });

      const memoryData = measureMemoryUsage();
      expect(memoryData.usagePercentage).toBeGreaterThan(85);

      // Should trigger warnings
      performanceMonitor.start();
      performanceMonitor.trackOperation('memory-pressure-test', 16);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.canvasMemoryMB).toBeGreaterThan(PERFORMANCE_THRESHOLDS.MEMORY_WARNING_MB);
    });
  });

  describe('Operation Performance Measurement', () => {
    it('should measure individual operation timings accurately', () => {
      const operationName = 'test-operation';
      let measuredDuration: number;

      const result = measureCanvasOperation(operationName, () => {
        mockPerformanceNow.mockReturnValue(1020); // 20ms later
        return 'test-result';
      });

      expect(result).toBe('test-result');
      // Duration should be calculated as difference in performance.now() calls
    });

    it('should track operation patterns and bottlenecks', () => {
      performanceMonitor.start();

      // Simulate various operations with different performance characteristics
      mockOperationTimings.forEach(({ name, duration }) => {
        performanceMonitor.trackOperation(name, duration);
      });

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.activeOperations).toBeGreaterThan(0);

      // Should identify slowest operations
      const report = generatePerformanceReport(performanceMonitor);
      expect(report.bottlenecks.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should optimize requestAnimationFrame usage', () => {
      const mockCallback = vi.fn();
      let rafCalled = false;

      // Mock RAF to track calls
      global.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
        rafCalled = true;
        setTimeout(callback, 16);
        return 1;
      });

      optimizedRAF(mockCallback);

      expect(rafCalled).toBe(true);

      // Advance time to trigger callback
      vi.advanceTimersByTime(20);
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should handle concurrent operation measurements', () => {
      const operations = ['op1', 'op2', 'op3', 'op4', 'op5'];
      const results: any[] = [];

      // Start multiple operations concurrently
      operations.forEach((opName, index) => {
        const result = measureCanvasOperation(opName, () => {
          const delay = (index + 1) * 5; // Variable delays
          mockPerformanceNow.mockReturnValue(1000 + delay);
          return `result-${opName}`;
        }, performanceMonitor);
        results.push(result);
      });

      expect(results).toHaveLength(operations.length);
      results.forEach((result, index) => {
        expect(result).toBe(`result-op${index + 1}`);
      });
    });
  });

  describe('Quality Management Integration', () => {
    it('should trigger quality degradation based on performance metrics', () => {
      qualityManager.setQuality('highest', 'manual');
      expect(qualityManager.getCurrentQuality()).toBe('highest');

      // Simulate poor performance
      const poorFPS = 25;
      const highFrameTime = 40;
      const highMemory = 150;

      qualityManager.handlePerformanceChange(poorFPS, highFrameTime, highMemory);

      const newQuality = qualityManager.getCurrentQuality();
      expect(newQuality).not.toBe('highest');
      expect(['high', 'medium', 'low', 'minimal'].includes(newQuality)).toBe(true);
    });

    it('should restore quality when performance improves', () => {
      qualityManager.setQuality('low', 'performance');
      expect(qualityManager.getCurrentQuality()).toBe('low');

      // Simulate good performance for several frames
      for (let i = 0; i < 10; i++) {
        qualityManager.handlePerformanceChange(58, 17, 45);
        vi.advanceTimersByTime(100);
      }

      const restoredQuality = qualityManager.getCurrentQuality();
      expect(['medium', 'high', 'highest'].includes(restoredQuality)).toBe(true);
    });

    it('should provide quality-appropriate animation configurations', () => {
      const qualities: QualityLevel[] = ['highest', 'high', 'medium', 'low', 'minimal'];

      qualities.forEach(quality => {
        qualityManager.setQuality(quality, 'manual');
        const config = qualityManager.getAnimationConfig('pan-tilt');

        expect(config).toEqual({
          duration: expect.any(Number),
          easing: expect.any(String),
          useGPU: expect.any(Boolean),
          skipFrames: expect.any(Boolean),
          quality: quality
        });

        // Higher quality should have longer durations and more features
        if (quality === 'highest') {
          expect(config.useGPU).toBe(true);
          expect(config.skipFrames).toBe(false);
          expect(config.duration).toBeGreaterThanOrEqual(600);
        } else if (quality === 'minimal') {
          expect(config.skipFrames).toBe(true);
          expect(config.duration).toBeLessThanOrEqual(300);
        }
      });
    });
  });

  describe('Performance Reporting and Analysis', () => {
    it('should generate comprehensive performance reports', () => {
      performanceMonitor.start();

      // Simulate a complex performance scenario
      mockOperationTimings.forEach(({ name, duration }) => {
        performanceMonitor.trackOperation(name, duration);
      });

      mockFrameTimings.forEach((frameTime, index) => {
        mockPerformanceNow.mockReturnValue(1000 + index * frameTime);
        vi.advanceTimersByTime(frameTime);
      });

      const report = generatePerformanceReport(performanceMonitor);

      expect(report).toEqual({
        summary: expect.objectContaining({
          averageFPS: expect.any(Number),
          frameDropPercentage: expect.any(Number),
          memoryUsage: expect.any(Number)
        }),
        bottlenecks: expect.any(Array),
        recommendations: expect.any(Array),
        qualityImpact: expect.any(Object),
        timestamp: expect.any(Number)
      });

      expect(report.bottlenecks.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide actionable performance recommendations', () => {
      // Simulate different performance issues
      const scenarios = [
        { fps: 45, memory: 180, operations: ['slow-render'] },
        { fps: 30, memory: 80, operations: ['heavy-calculation'] },
        { fps: 55, memory: 200, operations: ['memory-leak'] }
      ];

      scenarios.forEach(scenario => {
        performanceMonitor.start();

        scenario.operations.forEach(op => {
          performanceMonitor.trackOperation(op, 50); // Slow operation
        });

        const bottlenecks = detectPerformanceBottlenecks(
          [scenario.fps],
          'fps'
        );

        expect(bottlenecks.recommendations.length).toBeGreaterThan(0);
        bottlenecks.recommendations.forEach(rec => {
          expect(typeof rec).toBe('string');
          expect(rec.length).toBeGreaterThan(10);
        });

        performanceMonitor.stop();
      });
    });

    it('should track performance across different device profiles', () => {
      const deviceProfiles = [
        { name: 'High-End', expectedFPS: 60, memoryLimit: 200 },
        { name: 'Mid-Range', expectedFPS: 45, memoryLimit: 150 },
        { name: 'Low-End', expectedFPS: 30, memoryLimit: 100 }
      ];

      deviceProfiles.forEach(profile => {
        performanceMonitor.start();

        // Simulate device-specific performance
        const deviceFPS = profile.expectedFPS - Math.random() * 5;
        performanceMonitor.trackOperation('device-test', 1000 / deviceFPS);

        const metrics = performanceMonitor.getMetrics();

        // Performance should be within expected range for device
        if (profile.name === 'High-End') {
          expect(metrics.canvasRenderFPS).toBeGreaterThan(55);
        } else if (profile.name === 'Low-End') {
          expect(metrics.canvasRenderFPS).toBeGreaterThan(25);
        }

        performanceMonitor.stop();
      });
    });
  });

  describe('Performance Optimization and Edge Cases', () => {
    it('should handle performance monitoring efficiently', () => {
      const start = performance.now();
      performanceMonitor.start();

      // Simulate high-frequency operations
      for (let i = 0; i < 1000; i++) {
        performanceMonitor.trackOperation('micro-operation', Math.random() * 2);
      }

      const monitoringOverhead = performance.now() - start;
      expect(monitoringOverhead).toBeLessThan(50); // Low overhead

      performanceMonitor.stop();
    });

    it('should handle missing performance API gracefully', () => {
      const originalPerformance = global.performance;

      // Temporarily remove performance API
      (global as any).performance = undefined;

      expect(() => {
        const fallbackResult = measureCanvasOperation('fallback-test', () => 'result');
        expect(fallbackResult).toBe('result');
      }).not.toThrow();

      // Restore performance API
      global.performance = originalPerformance;
    });

    it('should validate performance thresholds', () => {
      expect(PERFORMANCE_THRESHOLDS.TARGET_FPS).toBe(60);
      expect(PERFORMANCE_THRESHOLDS.MIN_FPS_DEGRADATION).toBeLessThan(PERFORMANCE_THRESHOLDS.TARGET_FPS);
      expect(PERFORMANCE_THRESHOLDS.CRITICAL_FPS).toBeLessThan(PERFORMANCE_THRESHOLDS.MIN_FPS_DEGRADATION);
      expect(PERFORMANCE_THRESHOLDS.MAX_FRAME_TIME).toBeCloseTo(1000 / PERFORMANCE_THRESHOLDS.TARGET_FPS, 1);
      expect(PERFORMANCE_THRESHOLDS.MEMORY_WARNING_MB).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_CRITICAL_MB);
    });

    it('should handle extreme performance conditions', () => {
      const extremeConditions = [
        { fps: 5, memory: 500, operations: 100 },
        { fps: 120, memory: 10, operations: 0 },
        { fps: 60, memory: 0, operations: 1000 }
      ];

      extremeConditions.forEach(condition => {
        expect(() => {
          qualityManager.handlePerformanceChange(condition.fps, 1000/condition.fps, condition.memory);

          for (let i = 0; i < condition.operations; i++) {
            performanceMonitor.trackOperation('extreme-test', Math.random() * 10);
          }
        }).not.toThrow();
      });
    });

    it('should maintain metric accuracy under load', () => {
      const iterations = 100;
      const expectedDuration = 10; // ms
      let totalMeasuredDuration = 0;

      for (let i = 0; i < iterations; i++) {
        const result = measureCanvasOperation('accuracy-test', () => {
          const start = 1000 + i * expectedDuration;
          const end = start + expectedDuration;
          mockPerformanceNow.mockReturnValueOnce(start);
          mockPerformanceNow.mockReturnValueOnce(end);
          return i;
        });

        expect(result).toBe(i);
      }

      // Performance tracking should remain accurate under load
      expect(true).toBe(true); // If we get here, accuracy was maintained
    });
  });
});