/**
 * EXIF Data Extraction Script
 *
 * Extracts EXIF metadata from gallery images and generates JSON output
 * compatible with gallery-metadata.json structure.
 *
 * Usage: node scripts/extract-exif.js
 */

import exifr from 'exifr';
import { promises as fs } from 'fs';
import { join, basename } from 'path';

const GALLERY_DIR = 'public/images/gallery';
const OUTPUT_FILE = 'public/data/gallery-exif-extracted.json';

/**
 * Extract EXIF data from a single image
 */
async function extractImageExif(imagePath) {
  try {
    const exif = await exifr.parse(imagePath, {
      tiff: true,
      exif: true,
      gps: true,
      iptc: true,
      ifd0: true,
      ifd1: true,
      interop: true
    });

    if (!exif) {
      console.warn(`⚠️  No EXIF data found in ${basename(imagePath)}`);
      return null;
    }

    // Extract relevant fields
    const extracted = {
      // Camera info
      make: exif.Make || 'Unknown',
      model: exif.Model || 'Unknown',
      lens: exif.LensModel || exif.Lens || 'Unknown',

      // Exposure settings
      iso: exif.ISO || exif.ISOSpeedRatings || null,
      aperture: exif.FNumber ? `f/${exif.FNumber}` : null,
      shutterSpeed: exif.ExposureTime ? formatShutterSpeed(exif.ExposureTime) : null,
      focalLength: exif.FocalLength ? `${Math.round(exif.FocalLength)}mm` : null,
      focalLength35mm: exif.FocalLengthIn35mmFormat || null,

      // Date/time
      dateTaken: exif.DateTimeOriginal || exif.CreateDate || exif.DateTime || null,

      // GPS
      gps: (exif.latitude && exif.longitude) ? {
        latitude: exif.latitude,
        longitude: exif.longitude,
        altitude: exif.GPSAltitude || null
      } : null,

      // Additional settings
      whiteBalance: exif.WhiteBalance || null,
      flash: exif.Flash !== undefined ? formatFlash(exif.Flash) : null,
      meteringMode: exif.MeteringMode !== undefined ? formatMeteringMode(exif.MeteringMode) : null,
      exposureMode: exif.ExposureMode !== undefined ? formatExposureMode(exif.ExposureMode) : null,
      exposureProgram: exif.ExposureProgram !== undefined ? formatExposureProgram(exif.ExposureProgram) : null,

      // Image dimensions
      width: exif.ImageWidth || exif.ExifImageWidth || null,
      height: exif.ImageHeight || exif.ExifImageHeight || null,

      // Color space
      colorSpace: exif.ColorSpace !== undefined ? formatColorSpace(exif.ColorSpace) : null,

      // Raw EXIF for debugging
      _raw: {
        FNumber: exif.FNumber,
        ExposureTime: exif.ExposureTime,
        FocalLength: exif.FocalLength,
        ISO: exif.ISO
      }
    };

    return extracted;
  } catch (error) {
    console.error(`❌ Error extracting EXIF from ${basename(imagePath)}:`, error.message);
    return null;
  }
}

/**
 * Format shutter speed for display
 */
function formatShutterSpeed(exposureTime) {
  if (exposureTime >= 1) {
    return `${exposureTime}s`;
  }

  // Convert to fraction
  const denominator = Math.round(1 / exposureTime);
  return `1/${denominator}`;
}

/**
 * Format flash setting
 */
function formatFlash(flash) {
  const flashModes = {
    0: 'No Flash',
    1: 'Fired',
    5: 'Fired, Return not detected',
    7: 'Fired, Return detected',
    8: 'On, Did not fire',
    9: 'On, Fired',
    13: 'On, Return not detected',
    15: 'On, Return detected',
    16: 'Off, Did not fire',
    20: 'Off, Did not fire, Return not detected',
    24: 'Auto, Did not fire',
    25: 'Auto, Fired',
    29: 'Auto, Fired, Return not detected',
    31: 'Auto, Fired, Return detected',
    32: 'No flash function',
    48: 'Off, No flash function',
    65: 'Fired, Red-eye reduction',
    69: 'Fired, Red-eye reduction, Return not detected',
    71: 'Fired, Red-eye reduction, Return detected',
    73: 'On, Red-eye reduction',
    77: 'On, Red-eye reduction, Return not detected',
    79: 'On, Red-eye reduction, Return detected',
    80: 'Off, Red-eye reduction',
    88: 'Auto, Did not fire, Red-eye reduction',
    89: 'Auto, Fired, Red-eye reduction',
    93: 'Auto, Fired, Red-eye reduction, Return not detected',
    95: 'Auto, Fired, Red-eye reduction, Return detected'
  };

  return flashModes[flash] || `Flash mode ${flash}`;
}

/**
 * Format metering mode
 */
function formatMeteringMode(mode) {
  const modes = {
    0: 'Unknown',
    1: 'Average',
    2: 'Center-weighted average',
    3: 'Spot',
    4: 'Multi-spot',
    5: 'Multi-segment',
    6: 'Partial',
    255: 'Other'
  };

  return modes[mode] || `Mode ${mode}`;
}

/**
 * Format exposure mode
 */
function formatExposureMode(mode) {
  const modes = {
    0: 'Auto',
    1: 'Manual',
    2: 'Auto bracket'
  };

  return modes[mode] || `Mode ${mode}`;
}

/**
 * Format exposure program
 */
function formatExposureProgram(program) {
  const programs = {
    0: 'Not defined',
    1: 'Manual',
    2: 'Program AE',
    3: 'Aperture-priority AE',
    4: 'Shutter speed priority AE',
    5: 'Creative (Slow speed)',
    6: 'Action (High speed)',
    7: 'Portrait',
    8: 'Landscape',
    9: 'Bulb'
  };

  return programs[program] || `Program ${program}`;
}

/**
 * Format color space
 */
function formatColorSpace(colorSpace) {
  const spaces = {
    1: 'sRGB',
    2: 'Adobe RGB',
    65535: 'Uncalibrated'
  };

  return spaces[colorSpace] || `Color space ${colorSpace}`;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Extracting EXIF data from gallery images...\n');

  try {
    // Read all portfolio images
    const files = await fs.readdir(GALLERY_DIR);
    const imageFiles = files
      .filter(f => f.startsWith('portfolio-') && f.endsWith('.jpg'))
      .sort();

    console.log(`Found ${imageFiles.length} portfolio images\n`);

    const results = [];

    for (const file of imageFiles) {
      const imagePath = join(GALLERY_DIR, file);
      const imageId = file.replace('.jpg', '');

      console.log(`Processing: ${file}`);
      const exifData = await extractImageExif(imagePath);

      if (exifData) {
        results.push({
          id: imageId,
          filename: file,
          exif: exifData,

          // Generate metadata format
          metadata: {
            camera: `${exifData.make} ${exifData.model}`,
            lens: exifData.lens,
            iso: exifData.iso,
            aperture: exifData.aperture,
            shutterSpeed: exifData.shutterSpeed,
            focalLength: exifData.focalLength,
            dateTaken: exifData.dateTaken ? new Date(exifData.dateTaken).toISOString() : null,
            location: exifData.gps ? `GPS: ${exifData.gps.latitude.toFixed(6)}, ${exifData.gps.longitude.toFixed(6)}` : null
          }
        });

        console.log(`  ✅ Camera: ${exifData.make} ${exifData.model}`);
        console.log(`  ✅ Lens: ${exifData.lens}`);
        console.log(`  ✅ Settings: ISO ${exifData.iso}, ${exifData.aperture}, ${exifData.shutterSpeed}, ${exifData.focalLength}`);
        if (exifData.gps) {
          console.log(`  ✅ GPS: ${exifData.gps.latitude.toFixed(6)}, ${exifData.gps.longitude.toFixed(6)}`);
        }
      }

      console.log('');
    }

    // Write results to JSON file
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify({ images: results }, null, 2),
      'utf8'
    );

    console.log(`\n✅ EXIF data extracted for ${results.length} images`);
    console.log(`📄 Output written to: ${OUTPUT_FILE}`);
    console.log('\nNext steps:');
    console.log('1. Review the extracted data in gallery-exif-extracted.json');
    console.log('2. Update gallery-metadata.json with the real camera data');
    console.log('3. Add descriptive alt text and project context manually');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();