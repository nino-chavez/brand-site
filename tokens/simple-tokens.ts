/**
 * Simplified Athletic Design Tokens
 *
 * Core token definitions without over-engineered utilities.
 * Replaces the 325-line athletic-tokens.ts with just the essentials.
 */

/**
 * Athletic Color Values
 * Core colors used throughout the application
 */
export const athleticColors = {
  // Primary colors
  'court-navy': '#1a365d',
  'court-orange': '#ea580c',
  'brand-violet': '#7c3aed',

  // Semantic colors
  'success': '#10b981',
  'warning': '#f59e0b',
  'error': '#ef4444',

  // Neutral scale
  'neutral-50': '#fafafa',
  'neutral-100': '#f5f5f5',
  'neutral-200': '#e5e5e5',
  'neutral-300': '#d4d4d4',
  'neutral-400': '#a3a3a3',
  'neutral-500': '#737373',
  'neutral-600': '#525252',
  'neutral-700': '#404040',
  'neutral-800': '#262626',
  'neutral-900': '#171717',
  'neutral-950': '#0a0a0a',
} as const;

/**
 * Athletic Timing Values
 * Animation durations for consistent motion
 */
export const athleticTiming = {
  'quick-snap': 90,
  'reaction': 120,
  'transition': 160,
  'sequence': 220,
  'flash': 60,
  'flow': 300,
  'power': 400,
} as const;

/**
 * Athletic Easing Functions
 * Consistent motion curves
 */
export const athleticEasing = {
  'snap': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'flow': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'power': 'cubic-bezier(0.4, 0, 0.6, 1)',
  'precision': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'sprint': 'cubic-bezier(0.55, 0, 0.1, 1)',
  'glide': 'cubic-bezier(0.25, 0, 0.75, 1)',
} as const;

// Type exports for TypeScript usage
export type AthleticColor = keyof typeof athleticColors;
export type AthleticTiming = keyof typeof athleticTiming;
export type AthleticEasing = keyof typeof athleticEasing;