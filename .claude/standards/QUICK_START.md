# Quick Start: Using Standards in Other Projects

**Copy-paste these prompts into Claude in any project to diagnose and fix similar issues.**

---

## Test Configuration Issues (Memory/Freezing)

### 🚀 Quick Fix (3-5 minutes)

```
Analyze and fix my test configuration for memory issues:

1. Read package.json + test config files (vitest/jest/vite config)
2. Identify memory anti-patterns:
   - Excessive NODE_OPTIONS heap size (>4GB)
   - Unlimited worker parallelism
   - Missing test isolation
3. Apply fixes:
   - Remove global --max-old-space-size
   - Add worker pool limits (maxForks: 4 or maxWorkers: '50%')
   - Enable process isolation
   - Separate E2E from unit tests
4. Validate: Run full test suite, verify no freeze/crash
5. Report: Before/after metrics (duration, memory, stability)

Focus on preventing memory exhaustion from unbounded parallelism.
```

### 🔍 Comprehensive Analysis (10-15 minutes)

See: [`.claude/standards/testing/claude-diagnostic-prompts.md`](testing/claude-diagnostic-prompts.md#option-1-comprehensive-diagnostic-prompt)

---

## Expected Configuration Output

After running the prompt, Claude should produce:

### For Vitest Projects

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 4,
        isolate: true
      }
    },
    sequence: { concurrent: false },
    exclude: ['**/*.spec.ts', 'e2e/**']
  }
})
```

### For package.json

```json
{
  "scripts": {
    "test": "vitest",  // Remove NODE_OPTIONS='--max-old-space-size=8192'
    "test:unit": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## Success Criteria

✅ Tests complete without system freeze
✅ Execution time <60s for 500+ tests (or <30s for 100-200)
✅ Memory stable (no continuous growth)
✅ Limited process count in Activity Monitor (≈ maxForks value)

---

## Full Documentation

- **Standard**: [test-configuration-optimization.md](testing/test-configuration-optimization.md)
- **Prompts**: [claude-diagnostic-prompts.md](testing/claude-diagnostic-prompts.md)
- **All Standards**: [README.md](README.md)

---

## Pro Tips

1. **Start with Quick Fix** - Gets you 80% there in 5 minutes
2. **Use Comprehensive** - When you need to understand root cause
3. **Save metrics** - Document before/after for future reference
4. **Share standards** - Reference in other projects' documentation

---

**Source**: Extracted from Nino Chavez Portfolio optimization (2025-10-04)
**Validation**: 146 test files, 530 tests, 23.39s execution, no freezes ✅
