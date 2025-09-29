/**
 * Gallery Canvas Integration TypeScript Interface Definitions
 *
 * TypeScript interfaces for gallery-specific content system extending
 * the ContentAdapter progressive disclosure pattern for image-heavy content
 * within the photographer's lightbox canvas metaphor.
 *
 * @fileoverview TypeScript interfaces for gallery canvas integration
 * @version 1.0.0
 * @since Phase 3 - Gallery Canvas Integration
 * @see .agent-os/specs/2025-09-29-gallery-canvas-integration/spec.md
 */

import type { ContentLevel } from './section-content';
import type { SpatialPhotoWorkflowSection } from './canvas';

// ============================================================================
// CORE GALLERY TYPES
// ============================================================================

/**
 * Gallery image data structure with responsive URLs and metadata
 * Represents a single portfolio image with all required assets and information
 */
export interface GalleryImage {
  /** Unique identifier for the image (e.g., "portfolio-00") */
  id: string;

  /** Original filename */
  filename: string;

  /** Descriptive alt text for accessibility (WCAG AAA requirement) */
  alt: string;

  /** Category tags for filtering (e.g., ["action-sports", "skateboarding"]) */
  categories: string[];

  /** Responsive image URLs for different sizes and formats */
  urls: GalleryImageUrls;

  /** Camera settings and project metadata */
  metadata: ImageMetadata;

  /** Display order (0-based index, lower = earlier in gallery) */
  displayOrder?: number;

  /** Whether image is featured (shown in PREVIEW level) */
  isFeatured?: boolean;
}

/**
 * Responsive image URLs for progressive loading
 * Provides multiple formats and sizes for optimal performance
 */
export interface GalleryImageUrls {
  /** Thumbnail (300x200) for contact sheet grid - WebP format */
  thumbnail: string;

  /** Preview (800x600) for modal initial load - WebP format */
  preview: string;

  /** Full resolution (1920x1280) for detailed viewing - WebP format */
  full: string;

  /** JPEG fallback for browsers without WebP support */
  fallback: string;
}

/**
 * Image metadata including EXIF data and project context
 * Supports progressive disclosure from SUMMARY to TECHNICAL levels
 */
export interface ImageMetadata {
  /** Camera body used (e.g., "Canon EOS R5") */
  camera: string;

  /** Lens used (e.g., "RF 24-70mm f/2.8") */
  lens: string;

  /** ISO sensitivity setting */
  iso: number;

  /** Aperture setting (e.g., "f/4.0") */
  aperture: string;

  /** Shutter speed (e.g., "1/1000") */
  shutterSpeed: string;

  /** Focal length (e.g., "50mm") */
  focalLength: string;

  /** Date image was taken (ISO 8601 format) */
  dateTaken: string;

  /** Location where image was captured */
  location?: string;

  /** Project context and description */
  projectContext?: string;

  /** Searchable tags */
  tags: string[];

  /** Post-processing notes (TECHNICAL level) */
  processingNotes?: string;
}

/**
 * Camera equipment details for TECHNICAL level disclosure
 * Extended equipment information for photography enthusiasts
 */
export interface CameraEquipment {
  /** Equipment category */
  type: 'body' | 'lens' | 'accessory';

  /** Equipment name */
  name: string;

  /** Detailed specifications */
  specifications?: {
    /** Sensor size (e.g., "Full Frame") */
    sensor?: string;
    /** Maximum aperture */
    maxAperture?: string;
    /** Focal range */
    focalRange?: string;
    /** Additional specs */
    [key: string]: string | undefined;
  };
}

/**
 * Complete EXIF data structure for TECHNICAL level
 * Full camera metadata extracted from image file
 */
export interface ExifData {
  /** Camera make */
  make: string;

  /** Camera model */
  model: string;

  /** Lens model */
  lensModel?: string;

  /** ISO speed */
  iso: number;

  /** F-number */
  fNumber: number;

  /** Exposure time (seconds) */
  exposureTime: number;

  /** Focal length (mm) */
  focalLength: number;

  /** Focal length in 35mm equivalent */
  focalLength35mm?: number;

  /** Date/time original */
  dateTimeOriginal: string;

  /** GPS coordinates if available */
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };

  /** White balance mode */
  whiteBalance?: string;

  /** Flash mode */
  flash?: string;

  /** Metering mode */
  meteringMode?: string;

  /** Color space */
  colorSpace?: string;

  /** Image dimensions */
  dimensions: {
    width: number;
    height: number;
  };

  /** Additional EXIF fields */
  [key: string]: unknown;
}

// ============================================================================
// GALLERY CONTENT ADAPTER TYPES
// ============================================================================

/**
 * Gallery content organized by progressive disclosure levels
 * Extends ContentLevel pattern for image-heavy content
 */
export interface GalleryContentLevels {
  /** PREVIEW: Single gallery thumbnail with image count */
  [ContentLevel.PREVIEW]: {
    /** Representative thumbnail URL */
    thumbnailUrl: string;
    /** Total number of images in gallery */
    imageCount: number;
    /** Featured images for preview (3-6 images) */
    featuredImages: string[];
  };

  /** SUMMARY: Contact sheet grid of all images */
  [ContentLevel.SUMMARY]: {
    /** All gallery images for contact sheet */
    contactSheetGrid: GalleryImage[];
    /** Available category filters */
    categories: string[];
    /** Grid layout style */
    gridLayout: 'masonry' | 'uniform';
  };

  /** DETAILED: Full resolution images with basic metadata */
  [ContentLevel.DETAILED]: {
    /** Full resolution images */
    fullResImages: GalleryImage[];
    /** Image metadata for display */
    metadata: ImageMetadata[];
    /** Active filtering options */
    filtering: CategoryFilter[];
  };

  /** TECHNICAL: Complete EXIF data and processing notes */
  [ContentLevel.TECHNICAL]: {
    /** Complete EXIF data for all images */
    exifData: ExifData[];
    /** Post-processing notes */
    processingNotes: string[];
    /** Complete equipment list */
    equipmentList: CameraEquipment[];
  };
}

/**
 * Gallery content adapter state extending ContentAdapter pattern
 * Manages gallery-specific state for progressive disclosure
 */
export interface GalleryContentState {
  /** Content type identifier */
  type: 'gallery';

  /** Current content level */
  currentLevel: ContentLevel;

  /** Gallery content organized by level */
  content: GalleryContentLevels;

  /** Gallery-specific interaction state */
  state: {
    /** Currently viewed image (null if modal closed) */
    currentImage: GalleryImage | null;
    /** Current image index in filtered array */
    currentIndex: number;
    /** Filtered images based on active category */
    filteredImages: GalleryImage[];
    /** Active category filter (null = show all) */
    activeCategory: string | null;
    /** Whether modal is open */
    isModalOpen: boolean;
  };

  /** Gallery-specific actions */
  actions: {
    /** Open image in modal */
    openImage: (imageId: string) => void;
    /** Close modal and return to contact sheet */
    closeModal: () => void;
    /** Navigate to previous/next image */
    navigateImage: (direction: 'prev' | 'next') => void;
    /** Filter images by category */
    filterByCategory: (category: string | null) => void;
    /** Jump to specific image index */
    jumpToImage: (index: number) => void;
  };

  /** Loading strategy configuration */
  loadingStrategy: 'lazy' | 'progressive' | 'eager';

  /** Image quality tiers for performance */
  qualityTiers: {
    thumbnail: ImageQuality;
    preview: ImageQuality;
    full: ImageQuality;
  };
}

/**
 * Image quality configuration for performance optimization
 * Defines quality settings for different image sizes
 */
export interface ImageQuality {
  /** Image format (WebP preferred, JPEG fallback) */
  format: 'webp' | 'jpeg' | 'avif';

  /** Compression quality (0-100) */
  quality: number;

  /** Target dimensions */
  dimensions: {
    width: number;
    height: number;
  };

  /** Target file size (KB) */
  targetSize: number;

  /** Whether to generate 2x/3x for retina displays */
  generateRetina: boolean;
}

/**
 * Category filter configuration for contact sheet
 * Supports multi-select filtering with counts
 */
export interface CategoryFilter {
  /** Category unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** Number of images in this category */
  count: number;

  /** Whether filter is currently active */
  isActive: boolean;

  /** Icon or emoji for visual identification */
  icon?: string;

  /** Category description for tooltips */
  description?: string;
}

// ============================================================================
// GALLERY MODAL TYPES
// ============================================================================

/**
 * Gallery modal component props
 * Full-screen image viewer with navigation and metadata
 */
export interface GalleryModalProps {
  /** Whether modal is open */
  isOpen: boolean;

  /** Currently displayed image */
  currentImage: GalleryImage;

  /** All gallery images for navigation */
  images: GalleryImage[];

  /** Current image index */
  currentIndex: number;

  /** Close modal callback */
  onClose: () => void;

  /** Navigate to prev/next image */
  onNavigate: (direction: 'prev' | 'next') => void;

  /** Whether metadata panel is visible */
  showMetadata: boolean;

  /** Toggle metadata panel */
  onToggleMetadata: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Image viewer component props within modal
 * Handles image loading, zoom, and pan
 */
export interface ImageViewerProps {
  /** Image to display */
  image: GalleryImage;

  /** Loading state */
  isLoading: boolean;

  /** Enable pinch-to-zoom on mobile */
  enableZoom: boolean;

  /** Current zoom level (1.0 = fit to screen) */
  zoomLevel: number;

  /** Zoom level change callback */
  onZoomChange?: (zoom: number) => void;

  /** Image load callback */
  onImageLoad?: () => void;

  /** Image error callback */
  onImageError?: (error: Error) => void;
}

/**
 * Navigation controls props for modal
 * Previous/next arrows and close button
 */
export interface NavigationControlsProps {
  /** Can navigate to previous image */
  canGoPrev: boolean;

  /** Can navigate to next image */
  canGoNext: boolean;

  /** Current image position */
  current: number;

  /** Total number of images */
  total: number;

  /** Previous image callback */
  onPrev: () => void;

  /** Next image callback */
  onNext: () => void;

  /** Close modal callback */
  onClose: () => void;

  /** Show/hide controls */
  isVisible: boolean;
}

// ============================================================================
// CONTACT SHEET TYPES
// ============================================================================

/**
 * Contact sheet grid component props
 * Displays all gallery images in responsive grid
 */
export interface ContactSheetGridProps {
  /** Images to display in grid */
  images: GalleryImage[];

  /** Number of columns (responsive) */
  columns: number;

  /** Image select callback */
  onImageSelect: (image: GalleryImage, index: number) => void;

  /** Active category filter */
  activeCategory: string | null;

  /** Grid layout style */
  layout: 'masonry' | 'uniform';

  /** Performance mode from CanvasQualityManager */
  performanceMode: 'high' | 'balanced' | 'low';

  /** Additional CSS classes */
  className?: string;
}

/**
 * Contact sheet thumbnail component props
 * Individual thumbnail in contact sheet grid
 */
export interface ContactSheetThumbnailProps {
  /** Image data */
  image: GalleryImage;

  /** Thumbnail index in grid */
  index: number;

  /** Whether thumbnail is currently focused */
  isFocused: boolean;

  /** Click callback */
  onClick: (image: GalleryImage, index: number) => void;

  /** Focus callback for keyboard navigation */
  onFocus: (index: number) => void;

  /** Whether to lazy load (Intersection Observer) */
  lazyLoad: boolean;
}

// ============================================================================
// METADATA PANEL TYPES
// ============================================================================

/**
 * Metadata panel component props
 * Displays camera settings and project context
 */
export interface MetadataPanelProps {
  /** Image metadata to display */
  metadata: ImageMetadata;

  /** Current content disclosure level */
  contentLevel: ContentLevel;

  /** Whether panel is expanded */
  isExpanded: boolean;

  /** Toggle expansion callback */
  onToggle: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Metadata section for progressive disclosure
 * Organizes metadata by disclosure level
 */
export interface MetadataSection {
  /** Section identifier */
  id: string;

  /** Section title */
  title: string;

  /** Required content level to display */
  minLevel: ContentLevel;

  /** Metadata fields in this section */
  fields: MetadataField[];

  /** Whether section is collapsible */
  collapsible: boolean;
}

/**
 * Individual metadata field display configuration
 * Defines how each metadata piece is rendered
 */
export interface MetadataField {
  /** Field identifier */
  key: string;

  /** Display label */
  label: string;

  /** Field value */
  value: string | number;

  /** Icon or emoji for field */
  icon?: string;

  /** Formatting function */
  format?: (value: unknown) => string;

  /** Whether field is copyable */
  copyable: boolean;
}

// ============================================================================
// GALLERY METADATA JSON STRUCTURE
// ============================================================================

/**
 * Gallery metadata JSON file structure
 * Matches /public/data/gallery-metadata.json format
 */
export interface GalleryMetadataJson {
  /** Metadata format version */
  version: string;

  /** Last update timestamp (ISO 8601) */
  lastUpdated: string;

  /** Array of all gallery images */
  images: GalleryImage[];

  /** Available category filters with counts */
  categories: Array<{
    /** Category ID */
    id: string;
    /** Display label */
    label: string;
    /** Number of images in category */
    count: number;
    /** Optional icon */
    icon?: string;
  }>;
}

// ============================================================================
// GALLERY PERFORMANCE TYPES
// ============================================================================

/**
 * Gallery performance metrics
 * Extends CanvasPerformanceMetrics for gallery-specific tracking
 */
export interface GalleryPerformanceMetrics {
  /** Contact sheet performance */
  contactSheet: {
    /** Time to render grid (ms) - Target: <500ms */
    renderTime: number;
    /** Per-image thumbnail load times */
    thumbnailLoadTimes: number[];
    /** Average thumbnail load time */
    avgThumbnailLoad: number;
    /** Scroll FPS - Target: 60fps */
    scrollFPS: number;
  };

  /** Modal performance */
  modal: {
    /** Time to open modal (ms) - Target: <300ms */
    openTime: number;
    /** Full resolution image load time (ms) - Target: <1000ms */
    imageLoadTime: number;
    /** Navigation time between images (ms) - Target: <200ms */
    navigationTime: number;
    /** Modal scroll/zoom FPS - Target: 60fps */
    interactionFPS: number;
  };

  /** Memory metrics */
  memory: {
    /** Additional heap used by gallery (MB) - Target: <50MB */
    heapSizeUsed: number;
    /** Number of images in memory */
    imagesCached: number;
    /** Number of thumbnails loaded */
    thumbnailsCached: number;
  };

  /** User interaction analytics */
  engagement: {
    /** Number of images viewed in modal */
    imagesViewed: number;
    /** Navigation methods used */
    navigationMethods: Array<'keyboard' | 'touch' | 'click'>;
    /** Active category filters */
    categoryFiltersUsed: string[];
    /** Average time per image (ms) */
    avgTimePerImage: number;
  };
}

/**
 * Gallery loading state
 * Tracks loading progress for images and metadata
 */
export interface GalleryLoadingState {
  /** Overall gallery loading state */
  status: 'idle' | 'loading' | 'loaded' | 'error';

  /** Metadata JSON loading */
  metadata: {
    status: 'pending' | 'loading' | 'loaded' | 'error';
    error?: Error;
  };

  /** Contact sheet thumbnail loading */
  thumbnails: {
    total: number;
    loaded: number;
    failed: number;
  };

  /** Modal images loading */
  fullImages: {
    /** Currently loading image IDs */
    loading: string[];
    /** Successfully loaded image IDs */
    loaded: string[];
    /** Failed image IDs */
    failed: string[];
  };
}

// ============================================================================
// GALLERY INTERACTION TYPES
// ============================================================================

/**
 * Gallery keyboard shortcuts configuration
 * Defines keyboard bindings for gallery navigation
 */
export interface GalleryKeyboardShortcuts {
  /** Close modal */
  close: string[]; // ['Escape']

  /** Navigate to previous image */
  prev: string[]; // ['ArrowLeft', 'a']

  /** Navigate to next image */
  next: string[]; // ['ArrowRight', 'd']

  /** Toggle metadata panel */
  toggleMetadata: string[]; // ['m', 'M']

  /** Toggle fullscreen */
  fullscreen: string[]; // ['f', 'F']

  /** Zoom in */
  zoomIn: string[]; // ['+', '=']

  /** Zoom out */
  zoomOut: string[]; // ['-', '_']

  /** Reset zoom */
  resetZoom: string[]; // ['0']
}

/**
 * Gallery touch gesture configuration
 * Defines touch gestures for mobile navigation
 */
export interface GalleryTouchGestures {
  /** Swipe threshold (px) before triggering navigation */
  swipeThreshold: number;

  /** Tap to toggle UI controls */
  tapToToggle: boolean;

  /** Double-tap to toggle zoom */
  doubleTapZoom: boolean;

  /** Pinch-to-zoom sensitivity */
  pinchSensitivity: number;

  /** Long-press duration (ms) for context menu */
  longPressDuration: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Gallery image filter function type
 * Used for category filtering and search
 */
export type GalleryImageFilter = (image: GalleryImage) => boolean;

/**
 * Gallery image sort function type
 * Used for sorting images in contact sheet
 */
export type GalleryImageSort = (a: GalleryImage, b: GalleryImage) => number;

/**
 * Gallery state selector type
 * For extracting specific state from GalleryContentState
 */
export type GalleryStateSelector<T> = (state: GalleryContentState) => T;

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default image quality settings
 * Optimized for performance and visual quality balance
 */
export const DEFAULT_IMAGE_QUALITY: Record<'thumbnail' | 'preview' | 'full', ImageQuality> = {
  thumbnail: {
    format: 'webp',
    quality: 85,
    dimensions: { width: 300, height: 200 },
    targetSize: 30,
    generateRetina: false
  },
  preview: {
    format: 'webp',
    quality: 90,
    dimensions: { width: 800, height: 600 },
    targetSize: 100,
    generateRetina: true
  },
  full: {
    format: 'webp',
    quality: 95,
    dimensions: { width: 1920, height: 1280 },
    targetSize: 300,
    generateRetina: false
  }
} as const;

/**
 * Default gallery keyboard shortcuts
 * Standard image gallery navigation bindings
 */
export const DEFAULT_KEYBOARD_SHORTCUTS: GalleryKeyboardShortcuts = {
  close: ['Escape'],
  prev: ['ArrowLeft'],
  next: ['ArrowRight'],
  toggleMetadata: ['m', 'M'],
  fullscreen: ['f', 'F'],
  zoomIn: ['+', '='],
  zoomOut: ['-', '_'],
  resetZoom: ['0']
} as const;

/**
 * Default touch gesture configuration
 * Optimized for mobile gallery interaction
 */
export const DEFAULT_TOUCH_GESTURES: GalleryTouchGestures = {
  swipeThreshold: 50,
  tapToToggle: true,
  doubleTapZoom: true,
  pinchSensitivity: 1.0,
  longPressDuration: 500
} as const;