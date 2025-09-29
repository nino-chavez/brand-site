/**
 * GalleryContentAdapter Component
 *
 * Complete gallery system integrating ContactSheetGrid and GalleryModal.
 * Implements ContentAdapter pattern for progressive disclosure.
 *
 * Usage:
 *   <GalleryContentAdapter />
 *
 * Future: Can be integrated with canvas zoom levels for spatial navigation
 */

import React, { useState, useEffect } from 'react';
import { ContactSheetGrid } from './ContactSheetGrid';
import { GalleryModal } from './GalleryModal';
import type { GalleryImage, CategoryFilter } from '../../types/gallery';

export interface GalleryContentAdapterProps {
  className?: string;
  onLoadError?: (error: Error) => void;
}

interface GalleryMetadata {
  version: string;
  lastUpdated: string;
  images: GalleryImage[];
  categories: CategoryFilter[];
}

/**
 * Complete gallery system with progressive disclosure
 */
export const GalleryContentAdapter: React.FC<GalleryContentAdapterProps> = ({
  className = '',
  onLoadError,
}) => {
  const [metadata, setMetadata] = useState<GalleryMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [loadTime, setLoadTime] = useState<number>(0);

  // Load gallery metadata
  useEffect(() => {
    const startTime = performance.now();

    fetch('/data/gallery-metadata.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load gallery: HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: GalleryMetadata) => {
        setMetadata(data);
        setIsLoading(false);
        const endTime = performance.now();
        const duration = endTime - startTime;
        setLoadTime(duration);

        console.log(`✅ Gallery loaded: ${data.images.length} images in ${duration.toFixed(2)}ms`);
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setIsLoading(false);
        console.error('❌ Failed to load gallery:', err);

        if (onLoadError) {
          onLoadError(err instanceof Error ? err : new Error(errorMessage));
        }
      });
  }, [onLoadError]);

  const handleImageClick = (imageId: string) => {
    setSelectedImageId(imageId);
  };

  const handleCloseModal = () => {
    setSelectedImageId(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`gallery-content-adapter loading ${className}`}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading gallery...</p>
        </div>

        <style>{`
          .gallery-content-adapter.loading {
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(20, 20, 25, 0.95);
          }

          .loading-container {
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
          }

          .loading-spinner {
            width: 48px;
            height: 48px;
            margin: 0 auto 1rem;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top-color: rgba(59, 130, 246, 0.8);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error || !metadata) {
    return (
      <div className={`gallery-content-adapter error ${className}`}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Gallery</h3>
          <p>{error || 'Unknown error occurred'}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>

        <style>{`
          .gallery-content-adapter.error {
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(20, 20, 25, 0.95);
          }

          .error-container {
            text-align: center;
            max-width: 400px;
            padding: 2rem;
          }

          .error-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .error-container h3 {
            color: rgba(255, 255, 255, 0.9);
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
          }

          .error-container p {
            color: rgba(255, 255, 255, 0.6);
            margin: 0 0 1.5rem 0;
          }

          .error-container button {
            padding: 0.75rem 1.5rem;
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(59, 130, 246, 0.6);
            border-radius: 8px;
            color: rgba(59, 130, 246, 1);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .error-container button:hover {
            background: rgba(59, 130, 246, 0.3);
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    );
  }

  // Main gallery view
  return (
    <div className={`gallery-content-adapter ${className}`}>
      {/* Header */}
      <header className="gallery-header">
        <h1>Portfolio Gallery</h1>
        <p className="gallery-stats">
          {metadata.images.length} images
          {loadTime > 0 && (
            <span className="load-time">
              • Loaded in {loadTime.toFixed(0)}ms
              {loadTime < 500 ? ' ✅' : ''}
            </span>
          )}
        </p>
      </header>

      {/* Contact Sheet Grid */}
      <ContactSheetGrid
        images={metadata.images}
        categories={metadata.categories}
        onImageClick={handleImageClick}
      />

      {/* Gallery Modal */}
      {selectedImageId && (
        <GalleryModal
          images={metadata.images}
          initialImageId={selectedImageId}
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}

      <style>{`
        .gallery-content-adapter {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          padding: 2rem 1rem;
        }

        .gallery-header {
          max-width: 1400px;
          margin: 0 auto 2rem;
          padding: 0 1rem;
        }

        .gallery-header h1 {
          color: rgba(255, 255, 255, 0.95);
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .gallery-stats {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          margin: 0;
        }

        .load-time {
          color: rgba(59, 130, 246, 0.8);
          font-weight: 500;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .gallery-content-adapter {
            padding: 1rem 0.5rem;
          }

          .gallery-header h1 {
            font-size: 2rem;
          }

          .gallery-header {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};