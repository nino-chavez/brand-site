/**
 * useCanvasTouchGestures - Clean Touch & Mouse Interaction Hook for Canvas
 *
 * Simplified gesture handling for canvas pan/zoom with both touch and mouse support.
 * Replaces 165 LOC over-engineered touch handling in LightboxCanvas.
 *
 * @fileoverview Minimal gesture detection (touch + mouse drag)
 * @version 2.2.0
 * @since Phase 4 - Canvas Rebuild
 * @updated Phase 1 - Drag threshold + selective text selection
 * @updated Phase 2 - Momentum/inertia panning (Figma/Miro-style)
 */

import { useRef, useCallback, useEffect } from 'react';

interface CanvasTouchGestureHandlers {
  onPan: (delta: { x: number; y: number }) => void;
  onZoom: (scale: number, center: { x: number; y: number }) => void;
  onDragStart?: () => void; // Phase 3: Performance optimization
  onDragEnd?: () => void;   // Phase 3: Performance optimization
}

interface CanvasTouchGestureProps {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const useCanvasTouchGestures = ({
  onPan,
  onZoom,
  onDragStart,
  onDragEnd
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
  // Phase 1 Enhancement: Drag threshold + selective text selection

  // Figma/Miro-style drag threshold to prevent conflict with text selection
  const DRAG_THRESHOLD = 5; // pixels - industry standard

  const mouseStart = useRef<{ x: number; y: number } | null>(null);
  const mouseInitialStart = useRef<{ x: number; y: number } | null>(null); // Track where mousedown occurred
  const isDragging = useRef(false);
  const hasExceededThreshold = useRef(false); // Track if movement exceeded threshold

  // Phase 2: Momentum/Inertia tracking
  const lastMousePosition = useRef<{ x: number; y: number; timestamp: number } | null>(null);
  const velocity = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const momentumAnimationId = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Handle both left-click (button 0) and right-click (button 2) for panning
    // Left-click requires canvas area check, right-click pans from anywhere (Miro/Lucidchart UX)
    const isLeftClick = e.button === 0;
    const isRightClick = e.button === 2;

    if (!isLeftClick && !isRightClick) return;

    // Right-click always initiates pan mode (professional canvas UX)
    if (isRightClick) {
      e.preventDefault(); // Prevent context menu
    }

    // Cancel any ongoing momentum animation
    if (momentumAnimationId.current !== null) {
      cancelAnimationFrame(momentumAnimationId.current);
      momentumAnimationId.current = null;
    }

    // Don't start drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input, textarea, select, [role="button"]');
    if (isInteractive) {
      return;
    }

    // Canvas area check only for left-click (right-click pans from anywhere)
    if (isLeftClick) {
      // CRITICAL: Only start drag if click originated on canvas or canvas content
      // This prevents "jump to blank area" bug when clicking outside canvas
      // Allow both .lightbox-canvas and .canvas-content for more flexible dragging
      const isCanvasArea = target.closest('.lightbox-canvas, .canvas-content, .canvas-portfolio-layout');
      if (!isCanvasArea) {
        console.log('[INFO] Click outside canvas area - pan mode blocked');
        return;
      }
    }

    // Store both current position (for delta calc) and initial position (for threshold check)
    const position = { x: e.clientX, y: e.clientY };
    mouseStart.current = position;
    mouseInitialStart.current = position;

    // Reset velocity tracking
    lastMousePosition.current = null;
    velocity.current = { x: 0, y: 0 };

    // Right-click bypasses threshold for instant panning (professional UX)
    if (isRightClick) {
      hasExceededThreshold.current = true;
      isDragging.current = true;
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.cursor = 'grabbing';
      onDragStart?.();
      console.log('[INFO] Right-click pan mode activated (instant)');
    } else {
      // Left-click waits for threshold
      hasExceededThreshold.current = false;
      // Don't change cursor yet - wait for drag threshold
      // This allows text selection and clicking to work normally
    }
  }, [onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!mouseStart.current || !mouseInitialStart.current) return;

    // Calculate distance from initial mousedown point
    const dx = e.clientX - mouseInitialStart.current.x;
    const dy = e.clientY - mouseInitialStart.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if we've exceeded the drag threshold
    if (!hasExceededThreshold.current) {
      if (distance >= DRAG_THRESHOLD) {
        // Check if user is actively selecting text (critical check!)
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          // User has selected text - do NOT activate pan mode
          console.log('[INFO] Text selection detected - pan mode blocked');
          return;
        }

        // NOW start dragging - threshold exceeded and no text selected
        hasExceededThreshold.current = true;
        isDragging.current = true;

        // Disable text selection globally (only during drag)
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.cursor = 'grabbing';

        // Phase 3: Notify canvas for performance optimization
        onDragStart?.();

        console.log('[INFO] Drag threshold exceeded - pan mode activated');
      } else {
        // Still below threshold - don't pan yet
        // This allows text selection and small movements
        return;
      }
    }

    // Normal panning logic (only runs after threshold)
    if (!isDragging.current) return;

    const delta = {
      x: e.clientX - mouseStart.current.x,
      y: e.clientY - mouseStart.current.y
    };

    onPan(delta);

    // Track velocity for momentum (Phase 2)
    const now = performance.now();
    if (lastMousePosition.current) {
      const dt = now - lastMousePosition.current.timestamp;
      if (dt > 0) {
        // Normalize velocity to 60fps (16ms per frame)
        velocity.current = {
          x: (e.clientX - lastMousePosition.current.x) / dt * 16,
          y: (e.clientY - lastMousePosition.current.y) / dt * 16
        };
      }
    }
    lastMousePosition.current = { x: e.clientX, y: e.clientY, timestamp: now };

    // Update start position for next move
    mouseStart.current = {
      x: e.clientX,
      y: e.clientY
    };
  }, [onPan, DRAG_THRESHOLD]);

  // Momentum animation (Phase 2)
  const startMomentumAnimation = useCallback(() => {
    const DECAY_COEFFICIENT = 0.95; // Exponential decay (industry standard)
    const MIN_VELOCITY = 0.5; // Stop when velocity < 0.5 px/frame

    const animate = () => {
      const vx = velocity.current.x;
      const vy = velocity.current.y;

      // Stop if velocity below threshold
      if (Math.abs(vx) < MIN_VELOCITY && Math.abs(vy) < MIN_VELOCITY) {
        momentumAnimationId.current = null;
        console.log('[INFO] Momentum animation stopped');
        return;
      }

      // Apply momentum pan (velocity is already directional)
      onPan({ x: vx, y: vy });

      // Decay velocity
      velocity.current.x *= DECAY_COEFFICIENT;
      velocity.current.y *= DECAY_COEFFICIENT;

      // Continue animation
      momentumAnimationId.current = requestAnimationFrame(animate);
    };

    momentumAnimationId.current = requestAnimationFrame(animate);
    console.log('[INFO] Momentum animation started', { vx: velocity.current.x, vy: velocity.current.y });
  }, [onPan]);

  const handleMouseUp = useCallback(() => {
    // Check if user was selecting text (don't log deactivation if we never activated)
    const wasInPanMode = isDragging.current;

    // Start momentum if velocity is significant
    if (wasInPanMode && (Math.abs(velocity.current.x) > 0.5 || Math.abs(velocity.current.y) > 0.5)) {
      startMomentumAnimation();
    }

    isDragging.current = false;
    hasExceededThreshold.current = false;
    mouseStart.current = null;
    mouseInitialStart.current = null;

    // RESTORE text selection (critical for Figma/Miro-style UX)
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.cursor = '';

    // Phase 3: Notify canvas for performance optimization
    if (wasInPanMode) {
      onDragEnd?.();
      console.log('[INFO] Pan mode deactivated - text selection restored');
    }
  }, [startMomentumAnimation, onDragEnd]);

  // ===== SCROLL-WHEEL ZOOM =====
  // Industry standard: Ctrl/Cmd + scroll wheel to zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    // Only zoom with Ctrl/Cmd modifier (matches Figma, Miro, Lucidchart)
    if (!e.ctrlKey && !e.metaKey) return;

    e.preventDefault();

    // Get mouse position for zoom center point
    const centerX = e.clientX;
    const centerY = e.clientY;

    // Calculate zoom delta (negative deltaY = zoom in, positive = zoom out)
    // Scale factor: 0.01 feels natural for most trackpads/mice
    const scaleDelta = -e.deltaY * 0.01;
    const newScaleFactor = 1 + scaleDelta;

    // Clamp to reasonable range per scroll event (-20% to +20%)
    const clampedScaleFactor = Math.max(0.8, Math.min(1.2, newScaleFactor));

    onZoom(clampedScaleFactor, { x: centerX, y: centerY });
  }, [onZoom]);

  // Global mouse event listeners (for drag beyond canvas bounds)
  // Always listen, but check isDragging inside handlers
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false }); // passive: false allows preventDefault

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);

      // Cancel momentum animation on unmount
      if (momentumAnimationId.current !== null) {
        cancelAnimationFrame(momentumAnimationId.current);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  // Prevent context menu on canvas for right-click drag
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onContextMenu: handleContextMenu // Prevent context menu for right-click drag
  };
};

export default useCanvasTouchGestures;
