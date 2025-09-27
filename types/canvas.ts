/**
 * 2D Canvas Layout System Types
 *
 * TypeScript interfaces for photographer's lightbox spatial navigation system.
 * Supports cinematic camera movements, spatial coordinate mapping, and integration
 * with existing CursorLens navigation.
 *
 * @fileoverview Canvas coordinate system and camera movement type definitions
 * @version 1.0.0
 * @since Phase 2 - "The Lightbox" Implementation
 */

import React from 'react';
import type { PhotoWorkflowSection, ActivationMethod } from './cursor-lens';
import type { GameFlowSection, PerformanceMetrics } from './game-flow';
import type { UnifiedGameFlowState } from './unified-gameflow';

// ===== CORE CANVAS COORDINATE TYPES =====

/**
 * 2D canvas position with scale factor
 * Represents a position on the photographer's lightbox canvas
 */
export interface CanvasPosition {
  /** Horizontal position in canvas units (0 = viewport center) */
  x: number;
  /** Vertical position in canvas units (0 = viewport center) */
  y: number;
  /** Scale factor for zoom level (1.0 = 100%, 2.0 = 200% zoom) */
  scale: number;
}

/**
 * Spatial grid coordinates for section arrangement
 * Maps 6 sections to a 2x3 or 3x2 spatial grid layout
 */
export interface SpatialCoordinates {
  /** Grid column position (0-2 for 3-column layout) */
  gridX: number;
  /** Grid row position (0-1 for 2-row layout) */
  gridY: number;
  /** Optional fine-tuned horizontal offset in pixels */
  offsetX?: number;
  /** Optional fine-tuned vertical offset in pixels */
  offsetY?: number;
}

// ===== CAMERA MOVEMENT TYPES =====

/**
 * Cinema-inspired camera movement types for spatial navigation
 * Each movement type has specific transition characteristics and use cases
 */
export type CameraMovement =
  | 'pan-tilt'      // Primary movement between sections (800ms transitions)
  | 'zoom-in'       // Scale increase for detail focus (1.0 → 1.5-2.0)
  | 'zoom-out'      // Scale decrease for overview (2.0 → 1.0)
  | 'dolly-zoom'    // Combined scale/perspective for cinematic impact (single use)
  | 'rack-focus'    // Blur/opacity effects for attention direction
  | 'match-cut';    // Shared element position tracking between sections

/**
 * Camera movement configuration and timing
 */
export interface CameraMovementConfig {
  /** Movement type */
  type: CameraMovement;
  /** Animation duration in milliseconds */
  duration: number;
  /** CSS easing function for movement */
  easing: string;
  /** Whether to use hardware acceleration */
  useGPU: boolean;
  /** Performance priority (higher = more aggressive optimization) */
  priority: 'low' | 'medium' | 'high';
}

// ===== SPATIAL SECTION MAPPING =====

/**
 * Spatial arrangement mapping for photography workflow sections
 * Maps existing PhotoWorkflowSection to spatial coordinates and metadata
 */
export interface SpatialSectionMap {
  /** Section identifier from PhotoWorkflowSection */
  section: PhotoWorkflowSection;
  /** Spatial grid position */
  coordinates: SpatialCoordinates;
  /** Canvas position when section is active/focused */
  canvasPosition: CanvasPosition;
  /** Section display metadata */
  metadata: {
    /** Section title for display */
    title: string;
    /** Brief description */
    description: string;
    /** Camera metaphor label */
    cameraMetaphor: string;
    /** Display priority for constrained layouts (1 = highest) */
    priority: number;
  };
}

/**
 * Extended PhotoWorkflowSection with spatial metadata
 * Maintains compatibility with existing cursor lens system
 */
export type SpatialPhotoWorkflowSection = PhotoWorkflowSection;

/**
 * Spatial section arrangement options
 * Supports different grid layouts for responsive design
 */
export type SpatialLayout = '2x3' | '3x2' | '1x6' | 'circular';

// ===== CANVAS STATE MANAGEMENT =====

/**
 * Extended canvas state that integrates with UnifiedGameFlowState
 * Adds spatial navigation capabilities while preserving existing functionality
 */
export interface CanvasState {
  /** Current canvas viewport position and scale */
  currentPosition: CanvasPosition;
  /** Target position for ongoing transitions */
  targetPosition: CanvasPosition | null;
  /** Currently active/focused section in spatial layout */
  activeSection: SpatialPhotoWorkflowSection;
  /** Previous section for transition tracking */
  previousSection: SpatialPhotoWorkflowSection | null;
  /** Current spatial layout configuration */
  layout: SpatialLayout;
  /** Section arrangement with coordinates */
  sectionMap: Map<SpatialPhotoWorkflowSection, SpatialSectionMap>;
  /** Camera movement state */
  camera: {
    /** Currently executing movement */
    activeMovement: CameraMovement | null;
    /** Movement start timestamp */
    movementStartTime: number | null;
    /** Movement configuration */
    movementConfig: CameraMovementConfig | null;
    /** Movement progress (0-1) */
    progress: number;
  };
  /** Canvas interaction state */
  interaction: {
    /** Whether canvas is being panned via touch/drag */
    isPanning: boolean;
    /** Whether canvas is being zoomed */
    isZooming: boolean;
    /** Touch/gesture state for mobile */
    touchState: {
      initialDistance: number | null;
      initialPosition: CanvasPosition | null;
    };
  };
  /** Performance tracking for canvas operations */
  performance: {
    /** Current canvas rendering FPS */
    canvasFPS: number;
    /** Transform operation latency */
    transformLatency: number;
    /** Memory usage for canvas operations */
    canvasMemoryUsage: number;
    /** Whether performance optimization is active */
    isOptimized: boolean;
  };
  /** Accessibility state for spatial navigation */
  accessibility: {
    /** Whether keyboard spatial navigation is active */
    keyboardSpatialNav: boolean;
    /** Current spatial focus for screen readers */
    spatialFocus: SpatialPhotoWorkflowSection | null;
    /** Whether reduced motion is preferred */
    reducedMotion: boolean;
  };
}

/**
 * Canvas-specific actions that extend UnifiedGameFlowActions
 */
export interface CanvasActions {
  /** Navigate to specific canvas position */
  navigateToPosition: (position: CanvasPosition, movement?: CameraMovement) => Promise<void>;
  /** Navigate to section with spatial awareness */
  navigateToSpatialSection: (section: SpatialPhotoWorkflowSection, movement?: CameraMovement) => Promise<void>;
  /** Update canvas position (for programmatic control) */
  updateCanvasPosition: (position: CanvasPosition) => void;
  /** Set active section with spatial coordination */
  setActiveSpatialSection: (section: SpatialPhotoWorkflowSection) => void;
  /** Execute specific camera movement */
  executeCameraMovement: (movement: CameraMovement, config?: Partial<CameraMovementConfig>) => Promise<void>;
  /** Handle touch/gesture interactions */
  handleCanvasInteraction: (type: 'pan' | 'zoom', data: any) => void;
  /** Optimize canvas performance */
  optimizeCanvasPerformance: () => void;
  /** Reset canvas to default position */
  resetCanvasPosition: () => void;
}

// ===== COORDINATE TRANSFORMATION UTILITIES =====

/**
 * Coordinate transformation result
 */
export interface CoordinateTransform {
  /** Transformed position */
  position: CanvasPosition;
  /** Whether transform was successful */
  success: boolean;
  /** Error message if transform failed */
  error?: string;
}

/**
 * Viewport constraint information for canvas bounds
 */
export interface CanvasViewportConstraints {
  /** Minimum canvas position */
  minPosition: CanvasPosition;
  /** Maximum canvas position */
  maxPosition: CanvasPosition;
  /** Minimum allowed scale */
  minScale: number;
  /** Maximum allowed scale */
  maxScale: number;
  /** Boundary padding in pixels */
  padding: number;
}

// ===== CURSOR LENS INTEGRATION TYPES =====

/**
 * Extended CursorLens props for canvas mode
 * Maintains compatibility while adding spatial navigation
 */
export interface CanvasIntegratedCursorLensProps {
  /** Enable canvas mode for spatial navigation */
  canvasMode?: boolean;
  /** Canvas state for coordinate mapping */
  canvasState?: CanvasState;
  /** Canvas position update callback */
  onCanvasPositionChange?: (position: CanvasPosition) => void;
  /** Section-to-canvas mapping function */
  sectionToCanvasMapper?: (section: SpatialPhotoWorkflowSection) => CanvasPosition;
  /** Canvas-to-section mapping function */
  canvasToSectionMapper?: (position: CanvasPosition) => SpatialPhotoWorkflowSection | null;
}

// ===== PERFORMANCE AND MONITORING =====

/**
 * Canvas-specific performance metrics
 * Extends existing performance tracking
 */
export interface CanvasPerformanceMetrics {
  /** Canvas rendering frame rate */
  canvasRenderFPS: number;
  /** Average camera movement completion time */
  averageMovementTime: number;
  /** Transform operation overhead */
  transformOverhead: number;
  /** Canvas memory usage */
  canvasMemoryMB: number;
  /** GPU utilization percentage */
  gpuUtilization: number;
  /** Number of simultaneous canvas operations */
  activeOperations: number;
}

/**
 * Extended UnifiedGameFlowState with canvas capabilities
 * Maintains full compatibility with existing state while adding spatial features
 */
export interface CanvasExtendedUnifiedGameFlowState extends UnifiedGameFlowState {
  /** Canvas-specific state */
  canvas: CanvasState;
  /** Extended performance metrics */
  performance: UnifiedGameFlowState['performance'] & {
    /** Canvas-specific metrics */
    canvas: CanvasPerformanceMetrics;
  };
}

// ===== UTILITY FUNCTIONS TYPES =====

/**
 * Canvas utility functions interface
 * Provides coordinate transformations and calculations
 */
export interface CanvasUtilities {
  /** Convert scroll position to canvas coordinates */
  scrollToCanvas: (scrollPosition: number, sectionHeight: number) => CanvasPosition;
  /** Convert canvas coordinates to scroll position */
  canvasToScroll: (canvasPosition: CanvasPosition, sectionHeight: number) => number;
  /** Calculate section grid coordinates */
  calculateSectionCoordinates: (section: SpatialPhotoWorkflowSection, layout: SpatialLayout) => SpatialCoordinates;
  /** Calculate camera movement path */
  calculateMovementPath: (from: CanvasPosition, to: CanvasPosition, movement: CameraMovement) => CanvasPosition[];
  /** Validate canvas position within bounds */
  validateCanvasPosition: (position: CanvasPosition, constraints: CanvasViewportConstraints) => CoordinateTransform;
  /** Optimize canvas position for performance */
  optimizeCanvasPosition: (position: CanvasPosition, currentPerformance: CanvasPerformanceMetrics) => CanvasPosition;
}

// ===== COMPONENT INTEGRATION TYPES =====

/**
 * LightboxCanvas component props
 * Main container for 2D spatial navigation
 */
export interface LightboxCanvasProps {
  /** Canvas state */
  canvasState: CanvasState;
  /** Canvas actions */
  canvasActions: CanvasActions;
  /** Child sections to render spatially */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Performance mode */
  performanceMode?: 'high' | 'balanced' | 'low';
  /** Debug mode for development */
  debugMode?: boolean;
}

/**
 * SpatialSection component props
 * Individual section positioned within canvas
 */
export interface SpatialSectionProps {
  /** Section identifier */
  section: SpatialPhotoWorkflowSection;
  /** Section spatial metadata */
  sectionMap: SpatialSectionMap;
  /** Whether section is currently active */
  isActive: boolean;
  /** Current canvas scale factor */
  scale: number;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CameraController component props
 * Handles camera movement orchestration
 */
export interface CameraControllerProps {
  /** Current canvas state */
  canvasState: CanvasState;
  /** Camera movement actions */
  onMovementExecute: (movement: CameraMovement, config: CameraMovementConfig) => Promise<void>;
  /** Movement completion callback */
  onMovementComplete: (movement: CameraMovement) => void;
  /** Performance monitoring callback */
  onPerformanceUpdate: (metrics: CanvasPerformanceMetrics) => void;
}

// ===== DEFAULT CONFIGURATIONS =====

/**
 * Default spatial section mapping for 6 photography workflow sections
 * Maps to standard 3x2 grid layout with hero section centered
 */
export const DEFAULT_SPATIAL_MAPPING: Record<SpatialPhotoWorkflowSection, SpatialSectionMap> = {
  capture: {
    section: 'capture',
    coordinates: { gridX: 1, gridY: 0 }, // Top center (Hero)
    canvasPosition: { x: 0, y: -100, scale: 1.0 },
    metadata: {
      title: 'Capture',
      description: 'Introduction & readiness',
      cameraMetaphor: 'Hero Viewfinder',
      priority: 1
    }
  },
  focus: {
    section: 'focus',
    coordinates: { gridX: 2, gridY: 0 }, // Top right (About)
    canvasPosition: { x: 200, y: -100, scale: 1.0 },
    metadata: {
      title: 'Focus',
      description: 'Attention to detail',
      cameraMetaphor: 'About',
      priority: 2
    }
  },
  frame: {
    section: 'frame',
    coordinates: { gridX: 2, gridY: 1 }, // Bottom right (Creative)
    canvasPosition: { x: 200, y: 100, scale: 1.0 },
    metadata: {
      title: 'Frame',
      description: 'Composition & planning',
      cameraMetaphor: 'Creative Projects',
      priority: 3
    }
  },
  exposure: {
    section: 'exposure',
    coordinates: { gridX: 1, gridY: 1 }, // Bottom center (Professional)
    canvasPosition: { x: 0, y: 100, scale: 1.0 },
    metadata: {
      title: 'Exposure',
      description: 'Technical execution',
      cameraMetaphor: 'Professional Work',
      priority: 4
    }
  },
  develop: {
    section: 'develop',
    coordinates: { gridX: 0, gridY: 1 }, // Bottom left (Thought Leadership)
    canvasPosition: { x: -200, y: 100, scale: 1.0 },
    metadata: {
      title: 'Develop',
      description: 'Process & refinement',
      cameraMetaphor: 'Thought Leadership',
      priority: 5
    }
  },
  portfolio: {
    section: 'portfolio',
    coordinates: { gridX: 0, gridY: 0 }, // Top left (Contact)
    canvasPosition: { x: -200, y: -100, scale: 1.0 },
    metadata: {
      title: 'Portfolio',
      description: 'Results & showcase',
      cameraMetaphor: 'Contact',
      priority: 6
    }
  }
} as const;

/**
 * Default camera movement configurations
 * Optimized for 60fps performance and photography metaphors
 */
export const DEFAULT_CAMERA_MOVEMENTS: Record<CameraMovement, CameraMovementConfig> = {
  'pan-tilt': {
    type: 'pan-tilt',
    duration: 800,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    useGPU: true,
    priority: 'high'
  },
  'zoom-in': {
    type: 'zoom-in',
    duration: 600,
    easing: 'cubic-bezier(0.2, 0.0, 0.2, 1)',
    useGPU: true,
    priority: 'high'
  },
  'zoom-out': {
    type: 'zoom-out',
    duration: 600,
    easing: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    useGPU: true,
    priority: 'high'
  },
  'dolly-zoom': {
    type: 'dolly-zoom',
    duration: 1200,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    useGPU: true,
    priority: 'medium'
  },
  'rack-focus': {
    type: 'rack-focus',
    duration: 400,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    useGPU: true,
    priority: 'medium'
  },
  'match-cut': {
    type: 'match-cut',
    duration: 300,
    easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    useGPU: true,
    priority: 'low'
  }
} as const;