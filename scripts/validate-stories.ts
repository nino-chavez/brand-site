#!/usr/bin/env tsx
/**
 * Story Validation Script
 *
 * Validates that all components have corresponding stories
 * and that stories are up-to-date with component props.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as ts from 'typescript';

interface ValidationResult {
  component: string;
  hasStory: boolean;
  issues: string[];
}

const IGNORE_COMPONENTS = [
  'index.ts',
  'index.tsx',
  '.test.',
  '.spec.',
];

async function findComponentsAndStories(dir: string): Promise<Map<string, { component: string; story?: string }>> {
  const files = new Map<string, { component: string; story?: string }>();
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await findComponentsAndStories(fullPath);
      subFiles.forEach((value, key) => files.set(key, value));
    } else if (entry.name.endsWith('.tsx')) {
      if (IGNORE_COMPONENTS.some(ignore => entry.name.includes(ignore))) {
        continue;
      }

      const baseName = entry.name.replace(/\.(stories\.)?tsx$/, '');

      if (entry.name.endsWith('.stories.tsx')) {
        const existing = files.get(baseName) || { component: '', story: fullPath };
        existing.story = fullPath;
        files.set(baseName, existing);
      } else {
        const existing = files.get(baseName) || { component: fullPath };
        existing.component = fullPath;
        files.set(baseName, existing);
      }
    }
  }

  return files;
}

async function validateStory(componentPath: string, storyPath: string): Promise<string[]> {
  const issues: string[] = [];

  try {
    // Read both files
    const componentContent = await fs.readFile(componentPath, 'utf-8');
    const storyContent = await fs.readFile(storyPath, 'utf-8');

    // Parse component to extract props
    const componentSource = ts.createSourceFile(
      componentPath,
      componentContent,
      ts.ScriptTarget.Latest,
      true
    );

    const componentProps = new Set<string>();
    const componentName = path.basename(componentPath, '.tsx');

    // Find props interface
    ts.forEachChild(componentSource, (node) => {
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = node.name.text;

        if (interfaceName === `${componentName}Props` || interfaceName === 'Props') {
          node.members.forEach((member) => {
            if (ts.isPropertySignature(member) && member.name) {
              componentProps.add(member.name.getText(componentSource));
            }
          });
        }
      }
    });

    // Check if story has argTypes for all props
    if (componentProps.size > 0 && !storyContent.includes('argTypes:')) {
      issues.push('Missing argTypes definition');
    }

    // Check if story imports component correctly
    if (!storyContent.includes(`import ${componentName} from './${componentName}'`)) {
      issues.push(`Incorrect import statement (expected: import ${componentName} from './${componentName}')`);
    }

    // Check if story has Default variant
    if (!storyContent.includes('export const Default: Story')) {
      issues.push('Missing Default story variant');
    }

    // Check if story has autodocs tag
    if (!storyContent.includes("tags: ['autodocs']")) {
      issues.push("Missing 'autodocs' tag");
    }

    // Check for accessibility config
    if (!storyContent.includes('a11y:')) {
      issues.push('Missing accessibility configuration');
    }

  } catch (error) {
    issues.push(`Validation error: ${(error as Error).message}`);
  }

  return issues;
}

async function main() {
  console.log('🔍 Validating stories...\n');

  const componentsDir = path.join(process.cwd(), 'src/components');
  const files = await findComponentsAndStories(componentsDir);

  const results: ValidationResult[] = [];
  let missingStories = 0;
  let totalIssues = 0;

  for (const [name, paths] of files.entries()) {
    const result: ValidationResult = {
      component: name,
      hasStory: !!paths.story,
      issues: [],
    };

    if (!paths.component) {
      // Story without component (orphaned story)
      result.issues.push('Orphaned story (no matching component)');
    } else if (!paths.story) {
      // Component without story
      missingStories++;
      result.issues.push('Missing story file');
    } else {
      // Validate story against component
      const issues = await validateStory(paths.component, paths.story);
      result.issues = issues;
    }

    if (result.issues.length > 0) {
      results.push(result);
      totalIssues += result.issues.length;
    }
  }

  // Print results
  if (results.length === 0) {
    console.log('✅ All stories are valid!\n');
    console.log(`📊 Summary:`);
    console.log(`   • Components: ${files.size}`);
    console.log(`   • Stories: ${Array.from(files.values()).filter(f => f.story).length}`);
    console.log(`   • Issues: 0\n`);
    return;
  }

  console.log('⚠️  Found issues:\n');

  results.forEach(result => {
    const status = result.hasStory ? '⚠️' : '❌';
    console.log(`${status} ${result.component}`);
    result.issues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
    console.log('');
  });

  console.log(`📊 Summary:`);
  console.log(`   • Components: ${files.size}`);
  console.log(`   • Missing stories: ${missingStories}`);
  console.log(`   • Total issues: ${totalIssues}\n`);

  console.log(`💡 To generate missing stories, run:`);
  console.log(`   npm run stories:generate\n`);

  process.exit(totalIssues > 0 ? 1 : 0);
}

main().catch(console.error);
