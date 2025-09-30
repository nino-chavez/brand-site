/**
 * Photography-Inspired Easing Curves
 *
 * Professional camera movement easing curves based on real cinematography techniques.
 * Implements physics-based motion that mimics professional camera operators and equipment.
 *
 * @fileoverview Photography-inspired easing curves for cinematic camera movements
 * @version 1.0.0
 * @since Task 3 - Photography Metaphor Integration Enhancement
 */

/**
 * Photography easing curve types based on real camera equipment
 */
export type PhotographyEasingType =
  | 'handheld-natural'      // Natural handheld camera movement with slight shake
  | 'tripod-fluid'          // Smooth tripod head movement
  | 'gimbal-stabilized'     // Electronic stabilization characteristics
  | 'slider-mechanical'     // Linear camera slider movement
  | 'jib-arm'              // Jib arm arc movement
  | 'steadicam-float'      // Steadicam floating movement
  | 'focus-pull-manual'    // Manual focus pull characteristics
  | 'focus-pull-follow'    // Follow focus movement
  | 'zoom-cinematic'       // Professional zoom lens movement
  | 'tilt-fluid-head'      // Fluid head tilt movement
  | 'pan-whip'             // Fast whip pan movement
  | 'rack-focus-smooth'    // Smooth rack focus transition
  | 'dolly-track'          // Dolly track movement
  | 'crane-sweep'          // Crane sweeping movement;

/**
 * Professional camera movement physics parameters
 */
interface CameraMovementPhysics {
  /** Initial acceleration phase (0-1) */
  acceleration: number;
  /** Constant velocity phase (0-1) */
  plateau: number;
  /** Deceleration phase (0-1) */
  deceleration: number;
  /** Natural oscillation factor for equipment-specific characteristics */
  oscillation: number;
  /** Damping factor for stabilization */
  damping: number;
  /** Micro-movement variance for realistic feel */
  variance: number;
}

/**
 * Professional photography equipment characteristics
 */
const CAMERA_EQUIPMENT_PHYSICS: Record<PhotographyEasingType, CameraMovementPhysics> = {
  'handheld-natural': {
    acceleration: 0.3,
    plateau: 0.4,
    deceleration: 0.3,
    oscillation: 0.02,
    damping: 0.7,
    variance: 0.005
  },
  'tripod-fluid': {
    acceleration: 0.25,
    plateau: 0.5,
    deceleration: 0.25,
    oscillation: 0.001,
    damping: 0.95,
    variance: 0.001
  },
  'gimbal-stabilized': {
    acceleration: 0.2,
    plateau: 0.6,
    deceleration: 0.2,
    oscillation: 0.005,
    damping: 0.98,
    variance: 0.002
  },
  'slider-mechanical': {
    acceleration: 0.15,
    plateau: 0.7,
    deceleration: 0.15,
    oscillation: 0.0,
    damping: 1.0,
    variance: 0.0
  },
  'jib-arm': {
    acceleration: 0.35,
    plateau: 0.3,
    deceleration: 0.35,
    oscillation: 0.008,
    damping: 0.85,
    variance: 0.003
  },
  'steadicam-float': {
    acceleration: 0.4,
    plateau: 0.2,
    deceleration: 0.4,
    oscillation: 0.015,
    damping: 0.75,
    variance: 0.008
  },
  'focus-pull-manual': {
    acceleration: 0.6,
    plateau: 0.1,
    deceleration: 0.3,
    oscillation: 0.02,
    damping: 0.6,
    variance: 0.01
  },
  'focus-pull-follow': {
    acceleration: 0.2,
    plateau: 0.6,
    deceleration: 0.2,
    oscillation: 0.003,
    damping: 0.9,
    variance: 0.002
  },
  'zoom-cinematic': {
    acceleration: 0.3,
    plateau: 0.4,
    deceleration: 0.3,
    oscillation: 0.001,
    damping: 0.92,
    variance: 0.001
  },
  'tilt-fluid-head': {
    acceleration: 0.25,
    plateau: 0.5,
    deceleration: 0.25,
    oscillation: 0.002,
    damping: 0.94,
    variance: 0.001
  },
  'pan-whip': {
    acceleration: 0.1,
    plateau: 0.0,
    deceleration: 0.9,
    oscillation: 0.05,
    damping: 0.4,
    variance: 0.02
  },
  'rack-focus-smooth': {
    acceleration: 0.4,
    plateau: 0.2,
    deceleration: 0.4,
    oscillation: 0.001,
    damping: 0.98,
    variance: 0.0005
  },
  'dolly-track': {
    acceleration: 0.2,
    plateau: 0.6,
    deceleration: 0.2,
    oscillation: 0.002,
    damping: 0.96,
    variance: 0.001
  },
  'crane-sweep': {
    acceleration: 0.3,
    plateau: 0.4,
    deceleration: 0.3,
    oscillation: 0.01,
    damping: 0.8,
    variance: 0.005
  }
};

/**
 * Generate professional camera movement easing curve
 */
export function getPhotographyEasing(type: PhotographyEasingType): (t: number) => number {
  const physics = CAMERA_EQUIPMENT_PHYSICS[type];

  return (t: number): number => {
    // Clamp t to [0, 1]
    t = Math.max(0, Math.min(1, t));

    let eased: number;

    // Three-phase movement: acceleration, plateau, deceleration
    if (t <= physics.acceleration) {
      // Acceleration phase - ease-in
      const localT = t / physics.acceleration;
      eased = localT * localT;
    } else if (t <= physics.acceleration + physics.plateau) {
      // Plateau phase - constant velocity
      const plateauProgress = (t - physics.acceleration) / physics.plateau;
      eased = physics.acceleration + plateauProgress * physics.plateau;
    } else {
      // Deceleration phase - ease-out
      const localT = (t - physics.acceleration - physics.plateau) / physics.deceleration;
      const easeOut = 1 - Math.pow(1 - localT, 2);
      eased = physics.acceleration + physics.plateau + easeOut * physics.deceleration;
    }

    // Apply equipment-specific oscillation for realistic feel
    if (physics.oscillation > 0) {
      const oscillationFactor = Math.sin(t * Math.PI * 8) * physics.oscillation * (1 - t);
      eased += oscillationFactor * physics.damping;
    }

    // Apply micro-movements for natural variance
    if (physics.variance > 0) {
      const variance = (Math.random() - 0.5) * physics.variance * Math.sin(t * Math.PI);
      eased += variance * physics.damping;
    }

    // Apply damping to smooth out unwanted artifacts
    eased = eased * physics.damping + t * (1 - physics.damping);

    return Math.max(0, Math.min(1, eased));
  };
}

/**
 * Enhanced cinematic easing curves for specific camera movements
 */
export const cinematicEasingCurves = {
  /**
   * Professional dolly movement - smooth acceleration with gentle stop
   */
  professionalDolly: (t: number): number => {
    return getPhotographyEasing('dolly-track')(t);
  },

  /**
   * Handheld camera movement - natural with slight imperfection
   */
  handheldNatural: (t: number): number => {
    return getPhotographyEasing('handheld-natural')(t);
  },

  /**
   * Fluid head pan/tilt - smooth professional movement
   */
  fluidHead: (t: number): number => {
    return getPhotographyEasing('tripod-fluid')(t);
  },

  /**
   * Gimbal-stabilized movement - electronic smoothness
   */
  gimbalStabilized: (t: number): number => {
    return getPhotographyEasing('gimbal-stabilized')(t);
  },

  /**
   * Professional zoom - consistent speed with smooth stops
   */
  professionalZoom: (t: number): number => {
    return getPhotographyEasing('zoom-cinematic')(t);
  },

  /**
   * Rack focus transition - smooth depth of field change
   */
  rackFocusSmooth: (t: number): number => {
    return getPhotographyEasing('rack-focus-smooth')(t);
  },

  /**
   * Follow focus - responsive but smooth
   */
  followFocus: (t: number): number => {
    return getPhotographyEasing('focus-pull-follow')(t);
  },

  /**
   * Steadicam float - characteristic floating movement
   */
  steadicamFloat: (t: number): number => {
    return getPhotographyEasing('steadicam-float')(t);
  },

  /**
   * Jib arm sweep - arc movement with momentum
   */
  jibSweep: (t: number): number => {
    return getPhotographyEasing('jib-arm')(t);
  },

  /**
   * Whip pan - fast start with dramatic stop
   */
  whipPan: (t: number): number => {
    return getPhotographyEasing('pan-whip')(t);
  }
};

/**
 * Get easing curve based on camera movement type and equipment
 */
export function getCinematicEasing(
  movementType: 'pan' | 'tilt' | 'zoom' | 'dolly' | 'focus' | 'crane',
  equipment: 'handheld' | 'tripod' | 'gimbal' | 'slider' | 'jib' | 'steadicam' = 'tripod',
  style: 'smooth' | 'natural' | 'dramatic' = 'smooth'
): (t: number) => number {
  // Map movement and equipment to easing type
  const easingMap: Record<string, PhotographyEasingType> = {
    'pan-handheld': 'handheld-natural',
    'pan-tripod': 'tripod-fluid',
    'pan-gimbal': 'gimbal-stabilized',
    'pan-slider': 'slider-mechanical',
    'pan-jib': 'jib-arm',
    'pan-steadicam': 'steadicam-float',
    'tilt-handheld': 'handheld-natural',
    'tilt-tripod': 'tilt-fluid-head',
    'tilt-gimbal': 'gimbal-stabilized',
    'tilt-slider': 'slider-mechanical',
    'tilt-jib': 'jib-arm',
    'tilt-steadicam': 'steadicam-float',
    'zoom-handheld': 'handheld-natural',
    'zoom-tripod': 'zoom-cinematic',
    'zoom-gimbal': 'gimbal-stabilized',
    'zoom-slider': 'zoom-cinematic',
    'zoom-jib': 'zoom-cinematic',
    'zoom-steadicam': 'zoom-cinematic',
    'dolly-handheld': 'handheld-natural',
    'dolly-tripod': 'dolly-track',
    'dolly-gimbal': 'gimbal-stabilized',
    'dolly-slider': 'slider-mechanical',
    'dolly-jib': 'jib-arm',
    'dolly-steadicam': 'steadicam-float',
    'focus-handheld': 'focus-pull-manual',
    'focus-tripod': 'focus-pull-follow',
    'focus-gimbal': 'focus-pull-follow',
    'focus-slider': 'focus-pull-follow',
    'focus-jib': 'focus-pull-follow',
    'focus-steadicam': 'focus-pull-follow',
    'crane-handheld': 'handheld-natural',
    'crane-tripod': 'crane-sweep',
    'crane-gimbal': 'crane-sweep',
    'crane-slider': 'crane-sweep',
    'crane-jib': 'crane-sweep',
    'crane-steadicam': 'crane-sweep'
  };

  const key = `${movementType}-${equipment}`;
  let easingType = easingMap[key] || 'tripod-fluid';

  // Apply style modifications
  if (style === 'dramatic') {
    if (movementType === 'pan') easingType = 'pan-whip';
    if (movementType === 'focus') easingType = 'focus-pull-manual';
  } else if (style === 'natural') {
    easingType = 'handheld-natural';
  }

  return getPhotographyEasing(easingType);
}

/**
 * Photography-specific easing presets for common movements
 */
export const photographyPresets = {
  /** Establishing shot - slow, steady revelation */
  establishingShot: cinematicEasingCurves.professionalDolly,

  /** Close-up transition - smooth focus pull */
  closeUpTransition: cinematicEasingCurves.rackFocusSmooth,

  /** Action follow - responsive tracking */
  actionFollow: cinematicEasingCurves.gimbalStabilized,

  /** Dramatic reveal - building momentum */
  dramaticReveal: cinematicEasingCurves.jibSweep,

  /** Intimate moment - gentle, human movement */
  intimateMovement: cinematicEasingCurves.handheldNatural,

  /** Technical precision - mechanical accuracy */
  technicalPrecision: (t: number) => getPhotographyEasing('slider-mechanical')(t),

  /** Floating dream - weightless feel */
  floatingDream: cinematicEasingCurves.steadicamFloat,

  /** Fast transition - quick but controlled */
  fastTransition: cinematicEasingCurves.whipPan,

  /** Focus breathing - natural lens characteristics */
  focusBreathing: (t: number) => {
    const base = cinematicEasingCurves.followFocus(t);
    // Add subtle breathing effect that real lenses have
    const breathing = Math.sin(t * Math.PI) * 0.02;
    return Math.max(0, Math.min(1, base + breathing));
  },

  /** Vintage lens - with characteristic imperfections */
  vintageLens: (t: number) => {
    const base = cinematicEasingCurves.handheldNatural(t);
    // Add vintage lens characteristics
    const vintage = Math.sin(t * Math.PI * 3) * 0.01 * (1 - t);
    return Math.max(0, Math.min(1, base + vintage));
  }
};

/**
 * Calculate movement with photography physics
 */
export function calculatePhotographyMovement(
  from: number,
  to: number,
  progress: number,
  easingType: PhotographyEasingType,
  intensity: number = 1.0
): number {
  const easingFn = getPhotographyEasing(easingType);
  const easedProgress = easingFn(progress);

  return from + (to - from) * easedProgress * intensity;
}

/**
 * Validate photography easing curve
 */
export function validatePhotographyEasing(
  easingFn: (t: number) => number,
  samples: number = 100
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Test boundary values
  const start = easingFn(0);
  const end = easingFn(1);

  if (Math.abs(start) > 0.01) {
    issues.push(`Easing function should start near 0, got ${start}`);
  }

  if (Math.abs(end - 1) > 0.01) {
    issues.push(`Easing function should end near 1, got ${end}`);
  }

  // Test monotonicity (should generally increase)
  let previousValue = start;
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const value = easingFn(t);

    // Allow small variations for natural movement
    if (value < previousValue - 0.05) {
      issues.push(`Non-monotonic behavior detected at t=${t}`);
    }

    previousValue = value;
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

export default {
  getPhotographyEasing,
  getCinematicEasing,
  cinematicEasingCurves,
  photographyPresets,
  calculatePhotographyMovement,
  validatePhotographyEasing
};