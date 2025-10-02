# Screenshot Framework - Quick Start Guide

> Get started capturing screenshots in 5 minutes

## 1. Verify Installation

Check that all dependencies are installed:

```bash
# Should show storybook commands
npm run | grep storybook

# Should show capture commands
npm run | grep capture
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

## 2. Start Storybook

Terminal 1:
```bash
npm run storybook
```

Wait for:
```
╭────────────────────────────────────────────────────╮
│                                                    │
│   Storybook 9.1.9 for react-vite started          │
│   http://localhost:6006                            │
│                                                    │
╰────────────────────────────────────────────────────╯
```

Open http://localhost:6006 to verify it works.

## 3. Start Dev Server

Terminal 2:
```bash
npm run dev
```

Wait for:
```
VITE v6.2.0  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## 4. Run First Capture

Terminal 3:
```bash
npm run capture:components
```

You should see:
```
🎨 Screenshot Capture Framework v1.0.0
=====================================

📍 Storybook URL: http://localhost:6006
📁 Output Directory: ./tests/screenshots/output
🖥️  Viewports: desktop-1920x1080, tablet-768x1024, mobile-390x844

📸 Capturing Components...

📚 Discovered N stories

📦 CameraController (X variants)
  ✓ CameraController [default] @ desktop-1920x1080 (XXX KB)
  ✓ CameraController [default] @ tablet-768x1024 (XXX KB)
  ...
```

## 5. Check Output

```bash
# List captured screenshots
ls -lh tests/screenshots/output/components/

# View a screenshot
open tests/screenshots/output/components/canvas/CameraController_default_desktop-1920x1080.png

# View metadata
cat tests/screenshots/output/components/canvas/CameraController_default_desktop-1920x1080.json
```

## 6. Capture User Flows

```bash
npm run capture:flows
```

You should see:
```
🎬 Capturing Navigation Flow...

📱 Viewport: desktop-1920x1080
  ✓ Step 1: Initial load
  ✓ Step 2: About section
  ✓ Step 3: Work section
  ...
```

## 7. Next Steps

### Add More Component Stories

Create `src/components/YourComponent.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import YourComponent from './YourComponent';

const meta = {
  title: 'Category/YourComponent',
  component: YourComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // your props
  },
};
```

Then re-run:
```bash
npm run capture:components
```

### Prepare for AI Analysis

1. **Review screenshots:**
   ```bash
   open tests/screenshots/output/
   ```

2. **Create ZIP:**
   ```bash
   cd tests/screenshots/output
   zip -r ../portfolio-screenshots.zip .
   ```

3. **Load into Claude Desktop** and use this prompt:

   ```
   Analyze these UI/UX screenshots of my portfolio website.

   Focus on:
   1. Accessibility (contrast, focus indicators, ARIA)
   2. Visual consistency (spacing, typography, colors)
   3. Responsive behavior (desktop/tablet/mobile)
   4. Interactive states (hover, focus, active)

   Use the JSON metadata for context.
   Provide specific, actionable recommendations.
   ```

## Common Issues

### "No stories found"

**Solution**: Make sure Storybook is running at http://localhost:6006

### "Cannot connect to http://localhost:3000"

**Solution**: Make sure dev server is running with `npm run dev`

### Blank screenshots

**Solution**: Component may need more time to load. Increase delay in `screenshot-helpers.ts`:
```typescript
await page.waitForTimeout(1000); // in stabilizePage()
```

### Out of memory

**Solution**: Reduce parallel workers in `playwright.config.screenshots.ts`:
```typescript
workers: 2, // down from 4
```

## Available Commands

```bash
# Storybook
npm run storybook              # Start Storybook dev server
npm run build-storybook        # Build static Storybook

# Screenshots
npm run capture:components     # Capture all component screenshots
npm run capture:flows          # Capture all user flow screenshots
npm run capture:all            # Capture everything
npm run capture:clean          # Delete all screenshots

# With filters
npm run capture:components -- --grep "CameraController"
npm run capture:flows -- --grep "navigation"
```

## Need Help?

See full documentation: `docs/SCREENSHOT_FRAMEWORK.md`
