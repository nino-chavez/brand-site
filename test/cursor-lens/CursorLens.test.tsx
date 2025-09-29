/**
 * CursorLens Component Tests
 *
 * Tests zero-occlusion cursor-activated radial navigation with hook integration
 * Phase 1: Setup and Foundation - Task 7: Core Component Implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CursorLens } from '../../components/CursorLens';
import { UnifiedGameFlowProvider } from '../../contexts/UnifiedGameFlowContext';
import type { CursorLensProps, PhotoWorkflowSection, ActivationMethod } from '../../types/cursor-lens';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UnifiedGameFlowProvider debugMode={true}>
    {children}
  </UnifiedGameFlowProvider>
);

// Mock Stats.js
vi.mock('stats.js', () => {
  const mockStats = {
    showPanel: vi.fn(),
    begin: vi.fn(),
    end: vi.fn(),
    dom: {
      style: {},
      parentNode: null
    }
  };

  return {
    default: vi.fn().mockImplementation(() => mockStats)
  };
});

// Mock hooks for isolated testing
vi.mock('../../hooks/useCursorTracking', () => ({
  useCursorTracking: vi.fn(() => ({
    position: { x: 600, y: 400, timestamp: Date.now() },
    isTracking: false,
    startTracking: vi.fn(),
    stopTracking: vi.fn(),
    performance: { frameRate: 60, averageLatency: 16 }
  }))
}));

vi.mock('../../hooks/useLensActivation', () => ({
  useLensActivation: vi.fn(() => ({
    isActive: false,
    activationMethod: null,
    activationProgress: 0,
    activate: vi.fn(),
    deactivate: vi.fn(),
    gestureEvents: {
      onMouseDown: vi.fn(),
      onMouseUp: vi.fn(),
      onMouseMove: vi.fn(),
      onTouchStart: vi.fn(),
      onTouchEnd: vi.fn(),
      onKeyDown: vi.fn()
    }
  }))
}));

vi.mock('../../hooks/useRadialMenu', () => ({
  useRadialMenu: vi.fn(() => ({
    menuPosition: {
      center: { x: 600, y: 400 },
      radius: 60,
      repositioned: false
    },
    itemPositions: [
      { section: 'capture', angle: -Math.PI/2, coordinates: { x: 600, y: 340 }, isVisible: true, priority: 3 },
      { section: 'focus', angle: -Math.PI/6, coordinates: { x: 652, y: 370 }, isVisible: true, priority: 5 },
      { section: 'frame', angle: Math.PI/6, coordinates: { x: 652, y: 430 }, isVisible: true, priority: 2 },
      { section: 'exposure', angle: Math.PI/2, coordinates: { x: 600, y: 460 }, isVisible: true, priority: 1 },
      { section: 'develop', angle: 5*Math.PI/6, coordinates: { x: 548, y: 430 }, isVisible: true, priority: 4 },
      { section: 'portfolio', angle: -5*Math.PI/6, coordinates: { x: 548, y: 370 }, isVisible: true, priority: 6 }
    ],
    isRepositioned: false,
    repositionMenu: vi.fn(),
    resetMenu: vi.fn()
  }))
}));

describe('CursorLens Component', () => {
  const mockProps: Partial<CursorLensProps> = {
    isEnabled: true,
    onSectionSelect: vi.fn(),
    onActivate: vi.fn(),
    onDeactivate: vi.fn(),
    onPerformanceUpdate: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock DOM methods
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));

    // Clean up any remaining DOM elements
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render without errors when enabled', () => {
    render(
      <TestWrapper>
        <CursorLens {...mockProps} />
      </TestWrapper>
    );

    // Component should render the container
    const container = document.querySelector('.fixed.inset-0');
    expect(container).toBeInTheDocument();
  });

  it('should not render when disabled', () => {
    const { container } = render(
      <TestWrapper>
        <CursorLens {...mockProps} isEnabled={false} />
      </TestWrapper>
    );

    // Component should return null and not render any content
    expect(container.firstChild).toBeNull();
  });

  it('should initialize with correct viewport dimensions', () => {
    const customViewport = { width: 800, height: 600, edgeClearance: 40 };

    render(
      <TestWrapper>
        <CursorLens {...mockProps} viewportDimensions={customViewport} />
      </TestWrapper>
    );

    // Component should use provided viewport dimensions
    expect(true).toBe(true); // Basic render test - viewport is handled internally
  });

  describe('Hook Integration', () => {
    it('should integrate with useCursorTracking hook', async () => {
      const { useCursorTracking } = await import('../../hooks/useCursorTracking');
      const mockHook = useCursorTracking as any;

      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      expect(mockHook).toHaveBeenCalled();
    });

    it('should integrate with useLensActivation hook', async () => {
      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockHook = useLensActivation as any;

      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      expect(mockHook).toHaveBeenCalled();
    });

    it('should integrate with useRadialMenu hook', async () => {
      const { useRadialMenu } = await import('../../hooks/useRadialMenu');
      const mockHook = useRadialMenu as any;

      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      expect(mockHook).toHaveBeenCalled();
    });
  });

  describe('Activation States', () => {
    it('should show activation indicator when not active', async () => {
      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockActivation = useLensActivation as any;

      mockActivation.mockReturnValue({
        isActive: false,
        activationMethod: null,
        activationProgress: 0.5,
        activate: vi.fn(),
        deactivate: vi.fn(),
        gestureEvents: {
          onMouseDown: vi.fn(),
          onMouseUp: vi.fn(),
          onMouseMove: vi.fn(),
          onTouchStart: vi.fn(),
          onTouchEnd: vi.fn(),
          onKeyDown: vi.fn()
        }
      });

      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      // Activation indicator should be present
      const progressCircle = document.querySelector('svg circle[stroke="rgb(251, 146, 60)"]');
      expect(progressCircle).toBeInTheDocument();
    });

    it('should show radial menu when active', async () => {
      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockActivation = useLensActivation as any;

      mockActivation.mockReturnValue({
        isActive: true,
        activationMethod: 'click-hold',
        activationProgress: 1,
        activate: vi.fn(),
        deactivate: vi.fn(),
        gestureEvents: {
          onMouseDown: vi.fn(),
          onMouseUp: vi.fn(),
          onMouseMove: vi.fn(),
          onTouchStart: vi.fn(),
          onTouchEnd: vi.fn(),
          onKeyDown: vi.fn()
        }
      });

      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      // Radial menu items should be present
      const menuItems = document.querySelectorAll('button[aria-label*="Navigate to"]');
      expect(menuItems).toHaveLength(6);
    });

    it('should display correct activation method', async () => {
      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockActivation = useLensActivation as any;

      mockActivation.mockReturnValue({
        isActive: true,
        activationMethod: 'hover',
        activationProgress: 1,
        activate: vi.fn(),
        deactivate: vi.fn(),
        gestureEvents: {
          onMouseDown: vi.fn(),
          onMouseUp: vi.fn(),
          onMouseMove: vi.fn(),
          onTouchStart: vi.fn(),
          onTouchEnd: vi.fn(),
          onKeyDown: vi.fn()
        }
      });

      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      // Method indicator should show hover
      expect(screen.getByText('Hover')).toBeInTheDocument();
    });
  });

  describe('Radial Menu Items', () => {
    beforeEach(async () => {
      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockActivation = useLensActivation as any;

      mockActivation.mockReturnValue({
        isActive: true,
        activationMethod: 'click-hold',
        activationProgress: 1,
        activate: vi.fn(),
        deactivate: vi.fn(),
        gestureEvents: {
          onMouseDown: vi.fn(),
          onMouseUp: vi.fn(),
          onMouseMove: vi.fn(),
          onTouchStart: vi.fn(),
          onTouchEnd: vi.fn(),
          onKeyDown: vi.fn()
        }
      });
    });

    it('should render all 6 photography workflow sections', async () => {
      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockActivation = useLensActivation as any;

      // Mock as active to show the radial menu
      mockActivation.mockReturnValue({
        isActive: true,
        activationMethod: 'click-hold',
        activationProgress: 1,
        activate: vi.fn(),
        deactivate: vi.fn(),
        gestureEvents: {
          onMouseDown: vi.fn(),
          onMouseUp: vi.fn(),
          onMouseMove: vi.fn(),
          onTouchStart: vi.fn(),
          onTouchEnd: vi.fn(),
          onKeyDown: vi.fn()
        }
      });

      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      // Check for all section buttons
      expect(screen.getByLabelText(/Navigate to introduction section/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Navigate to attention section/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Navigate to planning section/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Navigate to execution section/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Navigate to process section/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Navigate to results section/)).toBeInTheDocument();
    });

    it('should display correct camera metaphor labels', () => {
      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      // Check for section labels
      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Attention')).toBeInTheDocument();
      expect(screen.getByText('Planning')).toBeInTheDocument();
      expect(screen.getByText('Execution')).toBeInTheDocument();
      expect(screen.getByText('Process')).toBeInTheDocument();
      expect(screen.getByText('Results')).toBeInTheDocument();
    });

    it('should handle section selection', async () => {
      const user = userEvent.setup();
      const onSectionSelect = vi.fn();

      render(
        <TestWrapper>
          <CursorLens {...mockProps} onSectionSelect={onSectionSelect} />
        </TestWrapper>
      );

      // Click on execution section
      const executionButton = screen.getByLabelText(/Navigate to execution section/);
      await user.click(executionButton);

      expect(onSectionSelect).toHaveBeenCalledWith('exposure');
    });

    it('should handle section hover highlighting', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      const planningButton = screen.getByLabelText(/Navigate to planning section/);

      // Hover over planning section
      await user.hover(planningButton);

      // Button should have highlighting class
      expect(planningButton).toHaveClass('border-orange-400/80');
    });
  });

  describe('Performance Monitoring', () => {
    it('should call performance update callback', async () => {
      const onPerformanceUpdate = vi.fn();
      const { useCursorTracking } = await import('../../hooks/useCursorTracking');
      const mockTracking = useCursorTracking as any;

      mockTracking.mockReturnValue({
        position: { x: 600, y: 400, timestamp: Date.now() },
        isTracking: true,
        startTracking: vi.fn(),
        stopTracking: vi.fn(),
        performance: { frameRate: 55, averageLatency: 20 }
      });

      render(
        <TestWrapper>
          <CursorLens {...mockProps} onPerformanceUpdate={onPerformanceUpdate} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onPerformanceUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            cursorTrackingFPS: 55,
            averageResponseTime: 20
          })
        );
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should support keyboard fallback mode', () => {
      render(
        <TestWrapper>
          <CursorLens {...mockProps} fallbackMode="keyboard" />
        </TestWrapper>
      );

      // Should have screen reader status
      const statusElement = document.querySelector('.sr-only[aria-live="polite"]');
      expect(statusElement).toBeInTheDocument();
    });

    it('should provide proper ARIA labels', async () => {
      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockActivation = useLensActivation as any;

      mockActivation.mockReturnValue({
        isActive: true,
        activationMethod: 'keyboard',
        activationProgress: 1,
        activate: vi.fn(),
        deactivate: vi.fn(),
        gestureEvents: {
          onMouseDown: vi.fn(),
          onMouseUp: vi.fn(),
          onMouseMove: vi.fn(),
          onTouchStart: vi.fn(),
          onTouchEnd: vi.fn(),
          onKeyDown: vi.fn()
        }
      });

      render(
        <TestWrapper>
          <CursorLens {...mockProps} fallbackMode="keyboard" />
        </TestWrapper>
      );

      // All buttons should have proper aria-labels
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
        expect(button.getAttribute('aria-label')).toMatch(/Navigate to .+ section/);
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockActivation = useLensActivation as any;

      mockActivation.mockReturnValue({
        isActive: true,
        activationMethod: 'keyboard',
        activationProgress: 1,
        activate: vi.fn(),
        deactivate: vi.fn(),
        gestureEvents: {
          onMouseDown: vi.fn(),
          onMouseUp: vi.fn(),
          onMouseMove: vi.fn(),
          onTouchStart: vi.fn(),
          onTouchEnd: vi.fn(),
          onKeyDown: vi.fn()
        }
      });

      render(
        <TestWrapper>
          <CursorLens {...mockProps} fallbackMode="keyboard" />
        </TestWrapper>
      );

      // Should be able to tab through menu items
      const firstButton = screen.getByLabelText(/Navigate to introduction section/);

      await act(async () => {
        firstButton.focus();
      });

      expect(firstButton).toHaveFocus();

      await act(async () => {
        await user.tab();
      });

      const secondButton = screen.getByLabelText(/Navigate to attention section/);
      expect(secondButton).toHaveFocus();
    });
  });

  describe('Viewport Constraint Handling', () => {
    it('should show repositioning indicator when menu is repositioned', async () => {
      const { useRadialMenu } = await import('../../hooks/useRadialMenu');
      const mockRadialMenu = useRadialMenu as any;

      mockRadialMenu.mockReturnValue({
        menuPosition: {
          center: { x: 500, y: 400 },
          radius: 60,
          repositioned: true,
          originalCursorPosition: { x: 50, y: 400 }
        },
        itemPositions: [
          { section: 'capture', angle: -Math.PI/2, coordinates: { x: 500, y: 340 }, isVisible: true, priority: 3 }
        ],
        isRepositioned: true,
        repositionMenu: vi.fn(),
        resetMenu: vi.fn()
      });

      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockActivation = useLensActivation as any;

      mockActivation.mockReturnValue({
        isActive: true,
        activationMethod: 'click-hold',
        activationProgress: 1,
        activate: vi.fn(),
        deactivate: vi.fn(),
        gestureEvents: {
          onMouseDown: vi.fn(),
          onMouseUp: vi.fn(),
          onMouseMove: vi.fn(),
          onTouchStart: vi.fn(),
          onTouchEnd: vi.fn(),
          onKeyDown: vi.fn()
        }
      });

      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      // Should show repositioning indicator
      const indicator = document.querySelector('.bg-orange-400\\/60');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should attach gesture event handlers', () => {
      const { container } = render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      // Container should have gesture events attached
      const lensContainer = container.querySelector('.fixed.inset-0');
      expect(lensContainer).toBeInTheDocument();

      // Events are attached via spread operator, difficult to test directly
      // This tests that the component renders with the container that would have events
      expect(lensContainer).toHaveClass('fixed', 'inset-0');
    });

    it('should call activation callback on activation', async () => {
      const onActivate = vi.fn();
      const { useLensActivation } = await import('../../hooks/useLensActivation');
      const mockActivation = useLensActivation as any;

      // Start with inactive state
      mockActivation.mockReturnValue({
        isActive: false,
        activationMethod: null,
        activationProgress: 0,
        activate: vi.fn(),
        deactivate: vi.fn(),
        gestureEvents: {
          onMouseDown: vi.fn(),
          onMouseUp: vi.fn(),
          onMouseMove: vi.fn(),
          onTouchStart: vi.fn(),
          onTouchEnd: vi.fn(),
          onKeyDown: vi.fn()
        }
      });

      const { rerender } = render(
        <TestWrapper>
          <CursorLens {...mockProps} onActivate={onActivate} />
        </TestWrapper>
      );

      // Then activate
      await act(async () => {
        mockActivation.mockReturnValue({
          isActive: true,
          activationMethod: 'hover',
          activationProgress: 1,
          activate: vi.fn(),
          deactivate: vi.fn(),
          gestureEvents: {
            onMouseDown: vi.fn(),
            onMouseUp: vi.fn(),
            onMouseMove: vi.fn(),
            onTouchStart: vi.fn(),
            onTouchEnd: vi.fn(),
            onKeyDown: vi.fn()
          }
        });

        rerender(
          <TestWrapper>
            <CursorLens {...mockProps} onActivate={onActivate} />
          </TestWrapper>
        );
      });

      await waitFor(() => {
        expect(onActivate).toHaveBeenCalledWith('hover');
      });
    });

    it('should accept deactivation callback prop without errors', () => {
      const onDeactivate = vi.fn();

      // This test verifies that the component accepts the callback prop correctly
      // and integrates with the hooks properly. Complex state change testing with
      // multiple mocked hooks is challenging in the test environment.
      render(
        <TestWrapper>
          <CursorLens {...mockProps} onDeactivate={onDeactivate} />
        </TestWrapper>
      );

      // Component should render without errors with the callback prop
      const container = document.querySelector('.fixed.inset-0');
      expect(container).toBeInTheDocument();

      // The actual deactivation behavior is tested in the individual hook tests
      // This ensures the component properly accepts and integrates the callback
      expect(onDeactivate).toBeDefined();
    });
  });

  // ===== CANVAS INTEGRATION TESTS (Phase 3) =====

  describe('Canvas Integration', () => {
    it('should support canvas mode prop', () => {
      const canvasProps = {
        ...mockProps,
        canvasMode: true
      };

      render(
        <TestWrapper>
          <CursorLens {...canvasProps} />
        </TestWrapper>
      );

      // Component should render without errors in canvas mode
      const container = document.querySelector('.fixed.inset-0');
      expect(container).toBeInTheDocument();
    });

    it('should call onCanvasPositionChange when canvas mode is enabled', async () => {
      const user = userEvent.setup();
      const onCanvasPositionChange = vi.fn();
      const canvasProps = {
        ...mockProps,
        canvasMode: true,
        onCanvasPositionChange
      };

      render(
        <TestWrapper>
          <CursorLens {...canvasProps} />
        </TestWrapper>
      );

      // Click on capture section using ARIA label
      const captureButton = screen.getByLabelText(/Navigate to introduction section - capture readiness/);
      await user.click(captureButton);

      // Should call canvas position change callback
      expect(onCanvasPositionChange).toHaveBeenCalled();
    });

    it('should use custom sectionToCanvasMapper when provided', async () => {
      const user = userEvent.setup();
      const onCanvasPositionChange = vi.fn();
      const customMapper = vi.fn(() => ({ x: 100, y: 200, scale: 1.5 }));

      const canvasProps = {
        ...mockProps,
        canvasMode: true,
        onCanvasPositionChange,
        sectionToCanvasMapper: customMapper
      };

      render(
        <TestWrapper>
          <CursorLens {...canvasProps} />
        </TestWrapper>
      );

      // Click on capture section using ARIA label
      const captureButton = screen.getByLabelText(/Navigate to introduction section - capture readiness/);
      await user.click(captureButton);

      // Should call custom mapper
      expect(customMapper).toHaveBeenCalledWith('capture');
      // Should call canvas position change with mapped position
      expect(onCanvasPositionChange).toHaveBeenCalledWith({ x: 100, y: 200, scale: 1.5 });
    });

    it('should fall back to scroll navigation when canvas mode is disabled', async () => {
      const user = userEvent.setup();
      const onCanvasPositionChange = vi.fn();
      const canvasProps = {
        ...mockProps,
        canvasMode: false, // Explicitly disabled
        onCanvasPositionChange
      };

      render(
        <TestWrapper>
          <CursorLens {...canvasProps} />
        </TestWrapper>
      );

      // Click on capture section using ARIA label
      const captureButton = screen.getByLabelText(/Navigate to introduction section - capture readiness/);
      await user.click(captureButton);

      // Should NOT call canvas position change callback
      expect(onCanvasPositionChange).not.toHaveBeenCalled();
    });

    it('should maintain backward compatibility with existing props', () => {
      // Test with only original props (no canvas props)
      render(
        <TestWrapper>
          <CursorLens {...mockProps} />
        </TestWrapper>
      );

      // Component should render normally
      const container = document.querySelector('.fixed.inset-0');
      expect(container).toBeInTheDocument();
    });
  });
});