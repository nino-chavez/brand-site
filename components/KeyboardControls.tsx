import React, { useEffect, useRef, useState, useCallback } from 'react';

interface KeyboardControlsProps {
  isActive?: boolean;
  onToggleViewfinder?: () => void;
  onCapture?: () => void;
  onFocusAreaChange?: (delta: { x: number; y: number }) => void;
  onBlurAdjust?: (delta: number) => void;
  onModeChange?: (mode: string) => void;
  children?: React.ReactNode;
  className?: string;
}

interface KeyBinding {
  key: string;
  description: string;
  action: () => void;
  category: 'viewfinder' | 'focus' | 'capture' | 'navigation';
}

const KeyboardControls: React.FC<KeyboardControlsProps> = ({
  isActive = false,
  onToggleViewfinder,
  onCapture,
  onFocusAreaChange,
  onBlurAdjust,
  onModeChange,
  children,
  className = '',
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [focusedControl, setFocusedControl] = useState<string | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Announce actions for screen readers
  const announce = useCallback((message: string) => {
    setAnnouncements(prev => [...prev.slice(-2), message]); // Keep last 3 announcements
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 3000);
  }, []);

  // Define keyboard bindings
  const keyBindings: KeyBinding[] = [
    // Viewfinder controls
    {
      key: 'v',
      description: 'Toggle viewfinder on/off',
      category: 'viewfinder',
      action: () => {
        onToggleViewfinder?.();
        announce(isActive ? 'Viewfinder deactivated' : 'Viewfinder activated');
      },
    },
    {
      key: 'Enter',
      description: 'Capture photo',
      category: 'capture',
      action: () => {
        if (isActive) {
          onCapture?.();
          announce('Photo captured');
        }
      },
    },
    {
      key: ' ',
      description: 'Capture photo (alternative)',
      category: 'capture',
      action: () => {
        if (isActive) {
          onCapture?.();
          announce('Photo captured');
        }
      },
    },

    // Focus area navigation
    {
      key: 'ArrowUp',
      description: 'Move focus area up',
      category: 'focus',
      action: () => {
        if (isActive) {
          onFocusAreaChange?.({ x: 0, y: -10 });
          announce('Focus area moved up');
        }
      },
    },
    {
      key: 'ArrowDown',
      description: 'Move focus area down',
      category: 'focus',
      action: () => {
        if (isActive) {
          onFocusAreaChange?.({ x: 0, y: 10 });
          announce('Focus area moved down');
        }
      },
    },
    {
      key: 'ArrowLeft',
      description: 'Move focus area left',
      category: 'focus',
      action: () => {
        if (isActive) {
          onFocusAreaChange?.({ x: -10, y: 0 });
          announce('Focus area moved left');
        }
      },
    },
    {
      key: 'ArrowRight',
      description: 'Move focus area right',
      category: 'focus',
      action: () => {
        if (isActive) {
          onFocusAreaChange?.({ x: 10, y: 0 });
          announce('Focus area moved right');
        }
      },
    },

    // Blur adjustment
    {
      key: '+',
      description: 'Increase blur intensity',
      category: 'focus',
      action: () => {
        if (isActive) {
          onBlurAdjust?.(1);
          announce('Blur intensity increased');
        }
      },
    },
    {
      key: '=',
      description: 'Increase blur intensity (alternative)',
      category: 'focus',
      action: () => {
        if (isActive) {
          onBlurAdjust?.(1);
          announce('Blur intensity increased');
        }
      },
    },
    {
      key: '-',
      description: 'Decrease blur intensity',
      category: 'focus',
      action: () => {
        if (isActive) {
          onBlurAdjust?.(-1);
          announce('Blur intensity decreased');
        }
      },
    },

    // Mode switching
    {
      key: '1',
      description: 'Switch to camera metadata mode',
      category: 'navigation',
      action: () => {
        onModeChange?.('camera');
        announce('Camera metadata mode');
      },
    },
    {
      key: '2',
      description: 'Switch to technical metadata mode',
      category: 'navigation',
      action: () => {
        onModeChange?.('technical');
        announce('Technical metadata mode');
      },
    },
    {
      key: '3',
      description: 'Switch to capture metadata mode',
      category: 'navigation',
      action: () => {
        onModeChange?.('capture');
        announce('Capture metadata mode');
      },
    },

    // Help and accessibility
    {
      key: '?',
      description: 'Toggle keyboard shortcuts help',
      category: 'navigation',
      action: () => {
        setShowHelp(!showHelp);
        announce(showHelp ? 'Help hidden' : 'Help shown');
      },
    },
    {
      key: 'Escape',
      description: 'Close help or deactivate viewfinder',
      category: 'navigation',
      action: () => {
        if (showHelp) {
          setShowHelp(false);
          announce('Help closed');
        } else if (isActive) {
          onToggleViewfinder?.();
          announce('Viewfinder deactivated');
        }
      },
    },
  ];

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our handled keys
      const binding = keyBindings.find(b => b.key === e.key);
      if (binding) {
        e.preventDefault();
        binding.action();
      }

      // Handle focus management for accessibility
      if (e.key === 'Tab' && isActive) {
        // Custom tab handling for viewfinder controls
        const focusableElements = ['viewfinder-toggle', 'capture-button', 'help-button'];
        const currentIndex = focusableElements.indexOf(focusedControl || '');
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
          : (currentIndex + 1) % focusableElements.length;

        setFocusedControl(focusableElements[nextIndex]);
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, showHelp, focusedControl, keyBindings]);

  // Focus management for screen readers
  useEffect(() => {
    if (isActive && controlsRef.current) {
      controlsRef.current.focus();
    }
  }, [isActive]);

  return (
    <div
      ref={controlsRef}
      className={`${className} ${isActive ? 'keyboard-controls-active' : ''}`}
      tabIndex={isActive ? 0 : -1}
      role="application"
      aria-label="Viewfinder keyboard controls"
      aria-describedby="keyboard-help"
    >
      {children}

      {/* ARIA Live Region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements[announcements.length - 1]}
      </div>

      {/* Keyboard Shortcuts Help Overlay */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-title"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 id="help-title" className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['viewfinder', 'focus', 'capture', 'navigation'].map(category => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {keyBindings
                      .filter(binding => binding.category === category)
                      .map(binding => (
                        <div
                          key={binding.key}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-600 dark:text-gray-400">
                            {binding.description}
                          </span>
                          <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                            {binding.key === ' ' ? 'Space' : binding.key}
                          </kbd>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowHelp(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                autoFocus
              >
                Close Help
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Keyboard Status Indicator */}
      {isActive && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Keyboard controls active</span>
            <kbd className="bg-gray-700 px-1 rounded">?</kbd>
            <span>for help</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for managing keyboard controls
export const useKeyboardControls = (config: {
  onToggleViewfinder?: () => void;
  onCapture?: () => void;
  onFocusMove?: (delta: { x: number; y: number }) => void;
  onBlurAdjust?: (delta: number) => void;
}) => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const handleKeyPress = useCallback((key: string, isActive: boolean) => {
    if (!isActive && key !== 'v') return;

    switch (key) {
      case 'v':
        config.onToggleViewfinder?.();
        setLastAction('toggle');
        break;
      case 'Enter':
      case ' ':
        config.onCapture?.();
        setLastAction('capture');
        break;
      case 'ArrowUp':
        config.onFocusMove?.({ x: 0, y: -10 });
        setLastAction('focus-up');
        break;
      case 'ArrowDown':
        config.onFocusMove?.({ x: 0, y: 10 });
        setLastAction('focus-down');
        break;
      case 'ArrowLeft':
        config.onFocusMove?.({ x: -10, y: 0 });
        setLastAction('focus-left');
        break;
      case 'ArrowRight':
        config.onFocusMove?.({ x: 10, y: 0 });
        setLastAction('focus-right');
        break;
      case '+':
      case '=':
        config.onBlurAdjust?.(1);
        setLastAction('blur-increase');
        break;
      case '-':
        config.onBlurAdjust?.(-1);
        setLastAction('blur-decrease');
        break;
      case '?':
        setIsHelpVisible(!isHelpVisible);
        setLastAction('help');
        break;
      case 'Escape':
        if (isHelpVisible) {
          setIsHelpVisible(false);
        } else {
          config.onToggleViewfinder?.();
        }
        setLastAction('escape');
        break;
    }
  }, [config, isHelpVisible]);

  return {
    handleKeyPress,
    isHelpVisible,
    setIsHelpVisible,
    lastAction,
  };
};

export default KeyboardControls;