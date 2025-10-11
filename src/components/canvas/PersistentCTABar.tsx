/**
 * PersistentCTABar - Floating Action Buttons for Canvas Navigation
 *
 * Addresses UX audit feedback: "Conversion Friction - No persistent call to action
 * when users are exploring the canvas spatially"
 *
 * @fileoverview Floating CTA bar with conversion shortcuts
 * @version 1.0.0
 * @since Canvas UX Improvements - Quick Win #4
 */

import React, { useEffect, useState } from 'react';
import { useCanvasState } from '../../contexts/CanvasStateProvider';
import type { SectionId } from '../../types';

export interface PersistentCTABarProps {
  onNavigate?: (section: SectionId) => void;
  className?: string;
}

/**
 * PersistentCTABar - Conversion-optimized floating action buttons
 *
 * Features:
 * - Primary CTA: "Schedule Review" (navigates to Contact/Portfolio section)
 * - Secondary CTA: "View Work" (navigates to Projects/Frame section)
 * - Keyboard shortcut: 'C' for Contact
 * - Progress indicator showing sections viewed
 * - Always visible at all zoom levels
 * - Professional styling matching brand aesthetic
 */
export const PersistentCTABar: React.FC<PersistentCTABarProps> = ({
  onNavigate,
  className = ''
}) => {
  const { state, actions } = useCanvasState();
  const [sectionsViewed, setSectionsViewed] = useState<Set<SectionId>>(new Set());
  const [showTooltip, setShowTooltip] = useState(false);

  // Track sections viewed for progress indicator
  useEffect(() => {
    const currentSection = state.activeSection as SectionId;
    if (currentSection) {
      setSectionsViewed(prev => new Set(prev).add(currentSection));
    }
  }, [state.activeSection]);

  // Keyboard shortcut: 'C' for Contact
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle 'C' if not in input/textarea and no modifier keys
      if (
        e.key === 'c' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.shiftKey
      ) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        e.preventDefault();
        handleContactClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContactClick = () => {
    // Navigate to Portfolio section using canvas navigation
    const portfolioSection = {
      id: 'portfolio' as SectionId,
      coordinates: { x: 1500, y: 1000 },
      dimensions: { width: 800, height: 650 }
    };

    // Calculate centered position
    // Note: Transform uses translate(${-x}px), so we need positive values here
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetX = (2000 + portfolioSection.coordinates.x) - viewportWidth / 2 + portfolioSection.dimensions.width / 2;
    const targetY = (1500 + portfolioSection.coordinates.y) - viewportHeight / 2 + portfolioSection.dimensions.height / 2;

    actions.updatePosition({
      x: targetX,
      y: targetY,
      scale: 1.2
    });
    actions.setActiveSection('portfolio');
    onNavigate?.('portfolio');
    console.log('[INFO] CTA: Navigating to Portfolio (Contact) section');
  };

  const handleProjectsClick = () => {
    // Navigate to Frame section using canvas navigation
    const frameSection = {
      id: 'frame' as SectionId,
      coordinates: { x: 1300, y: 0 },
      dimensions: { width: 1000, height: 850 }
    };

    // Calculate centered position
    // Note: Transform uses translate(${-x}px), so we need positive values here
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetX = (2000 + frameSection.coordinates.x) - viewportWidth / 2 + frameSection.dimensions.width / 2;
    const targetY = (1500 + frameSection.coordinates.y) - viewportHeight / 2 + frameSection.dimensions.height / 2;

    actions.updatePosition({
      x: targetX,
      y: targetY,
      scale: 1.2
    });
    actions.setActiveSection('frame');
    onNavigate?.('frame');
    console.log('[INFO] CTA: Navigating to Frame (Projects) section');
  };

  // Calculate progress (6 total sections)
  const totalSections = 6;
  const progressPercentage = (sectionsViewed.size / totalSections) * 100;

  return (
    <div
      className={`fixed bottom-20 right-6 z-40 flex flex-col items-end gap-4 ${className}`}
      role="complementary"
      aria-label="Quick navigation actions"
    >
      {/* Progress Indicator */}
      {sectionsViewed.size > 0 && (
        <div
          className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 transition-all duration-300"
          style={{
            opacity: sectionsViewed.size === totalSections ? 1 : 0.8
          }}
        >
          <div className="flex items-center gap-4">
            <div className="text-white/70 text-xs font-medium">
              Progress: {sectionsViewed.size}/{totalSections}
            </div>
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-athletic-brand-violet to-purple-400 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {sectionsViewed.size === totalSections && (
              <svg
                className="w-4 h-4 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col gap-2">
        {/* Primary CTA: Schedule Review (Contact) */}
        <button
          onClick={handleContactClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="group relative px-6 py-4 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
          }}
          aria-label="Schedule a review - Navigate to contact section (Keyboard shortcut: C)"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Schedule Review</span>
          </div>

          {/* Keyboard Shortcut Tooltip */}
          {showTooltip && (
            <div
              className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">C</kbd> to
              contact
            </div>
          )}
        </button>

        {/* Secondary CTA: View Work (Projects) */}
        <button
          onClick={handleProjectsClick}
          className="px-6 py-4 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: 'white'
          }}
          aria-label="View work - Navigate to projects section"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>Explore Work</span>
          </div>
        </button>
      </div>

      {/* Completion Message */}
      {sectionsViewed.size === totalSections && (
        <div
          className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-4 py-2 text-green-300 text-xs font-medium animate-pulse"
          style={{
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
          }}
        >
          ✓ You've explored everything!
        </div>
      )}
    </div>
  );
};

export default PersistentCTABar;
