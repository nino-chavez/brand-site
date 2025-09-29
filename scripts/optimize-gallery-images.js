/**
 * Gallery Image Optimization Pipeline
 *
 * Generates responsive image sizes for all portfolio images:
 * - Thumbnail: 300x200 (WebP + JPEG fallback)
 * - Preview: 800x600 (WebP + JPEG fallback)
 * - Full: 1920x1280 (WebP + JPEG fallback)
 *
 * Target sizes: thumbnails <30KB, preview <100KB, full <300KB
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import { join, basename, dirname } from 'path';

const SOURCE_DIR = 'public/images/gallery';
const OUTPUT_DIRS = {
  thumbs: 'public/images/gallery/thumbs',
  preview: 'public/images/gallery/preview',
  full: 'public/images/gallery/full',
};

const SIZES = {
  thumbs: { width: 300, height: 200, quality: 85 },
  preview: { width: 800, height: 600, quality: 85 },
  full: { width: 1920, height: 1280, quality: 80 },
};

/**
 * Ensure output directories exist
 */
async function ensureDirectories() {
  for (const dir of Object.values(OUTPUT_DIRS)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Format bytes for human-readable output
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Process a single image to a specific size
 */
async function processImage(sourcePath, outputDir, size, filename) {
  const baseFilename = basename(filename, '.jpg');

  // Generate WebP version
  const webpPath = join(outputDir, `${baseFilename}.webp`);
  await sharp(sourcePath)
    .resize(size.width, size.height, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: size.quality })
    .toFile(webpPath);

  const webpStats = await fs.stat(webpPath);

  // Generate JPEG fallback
  const jpegPath = join(outputDir, `${baseFilename}.jpg`);
  await sharp(sourcePath)
    .resize(size.width, size.height, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: size.quality })
    .toFile(jpegPath);

  const jpegStats = await fs.stat(jpegPath);

  return {
    webp: { path: webpPath, size: webpStats.size },
    jpeg: { path: jpegPath, size: jpegStats.size },
  };
}

/**
 * Process all images
 */
async function main() {
  console.log('🖼️  Optimizing gallery images...\n');

  try {
    // Ensure output directories exist
    await ensureDirectories();
    console.log('✅ Created output directories\n');

    // Read source images
    const files = await fs.readdir(SOURCE_DIR);
    const imageFiles = files
      .filter(f => f.startsWith('portfolio-') && f.endsWith('.jpg'))
      .sort();

    console.log(`Found ${imageFiles.length} portfolio images\n`);

    const results = {
      thumbs: [],
      preview: [],
      full: [],
    };

    // Process each image
    for (const file of imageFiles) {
      const sourcePath = join(SOURCE_DIR, file);
      console.log(`Processing: ${file}`);

      // Process thumbnails
      const thumbResult = await processImage(
        sourcePath,
        OUTPUT_DIRS.thumbs,
        SIZES.thumbs,
        file
      );
      results.thumbs.push(thumbResult);
      console.log(`  📐 Thumbnail: ${formatBytes(thumbResult.webp.size)} WebP, ${formatBytes(thumbResult.jpeg.size)} JPEG`);

      // Process previews
      const previewResult = await processImage(
        sourcePath,
        OUTPUT_DIRS.preview,
        SIZES.preview,
        file
      );
      results.preview.push(previewResult);
      console.log(`  📐 Preview: ${formatBytes(previewResult.webp.size)} WebP, ${formatBytes(previewResult.jpeg.size)} JPEG`);

      // Process full-size
      const fullResult = await processImage(
        sourcePath,
        OUTPUT_DIRS.full,
        SIZES.full,
        file
      );
      results.full.push(fullResult);
      console.log(`  📐 Full: ${formatBytes(fullResult.webp.size)} WebP, ${formatBytes(fullResult.jpeg.size)} JPEG`);

      console.log('');
    }

    // Calculate statistics
    const avgSizes = {
      thumbs: {
        webp: results.thumbs.reduce((sum, r) => sum + r.webp.size, 0) / results.thumbs.length,
        jpeg: results.thumbs.reduce((sum, r) => sum + r.jpeg.size, 0) / results.thumbs.length,
      },
      preview: {
        webp: results.preview.reduce((sum, r) => sum + r.webp.size, 0) / results.preview.length,
        jpeg: results.preview.reduce((sum, r) => sum + r.jpeg.size, 0) / results.preview.length,
      },
      full: {
        webp: results.full.reduce((sum, r) => sum + r.webp.size, 0) / results.full.length,
        jpeg: results.full.reduce((sum, r) => sum + r.jpeg.size, 0) / results.full.length,
      },
    };

    console.log('✅ Optimization complete!\n');
    console.log('📊 Average file sizes:');
    console.log(`   Thumbnails: ${formatBytes(avgSizes.thumbs.webp)} WebP, ${formatBytes(avgSizes.thumbs.jpeg)} JPEG`);
    console.log(`   Preview: ${formatBytes(avgSizes.preview.webp)} WebP, ${formatBytes(avgSizes.preview.jpeg)} JPEG`);
    console.log(`   Full: ${formatBytes(avgSizes.full.webp)} WebP, ${formatBytes(avgSizes.full.jpeg)} JPEG`);

    console.log('\n🎯 Target compliance:');
    console.log(`   Thumbnails <30KB: ${avgSizes.thumbs.webp < 30 * 1024 ? '✅' : '❌'}`);
    console.log(`   Preview <100KB: ${avgSizes.preview.webp < 100 * 1024 ? '✅' : '❌'}`);
    console.log(`   Full <300KB: ${avgSizes.full.webp < 300 * 1024 ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();