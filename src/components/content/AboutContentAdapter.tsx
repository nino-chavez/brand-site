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
      "Built systems processing $50B+ in annual transactions for Fortune 500 retailers—architectures that survived 15+ Black Friday events without outages."
    ],
    skills: ["Enterprise Architecture", "Technical Leadership", "Systems Thinking"],
    readingTime: "30 sec"
  },
  [ContentLevel.SUMMARY]: {
    title: "Finding the Signal in the Noise",
    summary: "26 years building systems that serve 50M+ users daily",
    paragraphs: [
      "I'm Nino Chavez. I build systems that process billions in transactions for Fortune 500 retailers—omnichannel commerce platforms, event-driven order orchestration, real-time inventory systems that enable same-day delivery without increasing infrastructure costs.",
      "I don't delegate the thinking. While others chase the spotlight—the shiny new framework, the trending pattern—I focus on the stage: the entire system of ownership, scope, and second-order effects where ideas must actually live."
    ],
    skills: [
      "Enterprise Architecture",
      "E-Commerce Platforms at Scale",
      "Multi-Cloud Infrastructure",
      "AI Governance Frameworks",
      "Decision Hygiene"
    ],
    readingTime: "1 min"
  },
  [ContentLevel.DETAILED]: {
    title: "Finding the Signal in the Noise",
    summary: "26 years architecting commerce systems serving 50M+ users",
    paragraphs: [
      "I'm Nino Chavez. I build multi-tenant commerce platforms processing $2B+ annual GMV for Fortune 500 retailers—architectures that survived 10x Black Friday traffic spikes without service interruption.",
      "Built event-driven order orchestration systems replacing 15-year legacy monoliths—migrated 50M active users with zero downtime. Designed real-time inventory systems serving 12 brands across 2,000+ stores, enabling same-day delivery capabilities without infrastructure cost increases.",
      "My specialty is \"reading the road\"—identifying patterns others miss. I provide clarity when executives can't see the path forward, translating technical complexity into strategic decisions. I practice rigorous decision hygiene: understanding the full operational context before making a move.",
      "Leadership, for me, is \"living in the gap\"—holding the long-term vision while remaining present with the team's reality. I coach without coddling, empower teams with autonomy and clear guardrails, and arrive not just fast, but together."
    ],
    skills: [
      "Multi-Tenant Commerce Platforms ($2B+ GMV)",
      "Event-Driven Order Orchestration",
      "Real-Time Inventory Systems (2,000+ stores)",
      "Zero-Downtime Migration (50M+ users)",
      "AI Governance Frameworks",
      "Technical Leadership (100+ person teams)",
      "Pattern Recognition & Strategic Translation",
      "Decision Hygiene & Systems Thinking"
    ],
    readingTime: "2 min"
  },
  [ContentLevel.TECHNICAL]: {
    title: "Finding the Signal in the Noise",
    summary: "Architect specializing in resilient commerce systems at scale",
    paragraphs: [
      "I'm Nino Chavez. 26 years architecting systems serving 50M+ users daily, processing $50B+ in annual transactions. I build fault-tolerant, observable systems using cloud-native patterns and event-driven architectures.",
      "Recent artifacts: Reduced cloud infrastructure costs 40% while improving performance for a Fortune 500 retailer—re-architected data pipelines and compute allocation. Built AI governance frameworks for regulated commerce platforms that enforce verification boundaries between model outputs and business logic execution. Designed event-driven order orchestration replacing SAP monoliths—zero service interruption during 18-month migration.",
      "My approach focuses on second-order effects and decision hygiene. I don't chase trends—I ask foundational questions: Who checks the foundation? What's the entire stage this idea must live on? How do we build systems that enable people to thrive, not just survive?",
      "On AI: Infrastructure, not magic. Most organizations bolt AI onto incompatible architectures, creating compliance risk and technical debt. I design verification boundaries that enforce model reliability before business logic execution—governance patterns that make AI production-ready in regulated environments.",
      "My action sports photography practice honed precision under pressure. Capturing a perfect volleyball spike at 1/2000th of a second requires the same discipline as designing systems that can't fail. Both demand knowing exactly where to focus when milliseconds matter."
    ],
    skills: [
      "Commerce Platforms ($50B+ annual transactions)",
      "Event-Driven Architecture & Order Orchestration",
      "Multi-Cloud Infrastructure (AWS, Azure, GCP)",
      "AI Governance & Verification Boundaries",
      "Fault-Tolerant, Observable Systems",
      "Zero-Downtime Legacy Migration",
      "Cost Optimization at Scale (40%+ reductions)",
      "Real-Time Inventory & Fulfillment Systems",
      "Strategic Technical Translation",
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