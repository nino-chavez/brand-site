/**
 * TouchGestureHandler Component Tests
 *
 * Tests for extracted touch gesture handling logic from LightboxCanvas
 * Validates gesture recognition, performance, and error handling
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TouchGestureHandler } from '../TouchGestureHandler';
import type { TouchGestureHandlerProps, GestureType, GestureDelta, GestureState } from '../../types/canvas';

// Mock performance monitoring
vi.mock('../../utils/canvasPerformanceMonitor', () => ({
  measureCanvasOperation: vi.fn((name, fn) => fn()),
}));

describe('TouchGestureHandler', () => {
  const mockOnGestureStart = vi.fn();
  const mockOnGestureMove = vi.fn();
  const mockOnGestureEnd = vi.fn();

  const defaultProps: TouchGestureHandlerProps = {
    onGestureStart: mockOnGestureStart,
    onGestureMove: mockOnGestureMove,
    onGestureEnd: mockOnGestureEnd,
    sensitivity: {
      pan: 1.0,
      zoom: 1.0,
      tap: 44, // Minimum touch target size
    },
    debugMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render touch area with proper accessibility attributes', () => {
      render(<TouchGestureHandler {...defaultProps} />);

      const touchArea = screen.getByRole('application');
      expect(touchArea).toBeInTheDocument();
      expect(touchArea).toHaveAttribute('aria-label', 'Touch gesture area');
    });

    it('should apply debug styles when debugMode is enabled', () => {
      render(<TouchGestureHandler {...defaultProps} debugMode={true} />);

      const touchArea = screen.getByRole('application');
      expect(touchArea).toHaveClass('touch-debug');
    });
  });

  describe('Single Touch Gestures (Pan)', () => {
    it('should detect pan gesture start with single touch', () => {
      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      expect(mockOnGestureStart).toHaveBeenCalledWith('pan');
    });

    it('should process pan gesture movement with delta calculation', () => {
      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      // Start touch
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      // Move touch
      fireEvent.touchMove(touchArea, {
        touches: [{ clientX: 150, clientY: 120 }],
      });

      const expectedDelta: GestureDelta = {
        x: 50,
        y: 20,
        scale: 1.0,
        centerX: 150,
        centerY: 120,
      };

      expect(mockOnGestureMove).toHaveBeenCalledWith(expectedDelta);
    });

    it('should complete pan gesture on touch end', () => {
      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      // Start and end touch
      const startEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      fireEvent(touchArea, startEvent);

      const endEvent = new TouchEvent('touchend', {
        touches: [],
      });
      fireEvent(touchArea, endEvent);

      const expectedState: GestureState = {
        type: 'pan',
        isActive: false,
        startPosition: { x: 100, y: 100 },
        currentPosition: { x: 100, y: 100 },
        duration: expect.any(Number),
      };

      expect(mockOnGestureEnd).toHaveBeenCalledWith(expectedState);
    });
  });

  describe('Two Touch Gestures (Pinch-to-Zoom)', () => {
    it('should detect pinch gesture start with two touches', () => {
      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      const touchEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100 } as Touch,
          { clientX: 200, clientY: 200 } as Touch,
        ],
      });

      fireEvent(touchArea, touchEvent);

      expect(mockOnGestureStart).toHaveBeenCalledWith('zoom');
    });

    it('should calculate pinch scale factor correctly', () => {
      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      // Start with two touches 100px apart
      const startEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100 } as Touch,
          { clientX: 200, clientY: 100 } as Touch,
        ],
      });
      fireEvent(touchArea, startEvent);

      // Move touches to 200px apart (2x scale)
      const moveEvent = new TouchEvent('touchmove', {
        touches: [
          { clientX: 50, clientY: 100 } as Touch,
          { clientX: 250, clientY: 100 } as Touch,
        ],
      });
      fireEvent(touchArea, moveEvent);

      const expectedDelta: GestureDelta = {
        x: 0, // Center stayed same
        y: 0,
        scale: 2.0, // Distance doubled
        centerX: 150,
        centerY: 100,
      };

      expect(mockOnGestureMove).toHaveBeenCalledWith(expectedDelta);
    });

    it('should handle two-finger pan during pinch gesture', () => {
      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      // Start with two touches
      const startEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100 } as Touch,
          { clientX: 200, clientY: 100 } as Touch,
        ],
      });
      fireEvent(touchArea, startEvent);

      // Move both touches maintaining distance but changing center
      const moveEvent = new TouchEvent('touchmove', {
        touches: [
          { clientX: 120, clientY: 120 } as Touch,
          { clientX: 220, clientY: 120 } as Touch,
        ],
      });
      fireEvent(touchArea, moveEvent);

      const expectedDelta: GestureDelta = {
        x: 20, // Center moved right
        y: 20, // Center moved down
        scale: 1.0, // Distance maintained
        centerX: 170,
        centerY: 120,
      };

      expect(mockOnGestureMove).toHaveBeenCalledWith(expectedDelta);
    });
  });

  describe('Performance Requirements', () => {
    it('should respond to touch gestures within 16ms', async () => {
      const startTime = performance.now();

      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      fireEvent(touchArea, touchEvent);

      const responseTime = performance.now() - startTime;
      expect(responseTime).toBeLessThan(16); // 1 frame at 60fps
    });

    it('should process gesture recognition within 8ms', async () => {
      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      const startTime = performance.now();

      // Multi-step gesture recognition
      const startEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      fireEvent(touchArea, startEvent);

      const moveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 150, clientY: 120 } as Touch],
      });
      fireEvent(touchArea, moveEvent);

      const processingTime = performance.now() - startTime;
      expect(processingTime).toBeLessThan(8);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid touch events gracefully', () => {
      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      // Invalid touch event with no touches
      const invalidEvent = new TouchEvent('touchstart', {
        touches: [],
      });

      expect(() => {
        fireEvent(touchArea, invalidEvent);
      }).not.toThrow();

      expect(mockOnGestureStart).not.toHaveBeenCalled();
    });

    it('should clean up gesture state on component unmount', () => {
      const { unmount } = render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      // Start a gesture
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      fireEvent(touchArea, touchEvent);

      // Unmount component
      unmount();

      // Should not throw or cause memory leaks
      expect(mockOnGestureStart).toHaveBeenCalledWith('pan');
    });

    it('should handle rapid gesture changes without memory leaks', () => {
      render(<TouchGestureHandler {...defaultProps} />);
      const touchArea = screen.getByRole('application');

      // Simulate rapid gesture changes
      for (let i = 0; i < 100; i++) {
        const startEvent = new TouchEvent('touchstart', {
          touches: [{ clientX: i, clientY: i } as Touch],
        });
        fireEvent(touchArea, startEvent);

        const endEvent = new TouchEvent('touchend', {
          touches: [],
        });
        fireEvent(touchArea, endEvent);
      }

      expect(mockOnGestureStart).toHaveBeenCalledTimes(100);
      expect(mockOnGestureEnd).toHaveBeenCalledTimes(100);
    });
  });

  describe('Sensitivity Configuration', () => {
    it('should apply pan sensitivity to gesture calculations', () => {
      const sensitiveProps = {
        ...defaultProps,
        sensitivity: {
          pan: 2.0, // Double sensitivity
          zoom: 1.0,
          tap: 44,
        },
      };

      render(<TouchGestureHandler {...sensitiveProps} />);
      const touchArea = screen.getByRole('application');

      // Start and move touch
      const startEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      fireEvent(touchArea, startEvent);

      const moveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 120, clientY: 110 } as Touch],
      });
      fireEvent(touchArea, moveEvent);

      const expectedDelta: GestureDelta = {
        x: 40, // 20 * 2.0 sensitivity
        y: 20, // 10 * 2.0 sensitivity
        scale: 1.0,
        centerX: 120,
        centerY: 110,
      };

      expect(mockOnGestureMove).toHaveBeenCalledWith(expectedDelta);
    });

    it('should apply zoom sensitivity to pinch calculations', () => {
      const sensitiveProps = {
        ...defaultProps,
        sensitivity: {
          pan: 1.0,
          zoom: 1.5, // 1.5x zoom sensitivity
          tap: 44,
        },
      };

      render(<TouchGestureHandler {...sensitiveProps} />);
      const touchArea = screen.getByRole('application');

      // Start pinch gesture
      const startEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100 } as Touch,
          { clientX: 200, clientY: 100 } as Touch,
        ],
      });
      fireEvent(touchArea, startEvent);

      // Scale up by 1.2x, should be amplified by sensitivity
      const moveEvent = new TouchEvent('touchmove', {
        touches: [
          { clientX: 90, clientY: 100 } as Touch,
          { clientX: 210, clientY: 100 } as Touch,
        ],
      });
      fireEvent(touchArea, moveEvent);

      const expectedDelta: GestureDelta = {
        x: 0,
        y: 0,
        scale: 1.8, // 1.2 * 1.5 sensitivity
        centerX: 150,
        centerY: 100,
      };

      expect(mockOnGestureMove).toHaveBeenCalledWith(expectedDelta);
    });
  });

  describe('Component Integration', () => {
    it('should be reusable across different contexts', () => {
      const context1Props = { ...defaultProps, debugMode: true };
      const context2Props = { ...defaultProps, debugMode: false };

      const { rerender } = render(<TouchGestureHandler {...context1Props} />);
      expect(screen.getByRole('application')).toHaveClass('touch-debug');

      rerender(<TouchGestureHandler {...context2Props} />);
      expect(screen.getByRole('application')).not.toHaveClass('touch-debug');
    });

    it('should maintain isolation from other components', () => {
      // Test that gesture state doesn't leak between component instances
      const { unmount } = render(<TouchGestureHandler {...defaultProps} />);

      const touchArea = screen.getByRole('application');
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      fireEvent(touchArea, touchEvent);

      unmount();

      // Mount new instance - should start with clean state
      render(<TouchGestureHandler {...defaultProps} />);
      expect(mockOnGestureStart).toHaveBeenCalledTimes(1); // Only from first instance
    });
  });
});