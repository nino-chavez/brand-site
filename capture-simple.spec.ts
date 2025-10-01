import { test } from '@playwright/test';

test('capture portfolio sections', async ({ page }) => {
  const baseDir = 'tests/screenshots/output/simple';

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Hero section
  await page.screenshot({ path: `${baseDir}/01-hero-desktop.png`, fullPage: false });

  // Scroll to About
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${baseDir}/02-about-desktop.png`, fullPage: false });

  // Scroll to Work
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${baseDir}/03-work-desktop.png`, fullPage: false });

  // Scroll to Insights
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${baseDir}/04-insights-desktop.png`, fullPage: false });

  // Scroll to Gallery
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4));
  await page.waitForTimeout(2000); // Extra time for images to load
  await page.screenshot({ path: `${baseDir}/05-gallery-desktop.png`, fullPage: false });

  // Scroll to Contact
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${baseDir}/06-contact-desktop.png`, fullPage: false });

  // Full page
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${baseDir}/00-fullpage-desktop.png`, fullPage: true });
});
