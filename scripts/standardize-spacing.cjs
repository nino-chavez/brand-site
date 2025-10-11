#!/usr/bin/env node

/**
 * 8pt Grid Standardization Script
 *
 * Automatically standardizes spacing values across the codebase to conform to
 * the 8pt grid system (IBM Carbon Design System standards).
 *
 * Valid 8pt increments: 0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96
 * Tailwind mapping: 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24
 *
 * Violations: gap-3, gap-5, gap-7, gap-9, mb-3, mb-5, mb-7, mt-3, mt-5, mt-7, etc.
 *
 * Usage:
 *   npm run design:standardize-spacing
 *   node scripts/standardize-spacing.js
 *   node scripts/standardize-spacing.js --dry-run  # Preview changes without applying
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose') || DRY_RUN;

// 8pt grid violations → corrections
// Mapping non-standard spacing values to nearest 8pt increment
const SPACING_REPLACEMENTS = {
  // Gap utilities (flex/grid gaps)
  'gap-3': 'gap-4',      // 12px → 16px (closest 8pt increment)
  'gap-5': 'gap-6',      // 20px → 24px
  'gap-7': 'gap-8',      // 28px → 32px
  'gap-9': 'gap-10',     // 36px → 40px
  'gap-11': 'gap-12',    // 44px → 48px
  'gap-13': 'gap-14',    // 52px → 56px
  'gap-15': 'gap-16',    // 60px → 64px

  // Gap-x (horizontal gap)
  'gap-x-3': 'gap-x-4',
  'gap-x-5': 'gap-x-6',
  'gap-x-7': 'gap-x-8',
  'gap-x-9': 'gap-x-10',

  // Gap-y (vertical gap)
  'gap-y-3': 'gap-y-4',
  'gap-y-5': 'gap-y-6',
  'gap-y-7': 'gap-y-8',
  'gap-y-9': 'gap-y-10',

  // Margin-bottom
  'mb-3': 'mb-4',
  'mb-5': 'mb-6',
  'mb-7': 'mb-8',
  'mb-9': 'mb-10',
  'mb-11': 'mb-12',
  'mb-13': 'mb-14',
  'mb-15': 'mb-16',

  // Margin-top
  'mt-3': 'mt-4',
  'mt-5': 'mt-6',
  'mt-7': 'mt-8',
  'mt-9': 'mt-10',
  'mt-11': 'mt-12',
  'mt-13': 'mt-14',
  'mt-15': 'mt-16',

  // Margin-left
  'ml-3': 'ml-4',
  'ml-5': 'ml-6',
  'ml-7': 'ml-8',
  'ml-9': 'ml-10',

  // Margin-right
  'mr-3': 'mr-4',
  'mr-5': 'mr-6',
  'mr-7': 'mr-8',
  'mr-9': 'mr-10',

  // Margin-x (horizontal)
  'mx-3': 'mx-4',
  'mx-5': 'mx-6',
  'mx-7': 'mx-8',
  'mx-9': 'mx-10',

  // Margin-y (vertical)
  'my-3': 'my-4',
  'my-5': 'my-6',
  'my-7': 'my-8',
  'my-9': 'my-10',

  // Margin (all sides)
  'm-3': 'm-4',
  'm-5': 'm-6',
  'm-7': 'm-8',
  'm-9': 'm-10',

  // Padding
  'p-3': 'p-4',
  'p-5': 'p-6',
  'p-7': 'p-8',
  'p-9': 'p-10',
  'p-11': 'p-12',
  'p-13': 'p-14',
  'p-15': 'p-16',

  // Padding-top
  'pt-3': 'pt-4',
  'pt-5': 'pt-6',
  'pt-7': 'pt-8',
  'pt-9': 'pt-10',

  // Padding-bottom
  'pb-3': 'pb-4',
  'pb-5': 'pb-6',
  'pb-7': 'pb-8',
  'pb-9': 'pb-10',

  // Padding-left
  'pl-3': 'pl-4',
  'pl-5': 'pl-6',
  'pl-7': 'pl-8',
  'pl-9': 'pl-10',

  // Padding-right
  'pr-3': 'pr-4',
  'pr-5': 'pr-6',
  'pr-7': 'pr-8',
  'pr-9': 'pr-10',

  // Padding-x (horizontal)
  'px-3': 'px-4',
  'px-5': 'px-6',
  'px-7': 'px-8',
  'px-9': 'px-10',

  // Padding-y (vertical)
  'py-3': 'py-4',
  'py-5': 'py-6',
  'py-7': 'py-8',
  'py-9': 'py-10',

  // Space-y (vertical spacing between children)
  'space-y-3': 'space-y-4',
  'space-y-5': 'space-y-6',
  'space-y-7': 'space-y-8',
  'space-y-9': 'space-y-10',
  'space-y-11': 'space-y-12',

  // Space-x (horizontal spacing between children)
  'space-x-3': 'space-x-4',
  'space-x-5': 'space-x-6',
  'space-x-7': 'space-x-8',
  'space-x-9': 'space-x-10',

  // Inset (top, right, bottom, left)
  'inset-3': 'inset-4',
  'inset-5': 'inset-6',
  'inset-7': 'inset-8',
};

// Statistics tracking
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  totalReplacements: 0,
  replacementsByType: {}
};

/**
 * Process a single file for spacing standardization
 * @param {string} filePath - Path to file
 * @returns {boolean} - True if file was modified
 */
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileModified = false;
  let fileReplacements = 0;

  // Apply each spacing replacement
  Object.entries(SPACING_REPLACEMENTS).forEach(([oldValue, newValue]) => {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${oldValue}\\b`, 'g');
    const matches = content.match(regex);

    if (matches && matches.length > 0) {
      content = content.replace(regex, newValue);
      fileModified = true;
      fileReplacements += matches.length;

      // Track by type
      if (!stats.replacementsByType[oldValue]) {
        stats.replacementsByType[oldValue] = 0;
      }
      stats.replacementsByType[oldValue] += matches.length;

      if (VERBOSE) {
        console.log(`  ${oldValue} → ${newValue} (${matches.length}x) in ${path.basename(filePath)}`);
      }
    }
  });

  // Write file if modified (unless dry run)
  if (fileModified && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  if (fileModified) {
    stats.filesModified++;
    stats.totalReplacements += fileReplacements;
    console.log(`✓ ${path.relative(process.cwd(), filePath)} (${fileReplacements} replacements)`);
  }

  stats.filesProcessed++;
  return fileModified;
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 8pt Grid Standardization Script\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }

  // Find all TypeScript/React files in src/ and components/
  const patterns = [
    'src/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!node_modules/**',
    '!dist/**',
    '!build/**'
  ];

  let allFiles = [];
  patterns.forEach(pattern => {
    if (!pattern.startsWith('!')) {
      const files = glob.sync(pattern, { cwd: process.cwd() });
      allFiles = allFiles.concat(files);
    }
  });

  console.log(`Found ${allFiles.length} files to process\n`);

  // Process each file
  allFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    try {
      processFile(fullPath);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 STANDARDIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files Processed:  ${stats.filesProcessed}`);
  console.log(`Files Modified:   ${stats.filesModified}`);
  console.log(`Total Replacements: ${stats.totalReplacements}`);

  if (Object.keys(stats.replacementsByType).length > 0) {
    console.log('\nTop Violations Fixed:');
    const sortedReplacements = Object.entries(stats.replacementsByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedReplacements.forEach(([violation, count]) => {
      const correction = SPACING_REPLACEMENTS[violation];
      console.log(`  ${violation.padEnd(15)} → ${correction.padEnd(15)} (${count}x)`);
    });
  }

  console.log('='.repeat(60));

  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN - no files were modified.');
    console.log('Run without --dry-run to apply changes.\n');
  } else if (stats.filesModified > 0) {
    console.log('\n✅ Spacing standardization complete!');
    console.log('All spacing values now conform to 8pt grid system.\n');
    console.log('Next steps:');
    console.log('  1. Review changes: git diff');
    console.log('  2. Test application: npm run dev');
    console.log('  3. Commit: git add . && git commit -m "chore: standardize spacing to 8pt grid"\n');
  } else {
    console.log('\n✨ No violations found - spacing already standardized!\n');
  }
}

// Run the script
main();
