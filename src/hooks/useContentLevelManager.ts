/**
 * Enhanced Content Level Manager Hook
 *
 * Manages progressive content disclosure based on zoom levels and user engagement
 * implementing section-specific thresholds with photography metaphor integration
 * and performance-aware transitions.
 *
 * Phase 3: Content Integration - Task 2: Enhanced Content Level Manager
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ContentLevel,
  DEFAULT_CONTENT_THRESHOLDS
} from '../types/section-content';
import type {
  ContentLevelThresholds,
  ContentInteractionState,
  ContentInteractionEvent,
  SpatialPhotoWorkflowSection
} from '../types/section-content';
import type { CanvasPosition } from '../types/canvas';

// ============================================================================
// HOOK INTERFACES
// ============================================================================

/**
 * Configuration options for content level manager
 * Supports section-specific customization and performance tuning
 */
interface UseContentLevelManagerOptions {
  /** Section identifier for section-specific thresholds */
  section: SpatialPhotoWorkflowSection;

  /** Custom content level thresholds (overrides defaults) */
  customThresholds?: Partial<ContentLevelThresholds>;

  /** Enable user engagement tracking for adaptive thresholds */
  enableEngagementTracking?: boolean;

  /** Performance mode for threshold calculations */
  performanceMode?: 'high' | 'balanced' | 'low';

  /** Callback for content level changes */
  onLevelChange?: (newLevel: ContentLevel, previousLevel: ContentLevel | null) => void;

  /** Callback for performance metrics */
  onPerformanceUpdate?: (metrics: ContentLevelPerformanceMetrics) => void;
}

/**
 * Content level manager return interface
 * Provides current state and control functions
 */
interface UseContentLevelManagerReturn {
  /** Current content level based on zoom and engagement */
  currentLevel: ContentLevel;

  /** Previous content level for transition tracking */
  previousLevel: ContentLevel | null;

  /** Whether content level transition is in progress */
  isTransitioning: boolean;

  /** User engagement and interaction state */
  interactionState: ContentInteractionState;

  /** Performance metrics for level transitions */
  performanceMetrics: ContentLevelPerformanceMetrics;

  /** Functions for manual control */
  actions: {
    /** Update canvas position and recalculate level */
    updateCanvasPosition: (position: CanvasPosition) => void;

    /** Force specific content level */
    setContentLevel: (level: ContentLevel) => void;

    /** Track user interaction for engagement scoring */
    trackInteraction: (event: ContentInteractionEvent) => void;

    /** Reset engagement tracking */
    resetEngagement: () => void;

    /** Get optimized thresholds for current section */
    getOptimizedThresholds: () => ContentLevelThresholds;
  };
}

/**
 * Performance metrics for content level management
 * Tracks transition timing and system performance
 */
interface ContentLevelPerformanceMetrics {
  /** Average time for level transitions (ms) */
  averageTransitionTime: number;

  /** Memory usage for current content level (MB) */
  memoryUsage: number;

  /** Number of level changes in current session */
  transitionCount: number;

  /** Performance impact score (0-1, lower is better) */
  performanceImpact: number;

  /** Whether performance optimizations are active */
  isOptimized: boolean;
}

// ============================================================================
// CONSTANTS AND DEFAULTS
// ============================================================================

/**
 * Section-specific threshold adjustments
 * Fine-tunes disclosure levels based on content complexity
 */
const SECTION_THRESHOLD_ADJUSTMENTS: Record<SpatialPhotoWorkflowSection, Partial<ContentLevelThresholds>> = {
  capture: {
    // Hero section - show preview content earlier
    preview: { min: 0.2, max: 0.5 },
    summary: { min: 0.4, max: 1.0 }
  },
  focus: {
    // About section - more detailed content at lower zoom
    detailed: { min: 0.8, max: 2.0 },
    technical: { min: 1.5, max: 4.0 }
  },
  frame: {
    // Creative work - emphasize visual content
    preview: { min: 0.3, max: 0.6 },
    summary: { min: 0.5, max: 1.2 }
  },
  exposure: {
    // Professional work - technical depth earlier
    detailed: { min: 0.9, max: 2.0 },
    technical: { min: 1.8, max: 4.0 }
  },
  develop: {
    // Thought leadership - progressive complexity
    summary: { min: 0.6, max: 1.2 },
    detailed: { min: 1.1, max: 2.5 }
  },
  portfolio: {
    // Contact/final - quick access to key info
    summary: { min: 0.4, max: 0.8 },
    detailed: { min: 0.7, max: 1.5 }
  }
};

/**
 * Performance thresholds for different performance modes
 */
const PERFORMANCE_MODE_SETTINGS = {
  high: {
    maxTransitionTime: 200,
    maxMemoryUsage: 15,
    adaptiveThresholds: true,
    preloadAdjacent: true
  },
  balanced: {
    maxTransitionTime: 350,
    maxMemoryUsage: 10,
    adaptiveThresholds: true,
    preloadAdjacent: false
  },
  low: {
    maxTransitionTime: 500,
    maxMemoryUsage: 5,
    adaptiveThresholds: false,
    preloadAdjacent: false
  }
} as const;

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Enhanced content level manager hook
 * Provides intelligent content disclosure based on zoom, engagement, and performance
 */
export function useContentLevelManager(options: UseContentLevelManagerOptions): UseContentLevelManagerReturn {
  const {
    section,
    customThresholds = {},
    enableEngagementTracking = true,
    performanceMode = 'balanced',
    onLevelChange,
    onPerformanceUpdate
  } = options;

  // ===== STATE MANAGEMENT =====

  const [currentLevel, setCurrentLevel] = useState<ContentLevel>(ContentLevel.PREVIEW);
  const [previousLevel, setPreviousLevel] = useState<ContentLevel | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [interactionState, setInteractionState] = useState<ContentInteractionState>({
    currentLevel: ContentLevel.PREVIEW,
    previousLevel: null,
    timeAtCurrentLevel: 0,
    engagement: {
      scrollDepth: 0,
      interactionCount: 0,
      timeSinceLastInteraction: 0
    },
    transition: {
      isTransitioning: false,
      progress: 0,
      startTime: null
    }
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<ContentLevelPerformanceMetrics>({
    averageTransitionTime: 0,
    memoryUsage: 0,
    transitionCount: 0,
    performanceImpact: 0,
    isOptimized: false
  });

  // ===== REFS FOR TRACKING =====

  const transitionStartTimeRef = useRef<number | null>(null);
  const engagementStartTimeRef = useRef<number>(Date.now());
  const transitionTimesRef = useRef<number[]>([]);
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // ===== THRESHOLD CALCULATION =====

  /**
   * Calculate optimized thresholds based on section and user engagement
   */
  const getOptimizedThresholds = useCallback((): ContentLevelThresholds => {
    // Start with default thresholds
    const baseThresholds = { ...DEFAULT_CONTENT_THRESHOLDS };

    // Apply section-specific adjustments
    const sectionAdjustments = SECTION_THRESHOLD_ADJUSTMENTS[section] || {};
    const mergedThresholds = {
      preview: { ...baseThresholds.preview, ...sectionAdjustments.preview },
      summary: { ...baseThresholds.summary, ...sectionAdjustments.summary },
      detailed: { ...baseThresholds.detailed, ...sectionAdjustments.detailed },
      technical: { ...baseThresholds.technical, ...sectionAdjustments.technical }
    };

    // Apply custom overrides
    Object.keys(customThresholds).forEach(level => {
      const levelKey = level as keyof ContentLevelThresholds;
      if (customThresholds[levelKey]) {
        mergedThresholds[levelKey] = { ...mergedThresholds[levelKey], ...customThresholds[levelKey] };
      }
    });

    // Apply engagement-based adjustments if enabled
    if (enableEngagementTracking && performanceMode !== 'low') {
      const { interactionCount, timeSinceLastInteraction } = interactionState.engagement;

      // High engagement users see detailed content earlier
      if (interactionCount > 5 && timeSinceLastInteraction < 10000) {
        mergedThresholds.detailed.min = Math.max(0.7, mergedThresholds.detailed.min - 0.2);
        mergedThresholds.technical.min = Math.max(1.5, mergedThresholds.technical.min - 0.3);
      }

      // Low engagement users get summary content longer
      if (interactionCount < 2 && timeSinceLastInteraction > 30000) {
        mergedThresholds.summary.max = Math.min(1.5, mergedThresholds.summary.max + 0.3);
      }
    }

    return mergedThresholds;
  }, [section, customThresholds, enableEngagementTracking, performanceMode, interactionState.engagement]);

  // ===== LEVEL CALCULATION =====

  /**
   * Calculate appropriate content level based on canvas scale
   */
  const calculateContentLevel = useCallback((scale: number): ContentLevel => {
    const thresholds = getOptimizedThresholds();

    // Determine level based on scale thresholds
    if (scale >= thresholds.technical.min && scale <= thresholds.technical.max) {
      return ContentLevel.TECHNICAL;
    } else if (scale >= thresholds.detailed.min && scale <= thresholds.detailed.max) {
      return ContentLevel.DETAILED;
    } else if (scale >= thresholds.summary.min && scale <= thresholds.summary.max) {
      return ContentLevel.SUMMARY;
    } else {
      return ContentLevel.PREVIEW;
    }
  }, [section, customThresholds, enableEngagementTracking, performanceMode, interactionState.engagement.interactionCount, interactionState.engagement.timeSinceLastInteraction]);

  // ===== ACTION HANDLERS =====

  /**
   * Update canvas position and recalculate content level
   */
  const updateCanvasPosition = useCallback((position: CanvasPosition) => {
    const newLevel = calculateContentLevel(position.scale);

    if (newLevel !== currentLevel) {
      // Start transition tracking
      setIsTransitioning(true);
      transitionStartTimeRef.current = performance.now();

      // Update levels
      setPreviousLevel(currentLevel);
      setCurrentLevel(newLevel);

      // Update interaction state
      setInteractionState(prev => ({
        ...prev,
        currentLevel: newLevel,
        previousLevel: currentLevel,
        timeAtCurrentLevel: 0,
        transition: {
          isTransitioning: true,
          progress: 0,
          startTime: performance.now()
        }
      }));

      // Callback notification
      onLevelChange?.(newLevel, currentLevel);
    }
  }, [currentLevel, calculateContentLevel, onLevelChange]);

  /**
   * Force specific content level (for manual control)
   */
  const setContentLevel = useCallback((level: ContentLevel) => {
    if (level !== currentLevel) {
      setPreviousLevel(currentLevel);
      setCurrentLevel(level);

      setInteractionState(prev => ({
        ...prev,
        currentLevel: level,
        previousLevel: currentLevel,
        timeAtCurrentLevel: 0
      }));

      onLevelChange?.(level, currentLevel);
    }
  }, [currentLevel, onLevelChange]);

  /**
   * Track user interaction for engagement scoring
   */
  const trackInteraction = useCallback((event: ContentInteractionEvent) => {
    const now = Date.now();

    setInteractionState(prev => ({
      ...prev,
      engagement: {
        ...prev.engagement,
        interactionCount: prev.engagement.interactionCount + 1,
        timeSinceLastInteraction: 0
      }
    }));

    lastInteractionTimeRef.current = now;
  }, []);

  /**
   * Reset engagement tracking
   */
  const resetEngagement = useCallback(() => {
    setInteractionState(prev => ({
      ...prev,
      engagement: {
        scrollDepth: 0,
        interactionCount: 0,
        timeSinceLastInteraction: 0
      }
    }));

    engagementStartTimeRef.current = Date.now();
    lastInteractionTimeRef.current = Date.now();
  }, []);

  // ===== EFFECTS =====

  /**
   * Update engagement timing
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeAtLevel = now - engagementStartTimeRef.current;
      const timeSinceInteraction = now - lastInteractionTimeRef.current;

      setInteractionState(prev => ({
        ...prev,
        timeAtCurrentLevel: timeAtLevel,
        engagement: {
          ...prev.engagement,
          timeSinceLastInteraction: timeSinceInteraction
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Handle transition completion
   */
  useEffect(() => {
    if (isTransitioning && transitionStartTimeRef.current) {
      const transitionDuration = performance.now() - transitionStartTimeRef.current;
      const settings = PERFORMANCE_MODE_SETTINGS[performanceMode];

      // Complete transition after specified delay
      const completionDelay = Math.min(transitionDuration, settings.maxTransitionTime);

      const timer = setTimeout(() => {
        setIsTransitioning(false);

        // Track transition metrics
        transitionTimesRef.current.push(transitionDuration);
        const recentTransitions = transitionTimesRef.current.slice(-10); // Keep last 10
        const averageTime = recentTransitions.reduce((sum, time) => sum + time, 0) / recentTransitions.length;

        setPerformanceMetrics(prev => ({
          ...prev,
          averageTransitionTime: averageTime,
          transitionCount: prev.transitionCount + 1,
          performanceImpact: averageTime / settings.maxTransitionTime, // 0-1 scale
          isOptimized: averageTime < settings.maxTransitionTime
        }));

        // Update interaction state
        setInteractionState(prev => ({
          ...prev,
          transition: {
            isTransitioning: false,
            progress: 1,
            startTime: null
          }
        }));

        // Performance callback
        onPerformanceUpdate?.(performanceMetrics);

        transitionStartTimeRef.current = null;
      }, completionDelay);

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, performanceMode, performanceMetrics, onPerformanceUpdate]);

  /**
   * Monitor memory usage (simplified)
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      const memoryInfo = (window.performance as any).memory;
      const memoryUsageMB = memoryInfo.usedJSHeapSize / (1024 * 1024);

      setPerformanceMetrics(prev => ({
        ...prev,
        memoryUsage: memoryUsageMB
      }));
    }
  }, [currentLevel]);

  // ===== RETURN INTERFACE =====

  const actions = useMemo(() => ({
    updateCanvasPosition,
    setContentLevel,
    trackInteraction,
    resetEngagement,
    getOptimizedThresholds
  }), [updateCanvasPosition, setContentLevel, trackInteraction, resetEngagement, getOptimizedThresholds]);

  return {
    currentLevel,
    previousLevel,
    isTransitioning,
    interactionState,
    performanceMetrics,
    actions
  };
}