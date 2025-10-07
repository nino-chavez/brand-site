#!/usr/bin/env node

/**
 * Playwright Visual Verification: Panel Positioning Fix
 *
 * Verifies that project detail panel positions adjacent to clicked card
 * instead of appearing at far right edge (Content-Switch Tax fix)
 */

import { chromium } from '@playwright/test';

async function verifyPanelPositioning() {
  console.log('🎭 Launching Playwright for visual verification...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down for visual observation
  });

  const page = await browser.newPage();

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`❌ Browser console error: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    console.log(`❌ Page error: ${error.message}`);
  });

  try {
    // Navigate to frame section
    console.log('📍 Navigating to http://localhost:3002...');
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for React to hydrate
    console.log('⏳ Waiting for app to load...');
    await page.waitForTimeout(3000);

    // Check if page loaded
    const appLoaded = await page.evaluate(() => {
      return document.querySelector('#root') !== null;
    });

    if (!appLoaded) {
      throw new Error('App did not load - #root not found');
    }

    console.log('✅ App loaded');

    // Scroll through page to find FrameSection
    console.log('📜 Searching for FrameSection...');
    let foundCards = false;

    for (let i = 0; i < 5; i++) {
      const cards = await page.$$('[data-testid="project-card"]');
      if (cards.length > 0) {
        console.log(`✅ Found ${cards.length} project cards`);
        foundCards = true;
        break;
      }

      console.log(`   Scroll attempt ${i + 1}/5...`);
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8));
      await page.waitForTimeout(1000);
    }

    if (!foundCards) {
      throw new Error('Could not find project cards after scrolling');
    }

    // Wait for project cards to be visible
    console.log('⏳ Waiting for project cards to be visible...');
    await page.waitForSelector('[data-testid="project-card"]', { state: 'visible', timeout: 5000 });

    const cards = await page.$$('[data-testid="project-card"]');
    console.log(`✅ Found ${cards.length} project cards\n`);

    if (cards.length === 0) {
      throw new Error('No project cards found');
    }

    // Test first card
    console.log('🎯 Testing first project card...');
    const firstCard = cards[0];

    // Get card position BEFORE click
    const cardBox = await firstCard.boundingBox();
    console.log(`📊 Card position: x=${Math.round(cardBox.x)}, y=${Math.round(cardBox.y)}, width=${Math.round(cardBox.width)}, height=${Math.round(cardBox.height)}`);
    console.log(`📊 Card right edge: ${Math.round(cardBox.x + cardBox.width)}`);

    // Click the card
    console.log('👆 Clicking card...');
    await firstCard.click();

    // Wait for panel to appear and animate
    console.log('⏳ Waiting for panel animation...');
    await page.waitForSelector('[data-testid="project-tech-side-panel"]', { timeout: 5000 });
    await page.waitForTimeout(1000); // Wait for spring animation to settle

    // Get panel position AFTER animation
    const panel = await page.$('[data-testid="project-tech-side-panel"]');
    const panelBox = await panel.boundingBox();

    console.log(`\n📊 Panel position: x=${Math.round(panelBox.x)}, y=${Math.round(panelBox.y)}, width=${Math.round(panelBox.width)}, height=${Math.round(panelBox.height)}`);
    console.log(`📊 Panel left edge: ${Math.round(panelBox.x)}`);

    // Calculate expected position
    const cardRightEdge = cardBox.x + cardBox.width;
    const expectedPanelX = cardRightEdge + 16; // 16px gap
    const actualPanelX = panelBox.x;
    const distance = Math.abs(actualPanelX - expectedPanelX);

    console.log(`\n🎯 Verification:`);
    console.log(`   Expected panel at: ${Math.round(expectedPanelX)} (card right + 16px)`);
    console.log(`   Actual panel at: ${Math.round(actualPanelX)}`);
    console.log(`   Distance: ${Math.round(distance)}px`);

    // Take screenshot
    const screenshotPath = 'panel-positioning-verification.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

    // Verdict
    if (distance < 50) {
      console.log(`\n✅ SUCCESS: Panel positions adjacent to card (within ${Math.round(distance)}px)`);
    } else {
      console.log(`\n⚠️  WARNING: Panel may not be positioned correctly (${Math.round(distance)}px off)`);
    }

    // Test close button
    console.log('\n🔘 Testing close button...');
    const closeButton = await page.$('[data-testid="project-tech-side-panel"] button[aria-label="Close panel"]');
    if (closeButton) {
      await closeButton.click();
      await page.waitForTimeout(800); // Wait for exit animation

      const panelGone = await page.$('[data-testid="project-tech-side-panel"]');
      if (!panelGone) {
        console.log('✅ Panel closes correctly');
      } else {
        console.log('⚠️  Panel did not close');
      }
    }

    // Test second card to verify consistent behavior
    if (cards.length > 1) {
      console.log('\n🎯 Testing second project card...');
      const secondCard = cards[1];
      const card2Box = await secondCard.boundingBox();

      await secondCard.click();
      await page.waitForSelector('[data-testid="project-tech-side-panel"]', { timeout: 5000 });
      await page.waitForTimeout(1000);

      const panel2 = await page.$('[data-testid="project-tech-side-panel"]');
      const panel2Box = await panel2.boundingBox();

      const card2RightEdge = card2Box.x + card2Box.width;
      const expected2 = card2RightEdge + 16;
      const distance2 = Math.abs(panel2Box.x - expected2);

      console.log(`   Card 2 right edge: ${Math.round(card2RightEdge)}`);
      console.log(`   Panel 2 left edge: ${Math.round(panel2Box.x)}`);
      console.log(`   Distance: ${Math.round(distance2)}px`);

      if (distance2 < 50) {
        console.log(`✅ Panel positioning consistent across cards`);
      }
    }

    console.log('\n🎭 Visual verification complete. Browser will stay open for manual inspection.');
    console.log('   Press Ctrl+C when done.\n');

    // Keep browser open for manual inspection
    await new Promise(() => {}); // Infinite wait

  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
    await page.screenshot({ path: 'verification-error.png' });
    console.log('📸 Error screenshot saved: verification-error.png');
    throw error;
  } finally {
    // Browser will be closed when user hits Ctrl+C
  }
}

verifyPanelPositioning().catch(console.error);
