/**
 * Passive/Ambient State Demos
 *
 * Demonstrations of passive and loading states:
 * - Loading spinners
 * - Skeleton screens
 * - Pulse animations
 * - Status indicators
 */

import React, { useState, useEffect } from 'react';

// Loading Spinner Demo
export const LoadingSpinnerDemo: React.FC<{
  variant?: 'spin' | 'pulse' | 'dots' | 'bars';
  size?: 'sm' | 'md' | 'lg';
}> = ({ variant = 'spin', size = 'md' }) => {
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div className="flex flex-col items-center gap-6">
        {/* Spin variant */}
        {variant === 'spin' && (
          <div className={`${sizeClasses[size]} border-4 border-white/20 border-t-athletic-brand-violet rounded-full animate-spin`} data-testid="spinner-spin" />
        )}

        {/* Pulse variant */}
        {variant === 'pulse' && (
          <div className={`${sizeClasses[size]} bg-athletic-brand-violet rounded-full animate-pulse`} data-testid="spinner-pulse" />
        )}

        {/* Dots variant */}
        {variant === 'dots' && (
          <div className="flex gap-2" data-testid="spinner-dots">
            <div className="w-3 h-3 bg-athletic-brand-violet rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-athletic-brand-violet rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-athletic-brand-violet rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Bars variant */}
        {variant === 'bars' && (
          <div className="flex gap-1 items-end h-12" data-testid="spinner-bars">
            {[0, 150, 300, 150].map((delay, i) => (
              <div
                key={i}
                className="w-2 bg-athletic-brand-violet rounded-full animate-pulse"
                style={{
                  animationDelay: `${delay}ms`,
                  height: '100%'
                }}
              />
            ))}
          </div>
        )}

        <div className="text-white/80">Loading content...</div>

        <button
          onClick={() => setIsLoading(!isLoading)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          {isLoading ? 'Stop Loading' : 'Start Loading'}
        </button>
      </div>
    </div>
  );
};

// Skeleton Screen Demo
export const SkeletonScreenDemo: React.FC<{
  showContent?: boolean;
}> = ({ showContent: initialShowContent = false }) => {
  const [showContent, setShowContent] = useState(initialShowContent);
  const [isLoading, setIsLoading] = useState(!initialShowContent);

  const loadContent = () => {
    setIsLoading(true);
    setShowContent(false);

    setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-neutral-900 rounded-lg p-8">
      <div className="w-full max-w-md">
        {isLoading ? (
          // Skeleton
          <div className="animate-pulse" data-testid="skeleton">
            <div className="h-48 bg-white/10 rounded-xl mb-4" />
            <div className="h-6 bg-white/10 rounded-lg w-3/4 mb-4" />
            <div className="h-4 bg-white/10 rounded-lg w-full mb-2" />
            <div className="h-4 bg-white/10 rounded-lg w-5/6" />
          </div>
        ) : showContent ? (
          // Actual Content
          <div data-testid="loaded-content">
            <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl mb-4 flex items-center justify-center text-white text-2xl font-bold">
              Image Loaded
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Article Title</h3>
            <p className="text-white/70 mb-2">
              This is the actual content that appears after loading is complete.
            </p>
            <p className="text-white/70">
              The skeleton provides visual feedback during the loading state.
            </p>
          </div>
        ) : null}

        <button
          onClick={loadContent}
          className="mt-6 w-full px-4 py-4 bg-athletic-brand-violet hover:bg-athletic-brand-violet/90 text-white font-semibold rounded-lg transition-colors"
        >
          {isLoading ? 'Loading...' : 'Reload Content'}
        </button>
      </div>
    </div>
  );
};

// Pulse Animation Demo
export const PulseAnimationDemo: React.FC<{
  speed?: 'slow' | 'normal' | 'fast';
  intensity?: 'low' | 'medium' | 'high';
}> = ({ speed = 'normal', intensity = 'medium' }) => {
  const speedDurations = {
    slow: 'duration-2000',
    normal: 'duration-1000',
    fast: 'duration-500'
  };

  const intensityOpacities = {
    low: 'opacity-70',
    medium: 'opacity-50',
    high: 'opacity-30'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div className="space-y-8 w-full max-w-md">
        {/* Pulsing dot */}
        <div className="flex items-center gap-4">
          <div className={`relative w-4 h-4 bg-green-500 rounded-full animate-pulse ${speedDurations[speed]}`} data-testid="pulse-dot">
            <div className={`absolute inset-0 bg-green-500 rounded-full animate-ping ${intensityOpacities[intensity]}`} />
          </div>
          <span className="text-white/80">Status: Active</span>
        </div>

        {/* Pulsing card */}
        <div className={`p-6 bg-white/5 border border-white/10 rounded-xl animate-pulse ${speedDurations[speed]}`} data-testid="pulse-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-athletic-brand-violet/50 rounded-full" />
            <div>
              <div className="text-white font-semibold">New Notification</div>
              <div className="text-white/60 text-sm">Just now</div>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            This card pulses to draw attention to new content
          </p>
        </div>

        {/* Pulsing button */}
        <button
          className={`w-full px-6 py-4 bg-athletic-brand-violet text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 animate-pulse ${speedDurations[speed]}`}
          data-testid="pulse-button"
        >
          Click Me - I'm Pulsing
        </button>
      </div>
    </div>
  );
};

// Status Indicator Demo
export const StatusIndicatorDemo: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<'online' | 'away' | 'busy' | 'offline'>('online');

  const statuses = [
    { id: 'online' as const, label: 'Online', color: 'bg-green-500', pulse: true },
    { id: 'away' as const, label: 'Away', color: 'bg-yellow-500', pulse: true },
    { id: 'busy' as const, label: 'Busy', color: 'bg-red-500', pulse: false },
    { id: 'offline' as const, label: 'Offline', color: 'bg-gray-500', pulse: false },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatus(prev => {
        const currentIndex = statuses.findIndex(s => s.id === prev);
        return statuses[(currentIndex + 1) % statuses.length].id;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentStatusObj = statuses.find(s => s.id === currentStatus)!;

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div className="space-y-6">
        {/* Status badge */}
        <div className="flex items-center gap-4" data-testid="status-badge">
          <div className="relative">
            <div className={`w-4 h-4 ${currentStatusObj.color} rounded-full ${currentStatusObj.pulse ? 'animate-pulse' : ''}`} />
            {currentStatusObj.pulse && (
              <div className={`absolute inset-0 ${currentStatusObj.color} rounded-full animate-ping opacity-40`} />
            )}
          </div>
          <span className="text-white font-semibold">{currentStatusObj.label}</span>
        </div>

        {/* Status list */}
        <div className="space-y-2">
          {statuses.map(status => (
            <button
              key={status.id}
              onClick={() => setCurrentStatus(status.id)}
              className={`
                w-full flex items-center gap-4 px-4 py-4 rounded-lg
                transition-all duration-200
                ${currentStatus === status.id
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
                }
              `}
              data-testid={`status-${status.id}`}
            >
              <div className="relative">
                <div className={`w-3 h-3 ${status.color} rounded-full ${status.pulse && currentStatus === status.id ? 'animate-pulse' : ''}`} />
              </div>
              <span className="text-white/80">{status.label}</span>
            </button>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg" data-testid="progress-indicator">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">Upload Progress</span>
            <span className="text-white/60 text-sm">75%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-athletic-brand-violet rounded-full transition-all duration-500" style={{ width: '75%' }}>
              <div className="h-full bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
