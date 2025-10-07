/**
 * Mobile Section Verification Script
 * Verifies sections are actually broken vs. animation/timing issues
 */

import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';
const MOBILE_VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

async function verifySections() {
  console.log('🔍 Verifying mobile section rendering...\n');

  const browser = await chromium.launch({ headless: false }); // Visual debugging
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  });

  const page = await context.newPage();
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  // Check Frame Section
  console.log('📍 Checking Frame Section...');
  await page.evaluate(() => {
    const section = document.querySelector('[data-section="frame"]');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await page.waitForTimeout(2000); // Wait for animations

  const frameContent = await page.evaluate(() => {
    const section = document.querySelector('[data-section="frame"]');
    if (!section) return { exists: false };

    const cards = section.querySelectorAll('[data-testid="project-card"]');
    const text = section.textContent?.trim();
    const hasVisibleContent = section.querySelector('*:not(style)');

    return {
      exists: true,
      cardCount: cards.length,
      hasText: text && text.length > 100,
      hasVisibleElements: !!hasVisibleContent,
      innerHTML: section.innerHTML.substring(0, 500),
    };
  });

  console.log('  Frame Section:', frameContent);
  console.log('  Status:', frameContent.cardCount > 0 ? '✅ RENDERING' : '❌ EMPTY\n');

  // Check Exposure Section
  console.log('📍 Checking Exposure Section...');
  await page.evaluate(() => {
    const section = document.querySelector('[data-section="exposure"]');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await page.waitForTimeout(2000);

  const exposureContent = await page.evaluate(() => {
    const section = document.querySelector('[data-section="exposure"]');
    if (!section) return { exists: false };

    const text = section.textContent?.trim();
    const hasVisibleContent = section.querySelector('*:not(style)');

    return {
      exists: true,
      hasText: text && text.length > 100,
      hasVisibleElements: !!hasVisibleContent,
      innerHTML: section.innerHTML.substring(0, 500),
    };
  });

  console.log('  Exposure Section:', exposureContent);
  console.log('  Status:', exposureContent.hasText ? '✅ RENDERING' : '❌ EMPTY\n');

  // Check Portfolio Section
  console.log('📍 Checking Portfolio Section...');
  await page.evaluate(() => {
    const section = document.querySelector('[data-section="portfolio"]');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await page.waitForTimeout(2000);

  const portfolioContent = await page.evaluate(() => {
    const section = document.querySelector('[data-section="portfolio"]');
    if (!section) return { exists: false };

    const images = section.querySelectorAll('img');
    const text = section.textContent?.trim();
    const hasVisibleContent = section.querySelector('*:not(style)');

    return {
      exists: true,
      imageCount: images.length,
      hasText: text && text.length > 100,
      hasVisibleElements: !!hasVisibleContent,
      innerHTML: section.innerHTML.substring(0, 500),
    };
  });

  console.log('  Portfolio Section:', portfolioContent);
  console.log('  Status:', portfolioContent.imageCount > 0 ? '✅ RENDERING' : '❌ EMPTY\n');

  // Check for lazy-loaded content
  console.log('📍 Checking for lazy loading indicators...');
  const lazyLoading = await page.evaluate(() => {
    const suspenseMarkers = document.querySelectorAll('[data-lazy], [data-suspense]');
    const loadingStates = document.querySelectorAll('[class*="loading"], [class*="skeleton"]');

    return {
      hasSuspenseMarkers: suspenseMarkers.length > 0,
      hasLoadingStates: loadingStates.length > 0,
    };
  });

  console.log('  Lazy Loading:', lazyLoading);

  console.log('\n📊 Summary:');
  console.log('  Frame Section:', frameContent.cardCount > 0 ? '✅' : '❌');
  console.log('  Exposure Section:', exposureContent.hasText ? '✅' : '❌');
  console.log('  Portfolio Section:', portfolioContent.imageCount > 0 ? '✅' : '❌');

  // Keep browser open for manual inspection
  console.log('\n👀 Browser kept open for manual inspection...');
  console.log('   Press Ctrl+C to close when done.\n');

  // Wait indefinitely
  await new Promise(() => {});
}

verifySections().catch(console.error);
