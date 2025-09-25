/**
 * Athletic Color Palette
 *
 * Court-inspired color definitions with WCAG AAA accessibility metadata
 * Supporting court-navy, court-orange, and brand-violet athletic theme.
 */

import { getContrast } from 'color2k';
import { AthleticColorToken } from './types';

/**
 * Calculate contrast ratios for a color against standard backgrounds
 */
function calculateContrastMetadata(color: string) {
  return {
    white: Math.round(getContrast(color, '#ffffff') * 10) / 10,
    dark: Math.round(getContrast(color, '#0a0a0f') * 10) / 10
  };
}

/**
 * Primary Athletic Color Palette
 * Core colors for the sports-inspired design system
 */
export const athleticColors = {
  /**
   * Court Navy - Primary brand foundation
   * Deep navy inspired by professional court surfaces
   */
  'court-navy': {
    value: '#1a365d',
    name: 'Court Navy',
    contrast: calculateContrastMetadata('#1a365d'),
    context: 'focus' as const,
    usage: [
      'primary brand color',
      'header backgrounds',
      'navigation elements',
      'hero section backgrounds',
      'professional text elements'
    ]
  } satisfies AthleticColorToken,

  /**
   * Court Orange - Energy accent color
   * Vibrant orange for calls-to-action and highlights
   */
  'court-orange': {
    value: '#ea580c',
    name: 'Court Orange',
    contrast: calculateContrastMetadata('#ea580c'),
    context: 'energy' as const,
    usage: [
      'call-to-action buttons',
      'accent highlights',
      'interactive elements',
      'energy indicators',
      'hover states'
    ]
  } satisfies AthleticColorToken,

  /**
   * Brand Violet - Sophisticated accent
   * Maintaining current violet-400 visual consistency
   */
  'brand-violet': {
    value: '#7c3aed',
    name: 'Brand Violet',
    contrast: calculateContrastMetadata('#7c3aed'),
    context: 'power' as const,
    usage: [
      'sophisticated accents',
      'premium feature indicators',
      'secondary CTAs',
      'brand differentiation',
      'viewfinder elements'
    ]
  } satisfies AthleticColorToken
} as const;

/**
 * Semantic Color Palette
 * Athletic-inspired status and feedback colors
 */
export const semanticColors = {
  /**
   * Athletic Success - Victory green
   * Inspired by championship celebrations
   */
  success: {
    value: '#10b981',
    name: 'Athletic Success',
    contrast: calculateContrastMetadata('#10b981'),
    context: 'precision' as const,
    usage: [
      'success confirmations',
      'completed actions',
      'positive feedback',
      'achievement indicators'
    ]
  } satisfies AthleticColorToken,

  /**
   * Athletic Warning - Caution amber
   * Sports field warning color inspiration
   */
  warning: {
    value: '#f59e0b',
    name: 'Athletic Warning',
    contrast: calculateContrastMetadata('#f59e0b'),
    context: 'energy' as const,
    usage: [
      'warning states',
      'caution indicators',
      'pending actions',
      'attention grabbers'
    ]
  } satisfies AthleticColorToken,

  /**
   * Athletic Error - Controlled red
   * Referee signal inspired error color
   */
  error: {
    value: '#ef4444',
    name: 'Athletic Error',
    contrast: calculateContrastMetadata('#ef4444'),
    context: 'power' as const,
    usage: [
      'error messages',
      'destructive actions',
      'validation failures',
      'critical alerts'
    ]
  } satisfies AthleticColorToken
} as const;

/**
 * Supporting Neutral Palette
 * Photography-optimized grays for content and backgrounds
 */
export const neutralColors = {
  /**
   * Athletic Gray Scale
   * Optimized for sports photography contrast
   */
  'neutral-50': {
    value: '#fafafa',
    name: 'Athletic Neutral 50',
    contrast: calculateContrastMetadata('#fafafa'),
    context: 'neutral' as const,
    usage: ['light backgrounds', 'subtle borders', 'light overlays']
  } satisfies AthleticColorToken,

  'neutral-100': {
    value: '#f5f5f5',
    name: 'Athletic Neutral 100',
    contrast: calculateContrastMetadata('#f5f5f5'),
    context: 'neutral' as const,
    usage: ['card backgrounds', 'section dividers', 'input backgrounds']
  } satisfies AthleticColorToken,

  'neutral-200': {
    value: '#e5e5e5',
    name: 'Athletic Neutral 200',
    contrast: calculateContrastMetadata('#e5e5e5'),
    context: 'neutral' as const,
    usage: ['borders', 'disabled states', 'placeholder text']
  } satisfies AthleticColorToken,

  'neutral-300': {
    value: '#d4d4d4',
    name: 'Athletic Neutral 300',
    contrast: calculateContrastMetadata('#d4d4d4'),
    context: 'neutral' as const,
    usage: ['inactive elements', 'subtle separators', 'muted backgrounds']
  } satisfies AthleticColorToken,

  'neutral-400': {
    value: '#a3a3a3',
    name: 'Athletic Neutral 400',
    contrast: calculateContrastMetadata('#a3a3a3'),
    context: 'neutral' as const,
    usage: ['secondary text', 'icon colors', 'placeholder content']
  } satisfies AthleticColorToken,

  'neutral-500': {
    value: '#737373',
    name: 'Athletic Neutral 500',
    contrast: calculateContrastMetadata('#737373'),
    context: 'neutral' as const,
    usage: ['body text', 'standard icons', 'form labels']
  } satisfies AthleticColorToken,

  'neutral-600': {
    value: '#525252',
    name: 'Athletic Neutral 600',
    contrast: calculateContrastMetadata('#525252'),
    context: 'neutral' as const,
    usage: ['headings', 'emphasized text', 'active states']
  } satisfies AthleticColorToken,

  'neutral-700': {
    value: '#404040',
    name: 'Athletic Neutral 700',
    contrast: calculateContrastMetadata('#404040'),
    context: 'neutral' as const,
    usage: ['primary text', 'main content', 'strong emphasis']
  } satisfies AthleticColorToken,

  'neutral-800': {
    value: '#262626',
    name: 'Athletic Neutral 800',
    contrast: calculateContrastMetadata('#262626'),
    context: 'neutral' as const,
    usage: ['dark text', 'high contrast', 'headers on light']
  } satisfies AthleticColorToken,

  'neutral-900': {
    value: '#171717',
    name: 'Athletic Neutral 900',
    contrast: calculateContrastMetadata('#171717'),
    context: 'neutral' as const,
    usage: ['darkest text', 'maximum contrast', 'black alternatives']
  } satisfies AthleticColorToken,

  'neutral-950': {
    value: '#0a0a0a',
    name: 'Athletic Neutral 950',
    contrast: calculateContrastMetadata('#0a0a0a'),
    context: 'neutral' as const,
    usage: ['pure dark', 'maximum depth', 'photography backgrounds']
  } satisfies AthleticColorToken
} as const;

/**
 * Complete Athletic Color System
 * All colors combined for easy access
 */
export const allAthleticColors = {
  ...athleticColors,
  ...semanticColors,
  ...neutralColors
} as const;

/**
 * Color Categories for Organization
 */
export const colorCategories = {
  primary: athleticColors,
  semantic: semanticColors,
  neutral: neutralColors
} as const;

/**
 * WCAG AAA Compliance Report
 * Accessibility validation for all athletic colors
 */
export const accessibilityReport = {
  /**
   * Colors that meet WCAG AAA standard (7:1+) against white
   */
  wcagAAA: Object.entries(allAthleticColors)
    .filter(([_, color]) => color.contrast.white >= 7)
    .map(([name, _]) => name),

  /**
   * Colors that meet WCAG AA standard (4.5:1+) against white
   */
  wcagAA: Object.entries(allAthleticColors)
    .filter(([_, color]) => color.contrast.white >= 4.5)
    .map(([name, _]) => name),

  /**
   * High contrast pairs (>= 7:1)
   */
  highContrastPairs: Object.entries(allAthleticColors)
    .filter(([_, color]) => color.contrast.white >= 7 || color.contrast.dark >= 7)
    .map(([name, color]) => ({
      color: name,
      value: color.value,
      whiteContrast: color.contrast.white,
      darkContrast: color.contrast.dark
    }))
};

/**
 * Athletic Color Usage Guidelines
 */
export const colorUsageGuidelines = {
  primary: {
    description: 'Use for brand identity, navigation, and primary actions',
    examples: ['header backgrounds', 'primary buttons', 'brand elements']
  },
  accent: {
    description: 'Use for highlights, CTAs, and interactive elements',
    examples: ['hover states', 'active indicators', 'call-to-action buttons']
  },
  semantic: {
    description: 'Use for status communication and user feedback',
    examples: ['success messages', 'error alerts', 'warning notifications']
  },
  neutral: {
    description: 'Use for text, backgrounds, and content structure',
    examples: ['body text', 'card backgrounds', 'border colors']
  }
};

export type AthleticColorName = keyof typeof allAthleticColors;