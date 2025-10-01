/**
 * ViewfinderMetadata - Contextual Camera Settings Display
 *
 * Photography-themed metadata that tells a professional story.
 * Settings change based on section to convey different messages.
 *
 * @version 1.0.0
 * @since Hybrid Viewfinder Approach
 */

import React, { useEffect, useState } from 'react';

interface CameraSettings {
  aperture: string;
  shutter: string;
  iso: string;
  focus: string;
  description: string;
}

const SECTION_SETTINGS: Record<string, CameraSettings> = {
  hero: {
    aperture: 'f/1.4',
    shutter: '1/8000s',
    iso: 'ISO 100',
    focus: 'Enterprise Architecture',
    description: 'Wide aperture for big picture thinking, fast execution, clean solutions'
  },
  focus: {  // About section - attention to detail
    aperture: 'f/8',
    shutter: '1/125s',
    iso: 'ISO 200',
    focus: 'Technical Excellence',
    description: 'Balanced depth for comprehensive understanding'
  },
  frame: {  // Work section - composition & planning
    aperture: 'f/2.8',
    shutter: '1/1000s',
    iso: 'ISO 400',
    focus: 'Results Driven',
    description: 'Fast capture of impactful moments'
  },
  exposure: {  // Insights section - technical execution
    aperture: 'f/5.6',
    shutter: '1/250s',
    iso: 'ISO 320',
    focus: 'Technical Depth',
    description: 'Precise exposure for detailed insights'
  },
  develop: {  // Gallery section - process & refinement
    aperture: 'f/11',
    shutter: '1/60s',
    iso: 'ISO 100',
    focus: 'Artistic Process',
    description: 'Patient development for refined results'
  },
  portfolio: {  // Contact section - results & showcase
    aperture: 'f/4',
    shutter: '1/60s',
    iso: 'ISO 100',
    focus: 'Collaboration',
    description: 'Ready to connect and create together'
  },
};

interface ViewfinderMetadataProps {
  currentSection?: string;
  visible?: boolean;
  position?: 'top-left' | 'bottom-right' | 'bottom-center' | 'floating';
  className?: string;
  style?: React.CSSProperties;
}

export const ViewfinderMetadata: React.FC<ViewfinderMetadataProps> = ({
  currentSection = 'hero',
  visible = true,
  position = 'top-left',
  className = '',
  style = {},
}) => {
  const [settings, setSettings] = useState<CameraSettings>(SECTION_SETTINGS.hero);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Responsive positioning: bottom-center on mobile, top-left on desktop
  const [responsivePosition, setResponsivePosition] = useState<string>(position);

  useEffect(() => {
    const updatePosition = () => {
      if (typeof window === 'undefined') return;

      const isMobile = window.innerWidth < 768;
      setResponsivePosition(isMobile ? 'bottom-center' : position);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [position]);

  useEffect(() => {
    const newSettings = SECTION_SETTINGS[currentSection] || SECTION_SETTINGS.hero;

    if (newSettings !== settings) {
      // Start transition: fade out with blur (200ms)
      setIsTransitioning(true);

      setTimeout(() => {
        // Update settings at midpoint
        setSettings(newSettings);

        // Fade in and remove blur (200ms)
        setTimeout(() => setIsTransitioning(false), 200);
      }, 200);
    }
  }, [currentSection, settings]);

  const positionClasses: Record<string, string> = {
    'top-left': 'top-24 left-4', // Avoid header nav (was top-4)
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2', // Mobile optimized
    'floating': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={`fixed ${positionClasses[responsivePosition]} z-40 pointer-events-none ${className}`}
      style={style}
    >
      <div
        className={`transition-all duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${isTransitioning ? 'opacity-0 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'}`}
      >
        <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3 md:p-3 p-2 space-y-1 font-mono text-xs md:text-xs text-[10px]">
          {/* Camera Settings */}
          <div className="flex items-center gap-2 md:gap-3 text-white/90">
            <span className="text-brand-orange font-semibold">{settings.aperture}</span>
            <span className="text-white/60">•</span>
            <span className="text-brand-cyan">{settings.shutter}</span>
            <span className="text-white/60">•</span>
            <span className="text-brand-violet">{settings.iso}</span>
          </div>

          {/* Focus Area */}
          <div className="flex items-center gap-2 text-sm md:text-sm text-xs">
            <span className="text-white/50">Focus:</span>
            <span className="text-brand-orange font-medium">{settings.focus}</span>
          </div>

          {/* Description Tooltip - Hidden on mobile for compactness */}
          <div className="hidden md:block text-white/40 text-[10px] leading-relaxed max-w-[200px] pt-1 border-t border-white/10">
            {settings.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewfinderMetadata;
