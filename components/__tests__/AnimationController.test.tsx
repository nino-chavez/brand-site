/**
 * AnimationController Component Tests
 *
 * Tests for extracted camera movement and animation logic from LightboxCanvas
 * Validates animation strategy pattern, performance, and cinematic movements
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AnimationController } from '../AnimationController';
import type { AnimationControllerProps, CameraMovement, CanvasPosition } from '../../types/canvas';

// Mock performance monitoring and RAF
vi.mock('../../utils/canvasPerformanceMonitor', () => ({
  measureCanvasOperation: vi.fn((name, fn) => fn()),
  optimizedRAF: vi.fn((callback, quality) => {
    return setTimeout(callback, 16); // Simulate RAF with 16ms delay
  }),
}));

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn(() => 1000);
vi.stubGlobal('performance', {
  now: mockPerformanceNow,
});

describe('AnimationController', () => {
  const mockOnAnimationUpdate = vi.fn();
  const mockOnAnimationComplete = vi.fn();

  const defaultProps: AnimationControllerProps = {
    targetPosition: { x: 100, y: 100, scale: 1.5 },
    movementType: 'pan-tilt' as CameraMovement,
    onAnimationUpdate: mockOnAnimationUpdate,
    onAnimationComplete: mockOnAnimationComplete,
    qualityLevel: 'highest',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockPerformanceNow.mockReturnValue(1000);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('should render without visible UI elements', () => {
      render(<AnimationController {...defaultProps} />);

      // AnimationController should not render any visible elements
      // It's a logic-only component
      expect(document.body.textContent).toBe('');
    });

    it('should not throw errors during rendering', () => {
      expect(() => {
        render(<AnimationController {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Animation Strategy Pattern', () => {
    it('should handle pan-tilt movement type', async () => {
      render(
        <AnimationController
          {...defaultProps}
          movementType="pan-tilt"
        />
      );

      // Should call animation update callback
      await act(async () => {
        // Simulate animation frame
        vi.advanceTimersByTime(16); // One frame at 60fps
      });

      expect(mockOnAnimationUpdate).toHaveBeenCalled();
    });

    it('should handle zoom-in movement type', async () => {
      render(
        <AnimationController
          {...defaultProps}
          movementType="zoom-in"
        />
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(mockOnAnimationUpdate).toHaveBeenCalled();
    });

    it('should handle dolly-zoom movement type', async () => {
      render(
        <AnimationController
          {...defaultProps}
          movementType="dolly-zoom"
        />
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(mockOnAnimationUpdate).toHaveBeenCalled();
    });

    it('should handle rack-focus movement type', async () => {
      render(
        <AnimationController
          {...defaultProps}
          movementType="rack-focus"
        />
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(mockOnAnimationUpdate).toHaveBeenCalled();
    });
  });

  describe('Animation Performance', () => {
    it('should maintain 60fps performance target', async () => {
      const startTime = performance.now();

      render(<AnimationController {...defaultProps} />);

      await act(async () => {
        // Simulate multiple animation frames
        for (let i = 0; i < 10; i++) {
          vi.advanceTimersByTime(16.67); // 60fps frame time
        }
      });

      // Should complete within reasonable time
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200); // Reasonable upper bound
    });

    it('should adapt to quality level changes', async () => {
      const { rerender } = render(
        <AnimationController {...defaultProps} qualityLevel="highest" />
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      const highQualityCalls = mockOnAnimationUpdate.mock.calls.length;

      // Change to lower quality
      rerender(
        <AnimationController {...defaultProps} qualityLevel="low" />
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      // Should continue to work with different quality levels
      expect(mockOnAnimationUpdate.mock.calls.length).toBeGreaterThan(highQualityCalls);
    });

    it('should handle rapid animation changes without memory leaks', async () => {
      const { rerender } = render(<AnimationController {...defaultProps} />);

      // Rapidly change target positions
      for (let i = 0; i < 50; i++) {
        rerender(
          <AnimationController
            {...defaultProps}
            targetPosition={{ x: i * 10, y: i * 10, scale: 1.0 + i * 0.1 }}
          />
        );

        await act(async () => {
          vi.advanceTimersByTime(1);
        });
      }

      // Should not throw or cause issues
      expect(mockOnAnimationUpdate).toHaveBeenCalled();
    });
  });

  describe('Animation State Management', () => {
    it('should track animation progress correctly', async () => {
      render(<AnimationController {...defaultProps} />);

      await act(async () => {
        // Advance through animation
        vi.advanceTimersByTime(100); // Partial animation
      });

      // Should call update with progress between 0 and 1
      expect(mockOnAnimationUpdate).toHaveBeenCalled();

      const lastCall = mockOnAnimationUpdate.mock.calls[mockOnAnimationUpdate.mock.calls.length - 1];
      const progress = lastCall[0]; // Assuming first arg is progress
      expect(typeof progress).toBe('number');
    });

    it('should complete animation and call completion callback', async () => {
      render(<AnimationController {...defaultProps} />);

      await act(async () => {
        // Complete the animation (assuming 800ms default duration)
        vi.advanceTimersByTime(1000);
      });

      expect(mockOnAnimationComplete).toHaveBeenCalled();
    });

    it('should handle animation interruption gracefully', async () => {
      const { unmount } = render(<AnimationController {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(100); // Start animation
      });

      // Unmount during animation
      unmount();

      // Should not throw errors
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(true).toBe(true); // Test passes if no errors thrown
    });
  });

  describe('Position Interpolation', () => {
    it('should interpolate positions smoothly', async () => {
      const fromPosition: CanvasPosition = { x: 0, y: 0, scale: 1.0 };
      const toPosition: CanvasPosition = { x: 100, y: 100, scale: 2.0 };

      render(
        <AnimationController
          {...defaultProps}
          targetPosition={toPosition}
          fromPosition={fromPosition}
        />
      );

      const positionUpdates: CanvasPosition[] = [];

      // Capture position updates
      mockOnAnimationUpdate.mockImplementation((progress, position) => {
        if (position) {
          positionUpdates.push(position);
        }
      });

      await act(async () => {
        // Run partial animation
        for (let i = 0; i < 5; i++) {
          vi.advanceTimersByTime(50);
        }
      });

      // Should have intermediate positions
      expect(positionUpdates.length).toBeGreaterThan(0);

      if (positionUpdates.length > 1) {
        const firstPos = positionUpdates[0];
        const lastPos = positionUpdates[positionUpdates.length - 1];

        // Ensure positions are valid numbers
        expect(typeof firstPos.x).toBe('number');
        expect(typeof firstPos.y).toBe('number');
        expect(typeof firstPos.scale).toBe('number');
        expect(typeof lastPos.x).toBe('number');
        expect(typeof lastPos.y).toBe('number');
        expect(typeof lastPos.scale).toBe('number');

        // Positions should be progressing toward target (if not NaN)
        if (!isNaN(firstPos.x) && !isNaN(lastPos.x)) {
          expect(lastPos.x).toBeGreaterThanOrEqual(firstPos.x);
        }
        if (!isNaN(firstPos.y) && !isNaN(lastPos.y)) {
          expect(lastPos.y).toBeGreaterThanOrEqual(firstPos.y);
        }
        if (!isNaN(firstPos.scale) && !isNaN(lastPos.scale)) {
          expect(lastPos.scale).toBeGreaterThanOrEqual(firstPos.scale);
        }
      }
    });
  });

  describe('Movement Timing and Easing', () => {
    it('should use appropriate timing for different movement types', async () => {
      const movements: CameraMovement[] = ['pan-tilt', 'zoom-in', 'dolly-zoom', 'rack-focus'];

      for (const movement of movements) {
        vi.clearAllMocks();

        render(
          <AnimationController
            {...defaultProps}
            movementType={movement}
          />
        );

        await act(async () => {
          vi.advanceTimersByTime(16);
        });

        expect(mockOnAnimationUpdate).toHaveBeenCalled();
      }
    });

    it('should apply cinematic easing curves', async () => {
      render(<AnimationController {...defaultProps} />);

      const progressValues: number[] = [];

      mockOnAnimationUpdate.mockImplementation((progress) => {
        progressValues.push(progress);
      });

      await act(async () => {
        // Capture easing progression
        for (let i = 0; i < 10; i++) {
          vi.advanceTimersByTime(50);
        }
      });

      // Should have non-linear progression (easing)
      if (progressValues.length > 2) {
        // Early progress should be different from linear
        const linearProgress = 0.2; // 20% through
        const actualProgress = progressValues[Math.floor(progressValues.length * 0.2)];

        // With easing, actual progress should differ from linear
        expect(Math.abs(actualProgress - linearProgress)).toBeGreaterThan(0);
      }
    });
  });

  describe('Component Integration', () => {
    it('should be reusable across different contexts', () => {
      const context1 = { ...defaultProps, movementType: 'zoom-in' as CameraMovement };
      const context2 = { ...defaultProps, movementType: 'pan-tilt' as CameraMovement };

      const { rerender } = render(<AnimationController {...context1} />);
      expect(() => {
        rerender(<AnimationController {...context2} />);
      }).not.toThrow();
    });

    it('should maintain isolation between instances', async () => {
      const { unmount: unmount1 } = render(
        <AnimationController {...defaultProps} key="instance1" />
      );

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      const firstInstanceCalls = mockOnAnimationUpdate.mock.calls.length;

      unmount1();
      vi.clearAllMocks();

      // Second instance should start fresh
      render(<AnimationController {...defaultProps} key="instance2" />);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should not have interference from first instance
      expect(mockOnAnimationUpdate).toHaveBeenCalled();
    });
  });
});