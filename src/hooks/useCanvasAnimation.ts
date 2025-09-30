/**
 * useCanvasAnimation Hook
 *
 * Extracted camera movement and animation logic from LightboxCanvas.
 * Handles canvas position transitions with photography-inspired movements.
 *
 * @fileoverview Animation custom hook for canvas movements
 * @version 1.0.0
 * @since Task 1 - useEffect Optimization
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { measureCanvasOperation, optimizedRAF } from '../utils/canvasPerformanceMonitor';
import { validateCanvasPosition } from '../utils/canvasCoordinateTransforms';
import type { CanvasPosition, CanvasQualityManager, QualityLevel } from '../types/canvas';

export interface UseCanvasAnimationOptions {
  currentPosition: CanvasPosition;
  qualityManager: React.MutableRefObject<CanvasQualityManager | null>;
  currentQuality: QualityLevel;
  onPositionUpdate: (position: CanvasPosition) => void;
  onTargetUpdate: (position: CanvasPosition) => void;
  viewportConstraints?: {
    minPosition: CanvasPosition;
    maxPosition: CanvasPosition;
    minScale: number;
    maxScale: number;
    padding: number;
  };
}

export type CameraMovementType =
  | 'pan-tilt'
  | 'zoom-in'
  | 'zoom-out'
  | 'dolly-zoom'
  | 'rack-focus'
  | 'match-cut';

/**
 * Custom hook for canvas animation and camera movements
 */
export const useCanvasAnimation = (options: UseCanvasAnimationOptions) => {
  const {
    currentPosition,
    qualityManager,
    currentQuality,
    onPositionUpdate,
    onTargetUpdate,
    viewportConstraints
  } = options;

  // Animation state
  const animationRef = useRef<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  // Execute canvas movement with photography metaphors
  const executeCanvasMovement = useCallback(async (
    targetPosition: CanvasPosition,
    movement: CameraMovementType = 'pan-tilt'
  ) => {
    if (isTransitioning) return;

    const startTime = performance.now();
    const fromPosition = currentPosition;
    const qualityMgr = qualityManager.current;

    setIsTransitioning(true);
    onTargetUpdate(targetPosition);

    // Get optimized animation config based on current quality
    const animConfig = qualityMgr?.getAnimationConfig(movement) || {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      useGPU: true,
      skipFrames: false
    };

    // Calculate movement duration
    const duration = animConfig.duration;

    // Execute camera movement with performance-optimized RAF
    const animateMovement = (currentTime: number) => {
      return measureCanvasOperation(`movement-${movement}`, () => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Apply quality-based frame skipping
        if (animConfig.skipFrames && progress < 1 && Math.random() > 0.8) {
          animationRef.current = optimizedRAF(animateMovement, currentQuality);
          return;
        }

        // Calculate eased progress using cubic bezier approximation
        const easedProgress = progress * progress * (3 - 2 * progress);

        // Interpolate position
        const interpolatedPosition: CanvasPosition = {
          x: fromPosition.x + (targetPosition.x - fromPosition.x) * easedProgress,
          y: fromPosition.y + (targetPosition.y - fromPosition.y) * easedProgress,
          scale: fromPosition.scale + (targetPosition.scale - fromPosition.scale) * easedProgress
        };

        // Update canvas position
        onPositionUpdate(interpolatedPosition);

        // Continue animation or finish
        if (progress < 1) {
          animationRef.current = optimizedRAF(animateMovement, currentQuality);
        } else {
          // Animation complete - validate final position
          if (viewportConstraints) {
            const validatedPosition = validateCanvasPosition(
              targetPosition,
              viewportConstraints
            );
            if (validatedPosition.success && validatedPosition.position) {
              onPositionUpdate(validatedPosition.position);
            }
          }

          setIsTransitioning(false);
          animationRef.current = null;
        }
      }, qualityMgr || undefined);
    };

    // Start animation
    animationRef.current = optimizedRAF(animateMovement, currentQuality);
  }, [
    currentPosition,
    qualityManager,
    currentQuality,
    isTransitioning,
    onPositionUpdate,
    onTargetUpdate,
    viewportConstraints
  ]);

  // Cancel current animation
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      setIsTransitioning(false);
    }
  }, []);

  return {
    executeCanvasMovement,
    cancelAnimation,
    isTransitioning
  };
};