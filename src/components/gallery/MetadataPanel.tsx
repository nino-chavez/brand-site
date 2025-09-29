/**
 * MetadataPanel Component
 *
 * Displays image metadata with progressive disclosure
 * (SUMMARY → DETAILED → TECHNICAL)
 */

import React from 'react';
import type { GalleryImage } from '../../types/gallery';

export interface MetadataPanelProps {
  image: GalleryImage;
  isOpen: boolean;
  onClose: () => void;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  image,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { metadata } = image;

  return (
    <div className={`metadata-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-content">
        {/* Header */}
        <div className="panel-header">
          <h3>Image Details</h3>
          <button
            className="close-panel"
            onClick={onClose}
            aria-label="Close metadata panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* SUMMARY Level - Camera & Basic Settings */}
        <section className="metadata-section" aria-labelledby="camera-settings-heading">
          <h4 id="camera-settings-heading">Camera Settings</h4>
          <dl className="metadata-grid">
            <div className="metadata-item">
              <dt>Camera</dt>
              <dd>{metadata.camera}</dd>
            </div>
            <div className="metadata-item">
              <dt>Lens</dt>
              <dd>{metadata.lens}</dd>
            </div>
            {metadata.iso && (
              <div className="metadata-item">
                <dt>ISO</dt>
                <dd>{metadata.iso}</dd>
              </div>
            )}
            {metadata.aperture && (
              <div className="metadata-item">
                <dt>Aperture</dt>
                <dd>{metadata.aperture}</dd>
              </div>
            )}
            {metadata.shutterSpeed && (
              <div className="metadata-item">
                <dt>Shutter</dt>
                <dd>{metadata.shutterSpeed}</dd>
              </div>
            )}
            {metadata.focalLength && (
              <div className="metadata-item">
                <dt>Focal Length</dt>
                <dd>{metadata.focalLength}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* DETAILED Level - Full EXIF & Context */}
        {(metadata.dateTaken || metadata.location || metadata.projectContext) && (
          <section className="metadata-section" aria-labelledby="additional-info-heading">
            <h4 id="additional-info-heading">Additional Information</h4>
            <dl className="metadata-list">
              {metadata.dateTaken && (
                <div className="metadata-item">
                  <dt>Date Taken</dt>
                  <dd>{new Date(metadata.dateTaken).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</dd>
                </div>
              )}
              {metadata.location && (
                <div className="metadata-item">
                  <dt>Location</dt>
                  <dd>{metadata.location}</dd>
                </div>
              )}
              {metadata.projectContext && (
                <div className="metadata-item full-width">
                  <dt>Project Context</dt>
                  <dd>{metadata.projectContext}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* TECHNICAL Level - Processing & Tags */}
        {(metadata.processingNotes || metadata.tags?.length > 0) && (
          <section className="metadata-section" aria-labelledby="technical-heading">
            <h4 id="technical-heading">Technical Details</h4>
            <dl className="metadata-list">
              {metadata.processingNotes && (
                <div className="metadata-item full-width">
                  <dt>Post-Processing</dt>
                  <dd>{metadata.processingNotes}</dd>
                </div>
              )}
              {metadata.tags && metadata.tags.length > 0 && (
                <div className="metadata-item full-width">
                  <dt>Tags</dt>
                  <dd className="tags-container">
                    {metadata.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>

      <style>{`
        .metadata-panel {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
          max-width: 400px;
          max-height: 70vh;
          background: rgba(20, 20, 25, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px 16px 0 0;
          overflow-y: auto;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
        }

        .metadata-panel.open {
          transform: translateY(0);
        }

        .panel-content {
          padding: 1.5rem;
        }

        /* Header */
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-header h3 {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.25rem;
          font-weight: 600;
        }

        .close-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-panel:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        .close-panel:focus {
          outline: 2px solid rgba(59, 130, 246, 0.8);
          outline-offset: 2px;
        }

        /* Sections */
        .metadata-section {
          margin-bottom: 1.5rem;
        }

        .metadata-section:last-child {
          margin-bottom: 0;
        }

        .metadata-section h4 {
          margin: 0 0 0.75rem 0;
          color: rgba(59, 130, 246, 0.9);
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Metadata grid (2 columns for settings) */
        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        /* Metadata list (single column) */
        .metadata-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .metadata-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metadata-item.full-width {
          grid-column: 1 / -1;
        }

        .metadata-item dt {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metadata-item dd {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Tags */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          color: rgba(59, 130, 246, 0.9);
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Scrollbar styling */
        .metadata-panel::-webkit-scrollbar {
          width: 8px;
        }

        .metadata-panel::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }

        .metadata-panel::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .metadata-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .metadata-panel {
            max-width: 100%;
            max-height: 60vh;
          }

          .panel-content {
            padding: 1.25rem;
          }

          .metadata-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .metadata-panel {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};