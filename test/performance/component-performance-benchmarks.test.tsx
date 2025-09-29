/**
 * Component Performance Benchmarks
 *
 * Practical implementation of performance regression testing for extracted components including:
 * - Real-world performance scenarios for each extracted component
 * - Continuous integration performance monitoring examples
 * - Performance impact measurement for component refactoring
 * - Automated regression detection in component interactions
 * - Memory leak detection during extended component usage
 *
 * @fileoverview Practical component performance benchmarking
 * @version 1.0.0
 * @since Task 7.3 - Performance Regression Testing Suite
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTestUtils, waitForFrames } from '../utils';
import { fireEvent, cleanup } from '@testing-library/react';
import React, { useState, useCallback } from 'react';

// Import performance utilities
import {
  createPerformanceRegressionDetector,
  PerformanceRegressionDetector,
  PerformanceBenchmarkEntry,
} from './performance-regression-utils';

// Import components for testing
import { TouchGestureHandler } from '../../components/TouchGestureHandler';
import { AnimationController } from '../../components/AnimationController';
import { AccessibilityController } from '../../components/AccessibilityController';
import { PerformanceRenderer } from '../../components/PerformanceRenderer';

import type { CanvasPosition } from '../../types/canvas';
import type { TouchGestureState } from '../../components/TouchGestureHandler';
import type { PerformanceMetrics } from '../../components/PerformanceRenderer';

/**
 * Test harness for component performance measurement
 */
const ComponentPerformanceHarness: React.FC<{
  component: React.ComponentType<any>;
  props: any;
  interactions?: Array<() => void | Promise<void>>;
  duration?: number;
}> = ({ component: Component, props, interactions = [], duration = 1000 }) => {
  const [interactionIndex, setInteractionIndex] = useState(0);

  React.useEffect(() => {
    if (interactions.length === 0) return;

    const interval = setInterval(async () => {
      if (interactionIndex < interactions.length) {
        await interactions[interactionIndex]();
        setInteractionIndex(prev => prev + 1);
      }
    }, duration / interactions.length);

    return () => clearInterval(interval);
  }, [interactions, interactionIndex, duration]);

  return <Component {...props} />;
};

describe('Component Performance Benchmarks', () => {
  let detector: PerformanceRegressionDetector;
  let mockPosition: CanvasPosition;
  let mockMetrics: PerformanceMetrics;

  beforeEach(() => {
    detector = createPerformanceRegressionDetector({
      durationThreshold: 50,
      memoryThreshold: 25,
      frameRateThreshold: 55,
      regressionThreshold: 15,
      enableAlerts: true,
      alertChannels: ['console'],
      minimumSampleSize: 2,
    });

    mockPosition = { x: 0, y: 0, scale: 1.0 };
    mockMetrics = {
      fps: 60,
      frameTime: 16.67,
      memoryMB: 35,
      canvasRenderFPS: 58,
      transformOverhead: 2.5,
      activeOperations: 0,
      averageMovementTime: 12,
      gpuUtilization: 45,
    };

    // Mock performance APIs
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      setTimeout(callback, 16);
      return 1;
    });

    // Mock memory API
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 2048 * 1024 * 1024,
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('TouchGestureHandler Performance Benchmarks', () => {
    it('should benchmark gesture recognition performance', async () => {
      const gestureEvents: TouchGestureState[] = [];
      const handleGestureUpdate = (state: TouchGestureState) => {
        gestureEvents.push(state);
      };

      const { result, benchmark, analysis } = await detector.measureAndAnalyze(
        'TouchGestureHandler Gesture Recognition',
        'TouchGestureHandler',
        'gesture_recognition',
        async () => {
          const { container } = renderWithTestUtils(
            React.createElement(TouchGestureHandler, {
              enabled: true,
              onGestureStart: vi.fn(),
              onGestureUpdate: handleGestureUpdate,
              onGestureEnd: vi.fn(),
              currentPosition: mockPosition,
              debugMode: false,
            })
          );

          // Simulate complex gesture sequence
          const element = container.firstChild as HTMLElement;

          // Start touch
          fireEvent.touchStart(element, {
            touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
          });

          // Simulate smooth gesture path
          for (let i = 0; i < 50; i++) {
            const x = 100 + i * 2;
            const y = 100 + Math.sin(i * 0.1) * 20;

            fireEvent.touchMove(element, {
              touches: [{ clientX: x, clientY: y, identifier: 1 }],
            });

            await new Promise(resolve => setTimeout(resolve, 1));
          }

          // End touch
          fireEvent.touchEnd(element, {
            changedTouches: [{ clientX: 200, clientY: 120, identifier: 1 }],
          });

          return gestureEvents.length;
        },
        {
          renderCount: 1,
          interactionCount: 52, // Start + 50 moves + end
          version: '1.0.0',
          environment: 'test',
        }
      );

      expect(result).toBeGreaterThan(0);
      expect(benchmark.metrics.duration).toBeLessThan(200); // Should process gestures quickly
      expect(benchmark.metrics.memoryDelta).toBeLessThan(5); // Should not leak memory

      // Log performance for CI/CD
      console.log(`TouchGestureHandler Performance: ${benchmark.metrics.duration.toFixed(2)}ms for ${result} gesture events`);
    });

    it('should benchmark multi-touch gesture performance', async () => {
      const { result, benchmark } = await detector.measureAndAnalyze(
        'TouchGestureHandler Multi-Touch',
        'TouchGestureHandler',
        'multi_touch_gesture',
        async () => {
          const { container } = renderWithTestUtils(
            React.createElement(TouchGestureHandler, {
              enabled: true,
              onGestureStart: vi.fn(),
              onGestureUpdate: vi.fn(),
              onGestureEnd: vi.fn(),
              currentPosition: mockPosition,
              debugMode: false,
            })
          );

          const element = container.firstChild as HTMLElement;

          // Simulate pinch gesture
          fireEvent.touchStart(element, {
            touches: [
              { clientX: 100, clientY: 100, identifier: 1 },
              { clientX: 200, clientY: 200, identifier: 2 },
            ],
          });

          // Simulate pinch movement
          for (let i = 0; i < 30; i++) {
            const scale = 1 + i * 0.02;
            fireEvent.touchMove(element, {
              touches: [
                { clientX: 100 - i, clientY: 100 - i, identifier: 1 },
                { clientX: 200 + i, clientY: 200 + i, identifier: 2 },
              ],
            });
            await new Promise(resolve => setTimeout(resolve, 1));
          }

          fireEvent.touchEnd(element, {
            changedTouches: [
              { clientX: 70, clientY: 70, identifier: 1 },
              { clientX: 230, clientY: 230, identifier: 2 },
            ],
          });

          return 'multi-touch-complete';
        },
        { interactionCount: 32 }
      );

      expect(benchmark.metrics.duration).toBeLessThan(100);
      expect(result).toBe('multi-touch-complete');
    });
  });

  describe('AnimationController Performance Benchmarks', () => {
    it('should benchmark smooth animation performance', async () => {
      const positionUpdates: CanvasPosition[] = [];
      const handlePositionUpdate = (position: CanvasPosition) => {
        positionUpdates.push(position);
      };

      const { result, benchmark } = await detector.measureAndAnalyze(
        'AnimationController Smooth Animation',
        'AnimationController',
        'smooth_animation',
        async () => {
          const TestAnimationComponent = () => {
            const [isActive, setIsActive] = useState(false);
            const [targetPosition, setTargetPosition] = useState(mockPosition);

            return (
              <div>
                <AnimationController
                  isActive={isActive}
                  config={{
                    enableSmoothing: true,
                    smoothingFactor: 0.8,
                    maxVelocity: 1000,
                    friction: 0.85,
                    enableDebugging: false,
                    performanceMode: 'adaptive',
                  }}
                  currentPosition={mockPosition}
                  targetPosition={targetPosition}
                  onPositionUpdate={handlePositionUpdate}
                  onAnimationComplete={() => setIsActive(false)}
                  debugMode={false}
                />
                <button
                  data-testid="start-animation"
                  onClick={() => {
                    setIsActive(true);
                    setTargetPosition({ x: 200, y: 150, scale: 1.5 });
                  }}
                >
                  Start Animation
                </button>
              </div>
            );
          };

          const { getByTestId } = renderWithTestUtils(
            React.createElement(TestAnimationComponent)
          );

          // Start animation
          fireEvent.click(getByTestId('start-animation'));

          // Wait for animation to complete
          await waitForFrames(60); // 1 second at 60fps

          return positionUpdates.length;
        },
        { renderCount: 60, frameRate: 60 }
      );

      expect(result).toBeGreaterThan(10); // Should have multiple position updates
      expect(benchmark.metrics.duration).toBeLessThan(1200); // Animation + overhead
      expect(benchmark.metrics.frameRate).toBeGreaterThan(50); // Maintain good frame rate
    });

    it('should benchmark animation performance under load', async () => {
      const { result, benchmark } = await detector.measureAndAnalyze(
        'AnimationController Under Load',
        'AnimationController',
        'animation_under_load',
        async () => {
          // Create multiple animation controllers to simulate load
          const controllers = Array.from({ length: 5 }, (_, index) =>
            React.createElement(AnimationController, {
              key: index,
              isActive: true,
              config: {
                enableSmoothing: true,
                smoothingFactor: 0.8,
                maxVelocity: 1000,
                friction: 0.85,
                enableDebugging: false,
                performanceMode: 'adaptive',
              },
              currentPosition: { x: index * 50, y: index * 50, scale: 1.0 },
              targetPosition: { x: (index + 1) * 100, y: (index + 1) * 100, scale: 1.2 },
              onPositionUpdate: vi.fn(),
              onAnimationComplete: vi.fn(),
              debugMode: false,
            })
          );

          renderWithTestUtils(React.createElement('div', {}, ...controllers));

          // Let animations run
          await waitForFrames(30);

          return controllers.length;
        },
        { renderCount: 30, interactionCount: 5 }
      );

      expect(result).toBe(5);
      expect(benchmark.metrics.duration).toBeLessThan(1000);
      // Frame rate may be lower under load but should still be acceptable
      expect(benchmark.metrics.frameRate).toBeGreaterThan(40);
    });
  });

  describe('AccessibilityController Performance Benchmarks', () => {
    it('should benchmark rapid keyboard navigation performance', async () => {
      const positionChanges: CanvasPosition[] = [];
      const announcements: string[] = [];

      const { result, benchmark } = await detector.measureAndAnalyze(
        'AccessibilityController Rapid Navigation',
        'AccessibilityController',
        'rapid_keyboard_navigation',
        async () => {
          renderWithTestUtils(
            React.createElement(AccessibilityController, {
              currentPosition: mockPosition,
              config: {
                keyboardSpatialNav: true,
                moveDistance: 50,
                zoomFactor: 1.2,
                enableAnnouncements: true,
                enableSpatialContext: true,
                maxResponseTime: 100,
              },
              onPositionChange: (position) => positionChanges.push(position),
              onAnnouncement: (message) => announcements.push(message),
              debugMode: false,
            })
          );

          // Simulate rapid keyboard navigation
          const keys = ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', '+', '-', '0'];

          for (let i = 0; i < 100; i++) {
            const key = keys[i % keys.length];
            const event = new KeyboardEvent('keydown', { key });
            window.dispatchEvent(event);

            // Small delay to simulate real user input timing
            await new Promise(resolve => setTimeout(resolve, 2));
          }

          return {
            positionChanges: positionChanges.length,
            announcements: announcements.length,
          };
        },
        { interactionCount: 100 }
      );

      expect(result.positionChanges).toBeGreaterThan(90); // Most key presses should result in position changes
      expect(result.announcements).toBeGreaterThan(90); // Should announce most actions
      expect(benchmark.metrics.duration).toBeLessThan(300); // Should be very responsive

      // Calculate average response time per interaction
      const avgResponseTime = benchmark.metrics.duration / 100;
      expect(avgResponseTime).toBeLessThan(3); // Should be under 3ms per interaction
    });

    it('should benchmark accessibility announcement performance', async () => {
      const announcements: string[] = [];

      const { result, benchmark } = await detector.measureAndAnalyze(
        'AccessibilityController Announcements',
        'AccessibilityController',
        'announcement_performance',
        async () => {
          renderWithTestUtils(
            React.createElement(AccessibilityController, {
              currentPosition: mockPosition,
              config: {
                keyboardSpatialNav: true,
                moveDistance: 50,
                zoomFactor: 1.2,
                enableAnnouncements: true,
                enableSpatialContext: true,
                maxResponseTime: 100,
              },
              onPositionChange: vi.fn(),
              onAnnouncement: (message) => announcements.push(message),
              activeSection: 'capture',
              sections: ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'],
              debugMode: false,
            })
          );

          // Test section navigation announcements
          for (let i = 1; i <= 6; i++) {
            const event = new KeyboardEvent('keydown', { key: i.toString() });
            window.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 5));
          }

          // Test movement announcements with spatial context
          const movements = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
          for (const movement of movements) {
            const event = new KeyboardEvent('keydown', { key: movement });
            window.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 5));
          }

          return announcements.length;
        },
        { interactionCount: 10 }
      );

      expect(result).toBeGreaterThan(8); // Should have announcements for most interactions
      expect(benchmark.metrics.duration).toBeLessThan(100);
    });
  });

  describe('PerformanceRenderer Performance Benchmarks', () => {
    it('should benchmark debug rendering performance impact', async () => {
      const { result, benchmark } = await detector.measureAndAnalyze(
        'PerformanceRenderer Debug Impact',
        'PerformanceRenderer',
        'debug_rendering_impact',
        async () => {
          let renderCount = 0;

          const TestComponent = () => {
            const [metrics, setMetrics] = useState(mockMetrics);
            const [debugMode, setDebugMode] = useState(true);

            React.useEffect(() => {
              renderCount++;
            });

            // Simulate frequent metric updates
            React.useEffect(() => {
              const interval = setInterval(() => {
                setMetrics(prev => ({
                  ...prev,
                  fps: 55 + Math.random() * 10,
                  memoryMB: 30 + Math.random() * 20,
                  activeOperations: Math.floor(Math.random() * 5),
                }));
              }, 16); // Update at ~60fps

              return () => clearInterval(interval);
            }, []);

            return (
              <div>
                <PerformanceRenderer
                  metrics={metrics}
                  qualityLevel="high"
                  debugMode={debugMode}
                  canvasPosition={mockPosition}
                  layout="2d-canvas"
                  isTransitioning={false}
                  onToggleDebug={() => setDebugMode(!debugMode)}
                />
                <div data-testid="render-count">{renderCount}</div>
              </div>
            );
          };

          const { getByTestId } = renderWithTestUtils(React.createElement(TestComponent));

          // Let it render and update for a bit
          await waitForFrames(60); // 1 second of updates

          const finalRenderCount = parseInt(getByTestId('render-count').textContent || '0');
          return finalRenderCount;
        },
        { renderCount: 60, frameRate: 60 }
      );

      expect(result).toBeGreaterThan(50); // Should have many renders due to metric updates
      expect(benchmark.metrics.duration).toBeLessThan(1200); // Should maintain performance

      // Debug rendering should have minimal performance impact
      const renderingOverhead = benchmark.metrics.duration / result;
      expect(renderingOverhead).toBeLessThan(20); // Less than 20ms per render on average
    });

    it('should benchmark performance with disabled debug mode', async () => {
      const { result, benchmark } = await detector.measureAndAnalyze(
        'PerformanceRenderer Disabled Debug',
        'PerformanceRenderer',
        'disabled_debug_mode',
        async () => {
          let renderCount = 0;

          const TestComponent = () => {
            React.useEffect(() => {
              renderCount++;
            });

            return (
              <PerformanceRenderer
                metrics={mockMetrics}
                qualityLevel="high"
                debugMode={false} // Disabled
                canvasPosition={mockPosition}
                layout="2d-canvas"
                isTransitioning={false}
              />
            );
          };

          renderWithTestUtils(React.createElement(TestComponent));

          // Should render almost instantly when disabled
          await waitForFrames(1);

          return renderCount;
        },
        { renderCount: 1 }
      );

      expect(result).toBe(1);
      expect(benchmark.metrics.duration).toBeLessThan(10); // Should be very fast when disabled
    });
  });

  describe('Cross-Component Performance Impact', () => {
    it('should benchmark integrated system performance', async () => {
      const interactions: any[] = [];

      const { result, benchmark } = await detector.measureAndAnalyze(
        'Integrated System Performance',
        'All Components',
        'integrated_system',
        async () => {
          const IntegratedSystem = () => {
            const [position, setPosition] = useState(mockPosition);
            const [isAnimating, setIsAnimating] = useState(false);
            const [metrics, setMetrics] = useState(mockMetrics);

            const handlePositionChange = (newPosition: CanvasPosition) => {
              setPosition(newPosition);
              interactions.push({ type: 'position_change', position: newPosition });
            };

            const handleGestureStart = () => {
              setIsAnimating(true);
              interactions.push({ type: 'gesture_start' });
            };

            const handleGestureEnd = () => {
              setIsAnimating(false);
              interactions.push({ type: 'gesture_end' });
            };

            return (
              <div>
                <TouchGestureHandler
                  enabled={true}
                  onGestureStart={handleGestureStart}
                  onGestureUpdate={vi.fn()}
                  onGestureEnd={handleGestureEnd}
                  currentPosition={position}
                  debugMode={false}
                />
                <AnimationController
                  isActive={isAnimating}
                  config={{
                    enableSmoothing: true,
                    smoothingFactor: 0.8,
                    maxVelocity: 1000,
                    friction: 0.85,
                    enableDebugging: false,
                    performanceMode: 'adaptive',
                  }}
                  currentPosition={position}
                  targetPosition={position}
                  onPositionUpdate={handlePositionChange}
                  onAnimationComplete={() => setIsAnimating(false)}
                  debugMode={false}
                />
                <AccessibilityController
                  currentPosition={position}
                  config={{
                    keyboardSpatialNav: true,
                    moveDistance: 50,
                    zoomFactor: 1.2,
                    enableAnnouncements: false, // Disable for performance test
                    enableSpatialContext: false,
                    maxResponseTime: 100,
                  }}
                  onPositionChange={handlePositionChange}
                  debugMode={false}
                />
                <PerformanceRenderer
                  metrics={metrics}
                  qualityLevel="high"
                  debugMode={true}
                  canvasPosition={position}
                  layout="2d-canvas"
                  isTransitioning={isAnimating}
                />
              </div>
            );
          };

          renderWithTestUtils(React.createElement(IntegratedSystem));

          // Simulate user interactions
          for (let i = 0; i < 20; i++) {
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(event);
            await waitForFrames(2);
          }

          return interactions.length;
        },
        {
          renderCount: 40,
          interactionCount: 20,
          version: '1.0.0',
          environment: 'integration-test',
        }
      );

      expect(result).toBeGreaterThan(15); // Should have recorded most interactions
      expect(benchmark.metrics.duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(benchmark.metrics.memoryDelta).toBeLessThan(10); // Should not leak significant memory

      // Log integration performance for monitoring
      console.log(`Integrated System Performance: ${benchmark.metrics.duration.toFixed(2)}ms for ${result} interactions`);
      console.log(`Memory Impact: ${benchmark.metrics.memoryDelta.toFixed(2)}MB`);
    });
  });

  describe('Performance Regression Detection Examples', () => {
    it('should demonstrate regression detection workflow', async () => {
      // Establish baseline performance
      const baselineResults = await Promise.all([
        detector.measureAndAnalyze('Baseline Test', 'TestComponent', 'operation', async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'baseline';
        }),
        detector.measureAndAnalyze('Baseline Test', 'TestComponent', 'operation', async () => {
          await new Promise(resolve => setTimeout(resolve, 12));
          return 'baseline';
        }),
        detector.measureAndAnalyze('Baseline Test', 'TestComponent', 'operation', async () => {
          await new Promise(resolve => setTimeout(resolve, 11));
          return 'baseline';
        }),
      ]);

      // Simulate performance regression
      const regressionResult = await detector.measureAndAnalyze(
        'Baseline Test',
        'TestComponent',
        'operation',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 25)); // 2x slower
          return 'regression';
        }
      );

      // The detector should automatically identify the regression
      expect(regressionResult.analysis).toBeTruthy();
      expect(regressionResult.analysis!.hasRegression).toBe(true);
      expect(regressionResult.analysis!.severity).toBe('critical');
      expect(regressionResult.analysis!.regressionPercentage).toBeGreaterThan(50);

      // Check that alerts were generated
      const alertHistory = detector.getAlertSystem().getAlertHistory();
      expect(alertHistory.length).toBeGreaterThan(0);
      expect(alertHistory[0].severity).toBe('critical');
    });
  });
});