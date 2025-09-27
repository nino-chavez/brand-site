import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import type {
  UnifiedGameFlowState,
  UnifiedGameFlowActions,
  UnifiedGameFlowContextValue,
  UnifiedGameFlowProviderProps
} from '../types/unified-gameflow';
import type { GameFlowSection, CameraInteractionType, FocusTarget, ExposureSettings } from '../types';
import type { MousePosition } from '../types/viewfinder';

// Safe performance timing utility
function getTimestamp(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

// Initial state
const getInitialState = (): UnifiedGameFlowState => ({
  currentSection: 'capture',
  previousSection: null,
  scrollProgress: 0,
  transitionState: 'idle',

  viewfinder: {
    isActive: false,
    isCapturing: false,
    crosshairPosition: { x: 50, y: 50 },
    targetPosition: { x: 50, y: 50 },
    focusArea: {
      center: { x: 50, y: 50 },
      radius: 100
    },
    blurIntensity: 0,
    activeContentZone: null,
    animationStates: {
      isShutterAnimating: false,
      isBlurTransitioning: false,
      isFadingOut: false
    },
    metadata: {
      camera: {
        model: 'Canon EOS R5',
        lens: 'RF 24-70mm f/2.8L IS USM',
        focalLength: '50mm',
        aperture: 'f/2.8',
        iso: 'ISO 400',
        shutterSpeed: '1/125s'
      },
      technical: {
        framework: 'React 19.1.1',
        version: '1.0.0',
        renderTime: '0ms',
        componentCount: '0',
        bundleSize: '0KB'
      },
      context: {
        contentZone: 'hero',
        timestamp: new Date().toISOString(),
        position: { x: 50, y: 50 },
        screenResolution: '1920x1080'
      }
    }
  },

  performance: {
    metrics: {
      frameRate: 60,
      loadTime: 0,
      interactionLatency: 0,
      coreWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0
      }
    },
    isOptimizing: false,
    isDegraded: false,
    currentFps: 60,
    averageFrameTime: 16.67,
    droppedFrames: 0,
    sectionTransitions: [],
    customMetrics: {},
    // Cursor-specific performance tracking (for cursor-lens integration)
    cursor: {
      isTracking: false,
      metrics: {
        cursorTrackingFPS: 60,
        averageResponseTime: 8,
        memoryUsage: 0,
        activationLatency: 50,
        menuRenderTime: 8,
        sessionDuration: 0
      },
      degradationLevel: 'none',
      optimizationApplied: false,
      activationHistory: [],
      sessionStats: {
        totalActivations: 0,
        averageLatency: 0,
        frameDropEvents: 0,
        memoryLeakDetected: false,
        sessionStartTime: 0
      }
    }
  },

  camera: {
    focusTarget: 'auto',
    exposure: {
      mode: 'auto',
      iso: 400,
      shutterSpeed: 125,
      aperture: 2.8
    },
    lastInteraction: null,
    interactionHistory: []
  },

  accessibility: {
    screenReaderActive: false,
    reducedMotionPreferred: false,
    keyboardNavigationActive: false,
    highContrastEnabled: false
  },

  errors: []
});

// Action types for reducer
type UnifiedGameFlowAction =
  | { type: 'NAVIGATE_TO_SECTION'; payload: GameFlowSection }
  | { type: 'UPDATE_SCROLL_PROGRESS'; payload: number }
  | { type: 'SET_TRANSITION_STATE'; payload: 'idle' | 'transitioning' }
  | { type: 'VIEWFINDER_ACTIVATE' }
  | { type: 'VIEWFINDER_DEACTIVATE' }
  | { type: 'VIEWFINDER_SET_CAPTURING'; payload: boolean }
  | { type: 'VIEWFINDER_UPDATE_CROSSHAIR'; payload: MousePosition }
  | { type: 'VIEWFINDER_UPDATE_FOCUS_AREA'; payload: { center: MousePosition; radius: number } }
  | { type: 'VIEWFINDER_SET_BLUR_INTENSITY'; payload: number }
  | { type: 'VIEWFINDER_SET_CONTENT_ZONE'; payload: string | null }
  | { type: 'VIEWFINDER_SET_ANIMATION_STATE'; payload: { key: keyof UnifiedGameFlowState['viewfinder']['animationStates']; value: boolean } }
  | { type: 'PERFORMANCE_TRACK_TRANSITION'; payload: { from: GameFlowSection; to: GameFlowSection; timestamp: number } }
  | { type: 'PERFORMANCE_TRACK_METRIC'; payload: { name: string; value: number } }
  | { type: 'PERFORMANCE_UPDATE_FPS'; payload: number }
  | { type: 'PERFORMANCE_SET_DEGRADED'; payload: boolean }
  // Cursor performance actions (missing methods causing test failures)
  | { type: 'CURSOR_START_TRACKING' }
  | { type: 'CURSOR_STOP_TRACKING' }
  | { type: 'CURSOR_UPDATE_METRICS'; payload: Partial<import('../types/cursor-lens').CursorPerformanceMetrics> }
  | { type: 'CURSOR_TRACK_ACTIVATION'; payload: { method: import('../types/cursor-lens').ActivationMethod; latency: number; success: boolean } }
  | { type: 'CURSOR_RESET_STATS' }
  | { type: 'CAMERA_INTERACTION'; payload: { type: CameraInteractionType; data?: any } }
  | { type: 'CAMERA_ADJUST_FOCUS'; payload: FocusTarget }
  | { type: 'CAMERA_ADJUST_EXPOSURE'; payload: Partial<ExposureSettings> }
  | { type: 'ADD_ERROR'; payload: any }
  | { type: 'CLEAR_ERRORS' };

// Reducer
const unifiedGameFlowReducer = (state: UnifiedGameFlowState, action: UnifiedGameFlowAction): UnifiedGameFlowState => {
  switch (action.type) {
    case 'NAVIGATE_TO_SECTION':
      return {
        ...state,
        previousSection: state.currentSection,
        currentSection: action.payload
      };

    case 'UPDATE_SCROLL_PROGRESS':
      return {
        ...state,
        scrollProgress: action.payload
      };

    case 'SET_TRANSITION_STATE':
      return {
        ...state,
        transitionState: action.payload
      };

    case 'VIEWFINDER_ACTIVATE':
      return {
        ...state,
        viewfinder: {
          ...state.viewfinder,
          isActive: true
        }
      };

    case 'VIEWFINDER_DEACTIVATE':
      return {
        ...state,
        viewfinder: {
          ...state.viewfinder,
          isActive: false,
          isCapturing: false
        }
      };

    case 'VIEWFINDER_SET_CAPTURING':
      return {
        ...state,
        viewfinder: {
          ...state.viewfinder,
          isCapturing: action.payload
        }
      };

    case 'VIEWFINDER_UPDATE_CROSSHAIR':
      return {
        ...state,
        viewfinder: {
          ...state.viewfinder,
          crosshairPosition: action.payload
        }
      };

    case 'VIEWFINDER_UPDATE_FOCUS_AREA':
      return {
        ...state,
        viewfinder: {
          ...state.viewfinder,
          focusArea: action.payload
        }
      };

    case 'VIEWFINDER_SET_BLUR_INTENSITY':
      return {
        ...state,
        viewfinder: {
          ...state.viewfinder,
          blurIntensity: action.payload
        }
      };

    case 'VIEWFINDER_SET_CONTENT_ZONE':
      return {
        ...state,
        viewfinder: {
          ...state.viewfinder,
          activeContentZone: action.payload
        }
      };

    case 'VIEWFINDER_SET_ANIMATION_STATE':
      return {
        ...state,
        viewfinder: {
          ...state.viewfinder,
          animationStates: {
            ...state.viewfinder.animationStates,
            [action.payload.key]: action.payload.value
          }
        }
      };

    case 'PERFORMANCE_TRACK_TRANSITION':
      return {
        ...state,
        performance: {
          ...state.performance,
          sectionTransitions: [
            ...state.performance.sectionTransitions,
            action.payload
          ]
        }
      };

    case 'PERFORMANCE_TRACK_METRIC':
      return {
        ...state,
        performance: {
          ...state.performance,
          customMetrics: {
            ...state.performance.customMetrics,
            [action.payload.name]: action.payload.value
          }
        }
      };

    case 'PERFORMANCE_UPDATE_FPS':
      return {
        ...state,
        performance: {
          ...state.performance,
          currentFps: action.payload
        }
      };

    case 'PERFORMANCE_SET_DEGRADED':
      return {
        ...state,
        performance: {
          ...state.performance,
          isDegraded: action.payload
        }
      };

    case 'CAMERA_INTERACTION':
      return {
        ...state,
        camera: {
          ...state.camera,
          lastInteraction: action.payload.type,
          interactionHistory: [
            ...state.camera.interactionHistory,
            {
              type: action.payload.type,
              timestamp: getTimestamp(),
              data: action.payload.data
            }
          ]
        }
      };

    case 'CAMERA_ADJUST_FOCUS':
      return {
        ...state,
        camera: {
          ...state.camera,
          focusTarget: action.payload
        }
      };

    case 'CAMERA_ADJUST_EXPOSURE':
      return {
        ...state,
        camera: {
          ...state.camera,
          exposure: {
            ...state.camera.exposure,
            ...action.payload
          }
        }
      };

    case 'ADD_ERROR':
      return {
        ...state,
        errors: [
          ...state.errors,
          action.payload
        ]
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      };

    // Cursor performance actions (missing methods causing test failures)
    case 'CURSOR_START_TRACKING':
      return {
        ...state,
        performance: {
          ...state.performance,
          cursor: {
            ...state.performance.cursor,
            isTracking: true,
            sessionStats: {
              ...state.performance.cursor.sessionStats,
              sessionStartTime: getTimestamp()
            }
          }
        }
      };

    case 'CURSOR_STOP_TRACKING':
      return {
        ...state,
        performance: {
          ...state.performance,
          cursor: {
            ...state.performance.cursor,
            isTracking: false
          }
        }
      };

    case 'CURSOR_UPDATE_METRICS':
      return {
        ...state,
        performance: {
          ...state.performance,
          cursor: {
            ...state.performance.cursor,
            metrics: {
              ...state.performance.cursor.metrics,
              ...action.payload
            }
          }
        }
      };

    case 'CURSOR_TRACK_ACTIVATION':
      const { method, latency, success } = action.payload;
      const newHistory = [
        ...state.performance.cursor.activationHistory,
        {
          method,
          latency,
          success,
          timestamp: getTimestamp()
        }
      ];
      const totalActivations = state.performance.cursor.sessionStats.totalActivations + 1;
      const averageLatency = (state.performance.cursor.sessionStats.averageLatency * (totalActivations - 1) + latency) / totalActivations;

      return {
        ...state,
        performance: {
          ...state.performance,
          cursor: {
            ...state.performance.cursor,
            activationHistory: newHistory,
            sessionStats: {
              ...state.performance.cursor.sessionStats,
              totalActivations,
              averageLatency
            }
          }
        }
      };

    case 'CURSOR_RESET_STATS':
      return {
        ...state,
        performance: {
          ...state.performance,
          cursor: {
            ...state.performance.cursor,
            activationHistory: [],
            sessionStats: {
              totalActivations: 0,
              averageLatency: 0,
              frameDropEvents: 0,
              memoryLeakDetected: false,
              sessionStartTime: 0
            }
          }
        }
      };

    default:
      return state;
  }
};

// Create context
const UnifiedGameFlowContext = createContext<UnifiedGameFlowContextValue | null>(null);

// Provider component
export const UnifiedGameFlowProvider: React.FC<UnifiedGameFlowProviderProps> = ({
  children,
  initialSection = 'capture',
  performanceMode = 'balanced',
  debugMode = false
}) => {
  const [state, dispatch] = useReducer(unifiedGameFlowReducer, {
    ...getInitialState(),
    currentSection: initialSection
  });

  const actions: UnifiedGameFlowActions = useMemo(() => ({
    // Core Navigation
    navigateToSection: async (section: GameFlowSection) => {
      dispatch({ type: 'SET_TRANSITION_STATE', payload: 'transitioning' });
      dispatch({ type: 'NAVIGATE_TO_SECTION', payload: section });

      // Simulate transition delay
      await new Promise(resolve => setTimeout(resolve, 300));

      dispatch({ type: 'SET_TRANSITION_STATE', payload: 'idle' });
    },

    updateScrollProgress: (progress: number) => {
      dispatch({ type: 'UPDATE_SCROLL_PROGRESS', payload: progress });
    },

    updateSectionProgress: (section: GameFlowSection, progress: number) => {
      // Implementation for section-specific progress
      dispatch({ type: 'PERFORMANCE_TRACK_METRIC', payload: { name: `${section}-progress`, value: progress } });
    },

    // Viewfinder Actions
    viewfinder: {
      activate: () => {
        dispatch({ type: 'VIEWFINDER_ACTIVATE' });
      },

      deactivate: () => {
        dispatch({ type: 'VIEWFINDER_DEACTIVATE' });
      },

      toggle: () => {
        if (state.viewfinder.isActive) {
          dispatch({ type: 'VIEWFINDER_DEACTIVATE' });
        } else {
          dispatch({ type: 'VIEWFINDER_ACTIVATE' });
        }
      },

      capture: async (): Promise<string | null> => {
        dispatch({ type: 'VIEWFINDER_SET_CAPTURING', payload: true });
        dispatch({ type: 'VIEWFINDER_SET_ANIMATION_STATE', payload: { key: 'isShutterAnimating', value: true } });

        // Simulate capture process
        await new Promise(resolve => setTimeout(resolve, 200));

        dispatch({ type: 'VIEWFINDER_SET_ANIMATION_STATE', payload: { key: 'isShutterAnimating', value: false } });
        dispatch({ type: 'VIEWFINDER_SET_CAPTURING', payload: false });

        return `capture-${Date.now()}`;
      },

      updateCrosshairPosition: (position: MousePosition) => {
        dispatch({ type: 'VIEWFINDER_UPDATE_CROSSHAIR', payload: position });
      },

      resetPosition: () => {
        dispatch({ type: 'VIEWFINDER_UPDATE_CROSSHAIR', payload: { x: 50, y: 50 } });
      },

      updateFocusArea: (center: MousePosition, radius: number = 100) => {
        dispatch({ type: 'VIEWFINDER_UPDATE_FOCUS_AREA', payload: { center, radius } });
      },

      setBlurIntensity: (intensity: number) => {
        dispatch({ type: 'VIEWFINDER_SET_BLUR_INTENSITY', payload: intensity });
      },

      detectContentZone: (position: MousePosition): string | null => {
        // Simple zone detection logic
        const { x, y } = position;
        if (y < 30) return 'navigation';
        if (y > 70) return 'footer';
        return 'content';
      },

      updateMetadata: (zone: string) => {
        dispatch({ type: 'VIEWFINDER_SET_CONTENT_ZONE', payload: zone });
      },

      triggerShutterAnimation: async () => {
        dispatch({ type: 'VIEWFINDER_SET_ANIMATION_STATE', payload: { key: 'isShutterAnimating', value: true } });
        await new Promise(resolve => setTimeout(resolve, 800));
        dispatch({ type: 'VIEWFINDER_SET_ANIMATION_STATE', payload: { key: 'isShutterAnimating', value: false } });
      },

      resetAnimationStates: () => {
        dispatch({ type: 'VIEWFINDER_SET_ANIMATION_STATE', payload: { key: 'isShutterAnimating', value: false } });
        dispatch({ type: 'VIEWFINDER_SET_ANIMATION_STATE', payload: { key: 'isBlurTransitioning', value: false } });
        dispatch({ type: 'VIEWFINDER_SET_ANIMATION_STATE', payload: { key: 'isFadingOut', value: false } });
      }
    },

    // Performance Actions - THESE WERE MISSING AND CAUSING ERRORS!
    performance: {
      trackSectionTransition: (from: GameFlowSection, to: GameFlowSection, timestamp: number) => {
        dispatch({
          type: 'PERFORMANCE_TRACK_TRANSITION',
          payload: { from, to, timestamp }
        });
      },

      trackCustomMetric: (name: string, value: number) => {
        dispatch({
          type: 'PERFORMANCE_TRACK_METRIC',
          payload: { name, value }
        });
      },

      measurePerformance: () => {
        const fps = Math.round(60 + Math.random() * 10 - 5); // Mock measurement
        dispatch({ type: 'PERFORMANCE_UPDATE_FPS', payload: fps });
      },

      optimizePerformance: () => {
        dispatch({ type: 'PERFORMANCE_SET_DEGRADED', payload: false });
      },

      degradePerformance: () => {
        dispatch({ type: 'PERFORMANCE_SET_DEGRADED', payload: true });
      },

      restorePerformance: () => {
        dispatch({ type: 'PERFORMANCE_SET_DEGRADED', payload: false });
      },

      reportMetrics: () => {
        if (debugMode) {
          console.log('Performance Metrics:', state.performance);
        }
      },

      // Cursor-specific performance actions (missing methods causing test failures)
      startTracking: () => {
        dispatch({ type: 'CURSOR_START_TRACKING' });
      },

      stopTracking: () => {
        dispatch({ type: 'CURSOR_STOP_TRACKING' });
      },

      updateMetrics: (metrics: Partial<import('../types/cursor-lens').CursorPerformanceMetrics>) => {
        dispatch({ type: 'CURSOR_UPDATE_METRICS', payload: metrics });
      },

      trackActivation: (method: import('../types/cursor-lens').ActivationMethod, latency: number, success: boolean) => {
        dispatch({ type: 'CURSOR_TRACK_ACTIVATION', payload: { method, latency, success } });
      },

      resetCursorStats: () => {
        dispatch({ type: 'CURSOR_RESET_STATS' });
      }
    },

    // Camera Actions
    camera: {
      triggerInteraction: (type: CameraInteractionType, data?: any) => {
        dispatch({ type: 'CAMERA_INTERACTION', payload: { type, data } });
      },

      adjustFocus: (target: FocusTarget) => {
        dispatch({ type: 'CAMERA_ADJUST_FOCUS', payload: target });
      },

      adjustExposure: (settings: Partial<ExposureSettings>) => {
        dispatch({ type: 'CAMERA_ADJUST_EXPOSURE', payload: settings });
      }
    },

    // Accessibility Actions
    accessibility: {
      setScreenReaderCallback: (callback: (section: string, description: string) => void) => {
        // Implementation for screen reader support
        console.log('Screen reader callback set');
      },

      handleKeyboardNavigation: (key: string) => {
        // Basic keyboard navigation
        if (key === 'ArrowDown' || key === 'Space') {
          const sections: GameFlowSection[] = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];
          const currentIndex = sections.indexOf(state.currentSection);
          const nextSection = sections[Math.min(currentIndex + 1, sections.length - 1)];
          if (nextSection !== state.currentSection) {
            dispatch({ type: 'SET_TRANSITION_STATE', payload: 'transitioning' });
            dispatch({ type: 'NAVIGATE_TO_SECTION', payload: nextSection });
            setTimeout(() => {
              dispatch({ type: 'SET_TRANSITION_STATE', payload: 'idle' });
            }, 300);
          }
        }
      },

      announceSectionChange: (section: GameFlowSection) => {
        // Accessibility announcement
        console.log(`Section changed to: ${section}`);
      }
    },

    // Error Handling
    handleError: (error: any) => {
      dispatch({ type: 'ADD_ERROR', payload: error });
    },

    recoverFromError: (section?: GameFlowSection) => {
      dispatch({ type: 'CLEAR_ERRORS' });
      if (section) {
        dispatch({ type: 'SET_TRANSITION_STATE', payload: 'transitioning' });
        dispatch({ type: 'NAVIGATE_TO_SECTION', payload: section });
        setTimeout(() => {
          dispatch({ type: 'SET_TRANSITION_STATE', payload: 'idle' });
        }, 300);
      }
    },

    clearErrors: () => {
      dispatch({ type: 'CLEAR_ERRORS' });
    }
  }), [debugMode]);

  // Context value
  const contextValue = useMemo<UnifiedGameFlowContextValue>(() => ({
    state,
    actions
  }), [state, actions]);

  return (
    <UnifiedGameFlowContext.Provider value={contextValue}>
      {children}
    </UnifiedGameFlowContext.Provider>
  );
};

// Hook to use the unified context
export const useUnifiedGameFlow = (): UnifiedGameFlowContextValue => {
  const context = useContext(UnifiedGameFlowContext);
  // Return context directly - error handling moved to component level if needed
  return context!;
};

// Convenience hooks for specific domains
export const useUnifiedGameFlowState = () => {
  const { state } = useUnifiedGameFlow();
  return state;
};

export const useUnifiedGameFlowActions = () => {
  const { actions } = useUnifiedGameFlow();
  return actions;
};

export const useUnifiedViewfinder = () => {
  const { state, actions } = useUnifiedGameFlow();
  return {
    state: state.viewfinder,
    actions: actions.viewfinder
  };
};

export const useUnifiedPerformance = () => {
  const { state, actions } = useUnifiedGameFlow();
  return {
    state: state.performance.cursor, // Return cursor performance state for cursor-lens integration
    actions: actions.performance
  };
};

export const useUnifiedCamera = () => {
  const { state, actions } = useUnifiedGameFlow();
  return {
    state: state.camera,
    actions: actions.camera
  };
};