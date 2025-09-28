/**
 * Accessibility Monitoring and Compliance Tracking System
 *
 * This system monitors WCAG 2.1 AA compliance, tracks accessibility
 * metrics, and validates photography metaphor accessibility in real-time.
 */

interface AccessibilityMetrics {
  wcagCompliance: {
    level: 'A' | 'AA' | 'AAA';
    score: number;
    violations: AccessibilityViolation[];
  };
  screenReader: {
    compatible: boolean;
    announcementCount: number;
    responseTime: number;
  };
  keyboard: {
    navigationScore: number;
    trapCount: number;
    focusableElements: number;
    skipLinksPresent: boolean;
  };
  visual: {
    contrastRatio: number;
    colorIssues: number;
    textSize: number;
    motionCompliance: boolean;
  };
  photography: {
    metaphorExplanations: number;
    alternativeDescriptions: number;
    consistencyScore: number;
  };
  timestamp: number;
}

interface AccessibilityViolation {
  type: 'wcag' | 'photography' | 'keyboard' | 'visual' | 'content';
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  rule: string;
  element?: HTMLElement;
  description: string;
  impact: string;
  suggestion: string;
  helpUrl?: string;
}

interface AccessibilityThresholds {
  minWcagScore: number;
  maxResponseTime: number;
  minContrastRatio: number;
  minKeyboardScore: number;
  minPhotographyScore: number;
}

class AccessibilityMonitor {
  private metrics: AccessibilityMetrics[] = [];
  private violations: AccessibilityViolation[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: number | null = null;
  private mutationObserver: MutationObserver | null = null;
  private focusHistory: HTMLElement[] = [];
  private announcements: string[] = [];

  // Accessibility thresholds for compliance
  private thresholds: AccessibilityThresholds = {
    minWcagScore: 85,        // Minimum WCAG compliance score (%)
    maxResponseTime: 200,    // Maximum screen reader response time (ms)
    minContrastRatio: 4.5,   // WCAG AA contrast ratio
    minKeyboardScore: 90,    // Minimum keyboard navigation score (%)
    minPhotographyScore: 80  // Minimum photography metaphor accessibility score (%)
  };

  private axeConfiguration = {
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    rules: {
      // Enable all relevant WCAG rules
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'aria-labels': { enabled: true },
      'heading-structure': { enabled: true },
      'landmark-navigation': { enabled: true },
      'screen-reader-content': { enabled: true }
    }
  };

  constructor() {
    this.setupAccessibilityObservers();
    this.bindKeyboardListeners();
    this.bindScreenReaderListeners();
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Start periodic accessibility audits
    this.monitoringInterval = window.setInterval(async () => {
      await this.runAccessibilityAudit();
    }, 30000); // Run audit every 30 seconds

    // Start DOM mutation monitoring
    this.startDOMMonitoring();

    // Initial audit
    await this.runAccessibilityAudit();

    console.log('♿ Accessibility monitoring started');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    console.log('♿ Accessibility monitoring stopped');
  }

  private async runAccessibilityAudit(): Promise<void> {
    try {
      // Run WCAG compliance check
      const wcagResults = await this.auditWCAGCompliance();

      // Check screen reader compatibility
      const screenReaderResults = this.auditScreenReaderCompatibility();

      // Evaluate keyboard navigation
      const keyboardResults = this.auditKeyboardNavigation();

      // Check visual accessibility
      const visualResults = await this.auditVisualAccessibility();

      // Validate photography metaphor accessibility
      const photographyResults = this.auditPhotographyMetaphors();

      const metrics: AccessibilityMetrics = {
        wcagCompliance: wcagResults,
        screenReader: screenReaderResults,
        keyboard: keyboardResults,
        visual: visualResults,
        photography: photographyResults,
        timestamp: performance.now()
      };

      this.metrics.push(metrics);

      // Keep only recent metrics (last hour)
      const oneHourAgo = performance.now() - 3600000;
      this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);

      // Evaluate compliance and trigger alerts
      this.evaluateCompliance(metrics);

    } catch (error) {
      console.error('Accessibility audit failed:', error);
    }
  }

  private async auditWCAGCompliance(): Promise<AccessibilityMetrics['wcagCompliance']> {
    // Check if axe-core is available
    if (typeof (window as any).axe === 'undefined') {
      console.warn('axe-core not available for WCAG compliance checking');
      return {
        level: 'A',
        score: 0,
        violations: []
      };
    }

    try {
      const results = await (window as any).axe.run(document, this.axeConfiguration);

      const violations: AccessibilityViolation[] = results.violations.map((violation: any) => ({
        type: 'wcag',
        severity: this.mapAxeSeverity(violation.impact),
        rule: violation.id,
        description: violation.description,
        impact: violation.impact,
        suggestion: violation.help,
        helpUrl: violation.helpUrl,
        element: violation.nodes[0]?.target ?
          document.querySelector(violation.nodes[0].target[0]) : undefined
      }));

      // Calculate compliance score
      const totalRules = results.passes.length + results.violations.length;
      const passedRules = results.passes.length;
      const score = totalRules > 0 ? (passedRules / totalRules) * 100 : 0;

      // Determine compliance level
      let level: 'A' | 'AA' | 'AAA' = 'A';
      if (score >= 95) level = 'AAA';
      else if (score >= 85) level = 'AA';

      this.violations.push(...violations);

      return {
        level,
        score,
        violations
      };

    } catch (error) {
      console.error('WCAG compliance audit failed:', error);
      return {
        level: 'A',
        score: 0,
        violations: []
      };
    }
  }

  private auditScreenReaderCompatibility(): AccessibilityMetrics['screenReader'] {
    // Check for ARIA live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    const hasLiveRegions = liveRegions.length > 0;

    // Check for proper ARIA labels
    const ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
    const ariaLabelCount = ariaLabels.length;

    // Check for screen reader only content
    const srOnlyContent = document.querySelectorAll('.sr-only, .screen-reader-only');
    const hasSRContent = srOnlyContent.length > 0;

    // Estimate response time based on announcement queue
    const responseTime = this.announcements.length > 0 ?
      Math.min(this.announcements.length * 50, 500) : 0;

    return {
      compatible: hasLiveRegions && ariaLabelCount > 0 && hasSRContent,
      announcementCount: this.announcements.length,
      responseTime
    };
  }

  private auditKeyboardNavigation(): AccessibilityMetrics['keyboard'] {
    // Find all focusable elements
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]:first-child, .skip-link');
    const skipLinksPresent = skipLinks.length > 0;

    // Evaluate tab order
    const tabOrderScore = this.evaluateTabOrder(Array.from(focusableElements) as HTMLElement[]);

    // Check for keyboard traps
    const trapCount = this.detectKeyboardTraps();

    // Calculate overall keyboard score
    const navigationScore = (
      (skipLinksPresent ? 25 : 0) +
      (tabOrderScore * 0.5) +
      (trapCount === 0 ? 25 : Math.max(0, 25 - trapCount * 5))
    );

    return {
      navigationScore,
      trapCount,
      focusableElements: focusableElements.length,
      skipLinksPresent
    };
  }

  private evaluateTabOrder(elements: HTMLElement[]): number {
    if (elements.length === 0) return 0;

    let score = 100;
    let previousTabIndex = -1;

    elements.forEach(element => {
      const tabIndex = parseInt(element.getAttribute('tabindex') || '0', 10);

      // Penalize for inappropriate tab index usage
      if (tabIndex > 0 && tabIndex < previousTabIndex) {
        score -= 10; // Tab order not logical
      }

      // Check if element is visible and accessible
      if (!this.isElementVisible(element)) {
        score -= 5; // Focusable but not visible
      }

      previousTabIndex = tabIndex;
    });

    return Math.max(0, score);
  }

  private detectKeyboardTraps(): number {
    // This is a simplified detection - in practice, would need more sophisticated logic
    const recentFocus = this.focusHistory.slice(-10);
    const uniqueFocusTargets = new Set(recentFocus);

    // If user has been cycling through very few elements, might indicate a trap
    if (recentFocus.length >= 8 && uniqueFocusTargets.size <= 2) {
      return 1;
    }

    return 0;
  }

  private async auditVisualAccessibility(): Promise<AccessibilityMetrics['visual']> {
    // Check color contrast
    const contrastIssues = await this.checkColorContrast();
    const averageContrast = contrastIssues.averageRatio || 0;

    // Check text size
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    const textSizes = Array.from(textElements).map(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.fontSize);
    });

    const averageTextSize = textSizes.length > 0 ?
      textSizes.reduce((sum, size) => sum + size, 0) / textSizes.length : 0;

    // Check motion compliance
    const motionCompliance = this.checkMotionCompliance();

    return {
      contrastRatio: averageContrast,
      colorIssues: contrastIssues.violations,
      textSize: averageTextSize,
      motionCompliance
    };
  }

  private async checkColorContrast(): Promise<{averageRatio: number, violations: number}> {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
    let totalRatio = 0;
    let violations = 0;
    let validElements = 0;

    for (const element of textElements) {
      const style = window.getComputedStyle(element);
      const textColor = style.color;
      const backgroundColor = style.backgroundColor;

      if (textColor && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const ratio = this.calculateContrastRatio(textColor, backgroundColor);

        if (ratio > 0) {
          totalRatio += ratio;
          validElements++;

          if (ratio < this.thresholds.minContrastRatio) {
            violations++;
          }
        }
      }
    }

    return {
      averageRatio: validElements > 0 ? totalRatio / validElements : 0,
      violations
    };
  }

  private calculateContrastRatio(foreground: string, background: string): number {
    // Simplified contrast calculation - in practice, would use a proper color library
    try {
      const fgLuminance = this.getLuminance(foreground);
      const bgLuminance = this.getLuminance(background);

      const lighter = Math.max(fgLuminance, bgLuminance);
      const darker = Math.min(fgLuminance, bgLuminance);

      return (lighter + 0.05) / (darker + 0.05);
    } catch (error) {
      return 0;
    }
  }

  private getLuminance(color: string): number {
    // Very simplified luminance calculation
    // In practice, would use a proper color parsing library
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0;

    const [r, g, b] = rgb.map(Number);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  private checkMotionCompliance(): boolean {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check if animations respect the preference
    const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"]');

    if (prefersReducedMotion && animatedElements.length > 0) {
      // Check if animations are disabled or reduced
      return Array.from(animatedElements).every(element => {
        const style = window.getComputedStyle(element);
        return style.animationDuration === '0s' || style.transitionDuration === '0s';
      });
    }

    return true;
  }

  private auditPhotographyMetaphors(): AccessibilityMetrics['photography'] {
    // Check for photography metaphor explanations
    const ariaLabels = document.querySelectorAll('[aria-label]');
    let metaphorExplanations = 0;
    let alternativeDescriptions = 0;

    ariaLabels.forEach(element => {
      const label = element.getAttribute('aria-label') || '';

      // Check for photography terms with explanations
      if (this.containsPhotographyTerms(label)) {
        if (this.hasMetaphorExplanation(label)) {
          metaphorExplanations++;
        }
      }

      // Check for alternative descriptions
      if (element.hasAttribute('data-alt-description')) {
        alternativeDescriptions++;
      }
    });

    // Check for photography terminology consistency
    const consistencyScore = this.evaluatePhotographyConsistency();

    return {
      metaphorExplanations,
      alternativeDescriptions,
      consistencyScore
    };
  }

  private containsPhotographyTerms(text: string): boolean {
    const photographyTerms = ['pan', 'tilt', 'zoom', 'focus', 'aperture', 'shutter', 'lens', 'camera'];
    return photographyTerms.some(term =>
      text.toLowerCase().includes(term.toLowerCase())
    );
  }

  private hasMetaphorExplanation(text: string): boolean {
    const explanationKeywords = ['like', 'similar to', 'camera', 'photography', 'view', 'move'];
    return explanationKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private evaluatePhotographyConsistency(): number {
    // Check for consistent use of photography terminology
    const buttons = document.querySelectorAll('button');
    const photographyButtons = Array.from(buttons).filter(button =>
      this.containsPhotographyTerms(button.textContent || button.getAttribute('aria-label') || '')
    );

    if (photographyButtons.length === 0) return 100;

    // Check for consistent patterns
    const hasConsistentLabeling = photographyButtons.every(button => {
      const label = button.getAttribute('aria-label');
      return label && this.hasMetaphorExplanation(label);
    });

    return hasConsistentLabeling ? 100 : 50;
  }

  private setupAccessibilityObservers(): void {
    // Monitor focus changes
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      this.focusHistory.push(target);

      // Keep only recent focus history
      if (this.focusHistory.length > 50) {
        this.focusHistory.shift();
      }

      // Check for focus indicator
      this.validateFocusIndicator(target);
    });

    // Monitor ARIA live region updates
    const liveRegions = document.querySelectorAll('[aria-live]');
    liveRegions.forEach(region => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const content = (mutation.target as Element).textContent;
            if (content && content.trim()) {
              this.announcements.push(content.trim());

              // Keep only recent announcements
              if (this.announcements.length > 100) {
                this.announcements.shift();
              }
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

  private validateFocusIndicator(element: HTMLElement): void {
    const style = window.getComputedStyle(element);
    const hasVisibleFocus = (
      style.outline !== 'none' &&
      style.outlineWidth !== '0px'
    ) || style.boxShadow.includes('inset');

    if (!hasVisibleFocus) {
      const violation: AccessibilityViolation = {
        type: 'visual',
        severity: 'moderate',
        rule: 'focus-indicator',
        element,
        description: 'Element lacks visible focus indicator',
        impact: 'Users navigating with keyboard cannot see current focus',
        suggestion: 'Add visible outline or box-shadow for focused state'
      };

      this.violations.push(violation);
    }
  }

  private startDOMMonitoring(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // Check new elements for accessibility issues
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.validateNewElement(node as HTMLElement);
            }
          });
        }
      });
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private validateNewElement(element: HTMLElement): void {
    // Check for missing alt text on images
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      this.violations.push({
        type: 'content',
        severity: 'serious',
        rule: 'img-alt',
        element,
        description: 'Image missing alt text',
        impact: 'Screen readers cannot describe image content',
        suggestion: 'Add descriptive alt attribute to image'
      });
    }

    // Check for buttons without accessible names
    if (element.tagName === 'BUTTON' && !this.hasAccessibleName(element)) {
      this.violations.push({
        type: 'content',
        severity: 'serious',
        rule: 'button-name',
        element,
        description: 'Button lacks accessible name',
        impact: 'Screen readers cannot identify button purpose',
        suggestion: 'Add aria-label, textContent, or aria-labelledby'
      });
    }
  }

  private hasAccessibleName(element: HTMLElement): boolean {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      element.getAttribute('title')
    );
  }

  private bindKeyboardListeners(): void {
    document.addEventListener('keydown', (event) => {
      // Track keyboard usage patterns
      this.trackKeyboardUsage(event);
    });
  }

  private bindScreenReaderListeners(): void {
    // Listen for screen reader detection
    if ('speechSynthesis' in window) {
      // Basic screen reader presence detection
      const detection = setInterval(() => {
        if (speechSynthesis.getVoices().length > 0) {
          clearInterval(detection);
          this.handleScreenReaderDetected();
        }
      }, 100);

      setTimeout(() => clearInterval(detection), 5000);
    }
  }

  private trackKeyboardUsage(event: KeyboardEvent): void {
    // Track Tab usage for navigation assessment
    if (event.key === 'Tab') {
      // Tab navigation detected
    }

    // Track Arrow key usage for spatial navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      // Spatial navigation detected
    }
  }

  private handleScreenReaderDetected(): void {
    console.log('Screen reader capabilities detected');
    // Could trigger enhanced accessibility mode
  }

  private evaluateCompliance(metrics: AccessibilityMetrics): void {
    const issues: string[] = [];

    // Check WCAG compliance
    if (metrics.wcagCompliance.score < this.thresholds.minWcagScore) {
      issues.push(`WCAG compliance below threshold: ${metrics.wcagCompliance.score}% (required: ${this.thresholds.minWcagScore}%)`);
    }

    // Check screen reader response time
    if (metrics.screenReader.responseTime > this.thresholds.maxResponseTime) {
      issues.push(`Screen reader response time too high: ${metrics.screenReader.responseTime}ms (max: ${this.thresholds.maxResponseTime}ms)`);
    }

    // Check contrast ratio
    if (metrics.visual.contrastRatio < this.thresholds.minContrastRatio) {
      issues.push(`Contrast ratio below WCAG AA: ${metrics.visual.contrastRatio} (required: ${this.thresholds.minContrastRatio})`);
    }

    // Check keyboard navigation
    if (metrics.keyboard.navigationScore < this.thresholds.minKeyboardScore) {
      issues.push(`Keyboard navigation score low: ${metrics.keyboard.navigationScore}% (required: ${this.thresholds.minKeyboardScore}%)`);
    }

    // Check photography metaphor accessibility
    if (metrics.photography.consistencyScore < this.thresholds.minPhotographyScore) {
      issues.push(`Photography metaphor accessibility low: ${metrics.photography.consistencyScore}% (required: ${this.thresholds.minPhotographyScore}%)`);
    }

    // Trigger alerts for issues
    if (issues.length > 0) {
      this.triggerAccessibilityAlert({
        type: 'compliance_issues',
        severity: 'moderate',
        issues,
        metrics
      });
    }
  }

  private async triggerAccessibilityAlert(alert: any): Promise<void> {
    console.warn('♿ Accessibility compliance issue:', alert);

    // Send to monitoring endpoints if configured
    if (process.env.ACCESSIBILITY_WEBHOOK_URL) {
      try {
        await fetch(process.env.ACCESSIBILITY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...alert,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          })
        });
      } catch (error) {
        console.error('Failed to send accessibility alert:', error);
      }
    }
  }

  private mapAxeSeverity(impact: string): AccessibilityViolation['severity'] {
    const mapping: Record<string, AccessibilityViolation['severity']> = {
      'minor': 'minor',
      'moderate': 'moderate',
      'serious': 'serious',
      'critical': 'critical'
    };

    return mapping[impact] || 'moderate';
  }

  private isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  // Public API
  getCurrentMetrics(): AccessibilityMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getViolations(): AccessibilityViolation[] {
    return [...this.violations];
  }

  getComplianceReport(): object {
    const currentMetrics = this.getCurrentMetrics();
    const recentViolations = this.violations.slice(-20);

    return {
      current: currentMetrics,
      thresholds: this.thresholds,
      violations: recentViolations,
      summary: {
        wcagLevel: currentMetrics?.wcagCompliance.level || 'Unknown',
        overallScore: this.calculateOverallScore(currentMetrics),
        criticalIssues: recentViolations.filter(v => v.severity === 'critical').length,
        monitoringStatus: this.isMonitoring
      }
    };
  }

  private calculateOverallScore(metrics: AccessibilityMetrics | null): number {
    if (!metrics) return 0;

    return Math.round((
      metrics.wcagCompliance.score * 0.4 +
      metrics.keyboard.navigationScore * 0.2 +
      (metrics.visual.contrastRatio >= this.thresholds.minContrastRatio ? 100 : 0) * 0.2 +
      metrics.photography.consistencyScore * 0.2
    ));
  }

  updateThresholds(newThresholds: Partial<AccessibilityThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
}

export default AccessibilityMonitor;
export type { AccessibilityMetrics, AccessibilityViolation, AccessibilityThresholds };