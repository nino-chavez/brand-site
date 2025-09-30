# Cinematic Transition Timing and Easing Specifications

## Overview

This guide defines precise timing and easing specifications for creating cinematic, film-quality transitions within the LightboxCanvas spatial navigation system. The specifications are based on cinematography principles and optimized for 60fps performance while maintaining accessibility.

## Core Timing Principles

### 1. Cinematic Frame Rates and Timing

The system operates at different timing scales based on the type of movement and user interaction:

```typescript
const CinematicTiming = {
  // Base frame rate (locked to 60fps for smoothness)
  targetFPS: 60,
  frameInterval: 16.67, // milliseconds per frame

  // Movement categories with distinct timing profiles
  movements: {
    // Quick, responsive movements (user-initiated)
    quick: {
      duration: 200,     // 12 frames at 60fps
      description: 'Immediate response to user input'
    },

    // Standard camera movements (smooth and deliberate)
    standard: {
      duration: 400,     // 24 frames at 60fps
      description: 'Natural camera pan, tilt, or focus pull'
    },

    // Cinematic movements (dramatic and purposeful)
    cinematic: {
      duration: 800,     // 48 frames at 60fps
      description: 'Establishing shots, reveals, dramatic transitions'
    },

    // Epic movements (large scene changes)
    epic: {
      duration: 1200,    // 72 frames at 60fps
      description: 'Major scene transitions, long dollies'
    }
  },

  // Specialized timing for specific actions
  specialized: {
    focusPull: 600,      // 36 frames - time for eye to adjust
    shutterClick: 150,   // 9 frames - immediate feedback
    apertureBreathe: 300, // 18 frames - depth of field changes
    zoomCrawl: 2000      // 120 frames - slow zoom for tension
  }
} as const;
```

### 2. Cinematographic Easing Functions

Based on real camera movement characteristics and film editing principles:

```typescript
class CinematicEasing {
  // Camera operator easing - mimics human camera movement
  static cameraOperator(t: number): number {
    // Smooth start, steady middle, gentle stop (like handheld camera stabilization)
    if (t < 0.1) {
      return 2 * t * t; // Accelerate smoothly
    } else if (t > 0.9) {
      const remaining = 1 - t;
      return 1 - 2 * remaining * remaining; // Decelerate smoothly
    } else {
      return 0.02 + 0.96 * (t - 0.1) / 0.8; // Linear middle section
    }
  }

  // Mechanical camera easing - precise, controlled movements
  static mechanicalCamera(t: number): number {
    // Exponential ease-in-out with slight overshoot (like motorized camera rigs)
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  }

  // Film reel easing - smooth with slight mechanical feel
  static filmReel(t: number): number {
    // Custom cubic bezier that mimics film transport mechanism
    return this.cubicBezier(0.25, 0.46, 0.45, 0.94)(t);
  }

  // Telephoto compression - smooth zoom with depth compression effect
  static telephotoZoom(t: number): number {
    // Exponential curve that mimics focal length compression
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Wide angle distortion - quick with slight bounce
  static wideAngle(t: number): number {
    // Quick movement with subtle bounce (like wide-angle lens distortion)
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  }

  // Focus rack - precise, controlled focus pulling
  static focusRack(t: number): number {
    // Smooth S-curve for focus transitions
    return 3 * t * t - 2 * t * t * t;
  }

  // Dolly track - smooth linear movement with slight acceleration curves
  static dollyTrack(t: number): number {
    // Gentle acceleration/deceleration curve
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // Utility function for custom cubic bezier curves
  private static cubicBezier(x1: number, y1: number, x2: number, y2: number) {
    return (t: number): number => {
      // Simplified cubic bezier implementation
      const cx = 3 * x1;
      const bx = 3 * (x2 - x1) - cx;
      const ax = 1 - cx - bx;

      const cy = 3 * y1;
      const by = 3 * (y2 - y1) - cy;
      const ay = 1 - cy - by;

      const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
      const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;

      // Find t for given x (simplified)
      let t2 = t;
      for (let i = 0; i < 8; i++) {
        const x2 = sampleCurveX(t2) - t;
        if (Math.abs(x2) < 0.001) break;
        const d2x = (3 * ax * t2 + 2 * bx) * t2 + cx;
        if (Math.abs(d2x) < 0.000001) break;
        t2 -= x2 / d2x;
      }

      return sampleCurveY(t2);
    };
  }
}
```

### 3. Movement-Specific Timing Profiles

```typescript
interface MovementProfile {
  duration: number;
  easing: string | ((t: number) => number);
  delay?: number;
  stagger?: number;
}

const MovementProfiles: Record<string, MovementProfile> = {
  // Camera panning movements
  panQuick: {
    duration: CinematicTiming.movements.quick.duration,
    easing: CinematicEasing.cameraOperator,
    delay: 0
  },

  panSmooth: {
    duration: CinematicTiming.movements.standard.duration,
    easing: CinematicEasing.mechanicalCamera,
    delay: 50 // Brief pause before movement
  },

  panCinematic: {
    duration: CinematicTiming.movements.cinematic.duration,
    easing: CinematicEasing.dollyTrack,
    delay: 100
  },

  // Focus transitions
  focusPull: {
    duration: CinematicTiming.specialized.focusPull,
    easing: CinematicEasing.focusRack,
    delay: 100
  },

  rackFocus: {
    duration: 800,
    easing: CinematicEasing.focusRack,
    delay: 200
  },

  // Zoom movements
  zoomTelephoto: {
    duration: 1000,
    easing: CinematicEasing.telephotoZoom,
    delay: 150
  },

  zoomWideAngle: {
    duration: 600,
    easing: CinematicEasing.wideAngle,
    delay: 0
  },

  // Specialized movements
  dollyIn: {
    duration: 1500,
    easing: CinematicEasing.dollyTrack,
    delay: 200
  },

  dollyOut: {
    duration: 1200,
    easing: CinematicEasing.dollyTrack,
    delay: 100
  },

  // Tilt movements
  tiltUp: {
    duration: 500,
    easing: CinematicEasing.mechanicalCamera,
    delay: 80
  },

  tiltDown: {
    duration: 450,
    easing: CinematicEasing.mechanicalCamera,
    delay: 60
  }
};
```

## Implementation Framework

### 1. Animation Controller

```typescript
class CinematicAnimationController {
  private activeAnimations: Map<string, Animation> = new Map();
  private performanceMode: 'standard' | 'reduced' = 'standard';

  constructor() {
    this.detectPerformancePreferences();
  }

  animate(
    element: HTMLElement,
    movementType: keyof typeof MovementProfiles,
    options: AnimationOptions = {}
  ): Promise<void> {
    const profile = MovementProfiles[movementType];
    const duration = this.adjustDurationForPerformance(profile.duration);

    // Cancel any existing animation on this element
    this.cancelAnimation(element);

    return new Promise((resolve) => {
      // Apply initial delay if specified
      const startTime = performance.now() + (profile.delay || 0);

      const animateFrame = (currentTime: number) => {
        if (currentTime < startTime) {
          requestAnimationFrame(animateFrame);
          return;
        }

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Apply easing function
        const easedProgress = typeof profile.easing === 'function'
          ? profile.easing(progress)
          : this.applyCSSEasing(profile.easing as string, progress);

        // Apply transformation
        this.applyTransformation(element, easedProgress, options);

        if (progress < 1) {
          const animationId = requestAnimationFrame(animateFrame);
          this.activeAnimations.set(element.id || 'unnamed', {
            id: animationId,
            element,
            startTime,
            duration,
            resolve
          } as any);
        } else {
          this.onAnimationComplete(element);
          resolve();
        }
      };

      requestAnimationFrame(animateFrame);
    });
  }

  private adjustDurationForPerformance(baseDuration: number): number {
    if (this.performanceMode === 'reduced') {
      return Math.max(baseDuration * 0.5, 100); // Minimum 100ms
    }
    return baseDuration;
  }

  private detectPerformancePreferences() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      this.performanceMode = 'reduced';
    }

    // Monitor performance and adapt
    this.monitorPerformance();
  }

  private monitorPerformance() {
    let frameCount = 0;
    let lastTime = performance.now();

    const checkPerformance = (currentTime: number) => {
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        if (fps < 50) {
          this.performanceMode = 'reduced';
          console.warn('Switching to reduced motion due to low FPS:', fps);
        } else if (fps > 55 && this.performanceMode === 'reduced') {
          this.performanceMode = 'standard';
          console.log('Switching back to standard motion, FPS improved:', fps);
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(checkPerformance);
    };

    requestAnimationFrame(checkPerformance);
  }

  private applyTransformation(
    element: HTMLElement,
    progress: number,
    options: AnimationOptions
  ) {
    const { from = {}, to = {} } = options;

    // Interpolate values
    const interpolated = this.interpolateValues(from, to, progress);

    // Apply transforms
    const transforms = [];

    if (interpolated.x !== undefined || interpolated.y !== undefined) {
      transforms.push(`translate3d(${interpolated.x || 0}px, ${interpolated.y || 0}px, 0)`);
    }

    if (interpolated.scale !== undefined) {
      transforms.push(`scale(${interpolated.scale})`);
    }

    if (interpolated.rotate !== undefined) {
      transforms.push(`rotate(${interpolated.rotate}deg)`);
    }

    element.style.transform = transforms.join(' ');

    // Apply other properties
    if (interpolated.opacity !== undefined) {
      element.style.opacity = interpolated.opacity.toString();
    }

    if (interpolated.blur !== undefined) {
      element.style.filter = `blur(${interpolated.blur}px)`;
    }
  }

  private interpolateValues(
    from: Record<string, number>,
    to: Record<string, number>,
    progress: number
  ): Record<string, number> {
    const result: Record<string, number> = {};

    // Get all unique keys
    const keys = new Set([...Object.keys(from), ...Object.keys(to)]);

    keys.forEach(key => {
      const fromValue = from[key] || 0;
      const toValue = to[key] || 0;
      result[key] = fromValue + (toValue - fromValue) * progress;
    });

    return result;
  }
}

interface AnimationOptions {
  from?: Record<string, number>;
  to?: Record<string, number>;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}
```

### 2. CSS Custom Properties for Timing

```css
:root {
  /* Base timing values */
  --timing-quick: 200ms;
  --timing-standard: 400ms;
  --timing-cinematic: 800ms;
  --timing-epic: 1200ms;

  /* Specialized timings */
  --timing-focus-pull: 600ms;
  --timing-shutter: 150ms;
  --timing-aperture: 300ms;
  --timing-zoom-crawl: 2000ms;

  /* Easing functions */
  --easing-camera-operator: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --easing-mechanical: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --easing-film-reel: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --easing-focus-rack: cubic-bezier(0.645, 0.045, 0.355, 1);
  --easing-dolly: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Delay timings */
  --delay-brief: 50ms;
  --delay-standard: 100ms;
  --delay-extended: 200ms;
}

/* Reduced motion adaptations */
@media (prefers-reduced-motion: reduce) {
  :root {
    --timing-quick: 100ms;
    --timing-standard: 150ms;
    --timing-cinematic: 200ms;
    --timing-epic: 300ms;

    --easing-camera-operator: ease-out;
    --easing-mechanical: ease-out;
    --easing-film-reel: ease-out;
    --easing-focus-rack: ease-out;
    --easing-dolly: ease-out;
  }
}

/* Performance-based adaptations */
@media (max-width: 768px) {
  :root {
    --timing-quick: 150ms;
    --timing-standard: 300ms;
    --timing-cinematic: 600ms;
    --timing-epic: 800ms;
  }
}
```

### 3. Practical Implementation Examples

```typescript
class CinematicTransitionExamples {
  private controller: CinematicAnimationController;

  constructor() {
    this.controller = new CinematicAnimationController();
  }

  // Example: Smooth camera pan to reveal content
  async panToReveal(element: HTMLElement, direction: 'left' | 'right') {
    const distance = direction === 'left' ? -300 : 300;

    await this.controller.animate(element, 'panSmooth', {
      from: { x: 0 },
      to: { x: distance },
      onProgress: (progress) => {
        // Add subtle parallax effect during pan
        this.addParallaxDuringPan(progress);
      }
    });
  }

  // Example: Cinematic focus pull between elements
  async cinematicFocusPull(fromElement: HTMLElement, toElement: HTMLElement) {
    // Start blur on from element
    this.controller.animate(fromElement, 'focusPull', {
      from: { blur: 0, scale: 1 },
      to: { blur: 4, scale: 0.95 }
    });

    // Delay focus on to element
    setTimeout(() => {
      this.controller.animate(toElement, 'focusPull', {
        from: { blur: 4, scale: 0.95 },
        to: { blur: 0, scale: 1 }
      });
    }, 200);
  }

  // Example: Dramatic dolly zoom (Hitchcock effect)
  async dollyZoom(element: HTMLElement, intensity: number = 1) {
    const container = element.parentElement!;

    // Zoom in while dollying out to maintain subject size
    await Promise.all([
      this.controller.animate(element, 'zoomTelephoto', {
        from: { scale: 1 },
        to: { scale: 1.5 * intensity }
      }),
      this.controller.animate(container, 'dollyOut', {
        from: { scale: 1 },
        to: { scale: 0.67 }
      })
    ]);
  }

  // Example: Establishing shot sequence
  async establishingShot(elements: HTMLElement[]) {
    // Start with wide view
    await this.controller.animate(elements[0], 'zoomWideAngle', {
      from: { scale: 2 },
      to: { scale: 1 }
    });

    // Pan across scene
    for (let i = 1; i < elements.length; i++) {
      await this.controller.animate(elements[i], 'panCinematic', {
        from: { x: -100 },
        to: { x: 0 }
      });
    }

    // End with focus on hero element
    await this.cinematicFocusPull(elements[0], elements[elements.length - 1]);
  }

  private addParallaxDuringPan(progress: number) {
    const backgroundElements = document.querySelectorAll('.background-layer');
    const midgroundElements = document.querySelectorAll('.midground-layer');

    backgroundElements.forEach(element => {
      (element as HTMLElement).style.transform =
        `translateX(${progress * -50}px)`; // Slower parallax
    });

    midgroundElements.forEach(element => {
      (element as HTMLElement).style.transform =
        `translateX(${progress * -150}px)`; // Medium parallax
    });
  }
}
```

## Quality Assurance

### 1. Timing Validation

```typescript
class CinematicTimingValidator {
  validateTiming(animationName: string, actualDuration: number): ValidationResult {
    const expected = MovementProfiles[animationName]?.duration;

    if (!expected) {
      return {
        valid: false,
        message: `Unknown animation profile: ${animationName}`
      };
    }

    const tolerance = 50; // 50ms tolerance
    const difference = Math.abs(actualDuration - expected);

    return {
      valid: difference <= tolerance,
      message: difference > tolerance
        ? `Timing off by ${difference}ms (expected: ${expected}ms, actual: ${actualDuration}ms)`
        : 'Timing validation passed',
      expected,
      actual: actualDuration,
      difference
    };
  }

  validateFrameRate(frameTimestamps: number[]): FrameRateValidation {
    const intervals = frameTimestamps.slice(1).map((time, i) =>
      time - frameTimestamps[i]
    );

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const averageFPS = 1000 / averageInterval;

    const targetInterval = 16.67; // 60fps
    const tolerance = 2; // Allow 2ms tolerance

    const consistentFrames = intervals.filter(interval =>
      Math.abs(interval - targetInterval) <= tolerance
    ).length;

    const consistency = (consistentFrames / intervals.length) * 100;

    return {
      averageFPS,
      consistency,
      valid: averageFPS >= 55 && consistency >= 90,
      recommendations: this.getFrameRateRecommendations(averageFPS, consistency)
    };
  }

  private getFrameRateRecommendations(fps: number, consistency: number): string[] {
    const recommendations: string[] = [];

    if (fps < 55) {
      recommendations.push('Consider reducing animation complexity');
      recommendations.push('Enable hardware acceleration');
    }

    if (consistency < 90) {
      recommendations.push('Optimize for consistent frame timing');
      recommendations.push('Reduce concurrent animations');
    }

    return recommendations;
  }
}

interface ValidationResult {
  valid: boolean;
  message: string;
  expected?: number;
  actual?: number;
  difference?: number;
}

interface FrameRateValidation {
  averageFPS: number;
  consistency: number;
  valid: boolean;
  recommendations: string[];
}
```

This cinematic timing and easing specification provides the foundation for creating smooth, professional-quality camera movements that enhance the spatial navigation experience while maintaining optimal performance and accessibility.