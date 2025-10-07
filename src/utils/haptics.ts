/**
 * Haptic Feedback Utilities
 * Provides subtle tactile responses for mobile interactions
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

/**
 * Trigger haptic feedback if available
 * Falls back gracefully on unsupported devices
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  // Check if Vibration API is available
  if (!('vibrate' in navigator)) {
    return;
  }

  // Define vibration patterns (in milliseconds)
  const patterns: Record<HapticPattern, number | number[]> = {
    light: 10,       // Quick tap
    medium: 20,      // Button press
    heavy: 40,       // Significant action
    success: [10, 50, 10],  // Double pulse
    error: [20, 30, 20, 30, 20]  // Alert pattern
  };

  const vibrationPattern = patterns[pattern];

  try {
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    // Silently fail - not critical functionality
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * React hook wrapper for haptic feedback
 * Usage: const haptic = useHapticFeedback();
 *        haptic('light');
 */
export function useHapticCallback(pattern: HapticPattern = 'light') {
  return () => triggerHaptic(pattern);
}

/**
 * Higher-order function to add haptic feedback to any callback
 * Usage: onClick={withHaptic(() => doSomething(), 'medium')}
 */
export function withHaptic<T extends (...args: any[]) => any>(
  callback: T,
  pattern: HapticPattern = 'light'
): T {
  return ((...args: Parameters<T>) => {
    triggerHaptic(pattern);
    return callback(...args);
  }) as T;
}
