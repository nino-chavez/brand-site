/**
 * useTransitionZones Hook
 *
 * Provides scroll-linked opacity values for cinematic cross-dissolve transitions.
 * Creates top and bottom transition zones where sections blend together.
 *
 * @version 1.0.0
 */

import { useScroll, useTransform, type MotionValue } from 'framer-motion';
import { RefObject } from 'react';

interface TransitionZonesConfig {
  /** Enable blur effect during transition */
  withBlur?: boolean;
  /** Enable zoom effect during transition */
  withZoom?: boolean;
  /** Fade in duration (0-1, portion of scroll range) */
  fadeInRange?: [number, number];
  /** Fade out duration (0-1, portion of scroll range) */
  fadeOutRange?: [number, number];
}

interface TransitionZonesReturn {
  /** Opacity for top transition zone (fades in) */
  topZoneOpacity: MotionValue<number>;
  /** Opacity for bottom transition zone (fades out) */
  bottomZoneOpacity: MotionValue<number>;
  /** Blur amount during transition (optional) */
  transitionBlur: MotionValue<string>;
  /** Scale during transition (optional) */
  transitionScale: MotionValue<number>;
  /** Overall section opacity (for entire section fade) */
  sectionOpacity: MotionValue<number>;
}

/**
 * Hook to create cinematic cross-dissolve transition zones
 *
 * @param sectionRef - Reference to the section element
 * @param config - Configuration options
 * @returns Motion values for transition zones
 */
export function useTransitionZones(
  sectionRef: RefObject<HTMLElement>,
  config: TransitionZonesConfig = {}
): TransitionZonesReturn {
  const {
    withBlur = false,
    withZoom = false,
    fadeInRange = [0, 0.25],
    fadeOutRange = [0.75, 1],
  } = config;

  // Scroll progress for this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Top zone: Fades in as section enters viewport
  // 0 = invisible, 1 = fully visible
  const topZoneOpacity = useTransform(
    scrollYProgress,
    fadeInRange,
    [0, 1]
  );

  // Bottom zone: Fades out as section exits viewport
  // 1 = fully visible, 0 = invisible
  const bottomZoneOpacity = useTransform(
    scrollYProgress,
    fadeOutRange,
    [1, 0]
  );

  // Overall section opacity (for full section fade effect)
  const sectionOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0]
  );

  // Optional blur effect during transition
  const transitionBlur = withBlur
    ? useTransform(
        scrollYProgress,
        [0, 0.2, 0.4, 0.6, 0.8, 1],
        ['blur(0px)', 'blur(4px)', 'blur(0px)', 'blur(0px)', 'blur(4px)', 'blur(0px)']
      )
    : useTransform(scrollYProgress, [0, 1], ['blur(0px)', 'blur(0px)']);

  // Optional zoom effect during transition
  const transitionScale = withZoom
    ? useTransform(
        scrollYProgress,
        [0, 0.25, 0.5, 0.75, 1],
        [0.98, 1.01, 1.02, 1.01, 0.98]
      )
    : useTransform(scrollYProgress, [0, 1], [1, 1]);

  return {
    topZoneOpacity,
    bottomZoneOpacity,
    transitionBlur,
    transitionScale,
    sectionOpacity,
  };
}
