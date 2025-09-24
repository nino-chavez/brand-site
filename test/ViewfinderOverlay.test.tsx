import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ViewfinderOverlay from '../components/ViewfinderOverlay';
import { renderWithTestUtils } from './utils';
import React from 'react';

describe('ViewfinderOverlay Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render when active', () => {
    renderWithTestUtils(
      React.createElement(ViewfinderOverlay, { isActive: true })
    );

    // Should render the overlay
    const overlay = document.querySelector('[style*="crosshair"]');
    expect(overlay).toBeTruthy();
  });

  it('should not render when inactive', () => {
    renderWithTestUtils(
      React.createElement(ViewfinderOverlay, { isActive: false })
    );

    // Should not render the overlay initially
    const overlay = document.querySelector('[style*="crosshair"]');
    expect(overlay).toBeFalsy();
  });

  it('should render crosshair and focus ring components', () => {
    renderWithTestUtils(
      React.createElement(ViewfinderOverlay, { isActive: true })
    );

    // Should have SVG crosshair
    const crosshair = document.querySelector('svg');
    expect(crosshair).toBeTruthy();
  });
});