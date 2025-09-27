import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen, cleanup } from '@testing-library/react';
import { useMouseTracking } from '../hooks/useMouseTracking';
import { ViewfinderProvider, useViewfinder } from '../contexts/ViewfinderContext';
import { renderWithTestUtils } from './utils';
import React from 'react';

describe('Viewfinder Architecture', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    // Clear all timers and animation frames
    vi.clearAllTimers();
  });

  describe('useMouseTracking Hook', () => {
    it('should initialize with default position', () => {
      const { result } = renderHook(() => useMouseTracking());

      expect(result.current.currentPosition).toEqual({ x: -100, y: -100 });
      expect(result.current.targetPosition).toEqual({ x: -100, y: -100 });
      expect(result.current.isTracking).toBe(false);
    });

    it('should track mouse movement with throttling', () => {
      const { result } = renderHook(() =>
        useMouseTracking({ throttleMs: 16 })
      );

      // Simulate mouse move event
      act(() => {
        const event = new MouseEvent('mousemove', { clientX: 100, clientY: 200 });
        window.dispatchEvent(event);
      });

      expect(result.current.currentPosition).toEqual({ x: 100, y: 200 });
    });

    it('should apply delay when configured', () => {
      const { result } = renderHook(() =>
        useMouseTracking({ delay: 100 })
      );

      act(() => {
        const event = new MouseEvent('mousemove', { clientX: 150, clientY: 250 });
        window.dispatchEvent(event);
      });

      // Position should not update immediately with delay
      expect(result.current.currentPosition).toEqual({ x: -100, y: -100 });
      expect(result.current.targetPosition).toEqual({ x: 150, y: 250 });

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.currentPosition).toEqual({ x: 150, y: 250 });
    });

    it('should respect boundary constraints', () => {
      const boundaryElement = document.createElement('div');
      Object.defineProperty(boundaryElement, 'getBoundingClientRect', {
        value: () => ({
          left: 50,
          top: 50,
          right: 200,
          bottom: 200,
        }),
      });

      const { result } = renderHook(() =>
        useMouseTracking({ boundaryElement })
      );

      act(() => {
        const event = new MouseEvent('mousemove', { clientX: 300, clientY: 300 });
        boundaryElement.dispatchEvent(event);
      });

      // Position should be constrained to boundary
      expect(result.current.currentPosition.x).toBeLessThanOrEqual(200);
      expect(result.current.currentPosition.y).toBeLessThanOrEqual(200);
    });
  });

  describe('ViewfinderProvider', () => {
    const TestComponent = () => {
      const { state, actions } = useViewfinder();
      return (
        <div>
          <div data-testid="active-state">{state.isActive.toString()}</div>
          <div data-testid="crosshair-position">
            {state.crosshairPosition.x},{state.crosshairPosition.y}
          </div>
          <button onClick={actions.activate} data-testid="activate-btn">
            Activate
          </button>
          <button onClick={actions.toggle} data-testid="toggle-btn">
            Toggle
          </button>
        </div>
      );
    };

    it('should provide default state and actions', () => {
      renderWithTestUtils(
        React.createElement(ViewfinderProvider, {}, React.createElement(TestComponent))
      );

      expect(screen.getByTestId('active-state')).toHaveTextContent('false');
      expect(screen.getByTestId('crosshair-position')).toHaveTextContent('-100,-100');
    });

    it('should handle activation and deactivation', () => {
      renderWithTestUtils(
        React.createElement(ViewfinderProvider, {}, React.createElement(TestComponent))
      );

      const activateBtn = screen.getByTestId('activate-btn');

      act(() => {
        activateBtn.click();
      });

      expect(screen.getByTestId('active-state')).toHaveTextContent('true');
    });

    it('should handle toggle functionality', () => {
      renderWithTestUtils(
        React.createElement(ViewfinderProvider, {}, React.createElement(TestComponent))
      );

      const toggleBtn = screen.getByTestId('toggle-btn');

      // First toggle - activate
      act(() => {
        toggleBtn.click();
      });
      expect(screen.getByTestId('active-state')).toHaveTextContent('true');

      // Second toggle - deactivate
      act(() => {
        toggleBtn.click();
      });
      expect(screen.getByTestId('active-state')).toHaveTextContent('false');
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        focusSystem: {
          radius: 150,
          blurRange: { min: 0, max: 10 },
        },
      };

      const TestConfigComponent = () => {
        const { config } = useViewfinder();
        return (
          <div data-testid="focus-radius">{config.focusSystem.radius}</div>
        );
      };

      renderWithTestUtils(
        React.createElement(
          ViewfinderProvider,
          { config: customConfig },
          React.createElement(TestConfigComponent)
        )
      );

      expect(screen.getByTestId('focus-radius')).toHaveTextContent('150');
    });

    it('should handle crosshair position updates', () => {
      const TestPositionComponent = () => {
        const { state, actions } = useViewfinder();

        React.useEffect(() => {
          actions.updateCrosshairPosition({ x: 250, y: 350 });
        }, [actions]);

        return (
          <div data-testid="position">
            {state.crosshairPosition.x},{state.crosshairPosition.y}
          </div>
        );
      };

      renderWithTestUtils(
        React.createElement(
          ViewfinderProvider,
          {},
          React.createElement(TestPositionComponent)
        )
      );

      expect(screen.getByTestId('position')).toHaveTextContent('250,350');
    });

    it('should handle capture functionality', async () => {
      const TestCaptureComponent = () => {
        const { state, actions } = useViewfinder();
        const [captureResult, setCaptureResult] = React.useState<string | null>(null);

        const handleCapture = async () => {
          const result = await actions.capture();
          setCaptureResult(result);
        };

        return (
          <div>
            <div data-testid="capturing-state">{state.isCapturing.toString()}</div>
            <div data-testid="capture-result">{captureResult || 'none'}</div>
            <button onClick={handleCapture} data-testid="capture-btn">
              Capture
            </button>
          </div>
        );
      };

      renderWithTestUtils(
        React.createElement(
          ViewfinderProvider,
          {},
          React.createElement(TestCaptureComponent)
        )
      );

      const captureBtn = screen.getByTestId('capture-btn');

      // Start capture
      act(() => {
        captureBtn.click();
      });

      // Should be capturing initially
      expect(screen.getByTestId('capturing-state')).toHaveTextContent('true');

      // Fast forward through all animations
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await new Promise(resolve => setTimeout(resolve, 0)); // Allow promises to resolve
      });

      // Should have completed capture
      expect(screen.getByTestId('capture-result')).not.toHaveTextContent('none');
    });

    it('should throw error when used outside provider', () => {
      const TestComponentWithoutProvider = () => {
        useViewfinder(); // This should throw
        return <div>Test</div>;
      };

      // Suppress console error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderWithTestUtils(React.createElement(TestComponentWithoutProvider));
      }).toThrow('useViewfinder must be used within a ViewfinderProvider');

      console.error = originalError;
    });
  });

  describe('Integration', () => {
    it('should work with mouse tracking and viewfinder state together', () => {
      const IntegratedComponent = () => {
        const mouseTracking = useMouseTracking({ delay: 50 });
        const { actions } = useViewfinder();

        React.useEffect(() => {
          if (mouseTracking.currentPosition.x !== -100) {
            actions.updateCrosshairPosition(mouseTracking.currentPosition);
          }
        }, [mouseTracking.currentPosition, actions]);

        return (
          <div data-testid="integrated-position">
            {mouseTracking.currentPosition.x},{mouseTracking.currentPosition.y}
          </div>
        );
      };

      renderWithTestUtils(
        React.createElement(
          ViewfinderProvider,
          {},
          React.createElement(IntegratedComponent)
        )
      );

      // Simulate mouse movement
      act(() => {
        const event = new MouseEvent('mousemove', { clientX: 400, clientY: 500 });
        window.dispatchEvent(event);
      });

      // Fast forward through delay
      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByTestId('integrated-position')).toHaveTextContent('400,500');
    });
  });
});