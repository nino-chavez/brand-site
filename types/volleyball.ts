import type { SectionId } from './site';

/**
 * Volleyball navigation system types
 * Extracted from monolithic types.ts for better organization
 */

export type VolleyballPosition = 1 | 2 | 3 | 4 | 5 | 6;

export interface CourtPosition {
    position: VolleyballPosition;
    sectionId: SectionId;
    coordinates: { x: number; y: number };
    label: string;
    description: string;
    isActive: boolean;
}

export interface VolleyballNavigationProps {
    activeSection: SectionId;
    onNavigate: (sectionId: SectionId) => void;
    onRotationChange: (direction: 'clockwise' | 'counterclockwise') => void;
    className?: string;
    showTooltips?: boolean;
    size?: 'small' | 'medium' | 'large';
    isVisible?: boolean;
}

export interface VolleyballNavigationState {
    positions: CourtPosition[];
    currentRotation: number; // 0-360 degrees
    isRotating: boolean;
    hoveredPosition: VolleyballPosition | null;
    accessibilityMode: boolean;
}

export interface RotationControlsProps {
    onRotate: (direction: 'clockwise' | 'counterclockwise') => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export interface CourtPositionProps {
    position: VolleyballPosition;
    sectionId: SectionId;
    coordinates: { x: number; y: number };
    label: string;
    description: string;
    isActive: boolean;
    isHovered: boolean;
    onClick: (sectionId: SectionId) => void;
    onHover: (position: VolleyballPosition | null) => void;
    size?: 'small' | 'medium' | 'large';
    showTooltip?: boolean;
}

export interface PositionMapping {
    [key in VolleyballPosition]: {
        sectionId: SectionId;
        label: string;
        description: string;
        coordinates: { x: number; y: number };
    };
}

export interface VolleyballNavigationHookProps {
    initialSection?: SectionId;
    onSectionChange?: (sectionId: SectionId) => void;
    enableKeyboardNavigation?: boolean;
}

export interface VolleyballNavigationHookReturn {
    positions: CourtPosition[];
    activePosition: VolleyballPosition;
    currentRotation: number;
    isRotating: boolean;
    hoveredPosition: VolleyballPosition | null;
    navigateToSection: (sectionId: SectionId) => void;
    rotatePositions: (direction: 'clockwise' | 'counterclockwise') => void;
    setHoveredPosition: (position: VolleyballPosition | null) => void;
    updateActiveSection: (sectionId: SectionId) => void;
}