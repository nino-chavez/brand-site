import { useEffect, useCallback, useRef, useState } from 'react';
import type { GameFlowSection } from '../types';

interface AccessibilityConfig {
    enableScreenReader: boolean;
    enableKeyboardNavigation: boolean;
    enableReducedMotion: boolean;
    enableHighContrast: boolean;
    focusManagement: boolean;
    announceChanges: boolean;
    debugMode: boolean;
}

interface AccessibilityState {
    screenReaderActive: boolean;
    reducedMotionPreferred: boolean;
    highContrastEnabled: boolean;
    keyboardNavigationActive: boolean;
    currentFocus: string | null;
    lastAnnouncement: string | null;
}

interface FocusManagement {
    trapFocus: (element: HTMLElement) => () => void;
    moveFocusToSection: (section: GameFlowSection) => void;
    restoreFocus: () => void;
    getCurrentFocusable: () => HTMLElement | null;
}

const DEFAULT_CONFIG: AccessibilityConfig = {
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableReducedMotion: true,
    enableHighContrast: true,
    focusManagement: true,
    announceChanges: true,
    debugMode: false
};

// ARIA live region for announcements
const LIVE_REGION_ID = 'game-flow-announcements';

// Section descriptions for screen readers
const SECTION_DESCRIPTIONS: Record<GameFlowSection, string> = {
    capture: 'Hero section - Introduction and technical readiness. Navigate to learn about professional background.',
    focus: 'About section - Detailed expertise and technical focus areas. Discover skills and experience.',
    frame: 'Projects section - Portfolio of work and technical achievements. Explore completed projects.',
    exposure: 'Insights section - Technical articles and professional insights. Read about technology perspectives.',
    develop: 'Gallery section - Visual portfolio and photography work. View creative and technical projects.',
    portfolio: 'Contact section - Professional collaboration opportunities. Connect for project discussions.'
};

// Keyboard shortcuts
const KEYBOARD_SHORTCUTS: Record<string, string> = {
    'ArrowDown': 'Navigate to next section',
    'ArrowUp': 'Navigate to previous section',
    'Home': 'Go to first section',
    'End': 'Go to last section',
    'Space': 'Activate current element',
    'Enter': 'Navigate to section or activate element',
    'Escape': 'Exit current interaction or return to main navigation',
    '1': 'Go to Capture section',
    '2': 'Go to Focus section',
    '3': 'Go to Frame section',
    '4': 'Go to Exposure section',
    '5': 'Go to Develop section',
    '6': 'Go to Portfolio section'
};

class AccessibilityManager {
    private config: AccessibilityConfig;
    private liveRegion: HTMLElement | null = null;
    private lastFocusedElement: HTMLElement | null = null;
    private focusHistory: HTMLElement[] = [];
    private mediaQueries: { [key: string]: MediaQueryList } = {};

    constructor(config: AccessibilityConfig) {
        this.config = config;
        this.setupAccessibilityFeatures();
    }

    private setupAccessibilityFeatures(): void {
        this.createLiveRegion();
        this.setupMediaQueryListeners();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();

        if (this.config.debugMode) {
            console.log('Accessibility features initialized:', this.config);
        }
    }

    private createLiveRegion(): void {
        if (!this.config.announceChanges || document.getElementById(LIVE_REGION_ID)) return;

        this.liveRegion = document.createElement('div');
        this.liveRegion.id = LIVE_REGION_ID;
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;

        document.body.appendChild(this.liveRegion);
    }

    private setupMediaQueryListeners(): void {
        // Reduced motion preference
        this.mediaQueries.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.mediaQueries.reducedMotion.addListener(this.handleMediaQueryChange.bind(this));

        // High contrast preference
        this.mediaQueries.highContrast = window.matchMedia('(prefers-contrast: high)');
        this.mediaQueries.highContrast.addListener(this.handleMediaQueryChange.bind(this));

        // Color scheme preference
        this.mediaQueries.colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQueries.colorScheme.addListener(this.handleMediaQueryChange.bind(this));
    }

    private handleMediaQueryChange(event: MediaQueryListEvent): void {
        if (event.media.includes('prefers-reduced-motion')) {
            this.handleReducedMotion(event.matches);
        } else if (event.media.includes('prefers-contrast')) {
            this.handleHighContrast(event.matches);
        } else if (event.media.includes('prefers-color-scheme')) {
            this.handleColorScheme(event.matches);
        }
    }

    private setupKeyboardNavigation(): void {
        if (!this.config.enableKeyboardNavigation) return;

        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

        // Add skip links
        this.addSkipLinks();
    }

    private setupFocusManagement(): void {
        if (!this.config.focusManagement) return;

        // Track focus changes
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));

        // Handle page visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    private handleKeyboardNavigation(event: KeyboardEvent): void {
        const { key, altKey, ctrlKey, metaKey, shiftKey } = event;

        // Don't interfere with browser shortcuts or form inputs
        if (altKey || ctrlKey || metaKey || this.isFormElement(event.target as Element)) {
            return;
        }

        const callback = this.getNavigationCallback();

        if (!callback) return;

        switch (key) {
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                callback('next');
                break;

            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                callback('previous');
                break;

            case 'Home':
                event.preventDefault();
                callback('first');
                break;

            case 'End':
                event.preventDefault();
                callback('last');
                break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                if (!shiftKey) {
                    event.preventDefault();
                    const sections: GameFlowSection[] = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];
                    const sectionIndex = parseInt(key) - 1;
                    if (sectionIndex >= 0 && sectionIndex < sections.length) {
                        callback(sections[sectionIndex]);
                    }
                }
                break;

            case '?':
                if (shiftKey) {
                    event.preventDefault();
                    this.showKeyboardShortcuts();
                }
                break;
        }
    }

    private isFormElement(element: Element | null): boolean {
        if (!element) return false;

        const formElements = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
        return formElements.includes(element.tagName) || element.getAttribute('contenteditable') === 'true';
    }

    private navigationCallback: ((direction: string | GameFlowSection) => void) | null = null;

    private getNavigationCallback() {
        return this.navigationCallback;
    }

    setNavigationCallback(callback: (direction: string | GameFlowSection) => void): void {
        this.navigationCallback = callback;
    }

    private handleFocusIn(event: FocusEvent): void {
        const target = event.target as HTMLElement;

        if (target && target !== this.lastFocusedElement) {
            this.lastFocusedElement = target;
            this.focusHistory.push(target);

            // Keep only last 10 focus states
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }

            if (this.config.debugMode) {
                console.log('Focus moved to:', target);
            }
        }
    }

    private handleFocusOut(event: FocusEvent): void {
        // Handle focus lost
        if (this.config.debugMode) {
            console.log('Focus left:', event.target);
        }
    }

    private handleVisibilityChange(): void {
        if (document.hidden) {
            // Store current focus when page becomes hidden
            this.lastFocusedElement = document.activeElement as HTMLElement;
        } else {
            // Restore focus when page becomes visible again
            if (this.lastFocusedElement && document.body.contains(this.lastFocusedElement)) {
                this.lastFocusedElement.focus();
            }
        }
    }

    private addSkipLinks(): void {
        const skipLinksContainer = document.createElement('div');
        skipLinksContainer.className = 'skip-links';
        skipLinksContainer.style.cssText = `
            position: absolute;
            left: -10000px;
            top: 0;
            z-index: 10000;
            background: white;
            padding: 8px;
            border: 2px solid #000;
        `;

        const skipToMain = document.createElement('a');
        skipToMain.href = '#capture';
        skipToMain.textContent = 'Skip to main content';
        skipToMain.addEventListener('focus', () => {
            skipLinksContainer.style.left = '0';
        });
        skipToMain.addEventListener('blur', () => {
            skipLinksContainer.style.left = '-10000px';
        });

        skipLinksContainer.appendChild(skipToMain);
        document.body.insertBefore(skipLinksContainer, document.body.firstChild);
    }

    private showKeyboardShortcuts(): void {
        const shortcuts = Object.entries(KEYBOARD_SHORTCUTS)
            .map(([key, description]) => `${key}: ${description}`)
            .join('\n');

        this.announce(`Keyboard shortcuts available: ${shortcuts}`);
    }

    announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
        if (!this.config.announceChanges || !this.liveRegion) return;

        // Update aria-live priority
        this.liveRegion.setAttribute('aria-live', priority);

        // Clear and set new message
        this.liveRegion.textContent = '';
        setTimeout(() => {
            if (this.liveRegion) {
                this.liveRegion.textContent = message;
            }
        }, 100);

        if (this.config.debugMode) {
            console.log(`Announced (${priority}):`, message);
        }
    }

    announceSectionChange(section: GameFlowSection): void {
        const description = SECTION_DESCRIPTIONS[section];
        this.announce(`Navigated to ${section} section. ${description}`);
    }

    private handleReducedMotion(prefersReduced: boolean): void {
        if (!this.config.enableReducedMotion) return;

        document.body.setAttribute('data-reduced-motion', prefersReduced.toString());

        if (prefersReduced) {
            this.announce('Reduced motion mode activated for better accessibility');
        }
    }

    private handleHighContrast(prefersHighContrast: boolean): void {
        if (!this.config.enableHighContrast) return;

        document.body.setAttribute('data-high-contrast', prefersHighContrast.toString());

        if (prefersHighContrast) {
            this.announce('High contrast mode activated for better visibility');
        }
    }

    private handleColorScheme(prefersDark: boolean): void {
        document.body.setAttribute('data-color-scheme', prefersDark ? 'dark' : 'light');
    }

    trapFocus(container: HTMLElement): () => void {
        const focusableElements = this.getFocusableElements(container);

        if (focusableElements.length === 0) return () => {};

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                // Shift + Tab - going backwards
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab - going forwards
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        // Focus first element
        firstElement.focus();

        // Return cleanup function
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }

    private getFocusableElements(container: HTMLElement): HTMLElement[] {
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];

        return Array.from(
            container.querySelectorAll(focusableSelectors.join(', '))
        ).filter(element => {
            return element.offsetParent !== null; // Visible elements only
        }) as HTMLElement[];
    }

    moveFocusToSection(section: GameFlowSection): void {
        const sectionElement = document.getElementById(section);

        if (!sectionElement) {
            console.warn(`Section element not found: ${section}`);
            return;
        }

        // Find first focusable element in section or focus section itself
        const focusableElements = this.getFocusableElements(sectionElement);
        const targetElement = focusableElements.length > 0 ? focusableElements[0] : sectionElement;

        // Make section focusable if it isn't already
        if (targetElement === sectionElement && !sectionElement.hasAttribute('tabindex')) {
            sectionElement.setAttribute('tabindex', '-1');
        }

        targetElement.focus();
    }

    restoreFocus(): void {
        if (this.focusHistory.length > 1) {
            // Get previous focus (current is at end of array)
            const previousFocus = this.focusHistory[this.focusHistory.length - 2];

            if (previousFocus && document.body.contains(previousFocus)) {
                previousFocus.focus();
                return;
            }
        }

        // Fallback to body
        document.body.focus();
    }

    getAccessibilityState(): AccessibilityState {
        return {
            screenReaderActive: this.isScreenReaderActive(),
            reducedMotionPreferred: this.mediaQueries.reducedMotion?.matches || false,
            highContrastEnabled: this.mediaQueries.highContrast?.matches || false,
            keyboardNavigationActive: this.lastFocusedElement !== null,
            currentFocus: this.lastFocusedElement?.tagName.toLowerCase() || null,
            lastAnnouncement: this.liveRegion?.textContent || null
        };
    }

    private isScreenReaderActive(): boolean {
        // Heuristic detection - not 100% reliable but useful
        return !!(
            this.liveRegion &&
            (window.navigator.userAgent.includes('NVDA') ||
             window.navigator.userAgent.includes('JAWS') ||
             window.speechSynthesis.getVoices().length > 0)
        );
    }

    destroy(): void {
        // Remove event listeners
        Object.values(this.mediaQueries).forEach(mq => {
            mq.removeListener(this.handleMediaQueryChange.bind(this));
        });

        document.removeEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        document.removeEventListener('focusin', this.handleFocusIn.bind(this));
        document.removeEventListener('focusout', this.handleFocusOut.bind(this));
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Remove live region
        if (this.liveRegion) {
            this.liveRegion.remove();
        }
    }
}

export function useAccessibility(config: Partial<AccessibilityConfig> = {}) {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const managerRef = useRef<AccessibilityManager>();
    const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
        screenReaderActive: false,
        reducedMotionPreferred: false,
        highContrastEnabled: false,
        keyboardNavigationActive: false,
        currentFocus: null,
        lastAnnouncement: null
    });

    // Initialize accessibility manager
    if (!managerRef.current) {
        managerRef.current = new AccessibilityManager(fullConfig);
    }

    const manager = managerRef.current;

    // Update accessibility state periodically
    useEffect(() => {
        const updateState = () => {
            setAccessibilityState(manager.getAccessibilityState());
        };

        updateState();

        const interval = setInterval(updateState, 2000);
        return () => clearInterval(interval);
    }, [manager]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (managerRef.current) {
                managerRef.current.destroy();
            }
        };
    }, []);

    const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
        manager.announce(message, priority);
    }, [manager]);

    const announceSectionChange = useCallback((section: GameFlowSection) => {
        manager.announceSectionChange(section);
    }, [manager]);

    const setNavigationCallback = useCallback((callback: (direction: string | GameFlowSection) => void) => {
        manager.setNavigationCallback(callback);
    }, [manager]);

    const focusManagement: FocusManagement = {
        trapFocus: useCallback((element: HTMLElement) => manager.trapFocus(element), [manager]),
        moveFocusToSection: useCallback((section: GameFlowSection) => manager.moveFocusToSection(section), [manager]),
        restoreFocus: useCallback(() => manager.restoreFocus(), [manager]),
        getCurrentFocusable: useCallback(() => manager['lastFocusedElement'] || null, [manager])
    };

    return {
        ...accessibilityState,
        announce,
        announceSectionChange,
        setNavigationCallback,
        focusManagement,
        keyboardShortcuts: KEYBOARD_SHORTCUTS,
        sectionDescriptions: SECTION_DESCRIPTIONS
    };
}