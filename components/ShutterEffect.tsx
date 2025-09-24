import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ShutterEffectProps {
  isTriggered?: boolean;
  onComplete?: () => void;
  flashDuration?: number;
  shakeDuration?: number;
  enableSound?: boolean;
  soundVolume?: number;
  className?: string;
}

const ShutterEffect: React.FC<ShutterEffectProps> = ({
  isTriggered = false,
  onComplete,
  flashDuration = 100,
  shakeDuration = 300,
  enableSound = true,
  soundVolume = 0.5,
  className = '',
}) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [captureState, setCaptureState] = useState<'idle' | 'flash' | 'shake' | 'complete'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element for shutter sound
  useEffect(() => {
    if (enableSound) {
      // Create a simple shutter sound using Web Audio API or data URL
      const audio = new Audio();
      audio.volume = soundVolume;

      // Simple shutter click sound (data URL for small click sound)
      // In a real implementation, you would use an actual audio file
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwkBjWH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57+OdUgwOUarm7blmGgU2jdT0zoY2Byd+vPLZbUUDC3fA8t2QQgsGVKfg73xgHwc4ktn2yHoqBSl+y/LaizwHGWS71NOaPgYTVKfg73xgHwc4ktn2yHoqBSl+y/LaizwHGWS71NOaPgYTVKfg73xgHwc4ktn2yHoqBSl+y/LaizwHGWS71NOaPgYTVKfg73xgHwc4ktn2yHoqBSl+y/LaizwHGWS71NOaPgYTVKfg73xgHwc4ktn2yHoqBSl+y/LaizwHGWS71NOaPgYTVKfg73xgHwc4ktn2yHoqBSl+y/LaizwHGWS71NOaPgYTVKfg73xgHwc4ktn2yHoqBSl+y/LaizwHGWS71NOaPgYTVKfg73xgHwc4ktn2yHoqBSl+y/LaizwHGWS71NOaPgYT';

      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.remove();
      }
    };
  }, [enableSound, soundVolume]);

  // Handle shutter trigger
  const triggerShutter = useCallback(async () => {
    if (captureState !== 'idle') return;

    setCaptureState('flash');
    setIsFlashing(true);

    // Play shutter sound
    if (enableSound && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        console.log('Audio play failed:', error);
      }
    }

    // Flash effect
    setTimeout(() => {
      setIsFlashing(false);
      setCaptureState('shake');
      setIsShaking(true);

      // Shake effect
      setTimeout(() => {
        setIsShaking(false);
        setCaptureState('complete');

        // Complete the capture
        setTimeout(() => {
          setCaptureState('idle');
          onComplete?.();
        }, 100);
      }, shakeDuration);
    }, flashDuration);
  }, [captureState, flashDuration, shakeDuration, enableSound, onComplete]);

  // Trigger effect when prop changes
  useEffect(() => {
    if (isTriggered && captureState === 'idle') {
      triggerShutter();
    }
  }, [isTriggered, captureState, triggerShutter]);

  return (
    <>
      {/* Flash Overlay */}
      {isFlashing && (
        <div
          className={`fixed inset-0 pointer-events-none z-[9999] ${className}`}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            animation: `shutterFlash ${flashDuration}ms ease-out`,
          }}
        />
      )}

      {/* Shake Container */}
      <div
        className={isShaking ? 'animate-shake' : ''}
        style={{
          animationDuration: `${shakeDuration}ms`,
          animationTimingFunction: 'ease-in-out',
        }}
      >
        {/* This div will be wrapped around content that should shake */}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shutterFlash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes shake {
          0%, 100% { transform: translate3d(0, 0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate3d(-2px, -1px, 0) rotate(-0.5deg); }
          20%, 40%, 60%, 80% { transform: translate3d(2px, 1px, 0) rotate(0.5deg); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

// Enhanced shutter effect with more visual feedback
export const EnhancedShutterEffect: React.FC<{
  isTriggered?: boolean;
  onComplete?: () => void;
  position?: { x: number; y: number };
  className?: string;
}> = ({
  isTriggered = false,
  onComplete,
  position = { x: 0, y: 0 },
  className = '',
}) => {
  const [effects, setEffects] = useState({
    flash: false,
    shake: false,
    ripple: false,
    capture: false,
  });

  const triggerCapture = useCallback(async () => {
    if (effects.capture) return;

    // Flash effect
    setEffects(prev => ({ ...prev, flash: true, capture: true }));

    setTimeout(() => {
      // Ripple effect
      setEffects(prev => ({ ...prev, flash: false, ripple: true }));

      setTimeout(() => {
        // Shake effect
        setEffects(prev => ({ ...prev, ripple: false, shake: true }));

        setTimeout(() => {
          // Complete
          setEffects(prev => ({ ...prev, shake: false, capture: false }));
          onComplete?.();
        }, 300);
      }, 200);
    }, 100);
  }, [effects.capture, onComplete]);

  useEffect(() => {
    if (isTriggered && !effects.capture) {
      triggerCapture();
    }
  }, [isTriggered, effects.capture, triggerCapture]);

  return (
    <>
      {/* Flash Overlay */}
      {effects.flash && (
        <div
          className={`fixed inset-0 pointer-events-none z-[9999] ${className}`}
          style={{
            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
            animation: 'shutterFlash 100ms ease-out',
          }}
        />
      )}

      {/* Ripple Effect */}
      {effects.ripple && (
        <div
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: position.x - 50,
            top: position.y - 50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.8)',
            animation: 'ripple 200ms ease-out',
          }}
        />
      )}

      {/* Viewfinder Corner Highlights */}
      {effects.shake && (
        <div className="fixed inset-0 pointer-events-none z-[9997] animate-shake">
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-orange-400 animate-pulse" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-orange-400 animate-pulse" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-orange-400 animate-pulse" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-orange-400 animate-pulse" />
        </div>
      )}

      <style jsx>{`
        @keyframes shutterFlash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translate3d(0, 0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate3d(-1px, -1px, 0); }
          20%, 40%, 60%, 80% { transform: translate3d(1px, 1px, 0); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

// Click capture manager component
export const ClickCaptureManager: React.FC<{
  isActive?: boolean;
  onCapture?: (position: { x: number; y: number }) => void;
  children?: React.ReactNode;
}> = ({
  isActive = false,
  onCapture,
  children,
}) => {
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isActive || isCapturing) return;

    e.preventDefault();
    const position = { x: e.clientX, y: e.clientY };
    setClickPosition(position);
    setIsCapturing(true);
    onCapture?.(position);
  }, [isActive, isCapturing, onCapture]);

  const handleCaptureComplete = useCallback(() => {
    setIsCapturing(false);
    setClickPosition(null);
  }, []);

  return (
    <div
      onClick={handleClick}
      style={{ cursor: isActive ? 'crosshair' : 'default' }}
      className={isActive ? 'pointer-events-auto' : 'pointer-events-none'}
    >
      {children}

      <EnhancedShutterEffect
        isTriggered={isCapturing}
        position={clickPosition || { x: 0, y: 0 }}
        onComplete={handleCaptureComplete}
      />
    </div>
  );
};

export default ShutterEffect;