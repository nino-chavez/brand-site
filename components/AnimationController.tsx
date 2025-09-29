/**
 * AnimationController Component
 *
 * Extracted camera movement execution and animation management logic from LightboxCanvas.
 * Implements RequestAnimationFrame-based animation loops with strategy pattern for
 * different camera movement types (pan-tilt, zoom, dolly, rack-focus).
 *
 * @fileoverview Isolated animation logic with Strategy pattern
 * @version 1.0.0
 * @since Task 1 - Component Enhancement and Optimization
 */

import { useEffect, useCallback, useRef } from 'react';
import type { AnimationControllerProps, CanvasPosition, CameraMovement, QualityLevel } from '../types/canvas';
import { measureCanvasOperation, optimizedRAF } from '../utils/canvasPerformanceMonitor';

/**
 * Animation configuration based on movement type
 */
interface AnimationConfig {
  duration: number;
  easing: string;
  useGPU: boolean;
  skipFrames: boolean;
}

/**
 * Get animation configuration for different movement types
 */
const getAnimationConfig = (movement: CameraMovement, qualityLevel: QualityLevel): AnimationConfig => {
  const baseConfigs: Record<CameraMovement, Omit<AnimationConfig, 'skipFrames'>> = {
    'pan-tilt': {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      useGPU: true,
    },
    'zoom-in': {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      useGPU: true,
    },
    'zoom-out': {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      useGPU: true,
    },
    'dolly-zoom': {
      duration: 1200,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      useGPU: true,
    },
    'rack-focus': {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      useGPU: true,
    },
    'match-cut': {
      duration: 300,
      easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      useGPU: true,
    },
  };

  const baseConfig = baseConfigs[movement];

  // Apply quality-based optimizations
  const skipFrames = qualityLevel === 'low' || qualityLevel === 'minimal';

  return {
    ...baseConfig,
    skipFrames,
  };
};

/**
 * Apply easing function to animation progress
 */
const applyEasing = (progress: number, easing: string): number => {
  switch (easing) {
    case 'cubic-bezier(0.4, 0.0, 0.2, 1)': // Ease-out
      return 1 - Math.pow(1 - progress, 2);
    case 'cubic-bezier(0.25, 0.46, 0.45, 0.94)': // Ease-out-sine
      return Math.sin((progress * Math.PI) / 2);
    case 'cubic-bezier(0.0, 0.0, 0.2, 1)': // Ease-in-out
      return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    default:
      return progress; // Linear
  }
};

/**
 * Interpolate between two positions with easing
 */
const interpolatePosition = (
  from: CanvasPosition,
  to: CanvasPosition,
  easedProgress: number
): CanvasPosition => {
  return {
    x: from.x + (to.x - from.x) * easedProgress,
    y: from.y + (to.y - from.y) * easedProgress,
    scale: from.scale + (to.scale - from.scale) * easedProgress,
  };
};

/**
 * AnimationController - Isolated camera movement and animation management
 *
 * Responsibilities:
 * - Camera movement execution and animation management
 * - Strategy pattern for different camera movement types
 * - Performance optimized RequestAnimationFrame management
 * - 60fps desktop, 30fps minimum mobile with quality adaptation
 */
export const AnimationController: React.FC<AnimationControllerProps> = ({
  targetPosition,
  movementType,
  onAnimationUpdate,
  onAnimationComplete,
  qualityLevel,
  fromPosition = { x: 0, y: 0, scale: 1.0 },
  duration: customDuration,
}) => {
  // Animation state refs
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const configRef = useRef<AnimationConfig | null>(null);

  /**
   * Execute camera movement with performance-optimized RAF
   */
  const executeCanvasMovement = useCallback(() => {
    if (isAnimatingRef.current) return; // Prevent multiple simultaneous animations

    const startTime = performance.now();
    startTimeRef.current = startTime;
    isAnimatingRef.current = true;

    // Get animation configuration
    const animConfig = getAnimationConfig(movementType, qualityLevel);
    configRef.current = animConfig;

    // Use custom duration if provided
    const finalDuration = customDuration || animConfig.duration;

    const animateMovement = (currentTime: number) => {
      return measureCanvasOperation(`movement-${movementType}`, () => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / finalDuration, 1);

        // Apply quality-based frame skipping
        if (animConfig.skipFrames && progress < 1 && Math.random() > 0.8) {
          animationRef.current = optimizedRAF(animateMovement, qualityLevel);
          return;
        }

        // Apply easing function
        const easedProgress = applyEasing(progress, animConfig.easing);

        // Interpolate position
        const currentPosition = interpolatePosition(fromPosition, targetPosition, easedProgress);

        // Update animation progress
        onAnimationUpdate(progress, currentPosition);

        if (progress < 1) {
          // Continue animation
          animationRef.current = optimizedRAF(animateMovement, qualityLevel);
        } else {
          // Animation complete
          isAnimatingRef.current = false;
          configRef.current = null;

          // Final update with exact target position
          onAnimationUpdate(1, targetPosition);
          onAnimationComplete();
        }
      });
    };

    // Start animation
    animationRef.current = optimizedRAF(animateMovement, qualityLevel);
  }, [
    targetPosition,
    movementType,
    qualityLevel,
    fromPosition,
    customDuration,
    onAnimationUpdate,
    onAnimationComplete,
  ]);

  /**
   * Start animation when target position changes
   */
  useEffect(() => {
    executeCanvasMovement();
  }, [executeCanvasMovement]);

  /**
   * Cleanup animation on unmount or when dependencies change
   */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      isAnimatingRef.current = false;
      configRef.current = null;
    };
  }, []);

  /**
   * Handle quality level changes during animation
   */
  useEffect(() => {
    if (isAnimatingRef.current && configRef.current) {
      // Update skip frames based on new quality level
      const newConfig = getAnimationConfig(movementType, qualityLevel);
      configRef.current.skipFrames = newConfig.skipFrames;
    }
  }, [qualityLevel, movementType]);

  // AnimationController is a logic-only component with no visual output
  return null;
};

export default AnimationController;