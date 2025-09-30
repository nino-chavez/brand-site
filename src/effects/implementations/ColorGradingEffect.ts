/**
 * Color Grading Effect
 *
 * Section-specific color temperature and mood adjustments.
 * Inspired by color grading in film production, white balance adjustments,
 * and split-toning in post-processing.
 *
 * Color Profiles:
 * - About: Warm tones (amber/gold) - approachable
 * - Creative: Vibrant saturation - energetic
 * - Professional: Cool tones (blue) - authoritative
 * - Other sections: Neutral
 */

import { BaseEffect } from '../BaseEffect';
import type { EffectConfig } from '../types';

interface SectionElement extends HTMLElement {
  dataset: {
    section?: string;
  };
}

interface ColorProfile {
  hueRotate: number; // degrees
  saturate: number; // multiplier
  sepia: number; // 0-1
  contrast: number; // multiplier
}

export class ColorGradingEffect extends BaseEffect {
  private transitionDuration: number = 600; // ms

  // Color profiles by section
  private readonly colorProfiles: Record<string, ColorProfile> = {
    about: {
      hueRotate: 10, // Warm amber/gold shift
      saturate: 1.05,
      sepia: 0.1,
      contrast: 1.0,
    },
    creative: {
      hueRotate: 0,
      saturate: 1.15, // Increased saturation for energy
      sepia: 0,
      contrast: 1.05,
    },
    professional: {
      hueRotate: -5, // Cool blue shift
      saturate: 0.95,
      sepia: 0,
      contrast: 1.02,
    },
    'thought-leadership': {
      hueRotate: 2,
      saturate: 1.0,
      sepia: 0.05,
      contrast: 1.0,
    },
    'ai-github': {
      hueRotate: -2,
      saturate: 1.0,
      sepia: 0,
      contrast: 1.03,
    },
    contact: {
      hueRotate: 5,
      saturate: 1.02,
      sepia: 0.05,
      contrast: 1.0,
    },
    // Default/fallback
    default: {
      hueRotate: 0,
      saturate: 1.0,
      sepia: 0,
      contrast: 1.0,
    },
  };

  constructor() {
    const config: EffectConfig = {
      id: 'color-grading',
      name: 'Color Grading',
      description: 'Section-specific color moods and temperature',
      priority: 'luxury',
      enabled: false,
      intensity: 100,
      performanceCost: 3, // ms
      shortcut: 'Alt+3',
      photographicInspiration: 'Film color grading and white balance',
    };

    super(config);
  }

  /**
   * Apply color grading to all sections.
   */
  public apply(target?: HTMLElement): void {
    if (!this.isEnabled) return;

    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<SectionElement>('[data-section]'));

    sections.forEach((section) => {
      this.applySectionGrading(section);
    });
  }

  /**
   * Apply color grading to a specific section.
   */
  private applySectionGrading(section: SectionElement): void {
    const sectionId = section.dataset.section || 'default';
    const profile = this.colorProfiles[sectionId] || this.colorProfiles.default;

    // Calculate actual values based on intensity
    const intensityMultiplier = this.getIntensityDecimal();

    const hueRotate = profile.hueRotate * intensityMultiplier;
    const saturate = 1 + (profile.saturate - 1) * intensityMultiplier;
    const sepia = profile.sepia * intensityMultiplier;
    const contrast = 1 + (profile.contrast - 1) * intensityMultiplier;

    // Build filter string
    const filters: string[] = [];

    if (Math.abs(hueRotate) > 0.1) {
      filters.push(`hue-rotate(${hueRotate}deg)`);
    }

    if (Math.abs(saturate - 1) > 0.01) {
      filters.push(`saturate(${saturate})`);
    }

    if (sepia > 0.01) {
      filters.push(`sepia(${sepia})`);
    }

    if (Math.abs(contrast - 1) > 0.01) {
      filters.push(`contrast(${contrast})`);
    }

    // Apply with smooth transition
    section.style.transition = `filter ${this.transitionDuration}ms ease-in-out`;
    section.style.filter = filters.length > 0 ? filters.join(' ') : 'none';
  }

  /**
   * Remove color grading from all sections.
   */
  public remove(target?: HTMLElement): void {
    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<SectionElement>('[data-section]'));

    sections.forEach((section) => {
      section.style.filter = 'none';
      section.style.transition = '';
    });
  }

  /**
   * Set custom color profile for a section.
   */
  public setColorProfile(sectionId: string, profile: Partial<ColorProfile>): void {
    const currentProfile = this.colorProfiles[sectionId] || this.colorProfiles.default;

    this.colorProfiles[sectionId] = {
      ...currentProfile,
      ...profile,
    };

    // Reapply if effect is enabled
    if (this.isEnabled) {
      const section = document.querySelector<SectionElement>(
        `[data-section="${sectionId}"]`
      );
      if (section) {
        this.applySectionGrading(section);
      }
    }
  }

  /**
   * Get color profile for a section.
   */
  public getColorProfile(sectionId: string): ColorProfile {
    return this.colorProfiles[sectionId] || this.colorProfiles.default;
  }

  /**
   * Reset all color profiles to defaults.
   */
  public resetColorProfiles(): void {
    // Keep only the default profiles, remove custom ones
    const defaultKeys = Object.keys(this.colorProfiles);
    Object.keys(this.colorProfiles).forEach((key) => {
      if (!defaultKeys.includes(key)) {
        delete this.colorProfiles[key];
      }
    });

    if (this.isEnabled) {
      this.apply();
    }
  }
}
