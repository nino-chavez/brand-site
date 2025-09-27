// Unified GameFlow State Management
// Consolidates GameFlow + Viewfinder contexts into single source of truth

import type {
  GameFlowSection,
  CameraInteractionType,
  FocusTarget,
  ExposureSettings,
  GameFlowError,
  PerformanceMetrics
} from './index';
import type { MousePosition, ViewfinderMetadata } from './viewfinder';
import type { CursorPerformanceMetrics, ActivationMethod } from './cursor-lens';

// Unified State Structure
export interface UnifiedGameFlowState {
  // Core Game Flow
  currentSection: GameFlowSection;
  previousSection: GameFlowSection | null;
  scrollProgress: number;
  transitionState: 'idle' | 'transitioning';

  // Canvas State (2D spatial navigation)
  canvas: {
    /** Current canvas viewport position and scale */
    currentPosition: {
      x: number;
      y: number;
      scale: number;
    };
    /** Target position for ongoing transitions */
    targetPosition: {
      x: number;
      y: number;
      scale: number;
    } | null;
    /** Currently active/focused section in spatial layout */
    activeSection: GameFlowSection;
    /** Previous section for transition tracking */
    previousSection: GameFlowSection | null;
    /** Current spatial layout configuration */
    layout: '2x3' | '3x2' | '1x6' | 'circular';
    /** Camera movement state */
    camera: {
      /** Currently executing movement */
      activeMovement: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' | 'match-cut' | null;
      /** Movement start timestamp */
      movementStartTime: number | null;
      /** Movement progress (0-1) */
      progress: number;
    };
    /** Canvas interaction state */
    interaction: {
      /** Whether canvas is being panned via touch/drag */
      isPanning: boolean;
      /** Whether canvas is being zoomed */
      isZooming: boolean;
      /** Touch/gesture state for mobile */
      touchState: {
        initialDistance: number | null;
        initialPosition: { x: number; y: number; scale: number } | null;
      };
    };
    /** Accessibility state for spatial navigation */
    accessibility: {
      /** Whether keyboard spatial navigation is active */
      keyboardSpatialNav: boolean;
      /** Current spatial focus for screen readers */
      spatialFocus: GameFlowSection | null;
      /** Whether reduced motion is preferred */
      reducedMotion: boolean;
    };
  };

  // Viewfinder Sub-State (consolidated from separate context)
  viewfinder: {
    isActive: boolean;
    isCapturing: boolean;
    crosshairPosition: MousePosition;
    targetPosition: MousePosition;
    focusArea: {
      center: MousePosition;
      radius: number;
    };
    blurIntensity: number;
    activeContentZone: string | null;
    animationStates: {
      isShutterAnimating: boolean;
      isBlurTransitioning: boolean;
      isFadingOut: boolean;
    };
    metadata: ViewfinderMetadata;
  };

  // Unified Performance Management (fixes the missing methods!)
  performance: {
    metrics: PerformanceMetrics;
    isOptimizing: boolean;
    isDegraded: boolean;
    // Viewfinder performance metrics
    currentFps: number;
    averageFrameTime: number;
    droppedFrames: number;
    // Transition tracking
    sectionTransitions: Array<{
      from: GameFlowSection;
      to: GameFlowSection;
      timestamp: number;
      duration?: number;
    }>;
    customMetrics: Record<string, number>;
    // Cursor-specific performance tracking (for cursor-lens integration)
    cursor: {
      isTracking: boolean;
      metrics: CursorPerformanceMetrics;
      degradationLevel: 'none' | 'low' | 'medium' | 'high';
      optimizationApplied: boolean;
      activationHistory: Array<{
        method: ActivationMethod;
        latency: number;
        success: boolean;
        timestamp: number;
      }>;
      sessionStats: {
        totalActivations: number;
        averageLatency: number;
        frameDropEvents: number;
        memoryLeakDetected: boolean;
        sessionStartTime: number;
      };
    };
    // Canvas-specific performance tracking
    canvas: {
      /** Canvas rendering frame rate */
      canvasRenderFPS: number;
      /** Average camera movement completion time */
      averageMovementTime: number;
      /** Transform operation overhead */
      transformOverhead: number;
      /** Canvas memory usage in MB */
      canvasMemoryMB: number;
      /** GPU utilization percentage */
      gpuUtilization: number;
      /** Number of simultaneous canvas operations */
      activeOperations: number;
      /** Canvas transition history */
      canvasTransitions: Array<{
        from: { x: number; y: number; scale: number };
        to: { x: number; y: number; scale: number };
        movement: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' | 'match-cut';
        timestamp: number;
        duration: number;
        success: boolean;
      }>;
      /** Performance optimization state */
      isOptimized: boolean;
    };
  };

  // Unified Camera System
  camera: {
    focusTarget: FocusTarget;
    exposure: ExposureSettings;
    lastInteraction: CameraInteractionType | null;
    interactionHistory: Array<{
      type: CameraInteractionType;
      timestamp: number;
      data?: any;
    }>;
  };

  // Accessibility & Error Handling
  accessibility: {
    screenReaderActive: boolean;
    reducedMotionPreferred: boolean;
    keyboardNavigationActive: boolean;
    highContrastEnabled: boolean;
  };

  errors: GameFlowError[];
}

// Unified Actions Interface
export interface UnifiedGameFlowActions {
  // Core Navigation
  navigateToSection: (section: GameFlowSection) => Promise<void>;
  updateScrollProgress: (progress: number) => void;
  updateSectionProgress: (section: GameFlowSection, progress: number) => void;

  // Viewfinder Actions (moved from separate context)
  viewfinder: {
    activate: () => void;
    deactivate: () => void;
    toggle: () => void;
    capture: () => Promise<string | null>;
    updateCrosshairPosition: (position: MousePosition) => void;
    resetPosition: () => void;
    updateFocusArea: (center: MousePosition, radius?: number) => void;
    setBlurIntensity: (intensity: number) => void;
    detectContentZone: (position: MousePosition) => string | null;
    updateMetadata: (zone: string) => void;
    triggerShutterAnimation: () => Promise<void>;
    resetAnimationStates: () => void;
  };

  // Performance Actions (consolidated + ADDS MISSING METHODS!)
  performance: {
    // General performance tracking
    trackSectionTransition: (from: GameFlowSection, to: GameFlowSection, timestamp: number) => void;
    trackCustomMetric: (name: string, value: number) => void;
    measurePerformance: () => void;
    optimizePerformance: () => void;
    degradePerformance: () => void;
    restorePerformance: () => void;
    reportMetrics: () => void;
    // Cursor-specific performance actions (missing methods causing test failures)
    startTracking: () => void;
    stopTracking: () => void;
    updateMetrics: (metrics: Partial<CursorPerformanceMetrics>) => void;
    trackActivation: (method: ActivationMethod, latency: number, success: boolean) => void;
    resetCursorStats: () => void;
    // Canvas-specific performance actions
    trackCanvasTransition: (from: { x: number; y: number; scale: number }, to: { x: number; y: number; scale: number }, movement: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' | 'match-cut', duration: number, success: boolean) => void;
    updateCanvasMetrics: (metrics: Partial<{ canvasRenderFPS: number; averageMovementTime: number; transformOverhead: number; canvasMemoryMB: number; gpuUtilization: number; activeOperations: number }>) => void;
    optimizeCanvasPerformance: () => void;
  };

  // Camera Actions (consolidated)
  camera: {
    triggerInteraction: (type: CameraInteractionType, data?: any) => void;
    adjustFocus: (target: FocusTarget) => void;
    adjustExposure: (settings: Partial<ExposureSettings>) => void;
  };

  // Canvas Actions (2D spatial navigation)
  canvas: {
    /** Navigate to specific canvas position */
    updateCanvasPosition: (position: { x: number; y: number; scale: number }) => void;
    /** Navigate to section with spatial awareness */
    setActiveSection: (section: GameFlowSection) => void;
    /** Set target position for transitions */
    setTargetPosition: (position: { x: number; y: number; scale: number } | null) => void;
    /** Execute specific camera movement */
    executeCameraMovement: (movement: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' | 'match-cut', startTime: number, progress: number) => void;
    /** Handle touch/gesture interactions */
    setPanningState: (isPanning: boolean) => void;
    setZoomingState: (isZooming: boolean) => void;
    updateTouchState: (touchState: { initialDistance: number | null; initialPosition: { x: number; y: number; scale: number } | null }) => void;
    /** Spatial accessibility actions */
    setKeyboardSpatialNav: (active: boolean) => void;
    setSpatialFocus: (section: GameFlowSection | null) => void;
    setReducedMotion: (enabled: boolean) => void;
    /** Layout management */
    setLayout: (layout: '2x3' | '3x2' | '1x6' | 'circular') => void;
  };

  // Accessibility Actions
  accessibility: {
    setScreenReaderCallback: (callback: (section: string, description: string) => void) => void;
    handleKeyboardNavigation: (key: string) => void;
    announceSectionChange: (section: GameFlowSection) => void;
  };

  // Error Handling
  handleError: (error: GameFlowError) => void;
  recoverFromError: (section?: GameFlowSection) => void;
  clearErrors: () => void;
}

// Unified Context Value
export interface UnifiedGameFlowContextValue {
  state: UnifiedGameFlowState;
  actions: UnifiedGameFlowActions;
}

// Provider Props
export interface UnifiedGameFlowProviderProps {
  children: React.ReactNode;
  initialSection?: GameFlowSection;
  performanceMode?: 'high' | 'balanced' | 'low' | 'accessible';
  debugMode?: boolean;
}