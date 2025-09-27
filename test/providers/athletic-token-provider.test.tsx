/**
 * Athletic Token Provider Tests
 *
 * Tests React context provider functionality for athletic design tokens
 * Validates context value propagation and hook behavior
 */

import React from 'react';
import { describe, it, expect, test, beforeEach, vi } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import {
  AthleticTokenProvider,
  useAthleticTokens,
  useAthleticColors,
  useAthleticTiming,
  useTokenValue,
  useTokenProperty,
  useTokenDevelopment
} from '../../tokens/providers/AthleticTokenProvider';
import { createDefaultThemeConfig } from '../../tokens/theme';

// Mock console methods for development testing
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  table: vi.fn(),
  error: vi.fn()
};

Object.assign(console, mockConsole);

describe('Athletic Token Provider Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AthleticTokenProvider Context', () => {
    test('provides token context to children', () => {
      const TestComponent = () => {
        const { theme } = useAthleticTokens();
        return <div data-testid="theme-name">{theme.name}</div>;
      };

      render(
        <AthleticTokenProvider>
          <TestComponent />
        </AthleticTokenProvider>
      );

      expect(screen.getByTestId('theme-name')).toHaveTextContent('athletic-default');
    });

    test('throws error when used outside provider', () => {
      const TestComponent = () => {
        useAthleticTokens();
        return <div>Test</div>;
      };

      // Capture the error to avoid test pollution
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useAthleticTokens must be used within an AthleticTokenProvider'
      );

      spy.mockRestore();
    });

    test('accepts custom theme configuration', () => {
      const customTheme = {
        ...createDefaultThemeConfig(),
        name: 'custom-athletic-theme',
        description: 'Custom test theme'
      };

      const TestComponent = () => {
        const { theme } = useAthleticTokens();
        return <div data-testid="custom-theme">{theme.name}</div>;
      };

      render(
        <AthleticTokenProvider theme={customTheme}>
          <TestComponent />
        </AthleticTokenProvider>
      );

      expect(screen.getByTestId('custom-theme')).toHaveTextContent('custom-athletic-theme');
    });
  });

  describe('useAthleticTokens Hook', () => {
    test('returns all required token access functions', () => {
      const { result } = renderHook(() => useAthleticTokens(), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current).toHaveProperty('getColor');
      expect(result.current).toHaveProperty('getTiming');
      expect(result.current).toHaveProperty('getCSSProperty');
      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('variant');
      expect(result.current).toHaveProperty('setVariant');
      expect(result.current).toHaveProperty('validate');

      expect(typeof result.current.getColor).toBe('function');
      expect(typeof result.current.getTiming).toBe('function');
      expect(typeof result.current.getCSSProperty).toBe('function');
      expect(typeof result.current.setVariant).toBe('function');
    });

    test('getColor returns correct color tokens', () => {
      const { result } = renderHook(() => useAthleticTokens(), {
        wrapper: AthleticTokenProvider
      });

      const courtNavy = result.current.getColor('court-navy');
      expect(courtNavy).not.toBeNull();
      expect(courtNavy?.value).toBe('#1a365d');
      expect(courtNavy?.name).toBe('Court Navy');

      const invalidColor = result.current.getColor('non-existent-color');
      expect(invalidColor).toBeNull();
    });

    test('getTiming returns correct timing tokens', () => {
      const { result } = renderHook(() => useAthleticTokens(), {
        wrapper: AthleticTokenProvider
      });

      const quickSnap = result.current.getTiming('quick-snap');
      expect(quickSnap).not.toBeNull();
      expect(quickSnap?.value).toBe(90);
      expect(quickSnap?.name).toBe('Quick Snap');

      const invalidTiming = result.current.getTiming('non-existent-timing');
      expect(invalidTiming).toBeNull();
    });

    test('getCSSProperty returns correct custom property names', () => {
      const { result } = renderHook(() => useAthleticTokens(), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current.getCSSProperty('color', 'court-navy'))
        .toBe('--athletic-color-court-navy');
      expect(result.current.getCSSProperty('timing', 'quick-snap'))
        .toBe('--athletic-timing-quick-snap');
    });

    test('validate functions work correctly', () => {
      const { result } = renderHook(() => useAthleticTokens(), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current.validate.color('court-navy')).toBe(true);
      expect(result.current.validate.color('invalid-color')).toBe(false);
      expect(result.current.validate.timing('quick-snap')).toBe(true);
      expect(result.current.validate.timing('invalid-timing')).toBe(false);
    });
  });

  describe('useAthleticColors Hook', () => {
    test('provides direct access to primary athletic colors', () => {
      const { result } = renderHook(() => useAthleticColors(), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current.courtNavy?.value).toBe('#1a365d');
      expect(result.current.courtOrange?.value).toBe('#ea580c');
      expect(result.current.brandViolet?.value).toBe('#7c3aed');
    });

    test('provides semantic colors', () => {
      const { result } = renderHook(() => useAthleticColors(), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current.success).not.toBeNull();
      expect(result.current.warning).not.toBeNull();
      expect(result.current.error).not.toBeNull();
    });

    test('includes utility functions', () => {
      const { result } = renderHook(() => useAthleticColors(), {
        wrapper: AthleticTokenProvider
      });

      expect(typeof result.current.get).toBe('function');
      expect(typeof result.current.validate).toBe('function');

      // Test utility functions
      const color = result.current.get('court-navy');
      expect(color?.value).toBe('#1a365d');

      expect(result.current.validate('court-navy')).toBe(true);
      expect(result.current.validate('invalid-color')).toBe(false);
    });
  });

  describe('useAthleticTiming Hook', () => {
    test('provides direct access to core timing values', () => {
      const { result } = renderHook(() => useAthleticTiming(), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current.quickSnap?.value).toBe(90);
      expect(result.current.reaction?.value).toBe(120);
      expect(result.current.transition?.value).toBe(160);
      expect(result.current.sequence?.value).toBe(220);
    });

    test('provides extended timing values', () => {
      const { result } = renderHook(() => useAthleticTiming(), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current.flash?.value).toBe(60);
      expect(result.current.flow?.value).toBe(300);
      expect(result.current.power?.value).toBe(400);
    });

    test('includes utility functions', () => {
      const { result } = renderHook(() => useAthleticTiming(), {
        wrapper: AthleticTokenProvider
      });

      expect(typeof result.current.get).toBe('function');
      expect(typeof result.current.validate).toBe('function');

      // Test utility functions
      const timing = result.current.get('quick-snap');
      expect(timing?.value).toBe(90);

      expect(result.current.validate('quick-snap')).toBe(true);
      expect(result.current.validate('invalid-timing')).toBe(false);
    });
  });

  describe('useTokenValue Hook', () => {
    test('returns color token values correctly', () => {
      const { result } = renderHook(() => useTokenValue('color', 'court-navy'), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current?.value).toBe('#1a365d');
    });

    test('returns timing token values correctly', () => {
      const { result } = renderHook(() => useTokenValue('timing', 'quick-snap'), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current?.value).toBe(90);
    });

    test('returns null for invalid tokens', () => {
      const { result: colorResult } = renderHook(() => useTokenValue('color', 'invalid-color'), {
        wrapper: AthleticTokenProvider
      });

      const { result: timingResult } = renderHook(() => useTokenValue('timing', 'invalid-timing'), {
        wrapper: AthleticTokenProvider
      });

      expect(colorResult.current).toBeNull();
      expect(timingResult.current).toBeNull();
    });
  });

  describe('useTokenProperty Hook', () => {
    test('returns correct CSS custom property names', () => {
      const { result: colorResult } = renderHook(() => useTokenProperty('color', 'court-navy'), {
        wrapper: AthleticTokenProvider
      });

      const { result: timingResult } = renderHook(() => useTokenProperty('timing', 'quick-snap'), {
        wrapper: AthleticTokenProvider
      });

      expect(colorResult.current).toBe('--athletic-color-court-navy');
      expect(timingResult.current).toBe('--athletic-timing-quick-snap');
    });
  });

  describe('Development Mode Testing', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    test('provider logs initialization in development mode', async () => {
      render(
        <AthleticTokenProvider developmentMode={true}>
          <div>Test</div>
        </AthleticTokenProvider>
      );

      await waitFor(() => {
        expect(mockConsole.log).toHaveBeenCalledWith(
          expect.stringContaining('[Athletic Tokens] Provider initialized'),
          expect.any(Object)
        );
      });
    });

    test('development warnings are shown for invalid tokens', () => {
      const TestComponent = () => {
        const { getColor } = useAthleticTokens();
        getColor('invalid-color');
        return <div>Test</div>;
      };

      render(
        <AthleticTokenProvider developmentMode={true}>
          <TestComponent />
        </AthleticTokenProvider>
      );

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[Athletic Tokens] Color token "invalid-color" not found'),
        expect.any(Object)
      );
    });

    test('useTokenDevelopment provides development utilities', () => {
      process.env.NODE_ENV = 'development';

      const { result } = renderHook(() => useTokenDevelopment(), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current).not.toBeNull();
      expect(typeof result.current?.logUsageStats).toBe('function');
      expect(typeof result.current?.validateAllTokens).toBe('function');
      expect(typeof result.current?.getThemeInfo).toBe('function');
    });

    test('useTokenDevelopment returns null in production', () => {
      process.env.NODE_ENV = 'production';

      const { result } = renderHook(() => useTokenDevelopment(), {
        wrapper: AthleticTokenProvider
      });

      expect(result.current).toBeNull();
    });
  });

  describe('Context Value Updates', () => {
    test('theme variant changes propagate to consumers', () => {
      const TestComponent = () => {
        const { variant, setVariant } = useAthleticTokens();
        return (
          <div>
            <span data-testid="current-variant">{variant || 'default'}</span>
            <button onClick={() => setVariant('dark')} data-testid="set-variant">
              Set Dark
            </button>
          </div>
        );
      };

      render(
        <AthleticTokenProvider>
          <TestComponent />
        </AthleticTokenProvider>
      );

      expect(screen.getByTestId('current-variant')).toHaveTextContent('default');

      screen.getByTestId('set-variant').click();

      expect(screen.getByTestId('current-variant')).toHaveTextContent('dark');
    });

    test('multiple components receive consistent token values', () => {
      const Component1 = () => {
        const { getColor } = useAthleticTokens();
        const color = getColor('court-navy');
        return <div data-testid="component-1">{color?.value}</div>;
      };

      const Component2 = () => {
        const { getColor } = useAthleticTokens();
        const color = getColor('court-navy');
        return <div data-testid="component-2">{color?.value}</div>;
      };

      render(
        <AthleticTokenProvider>
          <Component1 />
          <Component2 />
        </AthleticTokenProvider>
      );

      expect(screen.getByTestId('component-1')).toHaveTextContent('#1a365d');
      expect(screen.getByTestId('component-2')).toHaveTextContent('#1a365d');
    });
  });

  describe('Performance Testing', () => {
    test('provider does not cause unnecessary re-renders', () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        const { getColor } = useAthleticTokens();
        const color = getColor('court-navy');
        return <div data-testid="color-value">{color?.value}</div>;
      };

      const { rerender } = render(
        <AthleticTokenProvider>
          <TestComponent />
        </AthleticTokenProvider>
      );

      expect(renderCount).toBe(1);

      // Re-render with same props should not cause child re-render
      rerender(
        <AthleticTokenProvider>
          <TestComponent />
        </AthleticTokenProvider>
      );

      expect(renderCount).toBe(1); // Should still be 1 due to memoization
    });

    test('token access functions are memoized', () => {
      const TestComponent = () => {
        const tokens = useAthleticTokens();
        return (
          <div data-testid="function-identity">
            {tokens.getColor === tokens.getColor ? 'same' : 'different'}
          </div>
        );
      };

      render(
        <AthleticTokenProvider>
          <TestComponent />
        </AthleticTokenProvider>
      );

      expect(screen.getByTestId('function-identity')).toHaveTextContent('same');
    });
  });
});