import React, { useRef, useCallback, useEffect } from 'react';
import { useUnifiedGameFlow, useUnifiedPerformance } from '../../contexts/UnifiedGameFlowContext';
import { useGameFlowDebugger } from '../../hooks/useGameFlowDebugger';
import { useErrorHandling } from '../../hooks/useErrorHandling';

// Direct imports for immediate loading - lazy loading causing issues
import CaptureSection from '../../../components/sections/CaptureSection';
import FocusSection from '../../../components/sections/FocusSection';
import FrameSection from '../../../components/sections/FrameSection';
import ExposureSection from '../../../components/sections/ExposureSection';
import DevelopSection from '../../../components/sections/DevelopSection';
import PortfolioSection from '../../../components/sections/PortfolioSection';

import type { GameFlowSection } from '../../types';

interface SimplifiedGameFlowContainerProps {
  className?: string;
  performanceMode?: 'high' | 'balanced' | 'low' | 'accessible';
  debugMode?: boolean;
}

export default function SimplifiedGameFlowContainer({
  className = '',
  performanceMode = 'high',
  debugMode = false
}: SimplifiedGameFlowContainerProps) {
  // Unified state management - single source of truth!
  const { state, actions } = useUnifiedGameFlow();
  const performance = useUnifiedPerformance();

  // Keep error handling and debugging for development
  const errorHandler = useErrorHandling();
  const gameFlowDebugger = useGameFlowDebugger({ enableVisualDebugger: false });

  // Section refs for scroll coordination
  const sectionRefs = useRef<{ [key in GameFlowSection]: HTMLElement | null }>({
    capture: null,
    focus: null,
    frame: null,
    exposure: null,
    develop: null,
    portfolio: null
  });

  // Simplified scroll handler using unified state
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollProgress = Math.min(scrollTop / documentHeight, 1);

    // Update scroll progress in unified state
    actions.updateScrollProgress(scrollProgress);

    // Simple section detection based on scroll position
    const sections: GameFlowSection[] = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];
    const sectionIndex = Math.floor(scrollProgress * sections.length);
    const currentSection = sections[Math.min(sectionIndex, sections.length - 1)];

    if (currentSection !== state.currentSection) {
      // Track the transition using the unified performance system
      performance.actions.trackSectionTransition(state.currentSection, currentSection, Date.now());
      actions.navigateToSection(currentSection);
    }
  }, [
    state.currentSection,
    actions.updateScrollProgress,
    actions.navigateToSection,
    performance.actions.trackSectionTransition
  ]);

  // Set up scroll listener
  useEffect(() => {
    const throttledScroll = throttle(handleScroll, 16); // 60fps
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  // Section ready handler - simplified
  const handleSectionReady = useCallback((section: GameFlowSection) => {
    gameFlowDebugger.log('info', 'section', `Section ${section} ready`);

    // Track section load performance using unified state
    const loadTime = Date.now();
    performance.actions.trackCustomMetric(`section-${section}-load`, loadTime);
  }, [gameFlowDebugger, performance.actions]);

  // Error handler - simplified
  const handleSectionError = useCallback((error: Error, section: GameFlowSection) => {
    const gameFlowError = errorHandler.createError(
      'CONTENT_ERROR',
      `Section ${section} failed to load: ${error.message}`,
      section,
      true
    );

    // Use unified error handling
    actions.handleError(gameFlowError);
    errorHandler.handleError(gameFlowError);
  }, [errorHandler, actions]);

  // Camera interaction handler - simplified
  const handleCameraInteraction = useCallback((type: string, data?: any) => {
    actions.camera.triggerInteraction(type as any, data);
    gameFlowDebugger.log('debug', 'camera', `Camera interaction: ${type}`, data);
  }, [actions.camera, gameFlowDebugger]);

  // Section ref setter
  const setSectionRef = useCallback((section: GameFlowSection) => {
    return (element: HTMLElement | null) => {
      sectionRefs.current[section] = element;
      if (element) {
        element.id = section;
      }
    };
  }, []);

  // Navigation test handlers (for debugging)
  const handleNavigationTest = useCallback((section: GameFlowSection) => {
    actions.navigateToSection(section);
  }, [actions]);

  const handleFailingNavigation = useCallback(() => {
    const error = errorHandler.createError(
      'INTERACTION_ERROR',
      'Navigation simulation failed',
      state.currentSection,
      true
    );
    actions.handleError(error);
  }, [errorHandler, state.currentSection, actions]);

  // Memoized section-specific callbacks to prevent infinite loops
  const handleCaptureSectionReady = useCallback(() => handleSectionReady('capture'), [handleSectionReady]);
  const handleCaptureSectionError = useCallback((error: Error) => handleSectionError(error, 'capture'), [handleSectionError]);
  const handleFocusSectionReady = useCallback(() => handleSectionReady('focus'), [handleSectionReady]);
  const handleFocusSectionError = useCallback((error: Error) => handleSectionError(error, 'focus'), [handleSectionError]);
  const handleFrameSectionReady = useCallback(() => handleSectionReady('frame'), [handleSectionReady]);
  const handleFrameSectionError = useCallback((error: Error) => handleSectionError(error, 'frame'), [handleSectionError]);
  const handleExposureSectionReady = useCallback(() => handleSectionReady('exposure'), [handleSectionReady]);
  const handleExposureSectionError = useCallback((error: Error) => handleSectionError(error, 'exposure'), [handleSectionError]);
  const handleDevelopSectionReady = useCallback(() => handleSectionReady('develop'), [handleSectionReady]);
  const handleDevelopSectionError = useCallback((error: Error) => handleSectionError(error, 'develop'), [handleSectionError]);
  const handlePortfolioSectionReady = useCallback(() => handleSectionReady('portfolio'), [handleSectionReady]);
  const handlePortfolioSectionError = useCallback((error: Error) => handleSectionError(error, 'portfolio'), [handleSectionError]);

  return (
    <main className={`game-flow-container ${className}`} data-testid="game-flow-container">
      {/* Error recovery UI */}
      {state.errors.length > 0 && (
        <div className="fixed top-4 right-4 bg-red-900/80 text-white p-4 rounded-lg z-50 max-w-md">
          <div className="text-sm font-semibold mb-2">Performance Issue Detected</div>
          <div className="text-sm">Optimizing experience for better performance</div>
          <button
            onClick={() => actions.clearErrors()}
            className="mt-2 text-xs bg-red-700 px-2 py-1 rounded hover:bg-red-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sections using unified state */}
      <CaptureSection
        ref={setSectionRef('capture')}
        active={state.currentSection === 'capture'}
        progress={state.currentSection === 'capture' ? state.scrollProgress : 0}
        onSectionReady={handleCaptureSectionReady}
        onError={handleCaptureSectionError}
      />

      <FocusSection
        ref={setSectionRef('focus')}
        active={state.currentSection === 'focus'}
        progress={state.currentSection === 'focus' ? state.scrollProgress : 0}
        onSectionReady={handleFocusSectionReady}
        onError={handleFocusSectionError}
      />

      <FrameSection
        ref={setSectionRef('frame')}
        active={state.currentSection === 'frame'}
        progress={state.currentSection === 'frame' ? state.scrollProgress : 0}
        onSectionReady={handleFrameSectionReady}
        onError={handleFrameSectionError}
      />

      <ExposureSection
        ref={setSectionRef('exposure')}
        active={state.currentSection === 'exposure'}
        progress={state.currentSection === 'exposure' ? state.scrollProgress : 0}
        onSectionReady={handleExposureSectionReady}
        onError={handleExposureSectionError}
      />

      <DevelopSection
        ref={setSectionRef('develop')}
        active={state.currentSection === 'develop'}
        progress={state.currentSection === 'develop' ? state.scrollProgress : 0}
        onSectionReady={handleDevelopSectionReady}
        onError={handleDevelopSectionError}
      />

      <PortfolioSection
        ref={setSectionRef('portfolio')}
        active={state.currentSection === 'portfolio'}
        progress={state.currentSection === 'portfolio' ? state.scrollProgress : 0}
        onSectionReady={handlePortfolioSectionReady}
        onError={handlePortfolioSectionError}
      />

      {/* Debug controls only in development with explicit flag */}
      {import.meta.env.DEV && debugMode && (
        <div className="fixed bottom-4 left-4 space-x-2 z-50 opacity-20 hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleNavigationTest('focus')}
            data-testid="navigate-to-focus"
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500"
          >
            Focus
          </button>
          <button
            onClick={handleFailingNavigation}
            data-testid="failing-navigation"
            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
          >
            Test Error
          </button>
        </div>
      )}

      {/* Progress indicator */}
      <div className="hidden" data-testid="section-progress">
        {(state.scrollProgress * 100).toFixed(0)}%
      </div>
    </main>
  );
}

// Simple throttle utility
function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}