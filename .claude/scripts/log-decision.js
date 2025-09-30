#!/usr/bin/env node

/**
 * Decision Logging Helper
 *
 * Logs architectural decisions in standardized format.
 * Used by Claude to document significant technical choices.
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DECISIONS_DIR = '.agent-os/decisions';

function generateDecisionId() {
  const date = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 6);
  return `${date}-${random}`;
}

function formatDecision(decision) {
  const {
    title,
    context,
    problem,
    alternatives = [],
    chosen_solution,
    rationale,
    consequences = { positive: [], negative: [] },
    related_files = [],
    tags = [],
    status = 'Accepted'
  } = decision;

  const timestamp = new Date().toISOString();
  const id = decision.id || generateDecisionId();

  const content = `# ${title}

**ID:** ${id}
**Date:** ${timestamp}
**Status:** ${status}

## Context

${context}

## Problem Statement

${problem}

${alternatives.length > 0 ? `## Alternatives Considered

${alternatives.map((alt, i) => `
### Option ${i + 1}: ${alt.name}

${alt.description}

**Pros:**
${alt.pros && alt.pros.length > 0 ? alt.pros.map(p => `- ${p}`).join('\n') : '- None specified'}

**Cons:**
${alt.cons && alt.cons.length > 0 ? alt.cons.map(c => `- ${c}`).join('\n') : '- None specified'}

${alt.trade_offs ? `**Trade-offs:** ${alt.trade_offs}` : ''}
`).join('\n')}` : ''}

## Decision

${chosen_solution}

## Rationale

${rationale}

## Consequences

### Positive
${consequences.positive && consequences.positive.length > 0
  ? consequences.positive.map(p => `- ${p}`).join('\n')
  : '- None specified'}

### Negative
${consequences.negative && consequences.negative.length > 0
  ? consequences.negative.map(n => `- ${n}`).join('\n')
  : '- None specified'}

### Risks
${consequences.risks && consequences.risks.length > 0
  ? consequences.risks.map(r => `- ${r}`).join('\n')
  : '- None identified'}

${related_files.length > 0 ? `## Related Files

${related_files.map(f => `- \`${f}\``).join('\n')}` : ''}

${tags.length > 0 ? `## Tags

${tags.map(t => `#${t}`).join(' ')}` : ''}

---

*This decision was logged automatically as part of the Agent OS workflow.*
`;

  return { id, content };
}

function logDecision(decision) {
  // Ensure decisions directory exists
  if (!existsSync(DECISIONS_DIR)) {
    mkdirSync(DECISIONS_DIR, { recursive: true });
  }

  const { id, content } = formatDecision(decision);
  const filename = `${id}-${decision.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filepath = join(DECISIONS_DIR, filename);

  writeFileSync(filepath, content);

  return {
    success: true,
    id,
    filepath,
    message: `Decision logged: ${filepath}`
  };
}

function loadDecisionTemplate() {
  return {
    title: '',
    context: '',
    problem: '',
    alternatives: [
      {
        name: '',
        description: '',
        pros: [],
        cons: [],
        trade_offs: ''
      }
    ],
    chosen_solution: '',
    rationale: '',
    consequences: {
      positive: [],
      negative: [],
      risks: []
    },
    related_files: [],
    tags: [],
    status: 'Accepted'
  };
}

async function main() {
  const args = process.argv.slice(2);

  // Command: template
  if (args[0] === 'template') {
    console.log(JSON.stringify(loadDecisionTemplate(), null, 2));
    process.exit(0);
  }

  // Command: log <json>
  if (args[0] === 'log') {
    if (!args[1]) {
      console.error('Usage: log-decision.js log <json>');
      console.error('   or: echo \'<json>\' | log-decision.js log -');
      process.exit(1);
    }

    let decisionJson;
    if (args[1] === '-') {
      // Read from stdin
      decisionJson = readFileSync(0, 'utf-8');
    } else {
      decisionJson = args[1];
    }

    try {
      const decision = JSON.parse(decisionJson);
      const result = logDecision(decision);

      console.log('✅ Decision logged successfully');
      console.log(`   ID: ${result.id}`);
      console.log(`   File: ${result.filepath}`);
      console.log();
      console.log('💡 Tip: Reference this decision in your commit message');
      console.log(`   Decision: ${result.id}`);

      process.exit(0);
    } catch (error) {
      console.error('❌ Error logging decision:', error.message);
      process.exit(1);
    }
  }

  // Command: list
  if (args[0] === 'list') {
    if (!existsSync(DECISIONS_DIR)) {
      console.log('No decisions logged yet.');
      process.exit(0);
    }

    const files = readdirSync(DECISIONS_DIR);
    const decisions = files.filter(f => f.endsWith('.md'));

    if (decisions.length === 0) {
      console.log('No decisions logged yet.');
      process.exit(0);
    }

    console.log(`📋 Logged Decisions (${decisions.length}):\n`);
    decisions.forEach(file => {
      console.log(`   - ${file}`);
    });
    process.exit(0);
  }

  // No command or help
  console.log('Decision Logging Helper');
  console.log();
  console.log('Usage:');
  console.log('  log-decision.js template              Show decision template');
  console.log('  log-decision.js log <json>            Log a decision from JSON');
  console.log('  log-decision.js log -                 Log a decision from stdin');
  console.log('  log-decision.js list                  List all logged decisions');
  console.log();
  console.log('Examples:');
  console.log('  # Get template');
  console.log('  node log-decision.js template');
  console.log();
  console.log('  # Log from file');
  console.log('  node log-decision.js log "$(cat decision.json)"');
  console.log();
  console.log('  # Log from stdin');
  console.log('  echo \'{"title":"...","context":"..."}\' | node log-decision.js log -');
  process.exit(0);
}

main();