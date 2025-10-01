# Runtime Error Detection Framework

This directory contains the autonomous runtime error detection testing framework.

## Documentation

For complete documentation, please see:

- **[Developer Guide](../../docs/developer/testing/runtime-error-detection.md)** - Setup, usage, and configuration
- **[API Reference](../../docs/components/testing/runtime-error-detection-api.md)** - Complete API documentation
- **[Technical Specification](../../docs/developer/testing/runtime-error-detection-spec.md)** - Architecture and design
- **[Showcase Documentation](../../docs/showcase/testing-framework.md)** - Portfolio presentation

## Quick Start

```bash
# Run all tests
npm run test:runtime-errors

# Run specific scenario
npm run test:runtime-errors -- --scenario=contextProviders

# Debug mode
npm run test:runtime-errors -- --headless=false --video=true
```

## Directory Structure

```
test/runtime-error-detection/
├── core/
│   └── ErrorCapture.ts          # Error interception engine
├── runner/
│   └── PlaywrightRunner.ts      # Browser automation
├── scenarios/
│   ├── ContextProviderScenarios.ts
│   ├── NullSafetyScenarios.ts
│   ├── ReactLifecycleScenarios.ts
│   ├── AsyncErrorScenarios.ts
│   ├── DOMManipulationScenarios.ts
│   ├── TypeCoercionScenarios.ts
│   └── BrowserCompatibilityScenarios.ts
└── index.ts                     # Main entry point
```

---

**Version:** 1.0.0
**Last Updated:** 2025-09-30
