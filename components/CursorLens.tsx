/**
 * CursorLens Component
 *
 * Zero-occlusion cursor-activated radial navigation system with 60fps performance.
 * Orchestrates cursor tracking, gesture detection, and menu positioning for photography workflow.
 *
 * @fileoverview Phase 1: Setup and Foundation - Task 7: Core Component Implementation
 * @version 1.0.0
 * @since 2025-09-26
 */

import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { useCursorTracking } from '../hooks/useCursorTracking';
import { useLensActivation } from '../hooks/useLensActivation';
import { useRadialMenu } from '../hooks/useRadialMenu';
import { useUnifiedGameFlow } from '../contexts/UnifiedGameFlowContext';
import type {
  CursorLensProps,
  PhotoWorkflowSection,
  ViewportDimensions,
  CursorPosition,
  ActivationMethod,
  CameraMetaphorLabels
} from '../types/cursor-lens';

// Default viewport dimensions (will be replaced by actual viewport on mount)
const DEFAULT_VIEWPORT: ViewportDimensions = {
  width: 1200,
  height: 800,
  edgeClearance: 40
};

// Camera metaphor labels for sections
const CAMERA_LABELS: CameraMetaphorLabels = {
  capture: {
    primary: 'Introduction',
    secondary: 'Ready to capture',
    ariaLabel: 'Navigate to introduction section - capture readiness'
  },
  focus: {
    primary: 'Attention',
    secondary: 'Focus on detail',
    ariaLabel: 'Navigate to attention section - focus and detail work'
  },
  frame: {
    primary: 'Planning',
    secondary: 'Frame composition',
    ariaLabel: 'Navigate to planning section - composition and framing'
  },
  exposure: {
    primary: 'Execution',
    secondary: 'Perfect exposure',
    ariaLabel: 'Navigate to execution section - technical implementation'
  },
  develop: {
    primary: 'Process',
    secondary: 'Develop & refine',
    ariaLabel: 'Navigate to process section - development and refinement'
  },
  portfolio: {
    primary: 'Results',
    secondary: 'Portfolio showcase',
    ariaLabel: 'Navigate to results section - portfolio and showcase'
  }
};

// Section navigation mapping to existing scroll sections
const SECTION_SCROLL_MAPPING: Record<PhotoWorkflowSection, string> = {
  capture: 'hero',
  focus: 'about',
  frame: 'experience',
  exposure: 'portfolio',
  develop: 'photography',
  portfolio: 'contact'
};

/**
 * Individual radial menu item component
 * Renders a single photography workflow section with camera metaphor labeling
 */
interface RadialMenuItemProps {
  section: PhotoWorkflowSection;
  x: number;
  y: number;
  isHighlighted: boolean;
  isAccessible: boolean;
  onSelect: (section: PhotoWorkflowSection) => void;
  onFocus: (section: PhotoWorkflowSection) => void;
  onBlur: () => void;
}

const RadialMenuItem: React.FC<RadialMenuItemProps> = ({
  section,
  x,
  y,
  isHighlighted,
  isAccessible,
  onSelect,
  onFocus,
  onBlur
}) => {
  const label = CAMERA_LABELS[section];

  return (
    <button
      type="button"
      className={`
        absolute transform -translate-x-1/2 -translate-y-1/2
        w-16 h-16 rounded-full border-2 border-white/20
        bg-slate-900/90 backdrop-blur-sm
        flex flex-col items-center justify-center
        text-xs text-white font-medium
        transition-all duration-150 ease-out
        hover:border-orange-400/60 hover:bg-slate-800/95
        focus:outline-none focus:ring-2 focus:ring-orange-400/50
        ${isHighlighted ? 'border-orange-400/80 bg-slate-800/95 scale-110' : ''}
        ${isAccessible ? 'ring-2 ring-blue-400/50' : ''}
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 9999
      }}
      onClick={() => onSelect(section)}
      onFocus={() => onFocus(section)}
      onBlur={onBlur}
      onMouseEnter={() => onFocus(section)}
      onMouseLeave={onBlur}
      aria-label={label.ariaLabel}
      tabIndex={isAccessible ? 0 : -1}
    >
      <span className="text-orange-400 text-[10px] font-bold leading-none">
        {label.primary}
      </span>
      <span className="text-white/70 text-[8px] leading-none mt-0.5">
        {label.secondary.split(' ')[0]}
      </span>
    </button>
  );
};

/**
 * Central activation indicator
 * Shows activation progress and current state
 */
interface ActivationIndicatorProps {
  x: number;
  y: number;
  isActive: boolean;
  activationProgress: number;
  activationMethod: ActivationMethod | null;
}

const ActivationIndicator: React.FC<ActivationIndicatorProps> = ({
  x,
  y,
  isActive,
  activationProgress,
  activationMethod
}) => {
  const progressPercent = Math.round(activationProgress * 100);
  const strokeDasharray = 2 * Math.PI * 12; // Circumference of progress circle
  const strokeDashoffset = strokeDasharray * (1 - activationProgress);

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 9998
      }}
    >
      {/* Progress circle */}
      <svg
        width="32"
        height="32"
        className={`transition-opacity duration-200 ${
          activationProgress > 0 && !isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <circle
          cx="16"
          cy="16"
          r="12"
          fill="none"
          stroke="rgba(251, 146, 60, 0.3)"
          strokeWidth="2"
        />
        <circle
          cx="16"
          cy="16"
          r="12"
          fill="none"
          stroke="rgb(251, 146, 60)"
          strokeWidth="2"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 16 16)"
          className="transition-all duration-100 ease-out"
        />
      </svg>

      {/* Active state indicator */}
      <div
        className={`
          absolute inset-0 w-8 h-8 rounded-full border-2
          transition-all duration-200 ease-out
          ${isActive
            ? 'border-orange-400 bg-orange-400/20 scale-100'
            : 'border-transparent scale-75'
          }
        `}
      />

      {/* Method indicator */}
      {activationMethod && (
        <div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2
                     px-2 py-1 bg-slate-900/90 backdrop-blur-sm rounded
                     text-xs text-white/80 whitespace-nowrap border border-white/10"
        >
          {activationMethod === 'click-hold' && 'Click & Hold'}
          {activationMethod === 'hover' && 'Hover'}
          {activationMethod === 'keyboard' && 'Keyboard'}
          {activationMethod === 'touch-long-press' && 'Long Press'}
        </div>
      )}
    </div>
  );
};

/**
 * Main CursorLens Component
 *
 * Zero-occlusion cursor-activated radial navigation system with:
 * - 60fps cursor tracking with RAF optimization
 * - Multi-method activation (click-hold, hover, keyboard, touch)
 * - Viewport constraint handling with intelligent repositioning
 * - Photography workflow navigation with camera metaphors
 * - Performance monitoring and accessibility support
 */
export const CursorLens: React.FC<CursorLensProps> = ({
  isEnabled = true,
  activationDelay = 800,
  className = '',
  onSectionSelect,
  onActivate,
  onDeactivate,
  onPerformanceUpdate,
  fallbackMode,
  viewportDimensions: propViewportDimensions
}) => {
  // State management
  const [viewportDimensions, setViewportDimensions] = useState<ViewportDimensions>(
    propViewportDimensions || DEFAULT_VIEWPORT
  );
  const [highlightedSection, setHighlightedSection] = useState<PhotoWorkflowSection | null>(null);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);

  // Refs for DOM interaction
  const containerRef = useRef<HTMLDivElement>(null);

  // Hook integrations
  const cursorTracking = useCursorTracking();
  const lensActivation = useLensActivation();
  const radialMenu = useRadialMenu();

  // Game flow integration for navigation
  const { actions } = useUnifiedGameFlow();

  // Update viewport dimensions on mount and resize
  useEffect(() => {
    if (propViewportDimensions) {
      setViewportDimensions(propViewportDimensions);
      return;
    }

    const updateViewport = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        edgeClearance: 40
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, [propViewportDimensions]);

  // Update menu position when cursor moves or activation changes
  useEffect(() => {
    if (lensActivation.isActive && cursorTracking.position) {
      radialMenu.repositionMenu(cursorTracking.position, viewportDimensions);
    }
  }, [
    lensActivation.isActive,
    cursorTracking.position,
    viewportDimensions,
    radialMenu
  ]);

  // Performance monitoring integration
  useEffect(() => {
    if (onPerformanceUpdate && cursorTracking.performance) {
      const metrics = {
        cursorTrackingFPS: cursorTracking.performance.frameRate,
        averageResponseTime: cursorTracking.performance.averageLatency,
        memoryUsage: 0, // Would be calculated by monitoring system
        activationLatency: 50, // Would be tracked by activation system
        menuRenderTime: 8, // Would be measured during rendering
        sessionDuration: 0 // Would be tracked by session system
      };
      onPerformanceUpdate(metrics);
    }
  }, [cursorTracking.performance, onPerformanceUpdate]);

  // Start/stop cursor tracking based on enabled state
  useEffect(() => {
    if (isEnabled && !cursorTracking.isTracking) {
      cursorTracking.startTracking();
    } else if (!isEnabled && cursorTracking.isTracking) {
      cursorTracking.stopTracking();
    }
  }, [isEnabled, cursorTracking]);

  // Handle activation/deactivation events
  useEffect(() => {
    if (lensActivation.isActive && !cursorTracking.isTracking) {
      cursorTracking.startTracking();
      onActivate?.(lensActivation.activationMethod!);
    } else if (!lensActivation.isActive && cursorTracking.isTracking) {
      cursorTracking.stopTracking();
      radialMenu.resetMenu();
      setHighlightedSection(null);
      onDeactivate?.();
    }
  }, [
    lensActivation.isActive,
    lensActivation.activationMethod,
    cursorTracking,
    radialMenu,
    onActivate,
    onDeactivate
  ]);

  // Handle keyboard navigation in accessible mode
  useEffect(() => {
    if (fallbackMode === 'keyboard') {
      setIsAccessibleMode(true);
    }
  }, [fallbackMode]);

  // Section selection handler
  const handleSectionSelect = useCallback((section: PhotoWorkflowSection) => {
    // Navigate to corresponding scroll section
    const scrollSectionId = SECTION_SCROLL_MAPPING[section];
    if (scrollSectionId && actions.setSection) {
      actions.setSection(scrollSectionId as any);
    }

    // Callback to parent
    onSectionSelect?.(section);

    // Deactivate lens after selection
    lensActivation.deactivate();
  }, [actions, onSectionSelect, lensActivation]);

  // Section highlighting handler
  const handleSectionFocus = useCallback((section: PhotoWorkflowSection) => {
    setHighlightedSection(section);
  }, []);

  const handleSectionBlur = useCallback(() => {
    setHighlightedSection(null);
  }, []);

  // Calculate menu items with position data
  const menuItems = useMemo(() => {
    if (!lensActivation.isActive || !radialMenu.menuPosition.center) {
      return [];
    }

    return radialMenu.itemPositions.map((item) => ({
      ...item,
      isHighlighted: highlightedSection === item.section,
      screenX: item.coordinates.x,
      screenY: item.coordinates.y
    }));
  }, [
    lensActivation.isActive,
    radialMenu.menuPosition.center,
    radialMenu.itemPositions,
    highlightedSection
  ]);

  // Early return if disabled
  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-[9990] ${className}`}
      {...lensActivation.gestureEvents}
      style={{ pointerEvents: lensActivation.isActive ? 'auto' : 'none' }}
    >
      {/* Activation indicator at menu center */}
      {radialMenu.menuPosition.center && (
        <ActivationIndicator
          x={radialMenu.menuPosition.center.x}
          y={radialMenu.menuPosition.center.y}
          isActive={lensActivation.isActive}
          activationProgress={lensActivation.activationProgress}
          activationMethod={lensActivation.activationMethod}
        />
      )}

      {/* Radial menu items */}
      {lensActivation.isActive && menuItems.map((item) => (
        <RadialMenuItem
          key={item.section}
          section={item.section}
          x={item.screenX}
          y={item.screenY}
          isHighlighted={item.isHighlighted}
          isAccessible={isAccessibleMode}
          onSelect={handleSectionSelect}
          onFocus={handleSectionFocus}
          onBlur={handleSectionBlur}
        />
      ))}

      {/* Repositioning indicator */}
      {radialMenu.isRepositioned && radialMenu.menuPosition.originalCursorPosition && (
        <div
          className="absolute w-1 h-1 bg-orange-400/60 rounded-full pointer-events-none"
          style={{
            left: `${radialMenu.menuPosition.originalCursorPosition.x}px`,
            top: `${radialMenu.menuPosition.originalCursorPosition.y}px`,
            zIndex: 9997
          }}
        />
      )}

      {/* Accessibility fallback */}
      {isAccessibleMode && (
        <div className="sr-only" aria-live="polite">
          {lensActivation.isActive ? 'Radial navigation menu active' : 'Radial navigation menu inactive'}
          {highlightedSection && ` - ${CAMERA_LABELS[highlightedSection].ariaLabel}`}
        </div>
      )}
    </div>
  );
};

export default CursorLens;