import { useReducer, useCallback, useEffect, useRef } from 'react';

export type VolleyballPhase = 'setup' | 'anticipation' | 'approach' | 'spike' | 'impact' | 'follow-through';

export interface PhaseConfig {
  phase: VolleyballPhase;
  duration: number; // milliseconds
}

export interface PhaseState {
  currentPhase: VolleyballPhase;
  phaseStartTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  completedCycles: number;
  phaseProgress: number; // 0-1 progress through current phase
}

export interface PhaseCallbacks {
  onPhaseChange?: (newPhase: VolleyballPhase, previousPhase: VolleyballPhase) => void;
  onCycleComplete?: (cycleCount: number) => void;
  onPause?: (phase: VolleyballPhase) => void;
  onResume?: (phase: VolleyballPhase) => void;
}

type PhaseAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'NEXT_PHASE' }
  | { type: 'PREVIOUS_PHASE' }
  | { type: 'JUMP_TO_PHASE'; payload: VolleyballPhase }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'CYCLE_COMPLETE' }
  | { type: 'RESET' };

const DEFAULT_PHASE_CONFIG: PhaseConfig[] = [
  { phase: 'setup', duration: 1500 },           // 1.5s - calm preparation
  { phase: 'anticipation', duration: 1200 },    // 1.2s - building tension
  { phase: 'approach', duration: 1000 },        // 1.0s - explosive movement
  { phase: 'spike', duration: 800 },            // 0.8s - critical execution
  { phase: 'impact', duration: 600 },           // 0.6s - moment of contact
  { phase: 'follow-through', duration: 1900 }   // 1.9s - completion and aftermath
]; // Total: 8000ms (8 seconds)

const PHASES_ORDER: VolleyballPhase[] = [
  'setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'
];

function phaseReducer(state: PhaseState, action: PhaseAction): PhaseState {
  switch (action.type) {
    case 'PLAY':
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        phaseStartTime: performance.now()
      };

    case 'PAUSE':
      return {
        ...state,
        isPlaying: false,
        isPaused: true
      };

    case 'NEXT_PHASE': {
      const currentIndex = PHASES_ORDER.indexOf(state.currentPhase);
      const nextIndex = (currentIndex + 1) % PHASES_ORDER.length;
      const nextPhase = PHASES_ORDER[nextIndex];

      return {
        ...state,
        currentPhase: nextPhase,
        phaseStartTime: performance.now(),
        phaseProgress: 0,
        completedCycles: nextPhase === 'setup' ? state.completedCycles + 1 : state.completedCycles
      };
    }

    case 'PREVIOUS_PHASE': {
      const currentIndex = PHASES_ORDER.indexOf(state.currentPhase);
      const prevIndex = currentIndex === 0 ? PHASES_ORDER.length - 1 : currentIndex - 1;
      const prevPhase = PHASES_ORDER[prevIndex];

      return {
        ...state,
        currentPhase: prevPhase,
        phaseStartTime: performance.now(),
        phaseProgress: 0
      };
    }

    case 'JUMP_TO_PHASE':
      return {
        ...state,
        currentPhase: action.payload,
        phaseStartTime: performance.now(),
        phaseProgress: 0
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        phaseProgress: Math.max(0, Math.min(1, action.payload))
      };

    case 'CYCLE_COMPLETE':
      return {
        ...state,
        completedCycles: state.completedCycles + 1
      };

    case 'RESET':
      return {
        currentPhase: 'setup',
        phaseStartTime: performance.now(),
        isPlaying: false,
        isPaused: false,
        completedCycles: 0,
        phaseProgress: 0
      };

    default:
      return state;
  }
}

export interface UseVolleyballTimingOptions {
  phaseConfig?: PhaseConfig[];
  autoPlay?: boolean;
  callbacks?: PhaseCallbacks;
}

export interface UseVolleyballTimingReturn {
  state: PhaseState;
  play: () => void;
  pause: () => void;
  nextPhase: () => void;
  previousPhase: () => void;
  jumpToPhase: (phase: VolleyballPhase) => void;
  reset: () => void;
  getCurrentPhaseDuration: () => number;
  getPhaseConfig: () => PhaseConfig[];
}

export function useVolleyballTiming(options: UseVolleyballTimingOptions = {}): UseVolleyballTimingReturn {
  const {
    phaseConfig = DEFAULT_PHASE_CONFIG,
    autoPlay = false,
    callbacks = {}
  } = options;

  const initialState: PhaseState = {
    currentPhase: 'setup',
    phaseStartTime: performance.now(),
    isPlaying: autoPlay,
    isPaused: false,
    completedCycles: 0,
    phaseProgress: 0
  };

  const [state, dispatch] = useReducer(phaseReducer, initialState);
  const previousPhaseRef = useRef<VolleyballPhase>(state.currentPhase);
  const animationFrameRef = useRef<number>();
  const phaseConfigRef = useRef<PhaseConfig[]>(phaseConfig);

  // Update phase config if it changes
  useEffect(() => {
    phaseConfigRef.current = phaseConfig;
  }, [phaseConfig]);

  // Get current phase configuration
  const getCurrentPhaseConfig = useCallback((): PhaseConfig => {
    return phaseConfigRef.current.find(config => config.phase === state.currentPhase) ||
           phaseConfigRef.current[0];
  }, [state.currentPhase]);

  // Get current phase duration
  const getCurrentPhaseDuration = useCallback((): number => {
    return getCurrentPhaseConfig().duration;
  }, [getCurrentPhaseConfig]);

  // Get phase configuration array
  const getPhaseConfig = useCallback((): PhaseConfig[] => {
    return [...phaseConfigRef.current];
  }, []);

  // Control functions
  const play = useCallback(() => {
    dispatch({ type: 'PLAY' });
    callbacks.onResume?.(state.currentPhase);
  }, [callbacks, state.currentPhase]);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
    callbacks.onPause?.(state.currentPhase);
  }, [callbacks, state.currentPhase]);

  const nextPhase = useCallback(() => {
    const previousPhase = state.currentPhase;
    dispatch({ type: 'NEXT_PHASE' });

    // Note: This will trigger the phase change callback in the effect below
    // since state.currentPhase will change on the next render
  }, [state.currentPhase]);

  const previousPhase = useCallback(() => {
    const previousPhase = state.currentPhase;
    dispatch({ type: 'PREVIOUS_PHASE' });

    // Note: This will trigger the phase change callback in the effect below
    // since state.currentPhase will change on the next render
  }, [state.currentPhase]);

  const jumpToPhase = useCallback((phase: VolleyballPhase) => {
    const previousPhase = state.currentPhase;
    dispatch({ type: 'JUMP_TO_PHASE', payload: phase });

    // Note: This will trigger the phase change callback in the effect below
    // since state.currentPhase will change on the next render
  }, [state.currentPhase]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Handle phase change callbacks
  useEffect(() => {
    if (previousPhaseRef.current !== state.currentPhase) {
      callbacks.onPhaseChange?.(state.currentPhase, previousPhaseRef.current);
      previousPhaseRef.current = state.currentPhase;
    }
  }, [state.currentPhase, callbacks]);

  // Handle cycle completion callbacks
  useEffect(() => {
    if (state.completedCycles > 0) {
      callbacks.onCycleComplete?.(state.completedCycles);
    }
  }, [state.completedCycles, callbacks]);

  // Main animation loop with precise timing
  useEffect(() => {
    if (!state.isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      return;
    }

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - state.phaseStartTime;
      const phaseDuration = getCurrentPhaseDuration();
      const progress = elapsedTime / phaseDuration;

      // Update progress
      dispatch({ type: 'UPDATE_PROGRESS', payload: progress });

      // Check if phase should advance
      if (progress >= 1.0) {
        const currentIndex = PHASES_ORDER.indexOf(state.currentPhase);
        const isLastPhase = currentIndex === PHASES_ORDER.length - 1;

        if (isLastPhase) {
          dispatch({ type: 'CYCLE_COMPLETE' });
        }

        dispatch({ type: 'NEXT_PHASE' });
      }

      // Continue animation loop if still playing
      if (state.isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [state.isPlaying, state.phaseStartTime, state.currentPhase, getCurrentPhaseDuration]);

  return {
    state,
    play,
    pause,
    nextPhase,
    previousPhase,
    jumpToPhase,
    reset,
    getCurrentPhaseDuration,
    getPhaseConfig
  };
}