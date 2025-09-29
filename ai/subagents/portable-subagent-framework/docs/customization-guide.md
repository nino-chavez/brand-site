# Customization Guide - Portable Subagent Framework

Learn how to customize the framework for your specific project needs, tech stack, and organizational standards.

## Overview

The Portable Subagent Framework is designed to be highly customizable. You can:
- Adjust existing rules and thresholds
- Create custom validation rules
- Add new tech stack templates  
- Integrate with existing development workflows
- Define organization-wide standards

## Configuration Levels

### 1. Project Configuration (`subagent-config.json`)
Project-specific settings that override template defaults:

```json
{
  "subagent": {
    "name": "MyProjectCodeGuardian",
    "version": "1.0.0",
    "organization": "MyCompany"
  },
  "project_context": {
    "name": "MyProject", 
    "type": "react-typescript",
    "standards": ["clean-architecture", "performance-optimized"]
  },
  "rules": {
    "component_limits": {
      "max_lines": 150,        // Stricter than default 200
      "max_props": 3           // Stricter than default 5
    }
  }
}
```

### 2. Template Configuration (`template-config.json`)
Tech stack defaults that apply to all projects using that template:

```json
{
  "default_rules": {
    "component_limits": {
      "max_lines": 200,
      "max_props": 5
    }
  },
  "quality_gates": {
    "component_render_time_ms": 100
  }
}
```

### 3. Organization Standards
Company-wide standards that can be shared across projects:

```json
{
  "organization": {
    "name": "ACME Corp",
    "coding_standards": "enterprise",
    "security_level": "high"
  },
  "mandatory_rules": {
    "security": {
      "no_hardcoded_secrets": true,
      "input_sanitization": true
    },
    "performance": {
      "bundle_size_limit_mb": 2,
      "lighthouse_score_min": 90
    }
  }
}
```

## Customizing Rules

### Adjusting Existing Rules

#### React/TypeScript Example
```json
{
  "rules": {
    "component_limits": {
      "max_lines": 120,           // Stricter limit
      "max_props": 3,             // Fewer props allowed
      "max_hooks": 3,             // Limit hook usage
      "single_responsibility": true
    },
    "hook_constraints": {
      "max_useeffect_dependencies": 2,  // Even stricter
      "require_cleanup": true,
      "prefer_custom_hooks": true       // Encourage extraction
    },
    "performance": {
      "require_memoization": true,
      "lazy_loading_threshold": 50,     // Lower threshold
      "virtualization_threshold": 75    // Custom threshold
    }
  }
}
```

#### Python FastAPI Example
```json
{
  "rules": {
    "function_limits": {
      "max_lines": 30,            // Shorter functions
      "max_parameters": 4,        // Fewer parameters
      "max_complexity": 8,        // Lower complexity
      "require_docstrings": true
    },
    "type_safety": {
      "require_type_hints": true,
      "require_return_types": true,
      "strict_optional": true     // Strict Optional handling
    }
  }
}
```

### Creating Custom Rules

#### 1. Define Rule Schema
```javascript
// custom-rules/accessibility-rules.js
const accessibilityRules = {
  name: 'accessibility',
  description: 'WCAG 2.1 compliance checks',
  rules: {
    color_contrast: {
      enabled: true,
      minimum_ratio: 4.5,
      check_all_combinations: true
    },
    keyboard_navigation: {
      enabled: true,
      require_focus_indicators: true,
      require_skip_links: true
    },
    aria_labels: {
      enabled: true,
      require_for_interactive: true,
      validate_aria_attributes: true
    }
  }
};
```

#### 2. Implement Validation Logic
```javascript
class AccessibilityValidator {
  validateColorContrast(code) {
    // Check CSS for color contrast ratios
    const colorPairs = this.extractColorPairs(code);
    return colorPairs.filter(pair => 
      this.calculateContrast(pair) < this.rules.color_contrast.minimum_ratio
    );
  }
  
  validateAriaLabels(code) {
    // Check JSX for missing ARIA labels
    const interactiveElements = this.findInteractiveElements(code);
    return interactiveElements.filter(element =>
      !this.hasAriaLabel(element) && !this.hasAriaLabelledBy(element)
    );
  }
}
```

#### 3. Register Custom Rule
```javascript
// In your subagent template
const customValidators = [
  new AccessibilityValidator(config.rules.accessibility)
];

// Add to validation pipeline
validateCode(code) {
  // Standard validation
  const results = super.validateCode(code);
  
  // Custom validation
  customValidators.forEach(validator => {
    const customResults = validator.validate(code);
    results.violations.push(...customResults.violations);
    results.warnings.push(...customResults.warnings);
  });
  
  return results;
}
```

## Creating New Tech Stack Templates

### 1. Template Structure
```
templates/my-custom-stack/
├── template-config.json      # Configuration and defaults
├── subagent-template.js      # Main subagent implementation
├── validator.js              # Custom validation logic
├── rules/                    # Rule definitions
│   ├── basic-rules.js
│   ├── performance-rules.js
│   └── security-rules.js
└── examples/                 # Usage examples
    ├── component-examples.js
    └── fix-examples.js
```

### 2. Template Configuration
```json
{
  "name": "My Custom Stack Template",
  "tech_stack": "my-custom-stack",
  "base_validator": "MyCustomValidator",
  "supported_standards": [
    "clean-code",
    "performance",
    "security"
  ],
  "default_rules": {
    "my_custom_rule": {
      "enabled": true,
      "threshold": 10
    }
  }
}
```

### 3. Custom Validator Implementation
```javascript
// templates/my-custom-stack/validator.js
const BaseValidator = require('../../core/base-validator');

class MyCustomValidator extends BaseValidator {
  validateTechStackSpecific(code, options) {
    // Implement your tech stack specific validation
    this.validateCustomPatterns(code);
    this.validateFrameworkSpecificRules(code);
    this.validatePerformancePatterns(code);
  }
  
  validateCustomPatterns(code) {
    // Your custom validation logic
    if (this.detectAntiPattern(code)) {
      this.addViolation('custom_anti_pattern', {
        message: 'Detected problematic pattern',
        severity: 'high',
        fix: 'Use recommended pattern instead'
      });
    }
  }
}
```

## Integration Patterns

### VS Code Extension Integration
```javascript
// generators/create-vscode-extension.js
const createVSCodeExtension = (config) => {
  const extensionManifest = {
    "name": `${config.projectName}-subagent`,
    "displayName": `${config.projectName} Code Guardian`,
    "description": "Real-time architecture compliance validation",
    "version": "1.0.0",
    "engines": {
      "vscode": "^1.74.0"
    },
    "activationEvents": [
      "onLanguage:typescript",
      "onLanguage:javascript"
    ],
    "contributes": {
      "commands": [
        {
          "command": "subagent.validate",
          "title": "Validate with Subagent"
        }
      ]
    }
  };
  
  // Generate extension files
  return {
    manifest: extensionManifest,
    mainScript: generateMainScript(config),
    validationProvider: generateValidationProvider(config)
  };
};
```

### Git Hooks Integration
```bash
#!/bin/sh
# .git/hooks/pre-commit
echo "🤖 Running architecture validation..."

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$')

if [ -n "$STAGED_FILES" ]; then
  for FILE in $STAGED_FILES; do
    echo "Validating $FILE..."
    node subagent.cjs validate --file="$FILE"
    
    if [ $? -ne 0 ]; then
      echo "❌ Validation failed for $FILE"
      echo "Fix the issues above or use --no-verify to skip validation"
      exit 1
    fi
  done
fi

echo "✅ All files pass validation"
```

### CI/CD Integration Templates

#### GitHub Actions
```yaml
# .github/workflows/subagent-validation.yml
name: Architecture Validation
on: 
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run subagent validation
        run: |
          node subagent.cjs test
          
      - name: Generate compliance report
        if: always()
        run: |
          node subagent.cjs report --format=json --output=compliance-report.json
          
      - name: Upload compliance report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: compliance-report
          path: compliance-report.json
```

#### Docker Integration
```dockerfile
# Dockerfile.subagent
FROM node:18-alpine

WORKDIR /app
COPY subagent.cjs package.json subagent-config.json ./

# Install dependencies if any
RUN npm install --production

# Create entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["test"]
```

## Advanced Customization

### Plugin System
```javascript
// plugins/custom-metrics.js
class CustomMetricsPlugin {
  constructor(config) {
    this.config = config;
  }
  
  process(code, results) {
    // Add custom metrics to results
    results.metrics.custom_score = this.calculateCustomScore(code);
    results.metrics.business_logic_complexity = this.measureBusinessComplexity(code);
    
    return results;
  }
}

// Register plugin in subagent
const plugins = [
  new CustomMetricsPlugin(config.plugins.custom_metrics)
];

// Apply plugins after validation
let results = this.validateCode(code);
plugins.forEach(plugin => {
  results = plugin.process(code, results);
});
```

### Rule Inheritance
```javascript
// Organization base rules
const orgBaseRules = {
  security: { /* org security rules */ },
  performance: { /* org performance rules */ }
};

// Project specific rules extend org rules
const projectRules = {
  ...orgBaseRules,
  component_limits: { /* project specific */ },
  // Override org rules where needed
  security: {
    ...orgBaseRules.security,
    custom_project_security: true
  }
};
```

### Dynamic Rule Configuration
```javascript
class DynamicRuleEngine {
  constructor(baseRules) {
    this.rules = baseRules;
    this.runtimeAdjustments = new Map();
  }
  
  adjustRuleAtRuntime(ruleId, newValue, condition) {
    if (condition()) {
      this.runtimeAdjustments.set(ruleId, newValue);
    }
  }
  
  // Example: Stricter rules for production code
  applyProductionRules() {
    this.adjustRuleAtRuntime('max_lines', 150, () => 
      process.env.NODE_ENV === 'production'
    );
  }
}
```

## Testing Your Customizations

### Unit Tests for Custom Rules
```javascript
// tests/custom-rules.test.js
const MyCustomValidator = require('../validators/my-custom-validator');

describe('Custom Validation Rules', () => {
  let validator;
  
  beforeEach(() => {
    validator = new MyCustomValidator(testConfig);
  });
  
  test('should detect custom anti-pattern', () => {
    const badCode = `
      // Code with anti-pattern
    `;
    
    const results = validator.validateCode(badCode);
    expect(results.violations).toHaveLength(1);
    expect(results.violations[0].type).toBe('custom_anti_pattern');
  });
  
  test('should pass clean code', () => {
    const goodCode = `
      // Clean code
    `;
    
    const results = validator.validateCode(goodCode);
    expect(results.isValid).toBe(true);
  });
});
```

### Integration Tests
```javascript
// tests/integration.test.js
describe('Subagent Integration', () => {
  test('should work with real project files', async () => {
    const projectFiles = await loadProjectFiles();
    
    for (const file of projectFiles) {
      const results = await subagent.validateFile(file.path);
      
      // Ensure no false positives
      expect(results.violations.filter(v => v.severity === 'critical')).toHaveLength(0);
    }
  });
});
```

## Deployment and Distribution

### NPM Package
```json
{
  "name": "@myorg/project-subagent",
  "version": "1.0.0",
  "main": "subagent.cjs",
  "bin": {
    "myproject-validate": "./subagent.cjs"
  },
  "files": [
    "subagent.cjs",
    "subagent-config.json",
    "README.md"
  ]
}
```

### Organization Template Repository
```bash
# Create organization template repo
git clone portable-subagent-framework acme-corp-standards
cd acme-corp-standards

# Customize for organization
node generators/create-organization-template.js \
  --name="ACME Corp Standards" \
  --tech-stacks="react-typescript,python-fastapi" \
  --security-level="enterprise"

# Teams can then use
git clone acme-corp-standards my-project-standards
cd my-project-standards
node generators/create-subagent.js --project-config=../project.json
```

---

**With these customization capabilities, you can adapt the framework to enforce any coding standards across any tech stack while maintaining consistency and quality.**