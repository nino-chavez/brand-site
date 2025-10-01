# Autonomous Screenshot Capture Framework - Architecture Plan

## Executive Summary

This document outlines the architecture for an autonomous screenshot capture framework designed to generate **AI-ready visual datasets** for downstream UI/UX analysis by Claude Desktop (Sonnet 4.5). The framework will capture comprehensive visual documentation of Nino Chavez's portfolio site across multiple viewports, component states, and user flows.

**Key Design Principle:** Every decision optimizes for AI consumability. The output is a programmatic visual prompt for design analysis.

---

## 1. Framework Design Principles

### 1.1 AI-First Design
- **Descriptive Filenames:** Self-documenting names eliminate need for external context
- **Rich Metadata:** JSON companions provide component props, viewport info, and interaction context
- **Consistent Taxonomy:** Predictable naming patterns enable pattern recognition
- **Visual Context:** Screenshots capture component in situ, not isolation

### 1.2 Robustness & Maintainability
- **Auto-Discovery:** Dynamically discovers components via Storybook API and React component tree
- **Graceful Degradation:** Falls back to manual configuration if auto-discovery fails
- **Version Control:** Metadata includes framework version, timestamps, and component versions
- **Idempotency:** Re-running capture updates existing screenshots without side effects

### 1.3 Portfolio-Specific Optimizations
- **Dual Layout Support:** Captures both Traditional and Canvas layout modes
- **Performance Modes:** Documents all three performance states (low/balanced/high)
- **Interactive States:** Captures hover, focus, active states for accessibility validation
- **Motion States:** Documents animation states for motion-based effects

---

## 2. Tool Selection & Justification

### 2.1 Core Tools

| Tool | Version | Justification |
|------|---------|---------------|
| **Storybook** | 8.x | Isolated component development; dynamic story discovery |
| **Playwright** | 1.55.1 | Already in project; excellent viewport control; parallel execution |
| **TypeScript** | 5.8.2 | Type safety for metadata generation; IDE support |

### 2.2 Why Storybook?
1. **Isolation:** Components rendered without full app context
2. **State Control:** Easy to capture all prop combinations programmatically
3. **API Access:** `@storybook/preview-api` enables runtime story discovery
4. **Documentation:** Stories serve dual purpose as documentation

### 2.3 Why Not Alternatives?
- **Chromatic:** Paid service; we need local control
- **Percy:** SaaS dependency; violates autonomy principle
- **Puppeteer:** Less reliable than Playwright for modern apps
- **Manual Capture:** Not scalable; error-prone; not autonomous

---

## 3. Project Structure & Modularization

```
nino-chavez-site/
├── .storybook/
│   ├── main.ts                          # Storybook configuration
│   ├── preview.ts                       # Global decorators & parameters
│   └── manager.ts                       # Addon configuration
│
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CameraController.tsx
│   │   │   ├── CameraController.stories.tsx   # NEW: Component stories
│   │   │   ├── LightboxCanvas.tsx
│   │   │   └── LightboxCanvas.stories.tsx     # NEW
│   │   ├── effects/
│   │   │   ├── BackgroundEffects.tsx
│   │   │   ├── BackgroundEffects.stories.tsx  # NEW
│   │   │   └── ... (stories for each component)
│   │   └── ... (existing components)
│   │
│   └── stories/                         # NEW: Complex composition stories
│       ├── Flows.stories.tsx            # User flow demonstrations
│       ├── Layouts.stories.tsx          # Full layout compositions
│       └── States.stories.tsx           # Interactive state demonstrations
│
├── tests/
│   └── screenshots/                     # NEW: Screenshot automation
│       ├── config/
│       │   ├── capture.config.ts        # Capture configuration
│       │   └── viewports.ts             # Viewport definitions
│       │
│       ├── utils/
│       │   ├── storybook-api.ts         # Storybook story discovery
│       │   ├── metadata-generator.ts    # JSON metadata creation
│       │   ├── filename-generator.ts    # AI-friendly naming
│       │   └── screenshot-helpers.ts    # Playwright utilities
│       │
│       ├── scripts/
│       │   ├── capture-components.ts    # Component screenshot automation
│       │   ├── capture-flows.ts         # User flow automation
│       │   └── capture-states.ts        # Interactive state automation
│       │
│       ├── flows/
│       │   ├── navigation-flow.spec.ts  # Section navigation
│       │   ├── canvas-flow.spec.ts      # Canvas interactions
│       │   ├── gallery-flow.spec.ts     # Gallery modal flow
│       │   └── accessibility-flow.spec.ts # Keyboard navigation
│       │
│       └── output/                      # Screenshot storage
│           ├── components/              # Component screenshots
│           │   ├── canvas/
│           │   │   ├── CameraController_default_desktop-1920x1080.png
│           │   │   ├── CameraController_default_desktop-1920x1080.json
│           │   │   ├── CameraController_default_tablet-768x1024.png
│           │   │   ├── CameraController_default_tablet-768x1024.json
│           │   │   └── ...
│           │   └── ...
│           │
│           ├── flows/                   # User flow screenshots
│           │   ├── navigation/
│           │   │   ├── 01_initial-load_desktop-1920x1080.png
│           │   │   ├── 01_initial-load_desktop-1920x1080.json
│           │   │   ├── 02_scroll-to-work_desktop-1920x1080.png
│           │   │   └── ...
│           │   └── ...
│           │
│           ├── states/                  # Interactive state screenshots
│           │   ├── hover/
│           │   ├── focus/
│           │   └── active/
│           │
│           └── metadata/                # Aggregated metadata
│               ├── capture-manifest.json    # All screenshots index
│               └── capture-summary.json     # Statistics & coverage
│
├── playwright.config.screenshots.ts     # NEW: Dedicated screenshot config
└── package.json                         # Updated scripts
```

---

## 4. Screenshot Naming & Metadata Strategy

### 4.1 Filename Convention

**Pattern:** `{ComponentName}_{variant}_{viewport}_{state}.{ext}`

**Examples:**
```
CameraController_default_desktop-1920x1080.png
CameraController_debugMode_tablet-768x1024.png
BackgroundEffects_lowPerformance_mobile-375x667.png
LightboxCanvas_canvasMode_desktop-1920x1080_hover.png
```

**Components:**
- `ComponentName`: PascalCase component name
- `variant`: Story variant (e.g., `default`, `debugMode`, `lowPerformance`)
- `viewport`: Device category + resolution (e.g., `desktop-1920x1080`)
- `state`: Optional interaction state (e.g., `hover`, `focus`, `active`)

### 4.2 Metadata Schema

Each screenshot has a companion `.json` file:

```typescript
interface ScreenshotMetadata {
  // Identification
  filename: string;
  componentName: string;
  storyId: string;
  variant: string;

  // Viewport Context
  viewport: {
    device: 'desktop' | 'tablet' | 'mobile';
    width: number;
    height: number;
    devicePixelRatio: number;
    userAgent: string;
  };

  // Component Context
  props: Record<string, any>;          // Component props from story
  storyArgs: Record<string, any>;      // Storybook args

  // Interaction Context
  interactionState?: {
    type: 'hover' | 'focus' | 'active' | 'scroll';
    target: string;                    // CSS selector
    action: string;                    // Description of action
  };

  // Application State
  appContext: {
    layoutMode: 'traditional' | 'canvas';
    performanceMode: 'low' | 'balanced' | 'high';
    debugMode: boolean;
    urlParams: Record<string, string>;
  };

  // Capture Metadata
  capture: {
    timestamp: string;                 // ISO 8601
    frameworkVersion: string;          // Framework version
    playwrightVersion: string;
    storybookVersion: string;
    browser: string;
    platform: string;
  };

  // AI Analysis Hints
  analysisHints: {
    focusAreas: string[];              // What to analyze
    expectedBehaviors: string[];       // What should work
    knownIssues?: string[];            // Known problems
  };
}
```

**Example Metadata:**
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
  "props": {
    "performanceMode": "balanced",
    "debugMode": false
  },
  "storyArgs": {
    "performanceMode": "balanced"
  },
  "appContext": {
    "layoutMode": "canvas",
    "performanceMode": "balanced",
    "debugMode": false,
    "urlParams": {
      "layout": "canvas"
    }
  },
  "capture": {
    "timestamp": "2025-09-30T12:34:56.789Z",
    "frameworkVersion": "1.0.0",
    "playwrightVersion": "1.55.1",
    "storybookVersion": "8.5.0",
    "browser": "chromium",
    "platform": "darwin"
  },
  "analysisHints": {
    "focusAreas": [
      "Camera control UI placement",
      "Button accessibility",
      "Keyboard navigation indicators"
    ],
    "expectedBehaviors": [
      "All controls visible",
      "Proper ARIA labels",
      "Focus indicators present"
    ]
  }
}
```

### 4.3 Manifest Generation

**Capture Manifest:** Index of all captured screenshots
```json
{
  "version": "1.0.0",
  "captureDate": "2025-09-30T12:34:56.789Z",
  "totalScreenshots": 243,
  "components": [
    {
      "name": "CameraController",
      "path": "src/components/canvas/CameraController.tsx",
      "storyCount": 5,
      "screenshotCount": 15,
      "screenshots": ["..."]
    }
  ],
  "flows": [
    {
      "name": "navigation-flow",
      "description": "User navigates through all sections",
      "steps": 8,
      "screenshotCount": 24
    }
  ],
  "coverage": {
    "componentsCovered": 32,
    "componentsTotal": 45,
    "coveragePercentage": 71.1
  }
}
```

---

## 5. Execution & Reporting

### 5.1 CLI Commands

```bash
# Install dependencies
npm install

# Start Storybook (required for component capture)
npm run storybook

# Capture all component screenshots
npm run capture:components

# Capture specific component
npm run capture:component CameraController

# Capture user flows
npm run capture:flows

# Capture specific flow
npm run capture:flow navigation

# Capture all (components + flows)
npm run capture:all

# Generate analysis report
npm run capture:analyze

# Clean screenshot output
npm run capture:clean
```

### 5.2 Script Definitions (package.json)

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",

    "capture:components": "playwright test tests/screenshots/scripts/capture-components.ts",
    "capture:component": "playwright test tests/screenshots/scripts/capture-components.ts --grep",
    "capture:flows": "playwright test tests/screenshots/flows/ --config playwright.config.screenshots.ts",
    "capture:flow": "playwright test tests/screenshots/flows/ --grep",
    "capture:all": "npm run capture:components && npm run capture:flows",
    "capture:analyze": "tsx tests/screenshots/scripts/generate-report.ts",
    "capture:clean": "rm -rf tests/screenshots/output/*"
  }
}
```

### 5.3 Reporting

**Console Output:**
```
🎨 Screenshot Capture Framework v1.0.0
=====================================

📸 Capturing Components...
  ✓ CameraController (5 variants × 3 viewports) ... 15 screenshots
  ✓ LightboxCanvas (3 variants × 3 viewports) ... 9 screenshots
  ✓ BackgroundEffects (2 variants × 3 viewports) ... 6 screenshots
  ...

📊 Component Capture Summary:
  • Total Components: 32
  • Total Screenshots: 243
  • Duration: 2m 34s
  • Output: tests/screenshots/output/components/

🎬 Capturing User Flows...
  ✓ navigation-flow (8 steps × 3 viewports) ... 24 screenshots
  ✓ canvas-flow (6 steps × 3 viewports) ... 18 screenshots
  ...

📊 Flow Capture Summary:
  • Total Flows: 4
  • Total Screenshots: 72
  • Duration: 1m 18s
  • Output: tests/screenshots/output/flows/

✅ Capture Complete!
  📁 Output Directory: tests/screenshots/output/
  📄 Manifest: tests/screenshots/output/metadata/capture-manifest.json
  🤖 Ready for AI analysis
```

**HTML Report:**
- Visual grid of all screenshots
- Filterable by component, viewport, state
- Side-by-side comparison view
- Click to view metadata
- Export to ZIP for sharing

---

## 6. Extensibility & Maintainability

### 6.1 Adding New Components

**Automatic Discovery:**
1. Create component: `src/components/foo/Bar.tsx`
2. Create story: `src/components/foo/Bar.stories.tsx`
3. Run `npm run capture:components`
4. Framework auto-discovers and captures

**Manual Configuration:**
```typescript
// tests/screenshots/config/capture.config.ts
export const manualComponents = [
  {
    name: 'CustomComponent',
    path: 'src/components/custom/CustomComponent.tsx',
    storyPath: 'src/components/custom/CustomComponent.stories.tsx',
    variants: ['default', 'dark', 'compact'],
    viewports: ['desktop', 'mobile']
  }
];
```

### 6.2 Adding New User Flows

1. Create flow spec: `tests/screenshots/flows/new-flow.spec.ts`
2. Define flow steps using `captureFlowStep()` helper
3. Run `npm run capture:flow new-flow`

**Example Flow:**
```typescript
// tests/screenshots/flows/new-flow.spec.ts
import { test } from '@playwright/test';
import { captureFlowStep } from '../utils/screenshot-helpers';

test.describe('New User Flow', () => {
  test('should complete new interaction', async ({ page }) => {
    await page.goto('/');

    await captureFlowStep(page, 'new-flow', {
      step: 1,
      description: 'Initial state',
      action: 'Page load'
    });

    await page.click('[data-testid="some-button"]');

    await captureFlowStep(page, 'new-flow', {
      step: 2,
      description: 'After button click',
      action: 'Clicked some-button'
    });
  });
});
```

### 6.3 Viewport Management

**Centralized Configuration:**
```typescript
// tests/screenshots/config/viewports.ts
export const viewports = {
  desktop: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2
  },
  tablet: {
    width: 768,
    height: 1024,
    deviceScaleFactor: 2
  },
  mobile: {
    width: 375,
    height: 667,
    deviceScaleFactor: 3
  },
  // Easy to add new viewports
  '4k': {
    width: 3840,
    height: 2160,
    deviceScaleFactor: 2
  }
};
```

### 6.4 Version Control Strategy

**Git Tracking:**
- ✅ Track: `tests/screenshots/` (framework code)
- ✅ Track: `.storybook/` (configuration)
- ✅ Track: `*.stories.tsx` (component stories)
- ❌ Ignore: `tests/screenshots/output/` (generated screenshots)
- ✅ Track: `tests/screenshots/output/metadata/capture-manifest.json` (for diffing)

**Rationale:** Screenshots are artifacts, not source code. Manifest enables version tracking without bloating repo.

---

## 7. Integration with Existing Infrastructure

### 7.1 Playwright Integration
- Extends existing `playwright.config.ts`
- Reuses global setup/teardown
- Shares viewport configurations
- Compatible with existing E2E tests

### 7.2 Vitest Integration
- No conflicts with existing Vitest setup
- Storybook runs on different port (6006 vs 3000)
- Can run simultaneously with `npm run dev`

### 7.3 CI/CD Integration

**GitHub Actions Workflow:**
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
      - run: npx playwright install --with-deps
      - run: npm run capture:all
      - uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: tests/screenshots/output/
```

---

## 8. AI Analysis Workflow

### 8.1 Preparing for Claude Desktop Analysis

1. **Export Screenshots + Metadata:**
   ```bash
   npm run capture:analyze -- --export
   # Creates: nino-chavez-portfolio-screenshots-2025-09-30.zip
   ```

2. **ZIP Contents:**
   ```
   nino-chavez-portfolio-screenshots/
   ├── ANALYSIS_GUIDE.md          # Instructions for Claude
   ├── components/                # Component screenshots + metadata
   ├── flows/                     # Flow screenshots + metadata
   ├── metadata/
   │   ├── capture-manifest.json
   │   └── capture-summary.json
   └── context/
       ├── component-inventory.md # Component listing
       └── design-system.md       # Design tokens, colors, spacing
   ```

3. **Load into Claude Desktop:**
   - Drag ZIP into Claude Desktop
   - Claude reads `ANALYSIS_GUIDE.md` for instructions
   - Claude analyzes screenshots using metadata context

### 8.2 Analysis Prompts

**ANALYSIS_GUIDE.md** includes prompts like:

```markdown
# UI/UX Analysis Guide

You are analyzing screenshots from Nino Chavez's portfolio website.
This is a professional launch pad showcasing:
- Software engineering expertise
- Enterprise architecture experience
- Action sports photography

## Analysis Tasks

### 1. Accessibility Audit
Review all screenshots for:
- Proper focus indicators
- Sufficient color contrast
- ARIA label visibility
- Keyboard navigation clarity

**Reference:** See `capture-manifest.json` for component list.
**Focus On:** Components in `components/ui/` and `components/canvas/`

### 2. Visual Consistency
Check for:
- Consistent spacing patterns
- Typography hierarchy
- Color palette adherence
- Photography metaphor integrity

**Reference:** See `context/design-system.md` for token values.

### 3. Responsive Behavior
Compare desktop/tablet/mobile screenshots:
- Layout adaptation quality
- Touch target sizes (mobile)
- Content prioritization
- Performance mode variations

### 4. Interactive States
Review hover/focus/active states:
- State feedback clarity
- Transition smoothness (inferred from state diffs)
- Accessibility compliance

## Output Format

Provide findings as:
1. **High-Priority Issues:** Accessibility, broken layouts
2. **Design Opportunities:** Consistency improvements, polish
3. **Positive Observations:** What works well
4. **Specific Recommendations:** Actionable next steps
```

### 8.3 Iterative Analysis

**Workflow:**
1. Capture initial screenshots
2. Run AI analysis
3. Implement recommendations
4. Re-capture screenshots
5. Run diff analysis
6. Validate improvements

**Diff Analysis:**
```bash
npm run capture:diff -- --baseline 2025-09-30 --current 2025-10-01
# Generates visual diff report highlighting changes
```

---

## 9. Success Metrics

### 9.1 Coverage Metrics
- **Component Coverage:** 90%+ of UI components have stories
- **Viewport Coverage:** All components captured at 3+ viewports
- **State Coverage:** Interactive components have 3+ state screenshots

### 9.2 Performance Metrics
- **Capture Speed:** <5 minutes for full component capture
- **Parallel Execution:** 4+ concurrent browser instances
- **Storage Efficiency:** <500MB for complete capture set

### 9.3 Quality Metrics
- **Metadata Completeness:** 100% of screenshots have valid JSON
- **Naming Consistency:** 100% follow naming convention
- **AI Consumability:** Claude can analyze without additional context

---

## 10. Implementation Phases

### Phase 1: Foundation (Day 1)
- [ ] Install Storybook
- [ ] Configure Storybook for React 19 + Vite
- [ ] Create first 5 component stories
- [ ] Implement basic screenshot utilities

### Phase 2: Automation (Day 2)
- [ ] Build Storybook API discovery
- [ ] Implement metadata generator
- [ ] Create component capture script
- [ ] Add viewport iteration

### Phase 3: Flows (Day 3)
- [ ] Design 4 core user flows
- [ ] Implement flow capture helpers
- [ ] Create flow screenshot scripts
- [ ] Add interactive state capture

### Phase 4: Polish (Day 4)
- [ ] Generate HTML report
- [ ] Create AI analysis guide
- [ ] Add CLI progress indicators
- [ ] Optimize capture performance

### Phase 5: Integration (Day 5)
- [ ] CI/CD workflow setup
- [ ] Documentation completion
- [ ] Training for Nino
- [ ] First AI analysis run

---

## 11. Risk Mitigation

### 11.1 Storybook Compatibility
**Risk:** React 19 + Vite may have Storybook issues
**Mitigation:** Use Storybook 8.x (explicitly supports React 19)

### 11.2 Screenshot Flakiness
**Risk:** Animations cause inconsistent screenshots
**Mitigation:**
- Disable animations via `prefers-reduced-motion`
- Add stabilization delays before capture
- Use `page.waitForLoadState('networkidle')`

### 11.3 Storage Growth
**Risk:** Screenshot output grows too large
**Mitigation:**
- Compress PNGs with `sharp`
- Implement retention policy (keep last 5 captures)
- Use `.gitignore` for output directory

### 11.4 Maintenance Burden
**Risk:** Framework becomes outdated
**Mitigation:**
- Auto-discovery reduces manual configuration
- Document extension patterns clearly
- Include framework in automated tests

---

## Conclusion

This framework transforms screenshot capture from a manual, error-prone process into an autonomous, AI-optimized documentation pipeline. By treating screenshots as **programmatic visual prompts**, we enable Claude Desktop to perform sophisticated UI/UX analysis with minimal human intervention.

**Next Steps:** Proceed to Phase 1 implementation.
