#!/usr/bin/env node

/**
 * CLI entry point for subagent generation
 */

const path = require('path');
const SubagentGenerator = require('../generators/create-subagent');

// Ensure we can find the generators from any location
process.chdir(path.dirname(__dirname));

const generator = new SubagentGenerator();
generator.program.parse(process.argv);