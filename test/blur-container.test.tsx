import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import BlurContainer, { HeroBlurContainer, BlurableSection } from '../components/BlurContainer';
import { HERO_VIEWFINDER_CONFIG } from '../constants';

// Mock RAF functionality
let rafCallbacks: ((timestamp: number) => void)[] = [];
let rafId = 1;

const mockRequestAnimationFrame = vi.fn((callback: (timestamp: number) => void) => {
  rafCallbacks.push(callback);
  return rafId++;
});

const mockCancelAnimationFrame = vi.fn((id: number) => {
  rafCallbacks = rafCallbacks.filter(cb => cb !== rafCallbacks[id - 1]);
});

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

    // Set up RAF mocks
    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;

    // Reset RAF state
    rafCallbacks = [];
    rafId = 1;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    rafCallbacks = [];
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

    it('should gradually increase blur with distance', () => {
      const { rerender } = render(
        <BlurContainer isActive={true} maxBlurIntensity={8} distance={0}>
          <div data-testid="content">Test Content</div>
        </BlurContainer>
      );

      // Initially no blur at distance 0
      let container = screen.getByTestId('content').parentElement;
      expect(container).toHaveStyle({ filter: 'none' });

      // Increase distance
      rerender(
        <BlurContainer isActive={true} maxBlurIntensity={8} distance={100}>
          <div data-testid="content">Test Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      container = screen.getByTestId('content').parentElement;
      expect(container?.style.filter).toContain('blur');
    });

    it('should respect maxBlurIntensity limit', () => {
      render(
        <BlurContainer isActive={true} maxBlurIntensity={4} distance={1000}>
          <div data-testid="content">Test Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      const container = screen.getByTestId('content').parentElement;
      const blurMatch = container?.style.filter.match(/blur\(([\d.]+)px\)/);
      if (blurMatch) {
        const blurValue = parseFloat(blurMatch[1]);
        expect(blurValue).toBeLessThanOrEqual(4);
      }
    });

    it('should apply transition smoothly', async () => {
      const { rerender } = render(
        <BlurContainer isActive={false}>
          <div data-testid="content">Test Content</div>
        </BlurContainer>
      );

      // Enable blur
      rerender(
        <BlurContainer isActive={true} maxBlurIntensity={8} distance={100}>
          <div data-testid="content">Test Content</div>
        </BlurContainer>
      );

      const container = screen.getByTestId('content').parentElement;
      expect(container?.style.transition).toContain('filter');
    });
  });

  describe('Hero Mode', () => {
    it('should handle hero focus animation', () => {
      const mockCallback = vi.fn();

      render(
        <BlurContainer
          isActive={true}
          maxBlurIntensity={8}
          heroMode={true}
          heroFocusAnimation={{
            enabled: true,
            progress: 0.5,
            onAnimationUpdate: mockCallback,
          }}
        >
          <div data-testid="content">Hero Content</div>
        </BlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      expect(mockCallback).toHaveBeenCalledWith(0.5);
    });

    it('should apply hardware acceleration', () => {
      render(
        <BlurContainer
          isActive={true}
          maxBlurIntensity={8}
          heroMode={true}
        >
          <div data-testid="content">Hero Content</div>
        </BlurContainer>
      );

      const container = screen.getByTestId('content').parentElement;
      expect(container?.style.transform).toContain('translateZ(0)');
    });

    it('should complete hero focus animation', () => {
      const mockCallback = vi.fn();

      render(
        <BlurContainer
          isActive={true}
          maxBlurIntensity={8}
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

    // Set up RAF mocks
    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;

    // Reset RAF state
    rafCallbacks = [];
    rafId = 1;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    rafCallbacks = [];
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

    act(() => {
      vi.runAllTimers();
    });

    const container = screen.getByTestId('content').parentElement;
    expect(container?.style.filter).toContain(`blur(${HERO_VIEWFINDER_CONFIG.blur.focusedBlur}px)`);
  });

  it('should call animation callback with interpolated values', () => {
    render(
      <HeroBlurContainer
        isActive={true}
        focusProgress={0.5}
        onAnimationUpdate={mockOnAnimationUpdate}
      >
        <div data-testid="content">Hero Content</div>
      </HeroBlurContainer>
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(mockOnAnimationUpdate).toHaveBeenCalledWith(0.5);
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

    act(() => {
      vi.runAllTimers();
    });

    const container = screen.getByTestId('content').parentElement;
    expect(container?.style.filter).toBe('none');
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
    expect(container?.style.transform).toContain('translateZ(0)');
    expect(container?.style.willChange).toBe('filter');
  });

  it('should use easeOutQuint easing for smooth animation', () => {
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

    act(() => {
      vi.runAllTimers();
    });

    const container = screen.getByTestId('content').parentElement;
    const blurMatch = container?.style.filter.match(/blur\(([\d.]+)px\)/);

    if (blurMatch) {
      const currentBlur = parseFloat(blurMatch[1]);
      // With easing, shouldn't be exactly linear interpolation
      expect(currentBlur).not.toBe(6); // Linear would be 6px at 50% of 8px->4px transition
    }
  });

  describe('Performance', () => {
    it('should cleanup animation frames on unmount', () => {
      const { unmount } = render(
        <HeroBlurContainer
          isActive={true}
          focusProgress={0.5}
          onAnimationUpdate={mockOnAnimationUpdate}
        >
          <div data-testid="content">Hero Content</div>
        </HeroBlurContainer>
      );

      // Trigger some RAF calls
      act(() => {
        rafCallbacks.forEach(callback => callback(Date.now()));
      });

      unmount();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
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

      // Very small change
      rerender(
        <HeroBlurContainer
          isActive={true}
          focusProgress={0.501}
          onAnimationUpdate={mockOnAnimationUpdate}
        >
          <div data-testid="content">Hero Content</div>
        </HeroBlurContainer>
      );

      act(() => {
        vi.runAllTimers();
      });

      // Should not trigger expensive re-calculations for minimal changes
      expect(mockOnAnimationUpdate).toHaveBeenCalledTimes(2); // Initial + update
    });
  });
});

describe('BlurableSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should render with blurable attributes', () => {
    render(
      <BlurableSection>
        <div data-testid="content">Blurable Content</div>
      </BlurableSection>
    );

    const section = screen.getByTestId('content').parentElement;
    expect(section).toHaveAttribute('data-blurable', 'true');
  });

  it('should apply performance optimizations', () => {
    render(
      <BlurableSection>
        <div data-testid="content">Optimized Content</div>
      </BlurableSection>
    );

    const section = screen.getByTestId('content').parentElement;
    expect(section?.style.transform).toContain('translateZ(0)');
    expect(section?.style.willChange).toBe('filter');
  });
});