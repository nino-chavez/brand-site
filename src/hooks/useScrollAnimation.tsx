/**
 * useScrollAnimation - Scroll-triggered Animation Hook
 *
 * Implements Intersection Observer for scroll-triggered animations.
 * Provides staggered fade-in effects as sections enter viewport.
 *
 * @version 1.0.0
 * @since WOW Factor Phase 3
 */

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  staggerDelay?: number;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
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
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
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
 * Animation class generator helper
 */
export const getAnimationClasses = (
  isVisible: boolean,
  animation: 'fade-in-up' | 'fade-in' | 'slide-in-left' | 'slide-in-right' = 'fade-in-up'
) => {
  const baseClasses = 'transition-all duration-700 ease-out';

  if (isVisible) {
    return `${baseClasses} animate-${animation}`;
  }

  return `${baseClasses} opacity-0 transform ${
    animation === 'fade-in-up' ? 'translate-y-8' :
    animation === 'slide-in-left' ? '-translate-x-8' :
    animation === 'slide-in-right' ? 'translate-x-8' :
    ''
  }`;
};

export default useScrollAnimation;
