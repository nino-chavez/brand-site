# Code Review Agent

## Purpose
Performs comprehensive code quality review when large changesets (>20 files) accumulate before commit.

## Activation Triggers

### Automatic (Pre-Commit)
- Triggered when `git diff --cached --name-only | wc -l > 20`
- Blocks commit until review passes or user overrides with `--no-verify`

### Manual
- `npm run code-review` - Run anytime
- `npm run code-review -- --verbose` - Detailed output
- `npm run code-review -- --json` - JSON output for CI/CD

## Review Criteria

### 1. Canonical Standards Compliance (BLOCKING)
Enforces objective best practices from `.claude/agents/intelligence/canonical-standards.md`

**Checks:**
- ❌ Manual DOM manipulation (`.style.transform`, `.style.opacity`)
- ❌ TypeScript `any` type usage
- ❌ Inline event handler creation without `useCallback`
- ❌ `useEffect` without dependency arrays
- ❌ Unthrottled scroll/resize/mousemove listeners
- ❌ Business logic in components
- ❌ Circular dependencies

**Action:** FAIL review if any found

### 2. Import Chain Verification (BLOCKING)
Ensures modified files are actually used in the application.

**Checks:**
- For each modified `.tsx`/`.ts` file:
  - Search: `grep -r "from.*{filename}" --include="*.tsx" --include="*.ts" .`
  - If zero results → File is orphaned (dead code)

**Action:** FAIL review if dead code detected

**Exception:** Skip entry points (App.tsx, main.tsx, index.tsx, vite.config.ts)

### 3. Type Safety (BLOCKING)
Verifies TypeScript compilation passes.

**Check:** `npx tsc --noEmit --skipLibCheck`

**Action:** FAIL review if compilation errors

### 4. Mixed Approaches (WARNING)
Detects inconsistent patterns within single commit.

**Checks:**
- Mixing Framer Motion with inline styles
- Mixing Promise-based with async/await in same file
- Mixing CSS classes with inline styles in same component

**Action:** WARN (not blocking)

### 5. Architecture Violations (BLOCKING)
Prevents regression in established architecture patterns.

**Checks:**
- Canvas architecture patterns (coordinate transforms)
- Accessibility patterns (ARIA labels, keyboard nav)
- Photography metaphor consistency
- SSR-compatible patterns

**Action:** FAIL if critical architecture violated

### 6. Performance Patterns (WARNING)
Flags potential performance issues.

**Checks:**
- Large files >500 lines
- Complex useEffect chains
- Missing memoization in expensive calculations
- N+1 query patterns

**Action:** WARN (not blocking)

### 7. Test Coverage (WARNING)
Encourages test coverage for new code.

**Check:** For new files, check if corresponding `.test.tsx` exists

**Action:** WARN if no tests (not blocking for now)

## Review Output Format

```
🔍 Code Review Report
======================================

📊 Overview:
- Files changed: 23
- Lines added: +487
- Lines removed: -156
- Review duration: 2.3s

✅ PASSED Checks:
- TypeScript compilation
- Import chain verification (23/23 files used)
- Architecture patterns preserved

❌ FAILED Checks (BLOCKING):
- [components/NewComponent.tsx:45] Manual DOM manipulation
  → element.style.transform = `translateX(${x}px)`
  → Fix: Use Framer Motion <motion.div animate={{ x }} />

- [utils/helpers.ts:12] TypeScript 'any' type
  → function process(data: any) { }
  → Fix: Use proper type or 'unknown' with type guard

⚠️  WARNINGS (Non-Blocking):
- [components/LargeComponent.tsx] File size 612 lines (consider splitting)
- [services/api.ts] Missing tests

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Result: ❌ REVIEW FAILED (2 blocking issues)

Fix the blocking issues above, then retry:
  git add .
  npm run code-review
  git commit -m "your message"

Or override (not recommended):
  git commit --no-verify
```

## Integration Points

### Pre-Commit Hook
```bash
# In .git/hooks/pre-commit
FILE_COUNT=$(git diff --cached --name-only | wc -l)
THRESHOLD=20

if [ "$FILE_COUNT" -gt "$THRESHOLD" ]; then
  echo "🚨 COMMIT THRESHOLD EXCEEDED"
  echo "Running mandatory code review..."
  echo ""

  if npm run code-review --silent; then
    echo "✅ Code review passed"
    echo "Proceeding with commit..."
  else
    echo "❌ Code review failed"
    exit 1
  fi
fi
```

### CI/CD Integration
```yaml
# In .github/workflows/pr-validation.yml
- name: Code Review
  run: |
    npm run code-review -- --json > review-report.json
    if [ $? -ne 0 ]; then
      echo "Code review failed"
      exit 1
    fi
```

### Package.json Scripts
```json
{
  "scripts": {
    "code-review": "node scripts/code-review.mjs",
    "code-review:verbose": "node scripts/code-review.mjs --verbose",
    "code-review:json": "node scripts/code-review.mjs --json"
  }
}
```

## Agent Prompt Template

```
You are a code review agent enforcing objective quality standards.

Context:
- Repository: {repo_name}
- Branch: {branch_name}
- Changed files: {file_count}
- Lines changed: +{added} -{removed}

Task:
Review all staged changes (`git diff --cached`) against:

1. Canonical Standards (.claude/agents/intelligence/canonical-standards.md)
   - BLOCK if violations found
   - Reference specific standards violated

2. Import Chain Verification
   - For each modified .tsx/.ts file
   - Verify imported somewhere
   - BLOCK if orphaned (dead code)

3. TypeScript Compilation
   - Run: npx tsc --noEmit --skipLibCheck
   - BLOCK if errors

4. Architecture Preservation
   - Check against established patterns
   - Reference .claude/agents/intelligence/*.md
   - BLOCK if critical patterns violated

5. Performance & Best Practices
   - Flag potential issues
   - WARN but don't block

Output Format:
- Structured report (see above)
- Clear PASS/FAIL/WARN for each check
- Actionable fix instructions
- Exit code 0 (pass) or 1 (fail)

Rules:
- Be objective, not subjective
- Reference specific canonical standards
- Provide fix instructions with code examples
- Don't block for stylistic preferences
- Focus on correctness, maintainability, performance
```

## Configuration

### Customization
Modify thresholds in `scripts/code-review.mjs`:

```javascript
const CONFIG = {
  fileThreshold: 20,        // Trigger review if >20 files
  maxFileSize: 500,         // Warn if file >500 lines
  blockOnWarnings: false,   // Change to true for stricter enforcement
  requireTests: false,      // Change to true to require tests
  excludePaths: [
    'node_modules',
    'dist',
    'build',
    '.git'
  ]
};
```

### Severity Levels
- **BLOCKING**: Must fix before commit (exit code 1)
- **WARNING**: Should fix but not blocking (exit code 0)
- **INFO**: Informational only

### Override Mechanism
```bash
# Skip code review entirely
git commit --no-verify

# Override specific check (future feature)
CODE_REVIEW_SKIP=manual-dom npm run code-review
```

## Maintenance

### Adding New Checks
1. Define check in this document under "Review Criteria"
2. Implement detection in `scripts/code-review.mjs`
3. Add to canonical standards if applicable
4. Update pre-commit hook if blocking
5. Document in developer guide

### Adjusting Thresholds
- File count threshold: Modify `THRESHOLD` in `.git/hooks/pre-commit`
- File size warnings: Modify `maxFileSize` in review script
- Severity levels: Modify `blockOnWarnings` config

### Testing Code Review
```bash
# Create test commit with intentional violations
echo "const x: any = 5;" > test-violation.ts
git add test-violation.ts

# Run code review
npm run code-review

# Should fail with 'any' type violation
# Clean up
git reset HEAD test-violation.ts
rm test-violation.ts
```

## Related Documentation
- [Canonical Standards](.claude/agents/intelligence/canonical-standards.md)
- [Pre-Modification Protocol](.claude/agents/intelligence/pre-modification-protocol.md)
- [Commit Quality Gate](.claude/agents/commit-quality-gate.md)
- [Developer Guide](.claude/workflows/developer-guide.md)
