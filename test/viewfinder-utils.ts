import { vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

export interface ViewfinderTestConfig {
  mouseTrackingDelay?: number;
  focusRadius?: number;
  blurRange?: { min: number; max: number };
  expectedFps?: number;
}

export const createViewfinderTestConfig = (
  overrides: Partial<ViewfinderTestConfig> = {}
): ViewfinderTestConfig => {
  return {
    mouseTrackingDelay: 100,
    focusRadius: 200,
    blurRange: { min: 0, max: 8 },
    expectedFps: 60,
    ...overrides,
  };
};

export const simulateMouseTracking = (
  element: HTMLElement,
  path: Array<{ x: number; y: number }>,
  config: ViewfinderTestConfig = createViewfinderTestConfig()
) => {
  const events: Array<{ position: { x: number; y: number }; timestamp: number }> = [];

  path.forEach((position, index) => {
    setTimeout(() => {
      fireEvent.mouseMove(element, {
        clientX: position.x,
        clientY: position.y,
      });
      events.push({ position, timestamp: performance.now() });
    }, index * (config.mouseTrackingDelay || 100));
  });

  return events;
};

export const measureBlurTransition = (element: HTMLElement): Promise<number[]> => {
  return new Promise((resolve) => {
    const blurValues: number[] = [];
    const observer = new MutationObserver(() => {
      const computedStyle = getComputedStyle(element);
      const filter = computedStyle.filter;
      const blurMatch = filter.match(/blur\((\d+(?:\.\d+)?)px\)/);
      if (blurMatch) {
        blurValues.push(parseFloat(blurMatch[1]));
      }
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style'],
    });

    // Stop observing after 1 second
    setTimeout(() => {
      observer.disconnect();
      resolve(blurValues);
    }, 1000);
  });
};

export const simulateShutterClick = (
  element: HTMLElement,
  position: { x: number; y: number }
) => {
  fireEvent.click(element, {
    clientX: position.x,
    clientY: position.y,
  });
};

export const measureShutterAnimation = async (
  element: HTMLElement,
  clickPosition: { x: number; y: number }
): Promise<{
  flashDuration: number;
  blurRemovalDuration: number;
  fadeOutDuration: number;
}> => {
  const startTime = performance.now();
  let flashEndTime = 0;
  let blurRemovalEndTime = 0;
  let fadeOutEndTime = 0;

  // Simulate click
  simulateShutterClick(element, clickPosition);

  // Monitor flash effect
  const flashObserver = new MutationObserver(() => {
    const flash = element.querySelector('.flash-effect');
    if (flash && getComputedStyle(flash).opacity === '0' && !flashEndTime) {
      flashEndTime = performance.now();
    }
  });

  // Monitor blur removal
  const blurObserver = new MutationObserver(() => {
    const computedStyle = getComputedStyle(element);
    const filter = computedStyle.filter;
    if (filter === 'none' && !blurRemovalEndTime) {
      blurRemovalEndTime = performance.now();
    }
  });

  // Monitor fade out
  const fadeObserver = new MutationObserver(() => {
    const opacity = getComputedStyle(element).opacity;
    if (opacity === '0' && !fadeOutEndTime) {
      fadeOutEndTime = performance.now();
    }
  });

  flashObserver.observe(element, { childList: true, subtree: true });
  blurObserver.observe(element, { attributes: true, attributeFilter: ['style'] });
  fadeObserver.observe(element, { attributes: true, attributeFilter: ['style'] });

  // Wait for all animations to complete
  await new Promise((resolve) => {
    const checkCompletion = () => {
      if (flashEndTime && blurRemovalEndTime && fadeOutEndTime) {
        resolve(undefined);
      } else {
        setTimeout(checkCompletion, 16); // Check every frame
      }
    };
    setTimeout(checkCompletion, 100); // Give a small delay before starting
  });

  // Clean up observers
  flashObserver.disconnect();
  blurObserver.disconnect();
  fadeObserver.disconnect();

  return {
    flashDuration: flashEndTime - startTime,
    blurRemovalDuration: blurRemovalEndTime - startTime,
    fadeOutDuration: fadeOutEndTime - startTime,
  };
};

export const calculateExpectedBlur = (
  crosshairPosition: { x: number; y: number },
  elementPosition: { x: number; y: number },
  config: ViewfinderTestConfig = createViewfinderTestConfig()
): number => {
  const distance = Math.sqrt(
    Math.pow(crosshairPosition.x - elementPosition.x, 2) +
    Math.pow(crosshairPosition.y - elementPosition.y, 2)
  );

  const focusRadius = config.focusRadius || 200;
  const blurRange = config.blurRange || { min: 0, max: 8 };

  if (distance <= focusRadius) {
    return blurRange.min;
  }

  const blurIntensity = Math.min(
    (distance - focusRadius) / focusRadius,
    1
  );

  return blurRange.min + (blurRange.max - blurRange.min) * blurIntensity;
};

export const mockViewfinderKeyboardControls = () => {
  return {
    pressV: () => {
      fireEvent.keyDown(document, { key: 'v', code: 'KeyV' });
      fireEvent.keyUp(document, { key: 'v', code: 'KeyV' });
    },
    pressEnter: () => {
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      fireEvent.keyUp(document, { key: 'Enter', code: 'Enter' });
    },
    pressEscape: () => {
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      fireEvent.keyUp(document, { key: 'Escape', code: 'Escape' });
    },
  };
};

export const assertViewfinderPerformance = async (
  testFn: () => void,
  config: ViewfinderTestConfig = createViewfinderTestConfig()
): Promise<boolean> => {
  const expectedFps = config.expectedFps || 60;
  const targetFrameTime = 1000 / expectedFps;
  const frames: number[] = [];
  let lastTime = performance.now();

  const measureFrame = () => {
    const currentTime = performance.now();
    frames.push(currentTime - lastTime);
    lastTime = currentTime;

    if (frames.length < expectedFps) { // Measure for 1 second
      requestAnimationFrame(measureFrame);
    }
  };

  testFn();
  requestAnimationFrame(measureFrame);

  // Wait for measurement to complete
  await new Promise((resolve) => {
    const checkCompletion = () => {
      if (frames.length >= expectedFps) {
        resolve(undefined);
      } else {
        setTimeout(checkCompletion, 16);
      }
    };
    checkCompletion();
  });

  const averageFrameTime = frames.reduce((sum, time) => sum + time, 0) / frames.length;
  const actualFps = 1000 / averageFrameTime;

  return actualFps >= expectedFps * 0.9; // Allow 10% tolerance
};