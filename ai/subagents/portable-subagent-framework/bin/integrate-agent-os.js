#!/usr/bin/env node

/**
 * CLI entry point for agent-os integration
 */

const path = require('path');
const AgentOSIntegrator = require('../generators/integrate-agent-os');

// Ensure we can find the generators from any location
process.chdir(path.dirname(__dirname));

const integrator = new AgentOSIntegrator();
integrator.program.parse(process.argv);