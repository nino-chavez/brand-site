/**
 * TimelineFilmstrip - Top filmstrip track component
 *
 * Horizontal scrollable track of film thumbnails. Handles thumbnail rendering,
 * auto-scrolling to active thumbnail, and navigation interactions.
 *
 * @fileoverview Timeline filmstrip component
 * @version 1.0.0
 */

import React, { useRef, useEffect } from 'react';
import TimelineThumbnail from './TimelineThumbnail';
import type { SectionId } from '../../types';
import { useTimelineState } from '../../contexts/timeline/TimelineStateContext';

export interface TimelineSection {
  id: SectionId;
  name: string;
  component: React.ReactNode;
}

export interface TimelineFilmstripProps {
  /** Array of sections to display as thumbnails */
  sections: TimelineSection[];
}

const TimelineFilmstrip: React.FC<TimelineFilmstripProps> = ({ sections }) => {
  const { state, actions } = useTimelineState();
  const filmstripRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active thumbnail
  useEffect(() => {
    if (!filmstripRef.current) return;

    const activeThumb = filmstripRef.current.querySelector(
      `[aria-controls="layer-${sections[state.activeLayerIndex]?.id}"]`
    ) as HTMLElement;

    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [state.activeLayerIndex, sections]);

  return (
    <div
      role="region"
      aria-label="Timeline navigation"
      style={{
        width: '100%',
        height: '100px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        position: 'relative',
      }}
    >
      {/* Left arrow */}
      <button
        onClick={actions.navigatePrevious}
        aria-label="Previous frame"
        disabled={state.isTransitioning}
        style={{
          background: 'rgba(139, 92, 246, 0.2)',
          border: '1px solid rgba(139, 92, 246, 0.5)',
          borderRadius: '4px',
          color: 'white',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: state.isTransitioning ? 'not-allowed' : 'pointer',
          marginRight: '8px',
          flexShrink: 0,
        }}
      >
        ◄
      </button>

      {/* Filmstrip scrollable area */}
      <div
        ref={filmstripRef}
        role="tablist"
        style={{
          flex: 1,
          display: 'flex',
          gap: '0',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          padding: '8px 0',
          // Hide scrollbar but keep functionality
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="filmstrip-scroll"
      >
        <style>{`
          .filmstrip-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {sections.map((section, index) => (
          <TimelineThumbnail
            key={section.id}
            sectionId={section.id}
            sectionName={section.name}
            index={index}
            isActive={state.activeLayerIndex === index}
            onClick={actions.navigateToLayer}
            onMouseEnter={actions.setHoveredThumbnail}
            onMouseLeave={() => actions.setHoveredThumbnail(null)}
          />
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={actions.navigateNext}
        aria-label="Next frame"
        disabled={state.isTransitioning}
        style={{
          background: 'rgba(139, 92, 246, 0.2)',
          border: '1px solid rgba(139, 92, 246, 0.5)',
          borderRadius: '4px',
          color: 'white',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: state.isTransitioning ? 'not-allowed' : 'pointer',
          marginLeft: '8px',
          flexShrink: 0,
        }}
      >
        ►
      </button>

      {/* Loop indicator flash */}
      {state.isLooping && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(139, 92, 246, 0.3)',
            animation: 'loopFlash 150ms ease-out',
            pointerEvents: 'none',
          }}
        />
      )}

      <style>{`
        @keyframes loopFlash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TimelineFilmstrip;
