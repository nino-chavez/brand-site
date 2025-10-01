# Motion & Animation Testing Guide

**Date:** 2025-10-01
**Purpose:** Comprehensive guide to testing dynamic behavior, animations, and interactive states

---

## Overview: Beyond Static Screenshots

Static screenshots can't capture:
- ❌ Animations and transitions
- ❌ Hover effects and state changes
- ❌ Scroll-triggered behaviors
- ❌ Magnetic button pulls
- ❌ Progressive loading states
- ❌ Time-based interactions

This guide covers **4 approaches** to test motion:

1. **Video Recording** (captures actual motion)
2. **Multi-frame Screenshots** (animation sequences)
3. **Property Assertions** (CSS/transform validation)
4. **Visual Regression with Motion** (Percy/Chromatic)

---

## Approach 1: Video Recording Tests

### Playwright Video Capture

Playwright can record videos of entire test runs or specific interactions.

#### A. Record Entire Test Suite
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    video: 'on', // or 'retain-on-failure', 'on-first-retry'
    trace: 'on-first-retry',
  },
});
```

#### B. Record Specific Interactions
```typescript
// tests/motion/magnetic-buttons.spec.ts
import { test, expect } from '@playwright/test';

test('magnetic button effect - video validation', async ({ page }) => {
  // Start recording
  await page.goto('/');

  const button = page.getByTestId('view-work-cta');

  // Hover near button to trigger magnetic effect
  const box = await button.boundingBox();

  // Move cursor in circular motion around button (60fps over 2 seconds)
  const steps = 120; // 60fps * 2 seconds
  const radius = 100;

  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const x = box.x + box.width/2 + Math.cos(angle) * radius;
    const y = box.y + box.height/2 + Math.sin(angle) * radius;

    await page.mouse.move(x, y);
    await page.waitForTimeout(16); // ~60fps
  }

  // Video is automatically saved to test-results/
});
```

**Output:** `test-results/magnetic-buttons-video.webm`

---

## Approach 2: Multi-Frame Screenshot Sequences

Capture animation as a series of frames, like a flipbook.

### A. Scroll Animation Sequence
```typescript
// tests/motion/scroll-transitions.spec.ts
import { test } from '@playwright/test';

test('capture scroll transition animation sequence', async ({ page }) => {
  await page.goto('/');

  const captureSection = page.locator('#capture');
  const focusSection = page.locator('#focus');

  // Get initial and final positions
  const startY = (await captureSection.boundingBox())!.y;
  const endY = (await focusSection.boundingBox())!.y;
  const distance = endY - startY;

  // Capture 30 frames during scroll transition
  const frames = 30;

  for (let i = 0; i <= frames; i++) {
    const progress = i / frames;
    const scrollY = startY + (distance * progress);

    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(33); // ~30fps

    await page.screenshot({
      path: `test-results/scroll-sequence/frame-${i.toString().padStart(3, '0')}.png`,
    });
  }

  // Can convert frames to GIF or video with ffmpeg:
  // ffmpeg -framerate 30 -i frame-%03d.png -vf "fps=30" scroll-transition.gif
});
```

### B. Hover State Transition Sequence
```typescript
test('magnetic button hover sequence', async ({ page }) => {
  await page.goto('/');

  const button = page.getByTestId('view-work-cta');
  const box = await button.boundingBox();

  // Capture hover approach (cursor moving toward button)
  const frames = 20;
  const startX = box.x + box.width + 150; // Start far away
  const endX = box.x + box.width + 50;    // End in magnetic range
  const y = box.y + box.height / 2;

  for (let i = 0; i <= frames; i++) {
    const progress = i / frames;
    const x = startX + ((endX - startX) * progress);

    await page.mouse.move(x, y);
    await page.waitForTimeout(50);

    await page.screenshot({
      path: `test-results/magnetic-hover/frame-${i.toString().padStart(3, '0')}.png`,
      clip: {
        x: box.x - 100,
        y: box.y - 50,
        width: box.width + 300,
        height: box.height + 100,
      },
    });
  }
});
```

**Convert to GIF:**
```bash
# Install ffmpeg: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)

# Create animated GIF from frames
ffmpeg -framerate 20 -i test-results/magnetic-hover/frame-%03d.png \
  -vf "fps=20,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  magnetic-hover-animation.gif

# Create video
ffmpeg -framerate 20 -i test-results/magnetic-hover/frame-%03d.png \
  -c:v libx264 -pix_fmt yuv420p magnetic-hover.mp4
```

---

## Approach 3: Property & Transform Assertions

Test that CSS properties change correctly during animations.

### A. Transform Property Validation
```typescript
// tests/motion/transform-assertions.spec.ts
import { test, expect } from '@playwright/test';

test('magnetic button should translate toward cursor', async ({ page }) => {
  await page.goto('/');

  const button = page.getByTestId('view-work-cta');

  // Get initial transform
  const initialTransform = await button.evaluate((el) => {
    return window.getComputedStyle(el).transform;
  });

  expect(initialTransform).toBe('none'); // or 'matrix(1, 0, 0, 1, 0, 0)'

  // Hover near button (within magnetic radius)
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width + 60, box.y + box.height / 2);

  // Wait for animation
  await page.waitForTimeout(200);

  // Get new transform
  const activeTransform = await button.evaluate((el) => {
    return window.getComputedStyle(el).transform;
  });

  // Should have translate applied
  expect(activeTransform).not.toBe('none');
  expect(activeTransform).toMatch(/matrix\([\d.]+, [\d.]+, [\d.]+, [\d.]+, [^0][\d.]*,/);

  // Extract translate values
  const matrix = activeTransform.match(/matrix\((.*)\)/)?.[1].split(', ');
  const translateX = parseFloat(matrix![4]);
  const translateY = parseFloat(matrix![5]);

  // Should have moved right (positive X) toward cursor
  expect(translateX).toBeGreaterThan(0);
  expect(translateX).toBeLessThan(50); // Within reasonable range

  // Move cursor away
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);

  // Should return to original position
  const resetTransform = await button.evaluate((el) => {
    return window.getComputedStyle(el).transform;
  });

  expect(resetTransform).toBe('none');
});
```

### B. Opacity Transition Validation
```typescript
test('section fade-in animation', async ({ page }) => {
  await page.goto('/');

  const aboutSection = page.locator('#focus');
  const narrative = page.getByTestId('about-narrative');

  // Initially should be hidden (opacity 0)
  await aboutSection.scrollIntoViewIfNeeded();

  const initialOpacity = await narrative.evaluate((el) => {
    return window.getComputedStyle(el).opacity;
  });

  expect(parseFloat(initialOpacity)).toBeLessThan(0.1);

  // Wait for animation to complete
  await page.waitForTimeout(1500);

  // Should be fully visible
  const finalOpacity = await narrative.evaluate((el) => {
    return window.getComputedStyle(el).opacity;
  });

  expect(parseFloat(finalOpacity)).toBeGreaterThan(0.9);
});
```

### C. Scroll Progress Tracking
```typescript
test('scroll progress indicator updates', async ({ page }) => {
  await page.goto('/');

  const scrollProgress = page.locator('[data-testid="scroll-progress"]');

  // Get initial width/value
  const initialProgress = await scrollProgress.evaluate((el) => {
    return {
      width: window.getComputedStyle(el).width,
      transform: window.getComputedStyle(el).transform,
    };
  });

  // Scroll halfway down page
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight / 2);
  });

  await page.waitForTimeout(100);

  // Progress should have increased
  const midProgress = await scrollProgress.evaluate((el) => {
    return {
      width: window.getComputedStyle(el).width,
      transform: window.getComputedStyle(el).transform,
    };
  });

  expect(midProgress.width).not.toBe(initialProgress.width);

  // Scroll to bottom
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });

  await page.waitForTimeout(100);

  // Should be at 100%
  const finalProgress = await scrollProgress.evaluate((el) => {
    return {
      width: window.getComputedStyle(el).width,
      transform: window.getComputedStyle(el).transform,
    };
  });

  // Width should be maximum (100% or full container width)
  expect(finalProgress.width).not.toBe(midProgress.width);
});
```

---

## Approach 4: Visual Regression with Animation Support

### Percy (Recommended for Production)

Percy can capture animations with their **animated GIF snapshots** feature.

```typescript
// tests/motion/percy-animations.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('animated magnetic button effect', async ({ page }) => {
  await page.goto('/');

  const button = page.getByTestId('view-work-cta');
  const box = await button.boundingBox();

  // Percy can capture animations as GIFs
  await percySnapshot(page, 'Magnetic Button - Resting State');

  // Trigger animation
  await page.mouse.move(box.x + box.width + 60, box.y + box.height / 2);
  await page.waitForTimeout(200);

  await percySnapshot(page, 'Magnetic Button - Active State');

  // Can also capture video with Percy Video (enterprise feature)
  await percySnapshot(page, 'Magnetic Button - Interaction', {
    enableJavaScript: true,
    animationTimestamps: [0, 100, 200, 300], // Capture at specific times
  });
});
```

**Setup Percy:**
```bash
npm install --save-dev @percy/cli @percy/playwright

# In package.json
"scripts": {
  "test:visual": "percy exec -- playwright test tests/motion/"
}

# Run
PERCY_TOKEN=your_token npm run test:visual
```

### Chromatic (Storybook Integration)

Great for component-level animation testing.

```typescript
// .storybook/test-runner.js
module.exports = {
  async postRender(page, context) {
    // Wait for animations to complete
    await page.waitForTimeout(1000);

    // Chromatic captures multiple states
    if (context.id.includes('magnetic-button')) {
      // Capture hover state
      await page.hover('[data-testid="view-work-cta"]');
      await page.waitForTimeout(200);
    }
  },
};
```

---

## Approach 5: Animation Performance Testing

Test that animations run smoothly (no jank).

### A. Frame Rate Monitoring
```typescript
// tests/motion/performance.spec.ts
import { test, expect } from '@playwright/test';

test('scroll animation maintains 60fps', async ({ page }) => {
  await page.goto('/');

  // Start performance monitoring
  await page.evaluate(() => {
    (window as any).frameTimestamps = [];
    let lastTimestamp = performance.now();

    const measureFrame = () => {
      const now = performance.now();
      const delta = now - lastTimestamp;
      (window as any).frameTimestamps.push(delta);
      lastTimestamp = now;
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  });

  // Perform smooth scroll
  await page.evaluate(() => {
    document.querySelector('#focus')?.scrollIntoView({ behavior: 'smooth' });
  });

  await page.waitForTimeout(2000);

  // Analyze frame times
  const frameData = await page.evaluate(() => {
    const timestamps = (window as any).frameTimestamps;
    const avgFrameTime = timestamps.reduce((a: number, b: number) => a + b, 0) / timestamps.length;
    const maxFrameTime = Math.max(...timestamps);
    const droppedFrames = timestamps.filter((t: number) => t > 20).length; // >20ms = dropped frame at 60fps

    return { avgFrameTime, maxFrameTime, droppedFrames, totalFrames: timestamps.length };
  });

  console.log('Animation Performance:', frameData);

  // Assert acceptable performance
  expect(frameData.avgFrameTime).toBeLessThan(18); // 60fps = 16.67ms per frame
  expect(frameData.droppedFrames).toBeLessThan(frameData.totalFrames * 0.05); // <5% dropped frames
});
```

### B. CSS Animation Completion
```typescript
test('section transitions complete successfully', async ({ page }) => {
  await page.goto('/');

  const aboutSection = page.locator('#focus');

  await aboutSection.scrollIntoViewIfNeeded();

  // Wait for animations to complete
  await page.waitForFunction(() => {
    const element = document.querySelector('[data-testid="about-narrative"]');
    if (!element) return false;

    // Check if all animations/transitions have ended
    const style = window.getComputedStyle(element);
    return parseFloat(style.opacity) >= 0.99 &&
           style.transform !== 'none';
  }, { timeout: 3000 });

  // Verify final state
  const finalState = await page.getByTestId('about-narrative').evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      opacity: style.opacity,
      transform: style.transform,
      visibility: style.visibility,
    };
  });

  expect(parseFloat(finalState.opacity)).toBeGreaterThan(0.99);
  expect(finalState.visibility).toBe('visible');
});
```

---

## Recommended Testing Strategy

### For Your Portfolio Site

**1. Critical Motion Tests (Must Have)**
```typescript
// tests/motion/critical-animations.spec.ts

// Test 1: Magnetic buttons work
test('hero buttons have magnetic effect');

// Test 2: Scroll reveals sections
test('sections fade in during scroll');

// Test 3: Nav syncs with scroll
test('header nav updates during scroll');

// Test 4: Scroll progress indicator
test('scroll progress bar fills correctly');
```

**2. Visual Regression Sequences (Should Have)**
```typescript
// Capture key animation sequences as multi-frame screenshots
test('scroll transition sequence - capture to focus');
test('magnetic hover sequence - button pull effect');
test('section entrance animations');
```

**3. Performance Monitoring (Nice to Have)**
```typescript
// Ensure smooth 60fps animations
test('scroll performance - no dropped frames');
test('hover animations complete within 200ms');
```

---

## Implementation Example

Create a complete motion test suite:

```typescript
// tests/motion/magnetic-buttons-complete.spec.ts
import { test, expect } from '@playwright/test';
import { writeFile, mkdir } from 'fs/promises';

test.describe('Magnetic Button Effects - Complete Test Suite', () => {

  test('should apply transform on hover (property assertion)', async ({ page }) => {
    await page.goto('/');
    const button = page.getByTestId('view-work-cta');

    const initialTransform = await button.evaluate(
      (el) => window.getComputedStyle(el).transform
    );
    expect(initialTransform).toBe('none');

    const box = await button.boundingBox()!;
    await page.mouse.move(box.x + box.width + 60, box.y + box.height / 2);
    await page.waitForTimeout(200);

    const activeTransform = await button.evaluate(
      (el) => window.getComputedStyle(el).transform
    );
    expect(activeTransform).not.toBe('none');
    expect(activeTransform).toContain('matrix');
  });

  test('should create animation sequence (multi-frame)', async ({ page }) => {
    await page.goto('/');
    const button = page.getByTestId('view-work-cta');
    const box = await button.boundingBox()!;

    await mkdir('test-results/magnetic-sequence', { recursive: true });

    const frames = 20;
    const startX = box.x + box.width + 150;
    const endX = box.x + box.width + 50;
    const y = box.y + box.height / 2;

    for (let i = 0; i <= frames; i++) {
      const progress = i / frames;
      const x = startX + ((endX - startX) * progress);

      await page.mouse.move(x, y);
      await page.waitForTimeout(50);

      await page.screenshot({
        path: `test-results/magnetic-sequence/frame-${i.toString().padStart(3, '0')}.png`,
        clip: { x: box.x - 50, y: box.y - 50, width: box.width + 200, height: box.height + 100 },
      });
    }

    console.log('✅ Captured 20 frames - convert with: ffmpeg -framerate 20 -i frame-%03d.png output.gif');
  });

  test('should record video interaction (video capture)', async ({ page, browser }) => {
    // Enable video for this specific test
    const context = await browser.newContext({
      recordVideo: {
        dir: 'test-results/videos/',
        size: { width: 1280, height: 720 },
      },
    });

    const videoPage = await context.newPage();
    await videoPage.goto('/');

    const button = videoPage.getByTestId('view-work-cta');
    const box = await button.boundingBox()!;

    // Perform circular motion around button
    const steps = 60;
    const radius = 100;

    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = box.x + box.width/2 + Math.cos(angle) * radius;
      const y = box.y + box.height/2 + Math.sin(angle) * radius;

      await videoPage.mouse.move(x, y);
      await videoPage.waitForTimeout(33); // 30fps
    }

    await videoPage.close();
    const path = await videoPage.video()!.path();
    console.log('✅ Video saved to:', path);
  });
});
```

---

## Tools Comparison

| Tool | Best For | Pros | Cons |
|------|----------|------|------|
| **Playwright Video** | Full interaction recordings | Easy setup, automatic | Large file sizes, manual review |
| **Multi-frame Screenshots** | Animation sequences | Precise frame capture, GIF export | More code, processing needed |
| **Property Assertions** | Validating CSS changes | Fast, reliable, CI-friendly | Doesn't capture visual appearance |
| **Percy** | Visual regression with motion | Cloud-based, automatic diffing | Costs money, requires service |
| **Chromatic** | Component animations (Storybook) | Great for design systems | Requires Storybook setup |

---

## Recommended Setup for Your Portfolio

```bash
# 1. Enable video in playwright.config.ts
# 2. Create motion test suite
mkdir -p tests/motion
touch tests/motion/magnetic-buttons.spec.ts
touch tests/motion/scroll-animations.spec.ts
touch tests/motion/navigation-sync.spec.ts

# 3. Run tests with video
npm run test:motion -- --headed

# 4. Review videos in test-results/
open test-results/videos/
```

**Add to package.json:**
```json
{
  "scripts": {
    "test:motion": "playwright test tests/motion/ --project=chromium",
    "test:motion:video": "playwright test tests/motion/ --video=on",
    "test:motion:debug": "playwright test tests/motion/ --headed --debug"
  }
}
```

---

## Next Steps

1. **Start with property assertions** - fastest to implement, works in CI
2. **Add video recording** for critical interactions (magnetic buttons, scroll sync)
3. **Create multi-frame sequences** for documentation/debugging
4. **Consider Percy/Chromatic** if budget allows

Would you like me to create working test files for your specific animations?
