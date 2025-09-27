import React, { useState, useEffect, useRef } from 'react';

interface CrosshairProps {
  position: { x: number; y: number };
  isActive?: boolean;
  size?: number;
  strokeWidth?: number;
  color?: string;
  style?: 'default' | 'camera' | 'precision' | 'minimal' | 'plus' | 'circle';
  theme?: 'light' | 'dark' | 'contrast' | 'neon';
  showCenter?: boolean;
  animated?: boolean;
  className?: string;
}

interface FocusRingProps {
  center: { x: number; y: number };
  radius: number;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeDashArray?: string;
  animated?: boolean;
  style?: 'solid' | 'dashed' | 'dotted' | 'pulse' | 'gradient';
  theme?: 'light' | 'dark' | 'contrast' | 'neon';
  isVisible?: boolean;
  opacity?: number;
}

interface CrosshairSystemProps {
  position: { x: number; y: number };
  isActive?: boolean;
  focusRadius?: number;
  crosshairStyle?: CrosshairProps['style'];
  focusRingStyle?: FocusRingProps['style'];
  theme?: 'light' | 'dark' | 'contrast' | 'neon';
  showGrid?: boolean;
  showRuleOfThirds?: boolean;
  centerAlignment?: boolean;
  className?: string;
}

// Color themes
const themes = {
  light: {
    primary: 'rgba(0, 0, 0, 0.8)',
    secondary: 'rgba(0, 0, 0, 0.5)',
    accent: 'rgba(59, 130, 246, 0.8)',
    background: 'rgba(255, 255, 255, 0.1)',
  },
  dark: {
    primary: 'rgba(255, 255, 255, 0.9)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    accent: 'rgba(139, 92, 246, 0.8)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  contrast: {
    primary: 'rgba(255, 255, 0, 0.9)',
    secondary: 'rgba(255, 255, 255, 0.8)',
    accent: 'rgba(255, 0, 255, 0.8)',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  neon: {
    primary: 'rgba(0, 255, 255, 0.9)',
    secondary: 'rgba(255, 0, 255, 0.7)',
    accent: 'rgba(0, 255, 0, 0.8)',
    background: 'rgba(0, 0, 0, 0.5)',
  },
};

// Crosshair Component
export const Crosshair: React.FC<CrosshairProps> = ({
  position,
  isActive = true,
  size = 40,
  strokeWidth = 2,
  color,
  style = 'default',
  theme = 'dark',
  showCenter = true,
  animated = false,
  className = '',
}) => {
  const themeColors = themes[theme];
  const finalColor = color || themeColors.primary;

  // Don't use early return after hooks - handle visibility through conditional rendering
  const renderCrosshair = () => {
    switch (style) {
      case 'camera':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Corner brackets */}
            <g stroke={finalColor} strokeWidth={strokeWidth} fill="none">
              <path d={`M8,8 L8,2 L2,2 L2,8`} />
              <path d={`M${size-8},8 L${size-8},2 L${size-2},2 L${size-2},8`} />
              <path d={`M8,${size-8} L8,${size-2} L2,${size-2} L2,${size-8}`} />
              <path d={`M${size-8},${size-8} L${size-8},${size-2} L${size-2},${size-2} L${size-2},${size-8}`} />
            </g>
            {/* Center lines */}
            <g stroke={finalColor} strokeWidth={strokeWidth/2} fill="none">
              <line x1={size/2 - 6} y1={size/2} x2={size/2 + 6} y2={size/2} />
              <line x1={size/2} y1={size/2 - 6} x2={size/2} y2={size/2 + 6} />
            </g>
            {showCenter && <circle cx={size/2} cy={size/2} r="1" fill={finalColor} />}
          </svg>
        );

      case 'precision':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g stroke={finalColor} strokeWidth={strokeWidth} fill="none">
              {/* Main crosslines */}
              <line x1="4" y1={size/2} x2={size/2 - 8} y2={size/2} />
              <line x1={size/2 + 8} y1={size/2} x2={size - 4} y2={size/2} />
              <line x1={size/2} y1="4" x2={size/2} y2={size/2 - 8} />
              <line x1={size/2} y1={size/2 + 8} x2={size/2} y2={size - 4} />

              {/* Tick marks */}
              <g strokeWidth={strokeWidth/2}>
                <line x1="6" y1={size/2 - 2} x2="6" y2={size/2 + 2} />
                <line x1="10" y1={size/2 - 1} x2="10" y2={size/2 + 1} />
                <line x1={size - 6} y1={size/2 - 2} x2={size - 6} y2={size/2 + 2} />
                <line x1={size - 10} y1={size/2 - 1} x2={size - 10} y2={size/2 + 1} />
                <line x1={size/2 - 2} y1="6" x2={size/2 + 2} y2="6" />
                <line x1={size/2 - 1} y1="10" x2={size/2 + 1} y2="10" />
                <line x1={size/2 - 2} y1={size - 6} x2={size/2 + 2} y2={size - 6} />
                <line x1={size/2 - 1} y1={size - 10} x2={size/2 + 1} y2={size - 10} />
              </g>
            </g>
            {showCenter && <circle cx={size/2} cy={size/2} r="1.5" fill={finalColor} />}
          </svg>
        );

      case 'minimal':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g stroke={finalColor} strokeWidth={strokeWidth} fill="none">
              <line x1={size/2 - 8} y1={size/2} x2={size/2 + 8} y2={size/2} />
              <line x1={size/2} y1={size/2 - 8} x2={size/2} y2={size/2 + 8} />
            </g>
            {showCenter && <circle cx={size/2} cy={size/2} r="0.5" fill={finalColor} />}
          </svg>
        );

      case 'plus':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g stroke={finalColor} strokeWidth={strokeWidth} fill="none">
              <line x1="4" y1={size/2} x2={size - 4} y2={size/2} />
              <line x1={size/2} y1="4" x2={size/2} y2={size - 4} />
            </g>
            {showCenter && <circle cx={size/2} cy={size/2} r="2" fill="none" stroke={finalColor} strokeWidth={strokeWidth/2} />}
          </svg>
        );

      case 'circle':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g stroke={finalColor} strokeWidth={strokeWidth} fill="none">
              <circle cx={size/2} cy={size/2} r={size/2 - 4} />
              <line x1={size/2 - 6} y1={size/2} x2={size/2 + 6} y2={size/2} />
              <line x1={size/2} y1={size/2 - 6} x2={size/2} y2={size/2 + 6} />
            </g>
            {showCenter && <circle cx={size/2} cy={size/2} r="1" fill={finalColor} />}
          </svg>
        );

      default: // 'default'
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g stroke={finalColor} strokeWidth={strokeWidth} fill="none">
              <line x1={size/2 - 12} y1={size/2} x2={size/2 - 4} y2={size/2} />
              <line x1={size/2 + 4} y1={size/2} x2={size/2 + 12} y2={size/2} />
              <line x1={size/2} y1={size/2 - 12} x2={size/2} y2={size/2 - 4} />
              <line x1={size/2} y1={size/2 + 4} x2={size/2} y2={size/2 + 12} />
            </g>
            {showCenter && <circle cx={size/2} cy={size/2} r="1" fill={finalColor} />}
          </svg>
        );
    }
  };

  if (!isActive) {
    return <div className="absolute opacity-0 invisible pointer-events-none" />;
  }

  return (
    <div
      className={`absolute pointer-events-none ${className} ${animated ? 'transition-all duration-100 ease-out' : ''}`}
      style={{
        left: position.x - size/2,
        top: position.y - size/2,
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
    >
      {renderCrosshair()}
    </div>
  );
};

// Focus Ring Component
export const FocusRing: React.FC<FocusRingProps> = ({
  center,
  radius,
  strokeWidth = 2,
  strokeColor,
  fillColor = 'transparent',
  strokeDashArray = '8,4',
  animated = true,
  style = 'dashed',
  theme = 'dark',
  isVisible = true,
  opacity = 0.8,
}) => {
  const themeColors = themes[theme];
  const finalStrokeColor = strokeColor || themeColors.accent;

  // Don't use early return after hooks - handle visibility through conditional rendering
  const getStrokePattern = () => {
    switch (style) {
      case 'solid': return 'none';
      case 'dashed': return strokeDashArray;
      case 'dotted': return '2,6';
      case 'pulse': return strokeDashArray;
      case 'gradient': return 'none';
      default: return strokeDashArray;
    }
  };

  const renderRing = () => {
    if (style === 'gradient') {
      return (
        <svg
          width={radius * 2}
          height={radius * 2}
          className={`absolute pointer-events-none ${animated ? 'transition-all duration-200 ease-out' : ''}`}
          style={{
            left: center.x - radius,
            top: center.y - radius,
            opacity,
          }}
        >
          <defs>
            <radialGradient id="focusGradient" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor={finalStrokeColor} stopOpacity="0" />
              <stop offset="90%" stopColor={finalStrokeColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={finalStrokeColor} stopOpacity="1" />
            </radialGradient>
          </defs>
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth/2}
            fill="none"
            stroke="url(#focusGradient)"
            strokeWidth={strokeWidth}
          />
        </svg>
      );
    }

    return (
      <div
        className={`absolute pointer-events-none ${animated ? 'transition-all duration-200 ease-out' : ''} ${style === 'pulse' ? 'animate-pulse' : ''}`}
        style={{
          left: center.x - radius,
          top: center.y - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: '50%',
          border: `${strokeWidth}px ${style === 'dotted' ? 'dotted' : (style === 'solid' ? 'solid' : 'dashed')} ${finalStrokeColor}`,
          borderStyle: style === 'dashed' ? 'dashed' : (style === 'dotted' ? 'dotted' : 'solid'),
          backgroundColor: fillColor,
          opacity,
          transform: 'translate3d(0, 0, 0)',
        }}
      />
    );
  };

  if (!isVisible) {
    return <div className="absolute opacity-0 invisible pointer-events-none" />;
  }

  return renderRing();
};

// Grid Overlay Component
export const GridOverlay: React.FC<{
  isVisible?: boolean;
  gridType?: 'rule-of-thirds' | 'grid' | 'center' | 'golden-ratio';
  theme?: 'light' | 'dark' | 'contrast' | 'neon';
  opacity?: number;
}> = ({
  isVisible = false,
  gridType = 'rule-of-thirds',
  theme = 'dark',
  opacity = 0.3,
}) => {
  const themeColors = themes[theme];

  // Don't use early return after hooks - handle visibility through conditional rendering
  const renderGrid = () => {
    switch (gridType) {
      case 'rule-of-thirds':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical lines */}
            <div
              className="absolute"
              style={{
                left: '33.333%',
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: themeColors.secondary,
                opacity,
              }}
            />
            <div
              className="absolute"
              style={{
                left: '66.666%',
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: themeColors.secondary,
                opacity,
              }}
            />
            {/* Horizontal lines */}
            <div
              className="absolute"
              style={{
                top: '33.333%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: themeColors.secondary,
                opacity,
              }}
            />
            <div
              className="absolute"
              style={{
                top: '66.666%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: themeColors.secondary,
                opacity,
              }}
            />
          </div>
        );

      case 'grid':
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `
                  linear-gradient(to right, ${themeColors.secondary} 1px, transparent 1px),
                  linear-gradient(to bottom, ${themeColors.secondary} 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                opacity,
              }}
            />
          </div>
        );

      case 'center':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Center cross */}
            <div
              className="absolute"
              style={{
                left: '50%',
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: themeColors.accent,
                opacity,
                transform: 'translateX(-50%)',
              }}
            />
            <div
              className="absolute"
              style={{
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: themeColors.accent,
                opacity,
                transform: 'translateY(-50%)',
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isVisible) {
    return <div className="absolute opacity-0 invisible pointer-events-none" />;
  }

  return renderGrid();
};

// Main Crosshair System Component
export const CrosshairSystem: React.FC<CrosshairSystemProps> = ({
  position,
  isActive = true,
  focusRadius = 100,
  crosshairStyle = 'default',
  focusRingStyle = 'dashed',
  theme = 'dark',
  showGrid = false,
  showRuleOfThirds = false,
  centerAlignment = false,
  className = '',
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Center alignment logic
  useEffect(() => {
    if (centerAlignment) {
      setAdjustedPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    } else {
      setAdjustedPosition(position);
    }
  }, [position, centerAlignment]);

  // Don't use early return after hooks - handle visibility through conditional rendering
  if (!isActive) {
    return <div className="fixed inset-0 opacity-0 invisible pointer-events-none" />;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-40 ${className}`}>
      {/* Grid Overlay */}
      {showGrid && (
        <GridOverlay
          isVisible={true}
          gridType="grid"
          theme={theme}
          opacity={0.2}
        />
      )}

      {/* Rule of Thirds */}
      {showRuleOfThirds && (
        <GridOverlay
          isVisible={true}
          gridType="rule-of-thirds"
          theme={theme}
          opacity={0.3}
        />
      )}

      {/* Focus Ring */}
      <FocusRing
        center={adjustedPosition}
        radius={focusRadius}
        style={focusRingStyle}
        theme={theme}
        isVisible={true}
        animated={true}
      />

      {/* Crosshair */}
      <Crosshair
        position={adjustedPosition}
        isActive={true}
        style={crosshairStyle}
        theme={theme}
        animated={true}
        showCenter={true}
      />
    </div>
  );
};

export default CrosshairSystem;