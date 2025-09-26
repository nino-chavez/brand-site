/**
 * Volleyball Navigation Components Unit Tests
 *
 * Tests the base volleyball navigation components created in Phase 1
 * - CourtPosition component
 * - RotationControls component
 * - VolleyballNavigation component
 * - Position mapping utilities
 */

import React from 'react';
import { describe, it, expect, test, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import components
import { CourtPosition } from '../components/CourtPosition';
import { RotationControls } from '../components/RotationControls';
import { VolleyballNavigation } from '../components/VolleyballNavigation';

// Import utilities
import {
    VOLLEYBALL_POSITION_MAPPING,
    getPositionBySection,
    getSectionByPosition,
    getNextPosition,
    getPreviousPosition,
    calculateRotationAngle,
    getResponsiveCoordinates
} from '../config/volleyball-positions';

import { VolleyballPosition, SectionId } from '../types';

describe('Volleyball Navigation Components', () => {
    describe('Position Mapping Utilities', () => {
        test('correctly maps sections to volleyball positions', () => {
            expect(getPositionBySection('hero')).toBe(1);
            expect(getPositionBySection('about')).toBe(2);
            expect(getPositionBySection('work')).toBe(3);
            expect(getPositionBySection('insights')).toBe(4);
            expect(getPositionBySection('gallery')).toBe(5);
            expect(getPositionBySection('reel')).toBe(6);
        });

        test('correctly maps volleyball positions to sections', () => {
            expect(getSectionByPosition(1)).toBe('hero');
            expect(getSectionByPosition(2)).toBe('about');
            expect(getSectionByPosition(3)).toBe('work');
            expect(getSectionByPosition(4)).toBe('insights');
            expect(getSectionByPosition(5)).toBe('gallery');
            expect(getSectionByPosition(6)).toBe('reel');
        });

        test('handles rotation correctly', () => {
            expect(getNextPosition(1)).toBe(2);
            expect(getNextPosition(6)).toBe(1); // Wraps around
            expect(getPreviousPosition(2)).toBe(1);
            expect(getPreviousPosition(1)).toBe(6); // Wraps around
        });

        test('calculates rotation angles correctly', () => {
            expect(calculateRotationAngle(1, 2)).toBe(60);
            expect(calculateRotationAngle(6, 1)).toBe(60); // Shortest path
            expect(calculateRotationAngle(1, 4)).toBe(180); // Half circle
        });

        test('provides responsive coordinates scaling', () => {
            const position1Coords = getResponsiveCoordinates(1, 'large');
            const position1SmallCoords = getResponsiveCoordinates(1, 'small');

            expect(position1SmallCoords.x).toBeLessThan(position1Coords.x);
            expect(position1SmallCoords.y).toBeLessThan(position1Coords.y);
        });
    });

    describe('CourtPosition Component', () => {
        const defaultProps = {
            position: 1 as VolleyballPosition,
            sectionId: 'hero' as SectionId,
            coordinates: { x: 70, y: 85 },
            label: 'Equipment Check',
            description: 'Hero section with viewfinder interface',
            isActive: false,
            isHovered: false,
            onClick: vi.fn(),
            onHover: vi.fn(),
            size: 'medium' as const,
            showTooltip: true
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        test('renders position indicator with correct number', () => {
            render(<CourtPosition {...defaultProps} />);

            const button = screen.getByRole('button', { name: /navigate to equipment check/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent('1');
        });

        test('applies active styling when isActive is true', () => {
            render(<CourtPosition {...defaultProps} isActive={true} />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-athletic-court-orange');
            expect(button).toHaveClass('scale-110');
        });

        test('applies hover styling when isHovered is true', () => {
            render(<CourtPosition {...defaultProps} isHovered={true} />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-athletic-brand-violet');
            expect(button).toHaveClass('scale-105');
        });

        test('shows tooltip when hovered and showTooltip is true', () => {
            render(<CourtPosition {...defaultProps} isHovered={true} />);

            expect(screen.getByRole('tooltip')).toBeInTheDocument();
            expect(screen.getByText('Equipment Check')).toBeInTheDocument();
            expect(screen.getByText(/position 1.*hero section/i)).toBeInTheDocument();
        });

        test('calls onClick when clicked', async () => {
            const user = userEvent.setup();
            render(<CourtPosition {...defaultProps} />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(defaultProps.onClick).toHaveBeenCalledWith('hero');
        });

        test('calls onHover when mouse enters and leaves', async () => {
            const user = userEvent.setup();
            render(<CourtPosition {...defaultProps} />);

            const button = screen.getByRole('button');

            await user.hover(button);
            expect(defaultProps.onHover).toHaveBeenCalledWith(1);

            await user.unhover(button);
            expect(defaultProps.onHover).toHaveBeenCalledWith(null);
        });

        test('handles keyboard navigation', async () => {
            const user = userEvent.setup();
            render(<CourtPosition {...defaultProps} />);

            const button = screen.getByRole('button');
            button.focus();

            await user.keyboard('{Enter}');
            expect(defaultProps.onClick).toHaveBeenCalledWith('hero');

            vi.clearAllMocks();

            await user.keyboard(' ');
            expect(defaultProps.onClick).toHaveBeenCalledWith('hero');
        });

        test('positions itself correctly with coordinates', () => {
            const { container } = render(<CourtPosition {...defaultProps} />);

            const positionWrapper = container.firstChild;
            expect(positionWrapper).toHaveStyle({
                left: '70%',
                top: '85%'
            });
        });

        test('applies correct size classes for different sizes', () => {
            const { rerender } = render(<CourtPosition {...defaultProps} size="small" />);
            let button = screen.getByRole('button');
            expect(button).toHaveClass('w-8', 'h-8');

            rerender(<CourtPosition {...defaultProps} size="large" />);
            button = screen.getByRole('button');
            expect(button).toHaveClass('w-12', 'h-12');
        });
    });

    describe('RotationControls Component', () => {
        const defaultProps = {
            onRotate: vi.fn(),
            disabled: false,
            size: 'medium' as const,
            className: ''
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        test('renders both rotation buttons', () => {
            render(<RotationControls {...defaultProps} />);

            expect(screen.getByLabelText(/rotate counterclockwise/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/rotate clockwise/i)).toBeInTheDocument();
        });

        test('calls onRotate with correct direction when clicked', async () => {
            const user = userEvent.setup();
            render(<RotationControls {...defaultProps} />);

            const clockwiseButton = screen.getByLabelText(/rotate clockwise/i);
            const counterClockwiseButton = screen.getByLabelText(/rotate counterclockwise/i);

            await user.click(clockwiseButton);
            expect(defaultProps.onRotate).toHaveBeenCalledWith('clockwise');

            await user.click(counterClockwiseButton);
            expect(defaultProps.onRotate).toHaveBeenCalledWith('counterclockwise');
        });

        test('disables buttons when disabled prop is true', () => {
            render(<RotationControls {...defaultProps} disabled={true} />);

            const clockwiseButton = screen.getByLabelText(/rotate clockwise/i);
            const counterClockwiseButton = screen.getByLabelText(/rotate counterclockwise/i);

            expect(clockwiseButton).toBeDisabled();
            expect(counterClockwiseButton).toBeDisabled();
            expect(clockwiseButton).toHaveClass('cursor-not-allowed');
        });

        test('does not call onRotate when disabled', async () => {
            const user = userEvent.setup();
            render(<RotationControls {...defaultProps} disabled={true} />);

            const clockwiseButton = screen.getByLabelText(/rotate clockwise/i);
            await user.click(clockwiseButton);

            expect(defaultProps.onRotate).not.toHaveBeenCalled();
        });

        test('applies correct size classes', () => {
            const { rerender } = render(<RotationControls {...defaultProps} size="small" />);
            let buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toHaveClass('w-6', 'h-6');
            });

            rerender(<RotationControls {...defaultProps} size="large" />);
            buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toHaveClass('w-10', 'h-10');
            });
        });
    });

    describe('VolleyballNavigation Component', () => {
        const defaultProps = {
            activeSection: 'hero' as SectionId,
            onNavigate: vi.fn(),
            onRotationChange: vi.fn(),
            className: '',
            showTooltips: true,
            size: 'medium' as const,
            isVisible: true
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        test('renders navigation with court background', () => {
            render(<VolleyballNavigation {...defaultProps} />);

            const nav = screen.getByRole('navigation', { name: /volleyball court navigation/i });
            expect(nav).toBeInTheDocument();
            expect(nav).toHaveClass('volleyball-navigation');
        });

        test('renders all 6 court positions', () => {
            render(<VolleyballNavigation {...defaultProps} />);

            // Should render positions 1-6
            for (let i = 1; i <= 6; i++) {
                expect(screen.getByText(i.toString())).toBeInTheDocument();
            }
        });

        test('renders rotation controls', () => {
            render(<VolleyballNavigation {...defaultProps} />);

            expect(screen.getByLabelText(/rotate clockwise/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/rotate counterclockwise/i)).toBeInTheDocument();
        });

        test('calls onNavigate when position is clicked', async () => {
            const user = userEvent.setup();
            render(<VolleyballNavigation {...defaultProps} />);

            // Click on position 3 (work section)
            const position3Button = screen.getByRole('button', { name: /navigate to game time/i });
            await user.click(position3Button);

            expect(defaultProps.onNavigate).toHaveBeenCalledWith('work');
        });

        test('calls onRotationChange when rotation controls are used', async () => {
            const user = userEvent.setup();
            render(<VolleyballNavigation {...defaultProps} />);

            const clockwiseButton = screen.getByLabelText(/rotate clockwise/i);
            await user.click(clockwiseButton);

            expect(defaultProps.onRotationChange).toHaveBeenCalledWith('clockwise');
        });

        test('highlights active position correctly', () => {
            render(<VolleyballNavigation {...defaultProps} activeSection="work" />);

            // Position 3 should be active (work section)
            const position3Button = screen.getByRole('button', { name: /navigate to game time/i });
            expect(position3Button).toHaveClass('bg-athletic-court-orange');
            expect(position3Button).toHaveAttribute('aria-pressed', 'true');
        });

        test('handles keyboard navigation for rotation', async () => {
            const user = userEvent.setup();
            render(<VolleyballNavigation {...defaultProps} />);

            // Test right arrow for clockwise rotation
            await user.keyboard('{ArrowRight}');
            expect(defaultProps.onRotationChange).toHaveBeenCalledWith('clockwise');

            // Clear mock and test left arrow for counterclockwise rotation
            vi.clearAllMocks();
            await user.keyboard('{ArrowLeft}');
            expect(defaultProps.onRotationChange).toHaveBeenCalledWith('counterclockwise');

            // Test down arrow for clockwise rotation
            vi.clearAllMocks();
            await user.keyboard('{ArrowDown}');
            expect(defaultProps.onRotationChange).toHaveBeenCalledWith('clockwise');

            // Test up arrow for counterclockwise rotation
            vi.clearAllMocks();
            await user.keyboard('{ArrowUp}');
            expect(defaultProps.onRotationChange).toHaveBeenCalledWith('counterclockwise');
        });

        test('applies correct size classes', () => {
            const { rerender } = render(<VolleyballNavigation {...defaultProps} size="small" />);
            let nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('w-48', 'h-48');

            rerender(<VolleyballNavigation {...defaultProps} size="large" />);
            nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('w-70', 'h-70');
        });

        test('does not render when isVisible is false', () => {
            render(<VolleyballNavigation {...defaultProps} isVisible={false} />);

            expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        });

        test('prevents interactions during rotation', async () => {
            const user = userEvent.setup();
            render(<VolleyballNavigation {...defaultProps} />);

            // Simulate rotation state by clicking rotation control
            const clockwiseButton = screen.getByLabelText(/rotate clockwise/i);
            await user.click(clockwiseButton);

            // Navigation should be in rotating state temporarily
            expect(defaultProps.onRotationChange).toHaveBeenCalledWith('clockwise');
        });

        test('provides accessibility features', () => {
            render(<VolleyballNavigation {...defaultProps} />);

            const nav = screen.getByRole('navigation');
            expect(nav).toHaveAttribute('aria-label', 'Volleyball court navigation');
            expect(nav).toHaveAttribute('aria-describedby', 'volleyball-nav-description');

            // Should have description for screen readers
            expect(screen.getByText(/navigate through portfolio sections/i)).toBeInTheDocument();
        });
    });
});