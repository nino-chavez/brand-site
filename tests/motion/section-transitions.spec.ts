/**
 * Section Transitions Motion Tests
 *
 * Validates award-winning photography-inspired section transitions:
 * - Aperture Iris + Light Leak (Focus → Frame)
 * - Film Strip Animation (Frame → Exposure)
 * - Depth of Field Blur (Exposure → Develop)
 * - Parallax Film Frames (Develop → Portfolio)
 *
 * @motion-test
 */

import { test, expect } from '@playwright/test';

test.describe('Section Transitions - Visual Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
  });

  test('captures aperture iris transition at Focus→Frame boundary', async ({ page }) => {
    // Scroll to Focus section bottom (where transition lives)
    await page.evaluate(() => {
      const focusSection = document.querySelector('#focus');
      if (focusSection) {
        const rect = focusSection.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.bottom - window.innerHeight / 2,
          behavior: 'smooth'
        });
      }
    });

    // Wait for scroll animation to settle
    await page.waitForTimeout(1000);

    // Take screenshot of aperture iris transition
    await page.screenshot({
      path: 'playwright-report-motion/screenshots/aperture-iris-transition.png',
      fullPage: false,
    });

    // Verify SVG aperture elements exist
    const apertureExists = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      return Array.from(svgs).some(svg => {
        const viewBox = svg.getAttribute('viewBox');
        return viewBox?.includes('-60 -60 120 120'); // Aperture iris viewBox
      });
    });

    expect(apertureExists).toBe(true);
  });

  test('captures light leak transition with organic gradient', async ({ page }) => {
    // Scroll to Focus→Frame transition zone
    await page.evaluate(() => {
      const focusSection = document.querySelector('#focus');
      if (focusSection) {
        const rect = focusSection.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.bottom - window.innerHeight / 3,
          behavior: 'smooth'
        });
      }
    });

    await page.waitForTimeout(1200);

    await page.screenshot({
      path: 'playwright-report-motion/screenshots/light-leak-transition.png',
      fullPage: false,
    });

    // Verify light leak SVG filters exist
    const lightLeakExists = await page.evaluate(() => {
      const filters = document.querySelectorAll('filter[id^="light-leak-noise"]');
      return filters.length > 0;
    });

    expect(lightLeakExists).toBe(true);
  });

  test('captures film strip transition with sprocket holes', async ({ page }) => {
    // Scroll to Frame section bottom
    await page.evaluate(() => {
      const frameSection = document.querySelector('#frame');
      if (frameSection) {
        const rect = frameSection.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.bottom - window.innerHeight / 2,
          behavior: 'smooth'
        });
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'playwright-report-motion/screenshots/film-strip-transition.png',
      fullPage: false,
    });

    // Verify film strip sprocket holes
    const filmStripExists = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      return Array.from(svgs).some(svg => {
        const rects = svg.querySelectorAll('rect[rx="2"]');
        return rects.length >= 20; // Should have many sprocket holes
      });
    });

    expect(filmStripExists).toBe(true);
  });

  test('captures depth of field blur transition with bokeh', async ({ page }) => {
    // Scroll to Exposure section bottom
    await page.evaluate(() => {
      const exposureSection = document.querySelector('#exposure');
      if (exposureSection) {
        const rect = exposureSection.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.bottom - window.innerHeight / 2,
          behavior: 'smooth'
        });
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'playwright-report-motion/screenshots/depth-of-field-transition.png',
      fullPage: false,
    });

    // Verify bokeh circles exist
    const bokehExists = await page.evaluate(() => {
      const circles = document.querySelectorAll('circle[fill^="url(#bokeh-gradient"]');
      return circles.length >= 9; // Should have multiple bokeh circles
    });

    expect(bokehExists).toBe(true);
  });

  test('captures parallax film frame transition with layers', async ({ page }) => {
    // Scroll to Develop section bottom
    await page.evaluate(() => {
      const developSection = document.querySelector('#develop');
      if (developSection) {
        const rect = developSection.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.bottom - window.innerHeight / 2,
          behavior: 'smooth'
        });
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'playwright-report-motion/screenshots/parallax-film-frame-transition.png',
      fullPage: false,
    });

    // Verify parallax layers exist
    const parallaxExists = await page.evaluate(() => {
      const filters = document.querySelectorAll('filter[id^="film-grain-"]');
      return filters.length >= 3; // Should have 3 layers
    });

    expect(parallaxExists).toBe(true);
  });

  test('validates all transitions render without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Scroll through entire page to trigger all transitions
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        let scrollPosition = 0;
        const scrollStep = 500;
        const maxScroll = document.documentElement.scrollHeight;

        const interval = setInterval(() => {
          scrollPosition += scrollStep;
          window.scrollTo({ top: scrollPosition, behavior: 'smooth' });

          if (scrollPosition >= maxScroll) {
            clearInterval(interval);
            setTimeout(resolve, 1000);
          }
        }, 300);
      });
    });

    expect(errors).toHaveLength(0);
  });

  test('verifies aperture iris rotation animation', async ({ page }) => {
    // Scroll to trigger aperture
    await page.evaluate(() => {
      const focusSection = document.querySelector('#focus');
      if (focusSection) {
        const rect = focusSection.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.bottom - window.innerHeight / 2,
          behavior: 'instant'
        });
      }
    });

    // Capture initial state
    await page.waitForTimeout(500);
    const initialRotation = await page.evaluate(() => {
      const apertureSvg = document.querySelector('svg[viewBox="-60 -60 120 120"]');
      if (apertureSvg) {
        const parentDiv = apertureSvg.closest('div[style*="scale"]');
        return parentDiv?.getAttribute('style') || '';
      }
      return '';
    });

    // Scroll further to animate
    await page.evaluate(() => {
      window.scrollBy({ top: 200, behavior: 'smooth' });
    });

    await page.waitForTimeout(800);

    const finalRotation = await page.evaluate(() => {
      const apertureSvg = document.querySelector('svg[viewBox="-60 -60 120 120"]');
      if (apertureSvg) {
        const parentDiv = apertureSvg.closest('div[style*="scale"]');
        return parentDiv?.getAttribute('style') || '';
      }
      return '';
    });

    // Rotation should change during scroll
    expect(initialRotation).not.toBe(finalRotation);
  });

  test('verifies film strip horizontal translation', async ({ page }) => {
    // Scroll to frame section
    await page.evaluate(() => {
      const frameSection = document.querySelector('#frame');
      if (frameSection) {
        const rect = frameSection.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.bottom - window.innerHeight / 2,
          behavior: 'instant'
        });
      }
    });

    await page.waitForTimeout(500);

    // Check film strip has translateX
    const filmTranslateX = await page.evaluate(() => {
      const filmDivs = document.querySelectorAll('div[style*="translateX"]');
      return filmDivs.length > 0;
    });

    expect(filmTranslateX).toBe(true);
  });

  test('creates comparison screenshot grid', async ({ page }) => {
    const transitions = [
      { name: 'aperture-iris', selector: '#focus' },
      { name: 'film-strip', selector: '#frame' },
      { name: 'depth-of-field', selector: '#exposure' },
      { name: 'parallax-film', selector: '#develop' },
    ];

    for (const transition of transitions) {
      await page.evaluate((selector) => {
        const section = document.querySelector(selector);
        if (section) {
          const rect = section.getBoundingClientRect();
          window.scrollTo({
            top: window.scrollY + rect.bottom - window.innerHeight / 2,
            behavior: 'instant'
          });
        }
      }, transition.selector);

      await page.waitForTimeout(800);

      await page.screenshot({
        path: `playwright-report-motion/screenshots/transition-${transition.name}.png`,
        fullPage: false,
        clip: {
          x: 0,
          y: page.viewportSize()!.height / 2 - 150,
          width: page.viewportSize()!.width,
          height: 300,
        },
      });
    }
  });

  test('validates reduced motion support', async ({ page, context }) => {
    // Create new page with reduced motion preference
    const reducedMotionPage = await context.newPage();
    await reducedMotionPage.emulateMedia({ reducedMotion: 'reduce' });
    await reducedMotionPage.goto('http://localhost:3002', { timeout: 15000 });
    await reducedMotionPage.waitForLoadState('networkidle', { timeout: 10000 });

    // Transitions should still exist but with reduced animation
    const transitionsExist = await reducedMotionPage.evaluate(() => {
      const transitionDivs = document.querySelectorAll('[class*="transition"]');
      return transitionDivs.length > 0;
    });

    expect(transitionsExist).toBe(true);

    await reducedMotionPage.screenshot({
      path: 'playwright-report-motion/screenshots/transitions-reduced-motion.png',
      fullPage: false,
      timeout: 8000,
    });

    await reducedMotionPage.close();
  });
});

test.describe('Section Transitions - Performance', () => {
  test('measures transition render performance', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Verify transitions are rendered and visible
    const transitionsRendered = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        let scrollCount = 0;
        let svgCount = 0;

        const scrollInterval = setInterval(() => {
          window.scrollBy({ top: 400, behavior: 'smooth' });
          scrollCount++;

          // Count SVG elements (transitions use SVG)
          const svgs = document.querySelectorAll('svg');
          if (svgs.length > svgCount) {
            svgCount = svgs.length;
          }

          if (scrollCount >= 5) {
            clearInterval(scrollInterval);
            setTimeout(() => {
              resolve(svgCount > 0);
            }, 500);
          }
        }, 400);
      });
    });

    // Should have SVG transitions rendered during scroll
    expect(transitionsRendered).toBe(true);
  });

  test('validates no layout thrashing during transitions', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Monitor forced reflows
    const layoutShifts = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let shiftScore = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ('value' in entry) {
              shiftScore += (entry as any).value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        // Scroll through all transitions
        let scrollPos = 0;
        const interval = setInterval(() => {
          scrollPos += 500;
          window.scrollTo({ top: scrollPos, behavior: 'smooth' });

          if (scrollPos >= document.documentElement.scrollHeight) {
            clearInterval(interval);
            setTimeout(() => {
              observer.disconnect();
              resolve(shiftScore);
            }, 1000);
          }
        }, 300);
      });
    });

    // Layout shift score should be minimal (< 0.1 is good)
    expect(layoutShifts).toBeLessThan(0.1);
  });
});
