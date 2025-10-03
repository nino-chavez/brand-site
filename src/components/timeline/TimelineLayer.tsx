/**
 * TimelineLayer - Individual layer wrapper for timeline sections
 *
 * Wraps each portfolio section as a "frame" in the timeline, handling
 * visibility, transitions, and ghost preview states with TikTok/Reels-style effects.
 *
 * @fileoverview Timeline layer component
 * @version 2.0.0
 */

import React, { ReactNode, useMemo } from 'react';
import type { TransitionStyle } from '../../contexts/timeline/TimelineStateContext';

export interface TimelineLayerProps {
  /** Section content to render */
  children: ReactNode;
  /** Whether this layer is currently active */
  isActive: boolean;
  /** Whether this layer is being hovered in thumbnail */
  isHovered?: boolean;
  /** Z-index for layer stacking */
  zIndex?: number;
  /** Transition animation style */
  transitionStyle?: TransitionStyle;
  /** Layer index for debugging */
  layerIndex?: number;
  /** Whether layer is entering (for transition direction) */
  isEntering?: boolean;
}

const TimelineLayer: React.FC<TimelineLayerProps> = ({
  children,
  isActive,
  isHovered = false,
  zIndex = 1,
  transitionStyle = 'crossfade',
  layerIndex = 0,
  isEntering = true
}) => {
  // Determine visibility
  const shouldRender = isActive || isHovered;

  // Get transition-specific styles
  const transitionStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      zIndex,
      pointerEvents: isActive ? 'auto' : 'none',
      backfaceVisibility: 'hidden',
    };

    if (!isActive && !isHovered) {
      return { ...baseStyles, opacity: 0 };
    }

    if (isHovered) {
      return { ...baseStyles, opacity: 0.3, transition: 'opacity 200ms ease-out' };
    }

    // Active layer - apply transition effect
    switch (transitionStyle) {
      case 'zoomBlur':
        return {
          ...baseStyles,
          animation: isEntering ? 'zoomBlurIn 500ms ease-out' : 'zoomBlurOut 500ms ease-out',
          animationFillMode: 'forwards',
        };

      case 'spin':
        return {
          ...baseStyles,
          animation: 'spin360 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          animationFillMode: 'forwards',
        };

      case 'slide':
        return {
          ...baseStyles,
          animation: isEntering ? 'slideInRight 500ms ease-out' : 'slideOutLeft 500ms ease-out',
          animationFillMode: 'forwards',
        };

      case 'glitch':
        return {
          ...baseStyles,
          animation: 'glitchEffect 400ms steps(4)',
          animationFillMode: 'forwards',
        };

      case 'whipPan':
        return {
          ...baseStyles,
          animation: isEntering ? 'whipPanIn 400ms ease-in-out' : 'whipPanOut 400ms ease-in-out',
          animationFillMode: 'forwards',
        };

      case 'zoomPunch':
        return {
          ...baseStyles,
          animation: 'zoomPunch 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          animationFillMode: 'forwards',
        };

      case 'crossfade':
      default:
        return {
          ...baseStyles,
          opacity: 1,
          transition: 'opacity 600ms ease-out',
        };
    }
  }, [isActive, isHovered, zIndex, transitionStyle, isEntering]);

  return (
    <>
      <div
        className={`timeline-layer timeline-layer--${transitionStyle}`}
        data-layer-index={layerIndex}
        data-active={isActive}
        data-hovered={isHovered}
        style={transitionStyles}
      >
        {shouldRender && children}
      </div>

      {/* TikTok/Reels-style transition keyframes */}
      <style>{`
        @keyframes zoomBlurIn {
          0% {
            transform: scale(1.3) translateZ(0);
            filter: blur(10px);
            opacity: 0;
          }
          60% {
            filter: blur(3px);
          }
          100% {
            transform: scale(1) translateZ(0);
            filter: blur(0);
            opacity: 1;
          }
        }

        @keyframes zoomBlurOut {
          0% {
            transform: scale(1) translateZ(0);
            filter: blur(0);
            opacity: 1;
          }
          100% {
            transform: scale(0.8) translateZ(0);
            filter: blur(10px);
            opacity: 0;
          }
        }

        @keyframes spin360 {
          0% {
            transform: rotate(0deg) scale(0.95) translateZ(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: rotate(360deg) scale(1) translateZ(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          0% {
            transform: translateX(100%) translateZ(0);
            opacity: 0;
          }
          100% {
            transform: translateX(0) translateZ(0);
            opacity: 1;
          }
        }

        @keyframes slideOutLeft {
          0% {
            transform: translateX(0) translateZ(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%) translateZ(0);
            opacity: 0;
          }
        }

        @keyframes glitchEffect {
          0% {
            transform: translate(0) translateZ(0);
            opacity: 0;
            filter: hue-rotate(0deg);
          }
          25% {
            transform: translate(-5px, 5px) translateZ(0);
            filter: hue-rotate(90deg);
          }
          50% {
            transform: translate(5px, -5px) translateZ(0);
            filter: hue-rotate(180deg);
            opacity: 0.7;
          }
          75% {
            transform: translate(-3px, 3px) translateZ(0);
            filter: hue-rotate(270deg);
          }
          100% {
            transform: translate(0) translateZ(0);
            opacity: 1;
            filter: hue-rotate(360deg);
          }
        }

        @keyframes whipPanIn {
          0% {
            transform: translateX(100%) translateZ(0);
            filter: blur(20px);
            opacity: 0;
          }
          70% {
            filter: blur(5px);
          }
          100% {
            transform: translateX(0) translateZ(0);
            filter: blur(0);
            opacity: 1;
          }
        }

        @keyframes whipPanOut {
          0% {
            transform: translateX(0) translateZ(0);
            filter: blur(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%) translateZ(0);
            filter: blur(20px);
            opacity: 0;
          }
        }

        @keyframes zoomPunch {
          0% {
            transform: scale(0.8) translateZ(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) translateZ(0);
          }
          100% {
            transform: scale(1) translateZ(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default TimelineLayer;
