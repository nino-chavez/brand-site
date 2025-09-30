# Pre-Commit Hooks

**Purpose:** Automated validation to prevent documentation drift
**Status:** Active
**Last Updated:** 2025-09-30

---

## Overview

Pre-commit hooks run automatically before each commit to validate documentation structure and links. This prevents broken references and maintains documentation organization.

## Installed Hooks

### Documentation Validation Hook

**Location:** `.git/hooks/pre-commit`

**Runs:**
1. Structure validation (`.agent-os/scripts/validate-docs-structure.sh`)
2. Link validation (`.agent-os/scripts/check-doc-links.sh`)

**Behavior:**
- ✅ If all checks pass: Commit proceeds
- ❌ If any check fails: Commit blocked with error message

---

## Setup Instructions

### For New Team Members

The pre-commit hook is already installed in `.git/hooks/pre-commit`. It activates automatically on your first commit.

**Verification:**
```bash
# Check if hook exists
ls -la .git/hooks/pre-commit

# Test hook manually
.git/hooks/pre-commit
```

### Manual Installation (if needed)

```bash
# Ensure scripts are executable
chmod +x .agent-os/scripts/validate-docs-structure.sh
chmod +x .agent-os/scripts/check-doc-links.sh

# Ensure hook is executable
chmod +x .git/hooks/pre-commit
```

---

## What Gets Validated

### Structure Validation
- Checks showcase/developer/component/archive separation
- Ensures no orphaned files
- Verifies archive policy compliance
- Validates required subdirectories exist

### Link Validation
- Checks all markdown links resolve
- Validates relative paths
- Ensures no broken cross-references
- Filters out code examples and regex patterns

---

## Handling Validation Failures

### If Structure Validation Fails

**Example Error:**
```
ERROR: showcase/ contains developer notes
ERROR: Active docs reference archived content
```

**Fix:**
1. Review the error message
2. Move misplaced files to correct directories
3. Update any references to archived content
4. Run validation manually: `.agent-os/scripts/validate-docs-structure.sh`
5. Retry commit

### If Link Validation Fails

**Example Error:**
```
ERROR: Broken link in docs/showcase/technical-architecture.md:
  ../components/old-component.md → File not found
```

**Fix:**
1. Open the file mentioned in error
2. Update the broken link to correct path
3. Run validation manually: `.agent-os/scripts/check-doc-links.sh`
4. Retry commit

---

## Bypassing Hooks (Emergency Only)

**⚠️ WARNING:** Only bypass hooks in emergencies

```bash
# Skip all pre-commit hooks
git commit --no-verify -m "emergency fix"
```

**When to bypass:**
- Critical production hotfix
- Fixing broken hook itself
- Emergency documentation fix

**After bypassing:**
1. Create follow-up task to fix validation issues
2. Run validations manually immediately
3. Fix issues in next commit

---

## Hook Maintenance

### Updating Validation Scripts

When `.agent-os/scripts/` scripts are updated:
1. Test scripts manually first
2. Commit script updates
3. Hook automatically uses new version

### Disabling Hooks Temporarily

```bash
# Rename hook to disable
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# Re-enable when needed
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

---

## Troubleshooting

### Hook Not Running

**Symptoms:** Commits succeed even with broken docs

**Fixes:**
```bash
# Check if hook exists
ls -la .git/hooks/pre-commit

# Check if executable
chmod +x .git/hooks/pre-commit

# Test manually
.git/hooks/pre-commit
```

### False Positives

**Symptoms:** Valid documentation blocked by hook

**Investigation:**
```bash
# Run validations individually
.agent-os/scripts/validate-docs-structure.sh
.agent-os/scripts/check-doc-links.sh

# Check specific file
grep -n "pattern" docs/path/to/file.md
```

**If bug in validation script:**
1. Document the false positive
2. Update validation script to handle edge case
3. Test fix thoroughly
4. Commit script update

### Performance Issues

**Symptoms:** Hook takes too long (>5 seconds)

**Optimization:**
- Validation scripts use early exits
- Only scans docs/ directory
- Link checking is incremental

**If still slow:**
1. Profile scripts with `time` command
2. Identify bottleneck
3. Optimize slow operations

---

## CI/CD Integration

Pre-commit hooks are the first line of defense. CI/CD provides additional validation:

- **Pre-commit:** Fast local validation
- **CI/CD:** Comprehensive validation + automated generation

See `.agent-os/workflow/quality-gates.yml` for CI/CD configuration.

---

## Best Practices

### Do:
- ✅ Run validations before committing documentation changes
- ✅ Fix validation errors immediately
- ✅ Test links manually if unsure
- ✅ Keep validation scripts updated

### Don't:
- ❌ Bypass hooks routinely
- ❌ Commit without running validations
- ❌ Ignore validation warnings
- ❌ Disable hooks permanently

---

## Related Documentation

- [Documentation Maintenance Workflow](../../.agent-os/workflow/documentation-maintenance.md)
- [Documentation Standards](./documentation-standards.md)
- [Quality Gates](../../.agent-os/workflow/quality-gates.yml)