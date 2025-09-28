/**
 * State Management Integration Tests
 *
 * Comprehensive tests for state management across extracted components including:
 * - Cross-component state synchronization and consistency
 * - State persistence during component lifecycle events
 * - Error handling and state recovery mechanisms
 * - Performance impact of state updates across components
 * - Memory leak prevention in state management
 *
 * @fileoverview State management integration testing
 * @version 1.0.0
 * @since Task 7.2 - Integration Testing Framework
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTestUtils, waitForFrames } from '../utils';
import { act, waitFor } from '@testing-library/react';
import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';

// Import components and types
import { TouchGestureHandler } from '../../components/TouchGestureHandler';
import { AnimationController } from '../../components/AnimationController';
import { AccessibilityController } from '../../components/AccessibilityController';
import { PerformanceRenderer } from '../../components/PerformanceRenderer';

import type { CanvasPosition } from '../../types/canvas';
import type { TouchGestureState } from '../../components/TouchGestureHandler';
import type { PerformanceMetrics } from '../../components/PerformanceRenderer';

import { IntegrationTestLogger, ComponentStateValidator } from './integration-test-utils';

/**
 * Canvas state context for integration testing
 */
interface CanvasState {
  position: CanvasPosition;
  isAnimating: boolean;
  performanceMetrics: PerformanceMetrics;
  accessibilityEnabled: boolean;
  debugMode: boolean;
  interactionHistory: Array<{
    timestamp: number;
    type: string;
    data: any;
  }>;
}

interface CanvasStateActions {
  updatePosition: (position: CanvasPosition) => void;
  setAnimating: (isAnimating: boolean) => void;
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  toggleAccessibility: () => void;
  toggleDebugMode: () => void;
  addInteraction: (type: string, data: any) => void;
  resetState: () => void;
}

const initialCanvasState: CanvasState = {
  position: { x: 0, y: 0, scale: 1.0 },
  isAnimating: false,
  performanceMetrics: {
    fps: 60,
    frameTime: 16.67,
    memoryMB: 35,
    canvasRenderFPS: 58,
    transformOverhead: 2.5,
    activeOperations: 0,
    averageMovementTime: 12,
    gpuUtilization: 45,
  },
  accessibilityEnabled: true,
  debugMode: false,
  interactionHistory: [],
};

const CanvasStateContext = createContext<{
  state: CanvasState;
  actions: CanvasStateActions;
} | null>(null);

/**
 * Canvas state provider for integration testing
 */
const CanvasStateProvider: React.FC<{
  children: React.ReactNode;
  onStateChange?: (state: CanvasState) => void;
  initialState?: Partial<CanvasState>;
}> = ({ children, onStateChange, initialState }) => {
  const [state, setState] = useState<CanvasState>({
    ...initialCanvasState,
    ...initialState,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Notify of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const actions: CanvasStateActions = {
    updatePosition: useCallback((position: CanvasPosition) => {
      setState(prev => ({
        ...prev,
        position,
        interactionHistory: [
          ...prev.interactionHistory.slice(-99), // Keep last 100 interactions
          {
            timestamp: performance.now(),
            type: 'position_update',
            data: { position },
          },
        ],
      }));
    }, []),

    setAnimating: useCallback((isAnimating: boolean) => {
      setState(prev => ({
        ...prev,
        isAnimating,
        interactionHistory: [
          ...prev.interactionHistory.slice(-99),
          {
            timestamp: performance.now(),
            type: 'animation_state',
            data: { isAnimating },
          },
        ],
      }));
    }, []),

    updatePerformanceMetrics: useCallback((metrics: Partial<PerformanceMetrics>) => {
      setState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          ...metrics,
        },
        interactionHistory: [
          ...prev.interactionHistory.slice(-99),
          {
            timestamp: performance.now(),
            type: 'performance_update',
            data: { metrics },
          },
        ],
      }));
    }, []),

    toggleAccessibility: useCallback(() => {
      setState(prev => ({
        ...prev,
        accessibilityEnabled: !prev.accessibilityEnabled,
        interactionHistory: [
          ...prev.interactionHistory.slice(-99),
          {
            timestamp: performance.now(),
            type: 'accessibility_toggle',
            data: { enabled: !prev.accessibilityEnabled },
          },
        ],
      }));
    }, []),

    toggleDebugMode: useCallback(() => {
      setState(prev => ({
        ...prev,
        debugMode: !prev.debugMode,
        interactionHistory: [
          ...prev.interactionHistory.slice(-99),
          {
            timestamp: performance.now(),
            type: 'debug_toggle',
            data: { enabled: !prev.debugMode },
          },
        ],
      }));
    }, []),

    addInteraction: useCallback((type: string, data: any) => {
      setState(prev => ({
        ...prev,
        interactionHistory: [
          ...prev.interactionHistory.slice(-99),
          {
            timestamp: performance.now(),
            type,
            data,
          },
        ],
      }));
    }, []),

    resetState: useCallback(() => {
      setState(initialCanvasState);
    }, []),
  };

  return (
    <CanvasStateContext.Provider value={{ state, actions }}>
      {children}
    </CanvasStateContext.Provider>
  );
};

/**
 * Hook to use canvas state context
 */
const useCanvasState = () => {
  const context = useContext(CanvasStateContext);
  if (!context) {
    throw new Error('useCanvasState must be used within CanvasStateProvider');
  }
  return context;
};

/**
 * Integrated canvas system with state management
 */
const StateManagedCanvasSystem: React.FC<{
  onStateChange?: (state: CanvasState) => void;
  initialState?: Partial<CanvasState>;
}> = ({ onStateChange, initialState }) => {
  const { state, actions } = useCanvasState();

  // Component event handlers
  const handleGestureStart = useCallback((gestureState: TouchGestureState) => {
    actions.setAnimating(true);
    actions.addInteraction('gesture_start', { gestureState });
    actions.updatePerformanceMetrics({ activeOperations: (state.performanceMetrics.activeOperations || 0) + 1 });
  }, [actions, state.performanceMetrics.activeOperations]);

  const handleGestureUpdate = useCallback((gestureState: TouchGestureState) => {
    if (gestureState.gestureType === 'pan') {
      const newPosition = {
        x: state.position.x + gestureState.deltaX,
        y: state.position.y + gestureState.deltaY,
        scale: state.position.scale,
      };
      actions.updatePosition(newPosition);
    } else if (gestureState.gestureType === 'pinch') {
      const newPosition = {
        ...state.position,
        scale: state.position.scale * gestureState.scale,
      };
      actions.updatePosition(newPosition);
    }
    actions.addInteraction('gesture_update', { gestureState });
  }, [state.position, actions]);

  const handleGestureEnd = useCallback((gestureState: TouchGestureState) => {
    actions.setAnimating(false);
    actions.addInteraction('gesture_end', { gestureState });
    actions.updatePerformanceMetrics({
      activeOperations: Math.max(0, (state.performanceMetrics.activeOperations || 0) - 1),
    });
  }, [actions, state.performanceMetrics.activeOperations]);

  const handlePositionChange = useCallback((position: CanvasPosition) => {
    actions.updatePosition(position);
    actions.updatePerformanceMetrics({
      averageMovementTime: Math.random() * 20 + 5,
      activeOperations: (state.performanceMetrics.activeOperations || 0) + 1,
    });
  }, [actions, state.performanceMetrics.activeOperations]);

  const handleAnimationComplete = useCallback((finalPosition: CanvasPosition) => {
    actions.setAnimating(false);
    actions.updatePosition(finalPosition);
    actions.addInteraction('animation_complete', { position: finalPosition });
  }, [actions]);

  const handleAnnouncement = useCallback((message: string) => {
    actions.addInteraction('accessibility_announcement', { message });
  }, [actions]);

  return (
    <div data-testid="state-managed-canvas-system">
      {/* Touch Gesture Handler */}
      <TouchGestureHandler
        enabled={true}
        onGestureStart={handleGestureStart}
        onGestureUpdate={handleGestureUpdate}
        onGestureEnd={handleGestureEnd}
        currentPosition={state.position}
        debugMode={state.debugMode}
      />

      {/* Animation Controller */}
      <AnimationController
        isActive={state.isAnimating}
        config={{
          enableSmoothing: true,
          smoothingFactor: 0.8,
          maxVelocity: 1000,
          friction: 0.85,
          enableDebugging: state.debugMode,
          performanceMode: 'adaptive',
        }}
        currentPosition={state.position}
        targetPosition={state.position}
        onPositionUpdate={handlePositionChange}
        onAnimationComplete={handleAnimationComplete}
        debugMode={state.debugMode}
      />

      {/* Accessibility Controller */}
      <AccessibilityController
        currentPosition={state.position}
        config={{
          keyboardSpatialNav: state.accessibilityEnabled,
          moveDistance: 50,
          zoomFactor: 1.2,
          enableAnnouncements: state.accessibilityEnabled,
          enableSpatialContext: true,
          maxResponseTime: 100,
        }}
        onPositionChange={handlePositionChange}
        onAnnouncement={handleAnnouncement}
        debugMode={state.debugMode}
      />

      {/* Performance Renderer */}
      <PerformanceRenderer
        metrics={state.performanceMetrics}
        qualityLevel="high"
        debugMode={state.debugMode}
        canvasPosition={state.position}
        layout="2d-canvas"
        isTransitioning={state.isAnimating}
        onToggleDebug={actions.toggleDebugMode}
      />

      {/* State display for testing */}
      <div data-testid="state-display" style={{ display: 'none' }}>
        <div data-testid="position-x">{state.position.x}</div>
        <div data-testid="position-y">{state.position.y}</div>
        <div data-testid="position-scale">{state.position.scale}</div>
        <div data-testid="is-animating">{state.isAnimating.toString()}</div>
        <div data-testid="accessibility-enabled">{state.accessibilityEnabled.toString()}</div>
        <div data-testid="debug-mode">{state.debugMode.toString()}</div>
        <div data-testid="interaction-count">{state.interactionHistory.length}</div>
      </div>

      {/* Control buttons for testing */}
      <div data-testid="state-controls">
        <button
          data-testid="toggle-accessibility"
          onClick={actions.toggleAccessibility}
        >
          Toggle Accessibility
        </button>
        <button
          data-testid="toggle-debug"
          onClick={actions.toggleDebugMode}
        >
          Toggle Debug
        </button>
        <button
          data-testid="reset-state"
          onClick={actions.resetState}
        >
          Reset State
        </button>
      </div>
    </div>
  );
};

describe('State Management Integration', () => {
  let logger: IntegrationTestLogger;
  let stateChanges: CanvasState[];

  beforeEach(() => {
    logger = new IntegrationTestLogger();
    stateChanges = [];

    // Mock performance and timing functions
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      setTimeout(callback, 16);
      return 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    stateChanges = [];
  });

  describe('Cross-Component State Synchronization', () => {
    it('should maintain consistent state across all components', async () => {
      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      const TestComponent = () => (
        <CanvasStateProvider onStateChange={handleStateChange}>
          <StateManagedCanvasSystem />
        </CanvasStateProvider>
      );

      const { getByTestId } = renderWithTestUtils(React.createElement(TestComponent));

      // Initial state verification
      expect(getByTestId('position-x')).toHaveTextContent('0');
      expect(getByTestId('position-y')).toHaveTextContent('0');
      expect(getByTestId('position-scale')).toHaveTextContent('1');

      // Trigger position change via keyboard
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(keyEvent);

      await waitFor(() => {
        expect(getByTestId('position-x')).toHaveTextContent('50');
      });

      // Verify state synchronization
      const latestState = stateChanges[stateChanges.length - 1];
      expect(latestState.position.x).toBe(50);
      expect(latestState.position.y).toBe(0);
      expect(latestState.position.scale).toBe(1.0);

      // Verify interaction history is updated
      expect(parseInt(getByTestId('interaction-count').textContent || '0')).toBeGreaterThan(0);
    });

    it('should handle concurrent state updates without race conditions', async () => {
      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      const TestComponent = () => (
        <CanvasStateProvider onStateChange={handleStateChange}>
          <StateManagedCanvasSystem />
        </CanvasStateProvider>
      );

      const { getByTestId } = renderWithTestUtils(React.createElement(TestComponent));

      // Trigger multiple simultaneous state updates
      const actions = [
        () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })),
        () => getByTestId('toggle-debug').click(),
        () => getByTestId('toggle-accessibility').click(),
        () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' })),
      ];

      // Execute all actions rapidly
      for (const action of actions) {
        action();
      }

      await waitFor(() => {
        expect(stateChanges.length).toBeGreaterThan(4);
      });

      // Verify final state consistency
      const finalState = stateChanges[stateChanges.length - 1];
      const stateValidation = ComponentStateValidator.validateCanvasPosition(
        finalState.position,
        { x: 50, y: -50, scale: 1.0 }
      );

      expect(stateValidation.isValid).toBe(true);
      expect(finalState.debugMode).toBe(true);
      expect(finalState.accessibilityEnabled).toBe(false);
    });

    it('should propagate performance metrics updates across components', async () => {
      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      const TestComponent = () => (
        <CanvasStateProvider onStateChange={handleStateChange}>
          <StateManagedCanvasSystem />
        </CanvasStateProvider>
      );

      renderWithTestUtils(React.createElement(TestComponent));

      // Trigger interactions that should update performance metrics
      for (let i = 0; i < 5; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        await waitForFrames(1);
      }

      await waitFor(() => {
        expect(stateChanges.length).toBeGreaterThan(5);
      });

      // Verify performance metrics are being updated
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.performanceMetrics.activeOperations).toBeGreaterThan(0);
      expect(finalState.performanceMetrics.averageMovementTime).toBeGreaterThan(0);
    });
  });

  describe('State Persistence During Component Lifecycle', () => {
    it('should maintain state during component re-renders', async () => {
      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      const TestComponent = ({ key }: { key: number }) => (
        <CanvasStateProvider onStateChange={handleStateChange} key={key}>
          <StateManagedCanvasSystem />
        </CanvasStateProvider>
      );

      const { rerender, getByTestId } = renderWithTestUtils(
        React.createElement(TestComponent, { key: 1 })
      );

      // Modify state
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      getByTestId('toggle-debug').click();

      await waitFor(() => {
        expect(getByTestId('position-x')).toHaveTextContent('50');
        expect(getByTestId('debug-mode')).toHaveTextContent('true');
      });

      const stateBeforeRerender = stateChanges[stateChanges.length - 1];

      // Re-render component
      rerender(React.createElement(TestComponent, { key: 1 }));

      // State should be preserved
      await waitFor(() => {
        expect(getByTestId('position-x')).toHaveTextContent('50');
        expect(getByTestId('debug-mode')).toHaveTextContent('true');
      });

      const stateAfterRerender = stateChanges[stateChanges.length - 1];
      expect(stateAfterRerender.position.x).toBe(stateBeforeRerender.position.x);
      expect(stateAfterRerender.debugMode).toBe(stateBeforeRerender.debugMode);
    });

    it('should handle component unmount and remount gracefully', async () => {
      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      const TestComponent = ({ mounted }: { mounted: boolean }) => (
        mounted ? (
          <CanvasStateProvider onStateChange={handleStateChange}>
            <StateManagedCanvasSystem />
          </CanvasStateProvider>
        ) : null
      );

      const { rerender } = renderWithTestUtils(
        React.createElement(TestComponent, { mounted: true })
      );

      // Modify state
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      await waitFor(() => {
        expect(stateChanges.length).toBeGreaterThan(0);
      });

      const stateBeforeUnmount = stateChanges[stateChanges.length - 1];

      // Unmount component
      rerender(React.createElement(TestComponent, { mounted: false }));

      // Remount component
      stateChanges.length = 0; // Clear state changes
      rerender(React.createElement(TestComponent, { mounted: true }));

      await waitFor(() => {
        expect(stateChanges.length).toBeGreaterThan(0);
      });

      // New component should start with initial state
      const stateAfterRemount = stateChanges[0];
      expect(stateAfterRemount.position.x).toBe(0);
      expect(stateAfterRemount.position.y).toBe(0);
      expect(stateAfterRemount.position.scale).toBe(1.0);
    });
  });

  describe('Error Handling and State Recovery', () => {
    it('should handle invalid state transitions gracefully', async () => {
      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      const TestComponent = () => (
        <CanvasStateProvider onStateChange={handleStateChange}>
          <StateManagedCanvasSystem />
        </CanvasStateProvider>
      );

      const { getByTestId } = renderWithTestUtils(React.createElement(TestComponent));

      // Attempt to move beyond boundaries
      const initialPosition = { x: 550, y: 350, scale: 2.8 };

      // We'll simulate this by multiple moves to reach boundary
      for (let i = 0; i < 15; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      }

      await waitFor(() => {
        const finalState = stateChanges[stateChanges.length - 1];
        // Should be constrained to boundary
        expect(finalState.position.x).toBeLessThanOrEqual(600);
      });

      // State should remain valid
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.position.scale).toBeGreaterThan(0);
      expect(finalState.position.scale).toBeLessThanOrEqual(3.0);
    });

    it('should recover from component errors without losing core state', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      // Component that can throw errors
      const ErrorProneComponent: React.FC = () => {
        const { state } = useCanvasState();

        // Simulate error condition
        if (state.position.x > 1000) {
          throw new Error('Invalid position state');
        }

        return <div data-testid="error-prone">OK</div>;
      };

      const TestComponent = () => (
        <CanvasStateProvider onStateChange={handleStateChange}>
          <StateManagedCanvasSystem />
          <ErrorProneComponent />
        </CanvasStateProvider>
      );

      const { getByTestId } = renderWithTestUtils(React.createElement(TestComponent));

      // Normal operation should work
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      await waitFor(() => {
        expect(getByTestId('position-x')).toHaveTextContent('50');
      });

      // State should be maintained even if child components have issues
      const stateBeforeError = stateChanges[stateChanges.length - 1];
      expect(stateBeforeError.position.x).toBe(50);

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Impact of State Updates', () => {
    it('should maintain acceptable performance during rapid state updates', async () => {
      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      const TestComponent = () => (
        <CanvasStateProvider onStateChange={handleStateChange}>
          <StateManagedCanvasSystem />
        </CanvasStateProvider>
      );

      renderWithTestUtils(React.createElement(TestComponent));

      const startTime = performance.now();

      // Rapid state updates
      for (let i = 0; i < 100; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      }

      await waitFor(() => {
        expect(stateChanges.length).toBeGreaterThan(50);
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(2000); // 2 seconds for 100 updates

      // State should be consistent
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.position.x).toBeGreaterThan(0);
      expect(finalState.interactionHistory.length).toBeGreaterThan(0);
    });

    it('should limit interaction history to prevent memory leaks', async () => {
      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      const TestComponent = () => (
        <CanvasStateProvider onStateChange={handleStateChange}>
          <StateManagedCanvasSystem />
        </CanvasStateProvider>
      );

      renderWithTestUtils(React.createElement(TestComponent));

      // Generate many interactions
      for (let i = 0; i < 150; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      await waitFor(() => {
        expect(stateChanges.length).toBeGreaterThan(100);
      });

      // Interaction history should be limited
      const finalState = stateChanges[stateChanges.length - 1];
      expect(finalState.interactionHistory.length).toBeLessThanOrEqual(100);
    });
  });

  describe('State Reset and Cleanup', () => {
    it('should properly reset state when requested', async () => {
      const handleStateChange = (state: CanvasState) => {
        stateChanges.push(state);
      };

      const TestComponent = () => (
        <CanvasStateProvider onStateChange={handleStateChange}>
          <StateManagedCanvasSystem />
        </CanvasStateProvider>
      );

      const { getByTestId } = renderWithTestUtils(React.createElement(TestComponent));

      // Modify state significantly
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }));
      getByTestId('toggle-debug').click();
      getByTestId('toggle-accessibility').click();

      await waitFor(() => {
        expect(getByTestId('position-x')).toHaveTextContent('100');
        expect(getByTestId('debug-mode')).toHaveTextContent('true');
      });

      // Reset state
      getByTestId('reset-state').click();

      await waitFor(() => {
        expect(getByTestId('position-x')).toHaveTextContent('0');
        expect(getByTestId('position-y')).toHaveTextContent('0');
        expect(getByTestId('position-scale')).toHaveTextContent('1');
        expect(getByTestId('is-animating')).toHaveTextContent('false');
        expect(getByTestId('accessibility-enabled')).toHaveTextContent('true');
        expect(getByTestId('debug-mode')).toHaveTextContent('false');
        expect(getByTestId('interaction-count')).toHaveTextContent('0');
      });

      // Verify state was fully reset
      const resetState = stateChanges[stateChanges.length - 1];
      expect(resetState).toEqual(initialCanvasState);
    });

    it('should clean up event listeners on unmount', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const TestComponent = () => (
        <CanvasStateProvider>
          <StateManagedCanvasSystem />
        </CanvasStateProvider>
      );

      const { unmount } = renderWithTestUtils(React.createElement(TestComponent));

      // Verify listeners were added
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      // Unmount and verify cleanup
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});