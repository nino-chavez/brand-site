/**
 * Visual Effects Manager
 *
 * Central coordination system for all visual effects in the lightbox canvas.
 * Manages effect registration, enabling/disabling, performance monitoring,
 * and automatic degradation.
 */

import type {
  VisualEffect,
  EffectsManagerState,
  EffectsPreferences,
  PerformanceTier,
  DeviceCapabilityTier,
  EffectEvent,
  EffectEventListener,
  EffectEventType,
} from './types';

const STORAGE_KEY = 'lightbox-effects-preferences';

class EffectsManager {
  private state: EffectsManagerState;
  private eventListeners: Map<EffectEventType, Set<EffectEventListener>>;

  constructor() {
    this.state = {
      effects: new Map(),
      activeEffects: new Set(),
      performanceTier: 'excellent',
      deviceTier: 'high',
      globalEnabled: true,
      preferences: this.loadPreferences(),
    };

    this.eventListeners = new Map();
    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners for system events.
   */
  private initializeEventListeners(): void {
    // Listen for visibility changes to pause effects when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllEffects();
      } else {
        this.resumeAllEffects();
      }
    });
  }

  /**
   * Register a visual effect with the manager.
   */
  public registerEffect(effect: VisualEffect): void {
    const { id } = effect.config;

    if (this.state.effects.has(id)) {
      console.warn(`Effect ${id} is already registered`);
      return;
    }

    this.state.effects.set(id, effect);

    // Apply user preferences if they exist
    const userPref = this.state.preferences.effectSettings[id];
    if (userPref) {
      if (userPref.enabled && this.state.globalEnabled) {
        this.enableEffect(id);
      }
      effect.setIntensity(userPref.intensity);
    } else if (effect.config.enabled && this.state.globalEnabled) {
      // Enable by default if configured
      this.enableEffect(id);
    }

    console.log(`Registered effect: ${effect.config.name}`);
  }

  /**
   * Unregister an effect from the manager.
   */
  public unregisterEffect(effectId: string): void {
    const effect = this.state.effects.get(effectId);
    if (!effect) {
      console.warn(`Effect ${effectId} not found`);
      return;
    }

    this.disableEffect(effectId);
    effect.cleanup();
    this.state.effects.delete(effectId);

    console.log(`Unregistered effect: ${effect.config.name}`);
  }

  /**
   * Enable a specific effect.
   */
  public enableEffect(effectId: string): void {
    const effect = this.state.effects.get(effectId);
    if (!effect) {
      console.warn(`Effect ${effectId} not found`);
      return;
    }

    if (this.state.activeEffects.has(effectId)) {
      console.log(`Effect ${effectId} is already enabled`);
      return;
    }

    effect.enable();
    this.state.activeEffects.add(effectId);
    effect.config.enabled = true;

    // Update preferences
    this.updateEffectPreference(effectId, { enabled: true });

    // Emit event
    this.emitEvent({
      type: 'effect-enabled',
      effectId,
      timestamp: Date.now(),
    });

    console.log(`Enabled effect: ${effect.config.name}`);
  }

  /**
   * Disable a specific effect.
   */
  public disableEffect(effectId: string): void {
    const effect = this.state.effects.get(effectId);
    if (!effect) {
      console.warn(`Effect ${effectId} not found`);
      return;
    }

    if (!this.state.activeEffects.has(effectId)) {
      console.log(`Effect ${effectId} is already disabled`);
      return;
    }

    effect.disable();
    this.state.activeEffects.delete(effectId);
    effect.config.enabled = false;

    // Update preferences
    this.updateEffectPreference(effectId, { enabled: false });

    // Emit event
    this.emitEvent({
      type: 'effect-disabled',
      effectId,
      timestamp: Date.now(),
    });

    console.log(`Disabled effect: ${effect.config.name}`);
  }

  /**
   * Toggle an effect on/off.
   */
  public toggleEffect(effectId: string): void {
    if (this.state.activeEffects.has(effectId)) {
      this.disableEffect(effectId);
    } else {
      this.enableEffect(effectId);
    }
  }

  /**
   * Set effect intensity (0-100).
   */
  public setEffectIntensity(effectId: string, intensity: number): void {
    const effect = this.state.effects.get(effectId);
    if (!effect) {
      console.warn(`Effect ${effectId} not found`);
      return;
    }

    const clampedIntensity = Math.max(0, Math.min(100, intensity));
    effect.setIntensity(clampedIntensity);

    // Update preferences
    this.updateEffectPreference(effectId, { intensity: clampedIntensity });

    // Emit event
    this.emitEvent({
      type: 'intensity-changed',
      effectId,
      data: { intensity: clampedIntensity },
      timestamp: Date.now(),
    });
  }

  /**
   * Enable all effects.
   */
  public enableAllEffects(): void {
    this.state.globalEnabled = true;
    this.state.effects.forEach((effect) => {
      if (effect.config.enabled) {
        this.enableEffect(effect.config.id);
      }
    });
  }

  /**
   * Disable all effects.
   */
  public disableAllEffects(): void {
    this.state.globalEnabled = false;
    this.state.effects.forEach((effect) => {
      this.disableEffect(effect.config.id);
    });
  }

  /**
   * Apply a preset profile.
   */
  public applyPreset(preset: 'minimal' | 'balanced' | 'full' | 'custom'): void {
    this.state.preferences.preset = preset;

    const intensityMap = {
      minimal: 30,
      balanced: 60,
      full: 100,
      custom: 60, // Default for custom
    };

    const intensity = intensityMap[preset];

    this.state.effects.forEach((effect) => {
      if (preset === 'minimal' && effect.config.priority === 'luxury') {
        this.disableEffect(effect.config.id);
      } else if (preset === 'full') {
        this.enableEffect(effect.config.id);
        this.setEffectIntensity(effect.config.id, intensity);
      } else {
        // balanced or custom
        this.setEffectIntensity(effect.config.id, intensity);
      }
    });

    this.savePreferences();

    // Emit event
    this.emitEvent({
      type: 'preset-changed',
      data: { preset },
      timestamp: Date.now(),
    });

    console.log(`Applied preset: ${preset}`);
  }

  /**
   * Update performance tier based on metrics.
   */
  public updatePerformanceTier(tier: PerformanceTier): void {
    const previousTier = this.state.performanceTier;
    this.state.performanceTier = tier;

    if (previousTier !== tier) {
      console.log(`Performance tier changed: ${previousTier} → ${tier}`);

      // Auto-adjust effects if enabled
      if (this.state.preferences.autoPerformanceAdjust) {
        this.autoAdjustEffects(tier);
      }

      // Emit appropriate event
      if (tier === 'poor' || tier === 'fair') {
        this.emitEvent({
          type: 'performance-degradation',
          data: { tier, previousTier },
          timestamp: Date.now(),
        });
      } else if (previousTier === 'poor' || previousTier === 'fair') {
        this.emitEvent({
          type: 'performance-recovery',
          data: { tier, previousTier },
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Set device capability tier.
   */
  public setDeviceTier(tier: DeviceCapabilityTier): void {
    this.state.deviceTier = tier;
    console.log(`Device tier set to: ${tier}`);
  }

  /**
   * Automatically adjust effects based on performance tier.
   */
  private autoAdjustEffects(tier: PerformanceTier): void {
    const activeEffects = Array.from(this.state.activeEffects);

    switch (tier) {
      case 'poor':
        // Disable all luxury effects, reduce standard to 50%
        activeEffects.forEach((effectId) => {
          const effect = this.state.effects.get(effectId);
          if (!effect) return;

          if (effect.config.priority === 'luxury') {
            this.disableEffect(effectId);
          } else if (effect.config.priority === 'standard') {
            this.setEffectIntensity(effectId, 50);
          }
        });
        console.log('Auto-adjusted: Disabled luxury effects, reduced standard to 50%');
        break;

      case 'fair':
        // Disable luxury effects, keep standard at reduced intensity
        activeEffects.forEach((effectId) => {
          const effect = this.state.effects.get(effectId);
          if (!effect) return;

          if (effect.config.priority === 'luxury') {
            this.disableEffect(effectId);
          } else if (effect.config.priority === 'standard') {
            this.setEffectIntensity(effectId, 70);
          }
        });
        console.log('Auto-adjusted: Disabled luxury effects, reduced standard to 70%');
        break;

      case 'good':
        // Re-enable standard effects at 80%
        this.state.effects.forEach((effect) => {
          if (effect.config.priority === 'standard') {
            this.enableEffect(effect.config.id);
            this.setEffectIntensity(effect.config.id, 80);
          }
        });
        console.log('Auto-adjusted: Re-enabled standard effects at 80%');
        break;

      case 'excellent':
        // Re-enable all effects at full intensity
        this.state.effects.forEach((effect) => {
          const userPref = this.state.preferences.effectSettings[effect.config.id];
          if (userPref?.enabled !== false) {
            this.enableEffect(effect.config.id);
            this.setEffectIntensity(
              effect.config.id,
              userPref?.intensity ?? effect.config.intensity
            );
          }
        });
        console.log('Auto-adjusted: Re-enabled all effects at full intensity');
        break;
    }
  }

  /**
   * Pause all active effects (e.g., when tab is hidden).
   */
  private pauseAllEffects(): void {
    this.state.activeEffects.forEach((effectId) => {
      const effect = this.state.effects.get(effectId);
      effect?.remove();
    });
  }

  /**
   * Resume all active effects (e.g., when tab becomes visible).
   */
  private resumeAllEffects(): void {
    this.state.activeEffects.forEach((effectId) => {
      const effect = this.state.effects.get(effectId);
      effect?.apply();
    });
  }

  /**
   * Get current state snapshot.
   */
  public getState(): Readonly<EffectsManagerState> {
    return { ...this.state };
  }

  /**
   * Get a specific effect.
   */
  public getEffect(effectId: string): VisualEffect | undefined {
    return this.state.effects.get(effectId);
  }

  /**
   * Get all registered effects.
   */
  public getAllEffects(): VisualEffect[] {
    return Array.from(this.state.effects.values());
  }

  /**
   * Get active effects count.
   */
  public getActiveEffectsCount(): number {
    return this.state.activeEffects.size;
  }

  /**
   * Check if effect is active.
   */
  public isEffectActive(effectId: string): boolean {
    return this.state.activeEffects.has(effectId);
  }

  /**
   * Update effect preference in state and storage.
   */
  private updateEffectPreference(
    effectId: string,
    update: Partial<{ enabled: boolean; intensity: number }>
  ): void {
    const current = this.state.preferences.effectSettings[effectId] ?? {
      enabled: false,
      intensity: 100,
    };

    this.state.preferences.effectSettings[effectId] = {
      ...current,
      ...update,
    };

    this.savePreferences();
  }

  /**
   * Load user preferences from localStorage.
   */
  private loadPreferences(): EffectsPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load effects preferences:', error);
    }

    // Default preferences
    return {
      preset: 'balanced',
      effectSettings: {},
      respectReducedMotion: true,
      autoPerformanceAdjust: true,
    };
  }

  /**
   * Save user preferences to localStorage.
   */
  private savePreferences(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.preferences));
    } catch (error) {
      console.warn('Failed to save effects preferences:', error);
    }
  }

  /**
   * Reset preferences to defaults.
   */
  public resetPreferences(): void {
    this.state.preferences = {
      preset: 'balanced',
      effectSettings: {},
      respectReducedMotion: true,
      autoPerformanceAdjust: true,
    };
    this.savePreferences();
    this.applyPreset('balanced');
    console.log('Reset preferences to defaults');
  }

  /**
   * Add event listener.
   */
  public addEventListener(type: EffectEventType, listener: EffectEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }

  /**
   * Remove event listener.
   */
  public removeEventListener(type: EffectEventType, listener: EffectEventListener): void {
    this.eventListeners.get(type)?.delete(listener);
  }

  /**
   * Emit event to all listeners.
   */
  private emitEvent(event: EffectEvent): void {
    this.eventListeners.get(event.type)?.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
  }

  /**
   * Cleanup all effects and resources.
   */
  public cleanup(): void {
    this.state.effects.forEach((effect) => {
      effect.cleanup();
    });
    this.state.effects.clear();
    this.state.activeEffects.clear();
    this.eventListeners.clear();
    console.log('Effects manager cleaned up');
  }
}

// Singleton instance
export const effectsManager = new EffectsManager();
