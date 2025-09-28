#!/usr/bin/env node

/**
 * Agent-OS Integration Generator
 * 
 * Enhances existing agent-os installations with portable subagent capabilities.
 * Maintains full compatibility while adding architecture compliance enforcement.
 */

const { Command } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const chalk = require('chalk');

class AgentOSIntegrator {
  constructor() {
    this.program = new Command();
    this.setupCommands();
    this.templatesDir = path.join(__dirname, '../agent-os-templates');
  }

  setupCommands() {
    this.program
      .name('integrate-agent-os')
      .description('Integrate subagent framework with existing agent-os installation')
      .version('1.0.0')
      .option('-t, --target-dir <dir>', 'Target .agent-os directory', '.agent-os')
      .option('-p, --project-name <name>', 'Project name for subagent')
      .option('-s, --tech-stack <stack>', 'Technology stack')
      .option('-c, --config-file <file>', 'Subagent configuration file')
      .option('--backup', 'Create backup before modification', true)
      .option('--dry-run', 'Show what would be changed without modifying files')
      .option('-i, --interactive', 'Interactive mode with prompts')
      .action((options) => this.run(options));
  }

  async run(options) {
    try {
      console.log(chalk.blue('🔧 Agent-OS Subagent Integration\n'));
      
      let config;
      
      if (options.interactive) {
        config = await this.interactivePrompt(options);
      } else {
        config = await this.buildConfigFromOptions(options);
      }

      // Validate existing agent-os installation
      await this.validateAgentOS(config.targetDir);
      
      // Create backup if requested
      if (config.backup && !config.dryRun) {
        await this.createBackup(config.targetDir);
      }
      
      // Integrate subagent with agent-os
      await this.integrateSubagent(config);
      
      if (config.dryRun) {
        console.log(chalk.yellow('\n📋 Dry run complete. No files were modified.'));
      } else {
        console.log(chalk.green('\n✅ Agent-OS integration complete!'));
        console.log(chalk.yellow('\nNext steps:'));
        console.log('1. Review the enhanced agent-os instructions');
        console.log('2. Test with: node your-subagent.cjs test');
        console.log('3. Try AI integration: @YourProjectSubagent validate architecture');
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Integration failed:'), error.message);
      process.exit(1);
    }
  }

  async interactivePrompt(options) {
    // First, detect existing agent-os
    const agentOSPath = await this.detectAgentOS(options.targetDir);
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'targetDir',
        message: 'Path to .agent-os directory:',
        default: agentOSPath || '.agent-os',
        validate: input => fs.existsSync(input) || 'Directory does not exist'
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name for subagent:',
        default: this.inferProjectName(),
        validate: input => input.length > 0 || 'Project name is required'
      },
      {
        type: 'list',
        name: 'techStack',
        message: 'Select technology stack:',
        choices: [
          { name: 'React + TypeScript', value: 'react-typescript' },
          { name: 'Python + FastAPI', value: 'python-fastapi' },
          { name: 'Node.js + Express', value: 'nodejs-express' },
          { name: 'Vue + TypeScript', value: 'vue-typescript' },
          { name: 'Generic (any language)', value: 'generic' }
        ]
      },
      {
        type: 'checkbox',
        name: 'integrationPoints',
        message: 'Select agent-os integration points:',
        choices: [
          { name: 'Pre-flight instructions', value: 'pre-flight', checked: true },
          { name: 'Task execution workflow', value: 'execute-task', checked: true },
          { name: 'Post-flight validation', value: 'post-flight', checked: true },
          { name: 'Code quality gates', value: 'quality-gates', checked: true },
          { name: 'Architecture standards', value: 'architecture-smells', checked: true }
        ]
      },
      {
        type: 'checkbox',
        name: 'enhancementOptions',
        message: 'Select enhancement options:',
        choices: [
          { name: 'Subagent step integration', value: 'subagent-steps', checked: true },
          { name: 'Custom instruction templates', value: 'custom-instructions', checked: true },
          { name: 'Validation middleware', value: 'validation-middleware', checked: false },
          { name: 'Compliance reporting', value: 'compliance-reporting', checked: false }
        ]
      },
      {
        type: 'confirm',
        name: 'backup',
        message: 'Create backup before modifying agent-os files?',
        default: true
      },
      {
        type: 'confirm',
        name: 'dryRun',
        message: 'Perform dry run first (show changes without applying)?',
        default: false
      }
    ]);

    return answers;
  }

  async detectAgentOS(targetDir) {
    const possiblePaths = [
      targetDir,
      '.agent-os',
      'agent-os',
      '.agents'
    ];

    for (const dir of possiblePaths) {
      if (fs.existsSync(dir)) {
        // Check if it looks like agent-os
        const instructionsDir = path.join(dir, 'instructions');
        const standardsDir = path.join(dir, 'standards');
        
        if (fs.existsSync(instructionsDir) || fs.existsSync(standardsDir)) {
          return dir;
        }
      }
    }

    return null;
  }

  inferProjectName() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.name?.replace(/[@\/\-]/g, '') || 'MyProject';
      }
    } catch (error) {
      // Ignore errors
    }
    
    return path.basename(process.cwd()) || 'MyProject';
  }

  async buildConfigFromOptions(options) {
    const config = {
      targetDir: options.targetDir,
      projectName: options.projectName || this.inferProjectName(),
      techStack: options.techStack || 'generic',
      backup: options.backup !== false,
      dryRun: options.dryRun || false,
      integrationPoints: ['pre-flight', 'execute-task', 'post-flight', 'quality-gates', 'architecture-smells'],
      enhancementOptions: ['subagent-steps', 'custom-instructions']
    };

    if (options.configFile) {
      const configData = JSON.parse(fs.readFileSync(options.configFile, 'utf8'));
      Object.assign(config, configData);
    }

    return config;
  }

  async validateAgentOS(targetDir) {
    if (!fs.existsSync(targetDir)) {
      throw new Error(`Agent-OS directory not found: ${targetDir}`);
    }

    const instructionsDir = path.join(targetDir, 'instructions');
    const standardsDir = path.join(targetDir, 'standards');

    if (!fs.existsSync(instructionsDir) && !fs.existsSync(standardsDir)) {
      throw new Error(`Directory does not appear to be a valid agent-os installation: ${targetDir}`);
    }

    console.log(chalk.green(`✓ Valid agent-os installation detected: ${targetDir}`));
  }

  async createBackup(targetDir) {
    const backupDir = `${targetDir}.backup.${Date.now()}`;
    
    console.log(chalk.yellow(`Creating backup: ${backupDir}`));
    await fs.copy(targetDir, backupDir);
    console.log(chalk.green(`✓ Backup created: ${backupDir}`));
  }

  async integrateSubagent(config) {
    console.log(chalk.yellow('Integrating subagent with agent-os...'));

    // Generate subagent in project root
    await this.generateProjectSubagent(config);

    // Enhance agent-os instructions
    if (config.integrationPoints.includes('pre-flight')) {
      await this.enhancePreFlight(config);
    }

    if (config.integrationPoints.includes('execute-task')) {
      await this.enhanceExecuteTask(config);
    }

    if (config.integrationPoints.includes('post-flight')) {
      await this.enhancePostFlight(config);
    }

    if (config.integrationPoints.includes('quality-gates')) {
      await this.enhanceQualityGates(config);
    }

    if (config.integrationPoints.includes('architecture-smells')) {
      await this.enhanceArchitectureStandards(config);
    }

    // Add custom subagent instructions
    if (config.enhancementOptions.includes('subagent-steps')) {
      await this.addSubagentSteps(config);
    }

    if (config.enhancementOptions.includes('custom-instructions')) {
      await this.addCustomInstructions(config);
    }

    console.log(chalk.green('✓ Integration complete'));
  }

  async generateProjectSubagent(config) {
    console.log('Generating project subagent...');

    // Use the main subagent generator
    const SubagentGenerator = require('./create-subagent');
    const generator = new SubagentGenerator();

    const generatorConfig = {
      projectName: config.projectName,
      techStack: config.techStack,
      outputDir: '.',
      standards: ['clean-architecture', 'performance-optimized', 'agent-native'],
      organization: 'Development Team',
      agentOsIntegration: true
    };

    if (!config.dryRun) {
      await generator.generateSubagent(generatorConfig);
    } else {
      console.log(chalk.gray(`  Would generate: ${config.projectName.toLowerCase()}-subagent.cjs`));
    }
  }

  async enhancePreFlight(config) {
    const preFlightPath = path.join(config.targetDir, 'instructions/meta/pre-flight.md');
    
    if (!fs.existsSync(preFlightPath)) {
      console.log(chalk.yellow(`Creating pre-flight.md...`));
      await fs.ensureDir(path.dirname(preFlightPath));
    }

    const enhancement = this.generatePreFlightEnhancement(config);
    
    if (config.dryRun) {
      console.log(chalk.gray(`  Would enhance: ${preFlightPath}`));
      console.log(chalk.gray(`  Addition: Subagent activation requirements`));
      return;
    }

    let content = '';
    if (fs.existsSync(preFlightPath)) {
      content = await fs.readFile(preFlightPath, 'utf8');
    }

    // Check if already enhanced
    if (content.includes(`${config.projectName}Subagent`)) {
      console.log(chalk.yellow(`  Pre-flight already enhanced`));
      return;
    }

    // Add enhancement
    const enhancedContent = content + '\n\n' + enhancement;
    await fs.writeFile(preFlightPath, enhancedContent);
    
    console.log(chalk.green(`✓ Enhanced pre-flight.md`));
  }

  generatePreFlightEnhancement(config) {
    return `
## 🤖 ${config.projectName} Subagent Integration

**MANDATORY**: This project includes a specialized architecture compliance subagent that MUST be activated for all code generation tasks.

### Subagent Activation
\`\`\`bash
# The subagent is available at: ./${config.projectName.toLowerCase()}-subagent.cjs
# Activation keywords: @${config.projectName}Subagent, @${config.projectName}Guardian, @ArchitectureEnforcer
\`\`\`

### Pre-Code Generation Validation
BEFORE generating ANY ${config.techStack} code, you MUST:

1. **Architecture Compliance Check**: Validate planned approach against subagent standards
2. **Quality Gate Verification**: Ensure component size, complexity, and performance requirements are met
3. **Integration Requirements**: Include project-specific patterns and standards
4. **Performance Standards**: Plan for optimization and best practices

### Critical Architecture Enforcement
The subagent enforces these NON-NEGOTIABLE standards:
- **Component Size**: Maximum limits based on tech stack
- **Complexity**: Controlled complexity metrics
- **Type Safety**: Strict typing requirements
- **Memory Management**: Required cleanup and resource management
- **Performance**: Mandatory optimization patterns

### Integration Pattern
\`\`\`typescript
// When generating code, always reference the subagent:
// "Using @${config.projectName}Subagent standards for this implementation"

// Example activation in prompts:
// "@${config.projectName}Subagent validate this architecture before implementation"
\`\`\`

**FAILURE TO COMPLY**: Any code that violates subagent standards will be immediately rejected and must be refactored before proceeding.
    `.trim();
  }

  async enhanceExecuteTask(config) {
    const executeTaskPath = path.join(config.targetDir, 'instructions/core/execute-task.md');
    
    if (!fs.existsSync(executeTaskPath)) {
      console.log(chalk.yellow(`Creating execute-task.md...`));
      await fs.ensureDir(path.dirname(executeTaskPath));
    }

    if (config.dryRun) {
      console.log(chalk.gray(`  Would enhance: ${executeTaskPath}`));
      console.log(chalk.gray(`  Addition: Subagent validation steps`));
      return;
    }

    let content = await fs.readFile(executeTaskPath, 'utf8');

    // Check if already enhanced
    if (content.includes(`${config.projectName}Subagent`)) {
      console.log(chalk.yellow(`  Execute-task already enhanced`));
      return;
    }

    // Add subagent step after technical spec review
    const subagentStep = this.generateSubagentStep(config);
    
    // Insert after step 2 (technical spec review)
    const step3Pattern = /<step number="3"/;
    if (step3Pattern.test(content)) {
      // Renumber existing steps and insert subagent step
      content = content.replace(/step number="(\d+)"/g, (match, num) => {
        const stepNum = parseInt(num);
        if (stepNum >= 3) {
          return `step number="${stepNum + 1}"`;
        }
        return match;
      });
      
      // Insert subagent step as new step 3
      content = content.replace(
        /(<step number="2"[^>]*>[\s\S]*?<\/step>)/,
        `$1\n\n${subagentStep}`
      );
    } else {
      // Append if no step structure found
      content += '\n\n' + subagentStep;
    }

    await fs.writeFile(executeTaskPath, content);
    console.log(chalk.green(`✓ Enhanced execute-task.md`));
  }

  generateSubagentStep(config) {
    return `
<step number="3" subagent="${config.projectName}Subagent" name="architecture_compliance_check">

### Step 3: Architecture Compliance Pre-Check

Use the ${config.projectName} Subagent to validate the planned implementation approach against project architecture standards BEFORE starting development.

<architecture_validation>
  <pre_implementation_check>
    ANALYZE: Planned component structure and complexity
    VALIDATE: Against subagent architecture rules
    ENSURE: Project-specific compliance requirements
    VERIFY: Performance and optimization standards
  </pre_implementation_check>
</architecture_validation>

<compliance_requirements>
  <critical_limits>
    - Architecture standards specific to ${config.techStack}
    - Component/function complexity limits
    - Performance optimization requirements
    - Memory management patterns
  </critical_limits>
  <project_specific_features>
    - Project architecture patterns
    - Integration requirements
    - Performance benchmarks
    - Quality standards
  </project_specific_features>
</compliance_requirements>

<instructions>
  ACTION: Activate @${config.projectName}Subagent
  REQUEST: "Validate planned implementation approach for task: [TASK_NAME]
           - Architecture: [PLANNED_ARCHITECTURE]
           - Components: [PLANNED_COMPONENTS]
           - Integration: [PLANNED_INTEGRATION]
           - Performance: [OPTIMIZATION_PLAN]"
  PROCESS: Subagent validation results
  REFACTOR: Implementation plan if violations detected
  PROCEED: Only after achieving 100% compliance
</instructions>

</step>
    `.trim();
  }

  async enhancePostFlight(config) {
    const postFlightPath = path.join(config.targetDir, 'instructions/meta/post-flight.md');
    
    if (config.dryRun) {
      console.log(chalk.gray(`  Would enhance: ${postFlightPath}`));
      console.log(chalk.gray(`  Addition: Final subagent validation`));
      return;
    }

    let content = '';
    if (fs.existsSync(postFlightPath)) {
      content = await fs.readFile(postFlightPath, 'utf8');
    }

    // Check if already enhanced
    if (content.includes(`${config.projectName}Subagent`)) {
      console.log(chalk.yellow(`  Post-flight already enhanced`));
      return;
    }

    const enhancement = this.generatePostFlightEnhancement(config);
    content += '\n\n' + enhancement;

    await fs.writeFile(postFlightPath, content);
    console.log(chalk.green(`✓ Enhanced post-flight.md`));
  }

  generatePostFlightEnhancement(config) {
    return `
## 🤖 ${config.projectName} Subagent Final Validation

**MANDATORY**: Before completing any task that involved code generation, perform final subagent validation:

### **Architecture Compliance Check**
\`\`\`bash
echo "🤖 Running final ${config.projectName} Subagent validation..."
node ${config.projectName.toLowerCase()}-subagent.cjs test --comprehensive

if [ $? -eq 0 ]; then
  echo "✅ ARCHITECTURE COMPLIANCE: 100%"
  echo "✅ PROJECT STANDARDS: Met"
  echo "✅ PERFORMANCE REQUIREMENTS: Satisfied"
  echo "✅ INTEGRATION PATTERNS: Applied"
else
  echo "❌ SUBAGENT VALIDATION FAILED"
  echo "   Task cannot be marked complete until violations are fixed"
  exit 1
fi
\`\`\`

### **Final Verification Checklist**
- [ ] **Subagent Validation Passed**: Zero architecture violations detected
- [ ] **Component/Function Compliance**: Size and complexity within limits
- [ ] **Project Integration**: Required patterns and standards applied
- [ ] **Performance**: Optimization requirements met
- [ ] **Type Safety**: Strict typing enforced (if applicable)
- [ ] **Resource Management**: Proper cleanup and memory management

### **${config.techStack} Specific Validation**
${this.getTechStackValidation(config.techStack)}

**DO NOT mark the task as complete until subagent validation passes.**
    `.trim();
  }

  getTechStackValidation(techStack) {
    switch (techStack) {
      case 'react-typescript':
        return `- [ ] **React Patterns**: Hook usage, component composition
- [ ] **TypeScript**: Interface definitions, strict typing
- [ ] **Performance**: Memoization, cleanup functions
- [ ] **Agent Integration**: Dual-interface capabilities`;

      case 'python-fastapi':
        return `- [ ] **Python Patterns**: Function design, async usage
- [ ] **Type Hints**: Required annotations, return types
- [ ] **FastAPI**: Route design, dependency injection
- [ ] **Performance**: Database optimization, caching`;

      default:
        return `- [ ] **Code Quality**: Follows project standards
- [ ] **Architecture**: Proper separation of concerns
- [ ] **Performance**: Optimization patterns applied
- [ ] **Maintainability**: Clear, readable implementation`;
    }
  }

  async enhanceQualityGates(config) {
    const qualityGatesPath = path.join(config.targetDir, 'instructions/core/code-quality-gates.md');
    
    if (config.dryRun) {
      console.log(chalk.gray(`  Would enhance: ${qualityGatesPath}`));
      console.log(chalk.gray(`  Addition: Subagent integration requirements`));
      return;
    }

    let content = '';
    if (fs.existsSync(qualityGatesPath)) {
      content = await fs.readFile(qualityGatesPath, 'utf8');
    } else {
      await fs.ensureDir(path.dirname(qualityGatesPath));
      content = this.generateBaseQualityGates(config);
    }

    // Check if already enhanced
    if (content.includes(`${config.projectName}Subagent`)) {
      console.log(chalk.yellow(`  Quality gates already enhanced`));
      return;
    }

    const enhancement = this.generateQualityGatesEnhancement(config);
    content = enhancement + '\n\n' + content;

    await fs.writeFile(qualityGatesPath, content);
    console.log(chalk.green(`✓ Enhanced code-quality-gates.md`));
  }

  generateQualityGatesEnhancement(config) {
    return `
---
description: Code Quality Gates Enhanced with ${config.projectName} Subagent
globs:
alwaysApply: true
version: 1.1
encoding: UTF-8
---

# Code Quality Gates (SUBAGENT ENHANCED)

## 🤖 ${config.projectName} Subagent Integration

**MANDATORY**: This project uses a specialized architecture compliance subagent that MUST be activated for ALL code generation tasks.

### Subagent Activation Commands
\`\`\`bash
# Real-time validation
node ${config.projectName.toLowerCase()}-subagent.cjs test

# Integration in prompts
@${config.projectName}Subagent validate this component for architecture compliance

# Programmatic validation
const result = require('./${config.projectName.toLowerCase()}-subagent.cjs').inspect(code, { verbose: true });
\`\`\`

### Subagent Enforcement Rules
The subagent automatically enforces these standards and will **REJECT** non-compliant code:

1. **Architecture Compliance**: Automatic rejection based on project standards
2. **Complexity Limits**: Enforced limits specific to ${config.techStack}
3. **Performance Requirements**: Optimization patterns required
4. **Integration Patterns**: Project-specific patterns enforced
5. **Quality Standards**: Consistent code quality across all implementations

## Pre-Generation Checklist

Before generating any ${config.techStack} code, AI agents MUST verify compliance with these quality gates:

### **🚨 CRITICAL CHECKS - MUST PASS (ENFORCED BY SUBAGENT)**
    `.trim();
  }

  generateBaseQualityGates(config) {
    return `
## Quality Gates for ${config.techStack}

### Component/Function Design
- Single responsibility principle
- Appropriate size and complexity limits
- Clear interfaces and contracts

### Performance Standards
- Optimization patterns applied
- Resource management implemented
- Performance benchmarks met

### Integration Requirements  
- Project patterns followed
- Standards compliance verified
- Team conventions applied
    `.trim();
  }

  async enhanceArchitectureStandards(config) {
    const architecturePath = path.join(config.targetDir, 'standards/architecture-smells.md');
    
    if (config.dryRun) {
      console.log(chalk.gray(`  Would enhance: ${architecturePath}`));
      console.log(chalk.gray(`  Addition: Subagent enforcement integration`));
      return;
    }

    let content = '';
    if (fs.existsSync(architecturePath)) {
      content = await fs.readFile(architecturePath, 'utf8');
    } else {
      await fs.ensureDir(path.dirname(architecturePath));
      content = this.generateBaseArchitectureStandards(config);
    }

    // Check if already enhanced
    if (content.includes(`${config.projectName}Subagent`)) {
      console.log(chalk.yellow(`  Architecture standards already enhanced`));
      return;
    }

    const enhancement = this.generateArchitectureEnhancement(config);
    content = enhancement + '\n\n' + content;

    await fs.writeFile(architecturePath, content);
    console.log(chalk.green(`✓ Enhanced architecture-smells.md`));
  }

  generateArchitectureEnhancement(config) {
    return `
---
description: Architecture Standards Enhanced with ${config.projectName} Subagent  
globs:
alwaysApply: true
version: 1.1
encoding: UTF-8
---

# Architecture Standards (SUBAGENT ENHANCED)

## Overview

This document defines architecture standards that MUST be followed for ${config.techStack} development. The **${config.projectName} Subagent** automatically detects and prevents violations of these standards.

## 🤖 Subagent Integration

**MANDATORY**: Use the ${config.projectName} Subagent for all code validation:

\`\`\`bash
# Activate subagent before coding
node ${config.projectName.toLowerCase()}-subagent.cjs test

# AI agent activation
@${config.projectName}Subagent validate architecture compliance

# Real-time validation  
const result = require('./${config.projectName.toLowerCase()}-subagent.cjs').inspect(code, { verbose: true });
\`\`\`

The subagent **AUTOMATICALLY REJECTS** code that violates these architecture standards.

## ${config.techStack.toUpperCase()} Specific Standards

${this.getTechStackStandards(config.techStack)}
    `.trim();
  }

  getTechStackStandards(techStack) {
    switch (techStack) {
      case 'react-typescript':
        return `
### 🔴 **CRITICAL VIOLATIONS - AUTOMATIC REJECTION**

#### **Component Complexity (SUBAGENT ENFORCED)**
- Components >200 lines = AUTOMATIC REJECTION
- >5 props per component = AUTOMATIC REJECTION  
- >3 useEffect hooks = AUTOMATIC REJECTION

#### **Hook Usage (SUBAGENT ENFORCED)**
- useEffect >3 dependencies = AUTOMATIC REJECTION
- Missing cleanup functions = AUTOMATIC REJECTION
- Complex logic in components = AUTOMATIC REJECTION

#### **TypeScript Safety (SUBAGENT ENFORCED)**  
- 'any' types in production = AUTOMATIC REJECTION
- Missing interface definitions = AUTOMATIC REJECTION
- Weak typing patterns = AUTOMATIC REJECTION
        `;

      case 'python-fastapi':
        return `
### 🔴 **CRITICAL VIOLATIONS - AUTOMATIC REJECTION**

#### **Function Design (SUBAGENT ENFORCED)**
- Functions >50 lines = AUTOMATIC REJECTION
- >5 parameters = AUTOMATIC REJECTION
- Missing type hints = AUTOMATIC REJECTION

#### **Async Patterns (SUBAGENT ENFORCED)**
- Sync calls in async functions = AUTOMATIC REJECTION
- Missing error handling = AUTOMATIC REJECTION
- Blocking operations = AUTOMATIC REJECTION
        `;

      default:
        return `
### 🔴 **CRITICAL VIOLATIONS - AUTOMATIC REJECTION**

#### **Code Organization (SUBAGENT ENFORCED)**
- Files >300 lines = AUTOMATIC REJECTION
- Functions >50 lines = AUTOMATIC REJECTION
- Excessive complexity = AUTOMATIC REJECTION

#### **Quality Standards (SUBAGENT ENFORCED)**
- Missing documentation = AUTOMATIC REJECTION
- Poor naming conventions = AUTOMATIC REJECTION
- Code duplication = AUTOMATIC REJECTION
        `;
    }
  }

  async addSubagentSteps(config) {
    const subagentStepsPath = path.join(config.targetDir, 'instructions/core/subagent-integration.md');
    
    if (config.dryRun) {
      console.log(chalk.gray(`  Would create: ${subagentStepsPath}`));
      return;
    }

    const content = this.generateSubagentIntegrationInstructions(config);
    
    await fs.ensureDir(path.dirname(subagentStepsPath));
    await fs.writeFile(subagentStepsPath, content);
    console.log(chalk.green(`✓ Added subagent-integration.md`));
  }

  generateSubagentIntegrationInstructions(config) {
    return `
---
description: ${config.projectName} Subagent Integration Guide for AI Agents
globs:
alwaysApply: true
version: 1.0
encoding: UTF-8
---

# ${config.projectName} Subagent Integration

## Overview

This project includes a specialized AI coding assistant (subagent) that enforces architecture standards and ensures code quality. ALL AI agents working on this codebase MUST integrate with and comply to this subagent.

## Mandatory Subagent Activation

### **Before ANY Code Generation**
\`\`\`markdown
REQUIRED: Activate the subagent with one of these commands:
- @${config.projectName}Subagent validate planned architecture for [FEATURE_NAME]
- @${config.projectName}Guardian check component design before implementation
- @ArchitectureEnforcer ensure compliance with project standards
\`\`\`

### **During Development**
\`\`\`bash
# Real-time validation
node ${config.projectName.toLowerCase()}-subagent.cjs test

# Programmatic validation
const subagent = require('./${config.projectName.toLowerCase()}-subagent.cjs');
const result = subagent.inspect(generatedCode, { verbose: true, generateFixes: true });
\`\`\`

### **After Implementation**
\`\`\`bash
# Final compliance check
node ${config.projectName.toLowerCase()}-subagent.cjs test
if [ $? -ne 0 ]; then
  echo "❌ SUBAGENT VALIDATION FAILED - Refactor required"
  exit 1
fi
\`\`\`

## Integration Workflow

### **Step 1: Pre-Implementation Validation**
\`\`\`markdown
<subagent_validation>
  ACTION: @${config.projectName}Subagent
  REQUEST: "Validate planned architecture for [FEATURE_NAME]:
           - Component structure: [PLANNED_COMPONENTS]
           - Performance considerations: [OPTIMIZATION_PLAN]"
  PROCESS: Subagent recommendations
  REFACTOR: Implementation plan if violations detected
  PROCEED: Only after 100% compliance confirmation
</subagent_validation>
\`\`\`

### **Step 2: Real-Time Development Validation**
During code generation, continuously validate against project standards and reject non-compliant code immediately.

### **Step 3: Post-Implementation Verification**
\`\`\`bash
# Final validation before task completion
echo "🤖 Running final subagent validation..."
node ${config.projectName.toLowerCase()}-subagent.cjs test --comprehensive
\`\`\`

## Project-Specific Requirements

### **${config.techStack} Standards**
${this.getProjectSpecificRequirements(config)}

### **Quality Gates**
- All implementations must pass subagent validation
- Zero tolerance for architecture violations
- Performance requirements must be met
- Integration patterns must be followed

## Success Metrics

- **Subagent Integration**: 100% of code generation tasks
- **Architecture Compliance**: Zero violations in final validation
- **Performance Standards**: All benchmarks met
- **Code Quality**: Consistent across all implementations

---

**This integration ensures every code change maintains project-specific architecture standards while delivering consistent quality and performance.**
    `.trim();
  }

  getProjectSpecificRequirements(config) {
    switch (config.techStack) {
      case 'react-typescript':
        return `
- Component size ≤200 lines including JSX
- Hook complexity ≤3 dependencies per useEffect
- TypeScript strict mode compliance
- Required cleanup for all side effects
- Memoization for expensive operations
- Agent-native capabilities where applicable`;

      case 'python-fastapi':
        return `
- Function size ≤50 lines per function
- Type hints required for all parameters and returns
- Async patterns for I/O operations
- Proper exception handling
- Performance optimization patterns
- Security best practices`;

      default:
        return `
- Code organization and modularity
- Performance optimization patterns
- Error handling and recovery
- Documentation and maintainability
- Security considerations
- Testing requirements`;
    }
  }

  async addCustomInstructions(config) {
    const customInstructionsDir = path.join(config.targetDir, 'instructions/custom');
    
    if (config.dryRun) {
      console.log(chalk.gray(`  Would create: ${customInstructionsDir}/`));
      return;
    }

    await fs.ensureDir(customInstructionsDir);

    // Create custom instruction templates
    const instructions = [
      'validate-with-subagent.md',
      'refactor-for-compliance.md',
      'performance-optimization.md'
    ];

    for (const instruction of instructions) {
      const content = this.generateCustomInstruction(instruction, config);
      const filePath = path.join(customInstructionsDir, instruction);
      
      await fs.writeFile(filePath, content);
      console.log(chalk.green(`✓ Added custom instruction: ${instruction}`));
    }
  }

  generateCustomInstruction(instructionType, config) {
    switch (instructionType) {
      case 'validate-with-subagent.md':
        return `
---
description: Validate Code with ${config.projectName} Subagent
globs:
alwaysApply: true
version: 1.0
encoding: UTF-8
---

# Validate Code with ${config.projectName} Subagent

## Process Flow

<validation_flow>

<step number="1" name="activate_subagent">
### Step 1: Activate Subagent
ACTION: @${config.projectName}Subagent validate this code
REQUEST: Architecture compliance check for generated code
</step>

<step number="2" name="analyze_violations">
### Step 2: Analyze Violations
IF violations detected:
  REVIEW: Specific violation details
  UNDERSTAND: Why each violation occurs
  PLAN: Refactoring approach
</step>

<step number="3" name="apply_fixes">
### Step 3: Apply Fixes
REFACTOR: Code to meet subagent standards
VALIDATE: Fixes address all violations
VERIFY: No new violations introduced
</step>

<step number="4" name="confirm_compliance">
### Step 4: Confirm Compliance
RUN: Final subagent validation
ENSURE: 100% compliance achieved
DOCUMENT: Any approved exceptions
</step>

</validation_flow>
        `.trim();

      case 'refactor-for-compliance.md':
        return `
---
description: Refactor Code for ${config.projectName} Subagent Compliance
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Refactor for Subagent Compliance

## Common Refactoring Patterns

### ${config.techStack} Specific Refactoring
${this.getRefactoringPatterns(config.techStack)}

## Refactoring Process

1. **Identify Violations**: Run subagent to detect issues
2. **Prioritize Fixes**: Address critical violations first
3. **Apply Patterns**: Use proven refactoring techniques
4. **Validate Changes**: Ensure fixes resolve violations
5. **Test Integration**: Verify functionality maintained
        `.trim();

      default:
        return `
---
description: Custom Instruction for ${config.projectName}
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Custom ${instructionType.replace('.md', '')}

## Instructions

Custom instructions for ${config.projectName} development.
        `.trim();
    }
  }

  getRefactoringPatterns(techStack) {
    switch (techStack) {
      case 'react-typescript':
        return `
### Component Size Reduction
- Extract sub-components for complex UI
- Create custom hooks for complex logic
- Use composition over large prop interfaces

### Hook Simplification  
- Extract custom hooks for complex useEffect
- Reduce dependencies through memoization
- Use cleanup functions for all side effects

### TypeScript Enhancement
- Add explicit interfaces for all props
- Replace any types with proper unions
- Use generic types for reusable components`;

      case 'python-fastapi':
        return `
### Function Decomposition
- Break large functions into smaller units
- Extract common logic into utilities
- Use dependency injection for complex dependencies

### Type Safety Enhancement
- Add type hints to all parameters
- Specify return types for all functions
- Use Pydantic models for data validation

### Async Pattern Optimization
- Convert blocking calls to async
- Implement proper exception handling
- Use connection pooling for databases`;

      default:
        return `
### General Refactoring
- Extract functions for complex logic
- Reduce cyclomatic complexity
- Improve naming and documentation
- Eliminate code duplication`;
    }
  }
}

// CLI execution
if (require.main === module) {
  const integrator = new AgentOSIntegrator();
  integrator.program.parse(process.argv);
}

module.exports = AgentOSIntegrator;