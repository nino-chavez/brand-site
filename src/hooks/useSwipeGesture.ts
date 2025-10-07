import { useEffect, useRef, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger swipe
  restraint?: number; // Maximum distance perpendicular to swipe direction
  allowedTime?: number; // Maximum time in ms for swipe
}

/**
 * Custom hook for detecting swipe gestures on mobile devices
 * Implements natural mobile navigation patterns
 *
 * @example
 * const handleSwipe = useSwipeGesture({
 *   onSwipeLeft: () => console.log('Next'),
 *   onSwipeRight: () => console.log('Previous'),
 *   threshold: 100
 * });
 */
export function useSwipeGesture(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 80,
    restraint = 100,
    allowedTime = 300
  } = options;

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const touchEndTime = Date.now();

    const distanceX = touchEndX - touchStartX.current;
    const distanceY = touchEndY - touchStartY.current;
    const elapsedTime = touchEndTime - touchStartTime.current;

    // Check if swipe was fast enough
    if (elapsedTime > allowedTime) {
      return;
    }

    // Horizontal swipe detection
    if (Math.abs(distanceX) >= threshold && Math.abs(distanceY) <= restraint) {
      if (distanceX < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (distanceX > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    // Vertical swipe detection
    if (Math.abs(distanceY) >= threshold && Math.abs(distanceX) <= restraint) {
      if (distanceY < 0 && onSwipeUp) {
        onSwipeUp();
      } else if (distanceY > 0 && onSwipeDown) {
        onSwipeDown();
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, restraint, allowedTime]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
}
