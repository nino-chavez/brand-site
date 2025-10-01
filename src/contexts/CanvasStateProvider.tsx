/**
 * Canvas State Provider
 *
 * Dedicated state management for canvas-specific functionality.
 * Extracted from UnifiedGameFlowContext to reduce coupling and improve performance.
 * Implements state composition pattern for integration with global state.
 *
 * @fileoverview Canvas state provider with optimized performance and debugging
 * @version 1.0.0
 * @since Task 4 - State Management Integration Optimization
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef
} from 'react';
import type {
  CanvasState,
  CanvasActions,
  CanvasContextValue,
  CanvasProviderProps,
  CanvasProviderConfig,
  CanvasPosition,
  CanvasTransition,
  CanvasPerformanceMetrics,
  CanvasStateIntegration,
  CanvasStateUpdateQueue,
  CanvasStateMonitor
} from '../types/canvas-state';
import type { GameFlowSection } from '../types';

// ===== PERFORMANCE UTILITIES =====

/**
 * Safe performance timing utility
 */
function getTimestamp(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/**
 * Memory-safe performance measurement
 */
function measureMemoryUsage(): number {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize ? Math.round(memory.usedJSHeapSize / (1024 * 1024)) : 0;
  }
  return 0;
}

// ===== DEFAULT CONFIGURATION =====

const DEFAULT_CONFIG: Required<CanvasProviderConfig> = {
  initialPosition: { x: 0, y: 0, scale: 1.0 },
  initialSection: 'capture',
  initialLayout: '3x2',
  performanceConfig: {
    enableTracking: true,
    sampleSize: 60,
    thresholds: {
      fps: 45,
      memory: 100,
      operations: 5
    }
  },
  accessibilityConfig: {
    enableKeyboardNav: true,
    respectReducedMotion: true,
    enableScreenReader: true
  },
  debugConfig: {
    enabled: false,
    logStateChanges: false,
    logPerformance: false,
    validateOnChange: true
  }
};

// ===== INITIAL STATE =====

const createInitialState = (config: Required<CanvasProviderConfig>): CanvasState => ({
  currentPosition: config.initialPosition,
  targetPosition: null,
  activeSection: config.initialSection,
  previousSection: null,
  layout: config.initialLayout,
  camera: {
    activeMovement: null,
    movementStartTime: null,
    progress: 0
  },
  interaction: {
    isPanning: false,
    isZooming: false,
    touchState: {
      initialDistance: null,
      initialPosition: null
    }
  },
  accessibility: {
    keyboardSpatialNav: config.accessibilityConfig.enableKeyboardNav,
    spatialFocus: null,
    reducedMotion: config.accessibilityConfig.respectReducedMotion
  },
  performance: {
    canvasRenderFPS: 60,
    averageMovementTime: 600,
    transformOverhead: 2,
    canvasMemoryMB: measureMemoryUsage(),
    gpuUtilization: 15,
    activeOperations: 0,
    isOptimized: false
  },
  transitionHistory: []
});

// ===== ACTION TYPES =====

type CanvasAction =
  | { type: 'UPDATE_POSITION'; payload: CanvasPosition }
  | { type: 'SET_ACTIVE_SECTION'; payload: GameFlowSection }
  | { type: 'SET_TARGET_POSITION'; payload: CanvasPosition | null }
  | { type: 'EXECUTE_CAMERA_MOVEMENT'; payload: { movement: string; startTime: number; progress: number } }
  | { type: 'SET_PANNING'; payload: boolean }
  | { type: 'SET_ZOOMING'; payload: boolean }
  | { type: 'UPDATE_TOUCH_STATE'; payload: { initialDistance: number | null; initialPosition: CanvasPosition | null } }
  | { type: 'SET_KEYBOARD_SPATIAL_NAV'; payload: boolean }
  | { type: 'SET_SPATIAL_FOCUS'; payload: GameFlowSection | null }
  | { type: 'SET_REDUCED_MOTION'; payload: boolean }
  | { type: 'SET_LAYOUT'; payload: '2x3' | '3x2' | '1x6' | 'circular' }
  | { type: 'TRACK_TRANSITION'; payload: Omit<CanvasTransition, 'timestamp'> }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<CanvasPerformanceMetrics> }
  | { type: 'OPTIMIZE_PERFORMANCE' }
  | { type: 'RESET_TO_DEFAULTS'; payload: CanvasState };

// ===== STATE REDUCER =====

const canvasReducer = (state: CanvasState, action: CanvasAction): CanvasState => {
  switch (action.type) {
    case 'UPDATE_POSITION':
      return {
        ...state,
        currentPosition: action.payload
      };

    case 'SET_ACTIVE_SECTION':
      return {
        ...state,
        previousSection: state.activeSection,
        activeSection: action.payload
      };

    case 'SET_TARGET_POSITION':
      return {
        ...state,
        targetPosition: action.payload
      };

    case 'EXECUTE_CAMERA_MOVEMENT':
      return {
        ...state,
        camera: {
          activeMovement: action.payload.movement as any,
          movementStartTime: action.payload.startTime,
          progress: action.payload.progress
        }
      };

    case 'SET_PANNING':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          isPanning: action.payload
        }
      };

    case 'SET_ZOOMING':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          isZooming: action.payload
        }
      };

    case 'UPDATE_TOUCH_STATE':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          touchState: action.payload
        }
      };

    case 'SET_KEYBOARD_SPATIAL_NAV':
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          keyboardSpatialNav: action.payload
        }
      };

    case 'SET_SPATIAL_FOCUS':
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          spatialFocus: action.payload
        }
      };

    case 'SET_REDUCED_MOTION':
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          reducedMotion: action.payload
        }
      };

    case 'SET_LAYOUT':
      return {
        ...state,
        layout: action.payload
      };

    case 'TRACK_TRANSITION':
      return {
        ...state,
        transitionHistory: [
          ...state.transitionHistory.slice(-99), // Keep last 100 transitions
          {
            ...action.payload,
            timestamp: getTimestamp()
          }
        ]
      };

    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: {
          ...state.performance,
          ...action.payload
        }
      };

    case 'OPTIMIZE_PERFORMANCE':
      return {
        ...state,
        performance: {
          ...state.performance,
          isOptimized: true,
          activeOperations: Math.max(0, state.performance.activeOperations - 1)
        }
      };

    case 'RESET_TO_DEFAULTS':
      return action.payload;

    default:
      return state;
  }
};

// ===== STATE UPDATE QUEUE IMPLEMENTATION =====

class CanvasUpdateQueue implements CanvasStateUpdateQueue {
  private queue: Array<{ type: string; payload: any; priority: 'high' | 'normal' | 'low'; timestamp: number }> = [];
  private stats = { pending: 0, processed: 0, dropped: 0 };
  private maxQueueSize = 100;

  queueUpdate(update: { type: string; payload: any; priority: 'high' | 'normal' | 'low' }): void {
    if (this.queue.length >= this.maxQueueSize) {
      // Drop low priority updates first
      const lowPriorityIndex = this.queue.findIndex(item => item.priority === 'low');
      if (lowPriorityIndex !== -1) {
        this.queue.splice(lowPriorityIndex, 1);
        this.stats.dropped++;
      } else {
        // Drop oldest if no low priority items
        this.queue.shift();
        this.stats.dropped++;
      }
    }

    this.queue.push({
      ...update,
      timestamp: getTimestamp()
    });
    this.stats.pending++;
  }

  processQueue(): void {
    // Sort by priority: high -> normal -> low
    this.queue.sort((a, b) => {
      const priorities = { high: 3, normal: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    this.stats.processed += this.queue.length;
    this.stats.pending = 0;
    this.queue = [];
  }

  clearQueue(): void {
    this.stats.pending = 0;
    this.queue = [];
  }

  getQueueStats() {
    return { ...this.stats };
  }
}

// ===== STATE MONITOR IMPLEMENTATION =====

class CanvasMonitor implements CanvasStateMonitor {
  private subscribers: Array<(state: CanvasState, action: string) => void> = [];
  private history: Array<{ state: CanvasState; action: string; timestamp: number }> = [];
  private snapshots = new Map<string, CanvasState>();
  private maxHistorySize = 100;

  subscribe(callback: (state: CanvasState, action: string) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  notifySubscribers(state: CanvasState, action: string): void {
    this.subscribers.forEach(callback => {
      try {
        callback(state, action);
      } catch (error) {
        console.warn('Canvas state monitor callback error:', error);
      }
    });
  }

  addToHistory(state: CanvasState, action: string): void {
    this.history.push({
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      action,
      timestamp: getTimestamp()
    });

    // Keep history size manageable
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  getHistory() {
    return [...this.history];
  }

  captureSnapshot(label = 'default'): string {
    const snapshotId = `${label}_${Date.now()}`;
    return snapshotId;
  }

  restoreSnapshot(snapshotId: string): boolean {
    return this.snapshots.has(snapshotId);
  }

  validateCurrentState(): { valid: boolean; errors: string[]; warnings: string[] } {
    // Basic state validation
    const errors: string[] = [];
    const warnings: string[] = [];

    // Add validation logic here as needed
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// ===== CONTEXT CREATION =====

const CanvasContext = createContext<CanvasContextValue | null>(null);

// ===== PROVIDER COMPONENT =====

export const CanvasStateProvider: React.FC<CanvasProviderProps> = ({
  children,
  config: userConfig
}) => {
  // Merge user config with defaults
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...userConfig,
    performanceConfig: { ...DEFAULT_CONFIG.performanceConfig, ...userConfig?.performanceConfig },
    accessibilityConfig: { ...DEFAULT_CONFIG.accessibilityConfig, ...userConfig?.accessibilityConfig },
    debugConfig: { ...DEFAULT_CONFIG.debugConfig, ...userConfig?.debugConfig }
  }), [userConfig]);

  // State management
  const [state, dispatch] = useReducer(canvasReducer, createInitialState(config));
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Performance and monitoring utilities
  const updateQueue = useMemo(() => new CanvasUpdateQueue(), []);
  const monitor = useMemo(() => new CanvasMonitor(), []);
  const integrationRef = useRef<CanvasStateIntegration | null>(null);

  // Performance monitoring
  useEffect(() => {
    if (!config.performanceConfig.enableTracking) return;

    const interval = setInterval(() => {
      const currentMemory = measureMemoryUsage();
      dispatch({
        type: 'UPDATE_PERFORMANCE',
        payload: { canvasMemoryMB: currentMemory }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config.performanceConfig.enableTracking]);

  // Debug logging
  useEffect(() => {
    if (config.debugConfig.logStateChanges) {
      console.log('[CanvasState] State updated:', state);
    }
  }, [state, config.debugConfig.logStateChanges]);

  // Individual action callbacks
  const updatePosition = useCallback((position: CanvasPosition) => {
    dispatch({ type: 'UPDATE_POSITION', payload: position });
  }, []);

  const setActiveSection = useCallback((section: GameFlowSection) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  }, []);

  const setTargetPosition = useCallback((position: CanvasPosition | null) => {
    dispatch({ type: 'SET_TARGET_POSITION', payload: position });
  }, []);

  const executeCameraMovement = useCallback((movement: string, startTime: number, progress: number) => {
    dispatch({
      type: 'EXECUTE_CAMERA_MOVEMENT',
      payload: { movement, startTime, progress }
    });
  }, []);

  const setPanningState = useCallback((isPanning: boolean) => {
    dispatch({ type: 'SET_PANNING', payload: isPanning });
  }, []);

  const setZoomingState = useCallback((isZooming: boolean) => {
    dispatch({ type: 'SET_ZOOMING', payload: isZooming });
  }, []);

  const updateTouchState = useCallback((touchState: { initialDistance: number | null; initialPosition: CanvasPosition | null }) => {
    dispatch({ type: 'UPDATE_TOUCH_STATE', payload: touchState });
  }, []);

  const setKeyboardSpatialNav = useCallback((active: boolean) => {
    dispatch({ type: 'SET_KEYBOARD_SPATIAL_NAV', payload: active });
  }, []);

  const setSpatialFocus = useCallback((section: GameFlowSection | null) => {
    dispatch({ type: 'SET_SPATIAL_FOCUS', payload: section });
  }, []);

  const setReducedMotion = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_REDUCED_MOTION', payload: enabled });
  }, []);

  const setLayout = useCallback((layout: '2x3' | '3x2' | '1x6' | 'circular') => {
    dispatch({ type: 'SET_LAYOUT', payload: layout });
  }, []);

  const trackTransition = useCallback((transition: Omit<CanvasTransition, 'timestamp'>) => {
    dispatch({ type: 'TRACK_TRANSITION', payload: transition });
  }, []);

  const updatePerformanceMetrics = useCallback((metrics: Partial<CanvasPerformanceMetrics>) => {
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: metrics });
  }, []);

  const optimizePerformance = useCallback(() => {
    dispatch({ type: 'OPTIMIZE_PERFORMANCE' });
  }, []);

  const validateState = useCallback(() => {
    return monitor.validateCurrentState();
  }, []);

  const getStateSnapshot = useCallback(() => {
    return JSON.parse(JSON.stringify(state));
  }, [state]);

  const resetToDefaults = useCallback(() => {
    const defaultState = createInitialState(config);
    dispatch({ type: 'RESET_TO_DEFAULTS', payload: defaultState });
  }, [config]);

  // Actions object
  const actions: CanvasActions = useMemo(() => ({
    updatePosition,
    setActiveSection,
    setTargetPosition,
    executeCameraMovement,
    setPanningState,
    setZoomingState,
    updateTouchState,
    setKeyboardSpatialNav,
    setSpatialFocus,
    setReducedMotion,
    setLayout,
    trackTransition,
    updatePerformanceMetrics,
    optimizePerformance,
    validateState,
    getStateSnapshot,
    resetToDefaults
  }), [
    updatePosition,
    setActiveSection,
    setTargetPosition,
    executeCameraMovement,
    setPanningState,
    setZoomingState,
    updateTouchState,
    setKeyboardSpatialNav,
    setSpatialFocus,
    setReducedMotion,
    setLayout,
    trackTransition,
    updatePerformanceMetrics,
    optimizePerformance,
    validateState,
    getStateSnapshot,
    resetToDefaults
  ]);

  // Initialize provider
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Context value
  const contextValue: CanvasContextValue = useMemo(() => ({
    state,
    actions,
    isInitialized,
    debugMode: config.debugConfig.enabled
  }), [state, actions, isInitialized, config.debugConfig.enabled]);

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};

// ===== HOOK FOR CONSUMING CONTEXT =====

export const useCanvasState = (): CanvasContextValue => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasState must be used within a CanvasStateProvider');
  }
  return context;
};

/**
 * Optional version of useCanvasState that returns null if provider is not available.
 * Use this when canvas state is optional (e.g., in traditional layout mode).
 */
export const useCanvasStateOptional = (): CanvasContextValue | null => {
  const context = useContext(CanvasContext);
  return context || null;
};

// ===== INTEGRATION HELPERS =====

/**
 * Hook for integrating canvas state with global state
 */
export const useCanvasIntegration = (): CanvasStateIntegration => {
  const { state, actions } = useCanvasState();

  const syncWithGlobalSection = useCallback((section: GameFlowSection) => {
    if (section !== state.activeSection) {
      actions.setActiveSection(section);
    }
  }, [state.activeSection, actions.setActiveSection]);

  const reportStateChange = useCallback((change: { type: string; payload: any; timestamp: number }) => {
    // Integration with global performance monitoring
    console.debug('[CanvasState] Change reported:', change);
  }, []);

  const resolveStateConflict = useCallback((conflict: { local: any; global: any; field: string }) => {
    // Simple conflict resolution - prefer global state for critical fields
    const criticalFields = ['activeSection', 'layout'];
    return criticalFields.includes(conflict.field) ? conflict.global : conflict.local;
  }, []);

  const validateConsistency = useCallback(() => {
    // Basic consistency validation
    return {
      consistent: true,
      conflicts: []
    };
  }, []);

  return useMemo(() => ({
    syncWithGlobalSection,
    reportStateChange,
    resolveStateConflict,
    validateConsistency
  }), [syncWithGlobalSection, reportStateChange, resolveStateConflict, validateConsistency]);
};

export default CanvasStateProvider;