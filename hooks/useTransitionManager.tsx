import { useRef, useCallback, useMemo } from 'react';
import type { GameFlowSection, TransitionConfig, PerformanceMode } from '../types';

// Camera-inspired animation presets
const CAMERA_PRESETS = {
    shutter: {
        fast: { duration: 150, intensity: 0.95 }, // 1/400s equivalent
        normal: { duration: 250, intensity: 0.8 }, // 1/200s equivalent
        slow: { duration: 500, intensity: 0.6 },   // 1/100s equivalent
    },
    aperture: {
        f1_4: { blur: 12, falloff: 'exponential' }, // Wide aperture
        f2_8: { blur: 8, falloff: 'smooth' },
        f5_6: { blur: 4, falloff: 'linear' },
        f11: { blur: 0, falloff: 'none' },          // Deep focus
    },
    focus: {
        near: { distance: 0.2, speed: 'fast' },
        medium: { distance: 0.5, speed: 'normal' },
        far: { distance: 1.0, speed: 'slow' },
        infinity: { distance: Infinity, speed: 'instant' }
    }
};

// Performance-aware timing configurations
const PERFORMANCE_CONFIGS: Record<PerformanceMode, TransitionConfig> = {
    high: {
        duration: 200,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)', // easeOutQuint
        willChange: ['transform', 'opacity', 'filter'],
        transform3d: true,
        gpuAcceleration: true
    },
    balanced: {
        duration: 400,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // easeOutQuad
        willChange: ['transform', 'opacity'],
        transform3d: true,
        gpuAcceleration: true
    },
    low: {
        duration: 600,
        easing: 'ease-out',
        willChange: ['opacity'],
        transform3d: false,
        gpuAcceleration: false
    },
    accessible: {
        duration: 0, // Instant transitions for reduced motion
        easing: 'linear',
        willChange: [],
        transform3d: false,
        gpuAcceleration: false
    }
};

interface TransitionManagerConfig {
    performanceMode: PerformanceMode;
    reducedMotion: boolean;
    gpuAcceleration: boolean;
}

interface DepthOfFieldOptions {
    aperture: number;
    distance: 'near' | 'medium' | 'far';
}

interface PerformanceCallback {
    (metrics: {
        type: string;
        duration: number;
        frameDrops: number;
        averageFrameTime: number;
    }): void;
}

export class TransitionManager {
    private config: TransitionManagerConfig;
    private elements: { [key in GameFlowSection]?: HTMLElement } = {};
    private preloadedConfigs: { [key: string]: TransitionConfig } = {};
    private performanceCallback?: PerformanceCallback;

    // Performance tracking
    private frameHistory: number[] = [];
    private lastFrameTime = 0;

    constructor(config: TransitionManagerConfig) {
        this.config = config;
        this.preloadConfigurations();
    }

    initialize(elements: { [key in GameFlowSection]?: HTMLElement }): void {
        this.elements = elements;
        this.setupPerformanceMonitoring();
    }

    private preloadConfigurations(): void {
        this.preloadedConfigs = {
            shutter: this.optimizeTransition('shutter'),
            focus: this.optimizeTransition('focus'),
            exposure: this.optimizeTransition('exposure'),
            aperture: this.optimizeTransition('aperture')
        };
    }

    private setupPerformanceMonitoring(): void {
        // Initialize frame rate monitoring for transitions
        this.trackFrameRate();
    }

    private trackFrameRate(): void {
        const trackFrame = (timestamp: number) => {
            if (this.lastFrameTime) {
                const delta = timestamp - this.lastFrameTime;
                const fps = Math.round(1000 / delta);

                this.frameHistory.push(fps);
                if (this.frameHistory.length > 60) {
                    this.frameHistory.shift();
                }
            }

            this.lastFrameTime = timestamp;
            requestAnimationFrame(trackFrame);
        };

        requestAnimationFrame(trackFrame);
    }

    async shutterTransition(
        from: GameFlowSection,
        to: GameFlowSection,
        preset: 'fast' | 'normal' | 'slow' = 'normal'
    ): Promise<void> {
        const fromElement = this.elements[from];
        const toElement = this.elements[to];

        if (!fromElement || !toElement) {
            console.warn('Shutter transition: Missing elements');
            return;
        }

        const shutterConfig = CAMERA_PRESETS.shutter[preset];
        const config = this.preloadedConfigs.shutter;

        performance.mark('transition-start');

        try {
            // Create flash overlay for shutter effect
            const flashOverlay = this.createFlashOverlay();

            // Phase 1: Shutter close (darken)
            await Promise.all([
                this.animateElement(fromElement, [
                    { opacity: 1, filter: 'brightness(1)' },
                    { opacity: 0.3, filter: 'brightness(0.1)' }
                ], { duration: config.duration * 0.3, easing: 'ease-in' }),

                this.animateElement(flashOverlay, [
                    { backgroundColor: 'transparent' },
                    { backgroundColor: 'rgba(255, 255, 255, 0.95)' }
                ], { duration: config.duration * 0.1 })
            ]);

            // Phase 2: Flash peak (camera sensor exposure)
            await this.animateElement(flashOverlay, [
                { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
                { backgroundColor: 'white' }
            ], { duration: Math.max(shutterConfig.duration * 0.05, 16) }); // Min 16ms for 60fps

            // Phase 3: Reveal new section (shutter open)
            await Promise.all([
                this.animateElement(toElement, [
                    { opacity: 0, filter: 'brightness(0.1)', transform: 'translateZ(0)' },
                    { opacity: 1, filter: 'brightness(1)', transform: 'translateZ(0)' }
                ], { duration: config.duration * 0.6, easing: config.easing }),

                this.animateElement(flashOverlay, [
                    { backgroundColor: 'white' },
                    { backgroundColor: 'transparent' }
                ], { duration: config.duration * 0.4 })
            ]);

            // Cleanup
            flashOverlay.remove();

        } catch (error) {
            console.warn('Shutter transition failed:', error);
        } finally {
            performance.mark('transition-end');
            this.reportPerformanceMetrics('shutter-transition');
        }
    }

    async focusBlurTransition(
        element: HTMLElement,
        focused: boolean,
        options?: DepthOfFieldOptions
    ): Promise<void> {
        const aperture = options?.aperture || 4;
        const distance = options?.distance || 'medium';

        // Calculate blur intensity based on camera optics
        const baseBlur = this.calculateBlurIntensity(aperture, distance);
        const targetBlur = focused ? 0 : baseBlur;
        const backgroundBlur = focused ? Math.min(baseBlur * 1.5, 16) : 0;

        const config = this.preloadedConfigs.focus;

        try {
            // Animate target element focus
            await this.animateElement(element, [
                { filter: `blur(${focused ? baseBlur : 0}px)`, transform: 'translateZ(0)' },
                { filter: `blur(${targetBlur}px)`, transform: 'translateZ(0)' }
            ], {
                duration: config.duration,
                easing: config.easing
            });

            // Animate background elements if focusing
            if (focused) {
                await this.blurBackgroundElements(element, backgroundBlur, config.duration);
            }

        } catch (error) {
            console.warn('Focus blur transition failed:', error);
        }
    }

    async exposureTransition(
        shutterSpeed: number,
        intensity: number = 0.8
    ): Promise<void> {
        // Convert shutter speed to duration (1/shutterSpeed seconds to milliseconds)
        const duration = Math.max(1000 / shutterSpeed, 16); // Min 16ms for 60fps
        const brightness = 1 + intensity; // Brightness multiplier

        const targetElements = Object.values(this.elements).filter(Boolean);

        try {
            const promises = targetElements.map(element => {
                if (!element) return Promise.resolve();

                return this.animateElement(element, [
                    { filter: 'brightness(1)', transform: 'translateZ(0)' },
                    { filter: `brightness(${brightness})`, transform: 'translateZ(0)' },
                    { filter: 'brightness(1)', transform: 'translateZ(0)' }
                ], {
                    duration: duration * 2, // Full exposure cycle
                    easing: 'cubic-bezier(0.23, 1, 0.32, 1)' // Camera sensor response curve
                });
            });

            await Promise.all(promises);

        } catch (error) {
            console.warn('Exposure transition failed:', error);
        }
    }

    async focusPull(from: GameFlowSection, to: GameFlowSection): Promise<void> {
        const fromElement = this.elements[from];
        const toElement = this.elements[to];

        if (!fromElement || !toElement) return;

        const config = this.preloadedConfigs.focus;

        try {
            // Simulate camera focus pull - blur current, focus new
            await Promise.all([
                this.focusBlurTransition(fromElement, false, { aperture: 2.8, distance: 'far' }),
                this.focusBlurTransition(toElement, true, { aperture: 2.8, distance: 'near' })
            ]);

        } catch (error) {
            console.warn('Focus pull failed:', error);
        }
    }

    private calculateBlurIntensity(aperture: number, distance: 'near' | 'medium' | 'far'): number {
        // Simulated depth of field calculation
        const distanceMultiplier = {
            near: 0.8,
            medium: 1.0,
            far: 1.2
        };

        // Lower f-stop (wider aperture) = more blur
        const apertureBlur = Math.max(12 - aperture * 2, 0);
        return apertureBlur * distanceMultiplier[distance];
    }

    private async blurBackgroundElements(focusedElement: HTMLElement, blur: number, duration: number): Promise<void> {
        const backgroundElements = Object.values(this.elements).filter(
            el => el && el !== focusedElement
        );

        const promises = backgroundElements.map(element => {
            if (!element) return Promise.resolve();

            return this.animateElement(element, [
                { filter: 'blur(0px)', transform: 'translateZ(0)' },
                { filter: `blur(${blur}px)`, transform: 'translateZ(0)' }
            ], { duration, easing: 'ease-out' });
        });

        await Promise.all(promises);
    }

    private createFlashOverlay(): HTMLElement {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: transparent;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: screen;
        `;

        document.body.appendChild(overlay);
        return overlay;
    }

    private animateElement(
        element: HTMLElement,
        keyframes: Keyframe[],
        options: KeyframeAnimationOptions = {}
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (!element.animate) {
                    // Fallback for browsers without Web Animations API
                    resolve();
                    return;
                }

                // Apply performance optimizations
                if (this.config.gpuAcceleration) {
                    keyframes = this.addGPUAcceleration(keyframes);
                }

                // Apply will-change for performance
                const willChangeProps = this.extractWillChangeProperties(keyframes);
                element.style.willChange = willChangeProps.join(', ');

                const animation = element.animate(keyframes, {
                    ...options,
                    fill: 'forwards' as FillMode
                });

                animation.finished
                    .then(() => {
                        // Cleanup will-change after animation
                        element.style.willChange = 'auto';
                        resolve();
                    })
                    .catch(reject);

            } catch (error) {
                reject(error);
            }
        });
    }

    private addGPUAcceleration(keyframes: Keyframe[]): Keyframe[] {
        return keyframes.map(frame => ({
            ...frame,
            transform: frame.transform ? `${frame.transform} translateZ(0)` : 'translateZ(0)'
        }));
    }

    private extractWillChangeProperties(keyframes: Keyframe[]): string[] {
        const properties = new Set<string>();

        keyframes.forEach(frame => {
            Object.keys(frame).forEach(prop => {
                if (prop !== 'offset') {
                    properties.add(prop === 'transform' ? 'transform' : prop);
                }
            });
        });

        return Array.from(properties);
    }

    optimizeTransition(transitionType: string): TransitionConfig {
        let baseConfig = PERFORMANCE_CONFIGS[this.config.performanceMode];

        // Device capability detection
        const deviceCapabilities = this.getDeviceCapabilities();

        if (deviceCapabilities.lowEnd) {
            baseConfig = {
                ...baseConfig,
                duration: Math.min(baseConfig.duration * 1.5, 800),
                gpuAcceleration: false,
                willChange: ['opacity']
            };
        }

        // Reduced motion preference
        if (this.config.reducedMotion) {
            baseConfig = {
                ...baseConfig,
                duration: Math.min(baseConfig.duration * 0.5, 200)
            };
        }

        return baseConfig;
    }

    private getDeviceCapabilities() {
        const cores = navigator.hardwareConcurrency || 4;
        const memory = (navigator as any).deviceMemory || 4;

        return {
            lowEnd: cores <= 2 || memory <= 2,
            mobile: /Mobi|Android/i.test(navigator.userAgent),
            highDPI: window.devicePixelRatio > 1.5
        };
    }

    private reportPerformanceMetrics(transitionType: string): void {
        if (!this.performanceCallback) return;

        try {
            const measures = performance.getEntriesByType('measure');
            const transitionMeasure = measures.find(m => m.name.includes('transition'));

            const averageFrameTime = this.frameHistory.length > 0
                ? this.frameHistory.reduce((a, b) => a + (1000 / b), 0) / this.frameHistory.length
                : 16;

            const frameDrops = this.frameHistory.filter(fps => fps < 55).length;

            this.performanceCallback({
                type: transitionType,
                duration: transitionMeasure?.duration || 0,
                frameDrops,
                averageFrameTime
            });

        } catch (error) {
            console.warn('Performance metrics reporting failed:', error);
        }
    }

    setPerformanceCallback(callback: PerformanceCallback): void {
        this.performanceCallback = callback;
    }

    getConfig(): TransitionManagerConfig {
        return { ...this.config };
    }

    getRegisteredElements(): { [key in GameFlowSection]?: HTMLElement } {
        return { ...this.elements };
    }

    getPreloadedConfigs(): { [key: string]: TransitionConfig } {
        return { ...this.preloadedConfigs };
    }
}

// React hook for transition management
export function useTransitionManager(config: TransitionManagerConfig) {
    const managerRef = useRef<TransitionManager>();

    // Create manager instance
    const manager = useMemo(() => {
        if (!managerRef.current) {
            managerRef.current = new TransitionManager(config);
        }
        return managerRef.current;
    }, [config]);

    // Initialize with elements
    const initializeManager = useCallback((elements: { [key in GameFlowSection]?: HTMLElement }) => {
        manager.initialize(elements);
    }, [manager]);

    // Transition methods
    const shutterTransition = useCallback(
        (from: GameFlowSection, to: GameFlowSection, preset?: 'fast' | 'normal' | 'slow') => {
            return manager.shutterTransition(from, to, preset);
        },
        [manager]
    );

    const focusBlurTransition = useCallback(
        (element: HTMLElement, focused: boolean, options?: DepthOfFieldOptions) => {
            return manager.focusBlurTransition(element, focused, options);
        },
        [manager]
    );

    const exposureTransition = useCallback(
        (shutterSpeed: number, intensity?: number) => {
            return manager.exposureTransition(shutterSpeed, intensity);
        },
        [manager]
    );

    const focusPull = useCallback(
        (from: GameFlowSection, to: GameFlowSection) => {
            return manager.focusPull(from, to);
        },
        [manager]
    );

    const setPerformanceCallback = useCallback(
        (callback: PerformanceCallback) => {
            manager.setPerformanceCallback(callback);
        },
        [manager]
    );

    return {
        manager,
        initializeManager,
        shutterTransition,
        focusBlurTransition,
        exposureTransition,
        focusPull,
        setPerformanceCallback
    };
}