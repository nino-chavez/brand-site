import { useEffect } from 'react';

interface KeyboardAction {
  key: string;
  handler: () => void;
  preventDefault?: boolean;
}

interface UseKeyboardControlsProps {
  /** Array of keyboard actions to register */
  actions: KeyboardAction[];
  /** Whether the keyboard controls are enabled */
  enabled?: boolean;
}

/**
 * Custom hook for managing keyboard controls and shortcuts
 * Extracted from HeroSection component for reusability and cleaner event management
 */
export const useKeyboardControls = ({
  actions,
  enabled = true
}: UseKeyboardControlsProps) => {
  useEffect(() => {
    if (!enabled || !actions.length) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Find matching action for the pressed key
      const matchingAction = actions.find(action =>
        action.key === e.key || action.key.toLowerCase() === e.key.toLowerCase()
      );

      if (matchingAction) {
        if (matchingAction.preventDefault) {
          e.preventDefault();
        }
        matchingAction.handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions, enabled]);

  // Return helper for creating action objects
  return {
    createAction: (key: string, handler: () => void, preventDefault = false): KeyboardAction => ({
      key,
      handler,
      preventDefault
    })
  };
};