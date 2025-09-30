/**
 * Experience Section Content Adapter
 *
 * Provides progressive content disclosure for the Experience section based on canvas zoom level,
 * user engagement, and viewer context signals. Implements role-based content optimization with
 * SUMMARY → DETAILED → TECHNICAL progression and A/B testing framework.
 *
 * Phase 3: Content Integration - Task 5: Experience Section Adaptive Content
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useContentLevelManager } from '../../hooks/useContentLevelManager';
import { ContentLevel } from '../../types/section-content';
import type { CanvasPosition } from '../../types/canvas';

// ============================================================================
// EXPERIENCE DATA DEFINITIONS
// ============================================================================

/**
 * Professional role with progressive disclosure levels
 */
interface ExperienceRole {
  id: string;
  company: string;
  title: string;
  department?: string;
  startDate: string;
  endDate: string | 'Present';
  location: string;
  companySize: string;
  industry: string;

  // Progressive content by level
  summary: {
    overview: string;
    keyAchievements: string[];
    technologies: string[];
  };

  detailed: {
    responsibilities: string[];
    majorProjects: {
      name: string;
      description: string;
      impact: string;
      technologies: string[];
    }[];
    teamStructure: {
      directReports: number;
      totalTeamSize: number;
      crossFunctionalTeams: string[];
    };
    businessImpact: {
      metric: string;
      value: string;
      description: string;
    }[];
  };

  technical: {
    architecturalDecisions: {
      challenge: string;
      solution: string;
      outcome: string;
      technologies: string[];
    }[];
    technicalLeadership: {
      initiative: string;
      scope: string;
      results: string;
    }[];
    innovationContributions: {
      area: string;
      contribution: string;
      adoption: string;
    }[];
    certifications?: string[];
    publications?: string[];
  };
}

/**
 * Viewer context signals for content adaptation
 */
interface ViewerContext {
  role?: 'technical' | 'business' | 'leadership' | 'mixed';
  interests?: ('architecture' | 'leadership' | 'innovation' | 'results')[];
  engagementPattern?: 'deep_dive' | 'overview' | 'scanning';
  timeSpent?: number;
}

/**
 * A/B test variant configuration
 */
interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  contentStrategy: 'chronological' | 'impact_first' | 'skills_focused' | 'narrative_driven';
  emphasisOn: 'achievements' | 'technical_depth' | 'leadership' | 'innovation';
}

/**
 * Professional experience database
 */
const EXPERIENCE_DATABASE: ExperienceRole[] = [
  {
    id: 'managing-consultant-current',
    company: 'Independent Technology Consulting',
    title: 'Managing Consultant & Enterprise Architect',
    startDate: '2021',
    endDate: 'Present',
    location: 'Remote / San Francisco Bay Area',
    companySize: 'Independent Practice',
    industry: 'Technology Consulting',

    summary: {
      overview: 'Leading enterprise digital transformation initiatives for Fortune 500 companies, specializing in cloud architecture, team scaling, and AI integration.',
      keyAchievements: [
        'Led 15+ enterprise transformation projects with $10M+ combined budget',
        'Scaled engineering teams from 20 to 100+ developers across 8 projects',
        'Achieved 99.7% average system uptime across all client implementations'
      ],
      technologies: ['AWS', 'Kubernetes', 'React', 'Python', 'Microservices', 'AI/ML']
    },

    detailed: {
      responsibilities: [
        'Strategic technology roadmap development for C-level executives',
        'Enterprise architecture design and implementation oversight',
        'Engineering team recruitment, scaling, and performance optimization',
        'Cross-functional stakeholder management and client relationship development',
        'Technical due diligence for M&A activities and technology investments'
      ],
      majorProjects: [
        {
          name: 'Financial Services Platform Modernization',
          description: 'Led complete legacy system modernization for $2B fintech company',
          impact: '40% cost reduction, 10x performance improvement, zero downtime migration',
          technologies: ['Microservices', 'Event Sourcing', 'Kubernetes', 'PostgreSQL', 'React']
        },
        {
          name: 'AI-Powered Analytics Platform',
          description: 'Architected real-time analytics platform processing 100TB+ daily',
          impact: 'Enabled real-time decision making, 60% faster insights generation',
          technologies: ['Apache Kafka', 'TensorFlow', 'BigQuery', 'Python', 'React Dashboard']
        },
        {
          name: 'Multi-Cloud Infrastructure Strategy',
          description: 'Designed hybrid cloud strategy across AWS, Azure, and GCP',
          impact: '30% infrastructure cost savings, improved disaster recovery capabilities',
          technologies: ['Terraform', 'Kubernetes', 'Service Mesh', 'Monitoring Stack']
        }
      ],
      teamStructure: {
        directReports: 8,
        totalTeamSize: 45,
        crossFunctionalTeams: ['Product', 'Design', 'DevOps', 'Security', 'Data Science']
      },
      businessImpact: [
        { metric: 'Client Retention', value: '100%', description: 'All clients renewed or extended engagements' },
        { metric: 'Cost Savings', value: '$50M+', description: 'Cumulative cost savings delivered to clients' },
        { metric: 'Time to Market', value: '40% faster', description: 'Average improvement in product delivery speed' }
      ]
    },

    technical: {
      architecturalDecisions: [
        {
          challenge: 'Legacy monolith causing deployment bottlenecks and scaling issues',
          solution: 'Designed event-driven microservices architecture with domain boundaries',
          outcome: '10x deployment frequency, 90% reduction in cross-team dependencies',
          technologies: ['Domain-Driven Design', 'Event Sourcing', 'CQRS', 'API Gateway']
        },
        {
          challenge: 'Multi-tenant SaaS platform requiring data isolation and compliance',
          solution: 'Implemented tenant-aware architecture with encryption and audit trails',
          outcome: 'SOC2 Type II compliance achieved, 99.99% data isolation guarantee',
          technologies: ['Row-Level Security', 'Vault', 'Audit Logging', 'Encryption']
        }
      ],
      technicalLeadership: [
        {
          initiative: 'AI Integration Standards',
          scope: 'Established ML model deployment and monitoring standards across 5 client projects',
          results: '80% reduction in model deployment time, standardized monitoring practices'
        },
        {
          initiative: 'Cloud-Native Adoption',
          scope: 'Led organization-wide migration to cloud-native architecture patterns',
          results: '60% infrastructure cost reduction, improved system reliability'
        }
      ],
      innovationContributions: [
        {
          area: 'Agentic Development',
          contribution: 'Pioneered AI-assisted development workflows and autonomous code review systems',
          adoption: 'Adopted by 3 Fortune 500 clients, 40% faster development cycles'
        },
        {
          area: 'Real-time Analytics',
          contribution: 'Developed novel stream processing patterns for financial data',
          adoption: 'Open-sourced framework adopted by 500+ developers on GitHub'
        }
      ],
      certifications: [
        'AWS Solutions Architect Professional',
        'Kubernetes Certified Administrator',
        'Google Cloud Professional Architect'
      ]
    }
  },

  {
    id: 'tech-lead-saas',
    company: 'TechCorp Solutions',
    title: 'Senior Technical Lead',
    department: 'Platform Engineering',
    startDate: '2018',
    endDate: '2021',
    location: 'San Francisco, CA',
    companySize: '500-1000 employees',
    industry: 'Enterprise SaaS',

    summary: {
      overview: 'Led platform engineering initiatives for enterprise SaaS product serving 100K+ users, focusing on scalability, performance, and developer experience.',
      keyAchievements: [
        'Improved platform performance by 300% while reducing infrastructure costs by 45%',
        'Led team of 12 engineers through successful IPO preparation and SOC2 compliance',
        'Architected microservices platform handling 1M+ requests per minute'
      ],
      technologies: ['Node.js', 'React', 'PostgreSQL', 'Redis', 'Docker', 'AWS']
    },

    detailed: {
      responsibilities: [
        'Technical strategy and architecture decisions for core platform',
        'Engineering team leadership and mentorship across frontend, backend, and DevOps',
        'Performance optimization and scalability planning for high-growth phase',
        'Technical interview process design and engineering hiring',
        'Cross-team collaboration with Product, Design, and Customer Success'
      ],
      majorProjects: [
        {
          name: 'Platform Performance Optimization',
          description: 'Complete re-architecture of API layer and database optimization',
          impact: '300% performance improvement, 45% cost reduction',
          technologies: ['Node.js', 'PostgreSQL', 'Redis', 'CDN', 'Query Optimization']
        },
        {
          name: 'Microservices Migration',
          description: 'Migrated monolithic application to microservices architecture',
          impact: 'Enabled independent team deployments, 5x faster feature delivery',
          technologies: ['Docker', 'Kubernetes', 'API Gateway', 'Service Discovery']
        }
      ],
      teamStructure: {
        directReports: 4,
        totalTeamSize: 12,
        crossFunctionalTeams: ['Product', 'Design', 'Customer Success', 'Sales Engineering']
      },
      businessImpact: [
        { metric: 'System Uptime', value: '99.97%', description: 'Maintained during 300% user growth' },
        { metric: 'Development Velocity', value: '5x faster', description: 'Feature delivery speed improvement' },
        { metric: 'Customer Satisfaction', value: '4.8/5', description: 'Platform reliability and performance ratings' }
      ]
    },

    technical: {
      architecturalDecisions: [
        {
          challenge: 'Monolithic architecture limiting team autonomy and deployment speed',
          solution: 'Gradual migration to domain-based microservices with clear boundaries',
          outcome: 'Independent team deployments, 80% reduction in cross-team blockers',
          technologies: ['Microservices', 'Domain-Driven Design', 'Event-Driven Architecture']
        }
      ],
      technicalLeadership: [
        {
          initiative: 'Developer Experience Platform',
          scope: 'Built internal tooling and CI/CD pipelines for 50+ engineers',
          results: '60% reduction in deployment time, 90% test automation coverage'
        }
      ],
      innovationContributions: [
        {
          area: 'Performance Monitoring',
          contribution: 'Developed real-time performance monitoring and alerting system',
          adoption: 'Reduced MTTR by 70%, adopted across all engineering teams'
        }
      ],
      certifications: [
        'AWS Solutions Architect Associate',
        'Docker Certified Associate'
      ]
    }
  },

  {
    id: 'software-engineer-startup',
    company: 'StartupTech Inc',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    startDate: '2015',
    endDate: '2018',
    location: 'Palo Alto, CA',
    companySize: '50-100 employees',
    industry: 'Technology Startup',

    summary: {
      overview: 'Full-stack engineer in fast-growing startup environment, building core product features and establishing engineering practices during scale-up phase.',
      keyAchievements: [
        'Built core platform features used by 10K+ monthly active users',
        'Established CI/CD practices and testing standards for growing team',
        'Led frontend architecture transition from jQuery to React'
      ],
      technologies: ['JavaScript', 'Python', 'React', 'Django', 'PostgreSQL', 'AWS']
    },

    detailed: {
      responsibilities: [
        'Full-stack feature development from design to deployment',
        'Frontend architecture and UI/UX implementation',
        'Backend API design and database optimization',
        'Code review and mentorship of junior developers',
        'DevOps and deployment pipeline management'
      ],
      majorProjects: [
        {
          name: 'Real-time Collaboration Platform',
          description: 'Built real-time collaborative editing features using WebSockets',
          impact: 'Enabled 5x increase in user engagement and session duration',
          technologies: ['WebSockets', 'React', 'Redis', 'Operational Transform']
        },
        {
          name: 'Frontend Architecture Modernization',
          description: 'Migrated legacy jQuery codebase to modern React architecture',
          impact: '50% faster development speed, improved maintainability',
          technologies: ['React', 'Redux', 'Webpack', 'ES6+', 'Component Libraries']
        }
      ],
      teamStructure: {
        directReports: 2,
        totalTeamSize: 8,
        crossFunctionalTeams: ['Product', 'Design']
      },
      businessImpact: [
        { metric: 'User Growth', value: '400% increase', description: 'Platform user base growth during tenure' },
        { metric: 'Feature Velocity', value: '2x faster', description: 'Development speed improvement post-modernization' },
        { metric: 'Bug Reduction', value: '60% fewer', description: 'Production bugs after implementing testing practices' }
      ]
    },

    technical: {
      architecturalDecisions: [
        {
          challenge: 'Legacy jQuery codebase becoming unmaintainable as team scaled',
          solution: 'Incremental migration to React with component-based architecture',
          outcome: 'Improved development velocity and code maintainability',
          technologies: ['React', 'Component Architecture', 'State Management', 'Module Bundling']
        }
      ],
      technicalLeadership: [
        {
          initiative: 'Testing Standards',
          scope: 'Established unit and integration testing practices across frontend and backend',
          results: '80% test coverage achieved, 60% reduction in production bugs'
        }
      ],
      innovationContributions: [
        {
          area: 'Real-time Collaboration',
          contribution: 'Implemented conflict-free collaborative editing algorithms',
          adoption: 'Core feature used by 100% of active users'
        }
      ]
    }
  }
];

/**
 * A/B test variants for experience presentation
 */
const AB_TEST_VARIANTS: ABTestVariant[] = [
  {
    id: 'chronological',
    name: 'Chronological Timeline',
    description: 'Traditional reverse-chronological presentation',
    contentStrategy: 'chronological',
    emphasisOn: 'achievements'
  },
  {
    id: 'impact_first',
    name: 'Impact-Driven',
    description: 'Highlights business impact and quantifiable results first',
    contentStrategy: 'impact_first',
    emphasisOn: 'achievements'
  },
  {
    id: 'technical_depth',
    name: 'Technical Leadership',
    description: 'Emphasizes technical decisions and architectural contributions',
    contentStrategy: 'skills_focused',
    emphasisOn: 'technical_depth'
  },
  {
    id: 'narrative_story',
    name: 'Career Narrative',
    description: 'Story-driven presentation connecting experiences thematically',
    contentStrategy: 'narrative_driven',
    emphasisOn: 'innovation'
  }
];

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface ExperienceContentAdapterProps {
  /** Current canvas position for content level calculation */
  canvasPosition?: CanvasPosition;

  /** Override content level for manual control */
  forcedLevel?: ContentLevel;

  /** Viewer context signals for adaptive content */
  viewerContext?: ViewerContext;

  /** A/B test variant ID to use */
  abTestVariant?: string;

  /** Callback when user interacts with experience content */
  onExperienceInteraction?: (roleId: string, action: string, metadata?: any) => void;

  /** Custom CSS classes for styling */
  className?: string;

  /** Performance mode for animations */
  performanceMode?: 'high' | 'balanced' | 'low';
}

interface ExperienceTimelineProps {
  roles: ExperienceRole[];
  level: ContentLevel;
  viewerContext?: ViewerContext;
  abVariant: ABTestVariant;
  isTransitioning: boolean;
  onRoleInteraction: (roleId: string, action: string, metadata?: any) => void;
  performanceMode?: 'high' | 'balanced' | 'low';
}

interface RoleCardProps {
  role: ExperienceRole;
  level: ContentLevel;
  viewerContext?: ViewerContext;
  isExpanded: boolean;
  onToggle: () => void;
  onInteraction: (action: string, metadata?: any) => void;
  emphasisOn: ABTestVariant['emphasisOn'];
  performanceMode?: 'high' | 'balanced' | 'low';
}

// ============================================================================
// ROLE CARD COMPONENT
// ============================================================================

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  level,
  viewerContext,
  isExpanded,
  onToggle,
  onInteraction,
  emphasisOn,
  performanceMode = 'balanced'
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'projects' | 'impact' | 'technical'>('overview');

  // Calculate years of experience
  const startYear = parseInt(role.startDate);
  const endYear = role.endDate === 'Present' ? new Date().getFullYear() : parseInt(role.endDate);
  const yearsOfExperience = endYear - startYear;

  const useAnimations = performanceMode !== 'low';

  // Determine what content to show based on level
  const getVisibleContent = () => {
    switch (level) {
      case ContentLevel.PREVIEW:
        return {
          achievements: role.summary.keyAchievements.slice(0, 1),
          technologies: role.summary.technologies.slice(0, 4),
          showProjects: false,
          showTechnical: false
        };
      case ContentLevel.SUMMARY:
        return {
          achievements: role.summary.keyAchievements,
          technologies: role.summary.technologies,
          showProjects: false,
          showTechnical: false
        };
      case ContentLevel.DETAILED:
        return {
          achievements: role.summary.keyAchievements,
          technologies: role.summary.technologies,
          showProjects: true,
          showTechnical: false
        };
      case ContentLevel.TECHNICAL:
        return {
          achievements: role.summary.keyAchievements,
          technologies: role.summary.technologies,
          showProjects: true,
          showTechnical: true
        };
      default:
        return {
          achievements: role.summary.keyAchievements.slice(0, 1),
          technologies: role.summary.technologies.slice(0, 3),
          showProjects: false,
          showTechnical: false
        };
    }
  };

  const visibleContent = getVisibleContent();

  return (
    <div
      className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6
        transition-all duration-500 hover:bg-white/8 hover:border-white/20 group
        ${useAnimations ? 'transform hover:scale-[1.01]' : ''}
      `}
      data-testid={`experience-role-${role.id}`}
    >
      {/* Role Header */}
      <div
        className="cursor-pointer"
        onClick={() => {
          onToggle();
          onInteraction('toggle', { expanded: !isExpanded });
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-white">{role.title}</h3>
              <span className="text-sm px-2 py-1 bg-blue-900/40 text-blue-200 rounded-full">
                {yearsOfExperience}y
              </span>
            </div>
            <p className="text-lg text-white/80 font-medium">{role.company}</p>
            <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
              <span>{role.startDate} - {role.endDate}</span>
              <span>•</span>
              <span>{role.location}</span>
              <span>•</span>
              <span>{role.industry}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
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

        {/* Summary overview */}
        <p className="text-white/80 leading-relaxed mb-4">
          {role.summary.overview}
        </p>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className={`mt-6 ${useAnimations ? 'animate-in slide-in-from-top-2' : ''}`}>
          {/* Tab navigation for detailed/technical levels */}
          {level === ContentLevel.DETAILED || level === ContentLevel.TECHNICAL ? (
            <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
              {['overview', 'projects', 'impact', ...(level === ContentLevel.TECHNICAL ? ['technical'] : [])].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setSelectedTab(tab as any);
                    onInteraction('tab_change', { tab });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${selectedTab === tab
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          ) : null}

          {/* Tab content */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Key achievements */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Key Achievements</h4>
                <ul className="space-y-2">
                  {visibleContent.achievements.map((achievement, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-white/80"
                      style={{
                        animationDelay: useAnimations ? `${index * 100}ms` : '0ms'
                      }}
                    >
                      <span className="text-green-400 mt-1">✓</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {visibleContent.technologies.map((tech, index) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-purple-900/40 text-purple-200 rounded-full text-sm
                        border border-purple-700/50 hover:bg-purple-800/50 transition-colors"
                      style={{
                        animationDelay: useAnimations ? `${index * 50}ms` : '0ms'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Responsibilities (detailed level and above) */}
              {level !== ContentLevel.PREVIEW && level !== ContentLevel.SUMMARY && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Key Responsibilities</h4>
                  <ul className="space-y-2">
                    {role.detailed.responsibilities.slice(0, level === ContentLevel.DETAILED ? 3 : 5).map((resp, index) => (
                      <li key={index} className="flex items-start gap-3 text-white/70">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'projects' && visibleContent.showProjects && (
            <div className="space-y-4">
              {role.detailed.majorProjects.map((project, index) => (
                <div
                  key={project.name}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                  onClick={() => onInteraction('project_click', { project: project.name })}
                >
                  <h5 className="font-semibold text-white mb-2">{project.name}</h5>
                  <p className="text-white/70 mb-3">{project.description}</p>
                  <div className="text-sm text-green-400 mb-3">
                    <strong>Impact:</strong> {project.impact}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-gray-800/60 text-gray-300 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'impact' && level !== ContentLevel.PREVIEW && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {role.detailed.businessImpact.map((impact, index) => (
                <div
                  key={impact.metric}
                  className="text-center p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {impact.value}
                  </div>
                  <div className="text-sm text-white font-medium mb-1">
                    {impact.metric}
                  </div>
                  <div className="text-xs text-white/60">
                    {impact.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'technical' && level === ContentLevel.TECHNICAL && (
            <div className="space-y-6">
              {/* Architectural decisions */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Architectural Decisions</h4>
                {role.technical.architecturalDecisions.map((decision, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
                    <div className="mb-2">
                      <strong className="text-red-300">Challenge:</strong>
                      <span className="text-white/80 ml-2">{decision.challenge}</span>
                    </div>
                    <div className="mb-2">
                      <strong className="text-blue-300">Solution:</strong>
                      <span className="text-white/80 ml-2">{decision.solution}</span>
                    </div>
                    <div className="mb-3">
                      <strong className="text-green-300">Outcome:</strong>
                      <span className="text-white/80 ml-2">{decision.outcome}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {decision.technologies.map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-purple-900/40 text-purple-200 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Innovation contributions */}
              {role.technical.innovationContributions.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Innovation Contributions</h4>
                  {role.technical.innovationContributions.map((innovation, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 mb-3 border border-white/10">
                      <div className="font-semibold text-white mb-1">{innovation.area}</div>
                      <div className="text-white/80 mb-2">{innovation.contribution}</div>
                      <div className="text-sm text-green-400">
                        <strong>Adoption:</strong> {innovation.adoption}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {role.technical.certifications && role.technical.certifications.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {role.technical.certifications.map(cert => (
                      <span
                        key={cert}
                        className="px-3 py-1 bg-yellow-900/40 text-yellow-200 rounded-full text-sm
                          border border-yellow-700/50"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPERIENCE TIMELINE COMPONENT
// ============================================================================

const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({
  roles,
  level,
  viewerContext,
  abVariant,
  isTransitioning,
  onRoleInteraction,
  performanceMode = 'balanced'
}) => {
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(['managing-consultant-current']));

  const handleRoleToggle = useCallback((roleId: string) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  }, []);

  // Sort roles based on A/B test variant strategy
  const sortedRoles = useMemo(() => {
    switch (abVariant.contentStrategy) {
      case 'impact_first':
        return [...roles].sort((a, b) => {
          const aImpact = a.detailed.businessImpact.length;
          const bImpact = b.detailed.businessImpact.length;
          return bImpact - aImpact;
        });
      case 'skills_focused':
        return [...roles].sort((a, b) => {
          const atech = a.summary.technologies.length;
          const btech = b.summary.technologies.length;
          return btech - atech;
        });
      case 'chronological':
      case 'narrative_driven':
      default:
        return [...roles].sort((a, b) => {
          const aYear = a.endDate === 'Present' ? 9999 : parseInt(a.endDate);
          const bYear = b.endDate === 'Present' ? 9999 : parseInt(b.endDate);
          return bYear - aYear;
        });
    }
  }, [roles, abVariant.contentStrategy]);

  // Calculate total experience
  const totalYears = roles.reduce((total, role) => {
    const startYear = parseInt(role.startDate);
    const endYear = role.endDate === 'Present' ? new Date().getFullYear() : parseInt(role.endDate);
    return total + (endYear - startYear);
  }, 0);

  return (
    <div
      className={`transition-all duration-500 ${
        isTransitioning ? 'opacity-75 scale-[0.99]' : 'opacity-100 scale-100'
      }`}
    >
      {/* Header with level indicator and A/B variant info */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${level === ContentLevel.TECHNICAL ? 'bg-purple-900/40 text-purple-200 border border-purple-700/50' :
              level === ContentLevel.DETAILED ? 'bg-blue-900/40 text-blue-200 border border-blue-700/50' :
              level === ContentLevel.SUMMARY ? 'bg-green-900/40 text-green-200 border border-green-700/50' :
              'bg-gray-900/40 text-gray-200 border border-gray-700/50'}
          `}>
            {level.toUpperCase()} LEVEL
          </span>
          <span className="text-white/60">
            {totalYears}+ years experience
          </span>
          <span className="px-2 py-1 bg-orange-900/40 text-orange-200 rounded text-xs border border-orange-700/50">
            {abVariant.name}
          </span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Professional Experience</h2>
        <p className="text-white/70">
          {level === ContentLevel.TECHNICAL ? 'Complete career history with technical leadership details' :
           level === ContentLevel.DETAILED ? 'Professional journey with project details and business impact' :
           level === ContentLevel.SUMMARY ? 'Career progression with key achievements' :
           'Career overview and highlights'}
        </p>
      </div>

      {/* Experience timeline */}
      <div className="relative">
        {/* Timeline line (for visual continuity) */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent opacity-30" />

        {/* Roles */}
        <div className="space-y-8">
          {sortedRoles.map((role, index) => (
            <div key={role.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-4 top-6 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white/20" />

              {/* Role content */}
              <div className="ml-16">
                <RoleCard
                  role={role}
                  level={level}
                  viewerContext={viewerContext}
                  isExpanded={expandedRoles.has(role.id)}
                  onToggle={() => handleRoleToggle(role.id)}
                  onInteraction={(action, metadata) => onRoleInteraction(role.id, action, metadata)}
                  emphasisOn={abVariant.emphasisOn}
                  performanceMode={performanceMode}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience summary analytics (technical level) */}
      {level === ContentLevel.TECHNICAL && (
        <div className="mt-12 p-6 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Career Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{totalYears}+</div>
              <div className="text-sm text-white/60">Years Experience</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{roles.length}</div>
              <div className="text-sm text-white/60">Leadership Roles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {roles.reduce((sum, role) => sum + role.detailed.majorProjects.length, 0)}
              </div>
              <div className="text-sm text-white/60">Major Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {roles.reduce((sum, role) => sum + (role.technical.certifications?.length || 0), 0)}
              </div>
              <div className="text-sm text-white/60">Certifications</div>
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
 * Experience Content Adapter - Progressive experience disclosure with A/B testing
 * Integrates with canvas zoom level, user engagement tracking, and viewer context signals
 */
export const ExperienceContentAdapter: React.FC<ExperienceContentAdapterProps> = ({
  canvasPosition,
  forcedLevel,
  viewerContext,
  abTestVariant = 'chronological',
  onExperienceInteraction,
  className = "",
  performanceMode = 'balanced'
}) => {
  // Initialize content level manager for 'exposure' section (Experience)
  const {
    currentLevel,
    previousLevel,
    isTransitioning,
    actions
  } = useContentLevelManager({
    section: 'exposure', // Experience section maps to 'exposure' in photography metaphor
    enableEngagementTracking: true,
    performanceMode,
    onLevelChange: (newLevel, prevLevel) => {
      console.log(`Experience section: ${prevLevel} → ${newLevel}`);
    }
  });

  // Get A/B test variant
  const abVariant = useMemo(() => {
    return AB_TEST_VARIANTS.find(v => v.id === abTestVariant) || AB_TEST_VARIANTS[0];
  }, [abTestVariant]);

  // Update content level based on canvas position
  useEffect(() => {
    if (canvasPosition) {
      actions.updateCanvasPosition(canvasPosition);
    }
  }, [canvasPosition, actions]);

  // Handle forced level override
  useEffect(() => {
    if (forcedLevel && forcedLevel !== currentLevel) {
      actions.setContentLevel(forcedLevel);
    }
  }, [forcedLevel, currentLevel, actions]);

  // Handle experience interactions for engagement tracking
  const handleExperienceInteraction = useCallback((roleId: string, action: string, metadata?: any) => {
    actions.trackInteraction({
      type: action === 'toggle' ? 'click' : action === 'project_click' ? 'click' : 'hover',
      target: {
        type: action === 'toggle' ? 'heading' : action === 'project_click' ? 'body' : 'skill',
        id: roleId,
        contentLevel: currentLevel
      },
      timing: {
        timestamp: Date.now()
      },
      spatial: {
        canvasPosition: canvasPosition || { x: 0, y: 0, scale: 1.0 },
        section: 'exposure'
      }
    });

    onExperienceInteraction?.(roleId, action, { ...metadata, abVariant: abVariant.id });
  }, [actions, currentLevel, canvasPosition, onExperienceInteraction, abVariant.id]);

  const effectiveLevel = forcedLevel || currentLevel;

  return (
    <div className={`experience-content-adapter ${className}`}>
      <ExperienceTimeline
        roles={EXPERIENCE_DATABASE}
        level={effectiveLevel}
        viewerContext={viewerContext}
        abVariant={abVariant}
        isTransitioning={isTransitioning}
        onRoleInteraction={handleExperienceInteraction}
        performanceMode={performanceMode}
      />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-900/50 rounded border border-gray-700/50 text-xs text-gray-400">
          <div>Current Level: {currentLevel}</div>
          {previousLevel && <div>Previous Level: {previousLevel}</div>}
          <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
          <div>A/B Variant: {abVariant.name} ({abVariant.id})</div>
          {viewerContext && <div>Viewer Context: {JSON.stringify(viewerContext)}</div>}
          {canvasPosition && (
            <div>Canvas: scale={canvasPosition.scale.toFixed(2)}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExperienceContentAdapter;