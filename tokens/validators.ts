/**
 * Runtime Type Checking Utilities
 *
 * Validation utilities for athletic design token system
 * providing runtime type guards and development-time validation.
 */

import { getContrast } from 'color2k';
import {
  AthleticColorToken,
  SportsTimingToken,
  TokenValidationResult,
  ContrastValidation
} from './types';

/**
 * Color Token Validation
 * Validates athletic color tokens for WCAG compliance and proper structure
 */
export class ColorValidator {
  private static instance: ColorValidator;

  static getInstance(): ColorValidator {
    if (!ColorValidator.instance) {
      ColorValidator.instance = new ColorValidator();
    }
    return ColorValidator.instance;
  }

  /**
   * Validate hex color format
   */
  isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrastRatio(foreground: string, background: string): number {
    try {
      return getContrast(foreground, background);
    } catch (error) {
      console.warn(`[Athletic Tokens] Error calculating contrast: ${error}`);
      return 0;
    }
  }

  /**
   * Validate WCAG compliance
   */
  validateWCAGCompliance(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AAA'
  ): { valid: boolean; ratio: number; level: 'AAA' | 'AA' | 'fail' } {
    const ratio = this.calculateContrastRatio(foreground, background);
    const threshold = level === 'AAA' ? 7 : 4.5;
    const complianceLevel: 'AAA' | 'AA' | 'fail' = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail';

    return {
      valid: ratio >= threshold,
      ratio,
      level: complianceLevel
    };
  }

  /**
   * Validate athletic color token structure
   */
  validateColorToken(token: unknown): TokenValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!token || typeof token !== 'object') {
      errors.push('Token must be an object');
      return { isValid: false, errors, warnings };
    }

    const colorToken = token as Partial<AthleticColorToken>;

    // Validate required properties
    if (!colorToken.value) {
      errors.push('Color token must have a value property');
    } else if (!this.isValidHexColor(colorToken.value)) {
      errors.push(`Invalid hex color: ${colorToken.value}`);
    }

    if (!colorToken.name) {
      errors.push('Color token must have a name property');
    }

    if (!colorToken.context) {
      errors.push('Color token must have a context property');
    } else {
      const validContexts = ['energy', 'focus', 'power', 'precision', 'neutral'];
      if (!validContexts.includes(colorToken.context)) {
        warnings.push(`Unknown context: ${colorToken.context}`);
      }
    }

    if (!Array.isArray(colorToken.usage)) {
      errors.push('Color token must have a usage array');
    } else if (colorToken.usage.length === 0) {
      warnings.push('Color token has no usage guidelines');
    }

    // Validate contrast ratios if present
    if (colorToken.contrast) {
      if (colorToken.value) {
        const whiteContrast = this.calculateContrastRatio(colorToken.value, '#ffffff');
        const darkContrast = this.calculateContrastRatio(colorToken.value, '#000000');

        if (Math.abs(colorToken.contrast.white - whiteContrast) > 0.5) {
          warnings.push(`Contrast ratio against white may be incorrect: expected ${whiteContrast.toFixed(1)}, got ${colorToken.contrast.white}`);
        }

        if (Math.abs(colorToken.contrast.dark - darkContrast) > 0.5) {
          warnings.push(`Contrast ratio against dark may be incorrect: expected ${darkContrast.toFixed(1)}, got ${colorToken.contrast.dark}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Timing Token Validation
 * Validates sports timing tokens for performance compliance
 */
export class TimingValidator {
  private static instance: TimingValidator;

  static getInstance(): TimingValidator {
    if (!TimingValidator.instance) {
      TimingValidator.instance = new TimingValidator();
    }
    return TimingValidator.instance;
  }

  /**
   * Validate CSS easing function format
   */
  isValidEasing(easing: string): boolean {
    const easingPatterns = [
      /^ease$/,
      /^ease-in$/,
      /^ease-out$/,
      /^ease-in-out$/,
      /^linear$/,
      /^cubic-bezier\(\s*([0-1]\.?\d*),\s*(-?\d+\.?\d*),\s*([0-1]\.?\d*),\s*(-?\d+\.?\d*)\s*\)$/
    ];

    return easingPatterns.some(pattern => pattern.test(easing));
  }

  /**
   * Validate timing value for performance budget
   */
  validatePerformanceBudget(value: number): {
    valid: boolean;
    impact: 'minimal' | 'low' | 'moderate' | 'high';
    recommendation?: string;
  } {
    if (value < 100) {
      return { valid: true, impact: 'minimal' };
    } else if (value < 200) {
      return { valid: true, impact: 'low' };
    } else if (value < 400) {
      return {
        valid: true,
        impact: 'moderate',
        recommendation: 'Consider optimizing for better user experience'
      };
    } else {
      return {
        valid: false,
        impact: 'high',
        recommendation: 'Timing exceeds performance budget. Consider reducing duration.'
      };
    }
  }

  /**
   * Validate sports timing token structure
   */
  validateTimingToken(token: unknown): TokenValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!token || typeof token !== 'object') {
      errors.push('Token must be an object');
      return { isValid: false, errors, warnings };
    }

    const timingToken = token as Partial<SportsTimingToken>;

    // Validate required properties
    if (typeof timingToken.value !== 'number') {
      errors.push('Timing token must have a numeric value');
    } else if (timingToken.value <= 0) {
      errors.push('Timing value must be positive');
    } else {
      const performance = this.validatePerformanceBudget(timingToken.value);
      if (!performance.valid) {
        warnings.push(performance.recommendation || 'Performance budget exceeded');
      }
    }

    if (!timingToken.name) {
      errors.push('Timing token must have a name property');
    }

    if (!timingToken.easing) {
      errors.push('Timing token must have an easing property');
    } else if (!this.isValidEasing(timingToken.easing)) {
      errors.push(`Invalid easing function: ${timingToken.easing}`);
    }

    const validFrameImpacts = ['minimal', 'low', 'moderate', 'high'];
    if (!timingToken.frameImpact || !validFrameImpacts.includes(timingToken.frameImpact)) {
      errors.push('Timing token must have a valid frameImpact');
    }

    if (!Array.isArray(timingToken.usage)) {
      errors.push('Timing token must have a usage array');
    }

    if (!timingToken.description) {
      warnings.push('Timing token missing description for IntelliSense');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Development Mode Token Validator
 * Enhanced validation for development environments
 */
export class DevelopmentValidator {
  private colorValidator: ColorValidator;
  private timingValidator: TimingValidator;
  private usageStats: Map<string, number>;

  constructor() {
    this.colorValidator = ColorValidator.getInstance();
    this.timingValidator = TimingValidator.getInstance();
    this.usageStats = new Map();
  }

  /**
   * Track token usage for development insights
   */
  trackTokenUsage(tokenName: string): void {
    const currentCount = this.usageStats.get(tokenName) || 0;
    this.usageStats.set(tokenName, currentCount + 1);
  }

  /**
   * Get token usage statistics
   */
  getUsageStats(): Array<{ token: string; count: number }> {
    return Array.from(this.usageStats.entries())
      .map(([token, count]) => ({ token, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Validate token usage in development
   */
  validateTokenUsage(
    tokenName: string,
    tokenType: 'color' | 'timing',
    strict: boolean = false
  ): void {
    this.trackTokenUsage(tokenName);

    // Log usage in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Athletic Tokens] Using ${tokenType} token: ${tokenName}`);
    }

    // Warn about unused tokens (in development builds only)
    if (process.env.NODE_ENV === 'development' && this.usageStats.get(tokenName) === 1) {
      console.log(`[Athletic Tokens] First usage of token: ${tokenName}`);
    }
  }

  /**
   * Comprehensive token validation
   */
  validateAllTokens(tokens: {
    colors: Record<string, unknown>;
    timing: Record<string, unknown>;
  }): {
    colors: Record<string, TokenValidationResult>;
    timing: Record<string, TokenValidationResult>;
    summary: {
      totalTokens: number;
      validTokens: number;
      errors: number;
      warnings: number;
    };
  } {
    const colorResults: Record<string, TokenValidationResult> = {};
    const timingResults: Record<string, TokenValidationResult> = {};

    let totalTokens = 0;
    let validTokens = 0;
    let totalErrors = 0;
    let totalWarnings = 0;

    // Validate color tokens
    for (const [name, token] of Object.entries(tokens.colors)) {
      const result = this.colorValidator.validateColorToken(token);
      colorResults[name] = result;
      totalTokens++;
      if (result.isValid) validTokens++;
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    }

    // Validate timing tokens
    for (const [name, token] of Object.entries(tokens.timing)) {
      const result = this.timingValidator.validateTimingToken(token);
      timingResults[name] = result;
      totalTokens++;
      if (result.isValid) validTokens++;
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    }

    return {
      colors: colorResults,
      timing: timingResults,
      summary: {
        totalTokens,
        validTokens,
        errors: totalErrors,
        warnings: totalWarnings
      }
    };
  }
}

/**
 * Contrast Validation Utilities
 * WCAG AAA compliance checking for athletic colors
 */
export const contrastUtils: ContrastValidation = {
  checkContrast(foreground: string, background: string) {
    const validator = ColorValidator.getInstance();
    return validator.validateWCAGCompliance(foreground, background, 'AAA');
  },

  getValidCombinations() {
    // This would typically be generated from all token combinations
    // For now, return empty array as placeholder
    return [];
  }
};

/**
 * Export singleton instances for easy access
 */
export const colorValidator = ColorValidator.getInstance();
export const timingValidator = TimingValidator.getInstance();
export const developmentValidator = new DevelopmentValidator();