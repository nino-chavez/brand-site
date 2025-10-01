
import React from 'react';
import Section, { SectionTitle } from './Section';
import { GALLERY_IMAGES } from '../../constants';
import { useStaggeredChildren } from '../../hooks/useScrollAnimation';
import ProgressiveImage from '../ui/ProgressiveImage';

interface GallerySectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const GallerySection: React.FC<GallerySectionProps> = ({ setRef }) => {
    const { containerRef, visibleIndices } = useStaggeredChildren(GALLERY_IMAGES.length, 60);

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
                            key={index}
                            className={`overflow-hidden rounded-lg shadow-lg group transition-all duration-500 ease-out ${
                                visibleIndices.has(index)
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-8'
                            }`}
                            style={{
                                transitionDelay: `${index * 60}ms`
                            }}
                        >
                            <ProgressiveImage
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                                placeholderBlur={12}
                            />
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12">
                     <a href="https://gallery.nino.photos" target="_blank" rel="noopener noreferrer" className="bg-brand-violet text-white font-semibold px-8 py-3 rounded-md transition-transform duration-300 hover:scale-105 hover:bg-violet-500">
                        View Full Gallery
                    </a>
                </div>
            </div>
        </Section>
    );
};

export default GallerySection;
