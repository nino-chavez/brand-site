/**
 * GalleryThumbnail Component
 *
 * Individual thumbnail with lazy loading, blur-up placeholder,
 * and hover effects (backlit glow).
 */

import React, { useState, useEffect, useRef } from 'react';
import type { GalleryImage } from '../../types/gallery';

export interface GalleryThumbnailProps {
  image: GalleryImage;
  onClick: () => void;
}

export const GalleryThumbnail: React.FC<GalleryThumbnailProps> = ({
  image,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (thumbnailRef.current) {
      observer.observe(thumbnailRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    console.error(`Failed to load thumbnail: ${image.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      ref={thumbnailRef}
      className={`gallery-thumbnail ${isLoaded ? 'loaded' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={image.alt}
    >
      {/* Blur-up placeholder */}
      <div className="placeholder" aria-hidden="true" />

      {/* Actual image - only load when visible */}
      {isVisible && !hasError && (
        <picture>
          <source
            srcSet={image.urls.thumbnail}
            type="image/webp"
          />
          <img
            src={image.urls.fallback}
            alt={image.alt}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={isLoaded ? 'fade-in' : ''}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <div className="error-state">
          <span>⚠️</span>
          <p>Failed to load</p>
        </div>
      )}

      {/* Featured badge */}
      {image.isFeatured && (
        <div className="featured-badge" aria-label="Featured image">
          ⭐
        </div>
      )}

      {/* Backlit glow effect */}
      <div className="glow-effect" aria-hidden="true" />

      <style>{`
        .gallery-thumbnail {
          position: relative;
          width: 100%;
          aspect-ratio: 3/2;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          background: rgba(30, 30, 35, 0.8);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gallery-thumbnail:hover {
          transform: scale(1.05);
          z-index: 1;
        }

        .gallery-thumbnail:focus {
          outline: 2px solid rgba(59, 130, 246, 0.8);
          outline-offset: 2px;
        }

        .gallery-thumbnail:focus:not(:focus-visible) {
          outline: none;
        }

        /* Placeholder - blur effect */
        .placeholder {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(40, 40, 50, 0.6),
            rgba(60, 60, 70, 0.6)
          );
          animation: pulse 2s ease-in-out infinite;
        }

        .gallery-thumbnail.loaded .placeholder {
          opacity: 0;
          transition: opacity 0.3s ease-out;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        /* Image */
        .gallery-thumbnail img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.4s ease-out;
        }

        .gallery-thumbnail img.fade-in {
          opacity: 1;
        }

        /* Error state */
        .error-state {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
        }

        .error-state span {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .error-state p {
          margin: 0;
        }

        /* Featured badge */
        .featured-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          font-size: 1.25rem;
          z-index: 2;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
        }

        /* Backlit glow effect */
        .glow-effect {
          position: absolute;
          inset: -2px;
          border-radius: 8px;
          opacity: 0;
          background: radial-gradient(
            circle at center,
            rgba(59, 130, 246, 0.4),
            transparent 70%
          );
          pointer-events: none;
          transition: opacity 0.3s ease-out;
          z-index: -1;
        }

        .gallery-thumbnail:hover .glow-effect {
          opacity: 1;
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .gallery-thumbnail,
          .gallery-thumbnail img,
          .placeholder,
          .glow-effect {
            transition: none;
            animation: none;
          }

          .gallery-thumbnail:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};