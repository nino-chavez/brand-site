/**
 * Exposure and Lighting Effect
 *
 * Dynamic brightness adjustment with vignette for focused content.
 * Inspired by studio lighting setups, gallery lighting, and exposure
 * bracketing in HDR photography.
 *
 * Lighting Levels:
 * - Focused section: +10-15% brightness
 * - Unfocused sections: -20-25% brightness with subtle vignette
 */

import { BaseEffect } from '../BaseEffect';
import type { EffectConfig } from '../types';

interface SectionElement extends HTMLElement {
  dataset: {
    section?: string;
  };
}

export class ExposureEffect extends BaseEffect {
  private focusedSection: string | null = null;
  private transitionDuration: number = 500; // ms
  private observer: MutationObserver | null = null;

  // Brightness adjustments
  private readonly brightnessLevels = {
    focused: 1.15, // +15%
    unfocused: 0.75, // -25%
    hover: 0.9, // -10% (hover preview)
  };

  constructor() {
    const config: EffectConfig = {
      id: 'exposure',
      name: 'Exposure & Lighting',
      description: 'Dynamic brightness with spotlight effect on focused content',
      priority: 'standard',
      enabled: false,
      intensity: 100,
      performanceCost: 3, // ms
      shortcut: 'Alt+2',
      photographicInspiration: 'Studio lighting and gallery presentation',
    };

    super(config);
  }

  protected onEnable(): void {
    this.setupFocusObserver();
    this.detectFocusedSection();
  }

  protected onDisable(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  protected onCleanup(): void {
    this.focusedSection = null;
  }

  /**
   * Set up mutation observer to detect focus changes.
   */
  private setupFocusObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'data-focused' ||
            mutation.attributeName === 'class')
        ) {
          this.detectFocusedSection();
          break;
        }
      }
    });

    const canvas = document.querySelector('[data-canvas-container]');
    if (canvas) {
      this.observer.observe(canvas, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-focused', 'class'],
      });
    }
  }

  /**
   * Detect which section is currently focused.
   */
  private detectFocusedSection(): void {
    const focusedElement = document.querySelector<SectionElement>(
      '[data-focused="true"], [data-section].active, [data-section].focused'
    );

    const newFocusedSection = focusedElement?.dataset?.section || null;

    if (newFocusedSection !== this.focusedSection) {
      this.focusedSection = newFocusedSection;
      this.apply();
    }
  }

  /**
   * Apply exposure effect to all sections.
   */
  public apply(target?: HTMLElement): void {
    if (!this.isEnabled) return;

    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<SectionElement>('[data-section]'));

    sections.forEach((section) => {
      const isFocused = section.dataset.section === this.focusedSection;
      this.applySectionExposure(section, isFocused);
    });
  }

  /**
   * Apply exposure to a specific section.
   */
  private applySectionExposure(section: SectionElement, isFocused: boolean): void {
    const brightness = isFocused
      ? this.brightnessLevels.focused
      : this.brightnessLevels.unfocused;

    // Calculate actual brightness based on intensity
    const intensityMultiplier = this.getIntensityDecimal();
    const actualBrightness = 1 + (brightness - 1) * intensityMultiplier;

    // Build filter
    const filters: string[] = [`brightness(${actualBrightness})`];

    // Add vignette to unfocused sections (via radial gradient overlay)
    if (!isFocused && intensityMultiplier > 0) {
      // Vignette is applied as a pseudo-element via CSS class
      section.classList.add('effect-vignette');
    } else {
      section.classList.remove('effect-vignette');
    }

    // Apply with transition
    section.style.transition = `filter ${this.transitionDuration}ms ease-in-out`;
    section.style.filter = filters.join(' ');

    // Add hover preview for unfocused sections
    if (!isFocused) {
      this.addHoverPreview(section);
    }
  }

  /**
   * Add hover preview that partially restores brightness.
   */
  private addHoverPreview(section: SectionElement): void {
    const handleMouseEnter = () => {
      const intensityMultiplier = this.getIntensityDecimal();
      const hoverBrightness = 1 + (this.brightnessLevels.hover - 1) * intensityMultiplier;
      section.style.filter = `brightness(${hoverBrightness})`;
    };

    const handleMouseLeave = () => {
      const intensityMultiplier = this.getIntensityDecimal();
      const unfocusedBrightness =
        1 + (this.brightnessLevels.unfocused - 1) * intensityMultiplier;
      section.style.filter = `brightness(${unfocusedBrightness})`;
    };

    // Remove existing listeners
    section.removeEventListener('mouseenter', handleMouseEnter);
    section.removeEventListener('mouseleave', handleMouseLeave);

    // Add new listeners
    section.addEventListener('mouseenter', handleMouseEnter);
    section.addEventListener('mouseleave', handleMouseLeave);
  }

  /**
   * Remove exposure effect from all sections.
   */
  public remove(target?: HTMLElement): void {
    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<SectionElement>('[data-section]'));

    sections.forEach((section) => {
      section.style.filter = 'none';
      section.style.transition = '';
      section.classList.remove('effect-vignette');
    });
  }

  /**
   * Set focused section manually.
   */
  public setFocusedSection(sectionId: string): void {
    this.focusedSection = sectionId;
    if (this.isEnabled) {
      this.apply();
    }
  }

  /**
   * Get currently focused section.
   */
  public getFocusedSection(): string | null {
    return this.focusedSection;
  }
}
