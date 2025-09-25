/**
 * Athletic Theme Configuration
 *
 * Theme configuration interface that matches CSS custom property naming
 * and provides the foundation for the athletic design token system.
 */

import React from 'react';
import { ThemeObject, AthleticColorToken, SportsTimingToken } from './types';

/**
 * Theme Configuration Interface
 * Defines the structure for athletic theme configuration
 */
export interface ThemeConfiguration {
  /** Theme name for identification */
  name: string;
  /** Theme version for cache busting */
  version: string;
  /** Base theme configuration */
  base: ThemeObject;
  /** Optional theme variants (light, dark, high-contrast) */
  variants?: {
    [variantName: string]: Partial<ThemeObject>;
  };
  /** Media query mappings for responsive tokens */
  breakpoints?: {
    [breakpointName: string]: {
      query: string;
      tokens: Partial<ThemeObject>;
    };
  };
}

/**
 * CSS Custom Property Generator Configuration
 */
export interface CSSPropertyConfig {
  /** CSS property prefix (default: --athletic) */
  prefix: string;
  /** Property naming convention */
  namingConvention: 'kebab-case' | 'camelCase';
  /** Include fallback values */
  includeFallbacks: boolean;
  /** Generate scoped properties for components */
  generateScoped: boolean;
}

/**
 * Runtime Theme Context
 * For React Context provider configuration
 */
export interface ThemeContextConfig {
  /** Current theme configuration */
  theme: ThemeConfiguration;
  /** Active variant name */
  activeVariant?: string;
  /** Theme switching function */
  setVariant: (variantName: string) => void;
  /** Token access utilities */
  tokens: {
    colors: Record<string, AthleticColorToken>;
    timing: Record<string, SportsTimingToken>;
  };
  /** Development utilities */
  dev?: {
    logTokenUsage: boolean;
    validateContrast: boolean;
    showWarnings: boolean;
  };
}

/**
 * Token Provider Props
 * Configuration for the AthleticTokenProvider component
 */
export interface TokenProviderProps {
  /** Theme configuration */
  theme: ThemeConfiguration;
  /** Initial variant */
  initialVariant?: string;
  /** Development mode settings */
  developmentMode?: boolean;
  /** Children components */
  children: React.ReactNode;
}

/**
 * Token Hook Return Type
 * Return type for useAthleticTokens hook
 */
export interface UseAthleticTokensReturn {
  /** Get color token by name */
  getColor: (name: string) => AthleticColorToken | null;
  /** Get timing token by name */
  getTiming: (name: string) => SportsTimingToken | null;
  /** Get CSS custom property name */
  getCSSProperty: (category: 'color' | 'timing', name: string) => string;
  /** Current theme configuration */
  theme: ThemeConfiguration;
  /** Active variant */
  variant: string | undefined;
  /** Change theme variant */
  setVariant: (variantName: string) => void;
  /** Validation utilities */
  validate: {
    color: (name: string) => boolean;
    timing: (name: string) => boolean;
  };
}

/**
 * Tailwind Integration Configuration
 * Settings for extending Tailwind with athletic tokens
 */
export interface TailwindIntegration {
  /** Extend Tailwind colors */
  extendColors: boolean;
  /** Generate custom animation utilities */
  generateAnimations: boolean;
  /** Include custom easing functions */
  includeEasing: boolean;
  /** Utility class prefix (default: athletic-) */
  utilityPrefix?: string;
}

/**
 * Build-time Token Processing Configuration
 */
export interface BuildTimeConfig {
  /** Input token definitions */
  input: {
    /** Token definition files */
    tokens: string[];
    /** Theme configuration files */
    themes: string[];
  };
  /** Output configuration */
  output: {
    /** CSS custom properties file */
    cssProperties: string;
    /** TypeScript definitions */
    typeDefinitions: string;
    /** Tailwind configuration */
    tailwindConfig: string;
  };
  /** Processing options */
  options: {
    /** Minify output */
    minify: boolean;
    /** Generate source maps */
    sourceMaps: boolean;
    /** Validate token values */
    validate: boolean;
  };
}

/**
 * Performance Monitoring Configuration
 */
export interface PerformanceConfig {
  /** Monitor token resolution time */
  monitorResolution: boolean;
  /** Track CSS property update performance */
  trackCSSUpdates: boolean;
  /** Bundle size impact tracking */
  trackBundleSize: boolean;
  /** Performance budget thresholds */
  budgets: {
    /** Maximum token resolution time (ms) */
    maxResolutionTime: number;
    /** Maximum CSS update time (ms) */
    maxCSSUpdateTime: number;
    /** Maximum bundle size impact (KB) */
    maxBundleImpact: number;
  };
}

/**
 * Default theme configuration factory
 */
export function createDefaultThemeConfig(): ThemeConfiguration {
  return {
    name: 'athletic-default',
    version: '1.0.0',
    base: {
      colors: {
        athletic: {
          'court-navy': {
            value: '#1a365d',
            name: 'Court Navy',
            contrast: { white: 8.5, dark: 2.1 },
            context: 'focus',
            usage: ['primary brand', 'headers', 'navigation']
          },
          'court-orange': {
            value: '#ea580c',
            name: 'Court Orange',
            contrast: { white: 4.8, dark: 9.2 },
            context: 'energy',
            usage: ['CTAs', 'highlights', 'accents']
          },
          'brand-violet': {
            value: '#7c3aed',
            name: 'Brand Violet',
            contrast: { white: 6.2, dark: 3.4 },
            context: 'power',
            usage: ['sophisticated accents', 'premium features']
          }
        },
        semantic: {
          success: {
            value: '#10b981',
            name: 'Athletic Success',
            contrast: { white: 4.9, dark: 8.8 },
            context: 'precision',
            usage: ['success states', 'confirmations']
          },
          warning: {
            value: '#f59e0b',
            name: 'Athletic Warning',
            contrast: { white: 3.8, dark: 11.2 },
            context: 'energy',
            usage: ['warnings', 'caution states']
          },
          error: {
            value: '#ef4444',
            name: 'Athletic Error',
            contrast: { white: 4.1, dark: 9.9 },
            context: 'power',
            usage: ['errors', 'destructive actions']
          }
        },
        neutrals: {}
      },
      timing: {
        'quick-snap': {
          value: 90,
          name: 'Quick Snap',
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          frameImpact: 'minimal',
          usage: ['micro-interactions', 'checkbox toggles'],
          description: 'Ultra-fast athletic response for immediate feedback'
        },
        'reaction': {
          value: 120,
          name: 'Reaction',
          easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
          frameImpact: 'low',
          usage: ['button presses', 'hover states'],
          description: 'Athletic reaction timing for user interactions'
        },
        'transition': {
          value: 160,
          name: 'Transition',
          easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
          frameImpact: 'moderate',
          usage: ['modal appearances', 'content reveals'],
          description: 'Smooth athletic transition for content changes'
        },
        'sequence': {
          value: 220,
          name: 'Sequence',
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          frameImpact: 'moderate',
          usage: ['section transitions', 'major state changes'],
          description: 'Athletic sequence timing for complex animations'
        }
      },
      cssPrefix: '--athletic'
    }
  };
}