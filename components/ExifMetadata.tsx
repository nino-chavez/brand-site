import React, { useState, useEffect, useRef } from 'react';

interface ExifData {
  camera: {
    make: string;
    model: string;
    lens: string;
    focalLength: string;
    aperture: string;
    shutterSpeed: string;
    iso: string;
  };
  technical: {
    framework: string;
    version: string;
    renderTime: string;
    componentCount: number;
    bundleSize: string;
    performance: string;
  };
  capture: {
    timestamp: string;
    position: { x: number; y: number };
    screenResolution: string;
    contentZone: string;
    colorSpace: string;
    exposure: string;
  };
}

interface ExifMetadataProps {
  position: { x: number; y: number };
  isVisible: boolean;
  data?: Partial<ExifData>;
  displayMode?: 'camera' | 'technical' | 'capture' | 'all';
  theme?: 'dark' | 'light' | 'camera';
  fadeInDelay?: number;
  positioning?: 'relative' | 'smart' | 'fixed';
  className?: string;
}

const ExifMetadata: React.FC<ExifMetadataProps> = ({
  position,
  isVisible,
  data = {},
  displayMode = 'camera',
  theme = 'dark',
  fadeInDelay = 200,
  positioning = 'smart',
  className = '',
}) => {
  const [actualPosition, setActualPosition] = useState(position);
  const [opacity, setOpacity] = useState(0);
  const metadataRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Default EXIF data
  const defaultData: ExifData = {
    camera: {
      make: 'Canon',
      model: 'EOS R5',
      lens: '24-70mm f/2.8L IS USM',
      focalLength: '50mm',
      aperture: 'f/2.8',
      shutterSpeed: '1/60',
      iso: 'ISO 100',
    },
    technical: {
      framework: 'React',
      version: '19.1.1',
      renderTime: '16.7ms',
      componentCount: 12,
      bundleSize: '208KB',
      performance: '60fps',
    },
    capture: {
      timestamp: new Date().toLocaleString(),
      position: position,
      screenResolution: `${window.innerWidth}×${window.innerHeight}`,
      contentZone: 'hero-section',
      colorSpace: 'sRGB',
      exposure: '+0.3 EV',
    },
  };

  const mergedData = { ...defaultData, ...data };

  // Smart positioning to avoid screen edges
  useEffect(() => {
    if (positioning === 'smart' && metadataRef.current) {
      const rect = metadataRef.current.getBoundingClientRect();
      let newPosition = { ...position };

      // Adjust X position if too close to right edge
      if (position.x + rect.width + 20 > window.innerWidth) {
        newPosition.x = position.x - rect.width - 20;
      } else {
        newPosition.x = position.x + 20;
      }

      // Adjust Y position if too close to bottom edge
      if (position.y + rect.height + 20 > window.innerHeight) {
        newPosition.y = position.y - rect.height - 20;
      } else {
        newPosition.y = position.y + 20;
      }

      setActualPosition(newPosition);
    } else {
      setActualPosition(position);
    }
  }, [position, positioning]);

  // Handle visibility with fade effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isVisible) {
      timeoutRef.current = setTimeout(() => {
        setOpacity(1);
      }, fadeInDelay);
    } else {
      setOpacity(0);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, fadeInDelay]);

  // Handle visibility through conditional rendering instead of early return
  const shouldRender = isVisible || opacity > 0;

  const themeClasses = {
    dark: 'bg-black/90 text-white border-gray-700',
    light: 'bg-white/90 text-black border-gray-300',
    camera: 'bg-black/95 text-green-400 border-green-600',
  };

  const accentColors = {
    dark: 'text-blue-400',
    light: 'text-blue-600',
    camera: 'text-orange-400',
  };

  const renderCameraData = () => (
    <div className="space-y-1">
      <div className={`${accentColors[theme]} font-semibold text-xs tracking-wider`}>
        CAMERA
      </div>
      <div className="text-sm">{mergedData.camera.make} {mergedData.camera.model}</div>
      <div className="text-xs">{mergedData.camera.lens}</div>

      <div className={`${accentColors[theme]} font-semibold text-xs tracking-wider mt-3`}>
        SETTINGS
      </div>
      <div className="grid grid-cols-2 gap-x-3 text-xs">
        <div>{mergedData.camera.focalLength}</div>
        <div>{mergedData.camera.aperture}</div>
        <div>{mergedData.camera.shutterSpeed}</div>
        <div>{mergedData.camera.iso}</div>
      </div>
    </div>
  );

  const renderTechnicalData = () => (
    <div className="space-y-1">
      <div className={`${accentColors[theme]} font-semibold text-xs tracking-wider`}>
        TECHNICAL
      </div>
      <div className="text-sm">{mergedData.technical.framework} {mergedData.technical.version}</div>

      <div className="grid grid-cols-2 gap-x-3 text-xs mt-2">
        <div>Render: {mergedData.technical.renderTime}</div>
        <div>FPS: {mergedData.technical.performance}</div>
        <div>Components: {mergedData.technical.componentCount}</div>
        <div>Bundle: {mergedData.technical.bundleSize}</div>
      </div>
    </div>
  );

  const renderCaptureData = () => (
    <div className="space-y-1">
      <div className={`${accentColors[theme]} font-semibold text-xs tracking-wider`}>
        CAPTURE
      </div>
      <div className="text-xs">
        {mergedData.capture.timestamp}
      </div>
      <div className="text-xs">
        Position: {mergedData.capture.position.x}, {mergedData.capture.position.y}
      </div>
      <div className="text-xs">
        Resolution: {mergedData.capture.screenResolution}
      </div>
      <div className="text-xs">
        Zone: {mergedData.capture.contentZone}
      </div>
      <div className="text-xs">
        Exposure: {mergedData.capture.exposure}
      </div>
    </div>
  );

  const getPositionStyles = (): React.CSSProperties => {
    switch (positioning) {
      case 'fixed':
        return {
          position: 'fixed',
          left: actualPosition.x,
          top: actualPosition.y,
        };
      case 'relative':
        return {
          position: 'relative',
        };
      case 'smart':
      default:
        return {
          position: 'fixed',
          left: actualPosition.x,
          top: actualPosition.y,
          zIndex: 50,
        };
    }
  };

  if (!shouldRender) {
    return <div className="fixed pointer-events-none opacity-0 invisible" />;
  }

  return (
    <div
      ref={metadataRef}
      className={`
        ${themeClasses[theme]}
        ${className}
        font-mono text-xs
        p-3 rounded-md border backdrop-blur-sm
        pointer-events-none select-none
        transition-opacity duration-300 ease-out
      `}
      style={{
        ...getPositionStyles(),
        opacity: opacity,
        minWidth: '200px',
        maxWidth: '280px',
        transform: 'translateZ(0)', // Hardware acceleration
      }}
    >
      {displayMode === 'camera' && renderCameraData()}
      {displayMode === 'technical' && renderTechnicalData()}
      {displayMode === 'capture' && renderCaptureData()}

      {displayMode === 'all' && (
        <div className="space-y-4">
          {renderCameraData()}
          {renderTechnicalData()}
          {renderCaptureData()}
        </div>
      )}
    </div>
  );
};

// Animated EXIF component with typewriter effect
export const AnimatedExifMetadata: React.FC<ExifMetadataProps & {
  typewriterSpeed?: number;
}> = ({ typewriterSpeed = 50, ...props }) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const fullTextRef = useRef('');

  useEffect(() => {
    if (!props.isVisible) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    // Generate full text based on display mode
    const generateFullText = () => {
      let text = '';

      if (props.displayMode === 'camera' || props.displayMode === 'all') {
        text += 'CAMERA\nCanon EOS R5\n24-70mm f/2.8L\n\nSETTINGS\n50mm f/2.8\n1/60 ISO 100\n\n';
      }

      if (props.displayMode === 'technical' || props.displayMode === 'all') {
        text += 'TECHNICAL\nReact 19.1.1\nRender: 16.7ms\nFPS: 60\n\n';
      }

      return text;
    };

    fullTextRef.current = generateFullText();

    let index = 0;
    const typewriter = setInterval(() => {
      if (index < fullTextRef.current.length) {
        setDisplayText(fullTextRef.current.substring(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(typewriter);
      }
    }, typewriterSpeed);

    return () => clearInterval(typewriter);
  }, [props.isVisible, props.displayMode, typewriterSpeed]);

  // Handle visibility through conditional rendering instead of early return

  if (!props.isVisible) {
    return <div className="fixed pointer-events-none opacity-0 invisible" />;
  }

  return (
    <div
      className="fixed bg-black/95 text-green-400 font-mono text-xs p-3 rounded-md border border-green-600 pointer-events-none"
      style={{
        left: props.position.x + 20,
        top: props.position.y + 20,
        zIndex: 50,
        minWidth: '200px',
      }}
    >
      <pre className="whitespace-pre-wrap">
        {displayText}
        {!isComplete && <span className="animate-pulse">|</span>}
      </pre>
    </div>
  );
};

// Context-aware EXIF that changes based on content area
export const ContextualExifMetadata: React.FC<{
  position: { x: number; y: number };
  isVisible: boolean;
  contentZone?: string;
  className?: string;
}> = ({ position, isVisible, contentZone = 'unknown', className = '' }) => {
  const [contextData, setContextData] = useState<Partial<ExifData>>({});

  useEffect(() => {
    // Generate context-specific data based on content zone
    const getContextData = (zone: string): Partial<ExifData> => {
      const baseData = {
        capture: {
          timestamp: new Date().toLocaleString(),
          position: position,
          screenResolution: `${window.innerWidth}×${window.innerHeight}`,
          contentZone: zone,
          colorSpace: 'sRGB',
          exposure: '+0.0 EV',
        },
      };

      switch (zone) {
        case 'hero-title':
          return {
            ...baseData,
            camera: {
              make: 'Canon',
              model: 'EOS R5',
              lens: '85mm f/1.4L IS USM',
              focalLength: '85mm',
              aperture: 'f/1.4',
              shutterSpeed: '1/200',
              iso: 'ISO 200',
            },
          };
        case 'navigation':
          return {
            ...baseData,
            camera: {
              make: 'Canon',
              model: 'EOS R5',
              lens: '24-70mm f/2.8L',
              focalLength: '35mm',
              aperture: 'f/4.0',
              shutterSpeed: '1/125',
              iso: 'ISO 400',
            },
          };
        case 'about-content':
          return {
            ...baseData,
            camera: {
              make: 'Canon',
              model: 'EOS R5',
              lens: '50mm f/1.2L',
              focalLength: '50mm',
              aperture: 'f/2.8',
              shutterSpeed: '1/60',
              iso: 'ISO 100',
            },
          };
        default:
          return baseData;
      }
    };

    setContextData(getContextData(contentZone));
  }, [contentZone, position]);

  return (
    <ExifMetadata
      position={position}
      isVisible={isVisible}
      data={contextData}
      displayMode="all"
      theme="camera"
      className={className}
    />
  );
};

export default ExifMetadata;