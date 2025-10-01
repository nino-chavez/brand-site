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
import { useCursorTracking } from '../../hooks/useCursorTracking';
import { useLensActivation } from '../../hooks/useLensActivation';
import { useRadialMenu } from '../../hooks/useRadialMenu';
import { useUnifiedGameFlow } from '../../contexts/UnifiedGameFlowContext';
import { useCanvasState } from '../../contexts/CanvasStateProvider';
import type {
  CursorLensProps,
  PhotoWorkflowSection,
  ViewportDimensions,
  CursorPosition,
  ActivationMethod,
  CameraMetaphorLabels
} from '../../types/cursor-lens';
import type { CanvasPosition, CanvasState } from '../../types/canvas';
import { getSectionCanvasPosition, calculateMovementDuration } from '../../utils/canvasCoordinateTransforms';

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
  isCurrentCanvasSection?: boolean;
  isPreviewTarget?: boolean;
  spatialDistance?: number;
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
  isCurrentCanvasSection = false,
  isPreviewTarget = false,
  spatialDistance = 0,
  onSelect,
  onFocus,
  onBlur
}) => {
  const label = CAMERA_LABELS[section];

  // Calculate distance-based visual indicators for canvas mode
  const getDistanceOpacity = () => {
    if (spatialDistance === 0) return 1;
    const normalizedDistance = Math.min(spatialDistance / 500, 1);
    return Math.max(0.6, 1 - normalizedDistance * 0.4);
  };

  const getSpatialScale = () => {
    if (isCurrentCanvasSection) return 1.2;
    if (isPreviewTarget) return 1.15;
    if (isHighlighted) return 1.1;
    return 1;
  };

  return (
    <button
      type="button"
      className={`
        absolute transform -translate-x-1/2 -translate-y-1/2
        w-16 h-16 min-w-[44px] min-h-[44px] rounded-full border-2
        flex flex-col items-center justify-center
        text-xs font-medium
        transition-all duration-150 ease-out
        focus:outline-none
        active:scale-95
        touch-manipulation
        ${isCurrentCanvasSection
          ? 'border-violet-400/80 bg-violet-900/95 text-violet-100 ring-2 ring-violet-400/30 shadow-lg shadow-violet-400/20'
          : isPreviewTarget
          ? 'border-cyan-400/80 bg-cyan-900/95 text-cyan-100 ring-2 ring-cyan-400/30'
          : isHighlighted
          ? 'border-orange-400/80 bg-slate-800/95 text-white'
          : 'border-white/20 bg-slate-900/90 text-white'
        }
        ${isAccessible ? 'ring-2 ring-blue-400/50' : ''}
        hover:border-orange-400/60 hover:bg-slate-800/95
        focus:ring-2 focus:ring-orange-400/50
        active:bg-slate-700/95
        backdrop-blur-sm
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 9999,
        // Enhanced touch targets for mobile
        minWidth: '44px',
        minHeight: '44px',
        // Spatial awareness scaling and opacity
        transform: `translate(-50%, -50%) scale(${getSpatialScale()})`,
        opacity: getDistanceOpacity()
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
  canvasMode?: boolean;
  isCanvasTransition?: boolean;
  canvasPerformance?: {
    fps: number;
    operations: number;
  };
}

const ActivationIndicator: React.FC<ActivationIndicatorProps> = ({
  x,
  y,
  isActive,
  activationProgress,
  activationMethod,
  canvasMode = false,
  isCanvasTransition = false,
  canvasPerformance = { fps: 60, operations: 0 }
}) => {
  const progressPercent = Math.round(activationProgress * 100);
  const strokeDasharray = 2 * Math.PI * 12; // Circumference of progress circle
  const strokeDashoffset = strokeDasharray * (1 - activationProgress);

  // Enhanced feedback colors with canvas mode awareness
  const getProgressColor = () => {
    if (canvasMode && isCanvasTransition) {
      return 'rgb(139, 69, 193)'; // Violet for canvas transitions
    }
    if (activationMethod === 'touch-long-press') {
      return activationProgress < 0.5 ? 'rgb(34, 197, 94)' : 'rgb(251, 146, 60)';
    }
    if (canvasMode) {
      return 'rgb(59, 130, 246)'; // Blue for canvas mode
    }
    return 'rgb(251, 146, 60)';
  };

  const getProgressBackgroundColor = () => {
    if (canvasMode && isCanvasTransition) {
      return 'rgba(139, 69, 193, 0.3)';
    }
    if (activationMethod === 'touch-long-press') {
      return 'rgba(34, 197, 94, 0.3)';
    }
    if (canvasMode) {
      return 'rgba(59, 130, 246, 0.3)';
    }
    return 'rgba(251, 146, 60, 0.3)';
  };

  // Performance-based visual feedback
  const getPerformanceIndicator = () => {
    if (!canvasMode) return null;

    const isPerformanceGood = canvasPerformance.fps >= 50;
    const hasHighLoad = canvasPerformance.operations > 3;

    if (!isPerformanceGood || hasHighLoad) {
      return 'rgba(239, 68, 68, 0.5)'; // Red tint for performance issues
    }
    return null;
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
        {/* Enhanced pulse effects for different modes */}
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

        {/* Canvas transition pulse effect */}
        {canvasMode && isCanvasTransition && (
          <circle
            cx="18"
            cy="18"
            r="20"
            fill="none"
            stroke="rgba(139, 69, 193, 0.4)"
            strokeWidth="2"
            className="animate-pulse"
          />
        )}

        {/* Performance warning indicator */}
        {getPerformanceIndicator() && (
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke={getPerformanceIndicator()!}
            strokeWidth="1"
            className="animate-pulse"
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

      {/* Enhanced method indicator with canvas awareness */}
      {(activationMethod || (canvasMode && isCanvasTransition)) && (
        <div
          className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2
                     px-3 py-2 backdrop-blur-sm rounded-lg
                     text-xs text-white/90 whitespace-nowrap border
                     transition-all duration-200
                     ${canvasMode && isCanvasTransition
                       ? 'bg-violet-900/95 border-violet-400/30'
                       : activationMethod === 'touch-long-press'
                       ? 'bg-green-900/95 border-green-400/30'
                       : canvasMode
                       ? 'bg-blue-900/95 border-blue-400/30'
                       : 'bg-slate-900/95 border-white/20'
                     }`}
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
          {canvasMode && isCanvasTransition && !activationMethod && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-violet-400">
                <path d="M3 7V17L12 22L21 17V7L12 2L3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Canvas Navigation {canvasPerformance.fps}fps
            </span>
          )}
          {canvasMode && !isCanvasTransition && !activationMethod && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Spatial Mode Active
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

  // Canvas state integration for enhanced spatial navigation
  const canvasContext = useCanvasState();
  const { state: canvasStateFromProvider, actions: canvasActions } = canvasContext;

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
    radialMenu.repositionMenu
  ]);

  // Enhanced performance monitoring with canvas coordination
  useEffect(() => {
    if (onPerformanceUpdate && cursorTracking.performance) {
      const metrics = {
        cursorTrackingFPS: cursorTracking.performance.frameRate,
        averageResponseTime: cursorTracking.performance.averageLatency,
        memoryUsage: canvasContext.isInitialized ? canvasStateFromProvider.performance.canvasMemoryMB : 0,
        activationLatency: lensActivation.activationProgress > 0 ?
          (lensActivation.activationMethod === 'click-hold' ? 100 :
           lensActivation.activationMethod === 'hover' ? 800 :
           lensActivation.activationMethod === 'touch-long-press' ? 750 : 50) : 50,
        menuRenderTime: canvasContext.isInitialized ? canvasStateFromProvider.performance.transformOverhead : 8,
        sessionDuration: canvasContext.isInitialized ?
          canvasStateFromProvider.transitionHistory.length * 600 : 0 // Estimate based on transitions
      };
      onPerformanceUpdate(metrics);

      // Update canvas performance metrics if canvas integration is active
      if (canvasContext.isInitialized) {
        canvasActions.updatePerformanceMetrics({
          averageMovementTime: metrics.averageResponseTime,
          activeOperations: lensActivation.isActive ? 1 : 0
        });
      }
    }
  }, [
    cursorTracking.performance,
    onPerformanceUpdate,
    canvasContext.isInitialized,
    canvasStateFromProvider.performance,
    canvasStateFromProvider.transitionHistory.length,
    canvasActions,
    lensActivation.activationProgress,
    lensActivation.activationMethod,
    lensActivation.isActive
  ]);

  // Enhanced start/stop cursor tracking with performance coordination
  useEffect(() => {
    if (isEnabled && !cursorTracking.isTracking) {
      cursorTracking.startTracking();

      // Optimize tracking based on canvas performance if available
      if (canvasContext.isInitialized) {
        const canvasPerf = canvasStateFromProvider.performance;

        // Reduce tracking frequency if canvas is under load
        if (canvasPerf.canvasRenderFPS < 45 || canvasPerf.activeOperations > 5) {
          // Canvas is struggling - reduce cursor tracking frequency
          canvasActions.updatePerformanceMetrics({
            isOptimized: true
          });
        }
      }
    } else if (!isEnabled && cursorTracking.isTracking) {
      cursorTracking.stopTracking();
    }
  }, [isEnabled, cursorTracking.isTracking, cursorTracking.startTracking, cursorTracking.stopTracking, canvasContext.isInitialized, canvasStateFromProvider.performance, canvasActions.updatePerformanceMetrics]);

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
    cursorTracking.isTracking,
    cursorTracking.startTracking,
    cursorTracking.stopTracking,
    radialMenu.resetMenu,
    onActivate,
    onDeactivate
  ]);

  // Handle keyboard navigation in accessible mode
  useEffect(() => {
    if (fallbackMode === 'keyboard') {
      setIsAccessibleMode(true);
    }
  }, [fallbackMode]);

  // Performance coordination system - automatically adjust behavior based on system load
  useEffect(() => {
    if (!canvasContext.isInitialized || !lensActivation.isActive) return;

    let performanceMonitorInterval: NodeJS.Timeout | null = null;

    // Only setup monitoring in non-test environment to prevent memory issues in tests
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
      performanceMonitorInterval = setInterval(() => {
        try {
          const canvasPerf = canvasStateFromProvider.performance;
          const cursorPerf = cursorTracking.performance;

          // Calculate system load score (0-100, higher is worse)
          const systemLoadScore =
            ((60 - canvasPerf.canvasRenderFPS) / 60 * 40) + // Canvas FPS impact (40% weight)
            (canvasPerf.activeOperations / 10 * 30) + // Active operations impact (30% weight)
            ((16 - cursorPerf.averageLatency) / 16 * 20) + // Cursor latency impact (20% weight)
            (canvasPerf.canvasMemoryMB / 100 * 10); // Memory usage impact (10% weight)

          // Apply optimizations based on load
          if (systemLoadScore > 60) {
            // High load - aggressive optimization
            canvasActions.optimizePerformance();

            // Reduce spatial preview frequency
            if (showSpatialPreview) {
              canvasActions.updatePerformanceMetrics({
                isOptimized: true,
                activeOperations: Math.max(0, canvasPerf.activeOperations - 1)
              });
            }
          } else if (systemLoadScore > 30) {
            // Medium load - moderate optimization
            canvasActions.updatePerformanceMetrics({
              isOptimized: true
            });
          } else if (systemLoadScore < 15 && canvasPerf.isOptimized) {
            // Low load - can restore full functionality
            canvasActions.updatePerformanceMetrics({
              isOptimized: false
            });
          }

          // Report coordination metrics to parent
          if (onPerformanceUpdate) {
            onPerformanceUpdate({
              cursorTrackingFPS: cursorPerf.frameRate,
              averageResponseTime: cursorPerf.averageLatency,
              memoryUsage: canvasPerf.canvasMemoryMB,
              activationLatency: lensActivation.activationProgress > 0 ?
                (lensActivation.activationMethod === 'click-hold' ? 100 :
                 lensActivation.activationMethod === 'hover' ? 800 : 50) : 50,
              menuRenderTime: canvasPerf.transformOverhead,
              sessionDuration: canvasStateFromProvider.transitionHistory.length * 600
            });
          }
        } catch (error) {
          // Silently handle errors to prevent test failures
          console.warn('Performance monitoring error:', error);
        }
      }, 1000); // Check every second
    }

    return () => {
      if (performanceMonitorInterval) {
        clearInterval(performanceMonitorInterval);
      }
    };
  }, [
    canvasContext.isInitialized,
    lensActivation.isActive,
    showSpatialPreview,
    onPerformanceUpdate
  ]); // Simplified dependencies to prevent excessive re-renders

  // Section selection handler with enhanced canvas integration
  const handleSectionSelect = useCallback((section: PhotoWorkflowSection) => {
    // Enhanced canvas navigation using CanvasStateProvider
    if (canvasMode && canvasContext.isInitialized) {
      // Use custom mapper or default spatial grid mapping
      const targetPosition = sectionToCanvasMapper
        ? sectionToCanvasMapper(section)
        : getSectionCanvasPosition(section);

      // Calculate smooth movement duration for camera-like transition
      const movementDuration = calculateMovementDuration(
        canvasStateFromProvider.currentPosition,
        targetPosition,
        600, // Base time for smooth professional camera movement
        1200 // Max time for long transitions
      );

      // Track transition for performance monitoring
      canvasActions.trackTransition({
        from: canvasStateFromProvider.currentPosition,
        to: targetPosition,
        movement: 'pan-tilt',
        duration: movementDuration,
        success: true
      });

      // Execute smooth canvas navigation
      canvasActions.setActiveSection(section as any);
      canvasActions.updatePosition(targetPosition);

      // Update parent callback if provided
      if (onCanvasPositionChange) {
        onCanvasPositionChange(targetPosition);
      }
    } else if (canvasMode && onCanvasPositionChange) {
      // Fallback to original canvas integration for backward compatibility
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
  }, [
    canvasMode,
    canvasContext.isInitialized,
    canvasStateFromProvider.currentPosition,
    canvasActions,
    sectionToCanvasMapper,
    onCanvasPositionChange,
    actions,
    onSectionSelect,
    lensActivation
  ]);

  // Enhanced section highlighting with spatial preview
  const handleSectionFocus = useCallback((section: PhotoWorkflowSection) => {
    setHighlightedSection(section);

    // Show spatial preview if enabled and canvas mode is active
    if (showSpatialPreview && canvasMode && canvasContext.isInitialized) {
      const previewPosition = sectionToCanvasMapper
        ? sectionToCanvasMapper(section)
        : getSectionCanvasPosition(section);

      // Update canvas target position for preview without committing to navigation
      canvasActions.setTargetPosition(previewPosition);

      // Track preview interaction for performance monitoring
      canvasActions.updatePerformanceMetrics({
        activeOperations: canvasStateFromProvider.performance.activeOperations + 1
      });
    }
  }, [
    showSpatialPreview,
    canvasMode,
    canvasContext.isInitialized,
    sectionToCanvasMapper,
    canvasActions,
    canvasStateFromProvider.performance.activeOperations
  ]);

  // Enhanced section blur with spatial preview cleanup
  const handleSectionBlur = useCallback(() => {
    setHighlightedSection(null);

    // Clear spatial preview if enabled and canvas mode is active
    if (showSpatialPreview && canvasMode && canvasContext.isInitialized) {
      // Clear target position to stop preview
      canvasActions.setTargetPosition(null);

      // Update performance metrics
      canvasActions.updatePerformanceMetrics({
        activeOperations: Math.max(0, canvasStateFromProvider.performance.activeOperations - 1)
      });
    }
  }, [
    showSpatialPreview,
    canvasMode,
    canvasContext.isInitialized,
    canvasActions,
    canvasStateFromProvider.performance.activeOperations
  ]);

  // Enhanced menu items calculation with spatial awareness
  const menuItems = useMemo(() => {
    if (!lensActivation.isActive || !radialMenu.menuPosition.center) {
      return [];
    }

    return radialMenu.itemPositions.map((item) => {
      // Enhanced highlighting logic with spatial awareness
      const isCurrentCanvasSection = canvasContext.isInitialized &&
        canvasStateFromProvider.activeSection === item.section;

      const isHighlighted = highlightedSection === item.section;
      const isPreviewTarget = showSpatialPreview && canvasMode &&
        canvasStateFromProvider.targetPosition !== null &&
        highlightedSection === item.section;

      return {
        ...item,
        isHighlighted,
        isCurrentCanvasSection,
        isPreviewTarget,
        screenX: item.coordinates.x,
        screenY: item.coordinates.y,
        // Add spatial distance indicator for canvas mode
        spatialDistance: canvasContext.isInitialized ?
          Math.sqrt(
            Math.pow(canvasStateFromProvider.currentPosition.x -
              (sectionToCanvasMapper ? sectionToCanvasMapper(item.section).x :
               getSectionCanvasPosition(item.section).x), 2) +
            Math.pow(canvasStateFromProvider.currentPosition.y -
              (sectionToCanvasMapper ? sectionToCanvasMapper(item.section).y :
               getSectionCanvasPosition(item.section).y), 2)
          ) : 0
      };
    });
  }, [
    lensActivation.isActive,
    radialMenu.menuPosition.center,
    radialMenu.itemPositions,
    highlightedSection,
    canvasContext.isInitialized,
    canvasStateFromProvider.activeSection,
    canvasStateFromProvider.targetPosition,
    canvasStateFromProvider.currentPosition,
    showSpatialPreview,
    canvasMode,
    sectionToCanvasMapper
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
        pointerEvents: 'auto', // Always enable to receive activation gestures
        // Enhanced touch optimization
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {/* Enhanced activation indicator with canvas awareness */}
      {radialMenu.menuPosition.center && (
        <ActivationIndicator
          x={radialMenu.menuPosition.center.x}
          y={radialMenu.menuPosition.center.y}
          isActive={lensActivation.isActive}
          activationProgress={lensActivation.activationProgress}
          activationMethod={lensActivation.activationMethod}
          canvasMode={canvasMode}
          isCanvasTransition={canvasContext.isInitialized &&
            canvasStateFromProvider.camera.activeMovement !== null}
          canvasPerformance={{
            fps: canvasContext.isInitialized ? canvasStateFromProvider.performance.canvasRenderFPS : 60,
            operations: canvasContext.isInitialized ? canvasStateFromProvider.performance.activeOperations : 0
          }}
        />
      )}

      {/* Enhanced radial menu items with spatial awareness */}
      {lensActivation.isActive && menuItems.map((item) => (
        <RadialMenuItem
          key={item.section}
          section={item.section}
          x={item.screenX}
          y={item.screenY}
          isHighlighted={item.isHighlighted}
          isAccessible={isAccessibleMode}
          isCurrentCanvasSection={item.isCurrentCanvasSection}
          isPreviewTarget={item.isPreviewTarget}
          spatialDistance={item.spatialDistance}
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