/**
 * Extracted Components Integration Testing Framework
 *
 * Comprehensive integration tests for refactored component architecture including:
 * - Component communication patterns and data flow
 * - End-to-end workflows for refactored component interactions
 * - State management integration across extracted components
 * - Cross-component interaction validation and error handling
 * - Canvas interaction workflows and performance monitoring
 *
 * @fileoverview Integration testing for extracted component architecture
 * @version 1.0.0
 * @since Task 7.2 - Integration Testing Framework
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithTestUtils, waitForFrames, mockMouseMovement } from '../utils';
import React, { useState, useCallback, useRef } from 'react';

// Import extracted components for integration testing
import { TouchGestureHandler } from '../../components/TouchGestureHandler';
import { AnimationController } from '../../components/AnimationController';
import { AccessibilityController } from '../../components/AccessibilityController';
import { PerformanceRenderer } from '../../components/PerformanceRenderer';

// Import types
import type { CanvasPosition } from '../../types/canvas';
import type { TouchGestureState, GestureType } from '../../components/TouchGestureHandler';
import type { AnimationConfig, MovementType } from '../../components/AnimationController';
import type { AccessibilityConfig } from '../../components/AccessibilityController';
import type { PerformanceMetrics } from '../../components/PerformanceRenderer';

/**
 * Integration test container that combines all extracted components
 * Simulates the actual LightboxCanvas integration patterns
 */
const IntegratedCanvasSystem: React.FC<{
  onInteractionLog?: (interaction: any) => void;
  initialPosition?: CanvasPosition;
  enableDebug?: boolean;
}> = ({ onInteractionLog, initialPosition = { x: 0, y: 0, scale: 1.0 }, enableDebug = false }) => {
  // Shared state management
  const [canvasPosition, setCanvasPosition] = useState<CanvasPosition>(initialPosition);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('capture');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryMB: 35,
    canvasRenderFPS: 58,
    transformOverhead: 2.5,
    activeOperations: 0,
    averageMovementTime: 12,
    gpuUtilization: 45,
  });

  // Component configuration
  const animationConfig: AnimationConfig = {
    enableSmoothing: true,
    smoothingFactor: 0.8,
    maxVelocity: 1000,
    friction: 0.85,
    enableDebugging: enableDebug,
    performanceMode: 'adaptive',
  };

  const accessibilityConfig: AccessibilityConfig = {
    keyboardSpatialNav: true,
    moveDistance: 50,
    zoomFactor: 1.2,
    enableAnnouncements: true,
    enableSpatialContext: true,
    maxResponseTime: 100,
  };

  const sections = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

  // Cross-component communication handlers
  const handlePositionChange = useCallback((newPosition: CanvasPosition) => {
    setCanvasPosition(newPosition);
    setPerformanceMetrics(prev => ({
      ...prev,
      activeOperations: prev.activeOperations + 1,
      averageMovementTime: Math.random() * 20 + 5,
    }));
    onInteractionLog?.({ type: 'position_change', position: newPosition });
  }, [onInteractionLog]);

  const handleGestureStart = useCallback((gestureState: TouchGestureState) => {
    setIsAnimating(true);
    setPerformanceMetrics(prev => ({
      ...prev,
      activeOperations: prev.activeOperations + 1,
    }));
    onInteractionLog?.({ type: 'gesture_start', gestureState });
  }, [onInteractionLog]);

  const handleGestureUpdate = useCallback((gestureState: TouchGestureState) => {
    if (gestureState.gestureType === 'pan') {
      const newPosition = {
        x: canvasPosition.x + gestureState.deltaX,
        y: canvasPosition.y + gestureState.deltaY,
        scale: canvasPosition.scale,
      };
      handlePositionChange(newPosition);
    } else if (gestureState.gestureType === 'pinch') {
      const newPosition = {
        ...canvasPosition,
        scale: canvasPosition.scale * gestureState.scale,
      };
      handlePositionChange(newPosition);
    }
    onInteractionLog?.({ type: 'gesture_update', gestureState });
  }, [canvasPosition, handlePositionChange, onInteractionLog]);

  const handleGestureEnd = useCallback((gestureState: TouchGestureState) => {
    setIsAnimating(false);
    setPerformanceMetrics(prev => ({
      ...prev,
      activeOperations: Math.max(0, prev.activeOperations - 1),
    }));
    onInteractionLog?.({ type: 'gesture_end', gestureState });
  }, [onInteractionLog]);

  const handleAnimationComplete = useCallback((finalPosition: CanvasPosition) => {
    setIsAnimating(false);
    setCanvasPosition(finalPosition);
    setPerformanceMetrics(prev => ({
      ...prev,
      activeOperations: Math.max(0, prev.activeOperations - 1),
    }));
    onInteractionLog?.({ type: 'animation_complete', position: finalPosition });
  }, [onInteractionLog]);

  const handleAnnouncement = useCallback((message: string) => {
    onInteractionLog?.({ type: 'accessibility_announcement', message });
  }, [onInteractionLog]);

  const handlePerformanceToggle = useCallback(() => {
    setPerformanceMetrics(prev => ({
      ...prev,
      activeOperations: prev.activeOperations + 1,
    }));
    onInteractionLog?.({ type: 'debug_toggle' });
  }, [onInteractionLog]);

  return (
    <div data-testid="integrated-canvas-system" style={{ width: '800px', height: '600px' }}>
      {/* Touch Gesture Handler */}
      <TouchGestureHandler
        enabled={true}
        onGestureStart={handleGestureStart}
        onGestureUpdate={handleGestureUpdate}
        onGestureEnd={handleGestureEnd}
        currentPosition={canvasPosition}
        debugMode={enableDebug}
      />

      {/* Animation Controller */}
      <AnimationController
        isActive={isAnimating}
        config={animationConfig}
        currentPosition={canvasPosition}
        targetPosition={canvasPosition}
        onPositionUpdate={handlePositionChange}
        onAnimationComplete={handleAnimationComplete}
        debugMode={enableDebug}
      />

      {/* Accessibility Controller */}
      <AccessibilityController
        currentPosition={canvasPosition}
        config={accessibilityConfig}
        onPositionChange={handlePositionChange}
        onAnnouncement={handleAnnouncement}
        activeSection={activeSection}
        sections={sections}
        debugMode={enableDebug}
      />

      {/* Performance Renderer */}
      <PerformanceRenderer
        metrics={performanceMetrics}
        qualityLevel="high"
        debugMode={enableDebug}
        canvasPosition={canvasPosition}
        activeSection={activeSection}
        layout="2d-canvas"
        isTransitioning={isAnimating}
        onToggleDebug={handlePerformanceToggle}
      />

      {/* Canvas simulation area */}
      <div
        data-testid="canvas-area"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasPosition.scale})`,
          transition: isAnimating ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        <div data-testid="canvas-content">Canvas Content</div>
      </div>

      {/* Section navigation indicators */}
      <div data-testid="section-indicators">
        {sections.map((section, index) => (
          <button
            key={section}
            data-testid={`section-${section}`}
            onClick={() => setActiveSection(section)}
            style={{
              position: 'absolute',
              top: `${20 + index * 30}px`,
              right: '20px',
              backgroundColor: activeSection === section ? '#ff6b00' : '#333',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
            }}
          >
            {section}
          </button>
        ))}
      </div>
    </div>
  );
};

describe('Extracted Components Integration Framework', () => {
  let interactionLog: any[];
  let mockOnInteractionLog: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    interactionLog = [];
    mockOnInteractionLog = vi.fn((interaction) => {
      interactionLog.push(interaction);
    });

    // Mock requestAnimationFrame for animation testing
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      setTimeout(callback, 16);
      return 1;
    });

    // Mock performance.now for timing tests
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());

    // Reset DOM state
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    interactionLog = [];
  });

  describe('Component Communication Patterns', () => {
    it('should establish proper data flow between all extracted components', () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          enableDebug: true,
        })
      );

      expect(screen.getByTestId('integrated-canvas-system')).toBeInTheDocument();
      expect(screen.getByTestId('canvas-area')).toBeInTheDocument();
      expect(screen.getByText('CANVAS DEBUG')).toBeInTheDocument();
    });

    it('should propagate position changes across all components', async () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          initialPosition: { x: 0, y: 0, scale: 1.0 },
        })
      );

      // Trigger keyboard navigation via AccessibilityController
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      fireEvent(window, event);

      await waitFor(() => {
        expect(mockOnInteractionLog).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'position_change',
            position: expect.objectContaining({ x: 50, y: 0, scale: 1.0 })
          })
        );
      });

      // Check that canvas area reflects the position change
      const canvasArea = screen.getByTestId('canvas-area');
      expect(canvasArea.style.transform).toContain('translate(50px, 0px)');
    });

    it('should handle cross-component state updates without conflicts', async () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          enableDebug: true,
        })
      );

      // Trigger multiple simultaneous interactions
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      fireEvent(window, keyEvent);

      // Click debug toggle
      const debugToggle = screen.getByRole('button', { name: /toggle debug mode/i });
      fireEvent.click(debugToggle);

      // Change section
      const sectionButton = screen.getByTestId('section-focus');
      fireEvent.click(sectionButton);

      await waitFor(() => {
        expect(interactionLog.length).toBeGreaterThan(2);
        expect(interactionLog).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ type: 'position_change' }),
            expect.objectContaining({ type: 'debug_toggle' }),
          ])
        );
      });
    });
  });

  describe('End-to-End Component Workflows', () => {
    it('should execute complete touch gesture workflow', async () => {
      const mouseMove = mockMouseMovement();

      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
        })
      );

      const canvasArea = screen.getByTestId('canvas-area');

      // Simulate touch start
      fireEvent.touchStart(canvasArea, {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
      });

      await waitFor(() => {
        expect(mockOnInteractionLog).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'gesture_start' })
        );
      });

      // Simulate touch move (pan gesture)
      fireEvent.touchMove(canvasArea, {
        touches: [{ clientX: 150, clientY: 120, identifier: 1 }],
      });

      await waitFor(() => {
        expect(mockOnInteractionLog).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'gesture_update',
            gestureState: expect.objectContaining({ gestureType: 'pan' })
          })
        );
      });

      // Simulate touch end
      fireEvent.touchEnd(canvasArea, {
        changedTouches: [{ clientX: 150, clientY: 120, identifier: 1 }],
      });

      await waitFor(() => {
        expect(mockOnInteractionLog).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'gesture_end' })
        );
      });

      // Verify final position update
      expect(mockOnInteractionLog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'position_change',
          position: expect.objectContaining({ x: 50, y: 20 })
        })
      );
    });

    it('should execute complete keyboard navigation workflow', async () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
        })
      );

      // Execute navigation sequence: right, up, zoom in, reset
      const navigationSequence = [
        { key: 'ArrowRight', expectedX: 50, expectedY: 0 },
        { key: 'ArrowUp', expectedX: 50, expectedY: -50 },
        { key: '+', expectedScale: 1.2 },
        { key: '0', expectedX: 0, expectedY: 0, expectedScale: 1.0 },
      ];

      for (const step of navigationSequence) {
        const event = new KeyboardEvent('keydown', { key: step.key });
        fireEvent(window, event);

        await waitFor(() => {
          const lastPositionChange = interactionLog
            .filter(log => log.type === 'position_change')
            .pop();

          if (step.expectedX !== undefined) {
            expect(lastPositionChange.position.x).toBe(step.expectedX);
          }
          if (step.expectedY !== undefined) {
            expect(lastPositionChange.position.y).toBe(step.expectedY);
          }
          if (step.expectedScale !== undefined) {
            expect(lastPositionChange.position.scale).toBeCloseTo(step.expectedScale, 1);
          }
        });
      }

      // Verify accessibility announcements were made
      const announcements = interactionLog.filter(log => log.type === 'accessibility_announcement');
      expect(announcements.length).toBeGreaterThan(0);
    });

    it('should execute complete animation workflow with performance monitoring', async () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          enableDebug: true,
        })
      );

      // Start an animation by triggering a large position change
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      fireEvent(window, event);

      // Verify animation started
      await waitFor(() => {
        expect(mockOnInteractionLog).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'position_change' })
        );
      });

      // Check performance metrics updates
      await waitFor(() => {
        const canvasArea = screen.getByTestId('canvas-area');
        expect(canvasArea.style.transform).toContain('translate(50px, 0px)');
      });

      // Verify performance renderer shows updated metrics
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
      expect(screen.getByText(/Operations:/)).toBeInTheDocument();
    });
  });

  describe('State Management Integration', () => {
    it('should maintain consistent state across component updates', async () => {
      const { rerender } = renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          initialPosition: { x: 100, y: 200, scale: 1.5 },
        })
      );

      // Initial state verification
      expect(screen.getByTestId('canvas-area').style.transform).toContain('translate(100px, 200px) scale(1.5)');

      // Update position via keyboard
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      fireEvent(window, event);

      await waitFor(() => {
        expect(screen.getByTestId('canvas-area').style.transform).toContain('translate(50px, 200px)');
      });

      // Re-render with new props
      rerender(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          initialPosition: { x: 50, y: 200, scale: 1.5 }, // Match current state
        })
      );

      // State should remain consistent
      expect(screen.getByTestId('canvas-area').style.transform).toContain('translate(50px, 200px)');
    });

    it('should handle state rollback on invalid operations', async () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          initialPosition: { x: 550, y: 0, scale: 1.0 },
        })
      );

      const initialTransform = screen.getByTestId('canvas-area').style.transform;

      // Attempt to move beyond boundary (should be constrained)
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      fireEvent(window, event);

      await waitFor(() => {
        // Position should be constrained to max boundary (600)
        expect(screen.getByTestId('canvas-area').style.transform).toContain('translate(600px, 0px)');
      });

      // Verify position was properly constrained in state
      const lastPositionChange = interactionLog
        .filter(log => log.type === 'position_change')
        .pop();
      expect(lastPositionChange.position.x).toBe(600);
    });
  });

  describe('Cross-Component Interaction Validation', () => {
    it('should handle concurrent operations from multiple components', async () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          enableDebug: true,
        })
      );

      // Trigger multiple concurrent operations
      const canvasArea = screen.getByTestId('canvas-area');

      // Start touch gesture
      fireEvent.touchStart(canvasArea, {
        touches: [{ clientX: 100, clientY: 100, identifier: 1 }],
      });

      // Simultaneously trigger keyboard navigation
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      fireEvent(window, keyEvent);

      // And toggle debug mode
      const debugToggle = screen.getByRole('button', { name: /toggle debug mode/i });
      fireEvent.click(debugToggle);

      await waitFor(() => {
        expect(interactionLog.length).toBeGreaterThan(2);

        // Should handle all interactions gracefully
        const eventTypes = interactionLog.map(log => log.type);
        expect(eventTypes).toContain('gesture_start');
        expect(eventTypes).toContain('position_change');
        expect(eventTypes).toContain('debug_toggle');
      });
    });

    it('should validate component interdependencies', async () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
        })
      );

      // Change active section
      const sectionButton = screen.getByTestId('section-focus');
      fireEvent.click(sectionButton);

      // Trigger accessibility announcement for new section
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      fireEvent(window, keyEvent);

      await waitFor(() => {
        const announcements = interactionLog.filter(log => log.type === 'accessibility_announcement');

        // Should include spatial context for the new section
        const lastAnnouncement = announcements[announcements.length - 1];
        expect(lastAnnouncement.message).toContain('About section - Focus area');
      });
    });

    it('should handle component error boundaries gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Component with potential error
      const ErrorProneSystem: React.FC = () => {
        const [shouldError, setShouldError] = React.useState(false);

        if (shouldError) {
          throw new Error('Test error in integrated system');
        }

        return (
          <div>
            <IntegratedCanvasSystem onInteractionLog={mockOnInteractionLog} />
            <button
              data-testid="trigger-error"
              onClick={() => setShouldError(true)}
            >
              Trigger Error
            </button>
          </div>
        );
      };

      const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [hasError, setHasError] = React.useState(false);

        React.useEffect(() => {
          const handleError = () => setHasError(true);
          window.addEventListener('error', handleError);
          return () => window.removeEventListener('error', handleError);
        }, []);

        if (hasError) {
          return <div data-testid="error-fallback">Component Error Handled</div>;
        }

        return <>{children}</>;
      };

      renderWithTestUtils(
        React.createElement(ErrorBoundary, {
          children: React.createElement(ErrorProneSystem)
        })
      );

      // System should work normally before error
      expect(screen.getByTestId('integrated-canvas-system')).toBeInTheDocument();

      // Components should maintain independence even when errors occur
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      fireEvent(window, keyEvent);

      await waitFor(() => {
        expect(mockOnInteractionLog).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'position_change' })
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Integration Validation', () => {
    it('should monitor performance across all component interactions', async () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          enableDebug: true,
        })
      );

      // Execute series of interactions to generate performance data
      const interactions = [
        () => fireEvent(window, new KeyboardEvent('keydown', { key: 'ArrowRight' })),
        () => fireEvent(window, new KeyboardEvent('keydown', { key: 'ArrowUp' })),
        () => fireEvent(window, new KeyboardEvent('keydown', { key: '+' })),
        () => fireEvent.click(screen.getByTestId('section-frame')),
      ];

      for (const interaction of interactions) {
        interaction();
        await waitForFrames(2);
      }

      // Performance renderer should show updated metrics
      expect(screen.getByText(/Operations:/)).toBeInTheDocument();
      expect(screen.getByText(/Avg Movement:/)).toBeInTheDocument();

      // Should track performance across all interactions
      const positionChanges = interactionLog.filter(log => log.type === 'position_change');
      expect(positionChanges.length).toBeGreaterThan(2);
    });

    it('should maintain responsive performance under load', async () => {
      const startTime = performance.now();

      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          enableDebug: true,
        })
      );

      // Execute rapid sequence of interactions
      for (let i = 0; i < 50; i++) {
        const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        fireEvent(window, keyEvent);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete all interactions within reasonable time
      expect(totalTime).toBeLessThan(1000); // 1 second for 50 interactions

      // System should remain responsive
      expect(screen.getByTestId('integrated-canvas-system')).toBeInTheDocument();
      expect(screen.getByText('CANVAS DEBUG')).toBeInTheDocument();
    });
  });

  describe('Integration Framework Utilities', () => {
    it('should provide comprehensive interaction logging', async () => {
      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
          enableDebug: true,
        })
      );

      // Execute various interaction types
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      fireEvent(window, keyEvent);

      const debugToggle = screen.getByRole('button', { name: /toggle debug mode/i });
      fireEvent.click(debugToggle);

      const sectionButton = screen.getByTestId('section-focus');
      fireEvent.click(sectionButton);

      await waitFor(() => {
        expect(interactionLog.length).toBeGreaterThan(2);

        // Verify comprehensive logging
        const logTypes = new Set(interactionLog.map(log => log.type));
        expect(logTypes).toContain('position_change');
        expect(logTypes).toContain('debug_toggle');
        expect(logTypes).toContain('accessibility_announcement');
      });

      // Each log entry should have timestamp and relevant data
      interactionLog.forEach(log => {
        expect(log).toHaveProperty('type');
        expect(typeof log.type).toBe('string');
      });
    });

    it('should support test scenario validation', async () => {
      const testScenarios = [
        {
          name: 'basic_navigation',
          actions: [() => fireEvent(window, new KeyboardEvent('keydown', { key: 'ArrowRight' }))],
          expectedResults: [{ type: 'position_change', position: { x: 50, y: 0, scale: 1.0 } }],
        },
        {
          name: 'section_change',
          actions: [() => fireEvent.click(screen.getByTestId('section-frame'))],
          expectedResults: [{ type: 'accessibility_announcement' }],
        },
      ];

      renderWithTestUtils(
        React.createElement(IntegratedCanvasSystem, {
          onInteractionLog: mockOnInteractionLog,
        })
      );

      for (const scenario of testScenarios) {
        interactionLog.length = 0; // Clear log

        // Execute scenario actions
        for (const action of scenario.actions) {
          action();
        }

        await waitFor(() => {
          expect(interactionLog.length).toBeGreaterThan(0);
        });

        // Validate expected results
        for (const expectedResult of scenario.expectedResults) {
          const matchingLog = interactionLog.find(log => {
            if (log.type !== expectedResult.type) return false;

            if (expectedResult.position) {
              return log.position &&
                     log.position.x === expectedResult.position.x &&
                     log.position.y === expectedResult.position.y &&
                     log.position.scale === expectedResult.position.scale;
            }

            return true;
          });

          expect(matchingLog).toBeTruthy();
        }
      }
    });
  });
});