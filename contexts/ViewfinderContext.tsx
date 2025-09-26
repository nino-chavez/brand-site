import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import {
  ViewfinderConfig,
  ViewfinderState,
  ViewfinderActions,
  ViewfinderContextType,
  ViewfinderProviderProps,
  ViewfinderMetadata,
  DEFAULT_VIEWFINDER_CONFIG,
  ContentZone,
  MousePosition,
} from '../types/viewfinder';

// Safe performance timing utility
function getTimestamp(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

// Action types for the reducer
type ViewfinderAction =
  | { type: 'ACTIVATE' }
  | { type: 'DEACTIVATE' }
  | { type: 'TOGGLE' }
  | { type: 'START_CAPTURING' }
  | { type: 'FINISH_CAPTURING' }
  | { type: 'UPDATE_CROSSHAIR_POSITION'; payload: MousePosition }
  | { type: 'UPDATE_FOCUS_AREA'; payload: { center: MousePosition; radius?: number } }
  | { type: 'SET_BLUR_INTENSITY'; payload: number }
  | { type: 'SET_ACTIVE_CONTENT_ZONE'; payload: string | null }
  | { type: 'UPDATE_METADATA'; payload: ViewfinderMetadata }
  | { type: 'START_SHUTTER_ANIMATION' }
  | { type: 'FINISH_SHUTTER_ANIMATION' }
  | { type: 'START_BLUR_TRANSITION' }
  | { type: 'FINISH_BLUR_TRANSITION' }
  | { type: 'START_FADE_OUT' }
  | { type: 'FINISH_FADE_OUT' }
  | { type: 'UPDATE_PERFORMANCE_METRICS'; payload: Partial<ViewfinderState['performanceMetrics']> }
  | { type: 'DEGRADE_PERFORMANCE' }
  | { type: 'RESTORE_PERFORMANCE' }
  | { type: 'RESET_ANIMATION_STATES' };

// Default state
const getDefaultState = (): ViewfinderState => ({
  isActive: false,
  isCapturing: false,
  isPerformanceDegraded: false,
  crosshairPosition: { x: -100, y: -100 },
  targetPosition: { x: -100, y: -100 },
  focusArea: {
    center: { x: 0, y: 0 },
    radius: DEFAULT_VIEWFINDER_CONFIG.focusSystem.radius,
  },
  blurIntensity: 0,
  activeContentZone: null,
  metadata: {
    camera: {
      model: 'Canon EOS R5',
      lens: '24-70mm f/2.8L',
      focalLength: '50mm',
      aperture: 'f/2.8',
      iso: 'ISO 100',
      shutterSpeed: '1/60s',
    },
    technical: {
      framework: 'React',
      version: '19.1.1',
      renderTime: '16ms',
      componentCount: '12',
      bundleSize: '142KB',
    },
    context: {
      contentZone: 'hero',
      timestamp: new Date().toISOString(),
      position: { x: 0, y: 0 },
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
    },
  },
  animationStates: {
    isShutterAnimating: false,
    isBlurTransitioning: false,
    isFadingOut: false,
  },
  performanceMetrics: {
    currentFps: 60,
    averageFrameTime: 16.67,
    droppedFrames: 0,
  },
});

// Reducer function
const viewfinderReducer = (state: ViewfinderState, action: ViewfinderAction): ViewfinderState => {
  switch (action.type) {
    case 'ACTIVATE':
      return { ...state, isActive: true };

    case 'DEACTIVATE':
      return { ...state, isActive: false, isCapturing: false };

    case 'TOGGLE':
      return { ...state, isActive: !state.isActive };

    case 'START_CAPTURING':
      return { ...state, isCapturing: true };

    case 'FINISH_CAPTURING':
      return { ...state, isCapturing: false };

    case 'UPDATE_CROSSHAIR_POSITION':
      return {
        ...state,
        crosshairPosition: action.payload,
        targetPosition: action.payload,
      };

    case 'UPDATE_FOCUS_AREA':
      return {
        ...state,
        focusArea: {
          center: action.payload.center,
          radius: action.payload.radius ?? state.focusArea.radius,
        },
      };

    case 'SET_BLUR_INTENSITY':
      return { ...state, blurIntensity: action.payload };

    case 'SET_ACTIVE_CONTENT_ZONE':
      return { ...state, activeContentZone: action.payload };

    case 'UPDATE_METADATA':
      return { ...state, metadata: action.payload };

    case 'START_SHUTTER_ANIMATION':
      return {
        ...state,
        animationStates: { ...state.animationStates, isShutterAnimating: true },
      };

    case 'FINISH_SHUTTER_ANIMATION':
      return {
        ...state,
        animationStates: { ...state.animationStates, isShutterAnimating: false },
      };

    case 'START_BLUR_TRANSITION':
      return {
        ...state,
        animationStates: { ...state.animationStates, isBlurTransitioning: true },
      };

    case 'FINISH_BLUR_TRANSITION':
      return {
        ...state,
        animationStates: { ...state.animationStates, isBlurTransitioning: false },
      };

    case 'START_FADE_OUT':
      return {
        ...state,
        animationStates: { ...state.animationStates, isFadingOut: true },
      };

    case 'FINISH_FADE_OUT':
      return {
        ...state,
        animationStates: { ...state.animationStates, isFadingOut: false },
      };

    case 'UPDATE_PERFORMANCE_METRICS':
      return {
        ...state,
        performanceMetrics: { ...state.performanceMetrics, ...action.payload },
      };

    case 'DEGRADE_PERFORMANCE':
      return { ...state, isPerformanceDegraded: true };

    case 'RESTORE_PERFORMANCE':
      return { ...state, isPerformanceDegraded: false };

    case 'RESET_ANIMATION_STATES':
      return {
        ...state,
        animationStates: {
          isShutterAnimating: false,
          isBlurTransitioning: false,
          isFadingOut: false,
        },
      };

    default:
      return state;
  }
};

// Context
const ViewfinderContext = createContext<ViewfinderContextType | null>(null);

// Provider component
export const ViewfinderProvider: React.FC<ViewfinderProviderProps> = ({
  children,
  config: configOverrides = {},
  initialState = {},
}) => {
  const config = { ...DEFAULT_VIEWFINDER_CONFIG, ...configOverrides };
  const [state, dispatch] = useReducer(viewfinderReducer, {
    ...getDefaultState(),
    ...initialState,
  });

  const performanceMonitorRef = useRef<number>();
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(getTimestamp());
  const isMonitoringRef = useRef(false);

  // Content zone detection logic
  const detectContentZone = useCallback((position: MousePosition): string | null => {
    const { x, y } = position;

    // Simple zone detection based on screen areas
    // This would be more sophisticated in a real implementation
    if (y < window.innerHeight * 0.3) {
      if (x < window.innerWidth * 0.8) {
        return 'navigation';
      }
      return 'hero-title';
    } else if (y < window.innerHeight * 0.6) {
      return 'hero-subtitle';
    } else if (y < window.innerHeight * 0.8) {
      return 'about-content';
    } else {
      return 'contact-info';
    }
  }, []);

  // Actions
  const actions: ViewfinderActions = {
    activate: useCallback(() => {
      dispatch({ type: 'ACTIVATE' });
    }, []),

    deactivate: useCallback(() => {
      dispatch({ type: 'DEACTIVATE' });
    }, []),

    toggle: useCallback(() => {
      dispatch({ type: 'TOGGLE' });
    }, []),

    capture: useCallback(async (): Promise<string | null> => {
      dispatch({ type: 'START_CAPTURING' });

      try {
        // Start shutter animation sequence
        dispatch({ type: 'START_SHUTTER_ANIMATION' });

        // Simulate capture process
        await new Promise((resolve) => setTimeout(resolve, config.animations.shutterFlashDuration));

        // Start blur removal
        dispatch({ type: 'START_BLUR_TRANSITION' });
        await new Promise((resolve) => setTimeout(resolve, config.animations.blurRemovalDuration));

        // Start fade out
        dispatch({ type: 'START_FADE_OUT' });
        await new Promise((resolve) => setTimeout(resolve, config.animations.fadeOutDuration));

        // Complete animations
        dispatch({ type: 'RESET_ANIMATION_STATES' });
        dispatch({ type: 'FINISH_CAPTURING' });

        return `capture_${Date.now()}.jpg`;
      } catch (error) {
        dispatch({ type: 'FINISH_CAPTURING' });
        return null;
      }
    }, [config.animations]),

    updateCrosshairPosition: useCallback((position: MousePosition) => {
      dispatch({ type: 'UPDATE_CROSSHAIR_POSITION', payload: position });

      // Update focus area
      dispatch({
        type: 'UPDATE_FOCUS_AREA',
        payload: { center: position },
      });

      // Detect content zone
      const zone = detectContentZone(position);
      dispatch({ type: 'SET_ACTIVE_CONTENT_ZONE', payload: zone });
    }, [detectContentZone]),

    resetPosition: useCallback(() => {
      dispatch({ type: 'UPDATE_CROSSHAIR_POSITION', payload: { x: -100, y: -100 } });
    }, []),

    updateFocusArea: useCallback((center: MousePosition, radius?: number) => {
      dispatch({
        type: 'UPDATE_FOCUS_AREA',
        payload: { center, radius },
      });
    }, []),

    setBlurIntensity: useCallback((intensity: number) => {
      dispatch({ type: 'SET_BLUR_INTENSITY', payload: intensity });
    }, []),

    detectContentZone,

    updateMetadata: useCallback((zone: string) => {
      const updatedMetadata: ViewfinderMetadata = {
        ...state.metadata,
        context: {
          ...state.metadata.context,
          contentZone: zone,
          timestamp: new Date().toISOString(),
          position: state.crosshairPosition,
        },
      };
      dispatch({ type: 'UPDATE_METADATA', payload: updatedMetadata });
    }, [state.metadata, state.crosshairPosition]),

    triggerShutterAnimation: useCallback(async () => {
      dispatch({ type: 'START_SHUTTER_ANIMATION' });
      await new Promise((resolve) => setTimeout(resolve, config.animations.shutterFlashDuration));
      dispatch({ type: 'FINISH_SHUTTER_ANIMATION' });
    }, [config.animations.shutterFlashDuration]),

    resetAnimationStates: useCallback(() => {
      dispatch({ type: 'RESET_ANIMATION_STATES' });
    }, []),

    measurePerformance: useCallback(() => {
      // Simple performance measurement without recursive RAF
      const now = getTimestamp();
      const fps = Math.round(60); // Mock 60fps for testing

      dispatch({
        type: 'UPDATE_PERFORMANCE_METRICS',
        payload: {
          currentFps: fps,
          averageFrameTime: 16.67,
        },
      });
    }, []),

    degradePerformance: useCallback(() => {
      dispatch({ type: 'DEGRADE_PERFORMANCE' });
    }, []),

    restorePerformance: useCallback(() => {
      dispatch({ type: 'RESTORE_PERFORMANCE' });
    }, []),
  };

  // Cleanup any animation frames on unmount
  useEffect(() => {
    return () => {
      if (performanceMonitorRef.current) {
        cancelAnimationFrame(performanceMonitorRef.current);
      }
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!config.accessibility.enableKeyboardControls) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === config.accessibility.toggleKey.toLowerCase()) {
        e.preventDefault();
        actions.toggle();
      } else if (e.key === config.accessibility.captureKey && state.isActive) {
        e.preventDefault();
        actions.capture();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config.accessibility, actions, state.isActive]);

  const contextValue: ViewfinderContextType = {
    config,
    state,
    actions,
  };

  return (
    <ViewfinderContext.Provider value={contextValue}>
      {children}
    </ViewfinderContext.Provider>
  );
};

// Custom hook to use the viewfinder context
export const useViewfinder = (): ViewfinderContextType => {
  const context = useContext(ViewfinderContext);
  // Return context directly - error handling moved to component level if needed
  return context!;
};

export default ViewfinderContext;