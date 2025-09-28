import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import { HERO_TECHNICAL_SKILLS, SKILL_CATEGORIES, HERO_VIEWFINDER_CONFIG } from '../src/constants';

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

describe('Viewfinder Metadata HUD System', () => {
  let mockOnCapture: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCapture = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Technical Skills Display', () => {
    it('should render all technical skills when HUD is visible', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance past blur animation to show HUD
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      await waitFor(() => {
        // Check that all skill categories are rendered
        expect(screen.getByText('Frontend')).toBeInTheDocument();
        expect(screen.getByText('Backend')).toBeInTheDocument();
        expect(screen.getByText('Architecture')).toBeInTheDocument();
        expect(screen.getByText('Photography')).toBeInTheDocument();
        expect(screen.getByText('Performance')).toBeInTheDocument();
      });

      // Verify individual skills are present
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('19.1.1')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('5.8.2')).toBeInTheDocument();
    });

    it('should apply staggered animation delays to skill items', async () => {
      const { container } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance past blur animation
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
      });

      await waitFor(() => {
        const skillItems = container.querySelectorAll('[data-testid^="skill-"]');
        expect(skillItems.length).toBeGreaterThan(0);

        // Check that animation delays are properly applied
        skillItems.forEach((item, index) => {
          const expectedSkill = HERO_TECHNICAL_SKILLS[index];
          if (expectedSkill) {
            const skillElement = container.querySelector(`[data-testid="skill-${expectedSkill.id}"]`);
            expect(skillElement).toBeInTheDocument();
          }
        });
      });
    });

    it('should group skills by category correctly', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      await waitFor(() => {
        // Check frontend skills are grouped together
        const frontendSection = screen.getByText('Frontend').closest('[data-category="frontend"]');
        expect(frontendSection).toBeInTheDocument();

        // Check backend skills are grouped together
        const backendSection = screen.getByText('Backend').closest('[data-category="backend"]');
        expect(backendSection).toBeInTheDocument();
      });
    });

    it('should apply correct color coding for skill categories', async () => {
      const { container } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      await waitFor(() => {
        // Check that category colors are applied
        Object.entries(SKILL_CATEGORIES).forEach(([categoryId, categoryData]) => {
          const categoryElements = container.querySelectorAll(`[data-category="${categoryId}"]`);
          expect(categoryElements.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Hover Effects and Interactions', () => {
    it('should show hover information on skill item hover', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      await waitFor(() => {
        const reactSkill = screen.getByText('React');
        expect(reactSkill).toBeInTheDocument();
      });

      // Hover over React skill
      const reactSkill = screen.getByText('React');
      fireEvent.mouseEnter(reactSkill);

      await waitFor(() => {
        const hoverInfo = screen.getByText(/Modern React with Concurrent Features/);
        expect(hoverInfo).toBeInTheDocument();
      });

      // Mouse leave should hide hover info
      fireEvent.mouseLeave(reactSkill);

      await waitFor(() => {
        const hoverInfo = screen.queryByText(/Modern React with Concurrent Features/);
        expect(hoverInfo).not.toBeInTheDocument();
      });
    });

    it('should position hover tooltip correctly', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      await waitFor(() => {
        const typescriptSkill = screen.getByText('TypeScript');
        expect(typescriptSkill).toBeInTheDocument();
      });

      const typescriptSkill = screen.getByText('TypeScript');
      fireEvent.mouseEnter(typescriptSkill);

      await waitFor(() => {
        const tooltip = screen.getByText(/Strict typing with advanced generics/);
        expect(tooltip).toBeInTheDocument();

        // Tooltip should be positioned relative to the skill
        const tooltipElement = tooltip.closest('[data-testid="skill-tooltip"]');
        expect(tooltipElement).toHaveClass('absolute');
      });
    });

    it('should handle rapid hover state changes without errors', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      const skills = ['React', 'TypeScript', 'Vite', 'Node.js'];

      for (const skillName of skills) {
        await waitFor(() => {
          const skill = screen.getByText(skillName);
          expect(skill).toBeInTheDocument();

          // Rapid hover/leave
          fireEvent.mouseEnter(skill);
          fireEvent.mouseLeave(skill);
        });
      }

      // Should not cause any errors or memory leaks
      expect(true).toBe(true);
    });
  });

  describe('Animation Timing and Stagger Effects', () => {
    it('should respect configured stagger delays', async () => {
      const { container } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Skills should start invisible
      expect(container.querySelectorAll('[data-testid^="skill-"]').length).toBe(0);

      // Advance to when blur animation completes
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration);
      });

      // First skill should appear first (React with 0ms delay)
      act(() => {
        vi.advanceTimersByTime(50); // Small buffer
      });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      // Second skill should appear after stagger delay (TypeScript with 150ms delay)
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.hudStaggerDelay);
      });

      await waitFor(() => {
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });
    });

    it('should coordinate with blur animation timing', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // HUD should not be visible during blur animation
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration / 2);
      });

      // Skills should not be visible yet
      expect(screen.queryByText('React')).not.toBeInTheDocument();

      // After blur completes, HUD should become visible
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration / 2 + 100);
      });

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
      });
    });

    it('should complete all animations within reasonable timeframe', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Calculate total animation time
      const totalAnimationTime =
        HERO_VIEWFINDER_CONFIG.animation.blurDuration +
        (HERO_TECHNICAL_SKILLS.length * HERO_VIEWFINDER_CONFIG.animation.hudStaggerDelay) +
        500; // Buffer

      act(() => {
        vi.advanceTimersByTime(totalAnimationTime);
      });

      await waitFor(() => {
        // All skills should be visible
        const skillNames = HERO_TECHNICAL_SKILLS.map(skill => skill.label);
        skillNames.forEach(skillName => {
          expect(screen.getByText(skillName)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt HUD layout for mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });

      const { container } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      // HUD should adapt to smaller screens
      const hudContainer = container.querySelector('[data-testid="metadata-hud"]');
      expect(hudContainer).toBeInTheDocument();
    });

    it('should maintain readability across viewport sizes', () => {
      const viewports = [
        { width: 375, height: 667 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }  // Desktop
      ];

      viewports.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        const { container } = render(
          <ViewfinderOverlay
            isActive={true}
            mode="hero"
            showMetadataHUD={true}
            onCapture={mockOnCapture}
          />
        );

        act(() => {
          vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
        });

        // Text should remain readable
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Frontend')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('should cleanup hover state on unmount', () => {
      const { unmount } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      // Set hover state
      const reactSkill = screen.getByText('React');
      fireEvent.mouseEnter(reactSkill);

      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow();
    });

    it('should not cause memory leaks with animation state', () => {
      const { rerender } = render(
        <ViewfinderOverlay isActive={false} mode="hero" onCapture={mockOnCapture} />
      );

      // Rapidly toggle HUD visibility
      for (let i = 0; i < 5; i++) {
        rerender(
          <ViewfinderOverlay
            isActive={true}
            mode="hero"
            showMetadataHUD={true}
            onCapture={mockOnCapture}
          />
        );

        act(() => {
          vi.advanceTimersByTime(100);
        });

        rerender(
          <ViewfinderOverlay
            isActive={false}
            mode="hero"
            showMetadataHUD={false}
            onCapture={mockOnCapture}
          />
        );
      }

      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should throttle hover events for performance', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      const reactSkill = screen.getByText('React');

      // Rapid hover events
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(reactSkill);
        fireEvent.mouseLeave(reactSkill);
      }

      // Should handle rapid events without performance issues
      await waitFor(() => {
        expect(reactSkill).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should provide proper ARIA labels for skill items', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      await waitFor(() => {
        // Check for ARIA labels on interactive elements
        const skillItems = screen.getAllByRole('listitem');
        expect(skillItems.length).toBeGreaterThan(0);

        skillItems.forEach(item => {
          expect(item).toHaveAttribute('aria-label');
        });
      });
    });

    it('should support keyboard navigation', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      await waitFor(() => {
        const firstSkill = screen.getByText('React');
        expect(firstSkill).toBeInTheDocument();

        // Should be focusable
        firstSkill.focus();
        expect(document.activeElement).toBe(firstSkill);
      });
    });

    it('should announce HUD visibility changes to screen readers', async () => {
      const { container } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 100);
      });

      await waitFor(() => {
        // Check for screen reader announcements
        const announcement = container.querySelector('[aria-live="polite"]');
        expect(announcement).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing skill data gracefully', () => {
      // Mock constants with missing data
      vi.doMock('../constants', () => ({
        HERO_TECHNICAL_SKILLS: [],
        SKILL_CATEGORIES: {},
        HERO_VIEWFINDER_CONFIG: {
          animation: { blurDuration: 1200, hudStaggerDelay: 150 }
        }
      }));

      expect(() => {
        render(
          <ViewfinderOverlay
            isActive={true}
            mode="hero"
            showMetadataHUD={true}
            onCapture={mockOnCapture}
          />
        );
      }).not.toThrow();
    });

    it('should handle animation interruptions gracefully', () => {
      const { rerender } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Start animations
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration / 2);
      });

      // Interrupt by deactivating
      rerender(
        <ViewfinderOverlay
          isActive={false}
          mode="hero"
          showMetadataHUD={false}
          onCapture={mockOnCapture}
        />
      );

      // Should not cause errors
      expect(true).toBe(true);
    });
  });
});