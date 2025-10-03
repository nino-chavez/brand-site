/**
 * TimelineThumbnail - Film frame thumbnail component
 *
 * Renders a film-authentic thumbnail with sprocket holes, timecode,
 * and active/hover states. Uses CSS transform to scale down section content.
 *
 * @fileoverview Timeline thumbnail component
 * @version 1.0.0
 */

import React, { useCallback } from 'react';
import type { SectionId } from '../../types';

export interface TimelineThumbnailProps {
  /** Section identifier */
  sectionId: SectionId;
  /** Section display name */
  sectionName: string;
  /** Thumbnail index (0-5) */
  index: number;
  /** Whether this thumbnail is active */
  isActive: boolean;
  /** Click handler for navigation */
  onClick: (index: number) => void;
  /** Hover handlers for ghost preview */
  onMouseEnter?: (index: number) => void;
  onMouseLeave?: () => void;
  /** Preview content (scaled-down section) */
  children?: React.ReactNode;
}

const TimelineThumbnail: React.FC<TimelineThumbnailProps> = ({
  sectionId,
  sectionName,
  index,
  isActive,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children
}) => {
  const handleClick = useCallback(() => {
    onClick(index);
  }, [onClick, index]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter?.(index);
  }, [onMouseEnter, index]);

  // Format timecode (00:00, 00:15, 00:30, etc.)
  const timecode = `00:${String(index * 15).padStart(2, '0')}`;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-label={`${sectionName}, frame ${index + 1} of 6`}
      aria-controls={`layer-${sectionId}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`timeline-thumbnail ${isActive ? 'active' : ''}`}
      style={{
        position: 'relative',
        width: '180px',
        height: '100px',
        margin: '0 8px',
        border: isActive ? '4px solid rgb(139, 92, 246)' : '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        background: '#1a1a1a',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 200ms ease-out',
        transform: isActive ? 'scale(1.08)' : 'scale(1)',
        opacity: isActive ? 1 : 0.7,
        filter: isActive ? 'grayscale(0%)' : 'grayscale(60%)',
        boxShadow: isActive ? '0 8px 24px rgba(139, 92, 246, 0.3)' : 'none',
      }}
      onMouseOver={(e) => {
        if (!isActive) {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.filter = 'grayscale(0%)';
        }
      }}
      onMouseOut={(e) => {
        if (!isActive) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.filter = 'grayscale(60%)';
        }
      }}
    >
      {/* Sprocket holes overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle 4px, transparent 4px, rgba(0,0,0,0.8) 4px),
            radial-gradient(circle 4px, transparent 4px, rgba(0,0,0,0.8) 4px)
          `,
          backgroundPosition: '0 0, 100% 0',
          backgroundSize: '8px 16px, 8px 16px',
          backgroundRepeat: 'repeat-y, repeat-y',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Film grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
          opacity: 0.15,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* Timecode overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: 'bold',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        {timecode}
      </div>

      {/* Section preview content */}
      {children && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1500px',
            height: '833px',
            transform: 'scale(0.12)',
            transformOrigin: 'top left',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {children}
        </div>
      )}

      {/* Fallback: Section name if no preview */}
      {!children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1,
          }}
        >
          {sectionName}
        </div>
      )}

      {/* Active scanning line effect */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent)',
            animation: 'scanline 2s linear infinite',
            zIndex: 5,
          }}
        />
      )}

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
      `}</style>
    </button>
  );
};

export default TimelineThumbnail;
