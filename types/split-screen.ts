/**
 * Split-Screen Storytelling TypeScript Interface Definitions
 *
 * Provides type-safe interfaces for Phase 5 split-screen storytelling components
 * implementing technical + athletic visual pairing with synchronized animations
 * and accessibility-first depth-of-field effects.
 *
 * @fileoverview TypeScript interfaces for split-screen storytelling system
 * @version 1.0.0
 * @since Phase 5
 */

import type { CSSProperties } from 'react';

// ============================================================================
// CORE SPLIT-SCREEN LAYOUT INTERFACES
// ============================================================================

/**
 * Configuration for split-screen layout system
 * Supports US1: "Display two photos side-by-side in a split-screen layout"
 */
export interface SplitScreenLayoutConfig {
  /** Layout orientation for content arrangement */
  orientation: 'horizontal' | 'vertical';

  /** Split ratio between panels (0.5 = 50/50 split) */
  ratio: number;

  /** CSS Grid gap between panels using athletic design tokens */
  gap: string;

  /** Responsive breakpoint behavior */
  responsive: {
    mobile: 'stack' | 'maintain';
    tablet: 'stack' | 'maintain';
    desktop: 'maintain';
  };

  /** Panel content configuration */
  panels: {
    left: SplitScreenPanelConfig;
    right: SplitScreenPanelConfig;
  };
}

/**
 * Individual panel configuration within split-screen layout
 */
export interface SplitScreenPanelConfig {
  /** Panel content type for technical/athletic pairing */
  contentType: 'technical' | 'athletic' | 'mixed';

  /** Panel-specific styling overrides */
  style?: CSSProperties;

  /** Accessibility label for screen readers */
  ariaLabel: string;

  /** Panel-specific interaction settings */
  interactions: {
    focusable: boolean;
    keyboardNavigable: boolean;
    clickable: boolean;
  };
}

/**
 * Main split-screen layout component props interface
 * Implements grid configuration, timing, and sync options
 */
export interface SplitScreenLayoutProps {
  /** Layout configuration object */
  config: SplitScreenLayoutConfig;

  /** Animation timing configuration */
  animationConfig: SynchronizedAnimationConfig;

  /** Depth-of-field effect settings */
  depthConfig?: DepthOfFieldEffectConfig;

  /** Content for left/top panel */
  leftContent: React.ReactNode;

  /** Content for right/bottom panel */
  rightContent: React.ReactNode;

  /** Currently focused panel */
  focusedPanel?: 'left' | 'right' | null;

  /** Additional CSS classes */
  className?: string;

  /** Split-screen activation callback */
  onActivate?: () => void;

  /** Split-screen deactivation callback */
  onDeactivate?: () => void;

  /** Panel focus change callback */
  onPanelFocus?: (panel: 'left' | 'right') => void;
}

// ============================================================================
// SYNCHRONIZED ANIMATION INTERFACES
// ============================================================================

/**
 * RAF-based animation coordination system configuration
 * Supports US2: "coordinated transitions" with maximum 200ms stagger
 */
export interface SynchronizedAnimationConfig {
  /** Primary animation duration using athletic timing (90ms-220ms) */
  duration: number;

  /** Stagger delay between panel animations (max 200ms per requirements) */
  staggerDelay: number;

  /** CSS easing function for athletic motion feel */
  easing: 'ease-out' | 'ease-in-out' | 'cubic-bezier(0.4, 0, 0.2, 1)';

  /** Animation sequence configuration */
  sequence: AnimationSequenceStep[];

  /** Performance optimization settings */
  performance: {
    useRAF: boolean;
    enableGPUAcceleration: boolean;
    maxConcurrentAnimations: number; // Max 3 per US1 requirements
  };

  /** Accessibility compliance settings */
  accessibility: {
    respectReducedMotion: boolean;
    provideStaticFallback: boolean;
    enablePauseControls: boolean;
  };
}

/**
 * Individual animation step in synchronized sequence
 */
export interface AnimationSequenceStep {
  /** Unique identifier for this animation step */
  id: string;

  /** Target panel for this animation step */
  target: 'left' | 'right' | 'both';

  /** Animation properties to modify */
  properties: {
    transform?: string;
    opacity?: number;
    filter?: string;
  };

  /** Step duration in milliseconds */
  duration: number;

  /** Delay before this step starts */
  delay: number;

  /** Step completion callback */
  onComplete?: () => void;
}

/**
 * Animation state management interface
 */
export interface SynchronizedAnimationState {
  /** Current animation status */
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';

  /** Animation progress (0-1) */
  progress: number;

  /** Current step being executed */
  currentStep: number;

  /** RAF request ID for cleanup */
  rafId: number | null;

  /** Performance metrics */
  metrics: {
    frameRate: number;
    droppedFrames: number;
    actualDuration: number;
  };
}

/**
 * Synchronized animation hook return interface
 */
export interface UseSynchronizedAnimationReturn {
  /** Current animation state */
  state: SynchronizedAnimationState;

  /** Animation control methods */
  controls: {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    reset: () => void;
  };

  /** Performance monitoring methods */
  metrics: {
    getFrameRate: () => number;
    getDroppedFrames: () => number;
    resetMetrics: () => void;
  };
}

// ============================================================================
// DEPTH-OF-FIELD EFFECT INTERFACES
// ============================================================================

/**
 * CSS backdrop-filter depth-of-field effect configuration
 * Supports US3: "visual depth storytelling" with 300ms max transition
 */
export interface DepthOfFieldEffectConfig {
  /** Blur intensity levels for different states */
  blurIntensity: {
    focused: number;    // 0px - no blur when focused
    background: number; // 8px - background blur amount
    transition: number; // 4px - intermediate blur during transitions
  };

  /** Transition timing (max 300ms per requirements) */
  transition: {
    duration: number;
    easing: string;
    delay: number;
  };

  /** Accessibility compliance settings */
  accessibility: {
    respectReducedMotion: boolean;
    maintainContrast: boolean; // Minimum 4.5:1 contrast ratio
    keyboardShortcuts: {
      disableEffects: string; // Default: 'Escape'
    };
  };

  /** Browser fallback configuration */
  fallbacks: {
    enableCSSFallback: boolean;
    enableJSFallback: boolean;
    fallbackBlurMethod: 'opacity' | 'transform' | 'none';
  };

  /** Performance optimization */
  performance: {
    useCompositorLayer: boolean;
    enableWillChange: boolean;
    maxBlurRadius: number;
  };
}

/**
 * Depth-of-field effect component props
 */
export interface DepthOfFieldEffectProps {
  /** Effect configuration */
  config: DepthOfFieldEffectConfig;

  /** Target element to apply effect to */
  target: 'left' | 'right' | 'background' | 'both';

  /** Effect active state */
  isActive: boolean;

  /** Focus state for panel prioritization */
  focusedPanel: 'left' | 'right' | null;

  /** Effect intensity override (0-1) */
  intensity?: number;

  /** Additional CSS classes */
  className?: string;

  /** Effect state change callback */
  onStateChange?: (active: boolean) => void;

  /** Accessibility preference callback */
  onAccessibilityOverride?: (disabled: boolean) => void;
}

/**
 * Depth-of-field effect state management
 */
export interface DepthOfFieldEffectState {
  /** Current effect status */
  status: 'inactive' | 'activating' | 'active' | 'deactivating';

  /** Current blur values for each target */
  currentBlur: {
    left: number;
    right: number;
    background: number;
  };

  /** Transition progress (0-1) */
  transitionProgress: number;

  /** Browser support flags */
  support: {
    backdropFilter: boolean;
    cssFilter: boolean;
    willChange: boolean;
  };

  /** Performance monitoring */
  performance: {
    transitionDuration: number;
    frameRate: number;
    memoryImpact: number;
  };
}

// ============================================================================
// INTEGRATION & UTILITY INTERFACES
// ============================================================================

/**
 * Split-screen integration with existing PhotoSequenceDisplay
 */
export interface SplitScreenPhotoSequenceConfig {
  /** Enable split-screen mode in PhotoSequenceDisplay */
  enableSplitScreen: boolean;

  /** Split-screen layout configuration */
  layoutConfig: SplitScreenLayoutConfig;

  /** Project pairing for technical/athletic content */
  projectPairing: {
    leftProject: string;  // Project ID for left panel
    rightProject: string; // Project ID for right panel
    syncMetadata: boolean; // Sync EXIF metadata display
  };

  /** ViewfinderInterface integration */
  viewfinderIntegration: {
    enableCameraControls: boolean;
    syncCameraSettings: boolean;
    showSplitScreenIndicator: boolean;
  };
}

/**
 * Accessibility compliance interface for WCAG 2.1 AA
 */
export interface SplitScreenAccessibility {
  /** ARIA attributes for screen readers */
  aria: {
    label: string;
    describedBy: string;
    live: 'polite' | 'assertive' | 'off';
    role: string;
  };

  /** Keyboard navigation configuration */
  keyboard: {
    enableNavigation: boolean;
    shortcuts: {
      toggleSplit: string;
      focusLeft: string;
      focusRight: string;
      disableAnimations: string;
    };
    trapFocus: boolean;
  };

  /** Reduced motion compliance */
  reducedMotion: {
    detectPreference: boolean;
    fallbackBehavior: 'static' | 'simplified' | 'disabled';
    maintainFunctionality: boolean;
  };

  /** High contrast support */
  highContrast: {
    detectMode: boolean;
    adjustColors: boolean;
    maintainReadability: boolean;
  };
}

/**
 * Performance monitoring interface for 60fps compliance
 */
export interface SplitScreenPerformanceMetrics {
  /** Frame rate monitoring */
  frameRate: {
    current: number;
    average: number;
    minimum: number;
    target: number; // 60fps
  };

  /** Memory usage tracking */
  memory: {
    heapUsed: number;
    heapTotal: number;
    threshold: number;
  };

  /** Animation performance */
  animation: {
    duration: number;
    droppedFrames: number;
    efficiency: number; // Percentage of target performance
  };

  /** Bundle size impact */
  bundle: {
    additionalSize: number;
    totalSize: number;
    sizeTarget: number; // <75KB
  };
}

/**
 * Error handling interface for split-screen components
 */
export interface SplitScreenError {
  /** Error code for categorization */
  code: 'ANIMATION_FAILED' | 'LAYOUT_ERROR' | 'ACCESSIBILITY_VIOLATION' | 'PERFORMANCE_DEGRADED';

  /** Human-readable error message */
  message: string;

  /** Error severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** Recovery options available */
  recovery: {
    canRetry: boolean;
    fallbackAvailable: boolean;
    userActionRequired: boolean;
  };

  /** Additional context data */
  context?: Record<string, unknown>;
}

// ============================================================================
// EXPORTED TYPE UNIONS AND UTILITIES
// ============================================================================

/** Union type for all split-screen related configurations */
export type SplitScreenConfig =
  | SplitScreenLayoutConfig
  | SynchronizedAnimationConfig
  | DepthOfFieldEffectConfig
  | SplitScreenPhotoSequenceConfig;

/** Union type for all split-screen component props */
export type SplitScreenProps =
  | SplitScreenLayoutProps
  | DepthOfFieldEffectProps;

/** Union type for all split-screen states */
export type SplitScreenState =
  | SynchronizedAnimationState
  | DepthOfFieldEffectState;

/** Type guard for checking split-screen configuration types */
export function isSplitScreenLayoutConfig(config: SplitScreenConfig): config is SplitScreenLayoutConfig {
  return 'orientation' in config && 'ratio' in config && 'panels' in config;
}

/** Type guard for checking animation configuration types */
export function isSynchronizedAnimationConfig(config: SplitScreenConfig): config is SynchronizedAnimationConfig {
  return 'duration' in config && 'staggerDelay' in config && 'sequence' in config;
}

/** Type guard for checking depth-of-field configuration types */
export function isDepthOfFieldEffectConfig(config: SplitScreenConfig): config is DepthOfFieldEffectConfig {
  return 'blurIntensity' in config && 'transition' in config && 'accessibility' in config;
}