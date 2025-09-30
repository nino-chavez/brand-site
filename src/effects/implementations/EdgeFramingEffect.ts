/**
 * Edge Highlighting and Framing Effect
 *
 * Drop shadows and subtle borders for focused content.
 * Inspired by mat boards in print presentation, gallery framing,
 * and film frame edges.
 *
 * Framing Elements:
 * - Focused section: Drop shadow with subtle glow border
 * - Unfocused sections: Flat appearance
 * - Hover preview: 50% shadow intensity
 */

import { BaseEffect } from '../BaseEffect';
import type { EffectConfig } from '../types';

interface SectionElement extends HTMLElement {
  dataset: {
    section?: string;
  };
}

export class EdgeFramingEffect extends BaseEffect {
  private focusedSection: string | null = null;
  private transitionDuration: number = 400; // ms
  private observer: MutationObserver | null = null;

  // Shadow configuration
  private readonly shadowConfig = {
    focused: {
      offsetX: 0,
      offsetY: 4,
      blur: 20,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.25)',
      glow: '1px rgba(255, 255, 255, 0.1)',
    },
    hover: {
      offsetX: 0,
      offsetY: 2,
      blur: 10,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.125)',
      glow: '1px rgba(255, 255, 255, 0.05)',
    },
  };

  constructor() {
    const config: EffectConfig = {
      id: 'edge-framing',
      name: 'Edge Framing',
      description: 'Drop shadows and borders creating visual elevation',
      priority: 'standard',
      enabled: false,
      intensity: 100,
      performanceCost: 2, // ms
      shortcut: 'Alt+4',
      photographicInspiration: 'Gallery mat boards and print framing',
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
   * Apply edge framing to all sections.
   */
  public apply(target?: HTMLElement): void {
    if (!this.isEnabled) return;

    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<SectionElement>('[data-section]'));

    sections.forEach((section) => {
      const isFocused = section.dataset.section === this.focusedSection;
      this.applySectionFraming(section, isFocused);
    });
  }

  /**
   * Apply framing to a specific section.
   */
  private applySectionFraming(section: SectionElement, isFocused: boolean): void {
    if (isFocused) {
      this.applyFocusedFraming(section);
    } else {
      this.applyUnfocusedFraming(section);
      this.addHoverPreview(section);
    }
  }

  /**
   * Apply focused framing (drop shadow + glow border).
   */
  private applyFocusedFraming(section: SectionElement): void {
    const { offsetX, offsetY, blur, spread, color, glow } = this.shadowConfig.focused;

    // Apply intensity
    const intensityMultiplier = this.getIntensityDecimal();
    const actualBlur = blur * intensityMultiplier;
    const actualOffsetY = offsetY * intensityMultiplier;

    // Build box-shadow
    const boxShadow = `${offsetX}px ${actualOffsetY}px ${actualBlur}px ${spread}px ${color}`;

    // Apply with transition
    section.style.transition = `box-shadow ${this.transitionDuration}ms ease-in-out, outline ${this.transitionDuration}ms ease-in-out`;
    section.style.boxShadow = boxShadow;

    // Subtle glow border
    if (intensityMultiplier > 0.5) {
      section.style.outline = glow;
      section.style.outlineOffset = '0px';
    } else {
      section.style.outline = 'none';
    }
  }

  /**
   * Apply unfocused framing (no shadow).
   */
  private applyUnfocusedFraming(section: SectionElement): void {
    section.style.transition = `box-shadow ${this.transitionDuration}ms ease-in-out, outline ${this.transitionDuration}ms ease-in-out`;
    section.style.boxShadow = 'none';
    section.style.outline = 'none';
  }

  /**
   * Add hover preview for unfocused sections.
   */
  private addHoverPreview(section: SectionElement): void {
    const { offsetX, offsetY, blur, spread, color, glow } = this.shadowConfig.hover;

    const handleMouseEnter = () => {
      const intensityMultiplier = this.getIntensityDecimal();
      const actualBlur = blur * intensityMultiplier;
      const actualOffsetY = offsetY * intensityMultiplier;

      const boxShadow = `${offsetX}px ${actualOffsetY}px ${actualBlur}px ${spread}px ${color}`;
      section.style.boxShadow = boxShadow;

      if (intensityMultiplier > 0.5) {
        section.style.outline = glow;
        section.style.outlineOffset = '0px';
      }
    };

    const handleMouseLeave = () => {
      section.style.boxShadow = 'none';
      section.style.outline = 'none';
    };

    // Remove existing listeners
    section.removeEventListener('mouseenter', handleMouseEnter);
    section.removeEventListener('mouseleave', handleMouseLeave);

    // Add new listeners
    section.addEventListener('mouseenter', handleMouseEnter);
    section.addEventListener('mouseleave', handleMouseLeave);
  }

  /**
   * Remove edge framing from all sections.
   */
  public remove(target?: HTMLElement): void {
    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<SectionElement>('[data-section]'));

    sections.forEach((section) => {
      section.style.boxShadow = 'none';
      section.style.outline = 'none';
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

  /**
   * Customize shadow configuration.
   */
  public setShadowConfig(
    type: 'focused' | 'hover',
    config: Partial<typeof this.shadowConfig.focused>
  ): void {
    this.shadowConfig[type] = {
      ...this.shadowConfig[type],
      ...config,
    };

    if (this.isEnabled) {
      this.apply();
    }
  }
}
