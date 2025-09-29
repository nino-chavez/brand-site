import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup for Canvas System E2E Tests
 *
 * Prepares the testing environment for canvas visual validation:
 * - Enables hardware acceleration
 * - Sets canvas testing mode
 * - Verifies performance capabilities
 */
async function globalSetup(config: FullConfig) {
  console.log('🎬 Starting Canvas System E2E Test Setup...');

  // Launch browser to verify hardware acceleration support
  const browser = await chromium.launch({
    args: [
      '--enable-gpu',
      '--enable-hardware-acceleration',
      '--disable-dev-shm-usage',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the application
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:5173');

    // Set canvas testing mode via URL parameter
    await page.goto(`${config.projects[0].use?.baseURL || 'http://localhost:5173'}?test=true&layout=canvas`);

    // Wait for the canvas system to initialize
    await page.waitForSelector('[data-testid="lightbox-canvas"]', { timeout: 10000 });

    // Verify canvas is operational
    const canvasElement = await page.locator('[data-testid="lightbox-canvas"]');
    const isVisible = await canvasElement.isVisible();

    if (!isVisible) {
      throw new Error('Canvas system failed to initialize during setup');
    }

    console.log('✅ Canvas system initialized successfully');

    // Check for hardware acceleration support
    const gpuInfo = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return {
        supported: !!gl,
        vendor: gl?.getParameter(gl.VENDOR) || 'unknown',
        renderer: gl?.getParameter(gl.RENDERER) || 'unknown'
      };
    });

    console.log('🖥️ GPU Support:', gpuInfo.supported ? '✅ Enabled' : '❌ Disabled');
    if (gpuInfo.supported) {
      console.log(`   Vendor: ${gpuInfo.vendor}`);
      console.log(`   Renderer: ${gpuInfo.renderer}`);
    }

    // Set performance testing baseline
    await page.evaluate(() => {
      // Store baseline performance metrics for canvas testing
      (window as any).__CANVAS_TEST_BASELINE__ = {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        hardwareAcceleration: true,
        touchSupport: 'ontouchstart' in window
      };
    });

    console.log('🚀 Canvas system ready for E2E testing');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;