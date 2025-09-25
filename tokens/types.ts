/**
 * Athletic Design Token Types
 *
 * Type definitions for the athletic-inspired design token system
 * supporting court-navy, court-orange, and brand-violet color palettes
 * with sports-specific motion timing (90ms, 120ms, 160ms, 220ms).
 */

/**
 * Athletic Color Token Interface
 * Defines colors with semantic athletic naming and accessibility metadata
 */
export interface AthleticColorToken {
  /** Primary hex color value */
  value: string;
  /** Human-readable color description */
  name: string;
  /** WCAG contrast ratios against common backgrounds */
  contrast: {
    white: number;
    dark: number;
  };
  /** Athletic context for color usage */
  context: 'energy' | 'focus' | 'power' | 'precision' | 'neutral';
  /** Semantic usage guidelines */
  usage: string[];
}

/**
 * Sports Timing Token Interface
 * Defines motion timing with performance budget metadata
 */
export interface SportsTimingToken {
  /** Timing value in milliseconds */
  value: number;
  /** Athletic timing description (e.g., "Quick Snap", "Athletic Flow") */
  name: string;
  /** CSS easing function for athletic motion feel */
  easing: string;
  /** Performance budget impact */
  frameImpact: 'minimal' | 'low' | 'moderate' | 'high';
  /** Recommended usage contexts */
  usage: string[];
  /** JSDoc description for IntelliSense */
  description: string;
}

/**
 * Theme Object Structure
 * Matches CSS custom property naming convention
 */
export interface ThemeObject {
  colors: {
    athletic: {
      /** Court navy - Primary brand foundation (#1a365d) */
      'court-navy': AthleticColorToken;
      /** Court orange - Energy accent (#ea580c) */
      'court-orange': AthleticColorToken;
      /** Brand violet - Sophisticated accent (#7c3aed) */
      'brand-violet': AthleticColorToken;
    };
    semantic: {
      /** Success states with athletic inspiration */
      success: AthleticColorToken;
      /** Warning states with sports energy */
      warning: AthleticColorToken;
      /** Error states with controlled intensity */
      error: AthleticColorToken;
    };
    neutrals: {
      /** Photography-optimized gray scale */
      [key: string]: AthleticColorToken;
    };
  };
  timing: {
    /** Athletic motion timing system */
    'quick-snap': SportsTimingToken;    // 90ms
    'reaction': SportsTimingToken;      // 120ms
    'transition': SportsTimingToken;    // 160ms
    'sequence': SportsTimingToken;      // 220ms
  };
  /** CSS custom property prefix */
  cssPrefix: string;
}

/**
 * Token Validation Result
 * Runtime validation for token usage
 */
export interface TokenValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Runtime Token Access
 * For programmatic token usage in components
 */
export interface TokenAccess {
  /** Get color token by athletic name */
  getColor(name: string): AthleticColorToken | null;
  /** Get timing token by sports name */
  getTiming(name: string): SportsTimingToken | null;
  /** Validate token usage */
  validate(tokenName: string): TokenValidationResult;
  /** Get CSS custom property name */
  getCSSProperty(category: 'color' | 'timing', name: string): string;
}

/**
 * Development Mode Token Provider
 * Enhanced validation and debugging in development
 */
export interface TokenProviderConfig {
  /** Enable development warnings */
  developmentMode: boolean;
  /** Validate accessibility compliance */
  validateContrast: boolean;
  /** Log token usage statistics */
  logUsage: boolean;
  /** Strict mode throws errors instead of warnings */
  strict: boolean;
}

/**
 * Color Contrast Validation
 * WCAG AAA compliance checking utilities
 */
export interface ContrastValidation {
  /** Check contrast ratio against WCAG standards */
  checkContrast(foreground: string, background: string): {
    ratio: number;
    level: 'AAA' | 'AA' | 'fail';
    valid: boolean;
  };
  /** Get all valid color combinations */
  getValidCombinations(): Array<{
    foreground: string;
    background: string;
    ratio: number;
  }>;
}

/**
 * Bundle Size Impact Tracking
 * Monitor token system impact on bundle size
 */
export interface BundleImpact {
  /** Token definitions size */
  tokenDefinitions: number;
  /** CSS custom properties size */
  cssProperties: number;
  /** TypeScript definitions size */
  typeDefinitions: number;
  /** Total impact */
  total: number;
}

/**
 * Type Guards for Runtime Validation
 * Ensure type safety at runtime
 */
export function isAthleticColorToken(token: unknown): token is AthleticColorToken {
  return (
    typeof token === 'object' &&
    token !== null &&
    typeof (token as AthleticColorToken).value === 'string' &&
    typeof (token as AthleticColorToken).name === 'string' &&
    typeof (token as AthleticColorToken).context === 'string' &&
    Array.isArray((token as AthleticColorToken).usage)
  );
}

export function isSportsTimingToken(token: unknown): token is SportsTimingToken {
  return (
    typeof token === 'object' &&
    token !== null &&
    typeof (token as SportsTimingToken).value === 'number' &&
    typeof (token as SportsTimingToken).name === 'string' &&
    typeof (token as SportsTimingToken).easing === 'string' &&
    typeof (token as SportsTimingToken).frameImpact === 'string'
  );
}