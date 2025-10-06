# Claude Diagnostic Prompts for Test Configuration

**Version:** 1.0.0
**Last Updated:** 2025-10-04
**Purpose:** Reusable prompts for diagnosing and fixing test configuration issues across projects

---

## Overview

This document provides two prompt templates for detecting and resolving test configuration issues:

1. **Comprehensive Diagnostic Prompt** - Full analysis with step-by-step guidance
2. **Compact Diagnostic Prompt** - Quick triage and fix for experienced users

Both prompts are project-agnostic and work across Vitest, Jest, Mocha, and other Node.js test runners.

---

## Option 1: Comprehensive Diagnostic Prompt

Use this when you want Claude to perform a thorough analysis and provide detailed recommendations.

### Prompt Template

````markdown
# Test Configuration Diagnostic & Optimization

Analyze my test suite for memory/performance issues and optimize the configuration.

## Step 1: Diagnose Current State

1. **Examine test configuration files**:
   - Find and read: `package.json`, `vitest.config.*`, `jest.config.*`, `vite.config.*`
   - Identify: test runner (Vitest/Jest/Mocha), worker configuration, memory settings

2. **Count test files and LOC**:
   - Run: `find . -name "*.test.*" -o -name "*.spec.*" | wc -l`
   - Run: `wc -l **/*.test.* **/*.spec.* 2>/dev/null | tail -1`

3. **Check for memory pressure indicators**:
   - Search package.json for: `NODE_OPTIONS.*--max-old-space-size`
   - Search for: unlimited parallelism, missing worker limits
   - Check git history: `git log --grep="memory\|freeze\|crash\|timeout" --oneline | head -20`

## Step 2: Identify Anti-Patterns

Look for these red flags:

**Memory Anti-Patterns**:
- ❌ `NODE_OPTIONS='--max-old-space-size=8192'` or higher
- ❌ No `maxWorkers`, `maxForks`, or `maxThreads` limit
- ❌ `concurrent: true` globally without worker limits
- ❌ No test isolation (`isolate: false` or missing)

**Architecture Anti-Patterns**:
- ❌ E2E tests (`.spec.ts`) mixed with unit tests in same runner
- ❌ Heavy browser automation in unit test context
- ❌ Missing environment separation (jsdom vs node vs happy-dom)

## Step 3: Apply Fixes

Based on test runner, apply appropriate configuration:

### For Vitest (vite.config.ts or vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    // Choose pool based on isolation needs
    pool: 'forks', // Better isolation than 'threads'

    poolOptions: {
      forks: {
        // Limit to physical cores (use: sysctl -n hw.physicalcpu on Mac)
        maxForks: 4, // Conservative: 50% of cores
        minForks: 1,
        isolate: true // Prevent memory leaks between suites
      }
    },

    // Control concurrency per worker
    sequence: {
      shuffle: false,
      concurrent: false // Sequential in each worker reduces memory peaks
    },

    // Separate E2E from unit tests
    exclude: ['**/*.spec.ts', 'e2e/**', 'tests/e2e/**'],

    // Reasonable timeouts
    testTimeout: 30000,
    hookTimeout: 10000
  }
})
```

### For Jest (jest.config.js)

```javascript
module.exports = {
  // Limit workers
  maxWorkers: 4, // Or '50%' for percentage-based

  // Better isolation
  testEnvironment: 'node', // or 'jsdom' if needed
  isolateModules: true,

  // Prevent memory leaks
  resetMocks: true,
  restoreMocks: true,
  clearMocks: true,

  // Separate test types
  testMatch: ['**/*.test.{js,ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '\\.spec\\.']
}
```

### For package.json scripts

```json
{
  "scripts": {
    // REMOVE excessive NODE_OPTIONS
    "test": "vitest", // NOT: NODE_OPTIONS='--max-old-space-size=8192' vitest

    // Separate unit and E2E
    "test:unit": "vitest",
    "test:e2e": "playwright test", // or cypress, etc.

    // Debug-specific memory allocation (only if needed)
    "test:debug": "NODE_OPTIONS='--max-old-space-size=4096' vitest --no-coverage"
  }
}
```

## Step 4: Validate Fix

Run these commands to verify:

```bash
# 1. Run full suite - should NOT freeze
npm run test

# 2. Monitor memory during execution
# (Open Activity Monitor/htop in another terminal)

# 3. Check execution time (should be reasonable)
time npm run test

# 4. Verify no crashes in git hooks or CI
git commit --allow-empty -m "test: validate memory config"
```

## Step 5: Report Results

Provide summary:
- ✅/❌ Tests complete without freezing
- Duration (before vs after)
- Memory usage pattern
- Configuration changes made
- Remaining issues (if any)

---

## Quick Decision Tree

```
Is your system freezing during tests?
├─ YES → Check for:
│  ├─ Unlimited parallelism → Add maxWorkers/maxForks limit
│  ├─ Large heap allocation (>4GB) → Remove NODE_OPTIONS, use worker limits
│  └─ No test isolation → Enable isolate: true
│
└─ NO → Tests still slow/flaky?
   ├─ Check test distribution (unit vs E2E mixed)
   ├─ Check for synchronous global setup
   └─ Profile with --reporter=verbose
```

---

Execute this analysis now and provide recommendations.
````

### Expected Output

Claude should:
1. Read all configuration files
2. Count test files and identify patterns
3. Detect anti-patterns (memory allocation, worker limits)
4. Provide specific configuration fixes
5. Validate by running tests
6. Report before/after metrics

### When to Use

- **New project setup**: Establishing test configuration standards
- **Inherited codebase**: Auditing unfamiliar test setup
- **Teaching moment**: Want detailed explanations for team review
- **Documentation**: Creating project-specific test configuration guide

---

## Option 2: Compact Diagnostic Prompt

Use this for quick triage and fixes in familiar codebases.

### Prompt Template

```markdown
Analyze and fix my test configuration for memory issues:

1. **Read** package.json + test config files (vitest/jest/vite config)
2. **Identify** memory anti-patterns:
   - Excessive NODE_OPTIONS heap size (>4GB)
   - Unlimited worker parallelism
   - Missing test isolation
3. **Apply fixes**:
   - Remove global --max-old-space-size
   - Add worker pool limits (maxForks: 4 or maxWorkers: '50%')
   - Enable process isolation
   - Separate E2E from unit tests
4. **Validate**: Run full test suite, verify no freeze/crash
5. **Report**: Before/after metrics (duration, memory, stability)

Focus on preventing memory exhaustion from unbounded parallelism.
```

### Expected Output

Claude should:
1. Quickly scan configuration files
2. Apply standard fixes (worker limits, isolation)
3. Run tests to validate
4. Provide concise before/after comparison

### When to Use

- **Quick fixes**: Emergency production issue resolution
- **CI/CD optimization**: Fast iteration on test pipeline
- **Experienced teams**: Minimal hand-holding needed
- **Time-constrained**: Need results in <5 minutes

---

## Comparison Matrix

| Aspect | Comprehensive | Compact |
|--------|--------------|---------|
| **Time to complete** | 10-15 minutes | 3-5 minutes |
| **Output verbosity** | High (detailed explanations) | Low (action-focused) |
| **Best for** | Learning, documentation | Quick fixes, experienced users |
| **Git history check** | ✅ Included | ❌ Skipped |
| **Decision tree** | ✅ Included | ❌ Skipped |
| **Configuration templates** | ✅ Full examples | ⚠️ Minimal references |
| **Validation steps** | ✅ 4-step process | ✅ Single validation run |

---

## Integration with Project Workflows

### In `.claude/CLAUDE.md`

Add reference to these prompts:

```markdown
## Test Configuration Issues

If experiencing test freezes or memory issues:
1. Use diagnostic prompts from `.claude/standards/testing/claude-diagnostic-prompts.md`
2. Reference configuration standard in `.claude/standards/testing/test-configuration-optimization.md`
3. Apply fixes and validate before committing
```

### In CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      # Validate test configuration matches standards
      - name: Check test config
        run: |
          if grep -q "max-old-space-size" package.json; then
            echo "❌ Found max-old-space-size in package.json"
            echo "See .claude/standards/testing/test-configuration-optimization.md"
            exit 1
          fi

      - run: npm test
```

---

## Diagnostic Pattern Library

Common patterns Claude should detect:

### Pattern 1: Memory Exhaustion

**Indicators:**
```bash
# package.json
"test": "NODE_OPTIONS='--max-old-space-size=8192' vitest"

# No worker limits in config
# Git history shows: "fix: increase heap size", "chore: bump memory limit"
```

**Fix:**
```typescript
// Remove NODE_OPTIONS, add worker pool
poolOptions: { forks: { maxForks: 4, isolate: true } }
```

---

### Pattern 2: E2E Contamination

**Indicators:**
```typescript
// Vitest running Playwright tests
include: ['**/*.{test,spec}.{ts,tsx}']

// Mixing unit and E2E in same execution
```

**Fix:**
```typescript
// Separate by file pattern
exclude: ['**/*.spec.ts', 'e2e/**']

// Create separate npm scripts
"test:unit": "vitest"
"test:e2e": "playwright test"
```

---

### Pattern 3: Poor Isolation

**Indicators:**
```typescript
// Missing isolation config
pool: 'threads' // or no pool specified
// No isolate: true
```

**Fix:**
```typescript
pool: 'forks',
poolOptions: { forks: { isolate: true } }
```

---

## Advanced Usage

### Combining with Other Agents

```markdown
After applying test configuration fixes, run these agents:

1. **test-coverage-guardian**: Verify coverage hasn't regressed
2. **performance-budget-enforcer**: Validate execution time improvements
3. **project-manager**: Update task tracking with optimization results

Example:
```bash
# Apply test config fixes (using compact prompt)
# Then validate with agents:
npm run validate  # Triggers .claude/agents quality gates
```
```

### Metrics to Track

Document before/after for posterity:

```markdown
## Test Configuration Optimization - [Date]

**Before:**
- Duration: X seconds
- Memory: Y GB peak
- Worker count: Unlimited
- Freezes: Yes/No

**After:**
- Duration: X seconds (±% change)
- Memory: Y GB peak (±% change)
- Worker count: N (configured limit)
- Freezes: No ✅

**Configuration Changes:**
- [List specific changes made]

**Reference:**
- Standard: `.claude/standards/testing/test-configuration-optimization.md`
- Prompt used: [Comprehensive/Compact]
```

---

## Troubleshooting

### Claude Not Detecting Issues

If Claude misses configuration problems:

1. **Be explicit about symptoms**:
   ```
   "Tests freeze my system after 2-3 minutes. Activity Monitor shows 40+ node processes."
   ```

2. **Provide git history context**:
   ```
   "Run: git log --grep='memory\|timeout' --oneline"
   ```

3. **Reference this document**:
   ```
   "Use the diagnostic prompts from .claude/standards/testing/claude-diagnostic-prompts.md"
   ```

### Claude Applies Wrong Fix

If Claude suggests irrelevant solutions (e.g., AI model pooling):

```markdown
**Clarify test runner architecture:**

"This is a standard Vitest test suite with jsdom environment.
We are NOT loading AI models in tests.
Focus on Node.js process/worker pool configuration, not LLM instance pooling."
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-04 | Initial prompts based on portfolio project diagnostic experience |

---

## References

- **Parent Standard**: `.claude/standards/testing/test-configuration-optimization.md`
- **Case Study**: Nino Chavez Portfolio (146 test files, 530 tests optimized)
- **Claude Code Documentation**: https://docs.claude.com/claude-code

---

**Standard Owner**: Nino Chavez
**Review Cycle**: Quarterly or when test runner versions change significantly
**Feedback**: Submit improvements via git commits with `docs(standards):` prefix
