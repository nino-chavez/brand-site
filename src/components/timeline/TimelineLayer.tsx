/**
 * TimelineLayer - Individual layer wrapper for timeline sections
 *
 * Wraps each portfolio section as a "frame" in the timeline, handling
 * visibility, transitions, and ghost preview states.
 *
 * @fileoverview Timeline layer component
 * @version 1.0.0
 */

import React, { ReactNode } from 'react';
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
}

const TimelineLayer: React.FC<TimelineLayerProps> = ({
  children,
  isActive,
  isHovered = false,
  zIndex = 1,
  transitionStyle = 'crossfade',
  layerIndex = 0
}) => {
  // Determine visibility and opacity
  const shouldRender = isActive || isHovered;
  const opacity = isActive ? 1 : isHovered ? 0.3 : 0;
  const pointerEvents = isActive ? 'auto' : 'none';

  // Transition duration based on style
  const transitionDuration = transitionStyle === 'crossfade' ? '600ms' : '700ms';

  return (
    <div
      className="timeline-layer"
      data-layer-index={layerIndex}
      data-active={isActive}
      data-hovered={isHovered}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex,
        opacity,
        pointerEvents,
        transition: `opacity ${transitionDuration} ease-out`,
        willChange: 'opacity',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)', // GPU acceleration
      }}
    >
      {shouldRender && children}
    </div>
  );
};

export default TimelineLayer;
