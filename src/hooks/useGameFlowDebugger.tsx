import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { GameFlowState, GameFlowSection, PerformanceMetrics, InteractionEvent } from '../types';

interface DebuggerConfig {
    enableConsoleLogging: boolean;
    enablePerformanceTracking: boolean;
    enableStateInspection: boolean;
    enableEventLogging: boolean;
    enableVisualDebugger: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    maxLogHistory: number;
}

interface DebugLog {
    timestamp: number;
    level: 'error' | 'warn' | 'info' | 'debug';
    category: string;
    message: string;
    data?: any;
}

interface PerformanceBenchmark {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: any;
}

interface DebuggerState {
    isActive: boolean;
    logs: DebugLog[];
    benchmarks: PerformanceBenchmark[];
    stateHistory: Array<{ timestamp: number; state: Partial<GameFlowState> }>;
    eventHistory: InteractionEvent[];
    performanceMetrics: PerformanceMetrics;
}

const DEFAULT_CONFIG: DebuggerConfig = {
    enableConsoleLogging: false,
    enablePerformanceTracking: false,
    enableStateInspection: false,
    enableEventLogging: false,
    enableVisualDebugger: false,
    logLevel: 'error',
    maxLogHistory: 100
};

class GameFlowDebugger {
    private config: DebuggerConfig;
    private logs: DebugLog[] = [];
    private benchmarks: Map<string, PerformanceBenchmark> = new Map();
    private stateHistory: Array<{ timestamp: number; state: Partial<GameFlowState> }> = [];
    private eventHistory: InteractionEvent[] = [];
    private visualDebugger?: HTMLElement;
    private originalConsole: {
        log: typeof console.log;
        warn: typeof console.warn;
        error: typeof console.error;
        info: typeof console.info;
        debug: typeof console.debug;
    };

    constructor(config: DebuggerConfig) {
        this.config = config;

        // Store original console methods before overriding
        this.originalConsole = {
            log: console.log.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
            info: console.info.bind(console),
            debug: console.debug.bind(console)
        };

        this.setupDebugger();
    }

    private setupDebugger(): void {
        if (this.config.enableVisualDebugger) {
            this.createVisualDebugger();
        }

        // Override console methods to capture logs
        if (this.config.enableConsoleLogging) {
            this.interceptConsole();
        }

        this.log('info', 'debugger', 'Game Flow Debugger initialized', this.config);
    }

    private createVisualDebugger(): void {
        this.visualDebugger = document.createElement('div');
        this.visualDebugger.id = 'game-flow-debugger';
        this.visualDebugger.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            border: 1px solid #333;
            border-radius: 4px;
            z-index: 10000;
            overflow-y: auto;
            padding: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        `;

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: #ff0000;
            font-size: 16px;
            cursor: pointer;
        `;
        closeButton.onclick = () => this.toggleVisualDebugger();

        this.visualDebugger.appendChild(closeButton);

        // Add title
        const title = document.createElement('div');
        title.textContent = 'Game Flow Debug Console';
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
        `;
        this.visualDebugger.appendChild(title);

        document.body.appendChild(this.visualDebugger);

        // Add keyboard shortcut to toggle
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                this.toggleVisualDebugger();
            }
        });
    }

    private interceptConsole(): void {
        console.log = (...args) => {
            this.log('info', 'console', args.join(' '));
            this.originalConsole.log(...args);
        };

        console.warn = (...args) => {
            this.log('warn', 'console', args.join(' '));
            this.originalConsole.warn(...args);
        };

        console.error = (...args) => {
            this.log('error', 'console', args.join(' '));
            this.originalConsole.error(...args);
        };
    }

    log(level: DebugLog['level'], category: string, message: string, data?: any): void {
        const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
        const configLevel = logLevels[this.config.logLevel];
        const messageLevel = logLevels[level];

        if (messageLevel > configLevel) return;

        const logEntry: DebugLog = {
            timestamp: Date.now(),
            level,
            category,
            message,
            data: data ? this.serializeData(data) : undefined
        };

        this.logs.push(logEntry);

        // Maintain max log history
        if (this.logs.length > this.config.maxLogHistory) {
            this.logs.shift();
        }

        // Update visual debugger
        if (this.config.enableVisualDebugger && this.visualDebugger) {
            this.updateVisualDebugger();
        }

        // Console output with formatting
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;

        switch (level) {
            case 'error':
                this.originalConsole.error(`${prefix} ${message}`, data || '');
                break;
            case 'warn':
                this.originalConsole.warn(`${prefix} ${message}`, data || '');
                break;
            case 'info':
                this.originalConsole.info(`${prefix} ${message}`, data || '');
                break;
            case 'debug':
                this.originalConsole.debug(`${prefix} ${message}`, data || '');
                break;
        }
    }

    private serializeData(data: any): any {
        try {
            return JSON.parse(JSON.stringify(data));
        } catch (error) {
            return { error: 'Could not serialize data', original: String(data) };
        }
    }

    trackState(state: Partial<GameFlowState>): void {
        if (!this.config.enableStateInspection) return;

        const stateSnapshot = {
            timestamp: Date.now(),
            state: this.serializeData(state)
        };

        this.stateHistory.push(stateSnapshot);

        // Keep only last 100 state snapshots
        if (this.stateHistory.length > 100) {
            this.stateHistory.shift();
        }

        this.log('debug', 'state', 'State updated', {
            section: state.currentSection,
            transition: state.transitionState,
            scrollProgress: state.scrollProgress
        });
    }

    trackEvent(event: InteractionEvent): void {
        if (!this.config.enableEventLogging) return;

        this.eventHistory.push(event);

        // Keep only last 200 events
        if (this.eventHistory.length > 200) {
            this.eventHistory.shift();
        }

        this.log('debug', 'event', `${event.type} in ${event.section}`, {
            type: event.type,
            section: event.section,
            performanceImpact: event.performanceImpact,
            data: event.data
        });
    }

    private getTimestamp(): number {
        // Use performance.now() if available, otherwise fall back to Date.now()
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            return performance.now();
        }
        return Date.now();
    }

    startBenchmark(name: string, metadata?: any): void {
        if (!this.config.enablePerformanceTracking) return;

        const benchmark: PerformanceBenchmark = {
            name,
            startTime: this.getTimestamp(),
            metadata
        };

        this.benchmarks.set(name, benchmark);
        this.log('debug', 'performance', `Benchmark started: ${name}`, metadata);
    }

    endBenchmark(name: string): number | null {
        if (!this.config.enablePerformanceTracking) return null;

        const benchmark = this.benchmarks.get(name);
        if (!benchmark) {
            this.log('warn', 'performance', `Benchmark not found: ${name}`);
            return null;
        }

        benchmark.endTime = this.getTimestamp();
        benchmark.duration = benchmark.endTime - benchmark.startTime;

        this.log('debug', 'performance', `Benchmark completed: ${name}`, {
            duration: benchmark.duration,
            metadata: benchmark.metadata
        });

        return benchmark.duration;
    }

    measureFunction<T extends (...args: any[]) => any>(
        name: string,
        fn: T,
        ...args: Parameters<T>
    ): ReturnType<T> {
        if (!this.config.enablePerformanceTracking) {
            return fn(...args);
        }

        this.startBenchmark(name, { functionName: fn.name, args });

        try {
            const result = fn(...args);

            if (result instanceof Promise) {
                return result.finally(() => {
                    this.endBenchmark(name);
                }) as ReturnType<T>;
            } else {
                this.endBenchmark(name);
                return result;
            }
        } catch (error) {
            this.endBenchmark(name);
            this.log('error', 'performance', `Function ${name} threw error`, error);
            throw error;
        }
    }

    trackPerformanceMetrics(metrics: PerformanceMetrics): void {
        this.log('debug', 'performance', 'Performance metrics updated', metrics);

        // Alert on performance issues
        if (metrics.frameRate < 30) {
            this.log('warn', 'performance', 'Low frame rate detected', { frameRate: metrics.frameRate });
        }

        if (metrics.coreWebVitals.lcp > 2500) {
            this.log('warn', 'performance', 'Poor LCP detected', { lcp: metrics.coreWebVitals.lcp });
        }

        if (metrics.coreWebVitals.cls > 0.1) {
            this.log('warn', 'performance', 'High CLS detected', { cls: metrics.coreWebVitals.cls });
        }
    }

    generateReport(): {
        summary: any;
        logs: DebugLog[];
        benchmarks: PerformanceBenchmark[];
        stateHistory: any[];
        eventHistory: InteractionEvent[];
    } {
        const completedBenchmarks = Array.from(this.benchmarks.values()).filter(b => b.duration);

        const summary = {
            totalLogs: this.logs.length,
            errorCount: this.logs.filter(l => l.level === 'error').length,
            warningCount: this.logs.filter(l => l.level === 'warn').length,
            totalBenchmarks: completedBenchmarks.length,
            averageBenchmarkDuration: completedBenchmarks.length > 0
                ? completedBenchmarks.reduce((sum, b) => sum + (b.duration || 0), 0) / completedBenchmarks.length
                : 0,
            totalEvents: this.eventHistory.length,
            stateChanges: this.stateHistory.length,
            topEventTypes: this.getTopEventTypes(),
            slowestBenchmarks: completedBenchmarks
                .sort((a, b) => (b.duration || 0) - (a.duration || 0))
                .slice(0, 5)
        };

        return {
            summary,
            logs: this.logs,
            benchmarks: completedBenchmarks,
            stateHistory: this.stateHistory,
            eventHistory: this.eventHistory
        };
    }

    private getTopEventTypes(): Array<{ type: string; count: number }> {
        const eventCounts = new Map<string, number>();

        this.eventHistory.forEach(event => {
            const current = eventCounts.get(event.type) || 0;
            eventCounts.set(event.type, current + 1);
        });

        return Array.from(eventCounts.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    private updateVisualDebugger(): void {
        if (!this.visualDebugger) return;

        const recentLogs = this.logs.slice(-10);
        const logElements = recentLogs.map(log => {
            const element = document.createElement('div');
            element.style.cssText = `
                margin-bottom: 5px;
                padding: 2px 4px;
                border-left: 2px solid ${this.getLogColor(log.level)};
                font-size: 11px;
            `;

            const timestamp = new Date(log.timestamp).toLocaleTimeString();
            element.innerHTML = `
                <span style="color: #888">[${timestamp}]</span>
                <span style="color: ${this.getLogColor(log.level)}">[${log.level.toUpperCase()}]</span>
                <span style="color: #ccc">[${log.category}]</span>
                <br>
                <span style="margin-left: 10px">${log.message}</span>
            `;

            return element;
        });

        // Clear existing logs and add new ones
        const existingLogs = this.visualDebugger.querySelectorAll('.debug-log');
        existingLogs.forEach(log => log.remove());

        logElements.forEach(element => {
            element.classList.add('debug-log');
            this.visualDebugger!.appendChild(element);
        });

        // Auto-scroll to bottom
        this.visualDebugger.scrollTop = this.visualDebugger.scrollHeight;
    }

    private getLogColor(level: DebugLog['level']): string {
        switch (level) {
            case 'error': return '#ff4444';
            case 'warn': return '#ffaa00';
            case 'info': return '#44aaff';
            case 'debug': return '#888888';
            default: return '#ffffff';
        }
    }

    private toggleVisualDebugger(): void {
        if (this.visualDebugger) {
            const isVisible = this.visualDebugger.style.display !== 'none';
            this.visualDebugger.style.display = isVisible ? 'none' : 'block';
        }
    }

    exportLogs(): string {
        const report = this.generateReport();
        return JSON.stringify(report, null, 2);
    }

    clearLogs(): void {
        this.logs = [];
        this.benchmarks.clear();
        this.stateHistory = [];
        this.eventHistory = [];

        if (this.visualDebugger) {
            const logElements = this.visualDebugger.querySelectorAll('.debug-log');
            logElements.forEach(element => element.remove());
        }

        this.log('info', 'debugger', 'Debug logs cleared');
    }

    destroy(): void {
        if (this.visualDebugger) {
            this.visualDebugger.remove();
        }

        // Note: We don't restore console methods to avoid breaking other debuggers
        this.log('info', 'debugger', 'Game Flow Debugger destroyed');
    }
}

export function useGameFlowDebugger(config: Partial<DebuggerConfig> = {}) {
    const fullConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
    const debuggerRef = useRef<GameFlowDebugger>();
    const [isActive, setIsActive] = useState(false);

    // Initialize debugger only in development - moved to useEffect to follow Rules of Hooks
    useEffect(() => {
        if (!debuggerRef.current && process.env.NODE_ENV === 'development') {
            debuggerRef.current = new GameFlowDebugger(fullConfig);
            setIsActive(true);
        }
    }, [fullConfig]);

    const gameFlowDebuggerInstance = debuggerRef.current;

    const log = useCallback((
        level: DebugLog['level'],
        category: string,
        message: string,
        data?: any
    ) => {
        debuggerRef.current?.log(level, category, message, data);
    }, []);

    const trackState = useCallback((state: Partial<GameFlowState>) => {
        debuggerRef.current?.trackState(state);
    }, []);

    const trackEvent = useCallback((event: InteractionEvent) => {
        debuggerRef.current?.trackEvent(event);
    }, []);

    const startBenchmark = useCallback((name: string, metadata?: any) => {
        debuggerRef.current?.startBenchmark(name, metadata);
    }, []);

    const endBenchmark = useCallback((name: string) => {
        return debuggerRef.current?.endBenchmark(name) || null;
    }, []);

    const measureFunction = useCallback(<T extends (...args: any[]) => any>(
        name: string,
        fn: T,
        ...args: Parameters<T>
    ): ReturnType<T> => {
        return debuggerRef.current?.measureFunction(name, fn, ...args) || fn(...args);
    }, []);

    const trackPerformanceMetrics = useCallback((metrics: PerformanceMetrics) => {
        debuggerRef.current?.trackPerformanceMetrics(metrics);
    }, []);

    const generateReport = useCallback(() => {
        return debuggerRef.current?.generateReport() || null;
    }, []);

    const exportLogs = useCallback(() => {
        return debuggerRef.current?.exportLogs() || '';
    }, []);

    const clearLogs = useCallback(() => {
        debuggerRef.current?.clearLogs();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debuggerRef.current) {
                debuggerRef.current.destroy();
            }
        };
    }, []);

    // Auto-track Game Flow state changes
    const trackGameFlowState = useCallback((state: GameFlowState) => {
        if (!debuggerRef.current) return;

        debuggerRef.current.trackState(state);

        // Auto-benchmark section transitions
        if (state.transitionState === 'transitioning') {
            debuggerRef.current.startBenchmark(`transition-to-${state.currentSection}`);
        } else if (state.transitionState === 'idle') {
            debuggerRef.current.endBenchmark(`transition-to-${state.currentSection}`);
        }
    }, []);

    return useMemo(() => ({
        isActive,
        log,
        trackState: trackGameFlowState,
        trackEvent,
        startBenchmark,
        endBenchmark,
        measureFunction,
        trackPerformanceMetrics,
        generateReport,
        exportLogs,
        clearLogs
    }), [isActive, log, trackGameFlowState, trackEvent, startBenchmark, endBenchmark, measureFunction, trackPerformanceMetrics, generateReport, exportLogs, clearLogs]);
}

// Development-only helper functions
export const GameFlowDebugUtils = {
    // Log section navigation performance
    logSectionNavigation: (from: GameFlowSection, to: GameFlowSection, duration: number) => {
        console.log(`[INFO] Section Navigation: ${from} → ${to} (${duration.toFixed(2)}ms)`);
    },

    // Log camera interactions
    logCameraInteraction: (type: string, details: any) => {
        console.log(`📷 Camera Interaction: ${type}`, details);
    },

    // Log performance warnings
    logPerformanceWarning: (metric: string, value: number, threshold: number) => {
        console.warn(`⚡ Performance Warning: ${metric} = ${value} (threshold: ${threshold})`);
    },

    // Visualize scroll progress
    visualizeScrollProgress: (progress: number, section: GameFlowSection) => {
        const progressBar = '█'.repeat(Math.floor(progress * 20)) + '░'.repeat(20 - Math.floor(progress * 20));
        console.log(`📜 Scroll Progress: [${progressBar}] ${(progress * 100).toFixed(1)}% (${section})`);
    },

    // Debug accessibility state
    logAccessibilityState: (state: any) => {
        console.log('♿ Accessibility State:', {
            screenReader: state.screenReaderActive ? '✅' : '❌',
            reducedMotion: state.reducedMotionPreferred ? '✅' : '❌',
            highContrast: state.highContrastEnabled ? '✅' : '❌',
            keyboardNav: state.keyboardNavigationActive ? '✅' : '❌'
        });
    }
};