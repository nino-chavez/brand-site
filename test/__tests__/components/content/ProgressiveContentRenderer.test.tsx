/**
 * ProgressiveContentRenderer Component Tests
 *
 * Tests for extracted progressive content disclosure logic from SpatialSection
 * Validates content strategy pattern, preloading, caching, and transition animations
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProgressiveContentRenderer, useProgressiveContent } from '../../../../src/components/content/ProgressiveContentRenderer';
import type { ContentLevel } from '../../../../src/types/canvas';

// Mock the ContentLevelManager
vi.mock('../../../../src/services/ContentLevelManager', () => ({
  useContentLevelManager: () => ({
    getProgressiveStyles: vi.fn((level: ContentLevel, isActive: boolean) => ({
      padding: level === 'minimal' ? '0.5rem' : '1rem',
      transition: 'all 160ms cubic-bezier(0.4, 0, 0.6, 1)',
      willChange: isActive ? 'transform, opacity' : 'auto',
      pointerEvents: level === 'minimal' ? 'none' : 'auto'
    })),
    getContentFeatures: vi.fn((level: ContentLevel) => {
      const features = {
        minimal: ['loading'],
        compact: ['loading', 'title'],
        normal: ['loading', 'title', 'content'],
        detailed: ['loading', 'title', 'content', 'metadata'],
        expanded: ['loading', 'title', 'content', 'metadata', 'enhanced', 'debug']
      };
      return features[level] || [];
    }),
    isInteractivityEnabled: vi.fn((level: ContentLevel) => level !== 'minimal'),
    calculateResponsiveScale: vi.fn((scale: number) => scale * 0.9),
    determineContentLevel: vi.fn((scale: number) => {
      if (scale <= 0.6) return 'minimal';
      if (scale <= 0.8) return 'compact';
      if (scale <= 1.0) return 'normal';
      if (scale <= 1.5) return 'detailed';
      return 'expanded';
    }),
    getCurrentDeviceType: vi.fn(() => 'desktop')
  })
}));

describe('ProgressiveContentRenderer', () => {
  const mockOnContentLoad = vi.fn();

  const defaultProps = {
    contentLevel: 'normal' as ContentLevel,
    isActive: false,
    hasLoadedContent: true,
    children: <div data-testid="test-content">Test Content</div>,
    onContentLoad: mockOnContentLoad
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<ProgressiveContentRenderer {...defaultProps} />);
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should apply correct data attributes', () => {
      const { container } = render(<ProgressiveContentRenderer {...defaultProps} />);
      const renderer = container.firstChild as HTMLElement;

      expect(renderer).toHaveAttribute('data-content-level', 'normal');
      expect(renderer).toHaveAttribute('data-loading-state', 'idle');
      expect(renderer).toHaveAttribute('data-interactive', 'true');
    });

    it('should include progressive content renderer class', () => {
      const { container } = render(<ProgressiveContentRenderer {...defaultProps} />);
      const renderer = container.firstChild as HTMLElement;

      expect(renderer).toHaveClass('progressive-content-renderer');
      expect(renderer).toHaveClass('content-level-normal');
    });
  });

  describe('Content Level Strategies', () => {
    it('should handle minimal content level', () => {
      const { container } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="minimal"
          hasLoadedContent={false}
        />
      );

      expect(container.firstChild).toHaveAttribute('data-content-level', 'minimal');
      expect(container.firstChild).toHaveAttribute('data-interactive', 'false');
    });

    it('should handle compact content level', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="compact"
          metadata={{ title: 'Test Title' }}
        />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should handle detailed content level with metadata', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="detailed"
          metadata={{
            title: 'Test Title',
            description: 'Test Description',
            priority: 1,
            responsiveScale: 1.2
          }}
        />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Priority: 1')).toBeInTheDocument();
      expect(screen.getByText('Scale: 1.20')).toBeInTheDocument();
    });

    it('should handle expanded content level with enhanced features', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="expanded"
        />
      );

      expect(screen.getByText(/Content Level: expanded/)).toBeInTheDocument();
      expect(screen.getByText(/Loading Priority:/)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when content is not loaded', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          hasLoadedContent={false}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading section content')).toBeInTheDocument();
    });

    it('should show content when loaded', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          hasLoadedContent={true}
        />
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should trigger content loading callback', async () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          hasLoadedContent={false}
        />
      );

      await waitFor(() => {
        expect(mockOnContentLoad).toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('should handle loading state transitions', async () => {
      const { container } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          hasLoadedContent={false}
        />
      );

      const renderer = container.firstChild as HTMLElement;

      // Should start as loading
      expect(renderer).toHaveAttribute('data-loading-state', 'loading');

      // Should transition to loaded
      await waitFor(() => {
        expect(renderer).toHaveAttribute('data-loading-state', 'loaded');
      }, { timeout: 500 });
    });
  });

  describe('Active State Handling', () => {
    it('should apply active classes when active', () => {
      const { container } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          isActive={true}
        />
      );

      expect(container.firstChild).toHaveClass('active-section');
    });

    it('should not apply active classes when inactive', () => {
      const { container } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          isActive={false}
        />
      );

      expect(container.firstChild).not.toHaveClass('active-section');
    });
  });

  describe('Debug Mode', () => {
    it('should show debug information when enabled and at expanded level', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="expanded"
          debugMode={true}
        />
      );

      expect(screen.getByText(/Level: expanded/)).toBeInTheDocument();
      expect(screen.getByText(/Loading:/)).toBeInTheDocument();
      expect(screen.getByText(/Transitioning:/)).toBeInTheDocument();
    });

    it('should not show debug information when disabled', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="expanded"
          debugMode={false}
        />
      );

      expect(screen.queryByText(/Level: expanded/)).not.toBeInTheDocument();
    });

    it('should not show debug information at lower content levels', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="normal"
          debugMode={true}
        />
      );

      expect(screen.queryByText(/Level: normal/)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle content loading errors', async () => {
      const { container } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          hasLoadedContent={false}
        />
      );

      const renderer = container.firstChild as HTMLElement;

      // Simulate error
      act(() => {
        const errorEvent = new Event('error');
        renderer.dispatchEvent(errorEvent);
      });

      await waitFor(() => {
        expect(renderer).toHaveAttribute('data-loading-state', 'error');
      });

      expect(screen.getByText('Failed to load content')).toBeInTheDocument();
    });
  });

  describe('Transition Animations', () => {
    it('should handle content level transitions', () => {
      const { container, rerender } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="normal"
        />
      );

      const renderer = container.firstChild as HTMLElement;
      expect(renderer).toHaveAttribute('data-content-level', 'normal');

      // Change content level
      rerender(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="detailed"
        />
      );

      expect(renderer).toHaveAttribute('data-content-level', 'detailed');
    });

    it('should apply transitioning state during animations', async () => {
      const { container, rerender } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="normal"
        />
      );

      const renderer = container.firstChild as HTMLElement;

      // Change content level to trigger transition
      rerender(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="detailed"
        />
      );

      // Should temporarily have transitioning class
      expect(renderer).toHaveClass('transitioning');

      // Should remove transitioning class after timeout
      await waitFor(() => {
        expect(renderer).not.toHaveClass('transitioning');
      }, { timeout: 200 });
    });
  });

  describe('Custom Classes', () => {
    it('should apply custom CSS classes', () => {
      const { container } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          className="custom-class another-class"
        />
      );

      const renderer = container.firstChild as HTMLElement;
      expect(renderer).toHaveClass('custom-class');
      expect(renderer).toHaveClass('another-class');
    });

    it('should combine custom classes with default classes', () => {
      const { container } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          className="custom-class"
        />
      );

      const renderer = container.firstChild as HTMLElement;
      expect(renderer).toHaveClass('progressive-content-renderer');
      expect(renderer).toHaveClass('custom-class');
    });
  });

  describe('Metadata Display', () => {
    it('should display title when provided', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="compact"
          metadata={{ title: 'Section Title' }}
        />
      );

      expect(screen.getByText('Section Title')).toBeInTheDocument();
    });

    it('should not display title when not provided', () => {
      render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="compact"
        />
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should adjust title size based on content level', () => {
      const { container: minimalContainer } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="minimal"
          metadata={{ title: 'Title' }}
        />
      );

      const { container: normalContainer } = render(
        <ProgressiveContentRenderer
          {...defaultProps}
          contentLevel="normal"
          metadata={{ title: 'Title' }}
        />
      );

      const minimalTitle = minimalContainer.querySelector('.section-title');
      const normalTitle = normalContainer.querySelector('.section-title');

      expect(minimalTitle).toHaveClass('text-sm');
      expect(normalTitle).toHaveClass('text-base');
    });
  });
});

describe('useProgressiveContent Hook', () => {
  const TestComponent: React.FC<{ scale: number; deviceType?: 'mobile' | 'tablet' | 'desktop' }> = ({
    scale,
    deviceType
  }) => {
    const {
      contentLevel,
      responsiveScale,
      hasLoadedContent,
      setHasLoadedContent,
      progressiveStyles,
      contentFeatures,
      isInteractive
    } = useProgressiveContent(scale, deviceType);

    return (
      <div data-testid="hook-result">
        <div data-testid="content-level">{contentLevel}</div>
        <div data-testid="responsive-scale">{responsiveScale}</div>
        <div data-testid="has-loaded">{hasLoadedContent.toString()}</div>
        <div data-testid="features">{contentFeatures.join(',')}</div>
        <div data-testid="interactive">{isInteractive.toString()}</div>
        <button onClick={() => setHasLoadedContent(true)}>Load Content</button>
        <div style={progressiveStyles(false)}>Styled Content</div>
      </div>
    );
  };

  it('should provide content level based on scale', () => {
    render(<TestComponent scale={1.2} />);

    expect(screen.getByTestId('content-level')).toHaveTextContent('detailed');
  });

  it('should calculate responsive scale', () => {
    render(<TestComponent scale={1.0} />);

    expect(screen.getByTestId('responsive-scale')).toHaveTextContent('0.9');
  });

  it('should manage loading state', () => {
    render(<TestComponent scale={1.0} />);

    expect(screen.getByTestId('has-loaded')).toHaveTextContent('false');

    // Click to load content
    screen.getByText('Load Content').click();

    expect(screen.getByTestId('has-loaded')).toHaveTextContent('true');
  });

  it('should provide content features', () => {
    render(<TestComponent scale={1.2} />);

    const features = screen.getByTestId('features').textContent;
    expect(features).toContain('title');
    expect(features).toContain('content');
    expect(features).toContain('metadata');
  });

  it('should determine interactivity', () => {
    render(<TestComponent scale={0.5} />); // Minimal level

    expect(screen.getByTestId('interactive')).toHaveTextContent('false');
  });

  it('should handle device type parameter', () => {
    render(<TestComponent scale={1.0} deviceType="mobile" />);

    // Should still work correctly with specified device type
    expect(screen.getByTestId('content-level')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-scale')).toBeInTheDocument();
  });
});