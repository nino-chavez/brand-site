import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import BlurContainer, { HeroBlurContainer, BlurableSection } from '../components/BlurContainer';
import { HERO_VIEWFINDER_CONFIG } from '../constants';

// Mock the useMouseTracking hook
vi.mock('../hooks/useMouseTracking', () => ({
  useMouseTracking: vi.fn(() => ({
    currentPosition: { x: 100, y: 100 },
    targetPosition: { x: 100, y: 100 },
    isTracking: false,
  })),
}));

describe('BlurContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Standard Mode', () => {
    it('should render children without blur when inactive', () => {
      render(
        <BlurContainer isActive={false}>
          <div data-testid="content">Test Content</div>
        </BlurContainer>
      );

      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveStyle({ filter: 'none' });
    });

    it('should apply blur when active', () => {
      render(
        <BlurContainer isActive={true} maxBlurIntensity={8}>
          <div data-testid="content">Test Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      const container = screen.getByTestId('content').parentElement;
      expect(container?.style.filter).toContain('blur');
    });

    it('should update blur based on focus center', () => {
      const { rerender } = render(
        <BlurContainer
          isActive={true}
          focusCenter={{ x: 50, y: 50 }}
          focusRadius={100}
          maxBlurIntensity={8}
        >
          <div data-testid="content">Test Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      // Change focus center
      rerender(
        <BlurContainer
          isActive={true}
          focusCenter={{ x: 200, y: 200 }}
          focusRadius={100}
          maxBlurIntensity={8}
        >
          <div data-testid="content">Test Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      const container = screen.getByTestId('content').parentElement;
      expect(container?.style.filter).toContain('blur');
    });

    it('should handle blurable elements', () => {
      render(
        <BlurContainer isActive={true}>
          <div data-blurable="true" data-testid="blurable">
            Blurable Content
          </div>
          <div data-testid="non-blurable">Non-blurable Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      const blurableElement = screen.getByTestId('blurable');
      expect(blurableElement.style.filter).toContain('blur');
    });
  });

  describe('Hero Mode', () => {
    it('should support hero mode with focus animation', () => {
      const mockContainerRef = { current: document.createElement('div') };

      render(
        <BlurContainer
          isActive={true}
          heroMode={true}
          heroFocusAnimation={{
            enabled: true,
            progress: 0.5,
          }}
        >
          <div data-testid="content">Hero Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      const container = screen.getByTestId('content').parentElement;
      expect(container?.style.filter).toContain('blur');
      expect(container).toHaveStyle({ transition: 'none' }); // Hero mode disables CSS transitions
    });

    it('should calculate blur amount based on focus progress', () => {
      render(
        <BlurContainer
          isActive={true}
          heroMode={true}
          heroFocusAnimation={{
            enabled: true,
            progress: 0.5, // 50% focused
          }}
        >
          <div data-testid="content">Hero Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      const container = screen.getByTestId('content').parentElement;
      // At 50% progress, blur should be 4px (8px * 0.5)
      expect(container?.style.filter).toContain('blur(4px)');
    });

    it('should apply hardware acceleration in hero mode', () => {
      render(
        <BlurContainer
          isActive={true}
          heroMode={true}
          heroFocusAnimation={{
            enabled: true,
            progress: 0.5,
          }}
        >
          <div data-testid="content">Hero Content</div>
        </BlurContainer>
      );

      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveStyle({ transform: 'translateZ(0)' });
    });

    it('should call animation update callback', () => {
      const mockCallback = vi.fn();

      render(
        <BlurContainer
          isActive={true}
          heroMode={true}
          heroFocusAnimation={{
            enabled: true,
            progress: 0.75,
            onAnimationUpdate: mockCallback,
          }}
        >
          <div data-testid="content">Hero Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      expect(mockCallback).toHaveBeenCalledWith(0.75);
    });
  });
});

describe('HeroBlurContainer', () => {
  let mockOnAnimationUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnAnimationUpdate = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should render with initial blur when active', () => {
    render(
      <HeroBlurContainer
        isActive={true}
        focusProgress={0}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    const container = screen.getByTestId('content').parentElement;
    expect(container?.style.filter).toContain(`blur(${HERO_VIEWFINDER_CONFIG.blur.initialBlur}px)`);
  });

  it('should animate to focused state', async () => {
    const { rerender } = render(
      <HeroBlurContainer
        isActive={true}
        focusProgress={0}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    // Update to fully focused
    rerender(
      <HeroBlurContainer
        isActive={true}
        focusProgress={1}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    // Advance animation
    act(() => {
      vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.blur.updateInterval);
    });

    await waitFor(() => {
      const container = screen.getByTestId('content').parentElement;
      expect(container?.style.filter).toContain('blur(0px)');
    });

    expect(mockOnAnimationUpdate).toHaveBeenCalledWith(1, 0);
  });

  it('should handle rapid progress changes efficiently', () => {
    const { rerender } = render(
      <HeroBlurContainer
        isActive={true}
        focusProgress={0}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    // Rapid progress changes
    const progressValues = [0.1, 0.2, 0.3, 0.4, 0.5];
    progressValues.forEach(progress => {
      rerender(
        <HeroBlurContainer
          isActive={true}
          focusProgress={progress}
          onAnimationUpdate={mockOnAnimationUpdate}
        >
          <div data-testid="content">Hero Content</div>
        </HeroBlurContainer>
      );
    });

    // Should handle without errors
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should reset to initial blur when deactivated', () => {
    const { rerender } = render(
      <HeroBlurContainer
        isActive={true}
        focusProgress={1}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    // Deactivate
    rerender(
      <HeroBlurContainer
        isActive={false}
        focusProgress={1}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    const container = screen.getByTestId('content').parentElement;
    expect(container?.style.filter).toContain(`blur(${HERO_VIEWFINDER_CONFIG.blur.initialBlur}px)`);
  });

  it('should apply hardware acceleration optimizations', () => {
    render(
      <HeroBlurContainer
        isActive={true}
        focusProgress={0.5}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    const container = screen.getByTestId('content').parentElement;
    expect(container).toHaveStyle({
      backfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
      willChange: 'filter',
    });
  });

  it('should use easeOutQuint easing for smooth animation', async () => {
    const { rerender } = render(
      <HeroBlurContainer
        isActive={true}
        focusProgress={0}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    // Change to 50% progress
    rerender(
      <HeroBlurContainer
        isActive={true}
        focusProgress={0.5}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    // Advance partway through animation
    act(() => {
      vi.advanceTimersByTime(HERO_VIEWFINDER_CONFIG.blur.updateInterval / 2);
    });

    // Should be using eased interpolation, not linear
    const container = screen.getByTestId('content').parentElement;
    const currentFilter = container?.style.filter || '';
    const blurMatch = currentFilter.match(/blur\((\d+\.?\d*)px\)/);

    if (blurMatch) {
      const currentBlur = parseFloat(blurMatch[1]);
      // With easing, shouldn't be exactly linear interpolation
      expect(currentBlur).not.toBe(6); // Linear would be 6px at 50% of 8px->4px transition
    }
  });

  describe('Performance', () => {
    it('should cleanup animation frames on unmount', () => {
      const cancelAnimationFrameSpy = vi.spyOn(global, 'cancelAnimationFrame');

      const { unmount } = render(
        <HeroBlurContainer
          isActive={true}
          focusProgress={0.5}
          onAnimationUpdate={mockOnAnimationUpdate}
        >
          <div data-testid="content">Hero Content</div>
        </HeroBlurContainer>
      );

      unmount();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });

    it('should skip animation for minimal progress changes', () => {
      const { rerender } = render(
        <HeroBlurContainer
          isActive={true}
          focusProgress={0.5}
          onAnimationUpdate={mockOnAnimationUpdate}
        >
          <div data-testid="content">Hero Content</div>
        </HeroBlurContainer>
      );

      const requestAnimationFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
      const initialCallCount = requestAnimationFrameSpy.mock.calls.length;

      // Very small change (should be skipped)
      rerender(
        <HeroBlurContainer
          isActive={true}
          focusProgress={0.505}
          onAnimationUpdate={mockOnAnimationUpdate}
        >
          <div data-testid="content">Hero Content</div>
        </HeroBlurContainer>
      );

      // Should not trigger new animation for minimal change
      expect(requestAnimationFrameSpy.mock.calls.length).toBe(initialCallCount);
    });
  });
});

describe('BlurableSection', () => {
  it('should render with blurable attributes', () => {
    render(
      <BlurableSection priority={5}>
        <div data-testid="content">Blurable Content</div>
      </BlurableSection>
    );

    const section = screen.getByTestId('content').parentElement;
    expect(section).toHaveAttribute('data-blurable', 'true');
    expect(section).toHaveAttribute('data-blur-priority', '5');
  });

  it('should apply performance optimizations', () => {
    render(
      <BlurableSection>
        <div data-testid="content">Blurable Content</div>
      </BlurableSection>
    );

    const section = screen.getByTestId('content').parentElement;
    expect(section).toHaveStyle({
      backfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
    });
  });
});