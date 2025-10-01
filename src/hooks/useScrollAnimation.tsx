/**
 * useScrollAnimation - Scroll-triggered Animation Hook
 *
 * Implements Intersection Observer for scroll-triggered animations.
 * Provides staggered fade-in effects as sections enter viewport.
 * Now supports user-customizable animation styles via EffectsContext.
 *
 * @version 2.0.0
 * @since WOW Factor Phase 3 (Enhanced)
 */

import { useEffect, useRef, useState } from 'react';
import { useEffects } from '../contexts/EffectsContext';
import type { AnimationStyle, TransitionSpeed } from '../contexts/EffectsContext';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  staggerDelay?: number;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.05, // Trigger earlier (was 0.1)
    rootMargin = '0px 0px 50px 0px', // Trigger before entering viewport (was -100px)
    triggerOnce = true,
    staggerDelay = 100
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
          }
        } else if (!triggerOnce && !hasTriggered) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { elementRef, isVisible };
};

/**
 * useStaggeredChildren - Staggered animation for child elements
 */
export const useStaggeredChildren = (
  childCount: number,
  baseDelay: number = 100
) => {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisibleIndices(new Set(Array.from({ length: childCount }, (_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger children visibility
          Array.from({ length: childCount }, (_, i) => i).forEach((index) => {
            setTimeout(() => {
              setVisibleIndices((prev) => new Set([...prev, index]));
            }, index * baseDelay);
          });
        }
      },
      {
        threshold: 0.05, // Trigger earlier
        rootMargin: '0px 0px 100px 0px' // Trigger before entering viewport
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [childCount, baseDelay]);

  return { containerRef, visibleIndices };
};

/**
 * Animation class generator helper with user preferences
 */
export const getAnimationClasses = (
  isVisible: boolean,
  style?: AnimationStyle,
  speed?: TransitionSpeed
) => {
  // Speed to duration mapping
  const durationMap: Record<TransitionSpeed, string> = {
    fast: 'duration-300',
    normal: 'duration-500',
    slow: 'duration-800',
    off: 'duration-0',
  };

  const duration = speed ? durationMap[speed] : 'duration-500';
  const baseClasses = `transition-all ${duration} ease-out`;

  if (speed === 'off') {
    return 'opacity-100'; // No animation
  }

  if (isVisible) {
    // Apply animation based on style
    switch (style) {
      case 'slide':
        return `${baseClasses} opacity-100 translate-x-0`;
      case 'scale':
        return `${baseClasses} opacity-100 scale-100`;
      case 'blur-morph':
        return `${baseClasses} opacity-100 blur-0 scale-100`;
      case 'clip-reveal':
        return `${baseClasses} opacity-100`;
      case 'fade-up':
      default:
        return `${baseClasses} opacity-100 translate-y-0`;
    }
  }

  // Initial hidden state based on animation style
  switch (style) {
    case 'slide':
      return `${baseClasses} opacity-0 -translate-x-8`;
    case 'scale':
      return `${baseClasses} opacity-0 scale-95`;
    case 'blur-morph':
      return `${baseClasses} opacity-0 blur-sm scale-95`;
    case 'clip-reveal':
      return `${baseClasses} opacity-0 clip-path-0`;
    case 'fade-up':
    default:
      return `${baseClasses} opacity-0 translate-y-8`;
  }
};

/**
 * Hook to use animation with effects context
 */
export const useAnimationWithEffects = () => {
  const { settings } = useEffects();
  return {
    animationStyle: settings.animationStyle,
    transitionSpeed: settings.transitionSpeed,
    getClasses: (isVisible: boolean) =>
      getAnimationClasses(isVisible, settings.animationStyle, settings.transitionSpeed),
  };
};

export default useScrollAnimation;
