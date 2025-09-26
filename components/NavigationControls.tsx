import React, { useCallback, useEffect, useState, useRef } from 'react';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

export interface NavigationControlsProps {
  currentPhase: VolleyballPhase;
  phaseProgress: number;
  isPlaying: boolean;
  onPhaseChange: (phase: VolleyballPhase) => void;
  onPlayPause: (playing: boolean) => void;
  onNextPhase: () => void;
  onPreviousPhase: () => void;
  className?: string;
}

interface PhaseIndicatorProps {
  phase: VolleyballPhase;
  isActive: boolean;
  isCompleted: boolean;
  isPending: boolean;
  progress: number;
  onClick: (phase: VolleyballPhase) => void;
  index: number;
}

interface ResumeState {
  isResuming: boolean;
  resumeTimeout: number | null;
  fadeOpacity: number;
}

const PHASES_ORDER: VolleyballPhase[] = [
  'setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'
];

const PHASE_DESCRIPTIONS = {
  'setup': 'Setup phase: Calm preparation and positioning',
  'anticipation': 'Anticipation phase: Building tension and focus',
  'approach': 'Approach phase: Explosive movement toward action',
  'spike': 'Spike phase: Critical moment of execution',
  'impact': 'Impact phase: Moment of decisive contact',
  'follow-through': 'Follow-through phase: Completion and coordination'
};

const PHASE_NAMES = {
  'setup': 'Setup',
  'anticipation': 'Anticipation',
  'approach': 'Approach',
  'spike': 'Spike',
  'impact': 'Impact',
  'follow-through': 'Follow-through'
};

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  phase,
  isActive,
  isCompleted,
  isPending,
  progress,
  onClick,
  index
}) => {
  const handleClick = useCallback(() => {
    onClick(phase);
  }, [phase, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(phase);
    }
  }, [phase, onClick]);

  return (
    <button
      className={`
        phase-indicator
        relative flex flex-col items-center justify-center
        min-w-[44px] min-h-[44px] p-2
        rounded-lg border-2 transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2
        ${isActive
          ? 'border-brand-violet bg-brand-violet/20 text-brand-violet'
          : isCompleted
          ? 'border-green-500 bg-green-500/10 text-green-400'
          : isPending
          ? 'border-gray-600 bg-gray-800/50 text-gray-400'
          : 'border-gray-600 bg-gray-800/50 text-gray-400'
        }
        hover:border-brand-violet hover:bg-brand-violet/10
        active:scale-95 transform
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={PHASE_DESCRIPTIONS[phase]}
      aria-current={isActive ? 'step' : undefined}
      tabIndex={0}
    >
      {/* Phase number */}
      <div className="text-xs font-bold mb-1">
        {index + 1}
      </div>

      {/* Phase name */}
      <div className="text-xs font-medium text-center leading-tight">
        {PHASE_NAMES[phase]}
      </div>

      {/* Progress indicator for active phase */}
      {isActive && (
        <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-violet transition-all duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Completion indicator */}
      {isCompleted && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
};

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentPhase,
  phaseProgress,
  isPlaying,
  onPhaseChange,
  onPlayPause,
  onNextPhase,
  onPreviousPhase,
  className = ''
}) => {
  const [resumeState, setResumeState] = useState<ResumeState>({
    isResuming: false,
    resumeTimeout: null,
    fadeOpacity: 1.0
  });

  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const controlsRef = useRef<HTMLDivElement>(null);

  // Get phase states for indicators
  const getPhaseStates = useCallback(() => {
    const currentIndex = PHASES_ORDER.indexOf(currentPhase);
    return PHASES_ORDER.map((phase, index) => ({
      phase,
      isActive: phase === currentPhase,
      isCompleted: index < currentIndex,
      isPending: index > currentIndex,
      progress: phase === currentPhase ? phaseProgress : 0
    }));
  }, [currentPhase, phaseProgress]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle if focus is on an input or textarea
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'Right':
        e.preventDefault();
        onNextPhase();
        break;

      case 'ArrowLeft':
      case 'Left':
        e.preventDefault();
        onPreviousPhase();
        break;

      case ' ':
      case 'Space':
        e.preventDefault();
        onPlayPause(!isPlaying);
        break;

      case 'Escape':
        e.preventDefault();
        if (!isPlaying) {
          onPlayPause(true); // Resume automatic progression
        }
        break;

      default:
        // Handle number keys for direct phase navigation
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) {
          e.preventDefault();
          const targetPhase = PHASES_ORDER[num - 1];
          onPhaseChange(targetPhase);
        }
        break;
    }
  }, [isPlaying, onNextPhase, onPreviousPhase, onPlayPause, onPhaseChange]);

  // Setup keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle resume functionality with fade-out transition
  const startResumeTransition = useCallback(() => {
    if (resumeState.resumeTimeout) {
      clearTimeout(resumeState.resumeTimeout);
    }

    setResumeState({
      isResuming: true,
      resumeTimeout: null,
      fadeOpacity: 1.0
    });

    // Start fade-out animation
    const fadeOut = () => {
      const startTime = performance.now();
      const duration = 500; // 500ms fade-out

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic easing for natural feel
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        setResumeState(prev => ({
          ...prev,
          fadeOpacity: 1.0 - easeProgress
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Resume automatic progression
          onPlayPause(true);
          setResumeState({
            isResuming: false,
            resumeTimeout: null,
            fadeOpacity: 1.0
          });
        }
      };

      requestAnimationFrame(animate);
    };

    // Start fade-out after 2-second delay
    const timeout = setTimeout(fadeOut, 2000);
    setResumeState(prev => ({
      ...prev,
      resumeTimeout: timeout
    }));
  }, [resumeState.resumeTimeout, onPlayPause]);

  // Handle manual interactions that should reset resume timer
  const handleManualInteraction = useCallback(() => {
    if (resumeState.resumeTimeout) {
      clearTimeout(resumeState.resumeTimeout);
      setResumeState({
        isResuming: false,
        resumeTimeout: null,
        fadeOpacity: 1.0
      });
    }

    // Pause if currently playing
    if (isPlaying) {
      onPlayPause(false);
    }
  }, [resumeState.resumeTimeout, isPlaying, onPlayPause]);

  // Handle phase indicator clicks
  const handlePhaseClick = useCallback((phase: VolleyballPhase) => {
    handleManualInteraction();
    onPhaseChange(phase);
    startResumeTransition();
  }, [handleManualInteraction, onPhaseChange, startResumeTransition]);

  // Handle previous/next buttons
  const handlePrevious = useCallback(() => {
    handleManualInteraction();
    onPreviousPhase();
    startResumeTransition();
  }, [handleManualInteraction, onPreviousPhase, startResumeTransition]);

  const handleNext = useCallback(() => {
    handleManualInteraction();
    onNextPhase();
    startResumeTransition();
  }, [handleManualInteraction, onNextPhase, startResumeTransition]);

  // Handle play/pause button
  const handlePlayPause = useCallback(() => {
    if (resumeState.resumeTimeout) {
      clearTimeout(resumeState.resumeTimeout);
      setResumeState({
        isResuming: false,
        resumeTimeout: null,
        fadeOpacity: 1.0
      });
    }
    onPlayPause(!isPlaying);
  }, [resumeState.resumeTimeout, isPlaying, onPlayPause]);

  // Get button states
  const currentIndex = PHASES_ORDER.indexOf(currentPhase);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < PHASES_ORDER.length - 1;

  const phaseStates = getPhaseStates();

  return (
    <div
      ref={controlsRef}
      className={`navigation-controls ${className}`}
      style={{
        opacity: resumeState.isResuming ? resumeState.fadeOpacity : 1.0,
        transition: resumeState.isResuming ? 'opacity 0.1s ease-linear' : 'none'
      }}
      role="toolbar"
      aria-label="Volleyball timing phase navigation"
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Phase indicators */}
        <div className="flex items-center justify-center space-x-3">
          {phaseStates.map((state, index) => (
            <PhaseIndicator
              key={state.phase}
              {...state}
              onClick={handlePhaseClick}
              index={index}
            />
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex items-center space-x-4">
          {/* Previous button */}
          <button
            className={`
              min-w-[44px] min-h-[44px] px-4 py-2
              rounded-lg border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2
              ${canGoPrevious
                ? 'border-brand-violet text-brand-violet hover:bg-brand-violet hover:text-white active:scale-95'
                : 'border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
              }
            `}
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            aria-label="Previous phase"
            style={{ touchAction: 'manipulation' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Play/Pause button */}
          <button
            className={`
              min-w-[44px] min-h-[44px] px-4 py-2
              rounded-lg border-2 border-brand-violet text-brand-violet
              hover:bg-brand-violet hover:text-white
              focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2
              active:scale-95 transition-all duration-200
            `}
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause automatic progression' : 'Resume automatic progression'}
            style={{ touchAction: 'manipulation' }}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Next button */}
          <button
            className={`
              min-w-[44px] min-h-[44px] px-4 py-2
              rounded-lg border-2 transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2
              ${canGoNext
                ? 'border-brand-violet text-brand-violet hover:bg-brand-violet hover:text-white active:scale-95'
                : 'border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
              }
            `}
            onClick={handleNext}
            disabled={!canGoNext}
            aria-label="Next phase"
            style={{ touchAction: 'manipulation' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Current phase announcement for screen readers */}
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {PHASE_DESCRIPTIONS[currentPhase]}
        </div>

        {/* Keyboard shortcuts help */}
        <div className="text-xs text-gray-400 text-center max-w-md">
          <p>Use arrow keys to navigate, space to pause/play, or numbers 1-6 for direct phase access</p>
        </div>
      </div>
    </div>
  );
};

export default NavigationControls;