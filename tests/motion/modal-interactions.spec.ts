/**
 * Modal Interactions Video Recording
 *
 * Captures video of ThesisModal and Timeline Modal interactions
 * including open/close animations, scroll behavior, and content visibility.
 */

import { test, expect } from '@playwright/test';

test.describe('Modal Interactions - Video Recording', () => {

  test('record ThesisModal open and close interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to Focus section where ThesisModal trigger is located
    const focusSection = page.locator('[data-section="focus"]').first();
    await focusSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Find and click the "Master Chef Journey" button
    const thesisTrigger = page.getByRole('button', { name: /master chef journey/i });
    await thesisTrigger.waitFor({ state: 'visible', timeout: 5000 });

    // Hover before clicking (show interaction)
    await thesisTrigger.hover();
    await page.waitForTimeout(500);

    // Click to open modal
    await thesisTrigger.click();
    await page.waitForTimeout(800); // Modal open animation

    // Verify modal is open
    const modal = page.locator('[role="dialog"][aria-modal="true"]').first();
    await expect(modal).toBeVisible();

    // Scroll through modal content to show sections
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1000);

    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1000);

    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1000);

    // Scroll back to top
    await page.mouse.wheel(0, -900);
    await page.waitForTimeout(500);

    // Hover close button
    const closeButton = modal.getByRole('button', { name: /close/i });
    await closeButton.hover();
    await page.waitForTimeout(500);

    // Click to close
    await closeButton.click();
    await page.waitForTimeout(800); // Modal close animation

    // Verify modal is closed
    await expect(modal).not.toBeVisible();

    console.log('✅ Video recorded: ThesisModal interaction');
  });

  test('record ThesisModal click-outside-to-close behavior', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Focus section
    const focusSection = page.locator('[data-section="focus"]').first();
    await focusSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Open ThesisModal
    const thesisTrigger = page.getByRole('button', { name: /master chef journey/i });
    await thesisTrigger.click();
    await page.waitForTimeout(800);

    // Click backdrop (outside modal) to close
    await page.mouse.click(50, 50); // Top-left corner (backdrop area)
    await page.waitForTimeout(800);

    // Verify modal closed
    const modal = page.locator('[role="dialog"][aria-modal="true"]').first();
    await expect(modal).not.toBeVisible();

    console.log('✅ Video recorded: ThesisModal click-outside behavior');
  });

  test('record Timeline Modal (25 Year Journey) interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to Focus section
    const focusSection = page.locator('[data-section="focus"]').first();
    await focusSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Find and click the "25 Year Journey" timeline card
    const timelineCard = page.getByTestId('career-timeline-card');
    await timelineCard.waitFor({ state: 'visible', timeout: 5000 });

    // Hover to show interactive state
    await timelineCard.hover();
    await page.waitForTimeout(500);

    // Click to open timeline modal
    await timelineCard.click();
    await page.waitForTimeout(1000); // Modal open animation

    // Verify timeline modal is open
    const timelineModal = page.locator('[role="dialog"][aria-modal="true"]', {
      has: page.locator('text=25 Year Journey')
    });
    await expect(timelineModal).toBeVisible();

    // Scroll through timeline content
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(1500);

    // Hover over milestone cards to show details
    const milestoneCards = page.locator('[data-testid^="milestone-modal-"]');
    const count = await milestoneCards.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      await milestoneCards.nth(i).hover();
      await page.waitForTimeout(800);
    }

    // Scroll to bottom of modal
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(1000);

    // Close modal
    const closeButton = timelineModal.getByRole('button', { name: /close/i });
    await closeButton.hover();
    await page.waitForTimeout(500);
    await closeButton.click();
    await page.waitForTimeout(800);

    // Verify closed
    await expect(timelineModal).not.toBeVisible();

    console.log('✅ Video recorded: Timeline Modal interaction');
  });

  test('record Focus section two-column layout (Areas of Focus + Technical Depth)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to Focus section
    const focusSection = page.locator('[data-section="focus"]').first();
    await focusSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    // Hover over Areas of Focus section
    const areasOfFocus = page.getByTestId('technical-stack-inline');
    await areasOfFocus.hover();
    await page.waitForTimeout(1000);

    // Hover over Technical Depth section
    const technicalDepth = page.getByTestId('integrated-stats-card');
    await technicalDepth.hover();
    await page.waitForTimeout(1000);

    // Expand Technical Depth details
    const expandableItems = technicalDepth.locator('details');
    const itemCount = await expandableItems.count();

    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      const summary = expandableItems.nth(i).locator('summary');
      await summary.click();
      await page.waitForTimeout(600);
    }

    // Wait to show expanded state
    await page.waitForTimeout(1500);

    // Collapse items
    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      const summary = expandableItems.nth(i).locator('summary');
      await summary.click();
      await page.waitForTimeout(400);
    }

    console.log('✅ Video recorded: Focus section two-column layout');
  });

  test('record complete modal workflow - both modals in sequence', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Focus section
    await page.getByRole('button', { name: 'ABOUT' }).click();
    await page.waitForTimeout(1500);

    console.log('Opening ThesisModal...');
    // Open ThesisModal
    const thesisTrigger = page.getByRole('button', { name: /master chef journey/i });
    await thesisTrigger.click();
    await page.waitForTimeout(1000);

    // Read some content
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(1500);

    // Close ThesisModal
    const thesisModal = page.locator('[role="dialog"][aria-modal="true"]').first();
    const thesisClose = thesisModal.getByRole('button', { name: /close/i });
    await thesisClose.click();
    await page.waitForTimeout(1000);

    console.log('Opening Timeline Modal...');
    // Open Timeline Modal
    const timelineCard = page.getByTestId('career-timeline-card');
    await timelineCard.click();
    await page.waitForTimeout(1000);

    // Interact with timeline
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(1500);

    // Close Timeline Modal
    const timelineModal = page.locator('[role="dialog"][aria-modal="true"]', {
      has: page.locator('text=25 Year Journey')
    });
    const timelineClose = timelineModal.getByRole('button', { name: /close/i });
    await timelineClose.click();
    await page.waitForTimeout(800);

    console.log('✅ Video recorded: Complete modal workflow');
  });

  test('record all CTA interactions in sequence', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('Testing Hero CTAs...');
    // Hero section CTAs
    const viewWorkBtn = page.getByTestId('view-work-cta');
    if (await viewWorkBtn.isVisible()) {
      await viewWorkBtn.hover();
      await page.waitForTimeout(800);
    }

    console.log('Testing Navigation...');
    // Navigate through all sections
    const navButtons = ['ABOUT', 'WORK', 'INSIGHTS', 'GALLERY', 'CONTACT'];
    for (const buttonText of navButtons) {
      await page.getByRole('button', { name: buttonText }).click();
      await page.waitForTimeout(1200);
    }

    console.log('Testing Modal CTAs...');
    // Test ThesisModal CTA
    await page.getByRole('button', { name: 'ABOUT' }).click();
    await page.waitForTimeout(1000);

    const thesisTrigger = page.getByRole('button', { name: /master chef journey/i });
    if (await thesisTrigger.isVisible()) {
      await thesisTrigger.hover();
      await page.waitForTimeout(500);
      await thesisTrigger.click();
      await page.waitForTimeout(1000);

      // Close
      const modal = page.locator('[role="dialog"][aria-modal="true"]').first();
      await modal.getByRole('button', { name: /close/i }).click();
      await page.waitForTimeout(800);
    }

    console.log('Testing Timeline CTA...');
    // Test Timeline Modal CTA
    const timelineCard = page.getByTestId('career-timeline-card');
    if (await timelineCard.isVisible()) {
      await timelineCard.hover();
      await page.waitForTimeout(500);
      await timelineCard.click();
      await page.waitForTimeout(1000);

      // Close
      const timelineModal = page.locator('[role="dialog"][aria-modal="true"]', {
        has: page.locator('text=25 Year Journey')
      });
      await timelineModal.getByRole('button', { name: /close/i }).click();
      await page.waitForTimeout(800);
    }

    console.log('Testing Contact CTAs...');
    // Contact section
    await page.getByRole('button', { name: 'CONTACT' }).click();
    await page.waitForTimeout(1500);

    const contactButtons = page.locator('[data-testid$="-contact"]');
    const contactCount = await contactButtons.count();
    for (let i = 0; i < contactCount; i++) {
      await contactButtons.nth(i).hover();
      await page.waitForTimeout(400);
    }

    console.log('✅ Video recorded: All CTA interactions');
  });
});
