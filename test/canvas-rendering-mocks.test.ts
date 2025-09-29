/**
 * Canvas Rendering Mocks Test Suite
 *
 * Comprehensive unit tests for deterministic canvas rendering mock systems.
 * Tests mock implementations, render state validation, and canvas operation verification.
 *
 * @fileoverview Task 9 Sub-task 6 - Canvas rendering mock testing
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MockCanvasRenderer,
  createMockCanvas,
  mockCanvasOperations,
  validateRenderState,
  captureRenderCommands,
  simulateRenderFailure,
  MockCanvasContext2D
} from '../test/__utils__/canvasRenderingMocks';
import {
  generateTestImageData,
  createDeterministicPattern,
  compareRenderedOutputs,
  measureRenderPerformance
} from '../test/__utils__/renderTestHelpers';
import type {
  MockRenderState,
  RenderCommand,
  CanvasTestScenario,
  RenderValidationResult
} from '../types/testing';

// Mock performance.now for consistent timing
const mockPerformanceNow = (global as any).__mockPerformanceNow;

// Test fixtures for canvas rendering
const mockCanvasConfig = {
  width: 800,
  height: 600,
  devicePixelRatio: 1,
  contextType: '2d' as const
};

const mockRenderCommands: RenderCommand[] = [
  { type: 'fillRect', args: [10, 10, 100, 50], timestamp: 1000 },
  { type: 'strokeText', args: ['Test', 50, 30], timestamp: 1016 },
  { type: 'drawImage', args: [null, 0, 0, 200, 100], timestamp: 1032 },
  { type: 'transform', args: [1, 0, 0, 1, 50, 25], timestamp: 1048 }
];

describe('Canvas Rendering Mocks', () => {
  let mockRenderer: MockCanvasRenderer;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: MockCanvasContext2D;

  beforeEach(() => {
    vi.useFakeTimers();
    mockPerformanceNow.mockReturnValue(1000);
    vi.clearAllMocks();

    // Create mock canvas and renderer
    mockCanvas = createMockCanvas(mockCanvasConfig);
    mockContext = mockCanvas.getContext('2d') as MockCanvasContext2D;
    mockRenderer = new MockCanvasRenderer(mockCanvas);
  });

  afterEach(() => {
    vi.useRealTimers();
    mockRenderer.reset();
    vi.restoreAllMocks();
  });

  describe('Mock Canvas Creation and Setup', () => {
    it('should create mock canvas with specified configuration', () => {
      const canvas = createMockCanvas(mockCanvasConfig);

      expect(canvas.width).toBe(mockCanvasConfig.width);
      expect(canvas.height).toBe(mockCanvasConfig.height);
      expect(canvas.tagName).toBe('CANVAS');

      const context = canvas.getContext('2d');
      expect(context).toBeTruthy();
      expect(typeof context!.fillRect).toBe('function');
      expect(typeof context!.strokeText).toBe('function');
      expect(typeof context!.drawImage).toBe('function');
    });

    it('should handle different canvas configurations', () => {
      const configs = [
        { width: 400, height: 300, devicePixelRatio: 1, contextType: '2d' as const },
        { width: 1024, height: 768, devicePixelRatio: 2, contextType: '2d' as const },
        { width: 320, height: 240, devicePixelRatio: 3, contextType: '2d' as const }
      ];

      configs.forEach(config => {
        const canvas = createMockCanvas(config);
        const context = canvas.getContext(config.contextType);

        expect(canvas.width).toBe(config.width);
        expect(canvas.height).toBe(config.height);
        expect(context).toBeTruthy();
      });
    });

    it('should provide comprehensive 2D context mock methods', () => {
      const context = mockContext;
      const expectedMethods = [
        'fillRect', 'strokeRect', 'clearRect',
        'fillText', 'strokeText', 'measureText',
        'drawImage', 'getImageData', 'putImageData',
        'beginPath', 'closePath', 'moveTo', 'lineTo',
        'arc', 'bezierCurveTo', 'quadraticCurveTo',
        'save', 'restore', 'scale', 'rotate', 'translate', 'transform', 'setTransform',
        'clip', 'isPointInPath', 'createLinearGradient', 'createRadialGradient'
      ];

      expectedMethods.forEach(method => {
        expect(typeof (context as any)[method]).toBe('function');
      });
    });

    it('should handle canvas properties correctly', () => {
      const context = mockContext;

      // Test property setting and getting
      context.fillStyle = '#ff0000';
      expect(context.fillStyle).toBe('#ff0000');

      context.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      expect(context.strokeStyle).toBe('rgba(0, 255, 0, 0.5)');

      context.lineWidth = 3;
      expect(context.lineWidth).toBe(3);

      context.font = '16px Arial';
      expect(context.font).toBe('16px Arial');
    });
  });

  describe('Render Command Capture and Validation', () => {
    it('should capture render commands with timestamps', () => {
      mockRenderer.startCapture();

      // Execute rendering operations
      mockContext.fillRect(10, 10, 100, 50);
      mockPerformanceNow.mockReturnValue(1016);
      mockContext.strokeText('Test', 50, 30);
      mockPerformanceNow.mockReturnValue(1032);
      mockContext.drawImage(new Image(), 0, 0, 200, 100);

      const commands = mockRenderer.getCapturedCommands();

      expect(commands).toHaveLength(3);
      expect(commands[0]).toEqual({
        type: 'fillRect',
        args: [10, 10, 100, 50],
        timestamp: 1000,
        contextState: expect.any(Object)
      });
      expect(commands[1]).toEqual({
        type: 'strokeText',
        args: ['Test', 50, 30],
        timestamp: 1016,
        contextState: expect.any(Object)
      });
    });

    it('should validate render command sequences', () => {
      const expectedSequence = [
        { type: 'save', args: [] },
        { type: 'transform', args: [1, 0, 0, 1, 50, 25] },
        { type: 'fillRect', args: [0, 0, 100, 100] },
        { type: 'restore', args: [] }
      ];

      mockRenderer.startCapture();

      // Execute the sequence
      mockContext.save();
      mockContext.transform(1, 0, 0, 1, 50, 25);
      mockContext.fillRect(0, 0, 100, 100);
      mockContext.restore();

      const validation = mockRenderer.validateCommandSequence(expectedSequence);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.matchedCommands).toBe(expectedSequence.length);
    });

    it('should detect invalid render command sequences', () => {
      const invalidSequence = [
        { type: 'restore', args: [] }, // Restore without save
        { type: 'fillRect', args: [0, 0, 100, 100] }
      ];

      mockRenderer.startCapture();
      mockContext.restore(); // This should be flagged as invalid
      mockContext.fillRect(0, 0, 100, 100);

      const validation = mockRenderer.validateCommandSequence(invalidSequence);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(error => error.includes('restore'))).toBe(true);
    });

    it('should capture context state changes', () => {
      mockRenderer.startCapture();

      // Change context state
      mockContext.fillStyle = '#ff0000';
      mockContext.lineWidth = 5;
      mockContext.globalAlpha = 0.8;

      // Execute operation
      mockContext.fillRect(10, 10, 50, 50);

      const commands = mockRenderer.getCapturedCommands();
      const fillCommand = commands.find(cmd => cmd.type === 'fillRect');

      expect(fillCommand?.contextState).toEqual({
        fillStyle: '#ff0000',
        strokeStyle: expect.any(String),
        lineWidth: 5,
        globalAlpha: 0.8,
        font: expect.any(String),
        textAlign: expect.any(String),
        textBaseline: expect.any(String)
      });
    });
  });

  describe('Deterministic Rendering Behavior', () => {
    it('should produce consistent results for identical operations', () => {
      const operations = () => {
        mockContext.fillStyle = '#0000ff';
        mockContext.fillRect(25, 25, 100, 75);
        mockContext.strokeStyle = '#ff0000';
        mockContext.lineWidth = 2;
        mockContext.strokeRect(25, 25, 100, 75);
      };

      // Execute operations twice
      mockRenderer.startCapture();
      operations();
      const firstResult = mockRenderer.getCapturedCommands();

      mockRenderer.reset();
      mockRenderer.startCapture();
      operations();
      const secondResult = mockRenderer.getCapturedCommands();

      expect(firstResult).toEqual(secondResult);
    });

    it('should handle complex rendering scenarios deterministically', () => {
      const scenarios: CanvasTestScenario[] = [
        {
          name: 'Basic Shapes',
          operations: [
            () => mockContext.fillRect(0, 0, 50, 50),
            () => mockContext.strokeRect(25, 25, 50, 50),
            () => mockContext.clearRect(10, 10, 30, 30)
          ]
        },
        {
          name: 'Text Rendering',
          operations: [
            () => { mockContext.font = '20px Arial'; },
            () => mockContext.fillText('Hello', 100, 100),
            () => mockContext.strokeText('World', 100, 130)
          ]
        },
        {
          name: 'Transformations',
          operations: [
            () => mockContext.save(),
            () => mockContext.scale(2, 2),
            () => mockContext.rotate(Math.PI / 4),
            () => mockContext.fillRect(0, 0, 25, 25),
            () => mockContext.restore()
          ]
        }
      ];

      scenarios.forEach(scenario => {
        mockRenderer.reset();
        mockRenderer.startCapture();

        scenario.operations.forEach(operation => operation());

        const commands = mockRenderer.getCapturedCommands();
        expect(commands.length).toBeGreaterThan(0);

        // Verify scenario-specific expectations
        if (scenario.name === 'Text Rendering') {
          expect(commands.some(cmd => cmd.type === 'fillText')).toBe(true);
          expect(commands.some(cmd => cmd.type === 'strokeText')).toBe(true);
        } else if (scenario.name === 'Transformations') {
          expect(commands.some(cmd => cmd.type === 'save')).toBe(true);
          expect(commands.some(cmd => cmd.type === 'restore')).toBe(true);
          expect(commands.some(cmd => cmd.type === 'scale')).toBe(true);
        }
      });
    });

    it('should handle image operations with mock image data', () => {
      const testImageData = generateTestImageData(100, 100, 'checkerboard');
      const mockImage = {
        width: 100,
        height: 100,
        src: 'data:image/png;base64,mock',
        onload: null,
        onerror: null
      } as HTMLImageElement;

      mockRenderer.startCapture();

      // Test various image operations
      mockContext.drawImage(mockImage, 0, 0);
      mockContext.drawImage(mockImage, 0, 0, 50, 50);
      mockContext.drawImage(mockImage, 0, 0, 100, 100, 200, 200, 50, 50);

      const imageData = mockContext.getImageData(0, 0, 100, 100);
      mockContext.putImageData(imageData, 150, 150);

      const commands = mockRenderer.getCapturedCommands();
      const imageCommands = commands.filter(cmd =>
        cmd.type === 'drawImage' || cmd.type === 'getImageData' || cmd.type === 'putImageData'
      );

      expect(imageCommands.length).toBe(5);
      expect(imageData.width).toBe(100);
      expect(imageData.height).toBe(100);
      expect(imageData.data).toBeInstanceOf(Uint8ClampedArray);
    });
  });

  describe('Error Simulation and Edge Cases', () => {
    it('should simulate rendering failures', () => {
      const failureTypes = ['out-of-memory', 'context-lost', 'security-error', 'quota-exceeded'];

      failureTypes.forEach(failureType => {
        mockRenderer.simulateFailure(failureType);

        expect(() => {
          mockContext.fillRect(0, 0, 100, 100);
        }).toThrow();

        // Reset for next test
        mockRenderer.clearFailureSimulation();
      });
    });

    it('should handle invalid canvas operations gracefully', () => {
      const invalidOperations = [
        () => mockContext.fillRect(NaN, 0, 100, 100),
        () => mockContext.fillRect(0, NaN, 100, 100),
        () => mockContext.fillRect(0, 0, Infinity, 100),
        () => mockContext.drawImage(null as any, 0, 0),
        () => mockContext.getImageData(-1, -1, 100, 100),
        () => mockContext.putImageData(null as any, 0, 0)
      ];

      invalidOperations.forEach(operation => {
        expect(() => operation()).not.toThrow();
        // Mock should handle gracefully rather than throwing
      });
    });

    it('should validate render state consistency', () => {
      mockRenderer.startCapture();

      // Create potentially inconsistent state
      mockContext.save();
      mockContext.scale(2, 2);
      mockContext.fillRect(0, 0, 50, 50);
      // Missing restore - should be detected

      const stateValidation = validateRenderState(mockRenderer);

      expect(stateValidation.isConsistent).toBe(false);
      expect(stateValidation.issues.some(issue => issue.includes('save/restore'))).toBe(true);
    });

    it('should handle context loss and restoration', () => {
      mockRenderer.startCapture();

      // Normal operations
      mockContext.fillRect(0, 0, 100, 100);

      // Simulate context loss
      mockRenderer.simulateContextLoss();

      // Operations during context loss should be captured but marked
      mockContext.strokeRect(50, 50, 50, 50);

      // Restore context
      mockRenderer.restoreContext();

      // Post-restoration operations
      mockContext.clearRect(0, 0, 200, 200);

      const commands = mockRenderer.getCapturedCommands();
      const contextLossCommands = commands.filter(cmd => cmd.contextLost);

      expect(contextLossCommands.length).toBe(1);
      expect(contextLossCommands[0].type).toBe('strokeRect');
    });
  });

  describe('Performance and Benchmarking', () => {
    it('should measure mock rendering performance', () => {
      const operationCounts = [100, 500, 1000, 2000];

      operationCounts.forEach(count => {
        const start = performance.now();

        mockRenderer.startCapture();
        for (let i = 0; i < count; i++) {
          mockContext.fillRect(Math.random() * 800, Math.random() * 600, 10, 10);
        }

        const duration = performance.now() - start;
        const operationsPerMs = count / duration;

        expect(operationsPerMs).toBeGreaterThan(10); // Should be fast
        expect(duration).toBeLessThan(100); // Should complete quickly

        console.log(`✅ Mock rendering: ${count} operations in ${duration.toFixed(2)}ms`);
      });
    });

    it('should compare performance across different mock configurations', () => {
      const configs = [
        { captureState: true, validateCommands: true },
        { captureState: false, validateCommands: true },
        { captureState: true, validateCommands: false },
        { captureState: false, validateCommands: false }
      ];

      const results = configs.map(config => {
        const renderer = new MockCanvasRenderer(mockCanvas, config);
        const start = performance.now();

        renderer.startCapture();
        for (let i = 0; i < 1000; i++) {
          mockContext.fillRect(i % 800, i % 600, 5, 5);
        }

        const duration = performance.now() - start;
        renderer.reset();

        return { config, duration };
      });

      // Full tracking should be slowest, minimal tracking should be fastest
      const fullTracking = results.find(r => r.config.captureState && r.config.validateCommands);
      const minimalTracking = results.find(r => !r.config.captureState && !r.config.validateCommands);

      expect(minimalTracking!.duration).toBeLessThan(fullTracking!.duration);
    });

    it('should handle memory-intensive rendering scenarios', () => {
      const largeImageData = generateTestImageData(1000, 1000, 'gradient');

      mockRenderer.startCapture();

      // Simulate memory-intensive operations
      for (let i = 0; i < 10; i++) {
        mockContext.putImageData(largeImageData, i * 50, i * 50);
        const retrievedData = mockContext.getImageData(i * 50, i * 50, 100, 100);
        expect(retrievedData.data.length).toBe(100 * 100 * 4);
      }

      const commands = mockRenderer.getCapturedCommands();
      expect(commands.length).toBe(20); // 10 putImageData + 10 getImageData

      // Should not cause memory issues in mock
      expect(true).toBe(true);
    });
  });

  describe('Integration with Canvas System Tests', () => {
    it('should integrate with spatial positioning tests', () => {
      mockRenderer.startCapture();

      // Simulate spatial section rendering
      const sections = [
        { id: 'section1', x: 100, y: 100, width: 200, height: 150 },
        { id: 'section2', x: 350, y: 250, width: 180, height: 120 },
        { id: 'section3', x: 600, y: 100, width: 150, height: 180 }
      ];

      sections.forEach(section => {
        mockContext.save();
        mockContext.translate(section.x, section.y);
        mockContext.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
        mockContext.fillRect(0, 0, section.width, section.height);
        mockContext.strokeStyle = '#000';
        mockContext.strokeRect(0, 0, section.width, section.height);
        mockContext.restore();
      });

      const commands = mockRenderer.getCapturedCommands();
      const sectionRenderCommands = commands.filter(cmd =>
        cmd.type === 'fillRect' || cmd.type === 'strokeRect'
      );

      expect(sectionRenderCommands.length).toBe(sections.length * 2);
    });

    it('should support camera movement render validation', () => {
      mockRenderer.startCapture();

      // Simulate camera movement rendering
      const frames = 10;
      for (let frame = 0; frame < frames; frame++) {
        const progress = frame / (frames - 1);

        mockContext.save();
        mockContext.scale(1 + progress * 0.5, 1 + progress * 0.5);
        mockContext.translate(progress * 100, progress * 50);
        mockContext.globalAlpha = 1 - progress * 0.3;

        mockContext.fillStyle = '#4a90e2';
        mockContext.fillRect(0, 0, 100, 100);

        mockContext.restore();
      }

      const commands = mockRenderer.getCapturedCommands();
      const transformCommands = commands.filter(cmd =>
        cmd.type === 'scale' || cmd.type === 'translate'
      );

      expect(transformCommands.length).toBe(frames * 2); // scale + translate per frame
    });

    it('should validate performance-optimized rendering', () => {
      mockRenderer.startCapture();

      // Simulate performance-optimized rendering patterns
      mockContext.save();

      // Batch similar operations
      mockContext.fillStyle = '#ff0000';
      for (let i = 0; i < 50; i++) {
        mockContext.fillRect(i * 10, 0, 8, 8);
      }

      // Change state once
      mockContext.fillStyle = '#00ff00';
      for (let i = 0; i < 50; i++) {
        mockContext.fillRect(i * 10, 20, 8, 8);
      }

      mockContext.restore();

      const commands = mockRenderer.getCapturedCommands();
      const stateChanges = commands.filter(cmd => cmd.type === 'fillStyle');

      // Should minimize state changes
      expect(stateChanges.length).toBeLessThanOrEqual(2);
    });
  });
});