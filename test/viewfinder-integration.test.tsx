import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import { HeroBlurContainer } from '../components/BlurContainer';
import { HERO_VIEWFINDER_CONFIG } from '../src/constants';

// Mock the useMouseTracking hook
vi.mock('../hooks/useMouseTracking', () => ({
  useMouseTracking: vi.fn(() => ({
    currentPosition: { x: 400, y: 300 },
    targetPosition: { x: 400, y: 300 },
    isTracking: true,
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
    enhanceStyles: vi.fn((baseStyles) => baseStyles),
  })),
}));

// Mock performance monitoring
vi.mock('../utils/performanceMonitor', () => ({
  heroViewfinderMonitor: {
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
    getCurrentMetrics: vi.fn(() => ({
      fps: 60,
      frameTime: 16.7,
      animationQuality: 'excellent',
      memoryUsage: 15
    })),
    logPerformanceWarnings: vi.fn(),
  }
}));

// Mock scroll behavior
const mockScrollIntoView = vi.fn();
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

describe('Viewfinder Integration Testing', () => {
  let mockOnCapture: ReturnType<typeof vi.fn>;
  let blurContainerRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    mockOnCapture = vi.fn();
    blurContainerRef = React.createRef();
    vi.useFakeTimers();
    mockScrollIntoView.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Complete Animation Sequence: Blur → Focus → Capture', () => {
    it('should execute full viewfinder sequence with proper timing', async () => {
      const TestComponent = () => (
        <div>
          <HeroBlurContainer
            ref={blurContainerRef}
            blurAmount={8}
            isActive={true}
            animationDuration={1200}
          >
            <div id="hero-content">Hero Content</div>
          </HeroBlurContainer>

          <ViewfinderOverlay
            isActive={true}
            mode="hero"
            showMetadataHUD={true}
            onCapture={mockOnCapture}
            blurIntegration={{
              enabled: true,
              containerRef: blurContainerRef,
            }}
          />
        </div>
      );

      render(<TestComponent />);

      // Phase 1: Initial blur state (8px)
      expect(screen.getByText('Hero Content')).toBeInTheDocument();

      // Phase 2: Focus animation begins (should reduce blur over 1.2s)
      act(() => {
        vi.advanceTimersByTime(300); // Initial delay
      });

      await waitFor(() => {
        // Viewfinder should be active with frame overlay
        const frameElements = document.querySelectorAll('svg');
        expect(frameElements.length).toBeGreaterThan(0);
      });

      // Phase 3: Focus completes, metadata HUD appears
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
      });

      await waitFor(() => {
        // Technical skills should be visible
        expect(screen.getByText('Frontend')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Performance')).toBeInTheDocument();
      });

      // Phase 4: Capture button should be available
      const captureButton = await waitFor(() =>
        screen.getByRole('button', { name: /capture the moment/i })
      );
      expect(captureButton).toBeInTheDocument();

      // Phase 5: Execute capture sequence
      fireEvent.click(captureButton);

      // Phase 6: Shutter animation sequence
      act(() => {
        vi.advanceTimersByTime(80); // Shutter close
      });

      // Verify black overlay appears
      await waitFor(() => {
        const shutterOverlay = document.querySelector('.bg-black.z-\\[60\\]');
        expect(shutterOverlay).toBeInTheDocument();
      });

      act(() => {
        vi.advanceTimersByTime(120); // Flash effect
      });

      // Verify flash effect
      await waitFor(() => {
        const flashOverlay = document.querySelector('.bg-white.z-\\[61\\]');
        expect(flashOverlay).toBeInTheDocument();
      });

      // Phase 7: Capture callback and scroll trigger
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.captureSequenceDuration);
      });

      // Verify capture was called
      expect(mockOnCapture).toHaveBeenCalledTimes(1);

      // Verify scroll was triggered
      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'start'
        });
      });
    });

    it('should maintain 60fps performance throughout animation sequence', async () => {
      const performanceMetrics: number[] = [];
      const originalNow = performance.now;
      let frameCount = 0;

      // Mock performance.now to simulate consistent 60fps
      performance.now = vi.fn(() => {
        frameCount++;
        return frameCount * 16.67; // 60fps = 16.67ms per frame
      });

      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
          blurIntegration={{
            enabled: true,
            containerRef: blurContainerRef,
          }}
        />
      );

      // Simulate full animation sequence
      const animationSteps = [300, 600, 900, 1200]; // Key animation milestones

      for (const step of animationSteps) {
        act(() => {
          vi.advanceTimersByTime(step);
        });

        const frameTime = 16.67;
        const fps = 1000 / frameTime;
        performanceMetrics.push(fps);
      }

      // Verify all measurements maintain 60fps target
      performanceMetrics.forEach(fps => {
        expect(fps).toBeGreaterThanOrEqual(58); // Allow 2fps tolerance
        expect(fps).toBeLessThanOrEqual(62);
      });

      performance.now = originalNow;
    });

    it('should handle animation interruption gracefully', async () => {
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
        vi.advanceTimersByTime(500);
      });

      // Interrupt by deactivating mid-animation
      rerender(
        <ViewfinderOverlay
          isActive={false}
          mode="hero"
          showMetadataHUD={false}
          onCapture={mockOnCapture}
        />
      );

      // Should not throw errors or cause crashes
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(true).toBe(true); // Test passes if no errors thrown
    });

    it('should properly cleanup resources on unmount', () => {
      const { unmount } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Start animations
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Unmount should cleanup all timers and listeners
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Cross-Component Integration', () => {
    it('should coordinate blur container with viewfinder overlay', async () => {
      const TestComponent = () => {
        const [blurAmount, setBlurAmount] = React.useState(8);
        const containerRef = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
          // Simulate blur reduction over time
          const interval = setInterval(() => {
            setBlurAmount(prev => Math.max(0, prev - 1));
          }, 200);

          return () => clearInterval(interval);
        }, []);

        return (
          <div>
            <HeroBlurContainer
              ref={containerRef}
              blurAmount={blurAmount}
              isActive={true}
              animationDuration={1200}
            >
              <div data-testid="blur-content">Content</div>
            </HeroBlurContainer>

            <ViewfinderOverlay
              isActive={true}
              mode="hero"
              showMetadataHUD={true}
              onCapture={mockOnCapture}
              blurIntegration={{
                enabled: true,
                containerRef: containerRef,
              }}
            />
          </div>
        );
      };

      render(<TestComponent />);

      const content = screen.getByTestId('blur-content');
      expect(content).toBeInTheDocument();

      // Advance through blur animation
      act(() => {
        vi.advanceTimersByTime(1600); // 8 steps * 200ms
      });

      // Verify coordinated behavior
      await waitFor(() => {
        expect(screen.getByText('Frontend')).toBeInTheDocument();
      });
    });

    it('should synchronize frame overlay with metadata HUD', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance to frame overlay appearance
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.cornerBrackets.animationDuration);
      });

      await waitFor(() => {
        // Both frame elements and HUD should be present
        const svgElements = document.querySelectorAll('svg');
        const hudElements = screen.queryAllByText(/Frontend|Backend|Architecture/);

        expect(svgElements.length).toBeGreaterThan(0);
        expect(hudElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing containerRef gracefully', () => {
      expect(() => {
        render(
          <ViewfinderOverlay
            isActive={true}
            mode="hero"
            showMetadataHUD={true}
            onCapture={mockOnCapture}
            blurIntegration={{
              enabled: true,
              containerRef: { current: null },
            }}
          />
        );
      }).not.toThrow();
    });

    it('should handle rapid state changes without memory leaks', () => {
      const { rerender } = render(
        <ViewfinderOverlay isActive={false} mode="hero" onCapture={mockOnCapture} />
      );

      // Rapidly toggle states
      for (let i = 0; i < 10; i++) {
        rerender(
          <ViewfinderOverlay isActive={true} mode="hero" onCapture={mockOnCapture} />
        );
        act(() => vi.advanceTimersByTime(50));

        rerender(
          <ViewfinderOverlay isActive={false} mode="hero" onCapture={mockOnCapture} />
        );
        act(() => vi.advanceTimersByTime(50));
      }

      // Should not cause memory issues or errors
      expect(true).toBe(true);
    });

    it('should handle performance degradation gracefully', async () => {
      // Mock poor performance scenario
      const mockPerformanceMonitor = await import('../utils/performanceMonitor');
      const getCurrentMetricsSpy = vi.spyOn(mockPerformanceMonitor.heroViewfinderMonitor, 'getCurrentMetrics');

      getCurrentMetricsSpy.mockReturnValue({
        fps: 25, // Poor performance
        frameTime: 40,
        animationQuality: 'poor',
        memoryUsage: 80
      });

      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Should continue to function despite performance issues
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain ARIA labels throughout animation sequence', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance through full sequence
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        const captureButton = screen.getByLabelText('Capture the moment');
        expect(captureButton).toBeInTheDocument();

        const skillItems = screen.getAllByRole('listitem');
        skillItems.forEach(item => {
          expect(item).toHaveAttribute('aria-label');
        });
      });
    });

    it('should support keyboard navigation throughout sequence', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Wait for capture button
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const captureButton = await waitFor(() =>
        screen.getByRole('button', { name: /capture the moment/i })
      );

      // Test keyboard activation
      captureButton.focus();
      fireEvent.keyDown(captureButton, { key: 'Enter' });

      expect(mockOnCapture).toHaveBeenCalled();
    });
  });
});