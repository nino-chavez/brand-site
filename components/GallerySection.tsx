
import React from 'react';
import Section, { SectionTitle } from './Section';
import { GALLERY_IMAGES } from '../constants';

interface GallerySectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const GallerySection: React.FC<GallerySectionProps> = ({ setRef }) => {
    return (
        <Section id="gallery" setRef={setRef}>
            <div>
                <SectionTitle>Photography Gallery</SectionTitle>
                 <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {GALLERY_IMAGES.map((image, index) => (
                        <div key={index} className="overflow-hidden rounded-lg shadow-lg group">
                            <img 
                                src={image.src} 
                                alt={image.alt}
                                loading="lazy"
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
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
