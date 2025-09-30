/**
 * Chromatic Aberration Effect
 *
 * Subtle RGB color channel separation at content edges.
 * Inspired by lens chromatic aberration in vintage optics, film halation,
 * and analog photography imperfections.
 *
 * Aberration Characteristics:
 * - Edge detection: High-contrast boundaries
 * - Separation: 1-3px RGB channel offset
 * - Pattern: Red shifts right, blue shifts left (horizontal)
 * - Intensity: Stronger at viewport edges, subtle in center
 * - Aesthetic: Analog/film-like imperfection
 */

import { BaseEffect } from '../BaseEffect';
import type { EffectConfig } from '../types';

interface AberrationConfig {
  offsetX: number; // px
  offsetY: number; // px
  edgeIntensityMultiplier: number; // 1.0-2.0
}

export class ChromaticAberrationEffect extends BaseEffect {
  private observer: ResizeObserver | null = null;
  private transitionDuration: number = 300; // ms

  // Aberration configuration
  private readonly aberrationConfig: AberrationConfig = {
    offsetX: 2, // px horizontal separation
    offsetY: 0, // px vertical separation (usually 0 for horizontal aberration)
    edgeIntensityMultiplier: 1.5, // Stronger at edges
  };

  // CSS filter approximation of chromatic aberration
  // Note: True chromatic aberration requires SVG filters or canvas manipulation
  // This implementation uses CSS drop-shadow as a close approximation
  private readonly channelColors = {
    red: { r: 255, g: 0, b: 0, angle: 0 }, // Shift right
    blue: { r: 0, g: 0, b: 255, angle: 180 }, // Shift left
  };

  constructor() {
    const config: EffectConfig = {
      id: 'chromatic-aberration',
      name: 'Chromatic Aberration',
      description: 'RGB color fringing at edges for analog aesthetic',
      priority: 'luxury',
      enabled: false,
      intensity: 100,
      performanceCost: 5, // ms (higher cost due to SVG filter complexity)
      shortcut: 'Alt+6',
      photographicInspiration: 'Vintage lens aberration and film halation',
    };

    super(config);
  }

  protected onEnable(): void {
    this.injectSVGFilters();
    this.setupResizeObserver();
  }

  protected onDisable(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.removeSVGFilters();
  }

  protected onCleanup(): void {
    // No persistent state to clean
  }

  /**
   * Inject SVG filter definitions for chromatic aberration.
   */
  private injectSVGFilters(): void {
    // Check if filters already exist
    if (document.getElementById('chromatic-aberration-filter')) {
      return;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.setAttribute('aria-hidden', 'true');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Create chromatic aberration filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'chromatic-aberration-filter');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');

    // Separate RGB channels
    const feComponentTransferR = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'feComponentTransfer'
    );
    feComponentTransferR.setAttribute('in', 'SourceGraphic');
    feComponentTransferR.setAttribute('result', 'redChannel');
    const feFuncR = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncR');
    feFuncR.setAttribute('type', 'identity');
    const feFuncG = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncG');
    feFuncG.setAttribute('type', 'discrete');
    feFuncG.setAttribute('tableValues', '0 0');
    const feFuncB = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncB');
    feFuncB.setAttribute('type', 'discrete');
    feFuncB.setAttribute('tableValues', '0 0');
    feComponentTransferR.appendChild(feFuncR);
    feComponentTransferR.appendChild(feFuncG);
    feComponentTransferR.appendChild(feFuncB);

    const feComponentTransferB = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'feComponentTransfer'
    );
    feComponentTransferB.setAttribute('in', 'SourceGraphic');
    feComponentTransferB.setAttribute('result', 'blueChannel');
    const feFuncR2 = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncR');
    feFuncR2.setAttribute('type', 'discrete');
    feFuncR2.setAttribute('tableValues', '0 0');
    const feFuncG2 = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncG');
    feFuncG2.setAttribute('type', 'discrete');
    feFuncG2.setAttribute('tableValues', '0 0');
    const feFuncB2 = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncB');
    feFuncB2.setAttribute('type', 'identity');
    feComponentTransferB.appendChild(feFuncR2);
    feComponentTransferB.appendChild(feFuncG2);
    feComponentTransferB.appendChild(feFuncB2);

    // Offset red channel (right)
    const feOffsetR = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    feOffsetR.setAttribute('in', 'redChannel');
    feOffsetR.setAttribute('dx', '2');
    feOffsetR.setAttribute('dy', '0');
    feOffsetR.setAttribute('result', 'redShift');

    // Offset blue channel (left)
    const feOffsetB = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    feOffsetB.setAttribute('in', 'blueChannel');
    feOffsetB.setAttribute('dx', '-2');
    feOffsetB.setAttribute('dy', '0');
    feOffsetB.setAttribute('result', 'blueShift');

    // Composite channels back together
    const feComposite1 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feComposite1.setAttribute('in', 'redShift');
    feComposite1.setAttribute('in2', 'SourceGraphic');
    feComposite1.setAttribute('operator', 'over');
    feComposite1.setAttribute('result', 'temp');

    const feComposite2 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feComposite2.setAttribute('in', 'blueShift');
    feComposite2.setAttribute('in2', 'temp');
    feComposite2.setAttribute('operator', 'over');

    filter.appendChild(feComponentTransferR);
    filter.appendChild(feComponentTransferB);
    filter.appendChild(feOffsetR);
    filter.appendChild(feOffsetB);
    filter.appendChild(feComposite1);
    filter.appendChild(feComposite2);

    defs.appendChild(filter);
    svg.appendChild(defs);
    document.body.appendChild(svg);
  }

  /**
   * Remove SVG filter definitions.
   */
  private removeSVGFilters(): void {
    const svg = document.querySelector('svg[aria-hidden="true"]');
    if (svg) {
      svg.remove();
    }
  }

  /**
   * Set up resize observer to recalculate edge distances.
   */
  private setupResizeObserver(): void {
    this.observer = new ResizeObserver(() => {
      if (this.isEnabled) {
        this.apply();
      }
    });

    const canvas = document.querySelector('[data-canvas-container]');
    if (canvas) {
      this.observer.observe(canvas);
    }
  }

  /**
   * Apply chromatic aberration to all sections.
   */
  public apply(target?: HTMLElement): void {
    if (!this.isEnabled) return;

    const sections = target
      ? [target]
      : Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));

    sections.forEach((section) => {
      this.applySectionAberration(section);
    });
  }

  /**
   * Apply chromatic aberration to a specific section.
   */
  private applySectionAberration(section: HTMLElement): void {
    // Calculate intensity based on distance from viewport center
    const edgeIntensity = this.calculateEdgeIntensity(section);

    // Apply intensity multiplier
    const intensityMultiplier = this.getIntensityDecimal();
    const actualIntensity = edgeIntensity * intensityMultiplier;

    if (actualIntensity < 0.1) {
      // Below threshold, remove effect
      section.style.filter = 'none';
      return;
    }

    // Update SVG filter offset based on intensity
    this.updateFilterOffset(actualIntensity);

    // Apply SVG filter
    section.style.filter = 'url(#chromatic-aberration-filter)';
    section.style.transition = `filter ${this.transitionDuration}ms ease-in-out`;
  }

  /**
   * Calculate intensity based on distance from viewport center.
   * Stronger at edges, subtle in center.
   */
  private calculateEdgeIntensity(section: HTMLElement): number {
    const rect = section.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    const sectionCenterX = rect.left + rect.width / 2;
    const sectionCenterY = rect.top + rect.height / 2;

    // Calculate normalized distance from center (0 = center, 1 = edge)
    const distanceX = Math.abs(sectionCenterX - centerX) / (viewportWidth / 2);
    const distanceY = Math.abs(sectionCenterY - centerY) / (viewportHeight / 2);
    const distance = Math.max(distanceX, distanceY);

    // Apply edge intensity multiplier
    const baseIntensity = 0.3; // 30% intensity at center
    const edgeBoost = distance * (this.aberrationConfig.edgeIntensityMultiplier - 1);

    return Math.min(baseIntensity + edgeBoost, 1.0);
  }

  /**
   * Update SVG filter offset based on intensity.
   */
  private updateFilterOffset(intensity: number): void {
    const filter = document.getElementById('chromatic-aberration-filter');
    if (!filter) return;

    const offsetX = this.aberrationConfig.offsetX * intensity;

    const redOffset = filter.querySelector('feOffset[result="redShift"]');
    const blueOffset = filter.querySelector('feOffset[result="blueShift"]');

    if (redOffset) {
      redOffset.setAttribute('dx', offsetX.toString());
    }

    if (blueOffset) {
      blueOffset.setAttribute('dx', (-offsetX).toString());
    }
  }

  /**
   * Remove chromatic aberration from all sections.
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
   * Set aberration configuration manually.
   */
  public setAberrationConfig(config: Partial<AberrationConfig>): void {
    Object.assign(this.aberrationConfig, config);

    if (this.isEnabled) {
      this.apply();
    }
  }

  /**
   * Get current aberration configuration.
   */
  public getAberrationConfig(): Readonly<AberrationConfig> {
    return { ...this.aberrationConfig };
  }
}
