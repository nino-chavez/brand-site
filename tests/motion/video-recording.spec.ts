/**
 * Video Recording Motion Tests
 *
 * Automated tests that record video of critical animations and interactions.
 * Videos are saved for manual review and documentation.
 */

import { test, expect } from '@playwright/test';

// Video recording is enabled in playwright.motion.config.ts
test.describe('Video Recording - Critical Animations', () => {

  test('record magnetic button interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const button = page.getByTestId('view-work-cta');
    await button.waitFor({ state: 'visible' });

    const box = await button.boundingBox()!;

    // Perform circular motion around button to demonstrate magnetic effect
    const steps = 60;
    const radius = 100;
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      await page.mouse.move(x, y);
      await page.waitForTimeout(33); // ~30fps
    }

    // Hover directly on button
    await page.mouse.move(centerX, centerY);
    await page.waitForTimeout(500);

    // Move away
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);

    console.log('✅ Video recorded: Magnetic button interaction');
  });

  test('record scroll navigation sync', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start at top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Smoothly scroll through all sections
    const sections = [
      { id: 'capture', wait: 1000 },
      { id: 'focus', wait: 1500 },
      { id: 'frame', wait: 1500 },
      { id: 'exposure', wait: 1500 },
      { id: 'develop', wait: 1500 },
      { id: 'portfolio', wait: 1500 },
    ];

    for (const section of sections) {
      const element = page.locator(`#${section.id}`);
      await element.scrollIntoViewIfNeeded({ behavior: 'smooth' });
      await page.waitForTimeout(section.wait);

      // Highlight active nav button by hovering
      const activeButton = page.locator('[aria-pressed="true"]');
      const btnBox = await activeButton.boundingBox();
      if (btnBox) {
        await page.mouse.move(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2);
        await page.waitForTimeout(500);
      }
    }

    console.log('✅ Video recorded: Scroll navigation sync');
  });

  test('record section entrance animations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Record Focus section animation sequence
    const focusSection = page.locator('#focus');
    await focusSection.scrollIntoViewIfNeeded();

    // Wait for complete animation sequence (staggered)
    await page.waitForTimeout(3000);

    // Record Frame section
    const frameSection = page.locator('#frame');
    await frameSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Record Portfolio/Contact section
    const portfolioSection = page.locator('#portfolio');
    await portfolioSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    console.log('✅ Video recorded: Section entrance animations');
  });

  test('record hero section load animation', async ({ page }) => {
    // Clear cache to ensure fresh load
    await page.goto('/');

    // Wait for complete hero animation sequence
    await page.waitForTimeout(3000);

    // Interact with CTAs
    const viewWorkBtn = page.getByTestId('view-work-cta');
    await viewWorkBtn.hover();
    await page.waitForTimeout(500);

    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);

    console.log('✅ Video recorded: Hero section load');
  });

  test('record navigation click interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click each nav button and record the scroll transition
    const navButtons = ['ABOUT', 'WORK', 'INSIGHTS', 'GALLERY', 'CONTACT'];

    for (const buttonText of navButtons) {
      const button = page.getByRole('button', { name: buttonText });
      await button.click();
      await page.waitForTimeout(1000); // Allow smooth scroll

      // Hover on the now-active button
      await button.hover();
      await page.waitForTimeout(500);
    }

    // Return to home
    await page.getByRole('button', { name: 'HOME' }).click();
    await page.waitForTimeout(1000);

    console.log('✅ Video recorded: Navigation click interactions');
  });

  test('record contact form interaction', async ({ page }) => {
    await page.goto('/');

    // Scroll to contact section
    const portfolioSection = page.locator('#portfolio');
    await portfolioSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Interact with contact methods
    const contactButtons = page.locator('[data-testid$="-contact"]');
    const count = await contactButtons.count();

    for (let i = 0; i < count; i++) {
      await contactButtons.nth(i).hover();
      await page.waitForTimeout(400);
    }

    // Fill out form (animated focus states)
    await page.fill('#name', 'Test User');
    await page.waitForTimeout(300);

    await page.fill('#email', 'test@example.com');
    await page.waitForTimeout(300);

    await page.selectOption('#inquiry-type', 'architecture');
    await page.waitForTimeout(300);

    await page.fill('#message', 'This is a test message to demonstrate form interactions.');
    await page.waitForTimeout(500);

    // Hover submit button
    const submitBtn = page.getByTestId('collaboration-cta');
    await submitBtn.hover();
    await page.waitForTimeout(500);

    console.log('✅ Video recorded: Contact form interaction');
  });
});
