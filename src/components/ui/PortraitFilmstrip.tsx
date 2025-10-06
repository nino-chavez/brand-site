/**
 * PortraitFilmstrip Component
 *
 * Toggleable vertical filmstrip panel showing portrait photography samples.
 * Desktop only - hidden completely on mobile.
 */

import React, { useState, useEffect } from 'react';

export interface PortraitFilmstripProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortraitFilmstrip: React.FC<PortraitFilmstripProps> = ({ isOpen, onClose }) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Lazy load portrait images only when panel is opened
  useEffect(() => {
    if (isOpen && images.length === 0) {
      // Load 27 portrait gallery images
      const portraitImages = Array.from({ length: 27 }, (_, i) =>
        `/images/gallery/portfolio-${String(i).padStart(2, '0')}.jpg`
      );
      setImages(portraitImages);
    }
  }, [isOpen, images.length]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedImage) {
          setSelectedImage(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, selectedImage, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Filmstrip Panel */}
      <div className="portrait-filmstrip">
        {/* Header */}
        <div className="filmstrip-header">
          <h3 className="filmstrip-title">Portfolio Samples</h3>
          <button
            className="filmstrip-close"
            onClick={onClose}
            aria-label="Close filmstrip"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable thumbnails */}
        <div className="filmstrip-scroll">
          {images.map((image, index) => (
            <button
              key={index}
              className="filmstrip-thumbnail"
              onClick={() => setSelectedImage(image)}
              aria-label={`View portfolio image ${index + 1}`}
            >
              <img
                src={image}
                alt={`Portfolio sample ${index + 1}`}
                loading="lazy"
              />
              <div className="thumbnail-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div className="filmstrip-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img src={selectedImage} alt="Portfolio sample full size" />
          </div>
        </div>
      )}

      <style jsx>{`
        /* Filmstrip Panel - Desktop Only */
        .portrait-filmstrip {
          position: fixed;
          top: 0;
          right: 0;
          width: 240px;
          height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 100;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Header */
        .filmstrip-header {
          padding: 1.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .filmstrip-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filmstrip-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .filmstrip-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Scrollable Area */
        .filmstrip-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .filmstrip-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .filmstrip-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .filmstrip-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        .filmstrip-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Thumbnail */
        .filmstrip-thumbnail {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .filmstrip-thumbnail:hover {
          border-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.05);
        }

        .filmstrip-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: white;
        }

        .filmstrip-thumbnail:hover .thumbnail-overlay {
          opacity: 1;
        }

        /* Full-size Modal */
        .filmstrip-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content img {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 0.5rem;
        }

        .modal-close {
          position: absolute;
          top: -3rem;
          right: 0;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Mobile: Hide Completely */
        @media (max-width: 1024px) {
          .portrait-filmstrip {
            display: none;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .portrait-filmstrip,
          .filmstrip-modal {
            animation: none;
          }

          .filmstrip-thumbnail {
            transition: none;
          }
        }
      `}</style>
    </>
  );
};

/**
 * FilmstripToggle Component
 *
 * Button to toggle the portrait filmstrip panel.
 * Desktop only - hidden on mobile.
 */

interface FilmstripToggleProps {
  onClick: () => void;
  isActive: boolean;
}

export const FilmstripToggle: React.FC<FilmstripToggleProps> = ({ onClick, isActive }) => {
  return (
    <>
      <button
        className="filmstrip-toggle"
        onClick={onClick}
        aria-label="Toggle portfolio filmstrip"
        aria-expanded={isActive}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="7" y1="3" x2="7" y2="21" />
          <line x1="17" y1="3" x2="17" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
        </svg>
        <span className="toggle-label">Portfolio</span>
      </button>

      <style jsx>{`
        .filmstrip-toggle {
          position: fixed;
          top: 6rem;
          right: 2rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          z-index: 50;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .filmstrip-toggle:hover {
          background: rgba(0, 0, 0, 0.8);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .filmstrip-toggle:active {
          transform: translateY(0);
        }

        .toggle-label {
          white-space: nowrap;
        }

        /* Mobile: Hide Completely */
        @media (max-width: 1024px) {
          .filmstrip-toggle {
            display: none;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .filmstrip-toggle {
            transition: none;
          }
        }
      `}</style>
    </>
  );
};
