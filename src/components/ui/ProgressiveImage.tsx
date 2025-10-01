import React, { useState, useEffect, useRef } from 'react';

interface ProgressiveImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholderBlur?: number;
    onLoad?: () => void;
}

/**
 * Progressive Image Component with Blur-Up Loading
 *
 * Loads a low-quality placeholder first, then transitions smoothly to the full-quality image.
 * Uses a blur effect that gradually reduces as the high-quality image loads.
 *
 * Photography metaphor: Like focus pulling from soft to sharp
 */
const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
    src,
    alt,
    className = '',
    placeholderBlur = 10,
    onLoad
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>('');
    const imgRef = useRef<HTMLImageElement>(null);

    // Generate low-quality placeholder URL
    // For picsum.photos, we can request a smaller version
    // For other URLs, we'd need actual low-quality versions
    const generatePlaceholderSrc = (originalSrc: string): string => {
        // Check if it's a picsum.photos URL
        if (originalSrc.includes('picsum.photos')) {
            // Extract the dimensions and reduce them for placeholder
            const match = originalSrc.match(/\/(\d+)\/(\d+)/);
            if (match) {
                const width = parseInt(match[1]);
                const height = parseInt(match[2]);
                // Use 1/10th size for placeholder (e.g., 800x600 -> 80x60)
                const placeholderWidth = Math.max(Math.floor(width / 10), 10);
                const placeholderHeight = Math.max(Math.floor(height / 10), 10);
                return originalSrc.replace(/\/(\d+)\/(\d+)/, `/${placeholderWidth}/${placeholderHeight}`);
            }
        }

        // For other URLs, return a data URL placeholder or same src
        // In production, you'd have actual low-quality versions
        return originalSrc;
    };

    const placeholderSrc = generatePlaceholderSrc(src);

    useEffect(() => {
        // Load placeholder first
        setCurrentSrc(placeholderSrc);

        // Preload high-quality image
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setIsLoaded(true);
            setCurrentSrc(src);
            onLoad?.();
        };

        img.onerror = () => {
            // Fallback to showing the source even if it fails
            setIsLoaded(true);
            setCurrentSrc(src);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, placeholderSrc, onLoad]);

    return (
        <div className="relative overflow-hidden">
            <img
                ref={imgRef}
                src={currentSrc}
                alt={alt}
                className={`transition-all duration-700 ease-out ${className} ${
                    !isLoaded ? `blur-[${placeholderBlur}px] scale-105` : 'blur-0 scale-100'
                }`}
                style={{
                    filter: !isLoaded ? `blur(${placeholderBlur}px)` : 'blur(0px)',
                    transform: !isLoaded ? 'scale(1.05)' : 'scale(1)',
                }}
                loading="lazy"
            />

            {/* Loading indicator - photography aperture style */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 border-2 border-white/30 rounded-full" />
                        <div
                            className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin"
                            style={{ animationDuration: '1.2s' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressiveImage;
