
import React from 'react';
import { useMouseTracking } from '../hooks/useMouseTracking';

const SpotlightCursor: React.FC = () => {
    const { currentPosition } = useMouseTracking({
        throttleMs: 16, // 60fps
    });

    return (
        <div
            className="pointer-events-none fixed inset-0 z-30 transition duration-300 motion-safe:block hidden"
            style={{
                background: `radial-gradient(600px at ${currentPosition.x}px ${currentPosition.y}px, rgba(139, 92, 246, 0.15), transparent 80%)`
            }}
        />
    );
};

export default SpotlightCursor;
