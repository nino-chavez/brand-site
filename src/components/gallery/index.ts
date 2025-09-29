/**
 * Gallery Component Exports
 *
 * Phase 1 - ContactSheetGrid with lazy loading and filtering
 * Phase 2 - GalleryModal with navigation and metadata
 * Phase 2 - GalleryContentAdapter (complete system)
 */

// Complete Gallery System
export { GalleryContentAdapter } from './GalleryContentAdapter';

// Phase 1 Components
export { ContactSheetGrid } from './ContactSheetGrid';
export { GalleryThumbnail } from './GalleryThumbnail';
export { CategoryFilterBar } from './CategoryFilterBar';

// Phase 2 Components
export { GalleryModal } from './GalleryModal';
export { MetadataPanel } from './MetadataPanel';

// Demo Component
export { GalleryDemo } from './GalleryDemo';

// Type exports
export type { GalleryContentAdapterProps } from './GalleryContentAdapter';
export type { ContactSheetGridProps } from './ContactSheetGrid';
export type { GalleryThumbnailProps } from './GalleryThumbnail';
export type { CategoryFilterBarProps } from './CategoryFilterBar';
export type { GalleryModalProps } from './GalleryModal';
export type { MetadataPanelProps } from './MetadataPanel';