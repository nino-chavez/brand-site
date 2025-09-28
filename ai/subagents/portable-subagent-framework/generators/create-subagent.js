#!/usr/bin/env node

/**
 * Subagent Generator - Creates project-specific subagents from templates
 * 
 * This generator takes a tech stack template and project configuration
 * and generates a complete, working subagent for that specific project.
 */

const { Command } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const chalk = require('chalk');

class SubagentGenerator {
  constructor() {
    this.program = new Command();
    this.setupCommands();
    this.templatesDir = path.join(__dirname, '../templates');
    this.outputDir = process.cwd();
  }

  setupCommands() {
    this.program
      .name('create-subagent')
      .description('Generate a project-specific AI subagent')
      .version('1.0.0')
      .option('-i, --interactive', 'Interactive mode with prompts')
      .option('-t, --tech-stack <stack>', 'Technology stack (react-typescript, python-fastapi, etc.)')
      .option('-n, --project-name <name>', 'Project name')
      .option('-o, --output-dir <dir>', 'Output directory', '.')
      .option('-c, --config-file <file>', 'Project configuration file')
      .option('--standards <standards>', 'Comma-separated list of standards to enforce')
      .option('--organization <org>', 'Organization name for branding')
      .action((options) => this.run(options));
  }

  async run(options) {
    try {
      console.log(chalk.blue('🤖 Portable Subagent Framework Generator\n'));
      
      let config;
      
      if (options.interactive) {
        config = await this.interactivePrompt();
      } else if (options.configFile) {
        config = await this.loadConfigFile(options.configFile);
      } else {
        config = this.buildConfigFromOptions(options);
      }

      // Validate configuration
      this.validateConfig(config);
      
      // Generate subagent
      await this.generateSubagent(config);
      
      console.log(chalk.green('\n✅ Subagent generated successfully!'));
      console.log(chalk.yellow(`\nNext steps:`));
      console.log(`1. cd ${config.outputDir}`);
      console.log(`2. node ${config.projectName.toLowerCase()}-subagent.cjs test`);
      console.log(`3. Integrate with your development workflow\n`);
      
    } catch (error) {
      console.error(chalk.red('❌ Error generating subagent:'), error.message);
      process.exit(1);
    }
  }

  async interactivePrompt() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
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
        name: 'standards',
        message: 'Select standards to enforce:',
        choices: [
          { name: 'Clean Architecture', value: 'clean-architecture', checked: true },
          { name: 'Performance Optimization', value: 'performance-optimized', checked: true },
          { name: 'Accessibility (WCAG)', value: 'accessibility', checked: false },
          { name: 'Security Best Practices', value: 'security', checked: true },
          { name: 'Test Coverage', value: 'test-coverage', checked: true },
          { name: 'Documentation', value: 'documentation', checked: false }
        ]
      },
      {
        type: 'input',
        name: 'organization',
        message: 'Organization name (optional):',
        default: 'Development Team'
      },
      {
        type: 'input',
        name: 'outputDir',
        message: 'Output directory:',
        default: '../'
      },
      {
        type: 'confirm',
        name: 'agentOsIntegration',
        message: 'Generate agent-os integration files?',
        default: true
      },
      {
        type: 'confirm',
        name: 'ciIntegration',
        message: 'Generate CI/CD integration files?',
        default: false
      }
    ]);

    return answers;
  }

  buildConfigFromOptions(options) {
    if (!options.techStack || !options.projectName) {
      throw new Error('Tech stack and project name are required when not using interactive mode');
    }

    return {
      projectName: options.projectName,
      techStack: options.techStack,
      outputDir: options.outputDir || '.',
      standards: options.standards ? options.standards.split(',') : ['clean-architecture', 'performance-optimized'],
      organization: options.organization || 'Development Team',
      agentOsIntegration: true,
      ciIntegration: false
    };
  }

  async loadConfigFile(configPath) {
    const fullPath = path.resolve(configPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Configuration file not found: ${fullPath}`);
    }

    const content = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(content);
  }

  validateConfig(config) {
    const requiredFields = ['projectName', 'techStack'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required configuration: ${missingFields.join(', ')}`);
    }

    const templatePath = path.join(this.templatesDir, config.techStack);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Unknown tech stack: ${config.techStack}`);
    }
  }

  async generateSubagent(config) {
    const templateDir = path.join(this.templatesDir, config.techStack);
    const outputPath = path.resolve(config.outputDir);
    
    console.log(chalk.yellow(`Generating subagent for ${config.projectName}...`));
    
    // Create output directory if it doesn't exist
    await fs.ensureDir(outputPath);
    
    // Load template configuration
    const templateConfig = await this.loadTemplateConfig(templateDir);
    
    // Merge configurations
    const mergedConfig = {
      ...templateConfig,
      ...config,
      generatedAt: new Date().toISOString(),
      frameworkVersion: '1.0.0'
    };
    
    // Generate main subagent script
    await this.generateMainScript(templateDir, outputPath, mergedConfig);
    
    // Generate configuration file
    await this.generateConfigFile(outputPath, mergedConfig);
    
    // Generate documentation
    await this.generateDocumentation(outputPath, mergedConfig);
    
    // Generate agent-os integration if requested
    if (config.agentOsIntegration) {
      await this.generateAgentOsIntegration(outputPath, mergedConfig);
    }
    
    // Generate CI/CD integration if requested
    if (config.ciIntegration) {
      await this.generateCIIntegration(outputPath, mergedConfig);
    }
    
    console.log(chalk.green(`✓ Generated files in ${outputPath}`));
  }

  async loadTemplateConfig(templateDir) {
    const configPath = path.join(templateDir, 'template-config.json');
    if (fs.existsSync(configPath)) {
      const content = await fs.readFile(configPath, 'utf8');
      return JSON.parse(content);
    }
    return {};
  }

  async generateMainScript(templateDir, outputPath, config) {
    const templatePath = path.join(templateDir, 'subagent-template.js');
    const outputFilename = `${config.projectName.toLowerCase().replace(/\s+/g, '-')}-subagent.cjs`;
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    
    const template = await fs.readFile(templatePath, 'utf8');
    const compiled = Handlebars.compile(template);
    const generated = compiled(config);
    
    await fs.writeFile(path.join(outputPath, outputFilename), generated);
    console.log(chalk.green(`✓ Generated ${outputFilename}`));
  }

  async generateConfigFile(outputPath, config) {
    const configData = {
      subagent: {
        name: `${config.projectName}CodeGuardian`,
        version: config.frameworkVersion,
        description: `Architecture compliance enforcer for ${config.projectName}`,
        tech_stack: config.techStack,
        organization: config.organization,
        generated_at: config.generatedAt
      },
      project_context: {
        name: config.projectName,
        type: config.techStack,
        standards: config.standards
      },
      rules: this.generateRulesForTechStack(config.techStack, config.standards)
    };
    
    const filename = 'subagent-config.json';
    await fs.writeFile(
      path.join(outputPath, filename),
      JSON.stringify(configData, null, 2)
    );
    console.log(chalk.green(`✓ Generated ${filename}`));
  }

  generateRulesForTechStack(techStack, standards) {
    const baseRules = {
      general: {
        max_file_lines: 300,
        max_function_lines: 50,
        require_documentation: standards.includes('documentation')
      }
    };

    switch (techStack) {
      case 'react-typescript':
        return {
          ...baseRules,
          component_limits: {
            max_lines: 200,
            max_props: 5,
            max_hooks: 5
          },
          hook_constraints: {
            max_useeffect_dependencies: 3,
            require_cleanup: true
          },
          type_safety: {
            no_any_types: true,
            explicit_interfaces: true
          },
          performance: {
            require_memoization: standards.includes('performance-optimized'),
            virtualize_large_lists: standards.includes('performance-optimized')
          }
        };

      case 'python-fastapi':
        return {
          ...baseRules,
          function_limits: {
            max_parameters: 5,
            max_complexity: 10
          },
          type_hints: {
            required: true,
            return_types: true
          },
          async_patterns: {
            prefer_async: true,
            no_sync_calls_in_async: true
          }
        };

      default:
        return baseRules;
    }
  }

  async generateDocumentation(outputPath, config) {
    const readmeTemplate = `
# ${config.projectName} Subagent

## Overview

AI coding assistant for ${config.projectName} that enforces architecture standards and ensures code quality.

## Tech Stack

- **Primary**: ${config.techStack}
- **Standards**: ${config.standards.join(', ')}
- **Organization**: ${config.organization}

## Usage

\`\`\`bash
# Validate code
node ${config.projectName.toLowerCase().replace(/\s+/g, '-')}-subagent.cjs test

# Show configuration
node ${config.projectName.toLowerCase().replace(/\s+/g, '-')}-subagent.cjs config

# Interactive validation
node ${config.projectName.toLowerCase().replace(/\s+/g, '-')}-subagent.cjs validate --interactive
\`\`\`

## Integration with AI Tools

### GitHub Copilot
\`\`\`
@${config.projectName}Subagent validate this component
\`\`\`

### Claude/Cursor
\`\`\`
@${config.projectName}Guardian check architecture compliance
\`\`\`

## Generated Configuration

This subagent was generated on ${config.generatedAt} using the Portable Subagent Framework v${config.frameworkVersion}.

For customization, edit the \`subagent-config.json\` file.
    `.trim();
    
    await fs.writeFile(path.join(outputPath, 'SUBAGENT-README.md'), readmeTemplate);
    console.log(chalk.green(`✓ Generated SUBAGENT-README.md`));
  }

  async generateAgentOsIntegration(outputPath, config) {
    // Generate agent-os integration files
    const agentOsDir = path.join(outputPath, '.agent-os-integration');
    await fs.ensureDir(agentOsDir);
    
    // Pre-flight enhancement
    const preFlightTemplate = `
# Enhanced Pre-Flight for ${config.projectName}

## Subagent Integration

**MANDATORY**: Activate the ${config.projectName} Subagent for all code generation:

\`\`\`
@${config.projectName}Subagent validate planned architecture
\`\`\`

## Project Standards

- Tech Stack: ${config.techStack}
- Standards: ${config.standards.join(', ')}
- Organization: ${config.organization}
    `.trim();
    
    await fs.writeFile(path.join(agentOsDir, 'pre-flight-enhancement.md'), preFlightTemplate);
    console.log(chalk.green(`✓ Generated agent-os integration files`));
  }

  async generateCIIntegration(outputPath, config) {
    // Generate CI/CD configuration files
    const ciDir = path.join(outputPath, '.ci-integration');
    await fs.ensureDir(ciDir);
    
    // GitHub Actions workflow
    const githubWorkflow = `
name: ${config.projectName} Subagent Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: node ${config.projectName.toLowerCase().replace(/\s+/g, '-')}-subagent.cjs test
    `.trim();
    
    await fs.writeFile(path.join(ciDir, 'github-actions.yml'), githubWorkflow);
    
    // Pre-commit hook
    const preCommitHook = `
#!/bin/sh
# ${config.projectName} Subagent Pre-commit Hook

echo "🤖 Running ${config.projectName} Subagent validation..."
node ${config.projectName.toLowerCase().replace(/\s+/g, '-')}-subagent.cjs test

if [ $? -ne 0 ]; then
  echo "❌ Subagent validation failed. Commit blocked."
  exit 1
fi

echo "✅ Subagent validation passed."
    `.trim();
    
    await fs.writeFile(path.join(ciDir, 'pre-commit-hook.sh'), preCommitHook);
    
    console.log(chalk.green(`✓ Generated CI/CD integration files`));
  }
}

// CLI execution
if (require.main === module) {
  const generator = new SubagentGenerator();
  generator.program.parse(process.argv);
}

module.exports = SubagentGenerator;