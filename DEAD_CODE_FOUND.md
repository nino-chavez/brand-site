# Dead Code Detected - Contact Section Issue

## Problem Summary

We edited `src/components/layout/ContactSection.tsx` thinking it was the contact section, but it's **never imported anywhere** in the application. The actual contact section is in `components/sections/PortfolioSection.tsx`.

## Dead Code Files

### 1. `/src/components/layout/ContactSection.tsx`
- **Status**: ❌ Dead Code - Never Imported
- **Size**: 205 lines
- **Only Reference**: Storybook story file (also dead code)
- **Mistaken For**: The actual contact section
- **Actual Contact**: `components/sections/PortfolioSection.tsx` (lines 66-96, 247-417)

### 2. `/src/components/layout/ContactSection.stories.tsx`
- **Status**: ❌ Dead Code - Storybook story for unused component
- **Action**: Delete along with ContactSection.tsx

## Why This Happened

1. **Misleading File Name**: "ContactSection" sounds like the contact section
2. **Professional Appearance**: File looks production-ready with proper hooks, TypeScript
3. **Location Confusion**: `src/components/layout/` seemed like the right place
4. **Actual Location**: Contact form is embedded in `PortfolioSection.tsx` (not obvious)

## Root Cause - Duplicate Directory Structure

```
/components/sections/          ← Project root (LIVE CODE)
  ├── PortfolioSection.tsx     ✅ Contains actual contact form
  ├── CaptureSection.tsx
  ├── FocusSection.tsx
  └── ...

/src/components/layout/        ← Source directory (MIXED)
  ├── ContactSection.tsx       ❌ DEAD CODE
  ├── Header.tsx               ✅ Used
  ├── Section.tsx              ✅ Used
  └── ...
```

## How to Prevent This

### Option 1: Dead Code Detection Script (Recommended)

Create `scripts/find-dead-code.sh`:
```bash
#!/bin/bash
# Find TypeScript/TSX files that are never imported

for file in $(find src components -name "*.tsx" -o -name "*.ts" | grep -v ".stories." | grep -v ".test."); do
  filename=$(basename "$file" .tsx | basename .ts)
  imports=$(grep -r "import.*${filename}" src components --include="*.ts" --include="*.tsx" | wc -l)

  if [ "$imports" -eq "0" ]; then
    echo "❌ DEAD CODE: $file (never imported)"
  fi
done
```

### Option 2: Consolidate Directory Structure

Move all components to ONE location:
```
/src/components/
  ├── layout/
  ├── sections/
  ├── ui/
  └── ...
```

Delete `/components/` at project root entirely.

### Option 3: TypeScript Path Aliases

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["src/components/*"],
      "@/sections/*": ["components/sections/*"]  // Make explicit
    }
  }
}
```

## Action Items

- [ ] Delete `src/components/layout/ContactSection.tsx`
- [ ] Delete `src/components/layout/ContactSection.stories.tsx`
- [ ] Run dead code detection script across entire codebase
- [ ] Document which directory structure is canonical
- [ ] Add pre-commit hook to detect orphaned files

## Lesson Learned

**Always verify a component is actually imported before editing it.**

Command to check:
```bash
grep -r "import.*ComponentName" src/ components/ --include="*.ts" --include="*.tsx"
```

If it returns nothing (except the file itself and its tests/stories), it's dead code.

---

**Issue Date**: 2025-10-10
**Detected By**: Claude Code during contact section update
**Impact**: Wasted 30+ minutes editing wrong file, then had to redo changes in correct location
