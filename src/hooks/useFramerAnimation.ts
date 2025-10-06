/**
 * Framer Motion Animation Hooks
 *
 * Modern replacement for useScrollAnimation that leverages Framer Motion's
 * whileInView for better performance and smoother animations.
 *
 * @version 1.0.0
 */

import { useInView, useAnimation, type Variants, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import React from 'react';
import { FEATURES, prefersReducedMotion } from '../config/features';

/**
 * Hook options for scroll-triggered animations
 */
interface UseFramerScrollOptions {
  /** Trigger when this percentage of element is visible (0-1) */
  amount?: number;
  /** Additional margin around viewport */
  margin?: string;
  /** Only trigger animation once */
  once?: boolean;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Custom animation variants */
  variants?: Variants;
}

/**
 * Modern scroll animation hook using Framer Motion
 *
 * Replaces useScrollAnimation with improved performance and capabilities.
 * Automatically respects user's reduced-motion preferences.
 *
 * @example
 * ```tsx
 * const { ref, isInView } = useFramerScrollAnimation({ amount: 0.2 });
 *
 * <motion.div
 *   ref={ref}
 *   initial="hidden"
 *   animate={isInView ? "visible" : "hidden"}
 *   variants={fadeUpVariants}
 * />
 * ```
 */
export const useFramerScrollAnimation = (options: UseFramerScrollOptions = {}) => {
  const {
    amount = 0.1,
    margin = '0px 0px -100px 0px',
    once = true,
    delay = 0,
  } = options;

  const ref = useRef(null);

  // Use Framer Motion's optimized Intersection Observer
  const isInView = useInView(ref, {
    once,
    amount,
    margin,
  });

  // Respect reduced motion preference
  const shouldAnimate = !prefersReducedMotion();

  return {
    ref,
    isInView: shouldAnimate ? isInView : true, // Skip animation if reduced motion
  };
};

/**
 * Hook for orchestrated animations with programmatic control
 *
 * @example
 * ```tsx
 * const controls = useOrchestration();
 *
 * useEffect(() => {
 *   const sequence = async () => {
 *     await controls.start({ opacity: 1 });
 *     await controls.start({ y: 0 });
 *     await controls.start({ scale: 1 });
 *   };
 *   sequence();
 * }, []);
 *
 * <motion.div animate={controls} />
 * ```
 */
export const useOrchestration = () => {
  const controls = useAnimation();

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Skip to final state if reduced motion
      controls.set({ opacity: 1, y: 0, scale: 1 });
    }
  }, [controls]);

  return controls;
};

/**
 * Hook for staggered children animations
 *
 * Returns variants configured for parent-child stagger pattern.
 *
 * @example
 * ```tsx
 * const { containerVariants, itemVariants } = useStaggerAnimation({
 *   staggerDelay: 0.1,
 *   childDelay: 0.2
 * });
 *
 * <motion.ul variants={containerVariants} initial="hidden" animate="visible">
 *   {items.map(item => (
 *     <motion.li key={item.id} variants={itemVariants}>
 *       {item.content}
 *     </motion.li>
 *   ))}
 * </motion.ul>
 * ```
 */
export const useStaggerAnimation = (options: {
  staggerDelay?: number;
  childDelay?: number;
} = {}) => {
  const { staggerDelay = 0.1, childDelay = 0.2 } = options;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion() ? 0 : staggerDelay,
        delayChildren: prefersReducedMotion() ? 0 : childDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion() ? 0 : 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return { containerVariants, itemVariants };
};

/**
 * Hook for viewport-based parallax scrolling
 *
 * Uses Framer Motion's useScroll and useTransform for smooth, performant parallax.
 *
 * @example
 * ```tsx
 * const { ref, y } = useParallax({ speed: 0.5, offset: [0, -100] });
 *
 * <motion.div ref={ref} style={{ y }} />
 * ```
 */
export const useParallax = (options: {
  speed?: number;
  offset?: [number, number];
} = {}) => {
  const { speed = 0.5, offset = [0, -100] } = options;
  const ref = useRef(null);

  // Track scroll progress of the element
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress to parallax offset
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion() ? [0, 0] : offset.map(val => val * speed)
  );

  // Add spring physics for smoother motion
  const ySpring = useSpring(y, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return { ref, y: ySpring };
};

/**
 * Hook for magnetic cursor effect
 *
 * Element follows cursor within a radius using Framer Motion's spring physics.
 *
 * @example
 * ```tsx
 * const { ref, x, y } = useMagnetic({ strength: 0.2, radius: 100 });
 *
 * <motion.button
 *   ref={ref}
 *   style={{ x, y }}
 *   transition={{ type: 'spring', stiffness: 300, damping: 20 }}
 * />
 * ```
 */
export const useMagnetic = (options: {
  strength?: number;
  radius?: number;
  enabled?: boolean;
} = {}) => {
  const { strength = 0.2, radius = 100, enabled = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;

    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < radius) {
        const magneticX = deltaX * strength;
        const magneticY = deltaY * strength;
        setPosition({ x: magneticX, y: magneticY });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, radius, enabled]);

  return { ref, x: position.x, y: position.y, enabled: enabled && !prefersReducedMotion() };
};

/**
 * Hook for canvas pan and zoom interactions
 *
 * Provides draggable pan and scroll-based zoom with momentum and constraints.
 *
 * @example
 * ```tsx
 * const { containerRef, x, y, scale } = useCanvasPanZoom({
 *   minScale: 0.5,
 *   maxScale: 3,
 *   initialPosition: { x: 0, y: 0, scale: 1 }
 * });
 *
 * <motion.div
 *   ref={containerRef}
 *   style={{ x, y, scale }}
 *   drag
 *   dragMomentum={false}
 * />
 * ```
 */
export const useCanvasPanZoom = (options: {
  minScale?: number;
  maxScale?: number;
  initialPosition?: { x: number; y: number; scale: number };
  enableZoom?: boolean;
  enablePan?: boolean;
} = {}) => {
  const {
    minScale = 0.5,
    maxScale = 3,
    initialPosition = { x: 0, y: 0, scale: 1 },
    enableZoom = true,
    enablePan = true
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const scale = useMotionValue(initialPosition.scale);

  // Smooth spring animations
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 400, damping: 40 });

  useEffect(() => {
    if (!enableZoom || prefersReducedMotion()) return;

    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const delta = -e.deltaY * 0.001;
      const currentScale = scale.get();
      const newScale = Math.min(Math.max(currentScale + delta, minScale), maxScale);

      scale.set(newScale);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [enableZoom, minScale, maxScale, scale]);

  const panTo = (targetX: number, targetY: number, targetScale: number = scale.get()) => {
    x.set(targetX);
    y.set(targetY);
    scale.set(Math.min(Math.max(targetScale, minScale), maxScale));
  };

  const reset = () => {
    x.set(initialPosition.x);
    y.set(initialPosition.y);
    scale.set(initialPosition.scale);
  };

  return {
    containerRef,
    x: springX,
    y: springY,
    scale: springScale,
    panTo,
    reset,
    isDraggable: enablePan && !prefersReducedMotion()
  };
};

/**
 * Hook for smooth camera movements with photography-inspired easing
 *
 * Provides cinematic transitions between positions with configurable movement types.
 *
 * @example
 * ```tsx
 * const { animateTo, controls } = useCameraMovement();
 *
 * // Pan-tilt movement
 * animateTo({ x: 100, y: 50 }, 'pan-tilt');
 *
 * // Zoom with focus
 * animateTo({ scale: 2 }, 'rack-focus');
 * ```
 */
export const useCameraMovement = () => {
  const controls = useAnimation();

  const animateTo = async (
    target: { x?: number; y?: number; scale?: number; rotate?: number },
    movementType: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' = 'pan-tilt'
  ) => {
    if (prefersReducedMotion()) {
      await controls.set(target);
      return;
    }

    // Movement-specific easing curves
    const easingMap = {
      'pan-tilt': [0.16, 1, 0.3, 1], // Smooth ease-out
      'zoom-in': [0.34, 1.56, 0.64, 1], // Anticipation ease
      'zoom-out': [0.22, 1, 0.36, 1], // Gentle ease-out
      'dolly-zoom': [0.45, 0, 0.55, 1], // Symmetrical ease
      'rack-focus': [0.87, 0, 0.13, 1] // Sharp snap
    };

    const durationMap = {
      'pan-tilt': 0.8,
      'zoom-in': 0.6,
      'zoom-out': 0.7,
      'dolly-zoom': 1.2,
      'rack-focus': 0.4
    };

    await controls.start({
      ...target,
      transition: {
        duration: durationMap[movementType],
        ease: easingMap[movementType]
      }
    });
  };

  return { controls, animateTo };
};

/**
 * Fallback to CSS animations if Framer Motion is disabled
 *
 * Returns appropriate hook based on feature flag.
 */
export const useAdaptiveAnimation = (options: UseFramerScrollOptions = {}) => {
  if (FEATURES.FRAMER_MOTION_ENABLED) {
    return useFramerScrollAnimation(options);
  }

  // Fallback to CSS-based hook
  // This would use the original useScrollAnimation
  // For now, return a compatible interface
  return {
    ref: useRef(null),
    isInView: true, // CSS handles visibility via classes
  };
};
