import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMouseTracking } from '../hooks/useMouseTracking';

describe('useMouseTracking Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default position', () => {
    const { result } = renderHook(() => useMouseTracking());

    expect(result.current.currentPosition).toEqual({ x: -100, y: -100 });
    expect(result.current.targetPosition).toEqual({ x: -100, y: -100 });
    expect(result.current.isTracking).toBe(false);
  });

  it('should update position on mouse move', () => {
    const { result } = renderHook(() => useMouseTracking({ delay: 0, throttleMs: 0 }));

    act(() => {
      // Create a mock React MouseEvent with proper structure
      const mockElement = {
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
      };

      const mockEvent = {
        clientX: 100,
        clientY: 200,
        currentTarget: mockElement
      } as React.MouseEvent;

      result.current.handleMouseMove(mockEvent);

      // Advance timers to ensure any timeouts fire
      vi.runAllTimers();
    });

    expect(result.current.currentPosition).toEqual({ x: 100, y: 200 });
  });
});