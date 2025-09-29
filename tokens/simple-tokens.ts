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

/**
 * Content Level Visual Indicators
 * Progressive disclosure color mappings for different content levels
 */
export const contentLevelColors = {
  'preview': {
    background: '#374151', // neutral-700 with opacity
    text: '#d1d5db',      // neutral-300
    border: '#6b7280',    // neutral-500
    accent: athleticColors['neutral-400'],
  },
  'summary': {
    background: '#065f46', // green-800 equivalent
    text: '#a7f3d0',      // green-200
    border: '#047857',    // green-700
    accent: athleticColors.success,
  },
  'detailed': {
    background: '#1e3a8a', // blue-800 equivalent
    text: '#93c5fd',      // blue-300
    border: '#1d4ed8',    // blue-700
    accent: '#3b82f6',    // blue-500
  },
  'technical': {
    background: '#581c87', // purple-800 equivalent
    text: '#c4b5fd',      // purple-300
    border: '#7c3aed',    // brand-violet
    accent: athleticColors['brand-violet'],
  },
} as const;

/**
 * Content Transition Tokens
 * Smooth animation tokens for content level changes and progressive disclosure
 */
export const contentTransitions = {
  'level-change': {
    duration: athleticTiming.flow,
    easing: athleticEasing.flow,
  },
  'disclosure': {
    duration: athleticTiming.transition,
    easing: athleticEasing.precision,
  },
  'engagement': {
    duration: athleticTiming.reaction,
    easing: athleticEasing.snap,
  },
  'section-switch': {
    duration: athleticTiming.sequence,
    easing: athleticEasing.glide,
  },
} as const;

/**
 * Responsive Content Density Patterns
 * Design patterns for different content densities based on viewport and content level
 */
export const contentDensity = {
  'compact': {
    spacing: '0.75rem',     // 12px
    padding: '1rem',        // 16px
    borderRadius: '0.5rem', // 8px
    fontSize: '0.875rem',   // 14px
  },
  'comfortable': {
    spacing: '1rem',        // 16px
    padding: '1.5rem',      // 24px
    borderRadius: '0.75rem', // 12px
    fontSize: '1rem',       // 16px
  },
  'spacious': {
    spacing: '1.5rem',      // 24px
    padding: '2rem',        // 32px
    borderRadius: '1rem',   // 16px
    fontSize: '1.125rem',   // 18px
  },
} as const;

/**
 * Section-Specific Color Schemes
 * Photography metaphor colors for different content sections
 */
export const sectionColors = {
  'focus': {      // About section
    primary: athleticColors['court-navy'],
    secondary: '#3b82f6',   // blue-500
    accent: '#60a5fa',      // blue-400
  },
  'frame': {      // Skills section
    primary: athleticColors['brand-violet'],
    secondary: '#8b5cf6',   // violet-500
    accent: '#a78bfa',      // violet-400
  },
  'exposure': {   // Experience section
    primary: athleticColors['court-orange'],
    secondary: '#f97316',   // orange-500
    accent: '#fb923c',      // orange-400
  },
  'composition': { // Projects section
    primary: athleticColors.success,
    secondary: '#22c55e',   // green-500
    accent: '#4ade80',      // green-400
  },
} as const;

// Type exports for TypeScript usage
export type AthleticColor = keyof typeof athleticColors;
export type AthleticTiming = keyof typeof athleticTiming;
export type AthleticEasing = keyof typeof athleticEasing;
export type ContentLevel = keyof typeof contentLevelColors;
export type ContentTransition = keyof typeof contentTransitions;
export type ContentDensity = keyof typeof contentDensity;
export type SectionColor = keyof typeof sectionColors;