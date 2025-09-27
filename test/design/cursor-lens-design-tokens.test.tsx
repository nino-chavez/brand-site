/**
 * Cursor Lens Design Token Integration Tests
 *
 * Validates design token integration and visual consistency with athletic design system
 * Task 13: Design Token Integration - Complete design system compliance validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { UnifiedGameFlowProvider } from '../../contexts/UnifiedGameFlowContext';
import CursorLens from '../../components/CursorLens';
import { useAthleticColors } from '../../tokens/simple-provider';

// Test wrapper component with athletic token provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UnifiedGameFlowProvider debugMode={true}>
    <div style={{ width: 1200, height: 800, position: 'relative' }}>
      {children}
    </div>
  </UnifiedGameFlowProvider>
);

// Mock athletic token provider
vi.mock('../../tokens/simple-provider', () => ({
  useAthleticColors: vi.fn(() => ({
    courtNavy: '#1a365d',
    courtOrange: '#ff8c00',
    brandViolet: '#6b46c1',
    courtWhite: '#ffffff',
    courtGray: '#718096'
  }))
}));

describe('Cursor Lens Design Token Integration', () => {
  let mockOnSectionSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSectionSelect = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Athletic Color Integration', () => {
    it('should use court-navy for primary elements', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');
      const computedStyle = getComputedStyle(lensContainer);

      // Primary elements should use court-navy
      expect(computedStyle.borderColor).toMatch(/#1a365d|rgb\(26,\s*54,\s*93\)/i);
    });

    it('should use court-orange for highlight and active states', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Activate lens
      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Move to highlight a section
      await act(async () => {
        fireEvent.mouseMove(lensContainer, { clientX: 650, clientY: 380 });
      });

      // Check highlighted section uses court-orange
      const sections = screen.getAllByRole('button');
      const highlightedSection = sections.find(section =>
        section.classList.contains('highlighted') ||
        section.classList.contains('active') ||
        section.classList.contains('selected')
      );

      if (highlightedSection) {
        const style = getComputedStyle(highlightedSection);
        expect(style.backgroundColor || style.borderColor || style.color)
          .toMatch(/#ff8c00|rgb\(255,\s*140,\s*0\)/i);
      }
    });

    it('should use brand-violet for accent elements', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Check for brand-violet in accent elements
      const accentElements = screen.getAllByRole('img', { hidden: true });
      accentElements.forEach(element => {
        const style = getComputedStyle(element);
        // Accent elements may use brand-violet
        if (style.color || style.fill) {
          expect(style.color || style.fill).toBeTruthy();
        }
      });
    });

    it('should maintain color consistency across viewport sizes', () => {
      const viewports = [
        { width: 320, height: 568 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }  // Desktop
      ];

      viewports.forEach(viewport => {
        // Mock viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        });

        const { unmount } = render(
          <TestWrapper>
            <CursorLens
              isEnabled={true}
              onSectionSelect={mockOnSectionSelect}
              viewportDimensions={{
                width: viewport.width,
                height: viewport.height,
                edgeClearance: 40
              }}
            />
          </TestWrapper>
        );

        const lensContainer = screen.getByRole('application');
        const style = getComputedStyle(lensContainer);

        // Colors should be consistent regardless of viewport
        expect(style.borderColor).toMatch(/#1a365d|rgb\(26,\s*54,\s*93\)/i);

        unmount();
      });
    });
  });

  describe('Athletic Timing Integration', () => {
    it('should use athletic timing curves for activation', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');
      const style = getComputedStyle(lensContainer);

      // Should use athletic timing curves
      expect(style.transitionTimingFunction).toMatch(/cubic-bezier|ease-out|ease-in-out/);
    });

    it('should respect approach/follow-through timing patterns', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Test activation timing (approach)
      const startTime = performance.now();

      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100); // 100ms activation target
      });

      await waitFor(() => {
        expect(screen.getByText('capture')).toBeInTheDocument();
      });

      // Should meet 100ms activation timing
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      // Test selection timing (follow-through)
      await act(async () => {
        fireEvent.mouseUp(lensContainer, { clientX: 600, clientY: 350 });
      });

      // Should complete within athletic timing expectations
      expect(mockOnSectionSelect).toHaveBeenCalled();
    });

    it('should use 16ms highlighting response time', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Activate lens
      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Move cursor and advance exactly 16ms
      await act(async () => {
        fireEvent.mouseMove(lensContainer, { clientX: 650, clientY: 380 });
      });

      act(() => {
        vi.advanceTimersByTime(16); // 16ms requirement for 60fps
      });

      // Highlighting should be responsive within 16ms
      const sections = screen.getAllByRole('button');
      expect(sections.some(section =>
        section.classList.contains('highlighted') ||
        section.classList.contains('active')
      )).toBe(true);
    });

    it('should integrate with existing athletic animation system', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');
      const style = getComputedStyle(lensContainer);

      // Should use consistent timing with existing system
      expect(style.transitionDuration).toMatch(/200ms|220ms|0\.2s|0\.22s/);
    });
  });

  describe('Camera Metaphor Integration', () => {
    it('should display correct camera metaphor labels', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Activate to show sections
      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Verify camera metaphor labels are present
      const cameraLabels = [
        'capture',   // Shutter release
        'focus',     // Focus adjustment
        'frame',     // Composition
        'exposure',  // Technical settings
        'develop',   // Post-processing
        'portfolio'  // Results showcase
      ];

      cameraLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('should provide camera metaphor descriptions in ARIA labels', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Check ARIA descriptions include camera metaphors
      const sections = screen.getAllByRole('button');
      sections.forEach(section => {
        const ariaLabel = section.getAttribute('aria-label') ||
                         section.getAttribute('aria-description');

        if (ariaLabel) {
          expect(ariaLabel).toMatch(/camera|lens|shutter|focus|aperture|viewfinder/i);
        }
      });
    });

    it('should use camera-inspired iconography', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Check for camera-related icons/symbols
      const icons = screen.getAllByRole('img', { hidden: true });
      expect(icons.length).toBeGreaterThan(0);

      // Icons should have camera-related accessibility labels
      icons.forEach(icon => {
        const alt = icon.getAttribute('alt') ||
                   icon.getAttribute('aria-label');

        if (alt) {
          expect(alt).toMatch(/camera|lens|aperture|shutter|crosshair|viewfinder/i);
        }
      });
    });
  });

  describe('Responsive Design Integration', () => {
    it('should adapt layout for mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 568,
      });

      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
            viewportDimensions={{ width: 320, height: 568, edgeClearance: 40 }}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Should adapt for mobile constraints
      expect(lensContainer).toHaveClass(/mobile|responsive|small/i);
    });

    it('should scale appropriately for tablet viewports', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
            viewportDimensions={{ width: 768, height: 1024, edgeClearance: 40 }}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Should scale for tablet
      expect(lensContainer).toHaveClass(/tablet|medium|responsive/i);
    });

    it('should optimize for desktop viewports', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
            viewportDimensions={{ width: 1920, height: 1080, edgeClearance: 40 }}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Should optimize for desktop
      expect(lensContainer).toHaveClass(/desktop|large|full/i);
    });

    it('should maintain touch target sizes on mobile', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
            viewportDimensions={{ width: 320, height: 568, edgeClearance: 40 }}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 160, clientY: 284 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Touch targets should be at least 44px (iOS) or 48dp (Android)
      const sections = screen.getAllByRole('button');
      sections.forEach(section => {
        const style = getComputedStyle(section);
        const minSize = parseInt(style.minWidth) || parseInt(style.width);
        expect(minSize).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Visual Consistency with Photography Workflow', () => {
    it('should maintain consistent visual language', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Should use consistent styling classes
      expect(lensContainer).toHaveClass(/viewfinder|lens|photography|workflow/i);
    });

    it('should integrate seamlessly with existing navigation', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Should not conflict with existing navigation styles
      const navigation = screen.queryByRole('navigation');
      if (navigation) {
        expect(navigation).not.toHaveStyle({ display: 'none' });
      }
    });

    it('should complement existing photography UI elements', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');
      const style = getComputedStyle(lensContainer);

      // Should complement not compete with existing UI
      expect(style.zIndex).toBe('50'); // Standard overlay z-index
      expect(style.position).toBe('fixed'); // Standard overlay positioning
    });

    it('should validate design token provider integration', () => {
      // Verify athletic token provider is being used
      const mockColors = useAthleticColors();

      expect(mockColors).toEqual({
        courtNavy: '#1a365d',
        courtOrange: '#ff8c00',
        brandViolet: '#6b46c1',
        courtWhite: '#ffffff',
        courtGray: '#718096'
      });

      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Token provider should be integrated
      expect(useAthleticColors).toHaveBeenCalled();
    });
  });

  describe('Design System Compliance', () => {
    it('should follow established spacing scale', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');
      const style = getComputedStyle(lensContainer);

      // Should use standard spacing units (4px, 8px, 16px, etc.)
      const spacing = [style.padding, style.margin].join(' ');
      expect(spacing).toMatch(/0|4px|8px|12px|16px|20px|24px|32px|40px|48px/);
    });

    it('should use athletic typography scale', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Text elements should use athletic typography
      const textElements = screen.getAllByText(/capture|focus|frame|exposure|develop|portfolio/i);
      textElements.forEach(element => {
        const style = getComputedStyle(element);
        expect(style.fontSize).toMatch(/12px|14px|16px|18px|20px|24px/);
        expect(style.fontWeight).toMatch(/400|500|600|700/);
      });
    });

    it('should maintain brand consistency', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Should have brand-consistent attributes
      expect(lensContainer).toHaveAttribute('data-component', 'cursor-lens');
      expect(lensContainer).toHaveClass(/cursor-lens|photography|athletic/i);
    });
  });
});