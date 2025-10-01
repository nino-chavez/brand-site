import React, { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
    // Camera preparation metaphors
    { text: 'Adjusting aperture...', subtitle: 'Setting depth of field' },
    { text: 'Calibrating shutter speed...', subtitle: 'Capturing motion' },
    { text: 'Metering exposure...', subtitle: 'Balancing light' },
    { text: 'Focusing lens elements...', subtitle: 'Achieving clarity' },
    { text: 'Loading film cartridge...', subtitle: 'Preparing for capture' },
    { text: 'Setting ISO sensitivity...', subtitle: 'Adapting to conditions' },
    { text: 'Composing the frame...', subtitle: 'Finding balance' },
    { text: 'Checking white balance...', subtitle: 'Capturing true colors' }
];

interface LoadingScreenProps {
    isLoading: boolean;
    onLoadComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, onLoadComplete }) => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    // Rotate messages every 800ms
    useEffect(() => {
        if (!isLoading) return;

        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 800);

        return () => clearInterval(interval);
    }, [isLoading]);

    // Simulate progress
    useEffect(() => {
        if (!isLoading) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                // Slow down as we approach 100%
                const increment = prev < 60 ? 3 : prev < 85 ? 1.5 : 0.5;
                return Math.min(prev + increment, 100);
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isLoading]);

    // Handle loading complete
    useEffect(() => {
        if (!isLoading && progress >= 90) {
            setIsExiting(true);
            const timeout = setTimeout(() => {
                onLoadComplete?.();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isLoading, progress, onLoadComplete]);

    if (!isLoading && isExiting) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500 opacity-0 pointer-events-none">
                {/* Exiting state */}
            </div>
        );
    }

    if (!isLoading && !isExiting) {
        return null;
    }

    const currentMessage = LOADING_MESSAGES[messageIndex];

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <div className="max-w-md w-full px-8">
                {/* Animated aperture-style spinner */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-brand-violet/20 rounded-full" />
                    <div
                        className="absolute inset-0 border-4 border-transparent border-t-brand-violet rounded-full animate-spin"
                        style={{ animationDuration: '1.2s' }}
                    />
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-brand-violet rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Loading message with fade transition */}
                <div className="text-center mb-8 min-h-[80px]">
                    <h2 className="text-2xl font-bold text-white mb-2 transition-opacity duration-300">
                        {currentMessage.text}
                    </h2>
                    <p className="text-gray-400 text-sm transition-opacity duration-300">
                        {currentMessage.subtitle}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="relative w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-violet to-violet-400 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Percentage */}
                <div className="text-center mt-4">
                    <span className="text-brand-violet font-mono text-sm">
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
