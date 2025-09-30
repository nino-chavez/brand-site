# Camera Movement Metaphor Implementation Patterns

## Overview

This guide documents the implementation patterns for camera movement metaphors within the LightboxCanvas spatial navigation system. These metaphors create intuitive, photography-inspired interactions that feel natural to users familiar with camera operation while maintaining accessibility and performance standards.

## Core Camera Movement Types

### 1. Panning (Horizontal Movement)

Panning mimics the horizontal rotation of a camera on a tripod, providing smooth left-right navigation through content.

#### Implementation Pattern

```typescript
class CameraPanController {
  private container: HTMLElement;
  private viewportWidth: number;
  private panPosition: number = 0;
  private targetPosition: number = 0;
  private isAnimating: boolean = false;

  // Camera panning physics
  private readonly PAN_FRICTION = 0.85;
  private readonly PAN_SPRING = 0.15;
  private readonly PAN_THRESHOLD = 0.1;

  constructor(container: HTMLElement) {
    this.container = container;
    this.viewportWidth = container.offsetWidth;
    this.setupPanControls();
  }

  panTo(direction: 'left' | 'right', intensity: number = 1) {
    const panDistance = this.viewportWidth * 0.8 * intensity;

    if (direction === 'left') {
      this.targetPosition = Math.max(this.targetPosition - panDistance, this.getMinPanPosition());
    } else {
      this.targetPosition = Math.min(this.targetPosition + panDistance, this.getMaxPanPosition());
    }

    this.startPanAnimation();
    this.triggerCameraFeedback('pan', direction, intensity);
  }

  private startPanAnimation() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.animatePan();
  }

  private animatePan = () => {
    // Spring physics for camera-like movement
    const distance = this.targetPosition - this.panPosition;
    const velocity = distance * this.PAN_SPRING;

    this.panPosition += velocity;

    // Apply transform with hardware acceleration
    this.container.style.transform = `translate3d(${-this.panPosition}px, 0, 0)`;

    // Continue animation if not settled
    if (Math.abs(distance) > this.PAN_THRESHOLD) {
      requestAnimationFrame(this.animatePan);
    } else {
      this.isAnimating = false;
      this.panPosition = this.targetPosition;
      this.onPanComplete();
    }
  };

  private triggerCameraFeedback(type: 'pan' | 'tilt' | 'zoom', direction: string, intensity: number) {
    // Visual feedback
    this.container.classList.add(`camera-${type}-${direction}`);
    setTimeout(() => {
      this.container.classList.remove(`camera-${type}-${direction}`);
    }, 200);

    // Haptic feedback for mobile
    if ('vibrate' in navigator && navigator.vibrate) {
      const vibrationIntensity = Math.round(50 * intensity);
      navigator.vibrate(vibrationIntensity);
    }

    // Audio feedback (optional)
    this.playCameraSound(type, intensity);
  }

  private playCameraSound(type: string, intensity: number) {
    // Subtle camera mechanism sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different movements
    const frequencies = {
      pan: 200,
      tilt: 300,
      zoom: 400
    };

    oscillator.frequency.setValueAtTime(frequencies[type as keyof typeof frequencies], audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.05 * intensity, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
}
```

### 2. Tilting (Vertical Movement)

Tilting simulates vertical camera movement for navigating up and down through content layers.

```typescript
class CameraTiltController {
  private container: HTMLElement;
  private tiltAngle: number = 0;
  private targetAngle: number = 0;
  private readonly MAX_TILT = 15; // degrees
  private readonly TILT_SENSITIVITY = 0.5;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupTiltControls();
  }

  tiltTo(direction: 'up' | 'down', intensity: number = 1) {
    const tiltAmount = this.MAX_TILT * intensity * this.TILT_SENSITIVITY;

    if (direction === 'up') {
      this.targetAngle = Math.max(this.targetAngle - tiltAmount, -this.MAX_TILT);
    } else {
      this.targetAngle = Math.min(this.targetAngle + tiltAmount, this.MAX_TILT);
    }

    this.animateTilt();
  }

  private animateTilt() {
    const tiltRaf = () => {
      const distance = this.targetAngle - this.tiltAngle;
      this.tiltAngle += distance * 0.1;

      // Apply perspective transform for 3D tilt effect
      this.container.style.transform = `
        perspective(1200px)
        rotateX(${this.tiltAngle}deg)
        translateZ(0)
      `;

      if (Math.abs(distance) > 0.1) {
        requestAnimationFrame(tiltRaf);
      }
    };

    requestAnimationFrame(tiltRaf);
  }
}
```

### 3. Zooming (Focus Control)

Zooming metaphors control the scale and focus level of content, similar to camera lens adjustments.

```typescript
class CameraZoomController {
  private container: HTMLElement;
  private zoomLevel: number = 1;
  private targetZoom: number = 1;
  private readonly MIN_ZOOM = 0.5;
  private readonly MAX_ZOOM = 3;
  private readonly ZOOM_STEP = 0.1;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupZoomControls();
  }

  zoomIn(intensity: number = 1) {
    this.targetZoom = Math.min(this.targetZoom + (this.ZOOM_STEP * intensity), this.MAX_ZOOM);
    this.animateZoom();
    this.updateDepthOfField();
  }

  zoomOut(intensity: number = 1) {
    this.targetZoom = Math.max(this.targetZoom - (this.ZOOM_STEP * intensity), this.MIN_ZOOM);
    this.animateZoom();
    this.updateDepthOfField();
  }

  private animateZoom() {
    const zoomRaf = () => {
      const distance = this.targetZoom - this.zoomLevel;
      this.zoomLevel += distance * 0.12;

      // Apply zoom with origin at center
      this.container.style.transform = `
        scale(${this.zoomLevel})
        translateZ(0)
      `;
      this.container.style.transformOrigin = 'center center';

      if (Math.abs(distance) > 0.01) {
        requestAnimationFrame(zoomRaf);
      }
    };

    requestAnimationFrame(zoomRaf);
  }

  private updateDepthOfField() {
    // Simulate depth of field blur based on zoom level
    const blurAmount = Math.max(0, (this.zoomLevel - 1) * 2);

    // Apply to background elements
    const backgroundElements = this.container.querySelectorAll('.background-layer');
    backgroundElements.forEach(element => {
      (element as HTMLElement).style.filter = `blur(${blurAmount}px)`;
    });
  }
}
```

### 4. Focus Pulling

Focus pulling simulates the camera technique of shifting focus between different elements.

```typescript
class CameraFocusController {
  private focusedElement: HTMLElement | null = null;
  private focusTransition: Animation | null = null;

  pullFocusTo(element: HTMLElement, options: FocusOptions = {}) {
    const {
      duration = 800,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
      blurRadius = 4
    } = options;

    // Blur out previous focus
    if (this.focusedElement) {
      this.blurElement(this.focusedElement, blurRadius, duration / 2);
    }

    // Focus on new element
    setTimeout(() => {
      this.focusElement(element, duration / 2);
      this.focusedElement = element;
    }, duration / 2);

    // Update depth indicators
    this.updateDepthIndicators(element);
  }

  private focusElement(element: HTMLElement, duration: number) {
    // Remove blur and enhance contrast
    const focusAnimation = element.animate([
      {
        filter: 'blur(2px) contrast(0.8) brightness(0.9)',
        transform: 'scale(0.98)'
      },
      {
        filter: 'blur(0px) contrast(1.1) brightness(1.05)',
        transform: 'scale(1)'
      }
    ], {
      duration: duration,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    });

    // Add focus ring effect
    element.classList.add('camera-focused');
  }

  private blurElement(element: HTMLElement, blurRadius: number, duration: number) {
    element.animate([
      {
        filter: 'blur(0px) contrast(1.1)',
        transform: 'scale(1)'
      },
      {
        filter: `blur(${blurRadius}px) contrast(0.7)`,
        transform: 'scale(0.95)'
      }
    ], {
      duration: duration,
      easing: 'ease-out',
      fill: 'forwards'
    });

    element.classList.remove('camera-focused');
  }

  private updateDepthIndicators(focusedElement: HTMLElement) {
    // Visual depth cues using parallax and scale
    const allElements = document.querySelectorAll('.spatial-item');

    allElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      const isFocused = htmlElement === focusedElement;

      if (isFocused) {
        htmlElement.style.zIndex = '10';
        htmlElement.style.transform = 'translateZ(20px) scale(1.02)';
      } else {
        htmlElement.style.zIndex = '1';
        htmlElement.style.transform = 'translateZ(0px) scale(0.98)';
      }
    });
  }
}

interface FocusOptions {
  duration?: number;
  easing?: string;
  blurRadius?: number;
}
```

## Composite Camera Movements

### 1. Camera Dolly (Track In/Out)

Combines zoom and position changes to simulate moving the entire camera closer or further from the subject.

```typescript
class CameraDollyController {
  private container: HTMLElement;
  private position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private scale: number = 1;

  dollyIn(targetElement: HTMLElement, intensity: number = 1) {
    const elementRect = targetElement.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    // Calculate position to center the target
    const targetX = (containerRect.width / 2) - (elementRect.left + elementRect.width / 2);
    const targetY = (containerRect.height / 2) - (elementRect.top + elementRect.height / 2);
    const targetScale = 1 + (0.5 * intensity);

    this.animateDolly({
      x: targetX,
      y: targetY,
      z: 50 * intensity
    }, targetScale);
  }

  dollyOut(intensity: number = 1) {
    this.animateDolly(
      { x: 0, y: 0, z: 0 },
      1
    );
  }

  private animateDolly(targetPosition: { x: number; y: number; z: number }, targetScale: number) {
    const startPosition = { ...this.position };
    const startScale = this.scale;
    const duration = 1000;
    const startTime = performance.now();

    const animateDollyFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing for camera movement
      const eased = this.easeInOutCubic(progress);

      // Interpolate position
      this.position.x = startPosition.x + (targetPosition.x - startPosition.x) * eased;
      this.position.y = startPosition.y + (targetPosition.y - startPosition.y) * eased;
      this.position.z = startPosition.z + (targetPosition.z - startPosition.z) * eased;

      // Interpolate scale
      this.scale = startScale + (targetScale - startScale) * eased;

      // Apply transform
      this.container.style.transform = `
        translate3d(${this.position.x}px, ${this.position.y}px, ${this.position.z}px)
        scale(${this.scale})
      `;

      if (progress < 1) {
        requestAnimationFrame(animateDollyFrame);
      }
    };

    requestAnimationFrame(animateDollyFrame);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
```

### 2. Camera Orbit

Creates circular movement around a focal point, useful for exploring content from different angles.

```typescript
class CameraOrbitController {
  private container: HTMLElement;
  private orbitRadius: number = 200;
  private orbitAngle: number = 0;
  private centerPoint: { x: number; y: number };

  constructor(container: HTMLElement) {
    this.container = container;
    this.centerPoint = {
      x: container.offsetWidth / 2,
      y: container.offsetHeight / 2
    };
  }

  orbitAround(targetElement: HTMLElement, direction: 'clockwise' | 'counterclockwise') {
    const targetRect = targetElement.getBoundingClientRect();

    // Update center point to target element
    this.centerPoint = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2
    };

    const angleIncrement = direction === 'clockwise' ? Math.PI / 6 : -Math.PI / 6;
    this.orbitAngle += angleIncrement;

    this.animateOrbit();
  }

  private animateOrbit() {
    const targetX = this.centerPoint.x + Math.cos(this.orbitAngle) * this.orbitRadius;
    const targetY = this.centerPoint.y + Math.sin(this.orbitAngle) * this.orbitRadius;

    // Calculate rotation to keep target in view
    const rotationAngle = -this.orbitAngle * (180 / Math.PI);

    this.container.style.transform = `
      translate3d(${-targetX}px, ${-targetY}px, 0)
      rotate(${rotationAngle}deg)
      perspective(1000px)
    `;

    // Add orbital motion blur effect
    this.addMotionBlur(Math.abs(angleIncrement));
  }

  private addMotionBlur(intensity: number) {
    const blurAmount = intensity * 3;
    this.container.style.filter = `motion-blur(${blurAmount}px)`;

    setTimeout(() => {
      this.container.style.filter = '';
    }, 300);
  }
}
```

## Accessibility Adaptations

### Screen Reader Integration

```typescript
class CameraMetaphorAccessibility {
  private announcer: HTMLElement;

  constructor() {
    this.createAnnouncer();
  }

  announceCameraMovement(movement: CameraMovement) {
    const announcements = {
      pan: {
        left: 'Camera panning left to view previous content',
        right: 'Camera panning right to view next content'
      },
      tilt: {
        up: 'Camera tilting up to view content above',
        down: 'Camera tilting down to view content below'
      },
      zoom: {
        in: 'Zooming in for closer view',
        out: 'Zooming out for wider view'
      },
      focus: {
        pull: 'Focus shifting to highlighted content'
      }
    };

    const message = announcements[movement.type]?.[movement.direction] ||
                   `Camera ${movement.type} ${movement.direction}`;

    this.announce(message);
  }

  private announce(message: string) {
    this.announcer.textContent = message;
  }

  private createAnnouncer() {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    document.body.appendChild(this.announcer);
  }
}

interface CameraMovement {
  type: 'pan' | 'tilt' | 'zoom' | 'focus';
  direction: string;
  intensity?: number;
}
```

## Performance Optimization

### Hardware Acceleration Guidelines

```typescript
class CameraPerformanceOptimizer {
  static optimizeForHardwareAcceleration(element: HTMLElement) {
    // Force GPU layer creation
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';

    // Optimize for camera movements
    element.style.willChange = 'transform, filter';

    // Ensure smooth animations
    element.style.imageRendering = 'crisp-edges';
  }

  static enableReducedMotion(container: HTMLElement) {
    container.classList.add('reduced-motion');

    // Disable camera movements for users who prefer reduced motion
    const style = document.createElement('style');
    style.textContent = `
      .reduced-motion .camera-movement {
        transition: none !important;
        animation: none !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}
```

This camera movement metaphor system provides intuitive, photography-inspired navigation patterns while maintaining high performance and accessibility standards. The implementation patterns can be combined and customized to create rich, camera-like interactions that feel natural to users.