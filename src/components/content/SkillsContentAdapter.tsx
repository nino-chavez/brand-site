/**
 * Skills Section Content Adapter
 *
 * Provides progressive content disclosure for the Skills section based on canvas zoom level
 * and user engagement. Implements SUMMARY → DETAILED → TECHNICAL progression with
 * category-based disclosure (Core → Specialized → Technical).
 *
 * Phase 3: Content Integration - Task 4: Skills Section Progressive Display
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useContentLevelManager } from '../../hooks/useContentLevelManager';
import { ContentLevel } from '../../types/section-content';
import type { CanvasPosition } from '../../types/canvas';
import { useContentTokens } from '../../../tokens/content-utils';

// ============================================================================
// SKILLS DATA DEFINITIONS
// ============================================================================

/**
 * Skill category with progressive disclosure levels
 */
interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  proficiency: 'Expert' | 'Proficient' | 'Developing';
  experience: string;
  category: 'core' | 'specialized' | 'technical';
  skills: {
    name: string;
    level: 'summary' | 'detailed' | 'technical';
    proficiency: 'Expert' | 'Proficient' | 'Developing';
    years?: number;
    certifications?: string[];
    projects?: string[];
    description?: string;
  }[];
}

/**
 * Complete skills database organized by progressive disclosure
 */
const SKILLS_DATABASE: SkillCategory[] = [
  // Core Skills (always visible)
  {
    id: 'architecture',
    name: 'Enterprise Architecture',
    icon: '◈',
    description: 'System design and architectural strategy',
    proficiency: 'Expert',
    experience: '15 years',
    category: 'core',
    skills: [
      {
        name: 'System Design',
        level: 'summary',
        proficiency: 'Expert',
        years: 15,
        description: 'Large-scale distributed systems'
      },
      {
        name: 'Microservices Architecture',
        level: 'detailed',
        proficiency: 'Expert',
        years: 8,
        certifications: ['AWS Solutions Architect'],
        description: 'Event-driven microservices ecosystems'
      },
      {
        name: 'Domain-Driven Design',
        level: 'detailed',
        proficiency: 'Proficient',
        years: 6,
        description: 'Strategic design patterns and bounded contexts'
      },
      {
        name: 'Event Sourcing & CQRS',
        level: 'technical',
        proficiency: 'Proficient',
        years: 4,
        projects: ['Financial Trading Platform', 'E-commerce Analytics'],
        description: 'Event-driven architecture patterns for high-throughput systems'
      },
      {
        name: 'Service Mesh & Istio',
        level: 'technical',
        proficiency: 'Proficient',
        years: 3,
        description: 'Advanced service communication and observability'
      }
    ]
  },

  // Full-Stack Development
  {
    id: 'fullstack',
    name: 'Full-Stack Development',
    icon: '◆',
    description: 'End-to-end application development',
    proficiency: 'Expert',
    experience: '18 years',
    category: 'core',
    skills: [
      {
        name: 'React/TypeScript',
        level: 'summary',
        proficiency: 'Expert',
        years: 7,
        description: 'Modern frontend development'
      },
      {
        name: 'Node.js/Express',
        level: 'summary',
        proficiency: 'Expert',
        years: 10,
        description: 'Server-side JavaScript development'
      },
      {
        name: 'Python/FastAPI',
        level: 'detailed',
        proficiency: 'Proficient',
        years: 12,
        description: 'Backend APIs and data processing'
      },
      {
        name: 'Database Design',
        level: 'detailed',
        proficiency: 'Expert',
        years: 18,
        description: 'PostgreSQL, MongoDB, Redis optimization'
      },
      {
        name: 'GraphQL & Apollo',
        level: 'technical',
        proficiency: 'Proficient',
        years: 4,
        projects: ['E-commerce Platform', 'Content Management System'],
        description: 'Federated graph architectures and schema design'
      },
      {
        name: 'WebAssembly (WASM)',
        level: 'technical',
        proficiency: 'Proficient',
        years: 2,
        description: 'High-performance web applications'
      }
    ]
  },

  // Leadership & Strategy
  {
    id: 'leadership',
    name: 'Leadership & Strategy',
    icon: '◉',
    description: 'Team leadership and technical strategy',
    proficiency: 'Proficient',
    experience: '12 years',
    category: 'specialized',
    skills: [
      {
        name: 'Team Building',
        level: 'summary',
        proficiency: 'Expert',
        years: 12,
        description: 'Building and scaling engineering teams'
      },
      {
        name: 'Technical Vision',
        level: 'detailed',
        proficiency: 'Proficient',
        years: 10,
        description: 'Strategic technology roadmaps'
      },
      {
        name: 'Stakeholder Management',
        level: 'detailed',
        proficiency: 'Proficient',
        years: 8,
        description: 'Cross-functional collaboration and communication'
      },
      {
        name: 'Engineering Culture',
        level: 'technical',
        proficiency: 'Expert',
        years: 12,
        description: 'Building high-performance engineering cultures and practices'
      }
    ]
  },

  // DevOps & Infrastructure (Specialized)
  {
    id: 'devops',
    name: 'DevOps & Infrastructure',
    icon: '▲',
    description: 'Infrastructure automation and deployment',
    proficiency: 'Proficient',
    experience: '10 years',
    category: 'specialized',
    skills: [
      {
        name: 'Kubernetes',
        level: 'summary',
        proficiency: 'Proficient',
        years: 5,
        description: 'Container orchestration'
      },
      {
        name: 'AWS/Azure',
        level: 'detailed',
        proficiency: 'Expert',
        years: 8,
        certifications: ['AWS Solutions Architect Professional'],
        description: 'Multi-cloud infrastructure design'
      },
      {
        name: 'Terraform/IaC',
        level: 'detailed',
        proficiency: 'Proficient',
        years: 6,
        description: 'Infrastructure as Code practices'
      },
      {
        name: 'Service Mesh Architecture',
        level: 'technical',
        proficiency: 'Proficient',
        years: 3,
        description: 'Istio, Envoy, and advanced networking patterns'
      }
    ]
  },

  // AI & Machine Learning (Technical)
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: '🤖',
    description: 'Artificial intelligence and machine learning',
    proficiency: 'Proficient',
    experience: '5 years',
    category: 'technical',
    skills: [
      {
        name: 'Large Language Models',
        level: 'technical',
        proficiency: 'Proficient',
        years: 2,
        description: 'LLM integration and prompt engineering'
      },
      {
        name: 'MLOps',
        level: 'detailed',
        proficiency: 'Proficient',
        years: 3,
        description: 'ML model deployment and monitoring'
      },
      {
        name: 'Agentic Development',
        level: 'technical',
        proficiency: 'Proficient',
        years: 1,
        projects: ['AI-Assisted Development Platform', 'Autonomous Code Review System'],
        description: 'Building autonomous AI systems and multi-agent workflows'
      }
    ]
  },

  // Photography & Creative (Technical)
  {
    id: 'photography',
    name: 'Action Sports Photography',
    icon: '○',
    description: 'Professional volleyball and action sports photography',
    proficiency: 'Proficient',
    experience: '8 years',
    category: 'technical',
    skills: [
      {
        name: 'Sports Photography',
        level: 'summary',
        proficiency: 'Expert',
        years: 8,
        description: 'Volleyball and action sports'
      },
      {
        name: 'Motion Analysis',
        level: 'detailed',
        proficiency: 'Proficient',
        years: 6,
        description: 'Timing and movement prediction'
      },
      {
        name: 'Visual Composition',
        level: 'technical',
        proficiency: 'Proficient',
        years: 8,
        description: 'Advanced composition techniques and visual storytelling'
      }
    ]
  }
];

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface SkillsContentAdapterProps {
  /** Current canvas position for content level calculation */
  canvasPosition?: CanvasPosition;

  /** Override content level for manual control */
  forcedLevel?: ContentLevel;

  /** Callback when user interacts with skills */
  onSkillInteraction?: (skillId: string, action: string, metadata?: any) => void;

  /** Custom CSS classes for styling */
  className?: string;

  /** Performance mode for animations */
  performanceMode?: 'high' | 'balanced' | 'low';
}

interface SkillDisplayProps {
  categories: SkillCategory[];
  level: ContentLevel;
  isTransitioning: boolean;
  onSkillInteraction?: (skillId: string, action: string, metadata?: any) => void;
  performanceMode?: 'high' | 'balanced' | 'low';
}

interface SkillCardProps {
  category: SkillCategory;
  level: ContentLevel;
  isExpanded: boolean;
  onToggle: () => void;
  onSkillClick: (skillId: string, skill: any) => void;
  performanceMode?: 'high' | 'balanced' | 'low';
}

// ============================================================================
// SKILL CARD COMPONENT
// ============================================================================

const SkillCard: React.FC<SkillCardProps> = ({
  category,
  level,
  isExpanded,
  onToggle,
  onSkillClick,
  performanceMode = 'balanced'
}) => {
  // Filter skills based on content level
  const visibleSkills = useMemo(() => {
    const maxSkills = {
      [ContentLevel.PREVIEW]: 2,
      [ContentLevel.SUMMARY]: 3,
      [ContentLevel.DETAILED]: 5,
      [ContentLevel.TECHNICAL]: category.skills.length
    };

    return category.skills
      .filter(skill => {
        if (level === ContentLevel.TECHNICAL) return true;
        if (level === ContentLevel.DETAILED) return skill.level !== 'technical';
        if (level === ContentLevel.SUMMARY) return skill.level === 'summary';
        return skill.level === 'summary';
      })
      .slice(0, maxSkills[level]);
  }, [category.skills, level]);

  const shouldShowDetails = level === ContentLevel.DETAILED || level === ContentLevel.TECHNICAL;
  const useAnimations = performanceMode !== 'low';

  return (
    <div
      className={`card-base hover-lift group p-6
        ${useAnimations ? '' : 'motion-reduce:transform-none'}
      `}
      data-testid={`skill-category-${category.id}`}
    >
      {/* Category Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gradient-violet">{category.name}</h3>
            <p className="text-sm text-white/60">{category.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Proficiency indicator */}
          <div className="text-right">
            <div className="text-sm font-mono text-white/70">{category.proficiency}%</div>
            <div className="text-xs text-white/50">{category.experience}</div>
          </div>

          {/* Expand/collapse indicator */}
          <div
            className={`transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            } text-white/50`}
          >
            ↓
          </div>
        </div>
      </div>

      {/* Proficiency bar */}
      <div className="mt-4 w-full bg-white/10 rounded-full h-2">
        <div
          className={`bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ${
            useAnimations ? 'ease-out' : ''
          }`}
          style={{ width: `${category.proficiency}%` }}
        />
      </div>

      {/* Skills list */}
      {isExpanded && (
        <div
          className={`mt-6 space-y-4 transition-all duration-300 ${
            useAnimations ? 'animate-in slide-in-from-top-2' : ''
          }`}
        >
          {visibleSkills.map((skill, index) => (
            <div
              key={skill.name}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg
                hover:bg-white/10 transition-colors cursor-pointer group/skill"
              onClick={() => onSkillClick(category.id, skill)}
              style={{
                animationDelay: useAnimations ? `${index * 100}ms` : '0ms'
              }}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{skill.name}</span>
                  <span className="text-sm font-mono text-white/60">{skill.proficiency}%</span>
                </div>

                {shouldShowDetails && skill.description && (
                  <p className="text-sm text-white/60 mt-1">{skill.description}</p>
                )}

                {level === ContentLevel.TECHNICAL && (skill.certifications || skill.projects) && (
                  <div className="mt-2 space-y-1">
                    {skill.certifications && (
                      <div className="text-xs text-green-400">
                        Certified: {skill.certifications.join(', ')}
                      </div>
                    )}
                    {skill.projects && (
                      <div className="text-xs text-blue-400">
                        Projects: {skill.projects.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Skill level indicator */}
              <div className={`ml-4 px-2 py-1 rounded text-xs font-medium
                ${skill.level === 'summary' ? 'bg-green-900/40 text-green-300' :
                  skill.level === 'detailed' ? 'bg-blue-900/40 text-blue-300' :
                  'bg-purple-900/40 text-purple-300'}
              `}>
                {skill.level.toUpperCase()}
              </div>
            </div>
          ))}

          {/* Show more indicator */}
          {visibleSkills.length < category.skills.length && (
            <div className="text-center py-2">
              <span className="text-xs text-white/50">
                +{category.skills.length - visibleSkills.length} more at higher detail levels
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SKILLS DISPLAY COMPONENT
// ============================================================================

const SkillsDisplay: React.FC<SkillDisplayProps> = ({
  categories,
  level,
  isTransitioning,
  onSkillInteraction,
  performanceMode = 'balanced'
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['architecture', 'fullstack']));

  // Get token-based styling for this content level
  const tokens = useContentTokens(level, 'frame', 'comfortable');

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });

    onSkillInteraction?.(categoryId, 'toggle', { expanded: !expandedCategories.has(categoryId) });
  }, [expandedCategories, onSkillInteraction]);

  const handleSkillClick = useCallback((categoryId: string, skill: any) => {
    onSkillInteraction?.(categoryId, 'skill_click', { skill });
  }, [onSkillInteraction]);

  // Filter categories based on content level
  const visibleCategories = useMemo(() => {
    if (level === ContentLevel.TECHNICAL) return categories;
    if (level === ContentLevel.DETAILED) return categories.filter(cat => cat.category !== 'technical');
    return categories.filter(cat => cat.category === 'core');
  }, [categories, level]);

  return (
    <div
      style={tokens.cssProperties}
      className={`transition-all ${
        isTransitioning ? tokens.transitionTokens.classNames.transitioning : tokens.transitionTokens.classNames.stable
      }`}
    >
      {/* Header with level indicator */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span
            style={tokens.styles.badge.style}
            className={tokens.styles.badge.className}
          >
            {level.toUpperCase()} LEVEL
          </span>
          <span style={{ color: 'var(--content-text)', opacity: 0.8 }}>
            {visibleCategories.length} of {categories.length} categories
          </span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Technical Expertise</h2>
        <p className="text-white/70">
          {level === ContentLevel.TECHNICAL ? 'Complete technical depth with specializations' :
           level === ContentLevel.DETAILED ? 'Core skills with specialized areas' :
           'Essential technical capabilities'}
        </p>
      </div>

      {/* Skills grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {visibleCategories.map((category, index) => (
          <SkillCard
            key={category.id}
            category={category}
            level={level}
            isExpanded={expandedCategories.has(category.id)}
            onToggle={() => handleCategoryToggle(category.id)}
            onSkillClick={handleSkillClick}
            performanceMode={performanceMode}
          />
        ))}
      </div>

      {/* Performance metrics summary */}
      {level === ContentLevel.TECHNICAL && (
        <div className="mt-8 p-6 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Skills Performance Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{categories.length}</div>
              <div className="text-sm text-white/60">Total Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {categories.reduce((sum, cat) => sum + cat.skills.length, 0)}
              </div>
              <div className="text-sm text-white/60">Total Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(categories.reduce((sum, cat) => sum + cat.proficiency, 0) / categories.length)}%
              </div>
              <div className="text-sm text-white/60">Avg Proficiency</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {categories.reduce((sum, cat) => sum + parseInt(cat.experience), 0)}+
              </div>
              <div className="text-sm text-white/60">Years Experience</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN ADAPTER COMPONENT
// ============================================================================

/**
 * Skills Content Adapter - Progressive skills disclosure
 * Integrates with canvas zoom level and user engagement tracking
 */
export const SkillsContentAdapter: React.FC<SkillsContentAdapterProps> = ({
  canvasPosition,
  forcedLevel,
  onSkillInteraction,
  className = "",
  performanceMode = 'balanced'
}) => {
  // Initialize content level manager for 'frame' section (Skills)
  const {
    currentLevel,
    previousLevel,
    isTransitioning,
    actions
  } = useContentLevelManager({
    section: 'frame', // Skills section maps to 'frame' in photography metaphor
    enableEngagementTracking: true,
    performanceMode,
    onLevelChange: (newLevel, prevLevel) => {
      console.log(`Skills section: ${prevLevel} → ${newLevel}`);
    }
  });

  // Get token-based styling for the current content level
  const tokens = useContentTokens(forcedLevel || currentLevel, 'frame', 'comfortable');

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

  // Handle skill interactions for engagement tracking
  const handleSkillInteraction = useCallback((skillId: string, action: string, metadata?: any) => {
    actions.trackInteraction({
      type: action === 'toggle' ? 'click' : action === 'skill_click' ? 'click' : 'hover',
      target: {
        type: action === 'toggle' ? 'heading' : 'skill',
        id: skillId,
        contentLevel: currentLevel
      },
      timing: {
        timestamp: Date.now()
      },
      spatial: {
        canvasPosition: canvasPosition || { x: 0, y: 0, scale: 1.0 },
        section: 'frame'
      }
    });

    onSkillInteraction?.(skillId, action, metadata);
  }, [actions, currentLevel, canvasPosition, onSkillInteraction]);

  const effectiveLevel = forcedLevel || currentLevel;

  return (
    <div className={`skills-content-adapter ${className}`}>
      <SkillsDisplay
        categories={SKILLS_DATABASE}
        level={effectiveLevel}
        isTransitioning={isTransitioning}
        onSkillInteraction={handleSkillInteraction}
        performanceMode={performanceMode}
      />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-900/50 rounded border border-gray-700/50 text-xs text-gray-400">
          <div>Current Level: {currentLevel}</div>
          {previousLevel && <div>Previous Level: {previousLevel}</div>}
          <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
          {canvasPosition && (
            <div>Canvas: scale={canvasPosition.scale.toFixed(2)}</div>
          )}
          <div>Visible Categories: {SKILLS_DATABASE.filter(cat =>
            effectiveLevel === ContentLevel.TECHNICAL ? true :
            effectiveLevel === ContentLevel.DETAILED ? cat.category !== 'technical' :
            cat.category === 'core'
          ).length} / {SKILLS_DATABASE.length}</div>
        </div>
      )}
    </div>
  );
};

export default SkillsContentAdapter;