/**
 * Motion Blur Effect
 *
 * Velocity-triggered directional blur for rapid navigation.
 * Inspired by action photography motion blur, whip pans in cinematography,
 * and speed lines in comics.
 *
 * Motion Characteristics:
 * - Threshold: >2000px/s scroll velocity
 * - Blur: 8-12px in direction of movement
 * - Duration: Blur during motion + 100ms decay
 * - Direction: Horizontal or vertical based on scroll axis
 */

import { BaseEffect } from '../BaseEffect';
import type { EffectConfig } from '../types';

interface MotionState {
  isActive: boolean;
  velocity: number;
  direction: 'horizontal' | 'vertical' | null;
  lastPosition: { x: number; y: number };
  lastTimestamp: number;
}

export class MotionBlurEffect extends BaseEffect {
  private motionState: MotionState = {
    isActive: false,
    velocity: 0,
    direction: null,
    lastPosition: { x: 0, y: 0 },
    lastTimestamp: Date.now(),
  };

  private velocityThreshold: number = 2000; // px/s
  private maxBlur: number = 12; // px
  private minBlur: number = 8; // px
  private decayDuration: number = 100; // ms
  private decayTimeout: number | null = null;
  private rafId: number | null = null;
  private prefersReducedMotion: boolean = false;

  constructor() {
    const config: EffectConfig = {
      id: 'motion-blur',
      name: 'Motion Blur',
      description: 'Directional blur during rapid navigation',
      priority: 'luxury',
      enabled: false,
      intensity: 100,
      performanceCost: 4, // ms
      shortcut: 'Alt+5',
      photographicInspiration: 'Motion blur in action photography and cinematic whip pans',
    };

    super(config);
  }

  protected onEnable(): void {
    this.detectReducedMotionPreference();

    if (this.prefersReducedMotion) {
      console.log('[MotionBlurEffect] Disabled due to prefers-reduced-motion');
      return;
    }

    this.attachScrollListeners();
  }

  protected onDisable(): void {
    this.detachScrollListeners();
    this.cancelDecayAnimation();
  }

  protected onCleanup(): void {
    this.resetMotionState();
  }

  /**
   * Check if user prefers reduced motion.
   */
  private detectReducedMotionPreference(): void {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Attach scroll and wheel event listeners.
   */
  private attachScrollListeners(): void {
    const canvas = document.querySelector('[data-canvas-container]');
    if (canvas) {
      canvas.addEventListener('scroll', this.handleScroll);
      canvas.addEventListener('wheel', this.handleWheel, { passive: true });
    }
  }

  /**
   * Detach scroll and wheel event listeners.
   */
  private detachScrollListeners(): void {
    const canvas = document.querySelector('[data-canvas-container]');
    if (canvas) {
      canvas.removeEventListener('scroll', this.handleScroll);
      canvas.removeEventListener('wheel', this.handleWheel);
    }
  }

  /**
   * Handle scroll events.
   */
  private handleScroll = (): void => {
    if (!this.isEnabled || this.prefersReducedMotion) return;

    const canvas = document.querySelector('[data-canvas-container]');
    if (!canvas) return;

    const currentPosition = {
      x: canvas.scrollLeft,
      y: canvas.scrollTop,
    };

    this.calculateVelocity(currentPosition);
  };

  /**
   * Handle wheel events for momentum scrolling.
   */
  private handleWheel = (event: WheelEvent): void => {
    if (!this.isEnabled || this.prefersReducedMotion) return;

    const deltaX = Math.abs(event.deltaX);
    const deltaY = Math.abs(event.deltaY);

    // Detect primary scroll direction
    const direction: 'horizontal' | 'vertical' = deltaX > deltaY ? 'horizontal' : 'vertical';

    // Estimate velocity from wheel delta (rough approximation)
    const delta = direction === 'horizontal' ? event.deltaX : event.deltaY;
    const estimatedVelocity = Math.abs(delta) * 50; // Scale factor

    if (estimatedVelocity > this.velocityThreshold) {
      this.motionState.velocity = estimatedVelocity;
      this.motionState.direction = direction;
      this.activateBlur();
    }
  };

  /**
   * Calculate scroll velocity.
   */
  private calculateVelocity(currentPosition: { x: number; y: number }): void {
    const now = Date.now();
    const deltaTime = now - this.motionState.lastTimestamp;

    if (deltaTime === 0) return;

    const deltaX = currentPosition.x - this.motionState.lastPosition.x;
    const deltaY = currentPosition.y - this.motionState.lastPosition.y;

    const velocityX = Math.abs(deltaX / deltaTime) * 1000; // px/s
    const velocityY = Math.abs(deltaY / deltaTime) * 1000; // px/s

    // Detect primary direction
    const direction: 'horizontal' | 'vertical' = velocityX > velocityY ? 'horizontal' : 'vertical';
    const velocity = Math.max(velocityX, velocityY);

    this.motionState.lastPosition = currentPosition;
    this.motionState.lastTimestamp = now;

    // Activate blur if velocity exceeds threshold
    if (velocity > this.velocityThreshold) {
      this.motionState.velocity = velocity;
      this.motionState.direction = direction;
      this.activateBlur();
    } else if (this.motionState.isActive) {
      // Start decay if motion slows down
      this.startDecay();
    }
  }

  /**
   * Activate motion blur.
   */
  private activateBlur(): void {
    if (!this.motionState.isActive) {
      this.motionState.isActive = true;
    }

    // Clear existing decay timeout
    if (this.decayTimeout !== null) {
      clearTimeout(this.decayTimeout);
      this.decayTimeout = null;
    }

    this.apply();
  }

  /**
   * Start blur decay animation.
   */
  private startDecay(): void {
    if (this.decayTimeout !== null) return;

    this.decayTimeout = window.setTimeout(() => {
      this.motionState.isActive = false;
      this.remove();
      this.resetMotionState();
    }, this.decayDuration);
  }

  /**
   * Cancel decay animation.
   */
  private cancelDecayAnimation(): void {
    if (this.decayTimeout !== null) {
      clearTimeout(this.decayTimeout);
      this.decayTimeout = null;
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Reset motion state.
   */
  private resetMotionState(): void {
    this.motionState = {
      isActive: false,
      velocity: 0,
      direction: null,
      lastPosition: { x: 0, y: 0 },
      lastTimestamp: Date.now(),
    };
  }

  /**
   * Apply motion blur to all sections.
   */
  public apply(target?: HTMLElement): void {
    if (!this.isEnabled || !this.motionState.isActive || this.prefersReducedMotion) return;

    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));

    sections.forEach((section) => {
      this.applySectionBlur(section);
    });
  }

  /**
   * Apply motion blur to a specific section.
   */
  private applySectionBlur(section: HTMLElement): void {
    const { velocity, direction } = this.motionState;

    // Calculate blur amount based on velocity
    const velocityRatio = Math.min(velocity / (this.velocityThreshold * 2), 1); // Cap at 2x threshold
    const blurAmount =
      this.minBlur + (this.maxBlur - this.minBlur) * velocityRatio;

    // Apply intensity
    const intensityMultiplier = this.getIntensityDecimal();
    const actualBlur = blurAmount * intensityMultiplier;

    // Build directional blur filter
    let blurX = 0;
    let blurY = 0;

    if (direction === 'horizontal') {
      blurX = actualBlur;
    } else if (direction === 'vertical') {
      blurY = actualBlur;
    }

    // Apply blur using CSS filter
    // Note: CSS filter blur() is omnidirectional, so we use a hack with multiple shadows
    // For true directional blur, we'd need SVG filters or WebGL
    // This is a simplified approximation using standard CSS
    const filter = actualBlur > 0 ? `blur(${actualBlur}px)` : 'none';

    section.style.filter = filter;
    section.style.transition = 'filter 50ms linear';
  }

  /**
   * Remove motion blur from all sections.
   */
  public remove(target?: HTMLElement): void {
    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));

    sections.forEach((section) => {
      section.style.filter = 'none';
      section.style.transition = '';
    });
  }

  /**
   * Set velocity threshold manually.
   */
  public setVelocityThreshold(threshold: number): void {
    this.velocityThreshold = threshold;
  }

  /**
   * Set blur range manually.
   */
  public setBlurRange(min: number, max: number): void {
    this.minBlur = Math.max(0, min);
    this.maxBlur = Math.max(this.minBlur, max);
  }

  /**
   * Get current motion state (for debugging).
   */
  public getMotionState(): Readonly<MotionState> {
    return { ...this.motionState };
  }
}
