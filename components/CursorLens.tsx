/**
 * CursorLens Component
 *
 * Zero-occlusion cursor-activated radial navigation system with 60fps performance.
 * Orchestrates cursor tracking, gesture detection, and menu positioning for photography workflow.
 * Extended in Phase 3 with canvas coordinate mapping for spatial navigation.
 *
 * @fileoverview Phase 1: Setup and Foundation - Task 7: Core Component Implementation
 * @fileoverview Phase 3: Canvas Integration - Task 6: CursorLens Canvas Integration
 * @version 1.1.0
 * @since 2025-09-26
 * @updated 2025-09-27 - Canvas coordinate mapping integration
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
import type { CanvasPosition, CanvasState } from '../types/canvas';
import { getSectionCanvasPosition } from '../utils/canvasCoordinateTransforms';

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
        w-16 h-16 min-w-[44px] min-h-[44px] rounded-full border-2 border-white/20
        bg-slate-900/90 backdrop-blur-sm
        flex flex-col items-center justify-center
        text-xs text-white font-medium
        transition-all duration-150 ease-out
        hover:border-orange-400/60 hover:bg-slate-800/95
        focus:outline-none focus:ring-2 focus:ring-orange-400/50
        active:scale-95 active:bg-slate-700/95
        touch-manipulation
        ${isHighlighted ? 'border-orange-400/80 bg-slate-800/95 scale-110' : ''}
        ${isAccessible ? 'ring-2 ring-blue-400/50' : ''}
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 9999,
        // Enhanced touch targets for mobile
        minWidth: '44px',
        minHeight: '44px'
      }}
      onClick={() => onSelect(section)}
      onFocus={() => onFocus(section)}
      onBlur={onBlur}
      onMouseEnter={() => onFocus(section)}
      onMouseLeave={onBlur}
      onTouchStart={(e) => {
        // Enhanced touch feedback
        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.95)';
        onFocus(section);
      }}
      onTouchEnd={(e) => {
        // Reset touch feedback
        e.currentTarget.style.transform = isHighlighted
          ? 'translate(-50%, -50%) scale(1.1)'
          : 'translate(-50%, -50%) scale(1)';
      }}
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

  // Enhanced touch feedback colors
  const getProgressColor = () => {
    if (activationMethod === 'touch-long-press') {
      return activationProgress < 0.5 ? 'rgb(34, 197, 94)' : 'rgb(251, 146, 60)';
    }
    return 'rgb(251, 146, 60)';
  };

  const getProgressBackgroundColor = () => {
    if (activationMethod === 'touch-long-press') {
      return 'rgba(34, 197, 94, 0.3)';
    }
    return 'rgba(251, 146, 60, 0.3)';
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 9998
      }}
    >
      {/* Enhanced progress circle with touch feedback */}
      <svg
        width="36"
        height="36"
        className={`transition-all duration-200 ${
          activationProgress > 0 && !isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        } ${activationMethod === 'touch-long-press' ? 'filter drop-shadow-lg' : ''}`}
      >
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke={getProgressBackgroundColor()}
          strokeWidth={activationMethod === 'touch-long-press' ? '3' : '2'}
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke={getProgressColor()}
          strokeWidth={activationMethod === 'touch-long-press' ? '3' : '2'}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 18 18)"
          className="transition-all duration-100 ease-out"
        />
        {/* Pulse effect for touch */}
        {activationMethod === 'touch-long-press' && activationProgress > 0.5 && (
          <circle
            cx="18"
            cy="18"
            r="18"
            fill="none"
            stroke="rgba(34, 197, 94, 0.5)"
            strokeWidth="1"
            className="animate-ping"
          />
        )}
      </svg>

      {/* Enhanced active state indicator */}
      <div
        className={`
          absolute inset-0 w-9 h-9 rounded-full border-2
          transition-all duration-200 ease-out
          ${isActive
            ? `border-orange-400 bg-orange-400/20 scale-100 ${
                activationMethod === 'touch-long-press' ? 'shadow-lg shadow-green-400/25' : ''
              }`
            : 'border-transparent scale-75'
          }
        `}
      />

      {/* Enhanced method indicator with touch optimization */}
      {activationMethod && (
        <div
          className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2
                     px-3 py-2 bg-slate-900/95 backdrop-blur-sm rounded-lg
                     text-xs text-white/90 whitespace-nowrap border border-white/20
                     transition-all duration-200
                     ${activationMethod === 'touch-long-press' ? 'bg-green-900/95 border-green-400/30' : ''}`}
        >
          {activationMethod === 'click-hold' && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-orange-400">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Click & Hold
            </span>
          )}
          {activationMethod === 'hover' && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-orange-400">
                <path d="M12 19L7 14H10V5H14V14H17L12 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Hover
            </span>
          )}
          {activationMethod === 'keyboard' && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-orange-400">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 8H6.01M10 8H10.01M14 8H14.01M18 8H18.01M8 12H16M6 16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Keyboard
            </span>
          )}
          {activationMethod === 'touch-long-press' && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-green-400">
                <path d="M9 1V3H15V1M20 8H22V10H20M20 14H22V16H20M4 8H2V10H4M4 14H2V16H4M5 19V21H19V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 7H15V13H9V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Long Press ({Math.round(activationProgress * 100)}%)
            </span>
          )}
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
  viewportDimensions: propViewportDimensions,
  // Canvas integration props (Phase 3)
  canvasMode = false,
  canvasState,
  onCanvasPositionChange,
  sectionToCanvasMapper,
  showSpatialPreview = false
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
    // Canvas navigation (Phase 3 integration)
    if (canvasMode && onCanvasPositionChange) {
      // Use custom mapper or default spatial grid mapping
      const canvasPosition = sectionToCanvasMapper
        ? sectionToCanvasMapper(section)
        : getSectionCanvasPosition(section);

      onCanvasPositionChange(canvasPosition);
    } else {
      // Traditional scroll navigation (backward compatibility)
      const scrollSectionId = SECTION_SCROLL_MAPPING[section];
      if (scrollSectionId && actions.setSection) {
        actions.setSection(scrollSectionId as any);
      }
    }

    // Callback to parent
    onSectionSelect?.(section);

    // Deactivate lens after selection
    lensActivation.deactivate();
  }, [canvasMode, onCanvasPositionChange, sectionToCanvasMapper, actions, onSectionSelect, lensActivation]);

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
      style={{
        pointerEvents: lensActivation.isActive ? 'auto' : 'none',
        // Enhanced touch optimization
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
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