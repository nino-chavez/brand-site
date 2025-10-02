/**
 * Effects Animation Diagnostic Test
 *
 * Purpose: Determine WHY animations aren't visible
 * Checks: Element states, classes, Intersection Observer, EffectsContext
 */

import { test, expect } from '@playwright/test';

test.describe('Effects Animation Diagnostics', () => {
  test('Check if animation classes are applied on page load', async ({ page }) => {
    await page.goto('http://localhost:3001?test=true');
    await page.waitForLoadState('networkidle');

    // Check hero title
    const heroTitle = page.locator('[data-testid="hero-title"]');
    await expect(heroTitle).toBeVisible();

    const classes = await heroTitle.getAttribute('class');
    console.log('🔍 Hero title classes:', classes);

    // Should have initial animation state
    const hasOpacity = classes?.includes('opacity');
    const hasTransform = classes?.includes('translate') || classes?.includes('scale');

    console.log('✅ Has opacity class:', hasOpacity);
    console.log('✅ Has transform class:', hasTransform);

    // Log computed styles
    const computedOpacity = await heroTitle.evaluate(el =>
      window.getComputedStyle(el).opacity
    );
    const computedTransform = await heroTitle.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    console.log('🎨 Computed opacity:', computedOpacity);
    console.log('🎨 Computed transform:', computedTransform);
  });

  test('Check if Intersection Observer triggers on scroll', async ({ page }) => {
    await page.goto('http://localhost:3001?test=true');
    await page.waitForLoadState('networkidle');

    // Get focus section heading
    const focusHeading = page.locator('section#focus h2');

    // Check initial state (before scroll)
    const initialClasses = await focusHeading.getAttribute('class');
    console.log('🔍 Focus heading initial classes:', initialClasses);

    // Scroll to section
    await focusHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Wait for Intersection Observer + animation

    // Check visible state (after scroll)
    const visibleClasses = await focusHeading.getAttribute('class');
    console.log('🔍 Focus heading after scroll:', visibleClasses);

    // Check if classes changed
    const classesChanged = initialClasses !== visibleClasses;
    console.log('✅ Classes changed after scroll:', classesChanged);

    // Check computed opacity after scroll
    const opacity = await focusHeading.evaluate(el =>
      window.getComputedStyle(el).opacity
    );
    console.log('🎨 Opacity after scroll:', opacity);

    expect(opacity).toBe('1'); // Should be fully visible
  });

  test('Check if EffectsContext is providing settings', async ({ page }) => {
    await page.goto('http://localhost:3001?test=true');
    await page.waitForLoadState('networkidle');

    // Check localStorage
    const storage = await page.evaluate(() => {
      const data = localStorage.getItem('portfolio-effects');
      return data ? JSON.parse(data) : null;
    });

    console.log('💾 LocalStorage settings:', storage);

    // Check if settings exist
    expect(storage).not.toBeNull();
    expect(storage).toHaveProperty('animationStyle');
    expect(storage).toHaveProperty('transitionSpeed');

    console.log('✅ Animation style:', storage.animationStyle);
    console.log('✅ Transition speed:', storage.transitionSpeed);
  });

  test('Check if changing EffectsPanel affects DOM', async ({ page }) => {
    await page.goto('http://localhost:3001?test=true');
    await page.waitForLoadState('networkidle');

    // Open EffectsPanel
    const hudButton = page.locator('[data-testid="hud-toggle"]');
    await hudButton.click();
    await page.waitForTimeout(300);

    // Click "Slide" animation
    const slideButton = page.locator('button').filter({ hasText: /slide/i }).first();
    await slideButton.click();
    await page.waitForTimeout(300);

    // Close panel
    await hudButton.click();

    // Check if localStorage updated
    const settings = await page.evaluate(() => {
      const data = localStorage.getItem('portfolio-effects');
      return data ? JSON.parse(data) : null;
    });

    console.log('💾 Settings after clicking Slide:', settings);
    expect(settings.animationStyle).toBe('slide');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if hero has slide animation classes
    const heroTitle = page.locator('[data-testid="hero-title"]');
    const classes = await heroTitle.getAttribute('class');

    console.log('🔍 Hero classes after reload with "slide" setting:', classes);

    // Should have translate-x classes (slide animation)
    const hasSlideClasses = classes?.includes('translate-x');
    console.log('✅ Has slide animation classes (translate-x):', hasSlideClasses);
  });

  test('Check all sections for animation classes', async ({ page }) => {
    await page.goto('http://localhost:3001?test=true');
    await page.waitForLoadState('networkidle');

    const sections = [
      { id: 'capture', name: 'Capture' },
      { id: 'focus', name: 'Focus' },
      { id: 'frame', name: 'Frame' },
      { id: 'exposure', name: 'Exposure' },
      { id: 'develop', name: 'Develop' },
      { id: 'portfolio', name: 'Portfolio' },
    ];

    for (const section of sections) {
      const heading = page.locator(`section#${section.id} h2`).first();

      if (await heading.count() > 0) {
        const classes = await heading.getAttribute('class');
        console.log(`📌 ${section.name} heading classes:`, classes);

        const hasAnimation = classes?.includes('opacity') ||
                            classes?.includes('translate') ||
                            classes?.includes('scale');
        console.log(`✅ ${section.name} has animation classes:`, hasAnimation);
      } else {
        console.log(`⚠️ ${section.name} heading not found`);
      }
    }
  });
});
