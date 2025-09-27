/**
 * Split-Screen Athletic Design Tokens
 *
 * Specialized timing, spacing, and animation tokens for Phase 5
 * split-screen storytelling components. Extends the core athletic
 * design token system with split-screen specific values.
 *
 * @fileoverview Split-screen design tokens for storytelling system
 * @version 1.0.0
 * @since Phase 5
 */

import { athleticTiming, athleticEasing } from './simple-tokens';

/**
 * Split-Screen Timing Tokens
 * Optimized for 16ms frame budget and 60fps performance
 * Extends athletic timing (90ms-220ms) with split-screen specific durations
 */
export const splitScreenTiming = {
  // Primary split-screen transitions (within 16ms frame budget)
  'split-activate': 120,      // Split-screen mode activation
  'split-deactivate': 90,     // Split-screen mode deactivation
  'panel-transition': 160,    // Individual panel content transitions
  'sync-delay': 200,          // Maximum stagger delay between panels (US2 requirement)

  // Layout timing tokens
  'layout-shift': athleticTiming.reaction,     // 120ms - CSS Grid layout changes
  'content-swap': athleticTiming.transition,   // 160ms - Content switching between panels
  'resize-adapt': athleticTiming['quick-snap'], // 90ms - Responsive breakpoint changes

  // Animation coordination
  'stagger-base': 80,         // Base stagger delay for sequenced animations
  'stagger-increment': 40,    // Increment for multiple panel animations
  'coordination-window': 300, // Maximum time window for synchronized effects

  // Depth-of-field specific timing (US3 requirement: max 300ms)
  'blur-transition': 250,     // Blur effect transitions (under 300ms limit)
  'focus-shift': 180,         // Focus changes between panels
  'depth-activate': 150,      // Depth-of-field effect activation

  // Performance optimization timing
  'frame-budget': 16,         // Target frame budget in milliseconds
  'debounce-input': 100,      // Input debouncing for performance
  'throttle-scroll': 32,      // Scroll throttling (2 frames at 60fps)
} as const;

/**
 * Split-Screen Spacing Tokens
 * Grid gaps, padding, and layout spacing optimized for split-screen layouts
 */
export const splitScreenSpacing = {
  // Grid system spacing
  'grid-gap': '24px',         // Primary gap between split panels
  'grid-gap-mobile': '16px',  // Mobile grid gap (reduced for smaller screens)
  'grid-gap-large': '32px',   // Large screen grid gap for enhanced separation

  // Panel spacing
  'panel-padding': '24px',    // Internal panel padding
  'panel-margin': '20px',     // External panel margins
  'content-spacing': '16px',  // Spacing between content elements within panels

  // Split-screen specific spacing
  'divider-width': '2px',     // Visual divider between panels
  'focus-outline': '3px',     // Focus outline for accessibility
  'hover-offset': '4px',      // Hover state visual offset

  // Responsive spacing modifiers
  'mobile-scale': '0.75',     // Spacing scale factor for mobile
  'tablet-scale': '0.85',     // Spacing scale factor for tablet
  'desktop-scale': '1.0',     // Spacing scale factor for desktop

  // Layout constraints
  'min-panel-width': '300px', // Minimum width for each panel
  'max-panel-width': '800px', // Maximum width for each panel
  'aspect-ratio': '16/9',     // Preferred aspect ratio for content
} as const;

/**
 * Split-Screen Animation Easing
 * Athletic motion curves optimized for split-screen transitions
 */
export const splitScreenEasing = {
  // Split-screen specific easing curves
  'split-reveal': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Panel reveal animation
  'split-hide': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',  // Panel hide animation
  'sync-motion': athleticEasing.flow,                       // Synchronized panel motion

  // Content transition easing
  'content-in': athleticEasing.snap,                        // Content entering panels
  'content-out': athleticEasing.sprint,                     // Content leaving panels
  'cross-fade': 'cubic-bezier(0.4, 0, 0.2, 1)',           // Cross-fade between content

  // Focus and interaction easing
  'focus-shift': athleticEasing.precision,                  // Focus transitions
  'hover-response': athleticEasing.snap,                    // Hover state changes
  'click-feedback': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Click animation bounce

  // Depth-of-field easing
  'blur-smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',      // Smooth blur transitions
  'depth-dramatic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Dramatic depth effect

  // Performance-optimized easing (for reduced motion)
  'linear-fallback': 'linear',                              // Simple linear easing
  'reduced-motion': 'cubic-bezier(0.25, 0.25, 0.75, 0.75)', // Gentle motion for accessibility
} as const;

/**
 * Split-Screen Layout Configuration Tokens
 * Predefined layout configurations for common split-screen scenarios
 */
export const splitScreenLayouts = {
  // Standard 50/50 layouts
  'horizontal-equal': {
    gridTemplate: '1fr 1fr',
    direction: 'horizontal',
    ratio: 0.5,
  },
  'vertical-equal': {
    gridTemplate: '1fr / 1fr',
    direction: 'vertical',
    ratio: 0.5,
  },

  // Asymmetric layouts
  'technical-emphasis': {
    gridTemplate: '2fr 1fr',
    direction: 'horizontal',
    ratio: 0.67, // 67% technical, 33% athletic
  },
  'athletic-emphasis': {
    gridTemplate: '1fr 2fr',
    direction: 'horizontal',
    ratio: 0.33, // 33% technical, 67% athletic
  },

  // Responsive stacking
  'mobile-stack': {
    gridTemplate: '1fr / 1fr',
    direction: 'vertical',
    ratio: 1.0,
  },
  'tablet-maintain': {
    gridTemplate: '1fr 1fr',
    direction: 'horizontal',
    ratio: 0.5,
  },
} as const;

/**
 * Split-Screen Performance Tokens
 * Performance-related constants for 60fps compliance
 */
export const splitScreenPerformance = {
  // Frame rate targets
  'target-fps': 60,
  'min-fps': 45,              // Degradation threshold
  'frame-budget-ms': 16,      // Target frame budget

  // Animation limits (US1 requirement: max 3 simultaneous animations)
  'max-concurrent-animations': 3,
  'animation-queue-size': 5,
  'animation-timeout-ms': 5000,

  // Memory optimization
  'max-cached-panels': 4,     // Maximum cached panel content
  'gc-threshold-mb': 50,      // Garbage collection threshold
  'image-cache-limit': 10,    // Maximum cached images per panel

  // Performance monitoring intervals
  'fps-sample-interval': 1000,  // FPS monitoring sample rate
  'memory-check-interval': 5000, // Memory usage check interval
  'performance-log-interval': 10000, // Performance logging interval
} as const;

/**
 * Split-Screen Accessibility Tokens
 * Accessibility-specific values for WCAG 2.1 AA compliance
 */
export const splitScreenAccessibility = {
  // Focus management
  'focus-outline-width': '3px',
  'focus-outline-color': '#005fcc',
  'focus-outline-style': 'solid',
  'focus-outline-offset': '2px',

  // High contrast ratios (minimum 4.5:1 for AA compliance)
  'contrast-ratio-min': 4.5,
  'contrast-ratio-target': 7.0, // AAA compliance target

  // Reduced motion settings
  'reduced-motion-duration': 50, // Minimal animation duration
  'reduced-motion-scale': 0.1,   // Scale factor for reduced animations

  // Keyboard navigation timing
  'keyboard-repeat-delay': 500,  // Initial key repeat delay
  'keyboard-repeat-rate': 100,   // Subsequent key repeat rate

  // Screen reader delays
  'aria-live-delay': 150,        // Delay before announcing changes
  'aria-description-delay': 300, // Delay for description updates
} as const;

// ============================================================================
// COMPOSITE TOKEN OBJECTS FOR EASY IMPORT
// ============================================================================

/**
 * Complete split-screen token collection
 * Combines all split-screen token categories for convenient import
 */
export const splitScreenTokens = {
  timing: splitScreenTiming,
  spacing: splitScreenSpacing,
  easing: splitScreenEasing,
  layouts: splitScreenLayouts,
  performance: splitScreenPerformance,
  accessibility: splitScreenAccessibility,
} as const;

// ============================================================================
// TYPESCRIPT TYPE EXPORTS
// ============================================================================

export type SplitScreenTiming = keyof typeof splitScreenTiming;
export type SplitScreenSpacing = keyof typeof splitScreenSpacing;
export type SplitScreenEasing = keyof typeof splitScreenEasing;
export type SplitScreenLayout = keyof typeof splitScreenLayouts;
export type SplitScreenPerformance = keyof typeof splitScreenPerformance;
export type SplitScreenAccessibility = keyof typeof splitScreenAccessibility;

/**
 * Union type for all split-screen token categories
 */
export type SplitScreenTokenCategory =
  | 'timing'
  | 'spacing'
  | 'easing'
  | 'layouts'
  | 'performance'
  | 'accessibility';

/**
 * Complete split-screen token type
 */
export type SplitScreenToken =
  | SplitScreenTiming
  | SplitScreenSpacing
  | SplitScreenEasing
  | SplitScreenLayout
  | SplitScreenPerformance
  | SplitScreenAccessibility;

// ============================================================================
// UTILITY FUNCTIONS FOR TOKEN USAGE
// ============================================================================

/**
 * Get timing value in milliseconds with 'ms' suffix
 * @param token - Timing token name
 * @returns Formatted timing string
 */
export function getTimingMs(token: SplitScreenTiming): string {
  return `${splitScreenTiming[token]}ms`;
}

/**
 * Get easing function for CSS animations
 * @param token - Easing token name
 * @returns CSS easing function string
 */
export function getEasing(token: SplitScreenEasing): string {
  return splitScreenEasing[token];
}

/**
 * Get layout configuration object
 * @param token - Layout token name
 * @returns Layout configuration object
 */
export function getLayout(token: SplitScreenLayout) {
  return splitScreenLayouts[token];
}

/**
 * Calculate staggered delay for multiple animations
 * @param index - Animation index (0-based)
 * @param baseDelay - Base delay in milliseconds
 * @returns Calculated delay in milliseconds
 */
export function calculateStaggerDelay(index: number, baseDelay: number = splitScreenTiming['stagger-base']): number {
  return baseDelay + (index * splitScreenTiming['stagger-increment']);
}

/**
 * Validate animation count against performance limits
 * @param count - Number of simultaneous animations
 * @returns Whether count is within performance limits
 */
export function validateAnimationCount(count: number): boolean {
  return count <= splitScreenPerformance['max-concurrent-animations'];
}

/**
 * Get responsive spacing value based on breakpoint
 * @param baseSpacing - Base spacing value
 * @param breakpoint - Target breakpoint
 * @returns Scaled spacing value
 */
export function getResponsiveSpacing(
  baseSpacing: string,
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): string {
  const scale = splitScreenSpacing[`${breakpoint}-scale`];
  const numericValue = parseFloat(baseSpacing);
  const unit = baseSpacing.replace(numericValue.toString(), '');

  return `${numericValue * parseFloat(scale)}${unit}`;
}