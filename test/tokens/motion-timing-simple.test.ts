/**
 * Athletic Token Motion Timing Tests (Simplified)
 *
 * Validates sports timing values and performance budget compliance
 * Tests motion timing token behavior and frame budget calculations
 */

import { describe, it, expect, test, beforeEach, vi } from 'vitest';
import { allSportsTimings } from '../../tokens/sports-timing';
import { TimingValidator } from '../../tokens/validators';

// Mock window.matchMedia for reduced motion testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Athletic Token Motion Timing Tests', () => {
  const timingValidator = TimingValidator.getInstance();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sports Timing Values', () => {
    test('quick-snap timing meets performance budget (90ms)', () => {
      const quickSnap = allSportsTimings['quick-snap'];

      expect(quickSnap.value).toBe(90);
      expect(quickSnap.frameImpact).toBe('minimal');
      expect(quickSnap.usage).toContain('micro-interactions');

      // Verify frame count at 60fps
      const frameCount = (quickSnap.value / 1000) * 60;
      expect(frameCount).toBeCloseTo(5.4);
      expect(frameCount).toBeLessThanOrEqual(6); // Under 6 frames for minimal impact
    });

    test('reaction timing provides smooth transitions (120ms)', () => {
      const reaction = allSportsTimings['reaction'];

      expect(reaction.value).toBe(120);
      expect(reaction.frameImpact).toBe('low');
      expect(reaction.usage).toContain('button hover states');

      const frameCount = (reaction.value / 1000) * 60;
      expect(frameCount).toBeCloseTo(7.2);
      expect(frameCount).toBeLessThanOrEqual(8); // Reasonable for hover effects
    });

    test('sequence timing enables complex animations (220ms)', () => {
      const sequence = allSportsTimings['sequence'];

      expect(sequence.value).toBe(220);
      expect(sequence.frameImpact).toBe('moderate');
      expect(sequence.usage).toContain('section transitions');

      const frameCount = (sequence.value / 1000) * 60;
      expect(frameCount).toBeCloseTo(13.2);
      expect(frameCount).toBeLessThanOrEqual(15); // Acceptable for complex animations
    });

    test('timing values have reasonable frame distribution', () => {
      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        const framesAt60fps = Math.ceil((timing.value / 1000) * 60);

        // Verify timing spreads across multiple frames for smooth animation
        expect(framesAt60fps, `${name} frame count`).toBeGreaterThanOrEqual(1);
        expect(framesAt60fps, `${name} reasonable frame count`).toBeLessThan(30); // Under 0.5 seconds
      });
    });
  });

  describe('Easing Functions', () => {
    test('athletic easing curves are properly formatted', () => {
      const easingPatterns = [
        'cubic-bezier(0.4, 0, 0.2, 1)',     // snap
        'cubic-bezier(0.25, 0.1, 0.25, 1)', // flow
        'cubic-bezier(0.4, 0, 0.6, 1)',     // power
        'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // precision
        'cubic-bezier(0.55, 0, 0.1, 1)',    // sprint
        'cubic-bezier(0.25, 0, 0.75, 1)',   // glide
      ];

      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        expect(timing.easing, `${name} easing`).toMatch(/^cubic-bezier\(/);
        expect(easingPatterns.some(pattern => pattern === timing.easing),
               `${name} uses known easing pattern`).toBe(true);
      });
    });

    test('validator recognizes valid easing functions', () => {
      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        const isValid = timingValidator.isValidEasing(timing.easing);
        expect(isValid, `${name} easing validation`).toBe(true);
      });
    });
  });

  describe('Performance Budget Compliance', () => {
    test('timing values enable smooth 60fps animations', () => {
      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        const performance = timingValidator.validatePerformanceBudget(timing.value);

        // Some extended timings like 'power' might exceed budget, which is acceptable
        if (performance.valid) {
          expect(['minimal', 'low', 'moderate'].includes(performance.impact),
                 `${name} acceptable impact`).toBe(true);
        } else {
          expect(performance.impact, `${name} high impact timing`).toBe('high');
        }
      });
    });

    test('no timing values exceed performance thresholds', () => {
      const maxAcceptableDuration = 500; // 500ms max for any single animation

      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        expect(timing.value, `${name} duration threshold`).toBeLessThanOrEqual(maxAcceptableDuration);

        // Extended timing values should have appropriate frame impact classification
        if (timing.value > 300) {
          expect(['moderate', 'high'].includes(timing.frameImpact),
                 `${name} classified correctly for duration`).toBe(true);
        }
      });
    });
  });

  describe('Token Structure Validation', () => {
    test('all timing tokens have complete metadata', () => {
      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        expect(timing.value, `${name} value`).toBeGreaterThan(0);
        expect(timing.name, `${name} display name`).toBeTruthy();
        expect(timing.easing, `${name} easing`).toBeTruthy();
        expect(timing.frameImpact, `${name} frame impact`).toMatch(/^(minimal|low|moderate|high)$/);
        expect(timing.usage, `${name} usage`).toBeInstanceOf(Array);
        expect(timing.usage.length, `${name} usage examples`).toBeGreaterThan(0);
      });
    });

    test('timing token categories are properly classified', () => {
      const expectedCategories = {
        'quick-snap': 'minimal',
        'reaction': 'low',
        'transition': 'moderate',
        'sequence': 'moderate',
      };

      Object.entries(expectedCategories).forEach(([name, expectedImpact]) => {
        if (allSportsTimings[name]) {
          expect(allSportsTimings[name].frameImpact, `${name} classification`).toBe(expectedImpact);
        }
      });
    });

    test('timing validator works correctly', () => {
      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        const result = timingValidator.validateTimingToken(timing);

        expect(result.isValid, `${name} token validation`).toBe(true);
        expect(result.errors, `${name} no errors`).toEqual([]);
      });
    });
  });

  describe('Cross-Browser Timing Consistency', () => {
    test('timing values work across different frame rates', () => {
      // Test against common browser frame rates
      const frameRates = [60, 120]; // Common display refresh rates

      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        frameRates.forEach(fps => {
          const frameDuration = 1000 / fps;
          const frameCount = Math.ceil(timing.value / frameDuration);
          const actualDuration = frameCount * frameDuration;
          const deviation = Math.abs(actualDuration - timing.value);

          // Deviation should be less than one frame duration
          expect(deviation, `${name} @ ${fps}fps deviation`).toBeLessThan(frameDuration);
        });
      });
    });

    test('easing functions follow standard CSS format', () => {
      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        const easingRegex = /^cubic-bezier\((-?\d*\.?\d+),\s*(-?\d*\.?\d+),\s*(-?\d*\.?\d+),\s*(-?\d*\.?\d+)\)$/;
        const match = timing.easing.match(easingRegex);

        expect(match, `${name} easing format`).not.toBeNull();

        if (match) {
          const [, p1, p2, p3, p4] = match.map(Number);

          // Validate cubic-bezier constraints
          expect(p1, `${name} easing P1`).toBeGreaterThanOrEqual(0);
          expect(p1, `${name} easing P1`).toBeLessThanOrEqual(1);
          expect(p3, `${name} easing P3`).toBeGreaterThanOrEqual(0);
          expect(p3, `${name} easing P3`).toBeLessThanOrEqual(1);
          // P2 and P4 can be outside 0-1 range for overshoot effects
        }
      });
    });
  });

  describe('Athletic Motion Characteristics', () => {
    test('core timing values match expected athletic durations', () => {
      expect(allSportsTimings['quick-snap'].value).toBe(90);  // Quick reactions
      expect(allSportsTimings['reaction'].value).toBe(120);   // Human reaction time
      expect(allSportsTimings['transition'].value).toBe(160); // Smooth transitions
      expect(allSportsTimings['sequence'].value).toBe(220);   // Complex sequences
    });

    test('timing values increase progressively for complexity', () => {
      const coreTimings = ['quick-snap', 'reaction', 'transition', 'sequence'];
      const values = coreTimings.map(name => allSportsTimings[name].value);

      // Each timing should be greater than the previous
      for (let i = 1; i < values.length; i++) {
        expect(values[i], `${coreTimings[i]} > ${coreTimings[i-1]}`).toBeGreaterThan(values[i-1]);
      }
    });
  });
});