/**
 * Canvas Rendering Mocks
 *
 * Provides deterministic canvas rendering mock systems for testing 2D canvas navigation.
 * Includes mock implementations, render state validation, and canvas operation verification
 * for reliable and predictable test execution.
 *
 * @fileoverview Canvas rendering mock utilities for testing
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

import type { CanvasPosition } from '../../types/canvas';

// ===== MOCK TYPES =====

export interface MockCanvasContext {
  canvas: MockCanvas;
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  globalAlpha: number;
  transform: DOMMatrix;
  operations: CanvasOperation[];
  isRecording: boolean;
}

export interface MockCanvas {
  width: number;
  height: number;
  context: MockCanvasContext;
  style: {
    transform: string;
    width: string;
    height: string;
  };
}

export interface CanvasOperation {
  type: 'fillRect' | 'strokeRect' | 'clearRect' | 'transform' | 'translate' | 'scale' | 'rotate' | 'save' | 'restore' | 'drawImage';
  parameters: any[];
  timestamp: number;
  transform: DOMMatrix;
}

export interface RenderState {
  position: CanvasPosition;
  transform: string;
  operations: CanvasOperation[];
  renderTime: number;
  frameId: number;
}

export interface MockRenderingContext {
  canvas: MockCanvas;
  states: RenderState[];
  currentFrame: number;
  isAnimating: boolean;
  animationCallback?: (timestamp: number) => void;
}

// ===== CANVAS MOCKING =====

/**
 * Create mock canvas element
 * Returns a deterministic canvas mock for testing
 */
export function createMockCanvas(width: number = 800, height: number = 600): MockCanvas {
  const operations: CanvasOperation[] = [];

  const context: MockCanvasContext = {
    canvas: null as any, // Will be set below
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    globalAlpha: 1,
    transform: new DOMMatrix(),
    operations,
    isRecording: true,

    // Canvas drawing methods
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
      if (context.isRecording) {
        operations.push({
          type: 'fillRect',
          parameters: [x, y, w, h],
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    }),

    strokeRect: vi.fn((x: number, y: number, w: number, h: number) => {
      if (context.isRecording) {
        operations.push({
          type: 'strokeRect',
          parameters: [x, y, w, h],
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    }),

    clearRect: vi.fn((x: number, y: number, w: number, h: number) => {
      if (context.isRecording) {
        operations.push({
          type: 'clearRect',
          parameters: [x, y, w, h],
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    }),

    // Transform methods
    setTransform: vi.fn((a: number, b: number, c: number, d: number, e: number, f: number) => {
      context.transform = new DOMMatrix([a, b, c, d, e, f]);
      if (context.isRecording) {
        operations.push({
          type: 'transform',
          parameters: [a, b, c, d, e, f],
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    }),

    translate: vi.fn((x: number, y: number) => {
      context.transform.translateSelf(x, y);
      if (context.isRecording) {
        operations.push({
          type: 'translate',
          parameters: [x, y],
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    }),

    scale: vi.fn((x: number, y: number) => {
      context.transform.scaleSelf(x, y);
      if (context.isRecording) {
        operations.push({
          type: 'scale',
          parameters: [x, y],
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    }),

    rotate: vi.fn((angle: number) => {
      context.transform.rotateSelf(0, 0, angle * 180 / Math.PI);
      if (context.isRecording) {
        operations.push({
          type: 'rotate',
          parameters: [angle],
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    }),

    save: vi.fn(() => {
      if (context.isRecording) {
        operations.push({
          type: 'save',
          parameters: [],
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    }),

    restore: vi.fn(() => {
      if (context.isRecording) {
        operations.push({
          type: 'restore',
          parameters: [],
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    }),

    drawImage: vi.fn((...args: any[]) => {
      if (context.isRecording) {
        operations.push({
          type: 'drawImage',
          parameters: args,
          timestamp: performance.now(),
          transform: new DOMMatrix(context.transform)
        });
      }
    })
  };

  const canvas: MockCanvas = {
    width,
    height,
    context,
    style: {
      transform: 'none',
      width: `${width}px`,
      height: `${height}px`
    },

    getContext: vi.fn((contextType: string) => {
      if (contextType === '2d') {
        return context;
      }
      return null;
    }),

    toDataURL: vi.fn(() => 'data:image/png;base64,mock-canvas-data'),

    toBlob: vi.fn((callback: BlobCallback) => {
      const blob = new Blob(['mock-canvas-blob'], { type: 'image/png' });
      callback(blob);
    })
  };

  context.canvas = canvas;
  return canvas;
}

/**
 * Create mock HTML canvas element
 * Returns a DOM-compatible canvas mock
 */
export function createMockHTMLCanvasElement(width: number = 800, height: number = 600): HTMLCanvasElement {
  const mockCanvas = createMockCanvas(width, height);

  // Create a minimal HTMLCanvasElement mock
  const element = {
    ...mockCanvas,
    tagName: 'CANVAS',
    nodeName: 'CANVAS',
    nodeType: 1,
    getBoundingClientRect: vi.fn(() => ({
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      x: 0,
      y: 0
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    removeAttribute: vi.fn()
  } as unknown as HTMLCanvasElement;

  return element;
}

// ===== RENDERING STATE MANAGEMENT =====

/**
 * Create mock rendering context
 * Manages render states and animation frames for testing
 */
export function createMockRenderingContext(canvas: MockCanvas): MockRenderingContext {
  const states: RenderState[] = [];
  let currentFrame = 0;
  let isAnimating = false;
  let animationCallback: ((timestamp: number) => void) | undefined;

  return {
    canvas,
    states,
    currentFrame,
    isAnimating,
    animationCallback,

    // Mock requestAnimationFrame
    requestAnimationFrame: vi.fn((callback: (timestamp: number) => void) => {
      animationCallback = callback;
      const frameId = currentFrame++;

      // Simulate animation frame
      setTimeout(() => {
        if (isAnimating && callback) {
          callback(performance.now());
        }
      }, 16.67); // 60fps

      return frameId;
    }),

    cancelAnimationFrame: vi.fn((frameId: number) => {
      if (frameId === currentFrame - 1) {
        isAnimating = false;
        animationCallback = undefined;
      }
    }),

    startAnimation: () => {
      isAnimating = true;
    },

    stopAnimation: () => {
      isAnimating = false;
      animationCallback = undefined;
    }
  };
}

/**
 * Capture render state
 * Records current rendering state for validation
 */
export function captureRenderState(
  position: CanvasPosition,
  canvas: MockCanvas,
  frameId: number = 0
): RenderState {
  const renderTime = performance.now();
  const transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(${position.scale})`;

  return {
    position: { ...position },
    transform,
    operations: [...canvas.context.operations],
    renderTime,
    frameId
  };
}

/**
 * Apply CSS transform to mock canvas
 * Simulates CSS transform application for testing
 */
export function applyMockTransform(canvas: MockCanvas, position: CanvasPosition): void {
  const transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(${position.scale})`;
  canvas.style.transform = transform;

  // Record the transform operation
  if (canvas.context.isRecording) {
    canvas.context.operations.push({
      type: 'transform',
      parameters: [position.x, position.y, position.scale],
      timestamp: performance.now(),
      transform: new DOMMatrix()
    });
  }
}

// ===== OPERATION VALIDATION =====

/**
 * Validate canvas operations
 * Checks if expected operations were performed
 */
export function validateCanvasOperations(
  operations: CanvasOperation[],
  expectedOperations: Partial<CanvasOperation>[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (operations.length < expectedOperations.length) {
    errors.push(`Expected ${expectedOperations.length} operations, got ${operations.length}`);
    return { valid: false, errors };
  }

  for (let i = 0; i < expectedOperations.length; i++) {
    const expected = expectedOperations[i];
    const actual = operations[i];

    if (expected.type && actual.type !== expected.type) {
      errors.push(`Operation ${i}: expected type '${expected.type}', got '${actual.type}'`);
    }

    if (expected.parameters && !arraysEqual(actual.parameters, expected.parameters)) {
      errors.push(`Operation ${i}: parameter mismatch`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate render state sequence
 * Checks if render states follow expected patterns
 */
export function validateRenderStates(
  states: RenderState[],
  expectedPattern: Partial<RenderState>[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (states.length < expectedPattern.length) {
    errors.push(`Expected ${expectedPattern.length} render states, got ${states.length}`);
    return { valid: false, errors };
  }

  for (let i = 0; i < expectedPattern.length; i++) {
    const expected = expectedPattern[i];
    const actual = states[i];

    if (expected.position) {
      if (!positionsEqual(actual.position, expected.position)) {
        errors.push(`State ${i}: position mismatch`);
      }
    }

    if (expected.transform && actual.transform !== expected.transform) {
      errors.push(`State ${i}: transform mismatch`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Count operations by type
 * Returns count of each operation type
 */
export function countOperationsByType(operations: CanvasOperation[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const operation of operations) {
    counts[operation.type] = (counts[operation.type] || 0) + 1;
  }

  return counts;
}

// ===== PERFORMANCE MOCKING =====

/**
 * Mock performance.now for deterministic timing
 * Returns predictable timestamps for testing
 */
export function createMockPerformanceNow(): {
  mockPerformanceNow: () => number;
  setMockTime: (time: number) => void;
  advanceTime: (delta: number) => void;
  reset: () => void;
} {
  let mockTime = 0;

  const mockPerformanceNow = vi.fn(() => mockTime);

  return {
    mockPerformanceNow,
    setMockTime: (time: number) => {
      mockTime = time;
    },
    advanceTime: (delta: number) => {
      mockTime += delta;
    },
    reset: () => {
      mockTime = 0;
    }
  };
}

/**
 * Mock RAF (requestAnimationFrame) for testing
 * Provides controlled animation frame timing
 */
export function createMockRAF(): {
  mockRAF: (callback: (timestamp: number) => void) => number;
  mockCAF: (id: number) => void;
  triggerFrame: (timestamp?: number) => void;
  frameCallbacks: Map<number, (timestamp: number) => void>;
} {
  const frameCallbacks = new Map<number, (timestamp: number) => void>();
  let frameId = 0;

  const mockRAF = vi.fn((callback: (timestamp: number) => void) => {
    const id = ++frameId;
    frameCallbacks.set(id, callback);
    return id;
  });

  const mockCAF = vi.fn((id: number) => {
    frameCallbacks.delete(id);
  });

  const triggerFrame = (timestamp: number = performance.now()) => {
    for (const [id, callback] of frameCallbacks) {
      callback(timestamp);
      frameCallbacks.delete(id);
    }
  };

  return {
    mockRAF,
    mockCAF,
    triggerFrame,
    frameCallbacks
  };
}

// ===== MEASUREMENT UTILITIES =====

/**
 * Measure canvas operation performance
 * Times canvas operations for performance testing
 */
export function measureCanvasPerformance<T extends (...args: any[]) => any>(
  operation: T,
  iterations: number = 100
): {
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
  operations: number;
} {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    operation();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return {
    averageTime,
    minTime,
    maxTime,
    totalTime,
    operations: iterations
  };
}

/**
 * Simulate canvas rendering load
 * Creates artificial rendering load for performance testing
 */
export function simulateRenderingLoad(
  canvas: MockCanvas,
  intensity: 'low' | 'medium' | 'high' = 'medium'
): void {
  const operations = {
    low: 10,
    medium: 50,
    high: 200
  };

  const count = operations[intensity];
  const ctx = canvas.context;

  // Simulate various drawing operations
  for (let i = 0; i < count; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 10, 10);
    ctx.strokeRect(Math.random() * canvas.width, Math.random() * canvas.height, 20, 20);
    ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
    ctx.scale(0.95 + Math.random() * 0.1, 0.95 + Math.random() * 0.1);
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Check if two arrays are equal
 * Helper for parameter comparison
 */
function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

/**
 * Check if two positions are equal
 * Helper for position comparison with tolerance
 */
function positionsEqual(a: CanvasPosition, b: Partial<CanvasPosition>, tolerance: number = 0.01): boolean {
  if (b.x !== undefined && Math.abs(a.x - b.x) > tolerance) return false;
  if (b.y !== undefined && Math.abs(a.y - b.y) > tolerance) return false;
  if (b.scale !== undefined && Math.abs(a.scale - b.scale) > tolerance) return false;

  return true;
}

/**
 * Clear canvas operations history
 * Resets operation recording for fresh test state
 */
export function clearCanvasOperations(canvas: MockCanvas): void {
  canvas.context.operations = [];
}

/**
 * Enable/disable operation recording
 * Controls whether operations are recorded
 */
export function setOperationRecording(canvas: MockCanvas, enabled: boolean): void {
  canvas.context.isRecording = enabled;
}

/**
 * Get latest canvas operation
 * Returns the most recent operation performed
 */
export function getLatestOperation(canvas: MockCanvas): CanvasOperation | null {
  const operations = canvas.context.operations;
  return operations.length > 0 ? operations[operations.length - 1] : null;
}

/**
 * Create deterministic canvas state
 * Returns a predictable canvas state for testing
 */
export function createDeterministicCanvasState(): {
  canvas: MockCanvas;
  context: MockRenderingContext;
  position: CanvasPosition;
} {
  const canvas = createMockCanvas(800, 600);
  const context = createMockRenderingContext(canvas);
  const position: CanvasPosition = { x: 0, y: 0, scale: 1.0 };

  // Apply initial transform
  applyMockTransform(canvas, position);

  return {
    canvas,
    context,
    position
  };
}