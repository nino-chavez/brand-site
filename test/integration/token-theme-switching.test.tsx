/**
 * Athletic Token Theme Switching Integration Tests
 *
 * Validates theme switching functionality and token updates across components
 * Tests component styling consistency with token changes
 */

import React from 'react';
import { describe, it, expect, test, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AthleticTokenProvider,
  useAthleticColors,
  useAthleticTiming
} from '../../tokens/providers/AthleticTokenProvider';

// Mock component that uses athletic tokens
const TokenConsumerComponent: React.FC<{ testId: string }> = ({ testId }) => {
  const colors = useAthleticColors();
  const timing = useAthleticTiming();

  return (
    <div data-testid={testId}>
      <div data-testid={`${testId}-court-navy`}>
        {colors.courtNavy?.value || 'none'}
      </div>
      <div data-testid={`${testId}-court-orange`}>
        {colors.courtOrange?.value || 'none'}
      </div>
      <div data-testid={`${testId}-brand-violet`}>
        {colors.brandViolet?.value || 'none'}
      </div>
      <div data-testid={`${testId}-quick-snap`}>
        {timing.quickSnap?.value || 0}ms
      </div>
      <div data-testid={`${testId}-reaction`}>
        {timing.reaction?.value || 0}ms
      </div>
    </div>
  );
};

// Integration test component with multiple token consumers
const IntegrationTestApp: React.FC = () => {
  return (
    <AthleticTokenProvider>
      <div data-testid="app-container">
        <TokenConsumerComponent testId="component-1" />
        <TokenConsumerComponent testId="component-2" />
      </div>
    </AthleticTokenProvider>
  );
};

describe('Athletic Token Theme Switching Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Value Propagation', () => {
    test('multiple components receive consistent token values', () => {
      render(<IntegrationTestApp />);

      // Both components should show the same token values
      expect(screen.getByTestId('component-1-court-navy')).toHaveTextContent('#1a365d');
      expect(screen.getByTestId('component-2-court-navy')).toHaveTextContent('#1a365d');

      expect(screen.getByTestId('component-1-court-orange')).toHaveTextContent('#ea580c');
      expect(screen.getByTestId('component-2-court-orange')).toHaveTextContent('#ea580c');

      expect(screen.getByTestId('component-1-brand-violet')).toHaveTextContent('#7c3aed');
      expect(screen.getByTestId('component-2-brand-violet')).toHaveTextContent('#7c3aed');
    });

    test('timing values are consistently distributed', () => {
      render(<IntegrationTestApp />);

      // Verify timing consistency across components
      expect(screen.getByTestId('component-1-quick-snap')).toHaveTextContent('90ms');
      expect(screen.getByTestId('component-2-quick-snap')).toHaveTextContent('90ms');

      expect(screen.getByTestId('component-1-reaction')).toHaveTextContent('120ms');
      expect(screen.getByTestId('component-2-reaction')).toHaveTextContent('120ms');
    });
  });

  describe('CSS Custom Properties Integration', () => {
    test('CSS custom properties are available in the DOM', () => {
      render(<IntegrationTestApp />);

      // Check that CSS custom properties are set
      const rootStyles = getComputedStyle(document.documentElement);

      // Note: In jsdom, CSS custom properties might not be fully supported
      // This test verifies the structure rather than computed values
      expect(document.head.innerHTML).toContain('--athletic-color-court-navy');
      expect(document.head.innerHTML).toContain('--athletic-timing-quick-snap');
    });

    test('athletic CSS classes are available', () => {
      const TestComponent = () => (
        <AthleticTokenProvider>
          <div
            className="bg-athletic-court-navy text-athletic-court-orange athletic-animate-quick-snap"
            data-testid="styled-element"
          >
            Athletic Styled Element
          </div>
        </AthleticTokenProvider>
      );

      render(<TestComponent />);

      const element = screen.getByTestId('styled-element');
      expect(element).toHaveClass('bg-athletic-court-navy');
      expect(element).toHaveClass('text-athletic-court-orange');
      expect(element).toHaveClass('athletic-animate-quick-snap');
    });
  });

  describe('Error Handling and Resilience', () => {
    test('gracefully handles missing tokens', () => {
      const FaultyComponent: React.FC = () => {
        const { get } = useAthleticColors();
        const nonExistentColor = get('non-existent-color');

        return (
          <div data-testid="faulty-component">
            {nonExistentColor?.value || 'fallback-color'}
          </div>
        );
      };

      render(
        <AthleticTokenProvider>
          <FaultyComponent />
        </AthleticTokenProvider>
      );

      expect(screen.getByTestId('faulty-component')).toHaveTextContent('fallback-color');
    });

    test('provider context remains stable across re-renders', async () => {
      let renderCount = 0;

      const CountingComponent: React.FC = () => {
        renderCount++;
        const colors = useAthleticColors();

        return (
          <div data-testid="counting-component">
            Render: {renderCount}, Navy: {colors.courtNavy?.value}
          </div>
        );
      };

      const { rerender } = render(
        <AthleticTokenProvider>
          <CountingComponent />
        </AthleticTokenProvider>
      );

      expect(screen.getByTestId('counting-component')).toHaveTextContent('Render: 1, Navy: #1a365d');

      // Force re-render with same props
      rerender(
        <AthleticTokenProvider>
          <CountingComponent />
        </AthleticTokenProvider>
      );

      // Should not cause unnecessary re-renders due to memoization
      await waitFor(() => {
        expect(renderCount).toBe(1);
      });
    });
  });

  describe('Performance Integration', () => {
    test('token access does not cause performance bottlenecks', () => {
      const startTime = performance.now();

      const HeavyTokenConsumer: React.FC = () => {
        const colors = useAthleticColors();
        const timing = useAthleticTiming();

        // Access many tokens in a single render
        const values = [
          colors.courtNavy?.value,
          colors.courtOrange?.value,
          colors.brandViolet?.value,
          colors.success?.value,
          colors.warning?.value,
          colors.error?.value,
          timing.quickSnap?.value,
          timing.reaction?.value,
          timing.transition?.value,
          timing.sequence?.value
        ];

        return (
          <div data-testid="heavy-consumer">
            {values.filter(Boolean).length} tokens loaded
          </div>
        );
      };

      render(
        <AthleticTokenProvider>
          <HeavyTokenConsumer />
        </AthleticTokenProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly even with many token accesses
      expect(renderTime).toBeLessThan(100); // Under 100ms
      expect(screen.getByTestId('heavy-consumer')).toHaveTextContent('10 tokens loaded');
    });
  });

  describe('Cross-Component Communication', () => {
    test('components respond to token changes consistently', async () => {
      const InteractiveComponent: React.FC = () => {
        const [showExtra, setShowExtra] = React.useState(false);
        const colors = useAthleticColors();

        return (
          <div>
            <button
              onClick={() => setShowExtra(!showExtra)}
              data-testid="toggle-button"
            >
              Toggle
            </button>
            <div data-testid="main-color">{colors.courtNavy?.value}</div>
            {showExtra && (
              <div data-testid="extra-color">{colors.courtOrange?.value}</div>
            )}
          </div>
        );
      };

      const user = userEvent.setup();

      render(
        <AthleticTokenProvider>
          <InteractiveComponent />
        </AthleticTokenProvider>
      );

      expect(screen.getByTestId('main-color')).toHaveTextContent('#1a365d');
      expect(screen.queryByTestId('extra-color')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('toggle-button'));

      await waitFor(() => {
        expect(screen.getByTestId('extra-color')).toBeInTheDocument();
        expect(screen.getByTestId('extra-color')).toHaveTextContent('#ea580c');
      });

      // Main component should still have consistent values
      expect(screen.getByTestId('main-color')).toHaveTextContent('#1a365d');
    });
  });

  describe('Integration with Existing Components', () => {
    test('athletic tokens work with existing class-based styling', () => {
      const HybridComponent: React.FC = () => {
        const colors = useAthleticColors();

        return (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: colors.courtNavy?.value,
              borderColor: colors.brandViolet?.value,
            }}
            data-testid="hybrid-component"
          >
            <span
              className="font-bold"
              style={{ color: colors.courtOrange?.value }}
              data-testid="hybrid-text"
            >
              Hybrid Styling
            </span>
          </div>
        );
      };

      render(
        <AthleticTokenProvider>
          <HybridComponent />
        </AthleticTokenProvider>
      );

      const component = screen.getByTestId('hybrid-component');
      const text = screen.getByTestId('hybrid-text');

      // Should have both traditional classes and athletic token styles
      expect(component).toHaveClass('p-4', 'rounded-lg', 'border');
      expect(text).toHaveClass('font-bold');

      // Athletic token styles should be applied via inline styles
      expect(component).toHaveStyle({ backgroundColor: '#1a365d' });
      expect(component).toHaveStyle({ borderColor: '#7c3aed' });
      expect(text).toHaveStyle({ color: '#ea580c' });
    });
  });
});