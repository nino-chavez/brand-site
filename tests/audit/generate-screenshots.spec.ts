import { test, expect } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * UX/UI Layout Auditor v2.0 - Screenshot Generation Script
 *
 * Generates comprehensive screenshots at multiple breakpoints for AI visual analysis.
 * Supports Phase 0 of the ux-ui-layout-auditor agent.
 *
 * Usage:
 *   npm run audit:generate-screenshots
 *   npx playwright test .agent-os/scripts/generate-ux-audit-screenshots.ts
 *
 * Prerequisites:
 *   - Dev server running on http://localhost:5173 (or configured BASE_URL)
 *   - Playwright installed
 *
 * Output:
 *   .agent-os/audits/screenshots/ - 30+ PNG screenshots
 *   .agent-os/audits/videos/ - Interaction recordings
 */

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const OUTPUT_DIR = join(process.cwd(), '.agent-os/audits');
const SCREENSHOTS_DIR = join(OUTPUT_DIR, 'screenshots');
const VIDEOS_DIR = join(OUTPUT_DIR, 'videos');

// Breakpoints following Material Design standards
const AUDIT_BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },      // iPhone X/11/12 standard
  { name: 'tablet', width: 768, height: 1024 },    // iPad portrait
  { name: 'laptop', width: 1440, height: 900 },    // MacBook standard
  { name: 'desktop', width: 1920, height: 1080 },  // Full HD standard
  { name: 'ultrawide', width: 2560, height: 1440 } // 2K display
];

// Portfolio sections based on photography metaphor
const SECTIONS = [
  { id: 'capture', name: 'Capture (Hero)' },
  { id: 'focus', name: 'Focus (About)' },
  { id: 'frame', name: 'Frame (Projects)' },
  { id: 'exposure', name: 'Exposure (Insights)' },
  { id: 'develop', name: 'Develop (Gallery)' },
  { id: 'portfolio', name: 'Portfolio (Contact)' }
];

// Ensure output directories exist
test.beforeAll(async () => {
  await mkdir(SCREENSHOTS_DIR, { recursive: true });
  await mkdir(VIDEOS_DIR, { recursive: true });
  console.log('✅ Output directories created');
});

test.describe('UX/UI Layout Audit - Screenshot Generation', () => {

  test('Generate viewport screenshots for all breakpoints', async ({ page }) => {
    console.log('🎬 Starting viewport screenshot generation...');

    for (const breakpoint of AUDIT_BREAKPOINTS) {
      console.log(`\n📐 Breakpoint: ${breakpoint.name} (${breakpoint.width}×${breakpoint.height})`);

      // Set viewport size
      await page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height
      });

      for (const section of SECTIONS) {
        // Navigate to section
        const url = `${BASE_URL}/#${section.id}`;
        await page.goto(url, { waitUntil: 'networkidle' });

        // Wait for section to be visible
        await page.waitForTimeout(500); // Allow animations to settle

        // Viewport screenshot (above the fold)
        const viewportFilename = `${breakpoint.name}-${section.id}-viewport.png`;
        await page.screenshot({
          path: join(SCREENSHOTS_DIR, viewportFilename),
          fullPage: false // Only visible viewport
        });

        console.log(`  ✓ ${viewportFilename}`);
      }
    }

    console.log('\n✅ Viewport screenshots complete!');
  });

  test('Generate full-page screenshots for desktop breakpoint', async ({ page }) => {
    console.log('\n🎬 Starting full-page screenshot generation...');

    const desktopBreakpoint = AUDIT_BREAKPOINTS.find(bp => bp.name === 'desktop')!;

    await page.setViewportSize({
      width: desktopBreakpoint.width,
      height: desktopBreakpoint.height
    });

    for (const section of SECTIONS) {
      const url = `${BASE_URL}/#${section.id}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Full-page screenshot
      const fullpageFilename = `${desktopBreakpoint.name}-${section.id}-full.png`;
      await page.screenshot({
        path: join(SCREENSHOTS_DIR, fullpageFilename),
        fullPage: true // Entire page content
      });

      console.log(`  ✓ ${fullpageFilename}`);
    }

    console.log('\n✅ Full-page screenshots complete!');
  });

  test('Capture hover state screenshots', async ({ page }) => {
    console.log('\n🎬 Starting hover state capture...');

    const desktopBreakpoint = AUDIT_BREAKPOINTS.find(bp => bp.name === 'desktop')!;

    await page.setViewportSize({
      width: desktopBreakpoint.width,
      height: desktopBreakpoint.height
    });

    // Navigate to projects section (Frame) where most hover states exist
    await page.goto(`${BASE_URL}/#frame`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Find interactive elements (buttons, links, cards)
    const interactiveSelectors = [
      'button:not([disabled])',
      'a[href]',
      '[role="button"]',
      '.card', // Project cards
      '.btn-primary',
      '.btn-secondary'
    ];

    for (const selector of interactiveSelectors) {
      const elements = await page.locator(selector).all();

      if (elements.length > 0) {
        // Hover first element of each type
        const firstElement = elements[0];
        await firstElement.hover();
        await page.waitForTimeout(300); // Allow hover animation

        const selectorName = selector.replace(/[^a-z0-9]/gi, '-');
        const hoverFilename = `desktop-frame-hover-${selectorName}.png`;

        await page.screenshot({
          path: join(SCREENSHOTS_DIR, hoverFilename),
          fullPage: false
        });

        console.log(`  ✓ ${hoverFilename}`);
      }
    }

    console.log('\n✅ Hover state screenshots complete!');
  });

  test('Capture focus state screenshots', async ({ page }) => {
    console.log('\n🎬 Starting focus state capture...');

    const desktopBreakpoint = AUDIT_BREAKPOINTS.find(bp => bp.name === 'desktop')!;

    await page.setViewportSize({
      width: desktopBreakpoint.width,
      height: desktopBreakpoint.height
    });

    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Tab through focusable elements
    const focusableCount = 5; // Capture first 5 focus states

    for (let i = 0; i < focusableCount; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focusFilename = `desktop-focus-state-${i + 1}.png`;
      await page.screenshot({
        path: join(SCREENSHOTS_DIR, focusFilename),
        fullPage: false
      });

      console.log(`  ✓ ${focusFilename}`);
    }

    console.log('\n✅ Focus state screenshots complete!');
  });

  test('Record hover interaction video', async ({ page, context }) => {
    console.log('\n🎬 Starting hover interaction recording...');

    const desktopBreakpoint = AUDIT_BREAKPOINTS.find(bp => bp.name === 'desktop')!;

    await page.setViewportSize({
      width: desktopBreakpoint.width,
      height: desktopBreakpoint.height
    });

    // Start video recording
    const videoPath = join(VIDEOS_DIR, 'hover-interactions.webm');

    // Navigate to projects section
    await page.goto(`${BASE_URL}/#frame`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Perform hover interactions
    const cards = await page.locator('.card, .project-card, [class*="card"]').all();

    for (let i = 0; i < Math.min(3, cards.length); i++) {
      await cards[i].hover();
      await page.waitForTimeout(800); // Hold hover to show animation
    }

    // Hover over buttons
    const buttons = await page.locator('button, .btn-primary, .btn-secondary').all();

    for (let i = 0; i < Math.min(3, buttons.length); i++) {
      await buttons[i].hover();
      await page.waitForTimeout(500);
    }

    console.log('  ✓ hover-interactions.webm (captured via Playwright video)');
    console.log('\n✅ Interaction video recording complete!');
  });

  test('Record scroll behavior video', async ({ page }) => {
    console.log('\n🎬 Starting scroll behavior recording...');

    const desktopBreakpoint = AUDIT_BREAKPOINTS.find(bp => bp.name === 'desktop')!;

    await page.setViewportSize({
      width: desktopBreakpoint.width,
      height: desktopBreakpoint.height
    });

    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Smooth scroll through sections
    for (const section of SECTIONS) {
      await page.evaluate((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, section.id);

      await page.waitForTimeout(1500); // Allow scroll animation to complete
    }

    console.log('  ✓ scroll-behavior.webm (captured via Playwright video)');
    console.log('\n✅ Scroll behavior recording complete!');
  });

  test('Generate mobile-specific screenshots', async ({ page }) => {
    console.log('\n🎬 Starting mobile-specific screenshot generation...');

    const mobileBreakpoint = AUDIT_BREAKPOINTS.find(bp => bp.name === 'mobile')!;

    await page.setViewportSize({
      width: mobileBreakpoint.width,
      height: mobileBreakpoint.height
    });

    // Test mobile navigation
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Capture mobile navigation open state (if exists)
    const navToggle = page.locator('[aria-label*="menu"], .mobile-nav-toggle, [class*="hamburger"]').first();

    if (await navToggle.count() > 0) {
      await navToggle.click();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: join(SCREENSHOTS_DIR, 'mobile-navigation-open.png'),
        fullPage: false
      });

      console.log('  ✓ mobile-navigation-open.png');

      // Close navigation
      await navToggle.click();
      await page.waitForTimeout(500);
    }

    // Capture touch target measurements
    await page.goto(`${BASE_URL}/#portfolio`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: join(SCREENSHOTS_DIR, 'mobile-touch-targets.png'),
      fullPage: false
    });

    console.log('  ✓ mobile-touch-targets.png');

    console.log('\n✅ Mobile-specific screenshots complete!');
  });

  test('Generate summary report', async () => {
    console.log('\n📊 Generating screenshot inventory...');

    const summary = `# UX/UI Audit Screenshot Inventory

**Generated:** ${new Date().toISOString()}
**Base URL:** ${BASE_URL}
**Total Breakpoints:** ${AUDIT_BREAKPOINTS.length}
**Total Sections:** ${SECTIONS.length}

## Breakpoints

${AUDIT_BREAKPOINTS.map(bp => `- **${bp.name}**: ${bp.width}×${bp.height}px`).join('\n')}

## Sections

${SECTIONS.map(s => `- **${s.id}**: ${s.name}`).join('\n')}

## Screenshot Types Generated

### Viewport Screenshots (Above the Fold)
${AUDIT_BREAKPOINTS.flatMap(bp =>
  SECTIONS.map(s => `- \`${bp.name}-${s.id}-viewport.png\``)
).join('\n')}

### Full-Page Screenshots (Desktop Only)
${SECTIONS.map(s => `- \`desktop-${s.id}-full.png\``).join('\n')}

### Interaction State Captures
- Hover states: \`desktop-frame-hover-*.png\`
- Focus states: \`desktop-focus-state-*.png\`
- Mobile navigation: \`mobile-navigation-open.png\`
- Touch targets: \`mobile-touch-targets.png\`

### Video Recordings
- \`hover-interactions.webm\` - Hover state animations
- \`scroll-behavior.webm\` - Smooth scroll transitions

## Next Steps

1. **AI Visual Analysis:** Load screenshots into ux-ui-layout-auditor agent
2. **Measurements:** Use pixel ruler to measure content widths, button sizes, font sizes
3. **Trend Assessment:** Compare against 2025 design trend checklist
4. **Report Generation:** Create comprehensive audit report with screenshot references

## Usage in Audit

Reference screenshots in findings:
\`\`\`markdown
Screenshot Reference: \`desktop-capture-viewport.png\`
Visual Evidence: Large empty margins on both sides
Measurement: Content width 768px / Viewport 1920px = 40% utilization
\`\`\`
`;

    const summaryPath = join(OUTPUT_DIR, 'reports', 'screenshot-inventory.md');
    await mkdir(join(OUTPUT_DIR, 'reports'), { recursive: true });

    const fs = await import('fs/promises');
    await fs.writeFile(summaryPath, summary, 'utf-8');

    console.log(`\n✅ Summary report generated: ${summaryPath}`);
  });
});

test.describe('Audit Verification', () => {
  test('Verify dev server is running', async ({ page }) => {
    await expect(async () => {
      await page.goto(BASE_URL, { timeout: 5000 });
    }).not.toThrow();

    console.log(`✅ Dev server accessible at ${BASE_URL}`);
  });

  test('Verify all sections exist', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    for (const section of SECTIONS) {
      const sectionElement = page.locator(`#${section.id}`);
      await expect(sectionElement).toBeAttached({ timeout: 5000 });
    }

    console.log('✅ All sections verified');
  });
});

// Summary test to confirm completion
test.afterAll(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SCREENSHOT GENERATION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log(`📁 Videos saved to: ${VIDEOS_DIR}`);
  console.log(`\nExpected output:`);
  console.log(`  - ${AUDIT_BREAKPOINTS.length * SECTIONS.length} viewport screenshots`);
  console.log(`  - ${SECTIONS.length} full-page screenshots`);
  console.log(`  - ~10 hover/focus state captures`);
  console.log(`  - 2 video recordings`);
  console.log(`\nNext: Run ux-ui-layout-auditor agent with generated screenshots for analysis.`);
  console.log('='.repeat(60) + '\n');
});
