/**
 * Canvas State Management Types
 *
 * Dedicated state management types for canvas-specific functionality.
 * Extracted from UnifiedGameFlowContext to reduce coupling and improve performance.
 *
 * @fileoverview Canvas state provider types for spatial navigation
 * @version 1.0.0
 * @since Task 4 - State Management Integration Optimization
 */

import React from 'react';
import type { GameFlowSection } from './index';

// ===== CANVAS STATE TYPES =====

/**
 * Canvas position and scale
 */
export interface CanvasPosition {
  /** Horizontal position in canvas units (0 = viewport center) */
  x: number;
  /** Vertical position in canvas units (0 = viewport center) */
  y: number;
  /** Scale factor for zoom level (1.0 = 100%, 2.0 = 200% zoom) */
  scale: number;
}

/**
 * Camera movement state
 */
export interface CanvasCameraState {
  /** Currently executing movement */
  activeMovement: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' | 'match-cut' | null;
  /** Movement start timestamp */
  movementStartTime: number | null;
  /** Movement progress (0-1) */
  progress: number;
}

/**
 * Canvas interaction state for touch/gesture handling
 */
export interface CanvasInteractionState {
  /** Whether canvas is being panned via touch/drag */
  isPanning: boolean;
  /** Whether canvas is being zoomed */
  isZooming: boolean;
  /** Touch/gesture state for mobile */
  touchState: {
    initialDistance: number | null;
    initialPosition: CanvasPosition | null;
  };
}

/**
 * Canvas accessibility state
 */
export interface CanvasAccessibilityState {
  /** Whether keyboard spatial navigation is active */
  keyboardSpatialNav: boolean;
  /** Current spatial focus for screen readers */
  spatialFocus: GameFlowSection | null;
  /** Whether reduced motion is preferred */
  reducedMotion: boolean;
}

/**
 * Canvas performance metrics
 */
export interface CanvasPerformanceMetrics {
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
  /** Performance optimization state */
  isOptimized: boolean;
}

/**
 * Canvas transition record for performance tracking
 */
export interface CanvasTransition {
  from: CanvasPosition;
  to: CanvasPosition;
  movement: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' | 'match-cut';
  timestamp: number;
  duration: number;
  success: boolean;
}

/**
 * Main canvas state interface
 */
export interface CanvasState {
  /** Current canvas viewport position and scale */
  currentPosition: CanvasPosition;
  /** Target position for ongoing transitions */
  targetPosition: CanvasPosition | null;
  /** Currently active/focused section in spatial layout */
  activeSection: GameFlowSection;
  /** Previous section for transition tracking */
  previousSection: GameFlowSection | null;
  /** Current spatial layout configuration */
  layout: '2x3' | '3x2' | '1x6' | 'circular';
  /** Camera movement state */
  camera: CanvasCameraState;
  /** Canvas interaction state */
  interaction: CanvasInteractionState;
  /** Accessibility state for spatial navigation */
  accessibility: CanvasAccessibilityState;
  /** Performance metrics and tracking */
  performance: CanvasPerformanceMetrics;
  /** Canvas transition history */
  transitionHistory: CanvasTransition[];
}

// ===== CANVAS ACTIONS TYPES =====

/**
 * Canvas state actions interface
 */
export interface CanvasActions {
  /** Navigate to specific canvas position */
  updatePosition: (position: CanvasPosition) => void;
  /** Navigate to section with spatial awareness */
  setActiveSection: (section: GameFlowSection) => void;
  /** Set target position for transitions */
  setTargetPosition: (position: CanvasPosition | null) => void;
  /** Execute specific camera movement */
  executeCameraMovement: (
    movement: 'pan-tilt' | 'zoom-in' | 'zoom-out' | 'dolly-zoom' | 'rack-focus' | 'match-cut',
    startTime: number,
    progress: number
  ) => void;
  /** Handle touch/gesture interactions */
  setPanningState: (isPanning: boolean) => void;
  setZoomingState: (isZooming: boolean) => void;
  updateTouchState: (touchState: {
    initialDistance: number | null;
    initialPosition: CanvasPosition | null;
  }) => void;
  /** Spatial accessibility actions */
  setKeyboardSpatialNav: (active: boolean) => void;
  setSpatialFocus: (section: GameFlowSection | null) => void;
  setReducedMotion: (enabled: boolean) => void;
  /** Layout management */
  setLayout: (layout: '2x3' | '3x2' | '1x6' | 'circular') => void;
  /** Performance tracking */
  trackTransition: (transition: Omit<CanvasTransition, 'timestamp'>) => void;
  updatePerformanceMetrics: (metrics: Partial<CanvasPerformanceMetrics>) => void;
  optimizePerformance: () => void;
  /** State debugging and validation */
  validateState: () => { valid: boolean; issues: string[] };
  getStateSnapshot: () => CanvasState;
  resetToDefaults: () => void;
}

// ===== CANVAS CONTEXT TYPES =====

/**
 * Canvas context value
 */
export interface CanvasContextValue {
  state: CanvasState;
  actions: CanvasActions;
  isInitialized: boolean;
  debugMode: boolean;
}

/**
 * Canvas provider configuration
 */
export interface CanvasProviderConfig {
  /** Initial canvas position */
  initialPosition?: CanvasPosition;
  /** Initial active section */
  initialSection?: GameFlowSection;
  /** Initial layout configuration */
  initialLayout?: '2x3' | '3x2' | '1x6' | 'circular';
  /** Performance monitoring configuration */
  performanceConfig?: {
    /** Enable performance tracking */
    enableTracking: boolean;
    /** Performance sample size for averages */
    sampleSize: number;
    /** Performance degradation thresholds */
    thresholds: {
      fps: number;
      memory: number;
      operations: number;
    };
  };
  /** Accessibility configuration */
  accessibilityConfig?: {
    /** Enable keyboard spatial navigation by default */
    enableKeyboardNav: boolean;
    /** Respect reduced motion preferences */
    respectReducedMotion: boolean;
    /** Enable screen reader announcements */
    enableScreenReader: boolean;
  };
  /** Debugging configuration */
  debugConfig?: {
    /** Enable debug mode */
    enabled: boolean;
    /** Log state changes */
    logStateChanges: boolean;
    /** Log performance metrics */
    logPerformance: boolean;
    /** Validate state on each change */
    validateOnChange: boolean;
  };
}

/**
 * Canvas provider props
 */
export interface CanvasProviderProps {
  children: React.ReactNode;
  config?: CanvasProviderConfig;
}

// ===== STATE COMPOSITION TYPES =====

/**
 * Canvas state integration interface for communication with global state
 */
export interface CanvasStateIntegration {
  /** Sync canvas active section with global current section */
  syncWithGlobalSection: (section: GameFlowSection) => void;
  /** Report canvas state changes to global performance monitoring */
  reportStateChange: (change: { type: string; payload: any; timestamp: number }) => void;
  /** Handle state conflicts between canvas and global state */
  resolveStateConflict: (conflict: { local: any; global: any; field: string }) => any;
  /** Validate state consistency with global state */
  validateConsistency: () => { consistent: boolean; conflicts: string[] };
}

/**
 * Canvas state update queue for batching high-frequency updates
 */
export interface CanvasStateUpdateQueue {
  /** Queue a state update for batching */
  queueUpdate: (update: { type: string; payload: any; priority: 'high' | 'normal' | 'low' }) => void;
  /** Process queued updates in batch */
  processQueue: () => void;
  /** Clear pending updates */
  clearQueue: () => void;
  /** Get queue statistics */
  getQueueStats: () => { pending: number; processed: number; dropped: number };
}

// ===== STATE MONITORING TYPES =====

/**
 * Canvas state monitor for debugging and validation
 */
export interface CanvasStateMonitor {
  /** Subscribe to state changes */
  subscribe: (callback: (state: CanvasState, action: string) => void) => () => void;
  /** Get state history for time-travel debugging */
  getHistory: () => Array<{ state: CanvasState; action: string; timestamp: number }>;
  /** Capture state snapshot */
  captureSnapshot: (label?: string) => string;
  /** Restore state from snapshot */
  restoreSnapshot: (snapshotId: string) => boolean;
  /** Validate current state */
  validateCurrentState: () => { valid: boolean; errors: string[]; warnings: string[] };
}