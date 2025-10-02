# Canvas Quality Assurance Framework

## Problem Statement

**Current Reality**: Canvas has 20+ unit tests, yet fundamental user interactions are broken:
- Clicking navigation sections results in blank canvas (P0 - complete functionality failure)
- Pan smoothness issues persist through multiple "fix" iterations
- Text selection conflicts remain undetected
- Position jumping occurs despite "comprehensive" testing

**Root Cause Analysis**:
1. **Test Coverage != Test Quality**: 20+ tests don't cover ACTUAL user workflows
2. **Unit Test Bias**: Over-reliance on isolated component tests vs integration/E2E
3. **No Smoke Test Gate**: No mandatory "does basic stuff work?" check before commits
4. **Missing Visual Regression**: Can't catch "canvas shows blank" without screenshots
5. **No Manual Checklist**: Assumed automation catches everything (it doesn't)

---

## Proposed Quality Framework

### Level 1: Smoke Tests (MANDATORY - Blocking Commits)

**Purpose**: Catch catastrophic failures before they hit main branch

**Required Tests** (must pass before ANY canvas commit):

```typescript
// test/smoke/canvas-critical-path.test.ts

describe('Canvas Smoke Tests - CRITICAL PATH', () => {
  test('Canvas renders with content visible', async ({ page }) => {
    await page.goto('/?layout=canvas');

    // CRITICAL: Canvas must show content, not blank screen
    const canvasContent = await page.locator('.canvas-content').isVisible();
    expect(canvasContent).toBe(true);

    // Visual regression: Take screenshot
    await expect(page).toHaveScreenshot('canvas-initial-load.png');
  });

  test('Clicking section navigation shows that section', async ({ page }) => {
    await page.goto('/?layout=canvas');

    // Click "About" section
    await page.click('text=About');

    // CRITICAL: Section content must be visible (not blank)
    const aboutSection = await page.locator('[data-section="about"]').isVisible();
    expect(aboutSection).toBe(true);

    // Verify canvas position changed
    const transform = await page.locator('.canvas-content').evaluate(
      el => window.getComputedStyle(el).transform
    );
    expect(transform).not.toBe('none');

    await expect(page).toHaveScreenshot('canvas-about-section.png');
  });

  test('Pan interaction moves canvas (not blank)', async ({ page }) => {
    await page.goto('/?layout=canvas');

    // Record initial position
    const initialPos = await page.evaluate(() => ({
      x: window.__canvasPosition?.x || 0,
      y: window.__canvasPosition?.y || 0
    }));

    // Perform drag (50px movement)
    await page.mouse.move(400, 400);
    await page.mouse.down();
    await page.mouse.move(450, 450);
    await page.mouse.up();

    // Position MUST change
    const newPos = await page.evaluate(() => ({
      x: window.__canvasPosition?.x || 0,
      y: window.__canvasPosition?.y || 0
    }));

    expect(newPos.x).not.toBe(initialPos.x);
    expect(newPos.y).not.toBe(initialPos.y);

    // Content MUST still be visible
    const contentVisible = await page.locator('.canvas-content').isVisible();
    expect(contentVisible).toBe(true);
  });

  test('Text selection works without triggering pan', async ({ page }) => {
    await page.goto('/?layout=canvas');

    // Triple-click paragraph to select text
    const paragraph = page.locator('p').first();
    await paragraph.click({ clickCount: 3 });

    // Text MUST be selected
    const selectedText = await page.evaluate(() =>
      window.getSelection()?.toString()
    );
    expect(selectedText).toBeTruthy();
    expect(selectedText!.length).toBeGreaterThan(10);

    // Canvas position MUST NOT change
    const transform = await page.locator('.canvas-content').evaluate(
      el => window.getComputedStyle(el).transform
    );
    // Position should be default (not changed by selection)
  });
});
```

**CI Integration**:
```bash
# .github/workflows/canvas-smoke-tests.yml
name: Canvas Smoke Tests

on:
  pull_request:
    paths:
      - 'src/components/canvas/**'
      - 'src/hooks/useCanvas*'
      - 'src/contexts/Canvas*'

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:smoke:canvas

      # CRITICAL: Block PR if smoke tests fail
      - name: Check smoke test results
        if: failure()
        run: |
          echo "::error::Canvas smoke tests failed - DO NOT MERGE"
          exit 1
```

---

### Level 2: Manual Pre-Commit Checklist

**Purpose**: Human verification of critical interactions

**Required Steps** (before committing canvas changes):

```markdown
## Canvas Pre-Commit Checklist

Test URL: http://localhost:3000/?layout=canvas

### Visual Verification
- [ ] Canvas shows content on initial load (NOT blank)
- [ ] All 6 sections render with correct visual content
- [ ] Minimap shows section positions correctly

### Navigation
- [ ] Clicking "Home" nav button shows hero section
- [ ] Clicking "About" nav button shows about content (NOT BLANK)
- [ ] Clicking "Work" nav button shows projects
- [ ] Each section transition is smooth (no jank)

### Interaction
- [ ] Small mouse movements (< 5px) don't trigger pan
- [ ] Large mouse drags (> 10px) pan smoothly
- [ ] Pan feels smooth at 60fps (no jitter/stutter)
- [ ] Releasing fast drag triggers momentum scroll
- [ ] Momentum decays smoothly (no sudden stops)

### Text Selection
- [ ] Triple-clicking paragraph selects text
- [ ] Selection doesn't trigger unwanted panning
- [ ] Can copy/paste selected text
- [ ] Pan works after selection is cleared

### Edge Cases
- [ ] Clicking outside canvas doesn't jump position
- [ ] Pan works when starting drag from section content
- [ ] Pan doesn't activate on button/link clicks
- [ ] Keyboard arrow keys pan correctly

### Performance
- [ ] No console errors on page load
- [ ] No console errors during pan interaction
- [ ] Chrome DevTools Performance shows 60fps during pan
- [ ] No layout thrashing warnings
```

**Enforcement**:
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Check if canvas files changed
CANVAS_CHANGES=$(git diff --cached --name-only | grep -E 'src/(components/canvas|hooks/useCanvas|contexts/Canvas)')

if [ -n "$CANVAS_CHANGES" ]; then
  echo "⚠️  Canvas files modified - manual checklist required"
  echo ""
  echo "Complete checklist: docs/CANVAS_QUALITY_FRAMEWORK.md#level-2"
  echo ""
  read -p "Have you completed the manual checklist? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Commit blocked - complete manual checklist first"
    exit 1
  fi
fi
```

---

### Level 3: Integration Tests (Continuous)

**Purpose**: Catch interaction conflicts and state management bugs

```typescript
// test/integration/canvas-navigation-flow.test.ts

describe('Canvas Navigation Integration', () => {
  test('Section navigation updates canvas position AND shows content', async () => {
    // This catches the current bug: clicking nav shows blank canvas

    const { container } = render(
      <CanvasStateProvider>
        <CanvasPortfolioLayout>
          <CaptureSection />
          <FocusSection />
          <DevelopSection />
        </CanvasPortfolioLayout>
      </CanvasStateProvider>
    );

    // Click "About" section button
    const aboutButton = screen.getByRole('button', { name: /about/i });
    await userEvent.click(aboutButton);

    // CRITICAL CHECKS:
    // 1. Canvas position changed
    // 2. About section content is VISIBLE (not off-screen)
    // 3. Other sections are hidden/off-screen

    const aboutSection = screen.getByTestId('focus-section');
    const aboutBounds = aboutSection.getBoundingClientRect();

    // Section must be in viewport
    expect(aboutBounds.top).toBeGreaterThan(0);
    expect(aboutBounds.left).toBeGreaterThan(0);
    expect(aboutBounds.right).toBeLessThan(window.innerWidth);

    // Hero section must be off-screen
    const heroSection = screen.getByTestId('capture-section');
    const heroBounds = heroSection.getBoundingClientRect();
    expect(heroBounds.left).toBeLessThan(0); // scrolled out of view
  });

  test('Pan interaction maintains section visibility', async () => {
    // Ensure pan doesn't result in blank canvas
    // ...
  });
});
```

---

### Level 4: Visual Regression Tests

**Purpose**: Catch "blank canvas" and layout bugs

```typescript
// test/visual/canvas-states.visual.test.ts

describe('Canvas Visual Regression', () => {
  test('Canvas initial state - shows hero section', async ({ page }) => {
    await page.goto('/?layout=canvas');
    await page.waitForTimeout(1000); // Wait for animations

    // Full page screenshot
    await expect(page).toHaveScreenshot('canvas-hero.png', {
      fullPage: true,
      threshold: 0.2 // Allow 20% diff for animations
    });
  });

  test('Canvas shows About section after nav click', async ({ page }) => {
    await page.goto('/?layout=canvas');
    await page.click('text=About');
    await page.waitForTimeout(800); // Wait for transition

    await expect(page).toHaveScreenshot('canvas-about.png', {
      fullPage: true
    });

    // CRITICAL: Screenshot CANNOT be all black (blank canvas bug)
    const screenshot = await page.screenshot();
    const blackPixelRatio = await analyzeScreenshot(screenshot);
    expect(blackPixelRatio).toBeLessThan(0.5); // < 50% black pixels
  });

  test('Canvas during pan shows smooth animation', async ({ page }) => {
    await page.goto('/?layout=canvas');

    // Start pan
    await page.mouse.move(400, 400);
    await page.mouse.down();
    await page.mouse.move(450, 450);

    // Capture mid-pan
    await expect(page).toHaveScreenshot('canvas-mid-pan.png');

    await page.mouse.up();
  });
});
```

---

## Implementation Plan

### Phase 1: Emergency Smoke Tests (IMMEDIATE)
**Timeline**: Today (before any more canvas work)

1. Create `test/smoke/canvas-critical-path.test.ts` with 4 smoke tests above
2. Run smoke tests and document ALL failures
3. Fix smoke test failures before any other work
4. Add smoke tests to CI pipeline (blocking PRs)

### Phase 2: Manual Checklist Enforcement (This Week)
**Timeline**: Before next canvas feature

1. Create pre-commit hook requiring checklist confirmation
2. Add checklist to docs/CANVAS_QUALITY_FRAMEWORK.md
3. Train development process to use checklist

### Phase 3: Integration Test Suite (Next Sprint)
**Timeline**: 1-2 weeks

1. Create 10-15 integration tests covering navigation flows
2. Run integration tests on every canvas commit
3. Achieve 90% coverage of user workflows

### Phase 4: Visual Regression (Long-term)
**Timeline**: 1 month

1. Set up Playwright visual regression testing
2. Create baseline screenshots for all canvas states
3. Automate screenshot comparison in CI

---

## Success Metrics

### Before Framework:
- ❌ 20+ unit tests, yet blank canvas bug ships
- ❌ Pan smoothness issues persist through 3 "fix" cycles
- ❌ No way to catch visual regressions
- ❌ Manual testing inconsistent/forgotten

### After Framework:
- ✅ Smoke tests catch P0 bugs in < 30 seconds
- ✅ Manual checklist prevents "obvious" bugs from shipping
- ✅ Integration tests verify user workflows work end-to-end
- ✅ Visual regression tests catch layout/rendering issues
- ✅ 95% reduction in "how did this ship?" incidents

---

## Current Bug Fix (Immediate Action)

Before implementing framework, fix the CURRENT blank canvas bug:

**Hypothesis**: Navigation click updates canvas position, but content is either:
1. Positioned off-screen (transform calculation bug)
2. Not rendering (React rendering bug)
3. Z-index issue (content behind black background)

**Debug Steps**:
1. Open DevTools on http://localhost:3000/?layout=canvas
2. Inspect `.canvas-content` transform value on load vs after nav click
3. Check if section components are in DOM but invisible
4. Verify canvas positioning logic in CanvasPortfolioLayout.tsx

**Root Cause** (likely):
- CanvasPortfolioLayout calculates section positions
- LightboxCanvas applies transform based on position
- Navigation click updates position state, but sections don't exist/render

**Fix** (probably):
- Ensure all sections render within canvas-content on mount
- Verify transform calculation uses correct coordinate system
- Check that children prop is passed and rendered
