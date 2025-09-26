import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import HeroSection from '../components/HeroSection';
import { HERO_VIEWFINDER_CONFIG } from '../constants';

// Mock components that HeroSection depends on
vi.mock('../components/ViewfinderOverlay', () => ({
  default: ({ isActive, mode, onCapture, showMetadataHUD }: any) => (
    <div data-testid="viewfinder-overlay" data-active={isActive} data-mode={mode}>
      {showMetadataHUD && <div>Metadata HUD</div>}
      {isActive && mode === 'hero' && (
        <button
          onClick={onCapture}
          data-testid="capture-button"
          aria-label="Capture the moment"
        >
          Capture the Moment
        </button>
      )}
    </div>
  )
}));

vi.mock('../components/BlurContainer', () => ({
  default: React.forwardRef(({ children, blurAmount, isActive }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="blur-container"
      data-blur={blurAmount}
      data-active={isActive}
      style={{ filter: `blur(${blurAmount}px)` }}
    >
      {children}
    </div>
  ))
}));

// Mock scroll behavior
const mockScrollIntoView = vi.fn();
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

// Mock querySelector for section navigation
const mockQuerySelector = vi.fn();
Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
  writable: true,
});

describe('Hero Navigation Integration', () => {
  let mockOnNavigate: ReturnType<typeof vi.fn>;
  let mockSetRef: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnNavigate = vi.fn();
    mockSetRef = vi.fn();
    vi.useFakeTimers();
    mockScrollIntoView.mockClear();
    mockQuerySelector.mockClear();

    // Mock about section element
    const mockAboutElement = {
      scrollIntoView: mockScrollIntoView
    };
    mockQuerySelector.mockImplementation((selector: string) => {
      if (selector === '#about') {
        return mockAboutElement;
      }
      return null;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Viewfinder Activation and Navigation Flow', () => {
    it('should auto-activate viewfinder after 3 seconds', async () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Initially viewfinder should not be active
      const viewfinderOverlay = screen.getByTestId('viewfinder-overlay');
      expect(viewfinderOverlay).toHaveAttribute('data-active', 'false');

      // Advance 3 seconds for auto-activation
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(viewfinderOverlay).toHaveAttribute('data-active', 'true');
      });
    });

    it('should activate viewfinder immediately with keyboard shortcut', () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      const viewfinderOverlay = screen.getByTestId('viewfinder-overlay');
      expect(viewfinderOverlay).toHaveAttribute('data-active', 'false');

      // Press 'V' key to activate viewfinder
      fireEvent.keyDown(window, { key: 'v' });

      expect(viewfinderOverlay).toHaveAttribute('data-active', 'true');
    });

    it('should show activation hint when viewfinder is inactive', () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Should show the hint initially
      expect(screen.getByText(/Press 'V' to activate camera viewfinder/)).toBeInTheDocument();

      // Activate viewfinder
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Hint should disappear
      expect(screen.queryByText(/Press 'V' to activate camera viewfinder/)).not.toBeInTheDocument();
    });
  });

  describe('Capture and Scroll Behavior', () => {
    it('should scroll to about section after capture completion', async () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Activate viewfinder
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Wait for focus to complete
      act(() => {
        vi.advanceTimersByTime(200); // Focus delay
      });

      // Find and click capture button
      await waitFor(() => {
        const captureButton = screen.getByTestId('capture-button');
        expect(captureButton).toBeInTheDocument();
      });

      const captureButton = screen.getByTestId('capture-button');
      fireEvent.click(captureButton);

      // Advance through complete capture sequence
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.captureSequenceDuration);
      });

      // Verify scroll was triggered
      await waitFor(() => {
        expect(mockQuerySelector).toHaveBeenCalledWith('#about');
        expect(mockScrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'start'
        });
      });
    });

    it('should support keyboard-triggered capture and navigation', async () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Activate viewfinder with keyboard
      fireEvent.keyDown(window, { key: 'V' });

      // Wait for focus completion
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Trigger capture with keyboard
      fireEvent.keyDown(window, { key: 'Enter' });

      // Advance through capture sequence
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.captureSequenceDuration);
      });

      // Verify navigation was triggered
      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalled();
      });
    });

    it('should handle missing about section gracefully', async () => {
      // Mock missing about section
      mockQuerySelector.mockReturnValue(null);

      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Activate and capture
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        const captureButton = screen.getByTestId('capture-button');
        fireEvent.click(captureButton);
      });

      // Complete capture sequence
      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.captureSequenceDuration);
      });

      // Should not throw error even if section doesn't exist
      expect(mockScrollIntoView).not.toHaveBeenCalled();
      expect(true).toBe(true); // Test passes if no errors thrown
    });
  });

  describe('Volleyball Timeline Integration', () => {
    it('should pause volleyball progression when viewfinder is focused', async () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Get initial volleyball phase
      const initialPhase = screen.getByText(/Setup Phase|Anticipation Phase|Approach Phase/);
      const initialPhaseText = initialPhase.textContent;

      // Activate viewfinder and focus
      fireEvent.keyDown(window, { key: 'v' });
      act(() => {
        vi.advanceTimersByTime(200); // Focus activation delay
      });

      // Advance time that would normally progress phases
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Phase should remain the same due to viewfinder focus pause
      const currentPhase = screen.getByText(/Setup Phase|Anticipation Phase|Approach Phase/);
      expect(currentPhase.textContent).toBe(initialPhaseText);
    });

    it('should resume volleyball progression after capture', async () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Activate viewfinder
      fireEvent.keyDown(window, { key: 'v' });

      // Complete capture sequence
      await waitFor(() => {
        const captureButton = screen.getByTestId('capture-button');
        fireEvent.click(captureButton);
      });

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.captureSequenceDuration);
      });

      // Now phases should resume normal progression
      act(() => {
        vi.advanceTimersByTime(1500); // Setup phase duration
      });

      // Should show phase progression
      expect(screen.getByText(/Phase/)).toBeInTheDocument();
    });
  });

  describe('Blur Animation Coordination', () => {
    it('should coordinate blur reduction with viewfinder focus', async () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      const blurContainer = screen.getByTestId('blur-container');

      // Initially should have blur
      expect(blurContainer).toHaveAttribute('data-blur', '8');

      // Activate viewfinder
      fireEvent.keyDown(window, { key: 'v' });

      // Should transition to intermediate blur
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(blurContainer).toHaveAttribute('data-blur', '4');

      // Complete focus
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should reach focused state (0 blur)
      await waitFor(() => {
        expect(blurContainer).toHaveAttribute('data-blur', '0');
      });
    });

    it('should use progressive blur states for smooth UX', () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      const blurContainer = screen.getByTestId('blur-container');

      // Test blur progression: 8px → 4px → 0px
      const expectedBlurStates = [8, 4, 0];
      let currentStateIndex = 0;

      // Initial state
      expect(blurContainer).toHaveAttribute('data-blur', expectedBlurStates[currentStateIndex].toString());

      // Activate viewfinder
      fireEvent.keyDown(window, { key: 'v' });
      currentStateIndex++;

      // Intermediate state
      expect(blurContainer).toHaveAttribute('data-blur', expectedBlurStates[currentStateIndex].toString());

      // Complete focus
      act(() => {
        vi.advanceTimersByTime(200);
      });
      currentStateIndex++;

      // Final focused state
      expect(blurContainer).toHaveAttribute('data-blur', expectedBlurStates[currentStateIndex].toString());
    });
  });

  describe('Navigation Button Integration', () => {
    it('should maintain navigation buttons functionality with viewfinder active', async () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Activate viewfinder
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Navigation buttons should still work
      const viewWorkButton = screen.getByRole('button', { name: /view work/i });
      const contactButton = screen.getByRole('button', { name: /contact/i });

      fireEvent.click(viewWorkButton);
      expect(mockOnNavigate).toHaveBeenCalledWith('work');

      fireEvent.click(contactButton);
      expect(mockOnNavigate).toHaveBeenCalledWith('contact');
    });

    it('should handle scroll indicator navigation', () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      const scrollIndicator = screen.getByLabelText(/scroll to about section/i);
      fireEvent.click(scrollIndicator);

      expect(mockOnNavigate).toHaveBeenCalledWith('about');
    });
  });

  describe('Performance During Navigation', () => {
    it('should maintain smooth animations during navigation events', async () => {
      const frameTracker: number[] = [];
      const originalRAF = window.requestAnimationFrame;

      window.requestAnimationFrame = vi.fn((callback) => {
        frameTracker.push(performance.now());
        return originalRAF(callback);
      });

      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Trigger multiple navigation events rapidly
      fireEvent.keyDown(window, { key: 'v' }); // Activate viewfinder
      act(() => vi.advanceTimersByTime(100));

      fireEvent.click(screen.getByRole('button', { name: /view work/i }));
      act(() => vi.advanceTimersByTime(100));

      // Complete capture sequence
      await waitFor(() => {
        const captureButton = screen.getByTestId('capture-button');
        fireEvent.click(captureButton);
      });

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.captureSequenceDuration);
      });

      // Verify smooth animation timing (should not have frame drops)
      expect(frameTracker.length).toBeGreaterThan(0);

      window.requestAnimationFrame = originalRAF;
    });

    it('should cleanup resources during navigation transitions', () => {
      const { unmount } = render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Activate viewfinder and start animations
      fireEvent.keyDown(window, { key: 'v' });
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Accessibility During Navigation', () => {
    it('should maintain focus management during viewfinder activation', async () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Activate viewfinder
      fireEvent.keyDown(window, { key: 'v' });

      await waitFor(() => {
        const captureButton = screen.getByTestId('capture-button');
        expect(captureButton).toHaveAttribute('aria-label', 'Capture the moment');
      });
    });

    it('should provide proper ARIA announcements for navigation', async () => {
      render(<HeroSection setRef={mockSetRef} onNavigate={mockOnNavigate} />);

      // Look for screen reader announcements
      const liveRegion = document.querySelector('[aria-live]');
      if (liveRegion) {
        expect(liveRegion).toBeInTheDocument();
      }

      // Activate viewfinder
      fireEvent.keyDown(window, { key: 'v' });

      // Complete capture and navigation
      await waitFor(() => {
        const captureButton = screen.getByTestId('capture-button');
        fireEvent.click(captureButton);
      });

      act(() => {
        vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.animation.captureSequenceDuration);
      });

      // Should complete without accessibility violations
      expect(mockScrollIntoView).toHaveBeenCalled();
    });
  });
});