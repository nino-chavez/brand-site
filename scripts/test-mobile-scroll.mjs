#!/usr/bin/env node

/**
 * Playwright Mobile Scroll Testing
 *
 * Tests if scroll gets stuck after a few pixels on mobile devices
 */

import { chromium, devices } from '@playwright/test';

async function testMobileScroll() {
  console.log('📱 Testing mobile scroll behavior...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  // Test with iPhone 12 Pro
  const iPhone = devices['iPhone 12 Pro'];
  const context = await browser.newContext({
    ...iPhone,
    locale: 'en-US',
  });

  const page = await context.newPage();

  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console error: ${msg.text()}`);
    }
  });

  try {
    console.log('📍 Loading site on iPhone 12 Pro emulation...');
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('✅ Page loaded\n');

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);
    console.log(`📊 Initial scroll position: ${initialScroll}px`);

    // Test 1: Try to scroll down 100px
    console.log('\n🧪 Test 1: Attempting to scroll down 100px...');
    await page.evaluate(() => {
      window.scrollBy({ top: 100, behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);

    const scroll1 = await page.evaluate(() => window.scrollY);
    console.log(`📊 After scroll attempt: ${scroll1}px`);

    if (scroll1 < 50) {
      console.log('⚠️  WARNING: Scroll moved less than 50px (expected 100px)');
    } else {
      console.log('✅ Scroll working normally');
    }

    // Test 2: Try touch gesture scroll
    console.log('\n🧪 Test 2: Attempting touch gesture scroll...');
    await page.touchscreen.tap(200, 400);
    await page.waitForTimeout(200);

    // Simulate swipe up (scroll down)
    await page.touchscreen.tap(200, 600);
    await page.mouse.move(200, 600);
    await page.mouse.down();
    await page.mouse.move(200, 300, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    const scroll2 = await page.evaluate(() => window.scrollY);
    console.log(`📊 After touch scroll: ${scroll2}px`);

    if (scroll2 <= scroll1) {
      console.log('❌ FAILED: Touch scroll did not work');
    } else {
      console.log('✅ Touch scroll working');
    }

    // Test 3: Continuous scrolling
    console.log('\n🧪 Test 3: Testing continuous scroll...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollBy({ top: 50, behavior: 'auto' });
      });
      await page.waitForTimeout(100);

      const currentScroll = await page.evaluate(() => window.scrollY);
      console.log(`   Scroll ${i + 1}: ${currentScroll}px`);

      if (i > 0) {
        const prevScroll = await page.evaluate(() => window.scrollY - 50);
        if (currentScroll === prevScroll) {
          console.log('❌ FAILED: Scroll got stuck!');
          break;
        }
      }
    }

    const finalScroll = await page.evaluate(() => window.scrollY);
    console.log(`\n📊 Final scroll position: ${finalScroll}px`);

    // Test 4: Check for scroll-blocking CSS
    console.log('\n🧪 Test 4: Checking for scroll-blocking CSS...');
    const bodyOverflow = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return {
        bodyOverflow: window.getComputedStyle(body).overflow,
        bodyOverflowY: window.getComputedStyle(body).overflowY,
        htmlOverflow: window.getComputedStyle(html).overflow,
        htmlOverflowY: window.getComputedStyle(html).overflowY,
        bodyTouchAction: window.getComputedStyle(body).touchAction,
      };
    });

    console.log('   CSS properties:');
    console.log(`   - body overflow: ${bodyOverflow.bodyOverflow}`);
    console.log(`   - body overflow-y: ${bodyOverflow.bodyOverflowY}`);
    console.log(`   - html overflow: ${bodyOverflow.htmlOverflow}`);
    console.log(`   - html overflow-y: ${bodyOverflow.htmlOverflowY}`);
    console.log(`   - body touch-action: ${bodyOverflow.bodyTouchAction}`);

    if (bodyOverflow.bodyOverflow === 'hidden' || bodyOverflow.htmlOverflow === 'hidden') {
      console.log('❌ FOUND ISSUE: overflow:hidden is blocking scroll');
    }

    if (bodyOverflow.bodyTouchAction === 'none') {
      console.log('❌ FOUND ISSUE: touch-action:none is blocking mobile scroll');
    }

    // Test 5: Check for scroll event listeners
    console.log('\n🧪 Test 5: Checking for scroll event listeners...');
    const hasScrollListeners = await page.evaluate(() => {
      return window.getEventListeners ?
        Object.keys(window.getEventListeners(window)).includes('scroll') :
        'Cannot detect (DevTools API not available)';
    });
    console.log(`   Scroll listeners: ${hasScrollListeners}`);

    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'mobile-scroll-test.png', fullPage: true });
    console.log('✅ Screenshot saved: mobile-scroll-test.png');

    console.log('\n📱 Mobile scroll test complete. Browser will stay open for manual testing.');
    console.log('   Try scrolling manually to verify behavior.');
    console.log('   Press Ctrl+C when done.\n');

    // Keep browser open
    await new Promise(() => {});

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    await page.screenshot({ path: 'mobile-scroll-error.png' });
    console.log('📸 Error screenshot saved: mobile-scroll-error.png');
    throw error;
  }
}

testMobileScroll().catch(console.error);
