/**
 * Projects Section Content Adapter
 *
 * Provides intelligent project presentation with progressive technical detail disclosure,
 * relevance scoring, and technical depth toggles. Implements Business → Technical → Implementation
 * progression with engagement analytics and breadcrumb navigation.
 *
 * Phase 2: Core Implementation - Task 6: Projects Section Smart Showcase
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useContentLevelManager } from '../../hooks/useContentLevelManager';
import { ContentLevel } from '../../types/section-content';
import type { CanvasPosition } from '../../types/canvas';

// ============================================================================
// ENHANCED PROJECT DATA DEFINITIONS
// ============================================================================

/**
 * Enhanced project with progressive disclosure levels
 */
interface EnhancedProject {
  id: string;
  title: string;
  category: 'enterprise' | 'fullstack' | 'ai' | 'photography' | 'infrastructure';
  relevanceScore: number; // 0-100 based on viewer behavior patterns
  priority: 'high' | 'medium' | 'low';

  // Basic level (Business focus)
  business: {
    overview: string;
    businessValue: string;
    clientType: string;
    duration: string;
    teamSize: string;
    keyOutcomes: string[];
    roi?: string;
  };

  // Technical level
  technical: {
    architecture: string;
    technologies: string[];
    challenges: string[];
    solutions: string[];
    integrations: string[];
    scalingFactors: {
      users: string;
      requests: string;
      data: string;
    };
  };

  // Implementation level
  implementation: {
    codeExamples: {
      title: string;
      language: string;
      snippet: string;
      description: string;
    }[];
    deploymentStrategy: string;
    monitoringSetup: string[];
    performanceMetrics: {
      metric: string;
      before: string;
      after: string;
      improvement: string;
    }[];
    lessonsLearned: string[];
  };

  // Media and links
  media: {
    featured: string;
    gallery: string[];
    demoUrl?: string;
    repoUrl?: string;
    caseStudyUrl?: string;
  };

  // Metadata
  metadata: {
    completionDate: string;
    status: 'completed' | 'ongoing' | 'archived';
    visibility: 'public' | 'portfolio' | 'private';
    tags: string[];
  };
}

/**
 * Viewer behavior patterns for relevance scoring
 */
interface ViewerBehavior {
  interests: ('business' | 'technical' | 'implementation' | 'architecture' | 'ai')[];
  timeSpent: { [projectId: string]: number };
  interactionDepth: 'surface' | 'moderate' | 'deep';
  preferredTechnologies: string[];
  engagementHistory: {
    projectId: string;
    actions: ('view' | 'expand' | 'code_view' | 'demo_access' | 'case_study')[];
    timestamp: number;
  }[];
}

/**
 * Technical depth mode configuration
 */
type TechnicalDepthMode = 'business' | 'technical' | 'implementation';

/**
 * Project exploration state with breadcrumbs
 */
interface ExplorationState {
  selectedProject?: string;
  currentMode: TechnicalDepthMode;
  breadcrumbs: {
    label: string;
    action: () => void;
    icon: string;
  }[];
  navigationHistory: string[];
}

// ============================================================================
// PROJECT DATABASE
// ============================================================================

const ENHANCED_PROJECTS: EnhancedProject[] = [
  {
    id: 'agentic-development',
    title: 'Agentic Software Development Platform',
    category: 'ai',
    relevanceScore: 95,
    priority: 'high',

    business: {
      overview: 'Revolutionary AI-driven platform that autonomously develops, tests, and deploys enterprise applications, reducing development cycles from months to weeks.',
      businessValue: '$2.5M cost savings annually through 70% reduction in development time',
      clientType: 'Fortune 500 Technology Company',
      duration: '18 months',
      teamSize: '12 engineers + 3 AI researchers',
      keyOutcomes: [
        '70% faster application development',
        '85% reduction in bugs through AI-driven testing',
        '60% improvement in code quality metrics',
        'Autonomous deployment success rate of 94%'
      ],
      roi: '340% ROI within 12 months'
    },

    technical: {
      architecture: 'Multi-agent system with specialized AI agents for coding, testing, deployment, and monitoring, orchestrated by a central planning agent',
      technologies: ['GPT-4', 'Claude 3', 'TypeScript', 'Python', 'Docker', 'Kubernetes', 'GitHub Actions', 'PostgreSQL', 'Redis'],
      challenges: [
        'Coordinating multiple AI agents with different specializations',
        'Ensuring code quality and security in autonomous generation',
        'Managing complex dependencies across microservices',
        'Real-time collaboration between human developers and AI agents'
      ],
      solutions: [
        'Event-driven agent communication with CQRS pattern',
        'Multi-layer validation including static analysis, unit tests, and security scans',
        'Dynamic dependency resolution with conflict detection',
        'Human-in-the-loop approval workflow for critical changes'
      ],
      integrations: ['GitHub Enterprise', 'Jira', 'Slack', 'AWS CodePipeline', 'SonarQube', 'Snyk'],
      scalingFactors: {
        users: '500+ concurrent developers',
        requests: '10M+ API calls daily',
        data: '50TB+ code and artifacts'
      }
    },

    implementation: {
      codeExamples: [
        {
          title: 'Agent Orchestration Framework',
          language: 'typescript',
          snippet: `interface AgentCapability {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
}

class AgentOrchestrator {
  async executeWorkflow(
    agents: Agent[],
    workflow: WorkflowDefinition
  ): Promise<WorkflowResult> {
    const execution = new WorkflowExecution(workflow);

    for (const step of workflow.steps) {
      const agent = this.selectAgent(agents, step.requirements);
      const result = await agent.execute(step.input);

      await this.validateResult(result, step.validation);
      execution.recordStep(step.id, result);
    }

    return execution.getResult();
  }
}`,
          description: 'Core orchestration logic for coordinating AI agents in software development workflows'
        },
        {
          title: 'Autonomous Code Generation',
          language: 'python',
          snippet: `class CodeGenerationAgent(BaseAgent):
    def __init__(self, model_client: LLMClient):
        super().__init__("code-generation", model_client)
        self.validator = CodeValidator()

    async def generate_component(
        self,
        specification: ComponentSpec
    ) -> GeneratedCode:
        prompt = self.build_generation_prompt(specification)

        code = await self.model_client.complete(prompt)
        validation_result = await self.validator.validate(code)

        if not validation_result.is_valid:
            return await self.refine_code(code, validation_result)

        return GeneratedCode(
            source=code,
            metadata=validation_result.metadata
        )`,
          description: 'AI agent responsible for autonomous code generation with validation feedback loops'
        }
      ],
      deploymentStrategy: 'GitOps with Kubernetes, blue-green deployments managed by Argo CD, automated rollback on failure detection',
      monitoringSetup: [
        'Prometheus + Grafana for agent performance metrics',
        'Jaeger for distributed tracing across agent interactions',
        'Custom alerting for code quality degradation',
        'Real-time dashboard for development velocity tracking'
      ],
      performanceMetrics: [
        {
          metric: 'Average Development Time',
          before: '6-8 weeks',
          after: '2-3 weeks',
          improvement: '70% reduction'
        },
        {
          metric: 'Bug Detection Rate',
          before: '65%',
          after: '94%',
          improvement: '45% increase'
        },
        {
          metric: 'Code Review Time',
          before: '3-5 days',
          after: '2-4 hours',
          improvement: '85% reduction'
        }
      ],
      lessonsLearned: [
        'AI agents need clear boundaries and handoff protocols to prevent conflicts',
        'Human oversight remains crucial for strategic architectural decisions',
        'Real-time feedback loops significantly improve AI code generation quality',
        'Developer training on AI collaboration patterns is essential for adoption'
      ]
    },

    media: {
      featured: 'https://picsum.photos/seed/agentic-main/800/600',
      gallery: [
        'https://picsum.photos/seed/agentic-1/600/400',
        'https://picsum.photos/seed/agentic-2/600/400',
        'https://picsum.photos/seed/agentic-3/600/400'
      ],
      demoUrl: 'https://demo.agentic-dev.com',
      repoUrl: 'https://github.com/example/agentic-platform',
      caseStudyUrl: 'https://casestudies.nino.photos/agentic-development'
    },

    metadata: {
      completionDate: '2024-03',
      status: 'ongoing',
      visibility: 'portfolio',
      tags: ['AI', 'Automation', 'Enterprise', 'Innovation', 'Architecture']
    }
  },

  {
    id: 'enterprise-commerce',
    title: 'Global Commerce Platform Modernization',
    category: 'enterprise',
    relevanceScore: 88,
    priority: 'high',

    business: {
      overview: 'Complete modernization of legacy commerce platform serving 50M+ customers globally, migrating from monolithic to microservices architecture.',
      businessValue: '$15M annual revenue increase through improved performance and feature velocity',
      clientType: 'Fortune 100 Retail Corporation',
      duration: '24 months',
      teamSize: '85 engineers across 12 teams',
      keyOutcomes: [
        '40% improvement in page load times',
        '99.99% uptime achievement',
        '300% increase in feature deployment frequency',
        '25% boost in conversion rates'
      ],
      roi: '280% ROI over 18 months'
    },

    technical: {
      architecture: 'Event-driven microservices with CQRS, API Gateway, and multi-region deployment for global scalability',
      technologies: ['Java Spring Boot', 'React', 'Apache Kafka', 'PostgreSQL', 'Redis', 'AWS', 'Docker', 'Kubernetes'],
      challenges: [
        'Zero-downtime migration from legacy monolith',
        'Maintaining data consistency across distributed services',
        'Managing complex order workflows across multiple systems',
        'Ensuring security compliance across global regions'
      ],
      solutions: [
        'Strangler Fig pattern for gradual service extraction',
        'Event sourcing with Kafka for reliable distributed transactions',
        'Saga pattern for order orchestration across services',
        'Multi-layer security with OAuth 2.0, API gateway, and service mesh'
      ],
      integrations: ['SAP ERP', 'Salesforce CRM', 'Stripe Payments', 'Shopify Plus', 'Google Analytics', 'Segment'],
      scalingFactors: {
        users: '50M+ global customers',
        requests: '1B+ requests daily',
        data: '500TB+ customer and product data'
      }
    },

    implementation: {
      codeExamples: [
        {
          title: 'Event-Driven Order Processing',
          language: 'java',
          snippet: `@Service
@EventHandler
public class OrderProcessingService {

    @EventListener
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
        Order order = event.getOrder();

        // Validate inventory
        InventoryCheckResult inventory =
            inventoryService.checkAvailability(order.getItems());

        if (inventory.isAvailable()) {
            eventPublisher.publish(new InventoryReservedEvent(
                order.getId(), inventory.getReservationId()
            ));
        } else {
            eventPublisher.publish(new OrderFailedEvent(
                order.getId(), "Insufficient inventory"
            ));
        }
    }
}`,
          description: 'Event-driven order processing with inventory management using domain events'
        }
      ],
      deploymentStrategy: 'Blue-green deployments with canary releases, automated rollback on SLA violations',
      monitoringSetup: [
        'DataDog APM for end-to-end transaction tracing',
        'Custom business metrics dashboard for conversion tracking',
        'PagerDuty integration for critical alerts',
        'Chaos engineering with Gremlin for resilience testing'
      ],
      performanceMetrics: [
        {
          metric: 'Page Load Time',
          before: '4.2 seconds',
          after: '2.1 seconds',
          improvement: '50% improvement'
        },
        {
          metric: 'System Availability',
          before: '99.5%',
          after: '99.99%',
          improvement: '49x fewer outages'
        }
      ],
      lessonsLearned: [
        'Gradual migration reduces risk significantly compared to big-bang approach',
        'Event sourcing provides excellent audit trail but requires careful schema evolution',
        'Cross-functional teams accelerate delivery when properly organized',
        'Automated testing at API contract level prevents integration issues'
      ]
    },

    media: {
      featured: 'https://picsum.photos/seed/commerce-main/800/600',
      gallery: [
        'https://picsum.photos/seed/commerce-1/600/400',
        'https://picsum.photos/seed/commerce-2/600/400'
      ],
      caseStudyUrl: 'https://casestudies.nino.photos/enterprise-commerce'
    },

    metadata: {
      completionDate: '2023-09',
      status: 'completed',
      visibility: 'portfolio',
      tags: ['Enterprise', 'Microservices', 'E-commerce', 'Architecture', 'AWS']
    }
  },

  {
    id: 'volleyball-platform',
    title: 'Professional Volleyball Tournament Management',
    category: 'fullstack',
    relevanceScore: 75,
    priority: 'medium',

    business: {
      overview: 'Comprehensive tournament management platform serving professional volleyball leagues with real-time scoring, analytics, and fan engagement features.',
      businessValue: 'Streamlined tournament operations for 50+ professional tournaments annually',
      clientType: 'Professional Volleyball Association',
      duration: '8 months',
      teamSize: '5 full-stack engineers',
      keyOutcomes: [
        '100% digital transformation of tournament operations',
        '60% reduction in administrative overhead',
        '300% increase in fan engagement metrics',
        'Real-time statistics for broadcast integration'
      ]
    },

    technical: {
      architecture: 'Modern full-stack application with real-time data synchronization, progressive web app capabilities',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Socket.io', 'AWS', 'Docker'],
      challenges: [
        'Real-time score updates across multiple concurrent matches',
        'Complex tournament bracket generation and management',
        'Mobile-first design for courtside officials',
        'Integration with broadcast systems for live streaming'
      ],
      solutions: [
        'WebSocket architecture with Redis pub/sub for real-time updates',
        'Graph-based algorithm for dynamic bracket generation',
        'Progressive Web App with offline capabilities',
        'RESTful API with webhook support for broadcast integration'
      ],
      integrations: ['Stripe Payments', 'SendGrid Email', 'AWS S3', 'Google Analytics'],
      scalingFactors: {
        users: '10K+ concurrent viewers',
        requests: '500K+ API calls per tournament',
        data: '5TB+ match statistics and video'
      }
    },

    implementation: {
      codeExamples: [
        {
          title: 'Real-time Score Updates',
          language: 'typescript',
          snippet: `class MatchScoreService {
  constructor(
    private io: SocketIO.Server,
    private redis: RedisClient
  ) {}

  async updateScore(
    matchId: string,
    teamId: string,
    points: number
  ): Promise<void> {
    const match = await this.getMatch(matchId);
    match.updateScore(teamId, points);

    // Persist to database
    await this.repository.save(match);

    // Broadcast real-time update
    this.io.to(\`match-\${matchId}\`).emit('scoreUpdate', {
      matchId,
      score: match.getCurrentScore(),
      timestamp: Date.now()
    });

    // Cache for fast retrieval
    await this.redis.setex(
      \`score:\${matchId}\`,
      300,
      JSON.stringify(match.getCurrentScore())
    );
  }
}`,
          description: 'Real-time score update system with database persistence and WebSocket broadcasting'
        }
      ],
      deploymentStrategy: 'Containerized deployment on AWS ECS with auto-scaling, CloudFront CDN for global performance',
      monitoringSetup: [
        'AWS CloudWatch for infrastructure monitoring',
        'Custom analytics dashboard for match statistics',
        'Real-time error tracking with Sentry',
        'Performance monitoring with synthetic tests'
      ],
      performanceMetrics: [
        {
          metric: 'Real-time Update Latency',
          before: 'N/A (manual entry)',
          after: '<100ms',
          improvement: 'Real-time capability achieved'
        },
        {
          metric: 'Tournament Setup Time',
          before: '4-6 hours',
          after: '15-30 minutes',
          improvement: '85% reduction'
        }
      ],
      lessonsLearned: [
        'Real-time features require careful consideration of network partitions',
        'Progressive Web Apps provide native-like experience with web deployment benefits',
        'Sports domain has complex business rules that require close stakeholder collaboration',
        'Mobile-first design is crucial for courtside usage scenarios'
      ]
    },

    media: {
      featured: 'https://picsum.photos/seed/volleyball-main/800/600',
      gallery: [
        'https://picsum.photos/seed/volleyball-1/600/400',
        'https://picsum.photos/seed/volleyball-2/600/400',
        'https://picsum.photos/seed/volleyball-3/600/400'
      ],
      demoUrl: 'https://volleyball-demo.nino.photos',
      repoUrl: 'https://github.com/nino-chavez/volleyball-platform'
    },

    metadata: {
      completionDate: '2024-01',
      status: 'completed',
      visibility: 'public',
      tags: ['Full-Stack', 'Real-time', 'Sports', 'PWA', 'TypeScript']
    }
  }
];

// ============================================================================
// RELEVANCE SCORING ALGORITHM
// ============================================================================

const calculateProjectRelevance = (
  project: EnhancedProject,
  viewerBehavior: ViewerBehavior,
  contentLevel: ContentLevel
): number => {
  let score = project.relevanceScore; // Base score

  // Adjust based on viewer interests
  if (viewerBehavior.interests.includes('ai') && project.category === 'ai') score += 15;
  if (viewerBehavior.interests.includes('business') && contentLevel === ContentLevel.PREVIEW) score += 10;
  if (viewerBehavior.interests.includes('technical') && contentLevel !== ContentLevel.PREVIEW) score += 10;

  // Boost based on engagement history
  const pastEngagement = viewerBehavior.engagementHistory.filter(h => h.projectId === project.id);
  if (pastEngagement.length > 0) {
    score += Math.min(pastEngagement.length * 5, 20);
  }

  // Technology preference matching
  const techMatch = project.technical.technologies.some(tech =>
    viewerBehavior.preferredTechnologies.includes(tech)
  );
  if (techMatch) score += 12;

  return Math.min(Math.max(score, 0), 100);
};

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface ProjectsContentAdapterProps {
  className?: string;
  forcedLevel?: ContentLevel;
  canvasPosition?: CanvasPosition;
  viewerBehavior?: ViewerBehavior;
  onProjectInteraction?: (projectId: string, action: string, data?: any) => void;
  onEngagementTracking?: (data: any) => void;
  performanceMode?: 'low' | 'medium' | 'high';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ProjectsContentAdapter: React.FC<ProjectsContentAdapterProps> = ({
  className = '',
  forcedLevel,
  canvasPosition,
  viewerBehavior = {
    interests: ['business', 'technical'],
    timeSpent: {},
    interactionDepth: 'moderate',
    preferredTechnologies: ['React', 'TypeScript', 'AWS'],
    engagementHistory: []
  },
  onProjectInteraction,
  onEngagementTracking,
  performanceMode = 'high'
}) => {
  // ============================================================================
  // HOOKS AND STATE
  // ============================================================================

  const { currentLevel, previousLevel, isTransitioning, actions } = useContentLevelManager({
    section: 'composition' // Projects section maps to composition in photography metaphor
  });
  const level = forcedLevel || currentLevel;

  const [explorationState, setExplorationState] = useState<ExplorationState>({
    currentMode: 'business',
    breadcrumbs: [{ label: 'Projects', action: () => {}, icon: '◆' }],
    navigationHistory: []
  });

  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [viewStartTime] = useState(Date.now());

  // Update canvas position when provided
  useEffect(() => {
    if (canvasPosition) {
      actions.updateCanvasPosition(canvasPosition);
    }
  }, [canvasPosition, actions]);

  // Set forced level when provided
  useEffect(() => {
    if (forcedLevel) {
      actions.setContentLevel(forcedLevel);
    }
  }, [forcedLevel, actions]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const useAnimations = performanceMode !== 'low';

  // Calculate and sort projects by relevance
  const sortedProjects = useMemo(() => {
    return ENHANCED_PROJECTS
      .map(project => ({
        ...project,
        calculatedRelevance: calculateProjectRelevance(project, viewerBehavior, level)
      }))
      .sort((a, b) => b.calculatedRelevance - a.calculatedRelevance);
  }, [viewerBehavior, level]);

  // Filter projects based on content level
  const visibleProjects = useMemo(() => {
    switch (level) {
      case ContentLevel.PREVIEW:
        return sortedProjects.slice(0, 1); // Show only most relevant
      case ContentLevel.SUMMARY:
        return sortedProjects.slice(0, 2); // Show top 2
      case ContentLevel.DETAILED:
      case ContentLevel.TECHNICAL:
        return sortedProjects; // Show all
      default:
        return sortedProjects.slice(0, 2);
    }
  }, [sortedProjects, level]);

  // Get level configuration
  const levelConfig = useMemo(() => {
    switch (level) {
      case ContentLevel.PREVIEW:
        return {
          title: 'Featured Work',
          description: 'Signature projects showcasing innovation and impact',
          showTechnicalDetails: false,
          showImplementation: false,
          maxProjects: 1
        };
      case ContentLevel.SUMMARY:
        return {
          title: 'Project Portfolio',
          description: 'Key projects demonstrating technical leadership and business value',
          showTechnicalDetails: false,
          showImplementation: false,
          maxProjects: 2
        };
      case ContentLevel.DETAILED:
        return {
          title: 'Complete Project Portfolio',
          description: 'Comprehensive showcase with technical architecture and implementation details',
          showTechnicalDetails: true,
          showImplementation: false,
          maxProjects: 99
        };
      case ContentLevel.TECHNICAL:
        return {
          title: 'Technical Project Deep Dive',
          description: 'Full technical implementation details, code examples, and architecture decisions',
          showTechnicalDetails: true,
          showImplementation: true,
          maxProjects: 99
        };
      default:
        return {
          title: 'Project Portfolio',
          description: 'Selected projects with key outcomes',
          showTechnicalDetails: false,
          showImplementation: false,
          maxProjects: 2
        };
    }
  }, [level]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const trackInteraction = useCallback((
    projectId: string,
    action: string,
    additionalData?: any
  ) => {
    const interactionData = {
      type: 'click',
      target: {
        type: 'project',
        id: projectId,
        contentLevel: level
      },
      timing: {
        timestamp: Date.now(),
        viewDuration: Date.now() - viewStartTime
      },
      spatial: {
        canvasPosition: canvasPosition || { x: 0, y: 0, scale: 1.0 },
        section: 'projects'
      },
      ...additionalData
    };

    actions.trackInteraction(interactionData);
    onProjectInteraction?.(projectId, action, interactionData);
  }, [level, canvasPosition, viewStartTime, actions, onProjectInteraction]);

  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProject(projectId);
    setExplorationState(prev => ({
      ...prev,
      selectedProject: projectId,
      breadcrumbs: [
        { label: 'Projects', action: () => setSelectedProject(undefined), icon: '◆' },
        { label: sortedProjects.find(p => p.id === projectId)?.title || 'Project', action: () => {}, icon: '○' }
      ],
      navigationHistory: [...prev.navigationHistory, projectId]
    }));

    trackInteraction(projectId, 'project_select');
  }, [sortedProjects, trackInteraction]);

  const handleModeToggle = useCallback((mode: TechnicalDepthMode) => {
    setExplorationState(prev => ({ ...prev, currentMode: mode }));
    trackInteraction(selectedProject || 'none', 'mode_toggle', { mode });
  }, [selectedProject, trackInteraction]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderProjectCard = (project: EnhancedProject & { calculatedRelevance: number }) => {
    const currentData = project[explorationState.currentMode];

    return (
      <div
        key={project.id}
        className={`card-base hover-lift group cursor-pointer p-6 mb-6
          ${useAnimations ? '' : 'motion-reduce:transform-none'}
        `}
        onClick={() => handleProjectSelect(project.id)}
        data-testid={`project-card-${project.id}`}
      >
        {/* Project Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gradient-violet">{project.title}</h3>
              <span className="text-sm px-2 py-1 bg-green-900/40 text-green-200 rounded-full">
                {project.calculatedRelevance}% match
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="capitalize">{project.category}</span>
              <span>•</span>
              <span className="capitalize">{project.priority} Priority</span>
              <span>•</span>
              <span>{project.metadata.completionDate}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`transition-transform duration-200 text-white/50
              ${selectedProject === project.id ? 'rotate-180' : ''}
            `}>
              ↓
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className="space-y-4">
          {/* Business Level Content */}
          {explorationState.currentMode === 'business' && (
            <div>
              <p className="text-white/80 leading-relaxed mb-4">{project.business.overview}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Client:</span>
                  <span className="ml-2 text-white">{project.business.clientType}</span>
                </div>
                <div>
                  <span className="text-white/60">Duration:</span>
                  <span className="ml-2 text-white">{project.business.duration}</span>
                </div>
              </div>
              {project.business.roi && (
                <div className="mt-3 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                  <div className="text-green-200 font-semibold">{project.business.roi}</div>
                </div>
              )}
            </div>
          )}

          {/* Technical Level Content */}
          {explorationState.currentMode === 'technical' && levelConfig.showTechnicalDetails && (
            <div>
              <p className="text-white/80 leading-relaxed mb-4">{project.technical.architecture}</p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-white/90 mb-2">Key Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technical.technologies.slice(0, 6).map(tech => (
                      <span key={tech} className="px-2 py-1 bg-blue-900/40 text-blue-200 text-xs rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white/90 mb-2">Scale</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-white/60">Users</div>
                      <div className="text-white">{project.technical.scalingFactors.users}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60">Requests</div>
                      <div className="text-white">{project.technical.scalingFactors.requests}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/60">Data</div>
                      <div className="text-white">{project.technical.scalingFactors.data}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Implementation Level Content */}
          {explorationState.currentMode === 'implementation' && levelConfig.showImplementation && (
            <div>
              <div className="space-y-4">
                {project.implementation.codeExamples.slice(0, 1).map((example, index) => (
                  <div key={index} className="bg-black/40 rounded-lg p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-2">{example.title}</h4>
                    <pre className="text-xs text-green-400 mb-2 overflow-x-auto">
                      <code>{example.snippet.substring(0, 200)}...</code>
                    </pre>
                    <p className="text-xs text-white/60">{example.description}</p>
                  </div>
                ))}

                {/* Performance Metrics */}
                <div>
                  <h4 className="text-sm font-semibold text-white/90 mb-2">Key Improvements</h4>
                  <div className="space-y-2">
                    {project.implementation.performanceMetrics.slice(0, 2).map((metric, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-white/70">{metric.metric}</span>
                        <span className="text-green-400 font-semibold">{metric.improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Links */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
          {project.media.demoUrl && (
            <button
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                trackInteraction(project.id, 'demo_access');
                window.open(project.media.demoUrl, '_blank');
              }}
            >
              Live Demo →
            </button>
          )}
          {project.media.repoUrl && (
            <button
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                trackInteraction(project.id, 'repo_access');
                window.open(project.media.repoUrl, '_blank');
              }}
            >
              Source Code →
            </button>
          )}
          {project.media.caseStudyUrl && (
            <button
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                trackInteraction(project.id, 'case_study_access');
                window.open(project.media.caseStudyUrl, '_blank');
              }}
            >
              Case Study →
            </button>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`projects-content-adapter ${className}`}>
      <div className={`transition-all duration-500 ${
        isTransitioning ? 'opacity-75 scale-[0.99]' : 'opacity-100 scale-100'
      }`}>
        {/* Header Section */}
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

            {/* Technical Depth Toggle */}
            {(level === ContentLevel.DETAILED || level === ContentLevel.TECHNICAL) && (
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                {(['business', 'technical', 'implementation'] as TechnicalDepthMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleModeToggle(mode)}
                    className={`px-3 py-1 text-xs rounded-md transition-all capitalize
                      ${explorationState.currentMode === mode
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:text-white/80'
                      }
                      ${mode === 'implementation' && !levelConfig.showImplementation ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={mode === 'implementation' && !levelConfig.showImplementation}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">{levelConfig.title}</h2>
          <p className="text-white/70">{levelConfig.description}</p>
        </div>

        {/* Breadcrumb Navigation */}
        {explorationState.breadcrumbs.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-white/60">
              {explorationState.breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>→</span>}
                  <button
                    onClick={crumb.action}
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>{crumb.icon}</span>
                    <span>{crumb.label}</span>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="space-y-6">
          {visibleProjects.map(renderProjectCard)}
        </div>

        {/* Analytics Dashboard (Technical Level Only) */}
        {level === ContentLevel.TECHNICAL && (
          <div className="mt-12 p-6 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Project Portfolio Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{ENHANCED_PROJECTS.length}</div>
                <div className="text-sm text-white/60">Total Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {ENHANCED_PROJECTS.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-white/60">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {ENHANCED_PROJECTS.filter(p => p.category === 'ai').length}
                </div>
                <div className="text-sm text-white/60">AI Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {Math.round(ENHANCED_PROJECTS.reduce((sum, p) => sum + p.relevanceScore, 0) / ENHANCED_PROJECTS.length)}%
                </div>
                <div className="text-sm text-white/60">Avg Relevance</div>
              </div>
            </div>
          </div>
        )}

        {/* Development Mode Debug */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg text-xs">
            <div className="text-yellow-200 font-semibold mb-2">🚧 Development Debug Info</div>
            <div className="space-y-1 text-yellow-100/80">
              <div>Current Level: {level}</div>
              <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
              <div>Selected Project: {selectedProject || 'None'}</div>
              <div>Current Mode: {explorationState.currentMode}</div>
              <div>Visible Projects: {visibleProjects.length} / {ENHANCED_PROJECTS.length}</div>
              <div>Viewer Interests: {viewerBehavior.interests.join(', ')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsContentAdapter;