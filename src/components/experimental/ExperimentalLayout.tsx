import React, { Suspense, lazy } from 'react';
import { useExperimentalLayout } from '../../contexts/ExperimentalLayoutContext';
import type { DesignTheme } from '../../types/experimental';

// Lazy load theme implementations
const GlassmorphismTheme = lazy(() => import('./themes/GlassmorphismTheme'));
const BentoGridTheme = lazy(() => import('./themes/BentoGridTheme'));
const NeumorphismTheme = lazy(() => import('./themes/NeumorphismTheme'));
const NeobrutalistTheme = lazy(() => import('./themes/NeobrutalistTheme'));
const RetrofuturismTheme = lazy(() => import('./themes/RetrofuturismTheme'));
const BoldMinimalismTheme = lazy(() => import('./themes/BoldMinimalismTheme'));

interface ExperimentalLayoutProps {
  performanceMode?: 'high' | 'balanced' | 'low';
  debugMode?: boolean;
}

export default function ExperimentalLayout({
  performanceMode = 'high',
  debugMode = false,
}: ExperimentalLayoutProps) {
  const { state } = useExperimentalLayout();

  // Render the appropriate theme component
  const renderTheme = () => {
    const themeProps = {
      performanceMode,
      debugMode,
      isActive: !state.isTransitioning,
    };

    switch (state.currentTheme) {
      case 'glassmorphism':
        return <GlassmorphismTheme {...themeProps} />;
      case 'bento-grid':
        return <BentoGridTheme {...themeProps} />;
      case 'neumorphism':
        return <NeumorphismTheme {...themeProps} />;
      case 'neobrutalism':
        return <NeobrutalistTheme {...themeProps} />;
      case 'retrofuturism':
        return <RetrofuturismTheme {...themeProps} />;
      case 'bold-minimalism':
        return <BoldMinimalismTheme {...themeProps} />;
      default:
        return <GlassmorphismTheme {...themeProps} />;
    }
  };

  return (
    <div
      className={`experimental-layout ${state.isTransitioning ? 'transitioning' : ''}`}
      data-theme={state.currentTheme}
      data-performance={performanceMode}
    >
      {/* Accessibility: Skip to content link */}
      <a
        href="#experimental-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-violet focus:text-white focus:rounded"
      >
        Skip to experimental content
      </a>

      {/* Debug info - Development only */}
      {debugMode && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg text-sm max-w-md">
          <div className="font-semibold text-green-400 mb-2">
            🧪 Experimental Layout Debug
          </div>
          <div>Current Theme: {state.currentTheme}</div>
          <div>Previous Theme: {state.previousTheme || 'None'}</div>
          <div>Transitioning: {state.isTransitioning ? 'Yes' : 'No'}</div>
          <div>Performance: {performanceMode}</div>
        </div>
      )}

      {/* Theme content with transition wrapper */}
      <div
        className="experimental-content-wrapper"
        style={{
          opacity: state.isTransitioning ? 0.7 : 1,
          transition: `opacity ${state.transitionDuration}ms ease-in-out`,
        }}
      >
        <Suspense
          fallback={
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
              <div className="text-brand-light text-xl">
                Loading {state.currentTheme} theme...
              </div>
            </div>
          }
        >
          <main id="experimental-content" className="experimental-theme-container">
            {renderTheme()}
          </main>
        </Suspense>
      </div>

      {/* Mode indicator - Development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-40 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="font-mono">EXPERIMENTAL MODE</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .experimental-layout {
          min-height: 100vh;
          position: relative;
        }

        .experimental-layout.transitioning {
          pointer-events: none;
        }

        .experimental-content-wrapper {
          will-change: opacity;
        }

        /* Accessibility: Screen reader only utility */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: inherit;
          margin: inherit;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>
    </div>
  );
}
