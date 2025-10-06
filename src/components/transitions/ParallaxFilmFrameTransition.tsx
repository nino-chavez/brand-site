/**
 * Parallax Film Frame Transition
 *
 * 3D-effect film frame edges that move at different speeds.
 * Creates depth and dimension through layered parallax motion.
 *
 * @version 1.0.0
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ParallaxFilmFrameTransitionProps {
  /** Number of frame layers */
  layerCount?: number;
  /** Frame color */
  frameColor?: string;
}

export function ParallaxFilmFrameTransition({
  layerCount = 3,
  frameColor = 'rgba(139, 92, 246, 0.7)',
}: ParallaxFilmFrameTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Generate parallax speeds for each layer (further = slower)
  const getParallaxSpeed = (layerIndex: number) => {
    return 1 - (layerIndex / layerCount) * 0.6; // Range: 1.0 to 0.4
  };

  // Opacity fades in/out
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  return (
    <div ref={ref} className="absolute left-0 right-0 h-64 overflow-hidden pointer-events-none z-35">
      <motion.div style={{ opacity }} className="relative w-full h-full">
        {/* Render multiple parallax layers */}
        {Array.from({ length: layerCount }).map((_, layerIndex) => {
          const speed = getParallaxSpeed(layerIndex);
          const layerY = useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed]);
          const layerScale = 1 + (layerIndex / layerCount) * 0.3; // Closer layers are larger
          const layerOpacity = 1 - (layerIndex / layerCount) * 0.5; // Closer layers are more opaque

          return (
            <motion.div
              key={`layer-${layerIndex}`}
              style={{
                y: layerY,
                scale: layerScale,
                opacity: layerOpacity,
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1200 200"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0"
              >
                <defs>
                  {/* Film grain texture */}
                  <filter id={`film-grain-${layerIndex}`}>
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.9"
                      numOctaves="4"
                      seed={layerIndex * 10}
                    />
                    <feColorMatrix type="saturate" values="0" />
                    <feBlend mode="multiply" in="SourceGraphic" />
                  </filter>

                  {/* Frame edge gradient */}
                  <linearGradient id={`frame-gradient-${layerIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={frameColor} stopOpacity="0.9" />
                    <stop offset="50%" stopColor={frameColor} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={frameColor} stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Top film frame edge */}
                <g>
                  {/* Main frame bar */}
                  <rect
                    x="0"
                    y="10"
                    width="1200"
                    height="20"
                    fill={`url(#frame-gradient-${layerIndex})`}
                    filter={`url(#film-grain-${layerIndex})`}
                  />

                  {/* Frame notches (film registration pins) */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const x = (1200 / 8) * i + (1200 / 16);
                    return (
                      <g key={`notch-top-${i}`}>
                        <rect
                          x={x - 15}
                          y="5"
                          width="30"
                          height="10"
                          fill={frameColor}
                          opacity="0.6"
                        />
                        <rect
                          x={x - 12}
                          y="7"
                          width="24"
                          height="6"
                          fill="rgba(15, 23, 42, 0.8)"
                        />
                      </g>
                    );
                  })}

                  {/* Edge highlights (metallic sheen) */}
                  <rect
                    x="0"
                    y="10"
                    width="1200"
                    height="2"
                    fill="rgba(255, 255, 255, 0.3)"
                  />
                </g>

                {/* Bottom film frame edge */}
                <g>
                  <rect
                    x="0"
                    y="170"
                    width="1200"
                    height="20"
                    fill={`url(#frame-gradient-${layerIndex})`}
                    filter={`url(#film-grain-${layerIndex})`}
                  />

                  {Array.from({ length: 8 }).map((_, i) => {
                    const x = (1200 / 8) * i + (1200 / 16);
                    return (
                      <g key={`notch-bottom-${i}`}>
                        <rect
                          x={x - 15}
                          y="185"
                          width="30"
                          height="10"
                          fill={frameColor}
                          opacity="0.6"
                        />
                        <rect
                          x={x - 12}
                          y="187"
                          width="24"
                          height="6"
                          fill="rgba(15, 23, 42, 0.8)"
                        />
                      </g>
                    );
                  })}

                  <rect
                    x="0"
                    y="188"
                    width="1200"
                    height="2"
                    fill="rgba(255, 255, 255, 0.3)"
                  />
                </g>

                {/* Left edge sprocket guide */}
                <rect
                  x="0"
                  y="30"
                  width="8"
                  height="140"
                  fill={frameColor}
                  opacity="0.5"
                />

                {/* Right edge sprocket guide */}
                <rect
                  x="1192"
                  y="30"
                  width="8"
                  height="140"
                  fill={frameColor}
                  opacity="0.5"
                />

                {/* Corner reinforcements */}
                {[
                  { x: 10, y: 10 },
                  { x: 1180, y: 10 },
                  { x: 10, y: 170 },
                  { x: 1180, y: 170 },
                ].map((corner, i) => (
                  <g key={`corner-${i}`}>
                    <circle
                      cx={corner.x}
                      cy={corner.y + 10}
                      r="4"
                      fill="rgba(255, 255, 255, 0.4)"
                    />
                    <circle
                      cx={corner.x}
                      cy={corner.y + 10}
                      r="2"
                      fill="rgba(15, 23, 42, 0.9)"
                    />
                  </g>
                ))}
              </svg>
            </motion.div>
          );
        })}

        {/* Depth shadow (creates 3D effect) */}
        <motion.div
          style={{ opacity }}
          className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20"
        />
      </motion.div>
    </div>
  );
}
