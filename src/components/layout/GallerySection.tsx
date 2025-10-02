
import React, { useState } from 'react';
import Section, { SectionTitle } from './Section';
import { GALLERY_IMAGES, type GalleryImage } from '../../constants';
import { useStaggeredChildren } from '../../hooks/useScrollAnimation';
import ProgressiveImage from '../ui/ProgressiveImage';

interface GallerySectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const GallerySection: React.FC<GallerySectionProps> = ({ setRef }) => {
    const { containerRef, visibleIndices } = useStaggeredChildren(GALLERY_IMAGES.length, 60);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openModal = (image: GalleryImage, index: number) => {
        setSelectedImage(image);
        setCurrentIndex(index);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        const newIndex = direction === 'next'
            ? (currentIndex + 1) % GALLERY_IMAGES.length
            : (currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
        setCurrentIndex(newIndex);
        setSelectedImage(GALLERY_IMAGES[newIndex]);
    };

    return (
        <Section id="develop" setRef={setRef}>
            <div>
                <SectionTitle>Photography Gallery</SectionTitle>
                <div
                    ref={containerRef as React.RefObject<HTMLDivElement>}
                    className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
                >
                    {GALLERY_IMAGES.map((image, index) => (
                        <div
                            key={image.id}
                            className={`relative overflow-hidden rounded-lg shadow-lg group transition-all duration-500 ease-out cursor-pointer hover:shadow-2xl ${
                                visibleIndices.has(index)
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-8'
                            }`}
                            style={{
                                transitionDelay: `${index * 60}ms`
                            }}
                            onClick={() => openModal(image, index)}
                        >
                            <ProgressiveImage
                                src={image.urls.preview}
                                alt={image.alt}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-125"
                                placeholderBlur={12}
                            />

                            {/* Metadata overlay slide-up on hover */}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white text-xs font-semibold">{image.alt}</p>
                                <p className="text-white/70 text-xs mt-1">
                                    {image.metadata.camera} • {image.metadata.focalLength}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <a href="https://gallery.nino.photos" target="_blank" rel="noopener noreferrer" className="bg-brand-violet text-white font-semibold px-8 py-3 rounded-md transition-transform duration-300 hover:scale-105 hover:bg-violet-500">
                        View Full Gallery
                    </a>
                </div>
            </div>

            {/* Simple Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <button
                        className="absolute top-4 right-4 text-white text-4xl hover:text-brand-cyan transition-colors"
                        onClick={closeModal}
                        aria-label="Close"
                    >
                        ×
                    </button>

                    <button
                        className="absolute left-4 text-white text-4xl hover:text-brand-cyan transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                        aria-label="Previous"
                    >
                        ‹
                    </button>

                    <div className="max-w-6xl max-h-[90vh] flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedImage.urls.full}
                            alt={selectedImage.alt}
                            className="max-w-full max-h-[70vh] object-contain"
                        />
                        <div className="text-white text-center space-y-2">
                            <p className="text-sm text-white/60">{selectedImage.metadata.camera} • {selectedImage.metadata.lens}</p>
                            <p className="text-xs text-white/40">
                                {selectedImage.metadata.aperture} • {selectedImage.metadata.shutterSpeed} • ISO {selectedImage.metadata.iso} • {selectedImage.metadata.focalLength}
                            </p>
                        </div>
                    </div>

                    <button
                        className="absolute right-4 text-white text-4xl hover:text-brand-cyan transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                        aria-label="Next"
                    >
                        ›
                    </button>
                </div>
            )}
        </Section>
    );
};

export default GallerySection;
