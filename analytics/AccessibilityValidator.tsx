/**
 * Accessibility Compliance Validator
 *
 * Real-time accessibility validation for progressive content disclosure,
 * ensuring WCAG 2.1 AA compliance across all content levels and user interactions.
 *
 * Task 11: User Experience Validation - Accessibility Compliance
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { ContentLevel } from '../types/section-content';
import { useUserJourney } from './UserJourneyAnalytics';

// ============================================================================
// ACCESSIBILITY INTERFACES
// ============================================================================

export type AccessibilityIssueLevel = 'error' | 'warning' | 'info';
export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type WCAGCriterion =
  | '1.1.1' | '1.2.1' | '1.2.2' | '1.2.3' | '1.3.1' | '1.3.2' | '1.3.3'
  | '1.4.1' | '1.4.2' | '1.4.3' | '1.4.4' | '1.4.5' | '1.4.6' | '1.4.10'
  | '2.1.1' | '2.1.2' | '2.1.4' | '2.2.1' | '2.2.2' | '2.4.1' | '2.4.2'
  | '2.4.3' | '2.4.4' | '2.4.5' | '2.4.6' | '2.4.7' | '3.1.1' | '3.1.2'
  | '3.2.1' | '3.2.2' | '3.3.1' | '3.3.2' | '4.1.1' | '4.1.2' | '4.1.3';

export interface AccessibilityIssue {
  id: string;
  timestamp: number;
  level: AccessibilityIssueLevel;
  wcagCriterion: WCAGCriterion;
  wcagLevel: WCAGLevel;
  title: string;
  description: string;
  element?: Element;
  selector?: string;
  context: {
    section: string;
    contentLevel: ContentLevel;
    userAgent: string;
    viewport: { width: number; height: number };
  };
  suggestedFix?: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
}

export interface AccessibilityReport {
  timestamp: number;
  overallScore: number; // 0-100
  wcagLevel: WCAGLevel;
  issueCount: {
    error: number;
    warning: number;
    info: number;
  };
  issues: AccessibilityIssue[];
  compliance: {
    [key in WCAGCriterion]?: {
      passes: boolean;
      issues: AccessibilityIssue[];
    };
  };
  recommendations: string[];
}

export interface AccessibilityMetrics {
  keyboardNavigation: {
    tabSequenceValid: boolean;
    focusIndicatorVisible: boolean;
    skipLinksPresent: boolean;
    accessKeysConflictFree: boolean;
  };
  colorContrast: {
    textPassesAA: boolean;
    textPassesAAA: boolean;
    largeTextPassesAA: boolean;
    nonTextPassesAA: boolean;
  };
  screenReader: {
    semanticStructure: boolean;
    ariaLabelsPresent: boolean;
    headingHierarchy: boolean;
    landmarkRoles: boolean;
  };
  contentAccessibility: {
    imagesHaveAltText: boolean;
    linksHaveDescription: boolean;
    formsHaveLabels: boolean;
    errorHandlingClear: boolean;
  };
}

// ============================================================================
// ACCESSIBILITY VALIDATOR CLASS
// ============================================================================

class AccessibilityValidator {
  private issues: AccessibilityIssue[] = [];
  private observer: MutationObserver | null = null;

  constructor() {
    this.setupObserver();
  }

  // ============================================================================
  // COLOR CONTRAST VALIDATION
  // ============================================================================

  private getRGBFromElement(element: Element): [number, number, number] | null {
    const computed = window.getComputedStyle(element);
    const color = computed.color;

    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return null;

    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }

  private getBackgroundColor(element: Element): [number, number, number] {
    let currentElement: Element | null = element;

    while (currentElement) {
      const computed = window.getComputedStyle(currentElement);
      const bgColor = computed.backgroundColor;

      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
          return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
        }
      }

      currentElement = currentElement.parentElement;
    }

    return [255, 255, 255]; // Default to white
  }

  private calculateLuminance(r: number, g: number, b: number): number {
    const [rNorm, gNorm, bNorm] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
  }

  private calculateContrastRatio(foreground: [number, number, number], background: [number, number, number]): number {
    const fgLuminance = this.calculateLuminance(...foreground);
    const bgLuminance = this.calculateLuminance(...background);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private validateColorContrast(element: Element, context: AccessibilityIssue['context']): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    const foregroundColor = this.getRGBFromElement(element);
    if (!foregroundColor) return issues;

    const backgroundColor = this.getBackgroundColor(element);
    const contrastRatio = this.calculateContrastRatio(foregroundColor, backgroundColor);

    const computed = window.getComputedStyle(element);
    const fontSize = parseFloat(computed.fontSize);
    const fontWeight = computed.fontWeight;

    const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));

    const requiredRatio = isLargeText ? 3 : 4.5;
    const aaaRatio = isLargeText ? 4.5 : 7;

    if (contrastRatio < requiredRatio) {
      issues.push({
        id: `contrast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        level: 'error',
        wcagCriterion: '1.4.3',
        wcagLevel: 'AA',
        title: 'Insufficient Color Contrast',
        description: `Text contrast ratio is ${contrastRatio.toFixed(2)}:1, but must be at least ${requiredRatio}:1`,
        element,
        selector: this.getElementSelector(element),
        context,
        suggestedFix: 'Increase contrast by adjusting text or background colors',
        impact: 'serious'
      });
    } else if (contrastRatio < aaaRatio) {
      issues.push({
        id: `contrast-aaa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        level: 'warning',
        wcagCriterion: '1.4.6',
        wcagLevel: 'AAA',
        title: 'AAA Color Contrast Not Met',
        description: `Text contrast ratio is ${contrastRatio.toFixed(2)}:1, but AAA level requires ${aaaRatio}:1`,
        element,
        selector: this.getElementSelector(element),
        context,
        suggestedFix: 'Consider improving contrast for AAA compliance',
        impact: 'minor'
      });
    }

    return issues;
  }

  // ============================================================================
  // KEYBOARD NAVIGATION VALIDATION
  // ============================================================================

  private validateKeyboardNavigation(context: AccessibilityIssue['context']): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for focusable elements without visible focus indicators
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      const computed = window.getComputedStyle(element, ':focus');
      const outline = computed.outline;
      const outlineWidth = computed.outlineWidth;
      const boxShadow = computed.boxShadow;

      if (outline === 'none' && outlineWidth === '0px' && !boxShadow.includes('rgb')) {
        issues.push({
          id: `focus-indicator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          level: 'error',
          wcagCriterion: '2.4.7',
          wcagLevel: 'AA',
          title: 'Missing Focus Indicator',
          description: 'Focusable element lacks visible focus indicator',
          element,
          selector: this.getElementSelector(element),
          context,
          suggestedFix: 'Add visible focus outline or box-shadow on :focus',
          impact: 'serious'
        });
      }
    });

    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"], a[href*="skip"]');
    if (skipLinks.length === 0) {
      issues.push({
        id: `skip-links-${Date.now()}`,
        timestamp: Date.now(),
        level: 'warning',
        wcagCriterion: '2.4.1',
        wcagLevel: 'A',
        title: 'Missing Skip Links',
        description: 'No skip navigation links found',
        context,
        suggestedFix: 'Add skip to main content link at beginning of page',
        impact: 'moderate'
      });
    }

    return issues;
  }

  // ============================================================================
  // ARIA AND SEMANTIC VALIDATION
  // ============================================================================

  private validateARIA(element: Element, context: AccessibilityIssue['context']): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for images without alt text
    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement;
      if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
        issues.push({
          id: `missing-alt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          level: 'error',
          wcagCriterion: '1.1.1',
          wcagLevel: 'A',
          title: 'Missing Alternative Text',
          description: 'Image lacks alternative text',
          element,
          selector: this.getElementSelector(element),
          context,
          suggestedFix: 'Add meaningful alt attribute or aria-label',
          impact: 'serious'
        });
      }
    }

    // Check for buttons without accessible names
    if (element.tagName === 'BUTTON') {
      const button = element as HTMLButtonElement;
      const hasText = button.textContent?.trim();
      const hasAriaLabel = button.getAttribute('aria-label');
      const hasAriaLabelledBy = button.getAttribute('aria-labelledby');

      if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push({
          id: `button-no-name-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          level: 'error',
          wcagCriterion: '4.1.2',
          wcagLevel: 'A',
          title: 'Button Without Accessible Name',
          description: 'Button lacks accessible name',
          element,
          selector: this.getElementSelector(element),
          context,
          suggestedFix: 'Add text content, aria-label, or aria-labelledby',
          impact: 'serious'
        });
      }
    }

    // Check for form inputs without labels
    if (element.tagName === 'INPUT' && (element as HTMLInputElement).type !== 'hidden') {
      const input = element as HTMLInputElement;
      const hasLabel = document.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push({
          id: `input-no-label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          level: 'error',
          wcagCriterion: '3.3.2',
          wcagLevel: 'A',
          title: 'Form Input Without Label',
          description: 'Form input lacks associated label',
          element,
          selector: this.getElementSelector(element),
          context,
          suggestedFix: 'Associate with label element or add aria-label',
          impact: 'serious'
        });
      }
    }

    return issues;
  }

  // ============================================================================
  // HEADING HIERARCHY VALIDATION
  // ============================================================================

  private validateHeadingHierarchy(context: AccessibilityIssue['context']): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    let previousLevel = 0;
    let hasH1 = false;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (level === 1) hasH1 = true;

      if (index === 0 && level !== 1) {
        issues.push({
          id: `heading-start-${Date.now()}`,
          timestamp: Date.now(),
          level: 'warning',
          wcagCriterion: '1.3.1',
          wcagLevel: 'A',
          title: 'Page Should Start with H1',
          description: 'Page should begin with an h1 heading',
          element: heading,
          selector: this.getElementSelector(heading),
          context,
          suggestedFix: 'Start page with h1 heading',
          impact: 'moderate'
        });
      }

      if (level > previousLevel + 1) {
        issues.push({
          id: `heading-skip-${Date.now()}-${index}`,
          timestamp: Date.now(),
          level: 'warning',
          wcagCriterion: '1.3.1',
          wcagLevel: 'A',
          title: 'Heading Level Skipped',
          description: `Heading jumps from h${previousLevel} to h${level}`,
          element: heading,
          selector: this.getElementSelector(heading),
          context,
          suggestedFix: 'Use consecutive heading levels',
          impact: 'moderate'
        });
      }

      previousLevel = level;
    });

    if (!hasH1) {
      issues.push({
        id: `no-h1-${Date.now()}`,
        timestamp: Date.now(),
        level: 'error',
        wcagCriterion: '1.3.1',
        wcagLevel: 'A',
        title: 'No H1 Heading Found',
        description: 'Page lacks main h1 heading',
        context,
        suggestedFix: 'Add h1 heading as page title',
        impact: 'serious'
      });
    }

    return issues;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;

    let selector = element.tagName.toLowerCase();
    const parent = element.parentElement;

    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      if (siblings.length > 1) {
        selector += `:nth-child(${index + 1})`;
      }
    }

    return selector;
  }

  private setupObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.validateElement(node as Element);
            }
          });
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ============================================================================
  // PUBLIC VALIDATION METHODS
  // ============================================================================

  public validateElement(element: Element, section = 'unknown', contentLevel = ContentLevel.SUMMARY): AccessibilityIssue[] {
    const context: AccessibilityIssue['context'] = {
      section,
      contentLevel,
      userAgent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight }
    };

    const issues: AccessibilityIssue[] = [
      ...this.validateColorContrast(element, context),
      ...this.validateARIA(element, context)
    ];

    this.issues.push(...issues);
    return issues;
  }

  public validatePage(section = 'unknown', contentLevel = ContentLevel.SUMMARY): AccessibilityReport {
    const context: AccessibilityIssue['context'] = {
      section,
      contentLevel,
      userAgent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight }
    };

    this.issues = []; // Reset issues

    // Validate all text elements for contrast
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a, label');
    textElements.forEach(element => {
      this.issues.push(...this.validateColorContrast(element, context));
      this.issues.push(...this.validateARIA(element, context));
    });

    // Validate keyboard navigation
    this.issues.push(...this.validateKeyboardNavigation(context));

    // Validate heading hierarchy
    this.issues.push(...this.validateHeadingHierarchy(context));

    const issueCount = {
      error: this.issues.filter(i => i.level === 'error').length,
      warning: this.issues.filter(i => i.level === 'warning').length,
      info: this.issues.filter(i => i.level === 'info').length
    };

    const totalIssues = issueCount.error + issueCount.warning + issueCount.info;
    const overallScore = Math.max(0, 100 - (issueCount.error * 10 + issueCount.warning * 5 + issueCount.info * 1));

    return {
      timestamp: Date.now(),
      overallScore,
      wcagLevel: issueCount.error === 0 ? 'AA' : 'A',
      issueCount,
      issues: this.issues,
      compliance: {},
      recommendations: this.generateRecommendations()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.issues.some(i => i.wcagCriterion === '1.4.3')) {
      recommendations.push('Improve color contrast ratios for better readability');
    }

    if (this.issues.some(i => i.wcagCriterion === '2.4.7')) {
      recommendations.push('Add visible focus indicators for keyboard navigation');
    }

    if (this.issues.some(i => i.wcagCriterion === '1.1.1')) {
      recommendations.push('Provide alternative text for all images');
    }

    if (this.issues.some(i => i.wcagCriterion === '1.3.1')) {
      recommendations.push('Maintain proper heading hierarchy');
    }

    return recommendations;
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// ============================================================================
// REACT HOOK
// ============================================================================

export const useAccessibilityValidator = (section: string, contentLevel: ContentLevel) => {
  const [validator] = useState(() => new AccessibilityValidator());
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { trackAccessibility } = useUserJourney();

  const validatePage = useCallback(async () => {
    setIsValidating(true);

    // Small delay to ensure DOM is stable
    await new Promise(resolve => setTimeout(resolve, 100));

    const newReport = validator.validatePage(section, contentLevel);
    setReport(newReport);

    // Track accessibility metrics
    trackAccessibility({
      screenReaderActive: !!window.speechSynthesis?.speaking,
      keyboardNavigation: document.activeElement?.tagName !== 'BODY',
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      focusMethod: 'programmatic'
    });

    setIsValidating(false);
    return newReport;
  }, [validator, section, contentLevel, trackAccessibility]);

  const validateElement = useCallback((element: Element) => {
    return validator.validateElement(element, section, contentLevel);
  }, [validator, section, contentLevel]);

  useEffect(() => {
    validatePage();
  }, [validatePage]);

  useEffect(() => {
    return () => validator.destroy();
  }, [validator]);

  return {
    report,
    isValidating,
    validatePage,
    validateElement
  };
};

// ============================================================================
// ACCESSIBILITY INDICATOR COMPONENT
// ============================================================================

interface AccessibilityIndicatorProps {
  section: string;
  contentLevel: ContentLevel;
  showDetails?: boolean;
}

export const AccessibilityIndicator: React.FC<AccessibilityIndicatorProps> = ({
  section,
  contentLevel,
  showDetails = false
}) => {
  const { report, isValidating, validatePage } = useAccessibilityValidator(section, contentLevel);

  if (!report || isValidating) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        Checking accessibility...
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '✅';
    if (score >= 70) return '⚠️';
    return '❌';
  };

  return (
    <div className="accessibility-indicator">
      <div className="flex items-center gap-2 text-sm">
        <span>{getScoreIcon(report.overallScore)}</span>
        <span style={{ color: getScoreColor(report.overallScore) }}>
          A11y: {report.overallScore}/100 (WCAG {report.wcagLevel})
        </span>
        <button
          onClick={validatePage}
          className="text-blue-500 hover:text-blue-700 text-xs"
        >
          Recheck
        </button>
      </div>

      {showDetails && report.issues.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 rounded border text-xs">
          <div className="mb-2">
            <strong>Issues Found:</strong> {report.issueCount.error} errors, {report.issueCount.warning} warnings
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {report.issues.slice(0, 3).map(issue => (
              <div key={issue.id} className="text-gray-600">
                <span className={issue.level === 'error' ? 'text-red-600' : 'text-yellow-600'}>
                  {issue.level === 'error' ? '❌' : '⚠️'}
                </span>
                {' '}{issue.title}
              </div>
            ))}
            {report.issues.length > 3 && (
              <div className="text-gray-500">...and {report.issues.length - 3} more</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityValidator;