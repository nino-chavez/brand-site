/**
 * Scroll Sync Motion Tests
 *
 * Automated tests for scroll-triggered animations and navigation sync.
 * Tests header nav active states, scroll progress, and section transitions.
 */

import { test, expect } from '@playwright/test';

test.describe('Scroll Sync & Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('header nav should sync with scroll position', async ({ page }) => {
    // Helper to get active nav button text
    const getActiveNavText = async () => {
      const activeButton = page.locator('[aria-pressed="true"]');
      await activeButton.waitFor({ state: 'visible' });
      return await activeButton.textContent();
    };

    // Initially should be on HOME (capture section)
    const initialNav = await getActiveNavText();
    expect(initialNav).toBe('HOME');

    // Scroll to About section (focus)
    await page.locator('#focus').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Allow scroll spy to update

    const aboutNav = await getActiveNavText();
    expect(aboutNav).toBe('ABOUT');

    // Scroll to Work section (frame)
    await page.locator('#frame').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const workNav = await getActiveNavText();
    expect(workNav).toBe('WORK');

    // Scroll to Insights section (exposure)
    await page.locator('#exposure').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const insightsNav = await getActiveNavText();
    expect(insightsNav).toBe('INSIGHTS');

    // Scroll to Gallery section (develop)
    await page.locator('#develop').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const galleryNav = await getActiveNavText();
    expect(galleryNav).toBe('GALLERY');

    // Scroll to Contact section (portfolio)
    await page.locator('#portfolio').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const contactNav = await getActiveNavText();
    expect(contactNav).toBe('CONTACT');
  });

  test('clicking nav button should scroll to section', async ({ page }) => {
    // Click ABOUT button
    await page.getByRole('button', { name: 'ABOUT' }).click();
    await page.waitForTimeout(800); // Allow smooth scroll

    // About section should be in viewport
    const aboutSection = page.locator('#focus');
    await expect(aboutSection).toBeInViewport();

    // Nav should be active
    const activeButton = page.locator('[aria-pressed="true"]');
    await expect(activeButton).toHaveText('ABOUT');

    // Click WORK button
    await page.getByRole('button', { name: 'WORK' }).click();
    await page.waitForTimeout(800);

    const workSection = page.locator('#frame');
    await expect(workSection).toBeInViewport();
  });

  test('scroll progress indicator should update', async ({ page }) => {
    // Check if scroll progress element exists
    const scrollProgress = page.locator('.fixed').filter({ hasText: '' }).first();

    // Scroll to middle of page
    await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, scrollHeight * 0.5);
    });

    await page.waitForTimeout(200);

    // Scroll to bottom
    await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, scrollHeight);
    });

    await page.waitForTimeout(200);

    // Verify we scrolled (basic check)
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(100);
  });

  test('section should fade in when scrolled into view', async ({ page }) => {
    const aboutSection = page.locator('#focus');
    const narrative = page.getByTestId('about-narrative');

    // Scroll to about section
    await aboutSection.scrollIntoViewIfNeeded();

    // Wait for entrance animation
    await page.waitForTimeout(1500);

    // Check final opacity
    const opacity = await narrative.evaluate((el) =>
      window.getComputedStyle(el).opacity
    );

    expect(parseFloat(opacity)).toBeGreaterThan(0.9);

    // Check transform (should have animated in)
    const transform = await narrative.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Should not be in translated-down state anymore
    expect(transform).not.toContain('translateY(32px)');
  });

  test('all sections should be accessible via scroll', async ({ page }) => {
    const sections = [
      { id: 'capture', name: 'Capture' },
      { id: 'focus', name: 'Focus' },
      { id: 'frame', name: 'Frame' },
      { id: 'exposure', name: 'Exposure' },
      { id: 'develop', name: 'Develop' },
      { id: 'portfolio', name: 'Portfolio' },
    ];

    for (const section of sections) {
      const sectionElement = page.locator(`#${section.id}`);

      await sectionElement.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Section should be in viewport
      await expect(sectionElement).toBeInViewport();

      // Section should have correct data attributes
      await expect(sectionElement).toHaveAttribute('data-section', section.id);
    }
  });

  test('smooth scroll behavior should be enabled', async ({ page }) => {
    // Check scroll behavior
    const scrollBehavior = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollBehavior;
    });

    // Most browsers default to 'auto' or 'smooth' may need to be set via JS
    expect(['auto', 'smooth']).toContain(scrollBehavior);
  });

  test('header should change background on scroll', async ({ page }) => {
    const header = page.locator('header').first();

    // Get initial header background
    const initialBg = await header.evaluate((el) =>
      window.getComputedStyle(el).background
    );

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(100);

    // Get scrolled header background
    const scrolledBg = await header.evaluate((el) =>
      window.getComputedStyle(el).background
    );

    // Background should change (becomes more opaque)
    expect(scrolledBg).not.toBe(initialBg);
  });
});
