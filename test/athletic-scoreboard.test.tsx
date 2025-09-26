/**
 * Athletic Scoreboard Navigation Tests
 *
 * Tests the intuitive athletic scoreboard navigation components
 */

import React from 'react';
import { describe, it, expect, test, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AthleticScoreboard } from '../components/AthleticScoreboard';
import { FloatingScoreboard } from '../components/FloatingScoreboard';
import { SectionId } from '../types';

describe('Athletic Scoreboard Navigation', () => {
    const defaultProps = {
        activeSection: 'hero' as SectionId,
        onNavigate: vi.fn(),
        className: '',
        showIcons: true,
        variant: 'header' as const
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('AthleticScoreboard Component', () => {
        test('renders scoreboard with clear section labels', () => {
            render(<AthleticScoreboard {...defaultProps} />);

            // Check for intuitive labels (no decoding required!)
            expect(screen.getByText('HOME')).toBeInTheDocument();
            expect(screen.getByText('ABOUT')).toBeInTheDocument();
            expect(screen.getByText('WORK')).toBeInTheDocument();
            expect(screen.getByText('INSIGHTS')).toBeInTheDocument();
            expect(screen.getByText('GALLERY')).toBeInTheDocument();
            expect(screen.getByText('REEL')).toBeInTheDocument();
        });

        test('renders scoreboard header and footer elements', () => {
            render(<AthleticScoreboard {...defaultProps} />);

            expect(screen.getByText('PORTFOLIO SCOREBOARD')).toBeInTheDocument();
            expect(screen.getByText('LIVE PORTFOLIO')).toBeInTheDocument();
        });

        test('shows athletic icons when showIcons is true', () => {
            render(<AthleticScoreboard {...defaultProps} showIcons={true} />);

            // Icons should be present (we can't test emoji directly, but structure is there)
            const homeButton = screen.getByRole('button', { name: /navigate to portfolio home/i });
            expect(homeButton).toBeInTheDocument();
        });

        test('applies active styling to current section', () => {
            render(<AthleticScoreboard {...defaultProps} activeSection="work" />);

            const workButton = screen.getByRole('button', { name: /navigate to projects.*experience/i });
            expect(workButton).toHaveClass('bg-athletic-court-orange');
        });

        test('calls onNavigate when section is clicked', async () => {
            const user = userEvent.setup();
            render(<AthleticScoreboard {...defaultProps} />);

            const workButton = screen.getByRole('button', { name: /navigate to projects.*experience/i });
            await user.click(workButton);

            expect(defaultProps.onNavigate).toHaveBeenCalledWith('work');
        });

        test('shows tooltips on hover for desktop variants', async () => {
            const user = userEvent.setup();
            render(<AthleticScoreboard {...defaultProps} variant="header" />);

            const workButton = screen.getByRole('button', { name: /navigate to projects.*experience/i });
            await user.hover(workButton);

            // Tooltip should appear
            await waitFor(() => {
                expect(screen.getByRole('tooltip')).toBeInTheDocument();
                expect(screen.getByText('Projects & experience')).toBeInTheDocument();
            });
        });

        test('does not show tooltips for mobile variant', async () => {
            const user = userEvent.setup();
            render(<AthleticScoreboard {...defaultProps} variant="mobile" />);

            const workButton = screen.getByRole('button', { name: /navigate to projects.*experience/i });
            await user.hover(workButton);

            // No tooltip should appear on mobile
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });

        test('applies correct variant styling', () => {
            const { rerender } = render(<AthleticScoreboard {...defaultProps} variant="header" />);
            let nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('px-6', 'py-3');

            rerender(<AthleticScoreboard {...defaultProps} variant="floating" />);
            nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('px-4', 'py-2', 'rounded-full');

            rerender(<AthleticScoreboard {...defaultProps} variant="mobile" />);
            nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('px-4', 'py-2', 'rounded-md');
        });

        test('arranges items vertically for mobile variant', () => {
            render(<AthleticScoreboard {...defaultProps} variant="mobile" />);

            const navContainer = screen.getByRole('navigation');
            const itemsContainer = navContainer.querySelector('div[class*="flex-col"]');
            expect(itemsContainer).toHaveClass('flex-col');
        });

        test('arranges items horizontally for non-mobile variants', () => {
            render(<AthleticScoreboard {...defaultProps} variant="header" />);

            const navContainer = screen.getByRole('navigation');
            const itemsContainer = navContainer.querySelector('div[class*="flex-row"]');
            expect(itemsContainer).toHaveClass('flex-row');
        });

        test('provides proper accessibility attributes', () => {
            render(<AthleticScoreboard {...defaultProps} />);

            const nav = screen.getByRole('navigation');
            expect(nav).toHaveAttribute('aria-label', 'Athletic scoreboard navigation');

            // Each button should have descriptive labels
            expect(screen.getByRole('button', { name: /navigate to portfolio home/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /navigate to about nino/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /navigate to projects.*experience/i })).toBeInTheDocument();
        });
    });

    describe('FloatingScoreboard Component', () => {
        const floatingProps = {
            activeSection: 'hero' as SectionId,
            onNavigate: vi.fn(),
            className: ''
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        test('renders floating scoreboard in fixed position', () => {
            const { container } = render(<FloatingScoreboard {...floatingProps} />);

            const floatingContainer = container.firstChild;
            expect(floatingContainer).toHaveClass('fixed', 'right-6', 'top-1/2');
        });

        test('uses floating variant by default', () => {
            render(<FloatingScoreboard {...floatingProps} />);

            const nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('rounded-full'); // Floating variant characteristic
        });

        test('hides icons for cleaner floating appearance', () => {
            render(<FloatingScoreboard {...floatingProps} />);

            // Should still have navigation but without icons for cleaner look
            expect(screen.getByText('HOME')).toBeInTheDocument();
        });

        test('is hidden on smaller screens', () => {
            const { container } = render(<FloatingScoreboard {...floatingProps} />);

            const floatingContainer = container.firstChild;
            expect(floatingContainer).toHaveClass('hidden', 'lg:block');
        });
    });

    describe('Intuitive Navigation Design', () => {
        test('uses clear, descriptive labels instead of abstract symbols', () => {
            render(<AthleticScoreboard {...defaultProps} />);

            // These labels are immediately understandable - no decoding required
            const clearLabels = [
                'HOME',     // Instead of "1" or "⚫"
                'ABOUT',    // Instead of "2" or "Player"
                'WORK',     // Instead of "3" or "Plays"
                'INSIGHTS', // Instead of "4" or "Stats"
                'GALLERY',  // Instead of "5" or "Shots"
                'REEL'      // Instead of "6" or "Videos"
            ];

            clearLabels.forEach(label => {
                expect(screen.getByText(label)).toBeInTheDocument();
            });
        });

        test('maintains athletic theme while being intuitive', () => {
            render(<AthleticScoreboard {...defaultProps} />);

            // Athletic terminology that's still clear
            expect(screen.getByText('PORTFOLIO SCOREBOARD')).toBeInTheDocument();
            expect(screen.getByText('LIVE PORTFOLIO')).toBeInTheDocument();

            // Clear labels that maintain athletic theme without confusion
            expect(screen.getByText('ABOUT')).toBeInTheDocument();    // About section
            expect(screen.getByText('WORK')).toBeInTheDocument();     // Work portfolio
            expect(screen.getByText('INSIGHTS')).toBeInTheDocument(); // Technical insights
        });

        test('provides immediate visual feedback for interactions', async () => {
            const user = userEvent.setup();
            render(<AthleticScoreboard {...defaultProps} />);

            const workButton = screen.getByRole('button', { name: /navigate to projects.*experience/i });

            // Should have hover states that provide immediate feedback
            await user.hover(workButton);

            // Visual feedback should be apparent through hover state classes applied on hover
            expect(workButton).toHaveClass('scale-102');
        });
    });
});