/**
 * Component Screenshot Capture Script
 *
 * Automatically discovers and captures screenshots of all Storybook stories
 * across multiple viewports with rich metadata generation.
 */

import { test, expect } from '@playwright/test';
import { storybookAPI } from '../utils/storybook-api';
import { captureComponent, setViewport, logCapture } from '../utils/screenshot-helpers';
import { captureConfig } from '../config/capture.config';
import { defaultViewports } from '../config/viewports';

test.describe('Component Screenshot Capture', () => {
  test.beforeAll(async () => {
    console.log('\n🎨 Screenshot Capture Framework v' + captureConfig.version);
    console.log('=====================================\n');
    console.log(`📍 Storybook URL: ${captureConfig.storybookUrl}`);
    console.log(`📁 Output Directory: ${captureConfig.outputDir}`);
    console.log(`🖥️  Viewports: ${defaultViewports.join(', ')}\n`);
  });

  test('should capture all component screenshots', async ({ page }) => {
    console.log('📸 Capturing Components...\n');

    // Discover all stories
    const stories = await storybookAPI.discoverStories(page);

    if (stories.length === 0) {
      console.error('❌ No stories found. Is Storybook running?');
      expect(stories.length).toBeGreaterThan(0);
      return;
    }

    // Group stories by component
    const componentStories = new Map<string, typeof stories>();
    stories.forEach((story) => {
      const existing = componentStories.get(story.componentName) || [];
      existing.push(story);
      componentStories.set(story.componentName, existing);
    });

    let totalScreenshots = 0;
    const startTime = Date.now();

    // Capture each component
    for (const [componentName, componentVariants] of componentStories) {
      console.log(`\n📦 ${componentName} (${componentVariants.length} variants)`);

      for (const story of componentVariants) {
        for (const viewportKey of defaultViewports) {
          try {
            // Set viewport
            await setViewport(page, viewportKey);

            // Navigate to story
            await storybookAPI.navigateToStory(page, story.id);

            // Get story args
            const storyArgs = await storybookAPI.getStoryArgs(page);

            // Capture screenshot
            const { pngPath } = await captureComponent(page, {
              componentName: story.componentName,
              variant: story.variant,
              viewportKey,
              storyId: story.id,
              storyArgs,
              outputSubdir: `components/${story.title.split('/')[0].toLowerCase()}`,
              analysisHints: {
                focusAreas: [
                  'Component layout and spacing',
                  'Typography and readability',
                  'Color contrast and accessibility',
                  'Interactive element visibility',
                ],
                expectedBehaviors: [
                  'Component renders without errors',
                  'All content is visible',
                  'Proper responsive behavior',
                ],
              },
            });

            await logCapture(componentName, story.variant, viewportKey, pngPath);
            totalScreenshots++;
          } catch (error) {
            console.error(
              `  ✗ ${componentName} [${story.variant}] @ ${viewportKey}: ${(error as Error).message}`
            );
          }
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n📊 Component Capture Summary:');
    console.log(`  • Total Components: ${componentStories.size}`);
    console.log(`  • Total Stories: ${stories.length}`);
    console.log(`  • Total Screenshots: ${totalScreenshots}`);
    console.log(`  • Duration: ${duration}s`);
    console.log(`  • Output: ${captureConfig.outputDir}/components/\n`);

    expect(totalScreenshots).toBeGreaterThan(0);
  });
});
