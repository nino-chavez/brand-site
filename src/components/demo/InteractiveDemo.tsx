/**
 * Interactive Demo Page
 *
 * Showcases the interactive portfolio system with full controls.
 * Features EffectsPanel and canvas navigation that were removed from main site.
 */

import React from 'react';
import EffectsPanel from '../effects/EffectsPanel';
import PersistentCTABar from '../canvas/PersistentCTABar';
import SimplifiedGameFlowContainer from '../sports/SimplifiedGameFlowContainer';
import Header from '../layout/Header';
import CustomCursor from '../effects/CustomCursor';
import ScrollProgress from '../effects/ScrollProgress';
import SectionAmbientLighting from '../effects/SectionAmbientLighting';
import FilmMode from '../effects/FilmMode';
import ViewfinderController from '../effects/ViewfinderController';

export const InteractiveDemo: React.FC = () => {
  const handleNavigate = (section: string) => {
    console.log('Navigate to:', section);
    // Implementation for navigation
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light">
      {/* Demo Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Interactive Portfolio Demo</h1>
              <p className="text-sm text-white/60">Full-featured interactive system showcase</p>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-athletic-brand-violet text-white rounded-lg hover:bg-athletic-brand-violet/80 transition-colors"
            >
              ← Back to Portfolio
            </a>
          </div>
        </div>
      </div>

      {/* WOW Factor Components */}
      <CustomCursor />
      <ScrollProgress />
      <SectionAmbientLighting />
      <FilmMode />
      <ViewfinderController />

      {/* Interactive Controls - The star of the demo */}
      <EffectsPanel />
      <PersistentCTABar onNavigate={handleNavigate} />

      {/* Main Content */}
      <div className="pt-24">
        <Header onNavigate={handleNavigate} activeSection="capture" />

        <main className="relative z-10">
          <SimplifiedGameFlowContainer performanceMode="auto" debugMode={false} />
        </main>
      </div>

      {/* Demo Info Panel */}
      <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-4 max-w-sm z-40">
        <h3 className="text-sm font-semibold text-white mb-2">🎮 Interactive Demo</h3>
        <p className="text-xs text-white/70 leading-relaxed">
          Explore the full interactive portfolio system with customizable effects,
          camera viewfinder controls, and advanced navigation features.
        </p>
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-white/50">
            <strong className="text-white/70">Tech Stack:</strong> React 19 • TypeScript • Custom Hooks •
            Canvas API • RequestAnimationFrame
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
