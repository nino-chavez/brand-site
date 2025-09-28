# Debugging Guide for Performance and Accessibility Issues

## Overview

This guide provides comprehensive debugging strategies, tools, and workflows for identifying and resolving performance and accessibility issues in the LightboxCanvas spatial navigation system. The guide covers both automated and manual testing approaches.

## Performance Debugging

### 1. Browser Developer Tools

#### Chrome DevTools Performance Analysis

```typescript
class PerformanceDebugger {
  private isRecording: boolean = false;
  private performanceEntries: PerformanceEntry[] = [];

  startPerformanceRecording() {
    if (this.isRecording) return;

    // Clear existing entries
    this.performanceEntries = [];

    // Start performance monitoring
    this.isRecording = true;

    // Mark the start of measurement
    performance.mark('spatial-navigation-start');

    // Setup performance observers
    this.setupPerformanceObservers();

    console.log('🚀 Performance recording started');
    console.log('💡 Tip: Open Chrome DevTools > Performance tab for visual analysis');
  }

  stopPerformanceRecording(): PerformanceReport {
    if (!this.isRecording) return this.generateEmptyReport();

    // Mark the end of measurement
    performance.mark('spatial-navigation-end');
    performance.measure('spatial-navigation-duration', 'spatial-navigation-start', 'spatial-navigation-end');

    this.isRecording = false;

    const report = this.generatePerformanceReport();
    this.logPerformanceReport(report);

    return report;
  }

  private setupPerformanceObservers() {
    // Long Task API - detect blocking operations
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks > 50ms
            console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
          }
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.log('Long task observer not supported');
      }

      // Layout Shift detection
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if ((entry as any).value > 0.1) { // CLS > 0.1
            console.warn(`⚠️ Layout shift detected: ${(entry as any).value.toFixed(3)}`, entry);
          }
        });
      });

      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.log('Layout shift observer not supported');
      }
    }
  }

  private generatePerformanceReport(): PerformanceReport {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    const measures = performance.getEntriesByType('measure');

    return {
      timestamp: new Date().toISOString(),
      navigation: {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart
      },
      paint: {
        firstPaint: this.getPaintTiming(paintEntries, 'first-paint'),
        firstContentfulPaint: this.getPaintTiming(paintEntries, 'first-contentful-paint')
      },
      customMeasures: measures.map(measure => ({
        name: measure.name,
        duration: measure.duration,
        startTime: measure.startTime
      })),
      memoryUsage: this.getMemoryUsage(),
      frameRate: this.measureFrameRate(),
      recommendations: this.generateRecommendations()
    };
  }

  private measureFrameRate(): number {
    let frameCount = 0;
    let lastTime = performance.now();
    const duration = 1000; // Measure for 1 second

    return new Promise<number>((resolve) => {
      const measureFrame = (currentTime: number) => {
        frameCount++;

        if (currentTime - lastTime >= duration) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          resolve(fps);
        } else {
          requestAnimationFrame(measureFrame);
        }
      };

      requestAnimationFrame(measureFrame);
    }) as any; // Simplified for documentation
  }

  generateDebugCommand(): string {
    return `
// 🔧 Debug Performance Issues
const debugger = new PerformanceDebugger();

// Start recording
debugger.startPerformanceRecording();

// Perform spatial navigation actions
// ... your navigation code here ...

// Stop and analyze
const report = debugger.stopPerformanceRecording();

// Export detailed timeline
console.log('📊 Full Performance Report:', report);

// Chrome DevTools commands:
// 1. Open DevTools (F12)
// 2. Go to Performance tab
// 3. Click Record
// 4. Perform problematic actions
// 5. Stop recording and analyze flame chart
`;
  }
}

interface PerformanceReport {
  timestamp: string;
  navigation: NavigationTimings;
  paint: PaintTimings;
  customMeasures: CustomMeasure[];
  memoryUsage: MemoryUsage;
  frameRate: number;
  recommendations: string[];
}
```

#### Real-Time Performance Monitoring

```typescript
class RealTimePerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    taskDuration: 0
  };

  private isMonitoring: boolean = false;
  private monitoringInterval: number | null = null;

  startMonitoring(callback?: (metrics: PerformanceMetrics) => void) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitor every 100ms
    this.monitoringInterval = window.setInterval(() => {
      this.updateMetrics();

      if (callback) {
        callback(this.metrics);
      }

      this.checkPerformanceThresholds();
    }, 100);

    // Setup real-time display
    this.setupPerformanceOverlay();
  }

  private updateMetrics() {
    // Update FPS
    this.metrics.fps = this.measureCurrentFPS();

    // Update memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
    }

    // Update task duration (simplified)
    this.metrics.taskDuration = this.getAverageTaskDuration();
  }

  private checkPerformanceThresholds() {
    const issues: string[] = [];

    if (this.metrics.fps < 55) {
      issues.push(`Low FPS: ${this.metrics.fps} (target: 60)`);
    }

    if (this.metrics.memoryUsage > 0.8) {
      issues.push(`High memory usage: ${(this.metrics.memoryUsage * 100).toFixed(1)}%`);
    }

    if (this.metrics.taskDuration > 16.67) {
      issues.push(`Long tasks detected: ${this.metrics.taskDuration.toFixed(2)}ms`);
    }

    if (issues.length > 0) {
      console.warn('⚠️ Performance issues detected:', issues);
      this.triggerPerformanceAlert(issues);
    }
  }

  private setupPerformanceOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'performance-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      min-width: 200px;
    `;

    document.body.appendChild(overlay);

    // Update overlay periodically
    setInterval(() => {
      overlay.innerHTML = `
        <div>FPS: ${this.metrics.fps}</div>
        <div>Memory: ${(this.metrics.memoryUsage * 100).toFixed(1)}%</div>
        <div>Task Duration: ${this.metrics.taskDuration.toFixed(2)}ms</div>
        <div style="margin-top: 5px; font-size: 10px;">
          Press Ctrl+Shift+P to toggle
        </div>
      `;
    }, 100);

    // Toggle overlay with keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
      }
    });
  }
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  taskDuration: number;
}
```

### 2. Automated Performance Testing

```typescript
class AutomatedPerformanceTests {
  async runPerformanceTestSuite(): Promise<TestSuiteResults> {
    console.log('🧪 Running automated performance tests...');

    const results: TestSuiteResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      overallScore: 0,
      recommendations: []
    };

    // Test 1: Frame rate consistency
    const fpsTest = await this.testFrameRateConsistency();
    results.tests.push(fpsTest);

    // Test 2: Memory leak detection
    const memoryTest = await this.testMemoryLeaks();
    results.tests.push(memoryTest);

    // Test 3: Touch response time
    const touchTest = await this.testTouchResponseTime();
    results.tests.push(touchTest);

    // Test 4: Animation smoothness
    const animationTest = await this.testAnimationSmoothness();
    results.tests.push(animationTest);

    // Test 5: Bundle size analysis
    const bundleTest = await this.testBundleSize();
    results.tests.push(bundleTest);

    results.overallScore = this.calculateOverallScore(results.tests);
    results.recommendations = this.generateRecommendations(results.tests);

    return results;
  }

  private async testFrameRateConsistency(): Promise<TestResult> {
    const frameRates: number[] = [];
    const testDuration = 5000; // 5 seconds
    const startTime = performance.now();

    return new Promise((resolve) => {
      const measureFrame = (currentTime: number) => {
        if (currentTime - startTime < testDuration) {
          frameRates.push(1000 / (currentTime - (frameRates.length > 0 ? startTime : currentTime)));
          requestAnimationFrame(measureFrame);
        } else {
          const avgFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
          const minFPS = Math.min(...frameRates);
          const maxFPS = Math.max(...frameRates);
          const variance = this.calculateVariance(frameRates);

          resolve({
            name: 'Frame Rate Consistency',
            passed: avgFPS >= 55 && variance < 10,
            score: Math.min((avgFPS / 60) * 100, 100),
            details: {
              averageFPS: avgFPS,
              minimumFPS: minFPS,
              maximumFPS: maxFPS,
              variance: variance
            },
            recommendations: avgFPS < 55 ? ['Consider reducing visual complexity', 'Enable hardware acceleration'] : []
          });
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }

  generateDebugScript(): string {
    return `
// 🧪 Automated Performance Testing
const testRunner = new AutomatedPerformanceTests();

// Run full test suite
testRunner.runPerformanceTestSuite().then(results => {
  console.log('📋 Performance Test Results:', results);

  // Check for critical issues
  const criticalIssues = results.tests.filter(test => !test.passed);
  if (criticalIssues.length > 0) {
    console.error('❌ Critical performance issues found:', criticalIssues);
  } else {
    console.log('✅ All performance tests passed!');
  }
});

// Run individual tests
testRunner.testFrameRateConsistency().then(result => {
  console.log('🎯 FPS Test:', result);
});
`;
  }
}
```

## Accessibility Debugging

### 1. Screen Reader Testing

```typescript
class AccessibilityDebugger {
  private announcements: string[] = [];
  private focusHistory: HTMLElement[] = [];

  startAccessibilityRecording() {
    this.announcements = [];
    this.focusHistory = [];

    // Monitor screen reader announcements
    this.monitorAriaLiveRegions();

    // Monitor focus changes
    this.monitorFocusChanges();

    // Monitor keyboard navigation
    this.monitorKeyboardNavigation();

    console.log('🎯 Accessibility recording started');
    console.log('💡 Test with screen readers: NVDA, JAWS, VoiceOver');
  }

  private monitorAriaLiveRegions() {
    const liveRegions = document.querySelectorAll('[aria-live]');

    liveRegions.forEach(region => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const content = (mutation.target as Element).textContent;
            if (content && content.trim()) {
              this.announcements.push({
                timestamp: new Date().toISOString(),
                type: 'aria-live',
                content: content.trim(),
                politeness: region.getAttribute('aria-live') || 'polite'
              } as any);

              console.log(`📢 Screen reader announcement: "${content.trim()}"`);
            }
          }
        });
      });

      observer.observe(region, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });
  }

  private monitorFocusChanges() {
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      this.focusHistory.push(target);

      // Check for proper focus indicators
      const computedStyle = window.getComputedStyle(target);
      const hasVisibleFocus = this.hasVisibleFocusIndicator(computedStyle);

      if (!hasVisibleFocus) {
        console.warn('⚠️ Element lacks visible focus indicator:', target);
      }

      // Check for proper ARIA labels
      const accessibleName = this.getAccessibleName(target);
      if (!accessibleName) {
        console.warn('⚠️ Element lacks accessible name:', target);
      }

      console.log(`🎯 Focus: ${target.tagName} - "${accessibleName}"`);
    });
  }

  private hasVisibleFocusIndicator(style: CSSStyleDeclaration): boolean {
    return style.outline !== 'none' &&
           style.outlineWidth !== '0px' ||
           style.boxShadow.includes('inset') ||
           style.border !== 'none';
  }

  private getAccessibleName(element: HTMLElement): string {
    return element.getAttribute('aria-label') ||
           element.getAttribute('aria-labelledby') ||
           element.getAttribute('title') ||
           element.textContent?.trim() ||
           (element as HTMLInputElement).placeholder ||
           '';
  }

  generateAccessibilityReport(): AccessibilityReport {
    return {
      timestamp: new Date().toISOString(),
      announcements: this.announcements,
      focusPath: this.focusHistory.map(el => ({
        tagName: el.tagName,
        accessibleName: this.getAccessibleName(el),
        hasProperFocus: this.hasVisibleFocusIndicator(window.getComputedStyle(el))
      })),
      violations: this.detectViolations(),
      recommendations: this.generateAccessibilityRecommendations()
    };
  }

  // Integration with axe-core for comprehensive testing
  async runAxeAudit(): Promise<any> {
    if (typeof (window as any).axe === 'undefined') {
      console.warn('axe-core not loaded. Install with: npm install @axe-core/playwright');
      return null;
    }

    try {
      const results = await (window as any).axe.run();

      console.log('🔍 Axe Audit Results:');
      console.log(`✅ Passes: ${results.passes.length}`);
      console.log(`⚠️ Violations: ${results.violations.length}`);
      console.log(`❓ Incomplete: ${results.incomplete.length}`);

      if (results.violations.length > 0) {
        console.error('❌ Accessibility violations found:', results.violations);
      }

      return results;
    } catch (error) {
      console.error('Failed to run axe audit:', error);
      return null;
    }
  }
}

interface AccessibilityReport {
  timestamp: string;
  announcements: any[];
  focusPath: any[];
  violations: any[];
  recommendations: string[];
}
```

### 2. Keyboard Navigation Testing

```typescript
class KeyboardNavigationTester {
  private navigationPath: NavigationStep[] = [];
  private startTime: number = 0;

  startKeyboardTest() {
    this.navigationPath = [];
    this.startTime = performance.now();

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('focusin', this.handleFocusChange);

    console.log('⌨️ Keyboard navigation test started');
    console.log('💡 Use Tab, Shift+Tab, Arrow keys, Enter, Space to navigate');
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const step: NavigationStep = {
      timestamp: performance.now() - this.startTime,
      key: event.key,
      modifiers: {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey
      },
      target: event.target as HTMLElement,
      prevented: event.defaultPrevented
    };

    this.navigationPath.push(step);

    // Check for keyboard traps
    this.checkForKeyboardTrap();

    // Check for proper key handling
    this.validateKeyHandling(event);
  };

  private handleFocusChange = (event: FocusEvent) => {
    const target = event.target as HTMLElement;

    // Check if focus is visible
    const isVisible = this.isElementVisible(target);
    if (!isVisible) {
      console.warn('⚠️ Focus moved to invisible element:', target);
    }

    // Check if element is within viewport
    const isInViewport = this.isElementInViewport(target);
    if (!isInViewport) {
      console.warn('⚠️ Focus moved outside viewport:', target);
    }
  };

  private checkForKeyboardTrap() {
    const recentFocusChanges = this.navigationPath
      .slice(-10)
      .filter(step => step.key === 'Tab');

    if (recentFocusChanges.length >= 5) {
      const targets = recentFocusChanges.map(step => step.target);
      const uniqueTargets = new Set(targets);

      if (uniqueTargets.size <= 2) {
        console.error('🚫 Potential keyboard trap detected!', targets);
      }
    }
  }

  generateKeyboardTestReport(): KeyboardTestReport {
    return {
      totalSteps: this.navigationPath.length,
      duration: performance.now() - this.startTime,
      uniqueElements: new Set(this.navigationPath.map(step => step.target)).size,
      keyboardTraps: this.detectKeyboardTraps(),
      inaccessibleElements: this.findInaccessibleElements(),
      recommendations: this.generateKeyboardRecommendations()
    };
  }
}

interface NavigationStep {
  timestamp: number;
  key: string;
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
  target: HTMLElement;
  prevented: boolean;
}
```

## Common Issues and Solutions

### Performance Issues Troubleshooting

```typescript
class PerformanceTroubleshooter {
  static diagnoseIssue(symptoms: string[]): DiagnosisResult {
    const diagnosis: DiagnosisResult = {
      possibleCauses: [],
      solutions: [],
      testingSteps: []
    };

    // Low FPS issues
    if (symptoms.includes('low-fps') || symptoms.includes('stuttering')) {
      diagnosis.possibleCauses.push(
        'Hardware acceleration disabled',
        'Too many DOM manipulations',
        'Memory leaks',
        'Blocking JavaScript tasks'
      );

      diagnosis.solutions.push(
        'Enable CSS hardware acceleration with transform3d',
        'Batch DOM updates using requestAnimationFrame',
        'Implement object pooling for frequently created objects',
        'Use Web Workers for heavy computations'
      );

      diagnosis.testingSteps.push(
        'Monitor FPS with Performance API',
        'Check Chrome DevTools Performance tab',
        'Profile memory usage',
        'Analyze long task timing'
      );
    }

    // Memory issues
    if (symptoms.includes('memory-leak') || symptoms.includes('high-memory')) {
      diagnosis.possibleCauses.push(
        'Event listeners not cleaned up',
        'Circular references',
        'Large object caches',
        'Detached DOM nodes'
      );

      diagnosis.solutions.push(
        'Implement proper cleanup in component unmount',
        'Use WeakMap for object references',
        'Implement LRU cache with size limits',
        'Remove DOM event listeners on cleanup'
      );
    }

    return diagnosis;
  }

  static generateDebugChecklist(): string[] {
    return [
      '🔍 Check Chrome DevTools Performance tab',
      '📊 Monitor FPS with real-time overlay',
      '🧠 Profile memory usage and leaks',
      '⏱️ Measure paint and layout timing',
      '🎯 Test on low-end devices',
      '📱 Validate mobile performance',
      '🔄 Test with large datasets',
      '⚡ Verify hardware acceleration',
      '🏃‍♂️ Test animation smoothness',
      '📈 Monitor network performance impact'
    ];
  }
}

interface DiagnosisResult {
  possibleCauses: string[];
  solutions: string[];
  testingSteps: string[];
}
```

### Accessibility Issues Troubleshooting

```typescript
class AccessibilityTroubleshooter {
  static diagnoseAccessibilityIssue(symptoms: string[]): AccessibilityDiagnosis {
    const diagnosis: AccessibilityDiagnosis = {
      wcagViolations: [],
      solutions: [],
      testingTools: []
    };

    if (symptoms.includes('screen-reader-issues')) {
      diagnosis.wcagViolations.push('WCAG 4.1.2 - Name, Role, Value');
      diagnosis.solutions.push(
        'Add proper ARIA labels',
        'Ensure semantic HTML structure',
        'Implement live regions for dynamic content'
      );
      diagnosis.testingTools.push('NVDA', 'JAWS', 'VoiceOver');
    }

    if (symptoms.includes('keyboard-navigation')) {
      diagnosis.wcagViolations.push('WCAG 2.1.1 - Keyboard Navigation');
      diagnosis.solutions.push(
        'Implement proper tab order',
        'Add visible focus indicators',
        'Support arrow key navigation'
      );
      diagnosis.testingTools.push('Keyboard-only testing', 'Tab order validation');
    }

    return diagnosis;
  }

  static generateAccessibilityChecklist(): string[] {
    return [
      '⌨️ Test keyboard-only navigation',
      '🔊 Test with screen readers',
      '🎯 Verify focus indicators',
      '📢 Check ARIA labels and roles',
      '🎨 Validate color contrast ratios',
      '📱 Test with mobile screen readers',
      '🔍 Run automated accessibility scans',
      '👥 Conduct user testing with disabilities',
      '🏃‍♂️ Test reduced motion preferences',
      '📋 Validate semantic HTML structure'
    ];
  }
}
```

## Automated Testing Integration

```typescript
class TestingIntegration {
  // Jest/Vitest test example
  static generatePerformanceTest(): string {
    return `
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PerformanceDebugger } from './performance-debugger';

describe('LightboxCanvas Performance', () => {
  let debugger: PerformanceDebugger;

  beforeEach(() => {
    debugger = new PerformanceDebugger();
  });

  it('should maintain 60fps during navigation', async () => {
    debugger.startPerformanceRecording();

    // Simulate navigation actions
    await simulateSpatialNavigation();

    const report = debugger.stopPerformanceRecording();
    expect(report.frameRate).toBeGreaterThanOrEqual(55);
  });

  it('should not exceed memory limits', async () => {
    const initialMemory = getMemoryUsage();

    // Perform memory-intensive operations
    await performHeavyOperations();

    const finalMemory = getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;

    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
  });
});
`;
  }

  // Playwright accessibility test example
  static generateAccessibilityTest(): string {
    return `
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should pass axe accessibility scan', async ({ page }) => {
    await page.goto('/lightbox-canvas');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/lightbox-canvas');

    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test arrow key navigation
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.focused-item')).toBeVisible();
  });
});
`;
  }
}
```

This comprehensive debugging guide provides developers with the tools, workflows, and knowledge needed to identify and resolve performance and accessibility issues efficiently, ensuring the LightboxCanvas system maintains optimal quality standards.