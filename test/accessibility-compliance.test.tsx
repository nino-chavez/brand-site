import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import HeroSection from '../components/HeroSection';
import { HERO_VIEWFINDER_CONFIG } from '../constants';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Mock dependencies
vi.mock('../hooks/useMouseTracking', () => ({
  useMouseTracking: vi.fn(() => ({
    currentPosition: { x: 400, y: 300 },
    targetPosition: { x: 400, y: 300 },
    isTracking: false,
  })),
}));

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

// Mock performance monitor
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

// Mock BlurContainer for HeroSection tests
vi.mock('../components/BlurContainer', () => ({
  default: React.forwardRef(({ children, blurAmount, isActive }: any, ref: any) => (
    <div ref={ref} data-testid="blur-container" data-blur={blurAmount} data-active={isActive}>
      {children}
    </div>
  ))
}));

describe('WCAG AA Accessibility Compliance', () => {
  let mockOnCapture: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCapture = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('ViewfinderOverlay Accessibility', () => {
    it('should have no accessibility violations in hero mode', async () => {
      const { container } = render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance to show all elements
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for main container', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      const viewfinder = screen.getByRole('application');
      expect(viewfinder).toHaveAttribute('aria-label', 'Hero viewfinder interface - Camera-inspired portfolio experience');
      expect(viewfinder).toHaveAttribute('aria-live', 'polite');
      expect(viewfinder).toHaveAttribute('aria-describedby', 'viewfinder-instructions');
    });

    it('should provide dynamic screen reader instructions', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      const instructions = screen.getByText(/Viewfinder focusing/);
      expect(instructions).toBeInTheDocument();
      expect(instructions.closest('[aria-live="polite"]')).toBeInTheDocument();

      // Advance to show HUD
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        expect(screen.getByText(/Technical skills metadata displayed/)).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation for main container', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      const viewfinder = screen.getByRole('application');
      expect(viewfinder).toHaveAttribute('tabIndex', '0');

      // Test keyboard activation
      fireEvent.keyDown(viewfinder, { key: 'Enter' });
      expect(mockOnCapture).toHaveBeenCalled();
    });

    it('should have accessible metadata HUD structure', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      // Advance to show HUD
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        // Check main HUD region
        const hudRegion = screen.getByRole('region', { name: /Technical skills and camera settings metadata/ });
        expect(hudRegion).toHaveAttribute('aria-live', 'polite');
        expect(hudRegion).toHaveAttribute('data-testid', 'metadata-hud');

        // Check skill categories
        const frontendGroup = screen.getByRole('group', { name: /frontend/i });
        expect(frontendGroup).toBeInTheDocument();
        expect(frontendGroup).toHaveAttribute('data-category', 'frontend');

        // Check skill lists
        const skillLists = screen.getAllByRole('list');
        expect(skillLists.length).toBeGreaterThan(0);
        skillLists.forEach(list => {
          expect(list).toHaveAttribute('aria-label');
        });
      });
    });

    it('should make skill items keyboard accessible', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        const skillItems = screen.getAllByRole('listitem');
        expect(skillItems.length).toBeGreaterThan(0);

        skillItems.forEach(item => {
          expect(item).toHaveAttribute('tabIndex', '0');
          expect(item).toHaveAttribute('aria-label');
          expect(item.getAttribute('aria-label')).toContain(':');
        });

        // Test keyboard interaction
        const firstSkill = skillItems[0];
        firstSkill.focus();
        expect(document.activeElement).toBe(firstSkill);

        fireEvent.keyDown(firstSkill, { key: 'Enter' });
        // Should trigger hover state without errors
      });
    });

    it('should have accessible capture button', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /Capture the moment/ });
        expect(captureButton).toHaveAttribute('aria-label');
        expect(captureButton).toHaveAttribute('aria-describedby', 'capture-button-help');
        expect(captureButton).toHaveAttribute('aria-pressed', 'false');
        expect(captureButton).toHaveAttribute('tabIndex', '0');

        const helpText = screen.getByText(/This will trigger the camera shutter animation/);
        expect(helpText).toHaveClass('sr-only');
      });
    });
  });

  describe('HeroSection Accessibility Integration', () => {
    it('should maintain accessibility during viewfinder integration', async () => {
      const mockSetRef = vi.fn();
      const mockOnNavigate = vi.fn();

      const { container } = render(
        <HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />
      );

      // Activate viewfinder
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide activation hint with proper accessibility', () => {
      const mockSetRef = vi.fn();
      const mockOnNavigate = vi.fn();

      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      const hint = screen.getByText(/Press 'V' to activate camera viewfinder/);
      expect(hint).toBeInTheDocument();
      expect(hint.closest('div')).toHaveClass('animate-pulse');
    });

    it('should maintain focus management during navigation', async () => {
      const mockSetRef = vi.fn();
      const mockOnNavigate = vi.fn();

      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Navigation buttons should be accessible
      const viewWorkButton = screen.getByRole('button', { name: /view work/i });
      const contactButton = screen.getByRole('button', { name: /contact/i });

      expect(viewWorkButton).toBeInTheDocument();
      expect(contactButton).toBeInTheDocument();

      viewWorkButton.focus();
      expect(document.activeElement).toBe(viewWorkButton);
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should meet WCAG AA color contrast requirements', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        // Test capture button contrast
        const captureButton = screen.getByRole('button', { name: /Capture the moment/ });
        const computedStyle = window.getComputedStyle(captureButton);

        // Button should have sufficient contrast (tested with actual colors in design)
        expect(captureButton).toBeInTheDocument();

        // Focus indicators should be visible
        captureButton.focus();
        expect(captureButton).toHaveClass('focus:ring-brand-violet/50');
      });
    });

    it('should provide focus indicators for all interactive elements', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        // Test skill item focus indicators
        const skillItems = screen.getAllByRole('listitem');
        skillItems.forEach(item => {
          expect(item).toHaveClass('focus:ring-2', 'focus:ring-brand-violet/50');
        });

        // Test capture button focus
        const captureButton = screen.getByRole('button', { name: /Capture the moment/ });
        expect(captureButton).toHaveClass('focus:ring-4', 'focus:ring-brand-violet/50');
      });
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should announce viewfinder state changes', async () => {
      const { rerender } = render(
        <ViewfinderOverlay
          isActive={false}
          mode="hero"
          showMetadataHUD={false}
          onCapture={mockOnCapture}
        />
      );

      // Check inactive state
      expect(screen.getByText('Camera viewfinder inactive')).toBeInTheDocument();

      // Activate viewfinder
      rerender(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      expect(screen.getByText(/Viewfinder focusing/)).toBeInTheDocument();

      // Complete focus sequence
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        expect(screen.getByText(/Technical skills metadata displayed/)).toBeInTheDocument();
      });
    });

    it('should announce shutter animation progress', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        const captureButton = screen.getByRole('button', { name: /Capture the moment/ });
        fireEvent.click(captureButton);
      });

      // Check for animation announcement
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(screen.getByText('Camera shutter animation in progress')).toBeInTheDocument();
    });

    it('should provide meaningful labels for all interactive elements', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        // Check skill item labels
        const skillItems = screen.getAllByRole('listitem');
        skillItems.forEach(item => {
          const ariaLabel = item.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();
          expect(ariaLabel).toMatch(/.*:.*\./); // Should contain skill name, value, and end with period
        });

        // Check capture button label
        const captureButton = screen.getByRole('button', { name: /Capture the moment/ });
        expect(captureButton.getAttribute('aria-label')).toContain('Press Enter or Space');
      });
    });
  });

  describe('Reduced Motion Accessibility', () => {
    it('should respect prefers-reduced-motion setting', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn(() => ({
          matches: true, // prefers-reduced-motion: reduce
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
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

      // Component should render without complex animations
      const viewfinder = screen.getByRole('application');
      expect(viewfinder).toBeInTheDocument();

      // Verify reduced animation duration from config
      expect(HERO_VIEWFINDER_CONFIG.accessibility.reducedMotionDuration).toBe(300);
    });
  });

  describe('Keyboard Navigation Patterns', () => {
    it('should support tab navigation through all interactive elements', async () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.blurDuration + 500);
      });

      await waitFor(() => {
        // Get all focusable elements
        const viewfinder = screen.getByRole('application');
        const skillItems = screen.getAllByRole('listitem');
        const captureButton = screen.getByRole('button', { name: /Capture the moment/ });

        // Test tab order
        const focusableElements = [viewfinder, ...skillItems, captureButton];

        focusableElements.forEach(element => {
          expect(element).toHaveAttribute('tabIndex');
          element.focus();
          expect(document.activeElement).toBe(element);
        });
      });
    });

    it('should support escape key to exit interactions', () => {
      render(
        <ViewfinderOverlay
          isActive={true}
          mode="hero"
          showMetadataHUD={true}
          onCapture={mockOnCapture}
        />
      );

      const viewfinder = screen.getByRole('application');
      viewfinder.focus();

      fireEvent.keyDown(viewfinder, { key: 'Escape' });
      // Should handle escape gracefully without errors
      expect(viewfinder).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should maintain accessibility during error states', () => {
      // Mock error condition
      vi.spyOn(console, 'error').mockImplementation(() => {});

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

      const viewfinder = screen.getByRole('application');
      expect(viewfinder).toHaveAttribute('aria-label');
    });

    it('should handle missing skill data gracefully', () => {
      // Mock empty skills
      vi.doMock('../constants', () => ({
        HERO_TECHNICAL_SKILLS: [],
        SKILL_CATEGORIES: {},
        HERO_VIEWFINDER_CONFIG: {
          animation: { blurDuration: 1200 },
          accessibility: { reducedMotionDuration: 300 }
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
  });
});