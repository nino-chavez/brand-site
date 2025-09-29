/**
 * User Journey Analytics System
 *
 * Comprehensive analytics for tracking content optimization effectiveness,
 * user engagement patterns, and progressive disclosure strategy validation.
 *
 * Task 11: User Experience Validation - User Journey Analytics
 */

import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { ContentLevel } from '../types/section-content';
import type { CanvasPosition } from '../types/canvas';

// ============================================================================
// ANALYTICS INTERFACES
// ============================================================================

/**
 * User journey event types for comprehensive tracking
 */
export type JourneyEventType =
  | 'session_start'
  | 'section_enter'
  | 'section_exit'
  | 'content_level_change'
  | 'interaction'
  | 'scroll'
  | 'zoom'
  | 'hover'
  | 'click'
  | 'keyboard_navigation'
  | 'focus_change'
  | 'error'
  | 'performance_issue'
  | 'accessibility_action'
  | 'feedback_submitted'
  | 'session_end';

/**
 * User persona classification for targeted analytics
 */
export type UserPersona =
  | 'technical_recruiter'
  | 'engineering_manager'
  | 'potential_client'
  | 'fellow_developer'
  | 'quick_browser'
  | 'accessibility_user'
  | 'mobile_user'
  | 'unknown';

/**
 * A/B test variant identification
 */
export interface ABTestVariant {
  id: string;
  name: string;
  strategy: 'chronological' | 'impact_first' | 'skills_focused' | 'narrative_driven';
  cohort: string;
}

/**
 * Comprehensive journey event data
 */
export interface JourneyEvent {
  // Event identification
  id: string;
  type: JourneyEventType;
  timestamp: number;
  sessionId: string;

  // User context
  userPersona: UserPersona;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  viewport: { width: number; height: number };
  userAgent: string;

  // Content context
  section: string;
  contentLevel: ContentLevel;
  canvasPosition: CanvasPosition;
  abTestVariant?: ABTestVariant;

  // Interaction details
  target?: {
    type: 'heading' | 'body' | 'skill' | 'project' | 'link' | 'button' | 'navigation';
    id: string;
    text?: string;
    coordinates?: { x: number; y: number };
  };

  // Performance data
  performance?: {
    renderTime?: number;
    transitionDuration?: number;
    memoryUsage?: number;
    cumulativeLayoutShift?: number;
  };

  // Accessibility data
  accessibility?: {
    screenReaderActive: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    focusMethod: 'mouse' | 'keyboard' | 'programmatic' | 'touch';
  };

  // Custom metadata
  metadata?: Record<string, any>;
}

/**
 * User journey session data
 */
export interface JourneySession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  userPersona: UserPersona;
  abTestVariant?: ABTestVariant;

  // Journey metrics
  sectionsVisited: string[];
  contentLevelsReached: ContentLevel[];
  totalInteractions: number;
  engagementScore: number;

  // Content effectiveness metrics
  contentProgression: {
    section: string;
    levels: ContentLevel[];
    timeSpent: Record<ContentLevel, number>;
    interactions: number;
  }[];

  // Performance metrics
  averageRenderTime: number;
  totalMemoryUsage: number;
  performanceIssues: string[];

  // Accessibility metrics
  keyboardNavigationUsed: boolean;
  screenReaderUsed: boolean;
  accessibilityIssues: string[];

  // Conversion events
  conversionEvents: {
    type: 'contact' | 'download' | 'demo_access' | 'social_share' | 'deep_engagement';
    timestamp: number;
    context: string;
  }[];
}

/**
 * Content optimization effectiveness metrics
 */
export interface ContentOptimizationMetrics {
  // Progressive disclosure effectiveness
  levelProgression: {
    from: ContentLevel;
    to: ContentLevel;
    conversionRate: number;
    averageTime: number;
    dropOffRate: number;
  }[];

  // Section engagement
  sectionMetrics: {
    section: string;
    averageTimeSpent: number;
    engagementRate: number;
    preferredLevel: ContentLevel;
    completionRate: number;
  }[];

  // A/B test results
  abTestResults: {
    variant: ABTestVariant;
    sessions: number;
    engagementScore: number;
    conversionRate: number;
    performanceScore: number;
    satisfactionScore: number;
  }[];

  // User persona insights
  personaInsights: {
    persona: UserPersona;
    preferredDisclosureStrategy: string;
    averageSessionDuration: number;
    contentPreferences: {
      level: ContentLevel;
      sections: string[];
    };
  }[];
}

// ============================================================================
// ANALYTICS CONTEXT
// ============================================================================

interface UserJourneyContextValue {
  // Current session
  currentSession: JourneySession | null;
  userPersona: UserPersona;
  abTestVariant?: ABTestVariant;

  // Event tracking
  trackEvent: (event: Partial<JourneyEvent>) => void;
  trackContentLevelChange: (section: string, from: ContentLevel, to: ContentLevel) => void;
  trackInteraction: (target: JourneyEvent['target'], metadata?: any) => void;
  trackPerformance: (metrics: JourneyEvent['performance']) => void;
  trackAccessibility: (data: JourneyEvent['accessibility']) => void;

  // Session management
  startSession: (persona?: UserPersona, variant?: ABTestVariant) => void;
  endSession: () => void;
  updatePersona: (persona: UserPersona) => void;

  // Analytics queries
  getSessionMetrics: () => JourneySession | null;
  getContentMetrics: () => ContentOptimizationMetrics | null;
  exportJourneyData: () => JourneyEvent[];

  // A/B testing
  assignABTestVariant: () => ABTestVariant;
  getABTestResults: () => ContentOptimizationMetrics['abTestResults'];
}

const UserJourneyContext = createContext<UserJourneyContextValue | null>(null);

// ============================================================================
// ANALYTICS PROVIDER
// ============================================================================

interface UserJourneyProviderProps {
  children: React.ReactNode;
  enabledEvents?: JourneyEventType[];
  samplingRate?: number;
  debugMode?: boolean;
}

export const UserJourneyProvider: React.FC<UserJourneyProviderProps> = ({
  children,
  enabledEvents = [],
  samplingRate = 1.0,
  debugMode = process.env.NODE_ENV === 'development'
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [currentSession, setCurrentSession] = useState<JourneySession | null>(null);
  const [userPersona, setUserPersona] = useState<UserPersona>('unknown');
  const [abTestVariant, setAbTestVariant] = useState<ABTestVariant | undefined>();

  // Event storage (in production, this would go to analytics service)
  const eventsRef = useRef<JourneyEvent[]>([]);
  const sessionIdRef = useRef<string>('');

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const detectUserPersona = useCallback((): UserPersona => {
    const userAgent = navigator.userAgent.toLowerCase();
    const viewport = { width: window.innerWidth, height: window.innerHeight };

    // Simple heuristics for persona detection
    if (viewport.width < 768) return 'mobile_user';
    if (userAgent.includes('mobile')) return 'mobile_user';

    // Check for accessibility tools
    if (window.speechSynthesis?.getVoices().length > 0) return 'accessibility_user';

    // Default persona classification
    return 'unknown';
  }, []);

  const getDeviceType = useCallback((): 'desktop' | 'tablet' | 'mobile' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  const detectAccessibilityFeatures = useCallback((): JourneyEvent['accessibility'] => {
    return {
      screenReaderActive: !!window.speechSynthesis?.speaking,
      keyboardNavigation: document.activeElement?.tagName !== 'BODY',
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      focusMethod: 'programmatic' // Will be updated based on actual interaction
    };
  }, []);

  // ============================================================================
  // A/B TESTING
  // ============================================================================

  const AB_TEST_VARIANTS: ABTestVariant[] = [
    {
      id: 'chronological',
      name: 'Chronological Timeline',
      strategy: 'chronological',
      cohort: 'control'
    },
    {
      id: 'impact_first',
      name: 'Impact-Driven',
      strategy: 'impact_first',
      cohort: 'variant_a'
    },
    {
      id: 'skills_focused',
      name: 'Skills-Focused',
      strategy: 'skills_focused',
      cohort: 'variant_b'
    },
    {
      id: 'narrative_driven',
      name: 'Narrative Story',
      strategy: 'narrative_driven',
      cohort: 'variant_c'
    }
  ];

  const assignABTestVariant = useCallback((): ABTestVariant => {
    const sessionHash = sessionIdRef.current.split('-')[0];
    const variantIndex = parseInt(sessionHash, 16) % AB_TEST_VARIANTS.length;
    return AB_TEST_VARIANTS[variantIndex];
  }, []);

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  const trackEvent = useCallback((eventData: Partial<JourneyEvent>) => {
    if (Math.random() > samplingRate) return;

    const event: JourneyEvent = {
      id: generateId(),
      type: eventData.type || 'interaction',
      timestamp: Date.now(),
      sessionId: sessionIdRef.current,
      userPersona,
      deviceType: getDeviceType(),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      userAgent: navigator.userAgent,
      section: eventData.section || 'unknown',
      contentLevel: eventData.contentLevel || ContentLevel.SUMMARY,
      canvasPosition: eventData.canvasPosition || { x: 0, y: 0, scale: 1.0 },
      abTestVariant,
      accessibility: detectAccessibilityFeatures(),
      ...eventData
    };

    eventsRef.current.push(event);

    if (debugMode) {
      console.log('[Journey Analytics]', event);
    }

    // Update current session
    if (currentSession) {
      setCurrentSession(prev => {
        if (!prev) return null;

        return {
          ...prev,
          totalInteractions: prev.totalInteractions + 1,
          sectionsVisited: [...new Set([...prev.sectionsVisited, event.section])],
          contentLevelsReached: [...new Set([...prev.contentLevelsReached, event.contentLevel])]
        };
      });
    }
  }, [samplingRate, userPersona, getDeviceType, abTestVariant, currentSession, debugMode, generateId, detectAccessibilityFeatures]);

  const trackContentLevelChange = useCallback((
    section: string,
    from: ContentLevel,
    to: ContentLevel
  ) => {
    trackEvent({
      type: 'content_level_change',
      section,
      contentLevel: to,
      metadata: { previousLevel: from, transition: `${from} → ${to}` }
    });
  }, [trackEvent]);

  const trackInteraction = useCallback((
    target: JourneyEvent['target'],
    metadata?: any
  ) => {
    trackEvent({
      type: 'interaction',
      target,
      metadata
    });
  }, [trackEvent]);

  const trackPerformance = useCallback((metrics: JourneyEvent['performance']) => {
    trackEvent({
      type: 'performance_issue',
      performance: metrics
    });
  }, [trackEvent]);

  const trackAccessibility = useCallback((data: JourneyEvent['accessibility']) => {
    trackEvent({
      type: 'accessibility_action',
      accessibility: data
    });
  }, [trackEvent]);

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  const startSession = useCallback((
    persona?: UserPersona,
    variant?: ABTestVariant
  ) => {
    const sessionId = generateId();
    sessionIdRef.current = sessionId;

    const detectedPersona = persona || detectUserPersona();
    const assignedVariant = variant || assignABTestVariant();

    setUserPersona(detectedPersona);
    setAbTestVariant(assignedVariant);

    const session: JourneySession = {
      id: sessionId,
      startTime: Date.now(),
      userPersona: detectedPersona,
      abTestVariant: assignedVariant,
      sectionsVisited: [],
      contentLevelsReached: [],
      totalInteractions: 0,
      engagementScore: 0,
      contentProgression: [],
      averageRenderTime: 0,
      totalMemoryUsage: 0,
      performanceIssues: [],
      keyboardNavigationUsed: false,
      screenReaderUsed: false,
      accessibilityIssues: [],
      conversionEvents: []
    };

    setCurrentSession(session);

    trackEvent({
      type: 'session_start',
      metadata: { persona: detectedPersona, variant: assignedVariant }
    });

    if (debugMode) {
      console.log('[Journey Analytics] Session started:', session);
    }
  }, [generateId, detectUserPersona, assignABTestVariant, trackEvent, debugMode]);

  const endSession = useCallback(() => {
    if (currentSession) {
      const endTime = Date.now();
      const duration = endTime - currentSession.startTime;

      const finalSession: JourneySession = {
        ...currentSession,
        endTime,
        duration
      };

      setCurrentSession(finalSession);

      trackEvent({
        type: 'session_end',
        metadata: {
          duration,
          sectionsVisited: finalSession.sectionsVisited.length,
          totalInteractions: finalSession.totalInteractions
        }
      });

      if (debugMode) {
        console.log('[Journey Analytics] Session ended:', finalSession);
      }
    }
  }, [currentSession, trackEvent, debugMode]);

  const updatePersona = useCallback((persona: UserPersona) => {
    setUserPersona(persona);
    trackEvent({
      type: 'session_start', // Re-classify as new session type
      metadata: { personaUpdate: persona, previousPersona: userPersona }
    });
  }, [userPersona, trackEvent]);

  // ============================================================================
  // ANALYTICS QUERIES
  // ============================================================================

  const getSessionMetrics = useCallback(() => {
    return currentSession;
  }, [currentSession]);

  const getContentMetrics = useCallback((): ContentOptimizationMetrics | null => {
    if (eventsRef.current.length === 0) return null;

    const events = eventsRef.current;

    // Calculate level progression metrics
    const levelChanges = events.filter(e => e.type === 'content_level_change');
    const levelProgression = levelChanges.reduce((acc, event) => {
      const from = event.metadata?.previousLevel;
      const to = event.contentLevel;

      if (from && to) {
        const key = `${from}-${to}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate section metrics
    const sectionEvents = events.filter(e => e.section !== 'unknown');
    const sectionMetrics = sectionEvents.reduce((acc, event) => {
      if (!acc[event.section]) {
        acc[event.section] = {
          section: event.section,
          averageTimeSpent: 0,
          engagementRate: 0,
          preferredLevel: ContentLevel.SUMMARY,
          completionRate: 0
        };
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      levelProgression: Object.entries(levelProgression).map(([key, count]) => {
        const [from, to] = key.split('-') as [ContentLevel, ContentLevel];
        return {
          from,
          to,
          conversionRate: count / events.length,
          averageTime: 1500, // Placeholder
          dropOffRate: 0.1 // Placeholder
        };
      }),
      sectionMetrics: Object.values(sectionMetrics),
      abTestResults: AB_TEST_VARIANTS.map(variant => ({
        variant,
        sessions: events.filter(e => e.abTestVariant?.id === variant.id).length,
        engagementScore: 0.8, // Placeholder
        conversionRate: 0.15, // Placeholder
        performanceScore: 0.9, // Placeholder
        satisfactionScore: 0.85 // Placeholder
      })),
      personaInsights: []
    };
  }, []);

  const exportJourneyData = useCallback(() => {
    return [...eventsRef.current];
  }, []);

  const getABTestResults = useCallback(() => {
    const metrics = getContentMetrics();
    return metrics?.abTestResults || [];
  }, [getContentMetrics]);

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  // Auto-start session on mount
  useEffect(() => {
    startSession();

    // Auto-end session on unmount or page unload
    const handleUnload = () => endSession();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      endSession();
    };
  }, [startSession, endSession]);

  // Track viewport changes
  useEffect(() => {
    const handleResize = () => {
      trackEvent({
        type: 'scroll',
        metadata: {
          viewport: { width: window.innerWidth, height: window.innerHeight }
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [trackEvent]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: UserJourneyContextValue = {
    currentSession,
    userPersona,
    abTestVariant,
    trackEvent,
    trackContentLevelChange,
    trackInteraction,
    trackPerformance,
    trackAccessibility,
    startSession,
    endSession,
    updatePersona,
    getSessionMetrics,
    getContentMetrics,
    exportJourneyData,
    assignABTestVariant,
    getABTestResults
  };

  return (
    <UserJourneyContext.Provider value={contextValue}>
      {children}
    </UserJourneyContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useUserJourney = (): UserJourneyContextValue => {
  const context = useContext(UserJourneyContext);
  if (!context) {
    throw new Error('useUserJourney must be used within a UserJourneyProvider');
  }
  return context;
};

export default UserJourneyProvider;