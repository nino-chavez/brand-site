/**
 * Section Content Optimization TypeScript Interface Definitions
 *
 * TypeScript interfaces for progressive content disclosure system
 * implementing spatial section optimization with lens-controlled navigation
 * and photography metaphor integration.
 *
 * @fileoverview TypeScript interfaces for section content optimization
 * @version 1.0.0
 * @since Phase 3 - Section Content Integration
 */

import type { CSSProperties } from 'react';
import type { SpatialPhotoWorkflowSection, CanvasPosition } from './canvas';

// ============================================================================
// CONTENT LEVEL DEFINITIONS
// ============================================================================

/**
 * Progressive content disclosure levels
 * Maps zoom levels to content complexity for spatial navigation
 */
export enum ContentLevel {
  /** Preview level - minimal content at 0.25x-0.5x zoom */
  PREVIEW = 'preview',
  /** Summary level - overview content at 0.5x-1x zoom */
  SUMMARY = 'summary',
  /** Detailed level - comprehensive content at 1x-2x zoom */
  DETAILED = 'detailed',
  /** Technical level - full depth content at 2x-4x zoom */
  TECHNICAL = 'technical'
}

/**
 * Content level thresholds for zoom-based disclosure
 * Defines when each content level becomes visible
 */
export interface ContentLevelThresholds {
  /** Zoom level where preview content appears */
  preview: { min: number; max: number }; // 0.25x - 0.5x
  /** Zoom level where summary content appears */
  summary: { min: number; max: number }; // 0.5x - 1x
  /** Zoom level where detailed content appears */
  detailed: { min: number; max: number }; // 1x - 2x
  /** Zoom level where technical content appears */
  technical: { min: number; max: number }; // 2x - 4x
}

// ============================================================================
// SECTION CONTENT INTERFACES
// ============================================================================

/**
 * Base interface for section content with metadata
 * Extends spatial navigation with progressive disclosure capabilities
 */
export interface SectionContent {
  /** Section identifier from spatial workflow */
  sectionId: SpatialPhotoWorkflowSection;

  /** Content organized by disclosure level */
  content: {
    [ContentLevel.PREVIEW]: SectionContentData;
    [ContentLevel.SUMMARY]: SectionContentData;
    [ContentLevel.DETAILED]: SectionContentData;
    [ContentLevel.TECHNICAL]: SectionContentData;
  };

  /** Section metadata for spatial navigation */
  metadata: SectionMetadata;

  /** Progressive disclosure configuration */
  disclosureConfig: SectionContentConfig;

  /** Performance tracking for content loading */
  performance: {
    /** Content loading time by level (ms) */
    loadingTime: Record<ContentLevel, number>;
    /** Memory usage by level (bytes) */
    memoryUsage: Record<ContentLevel, number>;
    /** Cache status for each level */
    cacheStatus: Record<ContentLevel, 'cold' | 'warm' | 'hot'>;
  };
}

/**
 * Content data structure for each disclosure level
 * Supports rich content with accessibility features
 */
export interface SectionContentData {
  /** Primary heading for this content level */
  heading: string;

  /** Main content body (supports HTML/markdown) */
  body: string;

  /** Optional media elements */
  media?: {
    /** Image URLs with alt text */
    images?: Array<{ src: string; alt: string; caption?: string }>;
    /** Video URLs with descriptions */
    videos?: Array<{ src: string; poster?: string; description: string }>;
  };

  /** Interactive elements */
  interactive?: {
    /** Call-to-action buttons */
    actions?: Array<{ label: string; action: string; priority: 'primary' | 'secondary' }>;
    /** Expandable sections */
    expandable?: Array<{ title: string; content: string }>;
  };

  /** Accessibility information */
  accessibility: {
    /** ARIA label for section content */
    ariaLabel: string;
    /** Content description for screen readers */
    description: string;
    /** Landmark role */
    role: 'main' | 'section' | 'article' | 'complementary';
  };

  /** SEO and metadata */
  seo?: {
    /** Meta description */
    description: string;
    /** Keywords for content */
    keywords: string[];
    /** Schema.org structured data */
    schema?: Record<string, unknown>;
  };
}

/**
 * Section metadata for spatial navigation and photography metaphors
 * Integrates with existing canvas coordinate system
 */
export interface SectionMetadata {
  /** Display title for navigation */
  title: string;

  /** Brief description for section */
  description: string;

  /** Photography metaphor terminology */
  photographyMetaphor: {
    /** Camera operation (e.g., "Focus", "Frame", "Capture") */
    operation: string;
    /** Equipment reference (e.g., "50mm lens", "wide aperture") */
    equipment?: string;
    /** Technique description */
    technique: string;
  };

  /** Visual theme configuration */
  theme: {
    /** Primary color hex value */
    primaryColor: string;
    /** Accent color for highlights */
    accentColor: string;
    /** Background treatment */
    background: 'light' | 'dark' | 'image' | 'gradient';
  };

  /** Content priority for spatial layout */
  priority: number; // 1 = highest priority

  /** Estimated reading time in minutes */
  readingTime: number;

  /** Last updated timestamp */
  lastUpdated: Date;
}

// ============================================================================
// PROGRESSIVE DISCLOSURE CONFIGURATION
// ============================================================================

/**
 * Configuration for progressive content disclosure behavior
 * Defines rules for content revelation based on zoom and interaction
 */
export interface SectionContentConfig {
  /** Content level thresholds */
  thresholds: ContentLevelThresholds;

  /** Transition behavior configuration */
  transitions: ContentTransitionConfig;

  /** Performance optimization settings */
  performance: {
    /** Enable lazy loading for heavy content */
    lazyLoading: boolean;
    /** Preload adjacent content levels */
    preloadAdjacent: boolean;
    /** Maximum memory usage per section (MB) */
    maxMemoryUsage: number;
    /** Cache strategy */
    cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
  };

  /** Accessibility configuration */
  accessibility: {
    /** Announce content level changes to screen readers */
    announceChanges: boolean;
    /** Preserve focus during transitions */
    preserveFocus: boolean;
    /** Respect reduced motion preferences */
    respectReducedMotion: boolean;
  };

  /** User engagement tracking */
  engagement: {
    /** Track time spent at each content level */
    trackTimeSpent: boolean;
    /** Track scroll depth within content */
    trackScrollDepth: boolean;
    /** Adapt content based on user behavior */
    adaptiveContent: boolean;
  };
}

/**
 * Content transition configuration and animation specifications
 * Supports photography-inspired transition effects
 */
export interface ContentTransitionConfig {
  /** Transition timing configuration */
  timing: {
    /** Duration for content fade in/out (ms) */
    fadeDuration: number;
    /** Duration for layout changes (ms) */
    layoutDuration: number;
    /** Delay between content level changes (ms) */
    levelChangeDelay: number;
  };

  /** Easing functions for smooth transitions */
  easing: {
    /** CSS easing for content fade transitions */
    fadeEasing: string;
    /** CSS easing for layout transitions */
    layoutEasing: string;
    /** CSS easing for zoom-triggered changes */
    zoomEasing: string;
  };

  /** Photography-inspired effects */
  effects: {
    /** Depth of field blur for inactive content */
    depthOfFieldBlur: {
      enabled: boolean;
      blurRadius: number; // pixels
      transitionDuration: number; // ms
    };

    /** Focus rack effect between content levels */
    focusRack: {
      enabled: boolean;
      stagger: number; // ms between element transitions
      direction: 'in-out' | 'out-in' | 'cross-fade';
    };

    /** Exposure-style brightness transitions */
    exposureTransition: {
      enabled: boolean;
      brightnessRange: [number, number]; // [min, max] brightness values
      contrastAdjustment: number;
    };
  };

  /** Performance considerations */
  performance: {
    /** Use hardware acceleration for transitions */
    useGPU: boolean;
    /** Maximum concurrent transitions */
    maxConcurrentTransitions: number;
    /** Fallback behavior for low-performance devices */
    fallbackBehavior: 'instant' | 'simplified' | 'disabled';
  };
}

// ============================================================================
// CONTENT INTERACTION TYPES
// ============================================================================

/**
 * Content interaction tracking and state management
 * Supports analytics and adaptive content behavior
 */
export interface ContentInteractionState {
  /** Currently active content level */
  currentLevel: ContentLevel;

  /** Previous content level for transition tracking */
  previousLevel: ContentLevel | null;

  /** Time spent at current level (ms) */
  timeAtCurrentLevel: number;

  /** User engagement metrics */
  engagement: {
    /** Scroll depth within current content (0-1) */
    scrollDepth: number;
    /** Number of interactions (clicks, hovers) */
    interactionCount: number;
    /** Time since last interaction (ms) */
    timeSinceLastInteraction: number;
  };

  /** Transition state */
  transition: {
    /** Whether transition is in progress */
    isTransitioning: boolean;
    /** Transition progress (0-1) */
    progress: number;
    /** Transition start time */
    startTime: number | null;
  };
}

/**
 * Content interaction callbacks for section behavior
 * Integrates with spatial navigation and analytics
 */
export interface ContentInteractionCallbacks {
  /** Called when content level changes */
  onLevelChange?: (newLevel: ContentLevel, previousLevel: ContentLevel | null) => void;

  /** Called when content transition starts */
  onTransitionStart?: (fromLevel: ContentLevel, toLevel: ContentLevel) => void;

  /** Called when content transition completes */
  onTransitionComplete?: (level: ContentLevel, duration: number) => void;

  /** Called on user interaction with content */
  onContentInteraction?: (interaction: ContentInteractionEvent) => void;

  /** Called when content loading starts/completes */
  onContentLoad?: (level: ContentLevel, status: 'loading' | 'loaded' | 'error') => void;
}

/**
 * Content interaction event data
 * Captures user behavior for analytics and adaptation
 */
export interface ContentInteractionEvent {
  /** Type of interaction */
  type: 'scroll' | 'click' | 'hover' | 'focus' | 'gesture';

  /** Target element information */
  target: {
    /** Element type */
    type: 'heading' | 'body' | 'media' | 'action' | 'expandable';
    /** Element identifier */
    id: string;
    /** Content level containing the element */
    contentLevel: ContentLevel;
  };

  /** Interaction timing */
  timing: {
    /** Timestamp of interaction */
    timestamp: number;
    /** Duration of interaction (for hover, focus) */
    duration?: number;
  };

  /** Spatial context */
  spatial: {
    /** Canvas position when interaction occurred */
    canvasPosition: CanvasPosition;
    /** Section being interacted with */
    section: SpatialPhotoWorkflowSection;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Content level mapping utilities
 * Provides helper types for working with content levels
 */
export type ContentLevelKeys = keyof typeof ContentLevel;
export type ContentLevelValues = `${ContentLevel}`;

/**
 * Content configuration partial types
 * Allows partial configuration for progressive enhancement
 */
export type PartialContentConfig = Partial<SectionContentConfig>;
export type PartialTransitionConfig = Partial<ContentTransitionConfig>;

/**
 * Content validation result
 * Used for validating content structure and completeness
 */
export interface ContentValidationResult {
  /** Whether content is valid */
  isValid: boolean;

  /** Validation errors */
  errors: Array<{
    level: ContentLevel;
    field: string;
    message: string;
  }>;

  /** Validation warnings */
  warnings: Array<{
    level: ContentLevel;
    field: string;
    message: string;
  }>;

  /** Content completeness score (0-1) */
  completeness: number;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default content level thresholds
 * Optimized for standard spatial navigation zoom levels
 */
export const DEFAULT_CONTENT_THRESHOLDS: ContentLevelThresholds = {
  preview: { min: 0.25, max: 0.5 },
  summary: { min: 0.5, max: 1.0 },
  detailed: { min: 1.0, max: 2.0 },
  technical: { min: 2.0, max: 4.0 }
} as const;

/**
 * Default transition configuration
 * Photography-inspired transitions optimized for 60fps performance
 */
export const DEFAULT_TRANSITION_CONFIG: ContentTransitionConfig = {
  timing: {
    fadeDuration: 300,
    layoutDuration: 400,
    levelChangeDelay: 100
  },
  easing: {
    fadeEasing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    layoutEasing: 'cubic-bezier(0.2, 0.0, 0.2, 1)',
    zoomEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  effects: {
    depthOfFieldBlur: {
      enabled: true,
      blurRadius: 4,
      transitionDuration: 200
    },
    focusRack: {
      enabled: true,
      stagger: 50,
      direction: 'cross-fade'
    },
    exposureTransition: {
      enabled: false, // Disabled by default for accessibility
      brightnessRange: [0.8, 1.2],
      contrastAdjustment: 0.1
    }
  },
  performance: {
    useGPU: true,
    maxConcurrentTransitions: 3,
    fallbackBehavior: 'simplified'
  }
} as const;

/**
 * Default section content configuration
 * Balanced performance and accessibility settings
 */
export const DEFAULT_SECTION_CONFIG: SectionContentConfig = {
  thresholds: DEFAULT_CONTENT_THRESHOLDS,
  transitions: DEFAULT_TRANSITION_CONFIG,
  performance: {
    lazyLoading: true,
    preloadAdjacent: true,
    maxMemoryUsage: 10, // 10MB per section
    cacheStrategy: 'balanced'
  },
  accessibility: {
    announceChanges: true,
    preserveFocus: true,
    respectReducedMotion: true
  },
  engagement: {
    trackTimeSpent: true,
    trackScrollDepth: true,
    adaptiveContent: false // Disabled by default for privacy
  }
} as const;