import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransitionManager } from '../hooks/useTransitionManager';
import type { GameFlowSection, TransitionConfig } from '../types';

// Mock Web Animations API
const mockAnimate = vi.fn();
Object.defineProperty(Element.prototype, 'animate', {
  value: mockAnimate.mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
  }),
  writable: true,
});

// Mock performance APIs
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
  },
  writable: true,
});

describe('Transition Manager', () => {
  let transitionManager: TransitionManager;
  let mockElements: { [key in GameFlowSection]: HTMLElement };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock elements for each section
    mockElements = {
      capture: document.createElement('section'),
      focus: document.createElement('section'),
      frame: document.createElement('section'),
      exposure: document.createElement('section'),
      develop: document.createElement('section'),
      portfolio: document.createElement('section'),
    };

    Object.keys(mockElements).forEach((section) => {
      mockElements[section as GameFlowSection].id = section;
    });

    const config = {
      performanceMode: 'high' as const,
      reducedMotion: false,
      gpuAcceleration: true,
    };

    transitionManager = new TransitionManager(config);
    transitionManager.initialize(mockElements);
  });

  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(transitionManager.getConfig().performanceMode).toBe('high');
      expect(transitionManager.getConfig().gpuAcceleration).toBe(true);
    });

    it('should register all section elements', () => {
      const registeredElements = transitionManager.getRegisteredElements();
      expect(Object.keys(registeredElements)).toHaveLength(6);
    });
  });

  describe('Shutter Transition', () => {
    it('should execute shutter transition between sections', async () => {
      await transitionManager.shutterTransition('capture', 'focus');

      expect(mockAnimate).toHaveBeenCalled();

      // Check that animation was called on both elements
      const animateCalls = mockAnimate.mock.calls;
      expect(animateCalls.some(call =>
        call[0].some((keyframe: any) => keyframe.opacity === 0)
      )).toBe(true);
    });

    it('should respect performance mode in shutter timing', async () => {
      const highPerfManager = new TransitionManager({
        performanceMode: 'high',
        reducedMotion: false,
        gpuAcceleration: true,
      });
      highPerfManager.initialize(mockElements);

      await highPerfManager.shutterTransition('capture', 'focus');

      const animateCall = mockAnimate.mock.calls[0];
      const options = animateCall[1];
      expect(options.duration).toBeLessThanOrEqual(300); // High performance = faster
    });

    it('should use longer duration in balanced performance mode', async () => {
      const balancedManager = new TransitionManager({
        performanceMode: 'balanced',
        reducedMotion: false,
        gpuAcceleration: true,
      });
      balancedManager.initialize(mockElements);

      await balancedManager.shutterTransition('capture', 'focus');

      const animateCall = mockAnimate.mock.calls[0];
      const options = animateCall[1];
      expect(options.duration).toBe(400); // Balanced = moderate speed
    });

    it('should handle shutter flash effect', async () => {
      await transitionManager.shutterTransition('capture', 'focus');

      // Should create flash overlay and animate it
      const flashCalls = mockAnimate.mock.calls.filter(call =>
        call[0].some((keyframe: any) => keyframe.backgroundColor === 'white')
      );
      expect(flashCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Blur Transition', () => {
    it('should apply focus blur transition to element', async () => {
      const targetElement = mockElements.focus;

      await transitionManager.focusBlurTransition(targetElement, true);

      expect(mockAnimate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ filter: expect.stringContaining('blur') })
        ]),
        expect.objectContaining({ duration: expect.any(Number) })
      );
    });

    it('should blur background elements when focusing', async () => {
      const focusElement = mockElements.focus;

      await transitionManager.focusBlurTransition(focusElement, true);

      // Should animate blur on other elements
      const blurCalls = mockAnimate.mock.calls.filter(call =>
        call[0].some((keyframe: any) =>
          keyframe.filter && keyframe.filter.includes('blur') && keyframe.filter !== 'blur(0px)'
        )
      );
      expect(blurCalls.length).toBeGreaterThan(0);
    });

    it('should remove blur when unfocusing', async () => {
      const targetElement = mockElements.focus;

      await transitionManager.focusBlurTransition(targetElement, false);

      expect(mockAnimate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ filter: 'blur(0px)' })
        ]),
        expect.any(Object)
      );
    });

    it('should handle depth of field calculations', async () => {
      const targetElement = mockElements.focus;

      await transitionManager.focusBlurTransition(targetElement, true, {
        aperture: 1.4, // Wide aperture = shallow depth of field
        distance: 'near'
      });

      // Should apply stronger blur effect for wide aperture
      const blurCalls = mockAnimate.mock.calls.filter(call =>
        call[0].some((keyframe: any) =>
          keyframe.filter && keyframe.filter.includes('blur(8px)')
        )
      );
      expect(blurCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Exposure Transition', () => {
    it('should execute exposure transition with correct timing', async () => {
      await transitionManager.exposureTransition(250, 0.8); // 1/250s, 80% intensity

      expect(mockAnimate).toHaveBeenCalled();

      const animateCall = mockAnimate.mock.calls[0];
      const options = animateCall[1];
      expect(options.duration).toBe(4); // 1/250s = ~4ms
    });

    it('should handle different exposure intensities', async () => {
      await transitionManager.exposureTransition(60, 1.0); // 1/60s, 100% intensity

      const animateCall = mockAnimate.mock.calls[0];
      const keyframes = animateCall[0];

      // Should flash to full brightness
      expect(keyframes.some((frame: any) =>
        frame.filter && frame.filter.includes('brightness(2)')
      )).toBe(true);
    });

    it('should simulate camera sensor response curve', async () => {
      await transitionManager.exposureTransition(125, 0.6);

      const animateCall = mockAnimate.mock.calls[0];
      const options = animateCall[1];

      // Should use camera-realistic easing
      expect(options.easing).toBe('cubic-bezier(0.23, 1, 0.32, 1)');
    });
  });

  describe('Performance Optimization', () => {
    it('should use GPU acceleration when available', async () => {
      await transitionManager.shutterTransition('capture', 'focus');

      const animateCall = mockAnimate.mock.calls[0];
      const keyframes = animateCall[0];

      // Should include transform3d for GPU acceleration
      expect(keyframes.some((frame: any) =>
        frame.transform && frame.transform.includes('translateZ')
      )).toBe(true);
    });

    it('should disable GPU acceleration when specified', async () => {
      const cpuManager = new TransitionManager({
        performanceMode: 'low',
        reducedMotion: false,
        gpuAcceleration: false,
      });
      cpuManager.initialize(mockElements);

      await cpuManager.shutterTransition('capture', 'focus');

      const animateCall = mockAnimate.mock.calls[0];
      const keyframes = animateCall[0];

      // Should not include GPU acceleration transforms
      expect(keyframes.every((frame: any) =>
        !frame.transform || !frame.transform.includes('translateZ')
      )).toBe(true);
    });

    it('should preload transition configurations', () => {
      const preloadedConfigs = transitionManager.getPreloadedConfigs();

      expect(preloadedConfigs).toHaveProperty('shutter');
      expect(preloadedConfigs).toHaveProperty('focus');
      expect(preloadedConfigs).toHaveProperty('exposure');
    });

    it('should optimize transition based on device capabilities', () => {
      // Mock low-end device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2,
        writable: true
      });

      const optimizedConfig = transitionManager.optimizeTransition('shutter');

      expect(optimizedConfig.duration).toBeGreaterThan(300); // Longer duration for low-end
      expect(optimizedConfig.gpuAcceleration).toBe(false);
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', async () => {
      const reducedMotionManager = new TransitionManager({
        performanceMode: 'balanced',
        reducedMotion: true,
        gpuAcceleration: true,
      });
      reducedMotionManager.initialize(mockElements);

      await reducedMotionManager.shutterTransition('capture', 'focus');

      const animateCall = mockAnimate.mock.calls[0];
      const options = animateCall[1];

      expect(options.duration).toBeLessThanOrEqual(200); // Reduced motion = faster/instant
    });

    it('should provide instant transitions when motion is disabled', async () => {
      const noMotionManager = new TransitionManager({
        performanceMode: 'accessible',
        reducedMotion: true,
        gpuAcceleration: false,
      });
      noMotionManager.initialize(mockElements);

      await noMotionManager.exposureTransition(125, 0.5);

      const animateCall = mockAnimate.mock.calls[0];
      const options = animateCall[1];

      expect(options.duration).toBe(0); // Instant in accessible mode
    });
  });

  describe('Error Handling', () => {
    it('should handle animation API unavailability', async () => {
      // Mock missing animate method
      Element.prototype.animate = undefined as any;

      await expect(
        transitionManager.shutterTransition('capture', 'focus')
      ).resolves.toBeUndefined();
    });

    it('should handle missing elements gracefully', async () => {
      const incompleteManager = new TransitionManager({
        performanceMode: 'balanced',
        reducedMotion: false,
        gpuAcceleration: true,
      });

      // Initialize with missing elements
      const incompleteElements = {
        capture: mockElements.capture,
        focus: null as any,
      };

      incompleteManager.initialize(incompleteElements);

      await expect(
        incompleteManager.shutterTransition('capture', 'focus')
      ).resolves.toBeUndefined();
    });

    it('should provide fallback for failed animations', async () => {
      // Mock animation failure
      mockAnimate.mockReturnValue({
        finished: Promise.reject(new Error('Animation failed')),
        cancel: vi.fn(),
        play: vi.fn(),
        pause: vi.fn(),
      });

      await expect(
        transitionManager.shutterTransition('capture', 'focus')
      ).resolves.toBeUndefined();
    });
  });

  describe('Camera-Inspired Timing', () => {
    it('should use realistic shutter speed timing', async () => {
      const shutterSpeeds = [30, 60, 125, 250, 500, 1000];

      for (const speed of shutterSpeeds) {
        await transitionManager.exposureTransition(speed, 0.5);

        const expectedDuration = Math.max(1000 / speed, 16); // Min 16ms for 60fps
        const animateCall = mockAnimate.mock.calls[mockAnimate.mock.calls.length - 1];
        const options = animateCall[1];

        expect(options.duration).toBe(expectedDuration);
      }
    });

    it('should simulate aperture mechanics in focus transitions', async () => {
      const apertures = [1.4, 2.8, 5.6, 11];

      for (const aperture of apertures) {
        await transitionManager.focusBlurTransition(mockElements.focus, true, {
          aperture,
          distance: 'medium'
        });

        // Wider aperture (lower f-stop) = more blur
        const expectedBlurIntensity = Math.max(12 - aperture * 2, 0);
        const blurCall = mockAnimate.mock.calls.find(call =>
          call[0].some((keyframe: any) =>
            keyframe.filter && keyframe.filter.includes(`blur(${expectedBlurIntensity}px)`)
          )
        );

        expect(blurCall).toBeDefined();
      }
    });

    it('should implement focus pulling mechanics', async () => {
      const focusSequence = ['capture', 'focus', 'frame'] as GameFlowSection[];

      for (let i = 1; i < focusSequence.length; i++) {
        await transitionManager.focusPull(focusSequence[i - 1], focusSequence[i]);

        // Should have smooth focus transition, not instant
        const animateCall = mockAnimate.mock.calls[mockAnimate.mock.calls.length - 1];
        const options = animateCall[1];

        expect(options.easing).toContain('cubic-bezier');
        expect(options.duration).toBeGreaterThan(200);
      }
    });
  });

  describe('Performance Monitoring', () => {
    it('should track transition performance metrics', async () => {
      const performanceSpy = vi.spyOn(window.performance, 'mark');

      await transitionManager.shutterTransition('capture', 'focus');

      expect(performanceSpy).toHaveBeenCalledWith('transition-start');
      expect(performanceSpy).toHaveBeenCalledWith('transition-end');
    });

    it('should measure frame drops during transitions', async () => {
      const frameDropSpy = vi.fn();
      transitionManager.setPerformanceCallback(frameDropSpy);

      await transitionManager.shutterTransition('capture', 'focus');

      expect(frameDropSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'transition-performance',
          frameDrops: expect.any(Number),
          averageFrameTime: expect.any(Number)
        })
      );
    });
  });
});