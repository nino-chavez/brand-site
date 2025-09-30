/**
 * Visual Effects System Types
 *
 * Type definitions for the modular visual effects system inspired by
 * professional photography and cinematography techniques.
 */

/**
 * Effect priority determines which effects are disabled first during
 * performance degradation scenarios.
 */
export type EffectPriority = 'critical' | 'standard' | 'luxury';

/**
 * Device capability tiers determine default effect settings.
 */
export type DeviceCapabilityTier = 'high' | 'medium' | 'low';

/**
 * Performance threshold levels trigger automatic adjustments.
 */
export type PerformanceTier = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Effect configuration interface for each visual effect.
 */
export interface EffectConfig {
  /** Unique identifier for the effect */
  id: string;

  /** Human-readable name */
  name: string;

  /** Brief description of the effect */
  description: string;

  /** Priority level for degradation decisions */
  priority: EffectPriority;

  /** Whether effect is currently enabled */
  enabled: boolean;

  /** Effect intensity (0-100) */
  intensity: number;

  /** Estimated frame time cost in milliseconds */
  performanceCost: number;

  /** Keyboard shortcut for quick toggle (e.g., 'Alt+1') */
  shortcut?: string;

  /** Photographic inspiration/technique this effect is based on */
  photographicInspiration: string;
}

/**
 * Visual effect interface that all effects must implement.
 */
export interface VisualEffect {
  /** Effect configuration */
  config: EffectConfig;

  /** Enable the effect */
  enable(): void;

  /** Disable the effect */
  disable(): void;

  /** Update effect intensity (0-100) */
  setIntensity(intensity: number): void;

  /** Apply effect to target element(s) */
  apply(target?: HTMLElement): void;

  /** Remove effect from target element(s) */
  remove(target?: HTMLElement): void;

  /** Cleanup resources when effect is destroyed */
  cleanup(): void;
}

/**
 * Effects manager state interface.
 */
export interface EffectsManagerState {
  /** All registered effects */
  effects: Map<string, VisualEffect>;

  /** Currently active effects */
  activeEffects: Set<string>;

  /** Current performance tier */
  performanceTier: PerformanceTier;

  /** Device capability tier */
  deviceTier: DeviceCapabilityTier;

  /** Global effects enabled/disabled */
  globalEnabled: boolean;

  /** User preferences */
  preferences: EffectsPreferences;
}

/**
 * User preferences for effects system.
 */
export interface EffectsPreferences {
  /** Preset profile (affects default intensity levels) */
  preset: 'minimal' | 'balanced' | 'full' | 'custom';

  /** Per-effect overrides */
  effectSettings: Record<string, { enabled: boolean; intensity: number }>;

  /** Respect system reduced motion preference */
  respectReducedMotion: boolean;

  /** Auto-disable effects on low performance */
  autoPerformanceAdjust: boolean;
}

/**
 * Performance metrics tracked by the system.
 */
export interface PerformanceMetrics {
  /** Current frames per second */
  fps: number;

  /** Average frame time in milliseconds */
  frameTime: number;

  /** Number of frames dropped in last second */
  droppedFrames: number;

  /** Total memory usage estimate in MB */
  memoryUsage: number;

  /** Timestamp of last measurement */
  timestamp: number;
}

/**
 * Device capabilities detected by the system.
 */
export interface DeviceCapabilities {
  /** Device capability tier */
  tier: DeviceCapabilityTier;

  /** Is mobile device */
  isMobile: boolean;

  /** Available device memory in GB (if available) */
  deviceMemory?: number;

  /** Hardware concurrency (CPU cores) */
  hardwareConcurrency: number;

  /** WebGL support level */
  webglSupport: boolean;

  /** CSS backdrop-filter support */
  backdropFilterSupport: boolean;

  /** CSS filter support */
  filterSupport: boolean;

  /** Prefers reduced motion */
  prefersReducedMotion: boolean;
}

/**
 * Effect lifecycle event types.
 */
export type EffectEventType =
  | 'effect-enabled'
  | 'effect-disabled'
  | 'intensity-changed'
  | 'performance-degradation'
  | 'performance-recovery'
  | 'preset-changed';

/**
 * Effect event data.
 */
export interface EffectEvent {
  type: EffectEventType;
  effectId?: string;
  data?: unknown;
  timestamp: number;
}

/**
 * Effect event listener function.
 */
export type EffectEventListener = (event: EffectEvent) => void;
