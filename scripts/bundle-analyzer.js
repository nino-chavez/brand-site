#!/usr/bin/env node

/**
 * Bundle Size Analyzer for Viewfinder Components
 * Analyzes the production build and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatSize(bytes) {
  const sizes = ['B', 'KB', 'MB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function analyzeBundle() {
  console.log('\n🔍 Viewfinder Bundle Analysis\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Get all JavaScript files
  const jsFiles = fs.readdirSync(ASSETS_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => ({
      name: file,
      path: path.join(ASSETS_DIR, file),
      size: getFileSize(path.join(ASSETS_DIR, file))
    }))
    .sort((a, b) => b.size - a.size);

  let totalSize = 0;
  console.log('📦 JavaScript Bundles:');
  jsFiles.forEach(file => {
    totalSize += file.size;
    console.log(`  ${file.name}: ${formatSize(file.size)}`);
  });

  console.log(`\n📊 Total Bundle Size: ${formatSize(totalSize)}\n`);

  // Analyze large files
  const largeFiles = jsFiles.filter(file => file.size > 100 * 1024); // > 100KB
  if (largeFiles.length > 0) {
    console.log('⚠️  Large Files (>100KB):');
    largeFiles.forEach(file => {
      console.log(`  ${file.name}: ${formatSize(file.size)}`);
    });
    console.log('');
  }

  // Optimization recommendations
  console.log('🚀 Optimization Recommendations:\n');

  if (totalSize > 300 * 1024) {
    console.log('• Consider code splitting for components >50KB');
  }

  console.log('• Implement lazy loading for:');
  console.log('  - EXIF Metadata component (~15KB estimated)');
  console.log('  - Shutter Effects (~10KB estimated)');
  console.log('  - Keyboard Controls (~8KB estimated)');
  console.log('');

  if (totalSize > 200 * 1024) {
    console.log('• Consider tree shaking optimization');
    console.log('• Review third-party dependencies');
  }

  // Performance targets
  console.log('🎯 Performance Targets:');
  console.log(`• Current: ${formatSize(totalSize)}`);
  console.log('• Target: <200KB (Good)');
  console.log('• Target: <150KB (Excellent)');
  console.log('');

  // Gzip estimates
  const estimatedGzipped = Math.round(totalSize * 0.3); // Rough estimate
  console.log(`📦 Estimated Gzipped: ${formatSize(estimatedGzipped)}`);
  console.log('• Target Gzipped: <50KB (Excellent)');
  console.log('• Target Gzipped: <75KB (Good)');

  // Performance scores
  const performanceScore = calculatePerformanceScore(totalSize);
  console.log(`\n⭐ Bundle Performance Score: ${performanceScore}/100`);

  if (performanceScore >= 90) {
    console.log('🎉 Excellent bundle size optimization!');
  } else if (performanceScore >= 70) {
    console.log('✅ Good bundle size, room for improvement');
  } else {
    console.log('⚠️  Bundle size needs optimization');
  }

  console.log('\n');
}

function calculatePerformanceScore(totalSize) {
  // Score based on bundle size thresholds
  if (totalSize < 100 * 1024) return 100; // <100KB = 100
  if (totalSize < 150 * 1024) return 90;  // <150KB = 90
  if (totalSize < 200 * 1024) return 80;  // <200KB = 80
  if (totalSize < 250 * 1024) return 70;  // <250KB = 70
  if (totalSize < 300 * 1024) return 60;  // <300KB = 60
  return Math.max(20, 60 - Math.floor((totalSize - 300 * 1024) / (50 * 1024)) * 10);
}

// Run analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeBundle();
}

export { analyzeBundle, formatSize, calculatePerformanceScore };