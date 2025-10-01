/**
 * About Section Content Adapter
 *
 * Provides progressive content disclosure for the About section based on canvas zoom level
 * and user engagement. Implements PREVIEW → SUMMARY → DETAILED progression with
 * photography metaphor integration.
 *
 * Phase 3: Content Integration - Task 3: About Section Content Adapter
 */

import React, { useMemo } from 'react';
import { useContentLevelManager } from '../../hooks/useContentLevelManager';
import { ContentLevel } from '../../types/section-content';
import type { CanvasPosition } from '../../types/canvas';
import { useContentTokens } from '../../../tokens/content-utils';

// ============================================================================
// CONTENT DEFINITIONS
// ============================================================================

/**
 * About section content organized by content level
 * Each level builds upon the previous, providing progressive disclosure
 */
const ABOUT_CONTENT = {
  [ContentLevel.PREVIEW]: {
    title: "Finding the Signal in the Noise",
    summary: "Enterprise Architect & Technical Leader",
    paragraphs: [
      "Transforming complex business challenges into elegant, scalable solutions serving millions."
    ],
    skills: ["Enterprise Architecture", "Technical Leadership", "Systems Thinking"],
    readingTime: "30 sec"
  },
  [ContentLevel.SUMMARY]: {
    title: "Finding the Signal in the Noise",
    summary: "Enterprise Architect & Technical Leader",
    paragraphs: [
      "I'm Nino Chavez, an Enterprise Architect who transforms complex business challenges into elegant, scalable solutions serving millions of users daily.",
      "I don't delegate the thinking. While others chase the spotlight—the shiny new framework, the trending pattern—I focus on the stage: the entire system of ownership, scope, and second-order effects where ideas must actually live."
    ],
    skills: [
      "Enterprise Architecture",
      "Technical Leadership",
      "Multi-Cloud Platforms",
      "AI Governance",
      "Decision Hygiene"
    ],
    readingTime: "1 min"
  },
  [ContentLevel.DETAILED]: {
    title: "Finding the Signal in the Noise",
    summary: "20+ years architecting enterprise systems serving 50M+ users",
    paragraphs: [
      "I'm Nino Chavez, an Enterprise Architect and Technical Leader who transforms complex business challenges into elegant, scalable solutions that serve millions of users daily.",
      "I architect resilient systems that enable people and businesses to thrive. From leading 100+ person engineering teams to migrating Fortune 500 legacy infrastructure to multi-cloud platforms, my value lies in providing clarity when the stakes are high and the path forward isn't obvious.",
      "My specialty is \"reading the road\"—identifying patterns others miss and translating complex technical concepts into clear, strategic language that executives can act on. I practice rigorous decision hygiene: understanding the full operational context before making a move.",
      "Leadership, for me, is \"living in the gap\"—holding the long-term vision while remaining present with the team's reality. I coach without coddling, empower teams with autonomy and clear guardrails, and arrive not just fast, but together."
    ],
    skills: [
      "Enterprise Architecture & Strategy",
      "Fortune 500 Digital Transformation",
      "Multi-Cloud Infrastructure Migration",
      "AI Governance Frameworks",
      "Technical Leadership (100+ Teams)",
      "Pattern Recognition & Translation",
      "Decision Hygiene & Systems Thinking",
      "Event-Driven Architecture"
    ],
    readingTime: "2 min"
  },
  [ContentLevel.TECHNICAL]: {
    title: "Finding the Signal in the Noise - Technical Deep Dive",
    summary: "Enterprise Architect specializing in resilient, observable systems at scale",
    paragraphs: [
      "I'm Nino Chavez, an Enterprise Architect with 20+ years architecting systems serving 50M+ users daily. I specialize in transforming complex business challenges into fault-tolerant, observable systems using cloud-native patterns and event-driven architectures.",
      "Recent engagements: Reduced cloud infrastructure costs 40% while improving performance for a Fortune 500 retailer. Designed AI governance frameworks for regulated industries. Migrated legacy monoliths to event-driven architectures without service interruption.",
      "My approach focuses on second-order effects and decision hygiene. I don't chase trends—I ask foundational questions: Who checks the foundation? What's the entire stage this idea must live on? How do we build systems that enable people to thrive, not just survive?",
      "On AI: Infrastructure, not magic. While others debate whether AI will replace developers, I'm building the governance and architecture patterns that make AI reliable in production. The human role has evolved from coder to architect, from syntax to systems.",
      "My action sports photography practice has honed precision under pressure. Capturing a perfect volleyball spike at 1/2000th of a second requires the same discipline as designing systems that can't fail. Both demand knowing exactly where to focus when milliseconds matter."
    ],
    skills: [
      "Enterprise Architecture & Microservices Design",
      "Event-Driven Architecture & Real-Time Systems",
      "Multi-Cloud Infrastructure (AWS, Azure, GCP)",
      "AI Governance & Production Reliability Patterns",
      "Fault-Tolerant, Observable Systems Design",
      "Technical Leadership & Team Transformation",
      "Cost Optimization at Scale (40%+ reductions)",
      "Legacy Migration Without Service Interruption",
      "Strategic Technical Translation for Executives",
      "Decision Hygiene & Systems Thinking"
    ],
    readingTime: "3 min"
  }
} as const;

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface AboutContentAdapterProps {
  /** Current canvas position for content level calculation */
  canvasPosition?: CanvasPosition;

  /** Override content level for manual control */
  forcedLevel?: ContentLevel;

  /** Callback when user interacts with content */
  onInteraction?: (element: string, action: string) => void;

  /** Custom CSS classes for styling */
  className?: string;
}

interface ContentDisplayProps {
  content: typeof ABOUT_CONTENT[ContentLevel];
  level: ContentLevel;
  isTransitioning: boolean;
  onInteraction?: (element: string, action: string) => void;
}

// ============================================================================
// CONTENT DISPLAY COMPONENT
// ============================================================================

/**
 * Renders content for a specific level with appropriate styling and transitions
 */
const ContentDisplay: React.FC<ContentDisplayProps> = ({
  content,
  level,
  isTransitioning,
  onInteraction
}) => {
  const handleInteraction = (element: string, action: string) => {
    onInteraction?.(element, action);
  };

  // Get token-based styling for this content level
  const tokens = useContentTokens(level, 'focus', 'comfortable');

  return (
    <div
      style={tokens.cssProperties}
      className={`transition-all ${
        isTransitioning ? tokens.transitionTokens.classNames.transitioning : tokens.transitionTokens.classNames.stable
      }`}
    >
      {/* Title with level indicator */}
      <div className="mb-6">
        <h2
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          onClick={() => handleInteraction('title', 'click')}
        >
          {content.title}
        </h2>
        <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--content-text)' }}>
          <span
            style={tokens.styles.badge.style}
            className={tokens.styles.badge.className}
          >
            {level.toUpperCase()}
          </span>
          <span>{content.readingTime}</span>
          <span style={{ color: 'var(--section-accent)' }}>{content.summary}</span>
        </div>
      </div>

      {/* Content paragraphs */}
      <div className="space-y-6 text-lg text-gray-300 leading-relaxed mb-8">
        {content.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="transition-all duration-300 hover:text-gray-200 cursor-pointer"
            onClick={() => handleInteraction(`paragraph-${index}`, 'click')}
            onMouseEnter={() => handleInteraction(`paragraph-${index}`, 'hover')}
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Skills section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          {level === ContentLevel.PREVIEW ? 'Focus Areas' :
           level === ContentLevel.SUMMARY ? 'Core Expertise' :
           level === ContentLevel.DETAILED ? 'Professional Skills' :
           'Technical Specializations'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {content.skills.map((skill, index) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-full text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: 'var(--content-bg)',
                borderColor: 'var(--content-border)',
                color: 'var(--content-text)',
                border: '1px solid',
                transition: `all var(--timing-reaction) var(--easing-snap)`,
                animationDelay: `${index * 50}ms`
              }}
              onClick={() => handleInteraction(`skill-${skill}`, 'click')}
              onMouseEnter={() => handleInteraction(`skill-${skill}`, 'hover')}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--content-bg)';
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--content-accent)';
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN ADAPTER COMPONENT
// ============================================================================

/**
 * About Content Adapter - Progressive content disclosure for About section
 * Integrates with canvas zoom level and user engagement tracking
 */
export const AboutContentAdapter: React.FC<AboutContentAdapterProps> = ({
  canvasPosition,
  forcedLevel,
  onInteraction,
  className = ""
}) => {
  // Initialize content level manager for 'focus' section (About)
  const {
    currentLevel,
    previousLevel,
    isTransitioning,
    actions
  } = useContentLevelManager({
    section: 'focus', // About section maps to 'focus' in photography metaphor
    enableEngagementTracking: true,
    performanceMode: 'balanced',
    onLevelChange: (newLevel, prevLevel) => {
      console.log(`About section: ${prevLevel} → ${newLevel}`);
    }
  });

  // Get token-based styling for the current content level
  const tokens = useContentTokens(forcedLevel || currentLevel, 'focus', 'comfortable');

  // Update content level based on canvas position
  React.useEffect(() => {
    if (canvasPosition) {
      actions.updateCanvasPosition(canvasPosition);
    }
  }, [canvasPosition, actions]);

  // Handle forced level override
  React.useEffect(() => {
    if (forcedLevel && forcedLevel !== currentLevel) {
      actions.setContentLevel(forcedLevel);
    }
  }, [forcedLevel, currentLevel, actions]);

  // Handle user interactions for engagement tracking
  const handleInteraction = (element: string, action: string) => {
    actions.trackInteraction({
      type: action === 'click' ? 'click' : 'hover',
      target: {
        type: element.startsWith('skill-') ? 'skill' :
              element.startsWith('paragraph-') ? 'body' : 'heading',
        id: element,
        contentLevel: currentLevel
      },
      timing: {
        timestamp: Date.now()
      },
      spatial: {
        canvasPosition: canvasPosition || { x: 0, y: 0, scale: 1.0 },
        section: 'focus'
      }
    });

    onInteraction?.(element, action);
  };

  // Get content for current level
  const content = useMemo(() => {
    const effectiveLevel = forcedLevel || currentLevel;
    return ABOUT_CONTENT[effectiveLevel];
  }, [currentLevel, forcedLevel]);

  return (
    <div
      className={`about-content-adapter ${className}`}
      style={tokens.cssProperties}
    >
      <ContentDisplay
        content={content}
        level={forcedLevel || currentLevel}
        isTransitioning={isTransitioning}
        onInteraction={handleInteraction}
      />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="mt-8 p-4 rounded border text-xs"
          style={{
            backgroundColor: 'var(--content-bg)',
            borderColor: 'var(--content-border)',
            color: 'var(--content-text)',
            opacity: 0.7
          }}
        >
          <div>Current Level: {currentLevel}</div>
          {previousLevel && <div>Previous Level: {previousLevel}</div>}
          <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
          <div>Athletic Tokens: Integrated ✅</div>
          {canvasPosition && (
            <div>Canvas: scale={canvasPosition.scale.toFixed(2)}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AboutContentAdapter;