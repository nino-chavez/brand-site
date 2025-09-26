import { useState, useEffect } from 'react';
import { VOLLEYBALL_PHASES, ARCHITECTURE_STATES, type VolleyballPhase } from '../constants/heroData';

interface HeroPhaseCycleState {
  currentPhaseIndex: number;
  currentPhase: typeof VOLLEYBALL_PHASES[number];
  currentArchitecture: typeof ARCHITECTURE_STATES[VolleyballPhase];
  isPaused: boolean;
}

interface HeroPhaseCycleActions {
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  goToPhase: (index: number) => void;
}

interface UseHeroPhaseCycleProps {
  /** Whether to start the cycle paused */
  initiallyPaused?: boolean;
  /** Starting phase index */
  initialPhaseIndex?: number;
  /** Whether mouse hover should pause the cycle */
  pauseOnHover?: boolean;
}

/**
 * Custom hook for managing hero section phase cycling logic
 * Extracted from HeroSection component to improve separation of concerns
 */
export const useHeroPhaseCycle = ({
  initiallyPaused = false,
  initialPhaseIndex = 0,
  pauseOnHover = true
}: UseHeroPhaseCycleProps = {}): HeroPhaseCycleState & HeroPhaseCycleActions & {
  setIsHovered: (hovered: boolean) => void;
} => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialPhaseIndex);
  const [isPaused, setIsPaused] = useState(initiallyPaused);
  const [isHovered, setIsHovered] = useState(false);

  const currentPhase = VOLLEYBALL_PHASES[currentPhaseIndex];
  const currentArchitecture = ARCHITECTURE_STATES[currentPhase.id];

  // Auto-progress through phases when not paused or hovered
  useEffect(() => {
    const shouldPause = isPaused || (pauseOnHover && isHovered);
    if (shouldPause) return;

    const timer = setTimeout(() => {
      setCurrentPhaseIndex((prev) => (prev + 1) % VOLLEYBALL_PHASES.length);
    }, currentPhase.duration);

    return () => clearTimeout(timer);
  }, [currentPhaseIndex, currentPhase.duration, isPaused, isHovered, pauseOnHover]);

  // Actions
  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);
  const toggle = () => setIsPaused(prev => !prev);
  const goToPhase = (index: number) => {
    if (index >= 0 && index < VOLLEYBALL_PHASES.length) {
      setCurrentPhaseIndex(index);
    }
  };

  return {
    // State
    currentPhaseIndex,
    currentPhase,
    currentArchitecture,
    isPaused,

    // Actions
    pause,
    resume,
    toggle,
    goToPhase,
    setIsHovered
  };
};