/**
 * useTouchGestures Hook
 *
 * Handles touch gestures for the gallery modal:
 * - Swipe left/right for navigation
 * - Pinch to zoom (future enhancement)
 * - Double-tap to toggle zoom (future enhancement)
 */

import { useEffect, useRef, useState } from 'react';

export interface TouchGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinchZoom?: (scale: number) => void;
  onDoubleTap?: () => void;

  // Configuration
  swipeThreshold?: number; // Minimum distance for swipe (px)
  swipeVelocityThreshold?: number; // Minimum velocity for swipe (px/ms)
  doubleTapDelay?: number; // Max time between taps for double-tap (ms)

  enabled?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  isMoving: boolean;
  lastTapTime: number;
}

export const useTouchGestures = (config: TouchGestureConfig) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onPinchZoom,
    onDoubleTap,
    swipeThreshold = 50,
    swipeVelocityThreshold = 0.3,
    doubleTapDelay = 300,
    enabled = true,
  } = config;

  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isMoving: false,
    lastTapTime: 0,
  });

  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const now = Date.now();

    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: now,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isMoving: false,
      lastTapTime: touchState.current.lastTapTime,
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const state = touchState.current;

    state.currentX = touch.clientX;
    state.currentY = touch.clientY;
    state.isMoving = true;

    // Calculate swipe distance
    const deltaX = state.currentX - state.startX;
    const deltaY = state.currentY - state.startY;

    // Only prevent default if swiping horizontally (allow vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();

      // Visual feedback for swipe direction
      if (Math.abs(deltaX) > swipeThreshold / 2) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!enabled) return;

    const state = touchState.current;
    const now = Date.now();

    // Calculate swipe metrics
    const deltaX = state.currentX - state.startX;
    const deltaY = state.currentY - state.startY;
    const deltaTime = now - state.startTime;
    const velocityX = Math.abs(deltaX) / deltaTime;

    // Reset visual feedback
    setSwipeDirection(null);

    // Check for double-tap
    if (!state.isMoving && now - state.lastTapTime < doubleTapDelay) {
      onDoubleTap?.();
      touchState.current.lastTapTime = 0; // Reset to prevent triple-tap
      return;
    }

    // Update last tap time for double-tap detection
    if (!state.isMoving) {
      touchState.current.lastTapTime = now;
    }

    // Check for swipe gesture
    if (state.isMoving) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Only trigger swipe if horizontal movement dominates
      if (absX > absY && absX > swipeThreshold && velocityX > swipeVelocityThreshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    }

    // Reset state
    touchState.current.isMoving = false;
  };

  const handleTouchCancel = () => {
    if (!enabled) return;

    touchState.current.isMoving = false;
    setSwipeDirection(null);
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    swipeDirection,
  };
};

/**
 * Hook to attach touch gesture handlers to a ref element
 */
export const useAttachTouchGestures = (
  ref: React.RefObject<HTMLElement>,
  config: TouchGestureConfig
) => {
  const { handlers, swipeDirection } = useTouchGestures(config);

  useEffect(() => {
    const element = ref.current;
    if (!element || !config.enabled) return;

    // Use passive: false for touchmove to allow preventDefault
    element.addEventListener('touchstart', handlers.onTouchStart, { passive: true });
    element.addEventListener('touchmove', handlers.onTouchMove, { passive: false });
    element.addEventListener('touchend', handlers.onTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handlers.onTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handlers.onTouchStart);
      element.removeEventListener('touchmove', handlers.onTouchMove);
      element.removeEventListener('touchend', handlers.onTouchEnd);
      element.removeEventListener('touchcancel', handlers.onTouchCancel);
    };
  }, [ref, handlers, config.enabled]);

  return { swipeDirection };
};