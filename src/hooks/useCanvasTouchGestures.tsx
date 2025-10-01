/**
 * useCanvasTouchGestures - Clean Touch Interaction Hook for Canvas
 *
 * Simplified touch gesture handling for canvas pan/zoom.
 * Replaces 165 LOC over-engineered touch handling in LightboxCanvas.
 *
 * @fileoverview Minimal touch gesture detection (1 & 2 finger)
 * @version 2.0.0
 * @since Phase 4 - Canvas Rebuild
 */

import { useRef, useCallback } from 'react';

interface CanvasTouchGestureHandlers {
  onPan: (delta: { x: number; y: number }) => void;
  onZoom: (scale: number, center: { x: number; y: number }) => void;
}

interface CanvasTouchGestureProps {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const useCanvasTouchGestures = ({
  onPan,
  onZoom
}: CanvasTouchGestureHandlers): CanvasTouchGestureProps => {
  // Single finger pan state
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Two finger pinch state
  const pinchStart = useRef<{
    distance: number;
    center: { x: number; y: number };
  } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      // Single finger pan
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      // Two finger pinch-to-zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };

      pinchStart.current = { distance, center };

      // Clear single touch if transitioning to pinch
      touchStart.current = null;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && touchStart.current) {
      // Single finger pan
      const delta = {
        x: e.touches[0].clientX - touchStart.current.x,
        y: e.touches[0].clientY - touchStart.current.y
      };

      onPan(delta);

      // Update start position for next move
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2 && pinchStart.current) {
      // Two finger pinch-to-zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const currentCenter = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };

      // Calculate scale multiplier
      const scale = currentDistance / pinchStart.current.distance;

      onZoom(scale, currentCenter);
    }
  }, [onPan, onZoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    // Clear touch state
    touchStart.current = null;
    pinchStart.current = null;
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

export default useCanvasTouchGestures;
