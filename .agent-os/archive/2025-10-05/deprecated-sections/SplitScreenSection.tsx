import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { useUnifiedGameFlow } from '../../contexts/UnifiedGameFlowContext';
import PhotoSequenceDisplay from '../PhotoSequenceDisplay';
import type { ExtendedProjectData } from '../PhotoSequenceDisplay';
import { athleticTokens } from '../../tokens/index';

// Sample project data for split-screen demonstration
const sampleProjects: ExtendedProjectData[] = [
  {
    id: 'tech-architecture',
    title: 'Enterprise Architecture',
    description: 'Scalable microservices design',
    imageUrl: '/images/portfolio-01.jpg',
    tags: ['Architecture', 'Microservices', 'AWS'],
    technologies: ['Architecture', 'Microservices', 'AWS'],
    strategicContent: {
      title: 'Technical Leadership',
      description: 'Enterprise-scale system design and implementation',
      keyPoints: ['Microservices Architecture', 'Cloud Infrastructure', 'DevOps Pipeline'],
      technicalDetails: 'Built scalable systems serving millions of users'
    },
    tacticalContent: {
      title: 'Implementation Strategy',
      description: 'Tactical approach to complex technical challenges',
      keyPoints: ['Performance Optimization', 'Security Implementation', 'Team Coordination'],
      metrics: { performance: '99.9% uptime', scale: '10M+ requests/day', efficiency: '40% cost reduction' }
    },
    exifData: {
      camera: 'Technical',
      lens: 'System Design',
      settings: {
        aperture: 'f/5.6',
        shutter: '1/250',
        iso: 100
      },
      location: 'Enterprise Environment',
      timestamp: '2024-Q3'
    },
    cameraMetadata: {
      cameraSystem: 'Enterprise Canon',
      shootingMode: 'Architecture',
      qualitySettings: 'Production',
      colorSpace: 'sRGB Professional'
    }
  },
  {
    id: 'sports-volleyball',
    title: 'Action Sports Photography',
    description: 'Dynamic volleyball action capture',
    imageUrl: '/images/portfolio-01.jpg',
    tags: ['Sports', 'Action', 'Photography'],
    technologies: ['Sports', 'Action', 'Photography'],
    strategicContent: {
      title: 'Athletic Precision',
      description: 'Capturing peak performance moments in sports',
      keyPoints: ['Timing Mastery', 'Movement Prediction', 'Dynamic Composition'],
      technicalDetails: 'Professional sports photography with perfect timing'
    },
    tacticalContent: {
      title: 'Action Capture',
      description: 'Technical excellence in fast-paced environments',
      keyPoints: ['High-Speed Capture', 'Perfect Timing', 'Athletic Flow'],
      metrics: { speed: '1/2000s capture', precision: '±1ms timing', quality: 'Professional grade' }
    },
    exifData: {
      camera: 'Canon R5',
      lens: '70-200mm f/2.8',
      settings: {
        aperture: 'f/2.8',
        shutter: '1/2000',
        iso: 800
      },
      location: 'Indoor Arena',
      timestamp: '2024-Tournament'
    },
    cameraMetadata: {
      cameraSystem: 'Canon R5 Professional',
      shootingMode: 'Sports Action',
      qualitySettings: 'High Performance',
      colorSpace: 'Adobe RGB'
    }
  }
];

interface SplitScreenSectionProps {
  active: boolean;
  progress: number;
  onSectionReady: () => void;
  onError: (error: Error) => void;
}

/**
 * SplitScreenSection Component
 *
 * Phase 5 split-screen storytelling section that demonstrates the technical + athletic
 * content pairing using the PhotoSequenceDisplay component in split-screen mode.
 */
const SplitScreenSection = forwardRef<HTMLElement, SplitScreenSectionProps>(({
  active,
  progress,
  onSectionReady,
  onError
}, ref) => {
  const { state, actions } = useUnifiedGameFlow();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Initialize section when it becomes active
  useEffect(() => {
    if (active && !isLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
        onSectionReady();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [active, isLoaded, onSectionReady]);

  // Handle project selection
  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProject(projectId);
    actions.trackEvent?.('split_screen_project_select', {
      projectId,
      section: 'split-screen',
      timestamp: Date.now()
    });
  }, [actions]);

  // Handle project hover
  const handleProjectHover = useCallback((projectId: string | null) => {
    if (projectId) {
      actions.trackEvent?.('split_screen_project_hover', {
        projectId,
        section: 'split-screen',
        timestamp: Date.now()
      });
    }
  }, [actions]);

  // Handle camera mode changes
  const handleCameraModeChange = useCallback((mode: 'burst' | 'focus' | 'manual' | 'auto' | 'split') => {
    actions.trackEvent?.('split_screen_mode_change', {
      mode,
      section: 'split-screen',
      timestamp: Date.now()
    });
  }, [actions]);

  // Error boundary
  const handleComponentError = useCallback((error: Error) => {
    console.error('SplitScreenSection error:', error);
    onError(error);
  }, [onError]);

  return (
    <section
      ref={ref}
      id="split-screen"
      className={`split-screen-section relative min-h-screen transition-all duration-700 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: `linear-gradient(135deg,
          ${athleticTokens.colors['court-navy']} 0%,
          ${athleticTokens.colors['brand-violet']} 50%,
          ${athleticTokens.colors['court-orange']} 100%)`,
        color: '#ffffff'
      }}
      data-testid="split-screen-section"
      aria-label="Split-screen storytelling section"
    >
      {/* Section Header */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
            Technical + Athletic
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Experience dual-perspective storytelling where technical expertise meets athletic precision.
            This split-screen interface demonstrates the intersection of software engineering and action sports photography.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm font-mono text-white/70">
            <span>Phase 5: Split-Screen Storytelling</span>
            <span>•</span>
            <span>Interactive Demo</span>
            <span>•</span>
            <span>Technical + Athletic Content</span>
          </div>
        </div>

        {/* Split-Screen Photo Sequence Display */}
        <div className="relative">
          <PhotoSequenceDisplay
            projects={sampleProjects}
            viewfinderState={{
              mode: 'split',
              compositionLocked: false,
              focusedProject: selectedProject,
              exposureSettings: {
                aperture: 4.0,
                shutter: 160,
                iso: 320
              }
            }}
            onProjectSelect={handleProjectSelect}
            onProjectHover={handleProjectHover}
            onCameraModeChange={handleCameraModeChange}
            isLoaded={isLoaded}
            animationEnabled={state.performance.enableAnimations}
            performanceMode={state.performance.currentMode as 'high' | 'medium' | 'low'}
            className="split-screen-demo"
            data-testid="split-screen-photo-sequence"
          />
        </div>

        {/* Section Footer */}
        <div className="text-center mt-12">
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            This interface showcases how complex technical concepts can be presented alongside
            dynamic athletic content, creating engaging dual-perspective narratives.
          </p>

          {/* Progress Indicator */}
          <div className="mt-8 flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLoaded ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            <span className={`text-sm font-mono ${isLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
              SPLIT-SCREEN {isLoaded ? 'ACTIVE' : 'LOADING'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Boundary Display */}
      {state.errors.length > 0 && (
        <div className="fixed top-4 right-4 bg-red-900/90 text-white p-4 rounded-lg z-50 max-w-md">
          <div className="text-sm font-semibold mb-2">Split-Screen Error</div>
          <div className="text-xs">{state.errors[0]?.message}</div>
        </div>
      )}
    </section>
  );
});

SplitScreenSection.displayName = 'SplitScreenSection';

export default SplitScreenSection;