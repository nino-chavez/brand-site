/**
 * Feature Flags Configuration
 *
 * Centralized feature flag system for conditional functionality.
 * Enables A/B testing, gradual rollouts, and environment-specific features.
 *
 * @version 1.0.0
 */

/**
 * Check if current route is the demo page
 * Demo page must always use CSS-based animations for visual regression testing
 */
const isDemoPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.includes('/demo');
};

/**
 * Feature flags for animation system
 */
export const FEATURES = {
  /**
   * Enable Framer Motion animations (disabled for /demo page)
   * When false, falls back to CSS transitions
   */
  FRAMER_MOTION_ENABLED: !isDemoPage(),

  /**
   * Enable enhanced scroll-triggered animations
   * Uses Framer Motion's whileInView with improved easing
   */
  ENHANCED_SCROLL_ANIMATIONS: !isDemoPage(),

  /**
   * Enable gesture-based interactions (hover, tap, drag)
   * Provides spring physics for natural motion
   */
  GESTURE_ANIMATIONS: !isDemoPage(),

  /**
   * Enable shared layout transitions
   * Smooth morphing between component states
   */
  LAYOUT_ANIMATIONS: !isDemoPage(),

  /**
   * Enable reduced motion detection
   * Always enabled for accessibility
   */
  RESPECT_REDUCED_MOTION: true,

  /**
   * Enable animation performance monitoring
   * Logs FPS and layout shift metrics in development
   */
  ANIMATION_PERF_MONITORING: process.env.NODE_ENV === 'development',
} as const;

/**
 * Animation timing presets (shared across CSS and Framer)
 */
export const ANIMATION_TIMING = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.7,
  scroll: 0.7,
} as const;

/**
 * Easing functions (Framer Motion format)
 */
export const EASING = {
  // Smooth, natural ease
  smooth: [0.16, 1, 0.3, 1],
  // Quick snap
  snap: [0.4, 0, 0.2, 1],
  // Bouncy spring
  spring: [0.68, -0.55, 0.265, 1.55],
  // Linear (no easing)
  linear: [0, 0, 1, 1],
} as const;

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get appropriate animation duration based on user preferences
 */
export const getAnimationDuration = (base: number): number => {
  return prefersReducedMotion() ? 0 : base;
};
