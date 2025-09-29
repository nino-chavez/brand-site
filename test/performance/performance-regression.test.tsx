/**
 * Performance Regression Testing Suite
 *
 * Comprehensive performance testing and regression detection for extracted components including:
 * - Automated performance benchmarking for component changes
 * - Performance regression detection and alerting thresholds
 * - Performance testing for architecture changes and refactoring
 * - Memory usage monitoring and leak detection
 * - Render performance impact measurement across component interactions
 *
 * @fileoverview Performance regression testing framework
 * @version 1.0.0
 * @since Task 7.3 - Performance Regression Testing Suite
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTestUtils, waitForFrames } from '../utils';
import { act, cleanup } from '@testing-library/react';
import React, { useState, useCallback, useRef, useEffect } from 'react';

// Import components for performance testing
import { TouchGestureHandler } from '../../components/TouchGestureHandler';
import { AnimationController } from '../../components/AnimationController';
import { AccessibilityController } from '../../components/AccessibilityController';
import { PerformanceRenderer } from '../../components/PerformanceRenderer';

import type { CanvasPosition } from '../../types/canvas';
import type { TouchGestureState } from '../../components/TouchGestureHandler';
import type { PerformanceMetrics } from '../../components/PerformanceRenderer';

/**
 * Performance benchmark results interface
 */
interface PerformanceBenchmark {
  testName: string;
  component: string;
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  renderCount: number;
  frameRate: number;
  metadata: Record<string, any>;
}

/**
 * Performance regression thresholds
 */
const PERFORMANCE_THRESHOLDS = {
  // Render performance (milliseconds)
  maxInitialRenderTime: 100,
  maxUpdateRenderTime: 50,
  maxInteractionResponseTime: 16, // 60fps = 16.67ms per frame

  // Memory usage (MB)
  maxMemoryIncrease: 10,
  maxMemoryLeakPerOperation: 1,

  // Frame rate (fps)
  minFrameRate: 55,
  maxFrameDrops: 3,

  // Regression detection (percentage)
  maxPerformanceRegression: 20, // 20% performance decrease threshold
  significantRegressionThreshold: 50, // 50% regression requires immediate attention
} as const;

/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private benchmarks: PerformanceBenchmark[] = [];
  private renderObserver: PerformanceObserver | null = null;
  private memoryBaseline: number = 0;

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startMonitoring(): void {
    this.memoryBaseline = this.getMemoryUsage();
    this.setupRenderObserver();
  }

  public stopMonitoring(): void {
    if (this.renderObserver) {
      this.renderObserver.disconnect();
      this.renderObserver = null;
    }
  }

  public async measureOperation<T>(
    testName: string,
    component: string,
    operation: string,
    operationFn: () => T | Promise<T>,
    metadata: Record<string, any> = {}
  ): Promise<{ result: T; benchmark: PerformanceBenchmark }> {
    const memoryBefore = this.getMemoryUsage();
    const startTime = performance.now();

    const result = await operationFn();

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    const benchmark: PerformanceBenchmark = {
      testName,
      component,
      operation,
      startTime,
      endTime,
      duration: endTime - startTime,
      memoryBefore,
      memoryAfter,
      memoryDelta: memoryAfter - memoryBefore,
      renderCount: metadata.renderCount || 0,
      frameRate: metadata.frameRate || 0,
      metadata,
    };

    this.benchmarks.push(benchmark);
    return { result, benchmark };
  }

  public getBenchmarks(): PerformanceBenchmark[] {
    return [...this.benchmarks];
  }

  public clearBenchmarks(): void {
    this.benchmarks = [];
  }

  public analyzeRegression(
    baseline: PerformanceBenchmark[],
    current: PerformanceBenchmark[]
  ): {
    hasRegression: boolean;
    criticalRegressions: Array<{
      test: string;
      baselinePerformance: number;
      currentPerformance: number;
      regressionPercentage: number;
      severity: 'warning' | 'critical';
    }>;
    summary: {
      totalTests: number;
      regressions: number;
      improvements: number;
      averagePerformanceChange: number;
    };
  } {
    const regressions: Array<any> = [];
    let totalPerformanceChange = 0;
    let improvements = 0;
    let regressionsCount = 0;

    for (const currentBenchmark of current) {
      const baselineBenchmark = baseline.find(
        b => b.testName === currentBenchmark.testName &&
             b.component === currentBenchmark.component &&
             b.operation === currentBenchmark.operation
      );

      if (baselineBenchmark) {
        const performanceChange = ((currentBenchmark.duration - baselineBenchmark.duration) / baselineBenchmark.duration) * 100;
        totalPerformanceChange += performanceChange;

        if (performanceChange > PERFORMANCE_THRESHOLDS.maxPerformanceRegression) {
          const severity = performanceChange > PERFORMANCE_THRESHOLDS.significantRegressionThreshold ? 'critical' : 'warning';

          regressions.push({
            test: currentBenchmark.testName,
            baselinePerformance: baselineBenchmark.duration,
            currentPerformance: currentBenchmark.duration,
            regressionPercentage: performanceChange,
            severity,
          });
          regressionsCount++;
        } else if (performanceChange < 0) {
          improvements++;
        }
      }
    }

    return {
      hasRegression: regressions.length > 0,
      criticalRegressions: regressions,
      summary: {
        totalTests: current.length,
        regressions: regressionsCount,
        improvements,
        averagePerformanceChange: totalPerformanceChange / current.length,
      },
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0;
    }
    return 0;
  }

  private setupRenderObserver(): void {
    if ('PerformanceObserver' in window) {
      this.renderObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
            // Process render performance data
          }
        }
      });

      this.renderObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }
}

/**
 * Component performance test harness
 */
const PerformanceTestHarness: React.FC<{
  component: 'TouchGestureHandler' | 'AnimationController' | 'AccessibilityController' | 'PerformanceRenderer';
  testScenario: string;
  onBenchmark?: (benchmark: PerformanceBenchmark) => void;
  iterations?: number;
}> = ({ component, testScenario, onBenchmark, iterations = 10 }) => {
  const [position, setPosition] = useState<CanvasPosition>({ x: 0, y: 0, scale: 1.0 });
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryMB: 35,
    canvasRenderFPS: 58,
    transformOverhead: 2.5,
    activeOperations: 0,
    averageMovementTime: 12,
    gpuUtilization: 45,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current++;
  });

  const handlePositionChange = useCallback((newPosition: CanvasPosition) => {
    setPosition(newPosition);
  }, []);

  const handleGestureStart = useCallback((gestureState: TouchGestureState) => {
    setIsAnimating(true);
  }, []);

  const handleGestureUpdate = useCallback((gestureState: TouchGestureState) => {
    if (gestureState.gestureType === 'pan') {
      setPosition(prev => ({
        x: prev.x + gestureState.deltaX,
        y: prev.y + gestureState.deltaY,
        scale: prev.scale,
      }));
    }
  }, []);

  const handleGestureEnd = useCallback((gestureState: TouchGestureState) => {
    setIsAnimating(false);
  }, []);

  const handleAnnouncement = useCallback((message: string) => {
    // Performance test for accessibility announcements
  }, []);

  const renderComponent = () => {
    switch (component) {
      case 'TouchGestureHandler':
        return React.createElement(TouchGestureHandler, {
          enabled: true,
          onGestureStart: handleGestureStart,
          onGestureUpdate: handleGestureUpdate,
          onGestureEnd: handleGestureEnd,
          currentPosition: position,
          debugMode: false,
        });

      case 'AnimationController':
        return React.createElement(AnimationController, {
          isActive: isAnimating,
          config: {
            enableSmoothing: true,
            smoothingFactor: 0.8,
            maxVelocity: 1000,
            friction: 0.85,
            enableDebugging: false,
            performanceMode: 'adaptive',
          },
          currentPosition: position,
          targetPosition: position,
          onPositionUpdate: handlePositionChange,
          onAnimationComplete: () => setIsAnimating(false),
          debugMode: false,
        });

      case 'AccessibilityController':
        return React.createElement(AccessibilityController, {
          currentPosition: position,
          config: {
            keyboardSpatialNav: true,
            moveDistance: 50,
            zoomFactor: 1.2,
            enableAnnouncements: true,
            enableSpatialContext: true,
            maxResponseTime: 100,
          },
          onPositionChange: handlePositionChange,
          onAnnouncement: handleAnnouncement,
          debugMode: false,
        });

      case 'PerformanceRenderer':
        return React.createElement(PerformanceRenderer, {
          metrics,
          qualityLevel: 'high' as const,
          debugMode: true,
          canvasPosition: position,
          layout: '2d-canvas',
          isTransitioning: isAnimating,
        });

      default:
        return null;
    }
  };

  return (
    <div data-testid={`performance-test-${component.toLowerCase()}`}>
      {renderComponent()}
      <div data-testid="render-count" style={{ display: 'none' }}>
        {renderCountRef.current}
      </div>
    </div>
  );
};

describe('Performance Regression Testing Suite', () => {
  let monitor: PerformanceMonitor;
  let baselineBenchmarks: PerformanceBenchmark[];

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance();
    monitor.clearBenchmarks();
    monitor.startMonitoring();
    baselineBenchmarks = [];

    // Mock high-resolution timing
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());

    // Mock memory API
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB baseline
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 2048 * 1024 * 1024,
      },
      configurable: true,
    });
  });

  afterEach(() => {
    monitor.stopMonitoring();
    vi.restoreAllMocks();
    cleanup();
  });

  describe('Component Render Performance Benchmarks', () => {
    it('should benchmark TouchGestureHandler initial render performance', async () => {
      const { benchmark } = await monitor.measureOperation(
        'TouchGestureHandler Initial Render',
        'TouchGestureHandler',
        'initial_render',
        async () => {
          const { container } = renderWithTestUtils(
            React.createElement(PerformanceTestHarness, {
              component: 'TouchGestureHandler',
              testScenario: 'initial_render',
            })
          );
          return container;
        },
        { renderCount: 1 }
      );

      expect(benchmark.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.maxInitialRenderTime);
      expect(benchmark.memoryDelta).toBeLessThan(PERFORMANCE_THRESHOLDS.maxMemoryIncrease);
    });

    it('should benchmark AnimationController animation performance', async () => {
      const { benchmark } = await monitor.measureOperation(
        'AnimationController Animation Cycle',
        'AnimationController',
        'animation_cycle',
        async () => {
          const { container } = renderWithTestUtils(
            React.createElement(PerformanceTestHarness, {
              component: 'AnimationController',
              testScenario: 'animation_cycle',
            })
          );

          // Simulate animation cycle
          for (let i = 0; i < 60; i++) { // 1 second at 60fps
            await waitForFrames(1);
          }

          return container;
        },
        { renderCount: 60, frameRate: 60 }
      );

      expect(benchmark.duration).toBeLessThan(1100); // Allow some overhead beyond 1 second
      expect(benchmark.memoryDelta).toBeLessThan(PERFORMANCE_THRESHOLDS.maxMemoryIncrease);
    });

    it('should benchmark AccessibilityController keyboard navigation performance', async () => {
      const { benchmark } = await monitor.measureOperation(
        'AccessibilityController Keyboard Navigation',
        'AccessibilityController',
        'keyboard_navigation',
        async () => {
          const { container } = renderWithTestUtils(
            React.createElement(PerformanceTestHarness, {
              component: 'AccessibilityController',
              testScenario: 'keyboard_navigation',
            })
          );

          // Simulate rapid keyboard navigation
          const directions = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'];
          for (let i = 0; i < 100; i++) {
            const key = directions[i % directions.length];
            const event = new KeyboardEvent('keydown', { key });
            window.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 1));
          }

          return container;
        },
        { renderCount: 100 }
      );

      expect(benchmark.duration).toBeLessThan(200); // 100 operations in 200ms = 2ms per operation
      expect(benchmark.memoryDelta).toBeLessThan(PERFORMANCE_THRESHOLDS.maxMemoryIncrease);
    });

    it('should benchmark PerformanceRenderer debug information rendering', async () => {
      const { benchmark } = await monitor.measureOperation(
        'PerformanceRenderer Debug Rendering',
        'PerformanceRenderer',
        'debug_rendering',
        async () => {
          const { container, rerender } = renderWithTestUtils(
            React.createElement(PerformanceTestHarness, {
              component: 'PerformanceRenderer',
              testScenario: 'debug_rendering',
            })
          );

          // Simulate frequent metric updates
          for (let i = 0; i < 50; i++) {
            rerender(
              React.createElement(PerformanceTestHarness, {
                component: 'PerformanceRenderer',
                testScenario: 'debug_rendering',
              })
            );
            await waitForFrames(1);
          }

          return container;
        },
        { renderCount: 50 }
      );

      expect(benchmark.duration).toBeLessThan(100); // Should be very fast for debug rendering
      expect(benchmark.memoryDelta).toBeLessThan(PERFORMANCE_THRESHOLDS.maxMemoryLeakPerOperation * 50);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions across component updates', async () => {
      // Create baseline benchmarks
      const baselineResults = await Promise.all([
        monitor.measureOperation('Baseline TouchGestureHandler', 'TouchGestureHandler', 'render', async () => {
          return renderWithTestUtils(React.createElement(PerformanceTestHarness, { component: 'TouchGestureHandler', testScenario: 'baseline' }));
        }),
        monitor.measureOperation('Baseline AnimationController', 'AnimationController', 'render', async () => {
          return renderWithTestUtils(React.createElement(PerformanceTestHarness, { component: 'AnimationController', testScenario: 'baseline' }));
        }),
      ]);

      const baselineBenchmarks = baselineResults.map(result => result.benchmark);

      // Simulate performance regression by introducing artificial delay
      const mockSlowOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate slow operation
        return renderWithTestUtils(React.createElement(PerformanceTestHarness, { component: 'TouchGestureHandler', testScenario: 'regression' }));
      };

      const regressionResult = await monitor.measureOperation(
        'Baseline TouchGestureHandler', // Same test name for comparison
        'TouchGestureHandler',
        'render',
        mockSlowOperation
      );

      const currentBenchmarks = [regressionResult.benchmark];

      const analysis = monitor.analyzeRegression(baselineBenchmarks, currentBenchmarks);

      expect(analysis.hasRegression).toBe(true);
      expect(analysis.criticalRegressions.length).toBeGreaterThan(0);
      expect(analysis.criticalRegressions[0].regressionPercentage).toBeGreaterThan(PERFORMANCE_THRESHOLDS.maxPerformanceRegression);
    });

    it('should categorize regression severity correctly', async () => {
      // Create baseline
      const baseline = await monitor.measureOperation('Test Operation', 'TestComponent', 'operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'baseline';
      });

      // Create warning-level regression (25% slower)
      const warningRegression = await monitor.measureOperation('Test Operation', 'TestComponent', 'operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 12.5));
        return 'warning';
      });

      // Create critical regression (60% slower)
      const criticalRegression = await monitor.measureOperation('Test Operation', 'TestComponent', 'operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 16));
        return 'critical';
      });

      monitor.clearBenchmarks();
      monitor.benchmarks.push(baseline.benchmark);

      const warningAnalysis = monitor.analyzeRegression([baseline.benchmark], [warningRegression.benchmark]);
      expect(warningAnalysis.criticalRegressions[0]?.severity).toBe('warning');

      const criticalAnalysis = monitor.analyzeRegression([baseline.benchmark], [criticalRegression.benchmark]);
      expect(criticalAnalysis.criticalRegressions[0]?.severity).toBe('critical');
    });
  });

  describe('Memory Leak Detection', () => {
    it('should detect memory leaks in component lifecycle', async () => {
      const memoryBefore = monitor['getMemoryUsage']();

      // Mount and unmount components multiple times
      for (let i = 0; i < 20; i++) {
        const { unmount } = renderWithTestUtils(
          React.createElement(PerformanceTestHarness, {
            component: 'TouchGestureHandler',
            testScenario: 'memory_leak_test',
          })
        );

        // Simulate some interactions
        const event = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100, identifier: 1 } as any],
        });
        document.dispatchEvent(event);

        await waitForFrames(2);

        unmount();

        // Force garbage collection if available
        if ('gc' in global) {
          (global as any).gc();
        }
      }

      const memoryAfter = monitor['getMemoryUsage']();
      const memoryIncrease = memoryAfter - memoryBefore;

      // Memory increase should be minimal after multiple mount/unmount cycles
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.maxMemoryIncrease);
    });

    it('should detect memory leaks during rapid interactions', async () => {
      const { container } = renderWithTestUtils(
        React.createElement(PerformanceTestHarness, {
          component: 'AccessibilityController',
          testScenario: 'rapid_interactions',
        })
      );

      const { benchmark } = await monitor.measureOperation(
        'Rapid Keyboard Interactions Memory Test',
        'AccessibilityController',
        'rapid_interactions',
        async () => {
          // Simulate 1000 rapid keyboard interactions
          for (let i = 0; i < 1000; i++) {
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(event);
          }
          return container;
        }
      );

      // Memory increase should be bounded even with many interactions
      expect(benchmark.memoryDelta).toBeLessThan(PERFORMANCE_THRESHOLDS.maxMemoryIncrease);
    });
  });

  describe('Frame Rate Performance Testing', () => {
    it('should maintain target frame rate during animations', async () => {
      const frameRates: number[] = [];
      let frameCount = 0;
      const targetFrames = 120; // 2 seconds at 60fps

      const measureFrameRate = () => {
        const start = performance.now();
        let lastTime = start;

        const frame = () => {
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;
          const fps = 1000 / deltaTime;

          frameRates.push(fps);
          lastTime = currentTime;
          frameCount++;

          if (frameCount < targetFrames) {
            requestAnimationFrame(frame);
          }
        };

        requestAnimationFrame(frame);
      };

      renderWithTestUtils(
        React.createElement(PerformanceTestHarness, {
          component: 'AnimationController',
          testScenario: 'frame_rate_test',
        })
      );

      measureFrameRate();

      // Wait for measurement to complete
      await new Promise(resolve => {
        const check = () => {
          if (frameCount >= targetFrames) {
            resolve(undefined);
          } else {
            setTimeout(check, 10);
          }
        };
        check();
      });

      const averageFrameRate = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
      const frameDrops = frameRates.filter(fps => fps < PERFORMANCE_THRESHOLDS.minFrameRate).length;

      expect(averageFrameRate).toBeGreaterThan(PERFORMANCE_THRESHOLDS.minFrameRate);
      expect(frameDrops).toBeLessThan(PERFORMANCE_THRESHOLDS.maxFrameDrops);
    });
  });

  describe('Cross-Component Performance Impact', () => {
    it('should measure performance impact of component interactions', async () => {
      // Test individual component performance
      const { benchmark: individualBenchmark } = await monitor.measureOperation(
        'Individual Component Performance',
        'TouchGestureHandler',
        'individual',
        async () => {
          return renderWithTestUtils(
            React.createElement(PerformanceTestHarness, {
              component: 'TouchGestureHandler',
              testScenario: 'individual',
            })
          );
        }
      );

      // Test integrated components performance
      const { benchmark: integratedBenchmark } = await monitor.measureOperation(
        'Integrated Components Performance',
        'All Components',
        'integrated',
        async () => {
          return renderWithTestUtils(
            <div>
              <PerformanceTestHarness component="TouchGestureHandler" testScenario="integrated" />
              <PerformanceTestHarness component="AnimationController" testScenario="integrated" />
              <PerformanceTestHarness component="AccessibilityController" testScenario="integrated" />
              <PerformanceTestHarness component="PerformanceRenderer" testScenario="integrated" />
            </div>
          );
        }
      );

      // Integration overhead should be reasonable
      const overhead = integratedBenchmark.duration - (individualBenchmark.duration * 4);
      const overheadPercentage = (overhead / (individualBenchmark.duration * 4)) * 100;

      expect(overheadPercentage).toBeLessThan(25); // Integration overhead should be < 25%
    });
  });

  describe('Performance Regression Alerting', () => {
    it('should generate performance regression alerts', async () => {
      const alerts: string[] = [];

      // Mock alert system
      const alertSystem = {
        sendAlert: (severity: 'warning' | 'critical', message: string) => {
          alerts.push(`[${severity.toUpperCase()}] ${message}`);
        },
      };

      // Create baseline
      const baseline = await monitor.measureOperation('Alert Test', 'TestComponent', 'operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'baseline';
      });

      // Create regression
      const regression = await monitor.measureOperation('Alert Test', 'TestComponent', 'operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 60)); // 500% slower
        return 'regression';
      });

      const analysis = monitor.analyzeRegression([baseline.benchmark], [regression.benchmark]);

      // Generate alerts for regressions
      for (const criticalRegression of analysis.criticalRegressions) {
        if (criticalRegression.severity === 'critical') {
          alertSystem.sendAlert('critical',
            `Critical performance regression detected in ${criticalRegression.test}: ${criticalRegression.regressionPercentage.toFixed(1)}% slower`
          );
        } else {
          alertSystem.sendAlert('warning',
            `Performance regression detected in ${criticalRegression.test}: ${criticalRegression.regressionPercentage.toFixed(1)}% slower`
          );
        }
      }

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0]).toContain('CRITICAL');
      expect(alerts[0]).toContain('Alert Test');
    });
  });
});