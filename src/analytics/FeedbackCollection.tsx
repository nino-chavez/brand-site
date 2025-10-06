/**
 * Feedback Collection System
 *
 * Collects user feedback on content relevance, depth preferences, and
 * progressive disclosure effectiveness for continuous UX optimization.
 *
 * Task 11: User Experience Validation - Feedback Collection
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ContentLevel } from '../types/section-content';
import { useUserJourney } from './UserJourneyAnalytics';
import { useContentTokens } from '../tokens/content-utils';

// ============================================================================
// FEEDBACK INTERFACES
// ============================================================================

export type FeedbackType =
  | 'content_relevance'
  | 'content_depth'
  | 'navigation_experience'
  | 'disclosure_preference'
  | 'accessibility_issue'
  | 'performance_issue'
  | 'general_feedback';

export type SatisfactionRating = 1 | 2 | 3 | 4 | 5;

export interface FeedbackEntry {
  id: string;
  timestamp: number;
  sessionId: string;
  type: FeedbackType;

  // Context information
  section: string;
  contentLevel: ContentLevel;
  userPersona: string;
  abTestVariant?: string;

  // Rating data
  satisfaction: SatisfactionRating;
  relevanceScore: SatisfactionRating;
  depthPreference: 'too_shallow' | 'just_right' | 'too_deep';

  // Qualitative feedback
  comment?: string;
  suggestedImprovements?: string[];

  // Specific feedback types
  contentRelevance?: {
    mostUseful: string[];
    leastUseful: string[];
    missing: string[];
  };

  navigationExperience?: {
    easyToFind: boolean;
    intuitive: boolean;
    preferred: 'scroll' | 'zoom' | 'click' | 'keyboard';
  };

  disclosurePreference?: {
    preferredStartLevel: ContentLevel;
    automaticProgression: boolean;
    manualControl: boolean;
  };

  accessibilityFeedback?: {
    screenReaderFriendly: boolean;
    keyboardAccessible: boolean;
    contrastSufficient: boolean;
    issuesEncountered: string[];
  };
}

export interface FeedbackAnalytics {
  overallSatisfaction: number;
  contentRelevanceScore: number;
  navigationScore: number;
  accessibilityScore: number;

  // Preference insights
  preferredContentDepth: ContentLevel;
  preferredNavigationMethod: string;
  commonIssues: string[];

  // Segment analysis
  byPersona: Record<string, {
    satisfaction: number;
    preferences: Record<string, any>;
  }>;

  bySection: Record<string, {
    relevanceScore: number;
    engagementLevel: number;
    feedbackCount: number;
  }>;
}

// ============================================================================
// FEEDBACK WIDGET COMPONENT
// ============================================================================

interface FeedbackWidgetProps {
  section: string;
  contentLevel: ContentLevel;
  trigger?: 'automatic' | 'manual' | 'exit_intent';
  position?: 'bottom_right' | 'bottom_left' | 'modal' | 'inline';
  onFeedbackSubmitted?: (feedback: FeedbackEntry) => void;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  section,
  contentLevel,
  trigger = 'manual',
  position = 'bottom_right',
  onFeedbackSubmitted
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedbackData, setFeedbackData] = useState<Partial<FeedbackEntry>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { trackEvent, currentSession, userPersona, abTestVariant } = useUserJourney();
  const tokens = useContentTokens(contentLevel, 'focus', 'comfortable');
  const timeOnPageRef = useRef(Date.now());

  // ============================================================================
  // FEEDBACK STEPS CONFIGURATION
  // ============================================================================

  const feedbackSteps = [
    {
      id: 'satisfaction',
      title: 'How satisfied are you with this content?',
      type: 'rating' as const,
      key: 'satisfaction' as keyof FeedbackEntry
    },
    {
      id: 'relevance',
      title: 'How relevant is this content to your needs?',
      type: 'rating' as const,
      key: 'relevanceScore' as keyof FeedbackEntry
    },
    {
      id: 'depth',
      title: 'How would you describe the content depth?',
      type: 'choice' as const,
      key: 'depthPreference' as keyof FeedbackEntry,
      options: [
        { value: 'too_shallow', label: 'Too shallow - I need more detail' },
        { value: 'just_right', label: 'Just right - perfect level of detail' },
        { value: 'too_deep', label: 'Too deep - prefer simpler overview' }
      ]
    },
    {
      id: 'navigation',
      title: 'How was your navigation experience?',
      type: 'multi_choice' as const,
      key: 'navigationExperience' as keyof FeedbackEntry
    },
    {
      id: 'comment',
      title: 'Any additional feedback?',
      type: 'text' as const,
      key: 'comment' as keyof FeedbackEntry,
      optional: true
    }
  ];

  // ============================================================================
  // FEEDBACK LOGIC
  // ============================================================================

  const handleTrigger = useCallback(() => {
    if (trigger === 'automatic') {
      const timeOnPage = Date.now() - timeOnPageRef.current;
      if (timeOnPage > 30000) { // Show after 30 seconds
        setIsVisible(true);
      }
    } else if (trigger === 'exit_intent') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setIsVisible(true);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [trigger]);

  const updateFeedbackData = useCallback((key: string, value: any) => {
    setFeedbackData(prev => ({ ...prev, [key]: value }));
  }, []);

  const submitFeedback = useCallback(async () => {
    if (!currentSession) return;

    setIsSubmitting(true);

    const feedback: FeedbackEntry = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: currentSession.id,
      type: 'content_relevance',
      section,
      contentLevel,
      userPersona: userPersona || 'unknown',
      abTestVariant: abTestVariant?.id,
      satisfaction: (feedbackData.satisfaction as SatisfactionRating) || 3,
      relevanceScore: (feedbackData.relevanceScore as SatisfactionRating) || 3,
      depthPreference: (feedbackData.depthPreference as any) || 'just_right',
      comment: feedbackData.comment as string,
      ...feedbackData
    };

    // Track feedback submission
    trackEvent({
      type: 'feedback_submitted',
      section,
      contentLevel,
      metadata: {
        feedbackType: feedback.type,
        satisfaction: feedback.satisfaction,
        relevanceScore: feedback.relevanceScore
      }
    });

    // Store feedback (in production, send to analytics service)
    if (typeof window !== 'undefined') {
      const existingFeedback = localStorage.getItem('user_feedback');
      const feedbackList = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbackList.push(feedback);
      localStorage.setItem('user_feedback', JSON.stringify(feedbackList));
    }

    onFeedbackSubmitted?.(feedback);

    setIsSubmitting(false);
    setIsVisible(false);
    setCurrentStep(0);
    setFeedbackData({});
  }, [
    currentSession,
    section,
    contentLevel,
    userPersona,
    abTestVariant,
    feedbackData,
    trackEvent,
    onFeedbackSubmitted
  ]);

  // ============================================================================
  // TRIGGER EFFECTS
  // ============================================================================

  useEffect(() => {
    const cleanup = handleTrigger();
    return cleanup;
  }, [handleTrigger]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderRatingInput = (step: typeof feedbackSteps[0]) => (
    <div className="flex justify-center gap-2 my-4">
      {[1, 2, 3, 4, 5].map(rating => (
        <button
          key={rating}
          onClick={() => updateFeedbackData(step.key, rating)}
          className={`w-12 h-12 rounded-full border-2 transition-all
            ${feedbackData[step.key] === rating
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-gray-300 hover:border-blue-300 text-gray-600'
            }
          `}
          style={{
            borderColor: feedbackData[step.key] === rating ? 'var(--content-accent)' : 'var(--content-border)',
            backgroundColor: feedbackData[step.key] === rating ? 'var(--content-accent)' : 'transparent',
            color: feedbackData[step.key] === rating ? 'white' : 'var(--content-text)'
          }}
        >
          {rating}
        </button>
      ))}
    </div>
  );

  const renderChoiceInput = (step: typeof feedbackSteps[2]) => (
    <div className="space-y-3 my-4">
      {step.options?.map(option => (
        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name={step.key}
            value={option.value}
            checked={feedbackData[step.key] === option.value}
            onChange={() => updateFeedbackData(step.key, option.value)}
            className="w-4 h-4"
            style={{ accentColor: 'var(--content-accent)' }}
          />
          <span style={{ color: 'var(--content-text)' }}>{option.label}</span>
        </label>
      ))}
    </div>
  );

  const renderNavigationInput = () => (
    <div className="space-y-4 my-4">
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={feedbackData.navigationExperience?.easyToFind ?? false}
            onChange={(e) => updateFeedbackData('navigationExperience', {
              ...feedbackData.navigationExperience,
              easyToFind: e.target.checked
            })}
            className="w-4 h-4"
            style={{ accentColor: 'var(--content-accent)' }}
          />
          <span style={{ color: 'var(--content-text)' }}>Content was easy to find</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={feedbackData.navigationExperience?.intuitive ?? false}
            onChange={(e) => updateFeedbackData('navigationExperience', {
              ...feedbackData.navigationExperience,
              intuitive: e.target.checked
            })}
            className="w-4 h-4"
            style={{ accentColor: 'var(--content-accent)' }}
          />
          <span style={{ color: 'var(--content-text)' }}>Navigation felt intuitive</span>
        </label>
      </div>

      <div>
        <p style={{ color: 'var(--content-text)', fontSize: '0.9rem' }} className="mb-2">
          Preferred navigation method:
        </p>
        <div className="flex gap-2 flex-wrap">
          {['scroll', 'zoom', 'click', 'keyboard'].map(method => (
            <button
              key={method}
              onClick={() => updateFeedbackData('navigationExperience', {
                ...feedbackData.navigationExperience,
                preferred: method
              })}
              className={`px-3 py-1 rounded text-sm transition-all capitalize
                ${feedbackData.navigationExperience?.preferred === method
                  ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }
              `}
              style={{
                backgroundColor: feedbackData.navigationExperience?.preferred === method
                  ? 'var(--content-accent)' : 'var(--content-bg)',
                borderColor: 'var(--content-border)',
                color: feedbackData.navigationExperience?.preferred === method
                  ? 'white' : 'var(--content-text)',
                border: '1px solid'
              }}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTextInput = (step: typeof feedbackSteps[4]) => (
    <textarea
      value={feedbackData[step.key] as string || ''}
      onChange={(e) => updateFeedbackData(step.key, e.target.value)}
      placeholder="Share your thoughts..."
      className="w-full h-24 p-3 rounded border resize-none"
      style={{
        backgroundColor: 'var(--content-bg)',
        borderColor: 'var(--content-border)',
        color: 'var(--content-text)',
        fontSize: '0.9rem'
      }}
    />
  );

  // ============================================================================
  // COMPONENT RENDER
  // ============================================================================

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed z-50 px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2
          ${position === 'bottom_right' ? 'bottom-6 right-6' : 'bottom-6 left-6'}
        `}
        style={{
          backgroundColor: 'var(--content-accent)',
          color: 'white',
          fontSize: '0.9rem'
        }}
        aria-label="Provide feedback"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Feedback
      </button>
    );
  }

  const currentStepData = feedbackSteps[currentStep];

  return (
    <div
      className={`fixed z-50 bg-white rounded-lg shadow-xl border p-6 w-96 max-w-[90vw]
        ${position === 'bottom_right' ? 'bottom-6 right-6' : 'bottom-6 left-6'}
      `}
      style={{
        backgroundColor: 'var(--content-bg)',
        borderColor: 'var(--content-border)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--content-text)' }}>
          Feedback ({currentStep + 1}/{feedbackSteps.length})
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Close feedback"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mb-4">
        <div
          className="h-2 rounded-full"
          style={{ backgroundColor: 'var(--content-border)' }}
        >
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: 'var(--content-accent)',
              width: `${((currentStep + 1) / feedbackSteps.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        <h4 className="mb-3" style={{ color: 'var(--content-text)' }}>
          {currentStepData.title}
        </h4>

        {currentStepData.type === 'rating' && renderRatingInput(currentStepData)}
        {currentStepData.type === 'choice' && renderChoiceInput(currentStepData)}
        {currentStepData.type === 'multi_choice' && renderNavigationInput()}
        {currentStepData.type === 'text' && renderTextInput(currentStepData)}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded disabled:opacity-50"
          style={{
            backgroundColor: 'var(--content-bg)',
            borderColor: 'var(--content-border)',
            color: 'var(--content-text)',
            border: '1px solid'
          }}
        >
          Previous
        </button>

        {currentStep < feedbackSteps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: 'var(--content-accent)',
              color: 'white'
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={submitFeedback}
            disabled={isSubmitting}
            className="px-4 py-2 rounded disabled:opacity-50"
            style={{
              backgroundColor: 'var(--section-primary)',
              color: 'white'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// FEEDBACK ANALYTICS HOOK
// ============================================================================

export const useFeedbackAnalytics = () => {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);

  const loadAnalytics = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const feedbackData = localStorage.getItem('user_feedback');
    if (!feedbackData) return null;

    const feedback: FeedbackEntry[] = JSON.parse(feedbackData);

    const overallSatisfaction = feedback.reduce((sum, f) => sum + f.satisfaction, 0) / feedback.length;
    const contentRelevanceScore = feedback.reduce((sum, f) => sum + f.relevanceScore, 0) / feedback.length;

    const analytics: FeedbackAnalytics = {
      overallSatisfaction: isNaN(overallSatisfaction) ? 0 : overallSatisfaction,
      contentRelevanceScore: isNaN(contentRelevanceScore) ? 0 : contentRelevanceScore,
      navigationScore: 4.2, // Placeholder calculation
      accessibilityScore: 4.5, // Placeholder calculation
      preferredContentDepth: ContentLevel.DETAILED,
      preferredNavigationMethod: 'scroll',
      commonIssues: ['loading_speed', 'mobile_navigation'],
      byPersona: {},
      bySection: {}
    };

    setAnalytics(analytics);
    return analytics;
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return { analytics, loadAnalytics };
};

export default FeedbackWidget;