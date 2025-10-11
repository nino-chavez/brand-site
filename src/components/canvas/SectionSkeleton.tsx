/**
 * SectionSkeleton - Loading placeholder for canvas sections
 *
 * Provides skeleton screens that match each section's paper texture aesthetic
 * with shimmer animation during content load.
 *
 * @fileoverview Loading states for progressive content disclosure
 * @version 1.0.0
 */

import React from 'react';

export type PaperStyle = 'torn' | 'ruled' | 'folded' | 'index' | 'filmstrip' | 'polaroid';

export interface SectionSkeletonProps {
  paperStyle: PaperStyle;
  width: number;
  height: number;
  contentBlocks?: number;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  paperStyle,
  width,
  height,
  contentBlocks = 3
}) => {
  // Paper-specific styles matching CanvasPortfolioLayout textures
  const paperBorder = React.useMemo(() => {
    switch (paperStyle) {
      case 'torn':
        return {
          clipPath: 'polygon(0 2%, 3% 0, 97% 0, 100% 3%, 100% 97%, 97% 100%, 3% 100%, 0 98%)',
          borderLeft: '3px solid rgba(255, 150, 150, 0.2)',
        };
      case 'ruled':
        return {
          background: 'linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), rgba(139, 92, 246, 0.1) calc(100% - 1px))',
          backgroundSize: '100% 28px',
          borderTop: '3px double rgba(139, 92, 246, 0.15)',
        };
      case 'folded':
        return {
          clipPath: 'polygon(0 0, 100% 0, 100% 95%, 97% 100%, 0 100%)',
          boxShadow: 'inset -10px -10px 20px rgba(0, 0, 0, 0.05)',
        };
      case 'index':
        return {
          background: 'linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), rgba(245, 158, 11, 0.1) calc(100% - 1px))',
          backgroundSize: '100% 24px',
          borderLeft: '4px solid rgba(245, 158, 11, 0.2)',
        };
      case 'filmstrip':
        return {
          border: '12px solid #3a3a3a',
          background: 'radial-gradient(circle at 12px 12px, #2a2a2a 4px, transparent 5px)',
          backgroundSize: '24px 48px',
        };
      case 'polaroid':
        return {
          border: '16px solid #f5f5f5',
          borderBottom: '60px solid #f5f5f5',
        };
      default:
        return {};
    }
  }, [paperStyle]);

  return (
    <div
      className="section-skeleton relative bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...paperBorder,
      }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer-gradient" />

      {/* Content block placeholders */}
      <div className="relative z-10 p-8 space-y-6">
        {/* Header block */}
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-gray-200/60 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200/40 rounded animate-pulse" />
        </div>

        {/* Content blocks */}
        {Array.from({ length: contentBlocks }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full bg-gray-200/50 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            <div className="h-4 w-5/6 bg-gray-200/50 rounded animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
            <div className="h-4 w-4/6 bg-gray-200/50 rounded animate-pulse" style={{ animationDelay: `${i * 100 + 100}ms` }} />
          </div>
        ))}

        {/* Bottom action placeholder */}
        <div className="pt-4">
          <div className="h-10 w-32 bg-gray-200/60 rounded animate-pulse" />
        </div>
      </div>

      <style>{`
        .shimmer-gradient {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default SectionSkeleton;
