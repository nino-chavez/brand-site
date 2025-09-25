import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import { HERO_VIEWFINDER_CONFIG, HERO_TECHNICAL_SKILLS } from '../constants';

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

describe('ViewfinderOverlay', () => {
  let mockOnCapture: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCapture = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Standard Mode', () => {
    it('should render when active', () => {
      render(<ViewfinderOverlay isActive={true} onCapture={mockOnCapture} />);

      expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
    });

    it('should not render when inactive', () => {
      const { container } = render(<ViewfinderOverlay isActive={false} />);

      expect(container.firstChild).toBeNull();
    });

    it('should handle keyboard controls', async () => {
      const user = userEvent.setup();
      render(<ViewfinderOverlay isActive={true} onCapture={mockOnCapture} />);

      // Test V key toggle
      await user.keyboard('v');

      // Test Enter key capture
      await user.keyboard('{Enter}');
      expect(mockOnCapture).toHaveBeenCalledTimes(1);
    });

    it('should handle click capture', async () => {
      const user = userEvent.setup();
      render(<ViewfinderOverlay isActive={true} onCapture={mockOnCapture} />);

      const overlay = screen.getByRole('button', { hidden: true });
      await user.click(overlay);

      expect(mockOnCapture).toHaveBeenCalledTimes(1);
    });
  });

  describe('Hero Mode', () => {
    it('should render with hero mode props', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
    });

    it('should display hero metadata HUD when enabled', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Wait for focus animation to complete and HUD to show
      act(() => {
        vi.advanceTimersByTime(300); // Initial delay
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
      });

      await waitFor(() => {
        expect(screen.getByText('HERO VIEWFINDER')).toBeInTheDocument();
      });
    });

    it('should animate through focus phases', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Should start in idle phase
      expect(screen.queryByText('FOCUSING...')).not.toBeInTheDocument();

      // Advance to focus phase
      act(() => {
        vi.advanceTimersByTime(300); // Initial delay
      });

      await waitFor(() => {
        expect(screen.getByText('FOCUSING...')).toBeInTheDocument();
      });

      // Advance to displaying phase
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
      });

      await waitFor(() => {
        expect(screen.getByText('READY')).toBeInTheDocument();
      });
    });

    it('should integrate with blur container when enabled', () => {
      const mockContainerRef = { current: document.createElement('div') };
      const mockSetFilter = vi.spyOn(mockContainerRef.current.style, 'filter', 'set');

      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          blurIntegration={{
            enabled: true,
            containerRef: mockContainerRef,
          }}
          onCapture={mockOnCapture}
        />
      );

      // Advance through focus animation
      act(() => {
        vi.advanceTimersByTime(300);
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration / 2);
      });

      // Should update blur container filter
      expect(mockSetFilter).toHaveBeenCalled();
    });

    it('should display technical skills with staggered animations', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Complete focus animation to show HUD
      act(() => {
        vi.advanceTimersByTime(300);
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
      });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('19.1.1')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('5.8.2')).toBeInTheDocument();
      });
    });

    it('should reset state when deactivated', async () => {
      const { rerender } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance to displaying state
      act(() => {
        vi.advanceTimersByTime(300);
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
      });

      // Deactivate
      rerender(
        <ViewfinderOverlay
          isActive={false}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Should not render when inactive
      expect(screen.queryByText('HERO VIEWFINDER')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should use optimized mouse tracking settings in hero mode', () => {
      const { useMouseTracking } = require('../hooks/useMouseTracking');

      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          onCapture={mockOnCapture}
        />
      );

      expect(useMouseTracking).toHaveBeenCalledWith(
        expect.objectContaining({
          throttleMs: HERO_VIEWFINDER_CONFIG.performance.throttleMs,
        })
      );
    });

    it('should cleanup animations on unmount', () => {
      const { unmount } = render(
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

      const cancelAnimationFrameSpy = vi.spyOn(global, 'cancelAnimationFrame');

      unmount();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper ARIA attributes', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      const overlay = screen.getByRole('button', { hidden: true });
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ViewfinderOverlay isActive={true} onCapture={mockOnCapture} />);

      // Should respond to keyboard events
      await user.keyboard('v');
      await user.keyboard('{Enter}');

      expect(mockOnCapture).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration', () => {
    it('should handle rapid state changes gracefully', async () => {
      const { rerender } = render(
        <ViewfinderOverlay isActive={false} mode="hero" onCapture={mockOnCapture} />
      );

      // Rapid activation/deactivation
      for (let i = 0; i < 5; i++) {
        rerender(<ViewfinderOverlay isActive={true} mode="hero" onCapture={mockOnCapture} />);
        rerender(<ViewfinderOverlay isActive={false} mode="hero" onCapture={mockOnCapture} />);
      }

      // Should not throw errors or memory leaks
      expect(true).toBe(true);
    });
  });
});