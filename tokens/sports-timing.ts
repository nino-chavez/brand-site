/**
 * Sports Timing System
 *
 * Athletic-inspired motion timing values (90ms, 120ms, 160ms, 220ms)
 * with performance-optimized easing curves reflecting sports movement.
 */

import { SportsTimingToken } from './types';

/**
 * Athletic Easing Curves
 * Custom cubic-bezier curves inspired by sports movements
 */
export const athleticEasing = {
  /**
   * Snap - Quick, decisive movement like a volleyball spike
   * Sharp attack, controlled follow-through
   */
  snap: 'cubic-bezier(0.4, 0, 0.2, 1)',

  /**
   * Flow - Smooth athletic transition like swimming strokes
   * Even acceleration and deceleration
   */
  flow: 'cubic-bezier(0.25, 0.1, 0.25, 1)',

  /**
   * Power - Explosive movement like a basketball jump
   * Quick buildup, sustained power, controlled landing
   */
  power: 'cubic-bezier(0.4, 0, 0.6, 1)',

  /**
   * Precision - Controlled movement like archery draw
   * Gradual buildup, smooth release
   */
  precision: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

  /**
   * Sprint - Fast acceleration like track starts
   * Explosive beginning, quick settling
   */
  sprint: 'cubic-bezier(0.55, 0, 0.1, 1)',

  /**
   * Glide - Effortless movement like figure skating
   * Smooth throughout with gentle acceleration
   */
  glide: 'cubic-bezier(0.25, 0, 0.75, 1)'
} as const;

/**
 * Core Sports Timing Values
 * Athletic-inspired timing system with performance metadata
 */
export const sportsTimingTokens = {
  /**
   * Quick Snap - 90ms
   * Ultra-fast response for micro-interactions
   * Inspired by volleyball quick attacks
   */
  'quick-snap': {
    value: 90,
    name: 'Quick Snap',
    easing: athleticEasing.snap,
    frameImpact: 'minimal' as const,
    usage: [
      'checkbox toggles',
      'input focus states',
      'micro-interactions',
      'immediate feedback',
      'button press responses'
    ],
    description: 'Ultra-fast athletic response for immediate feedback interactions'
  } satisfies SportsTimingToken,

  /**
   * Reaction - 120ms
   * Athletic reaction time for user interactions
   * Inspired by sprinter reaction times
   */
  'reaction': {
    value: 120,
    name: 'Reaction',
    easing: athleticEasing.flow,
    frameImpact: 'low' as const,
    usage: [
      'button hover states',
      'link interactions',
      'menu item highlights',
      'form field interactions',
      'icon state changes'
    ],
    description: 'Athletic reaction timing for responsive user interface interactions'
  } satisfies SportsTimingToken,

  /**
   * Transition - 160ms
   * Smooth athletic movement for content changes
   * Inspired by gymnastic transitions
   */
  'transition': {
    value: 160,
    name: 'Transition',
    easing: athleticEasing.power,
    frameImpact: 'moderate' as const,
    usage: [
      'modal appearances',
      'dropdown menus',
      'content reveals',
      'tab switching',
      'card interactions'
    ],
    description: 'Smooth athletic transition timing for content state changes'
  } satisfies SportsTimingToken,

  /**
   * Sequence - 220ms
   * Complex athletic movement for major changes
   * Inspired by volleyball rotation sequences
   */
  'sequence': {
    value: 220,
    name: 'Sequence',
    easing: athleticEasing.precision,
    frameImpact: 'moderate' as const,
    usage: [
      'section transitions',
      'page navigation',
      'major state changes',
      'complex animations',
      'multi-step interactions'
    ],
    description: 'Athletic sequence timing for complex, coordinated interface changes'
  } satisfies SportsTimingToken
} as const;

/**
 * Extended Timing Values
 * Additional timing options for specific athletic movements
 */
export const extendedTimingTokens = {
  /**
   * Flash - 60ms
   * Lightning-fast feedback like scoreboard updates
   */
  'flash': {
    value: 60,
    name: 'Flash',
    easing: athleticEasing.sprint,
    frameImpact: 'minimal' as const,
    usage: [
      'notification badges',
      'instant feedback',
      'flash animations',
      'score updates'
    ],
    description: 'Lightning-fast athletic feedback for instant visual updates'
  } satisfies SportsTimingToken,

  /**
   * Flow - 300ms
   * Sustained athletic movement like swimming laps
   */
  'flow': {
    value: 300,
    name: 'Flow',
    easing: athleticEasing.glide,
    frameImpact: 'moderate' as const,
    usage: [
      'smooth scrolling',
      'progressive reveals',
      'loading animations',
      'continuous movements'
    ],
    description: 'Sustained athletic flow for longer, continuous interface movements'
  } satisfies SportsTimingToken,

  /**
   * Power - 400ms
   * Strong athletic movement like weightlifting
   */
  'power': {
    value: 400,
    name: 'Power',
    easing: athleticEasing.power,
    frameImpact: 'high' as const,
    usage: [
      'page transitions',
      'hero animations',
      'dramatic reveals',
      'powerful interactions'
    ],
    description: 'Powerful athletic timing for dramatic, impactful interface changes'
  } satisfies SportsTimingToken
} as const;

/**
 * Complete Sports Timing System
 * All timing tokens combined for easy access
 */
export const allSportsTimings = {
  ...sportsTimingTokens,
  ...extendedTimingTokens
} as const;

/**
 * Timing Categories by Performance Impact
 */
export const timingByImpact = {
  minimal: Object.entries(allSportsTimings)
    .filter(([_, timing]) => timing.frameImpact === 'minimal')
    .reduce((acc, [name, timing]) => ({ ...acc, [name]: timing }), {}),

  low: Object.entries(allSportsTimings)
    .filter(([_, timing]) => timing.frameImpact === 'low')
    .reduce((acc, [name, timing]) => ({ ...acc, [name]: timing }), {}),

  moderate: Object.entries(allSportsTimings)
    .filter(([_, timing]) => timing.frameImpact === 'moderate')
    .reduce((acc, [name, timing]) => ({ ...acc, [name]: timing }), {}),

  high: Object.entries(allSportsTimings)
    .filter(([_, timing]) => timing.frameImpact === 'high')
    .reduce((acc, [name, timing]) => ({ ...acc, [name]: timing }), {})
};

/**
 * Timing Categories by Usage Context
 */
export const timingByContext = {
  /**
   * User Interaction Timings
   * For direct user interface responses
   */
  interaction: {
    'quick-snap': sportsTimingTokens['quick-snap'],
    'reaction': sportsTimingTokens['reaction'],
    'flash': extendedTimingTokens['flash']
  },

  /**
   * Content Transition Timings
   * For content and layout changes
   */
  content: {
    'transition': sportsTimingTokens['transition'],
    'sequence': sportsTimingTokens['sequence'],
    'flow': extendedTimingTokens['flow']
  },

  /**
   * Dramatic Effect Timings
   * For impactful, attention-getting animations
   */
  dramatic: {
    'power': extendedTimingTokens['power'],
    'sequence': sportsTimingTokens['sequence']
  }
};

/**
 * Performance Budget Analysis
 * Frame time impact calculations for athletic timings
 */
export const performanceAnalysis = {
  /**
   * Frame count at 60fps for each timing
   */
  frameCount: Object.entries(allSportsTimings)
    .map(([name, timing]) => ({
      name,
      duration: timing.value,
      frames: Math.ceil((timing.value / 1000) * 60),
      impact: timing.frameImpact
    }))
    .sort((a, b) => a.duration - b.duration),

  /**
   * Recommended usage based on performance impact
   */
  recommendations: {
    minimal: 'Use freely for any interaction without performance concerns',
    low: 'Suitable for frequent interactions and hover states',
    moderate: 'Use sparingly, ideal for important state changes',
    high: 'Reserve for hero moments and dramatic transitions only'
  },

  /**
   * Performance budget compliance
   */
  budgetCompliance: Object.entries(allSportsTimings)
    .map(([name, timing]) => ({
      name,
      duration: timing.value,
      compliant: timing.value <= 300, // 300ms is generally considered the limit for smooth UX
      recommendation: timing.value > 300 ? 'Consider reducing duration' : 'Within performance budget'
    }))
};

/**
 * Athletic Motion Principles
 * Guidelines for using sports timing effectively
 */
export const motionPrinciples = {
  /**
   * Immediate Response Principle
   * User actions should have immediate feedback
   */
  immediateResponse: {
    maxDuration: 100,
    recommendedTokens: ['quick-snap', 'flash'],
    description: 'User interactions must feel instantaneous'
  },

  /**
   * Natural Flow Principle
   * Animations should feel like natural athletic movements
   */
  naturalFlow: {
    easingGuidelines: 'Use athletic easing curves that mimic sports movements',
    timingGuidelines: 'Match timing to the perceived effort of the action',
    description: 'Animations should feel organic and purposeful'
  },

  /**
   * Performance First Principle
   * Athletic precision includes technical precision
   */
  performanceFirst: {
    frameTarget: 60, // fps
    budgetLimit: 16, // ms per frame
    description: 'All animations must maintain 60fps performance'
  },

  /**
   * Contextual Appropriateness
   * Timing should match the importance of the action
   */
  contextualTiming: {
    microInteractions: 'Use quick-snap or flash (60-90ms)',
    standardInteractions: 'Use reaction or transition (120-160ms)',
    majorChanges: 'Use sequence or flow (220-300ms)',
    dramaticMoments: 'Use power (400ms) sparingly'
  }
};

/**
 * CSS Custom Property Names
 * Standardized naming for athletic timing tokens
 */
export const timingCSSProperties = Object.keys(allSportsTimings).reduce(
  (acc, name) => ({
    ...acc,
    [name]: `--athletic-timing-${name}`
  }),
  {} as Record<keyof typeof allSportsTimings, string>
);

/**
 * Tailwind Animation Duration Classes
 * Class names for Tailwind integration
 */
export const tailwindDurationClasses = Object.entries(allSportsTimings).reduce(
  (acc, [name, timing]) => ({
    ...acc,
    [`duration-${name}`]: `${timing.value}ms`
  }),
  {} as Record<string, string>
);

export type SportsTimingName = keyof typeof allSportsTimings;