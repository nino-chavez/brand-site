#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';

// Configuration
const CONFIG = {
  fileThreshold: 20,
  maxFileSize: 500,
  blockOnWarnings: false,
  requireTests: false,
  excludePaths: ['node_modules', 'dist', 'build', '.git', '.claude/agents']
};

// Parse CLI args
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const JSON_OUTPUT = args.includes('--json');

// Colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Results accumulator
const results = {
  passed: [],
  failed: [],
  warnings: [],
  info: []
};

// Helper to execute commands
function exec(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (error) {
    return error.stdout || error.stderr || '';
  }
}

// Get staged files
function getStagedFiles() {
  const output = exec('git diff --cached --name-only --diff-filter=AM');
  return output.trim().split('\n').filter(f => f.length > 0);
}

// Get diff for staged changes
function getStagedDiff() {
  return exec('git diff --cached');
}

// Check 1: Canonical Standards Compliance
function checkCanonicalStandards(diff, files) {
  const violations = [];

  // Check for manual DOM manipulation
  const domManipulation = diff.match(/\.style\.(transform|opacity|top|left|width|height)\s*=/g);
  if (domManipulation) {
    violations.push({
      type: 'manual-dom',
      message: 'Manual DOM manipulation detected',
      fix: 'Use Framer Motion <motion.div animate={{ ... }} /> or CSS classes',
      reference: '.claude/agents/intelligence/canonical-standards.md#1-manual-dom-manipulation'
    });
  }

  // Check for 'any' type
  const anyType = diff.match(/:\s*any[\s,;>\])]|<any>|Promise<any>|Array<any>/g);
  if (anyType) {
    violations.push({
      type: 'any-type',
      message: "TypeScript 'any' type detected",
      fix: "Use proper types or 'unknown' with type guards",
      reference: '.claude/agents/intelligence/canonical-standards.md#1-any-type'
    });
  }

  // Check for inline event handlers
  const inlineHandlers = diff.match(/on(Click|Change|Submit)=\{[^}]*=>/g);
  if (inlineHandlers && inlineHandlers.length > 2) {
    violations.push({
      type: 'inline-handlers',
      message: 'Inline event handler creation detected',
      fix: 'Use useCallback to prevent unnecessary re-renders',
      reference: '.claude/agents/intelligence/canonical-standards.md#5-inline-event-handler-creation',
      severity: 'warning'
    });
  }

  // Check for unthrottled event listeners
  const unthrottledEvents = diff.match(/addEventListener\(['"](?:scroll|resize|mousemove)['"]/g);
  if (unthrottledEvents) {
    const hasThrottle = diff.match(/throttle|debounce|requestAnimationFrame/);
    if (!hasThrottle) {
      violations.push({
        type: 'unthrottled-events',
        message: 'Event listener without throttle/debounce detected',
        fix: 'Use throttle/debounce or requestAnimationFrame for performance',
        reference: '.claude/agents/intelligence/canonical-standards.md#1-unthrottled-event-handlers',
        severity: 'warning'
      });
    }
  }

  // Check for useEffect without dependencies
  const useEffectWithoutDeps = diff.match(/useEffect\(\s*\(\s*\)\s*=>\s*{[^}]*}\s*\)/g);
  if (useEffectWithoutDeps) {
    violations.push({
      type: 'useeffect-deps',
      message: 'useEffect without dependency array detected',
      fix: 'Add dependency array: useEffect(() => {...}, [deps])',
      reference: '.claude/agents/intelligence/canonical-standards.md#6-useeffect-without-dependencies',
      severity: 'warning'
    });
  }

  return violations;
}

// Check 2: Import Chain Verification
function checkImportChains(files) {
  const orphaned = [];
  const entryPoints = ['App.tsx', 'main.tsx', 'index.tsx', 'vite.config.ts', 'server.js'];

  for (const file of files) {
    // Skip non-component/module files
    if (!file.match(/\.(tsx?|jsx?)$/)) continue;

    // Skip entry points
    const filename = basename(file);
    if (entryPoints.includes(filename)) continue;

    // Skip test files
    if (filename.match(/\.(test|spec)\./)) continue;

    // Get base filename without extension
    const baseFilename = basename(file, '.tsx').replace(/\.ts$/, '');

    // Search for imports
    const searchCmd = `grep -r "from.*${baseFilename}" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null || true`;
    const imports = exec(searchCmd).trim();

    // Filter out self-imports
    const importLines = imports.split('\n').filter(line => {
      return line.length > 0 && !line.startsWith(file + ':');
    });

    if (importLines.length === 0) {
      orphaned.push({
        file,
        message: `File is not imported anywhere (dead code)`,
        fix: 'Remove the file or import it where needed'
      });
    }
  }

  return orphaned;
}

// Check 3: TypeScript Compilation
function checkTypeScript() {
  const output = exec('npx tsc --noEmit --skipLibCheck 2>&1');
  const hasErrors = output.includes('error TS');

  return {
    passed: !hasErrors,
    errors: hasErrors ? output.split('\n').filter(l => l.includes('error TS')).slice(0, 10) : []
  };
}

// Check 4: Mixed Approaches
function checkMixedApproaches(diff) {
  const issues = [];

  // Check for mixing Framer Motion with inline styles
  const hasFramerMotion = diff.includes('motion.') || diff.includes('<motion.');
  const hasInlineStyles = diff.match(/\.style\.(transform|opacity)/);

  if (hasFramerMotion && hasInlineStyles) {
    issues.push({
      type: 'mixed-animation',
      message: 'Mixing Framer Motion with inline styles',
      fix: 'Use one approach consistently',
      severity: 'warning'
    });
  }

  return issues;
}

// Check 5: Performance Patterns
function checkPerformance(files) {
  const issues = [];

  for (const file of files) {
    if (!existsSync(file)) continue;

    try {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n').length;

      // Check file size
      if (lines > CONFIG.maxFileSize) {
        issues.push({
          file,
          type: 'large-file',
          message: `File size ${lines} lines (threshold: ${CONFIG.maxFileSize})`,
          fix: 'Consider splitting into smaller components',
          severity: 'warning'
        });
      }

      // Check for missing tests
      if (file.match(/\.(tsx?)$/) && !file.includes('.test.')) {
        const testFile = file.replace(/\.tsx?$/, '.test.tsx');
        if (!existsSync(testFile) && CONFIG.requireTests) {
          issues.push({
            file,
            type: 'missing-tests',
            message: 'No test file found',
            fix: `Create ${testFile}`,
            severity: 'warning'
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  return issues;
}

// Format output
function formatOutput(report) {
  if (JSON_OUTPUT) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const c = colors;
  console.log('');
  console.log(`${c.bold}🔍 Code Review Report${c.reset}`);
  console.log('======================================');
  console.log('');

  // Overview
  console.log(`${c.bold}📊 Overview:${c.reset}`);
  console.log(`- Files changed: ${report.filesChanged}`);
  console.log(`- Review duration: ${report.duration}s`);
  console.log('');

  // Passed checks
  if (report.passed.length > 0) {
    console.log(`${c.green}${c.bold}✅ PASSED Checks:${c.reset}`);
    report.passed.forEach(check => {
      console.log(`${c.green}- ${check}${c.reset}`);
    });
    console.log('');
  }

  // Failed checks
  if (report.failed.length > 0) {
    console.log(`${c.red}${c.bold}❌ FAILED Checks (BLOCKING):${c.reset}`);
    report.failed.forEach((issue, idx) => {
      console.log(`${c.red}${idx + 1}. ${issue.message}${c.reset}`);
      if (issue.file) console.log(`   File: ${issue.file}`);
      console.log(`   Fix: ${issue.fix}`);
      if (issue.reference) console.log(`   Reference: ${issue.reference}`);
      console.log('');
    });
  }

  // Warnings
  if (report.warnings.length > 0) {
    console.log(`${c.yellow}${c.bold}⚠️  WARNINGS (Non-Blocking):${c.reset}`);
    report.warnings.forEach(warning => {
      console.log(`${c.yellow}- ${warning.message}${c.reset}`);
      if (warning.file) console.log(`  File: ${warning.file}`);
      if (warning.fix) console.log(`  Fix: ${warning.fix}`);
    });
    console.log('');
  }

  // Result
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (report.result === 'passed') {
    console.log(`${c.green}${c.bold}Result: ✅ REVIEW PASSED${c.reset}`);
    console.log('');
    console.log('All quality checks passed. You can proceed with commit:');
    console.log('  git commit -m "your message"');
  } else {
    console.log(`${c.red}${c.bold}Result: ❌ REVIEW FAILED (${report.failed.length} blocking issues)${c.reset}`);
    console.log('');
    console.log('Fix the blocking issues above, then retry:');
    console.log('  git add .');
    console.log('  npm run code-review');
    console.log('  git commit -m "your message"');
    console.log('');
    console.log('Or override (not recommended):');
    console.log('  git commit --no-verify');
  }
  console.log('');
}

// Main execution
async function main() {
  const startTime = Date.now();

  if (!JSON_OUTPUT) {
    console.log('');
    console.log(`${colors.blue}Running code review...${colors.reset}`);
    console.log('');
  }

  // Get staged files
  const files = getStagedFiles();
  if (files.length === 0) {
    console.log('No staged files to review.');
    process.exit(0);
  }

  const diff = getStagedDiff();

  // Run all checks
  const canonicalViolations = checkCanonicalStandards(diff, files);
  const orphanedFiles = checkImportChains(files);
  const tsCheck = checkTypeScript();
  const mixedApproaches = checkMixedApproaches(diff);
  const performanceIssues = checkPerformance(files);

  // Categorize results
  canonicalViolations.forEach(v => {
    if (v.severity === 'warning') {
      results.warnings.push(v);
    } else {
      results.failed.push(v);
    }
  });

  orphanedFiles.forEach(f => results.failed.push(f));

  if (!tsCheck.passed) {
    results.failed.push({
      type: 'typescript',
      message: 'TypeScript compilation errors',
      fix: 'Fix TypeScript errors listed below',
      errors: tsCheck.errors
    });
  } else {
    results.passed.push('TypeScript compilation');
  }

  mixedApproaches.forEach(issue => results.warnings.push(issue));
  performanceIssues.forEach(issue => results.warnings.push(issue));

  // Additional passed checks
  if (canonicalViolations.filter(v => !v.severity).length === 0) {
    results.passed.push('Canonical standards compliance');
  }
  if (orphanedFiles.length === 0) {
    results.passed.push(`Import chain verification (${files.length}/${files.length} files used)`);
  }
  if (mixedApproaches.length === 0) {
    results.passed.push('Consistent approach patterns');
  }

  // Build report
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const report = {
    filesChanged: files.length,
    duration,
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings,
    result: results.failed.length === 0 ? 'passed' : 'failed'
  };

  // Output
  formatOutput(report);

  // Exit code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Code review failed:', error);
  process.exit(1);
});
