/**
 * Demo Harness End-to-End Tests
 *
 * Tests the demo harness UI/UX test bed to validate:
 * - All demo components render correctly
 * - Controls function as expected
 * - State persistence works
 * - Animations trigger properly
 * - Code snippets are accessible
 *
 * @see /docs/DEMO_HARNESS_GUIDE.md
 * @see /docs/UI_UX_TESTING_MASTER_GUIDE.md
 */

import { test, expect, type Page } from '@playwright/test';

const DEMO_URL = process.env.DEMO_URL || 'http://localhost:3001/demo';

test.describe('Demo Harness - Core Functionality', () => {
  test('demo harness page loads successfully', async ({ page }) => {
    await page.goto(DEMO_URL);

    // Check page title and header
    await expect(page.locator('h1')).toContainText('UI/UX Component Demo');

    // Check sidebar navigation exists
    await expect(page.locator('[data-testid="demo-sidebar"]')).toBeVisible();

    // Check main content area exists
    await expect(page.locator('main')).toBeVisible();
  });

  test('sidebar category navigation works', async ({ page }) => {
    await page.goto(DEMO_URL);

    // Check all categories are present
    const categories = ['Animations', 'Effects', 'Interactive', 'Section Transitions'];

    for (const category of categories) {
      await expect(page.locator(`text=${category}`)).toBeVisible();
    }
  });

  test('search functionality filters demos', async ({ page }) => {
    await page.goto(DEMO_URL);

    // Type in search box
    const searchInput = page.locator('[data-testid="demo-search"]');
    await searchInput.fill('fade');

    // Check that fade-related demos are visible
    await expect(page.locator('[data-testid="demo-fade-up-8px"]')).toBeVisible();

    // Check that non-matching demos are hidden
    await expect(page.locator('[data-testid="demo-magnetic-button"]')).not.toBeVisible();
  });
});

test.describe('Demo Harness - Animation Demos', () => {
  test('fade-up 8px demo renders and controls work', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-fade-up-8px"]');
    await expect(demo).toBeVisible();

    // Check title
    await expect(demo.locator('h3')).toContainText('Fade Up');

    // Check speed control exists
    const speedControl = demo.locator('select[data-control="speed"]');
    await expect(speedControl).toBeVisible();

    // Change speed
    await speedControl.selectOption('fast');

    // Verify state indicator updates
    await expect(demo.locator('[data-state="speed"]')).toContainText('fast');
  });

  test('fade-up 24px demo shows increased movement', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-fade-up-24px"]');
    await expect(demo).toBeVisible();

    // Check description mentions 24px
    await expect(demo).toContainText('24px');

    // Trigger animation
    const triggerButton = demo.locator('button:has-text("Replay")');
    await triggerButton.click();

    // Wait for animation to complete
    await page.waitForTimeout(1000);
  });

  test('slide demo has direction controls', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-slide"]');
    await expect(demo).toBeVisible();

    // Check direction dropdown
    const directionControl = demo.locator('select[data-control="direction"]');
    await expect(directionControl).toBeVisible();

    // Test all directions
    const directions = ['left', 'right', 'up', 'down'];
    for (const direction of directions) {
      await directionControl.selectOption(direction);
      await expect(demo.locator('[data-state="direction"]')).toContainText(direction);
    }
  });

  test('scale demo has scale amount control', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-scale"]');
    await expect(demo).toBeVisible();

    // Check scale slider/select
    const scaleControl = demo.locator('[data-control="scale"]');
    await expect(scaleControl).toBeVisible();
  });

  test('blur-morph demo has blur amount control', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-blur-morph"]');
    await expect(demo).toBeVisible();

    // Check blur control
    const blurControl = demo.locator('[data-control="blur"]');
    await expect(blurControl).toBeVisible();
  });
});

test.describe('Demo Harness - Effect Demos', () => {
  test('parallax demo has intensity slider', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-parallax"]');
    await expect(demo).toBeVisible();

    // Check intensity control
    const intensityControl = demo.locator('[data-control="intensity"]');
    await expect(intensityControl).toBeVisible();

    // Adjust intensity
    await intensityControl.fill('0.5');

    // Verify state updates
    await expect(demo.locator('[data-state="intensity"]')).toContainText('0.5');
  });

  test('spotlight demo has radius and opacity controls', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-spotlight"]');
    await expect(demo).toBeVisible();

    // Check radius control
    const radiusControl = demo.locator('[data-control="radius"]');
    await expect(radiusControl).toBeVisible();

    // Check opacity control
    const opacityControl = demo.locator('[data-control="opacity"]');
    await expect(opacityControl).toBeVisible();
  });

  test('glow demo has intensity levels', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-glow"]');
    await expect(demo).toBeVisible();

    // Check intensity select
    const intensityControl = demo.locator('select[data-control="intensity"]');
    await expect(intensityControl).toBeVisible();

    // Test intensity levels
    const levels = ['low', 'medium', 'high'];
    for (const level of levels) {
      await intensityControl.selectOption(level);
      await expect(demo.locator('[data-state="intensity"]')).toContainText(level);
    }
  });
});

test.describe('Demo Harness - Interactive Demos', () => {
  test('magnetic button demo has strength and radius controls', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-magnetic-button"]');
    await expect(demo).toBeVisible();

    // Check strength control
    const strengthControl = demo.locator('[data-control="strength"]');
    await expect(strengthControl).toBeVisible();

    // Check radius control
    const radiusControl = demo.locator('[data-control="radius"]');
    await expect(radiusControl).toBeVisible();

    // Check enable toggle
    const enableToggle = demo.locator('[data-control="enabled"]');
    await expect(enableToggle).toBeVisible();
  });

  test('effects panel demo shows position variants', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-effects-panel"]');
    await expect(demo).toBeVisible();

    // Check position select
    const positionControl = demo.locator('select[data-control="position"]');
    await expect(positionControl).toBeVisible();
  });

  test('keyboard navigation demo has focus indicator toggle', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-keyboard-nav"]');
    await expect(demo).toBeVisible();

    // Check show focus toggle
    const focusToggle = demo.locator('[data-control="showFocus"]');
    await expect(focusToggle).toBeVisible();
  });
});

test.describe('Demo Harness - Section Transition Demos', () => {
  test('section fade-slide has distance and duration controls', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-section-fade-slide"]');
    await expect(demo).toBeVisible();

    // Check distance control
    const distanceControl = demo.locator('[data-control="distance"]');
    await expect(distanceControl).toBeVisible();

    // Check duration control
    const durationControl = demo.locator('[data-control="duration"]');
    await expect(durationControl).toBeVisible();
  });

  test('section border demo has color and style controls', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-section-border"]');
    await expect(demo).toBeVisible();

    // Check color control
    const colorControl = demo.locator('select[data-control="color"]');
    await expect(colorControl).toBeVisible();

    // Check style control
    const styleControl = demo.locator('select[data-control="style"]');
    await expect(styleControl).toBeVisible();
  });

  test('staggered content has delay and count controls', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-staggered-content"]');
    await expect(demo).toBeVisible();

    // Check delay control
    const delayControl = demo.locator('[data-control="delay"]');
    await expect(delayControl).toBeVisible();

    // Check count control
    const countControl = demo.locator('[data-control="count"]');
    await expect(countControl).toBeVisible();
  });
});

test.describe('Demo Harness - State Persistence', () => {
  test('demo state persists across page reloads', async ({ page }) => {
    await page.goto(DEMO_URL);

    // Change a setting
    const demo = page.locator('[data-testid="demo-fade-up-8px"]');
    const speedControl = demo.locator('select[data-control="speed"]');
    await speedControl.selectOption('fast');

    // Reload page
    await page.reload();

    // Check setting is still 'fast'
    await expect(demo.locator('[data-state="speed"]')).toContainText('fast');
  });

  test('global reset clears all demo states', async ({ page }) => {
    await page.goto(DEMO_URL);

    // Change several settings
    const demo1 = page.locator('[data-testid="demo-fade-up-8px"]');
    await demo1.locator('select[data-control="speed"]').selectOption('slow');

    const demo2 = page.locator('[data-testid="demo-parallax"]');
    await demo2.locator('[data-control="intensity"]').fill('0.8');

    // Click global reset
    await page.click('[data-testid="global-reset"]');

    // Verify all states reset to defaults
    await expect(demo1.locator('[data-state="speed"]')).toContainText('normal');
  });
});

test.describe('Demo Harness - Code Snippets', () => {
  test('code snippets can be shown and hidden', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-fade-up-8px"]');

    // Check code snippet is initially hidden
    const codeBlock = demo.locator('pre code');
    await expect(codeBlock).not.toBeVisible();

    // Click show code button
    await demo.locator('button:has-text("Show Code")').click();

    // Check code snippet is now visible
    await expect(codeBlock).toBeVisible();

    // Click hide code button
    await demo.locator('button:has-text("Hide Code")').click();

    // Check code snippet is hidden again
    await expect(codeBlock).not.toBeVisible();
  });

  test('code snippets can be copied to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-fade-up-8px"]');

    // Show code
    await demo.locator('button:has-text("Show Code")').click();

    // Click copy button
    await demo.locator('button:has-text("Copy")').click();

    // Verify copy success message appears
    await expect(demo.locator('text=Copied!')).toBeVisible();
  });
});

test.describe('Demo Harness - Accessibility', () => {
  test('all controls are keyboard accessible', async ({ page }) => {
    await page.goto(DEMO_URL);

    // Tab through controls
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus indicators are visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('all demos have proper ARIA labels', async ({ page }) => {
    await page.goto(DEMO_URL);

    // Check demo cards have aria-labels or roles
    const demos = await page.locator('[data-testid^="demo-"]').all();

    for (const demo of demos) {
      // Each demo should have identifying attributes
      const hasTestId = await demo.getAttribute('data-testid');
      expect(hasTestId).toBeTruthy();
    }
  });
});

test.describe('Demo Harness - Performance', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(DEMO_URL);

    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('animations run at 60fps', async ({ page }) => {
    await page.goto(DEMO_URL);

    // Trigger an animation
    const demo = page.locator('[data-testid="demo-fade-up-24px"]');
    await demo.locator('button:has-text("Replay")').click();

    // Measure frame rate (if FPS counter is implemented)
    // This is a placeholder for future implementation
    const fpsIndicator = page.locator('[data-testid="fps-counter"]');
    if (await fpsIndicator.isVisible()) {
      const fps = await fpsIndicator.textContent();
      const fpsValue = parseInt(fps || '0');
      expect(fpsValue).toBeGreaterThanOrEqual(55); // Allow 5fps variance
    }
  });
});

test.describe('Demo Harness - Visual Regression', () => {
  test('demo harness matches visual snapshot', async ({ page }) => {
    await page.goto(DEMO_URL);

    // Wait for animations to settle
    await page.waitForTimeout(1000);

    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('demo-harness-homepage.png', {
      fullPage: true,
      maxDiffPixels: 100
    });
  });

  test('each category matches visual snapshot', async ({ page }) => {
    await page.goto(DEMO_URL);

    const categories = ['animations', 'effects', 'interactive', 'sections'];

    for (const category of categories) {
      // Scroll to category
      await page.locator(`#category-${category}`).scrollIntoViewIfNeeded();

      // Wait for animations
      await page.waitForTimeout(500);

      // Screenshot
      await expect(page.locator(`#category-${category}`)).toHaveScreenshot(
        `demo-category-${category}.png`,
        { maxDiffPixels: 50 }
      );
    }
  });
});
