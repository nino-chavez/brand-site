import React from 'react';

/**
 * CursorLens Component Types
 *
 * TypeScript interfaces for zero-occlusion cursor-activated radial navigation system.
 * Supports 60fps cursor tracking, viewport constraint handling, and photography workflow integration.
 *
 * @fileoverview Cursor lens component type definitions
 * @version 1.0.0
 * @since Phase 1 - Setup and Foundation
 */

// ===== CORE ENUMS AND UNION TYPES =====

/**
 * Photography workflow sections arranged in clockwise order
 * Matches existing GameFlowSection but specific to cursor lens navigation
 */
export type PhotoWorkflowSection =
    | 'capture'   // 12 o'clock - Introduction & readiness
    | 'focus'     // 2 o'clock - Attention to detail
    | 'frame'     // 4 o'clock - Composition & planning
    | 'exposure'  // 6 o'clock - Technical execution
    | 'develop'   // 8 o'clock - Process & refinement
    | 'portfolio'; // 10 o'clock - Results & showcase

/**
 * Methods for activating the cursor lens menu
 * Supports multi-modal activation for accessibility
 */
export type ActivationMethod =
    | 'click-hold'      // Primary: mouse click and hold
    | 'hover'           // Secondary: 800ms hover delay
    | 'keyboard'        // Accessibility: keyboard activation
    | 'touch-long-press'; // Mobile: 750ms touch press

/**
 * Viewport edge proximity detection
 * Used for smart repositioning algorithms
 */
export type ViewportEdge = 'left' | 'right' | 'top' | 'bottom';

/**
 * Menu repositioning reasons for constraint handling
 */
export type ConstraintReason =
    | 'edge-left'
    | 'edge-right'
    | 'edge-top'
    | 'edge-bottom'
    | 'corner-top-left'
    | 'corner-top-right'
    | 'corner-bottom-left'
    | 'corner-bottom-right';

// ===== CORE POSITION AND TRACKING TYPES =====

/**
 * High-frequency cursor position with performance tracking
 * Updated every 16ms for 60fps response requirement
 */
export interface CursorPosition {
  /** Horizontal position in viewport coordinates */
  x: number;
  /** Vertical position in viewport coordinates */
  y: number;
  /** Timestamp for velocity calculation and performance tracking */
  timestamp: number;
  /** Optional velocity for predictive positioning */
  velocity?: {
    x: number;
    y: number;
  };
}

/**
 * Calculated menu position with constraint handling
 * Supports smart repositioning for viewport edges
 */
export interface MenuPosition {
  /** Menu center coordinates */
  center: {
    x: number;
    y: number;
  };
  /** Menu radius for section positioning */
  radius: number;
  /** Whether menu was repositioned due to constraints */
  repositioned: boolean;
  /** Reason for repositioning if applicable */
  constraintReason?: ConstraintReason;
  /** Original cursor position before repositioning */
  originalCursorPosition?: {
    x: number;
    y: number;
  };
}

/**
 * Individual section position within radial menu
 * Calculated based on clockwise arrangement
 */
export interface MenuItemPosition {
  /** Section identifier */
  section: PhotoWorkflowSection;
  /** Angular position in radians (0° = 12 o'clock) */
  angle: number;
  /** Calculated screen coordinates */
  coordinates: {
    x: number;
    y: number;
  };
  /** Whether section is visible (may be hidden due to constraints) */
  isVisible: boolean;
  /** Display priority for constrained spaces (1 = highest) */
  priority: number;
}

/**
 * Viewport dimensions and constraint thresholds
 */
export interface ViewportDimensions {
  width: number;
  height: number;
  /** Minimum clearance from edges (default: 40px) */
  edgeClearance: number;
}

// ===== PERFORMANCE AND MONITORING TYPES =====

/**
 * Real-time performance metrics for cursor operations
 * Integrated with existing UnifiedGameFlowContext monitoring
 */
export interface CursorPerformanceMetrics {
  /** Current cursor tracking frame rate */
  cursorTrackingFPS: number;
  /** Average response time for section highlighting */
  averageResponseTime: number;
  /** Current memory usage for cursor operations */
  memoryUsage: number;
  /** Lens activation latency (target: <100ms) */
  activationLatency: number;
  /** Menu rendering time */
  menuRenderTime: number;
  /** Total active tracking time in current session */
  sessionDuration: number;
}

/**
 * Edge proximity detection result
 * Used for smart repositioning decisions
 */
export interface EdgeProximityResult {
  /** Distance to nearest edge */
  nearestEdge: ViewportEdge;
  /** Distance in pixels */
  distance: number;
  /** Whether repositioning is needed */
  needsRepositioning: boolean;
  /** Suggested new position if repositioning needed */
  suggestedPosition?: {
    x: number;
    y: number;
  };
}

// ===== GESTURE AND EVENT HANDLING TYPES =====

/**
 * Comprehensive gesture event handlers
 * Supports mouse, touch, and keyboard interactions
 */
export interface GestureEventHandlers {
  /** Mouse button press detection */
  onMouseDown: (event: MouseEvent) => void;
  /** Mouse button release detection */
  onMouseUp: (event: MouseEvent) => void;
  /** High-frequency mouse movement tracking */
  onMouseMove: (event: MouseEvent) => void;
  /** Touch start for mobile long-press */
  onTouchStart: (event: TouchEvent) => void;
  /** Touch end for mobile activation */
  onTouchEnd: (event: TouchEvent) => void;
  /** Keyboard activation support */
  onKeyDown: (event: KeyboardEvent) => void;
}

// ===== COMPONENT PROP INTERFACES =====

/**
 * Main CursorLens component props
 * Orchestrates cursor tracking, menu display, and navigation
 */
export interface CursorLensProps {
  /** Enable/disable lens functionality */
  isEnabled?: boolean;
  /** Hover activation delay in milliseconds (default: 800ms) */
  activationDelay?: number;
  /** Additional CSS classes for styling */
  className?: string;
  /** Section selection callback */
  onSectionSelect?: (section: PhotoWorkflowSection) => void;
  /** Lens activation callback */
  onActivate?: (method: ActivationMethod) => void;
  /** Lens deactivation callback */
  onDeactivate?: () => void;
  /** Performance metrics callback */
  onPerformanceUpdate?: (metrics: CursorPerformanceMetrics) => void;
  /** Accessibility fallback mode */
  fallbackMode?: 'keyboard' | 'traditional';
  /** Custom viewport dimensions (auto-detected if not provided) */
  viewportDimensions?: ViewportDimensions;
}

/**
 * Individual radial menu item props
 * Represents a single photography workflow section
 */
export interface RadialMenuItemProps {
  /** Section identifier and metadata */
  section: PhotoWorkflowSection;
  /** Calculated position within radial menu */
  position: MenuItemPosition;
  /** Current hover/focus state */
  isHighlighted: boolean;
  /** Accessibility mode active */
  isAccessible: boolean;
  /** Selection handler */
  onSelect: (section: PhotoWorkflowSection) => void;
  /** Focus handler for accessibility */
  onFocus: (section: PhotoWorkflowSection) => void;
  /** Blur handler for accessibility */
  onBlur: () => void;
  /** Additional styling classes */
  className?: string;
  /** Custom section label override */
  customLabel?: string;
}

// ===== HOOK RETURN TYPES =====

/**
 * useCursorTracking hook return interface
 * Provides high-frequency cursor position monitoring
 */
export interface CursorTrackingHook {
  /** Current cursor position with velocity data */
  position: CursorPosition | null;
  /** Whether tracking is currently active */
  isTracking: boolean;
  /** Start tracking with cleanup handling */
  startTracking: () => void;
  /** Stop tracking with automatic cleanup */
  stopTracking: () => void;
  /** Real-time performance metrics */
  performance: {
    frameRate: number;
    averageLatency: number;
  };
}

/**
 * useRadialMenu hook return interface
 * Handles menu positioning and viewport constraints
 */
export interface RadialMenuHook {
  /** Calculated menu center position */
  menuPosition: MenuPosition;
  /** Individual section positions */
  itemPositions: MenuItemPosition[];
  /** Whether menu was repositioned due to edge constraints */
  isRepositioned: boolean;
  /** Reposition menu based on cursor and viewport */
  repositionMenu: (cursorPos: CursorPosition, viewportSize: ViewportDimensions) => void;
  /** Reset menu to default positioning */
  resetMenu: () => void;
}

/**
 * useLensActivation hook return interface
 * Manages gesture detection and activation states
 */
export interface LensActivationHook {
  /** Current activation state */
  isActive: boolean;
  /** How lens was activated */
  activationMethod: ActivationMethod | null;
  /** Progress for hover activation (0-1) */
  activationProgress: number;
  /** Manual activation trigger */
  activate: (method: ActivationMethod) => void;
  /** Manual deactivation trigger */
  deactivate: () => void;
  /** Gesture event handlers for component attachment */
  gestureEvents: GestureEventHandlers;
}

// ===== STATE MANAGEMENT TYPES =====

/**
 * Complete CursorLens component state
 * Integrates with UnifiedGameFlowContext
 */
export interface CursorLensState {
  /** Current activation status */
  isActive: boolean;
  /** Live cursor position data */
  cursorPosition: CursorPosition | null;
  /** Calculated menu positioning */
  menuPosition: MenuPosition | null;
  /** Currently highlighted section */
  highlightedSection: PhotoWorkflowSection | null;
  /** Active activation method */
  activationMethod: ActivationMethod | null;
  /** Real-time performance tracking */
  performance: CursorPerformanceMetrics;
  /** Accessibility configuration */
  accessibility: {
    isKeyboardMode: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
}

// ===== SERVICE INTERFACE TYPES =====

/**
 * ViewportConstraintService interface
 * Handles edge detection and smart repositioning
 */
export interface ViewportConstraintService {
  /** Calculate optimal menu position */
  calculateMenuPosition: (cursorPos: CursorPosition, viewportSize: ViewportDimensions) => MenuPosition;
  /** Detect edge proximity */
  detectEdgeProximity: (position: CursorPosition, threshold: number) => EdgeProximityResult;
  /** Reposition for constraints */
  repositionForConstraints: (menuPos: MenuPosition, constraints: ViewportDimensions) => MenuPosition;
  /** Prioritize sections for constrained spaces */
  prioritizeSections: (availableSpace: ViewportDimensions) => Array<PhotoWorkflowSection>;
}

// ===== CAMERA METAPHOR INTEGRATION TYPES =====

/**
 * Camera metaphor labels for sections
 * Integrates with existing photography workflow
 */
export type CameraMetaphorLabels = {
  [K in PhotoWorkflowSection]: {
    primary: string;    // Main section label
    secondary: string;  // Camera metaphor description
    ariaLabel: string; // Screen reader description
  };
}

/**
 * Athletic design token integration
 * Maps to existing token system
 */
export interface CursorLensTokens {
  /** Colors from athletic palette */
  colors: {
    primary: string;    // court-navy
    highlight: string;  // court-orange
    accent: string;     // brand-violet
  };
  /** Athletic timing values */
  timing: {
    activation: number;     // 100ms target
    highlighting: number;   // 16ms target
    navigation: number;     // 220ms follow-through
    hover: number;         // 800ms delay
  };
  /** Easing curves for camera-like movement */
  easing: {
    entrance: string;
    exit: string;
    highlighting: string;
  };
}