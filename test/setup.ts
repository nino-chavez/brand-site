import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock requestAnimationFrame for performance tests
const mockRaf = vi.fn().mockImplementation(cb => {
  const id = setTimeout(cb, 16);
  return id as unknown as number;
});

const mockCancelRaf = vi.fn().mockImplementation(id => clearTimeout(id));

global.requestAnimationFrame = mockRaf;
global.cancelAnimationFrame = mockCancelRaf;

// Mock performance.now for timing tests
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
};

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});