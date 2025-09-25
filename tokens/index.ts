/**
 * Athletic Design Token System
 *
 * Main entry point for the athletic-inspired design token system
 * supporting court-navy, court-orange, and brand-violet palettes
 * with sports-specific motion timing.
 */

// Type definitions
export type {
  AthleticColorToken,
  SportsTimingToken,
  ThemeObject,
  TokenValidationResult,
  TokenAccess,
  TokenProviderConfig,
  ContrastValidation,
  BundleImpact
} from './types';

// Theme configuration
export type {
  ThemeConfiguration,
  CSSPropertyConfig,
  ThemeContextConfig,
  TokenProviderProps,
  UseAthleticTokensReturn,
  TailwindIntegration,
  BuildTimeConfig,
  PerformanceConfig
} from './theme';

// Type guards
export {
  isAthleticColorToken,
  isSportsTimingToken
} from './types';

// Theme utilities
export {
  createDefaultThemeConfig
} from './theme';

// Validation utilities
export {
  colorValidator,
  timingValidator,
  developmentValidator,
  contrastUtils,
  ColorValidator,
  TimingValidator,
  DevelopmentValidator
} from './validators';

// Vite plugin
export {
  createTokenPlugin,
  tokenUtils
} from './vite-plugin-tokens';

// Athletic color definitions
export {
  allAthleticColors,
  athleticColors,
  semanticColors,
  neutralColors,
  colorCategories,
  accessibilityReport,
  type AthleticColorName
} from './athletic-colors';

// Sports timing definitions
export {
  allSportsTimings,
  sportsTimingTokens,
  extendedTimingTokens,
  timingByImpact,
  performanceAnalysis,
  athleticEasing,
  type SportsTimingName
} from './sports-timing';

// Complete token system
export {
  athleticDesignTokens,
  generateAthleticCSS,
  generateTailwindConfig,
  ATHLETIC_COLORS,
  SPORTS_TIMING,
  tokenUtils as athleticTokenUtils,
  devHelpers
} from './athletic-tokens';

// Main export (default)
export { default as default } from './athletic-tokens';

/**
 * Version information
 */
export const VERSION = '1.0.0';

/**
 * Athletic Design Token System Metadata
 */
export const ATHLETIC_TOKENS_META = {
  name: 'Athletic Design Token System',
  version: VERSION,
  colors: {
    primary: ['court-navy', 'court-orange', 'brand-violet'],
    semantic: ['success', 'warning', 'error'],
    contexts: ['energy', 'focus', 'power', 'precision', 'neutral']
  },
  timing: {
    values: [90, 120, 160, 220],
    names: ['quick-snap', 'reaction', 'transition', 'sequence'],
    impacts: ['minimal', 'low', 'moderate', 'high']
  },
  accessibility: {
    wcagLevel: 'AAA',
    contrastMinimum: 7.0
  },
  performance: {
    bundleLimit: 85, // KB
    frameTarget: 16   // ms
  }
};