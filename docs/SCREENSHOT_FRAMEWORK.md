# Screenshot Capture Framework

> Autonomous screenshot capture system for generating AI-ready visual documentation of the Nino Chavez portfolio site.

## Overview

This framework automatically captures comprehensive visual documentation of components and user flows across multiple viewports. Each screenshot is accompanied by rich JSON metadata, optimized for downstream AI analysis by Claude Desktop (Sonnet 4.5).

**Key Features:**
- 🤖 **AI-Optimized**: Self-documenting filenames + rich metadata
- 🔄 **Autonomous**: Auto-discovers components via Storybook API
- 📱 **Multi-Viewport**: Desktop, tablet, mobile coverage
- 🎯 **Comprehensive**: Components, flows, and interactive states
- 📊 **Metadata-Rich**: Full context for AI analysis

## Architecture

```
tests/screenshots/
├── config/
│   ├── capture.config.ts        # Framework configuration
│   └── viewports.ts              # Viewport definitions
├── utils/
│   ├── storybook-api.ts          # Story discovery
│   ├── metadata-generator.ts     # JSON metadata
│   ├── filename-generator.ts     # AI-friendly naming
│   └── screenshot-helpers.ts     # Capture utilities
├── scripts/
│   └── capture-components.spec.ts # Component automation
├── flows/
│   ├── navigation-flow.spec.ts   # User journey capture
│   ├── canvas-flow.spec.ts       # Canvas mode capture
│   └── accessibility-flow.spec.ts # A11y feature capture
└── output/                       # Generated screenshots
    ├── components/               # Component screenshots
    ├── flows/                    # Flow screenshots
    └── metadata/                 # Aggregated metadata
```

## Prerequisites

1. **Node.js 20+** installed
2. **Storybook installed** (done automatically via framework)
3. **Playwright installed** (should already be in devDependencies)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Storybook

```bash
npm run storybook
```

Storybook will start at `http://localhost:6006`

### 3. Capture Screenshots

**Capture all components:**
```bash
npm run capture:components
```

**Capture user flows:**
```bash
npm run capture:flows
```

**Capture everything:**
```bash
npm run capture:all
```

### 4. View Results

Screenshots are saved to:
```
tests/screenshots/output/
├── components/
│   ├── canvas/
│   │   ├── CameraController_default_desktop-1920x1080.png
│   │   ├── CameraController_default_desktop-1920x1080.json
│   │   └── ...
│   ├── effects/
│   └── ui/
└── flows/
    ├── navigation/
    ├── canvas/
    └── accessibility/
```

## Usage Guide

### Creating Component Stories

To add a component to the screenshot capture system:

1. **Create a `.stories.tsx` file** next to your component:

```tsx
// src/components/ui/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import MyComponent from './MyComponent';

const meta = {
  title: 'UI/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'expanded'],
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
};

export const Compact: Story = {
  args: {
    variant: 'compact',
  },
};
```

2. **Run capture** - the framework auto-discovers your new story:

```bash
npm run capture:components
```

That's it! The framework will:
- Discover your story automatically
- Capture screenshots at all configured viewports
- Generate metadata with story args and viewport info

### Creating User Flow Scripts

To document a new user journey:

1. **Create a flow spec** in `tests/screenshots/flows/`:

```typescript
// tests/screenshots/flows/my-flow.spec.ts
import { test } from '@playwright/test';
import { captureFlowStep, setViewport } from '../utils/screenshot-helpers';
import { defaultViewports } from '../config/viewports';

test.describe('My Custom Flow', () => {
  test('should capture user interaction', async ({ page }) => {
    console.log('\n🎬 Capturing My Flow...\n');

    for (const viewportKey of defaultViewports) {
      await setViewport(page, viewportKey);

      // Step 1: Initial state
      await page.goto('http://localhost:3000');
      await captureFlowStep(page, 'my-flow', {
        step: 1,
        description: 'Page loaded',
        action: 'Navigated to home',
        viewportKey,
        analysisHints: {
          focusAreas: ['Hero visibility', 'CTA prominence'],
        },
      });

      // Step 2: User action
      await page.click('[data-testid="some-button"]');
      await captureFlowStep(page, 'my-flow', {
        step: 2,
        description: 'After button click',
        action: 'Clicked primary CTA',
        viewportKey,
      });
    }
  });
});
```

2. **Run your flow:**

```bash
npm run capture:flows
```

### Configuring Viewports

Edit `tests/screenshots/config/viewports.ts` to add new viewports:

```typescript
export const viewports: Record<string, ViewportConfig> = {
  // ... existing viewports

  '4k-desktop': {
    width: 3840,
    height: 2160,
    deviceScaleFactor: 2,
    label: '4K Display',
    device: 'desktop',
  },
};

// Add to default set
export const defaultViewports = [
  'desktop-1920x1080',
  'tablet-768x1024',
  'mobile-390x844',
  '4k-desktop', // Your new viewport
];
```

### Customizing Capture Behavior

Edit `tests/screenshots/config/capture.config.ts`:

```typescript
export const captureConfig: CaptureConfig = {
  // Output directory
  outputDir: './tests/screenshots/output',

  // Storybook URL
  storybookUrl: 'http://localhost:6006',

  // Screenshot options
  screenshot: {
    fullPage: false,        // Capture full scrollable page
    omitBackground: false,  // Transparent background
    animations: 'disabled', // Disable for stability
    timeout: 10000,         // Max wait time
  },

  // Parallel execution
  parallel: {
    enabled: true,
    maxWorkers: 4, // Adjust based on machine
  },
};
```

## Metadata Schema

Each screenshot has a companion `.json` file with comprehensive metadata:

```json
{
  "filename": "CameraController_default_desktop-1920x1080.png",
  "componentName": "CameraController",
  "storyId": "canvas-cameracontroller--default",
  "variant": "default",

  "viewport": {
    "device": "desktop",
    "width": 1920,
    "height": 1080,
    "devicePixelRatio": 2,
    "userAgent": "Mozilla/5.0..."
  },

  "storyArgs": {
    "performanceMode": "balanced"
  },

  "capture": {
    "timestamp": "2025-09-30T12:34:56.789Z",
    "frameworkVersion": "1.0.0",
    "playwrightVersion": "1.55.1",
    "storybookVersion": "9.1.9",
    "browser": "chromium",
    "platform": "darwin"
  },

  "analysisHints": {
    "focusAreas": [
      "Camera control UI placement",
      "Button accessibility"
    ],
    "expectedBehaviors": [
      "All controls visible",
      "Proper ARIA labels"
    ]
  }
}
```

## AI Analysis Workflow

### Preparing Screenshots for Claude Desktop

Once you've captured screenshots, prepare them for AI analysis:

1. **Review captured screenshots:**
   ```bash
   open tests/screenshots/output/
   ```

2. **Create a ZIP for Claude Desktop:**
   ```bash
   cd tests/screenshots/output
   zip -r nino-portfolio-screenshots-$(date +%Y-%m-%d).zip .
   ```

3. **Load into Claude Desktop:**
   - Drag the ZIP file into Claude Desktop
   - Claude will read the screenshots + metadata
   - Provide analysis prompt (see below)

### Sample Analysis Prompt

```
I've provided screenshots of my portfolio website with comprehensive metadata.

Please perform a UI/UX analysis focusing on:

1. **Accessibility**: Review focus indicators, color contrast, ARIA labels
2. **Visual Consistency**: Check spacing, typography, color usage
3. **Responsive Behavior**: Compare desktop/tablet/mobile layouts
4. **Interactive States**: Analyze hover, focus, active states

For each finding, provide:
- Severity (High/Medium/Low)
- Specific location (component + viewport)
- Recommendation with code snippet if applicable

Reference the JSON metadata for context about each screenshot.
```

## Advanced Usage

### Capturing Interactive States

Capture hover, focus, and active states:

```typescript
import { captureInteractiveState } from '../utils/screenshot-helpers';

// Capture hover state
await captureInteractiveState(page, {
  componentName: 'Button',
  variant: 'primary',
  viewportKey: 'desktop-1920x1080',
  state: 'hover',
  selector: '[data-testid="primary-button"]',
  outputSubdir: 'states/hover',
});
```

### Filtering Components

Capture specific components only:

```typescript
// In capture-components.spec.ts
const stories = await storybookAPI.discoverStories(page);

// Filter to specific category
const canvasStories = stories.filter(s =>
  s.title.startsWith('Canvas/')
);

// Or specific component
const buttonStories = storybookAPI.getStoriesForComponent('Button');
```

### Custom Metadata

Add custom analysis hints:

```typescript
await captureComponent(page, {
  componentName: 'MyComponent',
  variant: 'default',
  viewportKey: 'desktop-1920x1080',
  analysisHints: {
    focusAreas: [
      'Custom focus point 1',
      'Custom focus point 2',
    ],
    expectedBehaviors: [
      'Should do X',
      'Should handle Y',
    ],
    knownIssues: [
      'Known bug with Z',
    ],
  },
});
```

## Troubleshooting

### Screenshots are blank

**Cause**: Component not fully rendered
**Solution**: Increase stabilization delay in `screenshot-helpers.ts`:

```typescript
// In stabilizePage()
await page.waitForTimeout(1000); // Increase from 500ms
```

### Storybook stories not discovered

**Cause**: Storybook internal API changed
**Solution**: Check `storybook-api.ts` and update story extraction logic:

```typescript
// Debug what's available
const debug = await page.evaluate(() => {
  console.log(window.__STORYBOOK_PREVIEW__);
  return Object.keys(window);
});
```

### Animations causing flaky screenshots

**Cause**: Animations not fully disabled
**Solution**: Already handled via `reducedMotion: 'reduce'` in Playwright config and CSS injection

### Out of memory errors

**Cause**: Too many parallel captures
**Solution**: Reduce workers in `playwright.config.screenshots.ts`:

```typescript
workers: 2, // Down from 4
```

## Performance Optimization

### Parallel Execution

By default, captures run in parallel (4 workers). Adjust based on your machine:

```typescript
// capture.config.ts
parallel: {
  enabled: true,
  maxWorkers: 8, // More powerful machine
}
```

### Selective Capture

For faster iteration during development:

```bash
# Capture single component
npm run capture:components -- --grep "CameraController"

# Capture single flow
npm run capture:flows -- --grep "navigation"

# Capture single viewport (modify script temporarily)
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual Documentation
on:
  pull_request:
    paths:
      - 'src/components/**'
      - '.storybook/**'

jobs:
  capture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - run: npx playwright install --with-deps chromium

      - run: npm run capture:all

      - uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: tests/screenshots/output/
          retention-days: 7
```

## Maintenance

### Updating Framework Version

When making framework changes, update version:

```typescript
// capture.config.ts
export const captureConfig: CaptureConfig = {
  version: '1.1.0', // Increment
  // ...
};
```

### Cleaning Old Screenshots

```bash
# Clean all screenshots
npm run capture:clean

# Or manually
rm -rf tests/screenshots/output/*
```

### Adding New Story Templates

Create templates for common component patterns:

```bash
# Create template directory
mkdir -p .storybook/templates

# Add template
touch .storybook/templates/component.stories.tsx.template
```

## Best Practices

### Naming Conventions

- **Components**: PascalCase (`CameraController`)
- **Variants**: camelCase (`lowPerformance`)
- **Flows**: kebab-case (`navigation-flow`)
- **Steps**: Descriptive (`initial-page-load`)

### Story Organization

Group related components:
```
Canvas/CameraController
Canvas/LightboxCanvas
Effects/BackgroundEffects
UI/FloatingNav
```

### Metadata Quality

Always provide analysis hints:
```typescript
analysisHints: {
  focusAreas: [
    'Specific areas to examine',
  ],
  expectedBehaviors: [
    'What should work correctly',
  ],
}
```

### Version Control

**Commit:**
- ✅ Framework code (`tests/screenshots/`)
- ✅ Story files (`*.stories.tsx`)
- ✅ Configuration files
- ❌ Screenshot output (`tests/screenshots/output/`)

**Add to `.gitignore`:**
```gitignore
tests/screenshots/output/
!tests/screenshots/output/.gitkeep
```

## FAQ

**Q: How long does full capture take?**
A: ~2-5 minutes for all components + flows (depends on component count)

**Q: Can I capture just one component?**
A: Yes, use `--grep` flag: `npm run capture:components -- --grep "ComponentName"`

**Q: Do I need to restart Storybook after adding stories?**
A: Yes, Storybook needs to rebuild to discover new stories

**Q: Can I capture custom viewports?**
A: Yes, add to `viewports.ts` and include in `defaultViewports`

**Q: How do I capture dark mode?**
A: Create variants in your story with dark background parameter

**Q: Can screenshots be compressed?**
A: Yes, modify `screenshot-helpers.ts` to use Sharp for compression

## Support

For issues or questions:
1. Check this documentation
2. Review architecture plan: `ai/ai-prompts/claude/screenshot-framework-architecture.md`
3. Examine example stories in `src/components/`
4. Check Playwright docs: https://playwright.dev

## License

Part of Nino Chavez Portfolio - Private Repository
