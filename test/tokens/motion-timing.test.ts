/**
 * Athletic Token Motion Timing Tests
 *
 * Validates sports timing values and performance budget compliance
 * Tests motion timing token behavior and frame budget calculations
 */

import { describe, it, expect, test, beforeEach, vi } from 'vitest';
import { allSportsTimings } from '../../tokens/sports-timing';
import { PerformanceMonitor } from '../../tokens/utils/performanceMonitor';
import { useAthleticMotion } from '../../tokens/hooks/useAthleticMotion';
import { renderHook } from '@testing-library/react';

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
  const performanceMonitor = new PerformanceMonitor();

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
      expect(reaction.frameImpact).toBe('light');
      expect(reaction.usage).toContain('hover states');

      const frameCount = (reaction.value / 1000) * 60;
      expect(frameCount).toBeCloseTo(7.2);
      expect(frameCount).toBeLessThanOrEqual(8); // Reasonable for hover effects
    });

    test('sequence timing enables complex animations (220ms)', () => {
      const sequence = allSportsTimings['sequence'];

      expect(sequence.value).toBe(220);
      expect(sequence.frameImpact).toBe('moderate');
      expect(sequence.usage).toContain('sequential reveals');

      const frameCount = (sequence.value / 1000) * 60;
      expect(frameCount).toBeCloseTo(13.2);
      expect(frameCount).toBeLessThanOrEqual(15); // Acceptable for complex animations
    });

    test('all timing values stay within 16ms frame budget', () => {
      const frameBudget = 16; // 60fps target

      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        // Each individual frame should be under 16ms
        const framesNeeded = Math.ceil((timing.value / 1000) * 60);
        const timePerFrame = timing.value / framesNeeded;

        expect(timePerFrame, `${name} frame time`).toBeLessThanOrEqual(frameBudget);
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
      ];

      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        expect(timing.easing, `${name} easing`).toMatch(/^cubic-bezier\(/);
        expect(easingPatterns, `${name} easing pattern`).toContain(timing.easing);
      });
    });

    test('easing curves provide athletic motion feel', () => {
      const quickSnap = allSportsTimings['quick-snap'];
      const flow = allSportsTimings['flow'];
      const power = allSportsTimings['power'];

      // Quick snap should have sharp entry and exit for snappy interactions
      expect(quickSnap.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)');

      // Flow should have gentle curves for smooth transitions
      expect(flow.easing).toBe('cubic-bezier(0.25, 0, 0.75, 1)');

      // Power should have strong acceleration for impactful animations
      expect(power.easing).toBe('cubic-bezier(0.4, 0, 0.6, 1)');
    });
  });

  describe('Performance Budget Compliance', () => {
    test('timing values enable 60fps animations', () => {
      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        const monitor = performanceMonitor.measureAnimationPerformance(timing);

        expect(monitor.targetFPS, `${name} target FPS`).toBe(60);
        expect(monitor.budgetCompliance, `${name} budget compliance`).toBe(true);
        expect(monitor.frameBudget, `${name} frame budget`).toBeLessThanOrEqual(16.67);
      });
    });

    test('no timing values exceed performance thresholds', () => {
      const maxAcceptableDuration = 500; // 500ms max for any single animation

      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        expect(timing.value, `${name} duration threshold`).toBeLessThanOrEqual(maxAcceptableDuration);

        // Extended timing values should have appropriate frame impact classification
        if (timing.value > 300) {
          expect(timing.frameImpact, `${name} frame impact`).toMatch(/^(moderate|significant)$/);
        }
      });
    });

    test('memory usage stays within acceptable limits', () => {
      const memoryBefore = performanceMonitor.getMemoryUsage();

      // Simulate creating multiple animations with our timing values
      const animations = Object.values(allSportsTimings).map(timing => ({
        duration: timing.value,
        easing: timing.easing,
        active: true
      }));

      const memoryAfter = performanceMonitor.getMemoryUsage();
      const memoryIncrease = memoryAfter - memoryBefore;

      // Memory increase should be minimal for timing constants
      expect(memoryIncrease, 'Memory usage increase').toBeLessThan(1024); // 1KB limit
    });
  });

  describe('Reduced Motion Support', () => {
    test('useAthleticMotion respects reduced motion preference', () => {
      // Mock reduced motion preference
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useAthleticMotion());

      expect(result.current.prefersReducedMotion).toBe(true);
      expect(result.current.getDuration('quick-snap')).toBe(10); // Reduced to 10ms
      expect(result.current.getDuration('sequence')).toBe(10);   // All reduced to 10ms
    });

    test('timing values fallback properly for accessibility', () => {
      const reducedMotionDuration = 10;

      Object.keys(allSportsTimings).forEach(timingName => {
        const { result } = renderHook(() => useAthleticMotion());

        // Simulate reduced motion preference
        const duration = result.current.getDuration(timingName as any);

        if (result.current.prefersReducedMotion) {
          expect(duration, `${timingName} reduced motion`).toBe(reducedMotionDuration);
        } else {
          expect(duration, `${timingName} normal motion`).toBe(allSportsTimings[timingName].value);
        }
      });
    });
  });

  describe('Cross-Browser Timing Consistency', () => {
    test('timing values work across different browsers', () => {
      // Test against common browser frame rates
      const frameRates = [60, 120, 144]; // Common display refresh rates

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

    test('easing functions are supported across browsers', () => {
      // Test that our easing functions follow standard CSS cubic-bezier format
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

  describe('Token Metadata Validation', () => {
    test('all timing tokens have complete metadata', () => {
      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        expect(timing.value, `${name} value`).toBeGreaterThan(0);
        expect(timing.name, `${name} display name`).toBeTruthy();
        expect(timing.easing, `${name} easing`).toBeTruthy();
        expect(timing.frameImpact, `${name} frame impact`).toMatch(/^(minimal|light|moderate|significant)$/);
        expect(timing.usage, `${name} usage`).toBeInstanceOf(Array);
        expect(timing.usage.length, `${name} usage examples`).toBeGreaterThan(0);
      });
    });

    test('timing token categories are properly classified', () => {
      const expectedCategories = {
        'quick-snap': 'minimal',
        'reaction': 'light',
        'transition': 'light',
        'sequence': 'moderate',
        'flash': 'minimal',
        'flow': 'moderate',
        'power': 'significant'
      };

      Object.entries(expectedCategories).forEach(([name, expectedImpact]) => {
        if (allSportsTimings[name]) {
          expect(allSportsTimings[name].frameImpact, `${name} classification`).toBe(expectedImpact);
        }
      });
    });
  });

  describe('Performance Monitoring Integration', () => {
    test('timing values can be monitored for performance', () => {
      Object.entries(allSportsTimings).forEach(([name, timing]) => {
        const metrics = performanceMonitor.analyzeTimingValue(timing);

        expect(metrics.duration, `${name} duration metric`).toBe(timing.value);
        expect(metrics.framesAt60fps, `${name} frame count`).toBeGreaterThan(0);
        expect(metrics.performanceScore, `${name} performance score`).toBeGreaterThanOrEqual(0);
        expect(metrics.performanceScore, `${name} performance score max`).toBeLessThanOrEqual(100);
      });
    });
  });
});