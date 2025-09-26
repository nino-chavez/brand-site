import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import React, { ReactElement } from 'react';

export interface ComponentTestOptions {
  shouldMockAnimations?: boolean;
  shouldMockPerformance?: boolean;
}

export const renderWithTestUtils = (
  ui: ReactElement,
  options: RenderOptions & ComponentTestOptions = {}
) => {
  const { shouldMockAnimations = true, shouldMockPerformance = true, ...renderOptions } = options;

  if (shouldMockAnimations) {
    // Mock CSS transitions and animations
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (shouldMockPerformance) {
    // Mock high-resolution time for performance tests
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  }

  return render(ui, renderOptions);
};

export const measureRenderPerformance = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

export const measureAnimationPerformance = async (
  element: HTMLElement,
  animationTrigger: () => void,
  duration = 1000
): Promise<number> => {
  const start = performance.now();
  animationTrigger();

  return new Promise((resolve) => {
    const checkAnimation = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= duration) {
        resolve(elapsed);
      } else {
        requestAnimationFrame(checkAnimation);
      }
    };
    requestAnimationFrame(checkAnimation);
  });
};

export const mockMouseMovement = () => {
  let mouseX = 0;
  let mouseY = 0;

  const createMouseEvent = (type: string, clientX: number, clientY: number) => {
    return new MouseEvent(type, {
      clientX,
      clientY,
      bubbles: true,
    });
  };

  return {
    moveTo: (x: number, y: number) => {
      mouseX = x;
      mouseY = y;
      document.dispatchEvent(createMouseEvent('mousemove', x, y));
    },
    click: (x?: number, y?: number) => {
      const clickX = x ?? mouseX;
      const clickY = y ?? mouseY;
      document.dispatchEvent(createMouseEvent('click', clickX, clickY));
    },
    getPosition: () => ({ x: mouseX, y: mouseY }),
  };
};

export const mockViewfinderState = () => {
  return {
    isActive: false,
    crosshairPosition: { x: 0, y: 0 },
    focusRadius: 200,
    blurIntensity: 0,
    isCapturing: false,
  };
};

export const waitForNextFrame = () => {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
};

export const waitForFrames = (count: number) => {
  return new Promise((resolve) => {
    let frameCount = 0;
    const frame = () => {
      frameCount++;
      if (frameCount >= count) {
        resolve(undefined);
      } else {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  });
};

export const assertFrameRate = (expectedFps: number, tolerance = 5) => {
  const targetFrameTime = 1000 / expectedFps;
  let frameCount = 0;
  let lastTime = performance.now();
  let totalTime = 0;

  return new Promise<boolean>((resolve) => {
    const measureFrame = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      frameCount++;
      totalTime += deltaTime;
      lastTime = currentTime;

      if (frameCount >= 60) { // Measure over 1 second at 60fps
        const averageFrameTime = totalTime / frameCount;
        const actualFps = 1000 / averageFrameTime;
        const isWithinTolerance = Math.abs(actualFps - expectedFps) <= tolerance;
        resolve(isWithinTolerance);
      } else {
        requestAnimationFrame(measureFrame);
      }
    };

    requestAnimationFrame(measureFrame);
  });
};