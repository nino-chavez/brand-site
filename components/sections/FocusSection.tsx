import React, { forwardRef, useEffect, useCallback, useState, useRef } from 'react';
import { useUnifiedGameFlow } from '../../src/contexts/UnifiedGameFlowContext';
import { useGameFlowDebugger } from '../../src/hooks/useGameFlowDebugger';
import ViewfinderOverlay from '../../src/components/layout/ViewfinderOverlay';
import { useScrollAnimation, useAnimationWithEffects } from '../../src/hooks/useScrollAnimation';
import { ThesisModal } from '../../src/components/ui/ThesisModal';

interface FocusSectionProps {
  active: boolean;
  progress: number;
  depthOfField: number;
  onFocusLock: (target: any, depthOfField: number) => void;
  onError?: (error: Error) => void;
  className?: string;
}

const FocusSection = forwardRef<HTMLElement, FocusSectionProps>(({
  active,
  progress,
  depthOfField,
  onFocusLock,
  onError,
  className = ''
}, ref) => {
  // Game Flow section hook
  const { state, actions } = useUnifiedGameFlow();
  const isActive = state.currentSection === 'focus';

  // Debug logging
  const gameFlowDebugger = useGameFlowDebugger();

  // Component state
  const [focusTargetLocked, setFocusTargetLocked] = useState(false);
  const [profileRevealed, setProfileRevealed] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [narrativeProgressed, setNarrativeProgressed] = useState(false);
  const [isThesisModalOpen, setIsThesisModalOpen] = useState(false);

  // Mouse tracking for focus interactions
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [focusPoint, setFocusPoint] = useState({ x: 50, y: 50 });
  const sectionRef = useRef<HTMLElement>(null);

  // Effects context for user-controlled animations
  const { getClasses } = useAnimationWithEffects();

  // Section-level animation - trigger at section border for visible effect
  const { elementRef: sectionAnimRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1, // Trigger when 10% of section is visible
    triggerOnce: true,
    rootMargin: '0px 0px -10% 0px' // Trigger when section is just entering viewport
  });

  // Content-level animations (staggered after section) - slight delay for polish
  const { elementRef: headingRef, isVisible: headingVisible } = useScrollAnimation({
    threshold: 0.15,
    triggerOnce: true,
    rootMargin: '0px 0px 0px 0px' // Trigger when heading enters viewport
  });
  const { elementRef: bodyRef, isVisible: bodyVisible } = useScrollAnimation({
    threshold: 0.15,
    triggerOnce: true,
    rootMargin: '0px 0px 0px 0px' // Trigger when body enters viewport
  });

  // Focus readiness sequence
  useEffect(() => {
    if (active || isActive) {
      gameFlowDebugger.startBenchmark('focus-section-ready');

      const focusSequence = async () => {
        try {
          // Instant content reveal - no delays for immediate visibility
          setFocusTargetLocked(true);
          setProfileRevealed(true);
          setStatsAnimated(true);
          setNarrativeProgressed(true);

          gameFlowDebugger.endBenchmark('focus-section-ready');

        } catch (error) {
          gameFlowDebugger.log('error', 'section', 'Focus section readiness failed', error);
          onError?.(error instanceof Error ? error : new Error('Focus section failed'));
        }
      };

      focusSequence();
    }
  }, [active, isActive, onError, gameFlowDebugger]);

  // Focus lock when section becomes active and progress threshold met
  useEffect(() => {
    if ((active || isActive) && progress > 0.2 && focusTargetLocked) {
      const dofValue = depthOfField ?? 0;
      const target = {
        element: sectionRef.current,
        section: 'focus',
        depthOfField: dofValue
      };

      if (onFocusLock && typeof onFocusLock === 'function') {
        onFocusLock(target, dofValue);
      }
      gameFlowDebugger.log('info', 'camera', 'Focus locked on technical profile', { depthOfField: dofValue });
    }
  }, [active, isActive, progress, depthOfField, focusTargetLocked, onFocusLock, gameFlowDebugger]);

  // Mouse movement handler for focus point
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });

    // Update focus point with subtle camera-like behavior
    setFocusPoint({
      x: x * 0.3 + focusPoint.x * 0.7, // Smooth following
      y: y * 0.3 + focusPoint.y * 0.7
    });
  }, [focusPoint]);

  // Career timeline - 25 year progression
  const careerMilestones = [
    {
      year: 2000,
      era: 'Early Commerce',
      scale: '10K→100K users',
      role: 'Platform Engineer',
      achievement: 'Built first enterprise commerce systems'
    },
    {
      year: 2008,
      era: 'Scale & Growth',
      scale: '100K→1M users',
      role: 'Technical Architect',
      achievement: 'Led Microsoft & Oracle platform teams'
    },
    {
      year: 2015,
      era: 'Enterprise Transformation',
      scale: '1M→10M users',
      role: 'Enterprise Architect',
      achievement: 'Fortune 500 multi-cloud migrations'
    },
    {
      year: 2020,
      era: 'AI-First Strategy',
      scale: 'Answer-first commerce',
      role: 'Strategic Advisor',
      achievement: 'AI governance & transformation frameworks'
    },
    {
      year: 2023,
      era: 'Song',
      scale: 'Accenture',
      role: 'Current',
      achievement: 'Leading AI-native commerce innovation',
      current: true
    }
  ];

  // Areas of focus - strategic capabilities
  const focusAreas = [
    {
      area: 'Enterprise Architecture',
      description: 'Multi-tenant platforms processing $2B+ GMV. Event-driven systems serving 50M+ active users.',
      color: 'violet'
    },
    {
      area: 'AI Governance',
      description: 'Verification boundaries for regulated commerce. Model reliability frameworks for production environments.',
      color: 'cyan'
    },
    {
      area: 'Digital Transformation',
      description: 'Legacy migration strategies. Zero-downtime cutover patterns for Fortune 500 scale.',
      color: 'green'
    }
  ];

  // Technical depth - implementation experience
  const technicalDepth = [
    {
      area: 'Commerce Platforms',
      years: '15+ years',
      stack: ['SAP Commerce (Hybris)', 'Salesforce Commerce Cloud', 'Adobe Commerce', 'Headless Architecture']
    },
    {
      area: 'Integration Patterns',
      years: '20+ years',
      stack: ['Order Orchestration', 'Real-time Inventory', 'Event-Driven Architecture', 'Microservices']
    },
    {
      area: 'Cloud Infrastructure',
      years: '10+ years',
      stack: ['Multi-cloud Strategy', 'Kubernetes', 'Serverless', 'Edge Computing']
    }
  ];

  return (
    <section
      ref={(el) => {
        sectionRef.current = el;
        sectionAnimRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      id="focus"
      className={`min-h-screen relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 ${getClasses(sectionVisible)} ${className}`}
      data-testid="focus-section"
      data-active={active || isActive}
      data-progress={progress}
      data-focus-locked={focusTargetLocked}
      data-section="focus"
      data-camera-metaphor="true"
      onMouseMove={handleMouseMove}
      aria-label="Focus section - About and expertise details"
    >
      {/* Focus depth of field background effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 transition-all duration-1000"
        style={{
          filter: `blur(${Math.max(0, 8 - (depthOfField || 0) * 10)}px)`,
          opacity: focusTargetLocked ? 0.3 : 0.8
        }}
      />

      {/* Dynamic focus indicator following mouse */}
      <div
        className={`absolute w-32 h-32 border-2 border-white/40 rounded-full pointer-events-none transition-all duration-300 ${
          focusTargetLocked ? 'border-green-400 shadow-lg shadow-green-400/30' : ''
        }`}
        style={{
          left: `${focusPoint.x}%`,
          top: `${focusPoint.y}%`,
          transform: 'translate(-50%, -50%)',
          boxShadow: focusTargetLocked ? '0 0 20px rgba(34, 197, 94, 0.4)' : 'none'
        }}
      >
        <div className="absolute inset-2 border border-white/20 rounded-full" />
        <div className="absolute inset-4 border border-white/10 rounded-full" />
      </div>

      {/* Main content with focus-aware layout */}
      <div className="relative z-20 py-12 md:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-8 md:space-y-16">

          {/* Title Section - Full Width */}
          <div
            className={`transition-all duration-1000 ${
              sectionVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="text-sm text-white/60 uppercase tracking-wider mb-2">About</div>
            <h2
              ref={headingRef}
              className={`text-4xl md:text-6xl font-black text-white leading-tight ${getClasses(headingVisible)}`}
            >
              Systems Thinking Meets
              <span className="block text-athletic-brand-violet">Enterprise Reality</span>
            </h2>
            <p className="text-lg text-white/70 mt-4 leading-relaxed max-w-4xl 2xl:max-w-5xl">
              25 years building commerce infrastructure that holds up when it matters—from early-stage platforms to Fortune 500 enterprise transformations.
            </p>
          </div>

          {/* About Narrative - Full Width Single Column */}
          <div
            ref={bodyRef}
            className={`prose prose-lg prose-invert max-w-4xl 2xl:max-w-5xl ${getClasses(bodyVisible)}`}
            data-testid="about-narrative"
          >
            <p className="text-xl text-white/90 leading-[1.7] mb-6">
              Enterprise systems fail in predictable ways: missing ownership boundaries, ignored second-order effects, architecture decisions made without understanding deployment constraints.
            </p>

            <p className="text-lg text-white/80 leading-[1.8] mb-4">
              26 years building infrastructure that survives production:
            </p>

            <ul className="space-y-4 text-white/85 mb-6 ml-6">
              <li className="flex items-start">
                <span className="text-violet-400 mr-4 mt-1 flex-shrink-0">✓</span>
                <span>Commerce platforms processing $50B+ annually</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-4 mt-1 flex-shrink-0">✓</span>
                <span>Event-driven order orchestration serving 50M+ users</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-4 mt-1 flex-shrink-0">✓</span>
                <span>AI governance frameworks reducing deployment risk 73%</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-4 mt-1 flex-shrink-0">✓</span>
                <span>Real-time systems maintaining 99.97% uptime at scale</span>
              </li>
            </ul>

            <div className="mb-8">
              <button
                onClick={() => setIsThesisModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                data-testid="architect-principle-button"
              >
                Read: The Architect's Principle
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>

          {/* Two Column: Areas of Focus + Technical Depth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Areas of Focus - Left Column */}
            <div className={getClasses(bodyVisible)}>
              <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Areas of Focus</h3>
                <div className="space-y-6">
                  {focusAreas.map((area) => (
                    <div key={area.area} className="group">
                      <div className="flex items-start gap-4">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-${area.color}-400`} />
                        <div>
                          <h4 className="text-white font-medium mb-2">{area.area}</h4>
                          <p className="text-sm text-white/70 leading-relaxed">{area.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Depth - Right Column */}
            <div
              className={getClasses(bodyVisible)}
              data-testid="integrated-stats-card"
            >
              <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Technical Depth</h3>
                <div className="space-y-6">
                  {technicalDepth.map((area) => (
                    <div key={area.area} className="group">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{area.area}</h4>
                        <span className="text-xs text-white/50">{area.years}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {area.stack.map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-white/5 text-white/60 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Career Timeline - Full Width at Bottom */}
          <div className="relative">
            <div
              className={`transition-all duration-1000 delay-500 ${
                sectionVisible ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-8 scale-95'
              }`}
              data-testid="career-timeline-card"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 sports-statistics-style">
                {/* Header */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white">25 Year Journey</h3>
                  <p className="text-sm text-white/50 mt-1">2000 → 2025 • Enterprise Scale Evolution</p>
                </div>

                {/* Timeline Visualization */}
                <div className="relative mb-8">
                  {/* Timeline base line */}
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />

                  {/* Milestone points */}
                  <div className="relative flex justify-between items-center">
                    {careerMilestones.map((milestone, index) => (
                      <div
                        key={milestone.year}
                        className="group relative flex flex-col items-center cursor-pointer"
                        data-testid={`milestone-${milestone.year}`}
                      >
                        {/* Timeline dot */}
                        <div
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            milestone.current
                              ? 'bg-athletic-brand-violet ring-4 ring-athletic-brand-violet/30'
                              : 'bg-white/40 group-hover:bg-athletic-brand-violet group-hover:ring-4 group-hover:ring-athletic-brand-violet/30'
                          }`}
                          style={{
                            animationDelay: `${index * 150}ms`
                          }}
                        />

                        {/* Year label */}
                        <div className="text-xs text-white/60 mt-2 font-mono">{milestone.year}</div>

                        {/* Hover expansion card */}
                        <div className="absolute top-full mt-6 w-48 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-10">
                          <div className="bg-black/90 backdrop-blur-md border border-athletic-brand-violet/30 rounded-lg p-4 shadow-2xl">
                            <div className="text-xs text-athletic-brand-violet font-semibold mb-1">{milestone.era}</div>
                            <div className="text-sm text-white font-medium mb-2">{milestone.role}</div>
                            <div className="text-xs text-white/70 mb-2">{milestone.scale}</div>
                            <div className="text-xs text-white/50 leading-relaxed">{milestone.achievement}</div>
                          </div>
                          {/* Arrow pointer */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-athletic-brand-violet/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current snapshot */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wide mb-2">Current Role</div>
                    <div className="text-2xl font-light text-white">Song</div>
                    <div className="text-sm text-white/60">Accenture • Feb 2023 - Present</div>
                  </div>

                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wide mb-2">Focus Areas</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-4 py-1 bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-md text-xs font-medium">SAP Commerce</span>
                      <span className="px-4 py-1 bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-md text-xs font-medium">Salesforce</span>
                      <span className="px-4 py-1 bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-md text-xs font-medium">Adobe</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wide mb-2">AI-Native Strategy</div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Answer-first commerce • Agentic systems • Context-aware experiences
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ViewfinderOverlay in focus mode */}
      <ViewfinderOverlay
        isActive={active || isActive}
        mode="focus"
        showMetadataHUD={focusTargetLocked}
        className="z-30"
        data-testid="viewfinder-overlay"
        data-mode="focus"
        data-focus-locked={focusTargetLocked}
      />

      {/* Depth of field controls - Hidden (internal tracking only) */}

      {/* Smooth transition fade for seamless section flow */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-neutral-900 to-transparent z-30 pointer-events-none" />

      <style>{`
        @keyframes animate-in {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .sports-statistics-style {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .prose p strong {
          color: rgba(139, 92, 246, 1);
          font-weight: 600;
        }

        details[open] summary {
          color: rgba(139, 92, 246, 1);
        }
      `}</style>

      {/* ThesisModal */}
      <ThesisModal
        isOpen={isThesisModalOpen}
        onClose={() => setIsThesisModalOpen(false)}
      />
    </section>
  );
});

FocusSection.displayName = 'FocusSection';

export default FocusSection;