# Agent-OS Integration Guide

Complete guide for integrating the Portable Subagent Framework with existing agent-os installations.

## Overview

This guide shows how to enhance existing agent-os installations with portable subagent capabilities while maintaining full compatibility and portability.

## What is Agent-OS?

Agent-OS is a structured approach to organizing AI agent instructions and workflows. It typically includes:

- **Instructions**: Step-by-step processes for AI agents
- **Standards**: Code quality and architecture guidelines  
- **Templates**: Reusable patterns and examples
- **Workflows**: Task execution and validation processes

## Integration Benefits

### Enhanced Architecture Enforcement
- **Real-time Validation**: Continuous code quality checking
- **Automatic Rejection**: Non-compliant code blocked immediately
- **AI-Integrated Standards**: Architecture rules embedded in AI workflows

### Seamless Workflow Integration
- **Pre-flight Enhancement**: Subagent activation in workflow preparation
- **Task Execution**: Validation steps integrated into development processes
- **Post-flight Verification**: Final compliance checking before completion

### Maintains Portability
- **Non-invasive**: Enhances existing agent-os without breaking changes
- **Reversible**: Can be easily removed or updated
- **Self-contained**: All subagent functionality in dedicated files

## Quick Integration

### Automatic Integration (Recommended)
```bash
# Navigate to your project with existing .agent-os
cd /path/to/your/project

# Copy the portable framework
cp -r /path/to/portable-subagent-framework ./subagent-framework

# Run automatic integration
cd subagent-framework
node generators/integrate-agent-os.js --interactive
```

### Manual Integration
```bash
# Generate subagent for your project
node generators/create-subagent.js \
  --tech-stack=react-typescript \
  --project-name="YourProject"

# Integrate with existing agent-os
node generators/integrate-agent-os.js \
  --target-dir="../.agent-os" \
  --project-name="YourProject" \
  --tech-stack=react-typescript
```

## Integration Points

### 1. Pre-Flight Instructions
**File**: `.agent-os/instructions/meta/pre-flight.md`

**Enhancement**: Adds mandatory subagent activation requirements before any code generation.

```markdown
## 🤖 YourProject Subagent Integration

**MANDATORY**: Activate subagent before code generation:
- @YourProjectSubagent validate planned architecture
- Enforce project-specific standards
- Ensure compliance before implementation
```

### 2. Task Execution Workflow  
**File**: `.agent-os/instructions/core/execute-task.md`

**Enhancement**: Integrates subagent validation as Step 3 in task execution.

```xml
<step number="3" subagent="YourProjectSubagent" name="architecture_compliance_check">
### Step 3: Architecture Compliance Pre-Check
Use the YourProject Subagent to validate planned implementation...
</step>
```

### 3. Post-Flight Verification
**File**: `.agent-os/instructions/meta/post-flight.md`

**Enhancement**: Adds final subagent validation before task completion.

```bash
# Final validation
node yourproject-subagent.cjs test --comprehensive
if [ $? -ne 0 ]; then
  echo "❌ Task cannot be marked complete until violations are fixed"
  exit 1
fi
```

### 4. Code Quality Gates
**File**: `.agent-os/instructions/core/code-quality-gates.md`

**Enhancement**: Integrates subagent enforcement into quality checking process.

```markdown
## 🤖 YourProject Subagent Integration
**MANDATORY**: Use subagent for ALL code generation validation
- Real-time violation detection
- Automatic non-compliant code rejection
```

### 5. Architecture Standards
**File**: `.agent-os/standards/architecture-smells.md`

**Enhancement**: Updates architecture standards with subagent enforcement labels.

```markdown
### 🔴 CRITICAL VIOLATIONS (SUBAGENT ENFORCED)
- Component size >200 lines = AUTOMATIC REJECTION
- Hook complexity >3 deps = AUTOMATIC REJECTION
```

## Integration Process

### Phase 1: Detection and Backup
1. **Detect Agent-OS**: Automatically finds `.agent-os` directory
2. **Validate Structure**: Ensures valid agent-os installation
3. **Create Backup**: Preserves original files before modification
4. **Generate Subagent**: Creates project-specific subagent

### Phase 2: Enhancement Integration
1. **Pre-flight Enhancement**: Adds subagent activation requirements
2. **Task Workflow Integration**: Inserts validation steps
3. **Quality Gates Enhancement**: Integrates enforcement rules
4. **Standards Update**: Labels existing standards with subagent enforcement

### Phase 3: Custom Instructions
1. **Subagent Integration Guide**: Comprehensive usage instructions
2. **Custom Validation Steps**: Project-specific validation processes
3. **Refactoring Patterns**: Common compliance fixes
4. **Performance Optimization**: Enhancement guidelines

## Example Integration

### Before Integration
```
.agent-os/
├── instructions/
│   ├── meta/pre-flight.md
│   └── core/execute-task.md
└── standards/
    └── architecture-smells.md
```

### After Integration
```
.agent-os/
├── instructions/
│   ├── meta/
│   │   ├── pre-flight.md                    # ✅ Enhanced
│   │   └── post-flight.md                   # ✅ Enhanced
│   ├── core/
│   │   ├── execute-task.md                  # ✅ Enhanced
│   │   ├── code-quality-gates.md            # ✅ Enhanced
│   │   └── subagent-integration.md          # ✅ Added
│   └── custom/                              # ✅ Added
│       ├── validate-with-subagent.md
│       ├── refactor-for-compliance.md
│       └── performance-optimization.md
└── standards/
    └── architecture-smells.md               # ✅ Enhanced

yourproject-subagent.cjs                     # ✅ Generated
subagent-config.json                         # ✅ Generated
SUBAGENT-README.md                           # ✅ Generated
```

## Tech Stack Specific Integration

### React/TypeScript Projects
```bash
node generators/integrate-agent-os.js \
  --tech-stack=react-typescript \
  --project-name="MyReactApp" \
  --target-dir=".agent-os"
```

**Adds**:
- Component size validation (≤200 lines)
- Hook complexity checking (≤3 useEffect deps)
- TypeScript safety enforcement (no `any` types)
- Performance optimization requirements
- Agent-native capability patterns

### Python FastAPI Projects  
```bash
node generators/integrate-agent-os.js \
  --tech-stack=python-fastapi \
  --project-name="MyMLService" \
  --target-dir=".agent-os"
```

**Adds**:
- Function complexity validation (≤50 lines)
- Type hint requirements (all params/returns)
- Async pattern enforcement
- Performance optimization checks
- Security validation patterns

### Generic Projects
```bash
node generators/integrate-agent-os.js \
  --tech-stack=generic \
  --project-name="MyProject" \
  --target-dir=".agent-os"
```

**Adds**:
- Universal code quality standards
- Language-agnostic architecture rules
- Performance and maintainability checks
- Documentation requirements
- Security best practices

## Integration Options

### Interactive Mode
```bash
node generators/integrate-agent-os.js --interactive
```

**Prompts for**:
- Agent-OS directory location
- Project name and tech stack
- Integration points to enhance
- Enhancement options to include
- Backup and dry-run preferences

### Command Line Mode
```bash
node generators/integrate-agent-os.js \
  --target-dir=".agent-os" \
  --project-name="MyProject" \
  --tech-stack="react-typescript" \
  --backup \
  --dry-run
```

### Configuration File Mode
```bash
# Create integration-config.json
{
  "targetDir": ".agent-os",
  "projectName": "MyProject", 
  "techStack": "react-typescript",
  "integrationPoints": ["pre-flight", "execute-task", "post-flight"],
  "enhancementOptions": ["subagent-steps", "custom-instructions"]
}

node generators/integrate-agent-os.js --config-file=integration-config.json
```

## Validation and Testing

### Dry Run Mode
```bash
# See what would be changed without modifying files
node generators/integrate-agent-os.js --dry-run --interactive
```

Output shows:
- Files that would be enhanced
- Content that would be added
- New files that would be created
- Backup locations

### Integration Validation
```bash
# After integration, test the enhanced workflow
cd .agent-os

# Verify subagent activation
grep -r "YourProjectSubagent" instructions/

# Test subagent functionality
cd ..
node yourproject-subagent.cjs test
```

### Rollback Process
```bash
# If backup was created during integration
ls -la .agent-os.backup.*

# Rollback if needed
rm -rf .agent-os
mv .agent-os.backup.1640995200000 .agent-os
```

## Advanced Integration

### Custom Integration Points
```javascript
// Custom integration script
const integrator = new AgentOSIntegrator();

await integrator.enhanceCustomFile('.agent-os/my-custom-instructions.md', {
  projectName: 'MyProject',
  customEnhancements: [
    'add-subagent-validation',
    'integrate-performance-checks',
    'add-compliance-reporting'
  ]
});
```

### Organization-Wide Integration
```bash
# Create organization template with agent-os integration
cp -r portable-subagent-framework acme-corp-standards
cd acme-corp-standards

# Configure for organization agent-os pattern
node generators/integrate-agent-os.js \
  --organization="ACME Corp" \
  --template-mode \
  --output-dir="agent-os-templates"

# Teams can then integrate using organization template
node generators/integrate-agent-os.js \
  --template="acme-corp-standards/agent-os-templates" \
  --target-dir=".agent-os"
```

### CI/CD Integration
```yaml
# .github/workflows/agent-os-compliance.yml
name: Agent-OS Subagent Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate Agent-OS Integration
        run: |
          # Check if agent-os is properly enhanced
          if ! grep -q "Subagent" .agent-os/instructions/meta/pre-flight.md; then
            echo "❌ Agent-OS not enhanced with subagent"
            exit 1
          fi
          
      - name: Run Subagent Validation
        run: |
          node *-subagent.cjs test --comprehensive
```

## Troubleshooting

### Common Issues

1. **Agent-OS Not Found**
```bash
Error: Agent-OS directory not found: .agent-os

# Solution: Specify correct path
node generators/integrate-agent-os.js --target-dir="path/to/.agent-os"
```

2. **Files Already Enhanced**
```bash
Warning: Pre-flight already enhanced

# Solution: Normal - integration is idempotent
# Re-run will not duplicate enhancements
```

3. **Permission Denied**
```bash
Error: EACCES: permission denied, open '.agent-os/instructions/meta/pre-flight.md'

# Solution: Check file permissions
chmod +w .agent-os/instructions/meta/pre-flight.md
```

### Recovery Options

1. **Restore from Backup**
```bash
# Find backup
ls -la .agent-os.backup.*

# Restore
rm -rf .agent-os
mv .agent-os.backup.1640995200000 .agent-os
```

2. **Selective Rollback**
```bash
# Restore specific file from backup
cp .agent-os.backup.1640995200000/instructions/meta/pre-flight.md \
   .agent-os/instructions/meta/pre-flight.md
```

3. **Clean Integration**
```bash
# Remove all enhancements and start over
git checkout -- .agent-os/
node generators/integrate-agent-os.js --interactive
```

## Best Practices

### Integration Planning
1. **Backup First**: Always create backups before integration
2. **Dry Run**: Test integration with `--dry-run` flag first
3. **Incremental**: Start with basic integration points
4. **Validate**: Test enhanced workflows thoroughly

### Team Adoption
1. **Documentation**: Update team docs with new workflows
2. **Training**: Show team how to use enhanced agent-os
3. **Gradual Rollout**: Integrate one project at a time
4. **Feedback**: Gather team feedback and iterate

### Maintenance
1. **Regular Updates**: Keep subagent framework updated
2. **Monitor Compliance**: Track architecture violation trends
3. **Refine Standards**: Adjust rules based on project evolution
4. **Share Learnings**: Document successful patterns

---

**The integration maintains full portability while providing seamless enhancement of existing agent-os workflows with proven architecture enforcement capabilities.**