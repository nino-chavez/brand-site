/**
 * Framer Motion Scroll Transitions
 *
 * Scroll-linked animations for home page sections only.
 * Demo harness animations remain unchanged.
 */

import { useScroll, useTransform } from 'framer-motion';
import { RefObject } from 'react';

/**
 * Creates smooth opacity fade transitions at section edges
 * Uses Framer Motion's scroll-linked animations for performance
 *
 * @param sectionRef - Reference to the section element
 * @param isFirstSection - Whether this is the top/hero section (defaults to false)
 * @returns Opacity motion value (0-1) based on scroll position
 */
export function useSectionScrollFade(
  sectionRef: RefObject<HTMLElement>,
  isFirstSection: boolean = false
) {
  // Track scroll progress of this specific section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // First section: Track from when section starts (top of page) to when it exits viewport
    // Other sections: Track from entering bottom to exiting top
    offset: isFirstSection
      ? ["start start", "end start"]  // Hero: from page top to section bottom leaving viewport top
      : ["start end", "end start"]    // Others: from section top entering to section bottom exiting
  });

  // Transform scroll progress to opacity with smooth, gradual fading
  // First section fades OUT as you scroll down (starts visible)
  // Other sections fade IN when entering, fade OUT when leaving
  const opacity = useTransform(
    scrollYProgress,
    isFirstSection
      ? [0, 0.3, 0.7, 1]     // Hero: Start fading earlier (30% in, complete at 100%)
      : [0, 0.15, 0.85, 1],  // Others: Quick fade in, long visible zone, quick fade out
    isFirstSection
      ? [1, 1, 0.3, 0]       // Hero: Stay full opacity until 30%, then gradual fade to 0
      : [0, 1, 1, 0]         // Others: 0 → 1 → 1 → 0 (fade in, stay, fade out)
  );

  return { opacity, scrollYProgress };
}

/**
 * Creates scale effect for sections entering viewport
 * Section starts slightly scaled down and scales to 100% as it enters
 *
 * @param sectionRef - Reference to the section element
 * @returns Scale motion value (0.95-1) based on scroll position
 */
export function useSectionScrollScale(sectionRef: RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"] // From entering to fully visible
  });

  // Scale from 95% to 100% as section enters viewport
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [0.95, 1]
  );

  return scale;
}

/**
 * Creates translateY (vertical movement) for parallax effect
 * Section moves slightly as you scroll through it
 *
 * @param sectionRef - Reference to the section element
 * @param distance - How far to move in pixels (default: 50)
 * @returns TranslateY motion value in pixels
 */
export function useSectionScrollParallax(
  sectionRef: RefObject<HTMLElement>,
  distance: number = 50
) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Move from +distance to -distance as you scroll through section
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [distance, -distance]
  );

  return y;
}
