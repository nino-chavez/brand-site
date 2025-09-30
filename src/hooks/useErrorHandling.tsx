import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameFlowSection, GameFlowError } from '../types';

interface ErrorHandlingConfig {
    enableRecovery: boolean;
    maxRetryAttempts: number;
    retryDelay: number;
    logErrors: boolean;
    reportToService: boolean;
    gracefulDegradation: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
    retryCount: number;
}

interface RecoveryStrategy {
    type: 'retry' | 'fallback' | 'skip' | 'reload';
    message: string;
    action?: () => Promise<void>;
}

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorClassification {
    type: GameFlowError['type'];
    severity: ErrorSeverity;
    recoverable: boolean;
    strategy: RecoveryStrategy['type'];
}

const DEFAULT_CONFIG: ErrorHandlingConfig = {
    enableRecovery: true,
    maxRetryAttempts: 3,
    retryDelay: 1000,
    logErrors: true,
    reportToService: false,
    gracefulDegradation: true
};

// Error classification rules
const ERROR_CLASSIFICATIONS: Record<string, ErrorClassification> = {
    // Performance Errors
    'frame_rate_drop': {
        type: 'PERFORMANCE_ERROR',
        severity: 'medium',
        recoverable: true,
        strategy: 'fallback'
    },
    'load_time_exceeded': {
        type: 'PERFORMANCE_ERROR',
        severity: 'medium',
        recoverable: true,
        strategy: 'retry'
    },
    'memory_limit_exceeded': {
        type: 'PERFORMANCE_ERROR',
        severity: 'high',
        recoverable: true,
        strategy: 'fallback'
    },
    'core_web_vitals_failed': {
        type: 'PERFORMANCE_ERROR',
        severity: 'low',
        recoverable: true,
        strategy: 'skip'
    },

    // Interaction Errors
    'scroll_coordination_failed': {
        type: 'INTERACTION_ERROR',
        severity: 'medium',
        recoverable: true,
        strategy: 'fallback'
    },
    'transition_animation_failed': {
        type: 'INTERACTION_ERROR',
        severity: 'low',
        recoverable: true,
        strategy: 'fallback'
    },
    'keyboard_navigation_failed': {
        type: 'INTERACTION_ERROR',
        severity: 'medium',
        recoverable: true,
        strategy: 'retry'
    },
    'touch_gesture_failed': {
        type: 'INTERACTION_ERROR',
        severity: 'low',
        recoverable: true,
        strategy: 'skip'
    },

    // Content Errors
    'section_load_failed': {
        type: 'CONTENT_ERROR',
        severity: 'high',
        recoverable: true,
        strategy: 'retry'
    },
    'image_load_failed': {
        type: 'CONTENT_ERROR',
        severity: 'low',
        recoverable: true,
        strategy: 'fallback'
    },
    'api_request_failed': {
        type: 'CONTENT_ERROR',
        severity: 'medium',
        recoverable: true,
        strategy: 'retry'
    },
    'data_parsing_failed': {
        type: 'CONTENT_ERROR',
        severity: 'high',
        recoverable: false,
        strategy: 'fallback'
    }
};

class ErrorHandler {
    private config: ErrorHandlingConfig;
    private errorHistory: GameFlowError[] = [];
    private retryAttempts: Map<string, number> = new Map();
    private fallbackStates: Map<GameFlowSection, any> = new Map();

    constructor(config: ErrorHandlingConfig) {
        this.config = config;
        this.setupGlobalErrorHandlers();
    }

    private setupGlobalErrorHandlers(): void {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            const error = this.createGameFlowError(
                'CONTENT_ERROR',
                `Unhandled promise rejection: ${event.reason}`,
                undefined,
                true
            );

            this.handleError(error);

            // Prevent default browser error handling
            event.preventDefault();
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            const error = this.createGameFlowError(
                'INTERACTION_ERROR',
                `JavaScript error: ${event.message} at ${event.filename}:${event.lineno}`,
                undefined,
                true
            );

            this.handleError(error);
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                const error = this.createGameFlowError(
                    'CONTENT_ERROR',
                    `Resource loading failed: ${(event.target as any)?.src || 'unknown'}`,
                    undefined,
                    true
                );

                this.handleError(error);
            }
        }, true);
    }

    createGameFlowError(
        type: GameFlowError['type'],
        message: string,
        section?: GameFlowSection,
        recoverable: boolean = true
    ): GameFlowError {
        return {
            type,
            message,
            section,
            recoverable,
            timestamp: Date.now()
        };
    }

    handleError(error: GameFlowError): RecoveryStrategy {
        // Log error if enabled
        if (this.config.logErrors) {
            const timestamp = new Date(error.timestamp).toLocaleTimeString();
            const sectionInfo = error.section ? ` in section [${error.section}]` : '';
            const recoverable = error.recoverable ? 'recoverable' : 'non-recoverable';

            console.error(
                `Game Flow Error: [${error.type}]${sectionInfo} - ${error.message} (${recoverable}) at ${timestamp}`
            );
        }

        // Add to error history
        this.errorHistory.push(error);

        // Keep only last 50 errors
        if (this.errorHistory.length > 50) {
            this.errorHistory.shift();
        }

        // Report to service if enabled
        if (this.config.reportToService) {
            this.reportError(error);
        }

        // Determine recovery strategy
        const strategy = this.determineRecoveryStrategy(error);

        // Execute recovery if enabled
        if (this.config.enableRecovery && error.recoverable) {
            this.executeRecoveryStrategy(error, strategy);
        }

        return strategy;
    }

    private determineRecoveryStrategy(error: GameFlowError): RecoveryStrategy {
        // Find classification for this error type
        const errorKey = this.classifyError(error);
        const classification = ERROR_CLASSIFICATIONS[errorKey];

        if (!classification) {
            // Default fallback strategy
            return {
                type: 'fallback',
                message: 'An unexpected error occurred. Switching to basic mode.',
                action: async () => {
                    await this.enableGracefulDegradation();
                }
            };
        }

        const retryKey = `${error.type}_${error.section || 'global'}`;
        const currentRetries = this.retryAttempts.get(retryKey) || 0;

        switch (classification.strategy) {
            case 'retry':
                if (currentRetries < this.config.maxRetryAttempts) {
                    return {
                        type: 'retry',
                        message: `Retrying operation (attempt ${currentRetries + 1}/${this.config.maxRetryAttempts})...`,
                        action: async () => {
                            await this.delay(this.config.retryDelay);
                            this.incrementRetryCount(retryKey);
                        }
                    };
                }
                // Fall through to fallback if max retries exceeded

            case 'fallback':
                return {
                    type: 'fallback',
                    message: this.getFallbackMessage(classification.severity),
                    action: async () => {
                        await this.activateFallbackMode(error.section);
                    }
                };

            case 'skip':
                return {
                    type: 'skip',
                    message: 'Continuing without this feature...',
                    action: async () => {
                        // Skip this operation and continue
                    }
                };

            case 'reload':
                return {
                    type: 'reload',
                    message: 'Reloading page to recover from error...',
                    action: async () => {
                        await this.delay(2000); // Give user time to read message
                        window.location.reload();
                    }
                };

            default:
                return {
                    type: 'fallback',
                    message: 'Switching to safe mode...',
                    action: async () => {
                        await this.enableGracefulDegradation();
                    }
                };
        }
    }

    private classifyError(error: GameFlowError): string {
        // Simple classification based on error message keywords
        const message = error.message.toLowerCase();

        if (message.includes('frame rate') || message.includes('fps')) return 'frame_rate_drop';
        if (message.includes('load time') || message.includes('slow')) return 'load_time_exceeded';
        if (message.includes('memory') || message.includes('heap')) return 'memory_limit_exceeded';
        if (message.includes('scroll')) return 'scroll_coordination_failed';
        if (message.includes('transition') || message.includes('animation')) return 'transition_animation_failed';
        if (message.includes('keyboard')) return 'keyboard_navigation_failed';
        if (message.includes('touch') || message.includes('gesture')) return 'touch_gesture_failed';
        if (message.includes('section') || message.includes('component')) return 'section_load_failed';
        if (message.includes('image') || message.includes('img')) return 'image_load_failed';
        if (message.includes('api') || message.includes('request')) return 'api_request_failed';
        if (message.includes('parse') || message.includes('json')) return 'data_parsing_failed';

        return 'unknown_error';
    }

    private async executeRecoveryStrategy(error: GameFlowError, strategy: RecoveryStrategy): Promise<void> {
        try {
            if (strategy.action) {
                await strategy.action();
            }
        } catch (recoveryError) {
            console.error('Recovery strategy failed:', recoveryError);

            // If recovery fails, fall back to graceful degradation
            await this.enableGracefulDegradation();
        }
    }

    private async enableGracefulDegradation(): Promise<void> {
        if (!this.config.gracefulDegradation) return;

        // Disable advanced features for better stability
        this.disableAnimations();
        this.simplifyInteractions();
        this.enableHighContrastMode();
    }

    private disableAnimations(): void {
        // Add CSS to disable animations
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        style.setAttribute('data-game-flow-error-recovery', 'animations');
        document.head.appendChild(style);
    }

    private simplifyInteractions(): void {
        // Disable complex interactions, keep basic navigation
        document.body.setAttribute('data-game-flow-fallback-mode', 'true');
    }

    private enableHighContrastMode(): void {
        // Improve visibility for error states
        document.body.setAttribute('data-game-flow-high-contrast', 'true');
    }

    private async activateFallbackMode(section?: GameFlowSection): Promise<void> {
        if (section) {
            // Store current state before fallback
            const currentState = this.getCurrentSectionState(section);
            this.fallbackStates.set(section, currentState);

            // Activate simplified version of section
            this.loadFallbackContent(section);
        } else {
            // Global fallback mode
            await this.enableGracefulDegradation();
        }
    }

    private getCurrentSectionState(section: GameFlowSection): any {
        // Implementation would capture current section state
        return {
            section,
            timestamp: Date.now(),
            fallbackActivated: true
        };
    }

    private loadFallbackContent(section: GameFlowSection): void {
        // Implementation would load simplified content for the section
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.setAttribute('data-fallback-mode', 'true');
        }
    }

    private incrementRetryCount(retryKey: string): void {
        const current = this.retryAttempts.get(retryKey) || 0;
        this.retryAttempts.set(retryKey, current + 1);
    }

    private getFallbackMessage(severity: ErrorSeverity): string {
        switch (severity) {
            case 'low':
                return 'A minor issue occurred. Continuing with simplified experience.';
            case 'medium':
                return 'Switching to compatibility mode for better stability.';
            case 'high':
                return 'Activating safe mode to ensure continued functionality.';
            case 'critical':
                return 'Critical error detected. Operating in minimal mode.';
            default:
                return 'Adjusting experience for optimal performance.';
        }
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private reportError(error: GameFlowError): void {
        // Implementation would send error to monitoring service
        if (typeof window !== 'undefined' && 'navigator' in window && 'sendBeacon' in navigator) {
            const errorData = JSON.stringify({
                ...error,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            });

            navigator.sendBeacon('/api/errors', errorData);
        }
    }

    getErrorHistory(): GameFlowError[] {
        return [...this.errorHistory];
    }

    clearErrors(): void {
        this.errorHistory = [];
        this.retryAttempts.clear();
    }

    recoverFromError(section?: GameFlowSection): void {
        if (section && this.fallbackStates.has(section)) {
            // Restore from fallback state
            const fallbackState = this.fallbackStates.get(section);
            this.restoreSectionState(section, fallbackState);
            this.fallbackStates.delete(section);
        } else {
            // Global recovery
            this.removeRecoveryStyles();
            document.body.removeAttribute('data-game-flow-fallback-mode');
            document.body.removeAttribute('data-game-flow-high-contrast');
        }
    }

    private restoreSectionState(section: GameFlowSection, state: any): void {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.removeAttribute('data-fallback-mode');
        }
    }

    private removeRecoveryStyles(): void {
        const recoveryStyles = document.querySelectorAll('[data-game-flow-error-recovery]');
        recoveryStyles.forEach(style => style.remove());
    }

    isInFallbackMode(section?: GameFlowSection): boolean {
        if (section) {
            return this.fallbackStates.has(section);
        }

        return document.body.hasAttribute('data-game-flow-fallback-mode');
    }

    getRecoveryRecommendations(): string[] {
        const recommendations: string[] = [];
        const recentErrors = this.errorHistory.slice(-10);

        if (recentErrors.some(e => e.type === 'PERFORMANCE_ERROR')) {
            recommendations.push('Consider closing other browser tabs to improve performance');
        }

        if (recentErrors.some(e => e.type === 'INTERACTION_ERROR')) {
            recommendations.push('Try using keyboard navigation if touch/mouse interactions fail');
        }

        if (recentErrors.some(e => e.type === 'CONTENT_ERROR')) {
            recommendations.push('Check your internet connection and try refreshing the page');
        }

        if (recentErrors.length > 5) {
            recommendations.push('Multiple errors detected - consider refreshing the page');
        }

        return recommendations;
    }
}

export function useErrorHandling(config: Partial<ErrorHandlingConfig> = {}) {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const handlerRef = useRef<ErrorHandler>();
    const [errorState, setErrorState] = useState<{
        hasError: boolean;
        lastError?: GameFlowError;
        isRecovering: boolean;
        fallbackMode: boolean;
    }>({
        hasError: false,
        isRecovering: false,
        fallbackMode: false
    });

    // Initialize error handler
    if (!handlerRef.current) {
        handlerRef.current = new ErrorHandler(fullConfig);
    }

    const handler = handlerRef.current;

    const handleError = useCallback((error: GameFlowError) => {
        setErrorState(prev => ({
            ...prev,
            hasError: true,
            lastError: error,
            fallbackMode: handler.isInFallbackMode()
        }));

        const strategy = handler.handleError(error);

        if (strategy.type === 'retry' && strategy.action) {
            setErrorState(prev => ({ ...prev, isRecovering: true }));

            strategy.action().then(() => {
                setErrorState(prev => ({ ...prev, isRecovering: false }));
            });
        }

        return strategy;
    }, [handler]);

    const recoverFromError = useCallback((section?: GameFlowSection) => {
        handler.recoverFromError(section);

        setErrorState(prev => ({
            ...prev,
            hasError: false,
            lastError: undefined,
            isRecovering: false,
            fallbackMode: handler.isInFallbackMode()
        }));
    }, [handler]);

    const clearErrors = useCallback(() => {
        handler.clearErrors();
        setErrorState({
            hasError: false,
            isRecovering: false,
            fallbackMode: false
        });
    }, [handler]);

    return {
        ...errorState,
        handleError,
        recoverFromError,
        clearErrors,
        createError: handler.createGameFlowError.bind(handler),
        getErrorHistory: handler.getErrorHistory.bind(handler),
        getRecommendations: handler.getRecoveryRecommendations.bind(handler),
        isInFallbackMode: handler.isInFallbackMode.bind(handler)
    };
}