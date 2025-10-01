#!/usr/bin/env tsx
/**
 * Component Watch Script
 *
 * Watches for component file changes and automatically generates
 * or updates stories when components are added or modified.
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const COMPONENTS_DIR = path.join(process.cwd(), 'src/components');
const DEBOUNCE_MS = 1000;

const watchedComponents = new Map<string, NodeJS.Timeout>();

console.log('👀 Watching components for changes...\n');
console.log(`📁 Directory: ${COMPONENTS_DIR}\n`);

async function handleComponentChange(filePath: string) {
  const fileName = path.basename(filePath);

  // Ignore story files and test files
  if (fileName.endsWith('.stories.tsx') || fileName.includes('.test.') || fileName.includes('.spec.')) {
    return;
  }

  // Only process .tsx files
  if (!fileName.endsWith('.tsx')) {
    return;
  }

  const componentName = fileName.replace('.tsx', '');
  const storyPath = filePath.replace('.tsx', '.stories.tsx');

  // Check if story exists
  const storyExists = fs.existsSync(storyPath);

  if (storyExists) {
    console.log(`🔄 ${componentName} - Component modified, story already exists`);
    return;
  }

  console.log(`🆕 ${componentName} - New component detected, generating story...`);

  try {
    await execAsync(`tsx scripts/generate-stories.ts ${componentName}`);
    console.log(`✅ ${componentName} - Story generated successfully\n`);
  } catch (error) {
    console.error(`❌ ${componentName} - Failed to generate story:`, (error as Error).message, '\n');
  }
}

function setupWatcher(dir: string) {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    const filePath = path.join(dir, filename);

    // Debounce changes
    if (watchedComponents.has(filePath)) {
      clearTimeout(watchedComponents.get(filePath)!);
    }

    const timeout = setTimeout(() => {
      handleComponentChange(filePath);
      watchedComponents.delete(filePath);
    }, DEBOUNCE_MS);

    watchedComponents.set(filePath, timeout);
  });
}

setupWatcher(COMPONENTS_DIR);

console.log('✨ Watcher started. Press Ctrl+C to stop.\n');

// Keep process alive
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping watcher...\n');
  process.exit(0);
});
