import React, { forwardRef, useEffect, useCallback, useState, useRef } from 'react';
import { useUnifiedGameFlow } from '../../src/contexts/UnifiedGameFlowContext';
import { useGameFlowDebugger } from '../../src/hooks/useGameFlowDebugger';
import ViewfinderOverlay from '../../src/components/layout/ViewfinderOverlay';

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

  // Focus readiness sequence
  useEffect(() => {
    if (active || isActive) {
      gameFlowDebugger.startBenchmark('focus-section-ready');

      const focusSequence = async () => {
        try {
          // Focus targeting sequence
          await new Promise(resolve => setTimeout(resolve, 300));
          setFocusTargetLocked(true);

          await new Promise(resolve => setTimeout(resolve, 400));
          setProfileRevealed(true);

          await new Promise(resolve => setTimeout(resolve, 500));
          setStatsAnimated(true);

          await new Promise(resolve => setTimeout(resolve, 300));
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

  // Athletic stats data
  const athleticStats = [
    { label: 'Experience', value: '20+', unit: 'years', icon: '🏆' },
    { label: 'Team Scale', value: '100+', unit: 'resources', icon: '👥' },
    { label: 'Architecture', value: '15+', unit: 'systems', icon: '🏗️' },
    { label: 'Performance', value: '99.9%', unit: 'uptime', icon: '⚡' }
  ];

  // Technical stack organized by focus areas
  const technicalAreas = [
    {
      area: 'Enterprise Architecture',
      skills: ['System Design', 'Microservices', 'Cloud Infrastructure', 'API Strategy'],
      proficiency: 95,
      experience: '15+ years'
    },
    {
      area: 'Full-Stack Development',
      skills: ['React/TypeScript', 'Node.js', 'Python', 'Database Design'],
      proficiency: 92,
      experience: '18+ years'
    },
    {
      area: 'Leadership & Strategy',
      skills: ['Team Building', 'Technical Vision', 'Stakeholder Management', 'Agile Practices'],
      proficiency: 88,
      experience: '12+ years'
    }
  ];

  return (
    <section
      ref={(el) => {
        sectionRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      id="focus"
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 ${className}`}
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
      <div className="relative z-20 min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* About Narrative - Left Column */}
          <div className="space-y-8">
            <div
              className={`transition-all duration-1000 ${
                profileRevealed ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              data-testid="about-narrative"
            >
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                Precision in
                <span className="block text-athletic-brand-violet">Focus</span>
              </h2>

              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-xl text-white/90 leading-relaxed mb-6">
                  Twenty years of architecting enterprise systems has taught me that excellence
                  isn't just about the final product—it's about the precision of focus throughout
                  the entire process.
                </p>

                <p className="text-lg text-white/80 leading-relaxed mb-6">
                  From leading 100+ person engineering teams to capturing the decisive moment
                  in action sports, I've learned that success requires the same fundamental skill:
                  <strong className="text-white font-semibold"> knowing exactly where to focus your attention</strong>.
                </p>

                <p className="text-lg text-white/80 leading-relaxed">
                  In software architecture, this means identifying the critical system constraints
                  before they become problems. In photography, it means anticipating the moment
                  before it happens. In both worlds,
                  <strong className="text-athletic-brand-violet"> precision beats perfection</strong>.
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
                  <h3 className="text-2xl font-bold text-white mb-2">Performance Metrics</h3>
                  <p className="text-white/70">Career Statistics</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
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
                    </div>
                  ))}
                </div>

                {/* Performance indicators */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">System Reliability</span>
                    <span className="text-green-400 font-semibold">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-white/70">Team Satisfaction</span>
                    <span className="text-green-400 font-semibold">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-white/70">Project Success Rate</span>
                    <span className="text-green-400 font-semibold">98%</span>
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

      {/* Focus status indicators */}
      <div className="absolute top-4 left-4 z-40 space-y-2">
        <div
          className={`flex items-center space-x-2 text-sm font-mono ${
            focusTargetLocked ? 'text-green-400' : 'text-yellow-400'
          } transition-colors duration-300`}
        >
          <div className={`w-2 h-2 rounded-full ${focusTargetLocked ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
          <span>FOCUS {focusTargetLocked ? 'LOCKED' : 'SEEKING'}</span>
        </div>

        {focusTargetLocked && (
          <div className={`flex items-center space-x-2 text-sm font-mono ${profileRevealed ? 'text-green-400' : 'text-yellow-400'} transition-colors duration-300`}>
            <div className={`w-2 h-2 rounded-full ${profileRevealed ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            <span>PROFILE {profileRevealed ? 'REVEALED' : 'LOADING'}</span>
          </div>
        )}

        {profileRevealed && (
          <div className={`flex items-center space-x-2 text-sm font-mono ${statsAnimated ? 'text-green-400' : 'text-yellow-400'} transition-colors duration-300`}>
            <div className={`w-2 h-2 rounded-full ${statsAnimated ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            <span>STATS {statsAnimated ? 'ACTIVE' : 'CALC'}</span>
          </div>
        )}
      </div>

      {/* Depth of field controls for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 p-3 rounded text-white text-xs z-50">
          <div>DoF: {depthOfField?.toFixed(2) ?? 'N/A'}</div>
          <div>Progress: {(progress * 100).toFixed(0)}%</div>
          <div>Focus: {focusTargetLocked ? 'Locked' : 'Seeking'}</div>
        </div>
      )}

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