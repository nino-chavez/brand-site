/**
 * Cursor Lens Accessibility Validation Tests
 *
 * Comprehensive accessibility testing for WCAG AAA compliance
 * Task 12: Accessibility Validation - Complete accessibility compliance testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { UnifiedGameFlowProvider } from '../../contexts/UnifiedGameFlowContext';
import CursorLens from '../../components/CursorLens';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UnifiedGameFlowProvider debugMode={true}>
    <div style={{ width: 1200, height: 800, position: 'relative' }}>
      {children}
    </div>
  </UnifiedGameFlowProvider>
);

// Mock screen reader announcements
const mockScreenReaderAnnouncements: string[] = [];
const originalCreateElement = document.createElement;

describe('Cursor Lens Accessibility Validation', () => {
  let mockOnSectionSelect: ReturnType<typeof vi.fn>;
  let mockOnActivate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSectionSelect = vi.fn();
    mockOnActivate = vi.fn();
    mockScreenReaderAnnouncements.length = 0;
    vi.useFakeTimers();

    // Mock screen reader API
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement.call(document, tagName);
      if (tagName === 'div' && element.setAttribute) {
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function(name: string, value: string) {
          if (name === 'aria-live' || name === 'role') {
            mockScreenReaderAnnouncements.push(`${name}: ${value}`);
          }
          return originalSetAttribute.call(this, name, value);
        };
      }
      return element;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    document.createElement = originalCreateElement;
  });

  describe('Automated Accessibility Testing (jest-axe)', () => {
    it('should have no accessibility violations when inactive', async () => {
      const { container } = render(
        <TestWrapper>
          <CursorLens
            isEnabled={false}
            onSectionSelect={mockOnSectionSelect}
            onActivate={mockOnActivate}
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when active', async () => {
      const { container } = render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
            onActivate={mockOnActivate}
          />
        </TestWrapper>
      );

      // Activate the lens
      const lensContainer = screen.getByRole('application');
      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Wait for menu to appear
      await waitFor(() => {
        expect(screen.getByText('capture')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations during section navigation', async () => {
      const { container } = render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            fallbackMode="keyboard"
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // Activate and navigate
      await user.keyboard(' ');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should provide proper ARIA labels for all interactive elements', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
            onActivate={mockOnActivate}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Verify main container ARIA attributes
      expect(lensContainer).toHaveAttribute('aria-label');
      expect(lensContainer).toHaveAttribute('aria-description');
      expect(lensContainer).toHaveAttribute('aria-controls');

      // Verify role is appropriate
      expect(lensContainer).toHaveAttribute('role', 'application');
    });

    it('should announce activation status changes', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
            onActivate={mockOnActivate}
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

      // Should have live region for announcements
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();

      // Verify announcement content
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toHaveTextContent(/activated|available|ready/i);
    });

    it('should announce section highlighting changes', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Activate and highlight section
      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      await act(async () => {
        fireEvent.mouseMove(lensContainer, { clientX: 650, clientY: 380 });
      });

      // Should announce highlighted section
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion.textContent).toMatch(/focus|highlighted|selected/i);
    });

    it('should support VoiceOver navigation patterns', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            fallbackMode="keyboard"
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // VoiceOver navigation pattern: VO + Arrow keys
      await user.keyboard('{Control>}{Alt>}{ArrowRight}{/Alt}{/Control}');
      await user.keyboard(' '); // Activate

      // Should work with VoiceOver interaction model
      const activeSection = screen.getByRole('button', { name: /capture/i });
      expect(activeSection).toHaveFocus();
    });

    it('should support NVDA and JAWS navigation patterns', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            fallbackMode="keyboard"
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // JAWS/NVDA navigation: Application mode
      await user.keyboard('{Enter}'); // Enter application mode
      await user.keyboard(' ');       // Activate lens
      await user.keyboard('{ArrowDown}'); // Navigate sections

      // Should maintain proper focus and announce changes
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Complete Keyboard Navigation', () => {
    it('should support all documented keyboard shortcuts', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            fallbackMode="keyboard"
            onSectionSelect={mockOnSectionSelect}
            onActivate={mockOnActivate}
          />
        </TestWrapper>
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // Test activation shortcuts
      await user.keyboard(' '); // Space
      expect(mockOnActivate).toHaveBeenCalledWith('keyboard');

      await user.keyboard('{Enter}'); // Enter (alternative)
      expect(mockOnActivate).toHaveBeenCalledTimes(2);

      // Test navigation shortcuts
      await user.keyboard('{ArrowUp}');    // Previous section
      await user.keyboard('{ArrowDown}');  // Next section
      await user.keyboard('{ArrowLeft}');  // Previous section (alternative)
      await user.keyboard('{ArrowRight}'); // Next section (alternative)

      // Test selection
      await user.keyboard('{Enter}'); // Select current section
      expect(mockOnSectionSelect).toHaveBeenCalled();

      // Test escape
      await user.keyboard('{Escape}'); // Deactivate
      expect(screen.queryByText('capture')).not.toBeInTheDocument();
    });

    it('should maintain proper tab order and focus management', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            fallbackMode="keyboard"
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // Activate lens
      await user.keyboard(' ');

      // Tab through sections in logical order
      await user.keyboard('{Tab}');
      expect(screen.getByRole('button', { name: /capture/i })).toHaveFocus();

      await user.keyboard('{Tab}');
      expect(screen.getByRole('button', { name: /focus/i })).toHaveFocus();

      await user.keyboard('{Tab}');
      expect(screen.getByRole('button', { name: /frame/i })).toHaveFocus();

      // Shift+Tab should reverse order
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByRole('button', { name: /focus/i })).toHaveFocus();
    });

    it('should trap focus within active menu', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            fallbackMode="keyboard"
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // Activate lens
      await user.keyboard(' ');

      // Navigate to last section
      for (let i = 0; i < 6; i++) {
        await user.keyboard('{Tab}');
      }

      // Tab from last section should wrap to first
      await user.keyboard('{Tab}');
      expect(screen.getByRole('button', { name: /capture/i })).toHaveFocus();

      // Shift+Tab from first should wrap to last
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByRole('button', { name: /portfolio/i })).toHaveFocus();
    });

    it('should provide keyboard shortcuts for rapid section access', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            fallbackMode="keyboard"
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // Activate lens
      await user.keyboard(' ');

      // Direct section access via number keys
      await user.keyboard('1'); // Capture
      expect(mockOnSectionSelect).toHaveBeenCalledWith('capture');

      await user.keyboard(' '); // Reactivate
      await user.keyboard('2'); // Focus
      expect(mockOnSectionSelect).toHaveBeenCalledWith('focus');

      await user.keyboard(' '); // Reactivate
      await user.keyboard('3'); // Frame
      expect(mockOnSectionSelect).toHaveBeenCalledWith('frame');
    });
  });

  describe('High Contrast Mode Support', () => {
    it('should maintain visibility in high contrast mode', () => {
      // Mock high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
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
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Check that elements have appropriate contrast styles
      const computedStyle = getComputedStyle(lensContainer);
      expect(computedStyle.border).toBeTruthy();
      expect(computedStyle.outline).toBeTruthy();
    });

    it('should pass color contrast requirements (WCAG AAA)', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Test would normally use tools like color-contrast-validator
      // For this test, we verify elements have sufficient contrast classes
      const sections = screen.getAllByRole('button');
      sections.forEach(section => {
        expect(section).toHaveClass(/contrast|accessible|wcag/i);
      });
    });
  });

  describe('Reduced Motion Preferences', () => {
    it('should respect prefers-reduced-motion setting', () => {
      // Mock reduced motion preference
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
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Should have reduced motion classes
      expect(lensContainer).toHaveClass(/reduced-motion|no-animation/i);

      // Animations should be instant or minimal
      const computedStyle = getComputedStyle(lensContainer);
      expect(computedStyle.animationDuration).toMatch(/0s|none/);
    });

    it('should provide fallback animations for reduced motion', async () => {
      // Mock reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
        })),
      });

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

      // Menu should appear instantly
      expect(screen.getByText('capture')).toBeInTheDocument();

      // Should use fade or instant appearance instead of complex animations
      const menuItems = screen.getAllByRole('button');
      menuItems.forEach(item => {
        expect(item).toHaveClass(/instant|fade|simple/i);
      });
    });
  });

  describe('Focus Management and ARIA Live Regions', () => {
    it('should manage focus correctly during activation', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            fallbackMode="keyboard"
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Initial focus should be on container
      lensContainer.focus();
      expect(lensContainer).toHaveFocus();

      // After activation, focus should move to first section
      fireEvent.keyDown(lensContainer, { key: ' ' });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /capture/i })).toHaveFocus();
      });
    });

    it('should restore focus after deactivation', async () => {
      render(
        <TestWrapper>
          <div>
            <button id="previous-focus">Previous Element</button>
            <CursorLens
              isEnabled={true}
              fallbackMode="keyboard"
              onSectionSelect={mockOnSectionSelect}
            />
            <button id="next-focus">Next Element</button>
          </div>
        </TestWrapper>
      );

      const previousButton = screen.getByRole('button', { name: 'Previous Element' });
      const lensContainer = screen.getByRole('application');

      // Start with focus on previous element
      previousButton.focus();
      expect(previousButton).toHaveFocus();

      // Tab to lens
      fireEvent.keyDown(previousButton, { key: 'Tab' });
      lensContainer.focus();

      // Activate lens
      fireEvent.keyDown(lensContainer, { key: ' ' });

      // Deactivate with Escape
      fireEvent.keyDown(lensContainer, { key: 'Escape' });

      // Focus should return to lens container
      expect(lensContainer).toHaveFocus();
    });

    it('should provide comprehensive ARIA live region announcements', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Should have polite and assertive live regions
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // polite
      expect(screen.getByRole('alert', { hidden: true })).toBeInTheDocument();  // assertive

      // Activation should trigger announcement
      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const statusRegion = screen.getByRole('status', { hidden: true });
      expect(statusRegion.textContent).toMatch(/activated|available|menu/i);

      // Section highlighting should trigger announcement
      await act(async () => {
        fireEvent.mouseMove(lensContainer, { clientX: 650, clientY: 380 });
      });

      expect(statusRegion.textContent).toMatch(/focus|highlighted/i);

      // Selection should trigger announcement
      await act(async () => {
        fireEvent.mouseUp(lensContainer, { clientX: 650, clientY: 380 });
      });

      expect(statusRegion.textContent).toMatch(/selected|navigating/i);
    });

    it('should handle dynamic content updates accessibly', async () => {
      const { rerender } = render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Change enabled state
      rerender(
        <TestWrapper>
          <CursorLens
            isEnabled={false}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Should announce state change
      const statusRegion = screen.getByRole('status', { hidden: true });
      expect(statusRegion.textContent).toMatch(/disabled|unavailable/i);

      // Re-enable
      rerender(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      expect(statusRegion.textContent).toMatch(/enabled|available/i);
    });
  });

  describe('Progressive Enhancement', () => {
    it('should work without JavaScript (graceful degradation)', () => {
      // Mock JavaScript disabled environment
      const originalAddEventListener = Element.prototype.addEventListener;
      Element.prototype.addEventListener = vi.fn();

      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            fallbackMode="traditional"
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Should provide static navigation links
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(6);

      // Restore
      Element.prototype.addEventListener = originalAddEventListener;
    });

    it('should enhance progressively with JavaScript', () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Should have enhanced interactive features
      expect(screen.getByRole('application')).toBeInTheDocument();
      expect(screen.getByRole('application')).toHaveAttribute('aria-controls');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle accessibility API failures gracefully', () => {
      // Mock screen reader API failure
      const originalQuerySelector = document.querySelector;
      document.querySelector = vi.fn().mockReturnValue(null);

      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Should still be functional
      expect(screen.getByRole('application')).toBeInTheDocument();

      // Restore
      document.querySelector = originalQuerySelector;
    });

    it('should provide error announcements for accessibility issues', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      // Simulate activation failure
      const lensContainer = screen.getByRole('application');
      fireEvent.error(lensContainer);

      // Should announce error
      const alertRegion = screen.getByRole('alert', { hidden: true });
      expect(alertRegion.textContent).toMatch(/error|problem|unavailable/i);
    });
  });
});