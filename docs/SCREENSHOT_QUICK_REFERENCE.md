# Screenshot Framework - Quick Reference

## Commands

```bash
# Storybook
npm run storybook              # Start Storybook (port 6006)
npm run build-storybook        # Build static Storybook

# Screenshot Capture
npm run capture:components     # Capture all component screenshots
npm run capture:flows          # Capture all user flow screenshots
npm run capture:all            # Capture components + flows
npm run capture:clean          # Delete all screenshots

# Filtered Capture
npm run capture:components -- --grep "ComponentName"
npm run capture:flows -- --grep "flow-name"
```

## File Locations

```
.storybook/                    # Storybook configuration
├── main.ts                    # Framework config
└── preview.ts                 # Global decorators

src/components/                # Component stories
└── **/*.stories.tsx           # Story files

tests/screenshots/             # Framework code
├── config/                    # Configuration
│   ├── capture.config.ts      # Framework settings
│   └── viewports.ts           # Viewport definitions
├── utils/                     # Utilities
│   ├── storybook-api.ts       # Story discovery
│   ├── metadata-generator.ts  # JSON generation
│   ├── filename-generator.ts  # Naming
│   └── screenshot-helpers.ts  # Capture helpers
├── scripts/                   # Capture automation
│   └── capture-components.spec.ts
├── flows/                     # Flow scripts
│   ├── navigation-flow.spec.ts
│   ├── canvas-flow.spec.ts
│   └── accessibility-flow.spec.ts
└── output/                    # Generated files
    ├── components/            # Component screenshots
    ├── flows/                 # Flow screenshots
    └── metadata/              # Manifests

docs/                          # Documentation
├── SCREENSHOT_FRAMEWORK.md           # Complete guide
├── SCREENSHOT_QUICKSTART.md          # Quick start
├── SCREENSHOT_FIRST_RUN_CHECKLIST.md # Validation
└── SCREENSHOT_QUICK_REFERENCE.md     # This file

ai/ai-prompts/claude/
└── screenshot-framework-architecture.md  # Design doc
```

## Workflow

### Standard Workflow

```bash
# Terminal 1
npm run storybook

# Terminal 2
npm run dev

# Terminal 3
npm run capture:all
```

### Quick Component Check

```bash
npm run storybook
npm run capture:components -- --grep "MyComponent"
```

### AI Analysis Workflow

```bash
# 1. Capture
npm run capture:all

# 2. Package
cd tests/screenshots/output
zip -r ../screenshots.zip .

# 3. Analyze
# Load screenshots.zip into Claude Desktop
# Use prompt from docs/SCREENSHOT_FRAMEWORK.md
```

## File Naming Patterns

```
Components:
{ComponentName}_{variant}_{viewport}.{ext}

Examples:
CameraController_default_desktop-1920x1080.png
CursorLens_quickActivation_tablet-768x1024.json

Flows:
{stepNumber}_{description}_{viewport}.{ext}

Examples:
01_initialPageLoad_desktop-1920x1080.png
02_aboutSection_mobile-390x844.json
```

## Viewports

```typescript
Default Viewports:
- desktop-1920x1080    # FHD desktop
- tablet-768x1024      # iPad portrait
- mobile-390x844       # iPhone 12 Pro

Available Viewports:
- desktop-1920x1080    # FHD desktop
- desktop-1440x900     # Laptop
- tablet-768x1024      # iPad portrait
- tablet-1024x768      # iPad landscape
- mobile-375x667       # iPhone SE
- mobile-390x844       # iPhone 12 Pro
- mobile-414x896       # iPhone 11 Pro Max

Add custom viewports in:
tests/screenshots/config/viewports.ts
```

## Story Template

```tsx
// src/components/YourComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import YourComponent from './YourComponent';

const meta = {
  title: 'Category/YourComponent',
  component: YourComponent,
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
      options: ['default', 'compact'],
    },
  },
} satisfies Meta<typeof YourComponent>;

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

## Flow Template

```typescript
// tests/screenshots/flows/your-flow.spec.ts
import { test } from '@playwright/test';
import { captureFlowStep, setViewport } from '../utils/screenshot-helpers';
import { defaultViewports } from '../config/viewports';

test.describe('Your Flow', () => {
  test('should capture interaction', async ({ page }) => {
    for (const viewportKey of defaultViewports) {
      await setViewport(page, viewportKey);

      await page.goto('http://localhost:3000');
      await captureFlowStep(page, 'your-flow', {
        step: 1,
        description: 'Initial state',
        action: 'Page loaded',
        viewportKey,
        analysisHints: {
          focusAreas: ['Hero visibility'],
        },
      });

      // More steps...
    }
  });
});
```

## Metadata Schema

```typescript
interface ScreenshotMetadata {
  filename: string;
  componentName: string;
  variant: string;

  viewport: {
    device: 'desktop' | 'tablet' | 'mobile';
    width: number;
    height: number;
    devicePixelRatio: number;
  };

  capture: {
    timestamp: string;          // ISO 8601
    frameworkVersion: string;   // e.g., "1.0.0"
    playwrightVersion: string;
    storybookVersion: string;
  };

  analysisHints?: {
    focusAreas?: string[];
    expectedBehaviors?: string[];
    knownIssues?: string[];
  };
}
```

## Configuration

```typescript
// tests/screenshots/config/capture.config.ts
export const captureConfig: CaptureConfig = {
  outputDir: './tests/screenshots/output',
  storybookUrl: 'http://localhost:6006',
  defaultViewports: [...],

  screenshot: {
    fullPage: false,
    omitBackground: false,
    animations: 'disabled',
    timeout: 10000,
  },

  parallel: {
    enabled: true,
    maxWorkers: 4,  // Adjust for your machine
  },
};
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No stories found | Verify Storybook running at :6006 |
| Blank screenshots | Increase delay in `stabilizePage()` |
| Out of memory | Reduce `workers` in playwright config |
| Tests timeout | Increase `timeout` in playwright config |
| Flaky screenshots | Animations already disabled, check components |

## AI Analysis Prompt Template

```
I've provided screenshots of my portfolio website with JSON metadata.

Analyze for:
1. Accessibility (contrast, focus, ARIA labels)
2. Visual consistency (spacing, typography, colors)
3. Responsive design (desktop/tablet/mobile)
4. Interactive states (hover, focus, active)

For each finding:
- Severity (High/Medium/Low)
- Location (component + viewport)
- Recommendation with code snippet

Reference JSON metadata for context.
```

## Utilities

```typescript
// Import helpers
import {
  captureComponent,
  captureFlowStep,
  captureInteractiveState,
  setViewport,
  stabilizePage,
} from '../utils/screenshot-helpers';

// Capture component
await captureComponent(page, {
  componentName: 'MyComponent',
  variant: 'default',
  viewportKey: 'desktop-1920x1080',
  outputSubdir: 'components/category',
});

// Capture flow step
await captureFlowStep(page, 'flow-name', {
  step: 1,
  description: 'Step description',
  action: 'What happened',
  viewportKey: 'desktop-1920x1080',
});

// Capture interactive state
await captureInteractiveState(page, {
  componentName: 'Button',
  variant: 'primary',
  viewportKey: 'desktop-1920x1080',
  state: 'hover',
  selector: '[data-testid="button"]',
});
```

## Performance

```
Typical Performance:
- Component capture: 1-3 min for 4 components
- Flow capture: 1-2 min for 3 flows
- Full capture: 2-5 min total
- Parallel workers: 4 (configurable)

Optimize:
- Increase workers for more power
- Decrease workers to save memory
- Use --grep to filter components/flows
```

## URLs

```
Storybook:        http://localhost:6006
Dev Server:       http://localhost:3000
Canvas Mode:      http://localhost:3000?layout=canvas
Debug Mode:       http://localhost:3000?debug=true
```

## Support

```
Documentation:    docs/SCREENSHOT_FRAMEWORK.md
Quick Start:      docs/SCREENSHOT_QUICKSTART.md
Checklist:        docs/SCREENSHOT_FIRST_RUN_CHECKLIST.md
Architecture:     ai/ai-prompts/claude/screenshot-framework-architecture.md
```
