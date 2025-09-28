/**
 * Base Validator - Language-agnostic validation engine
 * 
 * This is the core validation engine that can be extended for any tech stack.
 * It provides a common interface and shared functionality for all subagents.
 */

class BaseValidator {
  constructor(config = {}) {
    this.config = {
      // Default configuration that can be overridden
      project: {
        name: 'UnknownProject',
        version: '1.0.0',
        tech_stack: 'generic'
      },
      rules: {
        // Base rules that apply to most projects
        general: {
          max_file_lines: 300,
          max_function_lines: 50,
          max_function_parameters: 5,
          require_documentation: false
        }
      },
      ...config
    };

    this.violations = [];
    this.warnings = [];
    this.suggestions = [];
    this.metrics = {};
  }

  /**
   * Main validation method - override in tech-stack specific validators
   */
  validateCode(code, options = {}) {
    this.reset();
    
    // Basic validation that applies to all languages
    this.validateFileSize(code);
    this.validateBasicPatterns(code);
    
    // Tech-stack specific validation (implemented in subclasses)
    if (this.validateTechStackSpecific) {
      this.validateTechStackSpecific(code, options);
    }
    
    // Calculate metrics
    this.calculateMetrics(code);
    
    return this.getResults();
  }

  /**
   * Reset validation state
   */
  reset() {
    this.violations = [];
    this.warnings = [];
    this.suggestions = [];
    this.metrics = {};
  }

  /**
   * Validate file size constraints
   */
  validateFileSize(code) {
    const lines = code.split('\n').length;
    const maxLines = this.config.rules.general?.max_file_lines || 300;
    
    if (lines > maxLines) {
      this.addViolation('file_size', {
        message: `File has ${lines} lines, exceeds limit of ${maxLines}`,
        severity: 'high',
        fix: 'Break file into smaller modules with single responsibilities',
        line_count: lines,
        max_allowed: maxLines
      });
    }
  }

  /**
   * Validate basic patterns that apply across languages
   */
  validateBasicPatterns(code) {
    // Check for TODO/FIXME comments that might indicate incomplete code
    const todoPattern = /(TODO|FIXME|HACK|BUG):/gi;
    const todos = code.match(todoPattern);
    if (todos && todos.length > 5) {
      this.addWarning('maintenance_debt', {
        message: `Found ${todos.length} TODO/FIXME comments indicating technical debt`,
        severity: 'medium',
        fix: 'Address technical debt items or create proper issue tracking',
        count: todos.length
      });
    }

    // Check for very long lines (potential readability issue)
    const lines = code.split('\n');
    const longLines = lines.filter(line => line.length > 120);
    if (longLines.length > 0) {
      this.addSuggestion('line_length', {
        message: `Found ${longLines.length} lines longer than 120 characters`,
        severity: 'low',
        fix: 'Break long lines for better readability',
        count: longLines.length
      });
    }

    // Check for excessive nesting (basic heuristic)
    const indentationLevels = lines.map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    });
    const maxNesting = Math.max(...indentationLevels);
    if (maxNesting > 24) { // Assuming 4-space indentation, this is 6 levels
      this.addWarning('excessive_nesting', {
        message: `Code has deep nesting levels (${Math.floor(maxNesting / 4)} levels)`,
        severity: 'medium',
        fix: 'Extract nested logic into separate functions',
        nesting_level: Math.floor(maxNesting / 4)
      });
    }
  }

  /**
   * Add a critical violation
   */
  addViolation(type, details) {
    this.violations.push({
      type,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  /**
   * Add a warning (non-critical issue)
   */
  addWarning(type, details) {
    this.warnings.push({
      type,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  /**
   * Add a suggestion for improvement
   */
  addSuggestion(type, details) {
    this.suggestions.push({
      type,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  /**
   * Calculate basic metrics
   */
  calculateMetrics(code) {
    this.metrics = {
      lines_of_code: code.split('\n').length,
      character_count: code.length,
      blank_lines: code.split('\n').filter(line => line.trim() === '').length,
      comment_lines: this.countCommentLines(code),
      complexity_score: this.calculateComplexity(code),
      validation_timestamp: new Date().toISOString()
    };
  }

  /**
   * Count comment lines (basic implementation)
   */
  countCommentLines(code) {
    // Basic comment detection - override in tech-specific validators
    const commentPatterns = [
      /^\s*\/\//,  // JavaScript/TypeScript single-line
      /^\s*#/,     // Python/Shell comments
      /^\s*\/\*/,  // Multi-line comment start
      /^\s*\*/     // Multi-line comment continuation
    ];
    
    return code.split('\n').filter(line => 
      commentPatterns.some(pattern => pattern.test(line))
    ).length;
  }

  /**
   * Calculate basic complexity score
   */
  calculateComplexity(code) {
    let score = 0;
    
    // Count branching statements (basic heuristic)
    const branchingPatterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bswitch\b/g,
      /\bcatch\b/g,
      /\?\s*.*\s*:/g  // Ternary operators
    ];
    
    branchingPatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        score += matches.length;
      }
    });
    
    return score;
  }

  /**
   * Generate fix suggestions for violations
   */
  generateFixes(violations) {
    return violations.map(violation => {
      const baseFix = {
        violation_type: violation.type,
        severity: violation.severity,
        description: violation.message,
        suggested_action: violation.fix
      };

      // Add specific code examples based on violation type
      switch (violation.type) {
        case 'file_size':
          return {
            ...baseFix,
            code_example: this.getFileSizeFix(),
            refactoring_strategy: 'Extract related functionality into separate modules'
          };
        
        case 'excessive_nesting':
          return {
            ...baseFix,
            code_example: this.getNestingFix(),
            refactoring_strategy: 'Use early returns and extract functions'
          };
          
        default:
          return baseFix;
      }
    });
  }

  /**
   * Get example fix for file size issues
   */
  getFileSizeFix() {
    return `
// Before: Large file with multiple responsibilities
class MegaClass {
  // 300+ lines of mixed functionality
}

// After: Broken into focused modules
// user-service.js
class UserService { /* user-related functionality */ }

// data-processor.js  
class DataProcessor { /* data processing logic */ }

// main.js
import { UserService } from './user-service.js';
import { DataProcessor } from './data-processor.js';
    `.trim();
  }

  /**
   * Get example fix for nesting issues
   */
  getNestingFix() {
    return `
// Before: Deep nesting
function processData(data) {
  if (data) {
    if (data.isValid) {
      if (data.hasPermission) {
        if (data.isNotEmpty) {
          // Deep nested logic
        }
      }
    }
  }
}

// After: Early returns and extraction
function processData(data) {
  if (!data) return null;
  if (!data.isValid) return null;
  if (!data.hasPermission) return null;
  if (!data.isNotEmpty) return null;
  
  return processValidData(data);
}

function processValidData(data) {
  // Extracted logic
}
    `.trim();
  }

  /**
   * Get validation results
   */
  getResults() {
    return {
      isValid: this.violations.length === 0,
      violations: this.violations,
      warnings: this.warnings,
      suggestions: this.suggestions,
      metrics: this.metrics,
      summary: {
        total_issues: this.violations.length + this.warnings.length,
        critical_issues: this.violations.filter(v => v.severity === 'critical').length,
        high_issues: this.violations.filter(v => v.severity === 'high').length,
        medium_issues: this.warnings.filter(w => w.severity === 'medium').length,
        low_issues: this.suggestions.filter(s => s.severity === 'low').length
      },
      config: {
        project_name: this.config.project.name,
        tech_stack: this.config.project.tech_stack,
        validation_timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Pretty print results for CLI usage
   */
  printResults(options = {}) {
    const results = this.getResults();
    const { verbose = false, colors = true } = options;

    console.log(`\n🤖 ${this.config.project.name} Subagent v${this.config.project.version}`);
    console.log('='.repeat(60));
    
    if (results.isValid) {
      console.log('✅ Code passes all validation checks');
    } else {
      console.log(`❌ Found ${results.violations.length} violation(s)`);
      
      results.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.type.toUpperCase()}: ${violation.message}`);
        console.log(`   Severity: ${violation.severity}`);
        console.log(`   Fix: ${violation.fix}`);
      });
    }

    if (results.warnings.length > 0 && verbose) {
      console.log(`\n⚠️ ${results.warnings.length} warning(s):`);
      results.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
      });
    }

    if (results.suggestions.length > 0 && verbose) {
      console.log(`\n💡 ${results.suggestions.length} suggestion(s):`);
      results.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion.message}`);
      });
    }

    if (verbose) {
      console.log('\n📊 Metrics:');
      Object.entries(results.metrics).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }

    return results;
  }
}

module.exports = BaseValidator;