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
  about: {
    aperture: 'f/8',
    shutter: '1/125s',
    iso: 'ISO 200',
    focus: 'Technical Excellence',
    description: 'Balanced depth for comprehensive understanding'
  },
  work: {
    aperture: 'f/2.8',
    shutter: '1/1000s',
    iso: 'ISO 400',
    focus: 'Results Driven',
    description: 'Fast capture of impactful moments'
  },
  contact: {
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
  position?: 'top-left' | 'bottom-right' | 'floating';
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

  useEffect(() => {
    const newSettings = SECTION_SETTINGS[currentSection] || SECTION_SETTINGS.hero;

    if (newSettings !== settings) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSettings(newSettings);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 200);
    }
  }, [currentSection, settings]);

  const positionClasses = {
    'top-left': 'top-24 left-4', // Avoid header nav (was top-4)
    'bottom-right': 'bottom-4 right-4',
    'floating': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-40 pointer-events-none transition-all duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${isTransitioning ? 'blur-sm' : 'blur-0'} ${className}`}
      style={style}
    >
      <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3 space-y-1 font-mono text-xs">
        {/* Camera Settings */}
        <div className="flex items-center gap-3 text-white/90">
          <span className="text-brand-orange font-semibold">{settings.aperture}</span>
          <span className="text-white/60">•</span>
          <span className="text-brand-cyan">{settings.shutter}</span>
          <span className="text-white/60">•</span>
          <span className="text-brand-violet">{settings.iso}</span>
        </div>

        {/* Focus Area */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/50">Focus:</span>
          <span className="text-brand-orange font-medium">{settings.focus}</span>
        </div>

        {/* Description Tooltip */}
        <div className="text-white/40 text-[10px] leading-relaxed max-w-[200px] pt-1 border-t border-white/10">
          {settings.description}
        </div>
      </div>
    </div>
  );
};

export default ViewfinderMetadata;
