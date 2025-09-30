# Automated Commit Validation Workflow

## Overview

This workflow integrates quality gate validation into the commit process. Claude must follow this protocol before creating any commits.

## Protocol

### 1. Before Every Commit

```bash
npm run validate
```

This script analyzes staged changes and determines which agents should validate.

### 2. Interpret Results

**Exit Code 0:** No validation required
- Safe to proceed with commit
- No quality gates triggered

**Exit Code 42:** Validation required
- Script outputs list of agents to invoke
- Must complete validation before committing

**Exit Code 1:** Error
- Check script output for issues
- Fix before proceeding

### 3. Agent Invocation

When validation is required, the script outputs which agents to invoke:

```
⚡ Quality gates activated (2):
   - accessibility-validator
   - photography-metaphor-validator
```

**Claude must then:**

1. Invoke each agent using Task tool:
```typescript
Task(
  subagent_type="general-purpose",
  prompt="You are the accessibility-validator agent. Review changes in [files] for WCAG 2.2 AA compliance..."
)
```

2. Read agent response for PASS/FAIL
3. If FAIL: Fix issues, re-stage, re-validate
4. If PASS: Continue to next agent

### 4. Commit Only After All Gates Pass

Once all agents return PASS:
- Proceed with git commit
- Include validation status in commit message
- Follow 30-minute work preservation rule

## Example Complete Flow

```bash
# 1. Stage changes
git add src/components/gallery/CategoryFilterBar.tsx

# 2. Run validation
npm run validate

# Output shows:
# ⚡ Quality gates activated (2):
#    - accessibility-validator
#    - photography-metaphor-validator

# 3. Invoke agents (Claude does this)
Task("accessibility-validator", "Review CategoryFilterBar.tsx...")
# Result: PASS ✅

Task("photography-metaphor-validator", "Review CategoryFilterBar.tsx...")
# Result: FAIL ❌ (issues found)

# 4. Fix issues
# Edit file to fix photography metaphor issues

# 5. Re-validate
npm run validate
# Invoke agents again
# Result: Both PASS ✅

# 6. Commit with validation status
git commit -m "feat: add keyboard shortcuts

Validated by:
- accessibility-validator: PASS ✅
- photography-metaphor-validator: PASS ✅ (after corrections)
"
```

## Agent Activation Rules

### canvas-architecture-guardian
**Paths:**
- `src/components/canvas/**`
- `src/hooks/*canvas*`
- `src/hooks/*3d*`
- `src/utils/*webgl*`

**Keywords:** WebGL, canvas, THREE, requestAnimationFrame, getContext

### accessibility-validator
**Paths:**
- `src/components/**/*.tsx`
- `src/App.tsx`

**Keywords:** aria-, role=, tabIndex, keyboard, focus, screen reader

### performance-budget-enforcer
**Paths:**
- `src/**/*.tsx`
- `src/**/*.ts`
- `package.json`

**Keywords:** import, lazy, Suspense, useMemo, useCallback, Bundle

### photography-metaphor-validator
**Paths:**
- `src/components/gallery/**`
- `src/types/gallery.ts`
- `src/data/gallery-images.ts`

**Keywords:** camera, lens, aperture, shutter, ISO, shot, exposure, focus

### test-coverage-guardian
**Paths:**
- `src/**/*.tsx`
- `src/**/*.ts`

**Keywords:** export function, export const, export class

## Work Preservation Integration

This validation protocol integrates with the 30-minute commit rule:

1. **After 30 minutes of work**: Run validation
2. **If validation fails**: Create WIP commit with TODO list
3. **Continue work on fixes**: Track with TodoWrite
4. **After fixes pass**: Amend commit or create new one

## Bypass (Emergency Only)

In rare cases where validation must be bypassed:

```bash
npm run validate:force  # Always exits 0
git commit -m "emergency: [reason for bypass]

VALIDATION BYPASSED: [explanation]
TODO: Retroactive validation required
"
```

**Use sparingly.** Every bypassed validation creates technical debt.

## Benefits

1. **Consistency**: Every commit follows same quality standards
2. **Automation**: No manual checklist needed
3. **Traceability**: Commit messages show what was validated
4. **Prevention**: Issues caught before merge, not after
5. **Efficiency**: Only relevant agents run for each change