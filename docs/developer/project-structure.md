# Project Structure

Last Updated: 2025-09-30

## Overview

This document describes the organization of Nino Chavez's portfolio website codebase following the Phase 2 reorganization that consolidated all source files into a feature-based structure under `src/`.

## Directory Structure

```
nino-chavez-site/
├── .agent-os/              # Agent OS workflow documentation
├── .claude/                # Claude Code workflows and scripts
│   ├── agents/            # Specialized agent specifications
│   ├── scripts/           # Validation and decision logging scripts
│   └── workflows/         # Development workflow documentation
├── ai/                    # AI prompt templates
│   └── ai-prompts/
│       └── claude/        # Claude-specific prompts
├── components/            # Legacy components (pre-refactor)
│   ├── sections/          # Photography workflow sections
│   └── viewfinder/        # Viewfinder sub-components
├── docs/                  # Project documentation
│   ├── showcase/          # End-user facing documentation (future Docusaurus)
│   ├── developer/         # Developer reference and guides
│   ├── components/        # Component and API documentation
│   ├── archive/           # Historical documents and assessments
│   └── prompts/           # AI prompt templates
├── src/                   # ⭐ Main source directory
│   ├── components/        # React components (feature-based organization)
│   │   ├── canvas/       # 3D canvas system (4 files)
│   │   ├── content/      # Content adapters (5 files)
│   │   ├── effects/      # Visual effects (5 files)
│   │   ├── layout/       # Page sections (15 files)
│   │   ├── sports/       # Sports demo components (18 files)
│   │   └── ui/           # Reusable UI components (10 files)
│   ├── analytics/         # User analytics and monitoring
│   ├── constants/         # Application constants
│   ├── contexts/          # React contexts (3 providers)
│   ├── hooks/             # Custom React hooks (26 hooks)
│   ├── monitoring/        # Performance monitoring configs
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript type definitions (12 files)
│   └── utils/             # Utility functions (26 files)
├── test/                  # ⭐ Consolidated test directory
│   ├── e2e/              # End-to-end tests (Playwright)
│   │   ├── canvas/       # Canvas system e2e tests (5 files)
│   │   ├── gallery/      # Gallery e2e tests (4 files)
│   │   └── utils/        # Test utilities
│   └── __tests__/        # Unit tests (Vitest)
│       └── components/   # Component tests (mirrors src structure)
├── tokens/                # Design token system
├── AGENTS.md             # Agents.md standard file
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
└── README.md             # Project README

```

## Source Organization

### Component Organization

Components are organized by feature/purpose rather than file type:

- **canvas/** - 3D canvas navigation system
  - `CameraController.tsx` - Camera movement and controls
  - `EnhancedCameraController.tsx` - Advanced camera features
  - `LightboxCanvas.tsx` - Main canvas container
  - `CursorLens.tsx` - Cursor-based navigation

- **content/** - Progressive content disclosure
  - Content adapters for About, Skills, Experience, Projects sections
  - `ProgressiveContentRenderer.tsx` - Content rendering strategy

- **effects/** - Visual effects and transitions
  - Background effects, morphing transitions, shutter effects
  - Spotlight cursor, visual continuity system

- **layout/** - Page structure and sections
  - Hero section, header, navigation
  - Main content sections (About, Work, Gallery, Contact, Insights)
  - Viewfinder overlay system

- **sports/** - Sports demo components
  - Volleyball timing demo
  - Court visualizations, scoreboard, HUD elements
  - Split-screen manager, viewport components

- **ui/** - Reusable UI components
  - Navigation controls, icons, floating nav
  - Performance monitor, blur containers
  - EXIF metadata display, image carousel

### Path Aliases

The project uses path aliases for cleaner imports:

```typescript
@/           → ./src/
@components/ → ./src/components/
@hooks/      → ./src/hooks/
@types/      → ./src/types/
@utils/      → ./src/utils/
@contexts/   → ./src/contexts/
@services/   → ./src/services/
@constants/  → ./src/constants/
@analytics/  → ./src/analytics/
@monitoring/ → ./src/monitoring/
@tokens/     → ./tokens/
```

**Usage example:**
```typescript
// Before
import { useMouseTracking } from '../../../hooks/useMouseTracking';

// After
import { useMouseTracking } from '@hooks/useMouseTracking';
```

## Test Organization

Tests are organized by test type:

- **test/e2e/** - End-to-end tests using Playwright
  - Organized by feature (canvas, gallery)
  - Includes global setup/teardown
  - Test utilities and helpers

- **test/__tests__/** - Unit tests using Vitest
  - Mirrors src/ structure
  - Co-located with tested components

## Legacy Structure

Some components remain outside `src/` for backward compatibility:

- **components/sections/** - Photography workflow sections (6 files)
- **components/viewfinder/** - Viewfinder sub-components (4 files)

These will be migrated in a future phase.

## Build Configuration

### Vite Bundle Splitting

The project uses manual chunk splitting for optimal loading:

- **react-vendor** - React core dependencies (~183 KB)
- **canvas-system** - Canvas and 3D components (~77 KB)
- **ui** - UI framework components (~69 KB)
- **hero-viewfinder** - Hero section components (~20 KB)
- **sports** - Sports demo components (~19 KB)
- **canvas-utils** - Canvas utilities (~13 KB)
- **vendor** - Other dependencies (~2 KB)

Total bundle size: ~491 KB (gzipped: ~127 KB)

## Migration Notes

### Phase 2 Reorganization (2025-09-30)

The project underwent a major reorganization:

1. **Phase 1**: Cleaned root directory
   - Moved assessment docs to `docs/archive/project-status/`
   - Removed backup files
   - Preserved AGENTS.md at root

2. **Phase 2**: Consolidated to src/
   - Moved 57 components to feature-based directories
   - Consolidated all utilities, hooks, types to src/
   - Updated 80+ import statements

3. **Phase 3**: Added path aliases
   - Configured 11 path aliases in vite.config.ts and tsconfig.json

4. **Phase 4**: Consolidated tests
   - Merged tests/e2e/ and test/e2e/
   - Moved component tests to test/__tests__/

### Breaking Changes

None. All imports were updated during migration.

## Standards

### Import Conventions

1. **Prefer path aliases** for src/ imports:
   ```typescript
   import { Component } from '@components/layout/Component';
   ```

2. **Use relative paths** for sibling imports:
   ```typescript
   import { helper } from './helper';
   ```

3. **Legacy components** still use relative paths:
   ```typescript
   import { Section } from '../../../src/components/layout/Section';
   ```

### Component Placement

When adding new components:

1. Identify the feature domain (canvas, content, effects, layout, sports, ui)
2. Place in appropriate `src/components/{domain}/` directory
3. Add tests to `test/__tests__/components/{domain}/`
4. Use path aliases for imports

## Additional Documentation

- `.claude/CLAUDE.md` - Claude collaboration guide
- `.agent-os/config.yml` - Agent OS workflow configuration
- `docs/archive/` - Historical documents and assessments
- `docs/showcase/` - AI collaboration showcase documentation
- `docs/components/` - Component and API reference
- `.claude/workflows/` - Development workflow guides

## Maintenance

This structure follows React/Vite best practices and should be maintained as:

- All new source files in `src/`
- Feature-based component organization
- Tests mirror src/ structure
- Path aliases for cleaner imports
- Documentation kept up-to-date

---

*Last reorganization: 2025-09-30 (Phase 2 consolidation)*