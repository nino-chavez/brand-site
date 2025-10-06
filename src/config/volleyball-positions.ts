import { PositionMapping, VolleyballPosition, SectionId } from '../types';

/**
 * Volleyball Court Position Mapping Configuration
 * Maps 6 volleyball court positions to portfolio sections
 * Follows standard volleyball rotation numbering (1-6)
 */
export const VOLLEYBALL_POSITION_MAPPING: PositionMapping = {
    1: {
        sectionId: 'hero' as SectionId,
        label: 'Equipment Check',
        description: 'Hero section with viewfinder interface',
        coordinates: { x: 70, y: 85 } // Position 1: Right Back (Serving position)
    },
    2: {
        sectionId: 'about' as SectionId,
        label: 'Warm-Up',
        description: 'About section introducing professional background',
        coordinates: { x: 70, y: 50 } // Position 2: Right Side
    },
    3: {
        sectionId: 'work' as SectionId,
        label: 'Game Time',
        description: 'Projects showcase and portfolio work',
        coordinates: { x: 70, y: 15 } // Position 3: Right Front
    },
    4: {
        sectionId: 'insights' as SectionId,
        label: 'Training',
        description: 'Technical insights and expertise',
        coordinates: { x: 30, y: 15 } // Position 4: Middle Front (Center/Leader position)
    },
    5: {
        sectionId: 'gallery' as SectionId,
        label: 'Action Shots',
        description: 'Photography gallery and visual work',
        coordinates: { x: 30, y: 85 } // Position 5: Left Front
    },
    6: {
        sectionId: 'reel' as SectionId,
        label: 'Highlight Reel',
        description: 'Video content and dynamic presentations',
        coordinates: { x: 30, y: 50 } // Position 6: Left Back
    }
};

/**
 * Get position by section ID
 */
export function getPositionBySection(sectionId: SectionId): VolleyballPosition | null {
    const entry = Object.entries(VOLLEYBALL_POSITION_MAPPING).find(
        ([_, config]) => config.sectionId === sectionId
    );
    return entry ? (parseInt(entry[0]) as VolleyballPosition) : null;
}

/**
 * Get section by position
 */
export function getSectionByPosition(position: VolleyballPosition): SectionId | null {
    return VOLLEYBALL_POSITION_MAPPING[position]?.sectionId || null;
}

/**
 * Get next position in clockwise rotation
 */
export function getNextPosition(currentPosition: VolleyballPosition): VolleyballPosition {
    return (currentPosition === 6 ? 1 : (currentPosition + 1)) as VolleyballPosition;
}

/**
 * Get previous position in counterclockwise rotation
 */
export function getPreviousPosition(currentPosition: VolleyballPosition): VolleyballPosition {
    return (currentPosition === 1 ? 6 : (currentPosition - 1)) as VolleyballPosition;
}

/**
 * Calculate rotation angle for smooth transitions
 */
export function calculateRotationAngle(fromPosition: VolleyballPosition, toPosition: VolleyballPosition): number {
    // Each position is 60 degrees apart (360 / 6 = 60)
    const anglePerPosition = 60;
    const fromAngle = (fromPosition - 1) * anglePerPosition;
    const toAngle = (toPosition - 1) * anglePerPosition;

    // Calculate shortest rotation path
    let angleDiff = toAngle - fromAngle;
    if (angleDiff > 180) {
        angleDiff -= 360;
    } else if (angleDiff < -180) {
        angleDiff += 360;
    }

    return angleDiff;
}

/**
 * Responsive coordinate scaling for different viewport sizes
 */
export function getResponsiveCoordinates(
    position: VolleyballPosition,
    size: 'small' | 'medium' | 'large' = 'medium'
): { x: number; y: number } {
    const baseCoords = VOLLEYBALL_POSITION_MAPPING[position].coordinates;

    // Scale coordinates based on court size
    const scaleMap = {
        small: 0.8,   // Mobile: 200px court
        medium: 0.9,  // Tablet: 240px court
        large: 1.0    // Desktop: 280px court
    };

    const scale = scaleMap[size];
    return {
        x: baseCoords.x * scale,
        y: baseCoords.y * scale
    };
}

/**
 * Special sections that don't map to main rotation
 */
export const SPECIAL_SECTIONS = {
    'volleyball-demo': {
        label: 'Tech Demo',
        description: 'Technical demonstration and volleyball timing system',
        accessFrom: 4 as VolleyballPosition, // Accessible from Position 4 (Insights)
        type: 'modal' as const
    },
    'contact': {
        label: 'Post-Game',
        description: 'Contact information and professional connections',
        accessFrom: null, // Standalone "Bench" control
        type: 'standalone' as const
    }
} as const;