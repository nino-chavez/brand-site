import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Collect console logs
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log(`[BROWSER] ${text}`);
  });

  // Navigate to site
  console.log('Navigating to localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Scroll to work section
  console.log('Scrolling to work section...');
  await page.evaluate(() => {
    const workSection = document.querySelector('#frame');
    if (workSection) {
      workSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  await page.waitForTimeout(1500);

  // Get project card positions before click
  console.log('\nProject card positions:');
  const cardPositions = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[class*="group cursor-pointer"]'));
    return cards.slice(0, 3).map((card, idx) => {
      const rect = card.getBoundingClientRect();
      return {
        index: idx,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height
      };
    });
  });
  cardPositions.forEach(pos => console.log(JSON.stringify(pos, null, 2)));

  // Get state before click
  console.log('\nChecking for panel before click:');
  const beforeClick = await page.evaluate(() => {
    return {
      hasPanel: !!document.querySelector('.fixed.bg-gray-900'),
      hasBackdrop: !!document.querySelector('.fixed.inset-0'),
      allFixed: Array.from(document.querySelectorAll('.fixed')).map(el => ({
        classes: el.className,
        visible: window.getComputedStyle(el).display !== 'none'
      }))
    };
  });
  console.log(JSON.stringify(beforeClick, null, 2));

  // Click on the second card (MatchFlow)
  console.log('\nClicking MatchFlow card...');
  await page.click('[class*="group cursor-pointer"]:nth-child(2)');

  // Wait for panel to appear
  await page.waitForTimeout(1000);

  // Get state after click
  console.log('\nChecking for panel after click:');
  const afterClick = await page.evaluate(() => {
    return {
      hasPanel: !!document.querySelector('.fixed.bg-gray-900'),
      hasBackdrop: !!document.querySelector('.fixed.inset-0'),
      allFixed: Array.from(document.querySelectorAll('.fixed')).map(el => ({
        classes: el.className,
        visible: window.getComputedStyle(el).display !== 'none'
      }))
    };
  });
  console.log(JSON.stringify(afterClick, null, 2));

  // Get panel position
  console.log('\nPanel search:');
  const panelInfo = await page.evaluate(() => {
    // Try multiple selectors
    const panel = document.querySelector('.fixed.bg-gray-900')
                  || document.querySelector('[class*="bg-gray-900"][class*="fixed"]')
                  || Array.from(document.querySelectorAll('.fixed')).find(el =>
                      el.className.includes('bg-gray-900')
                    );

    if (!panel) return { found: false };

    const rect = panel.getBoundingClientRect();
    const styles = window.getComputedStyle(panel);

    return {
      found: true,
      position: {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height
      },
      inlineStyles: {
        top: panel.style.top,
        left: panel.style.left,
        maxHeight: panel.style.maxHeight
      },
      computedStyles: {
        position: styles.position,
        top: styles.top,
        left: styles.left,
        maxHeight: styles.maxHeight
      }
    };
  });
  console.log(JSON.stringify(panelInfo, null, 2));

  // Take screenshot
  await page.screenshot({
    path: '/Users/nino/Desktop/panel-debug.png',
    fullPage: false
  });
  console.log('\nScreenshot saved to ~/Desktop/panel-debug.png');

  // Filter and show ProjectDetailPanel logs
  console.log('\n=== ProjectDetailPanel Position Logs ===');
  logs
    .filter(log => log.includes('[ProjectDetailPanel]'))
    .forEach(log => console.log(log));

  await page.waitForTimeout(3000);
  await browser.close();
})();
