/**
 * ContactSheetGrid Component
 *
 * Displays portfolio images in a responsive grid with lazy loading
 * and category filtering. Part of Gallery Canvas Integration.
 */

import React, { useState, useCallback } from 'react';
import type { GalleryImage, CategoryFilter } from '../../types/gallery';
import { GalleryThumbnail } from './GalleryThumbnail';
import { CategoryFilterBar } from './CategoryFilterBar';

export interface ContactSheetGridProps {
  images: GalleryImage[];
  categories: CategoryFilter[];
  onImageClick: (imageId: string) => void;
  className?: string;
}

export const ContactSheetGrid: React.FC<ContactSheetGridProps> = ({
  images,
  categories,
  onImageClick,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter images by active category
  const filteredImages = useCallback(() => {
    if (!activeCategory) return images;
    return images.filter(img => img.categories.includes(activeCategory));
  }, [images, activeCategory]);

  const displayedImages = filteredImages();

  return (
    <div className={`contact-sheet-grid ${className}`}>
      {/* Category Filter Bar */}
      <CategoryFilterBar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Grid Container */}
      <div
        className="grid-container"
        role="list"
        aria-label={`Portfolio gallery with ${displayedImages.length} images`}
      >
        {displayedImages.map((image, index) => (
          <GalleryThumbnail
            key={image.id}
            image={image}
            index={index}
            totalCount={displayedImages.length}
            onClick={() => onImageClick(image.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {displayedImages.length === 0 && (
        <div className="empty-state" role="status">
          <p>No images found in this category.</p>
        </div>
      )}

      <style>{`
        .contact-sheet-grid {
          width: 100%;
          padding: 1rem;
        }

        .grid-container {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;

          /* Responsive columns */
          grid-template-columns: repeat(2, 1fr); /* Mobile: 2 columns */
        }

        /* Tablet: 3 columns */
        @media (min-width: 640px) {
          .grid-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Desktop: 4 columns */
        @media (min-width: 1024px) {
          .grid-container {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
          }
        }

        /* Large Desktop: 5 columns */
        @media (min-width: 1440px) {
          .grid-container {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-state p {
          font-size: 1.125rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
};