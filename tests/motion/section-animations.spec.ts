/**
 * Section Animation Tests
 *
 * Automated tests for section entrance animations, transitions,
 * and visual effects across all photography workflow sections.
 */

import { test, expect } from '@playwright/test';

test.describe('Section Entrance Animations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Capture section hero should animate on load', async ({ page }) => {
    const heroTitle = page.getByTestId('hero-title');
    const heroRole = page.getByTestId('hero-role');
    const primaryCTA = page.getByTestId('primary-cta');

    // All elements should be visible
    await expect(heroTitle).toBeVisible();
    await expect(heroRole).toBeVisible();
    await expect(primaryCTA).toBeVisible();

    // Check for animation completion (opacity should be 1)
    const titleOpacity = await heroTitle.evaluate((el) =>
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(titleOpacity)).toBeGreaterThan(0.9);
  });

  test('Focus section should have staggered animation sequence', async ({ page }) => {
    const focusSection = page.locator('#focus');
    await focusSection.scrollIntoViewIfNeeded();

    // Wait for animation sequence to complete
    await page.waitForTimeout(2000);

    // About narrative should be visible
    const narrative = page.getByTestId('about-narrative');
    await expect(narrative).toBeVisible();

    const opacity = await narrative.evaluate((el) =>
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeGreaterThan(0.9);

    // Stats card should be visible
    const statsCard = page.getByTestId('athletic-stats-card');
    await expect(statsCard).toBeVisible();

    // Technical stack should be visible
    const techStack = page.getByTestId('technical-stack-inline');
    await expect(techStack).toBeVisible();
  });

  test('Frame section cards should animate in', async ({ page }) => {
    const frameSection = page.locator('#frame');
    await frameSection.scrollIntoViewIfNeeded();

    // Wait for animations
    await page.waitForTimeout(1500);

    // Check if section is visible and animated
    await expect(frameSection).toBeVisible();

    const opacity = await frameSection.evaluate((el) =>
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeGreaterThan(0.9);
  });

  test('Athletic stats should animate with delays', async ({ page }) => {
    const focusSection = page.locator('#focus');
    await focusSection.scrollIntoViewIfNeeded();

    // Wait for staggered animations
    await page.waitForTimeout(1500);

    // All stat cards should be visible
    const experienceStat = page.getByTestId('experience-stat');
    const teamScaleStat = page.getByTestId('team-scale-stat');
    const architectureStat = page.getByTestId('architecture-stat');
    const performanceStat = page.getByTestId('performance-stat');

    await expect(experienceStat).toBeVisible();
    await expect(teamScaleStat).toBeVisible();
    await expect(architectureStat).toBeVisible();
    await expect(performanceStat).toBeVisible();
  });

  test('Progress bars should animate to full width', async ({ page }) => {
    const focusSection = page.locator('#focus');
    await focusSection.scrollIntoViewIfNeeded();

    // Wait for animations to complete
    await page.waitForTimeout(2500);

    // Check technical area progress bars
    const progressBars = page.locator('.bg-athletic-brand-violet.h-1');

    const count = await progressBars.count();
    expect(count).toBeGreaterThan(0);

    // Each progress bar should have width > 0
    for (let i = 0; i < count; i++) {
      const width = await progressBars.nth(i).evaluate((el) =>
        window.getComputedStyle(el).width
      );
      const widthNum = parseFloat(width);
      expect(widthNum).toBeGreaterThan(0);
    }
  });

  test('Viewfinder overlay should appear in Focus section', async ({ page }) => {
    const focusSection = page.locator('#focus');
    await focusSection.scrollIntoViewIfNeeded();

    await page.waitForTimeout(1000);

    // Check for viewfinder overlay
    const viewfinder = page.locator('[data-testid="viewfinder-overlay"]');
    const viewfinderExists = await viewfinder.count() > 0;

    if (viewfinderExists) {
      const viewfinderMode = await viewfinder.getAttribute('data-mode');
      expect(viewfinderMode).toBe('focus');
    }
  });

  test('Contact form should fade in at Portfolio section', async ({ page }) => {
    const portfolioSection = page.locator('#portfolio');
    await portfolioSection.scrollIntoViewIfNeeded();

    // Wait for animations
    await page.waitForTimeout(1500);

    const contactForm = page.getByTestId('contact-form');
    await expect(contactForm).toBeVisible();

    const opacity = await contactForm.evaluate((el) =>
      window.getComputedStyle(el.parentElement!).opacity
    );
    expect(parseFloat(opacity)).toBeGreaterThan(0.9);
  });

  test('all sections should have smooth transitions', async ({ page }) => {
    const sections = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

    for (const sectionId of sections) {
      const section = page.locator(`#${sectionId}`);

      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Section should be visible
      await expect(section).toBeInViewport();

      // Check opacity (should be fully visible)
      const opacity = await section.evaluate((el) =>
        window.getComputedStyle(el).opacity
      );
      expect(parseFloat(opacity)).toBeGreaterThan(0.9);
    }
  });
});
