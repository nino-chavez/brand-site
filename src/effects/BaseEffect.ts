/**
 * Base Effect Class
 *
 * Abstract base class for all visual effects.
 * Provides common functionality and enforces the VisualEffect interface.
 */

import type { VisualEffect, EffectConfig } from './types';

export abstract class BaseEffect implements VisualEffect {
  public config: EffectConfig;
  protected isEnabled: boolean = false;
  protected currentIntensity: number;

  constructor(config: EffectConfig) {
    this.config = config;
    this.currentIntensity = config.intensity;
  }

  /**
   * Enable the effect.
   * Subclasses should override to implement specific enabling logic.
   */
  public enable(): void {
    if (this.isEnabled) {
      return;
    }

    this.isEnabled = true;
    this.onEnable();
    this.apply();
  }

  /**
   * Disable the effect.
   * Subclasses should override to implement specific disabling logic.
   */
  public disable(): void {
    if (!this.isEnabled) {
      return;
    }

    this.isEnabled = false;
    this.remove();
    this.onDisable();
  }

  /**
   * Set effect intensity (0-100).
   */
  public setIntensity(intensity: number): void {
    const clampedIntensity = Math.max(0, Math.min(100, intensity));
    this.currentIntensity = clampedIntensity;
    this.config.intensity = clampedIntensity;

    if (this.isEnabled) {
      this.apply();
    }

    this.onIntensityChange(clampedIntensity);
  }

  /**
   * Apply the effect.
   * Subclasses must implement this.
   */
  public abstract apply(target?: HTMLElement): void;

  /**
   * Remove the effect.
   * Subclasses must implement this.
   */
  public abstract remove(target?: HTMLElement): void;

  /**
   * Cleanup resources.
   * Subclasses should override if they have resources to clean up.
   */
  public cleanup(): void {
    this.disable();
    this.onCleanup();
  }

  /**
   * Hook called when effect is enabled.
   * Subclasses can override for custom enable logic.
   */
  protected onEnable(): void {
    // Override in subclass if needed
  }

  /**
   * Hook called when effect is disabled.
   * Subclasses can override for custom disable logic.
   */
  protected onDisable(): void {
    // Override in subclass if needed
  }

  /**
   * Hook called when intensity changes.
   * Subclasses can override for custom intensity logic.
   */
  protected onIntensityChange(intensity: number): void {
    // Override in subclass if needed
  }

  /**
   * Hook called during cleanup.
   * Subclasses can override for custom cleanup logic.
   */
  protected onCleanup(): void {
    // Override in subclass if needed
  }

  /**
   * Get intensity as decimal (0-1).
   */
  protected getIntensityDecimal(): number {
    return this.currentIntensity / 100;
  }

  /**
   * Calculate CSS filter value based on intensity.
   */
  protected calculateFilterValue(baseValue: number, unit: string = 'px'): string {
    const value = baseValue * this.getIntensityDecimal();
    return `${value}${unit}`;
  }

  /**
   * Calculate opacity based on intensity.
   */
  protected calculateOpacity(baseOpacity: number): number {
    return baseOpacity * this.getIntensityDecimal();
  }
}
