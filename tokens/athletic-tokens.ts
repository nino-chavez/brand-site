/**
 * Athletic Design Token System
 *
 * Complete implementation of the athletic-inspired design token system
 * with court-navy, court-orange, and brand-violet color palettes
 * and sports-specific motion timing (90ms, 120ms, 160ms, 220ms).
 */

import { allAthleticColors, colorCategories, accessibilityReport } from './athletic-colors';
import { allSportsTimings, timingByImpact, performanceAnalysis } from './sports-timing';
import { ThemeConfiguration, createDefaultThemeConfig } from './theme';
import { AthleticColorToken, SportsTimingToken } from './types';

/**
 * Complete Athletic Design Token System
 * Production-ready token definitions with accessibility and performance metadata
 */
export const athleticDesignTokens = {
  /**
   * Version and Metadata
   */
  version: '1.0.0',
  name: 'Athletic Design Token System',

  /**
   * Color System
   * All athletic colors with contrast ratios and usage guidelines
   */
  colors: {
    ...allAthleticColors
  },

  /**
   * Timing System
   * All sports timing values with performance metadata
   */
  timing: {
    ...allSportsTimings
  },

  /**
   * Theme Configuration
   * Default athletic theme with all tokens
   */
  theme: createDefaultThemeConfig(),

  /**
   * Accessibility Information
   * WCAG compliance data for all colors
   */
  accessibility: accessibilityReport,

  /**
   * Performance Information
   * Frame impact and budget analysis for all timings
   */
  performance: performanceAnalysis,

  /**
   * Categories
   * Organized token groups for easier consumption
   */
  categories: {
    colors: colorCategories,
    timing: timingByImpact
  }
} as const;

/**
 * CSS Custom Properties Generator
 * Generate CSS custom properties from athletic tokens
 */
export function generateAthleticCSS(): string {
  const cssLines: string[] = [
    '/* Athletic Design Token System */',
    '/* Generated CSS Custom Properties */',
    ':root {',
    ''
  ];

  // Color custom properties
  cssLines.push('  /* Athletic Color Palette */');
  Object.entries(allAthleticColors).forEach(([name, color]) => {
    cssLines.push(`  --athletic-color-${name}: ${color.value};`);
    cssLines.push(`  --athletic-color-${name}-contrast-white: ${color.contrast.white};`);
    cssLines.push(`  --athletic-color-${name}-contrast-dark: ${color.contrast.dark};`);
  });

  cssLines.push('');

  // Timing custom properties
  cssLines.push('  /* Athletic Timing System */');
  Object.entries(allSportsTimings).forEach(([name, timing]) => {
    cssLines.push(`  --athletic-timing-${name}: ${timing.value}ms;`);
    cssLines.push(`  --athletic-timing-${name}-easing: ${timing.easing};`);
  });

  cssLines.push('');

  // Utility properties
  cssLines.push('  /* Athletic Utility Properties */');
  cssLines.push('  --athletic-frame-target: 16ms; /* 60fps target */');
  cssLines.push('  --athletic-contrast-minimum: 7; /* WCAG AAA */');
  cssLines.push('  --athletic-bundle-limit: 85KB; /* Performance budget */');

  cssLines.push('}');

  // Reduced motion support
  cssLines.push('');
  cssLines.push('@media (prefers-reduced-motion: reduce) {');
  cssLines.push('  :root {');
  cssLines.push('    /* Reduced motion timing overrides */');
  Object.keys(allSportsTimings).forEach((name) => {
    cssLines.push(`    --athletic-timing-${name}: 0.01ms;`);
  });
  cssLines.push('  }');
  cssLines.push('}');

  return cssLines.join('\n');
}

/**
 * Tailwind Configuration Generator
 * Generate Tailwind config extension for athletic tokens
 */
export function generateTailwindConfig() {
  return {
    extend: {
      colors: Object.entries(allAthleticColors).reduce(
        (acc, [name, color]) => ({
          ...acc,
          [`athletic-${name}`]: color.value
        }),
        {}
      ),

      animation: Object.entries(allSportsTimings).reduce(
        (acc, [name, timing]) => ({
          ...acc,
          [`${name}`]: `${name} ${timing.value}ms ${timing.easing}`
        }),
        {}
      ),

      transitionDuration: Object.entries(allSportsTimings).reduce(
        (acc, [name, timing]) => ({
          ...acc,
          [`${name}`]: `${timing.value}ms`
        }),
        {}
      ),

      transitionTimingFunction: Object.entries(allSportsTimings).reduce(
        (acc, [name, timing]) => ({
          ...acc,
          [`${name}`]: timing.easing
        }),
        {}
      )
    }
  };
}

/**
 * TypeScript Constants Export
 * Strongly-typed constants for programmatic access
 */
export const ATHLETIC_COLORS = allAthleticColors;
export const SPORTS_TIMING = allSportsTimings;

/**
 * Token Access Utilities
 * Runtime utilities for accessing tokens programmatically
 */
export const tokenUtils = {
  /**
   * Get color token by name
   */
  getColor(name: string): AthleticColorToken | null {
    return (allAthleticColors as any)[name] || null;
  },

  /**
   * Get timing token by name
   */
  getTiming(name: string): SportsTimingToken | null {
    return (allSportsTimings as any)[name] || null;
  },

  /**
   * Get CSS custom property name for color
   */
  getColorProperty(name: string): string {
    return `--athletic-color-${name}`;
  },

  /**
   * Get CSS custom property name for timing
   */
  getTimingProperty(name: string): string {
    return `--athletic-timing-${name}`;
  },

  /**
   * Validate color accessibility
   */
  validateColorAccessibility(colorName: string): {
    isAccessible: boolean;
    contrastRatio: number;
    level: 'AAA' | 'AA' | 'fail';
  } {
    const color = this.getColor(colorName);
    if (!color) {
      return { isAccessible: false, contrastRatio: 0, level: 'fail' };
    }

    const ratio = color.contrast.white;
    return {
      isAccessible: ratio >= 7,
      contrastRatio: ratio,
      level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail'
    };
  },

  /**
   * Get performance impact for timing
   */
  getTimingPerformance(timingName: string): {
    frameImpact: string;
    frameCount: number;
    recommendation: string;
  } {
    const timing = this.getTiming(timingName);
    if (!timing) {
      return {
        frameImpact: 'unknown',
        frameCount: 0,
        recommendation: 'Invalid timing token'
      };
    }

    const frameCount = Math.ceil((timing.value / 1000) * 60);
    const recommendations = {
      minimal: 'Safe for frequent use',
      low: 'Good for regular interactions',
      moderate: 'Use thoughtfully',
      high: 'Reserve for special moments'
    };

    return {
      frameImpact: timing.frameImpact,
      frameCount,
      recommendation: recommendations[timing.frameImpact] || 'Use with caution'
    };
  }
};

/**
 * Development Helper Functions
 */
export const devHelpers = {
  /**
   * Log all token information (development only)
   */
  logTokenInfo(): void {
    if (process.env.NODE_ENV !== 'development') return;

    console.group('🏃‍♂️ Athletic Design Token System');
    console.log('Version:', athleticDesignTokens.version);
    console.log('Total Colors:', Object.keys(allAthleticColors).length);
    console.log('Total Timings:', Object.keys(allSportsTimings).length);
    console.log('WCAG AAA Colors:', accessibilityReport.wcagAAA.length);
    console.log('Performance Budget Compliant:',
      performanceAnalysis.budgetCompliance.filter(t => t.compliant).length);
    console.groupEnd();
  },

  /**
   * Generate token usage report
   */
  generateUsageReport(): {
    colors: Array<{ name: string; value: string; accessible: boolean }>;
    timings: Array<{ name: string; value: number; performant: boolean }>;
    summary: {
      totalTokens: number;
      accessibleColors: number;
      performantTimings: number;
    };
  } {
    const colorReport = Object.entries(allAthleticColors).map(([name, color]) => ({
      name,
      value: color.value,
      accessible: color.contrast.white >= 7
    }));

    const timingReport = Object.entries(allSportsTimings).map(([name, timing]) => ({
      name,
      value: timing.value,
      performant: timing.value <= 300
    }));

    return {
      colors: colorReport,
      timings: timingReport,
      summary: {
        totalTokens: colorReport.length + timingReport.length,
        accessibleColors: colorReport.filter(c => c.accessible).length,
        performantTimings: timingReport.filter(t => t.performant).length
      }
    };
  }
};

/**
 * Athletic Design Token System Export
 * Main export for external consumption
 */
export {
  allAthleticColors as colors,
  allSportsTimings as timing,
  generateAthleticCSS as generateCSS,
  generateTailwindConfig as tailwindConfig
};

export default athleticDesignTokens;