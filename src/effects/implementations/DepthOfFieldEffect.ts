/**
 * Depth-of-Field Effect
 *
 * Applies graduated blur based on spatial distance from focused section.
 * Inspired by shallow depth-of-field in portrait photography where the subject
 * is sharp and the background is beautifully blurred (bokeh effect).
 *
 * Blur Levels:
 * - Focused section: 0px blur (sharp)
 * - Adjacent sections: 3-5px blur with 0.7 opacity
 * - Distant sections: 8-12px blur with 0.4 opacity
 */

import { BaseEffect } from '../BaseEffect';
import type { EffectConfig } from '../types';

interface SectionElement extends HTMLElement {
  dataset: {
    section?: string;
    distance?: string;
  };
}

export class DepthOfFieldEffect extends BaseEffect {
  private focusedSection: string | null = null;
  private transitionDuration: number = 400; // ms
  private observer: MutationObserver | null = null;

  // Blur levels by distance
  private readonly blurLevels = {
    focused: 0,
    adjacent: 5,
    distant: 12,
  };

  // Opacity levels by distance
  private readonly opacityLevels = {
    focused: 1.0,
    adjacent: 0.7,
    distant: 0.4,
  };

  constructor() {
    const config: EffectConfig = {
      id: 'depth-of-field',
      name: 'Depth of Field',
      description: 'Graduated blur creating focus on active content',
      priority: 'standard',
      enabled: false,
      intensity: 100,
      performanceCost: 4, // ms
      shortcut: 'Alt+1',
      photographicInspiration: 'Shallow depth-of-field in portrait photography',
    };

    super(config);
  }

  protected onEnable(): void {
    // Set up observer to watch for focus changes
    this.setupFocusObserver();

    // Detect initial focused section
    this.detectFocusedSection();
  }

  protected onDisable(): void {
    // Disconnect observer
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
    // Watch for changes to data-focused attribute or active classes
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

    // Observe the canvas container
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
    // Look for section with data-focused="true" or active class
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
   * Calculate distance category for a section.
   */
  private calculateDistance(section: SectionElement): 'focused' | 'adjacent' | 'distant' {
    const sectionId = section.dataset.section;

    if (!this.focusedSection || !sectionId) {
      return 'distant';
    }

    if (sectionId === this.focusedSection) {
      return 'focused';
    }

    // Use data-distance if available, otherwise calculate
    const dataDistance = section.dataset.distance;
    if (dataDistance) {
      const distance = parseInt(dataDistance, 10);
      if (distance === 1) return 'adjacent';
      return 'distant';
    }

    // Simple adjacent detection based on section order
    const focusedElement = document.querySelector<SectionElement>(
      `[data-section="${this.focusedSection}"]`
    );

    if (!focusedElement) {
      return 'distant';
    }

    // Get all sections
    const allSections = Array.from(
      document.querySelectorAll<SectionElement>('[data-section]')
    );

    const focusedIndex = allSections.indexOf(focusedElement);
    const currentIndex = allSections.indexOf(section);

    if (focusedIndex === -1 || currentIndex === -1) {
      return 'distant';
    }

    const distance = Math.abs(currentIndex - focusedIndex);

    if (distance === 1) {
      return 'adjacent';
    }

    return 'distant';
  }

  /**
   * Apply depth-of-field effect to all sections.
   */
  public apply(target?: HTMLElement): void {
    if (!this.isEnabled) return;

    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<SectionElement>('[data-section]'));

    sections.forEach((section) => {
      const distance = this.calculateDistance(section);
      this.applySectionBlur(section, distance);
    });
  }

  /**
   * Apply blur to a specific section based on distance.
   */
  private applySectionBlur(
    section: SectionElement,
    distance: 'focused' | 'adjacent' | 'distant'
  ): void {
    const blur = this.blurLevels[distance] * this.getIntensityDecimal();
    const opacity = this.opacityLevels[distance];

    // Apply filter with transition
    section.style.transition = `filter ${this.transitionDuration}ms ease-in-out, opacity ${this.transitionDuration}ms ease-in-out`;
    section.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
    section.style.opacity = opacity.toString();

    // Add hover preview (reduce blur by 50%)
    this.addHoverPreview(section, blur);
  }

  /**
   * Add hover preview that reduces blur.
   */
  private addHoverPreview(section: SectionElement, baseBlur: number): void {
    const handleMouseEnter = () => {
      if (baseBlur > 0) {
        const previewBlur = baseBlur * 0.5;
        section.style.filter = `blur(${previewBlur}px)`;
      }
    };

    const handleMouseLeave = () => {
      if (baseBlur > 0) {
        section.style.filter = `blur(${baseBlur}px)`;
      }
    };

    // Remove existing listeners
    section.removeEventListener('mouseenter', handleMouseEnter);
    section.removeEventListener('mouseleave', handleMouseLeave);

    // Add new listeners if blur is active
    if (baseBlur > 0) {
      section.addEventListener('mouseenter', handleMouseEnter);
      section.addEventListener('mouseleave', handleMouseLeave);
    }
  }

  /**
   * Remove depth-of-field effect from all sections.
   */
  public remove(target?: HTMLElement): void {
    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<SectionElement>('[data-section]'));

    sections.forEach((section) => {
      section.style.filter = 'none';
      section.style.opacity = '1';
      section.style.transition = '';
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
