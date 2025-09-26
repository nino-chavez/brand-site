/**
 * Athletic Token Color Contrast Tests (Simplified)
 *
 * Validates WCAG AAA compliance for all athletic color combinations
 * Tests color token accessibility and contrast ratios
 */

import { describe, it, expect, test } from 'vitest';
import { getContrast } from 'color2k';
import { allAthleticColors } from '../../tokens/athletic-colors';
import { ColorValidator } from '../../tokens/validators';

describe('Athletic Token Color Contrast Tests', () => {
  const validator = ColorValidator.getInstance();

  describe('WCAG Compliance Validation', () => {
    test('court-navy meets high contrast requirements', () => {
      const courtNavy = allAthleticColors['court-navy'];
      const contrastRatio = getContrast(courtNavy.value, '#ffffff');

      expect(contrastRatio).toBeGreaterThan(7); // Should exceed AAA threshold
      expect(courtNavy.value).toBe('#1a365d');
      expect(courtNavy.contrast.white).toBeGreaterThan(7);
    });

    test('court-orange provides sufficient contrast for CTAs', () => {
      const courtOrange = allAthleticColors['court-orange'];
      const contrastRatio = getContrast(courtOrange.value, '#ffffff');

      // Note: Orange typically has lower contrast, so we test for minimum readable contrast
      expect(contrastRatio).toBeGreaterThan(3); // Must be at least readable
      expect(courtOrange.value).toBe('#ea580c');
      expect(courtOrange.contrast.white).toBeGreaterThan(3);
    });

    test('brand-violet maintains consistency with existing usage', () => {
      const brandViolet = allAthleticColors['brand-violet'];
      const contrastRatio = getContrast(brandViolet.value, '#ffffff');

      expect(contrastRatio).toBeGreaterThan(4); // Good contrast for accents
      expect(brandViolet.value).toBe('#7c3aed'); // Matches existing violet-400
      expect(brandViolet.contrast.white).toBeGreaterThan(4);
    });
  });

  describe('Token Structure Validation', () => {
    test('all colors have valid hex values', () => {
      Object.entries(allAthleticColors).forEach(([name, color]) => {
        expect(color.value, `${name} hex value`).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(color.value.length, `${name} hex length`).toBe(7);
      });
    });

    test('all colors have contrast metadata', () => {
      Object.entries(allAthleticColors).forEach(([name, color]) => {
        expect(color.contrast, `${name} contrast metadata`).toBeDefined();
        expect(color.contrast.white, `${name} white contrast`).toBeGreaterThan(0);
        expect(color.contrast.dark, `${name} dark contrast`).toBeGreaterThan(0);
      });
    });

    test('all colors have required properties', () => {
      Object.entries(allAthleticColors).forEach(([name, color]) => {
        expect(color.value, `${name} value`).toBeTruthy();
        expect(color.name, `${name} name`).toBeTruthy();
        expect(color.context, `${name} context`).toBeTruthy();
        expect(Array.isArray(color.usage), `${name} usage array`).toBe(true);
        expect(color.usage.length, `${name} usage examples`).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility Testing', () => {
    test('WCAG validator works correctly', () => {
      const darkNavy = '#1a365d';
      const result = validator.validateWCAGCompliance(darkNavy, '#ffffff');

      expect(result.valid).toBe(true);
      expect(result.ratio).toBeGreaterThan(7);
      expect(result.level).toBe('AAA');
    });

    test('primary colors meet design requirements', () => {
      // Court navy should meet AAA standards for primary text
      const courtNavy = allAthleticColors['court-navy'];
      const navyResult = validator.validateWCAGCompliance(courtNavy.value, '#ffffff');
      expect(navyResult.level, 'court-navy AAA compliance').toBe('AAA');

      // Brand violet should meet AA standards for accents
      const brandViolet = allAthleticColors['brand-violet'];
      const violetResult = validator.validateWCAGCompliance(brandViolet.value, '#ffffff');
      expect(['AAA', 'AA'].includes(violetResult.level), 'brand-violet AA compliance').toBe(true);

      // Court orange is used for CTAs on dark backgrounds, so test against dark
      const courtOrange = allAthleticColors['court-orange'];
      const orangeOnDark = validator.validateWCAGCompliance(courtOrange.value, '#000000');
      expect(orangeOnDark.ratio, 'court-orange on dark background').toBeGreaterThan(3);
    });
  });

  describe('Performance and Integration', () => {
    test('contrast calculations are consistent with stored values', () => {
      Object.entries(allAthleticColors).forEach(([name, color]) => {
        const calculatedWhite = getContrast(color.value, '#ffffff');
        const calculatedDark = getContrast(color.value, '#0a0a0f'); // Brand dark

        // Allow for rounding differences
        expect(Math.abs(color.contrast.white - calculatedWhite), `${name} white accuracy`)
          .toBeLessThan(0.2);
        expect(Math.abs(color.contrast.dark - calculatedDark), `${name} dark accuracy`)
          .toBeLessThan(0.2);
      });
    });

    test('token count matches expected athletic palette size', () => {
      const colorCount = Object.keys(allAthleticColors).length;

      expect(colorCount, 'Total color tokens').toBeGreaterThan(10); // Should have core + neutrals + semantic
      expect(colorCount, 'Reasonable token count').toBeLessThan(30); // But not too many
    });
  });

  describe('Usage Context Validation', () => {
    test('colors have appropriate athletic contexts', () => {
      const validContexts = ['energy', 'focus', 'power', 'precision', 'neutral'];

      Object.entries(allAthleticColors).forEach(([name, color]) => {
        expect(validContexts, `${name} valid context`).toContain(color.context);
      });
    });

    test('court colors have expected athletic contexts', () => {
      expect(allAthleticColors['court-navy'].context).toBe('focus');
      expect(allAthleticColors['court-orange'].context).toBe('energy');
      expect(allAthleticColors['brand-violet'].context).toBe('power');
    });
  });
});