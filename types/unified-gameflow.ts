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

// Unified State Structure
export interface UnifiedGameFlowState {
  // Core Game Flow
  currentSection: GameFlowSection;
  previousSection: GameFlowSection | null;
  scrollProgress: number;
  transitionState: 'idle' | 'transitioning';

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
    // These were missing and causing the errors!
    trackSectionTransition: (from: GameFlowSection, to: GameFlowSection, timestamp: number) => void;
    trackCustomMetric: (name: string, value: number) => void;
    // Existing methods
    measurePerformance: () => void;
    optimizePerformance: () => void;
    degradePerformance: () => void;
    restorePerformance: () => void;
    reportMetrics: () => void;
  };

  // Camera Actions (consolidated)
  camera: {
    triggerInteraction: (type: CameraInteractionType, data?: any) => void;
    adjustFocus: (target: FocusTarget) => void;
    adjustExposure: (settings: Partial<ExposureSettings>) => void;
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