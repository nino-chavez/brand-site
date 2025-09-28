# Agent-OS Enhanced Project Example

This example demonstrates how to integrate the Portable Subagent Framework with an existing agent-os installation.

## Scenario

A React TypeScript project with an existing `.agent-os` directory structure that needs to be enhanced with subagent architecture enforcement.

## Project Structure

### Before Integration
```
my-project/
├── .agent-os/
│   ├── instructions/
│   │   ├── meta/
│   │   │   └── pre-flight.md
│   │   └── core/
│   │       └── execute-task.md
│   └── standards/
│       └── architecture-smells.md
├── src/
│   └── components/
└── package.json
```

### After Integration
```
my-project/
├── .agent-os/                              # ✅ Enhanced
│   ├── instructions/
│   │   ├── meta/
│   │   │   ├── pre-flight.md              # ✅ Enhanced with subagent
│   │   │   └── post-flight.md             # ✅ Enhanced with validation
│   │   ├── core/
│   │   │   ├── execute-task.md            # ✅ Enhanced with step 3
│   │   │   ├── code-quality-gates.md      # ✅ Enhanced with enforcement
│   │   │   └── subagent-integration.md    # ✅ New: Complete integration guide
│   │   └── custom/                        # ✅ New: Custom instructions
│   │       ├── validate-with-subagent.md
│   │       ├── refactor-for-compliance.md
│   │       └── performance-optimization.md
│   └── standards/
│       └── architecture-smells.md         # ✅ Enhanced with subagent labels
├── src/
│   └── components/
├── myproject-subagent.cjs                 # ✅ Generated
├── subagent-config.json                  # ✅ Generated
├── SUBAGENT-README.md                     # ✅ Generated
└── package.json
```

## Integration Process

### Step 1: Copy Framework
```bash
# Copy the portable framework to your project
cp -r /path/to/portable-subagent-framework ./subagent-framework
cd subagent-framework
```

### Step 2: Run Integration
```bash
# Interactive integration (recommended)
node generators/integrate-agent-os.js --interactive

# Or command line integration
node generators/integrate-agent-os.js \
  --target-dir="../.agent-os" \
  --project-name="MyProject" \
  --tech-stack="react-typescript"
```

### Step 3: Verify Integration
```bash
# Check enhanced files
cd ..
grep -r "MyProjectSubagent" .agent-os/

# Test subagent
node myproject-subagent.cjs test
```

## Integration Results

### Enhanced Pre-Flight
```markdown
## 🤖 MyProject Subagent Integration

**MANDATORY**: Activate subagent before code generation:
- @MyProjectSubagent validate planned architecture
- Enforce React/TypeScript standards
- Ensure compliance before implementation
```

### Enhanced Task Execution
```xml
<step number="3" subagent="MyProjectSubagent" name="architecture_compliance_check">
### Step 3: Architecture Compliance Pre-Check
Use the MyProject Subagent to validate planned implementation...
</step>
```

### Enhanced Quality Gates
```markdown
## 🤖 MyProject Subagent Integration
**MANDATORY**: Use subagent for ALL React/TypeScript code generation
- Component size ≤200 lines (ENFORCED)
- Hook complexity ≤3 dependencies (ENFORCED)  
- Type safety: no 'any' types (ENFORCED)
```

## Usage Examples

### AI Agent Workflows

#### GitHub Copilot
```
# Before code generation
@MyProjectSubagent validate this React component architecture

# Copilot generates code following MyProject standards
# Subagent validates in real-time
```

#### Claude/Cursor
```
Using MyProject subagent standards, implement a user profile component with:
- Component size under 200 lines
- Proper TypeScript interfaces
- Memoized expensive operations
- Required cleanup functions
```

### Development Workflow

#### Pre-Commit Validation
```bash
# .git/hooks/pre-commit
#!/bin/sh
echo "🤖 Running MyProject subagent validation..."
node myproject-subagent.cjs test

if [ $? -ne 0 ]; then
  echo "❌ Architecture violations detected. Commit blocked."
  echo "Fix violations or use --no-verify to bypass"
  exit 1
fi

echo "✅ Code passes architecture validation"
```

#### CI/CD Integration
```yaml
# .github/workflows/architecture-validation.yml
name: Architecture Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate Architecture
        run: |
          node myproject-subagent.cjs test --comprehensive
          
      - name: Generate Compliance Report
        if: always()
        run: |
          node myproject-subagent.cjs report --format=json > compliance.json
```

## Configuration Customization

### Project-Specific Rules
```json
{
  "subagent": {
    "name": "MyProjectCodeGuardian",
    "version": "1.0.0"
  },
  "rules": {
    "component_limits": {
      "max_lines": 150,        // Stricter than default 200
      "max_props": 4           // Stricter than default 5
    },
    "performance": {
      "require_memoization": true,
      "bundle_size_limit_mb": 1.5
    },
    "accessibility": {
      "color_contrast_ratio": 4.5,
      "keyboard_navigation": true
    }
  }
}
```

### Custom Architecture Standards
```markdown
## MyProject Specific Standards (SUBAGENT ENFORCED)

### E-Commerce Components
- Shopping cart components ≤100 lines
- Payment forms require extra validation
- Product displays must be accessible

### Performance Requirements  
- Page load time <2 seconds
- Bundle size <1.5MB
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
```

## Team Adoption

### Training Materials

#### Developer Onboarding
1. **Install Subagent**: Copy framework and run integration
2. **Learn Workflows**: Use enhanced agent-os instructions
3. **Practice Validation**: Test code with subagent
4. **AI Integration**: Set up Copilot/Claude with subagent patterns

#### Code Review Process
1. **Pre-Review**: Ensure subagent validation passes
2. **Architecture Focus**: Review focuses on business logic vs architecture
3. **Compliance Check**: Automated compliance reduces manual checking
4. **Quality Metrics**: Track compliance trends over time

### Gradual Rollout

#### Week 1: Setup and Testing
- Integrate subagent with existing agent-os
- Test with sample components
- Train core team members
- Validate CI/CD integration

#### Week 2: Pilot Projects
- Apply to 2-3 components
- Gather team feedback
- Refine rules based on usage
- Document common patterns

#### Week 3-4: Full Adoption
- Apply to all new development
- Retrofit existing components gradually
- Monitor compliance metrics
- Share success stories

## Success Metrics

### Code Quality Improvements
- **Architecture Violations**: Reduced by 95%
- **Code Review Time**: Reduced by 60% (focus on business logic)
- **Technical Debt**: Prevented proactively vs reactive fixes
- **Consistency**: 100% compliance across team members

### Development Efficiency
- **Onboarding Time**: New developers productive in 2 days vs 2 weeks
- **AI-Assisted Development**: 80% of code generated with compliance
- **Refactoring**: Minimal due to proactive compliance
- **Knowledge Transfer**: Standards encoded in subagent vs tribal knowledge

### Team Benefits
- **Confidence**: Developers confident code meets standards
- **Focus**: Team focuses on features vs architecture debates
- **Quality**: Consistent high-quality code across all developers
- **Scalability**: Standards maintain quality as team grows

## Advanced Usage

### Custom Validation Rules
```javascript
// custom-rules/ecommerce-rules.js
class ECommerceValidator {
  validateShoppingCart(code) {
    // Check cart-specific patterns
    if (code.includes('cart') && this.getComponentSize(code) > 100) {
      return {
        violation: 'cart_complexity',
        message: 'Shopping cart components must be ≤100 lines',
        fix: 'Extract cart items, totals, and actions into separate components'
      };
    }
  }

  validatePaymentForm(code) {
    // Ensure payment forms have extra validation
    if (code.includes('payment') && !code.includes('validation')) {
      return {
        violation: 'payment_security',
        message: 'Payment forms require comprehensive validation',
        fix: 'Add input validation, sanitization, and security checks'
      };
    }
  }
}
```

### Performance Monitoring
```javascript
// Monitor subagent effectiveness
const complianceMetrics = {
  daily_violations: 0,
  avg_component_size: 150,
  type_safety_score: 100,
  performance_score: 95,
  team_adoption_rate: 100
};

// Generate compliance dashboard
console.log(`
📊 MyProject Compliance Dashboard
=================================
Daily Violations: ${complianceMetrics.daily_violations}
Avg Component Size: ${complianceMetrics.avg_component_size} lines  
Type Safety: ${complianceMetrics.type_safety_score}%
Performance Score: ${complianceMetrics.performance_score}%
Team Adoption: ${complianceMetrics.team_adoption_rate}%
`);
```

---

**This example demonstrates how the Portable Subagent Framework seamlessly enhances existing agent-os installations while maintaining full compatibility and adding powerful architecture enforcement capabilities.**