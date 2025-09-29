/**
 * GalleryDemo Component
 *
 * Temporary demo component to test ContactSheetGrid
 * with real gallery metadata.
 */

import React, { useState, useEffect } from 'react';
import { ContactSheetGrid } from './ContactSheetGrid';
import type { GalleryImage, CategoryFilter } from '../../types/gallery';

interface GalleryMetadata {
  version: string;
  lastUpdated: string;
  images: GalleryImage[];
  categories: CategoryFilter[];
}

export const GalleryDemo: React.FC = () => {
  const [metadata, setMetadata] = useState<GalleryMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadTime, setLoadTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();

    fetch('/data/gallery-metadata.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMetadata(data);
        const endTime = performance.now();
        setLoadTime(endTime - startTime);
        console.log(`✅ Gallery loaded in ${(endTime - startTime).toFixed(2)}ms`);
      })
      .catch((err) => {
        setError(err.message);
        console.error('❌ Failed to load gallery metadata:', err);
      });
  }, []);

  const handleImageClick = (imageId: string) => {
    console.log('Image clicked:', imageId);
    // TODO: Open modal when GalleryModal component is ready
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#ff6b6b' }}>
        <h2>Failed to load gallery</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#1a1a1f', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '2rem' }}>
          Portfolio Gallery
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
          {metadata.images.length} images • Loaded in {loadTime.toFixed(0)}ms
          {loadTime < 500 ? ' ✅' : ' ⚠️'}
        </p>
      </header>

      <ContactSheetGrid
        images={metadata.images}
        categories={metadata.categories}
        onImageClick={handleImageClick}
      />
    </div>
  );
};