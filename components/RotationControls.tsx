import React, { useCallback } from 'react';
import { RotationControlsProps } from '../types';

/**
 * RotationControls Component
 *
 * Provides clockwise and counterclockwise rotation controls for the volleyball navigation.
 * Positioned below the court with athletic styling.
 *
 * Features:
 * - Clockwise/counterclockwise rotation buttons
 * - Athletic design token integration
 * - Accessibility support with ARIA labels
 * - Visual feedback for interactions
 * - Disabled state handling
 */
export function RotationControls({
    onRotate,
    disabled = false,
    size = 'medium',
    className = ''
}: RotationControlsProps) {
    const sizeStyles = {
        small: 'w-6 h-6 text-sm',
        medium: 'w-8 h-8 text-base',
        large: 'w-10 h-10 text-lg'
    };

    const buttonSize = sizeStyles[size];

    const handleClockwiseRotation = useCallback(() => {
        if (!disabled) {
            onRotate('clockwise');
        }
    }, [onRotate, disabled]);

    const handleCounterClockwiseRotation = useCallback(() => {
        if (!disabled) {
            onRotate('counterclockwise');
        }
    }, [onRotate, disabled]);

    return (
        <div
            className={`
                rotation-controls
                flex items-center justify-center
                space-x-4
                ${className}
            `}
            role="group"
            aria-label="Rotation controls"
        >
            {/* Counterclockwise rotation */}
            <button
                className={`
                    ${buttonSize}
                    rounded-full
                    border-2
                    athletic-animate-transition
                    flex items-center justify-center
                    font-bold
                    shadow-md
                    backdrop-blur-sm
                    transform transition-all duration-200

                    ${disabled
                        ? `
                            bg-gray-300 text-gray-500
                            border-gray-300
                            cursor-not-allowed
                            opacity-50
                        `
                        : `
                            bg-athletic-court-navy/80 text-white
                            border-athletic-court-navy
                            hover:scale-105 hover:shadow-lg
                            hover:bg-athletic-brand-violet
                            hover:border-athletic-brand-violet
                            active:scale-95
                            cursor-pointer
                        `
                    }

                    focus:outline-none
                    focus:ring-2 focus:ring-athletic-court-orange/50
                    focus:ring-offset-2 focus:ring-offset-transparent
                `}
                onClick={handleCounterClockwiseRotation}
                disabled={disabled}
                aria-label="Rotate counterclockwise"
                title="Rotate counterclockwise (Left Arrow)"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8V4l8 8-8 8V16c-4.418 0-8-3.582-8-8s3.582-8 8-8z"
                        transform="scale(-1,1) translate(-24,0)"
                    />
                </svg>
            </button>

            {/* Rotation indicator */}
            <div
                className="flex flex-col items-center space-y-1"
                aria-hidden="true"
            >
                <div
                    className={`
                        w-1 h-1 rounded-full
                        ${disabled
                            ? 'bg-gray-400'
                            : 'bg-athletic-court-orange'
                        }
                        animate-pulse
                    `}
                />
                <div className="text-xs text-athletic-court-navy/60 font-medium">
                    ROTATE
                </div>
            </div>

            {/* Clockwise rotation */}
            <button
                className={`
                    ${buttonSize}
                    rounded-full
                    border-2
                    athletic-animate-transition
                    flex items-center justify-center
                    font-bold
                    shadow-md
                    backdrop-blur-sm
                    transform transition-all duration-200

                    ${disabled
                        ? `
                            bg-gray-300 text-gray-500
                            border-gray-300
                            cursor-not-allowed
                            opacity-50
                        `
                        : `
                            bg-athletic-court-navy/80 text-white
                            border-athletic-court-navy
                            hover:scale-105 hover:shadow-lg
                            hover:bg-athletic-brand-violet
                            hover:border-athletic-brand-violet
                            active:scale-95
                            cursor-pointer
                        `
                    }

                    focus:outline-none
                    focus:ring-2 focus:ring-athletic-court-orange/50
                    focus:ring-offset-2 focus:ring-offset-transparent
                `}
                onClick={handleClockwiseRotation}
                disabled={disabled}
                aria-label="Rotate clockwise"
                title="Rotate clockwise (Right Arrow)"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8V4l8 8-8 8V16c-4.418 0-8-3.582-8-8s3.582-8 8-8z"
                    />
                </svg>
            </button>

            {/* Accessibility instructions */}
            <div className="sr-only">
                Use left and right arrow keys to rotate through positions.
                Click buttons or press Enter/Space to activate rotation.
            </div>
        </div>
    );
}

export default RotationControls;