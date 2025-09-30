#!/usr/bin/env node

/**
 * Agent OS Quality Gate Validator
 *
 * Analyzes staged changes and determines which quality gates should run.
 * Used by Claude before creating commits to ensure quality standards.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Agent activation rules (path-based triggers only - more reliable)
const AGENT_RULES = {
  'canvas-architecture-guardian': {
    paths: [
      'src/components/canvas/**',
      'src/hooks/*canvas*',
      'src/hooks/*3d*',
      'src/utils/*webgl*'
    ]
  },
  'accessibility-validator': {
    paths: [
      'src/components/**/*.tsx',
      'src/App.tsx'
    ]
  },
  'performance-budget-enforcer': {
    paths: [
      'src/**/*.tsx',
      'src/**/*.ts',
      'package.json',
      'vite.config.ts'
    ]
  },
  'photography-metaphor-validator': {
    paths: [
      'src/components/gallery/**',
      'src/types/gallery.ts',
      'src/data/gallery-images.ts'
    ]
  },
  'test-coverage-guardian': {
    paths: [
      'src/**/*.tsx',
      'src/**/*.ts'
    ],
    exclude: [
      'src/**/*.test.tsx',
      'src/**/*.test.ts',
      'src/test/**'
    ]
  }
};

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

function getStagedDiff() {
  try {
    return execSync('git diff --cached', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
  } catch (error) {
    return '';
  }
}

function matchesPath(filePath, patterns) {
  return patterns.some(pattern => {
    // Convert glob pattern to regex
    const regexPattern = '^' + pattern
      .replace(/\./g, '\\.') // Escape dots first
      .replace(/\*\*/g, '___DOUBLESTAR___') // Temporarily replace **
      .replace(/\*/g, '[^/]*') // Replace single * with non-slash chars
      .replace(/___DOUBLESTAR___/g, '.*') // Replace ** with any chars
      + '$';
    const regex = new RegExp(regexPattern);
    return regex.test(filePath);
  });
}

function matchesExclude(filePath, excludePatterns) {
  if (!excludePatterns) return false;
  return excludePatterns.some(pattern => {
    const regexPattern = '^' + pattern
      .replace(/\./g, '\\.') // Escape dots first
      .replace(/\*\*/g, '___DOUBLESTAR___') // Temporarily replace **
      .replace(/\*/g, '[^/]*') // Replace single * with non-slash chars
      .replace(/___DOUBLESTAR___/g, '.*') // Replace ** with any chars
      + '$';
    const regex = new RegExp(regexPattern);
    return regex.test(filePath);
  });
}

function determineActiveAgents(stagedFiles) {
  const activeAgents = new Set();

  for (const [agentName, rules] of Object.entries(AGENT_RULES)) {
    // Check if any staged file matches agent's path patterns
    const matchingFiles = stagedFiles.filter(file => {
      const pathMatch = matchesPath(file, rules.paths);
      const excluded = matchesExclude(file, rules.exclude);
      return pathMatch && !excluded;
    });

    if (matchingFiles.length > 0) {
      activeAgents.add(agentName);
    }
  }

  return Array.from(activeAgents);
}

function generateValidationReport(agents, stagedFiles) {
  const report = {
    timestamp: new Date().toISOString(),
    stagedFiles: stagedFiles,
    activeAgents: agents,
    requiredValidations: agents.length
  };

  return report;
}

function main() {
  console.log('🔍 Agent OS Quality Gate Validator\n');

  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log('ℹ️  No staged changes detected.');
    console.log('   Use: git add <files>');
    process.exit(0);
  }

  console.log(`📁 Staged files (${stagedFiles.length}):`);
  stagedFiles.forEach(file => console.log(`   - ${file}`));
  console.log();

  const activeAgents = determineActiveAgents(stagedFiles);

  if (activeAgents.length === 0) {
    console.log('✅ No quality gates triggered for these changes.');
    console.log('   Safe to commit.');
    process.exit(0);
  }

  console.log(`⚡ Quality gates activated (${activeAgents.length}):`);
  activeAgents.forEach(agent => {
    const agentFile = join(__dirname, '..', 'agents', `${agent}.md`);
    console.log(`   - ${agent}`);
  });
  console.log();

  const report = generateValidationReport(activeAgents, stagedFiles);

  console.log('📋 Validation Report:');
  console.log(JSON.stringify(report, null, 2));
  console.log();

  console.log('⚠️  ACTION REQUIRED:');
  console.log('   Claude should invoke these agents before committing:');
  activeAgents.forEach(agent => {
    console.log(`   → Task(subagent_type="general-purpose", prompt="You are ${agent}...")`);
  });
  console.log();
  console.log('   After validation passes, commit is safe.');

  // Exit with special code to indicate validation required
  process.exit(42);
}

main();