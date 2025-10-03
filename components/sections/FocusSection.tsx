import React, { forwardRef, useEffect, useCallback, useState, useRef } from 'react';
import { useUnifiedGameFlow } from '../../src/contexts/UnifiedGameFlowContext';
import { useGameFlowDebugger } from '../../src/hooks/useGameFlowDebugger';
import ViewfinderOverlay from '../../src/components/layout/ViewfinderOverlay';
import { useScrollAnimation, useAnimationWithEffects } from '../../src/hooks/useScrollAnimation';

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

  // Mouse tracking for focus interactions
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [focusPoint, setFocusPoint] = useState({ x: 50, y: 50 });
  const sectionRef = useRef<HTMLElement>(null);

  // Effects context for user-controlled animations
  const { getClasses } = useAnimationWithEffects();

  // Section-level animation (whole section entrance) - trigger at section border
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

  // Career statistics - grounded in real experience
  const athleticStats = [
    { label: 'Experience', value: '25', unit: 'years', context: 'enterprise architecture', icon: '🏆' },
    { label: 'Current Role', value: 'Song', unit: 'Accenture', context: 'Feb 2023 - Present', icon: '👥' },
    { label: 'Focus', value: 'Commerce', unit: 'platforms', context: 'SAP • Salesforce • Adobe', icon: '🏗️' },
    { label: 'Specialty', value: 'AI-Native', unit: 'strategy', context: 'Answer-first transformation', icon: '⚡' }
  ];

  // Technical stack organized by focus areas
  const technicalAreas = [
    {
      area: 'Commerce Platforms',
      skills: ['SAP Commerce (Hybris)', 'Salesforce Commerce Cloud', 'Adobe Commerce', 'Headless Architecture'],
      proficiency: 95,
      experience: '15+ years'
    },
    {
      area: 'Integration Architecture',
      skills: ['Order Management', 'Inventory Sync', 'Fulfillment Systems', 'Event-Driven Integration'],
      proficiency: 92,
      experience: '20+ years'
    },
    {
      area: 'AI-Native Strategy',
      skills: ['Answer-First Commerce', 'Agentic Systems', 'Context-Aware Experiences', 'Progressive Enhancement'],
      proficiency: 88,
      experience: 'Current focus'
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
      <div className="relative z-20 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* About Narrative - Left Column */}
          <div className="space-y-8">
            <div
              className={`transition-all duration-1000 ${
                profileRevealed ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              data-testid="about-narrative"
            >
              <div className="mb-6">
                <div className="text-sm text-white/60 uppercase tracking-wider mb-2">About</div>
                <h2
                  ref={headingRef}
                  className={`text-4xl md:text-6xl font-black text-white leading-tight ${getClasses(headingVisible)}`}
                >
                  Systems Thinking Meets
                  <span className="block text-athletic-brand-violet">Enterprise Reality</span>
                </h2>
                <p className="text-lg text-white/70 mt-4 leading-relaxed">
                  25 years building commerce infrastructure that holds up when it matters—from early-stage platforms to Fortune 500 enterprise transformations.
                </p>
              </div>

              <div
                ref={bodyRef}
                className={`prose prose-lg prose-invert max-w-none ${getClasses(bodyVisible)}`}
              >
                <p className="text-xl text-white/90 leading-relaxed mb-6">
                  I'm a systems thinker, photographer, and strategist. By trade, I work in enterprise architecture—helping teams navigate ambiguity and build things that hold up over time.
                </p>

                <p className="text-lg text-white/80 leading-relaxed mb-6">
                  I don't delegate the thinking. While others chase the spotlight—the shiny new framework, the trending architecture pattern—I focus on the stage: <strong className="text-white font-semibold">the entire system of ownership, scope, and second-order effects where ideas must actually live</strong>.
                </p>

                <p className="text-lg text-white/80 leading-relaxed mb-6">
                  My specialty is "reading the road"—identifying patterns others miss and translating complex technical concepts into clear, strategic language that executives can act on. Quiet leadership is my lane. I'd rather hold up a mirror than take the mic.
                </p>

                <p className="text-lg text-white/80 leading-relaxed">
                  Leadership is "living in the gap"—holding the long-term vision while remaining present with the team's reality. I coach without coddling, empower teams with autonomy and clear guardrails, and arrive not just fast, but <strong className="text-athletic-brand-violet">together</strong>.
                </p>
              </div>

              {/* Integrated technical stack inline */}
              <div
                className={`mt-8 transition-all duration-800 delay-300 ${
                  narrativeProgressed ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
                }`}
                data-testid="technical-stack-inline"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Areas of Focus</h3>
                <div className="space-y-3">
                  {technicalAreas.map((area, index) => (
                    <div key={area.area} className="group">
                      <div className="flex items-center justify-between text-sm text-white/70 mb-1">
                        <span>{area.area}</span>
                        <span>{area.experience}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1">
                        <div
                          className="bg-athletic-brand-violet h-1 rounded-full transition-all duration-1000 delay-500"
                          style={{
                            width: narrativeProgressed ? `${area.proficiency}%` : '0%'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Athletic Stats Card - Right Column */}
          <div className="relative">
            <div
              className={`transition-all duration-1000 delay-200 ${
                statsAnimated ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-8 scale-95'
              } ${statsAnimated ? 'animate-in' : 'hidden'}`}
              data-testid="athletic-stats-card"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 sports-statistics-style">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Career Snapshot</h3>
                  <p className="text-white/70">At a Glance</p>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {athleticStats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className="text-center"
                      style={{
                        animationDelay: `${index * 200}ms`
                      }}
                      data-testid={`${stat.label.toLowerCase().replace(' ', '-')}-stat`}
                    >
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-3xl font-black text-athletic-brand-violet mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-white/60 uppercase tracking-wide">
                        {stat.unit}
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-white/40 mt-1 leading-tight">
                        {stat.context}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Core Expertise Section */}
                <div className="mb-8 pt-6 border-t border-white/10">
                  <div className="text-xs text-white/50 uppercase tracking-wide mb-4">Core Expertise</div>
                  <div className="space-y-4">
                    {/* Commerce Platforms */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Enterprise Commerce</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-md text-xs">SAP Commerce</span>
                        <span className="px-3 py-1 bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-md text-xs">Salesforce</span>
                        <span className="px-3 py-1 bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-md text-xs">Adobe</span>
                      </div>
                    </div>

                    {/* AI-Native Strategy */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">AI-Native Strategy</h4>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Answer-first commerce • Agentic systems • Context-aware experiences
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrated stats card (contextual) */}
            <div
              className={`mt-6 transition-all duration-800 delay-700 ${
                narrativeProgressed ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}
              data-testid="integrated-stats-card"
            >
              <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Technical Depth</h4>

                <div className="space-y-4">
                  {technicalAreas.map((area, index) => (
                    <details key={area.area} className="group">
                      <summary className="cursor-pointer text-white/80 hover:text-white transition-colors">
                        {area.area} <span className="text-white/50">→</span>
                      </summary>
                      <div className="mt-2 ml-4 space-y-1">
                        {area.skills.map((skill) => (
                          <div key={skill} className="text-sm text-white/60">• {skill}</div>
                        ))}
                      </div>
                    </details>
                  ))}
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
    </section>
  );
});

FocusSection.displayName = 'FocusSection';

export default FocusSection;