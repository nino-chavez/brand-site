# Pre-Modification Protocol (MANDATORY for UI Bugs)

## Purpose
Prevents modifying wrong components by requiring runtime verification BEFORE code changes.

## When This Protocol Applies

**MANDATORY for:**
- User reports UI bug with screenshot
- User says "X is broken" about visual component
- User describes unexpected UI behavior
- Any issue involving: panel, modal, layout, positioning, rendering

**Optional for:**
- Pure logic bugs
- Test failures
- Documentation updates
- Build/config issues

---

## Protocol Steps (BLOCKING)

### Step 1: Launch Runtime Inspector (30 seconds)
**BEFORE** searching code, inspect the actual DOM.

```bash
# Method A: Quick Playwright inspection
node << 'EOF'
const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:3002');

  console.log("\n📍 INSPECTION CHECKLIST:");
  console.log("1. Navigate to broken UI element");
  console.log("2. Right-click → Inspect Element");
  console.log("3. Copy:");
  console.log("   - Exact class names");
  console.log("   - data-testid attribute");
  console.log("   - Parent element classes");
  console.log("4. Take screenshot (if not provided)");

  await page.waitForTimeout(60000); // 1 min for inspection
  await browser.close();
})();
EOF

# Method B: Dev server + manual inspection
# Open http://localhost:3002
# Right-click element → Inspect
# Record exact DOM attributes
```

**What to Record:**
```
Element: <div>
Classes: "fixed top-0 right-0 bg-black/95 backdrop-blur-xl"
TestID: data-testid="project-tech-side-panel"
Parent: <section id="frame">
Hierarchy: section#frame > div.container > div.panel
```

### Step 2: Grep EXACT Strings (10 seconds)
Use **actual values from DOM**, not guesses.

```bash
# Use EXACT strings from Step 1
grep -r 'data-testid="project-tech-side-panel"' . --include="*.tsx"
grep -r 'bg-black/95' . --include="*.tsx"

# If multiple results, check parent hierarchy
grep -r 'section.*id="frame"' . --include="*.tsx"
```

**❌ WRONG (semantic search):**
```bash
# Don't do this - too vague
grep -r "ProjectPanel" .
grep -r "DetailPanel" .
```

**✅ CORRECT (exact DOM strings):**
```bash
# Use exact classes/IDs from DOM
grep -r "bg-black/95 backdrop-blur-xl" .
grep -r 'data-testid="exact-value-from-dom"' .
```

### Step 3: Verify Import Chain (10 seconds)
Confirm the file is actually imported and used.

```bash
# Found: components/sections/FrameSection.tsx
filename="FrameSection"

# Check if imported anywhere
imports=$(grep -r "from.*$filename" --include="*.tsx" --include="*.ts" . | wc -l)

if [ "$imports" -eq "0" ]; then
  echo "❌ STOP: This file is not imported (dead code)"
  echo "Search again or ask user"
  exit 1
fi

# Trace import chain back to App/Router
grep -r "from.*FrameSection" .
# → SimplifiedGameFlowContainer imports it
grep -r "from.*SimplifiedGameFlowContainer" .
# → App.tsx imports it
# ✅ Confirmed: This renders in production
```

### Step 4: Confirm with User (REQUIRED)
Don't proceed without confirmation.

```
Found the component that renders this UI:

File: components/sections/FrameSection.tsx
Lines: 372-500 (panel implementation)

This component is imported by:
- SimplifiedGameFlowContainer.tsx
- App.tsx (traditional layout mode)

Before modifying, I'll verify this matches your screenshot...
[show code excerpt]

Does this look correct? Should I proceed with the fix?
```

**Wait for user confirmation.**

### Step 5: ONLY THEN Modify Code
Now you can safely make changes.

**Before coding, check canonical standards:**
```bash
# Read standards first
cat .claude/agents/intelligence/canonical-standards.md

# Apply CANONICAL standards, NOT existing code patterns
```

---

## Real Example: Panel Positioning Bug

### ❌ WRONG Process (What I Did Before)

```bash
# Step 1: Searched semantically
grep -r "ProjectDetailPanel" .  # Found orphaned code ❌

# Step 2: Assumed this was correct
# Opened: src/components/work/ProjectDetailPanel.tsx

# Step 3: Modified it
# Wasted time on dead code ❌

# Step 4: Committed broken changes ❌
git commit -m "fix panel" # Modified orphaned code!
```

**Result:** 5,530 LOC of dead code, bug still unfixed.

### ✅ CORRECT Process (What Should Have Happened)

```bash
# Step 1: Launch Playwright (30s)
node inspect-dom.js
# Inspected actual element
# Recorded: data-testid="project-tech-side-panel"
#           className="fixed... bg-black/95..."

# Step 2: Grep exact strings (10s)
grep -r 'data-testid="project-tech-side-panel"' .
# → components/sections/FrameSection.tsx:375

grep -r "bg-black/95 backdrop-blur-xl" .
# → components/sections/FrameSection.tsx:372

# Step 3: Verify imports (10s)
grep -r "from.*FrameSection" .
# → SimplifiedGameFlowContainer.tsx:12 ✅
# → App.tsx indirectly ✅

# Step 4: Confirm with user
"Found FrameSection.tsx line 372. This is the actual component.
 Proceeding with fix... [shows code]"

# Step 5: Modify correct file
# Fixed actual problem ✅
```

**Result:** Bug fixed in one commit, no wasted work.

---

## Common Pitfalls

### Pitfall 1: Semantic Search
```bash
# ❌ WRONG
grep -r "panel" .  # 500 results
grep -r "detail" .  # 300 results

# ✅ CORRECT
grep -r "data-testid=\"project-tech-side-panel\"" .  # 1 result
```

### Pitfall 2: Trusting First Result
```bash
# ❌ WRONG
grep -r "ProjectPanel" . | head -1  # Could be wrong file

# ✅ CORRECT
grep -r "exact-testid-from-dom" .  # Guaranteed correct
```

### Pitfall 3: Skipping Import Verification
```bash
# ❌ WRONG
# Found file, immediately modify

# ✅ CORRECT
grep -r "from.*FileName" .  # Check if imported
# If zero results → STOP, it's dead code
```

### Pitfall 4: Not Asking User
```bash
# ❌ WRONG
# Found file, modify, commit

# ✅ CORRECT
echo "Found $file - confirm this is correct?"
# Wait for confirmation
```

---

## Integration with Quality Gates

The pre-commit hook will check if you followed this protocol:

```bash
# In .git/hooks/pre-commit
if git log -1 --format=%B | grep -iE "panel|modal|ui|ux"; then
  # UI change detected

  if ! git log -1 --format=%B | grep -iE "playwright|dom|inspect|verified"; then
    echo "⚠️  WARNING: UI fix without runtime verification"
    # Encourages following protocol
  fi
fi
```

---

## Cheat Sheet

```bash
# Quick workflow for UI bugs:

# 1. Inspect DOM (30s)
npx playwright test --headed --debug
# → Copy exact classes/testids

# 2. Grep exact strings (10s)
grep -r "exact-testid" . --include="*.tsx"
grep -r "exact-classes" . --include="*.tsx"

# 3. Verify imports (10s)
filename=$(basename $found_file .tsx)
grep -r "from.*$filename" .
# → Must have results, else dead code

# 4. Ask user
echo "Found: $found_file - proceeding?"

# 5. Modify (with canonical standards)
cat .claude/agents/intelligence/canonical-standards.md
# → Apply standards, NOT existing patterns
```

---

## Automation

```bash
# Create helper script: scripts/inspect-ui.sh
#!/bin/bash

echo "🔍 UI Bug Inspector"
echo "=================="
echo ""

echo "Step 1: Launching browser for DOM inspection..."
node -e "
const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:3002');
  console.log('Right-click element → Inspect');
  console.log('Record: classes, testid, hierarchy');
  await page.waitForTimeout(60000);
  await browser.close();
})();
"

echo ""
echo "Step 2: Enter exact testid from DOM:"
read testid

if [ -n "$testid" ]; then
  echo ""
  echo "Searching for: $testid"
  grep -r "data-testid=\"$testid\"" . --include="*.tsx"
fi

echo ""
echo "Step 3: Enter exact classes from DOM:"
read classes

if [ -n "$classes" ]; then
  echo ""
  echo "Searching for: $classes"
  grep -r "$classes" . --include="*.tsx"
fi
```

---

## Related Documentation

- [Canonical Standards](.claude/agents/intelligence/canonical-standards.md)
- [Commit Quality Gate](.claude/agents/commit-quality-gate.md)
- [Runtime Debugging Best Practices](.claude/CLAUDE.md)
