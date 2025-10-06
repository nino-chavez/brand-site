/**
 * Section Orchestrator
 *
 * Coordinates content levels across multiple sections, handles cross-section
 * state synchronization, and provides intelligent content level management
 * based on canvas position and user engagement patterns.
 *
 * Phase 3: Integration and Testing - Task 7: Canvas Integration and Orchestration
 */

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { isTestMode } from '../../utils/test-mode';
import { useCanvasState, calculateContentLevelFromScale, getOptimalPositionForLevel } from '../../contexts/CanvasStateProvider';
import { ContentLevel } from '../../types/section-content';
import type { SpatialPhotoWorkflowSection, CanvasPosition } from '../../types/canvas';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Orchestration strategy for managing content levels
 */
type OrchestrationStrategy =
  | 'proximity-based'     // Content level based on distance from section
  | 'engagement-driven'   // Content level based on user engagement
  | 'performance-aware'   // Content level optimized for performance
  | 'adaptive-smart';     // Intelligent combination of all strategies

/**
 * Section content strategy configuration
 */
interface SectionContentStrategy {
  /** Section identifier */
  section: SpatialPhotoWorkflowSection;
  /** Base content level for this section */
  baseLevel: ContentLevel;
  /** Priority for resource allocation (1 = highest) */
  priority: number;
  /** Whether this section should lead orchestration */
  isLeader: boolean;
  /** Custom content level rules */
  customRules?: {
    minLevel: ContentLevel;
    maxLevel: ContentLevel;
    engagementThreshold: number;
    proximityWeight: number;
  };
}

/**
 * Orchestration state for analytics and debugging
 */
interface OrchestrationState {
  /** Current orchestration strategy */
  strategy: OrchestrationStrategy;
  /** Active lead section */
  leadSection: SpatialPhotoWorkflowSection | null;
  /** Last orchestration update timestamp */
  lastUpdate: number;
  /** Number of content level changes this session */
  totalChanges: number;
  /** Performance impact score (0-1) */
  performanceImpact: number;
  /** Section proximity scores */
  proximityScores: Map<SpatialPhotoWorkflowSection, number>;
  /** Section engagement scores */
  engagementScores: Map<SpatialPhotoWorkflowSection, number>;
}

/**
 * Section Orchestrator props
 */
interface SectionOrchestratorProps {
  /** Orchestration strategy to use */
  strategy?: OrchestrationStrategy;
  /** Section content strategies */
  sectionStrategies?: SectionContentStrategy[];
  /** Enable performance optimization */
  enablePerformanceOptimization?: boolean;
  /** Enable debugging output */
  debugMode?: boolean;
  /** Callback for orchestration state changes */
  onOrchestrationUpdate?: (state: OrchestrationState) => void;
  /** Children components (content adapters) */
  children: React.ReactNode;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default section content strategies based on photography metaphor
 */
const DEFAULT_SECTION_STRATEGIES: SectionContentStrategy[] = [
  {
    section: 'capture',
    baseLevel: ContentLevel.PREVIEW,
    priority: 1,
    isLeader: true, // Hero section leads
    customRules: {
      minLevel: ContentLevel.PREVIEW,
      maxLevel: ContentLevel.SUMMARY,
      engagementThreshold: 0.3,
      proximityWeight: 1.2
    }
  },
  {
    section: 'focus',
    baseLevel: ContentLevel.SUMMARY,
    priority: 2,
    isLeader: false,
    customRules: {
      minLevel: ContentLevel.PREVIEW,
      maxLevel: ContentLevel.TECHNICAL,
      engagementThreshold: 0.5,
      proximityWeight: 1.0
    }
  },
  {
    section: 'frame',
    baseLevel: ContentLevel.SUMMARY,
    priority: 3,
    isLeader: false,
    customRules: {
      minLevel: ContentLevel.PREVIEW,
      maxLevel: ContentLevel.DETAILED,
      engagementThreshold: 0.4,
      proximityWeight: 0.9
    }
  },
  {
    section: 'exposure',
    baseLevel: ContentLevel.DETAILED,
    priority: 2,
    isLeader: false,
    customRules: {
      minLevel: ContentLevel.SUMMARY,
      maxLevel: ContentLevel.TECHNICAL,
      engagementThreshold: 0.6,
      proximityWeight: 1.1
    }
  },
  {
    section: 'develop',
    baseLevel: ContentLevel.SUMMARY,
    priority: 4,
    isLeader: false,
    customRules: {
      minLevel: ContentLevel.PREVIEW,
      maxLevel: ContentLevel.DETAILED,
      engagementThreshold: 0.5,
      proximityWeight: 0.8
    }
  },
  {
    section: 'portfolio',
    baseLevel: ContentLevel.SUMMARY,
    priority: 5,
    isLeader: false,
    customRules: {
      minLevel: ContentLevel.PREVIEW,
      maxLevel: ContentLevel.DETAILED,
      engagementThreshold: 0.4,
      proximityWeight: 0.7
    }
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two canvas positions
 */
function calculateDistance(pos1: CanvasPosition, pos2: CanvasPosition): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const scaleDistance = Math.abs(pos1.scale - pos2.scale) * 100; // Scale distance weighted
  return Math.sqrt(dx * dx + dy * dy + scaleDistance * scaleDistance);
}

/**
 * Calculate proximity score (0-1, higher = closer)
 */
function calculateProximityScore(
  currentPosition: CanvasPosition,
  sectionPosition: CanvasPosition,
  maxDistance: number = 500
): number {
  const distance = calculateDistance(currentPosition, sectionPosition);
  return Math.max(0, 1 - (distance / maxDistance));
}

/**
 * Calculate engagement score based on interaction history
 */
function calculateEngagementScore(
  section: SpatialPhotoWorkflowSection,
  eventHistory: any[],
  timeWindow: number = 60000 // 1 minute
): number {
  const recentEvents = eventHistory.filter(
    event => event.section === section &&
    Date.now() - event.timestamp < timeWindow
  );

  const interactionWeight = {
    'navigation': 0.3,
    'zoom': 0.4,
    'content_level_change': 0.5,
    'section_change': 0.6
  };

  return recentEvents.reduce((score, event) => {
    const weight = interactionWeight[event.type as keyof typeof interactionWeight] || 0.1;
    return score + weight;
  }, 0) / 10; // Normalize to 0-1 range
}

/**
 * Determine optimal content level using orchestration strategy
 */
function determineOptimalContentLevel(
  strategy: OrchestrationStrategy,
  sectionStrategy: SectionContentStrategy,
  proximityScore: number,
  engagementScore: number,
  currentPosition: CanvasPosition,
  performanceImpact: number
): ContentLevel {
  const { baseLevel, customRules } = sectionStrategy;
  const rules = customRules || {
    minLevel: ContentLevel.PREVIEW,
    maxLevel: ContentLevel.TECHNICAL,
    engagementThreshold: 0.5,
    proximityWeight: 1.0
  };

  switch (strategy) {
    case 'proximity-based':
      // Content level based on canvas proximity
      if (proximityScore > 0.8) return ContentLevel.TECHNICAL;
      if (proximityScore > 0.6) return ContentLevel.DETAILED;
      if (proximityScore > 0.3) return ContentLevel.SUMMARY;
      return ContentLevel.PREVIEW;

    case 'engagement-driven':
      // Content level based on user engagement
      if (engagementScore > 0.7) return ContentLevel.TECHNICAL;
      if (engagementScore > 0.5) return ContentLevel.DETAILED;
      if (engagementScore > 0.3) return ContentLevel.SUMMARY;
      return ContentLevel.PREVIEW;

    case 'performance-aware': {
      // Reduce content level if performance is poor
      const performancePenalty = performanceImpact > 0.7 ? 1 : 0;
      const scaleLevel = calculateContentLevelFromScale(currentPosition.scale);
      const levelIndex = Object.values(ContentLevel).indexOf(scaleLevel);
      const adjustedIndex = Math.max(0, levelIndex - performancePenalty);
      return Object.values(ContentLevel)[adjustedIndex] as ContentLevel;
    }

    case 'adaptive-smart':
    default: {
      // Intelligent combination of all factors
      const scaleLevel = calculateContentLevelFromScale(currentPosition.scale);
      const scaleLevelIndex = Object.values(ContentLevel).indexOf(scaleLevel);

      // Engagement boost
      const engagementBoost = engagementScore > rules.engagementThreshold ? 1 : 0;

      // Proximity adjustment
      const proximityAdjustment = Math.round((proximityScore - 0.5) * rules.proximityWeight);

      // Performance penalty
      const performancePenalty = performanceImpact > 0.8 ? -1 : 0;

      // Calculate final level index
      let finalIndex = scaleLevelIndex + engagementBoost + proximityAdjustment + performancePenalty;

      // Clamp to section rules
      const minIndex = Object.values(ContentLevel).indexOf(rules.minLevel);
      const maxIndex = Object.values(ContentLevel).indexOf(rules.maxLevel);
      finalIndex = Math.max(minIndex, Math.min(maxIndex, finalIndex));

      return Object.values(ContentLevel)[finalIndex] as ContentLevel;
    }
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const SectionOrchestrator: React.FC<SectionOrchestratorProps> = ({
  strategy = 'adaptive-smart',
  sectionStrategies = DEFAULT_SECTION_STRATEGIES,
  enablePerformanceOptimization = true,
  debugMode = false,
  onOrchestrationUpdate,
  children
}) => {
  // ===== CANVAS STATE =====

  const { state: canvasState, actions: canvasActions, analytics } = useCanvasState();

  // ===== REFS =====

  const lastUpdateRef = useRef<number>(Date.now());
  const changeCountRef = useRef<number>(0);

  // ===== COMPUTED VALUES =====

  const sectionStrategyMap = useMemo(() => {
    return new Map(sectionStrategies.map(strategy => [strategy.section, strategy]));
  }, [sectionStrategies]);

  const leadSection = useMemo(() => {
    return sectionStrategies.find(s => s.isLeader)?.section || 'capture';
  }, [sectionStrategies]);

  // ===== ORCHESTRATION LOGIC =====

  // Extract specific values to avoid depending on entire canvasState object
  const currentPosition = canvasState.currentPosition;
  const eventHistory = canvasState.eventHistory;
  const sectionMap = canvasState.sectionMap;
  const sectionContentLevels = canvasState.sectionContentLevels;
  const performanceScore = analytics.performanceScore;

  const orchestrateContentLevels = useCallback(() => {
    const performanceImpact = performanceScore < 70 ? 0.8 : 0.2;

    const proximityScores = new Map<SpatialPhotoWorkflowSection, number>();
    const engagementScores = new Map<SpatialPhotoWorkflowSection, number>();
    const newContentLevels = new Map<SpatialPhotoWorkflowSection, ContentLevel>();

    // Calculate scores and content levels for each section
    sectionStrategies.forEach(sectionStrategy => {
      const { section } = sectionStrategy;
      const sectionData = sectionMap.get(section);

      if (!sectionData) return;

      // Calculate proximity score
      const proximityScore = calculateProximityScore(
        currentPosition,
        sectionData.canvasPosition
      );
      proximityScores.set(section, proximityScore);

      // Calculate engagement score
      const engagementScore = calculateEngagementScore(
        section,
        eventHistory
      );
      engagementScores.set(section, engagementScore);

      // Determine optimal content level
      const optimalLevel = determineOptimalContentLevel(
        strategy,
        sectionStrategy,
        proximityScore,
        engagementScore,
        currentPosition,
        performanceImpact
      );

      newContentLevels.set(section, optimalLevel);
    });

    // Apply content level changes
    let changesCount = 0;
    newContentLevels.forEach((newLevel, section) => {
      const currentLevel = sectionContentLevels.get(section);
      if (currentLevel !== newLevel) {
        canvasActions.setSectionContentLevel(section, newLevel);
        changesCount++;
      }
    });

    // Update orchestration state
    const orchestrationState: OrchestrationState = {
      strategy,
      leadSection,
      lastUpdate: Date.now(),
      totalChanges: changeCountRef.current + changesCount,
      performanceImpact,
      proximityScores,
      engagementScores
    };

    changeCountRef.current += changesCount;
    lastUpdateRef.current = Date.now();

    // Notify about orchestration update
    onOrchestrationUpdate?.(orchestrationState);

    // Debug logging
    if (debugMode && changesCount > 0) {
      console.log('🎼 Section Orchestrator Update:', {
        strategy,
        changesCount,
        proximityScores: Object.fromEntries(proximityScores),
        engagementScores: Object.fromEntries(engagementScores),
        newContentLevels: Object.fromEntries(newContentLevels)
      });
    }
  }, [
    currentPosition,
    eventHistory,
    sectionMap,
    sectionContentLevels,
    performanceScore,
    strategy,
    sectionStrategies,
    canvasActions,
    leadSection,
    debugMode,
    onOrchestrationUpdate
  ]);

  // ===== SYNCHRONIZATION EFFECTS =====

  /**
   * Orchestrate content levels when canvas position changes
   */
  useEffect(() => {
    const throttleMs = enablePerformanceOptimization ? 150 : 50;
    const now = Date.now();

    if (now - lastUpdateRef.current > throttleMs) {
      orchestrateContentLevels();
    } else {
      // Throttle updates for performance
      const timer = setTimeout(orchestrateContentLevels, throttleMs);
      return () => clearTimeout(timer);
    }
  }, [currentPosition.x, currentPosition.y, currentPosition.scale, orchestrateContentLevels, enablePerformanceOptimization]);

  /**
   * Update synchronization mode based on strategy
   */
  useEffect(() => {
    const syncMode = strategy === 'adaptive-smart' ? 'smart' :
                     strategy === 'performance-aware' ? 'unified' : 'independent';

    canvasActions.setSynchronizationMode(syncMode);
  }, [strategy, canvasActions]);

  /**
   * Handle active section changes
   */
  useEffect(() => {
    const activeSection = canvasState.activeSection;
    if (activeSection) {
      // When a section becomes active, potentially boost its content level
      const sectionStrategy = sectionStrategyMap.get(activeSection);
      if (sectionStrategy && strategy === 'engagement-driven') {
        const currentLevel = sectionContentLevels.get(activeSection);
        const levelIndex = Object.values(ContentLevel).indexOf(currentLevel || ContentLevel.PREVIEW);

        if (levelIndex < Object.values(ContentLevel).length - 1) {
          const boostedLevel = Object.values(ContentLevel)[levelIndex + 1] as ContentLevel;
          canvasActions.setSectionContentLevel(activeSection, boostedLevel);
        }
      }
    }
  }, [canvasState.activeSection, strategy, sectionStrategyMap, sectionContentLevels, canvasActions]);

  /**
   * Performance optimization
   */
  useEffect(() => {
    if (enablePerformanceOptimization && performanceScore < 60) {
      // Reduce content levels across all sections if performance is poor
      const currentLevels = Array.from(sectionContentLevels.entries());

      currentLevels.forEach(([section, level]) => {
        const levelIndex = Object.values(ContentLevel).indexOf(level);
        if (levelIndex > 0) {
          const reducedLevel = Object.values(ContentLevel)[levelIndex - 1] as ContentLevel;
          canvasActions.setSectionContentLevel(section, reducedLevel);
        }
      });

      if (debugMode) {
        console.log('[PERF] Performance optimization: Reduced content levels', {
          performanceScore,
          reductions: currentLevels.length
        });
      }
    }
  }, [performanceScore, enablePerformanceOptimization, sectionContentLevels, canvasActions, debugMode]);

  // ===== RENDER =====

  // Disable orchestration during tests to prevent infinite re-render loops
  if (isTestMode()) {
    console.log('🧪 SectionOrchestrator orchestration disabled in test mode');
    return <>{children}</>;
  }

  // The orchestrator is invisible - it only manages state
  // Children (content adapters) receive orchestrated content levels through canvas context
  return <>{children}</>;
};

// ============================================================================
// HOOKS FOR ORCHESTRATION INTEGRATION
// ============================================================================

/**
 * Hook for content adapters to get orchestrated content level
 */
export function useOrchestratedContentLevel(section: SpatialPhotoWorkflowSection): ContentLevel {
  const { state } = useCanvasState();
  return state.sectionContentLevels.get(section) || ContentLevel.PREVIEW;
}

/**
 * Hook to get orchestration debug information
 */
export function useOrchestrationDebug() {
  const { state, analytics } = useCanvasState();

  return {
    sectionContentLevels: Object.fromEntries(state.sectionContentLevels),
    globalContentLevel: state.globalContentLevel,
    synchronizationMode: state.synchronization.mode,
    performance: analytics,
    activeSection: state.activeSection,
    eventHistory: state.eventHistory.slice(-10) // Last 10 events
  };
}

export default SectionOrchestrator;