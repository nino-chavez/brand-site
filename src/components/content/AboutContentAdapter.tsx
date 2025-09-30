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
    title: "About Me",
    summary: "Enterprise Architect & AI Developer",
    paragraphs: [
      "Building scalable systems and exploring AI frontiers."
    ],
    skills: ["Architecture", "AI", "Photography"],
    readingTime: "30 sec"
  },
  [ContentLevel.SUMMARY]: {
    title: "About Me",
    summary: "Enterprise Architect, Managing Consultant & AI Developer",
    paragraphs: [
      "I'm an Enterprise Architect and Managing Consultant with a passion for software engineering. I help businesses navigate complex digital transformations through strategic thinking and hands-on implementation.",
      "Beyond code, I'm an action sports photographer specializing in volleyball, bringing creative perspective to technical work."
    ],
    skills: [
      "Enterprise Architecture",
      "Digital Transformation",
      "Generative AI",
      "Action Sports Photography",
      "Software Engineering"
    ],
    readingTime: "1 min"
  },
  [ContentLevel.DETAILED]: {
    title: "About Me",
    summary: "Enterprise Architect, Managing Consultant & Generative AI Developer",
    paragraphs: [
      "I'm an Enterprise Architect and Managing Consultant with a deep-rooted passion for software engineering. My career is a blend of high-level strategic thinking and hands-on technical implementation, helping businesses navigate complex digital transformations. I thrive on architecting scalable, resilient systems that drive innovation.",
      "Beyond the world of code and cloud, I'm an avid action sports photographer, specializing in volleyball. This creative outlet sharpens my eye for detail and timing, skills that surprisingly translate back to my technical work. Capturing the peak of the action is a challenge I relish.",
      "Recently, I've dived headfirst into the realm of Generative AI, applying agentic development principles to build smarter, more autonomous software. This website is a testament to that exploration, a launchpad for both my professional and creative endeavors."
    ],
    skills: [
      "Enterprise Architecture & Strategy",
      "Cloud-Native System Design",
      "Digital Transformation Leadership",
      "Generative AI & Agentic Development",
      "Software Engineering Excellence",
      "Action Sports Photography",
      "Technical Consulting & Management"
    ],
    readingTime: "2 min"
  },
  [ContentLevel.TECHNICAL]: {
    title: "About Me - Technical Deep Dive",
    summary: "Enterprise Architect, Managing Consultant & AI Research Developer",
    paragraphs: [
      "I'm an Enterprise Architect and Managing Consultant with a deep-rooted passion for software engineering. My career spans architecting microservices ecosystems, implementing event-driven architectures, and leading digital transformation initiatives across Fortune 500 companies. I specialize in designing fault-tolerant, observable systems using cloud-native patterns and DevOps methodologies.",
      "My action sports photography practice, particularly in volleyball, has developed my understanding of motion dynamics, timing precision, and visual composition. This translates directly to my technical work through improved system timing analysis, performance optimization, and user experience design. The discipline required to capture millisecond-perfect moments parallels the precision needed in distributed system design.",
      "My current focus is on Generative AI and agentic development, where I'm exploring autonomous system architectures, LLM integration patterns, and AI-assisted development workflows. This website showcases advanced prompt engineering, multi-agent systems, and reactive UI patterns. I'm particularly interested in the intersection of traditional enterprise architecture and AI-driven automation.",
      "Technical specializations include TypeScript/React ecosystems, Python AI/ML pipelines, cloud infrastructure (AWS/Azure), containerization strategies, and modern CI/CD practices. I'm also exploring edge computing, real-time data processing, and the emerging field of AI operations (AIOps)."
    ],
    skills: [
      "Enterprise Architecture & Microservices Design",
      "Cloud Infrastructure & DevOps (AWS, Azure, Kubernetes)",
      "Generative AI & Large Language Model Integration",
      "Event-Driven Architecture & Real-Time Systems",
      "TypeScript/React & Full-Stack Development",
      "Python AI/ML Pipeline Development",
      "Digital Transformation & Technology Strategy",
      "Action Sports Photography & Motion Analysis",
      "Performance Engineering & System Optimization",
      "Distributed Systems & Fault Tolerance Design"
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