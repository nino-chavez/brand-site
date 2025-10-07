# Commit Quality Gate Agent

## Purpose
Prevents commits that introduce technical debt, dead code, or unverified changes.

## Trigger Conditions
- BEFORE every `git commit` (via pre-commit hook)
- When user requests manual quality check
- Before PR creation

## Mandatory Checks

### Check 1: Modified Components Are Imported
**Status:** BLOCKING

Verifies that any modified .tsx/.ts component files are actually imported somewhere in the codebase.

**Prevents:**
- Committing orphaned/dead code
- Modifying components that aren't used
- Wasting git history on unused files

**Implementation:**
```bash
for file in $(git diff --cached --name-only --diff-filter=AM); do
  if [[ $file == src/**/*.tsx ]] || [[ $file == components/**/*.tsx ]]; then
    filename=$(basename "$file" .tsx)

    # Skip entry points
    case "$filename" in
      App|main|index|SimpleRouter) continue ;;
    esac

    # Check imports
    imports=$(grep -r "from.*$filename" --include="*.tsx" --include="*.ts" . | wc -l)

    if [ "$imports" -eq "0" ]; then
      echo "❌ BLOCKING: $file is not imported (dead code)"
      exit 1
    fi
  fi
done
```

**Override:** `git commit --no-verify` (not recommended)

### Check 2: No Debug Artifacts
**Status:** BLOCKING

Prevents committing temporary debug files that clutter the repository.

**Blocks:**
- Files matching `debug*.{mjs,js,ts}`
- Files matching `tmp*.{mjs,js,ts}`
- Files with `.tmp` extension

**Example:**
```
❌ BLOCKED: debug-panel-position.mjs
❌ BLOCKED: tmp-test-script.ts
```

### Check 3: UI Changes Require Verification Evidence
**Status:** WARNING (non-blocking)

For commits mentioning UI/visual changes, encourages runtime verification evidence in commit message.

**Detects UI changes by keywords:**
- panel, modal, UI, UX
- position, layout, component
- visual, render

**Looks for verification evidence:**
- Playwright, screenshot, DOM
- inspect, runtime, verified, tested

**Example:**
```diff
❌ BAD:
"fix: panel positioning"

✅ GOOD:
"fix: panel positioning
Verified with Playwright - panel now appears adjacent to clicked card"
```

### Check 4: TypeScript Compilation
**Status:** BLOCKING

Runs `tsc --noEmit` to ensure no TypeScript errors.

**Prevents:**
- Type errors reaching production
- Breaking builds
- Runtime type failures

### Check 5: Mixed Approaches Detection
**Status:** WARNING (non-blocking)

Detects when code mixes incompatible patterns.

**Examples:**
- Inline `style.transform` + Framer Motion `<motion.>`
- Manual `useState` positioning + animation libraries
- CSS classes + inline styles for same properties

**Warning:**
```
⚠️  WARNING: Mixing inline styles with Framer Motion
   Consider using one approach consistently
```

## Integration

### Git Hook (Automatic)
Located at `.git/hooks/pre-commit`

Runs automatically before every commit. To bypass:
```bash
git commit --no-verify  # NOT recommended
```

### Manual Invocation
```bash
# Test the quality gate without committing
.git/hooks/pre-commit
```

### In CI/CD
```yaml
# .github/workflows/quality-gate.yml
- name: Quality Gate
  run: |
    git diff origin/main...HEAD --name-only | \
    while read file; do
      # Run checks on changed files
    done
```

## Failure Examples

### Example 1: Dead Code
```bash
$ git commit -m "fix: update panel"

🔍 Running Pre-Commit Quality Gates...
======================================

📦 Check 1: Verifying modified components are imported...
❌ BLOCKING: src/components/work/ProjectDetailPanel.tsx is not imported anywhere
   This appears to be dead code.

   Options:
   1. Remove the file (it's dead code)
   2. Import it somewhere (if it's new)
   3. Skip this check: git commit --no-verify

❌ Quality gates failed - commit blocked
```

### Example 2: Debug Artifacts
```bash
$ git commit -m "debug positioning"

🧹 Check 2: Checking for debug artifacts...
❌ BLOCKING: Debug artifacts detected
   Remove debug files before committing:
debug-panel-position.mjs

❌ Quality gates failed - commit blocked
```

### Example 3: TypeScript Errors
```bash
$ git commit -m "add feature"

🔷 Check 4: Running TypeScript compiler...
src/components/NewFeature.tsx:15:20 - error TS2339: Property 'onClick' does not exist on type...

❌ BLOCKING: TypeScript compilation errors

❌ Quality gates failed - commit blocked
```

## Success Example

```bash
$ git commit -m "fix: panel positioning - verified with Playwright"

🔍 Running Pre-Commit Quality Gates...
======================================

📦 Check 1: Verifying modified components are imported...
✅ All modified components are imported

🧹 Check 2: Checking for debug artifacts...
✅ No debug artifacts

🎨 Check 3: Checking UI changes for runtime verification...
   UI change detected in commit message
✅ Runtime verification mentioned

🔷 Check 4: Running TypeScript compiler...
✅ TypeScript compiles without errors

🔀 Check 5: Checking for mixed approaches...
✅ No critical mixed approaches detected

======================================
✅ All quality gates passed
```

## Maintenance

### Adding New Checks
Edit `.git/hooks/pre-commit`:

```bash
# Check 6: Your new check
echo "🔍 Check 6: Description..."

if [your_condition]; then
  echo -e "${RED}❌ BLOCKING: Your error message${NC}"
  EXIT_CODE=1
fi
```

### Disabling Checks Temporarily
Comment out sections in the hook, or use:
```bash
git commit --no-verify  # Skips all checks
```

### Project-Specific Overrides
Add to `.git/hooks/pre-commit.local` (if supported):
```bash
# Project-specific checks here
```

## Related Documentation
- [Pre-Modification Protocol](.claude/agents/intelligence/pre-modification-protocol.md)
- [Runtime Debugging Guide](.claude/agents/intelligence/runtime-debugging.md)
- [Quality Standards](.claude/CLAUDE.md#quality-control-framework)
