import { describe, it, expect } from 'vitest';

describe('Basic Test Infrastructure', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have testing environment setup', () => {
    expect(typeof expect).toBe('function');
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
  });
});