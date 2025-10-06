import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  console.log('Starting Timeline Layout Validation Capture...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Navigate to timeline layout
  await page.goto('http://localhost:3004/?layout=timeline');
  await page.waitForTimeout(2000);

  // Create validation directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = `validation-captures-${timestamp}`;
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture 1: Initial state showing control bar and timecode
  console.log('Capturing initial state...');
  await page.screenshot({
    path: `${outputDir}/01-initial-state.png`,
    fullPage: true
  });

  // Capture 2: Toggle filmstrip (press 'f')
  console.log('Toggling filmstrip...');
  await page.keyboard.press('f');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${outputDir}/02-filmstrip-visible.png`,
    fullPage: false
  });

  // Capture 3: Scroll within first section to show threshold indicator
  console.log('Scrolling to show threshold indicator...');
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(50);
  }
  await page.screenshot({
    path: `${outputDir}/03-scroll-threshold-indicator.png`,
    fullPage: false
  });

  // Capture 4: Navigate to next section (arrow key)
  console.log('Navigating to next section...');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500); // Wait for 400ms transition + buffer
  await page.screenshot({
    path: `${outputDir}/04-section-2.png`,
    fullPage: false
  });

  // Capture 5: Jump to section 4 (press '4')
  console.log('Jumping to section 4...');
  await page.keyboard.press('4');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${outputDir}/05-section-4-jump.png`,
    fullPage: false
  });

  // Capture 6: Close-up of control bar
  console.log('Capturing control bar close-up...');
  const controlBar = await page.$('div[style*="height: \'36px\'"]');
  if (controlBar) {
    await controlBar.screenshot({
      path: `${outputDir}/06-control-bar-closeup.png`
    });
  }

  // Capture 7: Close-up of timecode display
  console.log('Capturing timecode display...');
  const timecode = await page.$('div[style*="fontFamily: \'SF Mono"]');
  if (timecode) {
    await timecode.screenshot({
      path: `${outputDir}/07-timecode-closeup.png`
    });
  }

  console.log(`\nValidation captures saved to: ${outputDir}/`);
  console.log('Screenshots captured:');
  console.log('  1. Initial state with control bar');
  console.log('  2. Filmstrip toggle view');
  console.log('  3. Scroll threshold indicator');
  console.log('  4. Section navigation');
  console.log('  5. Direct section jump');
  console.log('  6. Control bar close-up');
  console.log('  7. Timecode close-up');

  await browser.close();
  console.log('\nCapture complete!');
})();