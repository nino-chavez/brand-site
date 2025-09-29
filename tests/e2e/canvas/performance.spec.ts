import { test, expect } from '@playwright/test';
import { CanvasTestHelper } from '../utils/canvas-helpers';

/**
 * Canvas Performance Tests
 *
 * Validates performance requirements:
 * - 60fps maintenance during camera movements
 * - Memory usage optimization
 * - Hardware acceleration utilization
 * - Performance degradation handling
 */

test.describe('Canvas Performance Validation', () => {
  let canvasHelper: CanvasTestHelper;

  test.beforeEach(async ({ page }) => {
    canvasHelper = new CanvasTestHelper(page);
    await canvasHelper.initializeCanvas();
  });

  test.describe('FPS Performance', () => {
    test('should maintain 60fps during all camera movements', async () => {
      const cameraMovements = [
        { name: 'pan-tilt', position: { x: 200, y: 150, scale: 1.0 } },
        { name: 'zoom-in', position: { x: 0, y: 0, scale: 1.8 } },
        { name: 'zoom-out', position: { x: 0, y: 0, scale: 0.7 } },
        { name: 'diagonal-move', position: { x: 250, y: 180, scale: 1.3 } },
        { name: 'extreme-zoom', position: { x: 100, y: 50, scale: 2.5 } }
      ];

      const performanceResults = [];

      for (const movement of cameraMovements) {
        const metrics = await canvasHelper.performCameraMovement(movement.position);
        performanceResults.push({ movement: movement.name, ...metrics });

        // Verify 60fps requirement (with 5fps tolerance)
        expect(metrics.fps, `${movement.name} should maintain 60fps`).toBeGreaterThanOrEqual(55);
        expect(metrics.frameTime, `${movement.name} frame time should be ≤ 18ms`).toBeLessThanOrEqual(18);
        expect(metrics.transitionDuration, `${movement.name} should complete within 800ms`).toBeLessThanOrEqual(800);

        await canvasHelper.waitForTransition();
      }

      console.log('Performance results:', performanceResults);
    });

    test('should handle rapid sequential movements without FPS degradation', async ({ page }) => {
      const rapidMovements = [
        { x: 100, y: 50, scale: 1.2 },
        { x: -80, y: 120, scale: 0.9 },
        { x: 150, y: -60, scale: 1.5 },
        { x: 0, y: 0, scale: 1.0 },
        { x: 200, y: 100, scale: 1.3 }
      ];

      const results = [];

      for (let i = 0; i < rapidMovements.length; i++) {
        const metrics = await canvasHelper.performCameraMovement(rapidMovements[i]);
        results.push(metrics);

        // Very short delay between movements
        await page.waitForTimeout(50);
      }

      // Verify no significant FPS degradation across rapid movements
      const avgFPS = results.reduce((sum, r) => sum + r.fps, 0) / results.length;
      expect(avgFPS, 'Average FPS should remain high during rapid movements').toBeGreaterThanOrEqual(50);

      // Last movement should still be performant
      const lastMovement = results[results.length - 1];
      expect(lastMovement.fps, 'Final movement should maintain performance').toBeGreaterThanOrEqual(50);
    });

    test('should adapt performance under CPU stress', async ({ page }) => {
      // Simulate CPU stress
      await page.evaluate(() => {
        // Create CPU load
        const startTime = Date.now();
        const workers = [];

        for (let i = 0; i < 4; i++) {
          const workerCode = `
            let count = 0;
            function stress() {
              for (let j = 0; j < 100000; j++) {
                count += Math.random();
              }
              setTimeout(stress, 1);
            }
            stress();
          `;

          const blob = new Blob([workerCode], { type: 'application/javascript' });
          const worker = new Worker(URL.createObjectURL(blob));
          workers.push(worker);
        }

        // Store workers for cleanup
        (window as any).__stressWorkers = workers;
      });

      // Test performance under stress
      const metrics = await canvasHelper.performCameraMovement({ x: 150, y: 100, scale: 1.4 });

      // Should gracefully degrade but still be usable
      expect(metrics.fps, 'Should maintain minimum FPS under stress').toBeGreaterThanOrEqual(30);
      expect(metrics.transitionDuration, 'May take longer under stress').toBeLessThanOrEqual(1500);

      // Cleanup stress test
      await page.evaluate(() => {
        const workers = (window as any).__stressWorkers || [];
        workers.forEach((worker: Worker) => worker.terminate());
      });
    });
  });

  test.describe('Memory Performance', () => {
    test('should not leak memory during extended use', async ({ page }) => {
      // Get initial memory baseline
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });

      // Perform many camera movements to test for leaks
      for (let i = 0; i < 20; i++) {
        await canvasHelper.performCameraMovement({
          x: Math.random() * 400 - 200,
          y: Math.random() * 300 - 150,
          scale: 0.8 + Math.random() * 1.4
        });
        await page.waitForTimeout(100);
      }

      // Force garbage collection if available
      await page.evaluate(() => {
        if ('gc' in window) {
          (window as any).gc();
        }
      });

      await page.waitForTimeout(1000);

      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });

      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercentage = (memoryIncrease / initialMemory) * 100;

        console.log(`Memory usage: ${initialMemory} → ${finalMemory} (${memoryIncreasePercentage.toFixed(1)}% increase)`);

        // Memory increase should be reasonable (less than 50% for 20 movements)
        expect(memoryIncreasePercentage, 'Memory increase should be reasonable').toBeLessThan(50);
      }
    });

    test('should handle memory pressure gracefully', async ({ page }) => {
      // Create memory pressure
      await page.evaluate(() => {
        const memoryConsumers = [];

        // Consume significant memory
        for (let i = 0; i < 50; i++) {
          memoryConsumers.push(new Array(100000).fill(Math.random()));
        }

        (window as any).__memoryPressure = memoryConsumers;
      });

      // Test canvas functionality under memory pressure
      const metrics = await canvasHelper.performCameraMovement({ x: 120, y: 80, scale: 1.2 });

      // Should still work but may have reduced performance
      expect(metrics.fps, 'Should maintain minimum FPS under memory pressure').toBeGreaterThanOrEqual(25);

      // Cleanup memory pressure
      await page.evaluate(() => {
        delete (window as any).__memoryPressure;
      });
    });
  });

  test.describe('Hardware Acceleration', () => {
    test('should utilize GPU acceleration when available', async ({ page }) => {
      // Check for GPU acceleration indicators
      const gpuInfo = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) return { supported: false };

        return {
          supported: true,
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          version: gl.getParameter(gl.VERSION)
        };
      });

      console.log('GPU acceleration info:', gpuInfo);

      if (gpuInfo.supported) {
        // Test performance with GPU acceleration
        const metrics = await canvasHelper.performCameraMovement({ x: 200, y: 150, scale: 1.5 });
        expect(metrics.fps, 'GPU acceleration should provide high FPS').toBeGreaterThanOrEqual(55);
      }
    });

    test('should fall back gracefully without GPU acceleration', async ({ page }) => {
      // Disable GPU acceleration for this test
      await page.evaluate(() => {
        // Force software rendering
        const style = document.createElement('style');
        style.textContent = `
          * {
            transform-style: flat !important;
            -webkit-transform-style: flat !important;
          }
          .lightbox-canvas * {
            will-change: auto !important;
            transform: translateZ(0) !important;
          }
        `;
        document.head.appendChild(style);
      });

      // Test performance without GPU acceleration
      const metrics = await canvasHelper.performCameraMovement({ x: 150, y: 100, scale: 1.3 });

      // Should still work but with lower performance requirements
      expect(metrics.fps, 'Software rendering should maintain minimum FPS').toBeGreaterThanOrEqual(30);
      expect(metrics.transitionDuration, 'Software rendering may take longer').toBeLessThanOrEqual(1200);
    });

    test('should detect and use CSS transform optimizations', async ({ page }) => {
      // Check which transform properties are being used
      const transformInfo = await page.evaluate(() => {
        const canvasContent = document.querySelector('.canvas-content') as HTMLElement;

        if (!canvasContent) return null;

        const computedStyle = getComputedStyle(canvasContent);

        return {
          transform: computedStyle.transform,
          willChange: computedStyle.willChange,
          backfaceVisibility: computedStyle.backfaceVisibility,
          perspective: computedStyle.perspective
        };
      });

      console.log('CSS transform optimizations:', transformInfo);

      if (transformInfo) {
        // Verify hardware acceleration hints are present
        expect(transformInfo.transform).toContain('matrix'); // Should use matrix transforms

        // Performance test with optimizations
        const metrics = await canvasHelper.performCameraMovement({ x: 180, y: 120, scale: 1.4 });
        expect(metrics.fps, 'Optimized transforms should provide good performance').toBeGreaterThanOrEqual(50);
      }
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should track and report performance metrics', async ({ page }) => {
      // Enable performance monitoring
      const performanceData = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {
            navigationStart: performance.timing.navigationStart,
            loadComplete: performance.timing.loadEventEnd,
            domComplete: performance.timing.domComplete,
            renderStart: Date.now()
          };

          // Monitor canvas-specific performance
          let frameCount = 0;
          const frameimes = [];
          const startTime = performance.now();

          const monitorFrame = (currentTime: number) => {
            frameCount++;
            if (frameCount > 1) {
              const frameTime = currentTime - lastFrameTime;
              frameimes.push(frameTime);
            }
            const lastFrameTime = currentTime;

            if (currentTime - startTime < 2000) { // Monitor for 2 seconds
              requestAnimationFrame(monitorFrame);
            } else {
              const avgFrameTime = frameimes.reduce((a, b) => a + b, 0) / frameimes.length;
              resolve({
                ...metrics,
                averageFrameTime: avgFrameTime,
                fps: Math.round(1000 / avgFrameTime),
                totalFrames: frameCount
              });
            }
          };

          requestAnimationFrame(monitorFrame);
        });
      });

      console.log('Performance monitoring results:', performanceData);

      // Verify performance metrics are reasonable
      expect(performanceData.fps, 'Monitored FPS should be good').toBeGreaterThanOrEqual(50);
      expect(performanceData.averageFrameTime, 'Average frame time should be low').toBeLessThanOrEqual(20);
    });

    test('should trigger performance optimizations when needed', async ({ page }) => {
      // Simulate performance degradation
      await page.evaluate(() => {
        // Create artificial performance bottleneck
        const stressTest = () => {
          for (let i = 0; i < 100000; i++) {
            Math.random();
          }
          requestAnimationFrame(stressTest);
        };
        requestAnimationFrame(stressTest);
      });

      // Perform movement that should trigger optimization
      const metrics = await canvasHelper.performCameraMovement({ x: 200, y: 150, scale: 1.6 });

      // Check if optimizations were applied
      const optimizationStatus = await page.evaluate(() => {
        const canvas = document.querySelector('[data-testid="lightbox-canvas"]') as HTMLElement;
        return {
          optimizedClass: canvas?.classList.contains('optimized-rendering'),
          imageRendering: canvas?.style.imageRendering,
          quality: (window as any).__CANVAS_QUALITY_LEVEL__
        };
      });

      console.log('Performance optimization status:', optimizationStatus);

      // Should either maintain performance or show optimization was applied
      const performanceOK = metrics.fps >= 50;
      const optimizationApplied = optimizationStatus.optimizedClass || optimizationStatus.imageRendering;

      expect(performanceOK || optimizationApplied, 'Should maintain performance or apply optimizations').toBe(true);
    });
  });

  test.describe('Real-World Performance Scenarios', () => {
    test('should handle typical user navigation patterns', async ({ page }) => {
      // Simulate realistic user behavior
      const userActions = [
        { action: 'initial_load', position: { x: 0, y: 0, scale: 1.0 } },
        { action: 'explore_right', position: { x: 150, y: 0, scale: 1.0 } },
        { action: 'zoom_in_detail', position: { x: 150, y: 0, scale: 1.5 } },
        { action: 'pan_to_content', position: { x: 200, y: 100, scale: 1.5 } },
        { action: 'zoom_out_overview', position: { x: 100, y: 50, scale: 0.8 } },
        { action: 'return_center', position: { x: 0, y: 0, scale: 1.0 } }
      ];

      const actionResults = [];

      for (const userAction of userActions) {
        const startTime = Date.now();
        const metrics = await canvasHelper.performCameraMovement(userAction.position);
        const totalTime = Date.now() - startTime;

        actionResults.push({
          action: userAction.action,
          fps: metrics.fps,
          duration: totalTime,
          frameTime: metrics.frameTime
        });

        // Brief pause between actions (realistic user behavior)
        await page.waitForTimeout(500);
      }

      console.log('User navigation performance:', actionResults);

      // All actions should maintain good performance
      actionResults.forEach((result) => {
        expect(result.fps, `${result.action} should maintain good FPS`).toBeGreaterThanOrEqual(45);
        expect(result.duration, `${result.action} should complete quickly`).toBeLessThanOrEqual(1000);
      });
    });

    test('should perform well during multitasking scenarios', async ({ page }) => {
      // Simulate background tasks
      await page.evaluate(() => {
        // Background image loading simulation
        const images = [];
        for (let i = 0; i < 10; i++) {
          const img = new Image();
          img.src = `data:image/svg+xml;base64,${btoa('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="red"/></svg>')}`;
          images.push(img);
        }

        // Background computation
        let computationResult = 0;
        const backgroundCompute = () => {
          for (let i = 0; i < 1000; i++) {
            computationResult += Math.sqrt(Math.random() * 1000);
          }
          setTimeout(backgroundCompute, 10);
        };
        backgroundCompute();

        (window as any).__backgroundTasks = { images, computationResult };
      });

      // Test canvas performance during multitasking
      const metrics = await canvasHelper.performCameraMovement({ x: 180, y: 130, scale: 1.3 });

      // Should maintain reasonable performance during multitasking
      expect(metrics.fps, 'Should handle multitasking scenarios').toBeGreaterThanOrEqual(40);
      expect(metrics.transitionDuration, 'Should complete transitions during multitasking').toBeLessThanOrEqual(1000);
    });
  });
});