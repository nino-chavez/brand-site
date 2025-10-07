#!/usr/bin/env node
/**
 * Automated panel positioning validation
 * Tests that panel appears adjacent to clicked card
 */
import { chromium } from '@playwright/test';

async function testPanelPositioning() {
  console.log('🧪 Testing panel positioning...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  // Set viewport to standard desktop size
  await page.setViewportSize({ width: 1800, height: 1000 });

  // Capture console logs from browser
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[FrameSection]')) {
      consoleLogs.push(text);
      console.log('📱 BROWSER:', text);
    }
  });

  try {
    console.log('1️⃣ Loading page...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    console.log('\n2️⃣ Scrolling to Frame section...');
    await page.evaluate(() => {
      const section = document.querySelector('[data-testid="game-flow-container"]');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    await page.waitForTimeout(1000);

    console.log('\n3️⃣ Finding all project cards...');
    const cards = await page.$$('[data-testid="project-card"]');
    console.log(`   Found ${cards.length} project cards\n`);

    // Test first card (top-left)
    console.log('4️⃣ Testing Card #1 (top-left)...');
    await testCard(page, cards[0], 1);

    // Test third card (top-right)
    if (cards.length >= 3) {
      console.log('\n5️⃣ Testing Card #3 (top-right)...');
      await testCard(page, cards[2], 3);
    }

    // Test fourth card (bottom-left)
    if (cards.length >= 4) {
      console.log('\n6️⃣ Testing Card #4 (bottom-left)...');
      await testCard(page, cards[3], 4);
    }

    console.log('\n✅ All tests complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

async function testCard(page, card, cardNumber) {
  // Get card position before clicking
  const cardBox = await card.boundingBox();
  console.log(`   Card ${cardNumber} position:`, {
    x: Math.round(cardBox.x),
    y: Math.round(cardBox.y),
    width: Math.round(cardBox.width),
    height: Math.round(cardBox.height),
    right: Math.round(cardBox.x + cardBox.width)
  });

  // Click the card
  await card.click();
  await page.waitForTimeout(1000);

  // Get panel position
  const panel = await page.$('[data-testid="project-tech-side-panel"]');
  if (!panel) {
    console.log('   ❌ Panel not found!');
    return;
  }

  // Get computed style instead of boundingBox for fixed-position elements
  const panelStyles = await page.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      computedTop: computed.top,
      computedLeft: computed.left,
      computedWidth: computed.width,
      rectTop: rect.top,
      rectLeft: rect.left,
      rectWidth: rect.width,
      rectHeight: rect.height
    };
  }, panel);

  console.log(`   Panel computed style:`, panelStyles);
  console.log(`   Panel bounding rect:`, {
    top: Math.round(panelStyles.rectTop),
    left: Math.round(panelStyles.rectLeft),
    width: Math.round(panelStyles.rectWidth),
    height: Math.round(panelStyles.rectHeight)
  });

  // Verify positioning (using rect values from panelStyles)
  const cardRight = cardBox.x + cardBox.width;
  const gap = panelStyles.rectLeft - cardRight;
  const verticalAlignment = Math.abs(panelStyles.rectTop - cardBox.y);
  const viewportWidth = 1800;
  const panelInBounds = (panelStyles.rectLeft + panelStyles.rectWidth) <= viewportWidth;

  console.log(`   Analysis:`);
  console.log(`   - Gap between card and panel: ${Math.round(gap)}px`);
  console.log(`   - Vertical alignment offset: ${Math.round(verticalAlignment)}px`);
  console.log(`   - Panel in viewport bounds: ${panelInBounds ? '✅' : '❌'}`);

  if (gap >= 10 && gap <= 20) {
    console.log(`   ✅ Panel adjacent to card (${Math.round(gap)}px gap)`);
  } else if (gap < 0) {
    console.log(`   ❌ Panel overlaps card (${Math.round(gap)}px overlap)`);
  } else if (gap > 100) {
    console.log(`   ❌ Panel too far from card (${Math.round(gap)}px gap)`);
  } else {
    console.log(`   ⚠️  Panel position questionable (${Math.round(gap)}px gap)`);
  }

  if (verticalAlignment <= 5) {
    console.log(`   ✅ Panel vertically aligned with card`);
  } else {
    console.log(`   ❌ Panel not aligned (${Math.round(verticalAlignment)}px offset)`);
  }

  // Take screenshot
  await page.screenshot({
    path: `panel-position-card${cardNumber}.png`,
    fullPage: false
  });
  console.log(`   📸 Screenshot saved: panel-position-card${cardNumber}.png`);

  // Close panel
  const closeButton = await page.$('[data-testid="project-tech-side-panel"] button[aria-label*="Close"]');
  if (closeButton) {
    await closeButton.click();
    await page.waitForTimeout(500);
  }
}

testPanelPositioning().catch(console.error);
