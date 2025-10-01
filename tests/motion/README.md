# Motion Testing Framework

Automated testing suite for animations, transitions, and interactive motion effects.

## Quick Start

```bash
# Run all motion tests with video recording
npm run test:motion

# Run with browser visible (debug mode)
npm run test:motion:headed

# Run specific test file
npm run test:motion -- magnetic-buttons.spec.ts

# View HTML report
npm run test:motion:report
```

## Test Categories

### 1. Property Assertions (`magnetic-buttons.spec.ts`)
- Tests CSS transform properties
- Validates timing and behavior
- Checks reduced motion preferences
- **Runs in CI:** ✅ Fast, reliable

### 2. Scroll Sync (`scroll-sync.spec.ts`)
- Tests header navigation sync with scroll
- Validates section transitions
- Checks scroll progress indicators
- **Runs in CI:** ✅ Essential for UX

### 3. Section Animations (`section-animations.spec.ts`)
- Tests entrance animations
- Validates staggered animation sequences
- Checks opacity and transform transitions
- **Runs in CI:** ✅ Ensures polish

### 4. Video Recording (`video-recording.spec.ts`)
- Records critical interactions
- Captures magnetic button motion
- Documents scroll behavior
- **Runs in CI:** ⚠️ Large files, optional

## Test Structure

```
tests/motion/
├── magnetic-buttons.spec.ts    # Interactive button effects
├── scroll-sync.spec.ts         # Navigation and scroll behavior
├── section-animations.spec.ts  # Section entrance animations
├── video-recording.spec.ts     # Video documentation
├── helpers/
│   └── motion-test-utils.ts    # Shared utilities
└── README.md                   # This file
```

## Configuration

Motion tests use a specialized config: `playwright.motion.config.ts`

Key settings:
- **Video:** Always on
- **Workers:** 1 (sequential for consistent videos)
- **Viewport:** 1920x1080 (high quality)
- **Screenshot:** On failure

## CI/CD Integration

Tests run automatically on:
- ✅ Every push to `main` or `develop`
- ✅ Every pull request
- ✅ Daily at 2 AM UTC (regression check)

### Artifacts Saved

1. **Test Results** (7 days)
   - HTML report
   - JSON results
   - Screenshots on failure

2. **Videos** (14 days)
   - Full interaction recordings
   - Critical animation sequences

3. **Motion Report** (7 days)
   - Summary of test run
   - Comparison with previous run

## Writing New Motion Tests

### Example: Test a New Animation

```typescript
import { test, expect } from '@playwright/test';
import { waitForAnimationComplete } from './helpers/motion-test-utils';

test('my new animation', async ({ page }) => {
  await page.goto('/');

  const element = page.getByTestId('my-element');

  // Trigger animation
  await element.scrollIntoViewIfNeeded();

  // Wait for completion
  await waitForAnimationComplete(element);

  // Assert final state
  const opacity = await element.evaluate(el =>
    window.getComputedStyle(el).opacity
  );
  expect(parseFloat(opacity)).toBeGreaterThan(0.9);
});
```

### Test Utilities Available

```typescript
import {
  parseTransformMatrix,       // Parse CSS matrix
  waitForAnimationComplete,   // Wait for animation
  captureElementPosition,     // Get element bounds
  hasElementMoved,            // Check if moved
  circularMouseMotion,        // Circular cursor motion
  getActiveNavText,           // Get active nav button
  measureScrollPerformance,   // FPS measurement
} from './helpers/motion-test-utils';
```

## Output Locations

```
test-results/
├── motion-report/              # HTML test report
│   └── index.html
├── motion-results.json         # JSON test data
├── magnetic-buttons-chromium-motion/
│   ├── video.webm             # Test video
│   └── screenshots/           # Failure screenshots
└── ...other test runs
```

## Best Practices

### ✅ Do

- Use `data-testid` for reliable selectors
- Wait for animations to complete before assertions
- Test both hover-in and hover-out states
- Use helper utilities for common tasks
- Keep tests independent and isolated

### ❌ Don't

- Hard-code timing (use `waitForAnimationComplete`)
- Test implementation details (test user-visible behavior)
- Create flaky tests with inconsistent waits
- Record videos for every test (expensive)
- Skip accessibility testing (check reduced motion)

## Debugging Failed Tests

### 1. Run in Headed Mode
```bash
npm run test:motion:headed
```

### 2. Use Debug Mode
```bash
npm run test:motion:debug
```

### 3. Check Video Recording
```bash
# Videos saved to: test-results/*/video.webm
open test-results/**/video.webm
```

### 4. Review HTML Report
```bash
npm run test:motion:report
```

## Performance Benchmarks

Expected test durations:
- `magnetic-buttons.spec.ts`: ~30s
- `scroll-sync.spec.ts`: ~45s
- `section-animations.spec.ts`: ~40s
- `video-recording.spec.ts`: ~2min

Total suite: ~4 minutes

## Maintenance

### Update Baselines

If intentional motion changes are made:

1. Review test failures
2. Update assertions if behavior changed intentionally
3. Re-record reference videos if needed
4. Document changes in commit message

### Add New Interactive Elements

When adding new animated components:

1. Add `data-testid` attribute
2. Create test in appropriate spec file
3. Test both active and inactive states
4. Consider reduced motion preference
5. Add to CI if critical UX

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check Node version (should be 20)
- Clear `node_modules` and reinstall
- Ensure dev server is running
- Check viewport size (should be 1920x1080)

### Videos Not Recording

- Check `playwright.motion.config.ts` has `video: 'on'`
- Ensure disk space available
- Verify test completes (videos save on test end)

### Animations Don't Trigger

- Check `waitForLoadState('networkidle')`
- Verify element is in viewport
- Check for reduced motion in test environment
- Increase wait times if needed

## Related Documentation

- [Motion Testing Guide](../../docs/MOTION_TESTING_GUIDE.md)
- [Test Coverage Diagnostic](../../docs/TEST_COVERAGE_DIAGNOSTIC_2025-10-01.md)
- [Playwright Documentation](https://playwright.dev/)

## Support

Issues? Check:
1. Test output in terminal
2. HTML report for details
3. Video recordings for visual confirmation
4. Screenshots on failure

For framework questions, consult the Motion Testing Guide.
