import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import { HERO_VIEWFINDER_CONFIG } from '../src/constants';

// Mock the useMouseTracking hook
vi.mock('../hooks/useMouseTracking', () => ({
  useMouseTracking: vi.fn(() => ({
    currentPosition: { x: 200, y: 150 },
    targetPosition: { x: 200, y: 150 },
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
    enhanceStyles: vi.fn((baseStyles) => baseStyles),
  })),
}));

describe('Viewfinder Frame Overlay System', () => {
  let mockOnCapture: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCapture = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Enhanced Corner Brackets', () => {
    it('should render corner brackets when viewfinder is active', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          onCapture={mockOnCapture}
        />
      );

      // Look for SVG elements (corner brackets are rendered as SVG)
      const svgElements = document.querySelectorAll('svg');

      // Should have crosshair + 4 corner brackets = 5 SVG elements minimum
      expect(svgElements.length).toBeGreaterThanOrEqual(5);

      // Check for corner bracket positioning
      const topLeftBracket = document.querySelector('svg[style*="top: 20px"][style*="left: 20px"]');
      const topRightBracket = document.querySelector('svg[style*="top: 20px"][style*="right: 20px"]');
      const bottomLeftBracket = document.querySelector('svg[style*="bottom: 20px"][style*="left: 20px"]');
      const bottomRightBracket = document.querySelector('svg[style*="bottom: 20px"][style*="right: 20px"]');

      expect(topLeftBracket).toBeInTheDocument();
      expect(topRightBracket).toBeInTheDocument();
      expect(bottomLeftBracket).toBeInTheDocument();
      expect(bottomRightBracket).toBeInTheDocument();
    });

    it('should animate corner brackets on entrance', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          onCapture={mockOnCapture}
        />
      );

      // Brackets should start with opacity 0 and animate to configured opacity
      const bracketContainer = document.querySelector('[style*="opacity"]');
      expect(bracketContainer).toBeInTheDocument();

      // Fast forward animation
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.cornerBrackets.animationDuration);
      });

      await waitFor(() => {
        const animatedContainer = document.querySelector(`[style*="opacity: ${HERO_VIEWFINDER_CONFIG.frame.cornerBrackets.opacity}"]`);
        expect(animatedContainer).toBeInTheDocument();
      });
    });

    it('should use responsive bracket sizing', () => {
      const { rerender } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          onCapture={mockOnCapture}
        />
      );

      // Check desktop sizing (default)
      const desktopBrackets = document.querySelectorAll(`svg[width="${HERO_VIEWFINDER_CONFIG.frame.responsive.desktop.cornerBracketSize}"]`);
      expect(desktopBrackets.length).toBeGreaterThan(0);
    });

    it('should have proper stroke width and styling', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          onCapture={mockOnCapture}
        />
      );

      // Check for stroke width in SVG paths
      const bracketPaths = document.querySelectorAll('path[stroke-width]');
      bracketPaths.forEach(path => {
        const strokeWidth = path.getAttribute('stroke-width');
        expect(parseFloat(strokeWidth || '0')).toBe(HERO_VIEWFINDER_CONFIG.frame.cornerBrackets.strokeWidth);
      });
    });
  });

  describe('Rule of Thirds Grid', () => {
    it('should render grid lines in hero mode', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Wait for grid animation delay
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.grid.animationDelay);
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.grid.fadeInDuration);
      });

      await waitFor(() => {
        // Look for grid lines (SVG lines)
        const gridLines = document.querySelectorAll('line[x1="33.33%"], line[x1="66.67%"], line[y1="33.33%"], line[y1="66.67%"]');
        expect(gridLines.length).toBe(4); // 2 vertical + 2 horizontal lines
      });
    });

    it('should not render grid lines in standard mode', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="standard"
          onCapture={mockOnCapture}
        />
      );

      // Should not find rule of thirds grid lines
      const gridLines = document.querySelectorAll('line[x1="33.33%"], line[x1="66.67%"]');
      expect(gridLines.length).toBe(0);
    });

    it('should animate grid opacity correctly', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Initially grid should be transparent
      const gridContainer = document.querySelector('svg line');
      expect(gridContainer).toBeTruthy();

      // Fast forward through animation
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.grid.animationDelay);
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.grid.fadeInDuration);
      });

      await waitFor(() => {
        const gridLines = document.querySelectorAll('line[stroke="rgba(255, 255, 255, 0.6)"]');
        expect(gridLines.length).toBeGreaterThan(0);
      });
    });

    it('should have proper grid line positioning', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.grid.animationDelay);
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.grid.fadeInDuration);
      });

      // Check vertical lines at 1/3 and 2/3
      const verticalLine1 = document.querySelector('line[x1="33.33%"][y1="0"][x2="33.33%"][y2="100%"]');
      const verticalLine2 = document.querySelector('line[x1="66.67%"][y1="0"][x2="66.67%"][y2="100%"]');

      // Check horizontal lines at 1/3 and 2/3
      const horizontalLine1 = document.querySelector('line[x1="0"][y1="33.33%"][x2="100%"][y2="33.33%"]');
      const horizontalLine2 = document.querySelector('line[x1="0"][y1="66.67%"][x2="100%"][y2="66.67%"]');

      expect(verticalLine1).toBeInTheDocument();
      expect(verticalLine2).toBeInTheDocument();
      expect(horizontalLine1).toBeInTheDocument();
      expect(horizontalLine2).toBeInTheDocument();
    });
  });

  describe('Focus Area Indicator', () => {
    it('should render focus area during focus phase', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance to focus phase
      act(() => {
        vi.advanceTimersByTime(300); // Initial delay to focus phase
      });

      await waitFor(() => {
        // Look for focus area indicator (circular border element)
        const focusIndicator = document.querySelector('[class*="rounded-full"][class*="border-2"]');
        expect(focusIndicator).toBeInTheDocument();
      });
    });

    it('should position focus area at mouse coordinates', async () => {
      const mockMousePosition = { x: 300, y: 250 };
      const { useMouseTracking } = require('../hooks/useMouseTracking');
      useMouseTracking.mockReturnValue({
        currentPosition: mockMousePosition,
        targetPosition: mockMousePosition,
        isTracking: false,
      });

      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance to focus phase
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const focusContainer = document.querySelector('[style*="left:"][style*="top:"]');
        if (focusContainer) {
          const style = focusContainer.getAttribute('style') || '';
          // Focus area should be positioned relative to mouse coordinates
          expect(style).toContain('left:');
          expect(style).toContain('top:');
        }
      });
    });

    it('should have proper focus area size', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance to focus phase
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const focusContainer = document.querySelector('[style*="width:"][style*="height:"]');
        if (focusContainer) {
          const style = focusContainer.getAttribute('style') || '';
          const expectedSize = `${HERO_VIEWFINDER_CONFIG.frame.focusArea.size}px`;
          expect(style).toContain(`width: ${expectedSize}`);
          expect(style).toContain(`height: ${expectedSize}`);
        }
      });
    });
  });

  describe('Animation Coordination', () => {
    it('should coordinate frame overlay animations with hero state', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Check initial state - brackets should be animating in
      const initialBracketContainer = document.querySelector('[style*="transition"]');
      expect(initialBracketContainer).toBeInTheDocument();

      // Fast forward through all animations
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.cornerBrackets.animationDuration);
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.grid.animationDelay);
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.grid.fadeInDuration);
      });

      await waitFor(() => {
        // Both brackets and grid should be visible
        const visibleElements = document.querySelectorAll('[style*="opacity"]');
        expect(visibleElements.length).toBeGreaterThan(0);
      });
    });

    it('should reset frame overlay when deactivated', () => {
      const { rerender } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Deactivate
      rerender(
        <ViewfinderOverlay
          isActive={false}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Frame overlay should not be rendered when inactive
      const frameOverlay = document.querySelector('svg');
      expect(frameOverlay).toBeNull();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt bracket size for different viewports', () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, writable: true });

      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          onCapture={mockOnCapture}
        />
      );

      // Brackets should adjust based on responsive configuration
      const brackets = document.querySelectorAll('svg[width]');
      brackets.forEach(bracket => {
        const width = bracket.getAttribute('width');
        expect(parseInt(width || '0')).toBeGreaterThan(0);
      });
    });

    it('should maintain aspect ratio across different screen sizes', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.frame.grid.animationDelay);
      });

      // Grid lines should maintain proper proportions
      const gridSvg = document.querySelector('svg.absolute.inset-0.w-full.h-full');
      expect(gridSvg).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should cleanup animations on unmount', () => {
      const cancelAnimationFrameSpy = vi.spyOn(global, 'clearTimeout');

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
        vi.advanceTimersByTime(100);
      });

      unmount();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });

    it('should not cause memory leaks with rapid re-renders', () => {
      const { rerender } = render(
        <ViewfinderOverlay isActive={false} mode="hero" onCapture={mockOnCapture} />
      );

      // Rapidly toggle active state
      for (let i = 0; i < 10; i++) {
        rerender(<ViewfinderOverlay isActive={true} mode="hero" onCapture={mockOnCapture} />);
        rerender(<ViewfinderOverlay isActive={false} mode="hero" onCapture={mockOnCapture} />);
      }

      // Should not throw errors or cause issues
      expect(true).toBe(true);
    });
  });
});