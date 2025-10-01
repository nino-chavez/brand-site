/**
 * CanvasStateProviderV2 - Clean Canvas State Management
 *
 * Simplified state provider: 636 → ~200 LOC (69% reduction)
 * Eliminates circular dependencies, queue systems, and over-engineering.
 *
 * @fileoverview Minimal canvas state with memoized actions
 * @version 2.0.0
 * @since Phase 5 - Canvas Rebuild
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback
} from 'react';
import type { GameFlowSection } from '../types';

// ===== TYPES =====

export interface CanvasPosition {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasState {
  position: CanvasPosition;
  activeSection: GameFlowSection;
  isTransitioning: boolean;
}

export interface CanvasActions {
  updatePosition: (position: CanvasPosition) => void;
  setActiveSection: (section: GameFlowSection) => void;
  setTransitioning: (transitioning: boolean) => void;
  resetPosition: () => void;
}

export interface CanvasContextValue {
  state: CanvasState;
  actions: CanvasActions;
}

// ===== ACTION TYPES =====

type CanvasAction =
  | { type: 'UPDATE_POSITION'; payload: CanvasPosition }
  | { type: 'SET_ACTIVE_SECTION'; payload: GameFlowSection }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'RESET_POSITION'; payload: CanvasPosition };

// ===== REDUCER =====

const canvasReducer = (state: CanvasState, action: CanvasAction): CanvasState => {
  switch (action.type) {
    case 'UPDATE_POSITION':
      return {
        ...state,
        position: action.payload
      };

    case 'SET_ACTIVE_SECTION':
      return {
        ...state,
        activeSection: action.payload
      };

    case 'SET_TRANSITIONING':
      return {
        ...state,
        isTransitioning: action.payload
      };

    case 'RESET_POSITION':
      return {
        ...state,
        position: action.payload
      };

    default:
      return state;
  }
};

// ===== CONTEXT =====

const CanvasContext = createContext<CanvasContextValue | null>(null);

// ===== PROVIDER =====

export interface CanvasStateProviderV2Props {
  children: React.ReactNode;
  initialPosition?: CanvasPosition;
  performanceMode?: 'high' | 'balanced' | 'low';
  enableAnalytics?: boolean;
}

export const CanvasStateProviderV2: React.FC<CanvasStateProviderV2Props> = ({
  children,
  initialPosition = { x: 0, y: 0, scale: 1.0 }
}) => {
  // Initial state
  const initialState: CanvasState = useMemo(() => ({
    position: initialPosition,
    activeSection: 'capture' as GameFlowSection,
    isTransitioning: false
  }), [initialPosition]);

  // State management
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  // Memoized actions (stable references to prevent re-renders)
  const updatePosition = useCallback((position: CanvasPosition) => {
    dispatch({ type: 'UPDATE_POSITION', payload: position });
  }, []);

  const setActiveSection = useCallback((section: GameFlowSection) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  }, []);

  const setTransitioning = useCallback((transitioning: boolean) => {
    dispatch({ type: 'SET_TRANSITIONING', payload: transitioning });
  }, []);

  const resetPosition = useCallback(() => {
    dispatch({ type: 'RESET_POSITION', payload: initialPosition });
  }, [initialPosition]);

  // Actions object (memoized)
  const actions: CanvasActions = useMemo(() => ({
    updatePosition,
    setActiveSection,
    setTransitioning,
    resetPosition
  }), [updatePosition, setActiveSection, setTransitioning, resetPosition]);

  // Context value (memoized to prevent unnecessary re-renders)
  const value: CanvasContextValue = useMemo(() => ({
    state,
    actions
  }), [state, actions]);

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};

// ===== HOOKS =====

/**
 * Hook to access canvas state and actions
 * Throws error if used outside provider
 */
export const useCanvasStateV2 = (): CanvasContextValue => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasStateV2 must be used within CanvasStateProviderV2');
  }
  return context;
};

/**
 * Optional hook that returns null if provider not available
 * Use in components that work in both canvas and traditional modes
 */
export const useCanvasStateV2Optional = (): CanvasContextValue | null => {
  return useContext(CanvasContext);
};

export default CanvasStateProviderV2;
