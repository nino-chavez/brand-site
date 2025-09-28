# Accessibility Implementation Guide for Spatial Navigation

## Overview

This guide provides comprehensive implementation details for creating WCAG 2.1 AA compliant spatial navigation within the LightboxCanvas system. The spatial navigation metaphor must be accessible to users with disabilities while maintaining the intuitive camera-like movement experience.

## Core Accessibility Principles

### 1. Keyboard Navigation

#### Focus Management
```typescript
class AccessibleSpatialNavigator {
  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex = 0;

  constructor(container: HTMLElement) {
    this.initializeFocusManagement(container);
    this.setupKeyboardListeners();
  }

  private initializeFocusManagement(container: HTMLElement) {
    // Find all focusable elements in spatial order
    this.focusableElements = Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(element => this.isElementVisible(element)) as HTMLElement[];

    // Set initial tabindex values for spatial navigation
    this.focusableElements.forEach((element, index) => {
      element.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });
  }

  private setupKeyboardListeners() {
    document.addEventListener('keydown', this.handleKeyboardNavigation);
  }

  private handleKeyboardNavigation = (event: KeyboardEvent) => {
    const { key, shiftKey, ctrlKey } = event;

    switch (key) {
      case 'Tab':
        if (shiftKey) {
          this.navigatePrevious();
        } else {
          this.navigateNext();
        }
        event.preventDefault();
        break;

      case 'ArrowUp':
        this.navigateUp();
        event.preventDefault();
        break;

      case 'ArrowDown':
        this.navigateDown();
        event.preventDefault();
        break;

      case 'ArrowLeft':
        this.navigateLeft();
        event.preventDefault();
        break;

      case 'ArrowRight':
        this.navigateRight();
        event.preventDefault();
        break;

      case 'Home':
        this.focusFirst();
        event.preventDefault();
        break;

      case 'End':
        this.focusLast();
        event.preventDefault();
        break;
    }
  };

  private updateFocus(newIndex: number) {
    // Remove focus from current element
    this.focusableElements[this.currentFocusIndex]?.setAttribute('tabindex', '-1');

    // Set focus to new element
    this.currentFocusIndex = Math.max(0, Math.min(newIndex, this.focusableElements.length - 1));
    const newFocusElement = this.focusableElements[this.currentFocusIndex];

    if (newFocusElement) {
      newFocusElement.setAttribute('tabindex', '0');
      newFocusElement.focus();
      this.announcePosition();
    }
  }
}
```

#### Spatial Movement Patterns
```typescript
interface SpatialPosition {
  x: number;
  y: number;
  element: HTMLElement;
}

class SpatialFocusManager {
  private spatialMap: Map<HTMLElement, SpatialPosition> = new Map();

  private calculateSpatialPositions() {
    this.focusableElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      this.spatialMap.set(element, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        element
      });
    });
  }

  private findNearestElement(direction: 'up' | 'down' | 'left' | 'right'): HTMLElement | null {
    const current = this.spatialMap.get(this.focusableElements[this.currentFocusIndex]);
    if (!current) return null;

    let candidates = Array.from(this.spatialMap.values());

    // Filter candidates based on direction
    switch (direction) {
      case 'up':
        candidates = candidates.filter(pos => pos.y < current.y);
        break;
      case 'down':
        candidates = candidates.filter(pos => pos.y > current.y);
        break;
      case 'left':
        candidates = candidates.filter(pos => pos.x < current.x);
        break;
      case 'right':
        candidates = candidates.filter(pos => pos.x > current.x);
        break;
    }

    // Find closest candidate
    return candidates.reduce((closest, candidate) => {
      const currentDistance = this.calculateDistance(current, candidate);
      const closestDistance = closest ? this.calculateDistance(current, closest) : Infinity;
      return currentDistance < closestDistance ? candidate : closest;
    }, null as SpatialPosition | null)?.element || null;
  }
}
```

### 2. Screen Reader Support

#### ARIA Labels and Descriptions
```typescript
class AccessibilityAnnouncer {
  private liveRegion: HTMLElement;

  constructor() {
    this.createLiveRegion();
  }

  private createLiveRegion() {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('class', 'sr-only');
    this.liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(this.liveRegion);
  }

  announceNavigation(element: HTMLElement, position: { x: number; y: number; total: number }) {
    const elementLabel = this.getElementLabel(element);
    const positionInfo = `${position.x + 1} of ${position.total}`;
    const announcement = `Focused ${elementLabel}, position ${positionInfo}`;

    this.liveRegion.textContent = announcement;
  }

  announceViewportChange(newPosition: string) {
    const announcement = `Camera moved to ${newPosition}`;
    this.liveRegion.textContent = announcement;
  }

  private getElementLabel(element: HTMLElement): string {
    return element.getAttribute('aria-label') ||
           element.getAttribute('title') ||
           element.textContent?.trim() ||
           element.tagName.toLowerCase();
  }
}
```

#### Photography Metaphor ARIA Implementation
```typescript
interface PhotographyAriaLabels {
  viewfinder: string;
  lens: string;
  aperture: string;
  focus: string;
  shutter: string;
  navigation: string;
}

const PHOTOGRAPHY_ARIA: PhotographyAriaLabels = {
  viewfinder: 'Camera viewfinder showing gallery content',
  lens: 'Lens controls for zooming and focusing',
  aperture: 'Aperture settings for depth of field',
  focus: 'Focus controls for content clarity',
  shutter: 'Shutter button for selecting items',
  navigation: 'Camera movement controls for spatial navigation'
};

class PhotographyAccessibilityManager {
  static applyPhotographyAria(element: HTMLElement, type: keyof PhotographyAriaLabels) {
    element.setAttribute('aria-label', PHOTOGRAPHY_ARIA[type]);
    element.setAttribute('role', this.getAppropriateRole(type));
  }

  static getAppropriateRole(type: keyof PhotographyAriaLabels): string {
    const roleMap = {
      viewfinder: 'region',
      lens: 'group',
      aperture: 'slider',
      focus: 'slider',
      shutter: 'button',
      navigation: 'navigation'
    };
    return roleMap[type];
  }
}
```

### 3. Focus Management

#### Focus Trap Implementation
```typescript
class FocusTrapManager {
  private trapElement: HTMLElement;
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;

  constructor(element: HTMLElement) {
    this.trapElement = element;
    this.setupFocusTrap();
  }

  private setupFocusTrap() {
    const focusableElements = this.getFocusableElements();

    if (focusableElements.length > 0) {
      this.firstFocusable = focusableElements[0];
      this.lastFocusable = focusableElements[focusableElements.length - 1];

      this.trapElement.addEventListener('keydown', this.handleFocusTrap);

      // Set initial focus
      this.firstFocusable.focus();
    }
  }

  private handleFocusTrap = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  };

  destroy() {
    this.trapElement.removeEventListener('keydown', this.handleFocusTrap);
  }
}
```

### 4. Reduced Motion Support

#### Motion-Sensitive Navigation
```typescript
class MotionAccessibilityManager {
  private prefersReducedMotion: boolean;

  constructor() {
    this.prefersReducedMotion = this.checkReducedMotionPreference();
    this.setupMotionPreferenceListener();
  }

  private checkReducedMotionPreference(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private setupMotionPreferenceListener() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      this.updateAnimationSettings();
    });
  }

  getTransitionDuration(): number {
    return this.prefersReducedMotion ? 0 : 300;
  }

  getEasingFunction(): string {
    return this.prefersReducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)';
  }

  shouldUseParallax(): boolean {
    return !this.prefersReducedMotion;
  }

  private updateAnimationSettings() {
    document.documentElement.style.setProperty(
      '--transition-duration',
      `${this.getTransitionDuration()}ms`
    );

    document.documentElement.style.setProperty(
      '--easing-function',
      this.getEasingFunction()
    );
  }
}
```

### 5. High Contrast Support

#### Contrast-Aware Styling
```typescript
class ContrastAccessibilityManager {
  private highContrastMode: boolean;

  constructor() {
    this.highContrastMode = this.checkHighContrastMode();
    this.setupContrastListener();
  }

  private checkHighContrastMode(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  private setupContrastListener() {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    mediaQuery.addEventListener('change', (e) => {
      this.highContrastMode = e.matches;
      this.updateContrastStyles();
    });
  }

  private updateContrastStyles() {
    const root = document.documentElement;

    if (this.highContrastMode) {
      root.classList.add('high-contrast');

      // Update CSS custom properties for high contrast
      root.style.setProperty('--focus-outline-width', '3px');
      root.style.setProperty('--focus-outline-color', '#000000');
      root.style.setProperty('--focus-outline-style', 'solid');
    } else {
      root.classList.remove('high-contrast');

      // Reset to default values
      root.style.setProperty('--focus-outline-width', '2px');
      root.style.setProperty('--focus-outline-color', '#0066cc');
      root.style.setProperty('--focus-outline-style', 'solid');
    }
  }
}
```

## Testing and Validation

### Automated Accessibility Testing
```typescript
class AccessibilityValidator {
  async validateSpatialNavigation(): Promise<AccessibilityReport> {
    const issues: AccessibilityIssue[] = [];

    // Test keyboard navigation
    const keyboardIssues = await this.testKeyboardNavigation();
    issues.push(...keyboardIssues);

    // Test screen reader compatibility
    const screenReaderIssues = await this.testScreenReaderSupport();
    issues.push(...screenReaderIssues);

    // Test focus management
    const focusIssues = await this.testFocusManagement();
    issues.push(...focusIssues);

    return {
      timestamp: new Date().toISOString(),
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      issues
    };
  }

  private async testKeyboardNavigation(): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    // Test tab order
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) {
      issues.push({
        type: 'keyboard-navigation',
        severity: 'critical',
        message: 'No focusable elements found',
        element: null
      });
    }

    // Test arrow key navigation
    const hasArrowKeySupport = this.testArrowKeyNavigation();
    if (!hasArrowKeySupport) {
      issues.push({
        type: 'keyboard-navigation',
        severity: 'warning',
        message: 'Arrow key navigation not implemented',
        element: null
      });
    }

    return issues;
  }
}

interface AccessibilityIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  element: HTMLElement | null;
}

interface AccessibilityReport {
  timestamp: string;
  totalIssues: number;
  criticalIssues: number;
  issues: AccessibilityIssue[];
}
```

### Manual Testing Checklist

#### Screen Reader Testing
- [ ] NVDA compatibility verified
- [ ] JAWS compatibility verified
- [ ] VoiceOver compatibility verified
- [ ] Content announcements are clear and helpful
- [ ] Navigation instructions are provided
- [ ] Photography metaphors are explained appropriately

#### Keyboard Navigation Testing
- [ ] Tab order follows logical spatial progression
- [ ] Arrow keys provide directional navigation
- [ ] Home/End keys work for first/last focus
- [ ] Escape key exits modal/overlay states
- [ ] Enter/Space activate focused elements
- [ ] Focus indicators are clearly visible

#### Motion and Contrast Testing
- [ ] Reduced motion preference is respected
- [ ] High contrast mode displays correctly
- [ ] Focus indicators meet contrast requirements
- [ ] Text content meets WCAG AA contrast ratios

## Integration Guidelines

### Component Implementation
```typescript
interface AccessibleSpatialComponent {
  // Required accessibility props
  ariaLabel: string;
  role?: string;
  tabIndex?: number;

  // Navigation callbacks
  onFocusReceived?: (element: HTMLElement) => void;
  onFocusLost?: (element: HTMLElement) => void;
  onNavigate?: (direction: NavigationDirection) => void;
}

class AccessibleLightboxCanvas extends LightboxCanvas {
  private accessibilityManager: AccessibilityManager;

  constructor(options: LightboxCanvasOptions & AccessibleSpatialComponent) {
    super(options);
    this.accessibilityManager = new AccessibilityManager(this.container, options);
  }

  protected setupAccessibility() {
    // Apply ARIA labels and roles
    this.container.setAttribute('role', 'application');
    this.container.setAttribute('aria-label', 'Interactive photo gallery with spatial navigation');

    // Setup keyboard navigation
    this.accessibilityManager.enableKeyboardNavigation();

    // Setup screen reader support
    this.accessibilityManager.enableScreenReaderSupport();

    // Setup motion preferences
    this.accessibilityManager.enableMotionSupport();
  }
}
```

This accessibility implementation ensures that spatial navigation remains intuitive for all users while meeting WCAG 2.1 AA compliance standards. The photography metaphor is preserved through thoughtful ARIA labeling and announcements that explain camera-like interactions in accessible terms.