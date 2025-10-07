#!/usr/bin/env node
import { chromium } from '@playwright/test';

async function quickTest() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  await page.goto('http://localhost:3002');
  await page.waitForTimeout(2000);

  // Scroll to Frame section
  await page.evaluate(() => {
    document.querySelector('[data-testid="game-flow-container"]')?.scrollIntoView();
  });
  await page.waitForTimeout(1000);

  // Click first project card
  const card = await page.$('[data-testid="project-card"]');
  if (card) {
    await card.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'panel-test.png', fullPage: false });
    console.log('✅ Screenshot saved: panel-test.png');
  }

  await browser.close();
}

quickTest().catch(console.error);
