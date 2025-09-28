/**
 * TouchGestureHandler Component
 *
 * Extracted touch gesture detection and processing logic from LightboxCanvas.
 * Implements Pointer Events API with gesture recognition algorithms for
 * pan (1-finger), pinch-to-zoom (2-finger), and tap gestures.
 *
 * @fileoverview Isolated touch gesture processing with Observer pattern
 * @version 1.0.0
 * @since Task 1 - Component Enhancement and Optimization
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import type {
  TouchGestureHandlerProps,
  GestureType,
  GestureDelta,
  GestureState,
} from '../types/canvas';
import { measureCanvasOperation } from '../utils/canvasPerformanceMonitor';

/**
 * TouchGestureHandler - Isolated touch gesture processing component
 *
 * Responsibilities:
 * - Touch gesture detection and processing
 * - Observer pattern for gesture event broadcasting
 * - Performance optimized event handling (<16ms response)
 * - Clean props interface for gesture callbacks
 */
export const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  onGestureStart,
  onGestureMove,
  onGestureEnd,
  sensitivity,
  debugMode = false,
  className = '',
}) => {
  // Gesture state management
  const [currentGesture, setCurrentGesture] = useState<GestureType | null>(null);
  const [gestureStartTime, setGestureStartTime] = useState<number>(0);
  const [isActiveGesture, setIsActiveGesture] = useState(false);

  // Touch tracking state
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [initialTouchCenter, setInitialTouchCenter] = useState<{ x: number; y: number } | null>(null);

  // Performance and cleanup refs
  const gestureRef = useRef<HTMLDivElement>(null);
  const cleanupTimeoutRef = useRef<number | null>(null);

  /**
   * Calculate distance between two touch points
   */
  const calculateTouchDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const deltaX = touch2.clientX - touch1.clientX;
    const deltaY = touch2.clientY - touch1.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }, []);

  /**
   * Calculate center point between two touches
   */
  const calculateTouchCenter = useCallback((touch1: Touch, touch2: Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }, []);

  /**
   * Handle touch start with gesture recognition
   * Performance requirement: <16ms response time
   */
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    return measureCanvasOperation('touch-gesture-start', () => {
      event.preventDefault();

      const touches = event.touches;
      const touchCount = touches.length;

      // Guard against invalid touch events
      if (touchCount === 0) return;

      const startTime = Date.now();
      setGestureStartTime(startTime);
      setIsActiveGesture(true);

      if (touchCount === 1) {
        // Single touch - pan gesture
        const touch = touches[0];
        const position = { x: touch.clientX, y: touch.clientY };

        setCurrentGesture('pan');
        setTouchStartPosition(position);
        setInitialTouchDistance(null);
        setInitialTouchCenter(null);

        onGestureStart('pan');
      } else if (touchCount === 2) {
        // Two touches - pinch-to-zoom gesture
        const touch1 = touches[0];
        const touch2 = touches[1];

        const distance = calculateTouchDistance(touch1, touch2);
        const center = calculateTouchCenter(touch1, touch2);

        setCurrentGesture('zoom');
        setInitialTouchDistance(distance);
        setInitialTouchCenter(center);
        setTouchStartPosition(center);

        onGestureStart('zoom');
      }
    });
  }, [onGestureStart, calculateTouchDistance, calculateTouchCenter]);

  /**
   * Handle touch movement with delta calculation
   * Performance requirement: Gesture processing <8ms
   */
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    return measureCanvasOperation('touch-gesture-move', () => {
      event.preventDefault();

      if (!isActiveGesture || !currentGesture) return;

      const touches = event.touches;
      const touchCount = touches.length;

      if (currentGesture === 'pan' && touchCount === 1 && touchStartPosition) {
        // Single finger pan gesture
        const touch = touches[0];
        const deltaX = (touch.clientX - touchStartPosition.x) * sensitivity.pan;
        const deltaY = (touch.clientY - touchStartPosition.y) * sensitivity.pan;

        const gestureDelta: GestureDelta = {
          x: deltaX,
          y: deltaY,
          scale: 1.0,
          centerX: touch.clientX,
          centerY: touch.clientY,
        };

        onGestureMove(gestureDelta);

        // Update start position for next delta calculation
        setTouchStartPosition({ x: touch.clientX, y: touch.clientY });

      } else if (currentGesture === 'zoom' && touchCount === 2 && initialTouchDistance && initialTouchCenter) {
        // Two finger pinch-to-zoom gesture
        const touch1 = touches[0];
        const touch2 = touches[1];

        const currentDistance = calculateTouchDistance(touch1, touch2);
        const currentCenter = calculateTouchCenter(touch1, touch2);

        // Calculate scale factor
        const scaleMultiplier = currentDistance / initialTouchDistance;
        const finalScale = Math.pow(scaleMultiplier, sensitivity.zoom);

        // Calculate pan movement (center point movement)
        const centerDeltaX = (currentCenter.x - initialTouchCenter.x) * sensitivity.pan;
        const centerDeltaY = (currentCenter.y - initialTouchCenter.y) * sensitivity.pan;

        const gestureDelta: GestureDelta = {
          x: centerDeltaX,
          y: centerDeltaY,
          scale: finalScale,
          centerX: currentCenter.x,
          centerY: currentCenter.y,
        };

        onGestureMove(gestureDelta);

        // Update initial values for next delta calculation
        setInitialTouchDistance(currentDistance);
        setInitialTouchCenter(currentCenter);
      }
    });
  }, [
    isActiveGesture,
    currentGesture,
    touchStartPosition,
    initialTouchDistance,
    initialTouchCenter,
    sensitivity,
    onGestureMove,
    calculateTouchDistance,
    calculateTouchCenter,
  ]);

  /**
   * Handle touch end with gesture completion
   */
  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    return measureCanvasOperation('touch-gesture-end', () => {
      event.preventDefault();

      if (!isActiveGesture || !currentGesture) return;

      const endTime = Date.now();
      const duration = endTime - gestureStartTime;

      // Create final gesture state
      const finalState: GestureState = {
        type: currentGesture,
        isActive: false,
        startPosition: touchStartPosition || { x: 0, y: 0 },
        currentPosition: touchStartPosition || { x: 0, y: 0 },
        duration,
      };

      onGestureEnd(finalState);

      // Clean up gesture state
      setCurrentGesture(null);
      setIsActiveGesture(false);
      setTouchStartPosition(null);
      setInitialTouchDistance(null);
      setInitialTouchCenter(null);
      setGestureStartTime(0);
    });
  }, [
    isActiveGesture,
    currentGesture,
    gestureStartTime,
    touchStartPosition,
    onGestureEnd,
  ]);

  /**
   * Handle tap gesture detection (for future use)
   */
  const handleTouchTap = useCallback((event: React.TouchEvent) => {
    const touches = event.touches;
    if (touches.length === 1) {
      const touch = touches[0];

      // Check if touch target meets minimum size requirement
      const touchRadius = sensitivity.tap / 2;

      // For now, just detect tap without additional processing
      // This can be extended for tap gesture recognition
    }
  }, [sensitivity.tap]);

  /**
   * Cleanup effect to prevent memory leaks
   */
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Component CSS classes with debug mode support
   */
  const componentClasses = [
    'touch-gesture-handler',
    'absolute',
    'inset-0',
    'w-full',
    'h-full',
    debugMode ? 'touch-debug' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={gestureRef}
      className={componentClasses}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role='application'
      aria-label='Touch gesture area'
      style={{
        touchAction: 'none', // Prevent default touch behaviors
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserDrag: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...(debugMode && {
          border: '2px dashed rgba(0, 255, 0, 0.5)',
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
        }),
      }}
    >
      {debugMode && (
        <div className='absolute top-2 left-2 bg-black bg-opacity-75 text-green-400 text-xs p-2 rounded font-mono'>
          <div>Gesture: {currentGesture || 'none'}</div>
          <div>Active: {isActiveGesture ? 'true' : 'false'}</div>
          {touchStartPosition && (
            <div>
              Start: ({touchStartPosition.x.toFixed(0)}, {touchStartPosition.y.toFixed(0)})
            </div>
          )}
          {initialTouchDistance && (
            <div>Distance: {initialTouchDistance.toFixed(0)}px</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TouchGestureHandler;