# Screenshot Framework - First Run Checklist

Use this checklist to verify the framework is working correctly.

## Pre-Flight Checks

### ✅ 1. Dependencies Installed

```bash
npm install
```

Expected: No errors, all Storybook packages installed

### ✅ 2. Scripts Available

```bash
npm run | grep -E "(storybook|capture)"
```

Expected output:
```
storybook
build-storybook
capture:components
capture:flows
capture:all
capture:clean
```

### ✅ 3. Directory Structure Exists

```bash
ls -la tests/screenshots/
```

Expected directories:
```
config/
utils/
scripts/
flows/
output/
```

### ✅ 4. Stories Created

```bash
find src/components -name "*.stories.tsx"
```

Expected: At least 4 story files
```
src/components/canvas/CameraController.stories.tsx
src/components/canvas/CursorLens.stories.tsx
src/components/effects/BackgroundEffects.stories.tsx
src/components/ui/FloatingNav.stories.tsx
```

## First Run

### ✅ 5. Start Storybook

**Terminal 1:**
```bash
npm run storybook
```

**Wait for:**
```
╭────────────────────────────────────────────────────╮
│                                                    │
│   Storybook 9.1.9 for react-vite started          │
│   http://localhost:6006                            │
│                                                    │
╰────────────────────────────────────────────────────╯
```

**Verify:**
- [ ] Open http://localhost:6006 in browser
- [ ] See Storybook UI with sidebar
- [ ] See at least 4 stories in sidebar
- [ ] Click on "Canvas/CameraController" - component renders
- [ ] Click on "Canvas/CursorLens" - component renders
- [ ] Click on "Effects/BackgroundEffects" - component renders
- [ ] Click on "UI/FloatingNav" - component renders

### ✅ 6. Start Dev Server

**Terminal 2:**
```bash
npm run dev
```

**Wait for:**
```
VITE v6.2.0  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Verify:**
- [ ] Open http://localhost:3000 in browser
- [ ] Site loads correctly
- [ ] No console errors

### ✅ 7. Run Component Capture

**Terminal 3:**
```bash
npm run capture:components
```

**Expected Output:**
```
🎨 Screenshot Capture Framework v1.0.0
=====================================

📍 Storybook URL: http://localhost:6006
📁 Output Directory: ./tests/screenshots/output
🖥️  Viewports: desktop-1920x1080, tablet-768x1024, mobile-390x844

📸 Capturing Components...

📚 Discovered X stories
```

**Then for each component:**
```
📦 CameraController (N variants)
  ✓ CameraController [default] @ desktop-1920x1080 (XXX KB)
  ✓ CameraController [default] @ tablet-768x1024 (XXX KB)
  ✓ CameraController [default] @ mobile-390x844 (XXX KB)
```

**Finally:**
```
📊 Component Capture Summary:
  • Total Components: X
  • Total Stories: X
  • Total Screenshots: X
  • Duration: XXs
  • Output: tests/screenshots/output/components/

✅ All tests passed
```

**Verify:**
- [ ] No errors during capture
- [ ] "All tests passed" message appears
- [ ] Screenshots counted (should be 12+ for 4 components × 3 viewports)

### ✅ 8. Check Screenshot Output

```bash
ls -lh tests/screenshots/output/components/canvas/
```

**Expected:**
```
CameraController_default_desktop-1920x1080.png
CameraController_default_desktop-1920x1080.json
CameraController_default_tablet-768x1024.png
CameraController_default_tablet-768x1024.json
CameraController_default_mobile-390x844.png
CameraController_default_mobile-390x844.json
... (more variants)
```

**Verify:**
- [ ] PNG files exist (screenshots)
- [ ] JSON files exist (metadata)
- [ ] Filenames follow pattern: `Component_variant_viewport.ext`

### ✅ 9. Inspect Screenshot

```bash
open tests/screenshots/output/components/canvas/CameraController_default_desktop-1920x1080.png
```

**Verify:**
- [ ] Image opens
- [ ] Component is visible
- [ ] Image is not blank
- [ ] Image is not corrupted
- [ ] Viewport size looks correct (desktop-sized)

### ✅ 10. Inspect Metadata

```bash
cat tests/screenshots/output/components/canvas/CameraController_default_desktop-1920x1080.json | jq
```

**Expected JSON structure:**
```json
{
  "filename": "CameraController_default_desktop-1920x1080.png",
  "componentName": "CameraController",
  "variant": "default",
  "viewport": {
    "device": "desktop",
    "width": 1920,
    "height": 1080,
    "devicePixelRatio": 2
  },
  "capture": {
    "timestamp": "...",
    "frameworkVersion": "1.0.0",
    "playwrightVersion": "1.55.1",
    "storybookVersion": "9.1.9"
  }
}
```

**Verify:**
- [ ] JSON is valid (no syntax errors)
- [ ] All required fields present
- [ ] Viewport info matches filename
- [ ] Component name matches filename

### ✅ 11. Run Flow Capture

```bash
npm run capture:flows
```

**Expected Output:**
```
🎬 Capturing Navigation Flow...

📱 Viewport: desktop-1920x1080
  ✓ Step 1: Initial load
  ✓ Step 2: About section
  ✓ Step 3: Work section
  ...

✅ Navigation flow capture complete

🎬 Capturing Canvas Flow...
  ...

🎬 Capturing Accessibility Flow...
  ...

✅ All tests passed
```

**Verify:**
- [ ] No errors during capture
- [ ] All flows complete successfully
- [ ] "All tests passed" message appears

### ✅ 12. Check Flow Output

```bash
ls -lh tests/screenshots/output/flows/navigation/
```

**Expected:**
```
01_initialPageLoad_desktop-1920x1080.png
01_initialPageLoad_desktop-1920x1080.json
02_aboutSection_desktop-1920x1080.png
02_aboutSection_desktop-1920x1080.json
... (more steps)
```

**Verify:**
- [ ] Step numbers in sequence (01, 02, 03...)
- [ ] PNG + JSON pairs for each step
- [ ] Filenames describe the action

### ✅ 13. Complete Capture

```bash
npm run capture:all
```

**Expected:**
- [ ] Runs component capture
- [ ] Then runs flow capture
- [ ] All complete successfully
- [ ] Total time < 5 minutes

### ✅ 14. Check Total Output

```bash
find tests/screenshots/output -name "*.png" | wc -l
find tests/screenshots/output -name "*.json" | wc -l
```

**Expected:**
- [ ] At least 12 PNG files (components)
- [ ] At least 12 JSON files (metadata)
- [ ] Additional files from flows
- [ ] Equal number of PNG and JSON files

## Validation Complete! ✅

If all checks passed, your screenshot framework is **fully operational**.

## Next Steps

1. **Create more stories** for additional components
2. **Run capture regularly** to document changes
3. **Export screenshots** for AI analysis:
   ```bash
   cd tests/screenshots/output
   zip -r ../screenshots-$(date +%Y-%m-%d).zip .
   ```
4. **Load into Claude Desktop** for UI/UX analysis

## Troubleshooting

If any check failed, see:
- `docs/SCREENSHOT_FRAMEWORK.md` - Troubleshooting section
- `docs/SCREENSHOT_QUICKSTART.md` - Common issues

### Most Common Issues

**"No stories found"**
- Solution: Make sure Storybook is running (`npm run storybook`)
- Check: http://localhost:6006 loads in browser

**Blank screenshots**
- Solution: Increase delay in `tests/screenshots/utils/screenshot-helpers.ts`
- Change `await page.waitForTimeout(500)` to `1000` in `stabilizePage()`

**Out of memory**
- Solution: Reduce workers in `playwright.config.screenshots.ts`
- Change `workers: 4` to `workers: 2`

**Tests timeout**
- Solution: Increase timeout in `playwright.config.screenshots.ts`
- Change `timeout: 120000` to `timeout: 180000`

## Clean Up

To remove all screenshots and start fresh:

```bash
npm run capture:clean
```

This deletes everything in `tests/screenshots/output/` (except .gitkeep).

---

**Questions?** See full documentation in `docs/SCREENSHOT_FRAMEWORK.md`
