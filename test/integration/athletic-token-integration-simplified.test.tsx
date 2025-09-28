/**
 * Simplified Athletic Token Integration Tests
 *
 * Focused integration testing for Athletic Design Token system
 * integration with the LightboxCanvas spatial navigation system.
 * Tests core functionality without complex mocking requirements.
 */

import React from 'react';
import { describe, it, expect, test, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AthleticTokenProvider, useAthleticTokens, useAthleticColors, useAthleticTiming } from '../../tokens/simple-provider';
import { CanvasStateProvider } from '../../contexts/CanvasStateProvider';
import { athleticColors, athleticTiming, athleticEasing } from '../../tokens/simple-tokens';
import { athleticTokenOptimizer, useOptimizedAthleticTokens } from '../../services/AthleticTokenOptimizer';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Test component for token integration
const TokenTestComponent: React.FC = () => {
  const tokens = useAthleticTokens();
  const colors = useAthleticColors();
  const timing = useAthleticTiming();

  return (
    <div data-testid="token-test-component">
      <div
        data-testid="court-navy-color"
        style={{ backgroundColor: colors['court-navy'] }}
      >
        Court Navy: {colors['court-navy']}
      </div>
      <div data-testid="timing-value">
        Quick Snap: {timing['quick-snap']}ms
      </div>
      <div data-testid="consistency-check">
        {colors === tokens.colors ? 'consistent' : 'inconsistent'}
      </div>
    </div>
  );
};

// Test component using optimized athletic tokens
const OptimizedTokenComponent: React.FC<{
  priority: number;
  isActive: boolean;
  contentLevel: 'minimal' | 'compact' | 'normal' | 'detailed' | 'expanded';
}> = ({ priority, isActive, contentLevel }) => {
  const optimizedTokens = useOptimizedAthleticTokens(priority, isActive, contentLevel);

  return (
    <AthleticTokenProvider>
      <div
        data-testid="optimized-token-component"
        className={optimizedTokens.athleticClasses}
        data-athletic-classes={optimizedTokens.athleticClasses}
      >
        Optimized Component
      </div>
    </AthleticTokenProvider>
  );
};

describe('Athletic Token Integration - Simplified', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    athleticTokenOptimizer.clearCache();
  });

  describe('Basic Token Provider Integration', () => {
    test('provides athletic token values correctly', async () => {
      render(
        <AthleticTokenProvider>
          <TokenTestComponent />
        </AthleticTokenProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('court-navy-color')).toHaveTextContent('#1a365d');
        expect(screen.getByTestId('timing-value')).toHaveTextContent('90ms');
        expect(screen.getByTestId('consistency-check')).toHaveTextContent('consistent');
      });
    });

    test('token values match expected athletic design system', () => {
      expect(athleticColors['court-navy']).toBe('#1a365d');
      expect(athleticColors['court-orange']).toBe('#ea580c');
      expect(athleticColors['brand-violet']).toBe('#7c3aed');

      expect(athleticTiming['quick-snap']).toBe(90);
      expect(athleticTiming['reaction']).toBe(120);
      expect(athleticTiming['transition']).toBe(160);

      expect(athleticEasing['snap']).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(athleticEasing['flow']).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)');
    });

    test('multiple components get consistent token values', async () => {
      const Component1 = () => {
        const colors = useAthleticColors();
        return <div data-testid="component-1">{colors['court-navy']}</div>;
      };

      const Component2 = () => {
        const colors = useAthleticColors();
        return <div data-testid="component-2">{colors['court-navy']}</div>;
      };

      render(
        <AthleticTokenProvider>
          <Component1 />
          <Component2 />
        </AthleticTokenProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('component-1')).toHaveTextContent('#1a365d');
        expect(screen.getByTestId('component-2')).toHaveTextContent('#1a365d');
      });
    });
  });

  describe('Athletic Token Optimizer Integration', () => {
    test('generates optimized athletic classes', () => {
      render(
        <OptimizedTokenComponent
          priority={1}
          isActive={true}
          contentLevel="normal"
        />
      );

      const component = screen.getByTestId('optimized-token-component');
      const athleticClasses = component.getAttribute('data-athletic-classes');

      expect(athleticClasses).toContain('spatial-section');
      expect(athleticClasses).toContain('absolute');
      expect(athleticClasses).toContain('athletic-animate-transition');
    });

    test('different priorities produce different class combinations', () => {
      const { rerender } = render(
        <OptimizedTokenComponent
          priority={1}
          isActive={false}
          contentLevel="normal"
        />
      );

      const highPriorityClasses = screen.getByTestId('optimized-token-component')
        .getAttribute('data-athletic-classes');

      rerender(
        <OptimizedTokenComponent
          priority={6}
          isActive={false}
          contentLevel="normal"
        />
      );

      const lowPriorityClasses = screen.getByTestId('optimized-token-component')
        .getAttribute('data-athletic-classes');

      expect(highPriorityClasses).not.toBe(lowPriorityClasses);
      expect(highPriorityClasses).toContain('bg-athletic-neutral-900/98');
      expect(lowPriorityClasses).toContain('bg-athletic-neutral-700/85');
    });

    test('active state affects generated classes', () => {
      const { rerender } = render(
        <OptimizedTokenComponent
          priority={2}
          isActive={false}
          contentLevel="normal"
        />
      );

      const inactiveClasses = screen.getByTestId('optimized-token-component')
        .getAttribute('data-athletic-classes');

      rerender(
        <OptimizedTokenComponent
          priority={2}
          isActive={true}
          contentLevel="normal"
        />
      );

      const activeClasses = screen.getByTestId('optimized-token-component')
        .getAttribute('data-athletic-classes');

      expect(activeClasses).toContain('ring-2');
      expect(activeClasses).toContain('ring-athletic-court-orange/50');
      expect(activeClasses).toContain('z-20');

      expect(inactiveClasses).toContain('ring-1');
      expect(inactiveClasses).not.toContain('z-20');
    });

    test('content levels affect generated classes', () => {
      const contentLevels = ['minimal', 'compact', 'normal', 'detailed', 'expanded'] as const;

      contentLevels.forEach(level => {
        const { container } = render(
          <OptimizedTokenComponent
            priority={3}
            isActive={false}
            contentLevel={level}
          />
        );

        const classes = container.querySelector('[data-testid="optimized-token-component"]')
          ?.getAttribute('data-athletic-classes');

        expect(classes).toContain(`content-level-${level}`);

        if (level === 'minimal') {
          expect(classes).toContain('pointer-events-none');
          expect(classes).toContain('opacity-60');
        } else {
          expect(classes).toContain('pointer-events-auto');
        }

        container.remove();
      });
    });
  });

  describe('Token Validation and Optimization', () => {
    test('validates athletic token usage', () => {
      const validClasses = 'bg-athletic-neutral-900 ring-athletic-court-orange text-athletic-neutral-100';
      const validationResult = athleticTokenOptimizer.validateTokenUsage(validClasses);

      expect(validationResult.valid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    test('detects token inconsistencies', () => {
      const inconsistentClasses = 'bg-athletic-neutral-900 text-gray-100 border-red-500';
      const validationResult = athleticTokenOptimizer.validateTokenUsage(inconsistentClasses);

      expect(validationResult.warnings.length).toBeGreaterThan(0);
      expect(validationResult.suggestions.length).toBeGreaterThan(0);
    });

    test('optimizes class strings by removing duplicates', () => {
      const duplicatedClasses = 'bg-athletic-neutral-900 bg-athletic-neutral-900 ring-1 ring-1';
      const optimized = athleticTokenOptimizer.optimizeClassString(duplicatedClasses);

      const optimizedArray = optimized.split(' ');
      const uniqueClasses = new Set(optimizedArray);

      expect(uniqueClasses.size).toBe(optimizedArray.length);
      expect(optimized).toContain('bg-athletic-neutral-900');
      expect(optimized).toContain('ring-1');
    });

    test('provides standard token patterns', () => {
      const patterns = athleticTokenOptimizer.getStandardTokenPatterns();

      expect(patterns.backgrounds).toContain('bg-athletic-neutral-900/98');
      expect(patterns.borders).toContain('ring-athletic-court-orange/50');
      expect(patterns.text).toContain('text-athletic-neutral-100');
      expect(patterns.animations).toContain('athletic-animate-transition');
    });
  });

  describe('Performance and Caching', () => {
    test('token generation uses caching for performance', () => {
      const priority = 1;
      const isActive = true;
      const contentLevel = 'normal' as const;

      // Clear cache first
      athleticTokenOptimizer.clearCache();

      // Generate tokens twice with same parameters
      const result1 = athleticTokenOptimizer.generateAthleticClasses(priority, isActive, contentLevel);
      const result2 = athleticTokenOptimizer.generateAthleticClasses(priority, isActive, contentLevel);

      // Results should be identical
      expect(result1).toBe(result2);

      // Check cache was used
      const metrics = athleticTokenOptimizer.getPerformanceMetrics();
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
    });

    test('cache statistics are tracked correctly', () => {
      athleticTokenOptimizer.clearCache();

      // Generate some tokens
      athleticTokenOptimizer.generateAthleticClasses(1, true, 'normal');
      athleticTokenOptimizer.generateAthleticClasses(2, false, 'compact');
      athleticTokenOptimizer.generateAthleticClasses(1, true, 'normal'); // Should hit cache

      const cacheStats = athleticTokenOptimizer.getCacheStats();

      expect(cacheStats.size).toBeGreaterThan(0);
      expect(cacheStats.hitRate).toBeGreaterThan(0);
      expect(cacheStats.metrics.totalGenerations).toBeGreaterThan(0);
    });

    test('performance metrics are reasonable', () => {
      const startTime = performance.now();

      // Generate multiple token combinations
      for (let i = 0; i < 50; i++) {
        athleticTokenOptimizer.generateAthleticClasses(
          (i % 6) + 1,
          i % 2 === 0,
          ['minimal', 'compact', 'normal', 'detailed', 'expanded'][i % 5] as any
        );
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 50;

      // Performance should be reasonable (< 2ms per generation on average)
      expect(averageTime).toBeLessThan(2);
    });
  });

  describe('Error Handling', () => {
    test('handles invalid priority gracefully', () => {
      const result = athleticTokenOptimizer.generateAthleticClasses(999, true, 'normal');

      // Should fall back to default priority styles
      expect(result).toContain('spatial-section');
      expect(result).toContain('bg-athletic-neutral-700/85'); // Fallback priority
    });

    test('handles invalid content level gracefully', () => {
      // Test that invalid content level throws an error (expected behavior)
      expect(() => {
        athleticTokenOptimizer.generateAthleticClasses(1, true, 'invalid' as any);
      }).toThrow();

      // Test with valid content level still works
      const validResult = athleticTokenOptimizer.generateAthleticClasses(1, true, 'normal');
      expect(validResult).toContain('spatial-section');
      expect(validResult).toContain('absolute');
    });

    test('validates malformed class strings', () => {
      const malformedClasses = '   bg-athletic-neutral-900   ring-1   ';
      const optimized = athleticTokenOptimizer.optimizeClassString(malformedClasses);

      // Should clean up extra spaces
      expect(optimized).not.toMatch(/\s{2,}/); // No multiple spaces
      expect(optimized.trim()).toBe(optimized); // No leading/trailing spaces
      expect(optimized).toContain('bg-athletic-neutral-900');
      expect(optimized).toContain('ring-1');
    });
  });

  describe('Integration Quality Gates', () => {
    test('all required athletic colors are defined', () => {
      const requiredColors = ['court-navy', 'court-orange', 'brand-violet', 'neutral-900', 'neutral-100'];

      requiredColors.forEach(color => {
        expect(athleticColors[color as keyof typeof athleticColors]).toBeDefined();
        expect(typeof athleticColors[color as keyof typeof athleticColors]).toBe('string');
        expect(athleticColors[color as keyof typeof athleticColors]).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    test('all required timing values are defined', () => {
      const requiredTimings = ['quick-snap', 'reaction', 'transition', 'sequence'];

      requiredTimings.forEach(timing => {
        expect(athleticTiming[timing as keyof typeof athleticTiming]).toBeDefined();
        expect(typeof athleticTiming[timing as keyof typeof athleticTiming]).toBe('number');
        expect(athleticTiming[timing as keyof typeof athleticTiming]).toBeGreaterThan(0);
      });
    });

    test('token optimization meets performance requirements', () => {
      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        athleticTokenOptimizer.generateAthleticClasses(
          Math.floor(Math.random() * 6) + 1,
          Math.random() > 0.5,
          ['minimal', 'compact', 'normal', 'detailed', 'expanded'][Math.floor(Math.random() * 5)] as any
        );
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;

      // Performance requirement: < 1ms average per generation
      expect(averageTime).toBeLessThan(1);
    });

    test('memory usage remains stable', () => {
      const initialCacheSize = athleticTokenOptimizer.getCacheStats().size;

      // Generate many different token combinations
      for (let i = 0; i < 500; i++) {
        athleticTokenOptimizer.generateAthleticClasses(
          (i % 6) + 1,
          i % 2 === 0,
          ['minimal', 'compact', 'normal', 'detailed', 'expanded'][i % 5] as any,
          `custom-class-${i % 10}`
        );
      }

      const finalCacheSize = athleticTokenOptimizer.getCacheStats().size;

      // Cache should not grow indefinitely (respects size limits)
      expect(finalCacheSize).toBeLessThan(200); // Within reasonable limits
    });
  });
});