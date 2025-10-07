# Developer Guide - Quality Control & Commit Strategy

## Overview

This project enforces automated quality gates to maintain code quality and prevent common development issues. The system balances two critical objectives:

1. **Frequent commits** - Commit every 20-30 minutes to preserve work
2. **Quality enforcement** - Block bad code from entering the repository

## Commit Cadence Strategy

### The 20-File Threshold

**Rule:** No more than 20 files can accumulate before committing.

**Why:**
- Large commits are hard to review
- Increases risk of bugs
- Makes git history unclear
- Harder to revert if needed
- Higher chance of work loss if something goes wrong

**What Happens:**
When you attempt to commit >20 files, the pre-commit hook will:

1. **Block the commit** - Prevents large changesets
2. **Run comprehensive code review** - Automatically executes `npm run code-review`
3. **Show detailed report** - Lists all quality issues found
4. **Require fixes** - Must fix blocking issues before proceeding

### Recommended Commit Frequency

✅ **DO:**
- Commit every 20-30 minutes
- Keep commits focused and atomic
- Ensure each commit passes all tests
- Write descriptive commit messages
- Commit after completing discrete tasks

❌ **DON'T:**
- Accumulate hours of changes before committing
- Mix unrelated changes in single commit
- Commit broken code "to save progress"
- Use vague commit messages like "fix bugs" or "updates"

### Commit Message Standards

**Format:**
```
<type>: <description> - <verification method>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

**Examples:**
```bash
# Good
git commit -m "fix: panel positioning - align with clicked card (Playwright verified)"
git commit -m "feat: add keyboard navigation to gallery (tested with screen reader)"
git commit -m "refactor: extract business logic from UserProfile component"

# Bad
git commit -m "fix bugs"
git commit -m "update code"
git commit -m "changes"
```

## Quality Gates

The pre-commit hook enforces 7 quality checks:

### Check 0: File Change Threshold (BLOCKING)
- **Purpose:** Enforce commit cadence
- **Threshold:** 20 files
- **Action:** Triggers comprehensive code review
- **Override:** `git commit --no-verify` (not recommended)

### Check 1: Import Chain Verification (BLOCKING)
- **Purpose:** Prevent committing dead code
- **Check:** Modified .tsx/.ts files must be imported somewhere
- **Why:** Catches orphaned components wasting space
- **Exception:** Entry points (App.tsx, main.tsx, index.tsx)

### Check 2: Debug Artifacts (BLOCKING)
- **Purpose:** Keep repository clean
- **Detects:** Files matching `debug*.{mjs,js,ts}`, `tmp*.*`
- **Fix:** Remove debug files before committing

### Check 3: UI Verification Evidence (WARNING)
- **Purpose:** Ensure runtime testing for UI changes
- **Trigger:** Commit message contains "panel", "modal", "ui", "ux"
- **Expected:** Message mentions "playwright", "dom", "inspect", "verified"
- **Why:** Prevents modifying wrong components (see Pre-Modification Protocol)

### Check 4: TypeScript Compilation (BLOCKING)
- **Purpose:** Prevent type errors
- **Check:** `npx tsc --noEmit --skipLibCheck`
- **Action:** Must fix TypeScript errors before commit

### Check 5: Mixed Approaches (WARNING)
- **Purpose:** Detect inconsistent patterns
- **Examples:**
  - Mixing Framer Motion with inline styles
  - Mixing `.style.transform` with `<motion.div>`
- **Fix:** Use one approach consistently

### Check 6: Canonical Standards (BLOCKING)
- **Purpose:** Enforce objective best practices
- **Violations:**
  - Manual DOM manipulation (`.style.transform`, `.style.opacity`)
  - TypeScript `any` type
  - Unthrottled event listeners (scroll, resize, mousemove)
- **Fix:** Follow canonical standards (see `.claude/agents/intelligence/canonical-standards.md`)

## Code Review System

### When It Runs

**Automatically:**
- When attempting to commit >20 files
- Runs before other quality checks

**Manually:**
```bash
# Standard review
npm run code-review

# Detailed output
npm run code-review:verbose

# JSON output (for CI/CD)
npm run code-review:json
```

### What It Checks

1. **Canonical Standards Compliance** (BLOCKING)
   - Manual DOM manipulation
   - TypeScript `any` type
   - Inline event handlers without `useCallback`
   - `useEffect` without dependencies
   - Unthrottled event listeners

2. **Import Chain Verification** (BLOCKING)
   - All modified files must be imported
   - Detects dead code

3. **Type Safety** (BLOCKING)
   - TypeScript compilation must pass

4. **Mixed Approaches** (WARNING)
   - Detects inconsistent patterns
   - Not blocking but should be addressed

5. **Performance Patterns** (WARNING)
   - Large files (>500 lines)
   - Missing memoization
   - Potential N+1 queries

6. **Test Coverage** (WARNING)
   - Encourages tests for new code

### Understanding Review Output

```
🔍 Code Review Report
======================================

📊 Overview:
- Files changed: 23
- Review duration: 2.3s

✅ PASSED Checks:
- TypeScript compilation
- Import chain verification (23/23 files used)

❌ FAILED Checks (BLOCKING):
- [components/NewComponent.tsx:45] Manual DOM manipulation
  → Fix: Use Framer Motion <motion.div animate={{ x }} />

⚠️  WARNINGS (Non-Blocking):
- [components/LargeComponent.tsx] File size 612 lines

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Result: ❌ REVIEW FAILED (2 blocking issues)
```

## Common Workflows

### Normal Development Flow

```bash
# 1. Make changes
# ... edit files ...

# 2. Test your changes
npm run test

# 3. Stage changes
git add .

# 4. Commit (quality gates run automatically)
git commit -m "feat: add new feature"

# 5. If <20 files, commit proceeds
# 6. If >20 files, code review runs automatically
```

### Large Changeset Flow

```bash
# You've accumulated 25 files of changes

# 1. Attempt commit
git commit -m "refactor: major component restructure"

# 2. Pre-commit hook detects >20 files
🚨 COMMIT THRESHOLD EXCEEDED
Running mandatory code review...

# 3. Code review runs automatically
# 4a. If passes: Commit proceeds
✅ Code review passed
Proceeding with commit...

# 4b. If fails: Fix issues and retry
❌ Code review failed
Fix the blocking issues above, then retry

# 5. Fix issues
# ... address problems ...

# 6. Retry commit
git commit -m "refactor: major component restructure (code review passed)"
```

### Manual Code Review

```bash
# Run review anytime without committing
npm run code-review

# Detailed output with suggestions
npm run code-review:verbose

# Check specific changes
git add src/components/NewComponent.tsx
npm run code-review
```

### Override Quality Gates

**Only when absolutely necessary:**

```bash
# Skip all pre-commit checks
git commit --no-verify -m "emergency hotfix"

# Why this is dangerous:
# - Bypasses all quality gates
# - Can introduce bugs
# - Creates technical debt
# - Use only for emergencies
```

## Best Practices

### 1. Commit Often
```bash
# Good - Commit after discrete tasks
git commit -m "feat: add user authentication"
# ... 20 minutes later ...
git commit -m "test: add auth integration tests"
# ... 20 minutes later ...
git commit -m "docs: update auth documentation"

# Bad - Accumulate all changes
# ... 2 hours of work ...
git commit -m "add authentication, tests, docs"
```

### 2. Follow Canonical Standards

Always reference `.claude/agents/intelligence/canonical-standards.md` when:
- Adding new code
- Refactoring existing code
- Reviewing existing patterns

**Key Rule:** Canonical standards OVERRIDE existing code patterns.

If you find bad patterns in the codebase:
- Don't replicate them
- Use the canonical standard instead
- Consider refactoring the old code

### 3. Verify UI Changes

For any UI-related changes:
1. **Launch runtime inspector first** (Playwright/browser)
2. **Inspect actual DOM** - Get exact classes, testids
3. **Grep exact strings** - Don't use semantic search
4. **Verify import chain** - Ensure file is actually used
5. **Confirm with team** - Show what you're about to change
6. **THEN modify code**

See `.claude/agents/intelligence/pre-modification-protocol.md` for details.

### 4. Write Descriptive Commit Messages

Include verification method for UI changes:
```bash
# Good
git commit -m "fix: panel positioning - verified with Playwright inspector"

# Bad
git commit -m "fix panel"
```

### 5. Test Before Committing

```bash
# Always run tests
npm run test

# For UI changes, test manually
npm run dev
# Open browser, verify changes

# For E2E changes
npm run test:e2e
```

## Troubleshooting

### "Commit threshold exceeded" Error

**Problem:** Trying to commit >20 files

**Solution:**
```bash
# Option 1: Split into smaller commits (RECOMMENDED)
git reset
git add src/components/*.tsx
git commit -m "feat: add new components"
git add src/tests/*.test.tsx
git commit -m "test: add component tests"

# Option 2: Fix review issues and retry
# Code review ran automatically
# Fix the blocking issues listed
npm run code-review  # Verify fixes
git commit -m "your message"

# Option 3: Override (NOT RECOMMENDED)
git commit --no-verify
```

### "File is not imported" Error

**Problem:** Modified file is dead code

**Solution:**
```bash
# Option 1: Import it somewhere
# Add import in appropriate component

# Option 2: Remove it (if truly dead code)
git reset HEAD path/to/file.tsx
rm path/to/file.tsx
```

### "Manual DOM manipulation detected" Error

**Problem:** Using `.style.transform` or similar

**Solution:**
```tsx
// ❌ WRONG
element.style.transform = `translateX(${x}px)`;

// ✅ CORRECT
<motion.div animate={{ x }} />
```

### "TypeScript compilation errors" Error

**Problem:** Type errors in code

**Solution:**
```bash
# Run TypeScript to see specific errors
npx tsc --noEmit

# Fix each error
# Retry commit
```

### Code Review Takes Too Long

**Problem:** Review running slowly on large changeset

**Solution:**
```bash
# Split into smaller commits (prevents this issue)
# Or wait for review to complete (usually <5s)
# Or override (NOT RECOMMENDED)
git commit --no-verify
```

## Configuration

### Adjusting Thresholds

Edit `.git/hooks/pre-commit`:
```bash
# Change file count threshold
FILE_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')
THRESHOLD=20  # Adjust this number
```

Edit `scripts/code-review.mjs`:
```javascript
const CONFIG = {
  fileThreshold: 20,        // Files before review
  maxFileSize: 500,         // Warning threshold
  blockOnWarnings: false,   // Make warnings blocking
  requireTests: false,      // Require tests for new files
};
```

### Disabling Specific Checks

**Temporary:**
```bash
# Skip entire pre-commit hook
git commit --no-verify

# This bypasses ALL checks - use carefully
```

**Permanent (NOT RECOMMENDED):**
```bash
# Remove pre-commit hook
rm .git/hooks/pre-commit

# This removes all quality gates
# Only do this if you have very good reason
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
# .github/workflows/quality-check.yml
name: Quality Check

on: [pull_request]

jobs:
  code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run code-review:json
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: code-review-report
          path: review-report.json
```

## Related Documentation

- [Pre-Modification Protocol](.claude/agents/intelligence/pre-modification-protocol.md) - How to debug UI issues correctly
- [Canonical Standards](.claude/agents/intelligence/canonical-standards.md) - Objective best practices
- [Code Review Agent](.claude/agents/code-review.md) - Code review system details
- [Commit Quality Gate](.claude/agents/commit-quality-gate.md) - Pre-commit hook details
- [Project Standards](.claude/CLAUDE.md) - Overall project guidelines

## Getting Help

### Run Manual Validation
```bash
# Validate changes before committing
npm run code-review

# Check what will be committed
git diff --cached --name-only

# Count staged files
git diff --cached --name-only | wc -l
```

### Common Commands
```bash
# See what's staged
git status

# Unstage files
git reset HEAD <file>

# Stage specific files
git add <file>

# See git hook output
cat .git/hooks/pre-commit

# Test hook without committing
bash .git/hooks/pre-commit
```

## Summary

**Key Takeaways:**

1. ✅ **Commit every 20-30 minutes** - Preserve work, keep commits atomic
2. ✅ **Maximum 20 files per commit** - Prevents large, hard-to-review changes
3. ✅ **Quality gates are mandatory** - Can't commit broken code
4. ✅ **Follow canonical standards** - Override bad existing patterns
5. ✅ **Verify UI changes with runtime inspection** - Don't guess which file to modify
6. ✅ **Write descriptive commit messages** - Include verification method
7. ✅ **Test before committing** - Run tests, verify manually

**The System Works Because:**
- Frequent commits reduce work loss risk
- Quality gates prevent technical debt
- Canonical standards prevent quality dilution
- Pre-modification protocol prevents wasted work on wrong files
- Code review catches issues before they enter repository
