# Test Configuration Optimization Standard

**Version:** 1.0.0
**Last Updated:** 2025-10-04
**Applies To:** Node.js projects using Vitest, Jest, or similar test runners
**Purpose:** Prevent memory exhaustion and system freezing during test execution

---

## Problem Statement

Large test suites (100+ files, 500+ tests) can cause system freezing or crashes due to:

1. **Unbounded Parallelism**: Test runners spawning unlimited worker processes
2. **Excessive Memory Allocation**: Global heap size settings (e.g., 8GB+) without worker limits
3. **Poor Process Isolation**: Memory leaks accumulating across test suites
4. **Mixed Test Types**: E2E and unit tests competing for resources in same runner

### Symptoms

- System freeze during `npm test` or `npm run test`
- Out of memory errors despite large heap allocation
- Tests that never complete or timeout globally
- Activity Monitor showing dozens of Node processes consuming all RAM

---

## Solution Architecture

### Core Principle

**Replace "one large process" with "controlled worker pool"**

```
❌ BEFORE: 1 process × 8GB heap × unlimited parallelism = System freeze
✅ AFTER:  4 workers × 4GB each × process isolation = Stable execution
```

### Configuration Pattern

```typescript
// vite.config.ts or vitest.config.ts
export default defineConfig({
  test: {
    // 1. Choose isolation strategy
    pool: 'forks', // Better isolation than 'threads'

    // 2. Limit concurrent workers
    poolOptions: {
      forks: {
        maxForks: 4,      // Conservative: 50% of physical cores
        minForks: 1,
        isolate: true     // Prevent memory leaks between suites
      }
    },

    // 3. Control execution pattern
    sequence: {
      shuffle: false,
      concurrent: false   // Sequential within each worker
    },

    // 4. Reasonable timeouts
    testTimeout: 30000,   // 30s for complex UI tests
    hookTimeout: 10000    // 10s for setup/teardown
  }
})
```

```json
// package.json - Remove excessive memory allocation
{
  "scripts": {
    "test": "vitest",                    // ✅ Let worker pool manage memory
    "test:ui": "vitest --ui",
    "test:run": "vitest run",

    // ❌ AVOID: "test": "NODE_OPTIONS='--max-old-space-size=8192' vitest"
  }
}
```

---

## Implementation Guide

### Step 1: Diagnose Current Configuration

```bash
# Check for memory anti-patterns
grep -r "max-old-space-size" package.json

# Count test files
find . -name "*.test.*" -o -name "*.spec.*" | wc -l

# Check git history for memory issues
git log --grep="memory\|freeze\|crash" --oneline | head -10
```

### Step 2: Identify Anti-Patterns

| Anti-Pattern | Impact | Fix |
|--------------|--------|-----|
| `NODE_OPTIONS='--max-old-space-size=8192'` | Allocates 8GB without worker limits | Remove; use worker pool instead |
| No `maxForks`/`maxWorkers` limit | Spawns unlimited processes | Add conservative limit (4-8 workers) |
| `concurrent: true` globally | Memory pressure spikes | Use `concurrent: false` per worker |
| No `isolate: true` | Memory leaks accumulate | Enable process isolation |
| E2E tests (`.spec.ts`) in unit runner | Resource competition | Separate test types |

### Step 3: Apply Configuration

**For Vitest:**

```typescript
// vite.config.ts
test: {
  pool: 'forks',
  poolOptions: {
    forks: {
      maxForks: Math.max(2, Math.floor(os.cpus().length / 2)), // 50% of cores
      isolate: true
    }
  },
  sequence: { concurrent: false },
  exclude: ['**/*.spec.ts', 'e2e/**'] // Separate E2E tests
}
```

**For Jest:**

```javascript
// jest.config.js
module.exports = {
  maxWorkers: '50%',        // Percentage-based limit
  isolateModules: true,
  resetMocks: true,
  testPathIgnorePatterns: ['/e2e/', '\\.spec\\.']
}
```

### Step 4: Validate

```bash
# Run full suite - should NOT freeze
npm run test

# Monitor memory (in separate terminal)
# Open Activity Monitor (Mac) or htop (Linux)

# Measure execution time
time npm run test

# Expected: Completion in <60s without freeze
```

---

## Real-World Case Study

### Project: Nino Chavez Portfolio

**Before:**
- **Config**: `NODE_OPTIONS='--max-old-space-size=8192' vitest`
- **Workers**: Unlimited parallelism
- **Problem**: System freeze, tests never complete
- **Test Suite**: 146 files, 530 tests, 70K+ LOC

**After:**
- **Config**: `pool: 'forks'`, `maxForks: 4`, `isolate: true`
- **Workers**: 4 process forks
- **Result**: ✅ Stable execution in 23.39s
- **Memory**: 17.2GB max (52% free RAM headroom)

**Key Metrics:**
```
Duration:    23.39s (target: <30s) ✅
Throughput:  22.7 tests/sec
Memory:      17.2GB max (vs 8GB allocated before)
Stability:   No freezes/crashes ✅
```

---

## Decision Matrix

### When to Use Fork Pool

| Scenario | Recommendation | Reason |
|----------|---------------|--------|
| 100+ test files | ✅ Use fork pool | Better isolation prevents leaks |
| jsdom/happy-dom environment | ✅ Use fork pool | DOM mocking is memory-intensive |
| Large component tests | ✅ Use fork pool | React/Vue rendering consumes memory |
| Simple unit tests (<50 files) | ⚠️ Optional | Overhead may exceed benefit |

### Worker Count Guidelines

| Machine Cores | Conservative | Balanced | Aggressive |
|---------------|-------------|----------|------------|
| 4 cores | 2 workers | 2-3 workers | 4 workers |
| 8 cores | 4 workers | 4-6 workers | 8 workers |
| 12+ cores | 4 workers | 6-8 workers | 12 workers |

**Recommendation**: Start conservative (50% of cores), increase if stable.

---

## Common Pitfalls

### ❌ Pitfall 1: Over-Allocating Memory

```json
// BAD: Allocating 8GB doesn't prevent freeze if workers are unlimited
"test": "NODE_OPTIONS='--max-old-space-size=8192' vitest"
```

**Why it fails**: Worker processes spawn additional Node instances beyond the 8GB limit.

### ❌ Pitfall 2: Confusing AI Agent Pooling with Test Worker Pooling

```typescript
// IRRELEVANT: This is for AI model instances, not test runners
class ModelPool {
  loadModel() { /* 4GB LLM instance */ }
}
```

**Why it's wrong**: Standard test runners (Vitest/Jest) don't load AI models. Memory issues come from jsdom + test file count, not LLM inference.

### ❌ Pitfall 3: Using Threads Instead of Forks

```typescript
// WEAKER ISOLATION
pool: 'threads'  // Threads share memory space
```

**Better:**
```typescript
// STRONGER ISOLATION
pool: 'forks'    // Processes have independent memory
```

---

## Validation Checklist

- [ ] Test suite completes without system freeze
- [ ] Execution time <60s for 500+ tests (or <30s for 100-200 tests)
- [ ] Memory usage stable (no continuous growth)
- [ ] Activity Monitor shows limited process count (≈ maxForks value)
- [ ] No `NODE_OPTIONS` heap size in standard test script
- [ ] Worker limits configured (`maxForks` or `maxWorkers`)
- [ ] Process isolation enabled (`isolate: true`)
- [ ] E2E tests separated from unit tests

---

## Migration Path

### Phase 1: Immediate Safety (Day 1)

```typescript
// Add minimal worker limits
poolOptions: { forks: { maxForks: 4, isolate: true } }
```

### Phase 2: Remove Memory Hacks (Day 2)

```json
// Remove NODE_OPTIONS from package.json
"test": "vitest" // Was: NODE_OPTIONS='--max-old-space-size=8192' vitest
```

### Phase 3: Separate Test Types (Week 1)

```typescript
// Exclude E2E from unit test runner
exclude: ['**/*.spec.ts', 'e2e/**', 'tests/e2e/**']
```

### Phase 4: Optimize (Week 2)

```typescript
// Fine-tune based on metrics
maxForks: Math.floor(os.cpus().length * 0.6) // 60% of cores if stable
```

---

## References

- **Vitest Pool Options**: https://vitest.dev/config/#pooloptions
- **Jest maxWorkers**: https://jestjs.io/docs/configuration#maxworkers-number--string
- **Node.js Worker Threads**: https://nodejs.org/api/worker_threads.html
- **Process vs Thread Isolation**: https://nodejs.org/en/learn/asynchronous-work/child-process-vs-worker-threads

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-04 | Initial standard based on portfolio optimization case study |

---

**Standard Owner**: Nino Chavez
**Review Cycle**: Quarterly or after major test suite changes
**Feedback**: Document improvements in git commit messages with `docs(standards):` prefix
