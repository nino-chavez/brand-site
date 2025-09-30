import { MousePosition } from '../hooks/useMouseTracking';

export interface ViewfinderConfig {
  // Mouse tracking configuration
  mouseTracking: {
    delay: number;
    throttleMs: number;
    enableEasing: boolean;
    easingCurve: string;
  };

  // Focus system configuration
  focusSystem: {
    radius: number;
    blurRange: {
      min: number;
      max: number;
    };
    transitionDuration: number;
    transitionEasing: string;
  };

  // Performance configuration
  performance: {
    targetFps: number;
    enableHardwareAcceleration: boolean;
    enablePerformanceDegradation: boolean;
    minFpsThreshold: number;
  };

  // Animation configuration
  animations: {
    shutterFlashDuration: number;
    blurRemovalDuration: number;
    fadeOutDuration: number;
    respectReducedMotion: boolean;
  };

  // Accessibility configuration
  accessibility: {
    enableKeyboardControls: boolean;
    toggleKey: string;
    captureKey: string;
    enableAriaLabels: boolean;
    enableLiveRegions: boolean;
  };

  // Audio configuration
  audio: {
    enableShutterSound: boolean;
    volume: number;
    audioFile?: string;
  };
}

export interface ViewfinderState {
  // Core state
  isActive: boolean;
  isCapturing: boolean;
  isPerformanceDegraded: boolean;

  // Position and tracking
  crosshairPosition: MousePosition;
  targetPosition: MousePosition;

  // Focus system state
  focusArea: {
    center: MousePosition;
    radius: number;
  };
  blurIntensity: number;

  // Content detection
  activeContentZone: string | null;
  metadata: ViewfinderMetadata;

  // Animation states
  animationStates: {
    isShutterAnimating: boolean;
    isBlurTransitioning: boolean;
    isFadingOut: boolean;
  };

  // Performance metrics
  performanceMetrics: {
    currentFps: number;
    averageFrameTime: number;
    droppedFrames: number;
  };
}

export interface ViewfinderMetadata {
  // Camera-style metadata
  camera: {
    model: string;
    lens: string;
    focalLength: string;
    aperture: string;
    iso: string;
    shutterSpeed: string;
  };

  // Technical metadata
  technical: {
    framework: string;
    version: string;
    renderTime: string;
    componentCount: string;
    bundleSize: string;
  };

  // Context metadata
  context: {
    contentZone: string;
    timestamp: string;
    position: MousePosition;
    screenResolution: string;
  };
}

export interface ViewfinderActions {
  // Core actions
  activate: () => void;
  deactivate: () => void;
  toggle: () => void;
  capture: () => Promise<string | null>;

  // Position actions
  updateCrosshairPosition: (position: MousePosition) => void;
  resetPosition: () => void;

  // Focus actions
  updateFocusArea: (center: MousePosition, radius?: number) => void;
  setBlurIntensity: (intensity: number) => void;

  // Content actions
  detectContentZone: (position: MousePosition) => string | null;
  updateMetadata: (zone: string) => void;

  // Animation actions
  triggerShutterAnimation: () => Promise<void>;
  resetAnimationStates: () => void;

  // Performance actions
  measurePerformance: () => void;
  degradePerformance: () => void;
  restorePerformance: () => void;
}

export interface ViewfinderContextType {
  config: ViewfinderConfig;
  state: ViewfinderState;
  actions: ViewfinderActions;
}

export interface ViewfinderProviderProps {
  children: React.ReactNode;
  config?: Partial<ViewfinderConfig>;
  initialState?: Partial<ViewfinderState>;
}

// Component-specific interfaces
export interface ViewfinderOverlayProps {
  isActive?: boolean;
  className?: string;
  onCapture?: () => void;
}

export interface CrosshairComponentProps {
  position: MousePosition;
  isActive: boolean;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export interface FocusRingProps {
  center: MousePosition;
  radius: number;
  isVisible: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  strokeDashArray?: string;
}

export interface ExifMetadataProps {
  metadata: ViewfinderMetadata;
  position: MousePosition;
  isVisible: boolean;
  fadeInDelay?: number;
}

export interface ShutterEffectProps {
  isAnimating: boolean;
  onAnimationComplete: () => void;
  flashDuration?: number;
  fadeOutDuration?: number;
}

export interface BlurContainerProps {
  children: React.ReactNode;
  blurIntensity: number;
  focusCenter: MousePosition;
  focusRadius: number;
  transitionDuration?: number;
}

// Utility types
export type ViewfinderPhase = 'inactive' | 'tracking' | 'focusing' | 'capturing' | 'captured';

export type ContentZone =
  | 'hero-title'
  | 'hero-subtitle'
  | 'navigation'
  | 'about-content'
  | 'work-gallery'
  | 'contact-info'
  | 'background';

export type PerformanceLevel = 'high' | 'medium' | 'low' | 'degraded';

export type AnimationState = 'idle' | 'running' | 'completed' | 'paused';

// Default configurations
export const DEFAULT_VIEWFINDER_CONFIG: ViewfinderConfig = {
  mouseTracking: {
    delay: 100,
    throttleMs: 16,
    enableEasing: true,
    easingCurve: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  focusSystem: {
    radius: 200,
    blurRange: {
      min: 0,
      max: 8,
    },
    transitionDuration: 200,
    transitionEasing: 'ease-out',
  },
  performance: {
    targetFps: 60,
    enableHardwareAcceleration: true,
    enablePerformanceDegradation: true,
    minFpsThreshold: 30,
  },
  animations: {
    shutterFlashDuration: 100,
    blurRemovalDuration: 300,
    fadeOutDuration: 500,
    respectReducedMotion: true,
  },
  accessibility: {
    enableKeyboardControls: true,
    toggleKey: 'v',
    captureKey: 'Enter',
    enableAriaLabels: true,
    enableLiveRegions: true,
  },
  audio: {
    enableShutterSound: true,
    volume: 0.5,
  },
};