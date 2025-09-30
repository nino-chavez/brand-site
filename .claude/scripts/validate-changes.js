#!/usr/bin/env node

/**
 * Agent OS Quality Gate Validator
 *
 * Analyzes staged changes and determines which quality gates should run.
 * Used by Claude before creating commits to ensure quality standards.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Agent activation rules (path + keyword-based triggers)
const AGENT_RULES = {
  'canvas-architecture-guardian': {
    paths: [
      'src/components/canvas/**',
      'src/hooks/*canvas*',
      'src/hooks/*3d*',
      'src/utils/*webgl*'
    ],
    keywords: [
      'WebGL',
      'canvas',
      'THREE',
      'requestAnimationFrame',
      'getContext',
      'lightbox',
      'navigation'
    ]
  },
  'accessibility-validator': {
    paths: [
      'src/components/**/*.tsx',
      'src/App.tsx'
    ],
    keywords: [
      'aria-',
      'role=',
      'tabIndex',
      'keyboard',
      'focus',
      'screen reader',
      'WCAG',
      'accessibility',
      'a11y'
    ]
  },
  'performance-budget-enforcer': {
    paths: [
      'src/**/*.tsx',
      'src/**/*.ts',
      'package.json',
      'vite.config.ts'
    ],
    keywords: [
      'import ',
      'lazy',
      'Suspense',
      'useMemo',
      'useCallback',
      'performance',
      'optimization',
      'bundle'
    ]
  },
  'photography-metaphor-validator': {
    paths: [
      'src/components/gallery/**',
      'src/types/gallery.ts',
      'src/data/gallery-images.ts'
    ],
    keywords: [
      'camera',
      'lens',
      'aperture',
      'shutter',
      'ISO',
      'shot',
      'exposure',
      'focus',
      'photography'
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
    ],
    keywords: [
      'export function',
      'export const',
      'export class',
      'export default'
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

function analyzeFileContent(filePath) {
  // Skip files that shouldn't trigger keyword matching
  const skipPatterns = [
    '.claude/CLAUDE.md',       // Project context (references agents)
    '.claude/scripts/',        // Validation scripts
    '.claude/workflows/',      // Workflow documentation (contains all keywords)
    '.claude/agents/',         // Agent specifications (contains keywords)
    '.agent-os/',              // Agent OS documentation
    'node_modules/',           // Dependencies
    /\.(jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$/i  // Binary files
  ];

  for (const pattern of skipPatterns) {
    if (pattern instanceof RegExp) {
      if (pattern.test(filePath)) return '';
    } else {
      if (filePath.includes(pattern)) return '';
    }
  }

  try {
    if (existsSync(filePath)) {
      return readFileSync(filePath, 'utf-8');
    }
    return '';
  } catch (error) {
    // File might be binary or unreadable
    return '';
  }
}

function containsKeywords(content, keywords) {
  if (!keywords || keywords.length === 0) return false;

  return keywords.some(keyword => {
    // Case-insensitive search for keywords
    const regex = new RegExp(keyword, 'i');
    return regex.test(content);
  });
}

function determineActiveAgents(stagedFiles) {
  const activeAgents = new Map(); // Track files that triggered each agent

  for (const [agentName, rules] of Object.entries(AGENT_RULES)) {
    const matchingFiles = [];

    for (const file of stagedFiles) {
      const excluded = matchesExclude(file, rules.exclude);
      if (excluded) continue;

      // Path-based matching
      const pathMatch = matchesPath(file, rules.paths);

      // Keyword-based matching (only for source files)
      let keywordMatch = false;
      if (rules.keywords && file.match(/\.(tsx?|jsx?|md)$/)) {
        const content = analyzeFileContent(file);
        keywordMatch = containsKeywords(content, rules.keywords);
      }

      // Agent activates if either path OR keywords match
      if (pathMatch || keywordMatch) {
        matchingFiles.push({
          file,
          reason: pathMatch ? 'path' : 'keyword'
        });
      }
    }

    if (matchingFiles.length > 0) {
      activeAgents.set(agentName, matchingFiles);
    }
  }

  return activeAgents;
}

function generateValidationReport(agentsMap, stagedFiles) {
  const agentDetails = {};

  for (const [agentName, matchingFiles] of agentsMap.entries()) {
    agentDetails[agentName] = matchingFiles.map(m => ({
      file: m.file,
      trigger: m.reason
    }));
  }

  const report = {
    timestamp: new Date().toISOString(),
    stagedFiles: stagedFiles,
    activeAgents: Array.from(agentsMap.keys()),
    agentTriggers: agentDetails,
    requiredValidations: agentsMap.size
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

  const activeAgentsMap = determineActiveAgents(stagedFiles);

  if (activeAgentsMap.size === 0) {
    console.log('✅ No quality gates triggered for these changes.');
    console.log('   Safe to commit.');
    process.exit(0);
  }

  console.log(`⚡ Quality gates activated (${activeAgentsMap.size}):`);
  for (const [agentName, matchingFiles] of activeAgentsMap.entries()) {
    console.log(`   - ${agentName}`);
    matchingFiles.forEach(match => {
      console.log(`     • ${match.file} (${match.reason})`);
    });
  }
  console.log();

  const report = generateValidationReport(activeAgentsMap, stagedFiles);

  console.log('📋 Validation Report:');
  console.log(JSON.stringify(report, null, 2));
  console.log();

  console.log('⚠️  ACTION REQUIRED:');
  console.log('   Claude should invoke these agents before committing:');
  Array.from(activeAgentsMap.keys()).forEach(agent => {
    console.log(`   → Task(subagent_type="general-purpose", prompt="You are ${agent}...")`);
  });
  console.log();
  console.log('   After validation passes, commit is safe.');

  // Exit with special code to indicate validation required
  process.exit(42);
}

main();