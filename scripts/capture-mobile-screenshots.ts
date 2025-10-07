/**
 * Mobile Screenshot Capture Script
 *
 * Captures comprehensive screenshots of all mobile states in traditional layout
 * for UX/UI audit, content review, and voice/tone analysis.
 *
 * Usage: npx tsx scripts/capture-mobile-screenshots.ts
 */

import { chromium, type Browser, type Page } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3002';
const SCREENSHOT_DIR = join(process.cwd(), 'mobile-audit-screenshots');

// Mobile viewport configuration (iPhone 14 Pro)
const MOBILE_VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

interface ScreenshotTask {
  name: string;
  description: string;
  action: (page: Page) => Promise<void>;
}

async function captureScreenshots() {
  console.log('🎬 Starting mobile screenshot capture...\n');

  // Ensure screenshot directory exists
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser: Browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });

  const page: Page = await context.newPage();

  // Navigation helper with animation settling
  const waitForSection = async (sectionId: string) => {
    await page.waitForSelector(`[data-section="${sectionId}"]`, { state: 'visible', timeout: 10000 });

    // Wait for Framer Motion animations to complete
    await page.waitForTimeout(2000); // Increased from 500ms to 2000ms

    // Wait for any lazy-loaded content
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      console.log(`   ⚠️  Network not idle for ${sectionId}, continuing...`);
    });
  };

  // Define screenshot tasks
  const tasks: ScreenshotTask[] = [
    {
      name: '01-landing-hero',
      description: 'Landing page / Hero section (CaptureSection)',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('[data-section="capture"]', { state: 'visible' });
        await page.waitForTimeout(3000); // Increased: Wait for initial animations + lazy loads
      },
    },
    {
      name: '02-header-scrolled',
      description: 'Header in scrolled state',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => window.scrollTo(0, 200));
        await page.waitForTimeout(500);
      },
    },
    {
      name: '03-mobile-menu-closed',
      description: 'Mobile navigation menu - closed state',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        // Just capture the header with menu closed
        await page.waitForSelector('header', { state: 'visible' });
      },
    },
    {
      name: '04-mobile-menu-open',
      description: 'Mobile navigation menu - open state',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Find and click the menu toggle button
        const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="navigation"], button:has-text("Menu")').first();

        // Wait for button to be visible and clickable
        await menuButton.waitFor({ state: 'visible', timeout: 5000 });
        await menuButton.click();

        // Wait for menu animation
        await page.waitForTimeout(800);
      },
    },
    {
      name: '05-focus-section',
      description: 'Focus section (Skills/About)',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Scroll to focus section
        await page.evaluate(() => {
          const section = document.querySelector('[data-section="focus"]');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        await waitForSection('focus');
      },
    },
    {
      name: '06-frame-section-default',
      description: 'Frame section - default state (project cards)',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Scroll to frame section
        await page.evaluate(() => {
          const section = document.querySelector('[data-section="frame"]');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        await waitForSection('frame');
      },
    },
    {
      name: '07-frame-section-panel-open',
      description: 'Frame section - with project detail panel open',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Scroll to frame section
        await page.evaluate(() => {
          const section = document.querySelector('[data-section="frame"]');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        await waitForSection('frame');

        // Click first project card
        const projectCard = page.locator('[data-testid="project-card"]').first();
        await projectCard.waitFor({ state: 'visible', timeout: 5000 });
        await projectCard.click();

        // Wait for panel animation
        await page.waitForTimeout(1000);

        // Verify panel is visible
        await page.waitForSelector('[id*="panel"], [class*="panel"]', { state: 'visible', timeout: 5000 });
      },
    },
    {
      name: '08-exposure-section',
      description: 'Exposure section (Experience)',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        await page.evaluate(() => {
          const section = document.querySelector('[data-section="exposure"]');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        await waitForSection('exposure');
      },
    },
    {
      name: '09-develop-section',
      description: 'Develop section',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        await page.evaluate(() => {
          const section = document.querySelector('[data-section="develop"]');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        await waitForSection('develop');
      },
    },
    {
      name: '10-portfolio-section',
      description: 'Portfolio section (Photography gallery)',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        await page.evaluate(() => {
          const section = document.querySelector('[data-section="portfolio"]');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        await waitForSection('portfolio');
      },
    },
    {
      name: '11-full-page-scroll',
      description: 'Full page scroll overview',
      action: async (page) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Capture full page screenshot
        // Note: This will be a long vertical screenshot
      },
    },
  ];

  // Execute screenshot tasks
  for (const task of tasks) {
    try {
      console.log(`📸 Capturing: ${task.description}`);

      await task.action(page);

      const screenshotPath = join(SCREENSHOT_DIR, `${task.name}.png`);

      // Use fullPage for the full-page-scroll screenshot, otherwise capture viewport
      const captureOptions = task.name === '11-full-page-scroll'
        ? { path: screenshotPath, fullPage: true }
        : { path: screenshotPath };

      await page.screenshot(captureOptions);

      console.log(`   ✅ Saved: ${task.name}.png\n`);
    } catch (error) {
      console.error(`   ❌ Failed: ${task.description}`);
      console.error(`      Error: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  await browser.close();

  console.log(`\n✨ Screenshot capture complete!`);
  console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log(`\n📊 Next steps:`);
  console.log(`   1. Review screenshots in: ${SCREENSHOT_DIR}`);
  console.log(`   2. Run UX/UI auditor on screenshots`);
  console.log(`   3. Run content UX reviewer on copy`);
  console.log(`   4. Run voice/tone auditor on messaging\n`);
}

// Run the script
captureScreenshots().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
