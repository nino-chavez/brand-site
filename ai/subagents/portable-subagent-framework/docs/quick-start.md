# Quick Start Guide - Portable Subagent Framework

Get up and running with a project-specific AI coding subagent in under 5 minutes.

## Prerequisites

- Node.js 16+ installed
- Basic familiarity with your project's tech stack
- AI coding tool (Copilot, Claude, Cursor, etc.)

## Step 1: Copy the Framework

### Option A: Copy to Your Project
```bash
# Navigate to your project root
cd /path/to/your/project

# Copy the framework
cp -r /path/to/portable-subagent-framework ./subagent-framework

# Navigate to framework directory
cd subagent-framework
```

### Option B: Standalone Setup
```bash
# Clone or copy framework to dedicated directory
git clone <framework-repo> my-project-subagent
cd my-project-subagent
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Generate Your Subagent

### Interactive Generation (Recommended)
```bash
node generators/create-subagent.js --interactive
```

You'll be prompted for:
- Project name
- Technology stack
- Standards to enforce
- Integration preferences

### Command Line Generation
```bash
# React/TypeScript project
node generators/create-subagent.js \
  --tech-stack=react-typescript \
  --project-name="MyEcommerceApp" \
  --standards="clean-architecture,performance-optimized" \
  --output-dir="../"

# Python FastAPI project  
node generators/create-subagent.js \
  --tech-stack=python-fastapi \
  --project-name="MyMLService" \
  --standards="pep8,type-hints,async-patterns" \
  --output-dir="../"
```

## Step 4: Test Your Subagent

```bash
# Navigate back to your project root
cd ..

# Test the generated subagent
node my-project-subagent.cjs test
```

You should see output like:
```
🤖 MyProjectCodeGuardian v1.0.0 - Code Inspection Results
============================================================
❌ Found 1 architecture violation(s)

1. GOD_COMPONENT: Component has 250 lines, exceeds limit of 200
   Severity: critical
   Fix: Break component into smaller, single-responsibility components
```

## Step 5: Integrate with Your AI Tools

### GitHub Copilot
Add to your prompts:
```
@MyProjectSubagent validate this component for architecture compliance
```

### Claude/Cursor
```
Using the MyProject subagent standards, implement a user profile component
```

### VS Code Settings
Add to your `.vscode/settings.json`:
```json
{
  "copilot.chat.welcomeMessage": "Remember to validate all code with @MyProjectSubagent",
  "copilot.enable": {
    "*": true,
    "subagent": true
  }
}
```

## Step 6: Integrate with Development Workflow

### Pre-commit Hook
```bash
# Create .git/hooks/pre-commit
#!/bin/sh
echo "🤖 Running subagent validation..."
node my-project-subagent.cjs validate-staged
if [ $? -ne 0 ]; then
  echo "❌ Code validation failed. Commit blocked."
  exit 1
fi
```

### Package.json Scripts
```json
{
  "scripts": {
    "validate": "node my-project-subagent.cjs test",
    "validate:fix": "node my-project-subagent.cjs test --fix",
    "pre-commit": "npm run validate"
  }
}
```

### CI/CD Integration
```yaml
# .github/workflows/code-quality.yml
name: Code Quality Check
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: node my-project-subagent.cjs test
```

## Common Usage Patterns

### Pattern 1: Real-time Development
```bash
# Watch mode for continuous validation
node my-project-subagent.cjs watch --path="src/"
```

### Pattern 2: Specific File Validation
```bash
# Validate specific files
node my-project-subagent.cjs validate --file="src/components/UserProfile.tsx"
```

### Pattern 3: Team Standards Enforcement
```bash
# Generate team configuration
node my-project-subagent.cjs generate-team-config --output=".team-standards.json"

# Apply team standards
node my-project-subagent.cjs apply-standards --config=".team-standards.json"
```

## Tech Stack Examples

### React/TypeScript
```typescript
// Your AI tool will validate against:
// - Component size limits (≤200 lines)
// - Hook complexity (≤3 useEffect dependencies)
// - Type safety (no 'any' types)
// - Performance (memoization requirements)
// - Agent-native capabilities

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  // Subagent ensures best practices
  const userData = useMemo(() => processUserData(user), [user]);
  
  return <div>{/* Clean, compliant component */}</div>;
};
```

### Python FastAPI
```python
# Your AI tool will validate against:
# - Function complexity limits
# - Type hint requirements
# - Async/await patterns
# - PEP8 compliance

async def get_user_profile(user_id: str) -> UserProfile:
    # Subagent ensures best practices
    async with get_db_session() as session:
        return await session.get(UserProfile, user_id)
```

## Customization

### Adjust Rules
Edit `subagent-config.json`:
```json
{
  "rules": {
    "component_limits": {
      "max_lines": 150,  // Stricter limit
      "max_props": 3     // Fewer props allowed
    }
  }
}
```

### Add Custom Standards
```bash
node generators/add-custom-standard.js \
  --name="accessibility" \
  --description="WCAG compliance checks"
```

## Troubleshooting

### Common Issues

1. **"Template not found" error**
   ```bash
   # Ensure you're in the framework directory
   cd subagent-framework
   ls templates/  # Should show available templates
   ```

2. **"Module not found" error**
   ```bash
   # Install dependencies
   npm install
   ```

3. **Permission denied**
   ```bash
   # Make subagent executable
   chmod +x my-project-subagent.cjs
   ```

4. **Validation always passes**
   ```bash
   # Check configuration
   node my-project-subagent.cjs config
   
   # Test with sample code
   node my-project-subagent.cjs test --sample
   ```

### Getting Help

- Check the [Customization Guide](customization-guide.md) for advanced configuration
- Review [Tech Stack Guides](tech-stack-guides/) for specific implementations
- See [Examples](../examples/) for real-world usage patterns

## Next Steps

1. **Customize Rules**: Adjust the generated configuration for your specific needs
2. **Team Adoption**: Share the subagent configuration with your team
3. **CI Integration**: Add validation to your continuous integration pipeline
4. **Monitor Metrics**: Track architecture compliance over time
5. **Extend Framework**: Add custom rules or new tech stack templates

---

**You're now ready to enforce consistent architecture standards across your entire codebase with AI assistance!**