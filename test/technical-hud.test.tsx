/**
 * Technical HUD Navigation Tests
 *
 * Tests the professional technical HUD navigation components that match
 * the site's sophisticated camera/technical interface aesthetic.
 */

import React from 'react';
import { describe, it, expect, test, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TechnicalHUD } from '../components/TechnicalHUD';
import { FloatingHUD } from '../components/FloatingHUD';
import { SectionId } from '../types';

describe('Technical HUD Navigation', () => {
    const defaultProps = {
        activeSection: 'hero' as SectionId,
        onNavigate: vi.fn(),
        className: ''
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('TechnicalHUD Component', () => {
        test('renders HUD with clean, direct section labels', () => {
            render(<TechnicalHUD {...defaultProps} />);

            // Check for clean, professional labels
            expect(screen.getByText('HOME')).toBeInTheDocument();
            expect(screen.getByText('ABOUT')).toBeInTheDocument();
            expect(screen.getByText('WORK')).toBeInTheDocument();
            expect(screen.getByText('INSIGHTS')).toBeInTheDocument();
            expect(screen.getByText('GALLERY')).toBeInTheDocument();
            expect(screen.getByText('REEL')).toBeInTheDocument();
            expect(screen.getByText('CONTACT')).toBeInTheDocument();
        });

        test('shows technical metrics on hover for desktop variants', async () => {
            const user = userEvent.setup();
            render(<TechnicalHUD {...defaultProps} variant="header" />);

            const workButton = screen.getByRole('button', { name: /navigate to project portfolio/i });
            await user.hover(workButton);

            // Technical metrics should appear
            await waitFor(() => {
                expect(screen.getByRole('tooltip')).toBeInTheDocument();
                expect(screen.getByText('Scale: Enterprise')).toBeInTheDocument();
                expect(screen.getByText('Project portfolio')).toBeInTheDocument();
            });
        });

        test('does not show tooltips for mobile variant', async () => {
            const user = userEvent.setup();
            render(<TechnicalHUD {...defaultProps} variant="mobile" />);

            const workButton = screen.getByRole('button', { name: /navigate to project portfolio/i });
            await user.hover(workButton);

            // No tooltip should appear on mobile
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });

        test('applies active styling to current section', () => {
            render(<TechnicalHUD {...defaultProps} activeSection="work" />);

            const workButton = screen.getByRole('button', { name: /navigate to project portfolio/i });
            expect(workButton).toHaveClass('text-brand-violet');
            expect(workButton).toHaveClass('bg-brand-violet/10');
            expect(workButton).toHaveAttribute('aria-pressed', 'true');
        });

        test('calls onNavigate when section is clicked', async () => {
            const user = userEvent.setup();
            render(<TechnicalHUD {...defaultProps} />);

            const workButton = screen.getByRole('button', { name: /navigate to project portfolio/i });
            await user.click(workButton);

            expect(defaultProps.onNavigate).toHaveBeenCalledWith('work');
        });

        test('includes contact section in navigation', () => {
            render(<TechnicalHUD {...defaultProps} />);

            const contactButton = screen.getByRole('button', { name: /navigate to get in touch/i });
            expect(contactButton).toBeInTheDocument();
            expect(contactButton).toHaveTextContent('CONTACT');
        });

        test('applies correct variant styling', () => {
            const { rerender } = render(<TechnicalHUD {...defaultProps} variant="header" />);
            let nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('px-0', 'py-0');

            rerender(<TechnicalHUD {...defaultProps} variant="floating" />);
            nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('px-4', 'py-3', 'rounded-lg');

            rerender(<TechnicalHUD {...defaultProps} variant="mobile" />);
            nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('px-4', 'py-3', 'rounded-md');
        });

        test('arranges items vertically for mobile variant', () => {
            render(<TechnicalHUD {...defaultProps} variant="mobile" />);

            const navContainer = screen.getByRole('navigation');
            const itemsContainer = navContainer.querySelector('div[class*="flex-col"]');
            expect(itemsContainer).toHaveClass('flex-col');
        });

        test('arranges items horizontally for non-mobile variants', () => {
            render(<TechnicalHUD {...defaultProps} variant="header" />);

            const navContainer = screen.getByRole('navigation');
            const itemsContainer = navContainer.querySelector('div[class*="flex-row"]');
            expect(itemsContainer).toHaveClass('flex-row');
        });

        test('provides proper accessibility attributes', () => {
            render(<TechnicalHUD {...defaultProps} />);

            const nav = screen.getByRole('navigation');
            expect(nav).toHaveAttribute('aria-label', 'Technical HUD navigation');

            // Each button should have descriptive labels
            expect(screen.getByRole('button', { name: /navigate to portfolio entry point/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /navigate to professional background/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /navigate to project portfolio/i })).toBeInTheDocument();
        });

        test('handles keyboard navigation correctly', async () => {
            const user = userEvent.setup();
            render(<TechnicalHUD {...defaultProps} />);

            const workButton = screen.getByRole('button', { name: /navigate to project portfolio/i });

            workButton.focus();
            await user.keyboard('{Enter}');
            expect(defaultProps.onNavigate).toHaveBeenCalledWith('work');

            vi.clearAllMocks();

            await user.keyboard(' ');
            expect(defaultProps.onNavigate).toHaveBeenCalledWith('work');
        });

        test('displays active indicator for current section', () => {
            render(<TechnicalHUD {...defaultProps} activeSection="work" />);

            const workButton = screen.getByRole('button', { name: /navigate to project portfolio/i });
            const activeIndicator = workButton.querySelector('div[class*="bg-brand-violet"]');
            expect(activeIndicator).toBeInTheDocument();
        });

        test('uses monospace font for technical aesthetic', () => {
            render(<TechnicalHUD {...defaultProps} />);

            const homeButton = screen.getByRole('button', { name: /navigate to portfolio entry point/i });
            expect(homeButton).toHaveClass('font-mono');
            expect(homeButton).toHaveClass('tracking-wider');
        });
    });

    describe('FloatingHUD Component', () => {
        const floatingProps = {
            activeSection: 'hero' as SectionId,
            onNavigate: vi.fn(),
            className: ''
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        test('renders floating HUD in fixed position', () => {
            const { container } = render(<FloatingHUD {...floatingProps} />);

            const floatingContainer = container.firstChild;
            expect(floatingContainer).toHaveClass('fixed', 'right-6', 'top-1/2');
        });

        test('uses floating variant by default', () => {
            render(<FloatingHUD {...floatingProps} />);

            const nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('rounded-lg'); // Floating variant characteristic
        });

        test('is hidden on smaller screens', () => {
            const { container } = render(<FloatingHUD {...floatingProps} />);

            const floatingContainer = container.firstChild;
            expect(floatingContainer).toHaveClass('hidden', 'lg:block');
        });

        test('has subtle glow effect', () => {
            const { container } = render(<FloatingHUD {...floatingProps} />);

            const glowEffect = container.querySelector('div[class*="blur-xl"]');
            expect(glowEffect).toBeInTheDocument();
            expect(glowEffect).toHaveClass('bg-brand-violet/5');
        });
    });

    describe('Professional Design Principles', () => {
        test('uses clean, direct labels without gimmicks', () => {
            render(<TechnicalHUD {...defaultProps} />);

            // Professional labels that don't require interpretation
            const professionalLabels = [
                'HOME',     // Clear, direct
                'ABOUT',    // Standard, expected
                'WORK',     // Professional portfolio terminology
                'INSIGHTS', // Technical/professional focus
                'GALLERY',  // Photography portfolio
                'REEL'      // Video content
            ];

            professionalLabels.forEach(label => {
                expect(screen.getByText(label)).toBeInTheDocument();
            });
        });

        test('maintains clean professional aesthetic', () => {
            render(<TechnicalHUD {...defaultProps} variant="header" />);

            // Navigation should be clean without gimmicky elements
            const nav = screen.getByRole('navigation');
            expect(nav).toBeInTheDocument();

            // Should not have distracting status indicators
            expect(screen.queryByText('SYSTEM READY')).not.toBeInTheDocument();
        });

        test('maintains sophisticated visual hierarchy', async () => {
            const user = userEvent.setup();
            render(<TechnicalHUD {...defaultProps} />);

            const workButton = screen.getByRole('button', { name: /navigate to project portfolio/i });

            // Default state should be subtle
            expect(workButton).toHaveClass('text-white/70');

            // Hover state should provide clear feedback
            await user.hover(workButton);
            expect(workButton).toHaveClass('bg-white/8');
            expect(workButton).toHaveClass('border-white/30');
        });

        test('provides click feedback with scale animation', async () => {
            const user = userEvent.setup();
            render(<TechnicalHUD {...defaultProps} />);

            const workButton = screen.getByRole('button', { name: /navigate to project portfolio/i });

            // Button should have active state classes for click feedback
            expect(workButton).toHaveClass('active:scale-95');
            expect(workButton).toHaveClass('active:bg-white/10');
        });

        test('tooltips appear below navigation with proper styling', async () => {
            const user = userEvent.setup();
            render(<TechnicalHUD {...defaultProps} variant="header" />);

            const workButton = screen.getByRole('button', { name: /navigate to project portfolio/i });
            await user.hover(workButton);

            // Tooltip should appear below with proper positioning
            await waitFor(() => {
                const tooltip = screen.getByRole('tooltip');
                expect(tooltip).toBeInTheDocument();
                expect(tooltip).toHaveClass('top-full');
                expect(tooltip).toHaveClass('mt-2');
                expect(tooltip).toHaveClass('z-[60]');

                // Should have arrow
                const arrow = tooltip.querySelector('div[class*="rotate-45"]');
                expect(arrow).toBeInTheDocument();
            });
        });

        test('demonstrates technical expertise through implementation', () => {
            render(<TechnicalHUD {...defaultProps} variant="header" />);

            // Implementation shows attention to technical details
            const nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('technical-hud');

            // Proper ARIA implementation
            expect(nav).toHaveAttribute('aria-label', 'Technical HUD navigation');

            // Professional typography choices
            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toHaveClass('font-mono');
                expect(button).toHaveClass('text-xs');
                expect(button).toHaveClass('tracking-wider');
            });
        });

        test('ensures all main portfolio sections are accessible', () => {
            render(<TechnicalHUD {...defaultProps} />);

            // Core portfolio sections should all be present
            const expectedSections = [
                { label: 'HOME', description: 'Portfolio entry point' },
                { label: 'ABOUT', description: 'Professional background' },
                { label: 'WORK', description: 'Project portfolio' },
                { label: 'INSIGHTS', description: 'Articles & thoughts' },
                { label: 'GALLERY', description: 'Photography portfolio' },
                { label: 'REEL', description: 'Motion content' },
                { label: 'CONTACT', description: 'Get in touch' }
            ];

            expectedSections.forEach(section => {
                const button = screen.getByRole('button', {
                    name: new RegExp(`Navigate to ${section.description}`, 'i')
                });
                expect(button).toBeInTheDocument();
                expect(button).toHaveTextContent(section.label);
            });
        });
    });
});