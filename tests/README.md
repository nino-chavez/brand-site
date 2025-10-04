# Test Suite Documentation

## Overview

This test suite includes Playwright E2E tests for screenshot flows and motion tests.

## Important: Use Production Build for Tests

**The screenshot flow tests must run against a production build**, not the dev server. The Vite dev server's Hot Module Replacement (HMR) causes page navigation issues that break tests.

### Quick Start

```bash
# Start production server for testing
./scripts/test-server.sh start

# Run tests
npm run test:e2e

# Stop production server
./scripts/test-server.sh stop
```

### Manual Setup

```bash
# Build production version
npm run build

# Serve production build on port 3002
npx serve dist -p 3002

# Run tests (automatically uses port 3002)
npm run test:e2e
```

## Test Categories

### Screenshot Flow Tests (`tests/screenshots/flows/`)

Captures user journeys across all sections:
- **Navigation Flow** - Complete site navigation journey
- **Gallery Flow** - Image gallery interactions
- **Canvas Flow** - Canvas mode interactions
- **Accessibility Flow** - Keyboard navigation testing
- **Game Flow Sections** - All 6 photography workflow sections

**Pass Rate:** 30/30 (100%) on production build

### Motion Tests (`tests/motion/`)

Tests animation and interaction behaviors:
- Effects panel controls
- Parallax scroll effects
- Scroll-triggered animations
- Spotlight cursor tracking
- Click handlers

**Pass Rate:** 409/948 (43.1%) - implementation fixes needed

## Environment Variables

```bash
# Override test URL (default: http://localhost:3002)
TEST_URL=http://localhost:3002 npm run test:e2e
```

## Known Issues

### ❌ Dev Server (port 3000) - DO NOT USE FOR TESTS
- Vite HMR causes execution context destruction
- Tests fail with "navigation detected" errors
- **Solution:** Always use production build (port 3002)

### ⚠️ Motion Test Failures
- 539/948 tests failing due to implementation issues
- EffectsPanel controls not wired to effects
- Scroll animations unreliable
- Spotlight cursor not tracking
- **Status:** Requires implementation fixes, not test fixes

## Test Scripts

```bash
# Run all Playwright tests
npm run test:e2e

# Run specific test file
npx playwright test tests/screenshots/flows/navigation-flow.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui

# Run with debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## Troubleshooting

### Tests failing with "execution context destroyed"
- ✅ **Solution:** Use production build, not dev server
- Run `./scripts/test-server.sh start` before tests

### Timeout errors
- Check if server is running: `curl http://localhost:3002`
- Increase timeout in test file: `test.setTimeout(60000)`
- Check browser-specific performance (WebKit slower than Chromium)

### Navigation detection logs
- Tests log `🔄 Page navigation detected` for debugging
- Expected on initial page load
- Multiple navigations during test = problem (use production build)

## Performance Notes

- **Chromium:** Fastest (~30-35s per flow)
- **Firefox:** Medium (~35-40s per flow)
- **WebKit:** Slowest (~40-50s per flow)
- **Mobile browsers:** Slowest (~45-50s per flow)

Timeouts set to 60s to accommodate all browsers.

## CI/CD Integration

For CI/CD pipelines, use production build:

```yaml
# Example GitHub Actions
- name: Build production
  run: npm run build

- name: Start test server
  run: npx serve dist -p 3002 &

- name: Run tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Contributing

When adding new tests:
1. Always test against production build (port 3002)
2. Add retry logic for flaky scroll/navigation operations
3. Use graceful error handling (skip vs fail)
4. Document expected behaviors in test comments
5. Run full suite before committing

## Test Maintenance

- **Update screenshots:** Delete `test-results/` folder and re-run
- **Update baselines:** Review generated screenshots in `test-results/`
- **Fix flaky tests:** Add retry logic, improve wait strategies
- **Performance issues:** Profile with `--trace on` flag
