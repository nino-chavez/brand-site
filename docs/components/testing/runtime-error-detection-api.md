# Runtime Error Detection Framework - API Reference

**Component Type:** Testing Framework
**Version:** 1.0.0
**Last Updated:** 2025-09-30

---

## Core Components

### PlaywrightTestRunner

**Location:** `test/runtime-error-detection/runner/PlaywrightRunner.ts`

Main test orchestration class that manages browser automation, scenario execution, and report generation.

#### Constructor

```typescript
new PlaywrightTestRunner(config: TestRunnerConfig)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `baseUrl` | string | `'http://localhost:3000'` | Base URL for test execution |
| `headless` | boolean | `true` | Run browser in headless mode |
| `retryAttempts` | number | `2` | Number of retry attempts for failed tests |
| `screenshotOnError` | boolean | `true` | Capture screenshots on errors |
| `videoOnError` | boolean | `false` | Record video on errors |
| `parallelism` | number | `3` | Number of concurrent test executions |

**Example:**
```typescript
const runner = new PlaywrightTestRunner({
  baseUrl: 'http://localhost:3000',
  headless: true,
  retryAttempts: 2,
  screenshotOnError: true,
  videoOnError: false,
  parallelism: 3
});
```

#### Methods

##### `registerScenarios(scenarios: TestScenario[]): void`

Register test scenarios for execution.

**Parameters:**
- `scenarios` - Array of test scenario objects

**Example:**
```typescript
runner.registerScenarios(contextProviderScenarios);
runner.registerScenarios(nullSafetyScenarios);
```

##### `run(): Promise<TestResult[]>`

Execute all registered test scenarios.

**Returns:** Promise resolving to array of test results

**Example:**
```typescript
const results = await runner.run();
console.log(`Passed: ${results.filter(r => r.passed).length}`);
```

---

## Type Definitions

### TestScenario

Defines a single test scenario.

```typescript
interface TestScenario {
  name: string;
  description: string;
  category: 'context' | 'null-safety' | 'hooks' | 'async' | 'dom' | 'type' | 'integration';
  execute: (page: Page) => Promise<void>;
  expectedErrors?: ErrorType[];
  maxDuration: number;
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Unique scenario name |
| `description` | string | Yes | Brief description of what is tested |
| `category` | string | Yes | Error category being tested |
| `execute` | function | Yes | Async function that executes the test |
| `expectedErrors` | ErrorType[] | No | Expected error types (for negative tests) |
| `maxDuration` | number | Yes | Maximum execution time in milliseconds |

**Example:**
```typescript
{
  name: 'Context Provider Missing',
  description: 'Test component behavior without required context provider',
  category: 'context',
  async execute(page: Page) {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  },
  expectedErrors: ['CONTEXT_MISSING'],
  maxDuration: 5000
}
```

---

### TestResult

Result of a test scenario execution.

```typescript
interface TestResult {
  scenario: string;
  passed: boolean;
  duration: number;
  errors: CapturedError[];
  screenshots: string[];
  logs: string[];
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `scenario` | string | Scenario name that was executed |
| `passed` | boolean | Whether the test passed (no critical errors) |
| `duration` | number | Execution time in milliseconds |
| `errors` | CapturedError[] | Array of captured errors |
| `screenshots` | string[] | Paths to captured screenshots |
| `logs` | string[] | Console logs from browser |

---

### CapturedError

Detailed information about a captured error.

```typescript
interface CapturedError {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  type: ErrorType;
  severity: ErrorSeverity;
  context: ErrorContext;
  url: string;
  userAgent: string;
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique error identifier |
| `timestamp` | number | Unix timestamp when error occurred |
| `message` | string | Error message |
| `stack` | string | Stack trace (if available) |
| `type` | ErrorType | Classification of error type |
| `severity` | ErrorSeverity | Severity level |
| `context` | object | Additional error context |
| `url` | string | URL where error occurred |
| `userAgent` | string | Browser user agent string |

---

### ErrorType

Classification of error types.

```typescript
type ErrorType =
  | 'CONTEXT_MISSING'
  | 'NULL_ACCESS'
  | 'TYPE_ERROR'
  | 'INTEGRATION_ERROR'
  | 'STATE_ERROR'
  | 'PERFORMANCE_ERROR'
  | 'UNKNOWN';
```

**Error Type Mapping:**

| Type | Trigger Pattern | Example |
|------|----------------|---------|
| `CONTEXT_MISSING` | "must be used within" | useContext without provider |
| `NULL_ACCESS` | "cannot read properties of null" | Accessing null.property |
| `TYPE_ERROR` | "is not a function", "is not defined" | Calling non-function |
| `INTEGRATION_ERROR` | "JavaScript error" in game flow | Component communication failure |
| `STATE_ERROR` | "Maximum update depth" | Infinite render loop |
| `PERFORMANCE_ERROR` | Performance warnings | Slow operations |
| `UNKNOWN` | Other patterns | Unclassified errors |

---

### ErrorSeverity

Severity classification for prioritization.

```typescript
type ErrorSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
```

**Severity Mapping:**

| Severity | Impact | Action Required |
|----------|--------|-----------------|
| `CRITICAL` | Application crash, unrecoverable | Fix immediately, block deployment |
| `HIGH` | Feature broken, user-facing | Fix before release |
| `MEDIUM` | Degraded functionality | Schedule fix |
| `LOW` | Warnings, non-blocking | Monitor, fix when convenient |

---

## CLI Interface

### Command Line Options

```bash
npm run test:runtime-errors [options]
```

**Available Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--scenario` | string | 'all' | Run specific scenario group |
| `--headless` | boolean | true | Run browser in headless mode |
| `--retries` | number | 2 | Number of retry attempts |
| `--screenshot` | boolean | true | Capture screenshots on error |
| `--video` | boolean | false | Record video on error |
| `--ci` | boolean | false | Enable CI/CD optimizations |
| `--baseUrl` | string | 'http://localhost:3000' | Base URL for testing |

**Examples:**

```bash
# Run all scenarios
npm run test:runtime-errors

# Run specific scenario group
npm run test:runtime-errors -- --scenario=contextProviders

# Debug mode with video
npm run test:runtime-errors -- --headless=false --video=true

# CI/CD mode
npm run test:runtime-errors:ci
```

---

## Scenario Groups

### Available Scenario Groups

| Group Name | Scenarios | Description |
|------------|-----------|-------------|
| `contextProviders` | 6 | Context provider configuration errors |
| `nullSafety` | 8 | Null/undefined access errors |
| `reactLifecycle` | 9 | React lifecycle and cleanup errors |
| `asyncErrors` | 12 | Async operation and network errors |
| `domManipulation` | 10 | DOM manipulation errors |
| `typeCoercion` | 10 | JavaScript type coercion errors |
| `browserCompat` | 12 | Browser compatibility issues |

**Total:** 67 scenarios

---

## Report Formats

### JSON Report

Location: `test-results/report-{timestamp}.json`

```typescript
interface TestReport {
  timestamp: string;
  config: CLIOptions;
  summary: {
    total: number;
    passed: number;
    failed: number;
    totalErrors: number;
    criticalErrors: number;
  };
  results: TestResult[];
}
```

**Usage:**
```bash
# Parse with jq
cat test-results/report-*.json | jq '.summary'

# Extract critical errors
cat test-results/report-*.json | jq '.results[].errors[] | select(.severity == "CRITICAL")'
```

---

### Markdown Report

Location: `test-results/report-{timestamp}.md`

**Sections:**
1. **Summary** - Pass/fail counts, error totals
2. **Failed Tests** - Detailed failure information
3. **Error Details** - Error messages, locations, severity
4. **Screenshots** - Paths to visual evidence
5. **Passed Tests** - List of successful tests

---

## Error Capture Engine

### ErrorCaptureEngine

**Location:** `test/runtime-error-detection/core/ErrorCapture.ts`

Singleton class that intercepts and classifies browser errors.

#### Methods

##### `getInstance(): ErrorCaptureEngine`

Get singleton instance.

```typescript
const engine = ErrorCaptureEngine.getInstance();
```

##### `install(): void`

Install error listeners in browser context.

```typescript
await page.addInitScript(() => {
  ErrorCaptureEngine.getInstance().install();
});
```

##### `getErrors(): CapturedError[]`

Retrieve captured errors.

```typescript
const errors = await page.evaluate(() => {
  return ErrorCaptureEngine.getInstance().getErrors();
});
```

---

## Extension Guide

### Creating Custom Scenarios

Create a new scenario file:

```typescript
// test/runtime-error-detection/scenarios/CustomScenarios.ts
import type { Page } from 'playwright';
import type { TestScenario } from '../runner/PlaywrightRunner';

export const customScenarios: TestScenario[] = [
  {
    name: 'Custom Test Name',
    description: 'What this test validates',
    category: 'integration',
    async execute(page: Page) {
      // Navigate to page
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Perform actions
      await page.click('button');
      await page.waitForTimeout(1000);

      // Test will automatically capture any errors
    },
    expectedErrors: [], // Or ['NULL_ACCESS'] for negative tests
    maxDuration: 10000
  }
];
```

Register in `index.ts`:

```typescript
import { customScenarios } from './scenarios/CustomScenarios';

runner.registerScenarios(customScenarios);
```

---

### Custom Error Classification

Extend error classification logic in `ErrorCapture.ts`:

```typescript
private classifyError(message: string): ErrorType {
  const lowerMessage = message.toLowerCase();

  // Add custom patterns
  if (lowerMessage.includes('your-custom-pattern')) {
    return 'CUSTOM_ERROR_TYPE';
  }

  // Existing patterns...
  return 'UNKNOWN';
}
```

---

## Integration Examples

### GitHub Actions

```yaml
name: Runtime Error Detection
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run dev &
      - run: npx wait-on http://localhost:3000
      - run: npm run test:runtime-errors:ci
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

---

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running runtime error detection..."
npm run test:runtime-errors:headless

if [ $? -ne 0 ]; then
  echo "Runtime errors detected. Commit blocked."
  exit 1
fi
```

---

## Performance Optimization

### Parallel Execution

Configure parallelism for faster execution:

```typescript
const runner = new PlaywrightTestRunner({
  parallelism: 5  // Run 5 tests concurrently
});
```

### Selective Testing

Run only relevant scenarios:

```bash
# Test only context providers
npm run test:runtime-errors -- --scenario=contextProviders

# Test null safety
npm run test:runtime-errors -- --scenario=nullSafety
```

---

## Troubleshooting

### Common Issues

**Issue:** Tests timing out
**Solution:** Increase maxDuration or check network stability

**Issue:** False positives
**Solution:** Adjust error classification patterns in ErrorCapture.ts

**Issue:** Browser crashes
**Solution:** Reduce parallelism or increase system resources

---

## Related Documentation

- [Developer Guide](../../developer/testing/runtime-error-detection.md) - Setup and usage
- [Technical Specification](../../developer/testing/runtime-error-detection-spec.md) - Architecture details
- [Showcase Documentation](../../showcase/testing-framework.md) - Portfolio presentation

---

**API Version:** 1.0.0
**Last Updated:** 2025-09-30
**Maintainer:** Development Team
