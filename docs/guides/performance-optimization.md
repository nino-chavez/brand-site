# 60fps Performance Optimization Guide

## Overview

This guide provides comprehensive techniques for maintaining 60fps performance in the LightboxCanvas spatial navigation system. Performance optimization is critical for professional portfolio presentation and user experience quality.

## Core Performance Principles

### 1. Hardware Acceleration First

**Leverage CSS Transforms for GPU Acceleration**

```css
/* ✅ GOOD: Hardware-accelerated transforms */
.canvas-container {
  transform: translate3d(var(--x), var(--y), 0) scale(var(--zoom));
  will-change: transform;
}

/* ❌ BAD: CPU-bound position changes */
.canvas-container {
  left: var(--x);
  top: var(--y);
  width: calc(100% * var(--zoom));
  height: calc(100% * var(--zoom));
}
```

**Force Layer Creation for Smooth Animations**

```css
.spatial-section {
  /* Force GPU layer creation */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### 2. RequestAnimationFrame Optimization

**Efficient Animation Loops**

```typescript
class PerformanceOptimizedAnimator {
  private rafId: number | null = null;
  private targetFPS = 60;
  private frameInterval = 1000 / this.targetFPS;
  private lastFrameTime = 0;

  animate = (currentTime: number) => {
    // Frame rate limiting for consistent performance
    if (currentTime - this.lastFrameTime < this.frameInterval) {
      this.rafId = requestAnimationFrame(this.animate);
      return;
    }

    this.lastFrameTime = currentTime;

    // Batch DOM updates
    this.batchDOMUpdates();

    // Continue animation loop
    this.rafId = requestAnimationFrame(this.animate);
  };

  private batchDOMUpdates(): void {
    // Use DocumentFragment for multiple DOM manipulations
    const fragment = document.createDocumentFragment();

    // Batch all updates together
    this.updateCameraPosition();
    this.updateSectionVisibility();
    this.updatePerformanceMetrics();
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
```

### 3. Memory Management for 60fps

**Object Pooling for Frequent Allocations**

```typescript
class Vector2Pool {
  private pool: Vector2[] = [];
  private index = 0;
  private readonly maxSize = 100;

  get(): Vector2 {
    if (this.index >= this.pool.length) {
      if (this.pool.length < this.maxSize) {
        this.pool.push(new Vector2(0, 0));
      } else {
        // Reuse oldest object
        this.index = 0;
      }
    }

    const vector = this.pool[this.index];
    this.index++;
    return vector.reset();
  }

  release(vector: Vector2): void {
    // Vector automatically returns to pool when index resets
  }
}

// Usage in animation loop
const vectorPool = new Vector2Pool();

function animateCamera(deltaTime: number): void {
  const velocity = vectorPool.get();
  velocity.set(deltaX, deltaY);

  // Use velocity for calculations
  updateCameraPosition(velocity);

  // Object automatically returns to pool
}
```

**Minimize Garbage Collection Pressure**

```typescript
class GCOptimizedRenderer {
  // Pre-allocate objects to avoid GC during animation
  private readonly tempMatrix = new DOMMatrix();
  private readonly tempPoint = { x: 0, y: 0 };
  private readonly transformCache = new Map<string, string>();

  renderFrame(sections: SpatialSection[]): void {
    // Reuse pre-allocated objects
    this.tempPoint.x = camera.position.x;
    this.tempPoint.y = camera.position.y;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Use cached transforms when possible
      const cacheKey = `${section.id}-${camera.zoom}`;
      let transform = this.transformCache.get(cacheKey);

      if (!transform) {
        // Calculate only when cache miss
        this.tempMatrix.reset();
        this.tempMatrix.translateSelf(this.tempPoint.x, this.tempPoint.y);
        this.tempMatrix.scaleSelf(camera.zoom);

        transform = this.tempMatrix.toString();
        this.transformCache.set(cacheKey, transform);
      }

      section.element.style.transform = transform;
    }
  }
}
```

## Performance Monitoring and Adaptive Quality

### Real-Time Performance Tracking

```typescript
class PerformanceTracker {
  private frameMetrics: FrameMetric[] = [];
  private readonly maxSamples = 120; // 2 seconds at 60fps

  measureFrame(): FrameMetric {
    const frameStart = performance.now();

    return {
      timestamp: frameStart,
      frameTime: 0, // Will be updated on frame end
      memory: this.getMemoryUsage(),
      renderCalls: 0,
      complexity: this.getCurrentComplexity()
    };
  }

  endFrame(metric: FrameMetric): void {
    metric.frameTime = performance.now() - metric.timestamp;

    this.frameMetrics.push(metric);
    if (this.frameMetrics.length > this.maxSamples) {
      this.frameMetrics.shift();
    }

    // Trigger adaptive quality if needed
    if (this.getAverageFPS() < 55) {
      this.requestQualityReduction();
    }
  }

  getAverageFPS(): number {
    if (this.frameMetrics.length < 2) return 60;

    const totalTime = this.frameMetrics.reduce((sum, m) => sum + m.frameTime, 0);
    const avgFrameTime = totalTime / this.frameMetrics.length;

    return 1000 / avgFrameTime;
  }

  private getMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  private requestQualityReduction(): void {
    document.dispatchEvent(new CustomEvent('performance:degrade', {
      detail: { currentFPS: this.getAverageFPS() }
    }));
  }
}
```

### Adaptive Quality Management

```typescript
class AdaptiveQualityManager {
  private currentQuality: QualityLevel = 'high';
  private readonly qualitySettings = {
    ultra: {
      animationComplexity: 1.0,
      effectsEnabled: true,
      renderScale: 1.0,
      updateFrequency: 60
    },
    high: {
      animationComplexity: 0.8,
      effectsEnabled: true,
      renderScale: 1.0,
      updateFrequency: 60
    },
    medium: {
      animationComplexity: 0.6,
      effectsEnabled: true,
      renderScale: 0.8,
      updateFrequency: 45
    },
    low: {
      animationComplexity: 0.3,
      effectsEnabled: false,
      renderScale: 0.6,
      updateFrequency: 30
    }
  };

  constructor() {
    this.setupPerformanceListeners();
  }

  private setupPerformanceListeners(): void {
    document.addEventListener('performance:degrade', (event: CustomEvent) => {
      const currentFPS = event.detail.currentFPS;

      if (currentFPS < 45 && this.currentQuality !== 'low') {
        this.degradeQuality();
      } else if (currentFPS < 55 && this.currentQuality === 'high') {
        this.setQuality('medium');
      }
    });

    // Monitor for recovery opportunities
    setInterval(() => {
      this.checkForQualityRecovery();
    }, 5000);
  }

  private degradeQuality(): void {
    const qualityLevels: QualityLevel[] = ['ultra', 'high', 'medium', 'low'];
    const currentIndex = qualityLevels.indexOf(this.currentQuality);

    if (currentIndex < qualityLevels.length - 1) {
      this.setQuality(qualityLevels[currentIndex + 1]);
    }
  }

  private setQuality(quality: QualityLevel): void {
    this.currentQuality = quality;
    const settings = this.qualitySettings[quality];

    // Apply quality settings
    this.applyAnimationComplexity(settings.animationComplexity);
    this.toggleEffects(settings.effectsEnabled);
    this.setRenderScale(settings.renderScale);
    this.setUpdateFrequency(settings.updateFrequency);

    console.log(`Quality adjusted to: ${quality}`);
  }

  private applyAnimationComplexity(complexity: number): void {
    document.documentElement.style.setProperty('--animation-complexity', complexity.toString());
  }

  private toggleEffects(enabled: boolean): void {
    document.documentElement.classList.toggle('effects-disabled', !enabled);
  }

  private setRenderScale(scale: number): void {
    document.documentElement.style.setProperty('--render-scale', scale.toString());
  }

  private setUpdateFrequency(frequency: number): void {
    // Adjust animation frame targeting
    (window as any).__targetFPS = frequency;
  }
}
```

## Specific Optimization Techniques

### 1. Transform-Only Animations

```typescript
// ✅ OPTIMAL: Transform-based camera movement
class OptimizedCameraController {
  updateCameraPosition(x: number, y: number, zoom: number): void {
    // Single composite transform - triggers single repaint
    const transform = `translate3d(${x}px, ${y}px, 0) scale(${zoom})`;
    this.canvasElement.style.transform = transform;
  }
}

// ❌ SUBOPTIMAL: Multiple style changes
class SuboptimalCameraController {
  updateCameraPosition(x: number, y: number, zoom: number): void {
    // Multiple style changes - triggers multiple repaints
    this.canvasElement.style.left = `${x}px`;
    this.canvasElement.style.top = `${y}px`;
    this.canvasElement.style.transform = `scale(${zoom})`;
  }
}
```

### 2. Intersection Observer for Visibility

```typescript
class VisibilityOptimizer {
  private observer: IntersectionObserver;
  private visibleSections = new Set<string>();

  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: null,
        rootMargin: '50px', // Pre-load sections slightly out of view
        threshold: [0, 0.1, 0.9, 1.0]
      }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      const sectionId = entry.target.getAttribute('data-section-id');
      if (!sectionId) return;

      if (entry.isIntersecting) {
        this.visibleSections.add(sectionId);
        this.enableSection(sectionId);
      } else {
        this.visibleSections.delete(sectionId);
        this.disableSection(sectionId);
      }
    });
  }

  private enableSection(sectionId: string): void {
    // Enable animations and interactions for visible sections only
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    section?.classList.add('visible');
  }

  private disableSection(sectionId: string): void {
    // Disable expensive operations for invisible sections
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    section?.classList.remove('visible');
  }
}
```

### 3. Debounced Gesture Handling

```typescript
class OptimizedGestureHandler {
  private lastGestureTime = 0;
  private gestureThreshold = 16; // ~60fps gesture handling

  handlePanGesture(deltaX: number, deltaY: number): void {
    const now = performance.now();

    // Throttle gesture updates to maintain frame rate
    if (now - this.lastGestureTime < this.gestureThreshold) {
      return;
    }

    this.lastGestureTime = now;

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      this.updateCameraPosition(deltaX, deltaY);
    });
  }
}
```

## Performance Debugging Tools

### 1. Performance Profiler

```typescript
class PerformanceProfiler {
  private markers = new Map<string, number>();
  private measurements = new Map<string, number[]>();

  mark(name: string): void {
    this.markers.set(name, performance.now());
    performance.mark(name);
  }

  measure(name: string, startMark: string): number {
    const startTime = this.markers.get(startMark);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;

    // Track measurements for analysis
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);

    performance.measure(name, startMark);
    return duration;
  }

  getReport(): PerformanceReport {
    const report: PerformanceReport = {
      operations: {},
      summary: {
        totalTime: 0,
        averageFrameTime: 0,
        worstFrameTime: 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }
    };

    this.measurements.forEach((durations, operation) => {
      const total = durations.reduce((sum, d) => sum + d, 0);
      const average = total / durations.length;
      const worst = Math.max(...durations);

      report.operations[operation] = {
        totalTime: total,
        averageTime: average,
        worstTime: worst,
        callCount: durations.length
      };

      report.summary.totalTime += total;
    });

    return report;
  }
}

// Usage in performance-critical sections
const profiler = new PerformanceProfiler();

function renderFrame(): void {
  profiler.mark('frame-start');

  profiler.mark('camera-update-start');
  updateCameraPosition();
  profiler.measure('camera-update', 'camera-update-start');

  profiler.mark('section-render-start');
  renderSections();
  profiler.measure('section-render', 'section-render-start');

  profiler.measure('total-frame', 'frame-start');
}
```

### 2. Memory Leak Detection

```typescript
class MemoryLeakDetector {
  private initialMemory: number;
  private memoryCheckpoints: MemoryCheckpoint[] = [];
  private leakThreshold = 50 * 1024 * 1024; // 50MB

  constructor() {
    this.initialMemory = this.getCurrentMemory();
    this.startMonitoring();
  }

  private startMonitoring(): void {
    setInterval(() => {
      this.checkForLeaks();
    }, 10000); // Check every 10 seconds
  }

  private checkForLeaks(): void {
    const currentMemory = this.getCurrentMemory();
    const memoryGrowth = currentMemory - this.initialMemory;

    this.memoryCheckpoints.push({
      timestamp: Date.now(),
      memoryUsage: currentMemory,
      growth: memoryGrowth
    });

    // Keep only recent checkpoints
    if (this.memoryCheckpoints.length > 100) {
      this.memoryCheckpoints.shift();
    }

    // Detect concerning growth patterns
    if (memoryGrowth > this.leakThreshold) {
      this.reportPotentialLeak(memoryGrowth);
    }
  }

  private getCurrentMemory(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  private reportPotentialLeak(growth: number): void {
    console.warn(`Potential memory leak detected: ${(growth / 1024 / 1024).toFixed(2)}MB growth`);

    // Trigger garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
  }

  getMemoryReport(): MemoryReport {
    const current = this.getCurrentMemory();
    const peak = Math.max(...this.memoryCheckpoints.map(c => c.memoryUsage));

    return {
      current: current / 1024 / 1024, // MB
      peak: peak / 1024 / 1024, // MB
      growth: (current - this.initialMemory) / 1024 / 1024, // MB
      checkpoints: this.memoryCheckpoints.slice(-20) // Recent checkpoints
    };
  }
}
```

## Production Performance Checklist

### Pre-Deployment Performance Audit

```typescript
class PerformanceAuditor {
  async runAudit(): Promise<PerformanceAuditReport> {
    const report: PerformanceAuditReport = {
      frameRate: await this.testFrameRate(),
      memoryUsage: await this.testMemoryUsage(),
      interactionLatency: await this.testInteractionLatency(),
      browserCompatibility: await this.testBrowserCompatibility(),
      passed: false
    };

    // Overall pass/fail determination
    report.passed =
      report.frameRate.averageFPS >= 55 &&
      report.memoryUsage.peakUsage < 50 &&
      report.interactionLatency.averageLatency < 100 &&
      report.browserCompatibility.supportedBrowsers >= 4;

    return report;
  }

  private async testFrameRate(): Promise<FrameRateTest> {
    const tracker = new PerformanceTracker();

    // Run stress test for 5 seconds
    const testDuration = 5000;
    const startTime = performance.now();

    const stressTest = () => {
      // Simulate heavy canvas operations
      this.simulateHeavyCanvasOperations();

      if (performance.now() - startTime < testDuration) {
        requestAnimationFrame(stressTest);
      }
    };

    requestAnimationFrame(stressTest);

    await new Promise(resolve => setTimeout(resolve, testDuration));

    return {
      averageFPS: tracker.getAverageFPS(),
      minFPS: Math.min(...tracker.frameMetrics.map(m => 1000 / m.frameTime)),
      droppedFrames: tracker.frameMetrics.filter(m => m.frameTime > 16.67).length
    };
  }

  private async testMemoryUsage(): Promise<MemoryUsageTest> {
    const detector = new MemoryLeakDetector();

    // Simulate typical usage for memory testing
    for (let i = 0; i < 100; i++) {
      this.simulateUserInteraction();
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const report = detector.getMemoryReport();

    return {
      peakUsage: report.peak,
      growth: report.growth,
      leaksDetected: report.growth > 10 // 10MB growth threshold
    };
  }

  private async testInteractionLatency(): Promise<InteractionLatencyTest> {
    const latencies: number[] = [];

    // Test multiple interaction types
    for (let i = 0; i < 20; i++) {
      const start = performance.now();
      await this.simulateUserClick();
      const latency = performance.now() - start;
      latencies.push(latency);
    }

    return {
      averageLatency: latencies.reduce((sum, l) => sum + l, 0) / latencies.length,
      maxLatency: Math.max(...latencies),
      acceptableInteractions: latencies.filter(l => l < 100).length
    };
  }
}
```

## Performance Optimization Summary

### Critical Performance Targets

- **Frame Rate**: Maintain 60fps during all interactions
- **Memory Usage**: Stay under 50MB total allocation
- **Interaction Latency**: Sub-100ms response to user input
- **Paint Time**: Sub-16ms composite operations
- **Bundle Size**: Under 15KB gzipped for core canvas system

### Key Optimization Strategies

1. **Hardware Acceleration**: Use CSS transforms and GPU layers
2. **Memory Management**: Object pooling and GC pressure reduction
3. **Adaptive Quality**: Dynamic quality scaling based on performance
4. **Efficient Rendering**: Batch DOM updates and minimize repaints
5. **Smart Caching**: Cache transforms and expensive calculations

### Monitoring and Alerting

- Real-time FPS monitoring with adaptive quality
- Memory leak detection with automatic cleanup
- Performance regression testing in CI/CD
- User experience metrics collection and analysis

This guide ensures the LightboxCanvas system maintains professional-grade performance that demonstrates technical excellence to portfolio viewers.