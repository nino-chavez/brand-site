/**
 * Cursor Lens End-to-End Workflow Tests
 *
 * Tests complete user workflows from cursor activation to navigation
 * Task 11: End-to-End Testing - Complete cursor activation to navigation workflows
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { UnifiedGameFlowProvider } from '../../contexts/UnifiedGameFlowContext';
import CursorLens from '../../components/CursorLens';
import type { PhotoWorkflowSection } from '../../types/cursor-lens';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UnifiedGameFlowProvider debugMode={true}>
    <div style={{ width: 1200, height: 800, position: 'relative' }}>
      {children}
    </div>
  </UnifiedGameFlowProvider>
);

// Mock browser APIs for E2E testing
const mockViewport = {
  width: 1200,
  height: 800
};

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: mockViewport.width,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: mockViewport.height,
});

describe('Cursor Lens E2E Workflows', () => {
  let mockOnSectionSelect: ReturnType<typeof vi.fn>;
  let mockOnActivate: ReturnType<typeof vi.fn>;
  let mockOnDeactivate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSectionSelect = vi.fn();
    mockOnActivate = vi.fn();
    mockOnDeactivate = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Complete Click-and-Hold Workflow', () => {
    it('should complete cursor activation → section highlighting → navigation sequence', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
            onActivate={mockOnActivate}
            onDeactivate={mockOnDeactivate}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Step 1: Mouse down to start activation (click-and-hold)
      await act(async () => {
        fireEvent.mouseDown(lensContainer, {
          clientX: 600, // Center of 1200px viewport
          clientY: 400, // Center of 800px viewport
          button: 0
        });
      });

      // Step 2: Wait for activation delay (100ms)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Verify activation callback was called
      expect(mockOnActivate).toHaveBeenCalledWith('click-hold');

      // Step 3: Verify radial menu appears
      await waitFor(() => {
        expect(screen.getByText('capture')).toBeInTheDocument();
        expect(screen.getByText('focus')).toBeInTheDocument();
        expect(screen.getByText('frame')).toBeInTheDocument();
        expect(screen.getByText('exposure')).toBeInTheDocument();
        expect(screen.getByText('develop')).toBeInTheDocument();
        expect(screen.getByText('portfolio')).toBeInTheDocument();
      });

      // Step 4: Move cursor to highlight a section (focus section at 2 o'clock)
      const focusSection = screen.getByText('focus');
      await act(async () => {
        fireEvent.mouseMove(lensContainer, {
          clientX: 650, // Slightly right of center
          clientY: 350  // Above center
        });
      });

      // Step 5: Verify section highlighting within 16ms requirement
      act(() => {
        vi.advanceTimersByTime(16);
      });

      await waitFor(() => {
        expect(focusSection).toHaveClass(/highlighted|selected|active/);
      });

      // Step 6: Release mouse to select section
      await act(async () => {
        fireEvent.mouseUp(lensContainer, {
          clientX: 650,
          clientY: 350,
          button: 0
        });
      });

      // Step 7: Verify navigation was triggered
      expect(mockOnSectionSelect).toHaveBeenCalledWith('focus');
      expect(mockOnDeactivate).toHaveBeenCalled();
    });

    it('should handle rapid section changes during highlighting', async () => {
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

      // Rapidly move through multiple sections
      const sections = [
        { name: 'capture', x: 600, y: 350 },   // 12 o'clock
        { name: 'focus', x: 650, y: 380 },     // 2 o'clock
        { name: 'frame', x: 650, y: 450 },     // 4 o'clock
        { name: 'exposure', x: 600, y: 480 },  // 6 o'clock
      ];

      for (const section of sections) {
        await act(async () => {
          fireEvent.mouseMove(lensContainer, {
            clientX: section.x,
            clientY: section.y
          });
        });

        // Advance by one frame (16ms) to test responsiveness
        act(() => {
          vi.advanceTimersByTime(16);
        });
      }

      // Select final section
      await act(async () => {
        fireEvent.mouseUp(lensContainer, { clientX: 600, clientY: 480 });
      });

      expect(mockOnSectionSelect).toHaveBeenCalledWith('exposure');
    });
  });

  describe('Hover Activation Workflow', () => {
    it('should complete hover activation → navigation sequence', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            activationDelay={800}
            onSectionSelect={mockOnSectionSelect}
            onActivate={mockOnActivate}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Step 1: Start hovering
      await act(async () => {
        fireEvent.mouseEnter(lensContainer, {
          clientX: 600,
          clientY: 400
        });
      });

      // Step 2: Wait for hover delay (800ms)
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Verify activation callback was called
      expect(mockOnActivate).toHaveBeenCalledWith('hover');

      // Step 3: Move to select section
      await act(async () => {
        fireEvent.mouseMove(lensContainer, {
          clientX: 570, // Left of center
          clientY: 450  // Below center (develop section at 8 o'clock)
        });
      });

      // Step 4: Click to select
      await act(async () => {
        fireEvent.click(lensContainer, {
          clientX: 570,
          clientY: 450
        });
      });

      expect(mockOnSectionSelect).toHaveBeenCalledWith('develop');
    });
  });

  describe('Viewport Edge Navigation Scenarios', () => {
    it('should handle activation near viewport edges with repositioning', async () => {
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

      // Test near left edge (should trigger repositioning)
      await act(async () => {
        fireEvent.mouseDown(lensContainer, {
          clientX: 30,  // Close to left edge
          clientY: 400
        });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(mockOnActivate).toHaveBeenCalledWith('click-hold');

      // Verify menu appears (repositioned away from edge)
      await waitFor(() => {
        expect(screen.getByText('capture')).toBeInTheDocument();
      });

      // Check repositioning indicator
      expect(screen.getByText(/repositioned|constrained/i)).toBeInTheDocument();

      // Clean up
      await act(async () => {
        fireEvent.mouseUp(lensContainer);
      });

      // Test near bottom edge
      await act(async () => {
        fireEvent.mouseDown(lensContainer, {
          clientX: 600,
          clientY: 770  // Close to bottom edge
        });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('portfolio')).toBeInTheDocument();
      });
    });

    it('should prioritize sections when space is constrained', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
            viewportDimensions={{ width: 400, height: 300, edgeClearance: 40 }}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Activate in very constrained space
      await act(async () => {
        fireEvent.mouseDown(lensContainer, {
          clientX: 200,
          clientY: 150
        });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // In constrained space, should show priority sections only
      await waitFor(() => {
        // High priority sections should be visible
        expect(screen.getByText('capture')).toBeInTheDocument();
        expect(screen.getByText('portfolio')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Workflows', () => {
    it('should support complete keyboard-only navigation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

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

      // Activate with keyboard
      await user.keyboard(' '); // Space key activation

      expect(mockOnActivate).toHaveBeenCalledWith('keyboard');

      // Navigate through sections with arrow keys
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');

      // Select with Enter
      await user.keyboard('{Enter}');

      expect(mockOnSectionSelect).toHaveBeenCalled();
    });

    it('should provide proper screen reader announcements', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Verify ARIA labels are present
      expect(lensContainer).toHaveAttribute('aria-label');
      expect(lensContainer).toHaveAttribute('aria-description');

      // Test activation announcements
      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should have live region for announcements
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Mobile Touch Interaction Flows', () => {
    it('should handle long-press activation on mobile', async () => {
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

      // Start touch
      await act(async () => {
        fireEvent.touchStart(lensContainer, {
          touches: [{ clientX: 600, clientY: 400 }]
        });
      });

      // Wait for long-press duration (750ms)
      act(() => {
        vi.advanceTimersByTime(750);
      });

      expect(mockOnActivate).toHaveBeenCalledWith('touch-long-press');

      // Move and release
      await act(async () => {
        fireEvent.touchMove(lensContainer, {
          touches: [{ clientX: 630, clientY: 380 }]
        });
      });

      await act(async () => {
        fireEvent.touchEnd(lensContainer, {
          changedTouches: [{ clientX: 630, clientY: 380 }]
        });
      });

      expect(mockOnSectionSelect).toHaveBeenCalled();
    });
  });

  describe('Cross-Browser Compatibility', () => {
    const browsers = [
      { name: 'Chrome', userAgent: 'Chrome/91.0' },
      { name: 'Firefox', userAgent: 'Firefox/89.0' },
      { name: 'Safari', userAgent: 'Safari/14.1' }
    ];

    browsers.forEach(browser => {
      it(`should work correctly in ${browser.name}`, async () => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          value: browser.userAgent
        });

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

        // Test basic activation workflow
        await act(async () => {
          fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
        });

        act(() => {
          vi.advanceTimersByTime(100);
        });

        expect(mockOnActivate).toHaveBeenCalled();

        await waitFor(() => {
          expect(screen.getByText('capture')).toBeInTheDocument();
        });

        await act(async () => {
          fireEvent.mouseUp(lensContainer, { clientX: 600, clientY: 350 });
        });

        expect(mockOnSectionSelect).toHaveBeenCalledWith('capture');
      });
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain responsiveness during rapid interactions', async () => {
      render(
        <TestWrapper>
          <CursorLens
            isEnabled={true}
            onSectionSelect={mockOnSectionSelect}
          />
        </TestWrapper>
      );

      const lensContainer = screen.getByRole('application');

      // Simulate rapid mouse movements (stress test)
      const rapidMovements = Array.from({ length: 50 }, (_, i) => ({
        x: 600 + Math.sin(i * 0.1) * 100,
        y: 400 + Math.cos(i * 0.1) * 100
      }));

      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Rapid movements
      for (const movement of rapidMovements) {
        await act(async () => {
          fireEvent.mouseMove(lensContainer, {
            clientX: movement.x,
            clientY: movement.y
          });
        });
        // Advance minimal time to test frame rate
        act(() => {
          vi.advanceTimersByTime(16);
        });
      }

      // Should still be responsive
      await act(async () => {
        fireEvent.mouseUp(lensContainer, { clientX: 600, clientY: 350 });
      });

      expect(mockOnSectionSelect).toHaveBeenCalled();
    });

    it('should handle concurrent activation attempts gracefully', async () => {
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

      // Multiple concurrent activations
      await act(async () => {
        fireEvent.mouseDown(lensContainer, { clientX: 600, clientY: 400 });
        fireEvent.touchStart(lensContainer, {
          touches: [{ clientX: 600, clientY: 400 }]
        });
        fireEvent.mouseEnter(lensContainer);
      });

      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Should handle gracefully without errors
      expect(mockOnActivate).toHaveBeenCalled();
      expect(screen.getByText('capture')).toBeInTheDocument();
    });
  });
});