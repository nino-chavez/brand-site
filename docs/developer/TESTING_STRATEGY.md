# UI/UX Testing Strategy Guide

**Last Updated:** 2025-10-02
**Purpose:** Comprehensive testing strategy based on Playwright test learnings, demo harness implementation, and production testing patterns.

---

## Table of Contents

1. [Test Organization Structure](#test-organization-structure)
2. [Selector Best Practices](#selector-best-practices)
3. [Animation and Timing Handling](#animation-and-timing-handling)
4. [Interactive Element Testing](#interactive-element-testing)
5. [Visual Regression Testing](#visual-regression-testing)
6. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)

---

## Test Organization Structure

### File Organization

```
tests/
├── motion/                          # Dynamic behavior tests
│   ├── demo-harness.spec.ts        # Demo harness functionality
│   ├── magnetic-buttons.spec.ts    # Magnetic effects
│   ├── scroll-animations.spec.ts   # Scroll-triggered animations
│   ├── effects-panel.spec.ts       # Effects panel controls
│   └── helpers/
│       └── motion-test-utils.ts    # Shared test utilities
│
├── screenshots/                     # Visual regression tests
│   ├── scripts/
│   │   └── capture-components.spec.ts
│   ├── flows/
│   │   └── navigation-flow.spec.ts
│   └── utils/
│       └── screenshot-helpers.ts
│
└── integration/                     # Cross-component tests
    └── navigation-sync.spec.ts
```

### Test Suite Structure

```typescript
/**
 * Component Test Suite - Brief description
 *
 * Tests covered:
 * - Feature 1
 * - Feature 2
 * - Edge cases
 *
 * @see /src/components/ComponentName.tsx
 * @see /docs/TESTING_STRATEGY.md
 */

import { test, expect, type Page } from '@playwright/test';

// Configuration constants
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/demo';
const ANIMATION_TIMEOUT = 500; // ms
const SHORT_WAIT = 100;
const MEDIUM_WAIT = 300;

// Test describe blocks organized by feature
test.describe('ComponentName - Core Functionality', () => {
  // Setup and navigation
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Additional setup
  });

  // Individual tests
  test('feature works as expected', async ({ page }) => {
    // Test implementation
  });
});

test.describe('ComponentName - Interactive Behavior', () => {
  // Interactive tests
});

test.describe('ComponentName - Edge Cases', () => {
  // Edge case tests
});
```

### Test Naming Conventions

```typescript
// GOOD: Descriptive test names
test('demo harness page loads successfully', async ({ page }) => {});
test('category navigation scrolls to correct section', async ({ page }) => {});
test('control panel expands when controls button clicked', async ({ page }) => {});
test('state persists after page reload', async ({ page }) => {});
test('modal closes when backdrop clicked with force', async ({ page }) => {});

// BAD: Vague test names
test('it works', async ({ page }) => {});
test('test component', async ({ page }) => {});
test('check stuff', async ({ page }) => {});
```

---

## Selector Best Practices

### Selector Priority

**Order of preference (most reliable to least):**

1. `data-testid` attributes (best)
2. `data-state` attributes (for state indicators)
3. Semantic roles (`role="button"`)
4. ARIA attributes (`aria-label`, `aria-labelledby`)
5. Text content (`.getByText()`)
6. CSS classes (last resort, fragile)

### Data-TestID Pattern

```typescript
// Component implementation
<div data-testid="demo-harness">
  <aside data-testid="demo-sidebar">
    <button data-testid="category-button-animations">
      Animations
    </button>
  </aside>
  <main data-testid="demo-content">
    {demos.map((demo, index) => (
      <div key={demo.id} data-testid={`demo-${demo.id}`}>
        <h3 data-testid={`demo-${demo.id}-title`}>{demo.title}</h3>
      </div>
    ))}
  </main>
</div>

// Test selectors
const sidebar = page.locator('[data-testid="demo-sidebar"]');
const categoryButton = page.locator('[data-testid="category-button-animations"]');
const demoTitle = page.locator('[data-testid="demo-fade-up-title"]');
```

### Data-State Pattern (StateIndicator)

**Special pattern for state indicators:**

```typescript
// Component implementation
<StateIndicator
  states={[
    { label: 'Speed', value: 'normal' },
    { label: 'Distance', value: 24 },
    { label: 'Is Active', value: true }
  ]}
/>

// Generates HTML:
// <div data-state="speed">
//   <span>Speed:</span> <span>normal</span>
// </div>

// Test selectors (target the VALUE span with .last())
const speedValue = await page.locator('[data-state="speed"] span').last().textContent();
const distanceValue = await page.locator('[data-state="distance"] span').last().textContent();
const isActiveValue = await page.locator('[data-state="is-active"] span').last().textContent();

expect(speedValue).toBe('normal');
expect(distanceValue).toBe('24');
expect(isActiveValue).toBe('✓'); // Boolean true shows as checkmark
```

### Indexed Item Selectors

```typescript
// Component with indexed items
{items.map((item, index) => (
  <div key={item.id} data-testid={`hover-item-${index}`}>
    {item.content}
  </div>
))}

// Test selectors
const firstItem = page.locator('[data-testid="hover-item-0"]');
const secondItem = page.locator('[data-testid="hover-item-1"]');
const allItems = page.locator('[data-testid^="hover-item-"]'); // All items
const itemCount = await allItems.count();
```

### Chaining Selectors

```typescript
// Good: Specific selector chains
const controlPanel = page.locator('[data-testid="control-panel"]');
const resetButton = controlPanel.locator('[data-testid="reset-button"]');

// Good: Narrow scope
const modal = page.locator('[data-testid="modal"]');
const modalTitle = modal.locator('h2').first();
const modalCloseButton = modal.locator('[aria-label="Close"]');

// Bad: Overly broad selectors
const button = page.locator('button'); // Which button?
const span = page.locator('span'); // Too generic
```

---

## Animation and Timing Handling

### Wait Strategies

```typescript
// Strategy 1: waitForTimeout (simple, but less reliable)
await page.click('[data-testid="trigger-animation"]');
await page.waitForTimeout(500); // Wait for animation to complete
const element = page.locator('[data-testid="animated-element"]');
await expect(element).toHaveClass(/opacity-100/);

// Strategy 2: waitForSelector with state (better)
await page.click('[data-testid="trigger-animation"]');
await page.waitForSelector('[data-testid="animated-element"].opacity-100', {
  state: 'visible',
  timeout: 1000
});

// Strategy 3: waitForFunction (most robust)
await page.click('[data-testid="trigger-animation"]');
await page.waitForFunction(
  () => {
    const el = document.querySelector('[data-testid="animated-element"]');
    return el && getComputedStyle(el).opacity === '1';
  },
  { timeout: 1000 }
);
```

### Animation Timeout Guidelines

**Based on demo harness implementation:**

```typescript
// Animation duration constants
const FAST_ANIMATION = 300;     // duration-300
const NORMAL_ANIMATION = 500;   // duration-500
const SLOW_ANIMATION = 800;     // duration-800
const SECTION_ANIMATION = 700;  // Section animations

// Wait times (add buffer to animation duration)
const SHORT_WAIT = 100;         // Micro-interactions
const MEDIUM_WAIT = 300;        // Modal open/close
const LONG_WAIT = 500;          // Scroll animations
const EXTRA_LONG_WAIT = 1000;   // Complex transitions

// Usage
await page.click('[data-testid="modal-open"]');
await page.waitForTimeout(MEDIUM_WAIT); // Wait for modal animation
```

### Scroll-Triggered Animation Testing

```typescript
test('section animates on scroll into view', async ({ page }) => {
  await page.goto(BASE_URL);

  // Get section position
  const section = page.locator('#about-section');
  const boundingBox = await section.boundingBox();

  if (!boundingBox) throw new Error('Section not found');

  // Scroll to trigger animation
  await page.evaluate((y) => {
    window.scrollTo({ top: y - 100, behavior: 'smooth' });
  }, boundingBox.y);

  // Wait for scroll animation to complete
  await page.waitForTimeout(LONG_WAIT);

  // Verify animation applied
  const heading = section.locator('h2');
  await expect(heading).toHaveClass(/opacity-100/);
  await expect(heading).toHaveClass(/translate-y-0/);
});
```

### Testing Animation Delays

```typescript
// Testing staggered animations
test('elements animate with stagger delay', async ({ page }) => {
  await page.goto(BASE_URL);

  const items = page.locator('[data-testid^="animated-item-"]');

  // Check initial state (all invisible)
  for (let i = 0; i < 3; i++) {
    const item = items.nth(i);
    await expect(item).toHaveClass(/opacity-0/);
  }

  // Trigger animations
  await page.click('[data-testid="trigger-animations"]');

  // Item 1: No delay (200ms animation)
  await page.waitForTimeout(250);
  await expect(items.nth(0)).toHaveClass(/opacity-100/);
  await expect(items.nth(1)).toHaveClass(/opacity-0/); // Still invisible

  // Item 2: 200ms delay + 200ms animation = 400ms total
  await page.waitForTimeout(200);
  await expect(items.nth(1)).toHaveClass(/opacity-100/);
  await expect(items.nth(2)).toHaveClass(/opacity-0/); // Still invisible

  // Item 3: 400ms delay + 200ms animation = 600ms total
  await page.waitForTimeout(250);
  await expect(items.nth(2)).toHaveClass(/opacity-100/);
});
```

---

## Interactive Element Testing

### Click Interactions

```typescript
// Standard click
await page.click('[data-testid="button"]');

// Click with force (bypasses pointer-events checks)
await page.click('[data-testid="modal-backdrop"]', { force: true });

// Click at specific position
await page.click('[data-testid="element"]', { position: { x: 10, y: 10 } });

// Double click
await page.dblclick('[data-testid="element"]');

// Right click
await page.click('[data-testid="element"]', { button: 'right' });
```

### Hover Interactions

```typescript
// Hover over element
await page.hover('[data-testid="hover-item-0"]');
await page.waitForTimeout(SHORT_WAIT);

// Check hover state applied
const item = page.locator('[data-testid="hover-item-0"]');
const transform = await item.evaluate((el) => {
  return window.getComputedStyle(el).transform;
});
expect(transform).not.toBe('none');

// Hover out (move to different element)
await page.hover('[data-testid="different-element"]');
```

### Keyboard Interactions

```typescript
// Press single key
await page.keyboard.press('Enter');
await page.keyboard.press('Escape');
await page.keyboard.press('ArrowDown');

// Press key combination
await page.keyboard.press('Control+A');
await page.keyboard.press('Meta+S'); // Cmd+S on Mac

// Type text
await page.fill('[data-testid="input"]', 'Hello world');

// Tab navigation
await page.keyboard.press('Tab');
await page.keyboard.press('Shift+Tab'); // Tab backwards

// Test keyboard navigation
test('keyboard navigation works correctly', async ({ page }) => {
  await page.goto(BASE_URL);

  // Focus first element
  await page.keyboard.press('Tab');
  let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focusedElement).toBe('first-interactive-element');

  // Tab to next element
  await page.keyboard.press('Tab');
  focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focusedElement).toBe('second-interactive-element');

  // Activate with Enter
  await page.keyboard.press('Enter');
  // Verify action occurred
});
```

### Range Slider Interactions

**Special handling required:**

```typescript
// PROBLEM: Standard click doesn't work reliably for range sliders
await page.click('[data-testid="range-slider"]'); // ❌ Unreliable

// SOLUTION: Use evaluate to set value directly
await page.locator('[data-testid="range-slider"]').evaluate((el: HTMLInputElement, value: number) => {
  el.value = String(value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, 75);

// Verify new value
const sliderValue = await page.locator('[data-testid="range-slider"]').inputValue();
expect(sliderValue).toBe('75');

// Also verify state indicator updated
const stateValue = await page.locator('[data-state="speed"] span').last().textContent();
expect(stateValue).toBe('75');
```

### Form Interactions

```typescript
// Fill input
await page.fill('[data-testid="name-input"]', 'John Doe');

// Select option
await page.selectOption('[data-testid="select"]', 'option-value');
await page.selectOption('[data-testid="select"]', { label: 'Option Label' });

// Check/uncheck checkbox
await page.check('[data-testid="checkbox"]');
await page.uncheck('[data-testid="checkbox"]');

// Toggle radio button
await page.check('[data-testid="radio-option-1"]');

// Verify form state
const inputValue = await page.inputValue('[data-testid="name-input"]');
const isChecked = await page.isChecked('[data-testid="checkbox"]');
expect(inputValue).toBe('John Doe');
expect(isChecked).toBe(true);
```

---

## Visual Regression Testing

### Screenshot Capture

```typescript
// Full page screenshot
await page.screenshot({ path: 'screenshots/page.png', fullPage: true });

// Element screenshot
const element = page.locator('[data-testid="component"]');
await element.screenshot({ path: 'screenshots/component.png' });

// Screenshot comparison
await expect(page).toHaveScreenshot('baseline.png', {
  maxDiffPixels: 100, // Allow minor differences
  threshold: 0.2      // 20% threshold
});

// Screenshot with viewport
await page.setViewportSize({ width: 1920, height: 1080 });
await page.screenshot({ path: 'screenshots/desktop.png' });

await page.setViewportSize({ width: 375, height: 667 });
await page.screenshot({ path: 'screenshots/mobile.png' });
```

### Multi-Viewport Testing

```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];

for (const viewport of viewports) {
  test(`renders correctly on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(BASE_URL);
    await expect(page).toHaveScreenshot(`${viewport.name}.png`);
  });
}
```

### State Capture

```typescript
test('captures all component states', async ({ page }) => {
  await page.goto(BASE_URL);

  // Default state
  await expect(page).toHaveScreenshot('component-default.png');

  // Hover state
  await page.hover('[data-testid="component"]');
  await page.waitForTimeout(SHORT_WAIT);
  await expect(page).toHaveScreenshot('component-hover.png');

  // Active state
  await page.click('[data-testid="component"]');
  await page.waitForTimeout(SHORT_WAIT);
  await expect(page).toHaveScreenshot('component-active.png');

  // Disabled state
  await page.click('[data-testid="disable-toggle"]');
  await expect(page).toHaveScreenshot('component-disabled.png');
});
```

---

## Common Pitfalls and Solutions

### Z-Index Click Interception

**Problem:** Element is behind another element with higher z-index

```typescript
// ❌ FAILS: Modal backdrop has pointer-events CSS
await page.click('[data-testid="modal-backdrop"]');
// Error: Element is not visible

// ✅ SOLUTION: Use force click
await page.click('[data-testid="modal-backdrop"]', { force: true });
```

### Range Slider Value Setting

**Problem:** Range sliders don't respond to standard click/fill

```typescript
// ❌ FAILS: Click doesn't set value
await page.click('[data-testid="range-slider"]');

// ❌ FAILS: Fill doesn't work on range inputs
await page.fill('[data-testid="range-slider"]', '50');

// ✅ SOLUTION: Use evaluate to set value and trigger events
await page.locator('[data-testid="range-slider"]').evaluate((el: HTMLInputElement, value) => {
  el.value = String(value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, 50);
```

### StateIndicator Value Selection

**Problem:** StateIndicator has multiple `<span>` elements, need to target value

```typescript
// ❌ FAILS: Gets label text, not value
const value = await page.locator('[data-state="speed"] span').textContent();
// Returns: "Speed:" instead of "normal"

// ✅ SOLUTION: Use .last() to get value span
const value = await page.locator('[data-state="speed"] span').last().textContent();
// Returns: "normal"
```

### Animation Timing Flakiness

**Problem:** Tests fail intermittently due to animation timing

```typescript
// ❌ FLAKY: Not waiting for animation
await page.click('[data-testid="trigger"]');
await expect(element).toHaveClass(/opacity-100/);

// ✅ SOLUTION: Add explicit wait
await page.click('[data-testid="trigger"]');
await page.waitForTimeout(NORMAL_ANIMATION);
await expect(element).toHaveClass(/opacity-100/);

// ✅ BETTER: Wait for specific state
await page.click('[data-testid="trigger"]');
await page.waitForFunction(() => {
  const el = document.querySelector('[data-testid="element"]');
  return el?.classList.contains('opacity-100');
}, { timeout: 1000 });
```

### Element Not Found Errors

**Problem:** Selector doesn't match any elements

```typescript
// ❌ FAILS: Element doesn't exist yet
const button = page.locator('[data-testid="dynamic-button"]');
await button.click();

// ✅ SOLUTION: Wait for element to appear
await page.waitForSelector('[data-testid="dynamic-button"]', {
  state: 'visible',
  timeout: 5000
});
await page.click('[data-testid="dynamic-button"]');

// ✅ ALTERNATIVE: Use expect with timeout
await expect(page.locator('[data-testid="dynamic-button"]')).toBeVisible({
  timeout: 5000
});
```

### Stale Element References

**Problem:** Element reference becomes stale after page update

```typescript
// ❌ FAILS: Reference becomes stale
const element = page.locator('[data-testid="element"]');
await page.click('[data-testid="refresh"]'); // Re-renders component
await element.click(); // Stale reference

// ✅ SOLUTION: Re-query element after update
await page.click('[data-testid="refresh"]');
const element = page.locator('[data-testid="element"]'); // Fresh reference
await element.click();
```

### Hidden Controls Not Expanding

**Problem:** Need to expand controls before interacting

```typescript
// ❌ FAILS: Controls are collapsed
await page.click('[data-testid="control-reset"]');
// Error: Element not visible

// ✅ SOLUTION: Expand controls first
const controlsButton = page.locator('[data-testid="controls-toggle"]');
const isExpanded = await controlsButton.getAttribute('aria-expanded');

if (isExpanded !== 'true') {
  await controlsButton.click();
  await page.waitForTimeout(SHORT_WAIT);
}

await page.click('[data-testid="control-reset"]');
```

---

## Testing Workflow

### Development Testing

```bash
# Run single test file with UI
npx playwright test tests/motion/demo-harness.spec.ts --headed --project=chromium

# Run with debug mode
npx playwright test tests/motion/demo-harness.spec.ts --debug

# Run specific test by name
npx playwright test -g "modal closes when backdrop clicked"

# Update screenshots
npx playwright test --update-snapshots
```

### CI/CD Testing

```bash
# Run all tests headless
npx playwright test

# Run specific project (browser)
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

---

## Test Checklist

Before committing tests, verify:

- [ ] Test names are descriptive and explain what's being tested
- [ ] Selectors use `data-testid` attributes (not CSS classes)
- [ ] StateIndicator values use `.last()` selector pattern
- [ ] Range sliders use `evaluate()` method to set values
- [ ] Animations have appropriate `waitForTimeout()` calls
- [ ] Force clicks are used for backdrop/overlay interactions
- [ ] Collapsed controls are expanded before interaction
- [ ] Tests are organized in logical describe blocks
- [ ] Comments explain complex test logic
- [ ] Constants are defined for timeouts and URLs
- [ ] Tests clean up after themselves (no side effects)

---

**Document Status:** Complete
**Source:** Playwright test learnings and demo harness implementation (2025-10-02)
**Related Docs:**
- `/docs/developer/IMPLEMENTATION_STANDARDS.md` - Test ID conventions
- `/docs/UI_UX_TESTING_MASTER_GUIDE.md` - Comprehensive testing guide
- `/docs/DEMO_HARNESS_FIX_SUMMARY.md` - Test fixes and learnings
