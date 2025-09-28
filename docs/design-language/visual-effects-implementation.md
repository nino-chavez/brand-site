# Visual Effects Implementation Guide

## Overview

This guide documents the implementation of photography-inspired visual effects for the LightboxCanvas spatial navigation system. These effects enhance the cinematic quality while maintaining 60fps performance and accessibility compliance.

## Core Visual Effects Library

### 1. Depth of Field Effects

Simulates camera lens depth of field to create focus and emphasis.

```typescript
class DepthOfFieldController {
  private container: HTMLElement;
  private focusedElement: HTMLElement | null = null;
  private blurLayers: Map<HTMLElement, number> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupDepthLayers();
  }

  private setupDepthLayers() {
    // Create depth layers based on z-index and position
    const elements = this.container.querySelectorAll('.spatial-item');

    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const depth = this.calculateDepth(htmlElement);
      this.blurLayers.set(htmlElement, depth);

      // Add CSS custom properties for depth-based styling
      htmlElement.style.setProperty('--depth-layer', depth.toString());
      htmlElement.style.setProperty('--blur-amount', '0px');
    });
  }

  async focusOn(targetElement: HTMLElement, options: FocusOptions = {}) {
    const {
      aperture = 2.8,        // f-stop simulation
      focalLength = 85,      // mm equivalent
      transitionDuration = 600,
      bokehQuality = 'medium'
    } = options;

    // Calculate blur amounts based on distance from focal point
    const targetDepth = this.blurLayers.get(targetElement) || 0;

    this.blurLayers.forEach((depth, element) => {
      if (element === targetElement) {
        this.applyFocus(element, 0, transitionDuration);
      } else {
        const distance = Math.abs(depth - targetDepth);
        const blurAmount = this.calculateDepthBlur(distance, aperture, focalLength);
        this.applyFocus(element, blurAmount, transitionDuration);
      }
    });

    // Add bokeh effect to out-of-focus elements
    if (bokehQuality !== 'none') {
      await this.applyBokehEffect(targetElement, bokehQuality);
    }

    this.focusedElement = targetElement;
  }

  private calculateDepth(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    // Calculate depth based on position and transform
    const centerX = rect.left + rect.width / 2 - containerRect.left;
    const centerY = rect.top + rect.height / 2 - containerRect.top;

    // Normalize to depth value (0 = foreground, 1 = background)
    return Math.sqrt(centerX * centerX + centerY * centerY) /
           Math.sqrt(containerRect.width * containerRect.width + containerRect.height * containerRect.height);
  }

  private calculateDepthBlur(distance: number, aperture: number, focalLength: number): number {
    // Simulate depth of field mathematics
    const circleOfConfusion = 0.03; // mm for full frame
    const subjectDistance = 2000; // mm

    const hyperfocalDistance = (focalLength * focalLength) / (aperture * circleOfConfusion);
    const nearLimit = (subjectDistance * hyperfocalDistance) / (hyperfocalDistance + subjectDistance);
    const farLimit = (subjectDistance * hyperfocalDistance) / (hyperfocalDistance - subjectDistance);

    // Convert to blur pixels (simplified)
    const blurFactor = Math.max(0, distance * 20 / aperture);
    return Math.min(blurFactor, 15); // Cap at 15px for performance
  }

  private applyFocus(element: HTMLElement, blurAmount: number, duration: number) {
    // Use CSS filter for hardware acceleration
    element.style.transition = `filter ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    element.style.filter = `blur(${blurAmount}px) brightness(${1 - blurAmount * 0.02})`;

    // Update CSS custom property for additional styling
    element.style.setProperty('--blur-amount', `${blurAmount}px`);
  }

  private async applyBokehEffect(focusedElement: HTMLElement, quality: BokehQuality) {
    const bokehElements = this.createBokehElements(quality);

    // Position bokeh elements based on out-of-focus light sources
    const lightSources = this.findLightSources(focusedElement);

    lightSources.forEach((source, index) => {
      if (bokehElements[index]) {
        this.positionBokehElement(bokehElements[index], source);
      }
    });
  }

  private createBokehElements(quality: BokehQuality): HTMLElement[] {
    const count = quality === 'high' ? 12 : quality === 'medium' ? 6 : 3;
    const elements: HTMLElement[] = [];

    for (let i = 0; i < count; i++) {
      const bokeh = document.createElement('div');
      bokeh.className = 'bokeh-element';
      bokeh.style.cssText = `
        position: absolute;
        width: ${20 + Math.random() * 40}px;
        height: ${20 + Math.random() * 40}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
        pointer-events: none;
        z-index: -1;
        opacity: 0;
        transition: opacity 300ms ease-out;
      `;

      this.container.appendChild(bokeh);
      elements.push(bokeh);

      // Animate in
      setTimeout(() => {
        bokeh.style.opacity = (0.3 + Math.random() * 0.4).toString();
      }, i * 50);
    }

    // Clean up after effect
    setTimeout(() => {
      elements.forEach(element => element.remove());
    }, 2000);

    return elements;
  }

  private findLightSources(excludeElement: HTMLElement): Array<{x: number, y: number, intensity: number}> {
    // Find bright elements that would create bokeh
    const elements = Array.from(this.container.querySelectorAll('.spatial-item'))
      .filter(el => el !== excludeElement) as HTMLElement[];

    return elements
      .map(element => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const brightness = this.calculateBrightness(style);

        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          intensity: brightness
        };
      })
      .filter(source => source.intensity > 0.5)
      .slice(0, 8); // Limit for performance
  }

  private calculateBrightness(style: CSSStyleDeclaration): number {
    // Simple brightness calculation based on background color
    const bgColor = style.backgroundColor;
    if (!bgColor || bgColor === 'transparent') return 0;

    // Parse RGB values and calculate luminance
    const rgb = bgColor.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0;

    const [r, g, b] = rgb.map(Number);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  private positionBokehElement(bokeh: HTMLElement, source: {x: number, y: number, intensity: number}) {
    // Add some randomness to position
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;

    bokeh.style.left = `${source.x + offsetX}px`;
    bokeh.style.top = `${source.y + offsetY}px`;
    bokeh.style.opacity = (source.intensity * 0.4).toString();
  }
}

interface FocusOptions {
  aperture?: number;
  focalLength?: number;
  transitionDuration?: number;
  bokehQuality?: BokehQuality;
}

type BokehQuality = 'none' | 'low' | 'medium' | 'high';
```

### 2. Lens Flare Effects

Creates realistic lens flare effects for dramatic lighting transitions.

```typescript
class LensFlareController {
  private container: HTMLElement;
  private flareElements: HTMLElement[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  createLensFlare(
    source: { x: number; y: number },
    options: LensFlareOptions = {}
  ): Promise<void> {
    const {
      intensity = 0.8,
      color = '#ffffff',
      duration = 1500,
      type = 'anamorphic'
    } = options;

    return new Promise((resolve) => {
      const flareContainer = this.createFlareContainer(source, type);
      const flareElements = this.createFlareElements(type, intensity, color);

      flareElements.forEach((element, index) => {
        flareContainer.appendChild(element);
        this.animateFlareElement(element, index, duration);
      });

      this.container.appendChild(flareContainer);
      this.flareElements.push(flareContainer);

      // Clean up after animation
      setTimeout(() => {
        flareContainer.remove();
        this.flareElements = this.flareElements.filter(el => el !== flareContainer);
        resolve();
      }, duration);
    });
  }

  private createFlareContainer(source: { x: number; y: number }, type: FlareType): HTMLElement {
    const container = document.createElement('div');
    container.className = `lens-flare-container lens-flare-${type}`;
    container.style.cssText = `
      position: absolute;
      left: ${source.x}px;
      top: ${source.y}px;
      pointer-events: none;
      z-index: 1000;
      transform-origin: center;
    `;

    return container;
  }

  private createFlareElements(type: FlareType, intensity: number, color: string): HTMLElement[] {
    const elements: HTMLElement[] = [];

    switch (type) {
      case 'anamorphic':
        elements.push(
          this.createStreakFlare(intensity, color, 'horizontal'),
          this.createStreakFlare(intensity * 0.6, color, 'vertical'),
          this.createGhostFlare(intensity * 0.8, color, 50),
          this.createGhostFlare(intensity * 0.4, color, 30)
        );
        break;

      case 'spherical':
        elements.push(
          this.createCircularFlare(intensity, color, 80),
          this.createGhostFlare(intensity * 0.6, color, 40),
          this.createGhostFlare(intensity * 0.3, color, 25)
        );
        break;

      case 'vintage':
        elements.push(
          this.createHexagonFlare(intensity, color, 60),
          this.createRainbowFlare(intensity * 0.7),
          this.createDustFlare(intensity * 0.5)
        );
        break;
    }

    return elements;
  }

  private createStreakFlare(intensity: number, color: string, direction: 'horizontal' | 'vertical'): HTMLElement {
    const streak = document.createElement('div');
    const isHorizontal = direction === 'horizontal';

    streak.className = `flare-streak flare-streak-${direction}`;
    streak.style.cssText = `
      position: absolute;
      width: ${isHorizontal ? 200 : 2}px;
      height: ${isHorizontal ? 2 : 200}px;
      background: linear-gradient(
        ${isHorizontal ? '90deg' : '0deg'},
        transparent 0%,
        ${color} 50%,
        transparent 100%
      );
      opacity: ${intensity};
      transform: translate(-50%, -50%);
      filter: blur(1px);
    `;

    return streak;
  }

  private createGhostFlare(intensity: number, color: string, size: number): HTMLElement {
    const ghost = document.createElement('div');
    ghost.className = 'flare-ghost';
    ghost.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(circle, ${color} 0%, transparent 70%);
      opacity: ${intensity};
      transform: translate(-50%, -50%);
      filter: blur(2px);
    `;

    return ghost;
  }

  private createCircularFlare(intensity: number, color: string, size: number): HTMLElement {
    const circle = document.createElement('div');
    circle.className = 'flare-circle';
    circle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        ${color} 0%,
        rgba(255,255,255,0.3) 30%,
        transparent 70%
      );
      opacity: ${intensity};
      transform: translate(-50%, -50%);
    `;

    return circle;
  }

  private createHexagonFlare(intensity: number, color: string, size: number): HTMLElement {
    const hexagon = document.createElement('div');
    hexagon.className = 'flare-hexagon';
    hexagon.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      opacity: ${intensity * 0.6};
      transform: translate(-50%, -50%) rotate(30deg);
      clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
      filter: blur(1px);
    `;

    return hexagon;
  }

  private createRainbowFlare(intensity: number): HTMLElement {
    const rainbow = document.createElement('div');
    rainbow.className = 'flare-rainbow';
    rainbow.style.cssText = `
      position: absolute;
      width: 100px;
      height: 20px;
      background: linear-gradient(
        90deg,
        #ff0000 0%,
        #ff8800 16.66%,
        #ffff00 33.33%,
        #00ff00 50%,
        #0088ff 66.66%,
        #4400ff 83.33%,
        #8800ff 100%
      );
      opacity: ${intensity};
      transform: translate(-50%, -50%);
      filter: blur(2px);
    `;

    return rainbow;
  }

  private createDustFlare(intensity: number): HTMLElement {
    const dust = document.createElement('div');
    dust.className = 'flare-dust';
    dust.style.cssText = `
      position: absolute;
      width: 150px;
      height: 150px;
      background: radial-gradient(
        circle,
        rgba(255,255,255,${intensity}) 0%,
        rgba(255,255,255,${intensity * 0.3}) 50%,
        transparent 100%
      );
      transform: translate(-50%, -50%);
      filter: blur(8px);
    `;

    return dust;
  }

  private animateFlareElement(element: HTMLElement, index: number, duration: number) {
    const delay = index * 100;

    // Fade in
    element.style.opacity = '0';
    element.style.transition = `opacity 200ms ease-out`;

    setTimeout(() => {
      element.style.opacity = element.style.opacity || '1';
    }, delay);

    // Subtle movement and fade out
    setTimeout(() => {
      element.style.transition = `opacity 300ms ease-out, transform 300ms ease-out`;
      element.style.opacity = '0';
      element.style.transform += ' scale(1.2)';
    }, duration - 300);
  }
}

interface LensFlareOptions {
  intensity?: number;
  color?: string;
  duration?: number;
  type?: FlareType;
}

type FlareType = 'anamorphic' | 'spherical' | 'vintage';
```

### 3. Motion Blur Effects

Simulates camera motion blur during rapid movements.

```typescript
class MotionBlurController {
  private container: HTMLElement;
  private isBlurring: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  applyMotionBlur(
    direction: MotionDirection,
    velocity: number,
    duration: number = 300
  ): Promise<void> {
    if (this.isBlurring) return Promise.resolve();

    this.isBlurring = true;

    return new Promise((resolve) => {
      const blurAmount = Math.min(velocity * 0.1, 8); // Cap blur for performance
      const angle = this.getBlurAngle(direction);

      // Apply directional motion blur
      this.container.style.filter = `blur(${blurAmount}px) brightness(1.1)`;
      this.container.style.transform += ` skew(${angle * 0.5}deg, 0deg)`;
      this.container.style.transition = `filter ${duration}ms ease-out, transform ${duration}ms ease-out`;

      // Add motion lines for enhanced effect
      const motionLines = this.createMotionLines(direction, velocity);
      this.container.appendChild(motionLines);

      // Clear blur effect
      setTimeout(() => {
        this.container.style.filter = '';
        this.container.style.transform = this.container.style.transform.replace(/skew\([^)]*\)/, '');
        motionLines.remove();
        this.isBlurring = false;
        resolve();
      }, duration);
    });
  }

  private getBlurAngle(direction: MotionDirection): number {
    const angles = {
      left: -2,
      right: 2,
      up: 0,
      down: 0,
      'diagonal-up-left': -1,
      'diagonal-up-right': 1,
      'diagonal-down-left': -1,
      'diagonal-down-right': 1
    };

    return angles[direction] || 0;
  }

  private createMotionLines(direction: MotionDirection, velocity: number): HTMLElement {
    const lines = document.createElement('div');
    lines.className = 'motion-lines';
    lines.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      opacity: ${Math.min(velocity * 0.02, 0.3)};
    `;

    // Create individual motion streaks
    const lineCount = Math.min(Math.floor(velocity * 0.5), 12);

    for (let i = 0; i < lineCount; i++) {
      const line = this.createMotionLine(direction, i);
      lines.appendChild(line);
    }

    return lines;
  }

  private createMotionLine(direction: MotionDirection, index: number): HTMLElement {
    const line = document.createElement('div');
    const isHorizontal = ['left', 'right'].includes(direction);

    line.style.cssText = `
      position: absolute;
      ${isHorizontal ? 'height: 1px; width: 100px;' : 'width: 1px; height: 100px;'}
      background: linear-gradient(
        ${isHorizontal ? '90deg' : '0deg'},
        transparent 0%,
        rgba(255,255,255,0.6) 50%,
        transparent 100%
      );
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      transform: translate(-50%, -50%);
      animation: motionStreak 200ms ease-out;
    `;

    return line;
  }
}

type MotionDirection = 'left' | 'right' | 'up' | 'down' | 'diagonal-up-left' | 'diagonal-up-right' | 'diagonal-down-left' | 'diagonal-down-right';
```

### 4. Film Grain and Texture Effects

Adds authentic film grain and texture for vintage cinematography feel.

```typescript
class FilmGrainController {
  private container: HTMLElement;
  private grainCanvas: HTMLCanvasElement | null = null;
  private animationFrame: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  enableFilmGrain(options: FilmGrainOptions = {}): void {
    const {
      intensity = 0.15,
      size = 1,
      type = 'fine',
      animated = true
    } = options;

    this.grainCanvas = this.createGrainCanvas(intensity, size, type);
    this.container.appendChild(this.grainCanvas);

    if (animated) {
      this.startGrainAnimation();
    }
  }

  disableFilmGrain(): void {
    if (this.grainCanvas) {
      this.grainCanvas.remove();
      this.grainCanvas = null;
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private createGrainCanvas(intensity: number, size: number, type: GrainType): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
      mix-blend-mode: multiply;
      opacity: ${intensity};
    `;

    // Set canvas size
    const rect = this.container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.generateGrainTexture(ctx, canvas.width, canvas.height, size, type);

    return canvas;
  }

  private generateGrainTexture(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    size: number,
    type: GrainType
  ): void {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let grain: number;

      switch (type) {
        case 'fine':
          grain = (Math.random() - 0.5) * 40;
          break;
        case 'coarse':
          grain = (Math.random() - 0.5) * 80;
          break;
        case 'vintage':
          grain = this.generateVintageGrain();
          break;
        default:
          grain = (Math.random() - 0.5) * 40;
      }

      // Apply grain to RGB channels
      data[i] = Math.max(0, Math.min(255, 128 + grain));     // Red
      data[i + 1] = Math.max(0, Math.min(255, 128 + grain)); // Green
      data[i + 2] = Math.max(0, Math.min(255, 128 + grain)); // Blue
      data[i + 3] = 255; // Alpha
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private generateVintageGrain(): number {
    // More complex grain pattern for vintage effect
    const base = (Math.random() - 0.5) * 60;
    const spots = Math.random() < 0.001 ? (Math.random() - 0.5) * 200 : 0;
    return base + spots;
  }

  private startGrainAnimation(): void {
    const animate = () => {
      if (this.grainCanvas) {
        const ctx = this.grainCanvas.getContext('2d')!;
        this.generateGrainTexture(
          ctx,
          this.grainCanvas.width,
          this.grainCanvas.height,
          1,
          'fine'
        );
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    // Animate at 24fps for film-like feel
    setInterval(() => {
      if (this.animationFrame !== null) {
        animate();
      }
    }, 1000 / 24);
  }
}

interface FilmGrainOptions {
  intensity?: number;
  size?: number;
  type?: GrainType;
  animated?: boolean;
}

type GrainType = 'fine' | 'coarse' | 'vintage';
```

## Performance Optimization

### 1. Adaptive Quality Management

```typescript
class VisualEffectsQualityManager {
  private currentQuality: EffectQuality = 'high';
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.startQualityMonitoring();
  }

  private startQualityMonitoring(): void {
    this.performanceMonitor.onFrameRateChange((fps: number) => {
      if (fps < 45 && this.currentQuality === 'high') {
        this.setQuality('medium');
      } else if (fps < 30 && this.currentQuality === 'medium') {
        this.setQuality('low');
      } else if (fps > 55 && this.currentQuality === 'low') {
        this.setQuality('medium');
      } else if (fps > 58 && this.currentQuality === 'medium') {
        this.setQuality('high');
      }
    });
  }

  setQuality(quality: EffectQuality): void {
    this.currentQuality = quality;
    this.applyQualitySettings(quality);
  }

  private applyQualitySettings(quality: EffectQuality): void {
    const settings = this.getQualitySettings(quality);

    // Update CSS custom properties
    document.documentElement.style.setProperty('--effect-blur-samples', settings.blurSamples.toString());
    document.documentElement.style.setProperty('--effect-grain-intensity', settings.grainIntensity.toString());
    document.documentElement.style.setProperty('--effect-bokeh-count', settings.bokehCount.toString());

    // Disable expensive effects on low quality
    if (quality === 'low') {
      this.disableExpensiveEffects();
    } else {
      this.enableExpensiveEffects();
    }
  }

  private getQualitySettings(quality: EffectQuality): QualitySettings {
    const settings = {
      high: {
        blurSamples: 16,
        grainIntensity: 0.15,
        bokehCount: 12,
        enableLensFlare: true,
        enableMotionBlur: true,
        enableFilmGrain: true
      },
      medium: {
        blurSamples: 8,
        grainIntensity: 0.1,
        bokehCount: 6,
        enableLensFlare: true,
        enableMotionBlur: false,
        enableFilmGrain: true
      },
      low: {
        blurSamples: 4,
        grainIntensity: 0.05,
        bokehCount: 3,
        enableLensFlare: false,
        enableMotionBlur: false,
        enableFilmGrain: false
      }
    };

    return settings[quality];
  }

  private disableExpensiveEffects(): void {
    // Disable GPU-intensive effects
    document.body.classList.add('low-quality-effects');
  }

  private enableExpensiveEffects(): void {
    document.body.classList.remove('low-quality-effects');
  }
}

type EffectQuality = 'low' | 'medium' | 'high';

interface QualitySettings {
  blurSamples: number;
  grainIntensity: number;
  bokehCount: number;
  enableLensFlare: boolean;
  enableMotionBlur: boolean;
  enableFilmGrain: boolean;
}
```

## Accessibility Considerations

### 1. Motion-Sensitive Adaptations

```css
/* Disable visual effects for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .lens-flare-container,
  .motion-lines,
  .bokeh-element {
    display: none !important;
  }

  .spatial-item {
    filter: none !important;
    transition: none !important;
  }

  .film-grain-canvas {
    opacity: 0 !important;
  }
}

/* Reduce effects for users who prefer reduced transparency */
@media (prefers-reduced-transparency: reduce) {
  .bokeh-element,
  .lens-flare-container {
    opacity: 0.1 !important;
  }
}
```

### 2. High Contrast Mode Support

```typescript
class AccessibleEffectsController {
  private highContrastMode: boolean = false;

  constructor() {
    this.detectContrastPreferences();
  }

  private detectContrastPreferences(): void {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    this.highContrastMode = mediaQuery.matches;

    mediaQuery.addEventListener('change', (e) => {
      this.highContrastMode = e.matches;
      this.updateEffectsForContrast();
    });
  }

  private updateEffectsForContrast(): void {
    if (this.highContrastMode) {
      // Disable subtle effects that may interfere with contrast
      document.body.classList.add('high-contrast-effects');

      // Override effect styles
      const style = document.createElement('style');
      style.textContent = `
        .high-contrast-effects .lens-flare-container,
        .high-contrast-effects .bokeh-element,
        .high-contrast-effects .film-grain-canvas {
          display: none !important;
        }

        .high-contrast-effects .spatial-item {
          filter: contrast(1.2) !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.body.classList.remove('high-contrast-effects');
    }
  }
}
```

This visual effects implementation guide provides a comprehensive framework for creating cinematic, photography-inspired effects while maintaining performance and accessibility standards. The effects enhance the immersive quality of the spatial navigation experience without compromising usability.