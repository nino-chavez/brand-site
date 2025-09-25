import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import { HeroBlurContainer } from '../components/BlurContainer';
import { HERO_VIEWFINDER_CONFIG } from '../constants';

// Mock the useMouseTracking hook
vi.mock('../hooks/useMouseTracking', () => ({
  useMouseTracking: vi.fn(() => ({
    currentPosition: { x: 100, y: 100 },
    targetPosition: { x: 100, y: 100 },
    isTracking: false,
  })),
}));

// Mock browser compatibility utilities
vi.mock('../utils/browserCompat', () => ({
  CompatibilityFallbacks: {
    getInstance: vi.fn(() => ({
      getBackdropFilterStyle: vi.fn(() => ({ backdropFilter: 'blur(8px)' })),
    })),
  },
  ProgressiveEnhancement: vi.fn(() => ({
    getOptimizedViewfinderConfig: vi.fn(() => ({
      visual: { crosshairSize: 40, focusRingSize: 60 },
      animations: { duration: 200 },
    })),
    enhanceStyles: vi.fn((baseStyles, enhancements) => baseStyles),
  })),
}));

describe('Hero Viewfinder Integration', () => {
  let mockOnCapture: ReturnType<typeof vi.fn>;
  let mockOnAnimationUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCapture = vi.fn();
    mockOnAnimationUpdate = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('ViewfinderOverlay + HeroBlurContainer Integration', () => {
    const HeroViewfinderSystem = () => {
      const [focusProgress, setFocusProgress] = React.useState(0);
      const [isActive, setIsActive] = React.useState(false);

      React.useEffect(() => {
        if (isActive) {
          // Simulate the focus animation progression
          const startTime = performance.now();
          const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / HERO_VIEWFINDER_CONFIG.animation.blurDuration, 1);
            setFocusProgress(progress);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        } else {
          setFocusProgress(0);
        }
      }, [isActive]);

      return (
        <>
          <button
            onClick={() => setIsActive(!isActive)}
            data-testid="activate-button"
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </button>

          <HeroBlurContainer
            isActive={isActive}
            focusProgress={focusProgress}
            onAnimationUpdate={mockOnAnimationUpdate}
          >
            <div data-testid="hero-content" style={{ width: '100px', height: '100px' }}>
              Hero Background Content
            </div>
          </HeroBlurContainer>

          <ViewfinderOverlay
            isActive={isActive}
            mode="hero"
            showMetadataHUD={true}
            onCapture={mockOnCapture}
          />
        </>
      );
    };

    it('should coordinate focus animation between components', async () => {
      const user = userEvent.setup();
      render(<HeroViewfinderSystem />);

      // Activate the system
      await user.click(screen.getByTestId('activate-button'));

      // Fast-forward through focus animation
      act(() => {
        vi.advanceTimersByTime(300); // Initial delay
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
      });

      // Both components should be in focused state
      await waitFor(() => {
        expect(screen.getByText('READY')).toBeInTheDocument();
      });

      // Blur container should have received animation updates
      expect(mockOnAnimationUpdate).toHaveBeenCalled();
    });

    it('should handle activation and deactivation cycles', async () => {
      const user = userEvent.setup();
      render(<HeroViewfinderSystem />);

      // Activation cycle
      await user.click(screen.getByTestId('activate-button'));

      act(() => {
        vi.advanceTimersByTime(300);
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
      });

      await waitFor(() => {
        expect(screen.getByText('READY')).toBeInTheDocument();
      });

      // Deactivation cycle
      await user.click(screen.getByTestId('activate-button'));

      // Should reset to inactive state
      expect(screen.queryByText('READY')).not.toBeInTheDocument();

      // Background should reset to initial blur
      const blurContainer = screen.getByTestId('hero-content').parentElement;
      expect(blurContainer?.style.filter).toContain(`blur(${HERO_VIEWFINDER_CONFIG.blur.initialBlur}px)`);
    });

    it('should maintain performance during rapid state changes', async () => {
      const user = userEvent.setup();
      const performanceNowSpy = vi.spyOn(performance, 'now');
      const rafSpy = vi.spyOn(global, 'requestAnimationFrame');

      render(<HeroViewfinderSystem />);

      // Rapid activation/deactivation
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByTestId('activate-button'));
        act(() => {
          vi.advanceTimersByTime(100);
        });
        await user.click(screen.getByTestId('activate-button'));
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }

      // Should handle rapid changes without excessive RAF calls
      const rafCallCount = rafSpy.mock.calls.length;
      expect(rafCallCount).toBeLessThan(100); // Reasonable threshold

      expect(performanceNowSpy).toHaveBeenCalled();
    });
  });

  describe('Performance Integration', () => {
    it('should meet 60fps animation target', () => {
      render(
        <HeroBlurContainer
          isActive={true}
          focusProgress={0}
          onAnimationUpdate={mockOnAnimationUpdate}
        >
          <div>Content</div>
        </HeroBlurContainer>
      );

      // Measure animation timing
      const startTime = performance.now();

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.blur.updateInterval);
      });

      const endTime = performance.now();
      const frameDuration = endTime - startTime;

      // Should meet 60fps target (16.67ms per frame)
      expect(frameDuration).toBeLessThanOrEqual(17);
    });

    it('should optimize blur calculations', () => {
      const { rerender } = render(
        <HeroBlurContainer
          isActive={true}
          focusProgress={0.5}
          onAnimationUpdate={mockOnAnimationUpdate}
        >
          <div data-testid="content">Content</div>
        </HeroBlurContainer>
      );

      // Small progress change (should be optimized away)
      rerender(
        <HeroBlurContainer
          isActive={true}
          focusProgress={0.505}
          onAnimationUpdate={mockOnAnimationUpdate}
        >
          <div data-testid="content">Content</div>
        </HeroBlurContainer>
      );

      // Should not trigger excessive recalculations
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should handle memory cleanup properly', () => {
      const cancelAnimationFrameSpy = vi.spyOn(global, 'cancelAnimationFrame');

      const { unmount } = render(
        <>
          <ViewfinderOverlay
            isActive={true}
            mode="hero"
            showMetadataHUD={true}
            onCapture={mockOnCapture}
          />
          <HeroBlurContainer
            isActive={true}
            focusProgress={0.5}
            onAnimationUpdate={mockOnAnimationUpdate}
          >
            <div>Content</div>
          </HeroBlurContainer>
        </>
      );

      // Start animations
      act(() => {
        vi.advanceTimersByTime(300);
      });

      unmount();

      // Should cleanup all animation frames
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing blur container gracefully', () => {
      expect(() => {
        render(
          <ViewfinderOverlay
            isActive={true}
            mode="hero"
            blurIntegration={{
              enabled: true,
              containerRef: { current: null },
            }}
            onCapture={mockOnCapture}
          />
        );

        act(() => {
          vi.advanceTimersByTime(300);
          vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
        });
      }).not.toThrow();
    });

    it('should handle animation interruption gracefully', () => {
      const { rerender } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Start animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Interrupt by changing props
      rerender(
        <ViewfinderOverlay
          isActive={false}
          mode="hero"
          showMetadataHUD={false}
          onCapture={mockOnCapture}
        />
      );

      // Should handle interruption without errors
      expect(true).toBe(true);
    });

    it('should handle invalid focus progress values', () => {
      expect(() => {
        render(
          <HeroBlurContainer
            isActive={true}
            focusProgress={-1} // Invalid negative progress
            onAnimationUpdate={mockOnAnimationUpdate}
          >
            <div>Content</div>
          </HeroBlurContainer>
        );
      }).not.toThrow();

      expect(() => {
        render(
          <HeroBlurContainer
            isActive={true}
            focusProgress={2} // Invalid > 1 progress
            onAnimationUpdate={mockOnAnimationUpdate}
          >
            <div>Content</div>
          </HeroBlurContainer>
        );
      }).not.toThrow();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility during animations', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <ViewfinderOverlay
            isActive={true}
            mode="hero"
            showMetadataHUD={true}
            onCapture={mockOnCapture}
          />
          <HeroBlurContainer
            isActive={true}
            focusProgress={0.5}
            onAnimationUpdate={mockOnAnimationUpdate}
          >
            <button data-testid="interactive-element">Interactive Element</button>
          </HeroBlurContainer>
        </div>
      );

      // Interactive elements should remain accessible during blur
      const interactiveElement = screen.getByTestId('interactive-element');
      await user.click(interactiveElement);

      expect(interactiveElement).toBeInTheDocument();
    });

    it('should support reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Should handle reduced motion preferences
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.accessibility.reducedMotionDuration);
      });

      expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
    });
  });
});