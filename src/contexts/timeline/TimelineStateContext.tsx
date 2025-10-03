/**
 * TimelineStateContext - Timeline/Filmstrip Layout State Management
 *
 * Manages navigation state for the temporal layer-based layout where
 * sections exist as "frames" in a film timeline.
 *
 * @fileoverview Timeline navigation state context
 * @version 1.0.0
 * @since Timeline Layout Implementation
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SectionId } from '../../types';

// ===== TYPES =====

export type TransitionDirection = 'forward' | 'backward' | 'jump';
export type TransitionStyle =
  | 'crossfade'      // Simple fade
  | 'zoomBlur'       // TikTok zoom with blur
  | 'spin'           // 360° rotation
  | 'slide'          // Horizontal slide
  | 'glitch'         // RGB split effect
  | 'whipPan'        // Fast horizontal blur
  | 'zoomPunch'      // Quick zoom in/out
  | 'lightTable'     // Thumbnail expansion
  | 'filmBurn';      // Radial burn

export interface TimelineState {
  activeLayerIndex: number;           // 0-5 current section
  isTransitioning: boolean;            // Prevent rapid navigation
  transitionDirection: TransitionDirection;
  filmstripScrollPosition: number;     // Horizontal scroll state
  autoAdvanceEnabled: boolean;
  autoAdvanceInterval: number;         // 5000, 8000, or 10000ms
  hoveredThumbnailIndex: number | null; // For ghost preview
  isLooping: boolean;                  // Loop indicator flag
  transitionStyle: TransitionStyle;    // Selected transition type
}

export interface TimelineActions {
  navigateToLayer: (index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  setHoveredThumbnail: (index: number | null) => void;
  toggleAutoAdvance: () => void;
  setTransitionStyle: (style: TransitionStyle) => void;
  setFilmstripScrollPosition: (position: number) => void;
}

export interface TimelineContextValue {
  state: TimelineState;
  actions: TimelineActions;
}

// Section order mapping
const SECTION_ORDER: SectionId[] = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

// ===== CONTEXT =====

const TimelineStateContext = createContext<TimelineContextValue | undefined>(undefined);

// ===== PROVIDER =====

export interface TimelineStateProviderProps {
  children: ReactNode;
  initialLayerIndex?: number;
  transitionDuration?: number; // Default 700ms
}

export const TimelineStateProvider: React.FC<TimelineStateProviderProps> = ({
  children,
  initialLayerIndex = 0,
  transitionDuration = 700
}) => {
  // State
  const [activeLayerIndex, setActiveLayerIndex] = useState(initialLayerIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>('forward');
  const [filmstripScrollPosition, setFilmstripScrollPosition] = useState(0);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(false);
  const [autoAdvanceInterval] = useState(5000); // 5 seconds default
  const [hoveredThumbnailIndex, setHoveredThumbnail] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<TransitionStyle>('crossfade');

  // Actions
  const navigateToLayer = useCallback((index: number) => {
    if (isTransitioning) {
      console.log('🎬 Navigation blocked - transition in progress');
      return;
    }

    if (index < 0 || index >= SECTION_ORDER.length) {
      console.warn('🎬 Invalid layer index:', index);
      return;
    }

    if (index === activeLayerIndex) {
      console.log('🎬 Already on layer', index);
      return;
    }

    // Determine transition direction
    const direction: TransitionDirection =
      Math.abs(index - activeLayerIndex) > 1 ? 'jump' :
      index > activeLayerIndex ? 'forward' : 'backward';

    // Check for loop
    const looping =
      (activeLayerIndex === 5 && index === 0) || // Forward loop
      (activeLayerIndex === 0 && index === 5);   // Backward loop

    console.log(`🎬 Navigating: Layer ${activeLayerIndex} → ${index}`, {
      direction,
      looping,
      section: SECTION_ORDER[index]
    });

    setTransitionDirection(direction);
    setIsLooping(looping);
    setIsTransitioning(true);
    setActiveLayerIndex(index);

    // Clear transition lock after duration
    setTimeout(() => {
      setIsTransitioning(false);
      setIsLooping(false);
    }, transitionDuration);
  }, [isTransitioning, activeLayerIndex, transitionDuration]);

  const navigateNext = useCallback(() => {
    const nextIndex = (activeLayerIndex + 1) % SECTION_ORDER.length; // Infinite loop
    navigateToLayer(nextIndex);
  }, [activeLayerIndex, navigateToLayer]);

  const navigatePrevious = useCallback(() => {
    const prevIndex = (activeLayerIndex - 1 + SECTION_ORDER.length) % SECTION_ORDER.length; // Infinite loop
    navigateToLayer(prevIndex);
  }, [activeLayerIndex, navigateToLayer]);

  const toggleAutoAdvance = useCallback(() => {
    setAutoAdvanceEnabled(prev => !prev);
    console.log(`🎬 Auto-advance ${!autoAdvanceEnabled ? 'enabled' : 'disabled'}`);
  }, [autoAdvanceEnabled]);

  const setFilmstripScroll = useCallback((position: number) => {
    setFilmstripScrollPosition(position);
  }, []);

  const setTransition = useCallback((style: TransitionStyle) => {
    setTransitionStyle(style);
    console.log(`🎬 Transition style changed to: ${style}`);
  }, []);

  const contextValue: TimelineContextValue = {
    state: {
      activeLayerIndex,
      isTransitioning,
      transitionDirection,
      filmstripScrollPosition,
      autoAdvanceEnabled,
      autoAdvanceInterval,
      hoveredThumbnailIndex,
      isLooping,
      transitionStyle
    },
    actions: {
      navigateToLayer,
      navigateNext,
      navigatePrevious,
      setHoveredThumbnail,
      toggleAutoAdvance,
      setTransitionStyle: setTransition,
      setFilmstripScrollPosition: setFilmstripScroll
    }
  };

  return (
    <TimelineStateContext.Provider value={contextValue}>
      {children}
    </TimelineStateContext.Provider>
  );
};

// ===== HOOK =====

export const useTimelineState = (): TimelineContextValue => {
  const context = useContext(TimelineStateContext);
  if (!context) {
    throw new Error('useTimelineState must be used within TimelineStateProvider');
  }
  return context;
};

// ===== HELPERS =====

export const getSectionIdFromIndex = (index: number): SectionId => {
  return SECTION_ORDER[index] || 'capture';
};

export const getIndexFromSectionId = (sectionId: SectionId): number => {
  return SECTION_ORDER.indexOf(sectionId);
};

export { SECTION_ORDER };
