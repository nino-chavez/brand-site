/**
 * GalleryModal Component
 *
 * Full-screen modal for viewing images with navigation,
 * metadata panel, and smooth transitions.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { GalleryImage } from '../../types/gallery';
import { useGalleryNavigation } from '../../hooks/useGalleryNavigation';
import { useAttachTouchGestures } from '../../hooks/useTouchGestures';
import { MetadataPanel } from './MetadataPanel';

export interface GalleryModalProps {
  images: GalleryImage[];
  initialImageId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  images,
  initialImageId,
  isOpen,
  onClose,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const {
    currentImage,
    currentIndex,
    isFirst,
    isLast,
    goToPrevious,
    goToNext,
  } = useGalleryNavigation({
    images,
    initialImageId,
    enableKeyboardShortcuts: false, // We handle shortcuts locally
    enableWrapAround: false,
  });

  // Touch gesture support for mobile navigation
  const { swipeDirection } = useAttachTouchGestures(imageContainerRef, {
    onSwipeLeft: () => {
      if (!isLast) {
        setTransitionDirection('left');
        goToNext();
      }
    },
    onSwipeRight: () => {
      if (!isFirst) {
        setTransitionDirection('right');
        goToPrevious();
      }
    },
    enabled: isOpen,
    swipeThreshold: 50,
    swipeVelocityThreshold: 0.3,
  });

  // Reset image load state when image changes
  useEffect(() => {
    setIsImageLoaded(false);
    setHasImageError(false);
  }, [currentImage?.id]);

  // Screen reader announcements for image changes
  const [announcement, setAnnouncement] = useState<string>('');
  useEffect(() => {
    if (isOpen && currentImage) {
      const message = `Viewing image ${currentIndex + 1} of ${images.length}: ${currentImage.alt}`;
      setAnnouncement(message);

      // Clear announcement after 1 second to allow re-announcement on next change
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentImage?.id, currentIndex, images.length, isOpen, currentImage?.alt]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (!isFirst) {
            setTransitionDirection('right');
            goToPrevious();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!isLast) {
            setTransitionDirection('left');
            goToNext();
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setIsMetadataOpen(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFirst, isLast, goToPrevious, goToNext, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setTransitionDirection(null);
  };

  const handleImageError = () => {
    setHasImageError(true);
    console.error(`Failed to load image: ${currentImage?.id}`);
  };

  const handlePrevious = () => {
    if (!isFirst) {
      setTransitionDirection('right');
      goToPrevious();
    }
  };

  const handleNext = () => {
    if (!isLast) {
      setTransitionDirection('left');
      goToNext();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div
      ref={modalRef}
      className={`gallery-modal ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      tabIndex={-1}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="backdrop" aria-hidden="true" />

      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Close button */}
      <button
        className="close-button"
        onClick={onClose}
        aria-label="Close image viewer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Image counter */}
      <div className="image-counter" aria-hidden="true">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous button */}
      {!isFirst && (
        <button
          className="nav-button prev"
          onClick={handlePrevious}
          aria-label={`Previous image (${currentIndex} of ${images.length})`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {!isLast && (
        <button
          className="nav-button next"
          onClick={handleNext}
          aria-label={`Next image (${currentIndex + 2} of ${images.length})`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Image container */}
      <div
        ref={imageContainerRef}
        className={`image-container ${transitionDirection || ''} ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
      >
        {/* Blur-up placeholder */}
        {!isImageLoaded && !hasImageError && (
          <div className="image-placeholder" aria-hidden="true" />
        )}

        {/* Main image */}
        {!hasImageError && (
          <picture>
            <source srcSet={currentImage.urls.full} type="image/webp" />
            <img
              ref={imageRef}
              src={currentImage.urls.fallback}
              alt={currentImage.alt}
              className={isImageLoaded ? 'loaded' : ''}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </picture>
        )}

        {/* Error state */}
        {hasImageError && (
          <div className="error-state" role="alert">
            <span className="error-icon">⚠️</span>
            <p>Failed to load image</p>
          </div>
        )}
      </div>

      {/* Metadata toggle button */}
      <button
        className={`metadata-toggle ${isMetadataOpen ? 'active' : ''}`}
        onClick={() => setIsMetadataOpen(prev => !prev)}
        aria-label={isMetadataOpen ? 'Hide metadata' : 'Show metadata'}
        aria-pressed={isMetadataOpen}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Info</span>
      </button>

      {/* Metadata panel */}
      <MetadataPanel
        image={currentImage}
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
      />

      <style>{`
        .gallery-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gallery-modal.open {
          opacity: 1;
          visibility: visible;
        }

        .gallery-modal:focus {
          outline: none;
        }

        /* Backdrop */
        .backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
        }

        /* Close button */
        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: rgba(30, 30, 35, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: rgba(40, 40, 50, 0.9);
          transform: scale(1.1);
        }

        .close-button:focus {
          outline: 2px solid rgba(59, 130, 246, 0.8);
          outline-offset: 2px;
        }

        /* Image counter */
        .image-counter {
          position: absolute;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          padding: 0.5rem 1rem;
          background: rgba(30, 30, 35, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Navigation buttons */
        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3.5rem;
          height: 3.5rem;
          background: rgba(30, 30, 35, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-button:hover {
          background: rgba(40, 40, 50, 0.9);
          transform: translateY(-50%) scale(1.1);
        }

        .nav-button:focus {
          outline: 2px solid rgba(59, 130, 246, 0.8);
          outline-offset: 2px;
        }

        .nav-button.prev {
          left: 2rem;
        }

        .nav-button.next {
          right: 2rem;
        }

        /* Image container */
        .image-container {
          position: relative;
          max-width: 90vw;
          max-height: 85vh;
          z-index: 1;
          touch-action: pan-y pinch-zoom; /* Allow vertical scroll, prevent horizontal */
        }

        /* Touch swipe visual feedback */
        .image-container.swipe-left {
          transform: translateX(-5px);
          transition: transform 0.1s ease-out;
        }

        .image-container.swipe-right {
          transform: translateX(5px);
          transition: transform 0.1s ease-out;
        }

        .image-container img {
          max-width: 100%;
          max-height: 85vh;
          object-fit: contain;
          opacity: 0;
          transition: opacity 0.4s ease-out;
        }

        .image-container img.loaded {
          opacity: 1;
        }

        /* Transition animations */
        .image-container.left img {
          animation: slideInFromRight 0.3s ease-out;
        }

        .image-container.right img {
          animation: slideInFromLeft 0.3s ease-out;
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(30px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateX(-30px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Placeholder */
        .image-placeholder {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(40, 40, 50, 0.6), rgba(60, 60, 70, 0.6));
          animation: pulse 2s ease-in-out infinite;
        }

        /* Error state */
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 300px;
          min-height: 300px;
          color: rgba(255, 255, 255, 0.6);
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        /* Metadata toggle */
        .metadata-toggle {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(30, 30, 35, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .metadata-toggle:hover {
          background: rgba(40, 40, 50, 0.9);
          transform: translateY(-2px);
        }

        .metadata-toggle.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.6);
          color: rgba(59, 130, 246, 1);
        }

        .metadata-toggle:focus {
          outline: 2px solid rgba(59, 130, 246, 0.8);
          outline-offset: 2px;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .close-button {
            width: 2.5rem;
            height: 2.5rem;
          }

          .nav-button {
            width: 3rem;
            height: 3rem;
          }

          .nav-button.prev {
            left: 1rem;
          }

          .nav-button.next {
            right: 1rem;
          }

          .image-counter {
            top: 0.75rem;
            font-size: 0.8125rem;
          }

          .metadata-toggle {
            bottom: 1rem;
            right: 1rem;
            padding: 0.625rem 1rem;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .gallery-modal,
          .image-container img,
          .close-button,
          .nav-button,
          .metadata-toggle {
            transition: none;
            animation: none;
          }

          .nav-button:hover {
            transform: translateY(-50%);
          }

          .metadata-toggle:hover {
            transform: none;
          }
        }

        /* Screen reader only content */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
};