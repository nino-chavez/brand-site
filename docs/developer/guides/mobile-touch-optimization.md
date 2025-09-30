# Mobile Touch Optimization Guide

## Overview

This guide provides comprehensive optimization strategies for touch interactions within the LightboxCanvas spatial navigation system. Mobile devices require specialized touch gesture patterns, performance considerations, and responsive design adaptations to deliver smooth 60fps experiences.

## Touch Gesture Patterns

### 1. Core Touch Gestures

#### Spatial Navigation Gestures
```typescript
interface TouchGesture {
  type: 'swipe' | 'pinch' | 'pan' | 'tap' | 'long-press';
  direction?: 'up' | 'down' | 'left' | 'right';
  fingers: number;
  threshold: number;
  velocity?: number;
}

class MobileTouchNavigator {
  private container: HTMLElement;
  private activeTouch: Touch | null = null;
  private startPosition: { x: number; y: number } = { x: 0, y: 0 };
  private currentPosition: { x: number; y: number } = { x: 0, y: 0 };
  private isNavigating: boolean = false;
  private gestureStartTime: number = 0;

  // Touch thresholds optimized for mobile
  private readonly SWIPE_THRESHOLD = 50; // Minimum distance for swipe
  private readonly VELOCITY_THRESHOLD = 0.3; // Minimum velocity for gesture recognition
  private readonly TAP_TIME_LIMIT = 200; // Maximum time for tap gesture
  private readonly LONG_PRESS_DURATION = 500; // Duration for long press

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupTouchListeners();
    this.preventDefaultBehaviors();
  }

  private setupTouchListeners() {
    // Use passive listeners for better performance
    this.container.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    this.container.addEventListener('touchcancel', this.handleTouchCancel, { passive: true });
  }

  private handleTouchStart = (event: TouchEvent) => {
    // Prevent default only for navigation touches
    if (this.shouldPreventDefault(event)) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    this.activeTouch = touch;
    this.startPosition = { x: touch.clientX, y: touch.clientY };
    this.currentPosition = { x: touch.clientX, y: touch.clientY };
    this.gestureStartTime = performance.now();
    this.isNavigating = false;

    // Setup long press detection
    this.setupLongPressDetection();
  };

  private handleTouchMove = (event: TouchEvent) => {
    if (!this.activeTouch) return;

    const touch = Array.from(event.touches).find(t => t.identifier === this.activeTouch!.identifier);
    if (!touch) return;

    this.currentPosition = { x: touch.clientX, y: touch.clientY };

    const deltaX = this.currentPosition.x - this.startPosition.x;
    const deltaY = this.currentPosition.y - this.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Start navigation if threshold is exceeded
    if (distance > this.SWIPE_THRESHOLD && !this.isNavigating) {
      this.isNavigating = true;
      this.startSpatialNavigation(deltaX, deltaY);
      event.preventDefault();
    }

    // Continue navigation if active
    if (this.isNavigating) {
      this.updateSpatialNavigation(deltaX, deltaY);
      event.preventDefault();
    }
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (!this.activeTouch) return;

    const endTime = performance.now();
    const duration = endTime - this.gestureStartTime;
    const deltaX = this.currentPosition.x - this.startPosition.x;
    const deltaY = this.currentPosition.y - this.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;

    // Determine gesture type
    if (duration < this.TAP_TIME_LIMIT && distance < 10) {
      this.handleTapGesture();
    } else if (this.isNavigating) {
      this.completeSpatialNavigation(deltaX, deltaY, velocity);
    }

    this.resetTouchState();
  };

  private startSpatialNavigation(deltaX: number, deltaY: number) {
    const direction = this.getNavigationDirection(deltaX, deltaY);
    this.container.classList.add('touch-navigating');

    // Provide haptic feedback if available
    this.triggerHapticFeedback('light');

    // Announce navigation start for screen readers
    this.announceNavigationStart(direction);
  }

  private getNavigationDirection(deltaX: number, deltaY: number): string {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }
}
```

### 2. Multi-Touch Gestures

#### Pinch-to-Zoom Integration
```typescript
class MobileZoomGestureHandler {
  private initialDistance: number = 0;
  private currentScale: number = 1;
  private minScale: number = 0.5;
  private maxScale: number = 3;

  handlePinchStart(event: TouchEvent) {
    if (event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];

    this.initialDistance = this.calculateDistance(touch1, touch2);
    event.preventDefault();
  }

  handlePinchMove(event: TouchEvent) {
    if (event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = this.calculateDistance(touch1, touch2);

    const scaleChange = currentDistance / this.initialDistance;
    const newScale = Math.min(Math.max(this.currentScale * scaleChange, this.minScale), this.maxScale);

    this.applyZoom(newScale);
    event.preventDefault();
  }

  private calculateDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private applyZoom(scale: number) {
    // Use transform for hardware acceleration
    const element = this.container.querySelector('.zoomable-content') as HTMLElement;
    if (element) {
      element.style.transform = `scale(${scale})`;
      element.style.transformOrigin = 'center center';
    }
  }
}
```

### 3. Touch Performance Optimization

#### Optimized Touch Event Handling
```typescript
class PerformantTouchHandler {
  private touchCache: Map<number, Touch> = new Map();
  private animationFrameId: number | null = null;
  private pendingUpdates: (() => void)[] = [];

  constructor(private container: HTMLElement) {
    this.setupOptimizedListeners();
  }

  private setupOptimizedListeners() {
    // Use passive listeners where possible
    const passiveEvents = ['touchstart', 'touchend', 'touchcancel'];
    const activeEvents = ['touchmove'];

    passiveEvents.forEach(eventType => {
      this.container.addEventListener(eventType, this.handleTouchEvent, { passive: true });
    });

    activeEvents.forEach(eventType => {
      this.container.addEventListener(eventType, this.handleTouchEvent, { passive: false });
    });
  }

  private handleTouchEvent = (event: TouchEvent) => {
    // Cache touch data for performance
    Array.from(event.touches).forEach(touch => {
      this.touchCache.set(touch.identifier, {
        identifier: touch.identifier,
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY,
        screenX: touch.screenX,
        screenY: touch.screenY,
        radiusX: touch.radiusX || 0,
        radiusY: touch.radiusY || 0,
        rotationAngle: touch.rotationAngle || 0,
        force: touch.force || 0,
        target: touch.target
      } as Touch);
    });

    // Batch DOM updates using requestAnimationFrame
    this.scheduleUpdate(() => {
      this.processTouch(event);
    });
  };

  private scheduleUpdate(updateFn: () => void) {
    this.pendingUpdates.push(updateFn);

    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.flushUpdates();
      });
    }
  }

  private flushUpdates() {
    this.pendingUpdates.forEach(update => update());
    this.pendingUpdates = [];
    this.animationFrameId = null;
  }
}
```

## Mobile-Specific Performance Optimizations

### 1. Viewport and Rendering Optimizations

#### Mobile Viewport Configuration
```html
<!-- Optimized viewport meta tag -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">

<!-- Performance hints -->
<meta name="format-detection" content="telephone=no">
<meta name="msapplication-tap-highlight" content="no">
```

#### CSS Optimizations for Mobile
```css
/* Hardware acceleration for touch elements */
.touch-interactive {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Optimize touch target sizes */
.touch-target {
  min-height: 44px; /* iOS minimum */
  min-width: 44px;
  padding: 12px;
  margin: 8px;
}

/* Prevent text selection during gestures */
.spatial-navigation-container {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  /* Prevent tap highlights */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

/* Mobile-optimized animations */
@media (max-width: 768px) {
  .animated-element {
    animation-duration: 200ms;
    animation-timing-function: ease-out;
  }

  /* Reduced motion for mobile */
  @media (prefers-reduced-motion: reduce) {
    .animated-element {
      animation: none;
      transition: none;
    }
  }
}
```

### 2. Memory Management for Mobile

#### Mobile Memory Optimization
```typescript
class MobileMemoryManager {
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private maxCacheSize: number = 20; // Reduced for mobile
  private preloadQueue: string[] = [];

  constructor() {
    this.setupMemoryMonitoring();
  }

  private setupMemoryMonitoring() {
    // Monitor memory pressure on supported devices
    if ('memory' in performance && (performance as any).memory) {
      setInterval(() => {
        this.checkMemoryPressure();
      }, 5000);
    }

    // Clean up when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.aggressiveCleanup();
      }
    });
  }

  private checkMemoryPressure() {
    const memoryInfo = (performance as any).memory;
    const usageRatio = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;

    if (usageRatio > 0.8) {
      console.warn('High memory usage detected, cleaning up');
      this.reduceCacheSize();
    }
  }

  private reduceCacheSize() {
    // Remove oldest cached images
    const entries = Array.from(this.imageCache.entries());
    const toRemove = Math.ceil(entries.length * 0.3);

    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.imageCache.delete(key);
    }
  }

  optimizeForMobile() {
    // Reduce quality for mobile
    const images = document.querySelectorAll('img[data-mobile-src]');
    images.forEach(img => {
      const mobileImg = img as HTMLImageElement;
      const mobileSrc = mobileImg.getAttribute('data-mobile-src');
      if (mobileSrc) {
        mobileImg.src = mobileSrc;
      }
    });
  }
}
```

## Responsive Design Patterns

### 1. Adaptive Layout System

#### Mobile-First Canvas Layout
```typescript
class ResponsiveCanvasLayout {
  private breakpoints = {
    mobile: 375,
    tablet: 768,
    desktop: 1024,
    large: 1440
  };

  private currentBreakpoint: string = 'mobile';

  constructor(private container: HTMLElement) {
    this.setupResponsiveLayout();
    this.setupBreakpointListeners();
  }

  private setupResponsiveLayout() {
    this.currentBreakpoint = this.getCurrentBreakpoint();
    this.applyLayoutForBreakpoint(this.currentBreakpoint);
  }

  private getCurrentBreakpoint(): string {
    const width = window.innerWidth;

    if (width >= this.breakpoints.large) return 'large';
    if (width >= this.breakpoints.desktop) return 'desktop';
    if (width >= this.breakpoints.tablet) return 'tablet';
    return 'mobile';
  }

  private applyLayoutForBreakpoint(breakpoint: string) {
    // Remove existing breakpoint classes
    Object.keys(this.breakpoints).forEach(bp => {
      this.container.classList.remove(`layout-${bp}`);
    });

    // Apply current breakpoint class
    this.container.classList.add(`layout-${breakpoint}`);

    // Configure layout specific settings
    this.configureForBreakpoint(breakpoint);
  }

  private configureForBreakpoint(breakpoint: string) {
    const configs = {
      mobile: {
        itemsPerRow: 1,
        spacing: '16px',
        navigationMode: 'swipe',
        enableParallax: false
      },
      tablet: {
        itemsPerRow: 2,
        spacing: '24px',
        navigationMode: 'hybrid',
        enableParallax: true
      },
      desktop: {
        itemsPerRow: 3,
        spacing: '32px',
        navigationMode: 'spatial',
        enableParallax: true
      },
      large: {
        itemsPerRow: 4,
        spacing: '40px',
        navigationMode: 'spatial',
        enableParallax: true
      }
    };

    const config = configs[breakpoint as keyof typeof configs];
    this.updateLayoutConfig(config);
  }
}
```

### 2. Touch-Friendly UI Components

#### Mobile Navigation Controls
```typescript
class MobileNavigationControls {
  private container: HTMLElement;
  private controls: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.createMobileControls();
  }

  private createMobileControls() {
    this.controls = document.createElement('div');
    this.controls.className = 'mobile-navigation-controls';
    this.controls.innerHTML = `
      <button class="nav-button nav-prev" aria-label="Previous image">
        <span class="icon-chevron-left"></span>
      </button>

      <div class="nav-indicators">
        <div class="progress-indicator" role="progressbar" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill"></div>
        </div>
      </div>

      <button class="nav-button nav-next" aria-label="Next image">
        <span class="icon-chevron-right"></span>
      </button>
    `;

    this.container.appendChild(this.controls);
    this.setupControlListeners();
  }

  private setupControlListeners() {
    const prevButton = this.controls.querySelector('.nav-prev') as HTMLButtonElement;
    const nextButton = this.controls.querySelector('.nav-next') as HTMLButtonElement;

    // Use touch events for immediate feedback
    prevButton.addEventListener('touchstart', this.handlePrevious, { passive: true });
    nextButton.addEventListener('touchstart', this.handleNext, { passive: true });

    // Fallback to click events
    prevButton.addEventListener('click', this.handlePrevious);
    nextButton.addEventListener('click', this.handleNext);
  }

  private handlePrevious = () => {
    this.triggerHapticFeedback();
    // Emit navigation event
    this.container.dispatchEvent(new CustomEvent('navigate', {
      detail: { direction: 'previous' }
    }));
  };

  private handleNext = () => {
    this.triggerHapticFeedback();
    // Emit navigation event
    this.container.dispatchEvent(new CustomEvent('navigate', {
      detail: { direction: 'next' }
    }));
  };

  private triggerHapticFeedback() {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Light haptic feedback
    }
  }
}
```

## Testing and Validation

### 1. Mobile Testing Strategy

#### Device Testing Checklist
```typescript
interface MobileTestConfig {
  device: string;
  viewport: { width: number; height: number };
  pixelRatio: number;
  userAgent: string;
  touchPoints: number;
}

class MobileTestRunner {
  private testConfigs: MobileTestConfig[] = [
    {
      device: 'iPhone 12 Pro',
      viewport: { width: 390, height: 844 },
      pixelRatio: 3,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      touchPoints: 5
    },
    {
      device: 'Samsung Galaxy S21',
      viewport: { width: 384, height: 854 },
      pixelRatio: 2.75,
      userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)',
      touchPoints: 10
    },
    {
      device: 'iPad Pro',
      viewport: { width: 1024, height: 1366 },
      pixelRatio: 2,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
      touchPoints: 10
    }
  ];

  async runMobileTests(): Promise<TestResults[]> {
    const results: TestResults[] = [];

    for (const config of this.testConfigs) {
      const testResult = await this.testDevice(config);
      results.push(testResult);
    }

    return results;
  }

  private async testDevice(config: MobileTestConfig): Promise<TestResults> {
    // Simulate device viewport
    this.setViewport(config.viewport);

    // Test touch gestures
    const gestureTests = await this.runGestureTests(config);

    // Test performance
    const performanceTests = await this.runPerformanceTests(config);

    // Test accessibility
    const accessibilityTests = await this.runAccessibilityTests(config);

    return {
      device: config.device,
      gestureTests,
      performanceTests,
      accessibilityTests,
      passed: gestureTests.passed && performanceTests.passed && accessibilityTests.passed
    };
  }
}

interface TestResults {
  device: string;
  gestureTests: { passed: boolean; issues: string[] };
  performanceTests: { passed: boolean; metrics: PerformanceMetrics };
  accessibilityTests: { passed: boolean; violations: string[] };
  passed: boolean;
}
```

This mobile optimization guide provides comprehensive strategies for implementing touch-friendly spatial navigation while maintaining 60fps performance across mobile devices. The touch gesture patterns, performance optimizations, and responsive design considerations ensure an excellent mobile experience.