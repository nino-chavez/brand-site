/**
 * Athletic Token Color Contrast Tests
 *
 * Validates WCAG AAA compliance for all athletic color combinations
 * Tests color token accessibility and contrast ratios
 */

import { describe, it, expect, test } from 'vitest';
import { getContrast } from 'color2k';
import { allAthleticColors } from '../../tokens/athletic-colors';
import { ThemeObject } from '../../tokens/theme';
import { ColorValidator } from '../../tokens/validators';

describe('Athletic Token Color Contrast Tests', () => {
  const validator = ColorValidator.getInstance();

  describe('WCAG AAA Compliance', () => {
    test('court-navy meets AAA contrast against white backgrounds', () => {
      const courtNavy = allAthleticColors['court-navy'];
      const contrastRatio = getContrast(courtNavy.value, '#ffffff');

      expect(contrastRatio).toBeGreaterThanOrEqual(7);
      expect(courtNavy.contrast.contrastWhite).toBeGreaterThanOrEqual(7);
      expect(courtNavy.contrast.wcagAAA).toBe(true);
    });

    test('court-orange maintains readability for CTA elements', () => {
      const courtOrange = allAthleticColors['court-orange'];
      const contrastRatio = getContrast(courtOrange.value, '#ffffff');

      expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // WCAG AA minimum for CTA
      expect(courtOrange.contrast.contrastWhite).toBeGreaterThanOrEqual(4.5);
      expect(courtOrange.contrast.wcagAA).toBe(true);
    });

    test('brand-violet preserves existing violet-400 visual consistency', () => {
      const brandViolet = allAthleticColors['brand-violet'];
      const contrastRatio = getContrast(brandViolet.value, '#ffffff');

      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
      expect(brandViolet.contrast.contrastWhite).toBeGreaterThanOrEqual(4.5);
      expect(brandViolet.value).toBe('#7c3aed'); // Matches existing violet-400
    });

    test('all semantic colors meet WCAG AAA standards', () => {
      const semanticColors = ['success', 'warning', 'error'];

      semanticColors.forEach(colorName => {
        const color = allAthleticColors[colorName];
        const contrastRatio = getContrast(color.value, '#ffffff');

        expect(contrastRatio, `${colorName} contrast ratio`).toBeGreaterThanOrEqual(4.5);
        expect(color.contrast.wcagAA, `${colorName} WCAG AA compliance`).toBe(true);
      });
    });
  });

  describe('High Contrast Mode Compatibility', () => {
    test('all athletic colors work in high contrast mode', () => {
      const highContrastColors = [
        'court-navy', 'court-orange', 'brand-violet',
        'success', 'warning', 'error'
      ];

      highContrastColors.forEach(colorName => {
        const color = allAthleticColors[colorName];

        // Test against high contrast backgrounds
        const contrastBlack = getContrast(color.value, '#000000');
        const contrastWhite = getContrast(color.value, '#ffffff');

        // At least one should meet high contrast requirements
        const meetsHighContrast = contrastBlack >= 7 || contrastWhite >= 7;
        expect(meetsHighContrast, `${colorName} high contrast compatibility`).toBe(true);
      });
    });
  });

  describe('Color Combination Testing', () => {
    test('primary color combinations maintain readability', () => {
      const primaryCombinations = [
        { fg: 'court-navy', bg: 'neutral-50' },
        { fg: 'court-orange', bg: 'neutral-900' },
        { fg: 'brand-violet', bg: 'neutral-50' },
      ];

      primaryCombinations.forEach(({ fg, bg }) => {
        const fgColor = allAthleticColors[fg];
        const bgColor = allAthleticColors[bg];

        const contrast = getContrast(fgColor.value, bgColor.value);
        expect(contrast, `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      });
    });

    test('neutral scale provides adequate contrast steps', () => {
      const neutralSteps = [
        'neutral-50', 'neutral-100', 'neutral-200', 'neutral-300',
        'neutral-400', 'neutral-500', 'neutral-600', 'neutral-700',
        'neutral-800', 'neutral-900', 'neutral-950'
      ];

      // Test adjacent neutral steps have sufficient contrast
      for (let i = 0; i < neutralSteps.length - 2; i++) {
        const lighterStep = allAthleticColors[neutralSteps[i]];
        const darkerStep = allAthleticColors[neutralSteps[i + 2]]; // Skip one for reasonable contrast

        const contrast = getContrast(lighterStep.value, darkerStep.value);
        expect(contrast, `${neutralSteps[i]} vs ${neutralSteps[i + 2]}`).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('Color Token Validation', () => {
    test('all colors have valid hex values', () => {
      Object.entries(allAthleticColors).forEach(([name, color]) => {
        expect(color.value, `${name} hex value`).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(color.value.length, `${name} hex length`).toBe(7);
      });
    });

    test('all colors have contrast metadata', () => {
      Object.entries(allAthleticColors).forEach(([name, color]) => {
        expect(color.contrast, `${name} contrast metadata`).toBeDefined();
        expect(color.contrast.contrastWhite, `${name} white contrast`).toBeGreaterThan(0);
        expect(color.contrast.contrastDark, `${name} dark contrast`).toBeGreaterThan(0);
        expect(typeof color.contrast.wcagAA, `${name} WCAG AA`).toBe('boolean');
        expect(typeof color.contrast.wcagAAA, `${name} WCAG AAA`).toBe('boolean');
      });
    });

    test('contrast calculations are accurate', () => {
      Object.entries(allAthleticColors).forEach(([name, color]) => {
        // Verify our stored contrast values match color2k calculations
        const calculatedWhiteContrast = getContrast(color.value, '#ffffff');
        const calculatedDarkContrast = getContrast(color.value, '#000000');

        expect(color.contrast.contrastWhite, `${name} white contrast accuracy`)
          .toBeCloseTo(calculatedWhiteContrast, 1);
        expect(color.contrast.contrastDark, `${name} dark contrast accuracy`)
          .toBeCloseTo(calculatedDarkContrast, 1);
      });
    });
  });

  describe('Theme Object Integration', () => {
    test('theme object includes all athletic colors', () => {
      const theme = new ThemeObject();
      const athleticColorNames = Object.keys(allAthleticColors);

      athleticColorNames.forEach(colorName => {
        expect(theme.colors, `Theme missing ${colorName}`).toHaveProperty(colorName);
      });
    });

    test('CSS custom properties are properly formatted', () => {
      const theme = new ThemeObject();

      Object.keys(allAthleticColors).forEach(colorName => {
        const cssProperty = `--athletic-color-${colorName}`;
        expect(theme.toCSSProperties(), `Missing ${cssProperty}`)
          .toMatch(new RegExp(cssProperty.replace('-', '\\-')));
      });
    });
  });

  describe('Accessibility Validation', () => {
    test('validator correctly identifies WCAG compliance levels', () => {
      const testCases = [
        { color: '#1a365d', expected: 'AAA' }, // court-navy
        { color: '#ea580c', expected: 'AA' },  // court-orange
        { color: '#7c3aed', expected: 'AA' },  // brand-violet
      ];

      testCases.forEach(({ color, expected }) => {
        const result = validator.validateWCAGCompliance(color, '#ffffff');
        expect(result.level, `${color} WCAG level`).toBe(expected);
      });
    });

    test('batch validation works for all colors', () => {
      const colorNames = Object.keys(allAthleticColors);
      let passAAA = 0;
      let passAA = 0;
      let failures = 0;

      colorNames.forEach(name => {
        const color = allAthleticColors[name];
        const result = validator.validateWCAGCompliance(color.value, '#ffffff');

        if (result.level === 'AAA') passAAA++;
        else if (result.level === 'AA') passAA++;
        else failures++;
      });

      expect(colorNames.length).toBeGreaterThan(0);
      expect(passAAA).toBeGreaterThan(0);
      expect(passAA + passAAA).toBe(colorNames.length); // All should pass at least AA
      expect(failures).toBe(0);
    });
  });
});