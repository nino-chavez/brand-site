/**
 * useGalleryNavigation Hook
 *
 * Manages gallery navigation state, keyboard shortcuts, and image preloading.
 * Part of Tasks 5 & 6 - GalleryModal and Navigation System.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GalleryImage } from '../types/gallery';

export interface UseGalleryNavigationOptions {
  images: GalleryImage[];
  initialImageId?: string;
  onImageChange?: (image: GalleryImage, index: number) => void;
  enableKeyboardShortcuts?: boolean;
  enableWrapAround?: boolean;
}

export interface UseGalleryNavigationReturn {
  currentImage: GalleryImage | null;
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  goToPrevious: () => void;
  goToNext: () => void;
  goToIndex: (index: number) => void;
  goToImage: (imageId: string) => void;
  preloadAdjacentImages: () => void;
}

/**
 * Gallery navigation hook with preloading and keyboard shortcuts
 */
export function useGalleryNavigation({
  images,
  initialImageId,
  onImageChange,
  enableKeyboardShortcuts = true,
  enableWrapAround = false,
}: UseGalleryNavigationOptions): UseGalleryNavigationReturn {
  // Find initial index
  const initialIndex = initialImageId
    ? images.findIndex(img => img.id === initialImageId)
    : 0;

  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );

  const preloadedImages = useRef<Set<string>>(new Set());

  const currentImage = images[currentIndex] || null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === images.length - 1;

  // Navigate to previous image
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      if (enableWrapAround) {
        return images.length - 1;
      }
      return prev;
    });
  }, [images.length, enableWrapAround]);

  // Navigate to next image
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < images.length - 1) {
        return prev + 1;
      }
      if (enableWrapAround) {
        return 0;
      }
      return prev;
    });
  }, [images.length, enableWrapAround]);

  // Navigate to specific index
  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  }, [images.length]);

  // Navigate to specific image by ID
  const goToImage = useCallback((imageId: string) => {
    const index = images.findIndex(img => img.id === imageId);
    if (index >= 0) {
      setCurrentIndex(index);
    }
  }, [images]);

  // Preload adjacent images (±1 from current)
  const preloadAdjacentImages = useCallback(() => {
    const imagesToPreload: string[] = [];

    // Previous image
    if (currentIndex > 0) {
      imagesToPreload.push(images[currentIndex - 1].urls.full);
    } else if (enableWrapAround) {
      imagesToPreload.push(images[images.length - 1].urls.full);
    }

    // Next image
    if (currentIndex < images.length - 1) {
      imagesToPreload.push(images[currentIndex + 1].urls.full);
    } else if (enableWrapAround) {
      imagesToPreload.push(images[0].urls.full);
    }

    // Preload images that haven't been preloaded yet
    imagesToPreload.forEach((url) => {
      if (!preloadedImages.current.has(url)) {
        const img = new Image();
        img.src = url;
        preloadedImages.current.add(url);
      }
    });
  }, [currentIndex, images, enableWrapAround]);

  // Trigger onImageChange callback
  useEffect(() => {
    if (currentImage && onImageChange) {
      onImageChange(currentImage, currentIndex);
    }
  }, [currentImage, currentIndex, onImageChange]);

  // Preload adjacent images when current index changes
  useEffect(() => {
    preloadAdjacentImages();
  }, [preloadAdjacentImages]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Home':
          e.preventDefault();
          goToIndex(0);
          break;
        case 'End':
          e.preventDefault();
          goToIndex(images.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, goToPrevious, goToNext, goToIndex, images.length]);

  return {
    currentImage,
    currentIndex,
    isFirst,
    isLast,
    goToPrevious,
    goToNext,
    goToIndex,
    goToImage,
    preloadAdjacentImages,
  };
}