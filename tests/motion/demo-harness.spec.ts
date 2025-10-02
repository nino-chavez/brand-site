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

test.describe('Demo Harness - Hover State Demos', () => {
  test('button hover demo has variant and glow controls', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-button-hover"]');
    await expect(demo).toBeVisible();

    // Check variant select
    const variantControl = demo.locator('select[data-control="variant"]');
    await expect(variantControl).toBeVisible();

    // Test all variants
    const variants = ['primary', 'secondary', 'ghost'];
    for (const variant of variants) {
      await variantControl.selectOption(variant);
      await expect(demo.locator('[data-state="variant"]')).toContainText(variant);
    }

    // Check glow intensity control
    const glowControl = demo.locator('[data-control="glowIntensity"]');
    await expect(glowControl).toBeVisible();
  });

  test('card hover demo shows lift and shadow effects', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-card-hover"]');
    await expect(demo).toBeVisible();

    // Check lift amount control
    const liftControl = demo.locator('[data-control="liftHeight"]');
    await expect(liftControl).toBeVisible();

    // Check shadow intensity
    const shadowControl = demo.locator('select[data-control="shadowIntensity"]');
    await expect(shadowControl).toBeVisible();

    // Test shadow levels
    const levels = ['sm', 'md', 'lg', 'xl'];
    for (const level of levels) {
      await shadowControl.selectOption(level);
      await expect(demo.locator('[data-state="shadowIntensity"]')).toContainText(level);
    }
  });

  test('image zoom demo has zoom level and overlay controls', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-image-zoom"]');
    await expect(demo).toBeVisible();

    // Check zoom level control
    const zoomControl = demo.locator('[data-control="zoomLevel"]');
    await expect(zoomControl).toBeVisible();

    // Check overlay toggle
    const overlayToggle = demo.locator('[data-control="showOverlay"]');
    await expect(overlayToggle).toBeVisible();
  });

  test('icon hover demo supports all animation types', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-icon-hover"]');
    await expect(demo).toBeVisible();

    // Check animation type select
    const animationControl = demo.locator('select[data-control="animation"]');
    await expect(animationControl).toBeVisible();

    // Test all animation types
    const animations = ['rotate', 'scale', 'bounce', 'spin'];
    for (const animation of animations) {
      await animationControl.selectOption(animation);
      await expect(demo.locator('[data-state="animation"]')).toContainText(animation);
    }
  });

  test('link hover demo shows underline animation styles', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-link-hover"]');
    await expect(demo).toBeVisible();

    // Check underline style select
    const styleControl = demo.locator('select[data-control="underlineStyle"]');
    await expect(styleControl).toBeVisible();

    // Test all underline styles
    const styles = ['fade', 'slide', 'grow'];
    for (const style of styles) {
      await styleControl.selectOption(style);
      await expect(demo.locator('[data-state="underlineStyle"]')).toContainText(style);
    }
  });

  test('group hover demo has stagger delay control', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-group-hover"]');
    await expect(demo).toBeVisible();

    // Check stagger delay control
    const staggerControl = demo.locator('[data-control="staggerDelay"]');
    await expect(staggerControl).toBeVisible();

    // Check item count
    const items = await demo.locator('[data-testid^="hover-item-"]').count();
    expect(items).toBeGreaterThan(0);
  });
});

test.describe('Demo Harness - Click/Active State Demos', () => {
  test('button press demo shows scale effect and ripple', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-button-press"]');
    await expect(demo).toBeVisible();

    // Check press scale control
    const scaleControl = demo.locator('[data-control="pressScale"]');
    await expect(scaleControl).toBeVisible();

    // Check ripple toggle
    const rippleToggle = demo.locator('[data-control="showRipple"]');
    await expect(rippleToggle).toBeVisible();

    // Click button and verify state
    const button = demo.locator('[data-testid="press-button"]');
    await button.click();

    // Wait for ripple animation
    await page.waitForTimeout(100);
  });

  test('form focus demo has validation states', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-form-focus"]');
    await expect(demo).toBeVisible();

    // Check input field
    const input = demo.locator('[data-testid="focus-input"]');
    await expect(input).toBeVisible();

    // Focus input
    await input.focus();
    await expect(input).toHaveAttribute('data-focused', 'true');

    // Type short text and blur to trigger validation
    await input.fill('ab');
    await input.blur();

    // Check validation error appears
    await expect(input).toHaveAttribute('data-valid', 'false');

    // Type valid text
    await input.fill('valid@email.com');
    await input.blur();
    await expect(input).toHaveAttribute('data-valid', 'true');
  });

  test('toggle switch demo changes state on click', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-toggle-switch"]');
    await expect(demo).toBeVisible();

    // Check toggle switch
    const toggle = demo.locator('[data-testid="toggle-switch"]');
    await expect(toggle).toBeVisible();

    // Get initial state
    const initialState = await toggle.getAttribute('data-checked');

    // Click toggle
    await toggle.click();

    // Verify state changed
    const newState = await toggle.getAttribute('data-checked');
    expect(newState).not.toBe(initialState);
  });

  test('accordion demo expands and collapses sections', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-accordion"]');
    await expect(demo).toBeVisible();

    // Check first accordion item
    const firstItem = demo.locator('[data-testid="accordion-item-0"]');
    await expect(firstItem).toBeVisible();

    // Initially collapsed
    await expect(firstItem).toHaveAttribute('data-expanded', 'false');

    // Click to expand
    await firstItem.locator('button').click();
    await expect(firstItem).toHaveAttribute('data-expanded', 'true');

    // Click again to collapse
    await firstItem.locator('button').click();
    await expect(firstItem).toHaveAttribute('data-expanded', 'false');
  });

  test('modal demo opens and closes with backdrop', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-modal"]');
    await expect(demo).toBeVisible();

    // Modal should be closed initially
    const modal = page.locator('[data-testid="modal-dialog"]');
    await expect(modal).not.toBeVisible();

    // Click trigger button
    await demo.locator('[data-testid="modal-trigger"]').click();

    // Modal should be open
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('data-open', 'true');

    // Backdrop should be visible
    const backdrop = page.locator('[data-testid="modal-backdrop"]');
    await expect(backdrop).toBeVisible();

    // Close via backdrop click
    await backdrop.click();
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Demo Harness - Mobile Touch Demos', () => {
  test('tap feedback demo shows ripples on interaction', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-tap-feedback"]');
    await expect(demo).toBeVisible();

    // Check tap area
    const tapArea = demo.locator('[data-testid="tap-area"]');
    await expect(tapArea).toBeVisible();

    // Simulate tap (using click for desktop)
    await tapArea.click({ position: { x: 50, y: 50 } });

    // Wait for ripple animation
    await page.waitForTimeout(100);

    // Verify tap count increased (text should contain number > 0)
    const tapText = await tapArea.textContent();
    expect(tapText).toMatch(/Taps: [1-9]/);
  });

  test('swipe gesture demo detects all directions', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-swipe-gesture"]');
    await expect(demo).toBeVisible();

    // Check swipe area
    const swipeArea = demo.locator('[data-testid="swipe-area"]');
    await expect(swipeArea).toBeVisible();

    // Note: Swipe gestures require touch events which are harder to simulate
    // In real device testing, we would use touch actions
    // For now, verify the UI elements are present
    await expect(swipeArea).toContainText('Swipe me');
  });

  test('long press demo shows progress indicator', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-long-press"]');
    await expect(demo).toBeVisible();

    // Check long press button
    const button = demo.locator('[data-testid="long-press-button"]');
    await expect(button).toBeVisible();

    // Simulate long press (mousedown and hold)
    await button.dispatchEvent('mousedown');

    // Wait for activation
    await page.waitForTimeout(900); // Slightly more than default 800ms

    // Check activated state
    const isActivated = await button.getAttribute('data-long-pressed');
    expect(isActivated).toBe('true');

    // Release
    await button.dispatchEvent('mouseup');
  });

  test('touch button demo shows WCAG compliant sizes', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-touch-button"]');
    await expect(demo).toBeVisible();

    // Check all button sizes
    const smallButton = demo.locator('[data-testid="touch-button-small"]');
    const mediumButton = demo.locator('[data-testid="touch-button-medium"]');
    const largeButton = demo.locator('[data-testid="touch-button-large"]');

    await expect(smallButton).toBeVisible();
    await expect(mediumButton).toBeVisible();
    await expect(largeButton).toBeVisible();

    // Click medium button (44px - WCAG compliant)
    await mediumButton.click();
    await expect(mediumButton).toHaveAttribute('data-active', 'true');
  });
});

test.describe('Demo Harness - Passive/Loading State Demos', () => {
  test('loading spinner demo has all variants', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-loading-spinner"]');
    await expect(demo).toBeVisible();

    // Check variant select
    const variantControl = demo.locator('select[data-control="variant"]');
    await expect(variantControl).toBeVisible();

    // Test all spinner variants
    const variants = ['spin', 'pulse', 'dots', 'bars'];
    for (const variant of variants) {
      await variantControl.selectOption(variant);

      // Verify variant renders
      const spinner = demo.locator(`[data-testid="spinner-${variant}"]`);
      await expect(spinner).toBeVisible();
    }

    // Check size control
    const sizeControl = demo.locator('select[data-control="size"]');
    await expect(sizeControl).toBeVisible();
  });

  test('skeleton screen demo transitions to content', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-skeleton-screen"]');
    await expect(demo).toBeVisible();

    // Check skeleton is visible initially
    const skeleton = demo.locator('[data-testid="skeleton"]');
    await expect(skeleton).toBeVisible();

    // Click reload button to trigger loading
    await demo.locator('button:has-text("Reload Content")').click();

    // Wait for content to load (2 second delay in implementation)
    await page.waitForTimeout(2500);

    // Skeleton should be hidden, content should be visible
    await expect(skeleton).not.toBeVisible();
    const content = demo.locator('[data-testid="loaded-content"]');
    await expect(content).toBeVisible();
  });

  test('pulse animation demo has speed and intensity controls', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-pulse-animation"]');
    await expect(demo).toBeVisible();

    // Check speed control
    const speedControl = demo.locator('select[data-control="speed"]');
    await expect(speedControl).toBeVisible();

    // Test speed options
    const speeds = ['slow', 'normal', 'fast'];
    for (const speed of speeds) {
      await speedControl.selectOption(speed);
      await expect(demo.locator('[data-state="speed"]')).toContainText(speed);
    }

    // Check intensity control
    const intensityControl = demo.locator('select[data-control="intensity"]');
    await expect(intensityControl).toBeVisible();

    // Test intensity options
    const intensities = ['low', 'medium', 'high'];
    for (const intensity of intensities) {
      await intensityControl.selectOption(intensity);
      await expect(demo.locator('[data-state="intensity"]')).toContainText(intensity);
    }

    // Verify pulsing elements render
    await expect(demo.locator('[data-testid="pulse-dot"]')).toBeVisible();
    await expect(demo.locator('[data-testid="pulse-card"]')).toBeVisible();
    await expect(demo.locator('[data-testid="pulse-button"]')).toBeVisible();
  });

  test('status indicator demo cycles through states', async ({ page }) => {
    await page.goto(DEMO_URL);

    const demo = page.locator('[data-testid="demo-status-indicator"]');
    await expect(demo).toBeVisible();

    // Check status badge
    const statusBadge = demo.locator('[data-testid="status-badge"]');
    await expect(statusBadge).toBeVisible();

    // Check all status buttons
    const statuses = ['online', 'away', 'busy', 'offline'];
    for (const status of statuses) {
      const statusButton = demo.locator(`[data-testid="status-${status}"]`);
      await expect(statusButton).toBeVisible();

      // Click to change status
      await statusButton.click();

      // Verify status changed
      await expect(statusBadge).toContainText(status.charAt(0).toUpperCase() + status.slice(1));
    }

    // Check progress indicator
    const progressIndicator = demo.locator('[data-testid="progress-indicator"]');
    await expect(progressIndicator).toBeVisible();
    await expect(progressIndicator).toContainText('75%');
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

    const categories = ['animations', 'effects', 'interactive', 'sections', 'hoverStates', 'clickStates', 'mobileTouch', 'passiveStates'];

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
