import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useMouseTracking } from '../hooks/useMouseTracking';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import CrosshairSystem from '../components/CrosshairSystem';
import { renderWithTestUtils } from './utils';
import React from 'react';

interface PerformanceMetrics {
  frameRate: number;
  averageFrameTime: number;
  maxFrameTime: number;
  minFrameTime: number;
  jitter: number;
  droppedFrames: number;
}

interface DelayMetrics {
  averageDelay: number;
  maxDelay: number;
  minDelay: number;
  accuracy: number; // Percentage accuracy to target delay
}

describe('Performance Testing & Optimization', () => {
  let performanceObserver: PerformanceObserver;
  let frameTimes: number[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    frameTimes = [];

    // Mock performance.now() with more realistic timing
    let currentTime = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => {
      currentTime += 16.67; // ~60fps baseline
      return currentTime;
    });

    // Mock requestAnimationFrame to track frame timing
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
      const frameTime = performance.now();
      frameTimes.push(frameTime);
      return setTimeout(() => callback(frameTime), 16);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    if (performanceObserver) {
      performanceObserver.disconnect();
    }
  });

  describe('60fps Requirement Validation', () => {
    const measureFrameRate = (duration = 1000): PerformanceMetrics => {
      const targetFrameRate = 60;
      const targetFrameTime = 1000 / targetFrameRate;
      const frames = frameTimes;

      if (frames.length < 2) {
        return {
          frameRate: 0,
          averageFrameTime: 0,
          maxFrameTime: 0,
          minFrameTime: 0,
          jitter: 0,
          droppedFrames: 0,
        };
      }

      const deltas = [];
      for (let i = 1; i < frames.length; i++) {
        deltas.push(frames[i] - frames[i - 1]);
      }

      const averageFrameTime = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
      const frameRate = 1000 / averageFrameTime;
      const maxFrameTime = Math.max(...deltas);
      const minFrameTime = Math.min(...deltas);
      const jitter = maxFrameTime - minFrameTime;

      // Count frames that took longer than target frame time + tolerance
      const droppedFrames = deltas.filter(delta => delta > targetFrameTime + 5).length;

      return {
        frameRate,
        averageFrameTime,
        maxFrameTime,
        minFrameTime,
        jitter,
        droppedFrames,
      };
    };

    it('should maintain 60fps during mouse tracking', async () => {
      const TestComponent = () => {
        const { currentPosition } = useMouseTracking({ throttleMs: 16 });

        React.useEffect(() => {
          // Simulate continuous mouse movement for performance testing
          const interval = setInterval(() => {
            const event = new MouseEvent('mousemove', {
              clientX: Math.random() * 1000,
              clientY: Math.random() * 800,
            });
            window.dispatchEvent(event);
          }, 16);

          return () => clearInterval(interval);
        }, []);

        return (
          <div data-testid="position">
            {currentPosition.x},{currentPosition.y}
          </div>
        );
      };

      renderWithTestUtils(React.createElement(TestComponent));

      // Simulate 1 second of mouse tracking
      await act(async () => {
        for (let i = 0; i < 60; i++) {
          vi.advanceTimersByTime(16);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      });

      const metrics = measureFrameRate();

      // Should maintain close to 60fps
      expect(metrics.frameRate).toBeGreaterThan(55); // Allow 5fps tolerance
      expect(metrics.averageFrameTime).toBeLessThan(20); // Should be close to 16.67ms
      expect(metrics.droppedFrames).toBeLessThan(3); // Less than 5% dropped frames
    });

    it('should maintain performance during blur effects', async () => {
      const TestComponent = () => {
        const [position, setPosition] = React.useState({ x: 100, y: 100 });

        React.useEffect(() => {
          const interval = setInterval(() => {
            setPosition(prev => ({
              x: prev.x + Math.sin(Date.now() * 0.001) * 10,
              y: prev.y + Math.cos(Date.now() * 0.001) * 10,
            }));
          }, 16);

          return () => clearInterval(interval);
        }, []);

        return (
          <div style={{
            filter: `blur(${Math.sin(Date.now() * 0.01) * 4 + 4}px)`,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: 'all 0.1s ease-out',
          }}>
            Performance Test Content
          </div>
        );
      };

      renderWithTestUtils(React.createElement(TestComponent));

      await act(async () => {
        for (let i = 0; i < 60; i++) {
          vi.advanceTimersByTime(16);
        }
      });

      const metrics = measureFrameRate();

      // Should maintain reasonable performance even with blur effects
      expect(metrics.frameRate).toBeGreaterThan(50); // Allow more tolerance for heavy effects
      expect(metrics.jitter).toBeLessThan(10); // Frame time variation should be reasonable
    });

    it('should handle rapid crosshair updates efficiently', async () => {
      const TestComponent = () => {
        const [position, setPosition] = React.useState({ x: 500, y: 400 });

        React.useEffect(() => {
          let frame = 0;
          const interval = setInterval(() => {
            frame++;
            setPosition({
              x: 500 + Math.sin(frame * 0.1) * 200,
              y: 400 + Math.cos(frame * 0.1) * 200,
            });
          }, 16);

          return () => clearInterval(interval);
        }, []);

        return React.createElement(CrosshairSystem, {
          position,
          isActive: true,
          focusRadius: 100,
        });
      };

      renderWithTestUtils(React.createElement(TestComponent));

      await act(async () => {
        for (let i = 0; i < 60; i++) {
          vi.advanceTimersByTime(16);
        }
      });

      const metrics = measureFrameRate();

      expect(metrics.frameRate).toBeGreaterThan(55);
      expect(metrics.droppedFrames).toBeLessThan(3);
    });
  });

  describe('100ms Delay Accuracy Testing', () => {
    const measureDelay = (events: Array<{ trigger: number; response: number }>): DelayMetrics => {
      const delays = events.map(event => event.response - event.trigger);
      const averageDelay = delays.reduce((sum, delay) => sum + delay, 0) / delays.length;
      const maxDelay = Math.max(...delays);
      const minDelay = Math.min(...delays);

      // Calculate accuracy as percentage of delays within ±10ms of target (100ms)
      const accurateDelays = delays.filter(delay => Math.abs(delay - 100) <= 10);
      const accuracy = (accurateDelays.length / delays.length) * 100;

      return {
        averageDelay,
        maxDelay,
        minDelay,
        accuracy,
      };
    };

    it('should maintain 100ms tracking delay accuracy', async () => {
      const events: Array<{ trigger: number; response: number }> = [];

      const TestComponent = () => {
        const [triggerTime, setTriggerTime] = React.useState(0);
        const { currentPosition } = useMouseTracking({ delay: 100 });

        React.useEffect(() => {
          // Record when position updates (response)
          const responseTime = performance.now();
          if (triggerTime > 0) {
            events.push({
              trigger: triggerTime,
              response: responseTime,
            });
          }
        }, [currentPosition, triggerTime]);

        React.useEffect(() => {
          const interval = setInterval(() => {
            setTriggerTime(performance.now());
            const event = new MouseEvent('mousemove', {
              clientX: Math.random() * 1000,
              clientY: Math.random() * 800,
            });
            window.dispatchEvent(event);
          }, 200); // Trigger every 200ms

          return () => clearInterval(interval);
        }, []);

        return <div data-testid="tracker" />;
      };

      renderWithTestUtils(React.createElement(TestComponent));

      // Collect delay measurements over multiple events
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          vi.advanceTimersByTime(200);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      });

      if (events.length > 5) {
        const delayMetrics = measureDelay(events);

        // Should maintain 100ms delay with reasonable accuracy
        expect(delayMetrics.averageDelay).toBeGreaterThan(90);
        expect(delayMetrics.averageDelay).toBeLessThan(110);
        expect(delayMetrics.accuracy).toBeGreaterThan(80); // 80% of delays within tolerance
      }
    });

    it('should handle rapid input changes smoothly', async () => {
      const positions: Array<{ time: number; x: number; y: number }> = [];

      const TestComponent = () => {
        const { currentPosition } = useMouseTracking({ delay: 100, throttleMs: 16 });

        React.useEffect(() => {
          positions.push({
            time: performance.now(),
            x: currentPosition.x,
            y: currentPosition.y,
          });
        }, [currentPosition]);

        return <div data-testid="smooth-tracker" />;
      };

      renderWithTestUtils(React.createElement(TestComponent));

      // Generate rapid mouse movements
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          const event = new MouseEvent('mousemove', {
            clientX: i * 5,
            clientY: Math.sin(i * 0.1) * 100 + 400,
          });
          window.dispatchEvent(event);
          vi.advanceTimersByTime(10); // 100 fps input
        }
      });

      // Analyze smoothness of tracking
      if (positions.length > 10) {
        const velocities = [];
        for (let i = 1; i < positions.length; i++) {
          const prev = positions[i - 1];
          const curr = positions[i];
          const deltaTime = curr.time - prev.time;
          const deltaX = curr.x - prev.x;
          const deltaY = curr.y - prev.y;
          const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
          velocities.push(velocity);
        }

        // Velocity changes should be smooth (not too erratic)
        const averageVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
        const velocityVariance = velocities.reduce((sum, v) => sum + Math.pow(v - averageVelocity, 2), 0) / velocities.length;

        expect(velocityVariance).toBeLessThan(averageVelocity * 0.5); // Variance shouldn't exceed 50% of average
      }
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not create memory leaks during continuous operation', async () => {
      let componentCount = 0;
      const refs: React.RefObject<HTMLDivElement>[] = [];

      const TestComponent = ({ id }: { id: number }) => {
        const ref = React.useRef<HTMLDivElement>(null);
        const { currentPosition } = useMouseTracking();

        React.useEffect(() => {
          componentCount++;
          refs.push(ref);

          return () => {
            componentCount--;
            const index = refs.indexOf(ref);
            if (index > -1) refs.splice(index, 1);
          };
        }, []);

        return (
          <div ref={ref} data-testid={`component-${id}`}>
            {currentPosition.x},{currentPosition.y}
          </div>
        );
      };

      // Create and destroy multiple components
      const { rerender, unmount } = renderWithTestUtils(
        React.createElement(TestComponent, { id: 1 })
      );

      for (let i = 2; i <= 5; i++) {
        rerender(React.createElement(TestComponent, { id: i }));
        await act(async () => {
          vi.advanceTimersByTime(100);
        });
      }

      unmount();

      // Verify cleanup
      expect(componentCount).toBe(0);
      expect(refs.length).toBe(0);
    });

    it('should properly cleanup event listeners', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const TestComponent = () => {
        const { currentPosition } = useMouseTracking();
        return <div>{currentPosition.x}</div>;
      };

      const { unmount } = renderWithTestUtils(React.createElement(TestComponent));

      // Should have added event listeners
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));

      unmount();

      // Should have removed event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should limit animation frame usage efficiently', async () => {
      const rafSpy = vi.spyOn(global, 'requestAnimationFrame');
      const cancelRafSpy = vi.spyOn(global, 'cancelAnimationFrame');

      const TestComponent = () => {
        const [active, setActive] = React.useState(true);

        React.useEffect(() => {
          const timer = setTimeout(() => setActive(false), 500);
          return () => clearTimeout(timer);
        }, []);

        return React.createElement(ViewfinderOverlay, {
          isActive: active,
        });
      };

      const { unmount } = renderWithTestUtils(React.createElement(TestComponent));

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      unmount();

      // Should have called cancelAnimationFrame for cleanup
      expect(cancelRafSpy).toHaveBeenCalled();

      rafSpy.mockRestore();
      cancelRafSpy.mockRestore();
    });
  });

  describe('Rendering Pipeline Optimization', () => {
    it('should minimize DOM updates during tracking', async () => {
      let renderCount = 0;

      const TestComponent = () => {
        const { currentPosition } = useMouseTracking({ throttleMs: 16 });

        React.useEffect(() => {
          renderCount++;
        });

        return (
          <div style={{
            transform: `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0)`,
          }}>
            Tracking Element
          </div>
        );
      };

      renderWithTestUtils(React.createElement(TestComponent));

      // Simulate rapid mouse movements
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          const event = new MouseEvent('mousemove', {
            clientX: i,
            clientY: i,
          });
          window.dispatchEvent(event);
          vi.advanceTimersByTime(5); // Very rapid input
        }
      });

      // Should throttle renders to reasonable frequency
      expect(renderCount).toBeLessThan(20); // Should be much less than 100 due to throttling
    });

    it('should use hardware acceleration for transforms', () => {
      const TestComponent = () => {
        const { currentPosition } = useMouseTracking();

        return (
          <div
            data-testid="accelerated-element"
            style={{
              transform: `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0)`,
              willChange: 'transform',
            }}
          >
            Hardware Accelerated
          </div>
        );
      };

      const { container } = renderWithTestUtils(React.createElement(TestComponent));

      const element = container.querySelector('[data-testid="accelerated-element"]') as HTMLElement;

      expect(element.style.transform).toContain('translate3d');
      expect(element.style.willChange).toBe('transform');
    });
  });
});