/**
 * Visual Effects System
 *
 * Export all effects system components for easy importing.
 */

// Core system
export { effectsManager } from './EffectsManager';
export { performanceMonitor } from './PerformanceMonitor';
export { deviceCapabilities } from './DeviceCapabilities';
export { BaseEffect } from './BaseEffect';

// Types
export type {
  VisualEffect,
  EffectConfig,
  EffectsManagerState,
  EffectsPreferences,
  PerformanceMetrics,
  DeviceCapabilities,
  EffectPriority,
  DeviceCapabilityTier,
  PerformanceTier,
  EffectEventType,
  EffectEvent,
  EffectEventListener,
} from './types';

/**
 * Initialize the effects system.
 *
 * This should be called once during application startup.
 */
export function initializeEffectsSystem(): void {
  // Detect device capabilities
  const capabilities = deviceCapabilities.detect();

  // Set device tier in effects manager
  effectsManager.setDeviceTier(capabilities.tier);

  // Apply recommended preset based on device
  const recommended = deviceCapabilities.getRecommendedSettings();
  effectsManager.applyPreset(recommended.preset);

  // Start performance monitoring
  performanceMonitor.start();

  console.log('Visual effects system initialized');
  console.log(`Device tier: ${capabilities.tier}`);
  console.log(`Recommended preset: ${recommended.preset}`);
  console.log(`Max simultaneous effects: ${recommended.maxSimultaneousEffects}`);
}

/**
 * Cleanup the effects system.
 *
 * This should be called during application shutdown.
 */
export function cleanupEffectsSystem(): void {
  performanceMonitor.stop();
  effectsManager.cleanup();
  console.log('Visual effects system cleaned up');
}
