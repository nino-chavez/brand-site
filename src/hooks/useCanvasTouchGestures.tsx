/**
 * useCanvasTouchGestures - Clean Touch & Mouse Interaction Hook for Canvas
 *
 * Simplified gesture handling for canvas pan/zoom with both touch and mouse support.
 * Replaces 165 LOC over-engineered touch handling in LightboxCanvas.
 *
 * @fileoverview Minimal gesture detection (touch + mouse drag)
 * @version 2.1.0
 * @since Phase 4 - Canvas Rebuild
 * @updated Quick Win #3 - Added mouse drag panning
 */

import { useRef, useCallback, useEffect } from 'react';

interface CanvasTouchGestureHandlers {
  onPan: (delta: { x: number; y: number }) => void;
  onZoom: (scale: number, center: { x: number; y: number }) => void;
}

interface CanvasTouchGestureProps {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
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

  // ===== MOUSE DRAG PANNING =====
  // Quick Win #3: Essential for desktop users (primary audience)

  const mouseStart = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;

    // Don't start drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input, textarea, select, [role="button"]');
    if (isInteractive) {
      return;
    }

    mouseStart.current = {
      x: e.clientX,
      y: e.clientY
    };
    isDragging.current = true;

    // Change cursor to grabbing
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.cursor = 'grabbing';
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !mouseStart.current) return;

    const delta = {
      x: e.clientX - mouseStart.current.x,
      y: e.clientY - mouseStart.current.y
    };

    onPan(delta);

    // Update start position for next move
    mouseStart.current = {
      x: e.clientX,
      y: e.clientY
    };
  }, [onPan]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    mouseStart.current = null;

    // Reset cursor
    document.body.style.cursor = '';
  }, []);

  // Global mouse event listeners (for drag beyond canvas bounds)
  useEffect(() => {
    if (isDragging.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown
  };
};

export default useCanvasTouchGestures;
