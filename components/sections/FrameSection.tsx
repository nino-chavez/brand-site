import React, { forwardRef, useEffect, useCallback, useState, useRef } from 'react';
import { useUnifiedGameFlow } from '../../src/contexts/UnifiedGameFlowContext';
import { useGameFlowDebugger } from '../../src/hooks/useGameFlowDebugger';
import ViewfinderOverlay from '../../src/components/layout/ViewfinderOverlay';
import { useScrollAnimation, useAnimationWithEffects } from '../../src/hooks/useScrollAnimation';
import { WORK_PROJECTS } from '../../src/constants';
import type { WorkProject } from '../../src/types';

interface ExposureSettings {
  aperture: number;
  shutterSpeed: number;
  iso: number;
  exposureCompensation: number;
}

interface FrameSectionProps {
  active: boolean;
  progress: number;
  exposureSettings: ExposureSettings;
  onExposureAdjust: (settings: Partial<ExposureSettings>) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  technologies: string[];
  architecture: string[];
  challenges: string[];
  outcomes: string[];
  metrics?: {
    performance: string;
    scale: string;
    timeline: string;
  };
  repository?: string;
  demo?: string;
}

const FrameSection = forwardRef<HTMLElement, FrameSectionProps>(({
  active,
  progress,
  exposureSettings,
  onExposureAdjust,
  onError,
  className = ''
}, ref) => {
  // Game Flow section hook
  const { state, actions } = useUnifiedGameFlow();
  const isActive = state.currentSection === 'frame';

  // Debug logging
  const gameFlowDebugger = useGameFlowDebugger();

  // Component state
  const [compositionLocked, setCompositionLocked] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);

  // Effects context for user-controlled animations
  const { getClasses } = useAnimationWithEffects();

  // Section-level animation (whole section entrance)
  const { elementRef: sectionAnimRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.15,
    triggerOnce: true
  });

  // Content-level animations (staggered after section)
  const { elementRef: headingRef, isVisible: headingVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const { elementRef: subtitleRef, isVisible: subtitleVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const { elementRef: projectsRef, isVisible: projectsVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  /**
   * Project portfolio data - Now centralized in src/constants.ts
   *
   * DATA SOURCE: This component imports project data from src/constants.ts
   * DO NOT hardcode project data here. Update WORK_PROJECTS in constants.ts instead.
   *
   * This ensures single source of truth for content updates across all layout modes.
   */
  const projects = WORK_PROJECTS as Project[];

  // Frame composition sequence
  useEffect(() => {
    if (active || isActive) {
      gameFlowDebugger.startBenchmark('frame-section-ready');

      const frameSequence = async () => {
        try {
          // Instant content reveal - no delays for immediate visibility
          setCompositionLocked(true);
          setProjectsLoaded(true);

          gameFlowDebugger.endBenchmark('frame-section-ready');

        } catch (error) {
          gameFlowDebugger.log('error', 'section', 'Frame section readiness failed', error);
          onError?.(error instanceof Error ? error : new Error('Frame section failed'));
        }
      };

      frameSequence();
    }
  }, [active, isActive, onError, gameFlowDebugger]);

  // Project selection handler
  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProject(projectId);
    setSidePanelOpen(true);

    const projectIndex = projects.findIndex(p => p.id === projectId);
    setCurrentProjectIndex(projectIndex);

    // Auto-scroll panel to top when opening - ensures content is visible
    // Use longer delay + requestAnimationFrame to ensure DOM is ready
    setTimeout(() => {
      requestAnimationFrame(() => {
        if (panelContentRef.current) {
          panelContentRef.current.scrollTop = 0; // Instant scroll to top
        }
      });
    }, 300); // Increased delay to match slide-in animation

    gameFlowDebugger.log('info', 'interaction', 'Project selected for detailed view', { projectId });
  }, [projects, gameFlowDebugger]);

  // Panel scroll management
  const panelContentRef = useRef<HTMLDivElement>(null);
  const [panelScrolled, setPanelScrolled] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Close side panel
  const handleCloseSidePanel = useCallback(() => {
    setSidePanelOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  }, []);

  // Navigate between projects in side panel
  const handleNextProject = useCallback(() => {
    const nextIndex = (currentProjectIndex + 1) % projects.length;
    setCurrentProjectIndex(nextIndex);
    setSelectedProject(projects[nextIndex].id);

    // Scroll to top when switching projects - instant scroll
    requestAnimationFrame(() => {
      if (panelContentRef.current) {
        panelContentRef.current.scrollTop = 0;
      }
    });
  }, [currentProjectIndex, projects]);

  const handlePreviousProject = useCallback(() => {
    const prevIndex = currentProjectIndex === 0 ? projects.length - 1 : currentProjectIndex - 1;
    setCurrentProjectIndex(prevIndex);
    setSelectedProject(projects[prevIndex].id);

    // Scroll to top when switching projects - instant scroll
    requestAnimationFrame(() => {
      if (panelContentRef.current) {
        panelContentRef.current.scrollTop = 0;
      }
    });
  }, [currentProjectIndex, projects]);

  // Track panel scroll position for visual indicators
  useEffect(() => {
    const panelContent = panelContentRef.current;
    if (!panelContent) return;

    const handleScroll = () => {
      const scrollTop = panelContent.scrollTop;
      const scrollHeight = panelContent.scrollHeight;
      const clientHeight = panelContent.clientHeight;

      setPanelScrolled(scrollTop > 20);
      setShowScrollIndicator(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 20);
    };

    panelContent.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => panelContent.removeEventListener('scroll', handleScroll);
  }, [sidePanelOpen, selectedProject]);

  // Keyboard navigation for panel
  useEffect(() => {
    if (!sidePanelOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleCloseSidePanel();
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handlePreviousProject();
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleNextProject();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidePanelOpen, handleCloseSidePanel, handleNextProject, handlePreviousProject]);

  // Get selected project data
  const selectedProjectData = selectedProject ? projects.find(p => p.id === selectedProject) : null;

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
      id="frame"
      className={`min-h-screen relative bg-gradient-to-br from-neutral-900 via-slate-800 to-neutral-900 ${getClasses(sectionVisible)} ${className}`}
      data-testid="frame-section"
      data-active={active || isActive}
      data-progress={progress}
      data-composition-locked={compositionLocked}
      data-section="frame"
      data-camera-metaphor="true"
      aria-label="Frame section - Project portfolio and technical details"
    >
      {/* Grid lines for composition framing */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${compositionLocked ? 'opacity-20' : 'opacity-0'}`}>
        {/* Rule of thirds grid */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-white/20" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-white/20" />
        <div className="absolute left-1/3 top-0 w-px h-full bg-white/20" />
        <div className="absolute left-2/3 top-0 w-px h-full bg-white/20" />
      </div>

      {/* Main project sequence - high fidelity display */}
      <div className="relative z-20 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-7xl mx-auto px-8 py-8">

            {/* Section header */}
            <div className="text-center mb-16">
              <div className="text-sm text-white/60 uppercase tracking-wider mb-2">Personal Projects</div>
              <h2
                ref={headingRef}
                className={`text-4xl md:text-6xl font-black text-white mb-6 leading-tight ${getClasses(headingVisible)}`}
              >
                What I Build
                <span className="block text-athletic-brand-violet">When Nobody's Watching</span>
              </h2>
              <p
                ref={subtitleRef}
                className={`text-xl text-white/80 max-w-3xl mx-auto leading-relaxed ${getClasses(subtitleVisible)}`}
              >
                Two decades building Fortune 500 commerce platforms. Can't show you that work.<br />
                What I can show: what I build on my own time, solving problems I'm not paid to solve.
              </p>
            </div>

            {/* Project sequence - high fidelity grid */}
            <div
              ref={projectsRef}
              className={`${getClasses(projectsVisible)} high-fidelity`}
              data-testid="project-sequence"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="group cursor-pointer"
                    onClick={() => handleProjectSelect(project.id)}
                    data-testid="project-card"
                    style={{
                      animationDelay: `${index * 200}ms`
                    }}
                  >
                    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">

                      {/* Gradient overlay on hover - Phase 1 enhancement */}
                      <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

                      {/* Project preview */}
                      <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center overflow-hidden">
                        <div className="text-6xl opacity-20 transition-transform duration-500 group-hover:scale-110">◈</div>
                      </div>

                      {/* Project summary */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-athletic-brand-violet transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-white/60 text-sm mb-4">{project.subtitle}</p>

                        {/* Key technologies */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 text-xs bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-white/10 text-white/60 rounded-md">
                              +{project.technologies.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Key outcomes summary */}
                        {project.outcomes && project.outcomes.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <div className="text-xs text-white/50 uppercase tracking-wide font-semibold mb-1">Key Outcomes</div>
                            <div className="grid grid-cols-2 gap-2">
                              {project.outcomes.slice(0, 2).map((outcome, idx) => (
                                <div key={idx} className="flex items-start space-x-1">
                                  <span className="text-green-400 mt-0.5">✓</span>
                                  <span className="text-xs text-white/70 leading-tight">{outcome}</span>
                                </div>
                              ))}
                            </div>
                            {project.outcomes.length > 2 && (
                              <div className="text-xs text-white/40">
                                +{project.outcomes.length - 2} more outcomes
                              </div>
                            )}
                          </div>
                        )}

                        {/* Slide-in CTA - Phase 1 enhancement */}
                        <div className="mt-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="inline-flex items-center text-athletic-brand-violet text-sm font-semibold">
                            View Full Details
                            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side panel for project technical details */}
      <div
        className={`fixed top-0 right-0 h-full w-full lg:w-1/2 bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 transform transition-transform duration-500 ${
          sidePanelOpen ? 'translate-x-0 slide-in' : 'translate-x-full'
        }`}
        data-testid="project-tech-side-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        aria-describedby="panel-description"
      >
        {selectedProjectData && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Panel header - adds shadow when content scrolled */}
            <div className={`flex items-center justify-between p-6 border-b border-white/10 transition-shadow duration-300 ${
              panelScrolled ? 'shadow-lg shadow-black/50' : ''
            }`}>
              <div>
                <h3 id="panel-title" className="text-2xl font-bold text-white">{selectedProjectData.title}</h3>
                <p id="panel-description" className="text-white/60">{selectedProjectData.subtitle}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousProject}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Previous project"
                  aria-label="Previous project"
                >
                  ←
                </button>
                <button
                  onClick={handleNextProject}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Next project"
                  aria-label="Next project"
                >
                  →
                </button>
                <button
                  onClick={handleCloseSidePanel}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Close panel"
                  aria-label="Close panel"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Panel content - scrollable with ref for auto-scroll */}
            <div
              ref={panelContentRef}
              className="flex-1 overflow-y-auto p-6 space-y-8"
            >

              {/* Project description */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Overview</h4>
                <p className="text-white/80 leading-relaxed">{selectedProjectData.description}</p>
              </div>

              {/* Performance metrics */}
              {selectedProjectData.metrics && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Response Time</span>
                      <span className="text-green-400 font-semibold">{selectedProjectData.metrics.performance}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Scale</span>
                      <span className="text-blue-400 font-semibold">{selectedProjectData.metrics.scale}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Timeline</span>
                      <span className="text-purple-400 font-semibold">{selectedProjectData.metrics.timeline}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Project-specific technical stack */}
              <div data-testid="project-specific-stack">
                <h4 className="text-lg font-semibold text-white mb-4">Technology Stack</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProjectData.technologies.map((tech) => (
                    <div
                      key={tech}
                      className="px-3 py-2 bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-lg text-sm text-center"
                    >
                      {tech}
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural rationale */}
              <div data-testid="architectural-rationale">
                <h4 className="text-lg font-semibold text-white mb-4">Architecture Patterns</h4>
                <div className="space-y-2">
                  {selectedProjectData.architecture.map((pattern) => (
                    <div key={pattern} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-athletic-brand-violet rounded-full" />
                      <span className="text-white/80">{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key challenges */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Technical Challenges</h4>
                <div className="space-y-2">
                  {selectedProjectData.challenges.map((challenge) => (
                    <div key={challenge} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                      <span className="text-white/80">{challenge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcomes */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Key Outcomes</h4>
                <div className="space-y-2">
                  {selectedProjectData.outcomes.map((outcome) => (
                    <div key={outcome} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-white/80">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll indicator - shows when there's more content below */}
            {showScrollIndicator && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent pointer-events-none flex items-end justify-center pb-4">
                <div className="flex flex-col items-center space-y-1 animate-bounce">
                  <span className="text-white/50 text-xs">More below</span>
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ViewfinderOverlay in frame mode */}
      <ViewfinderOverlay
        isActive={active || isActive}
        mode="frame"
        showMetadataHUD={compositionLocked}
        className="z-30"
        data-testid="viewfinder-overlay"
        data-mode="frame"
        data-composition-locked={compositionLocked}
      />

      {/* Frame status indicators */}
      {/* Frame composition indicators - Hidden (internal tracking only) */}

      {/* Exposure settings display - Hidden (internal tracking only) */}

      {/* Smooth transition fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-neutral-900 to-transparent z-30 pointer-events-none" />

      <style>{`
        .high-fidelity {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        .slide-in {
          animation: slideInFromRight 0.5s ease-out;
        }

        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Overlay to keep main content visible when side panel opens */
        .main-sequence {
          filter: none;
          transition: filter 0.3s ease;
        }

        .main-sequence.with-panel {
          filter: brightness(0.7);
        }
      `}</style>
    </section>
  );
});

FrameSection.displayName = 'FrameSection';

export default FrameSection;