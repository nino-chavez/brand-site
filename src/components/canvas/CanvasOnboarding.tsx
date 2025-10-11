/**
 * CanvasOnboarding - First-visit overlay with navigation instructions
 *
 * Addresses UX audit feedback: "Discoverability Crisis - No visible indication
 * that canvas mode exists or how to navigate spatially"
 *
 * @fileoverview Onboarding overlay for canvas navigation
 * @version 1.0.0
 * @since Canvas UX Improvements
 */

import React, { useState, useEffect } from 'react';

export interface CanvasOnboardingProps {
  onDismiss?: () => void;
}

/**
 * CanvasOnboarding - Shows navigation controls on first canvas visit
 *
 * Features:
 * - Session-based display (shows once per session)
 * - Keyboard shortcut hints
 * - Click/touch navigation instructions
 * - Professional visual design
 * - Dismissible with X button or Escape key
 */
export const CanvasOnboarding: React.FC<CanvasOnboardingProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding this session
    const hasSeenOnboarding = sessionStorage.getItem('canvas-onboarding-seen');

    if (!hasSeenOnboarding) {
      // Show after brief delay for smooth entrance
      setTimeout(() => {
        setIsVisible(true);
      }, 500);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('canvas-onboarding-seen', 'true');
    onDismiss?.();
  };

  // Keyboard shortcut: Escape to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 300ms ease-out'
      }}
    >
      {/* Onboarding Card */}
      <div
        className="relative max-w-2xl mx-4 p-8 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0.95) 100%)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.2)',
          animation: 'slideUp 500ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10"
          aria-label="Dismiss onboarding"
        >
          <svg
            className="w-6 h-6 text-white/60 hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <svg
              className="w-8 h-8 text-athletic-brand-violet"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h2 className="text-3xl font-bold text-white">
              Welcome to Canvas Mode
            </h2>
          </div>
          <p className="text-white/70 text-lg">
            Explore my portfolio through an interactive 2D spatial layout
          </p>
        </div>

        {/* Navigation Instructions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Mouse/Touch Navigation */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-athletic-brand-violet" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
              <h3 className="text-white font-semibold">Click to Navigate</h3>
            </div>
            <p className="text-white/60 text-sm">
              Click any section to smoothly pan and zoom to it
            </p>
          </div>

          {/* Keyboard Navigation */}
          <div className="p-4 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-athletic-brand-violet" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
              <h3 className="text-white font-semibold">Keyboard Controls</h3>
            </div>
            <p className="text-white/60 text-sm">
              <kbd className="px-2 py-1 bg-black/40 rounded text-xs">Tab</kbd> to cycle sections
            </p>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="p-4 rounded-lg mb-6" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-athletic-brand-violet" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Quick Reference
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-black/40 rounded text-xs text-white/80 font-mono">Tab</kbd>
              <span className="text-white/60">Next section</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-black/40 rounded text-xs text-white/80 font-mono">Shift+Tab</kbd>
              <span className="text-white/60">Previous</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-black/40 rounded text-xs text-white/80 font-mono">←→↑↓</kbd>
              <span className="text-white/60">Pan view</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-black/40 rounded text-xs text-white/80 font-mono">+/−</kbd>
              <span className="text-white/60">Zoom in/out</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-black/40 rounded text-xs text-white/80 font-mono">L</kbd>
              <span className="text-white/60">Toggle layout</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-black/40 rounded text-xs text-white/80 font-mono">H</kbd>
              <span className="text-white/60">Help (anytime)</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-sm">
            Press <kbd className="px-2 py-1 bg-black/40 rounded text-xs text-white/70">Esc</kbd> or{' '}
            <kbd className="px-2 py-1 bg-black/40 rounded text-xs text-white/70">H</kbd> to show help again
          </p>
          <button
            onClick={handleDismiss}
            className="px-6 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
            }}
          >
            Start Exploring
          </button>
        </div>
      </div>

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        kbd {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
        }
      `}</style>
    </div>
  );
};

export default CanvasOnboarding;
