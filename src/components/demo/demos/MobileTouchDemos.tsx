/**
 * Mobile Touch Gesture Demos
 *
 * Demonstrations of touch-specific interactions:
 * - Tap feedback
 * - Swipe gestures
 * - Long press
 * - Touch-optimized buttons
 */

import React, { useState, useRef, useEffect } from 'react';

// Tap Feedback Demo
export const TapFeedbackDemo: React.FC<{
  rippleColor?: string;
}> = ({ rippleColor = 'rgba(139, 92, 246, 0.4)' }) => {
  const [taps, setTaps] = useState<{ x: number; y: number; id: number }[]>([]);
  const [tapCount, setTapCount] = useState(0);

  const handleTap = (e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const newTap = { x, y, id: Date.now() };
    setTaps(prev => [...prev, newTap]);
    setTapCount(prev => prev + 1);

    setTimeout(() => {
      setTaps(prev => prev.filter(tap => tap.id !== newTap.id));
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div
        onTouchStart={handleTap}
        onClick={handleTap}
        className="relative w-64 h-64 bg-white/5 rounded-2xl border-2 border-white/20 cursor-pointer overflow-hidden flex items-center justify-center"
        data-testid="tap-area"
      >
        <div className="text-center pointer-events-none">
          <div className="text-4xl mb-2">👆</div>
          <div className="text-white font-semibold">Tap Anywhere</div>
          <div className="text-white/60 text-sm mt-2">Taps: {tapCount}</div>
        </div>

        {taps.map(tap => (
          <span
            key={tap.id}
            className="absolute w-4 h-4 rounded-full animate-ping pointer-events-none"
            style={{
              left: tap.x,
              top: tap.y,
              backgroundColor: rippleColor,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Swipe Gesture Demo
export const SwipeGestureDemo: React.FC = () => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [position, setPosition] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startX.current;
    setPosition(deltaX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - startX.current;
    const deltaY = e.changedTouches[0].clientY - startY.current;

    const threshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > threshold) {
        setSwipeDirection(deltaY > 0 ? 'down' : 'up');
      }
    }

    setPosition(0);

    setTimeout(() => setSwipeDirection(null), 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-64 h-64 bg-white/5 rounded-2xl border-2 border-white/20 cursor-grab active:cursor-grabbing overflow-hidden"
        data-testid="swipe-area"
      >
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform"
          style={{ transform: `translateX(${position}px)` }}
        >
          <div className="text-center pointer-events-none">
            <div className="text-4xl mb-2">
              {swipeDirection === 'left' && '👈'}
              {swipeDirection === 'right' && '👉'}
              {swipeDirection === 'up' && '👆'}
              {swipeDirection === 'down' && '👇'}
              {!swipeDirection && '🤚'}
            </div>
            <div className="text-white font-semibold">
              {swipeDirection ? `Swiped ${swipeDirection}!` : 'Swipe me'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-white/60">
        Last direction: <span className="text-white font-mono">{swipeDirection || 'none'}</span>
      </div>
    </div>
  );
};

// Long Press Demo
export const LongPressDemo: React.FC<{
  duration?: number;
}> = ({ duration = 800 }) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const startLongPress = () => {
    setProgress(0);

    // Progress animation
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 50));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 50);

    // Long press trigger
    timerRef.current = setTimeout(() => {
      setIsLongPress(true);
      if (progressRef.current) clearInterval(progressRef.current);
      setTimeout(() => setIsLongPress(false), 1000);
    }, duration);
  };

  const cancelLongPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div className="relative">
        <button
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          className={`
            relative overflow-hidden px-8 py-6 rounded-2xl font-bold text-lg
            transition-all duration-200
            ${isLongPress
              ? 'bg-green-500 text-white scale-110'
              : 'bg-athletic-brand-violet text-white hover:bg-athletic-brand-violet/90'
            }
          `}
          data-testid="long-press-button"
          data-long-pressed={isLongPress}
        >
          <span className="relative z-10">
            {isLongPress ? '✓ Activated!' : 'Hold Me'}
          </span>

          {/* Progress bar */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-50"
            style={{ width: `${progress}%` }}
          />
        </button>
      </div>

      <div className="mt-4 text-sm text-white/60">
        State: <span className="text-white font-mono">{isLongPress ? 'activated' : 'waiting'}</span>
      </div>
    </div>
  );
};

// Touch-Optimized Button Demo
export const TouchButtonDemo: React.FC = () => {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const buttons = [
    { id: 'small', label: 'Too Small (32px)', size: 'w-32 h-8' },
    { id: 'medium', label: 'Better (44px)', size: 'w-40 h-11' },
    { id: 'large', label: 'Best (56px)', size: 'w-48 h-14' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div className="space-y-4 w-full max-w-sm">
        <div className="text-white/60 text-sm text-center mb-6">
          Touch targets should be at least 44×44px for easy tapping
        </div>

        {buttons.map(button => (
          <button
            key={button.id}
            onTouchStart={() => setActiveButton(button.id)}
            onTouchEnd={() => setActiveButton(null)}
            onClick={() => setActiveButton(button.id)}
            onMouseLeave={() => setActiveButton(null)}
            className={`
              ${button.size}
              bg-athletic-brand-violet hover:bg-athletic-brand-violet/90
              text-white font-semibold rounded-lg
              transition-all duration-200
              ${activeButton === button.id ? 'scale-95' : 'scale-100'}
            `}
            data-testid={`touch-button-${button.id}`}
            data-active={activeButton === button.id}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="mt-6 text-sm text-white/60">
        Active: <span className="text-white font-mono">{activeButton || 'none'}</span>
      </div>
    </div>
  );
};
