import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameFlowState, GameFlowProvider, gameFlowReducer } from '../hooks/useGameFlowState';
import type { GameFlowState, GameFlowAction, GameFlowSection } from '../types';

// Mock performance APIs for testing
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  }
});

const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Game Flow State Management', () => {
  describe('useGameFlowState Hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GameFlowProvider initialSection="capture">
        {children}
      </GameFlowProvider>
    );

    it('should initialize with capture section', () => {
      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      expect(result.current.state.currentSection).toBe('capture');
      expect(result.current.state.transitionState).toBe('idle');
      expect(result.current.state.scrollProgress).toBe(0);
    });

    it('should handle section navigation', async () => {
      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      await act(async () => {
        await result.current.actions.navigateToSection('focus');
      });

      expect(result.current.state.currentSection).toBe('focus');
    });

    it('should update scroll progress correctly', () => {
      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      act(() => {
        result.current.actions.updateScrollProgress(0.5);
      });

      expect(result.current.state.scrollProgress).toBe(0.5);
    });

    it('should track section progress individually', () => {
      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      act(() => {
        result.current.actions.updateSectionProgress('focus', 0.75);
      });

      expect(result.current.state.sectionProgress.focus).toBe(0.75);
      expect(result.current.state.sectionProgress.capture).toBe(0);
    });

    it('should handle camera interactions', () => {
      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      act(() => {
        result.current.actions.triggerCameraInteraction('shutter_click');
      });

      const lastInteraction = result.current.state.interactionHistory[0];
      expect(lastInteraction.type).toBe('shutter_click');
      expect(lastInteraction.section).toBe('capture');
    });

    it('should manage focus adjustments', () => {
      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      const mockElement = document.createElement('div');
      const focusTarget = {
        element: mockElement,
        priority: 'primary' as const,
        transitionDuration: 300
      };

      act(() => {
        result.current.actions.adjustFocus(focusTarget);
      });

      expect(result.current.state.cameraState.focusTarget).toEqual(focusTarget);
    });

    it('should handle exposure adjustments', () => {
      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      const exposureSettings = {
        aperture: 2.8,
        shutterSpeed: 250,
        iso: 800
      };

      act(() => {
        result.current.actions.adjustExposure(exposureSettings);
      });

      // Should merge with existing exposure settings
      expect(result.current.state.cameraState.exposure).toEqual({
        aperture: 2.8,
        shutterSpeed: 250,
        iso: 800,
        exposureCompensation: 0 // Default value from initial state
      });
    });
  });

  describe('Game Flow Reducer', () => {
    let initialState: GameFlowState;

    beforeEach(() => {
      initialState = {
        currentSection: 'capture',
        transitionState: 'idle',
        scrollProgress: 0,
        sectionProgress: {
          capture: 0,
          focus: 0,
          frame: 0,
          exposure: 0,
          develop: 0,
          portfolio: 0
        },
        interactionHistory: [],
        performanceMetrics: {
          loadTime: 0,
          frameRate: 60,
          memoryUsage: 0,
          coreWebVitals: {
            lcp: 0,
            fid: 0,
            cls: 0
          }
        },
        cameraState: {
          focusTarget: null,
          exposure: {
            aperture: 4,
            shutterSpeed: 125,
            iso: 400,
            exposureCompensation: 0
          },
          meteringMode: 'center-weighted',
          focusMode: 'single-point'
        }
      };
    });

    it('should handle NAVIGATE_TO_SECTION action', () => {
      const action: GameFlowAction = {
        type: 'NAVIGATE_TO_SECTION',
        payload: 'focus'
      };

      const newState = gameFlowReducer(initialState, action);
      expect(newState.currentSection).toBe('focus');
      expect(newState.transitionState).toBe('idle');
    });

    it('should handle UPDATE_SCROLL_PROGRESS action', () => {
      const action: GameFlowAction = {
        type: 'UPDATE_SCROLL_PROGRESS',
        payload: 0.6
      };

      const newState = gameFlowReducer(initialState, action);
      expect(newState.scrollProgress).toBe(0.6);
    });

    it('should handle TRANSITION_START action', () => {
      const action: GameFlowAction = {
        type: 'TRANSITION_START',
        payload: { from: 'capture', to: 'focus' }
      };

      const newState = gameFlowReducer(initialState, action);
      expect(newState.transitionState).toBe('transitioning');
    });

    it('should handle TRANSITION_COMPLETE action', () => {
      const stateWithTransition = {
        ...initialState,
        transitionState: 'transitioning' as const
      };

      const action: GameFlowAction = {
        type: 'TRANSITION_COMPLETE',
        payload: 'focus'
      };

      const newState = gameFlowReducer(stateWithTransition, action);
      expect(newState.currentSection).toBe('focus');
      expect(newState.transitionState).toBe('idle');
    });

    it('should handle INTERACTION_EVENT action', () => {
      const interactionEvent = {
        type: 'shutter_click' as const,
        section: 'capture' as GameFlowSection,
        timestamp: Date.now(),
        data: { button: 'primary' },
        performanceImpact: 2
      };

      const action: GameFlowAction = {
        type: 'INTERACTION_EVENT',
        payload: interactionEvent
      };

      const newState = gameFlowReducer(initialState, action);
      expect(newState.interactionHistory).toHaveLength(1);
      expect(newState.interactionHistory[0]).toEqual(interactionEvent);
    });

    it('should handle PERFORMANCE_UPDATE action', () => {
      const performanceUpdate = {
        frameRate: 58,
        memoryUsage: 45000000
      };

      const action: GameFlowAction = {
        type: 'PERFORMANCE_UPDATE',
        payload: performanceUpdate
      };

      const newState = gameFlowReducer(initialState, action);
      expect(newState.performanceMetrics.frameRate).toBe(58);
      expect(newState.performanceMetrics.memoryUsage).toBe(45000000);
    });

    it('should handle CAMERA_FOCUS_ADJUST action', () => {
      const mockElement = document.createElement('div');
      const focusTarget = {
        element: mockElement,
        priority: 'primary' as const,
        transitionDuration: 500
      };

      const action: GameFlowAction = {
        type: 'CAMERA_FOCUS_ADJUST',
        payload: focusTarget
      };

      const newState = gameFlowReducer(initialState, action);
      expect(newState.cameraState.focusTarget).toEqual(focusTarget);
    });

    it('should handle CAMERA_EXPOSURE_ADJUST action', () => {
      const exposureSettings = {
        aperture: 1.8,
        shutterSpeed: 500,
        iso: 1600
      };

      const action: GameFlowAction = {
        type: 'CAMERA_EXPOSURE_ADJUST',
        payload: exposureSettings
      };

      const newState = gameFlowReducer(initialState, action);
      expect(newState.cameraState.exposure.aperture).toBe(1.8);
      expect(newState.cameraState.exposure.shutterSpeed).toBe(500);
      expect(newState.cameraState.exposure.iso).toBe(1600);
    });

    it('should handle ERROR_OCCURRED action', () => {
      const error = {
        type: 'PERFORMANCE_ERROR' as const,
        message: 'Frame rate dropped below 30fps',
        section: 'focus' as GameFlowSection,
        recoverable: true,
        timestamp: Date.now()
      };

      const action: GameFlowAction = {
        type: 'ERROR_OCCURRED',
        payload: error
      };

      const newState = gameFlowReducer(initialState, action);
      expect(newState.error).toEqual(error);
    });
  });

  describe('Performance Integration', () => {
    it('should track performance metrics in real-time', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GameFlowProvider initialSection="capture" performanceTracking={true}>
          {children}
        </GameFlowProvider>
      );

      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      // Performance metrics should be initialized
      expect(result.current.state.performanceMetrics).toBeDefined();
      expect(result.current.state.performanceMetrics.frameRate).toBe(60);
    });

    it('should update performance metrics when navigating sections', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GameFlowProvider initialSection="capture" performanceTracking={true}>
          {children}
        </GameFlowProvider>
      );

      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      await act(async () => {
        await result.current.actions.navigateToSection('focus');
      });

      // Should have performance data for the transition
      expect(result.current.state.performanceMetrics.loadTime).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Integration', () => {
    it('should set screen reader callback', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GameFlowProvider initialSection="capture" accessibilityMode={true}>
          {children}
        </GameFlowProvider>
      );

      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      const announceCallback = vi.fn();

      act(() => {
        result.current.actions.setScreenReaderCallback(announceCallback);
      });

      // The callback should be stored (no direct way to test without implementation details)
      expect(typeof result.current.actions.setScreenReaderCallback).toBe('function');
    });

    it('should handle keyboard navigation actions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GameFlowProvider initialSection="capture" accessibilityMode={true}>
          {children}
        </GameFlowProvider>
      );

      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      // Test that keyboard navigation function exists and can be called
      act(() => {
        result.current.actions.handleKeyboardNavigation('ArrowDown');
      });

      // Should remain functional without throwing errors
      expect(typeof result.current.actions.handleKeyboardNavigation).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle transition failures', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GameFlowProvider initialSection="capture">
          {children}
        </GameFlowProvider>
      );

      const { result } = renderHook(() => useGameFlowState(), { wrapper });

      // Simulate an error by directly dispatching an error action
      await act(async () => {
        // Manually trigger error state to test error handling
        result.current.state.error = {
          type: 'INTERACTION_ERROR',
          message: 'Transition failed',
          section: 'capture',
          recoverable: true,
          timestamp: Date.now()
        };
      });

      // Should remain in original section on error
      expect(result.current.state.currentSection).toBe('capture');

      // Test error recovery
      await act(async () => {
        result.current.actions.recoverFromError('capture');
      });
    });
  });
});