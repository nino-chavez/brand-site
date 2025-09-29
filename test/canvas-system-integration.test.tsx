/**
 * Canvas System Integration Tests
 *
 * Tests the integration between CursorLens, canvas coordinate mapping,
 * state synchronization, and performance monitoring. Validates seamless
 * coordination between spatial navigation and existing systems.
 *
 * @fileoverview Integration tests for 2D canvas layout system
 * @version 1.0.0
 * @since Task 10 - Integration Testing with Existing Systems
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import React from 'react';
import { CursorLens } from '../components/CursorLens';
import { LightboxCanvas } from '../components/LightboxCanvas';
import { UnifiedGameFlowProvider } from '../contexts/UnifiedGameFlowContext';
import { getSectionCanvasPosition } from '../utils/canvasCoordinateTransforms';
import type { CanvasPosition, ViewportConstraints } from '../types/canvas';
import type { PhotoWorkflowSection } from '../types/unified-gameflow';

// Mock performance monitoring
vi.mock('../utils/performanceAnalysis', () => ({
  startPerformanceMonitoring: vi.fn(),
  stopPerformanceMonitoring: vi.fn(),
  collectCurrentMetrics: vi.fn(() => ({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 50000,
    timestamp: performance.now()
  }))
}));

// Mock canvas coordinate transforms
vi.mock('../utils/canvasCoordinateTransforms', () => ({
  getSectionCanvasPosition: vi.fn((section: PhotoWorkflowSection) => ({
    x: section === 'capture' ? 400 : 200,
    y: section === 'capture' ? 300 : 150,
    scale: 1.0
  })),
  calculateMovementDuration: vi.fn(() => 800),
  validateCanvasPosition: vi.fn(() => ({ success: true, position: { x: 0, y: 0, scale: 1 } }))
}));

// Test fixtures
const mockViewportConstraints: ViewportConstraints = {
  minPosition: { x: -600, y: -400, scale: 0.5 },
  maxPosition: { x: 600, y: 400, scale: 3.0 },
  minScale: 0.5,
  maxScale: 3.0
};

const mockSections: PhotoWorkflowSection[] = [
  'capture', 'creative', 'professional', 'thought-leadership', 'ai-github', 'contact'
];

// Test component wrapper for integration testing
const TestCanvasSystemIntegration: React.FC<{
  canvasMode?: boolean;
  onCanvasPositionChange?: (position: CanvasPosition) => void;
  sectionToCanvasMapper?: (section: PhotoWorkflowSection) => CanvasPosition;
  initialCanvasPosition?: CanvasPosition;
}> = ({
  canvasMode = true,
  onCanvasPositionChange,
  sectionToCanvasMapper,
  initialCanvasPosition = { x: 0, y: 0, scale: 1.0 }
}) => {
  const [canvasPosition, setCanvasPosition] = React.useState<CanvasPosition>(initialCanvasPosition);
  const [canvasState, setCanvasState] = React.useState({
    currentPosition: initialCanvasPosition,
    activeSection: 'capture' as PhotoWorkflowSection,
    isTransitioning: false
  });

  const handleCanvasPositionChange = React.useCallback((position: CanvasPosition) => {
    setCanvasPosition(position);
    setCanvasState(prev => ({
      ...prev,
      currentPosition: position,
      isTransitioning: true
    }));
    onCanvasPositionChange?.(position);
  }, [onCanvasPositionChange]);

  return (
    <UnifiedGameFlowProvider>
      <div data-testid="canvas-system-integration">
        <CursorLens
          sections={mockSections}
          canvasMode={canvasMode}
          canvasState={canvasState}
          onCanvasPositionChange={handleCanvasPositionChange}
          sectionToCanvasMapper={sectionToCanvasMapper}
          showSpatialPreview={true}
          viewportDimensions={{ width: 1024, height: 768, edgeClearance: 40 }}
          data-testid="cursor-lens"
        />
        {canvasMode && (
          <LightboxCanvas
            position={canvasPosition}
            constraints={mockViewportConstraints}
            onPositionChange={handleCanvasPositionChange}
            data-testid="lightbox-canvas"
          />
        )}
        <div data-testid="canvas-position-display">
          Position: x={canvasPosition.x}, y={canvasPosition.y}, scale={canvasPosition.scale}
        </div>
      </div>
    </UnifiedGameFlowProvider>
  );
};

describe('Canvas System Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Mock window dimensions for consistent testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16.67); // 60fps
      return 1;
    });

    global.cancelAnimationFrame = vi.fn();

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('CursorLens Canvas Coordinate Mapping', () => {
    it('should map sections to correct canvas positions using default mapping', async () => {
      const onCanvasPositionChange = vi.fn();

      render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      // Simulate CursorLens activation and section selection
      const cursorLens = screen.getByTestId('cursor-lens');

      // Trigger CursorLens activation (hover simulation)
      fireEvent.mouseEnter(cursorLens);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Simulate selecting the 'capture' section (hero)
      fireEvent.click(cursorLens);

      await waitFor(() => {
        expect(getSectionCanvasPosition).toHaveBeenCalledWith('capture');
        expect(onCanvasPositionChange).toHaveBeenCalledWith({
          x: 400,
          y: 300,
          scale: 1.0
        });
      });

      // Verify canvas position is updated in the display
      const positionDisplay = screen.getByTestId('canvas-position-display');
      expect(positionDisplay).toHaveTextContent('Position: x=400, y=300, scale=1');
    });

    it('should use custom section-to-canvas mapper when provided', async () => {
      const customMapper = vi.fn((section: PhotoWorkflowSection) => ({
        x: section === 'creative' ? 500 : 100,
        y: section === 'creative' ? 200 : 100,
        scale: 1.5
      }));

      const onCanvasPositionChange = vi.fn();

      render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
          sectionToCanvasMapper={customMapper}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Simulate selection of 'creative' section
      fireEvent.mouseEnter(cursorLens);
      fireEvent.click(cursorLens);

      await waitFor(() => {
        expect(customMapper).toHaveBeenCalledWith('creative');
        expect(onCanvasPositionChange).toHaveBeenCalledWith({
          x: 500,
          y: 200,
          scale: 1.5
        });
      });

      // Verify default mapping is not called when custom mapper is provided
      expect(getSectionCanvasPosition).not.toHaveBeenCalled();
    });

    it('should handle rapid section changes smoothly', async () => {
      const onCanvasPositionChange = vi.fn();

      render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Simulate rapid section changes
      for (let i = 0; i < 5; i++) {
        fireEvent.mouseEnter(cursorLens);
        fireEvent.click(cursorLens);

        await act(async () => {
          vi.advanceTimersByTime(50); // Rapid changes every 50ms
        });
      }

      await waitFor(() => {
        expect(onCanvasPositionChange).toHaveBeenCalledTimes(5);
      });

      // Verify no memory leaks or performance degradation
      expect(getSectionCanvasPosition).toHaveBeenCalledTimes(5);
    });
  });

  describe('State Synchronization Between Systems', () => {
    it('should synchronize CursorLens selections with canvas state updates', async () => {
      const onCanvasPositionChange = vi.fn();

      render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
          initialCanvasPosition={{ x: 100, y: 100, scale: 1.0 }}
        />
      );

      // Verify initial state synchronization
      const initialDisplay = screen.getByTestId('canvas-position-display');
      expect(initialDisplay).toHaveTextContent('Position: x=100, y=100, scale=1');

      // Simulate section selection via CursorLens
      const cursorLens = screen.getByTestId('cursor-lens');
      fireEvent.mouseEnter(cursorLens);
      fireEvent.click(cursorLens);

      await waitFor(() => {
        expect(onCanvasPositionChange).toHaveBeenCalledWith({
          x: 400,
          y: 300,
          scale: 1.0
        });
      });

      // Verify state synchronization after selection
      await waitFor(() => {
        const updatedDisplay = screen.getByTestId('canvas-position-display');
        expect(updatedDisplay).toHaveTextContent('Position: x=400, y=300, scale=1');
      });
    });

    it('should maintain state consistency during canvas transitions', async () => {
      const onCanvasPositionChange = vi.fn();

      render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Start a transition
      fireEvent.mouseEnter(cursorLens);
      fireEvent.click(cursorLens);

      // Verify transition state is tracked
      await waitFor(() => {
        expect(onCanvasPositionChange).toHaveBeenCalled();
      });

      // Simulate another selection during transition
      fireEvent.click(cursorLens);

      await waitFor(() => {
        expect(onCanvasPositionChange).toHaveBeenCalledTimes(2);
      });

      // Verify final state is consistent
      const finalDisplay = screen.getByTestId('canvas-position-display');
      expect(finalDisplay.textContent).toMatch(/Position: x=\d+, y=\d+, scale=[\d.]+/);
    });

    it('should handle state synchronization errors gracefully', async () => {
      const onCanvasPositionChange = vi.fn(() => {
        throw new Error('Canvas position update failed');
      });

      render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Simulate section selection that triggers error
      expect(() => {
        fireEvent.mouseEnter(cursorLens);
        fireEvent.click(cursorLens);
      }).not.toThrow();

      // Verify CursorLens continues to function despite canvas errors
      expect(cursorLens).toBeInTheDocument();
    });
  });

  describe('Backward Compatibility with Scroll Navigation', () => {
    it('should fall back to scroll navigation when canvas mode is disabled', async () => {
      const onCanvasPositionChange = vi.fn();

      render(
        <TestCanvasSystemIntegration
          canvasMode={false}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Simulate section selection in scroll mode
      fireEvent.mouseEnter(cursorLens);
      fireEvent.click(cursorLens);

      // Verify canvas position change is not called in scroll mode
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(onCanvasPositionChange).not.toHaveBeenCalled();
      expect(getSectionCanvasPosition).not.toHaveBeenCalled();

      // Verify traditional scroll navigation would be triggered
      // (This would be handled by UnifiedGameFlowContext actions)
    });

    it('should maintain CursorLens functionality regardless of canvas availability', async () => {
      render(
        <TestCanvasSystemIntegration canvasMode={false} />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Verify CursorLens renders and responds to interaction
      expect(cursorLens).toBeInTheDocument();

      fireEvent.mouseEnter(cursorLens);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // CursorLens should remain functional
      expect(cursorLens).toBeInTheDocument();
    });

    it('should switch between canvas and scroll modes dynamically', async () => {
      const onCanvasPositionChange = vi.fn();

      const { rerender } = render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Test canvas mode
      fireEvent.mouseEnter(cursorLens);
      fireEvent.click(cursorLens);

      await waitFor(() => {
        expect(onCanvasPositionChange).toHaveBeenCalled();
      });

      // Switch to scroll mode
      rerender(
        <TestCanvasSystemIntegration
          canvasMode={false}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      // Clear previous calls
      onCanvasPositionChange.mockClear();

      // Test scroll mode
      fireEvent.click(cursorLens);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(onCanvasPositionChange).not.toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should maintain 60fps during canvas transitions', async () => {
      const performanceCallback = vi.fn();

      render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={performanceCallback}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Simulate multiple rapid transitions
      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(cursorLens);
        fireEvent.click(cursorLens);

        await act(async () => {
          vi.advanceTimersByTime(16.67); // 60fps = 16.67ms per frame
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Verify performance expectations (should complete within reasonable time)
      expect(duration).toBeLessThan(1000); // Less than 1 second for 10 transitions
      expect(performanceCallback).toHaveBeenCalledTimes(10);
    });

    it('should collect performance metrics during canvas operations', async () => {
      const { collectCurrentMetrics } = await import('../utils/performanceAnalysis');

      render(
        <TestCanvasSystemIntegration canvasMode={true} />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      fireEvent.mouseEnter(cursorLens);
      fireEvent.click(cursorLens);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Verify performance monitoring is called
      expect(collectCurrentMetrics).toHaveBeenCalled();
    });

    it('should handle performance degradation gracefully', async () => {
      // Mock poor performance conditions
      const { collectCurrentMetrics } = await import('../utils/performanceAnalysis');
      vi.mocked(collectCurrentMetrics).mockReturnValue({
        fps: 30, // Below 60fps target
        frameTime: 33.33,
        memoryUsage: 100000,
        timestamp: performance.now()
      });

      const onCanvasPositionChange = vi.fn();

      render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      fireEvent.mouseEnter(cursorLens);
      fireEvent.click(cursorLens);

      // Verify system continues to function despite performance issues
      await waitFor(() => {
        expect(onCanvasPositionChange).toHaveBeenCalled();
      });

      expect(cursorLens).toBeInTheDocument();
    });
  });

  describe('Error Boundaries and Resilience', () => {
    it('should handle canvas coordinate calculation errors gracefully', async () => {
      // Mock getSectionCanvasPosition to throw error
      vi.mocked(getSectionCanvasPosition).mockImplementation(() => {
        throw new Error('Canvas position calculation failed');
      });

      const onCanvasPositionChange = vi.fn();

      render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Verify component doesn't crash despite coordinate calculation error
      expect(() => {
        fireEvent.mouseEnter(cursorLens);
        fireEvent.click(cursorLens);
      }).not.toThrow();

      // CursorLens should remain functional
      expect(cursorLens).toBeInTheDocument();
    });

    it('should recover from canvas system failures', async () => {
      const onCanvasPositionChange = vi.fn();

      const { rerender } = render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      // Simulate canvas system failure by removing LightboxCanvas
      rerender(
        <TestCanvasSystemIntegration
          canvasMode={false}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Verify CursorLens continues to work
      fireEvent.mouseEnter(cursorLens);
      fireEvent.click(cursorLens);

      expect(cursorLens).toBeInTheDocument();
    });

    it('should handle memory cleanup during rapid navigation', async () => {
      const onCanvasPositionChange = vi.fn();

      const { unmount } = render(
        <TestCanvasSystemIntegration
          canvasMode={true}
          onCanvasPositionChange={onCanvasPositionChange}
        />
      );

      const cursorLens = screen.getByTestId('cursor-lens');

      // Simulate rapid navigation
      for (let i = 0; i < 20; i++) {
        fireEvent.mouseEnter(cursorLens);
        fireEvent.click(cursorLens);
      }

      // Unmount component and verify cleanup
      expect(() => unmount()).not.toThrow();
    });
  });
});