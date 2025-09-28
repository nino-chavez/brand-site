#!/usr/bin/env node

/**
 * Framework Test Suite
 * 
 * Tests the portable subagent framework functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FrameworkTester {
  constructor() {
    this.testResults = [];
    this.frameworkRoot = path.dirname(__dirname);
  }

  async runTests() {
    console.log('🧪 Testing Portable Subagent Framework...\n');
    
    try {
      await this.testTemplateGeneration();
      await this.testReactTypeScriptTemplate();
      await this.testPythonFastAPITemplate();
      await this.testGenericTemplate();
      await this.testCustomConfiguration();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Framework test failed:', error.message);
      process.exit(1);
    }
  }

  async testTemplateGeneration() {
    console.log('Testing template generation...');
    
    const tempDir = path.join(this.frameworkRoot, 'temp-test');
    
    try {
      // Test React TypeScript generation
      const result = execSync(`
        cd ${this.frameworkRoot} && 
        node generators/create-subagent.js \\
          --tech-stack=react-typescript \\
          --project-name="TestProject" \\
          --output-dir="${tempDir}" \\
          --standards="clean-architecture,performance-optimized"
      `, { encoding: 'utf8' });
      
      // Check generated files exist
      const expectedFiles = [
        'testproject-subagent.cjs',
        'subagent-config.json',
        'SUBAGENT-README.md'
      ];
      
      for (const file of expectedFiles) {
        const filePath = path.join(tempDir, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Generated file missing: ${file}`);
        }
      }
      
      this.addTestResult('Template Generation', true, 'All expected files generated');
      
    } catch (error) {
      this.addTestResult('Template Generation', false, error.message);
    } finally {
      // Cleanup
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  async testReactTypeScriptTemplate() {
    console.log('Testing React TypeScript template...');
    
    try {
      const templatePath = path.join(this.frameworkRoot, 'templates/react-typescript');
      
      // Check template files exist
      const requiredFiles = [
        'template-config.json',
        'subagent-template.js'
      ];
      
      for (const file of requiredFiles) {
        const filePath = path.join(templatePath, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Template file missing: ${file}`);
        }
      }
      
      // Validate template configuration
      const configPath = path.join(templatePath, 'template-config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (!config.tech_stack || config.tech_stack !== 'react-typescript') {
        throw new Error('Invalid template configuration');
      }
      
      this.addTestResult('React TypeScript Template', true, 'Template files valid');
      
    } catch (error) {
      this.addTestResult('React TypeScript Template', false, error.message);
    }
  }

  async testPythonFastAPITemplate() {
    console.log('Testing Python FastAPI template...');
    
    try {
      const templatePath = path.join(this.frameworkRoot, 'templates/python-fastapi');
      const configPath = path.join(templatePath, 'template-config.json');
      
      if (!fs.existsSync(configPath)) {
        throw new Error('Python FastAPI template config missing');
      }
      
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (!config.default_rules || !config.default_rules.type_safety) {
        throw new Error('Python FastAPI template missing required rules');
      }
      
      this.addTestResult('Python FastAPI Template', true, 'Template configuration valid');
      
    } catch (error) {
      this.addTestResult('Python FastAPI Template', false, error.message);
    }
  }

  async testGenericTemplate() {
    console.log('Testing Generic template...');
    
    try {
      const templatePath = path.join(this.frameworkRoot, 'templates/generic');
      const configPath = path.join(templatePath, 'template-config.json');
      
      if (!fs.existsSync(configPath)) {
        throw new Error('Generic template config missing');
      }
      
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (config.tech_stack !== 'generic') {
        throw new Error('Generic template has wrong tech stack identifier');
      }
      
      this.addTestResult('Generic Template', true, 'Generic template valid');
      
    } catch (error) {
      this.addTestResult('Generic Template', false, error.message);
    }
  }

  async testCustomConfiguration() {
    console.log('Testing custom configuration...');
    
    try {
      const BaseValidator = require('../core/base-validator');
      
      const customConfig = {
        project: { name: 'TestProject', tech_stack: 'test' },
        rules: {
          general: { max_file_lines: 100 }
        }
      };
      
      const validator = new BaseValidator(customConfig);
      
      const testCode = 'a\n'.repeat(150); // 150 lines
      const results = validator.validateCode(testCode);
      
      if (!results.violations.some(v => v.type === 'file_size')) {
        throw new Error('Custom configuration not applied correctly');
      }
      
      this.addTestResult('Custom Configuration', true, 'Custom rules applied');
      
    } catch (error) {
      this.addTestResult('Custom Configuration', false, error.message);
    }
  }

  addTestResult(testName, passed, message) {
    this.testResults.push({ testName, passed, message });
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! Framework is ready for use.');
    } else {
      console.log('\n❌ Some tests failed. Please review the issues above.');
      process.exit(1);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new FrameworkTester();
  tester.runTests();
}

module.exports = FrameworkTester;