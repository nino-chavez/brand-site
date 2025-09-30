/**
 * Enhanced Camera Controller
 *
 * Professional photography-inspired camera movement system with enhanced
 * cinematic easing curves, professional rack focus, and authentic camera
 * equipment simulation for the lightbox navigation experience.
 *
 * @fileoverview Enhanced camera controller with professional photography metaphors
 * @version 2.0.0
 * @since Task 3 - Photography Metaphor Integration Enhancement
 */

import React, { useRef, useCallback, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import type {
  CameraControllerProps,
  CameraMovement,
  CameraMovementConfig,
  CanvasPosition,
  CanvasPerformanceMetrics
} from '../../types/canvas';
import { DEFAULT_CAMERA_MOVEMENTS } from '../../types/canvas';
import { useUnifiedCanvas } from '../../contexts/UnifiedGameFlowContext';
import {
  getCinematicEasing,
  photographyPresets,
  getPhotographyEasing,
  type PhotographyEasingType
} from '../../utils/photographyEasingCurves';
import { enhancedRackFocus, LENS_PRESETS } from '../../services/EnhancedRackFocusSystem';

// Professional photography equipment types
type CameraEquipment = 'handheld' | 'tripod' | 'gimbal' | 'slider' | 'jib' | 'steadicam';
type LensType = 'portrait85mm' | 'cinematic50mm' | 'documentary24mm' | 'macro100mm' | 'vintage50mm';
type ShootingStyle = 'smooth' | 'natural' | 'dramatic' | 'documentary' | 'cinematic';

// Enhanced camera movement configuration
interface EnhancedCameraConfig extends CameraMovementConfig {
  /** Camera equipment type for realistic movement characteristics */
  equipment: CameraEquipment;
  /** Lens type for depth of field characteristics */
  lens: LensType;
  /** Shooting style for movement personality */
  style: ShootingStyle;
  /** Enable professional effects */
  professionalEffects: boolean;
  /** Camera operator skill level affects smoothness */
  operatorSkill: 'novice' | 'experienced' | 'professional';
}

// Photography terminology for UI integration
const PHOTOGRAPHY_TERMINOLOGY = {
  movements: {
    'pan-tilt': {
      name: 'Camera Pan/Tilt',
      description: 'Horizontal and vertical camera movement on fixed point',
      instruction: 'Smooth camera pan to reveal new composition',
      shortcut: 'P'
    },
    'zoom-in': {
      name: 'Zoom In',
      description: 'Lens zoom to narrow field of view and magnify subject',
      instruction: 'Zoom in to focus on details',
      shortcut: 'Z'
    },
    'zoom-out': {
      name: 'Zoom Out',
      description: 'Lens zoom to widen field of view and reveal context',
      instruction: 'Zoom out to establish wider shot',
      shortcut: 'X'
    },
    'dolly-zoom': {
      name: 'Dolly Zoom (Vertigo Effect)',
      description: 'Camera moves while zooming for dramatic perspective shift',
      instruction: 'Execute dolly zoom for dramatic effect',
      shortcut: 'D'
    },
    'rack-focus': {
      name: 'Rack Focus',
      description: 'Shift focus plane to direct attention between subjects',
      instruction: 'Rack focus to new subject',
      shortcut: 'F'
    },
    'match-cut': {
      name: 'Match Cut',
      description: 'Transition matching visual elements between shots',
      instruction: 'Execute match cut transition',
      shortcut: 'M'
    }
  },
  equipment: {
    handheld: 'Natural handheld camera movement with organic feel',
    tripod: 'Stable tripod with fluid head for smooth controlled movement',
    gimbal: 'Electronic stabilization for floating camera movement',
    slider: 'Linear track movement for precise dolly shots',
    jib: 'Crane arm movement for sweeping cinematic shots',
    steadicam: 'Stabilized rig for dynamic floating movement'
  },
  lenses: {
    portrait85mm: '85mm Portrait Lens - Shallow DOF, Beautiful Bokeh',
    cinematic50mm: '50mm Cinematic Lens - Natural Perspective, Versatile',
    documentary24mm: '24mm Documentary Lens - Wide Angle, Deep Focus',
    macro100mm: '100mm Macro Lens - Ultra Shallow DOF, Close Focus',
    vintage50mm: '50mm Vintage Lens - Character, Imperfections'
  }
};

// Enhanced animation state with professional metadata
interface EnhancedAnimationState {
  isActive: boolean;
  movement: CameraMovement | null;
  startTime: number;
  duration: number;
  startPosition: CanvasPosition;
  targetPosition: CanvasPosition;
  config: EnhancedCameraConfig;
  rafId: number | null;
  progress: number;
  equipment: CameraEquipment;
  lens: LensType;
  style: ShootingStyle;
  photographyMetadata: {
    shotType: string;
    cameraAngle: string;
    frameComposition: string;
    focusPoint: string;
  };
}

/**
 * Enhanced Camera Controller - Professional photography-inspired camera system
 *
 * Integrates professional photography equipment simulation, authentic easing curves,
 * enhanced rack focus system, and photography terminology for cinematic navigation.
 */
export const EnhancedCameraController = forwardRef<any, CameraControllerProps>(({
  canvasState,
  onMovementExecute,
  onMovementComplete,
  onPerformanceUpdate
}, ref) => {
  // Hooks and context
  const { actions } = useUnifiedCanvas();

  // Enhanced animation state
  const [animationState, setAnimationState] = useState<EnhancedAnimationState>({
    isActive: false,
    movement: null,
    startTime: 0,
    duration: 0,
    startPosition: { x: 0, y: 0, scale: 1.0 },
    targetPosition: { x: 0, y: 0, scale: 1.0 },
    config: {
      ...DEFAULT_CAMERA_MOVEMENTS['pan-tilt'],
      equipment: 'tripod',
      lens: 'cinematic50mm',
      style: 'cinematic',
      professionalEffects: true,
      operatorSkill: 'professional'
    },
    rafId: null,
    progress: 0,
    equipment: 'tripod',
    lens: 'cinematic50mm',
    style: 'cinematic',
    photographyMetadata: {
      shotType: 'Medium Shot',
      cameraAngle: 'Eye Level',
      frameComposition: 'Rule of Thirds',
      focusPoint: 'Center'
    }
  });

  // Camera settings state
  const [cameraSettings, setCameraSettings] = useState({
    equipment: 'tripod' as CameraEquipment,
    lens: 'cinematic50mm' as LensType,
    style: 'cinematic' as ShootingStyle,
    enableRackFocus: true,
    enableFocusBreathing: true,
    enableChromaticAberration: true
  });

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState<CanvasPerformanceMetrics>({
    canvasRenderFPS: 60,
    averageMovementTime: 16,
    transformOverhead: 1,
    canvasMemoryMB: 0,
    gpuUtilization: 75,
    activeOperations: 0
  });

  // Refs for RAF and metadata
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const shotCounterRef = useRef<number>(1);

  // Initialize enhanced rack focus system
  useEffect(() => {
    enhancedRackFocus.initialize({
      duration: 400,
      depthOfField: LENS_PRESETS[cameraSettings.lens],
      focusBreathing: cameraSettings.enableFocusBreathing ? 0.02 : 0,
      chromaticAberration: cameraSettings.enableChromaticAberration,
      performance: 'high'
    });

    return () => {
      enhancedRackFocus.destroy();
    };
  }, [cameraSettings]);

  // Get professional easing function based on equipment and style
  const getEnhancedEasing = useCallback((
    movement: CameraMovement,
    equipment: CameraEquipment,
    style: ShootingStyle
  ): (t: number) => number => {
    // Map movement types to photography equipment
    const movementMap = {
      'pan-tilt': 'pan',
      'zoom-in': 'zoom',
      'zoom-out': 'zoom',
      'dolly-zoom': 'dolly',
      'rack-focus': 'focus',
      'match-cut': 'crane'
    } as const;

    const movementType = movementMap[movement] || 'pan';

    // Apply style modifications
    let effectiveStyle: 'smooth' | 'natural' | 'dramatic' = 'smooth';
    if (style === 'documentary') effectiveStyle = 'natural';
    if (style === 'dramatic') effectiveStyle = 'dramatic';

    return getCinematicEasing(movementType, equipment, effectiveStyle);
  }, []);

  // Calculate photography metadata for current shot
  const calculatePhotographyMetadata = useCallback((
    movement: CameraMovement,
    position: CanvasPosition,
    target: CanvasPosition
  ) => {
    const scale = target.scale;
    const distance = Math.sqrt(
      Math.pow(target.x - position.x, 2) + Math.pow(target.y - position.y, 2)
    );

    // Determine shot type based on scale
    let shotType = 'Medium Shot';
    if (scale >= 2.0) shotType = 'Close-Up';
    else if (scale >= 1.5) shotType = 'Medium Close-Up';
    else if (scale <= 0.7) shotType = 'Wide Shot';
    else if (scale <= 0.5) shotType = 'Establishing Shot';

    // Determine camera angle based on vertical movement
    let cameraAngle = 'Eye Level';
    if (target.y > position.y + 50) cameraAngle = 'Low Angle';
    else if (target.y < position.y - 50) cameraAngle = 'High Angle';

    // Determine composition based on target position
    let frameComposition = 'Center Frame';
    if (Math.abs(target.x) > 100) frameComposition = 'Rule of Thirds';
    if (distance > 200) frameComposition = 'Leading Lines';

    // Determine focus point
    let focusPoint = 'Center';
    if (movement === 'rack-focus') focusPoint = 'Subject Isolation';
    if (movement === 'dolly-zoom') focusPoint = 'Background Separation';

    return {
      shotType,
      cameraAngle,
      frameComposition,
      focusPoint
    };
  }, []);

  // Enhanced position calculation with photography physics
  const calculateEnhancedPosition = useCallback((
    start: CanvasPosition,
    target: CanvasPosition,
    progress: number,
    config: EnhancedCameraConfig,
    movement: CameraMovement
  ): CanvasPosition => {
    const easingFn = getEnhancedEasing(movement, config.equipment, config.style);
    const easedProgress = easingFn(progress);

    // Apply operator skill variations
    let skillVariance = 0;
    if (config.operatorSkill === 'novice') {
      skillVariance = Math.sin(progress * Math.PI * 4) * 0.01 * (1 - progress);
    } else if (config.operatorSkill === 'experienced') {
      skillVariance = Math.sin(progress * Math.PI * 2) * 0.003 * (1 - progress);
    }

    // Special handling for different movement types with professional characteristics
    switch (movement) {
      case 'dolly-zoom':
        // Enhanced dolly zoom with lens breathing simulation
        const dollyScale = start.scale + (target.scale - start.scale) * easedProgress;
        const lensBreathing = config.professionalEffects ?
          Math.sin(easedProgress * Math.PI) * 0.01 : 0;
        const compensateTranslate = (1 / dollyScale - 1) * 50 * (1 + lensBreathing);

        return {
          x: start.x + (target.x - start.x) * easedProgress + compensateTranslate + skillVariance * 10,
          y: start.y + (target.y - start.y) * easedProgress + compensateTranslate + skillVariance * 10,
          scale: dollyScale + lensBreathing
        };

      case 'zoom-in':
      case 'zoom-out':
        // Professional zoom with lens characteristics
        const zoomScale = start.scale + (target.scale - start.scale) * easedProgress;
        const zoomBreathing = config.professionalEffects ?
          Math.sin(easedProgress * Math.PI) * 0.005 : 0;

        return {
          x: start.x + (target.x - start.x) * easedProgress + skillVariance * 5,
          y: start.y + (target.y - start.y) * easedProgress + skillVariance * 5,
          scale: zoomScale + zoomBreathing
        };

      case 'rack-focus':
        // Rack focus with minimal position change but enhanced depth effects
        if (config.professionalEffects && cameraSettings.enableRackFocus) {
          // Trigger enhanced rack focus system
          const activeElement = document.querySelector('[data-spatial-section]:hover') as HTMLElement;
          if (activeElement) {
            enhancedRackFocus.executeRackFocus(activeElement);
          }
        }

        const focusScale = start.scale + (target.scale - start.scale) * easedProgress;
        return {
          x: start.x + (target.x - start.x) * easedProgress * 0.1, // Minimal position change
          y: start.y + (target.y - start.y) * easedProgress * 0.1,
          scale: focusScale
        };

      default:
        // Standard pan/tilt and match-cut with equipment characteristics
        return {
          x: start.x + (target.x - start.x) * easedProgress + skillVariance * 8,
          y: start.y + (target.y - start.y) * easedProgress + skillVariance * 8,
          scale: start.scale + (target.scale - start.scale) * easedProgress
        };
    }
  }, [getEnhancedEasing, cameraSettings.enableRackFocus]);

  // Enhanced animation loop with professional monitoring
  const enhancedAnimationLoop = useCallback((timestamp: number) => {
    const frameTime = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;

    setAnimationState(prev => {
      if (!prev.isActive || !prev.movement) return prev;

      const elapsed = timestamp - prev.startTime;
      const progress = Math.min(elapsed / prev.duration, 1);

      // Calculate current position with enhanced physics
      const currentPosition = calculateEnhancedPosition(
        prev.startPosition,
        prev.targetPosition,
        progress,
        prev.config,
        prev.movement
      );

      // Update canvas position
      actions.canvas.updateCanvasPosition(currentPosition);

      // Update performance metrics
      const fps = 1000 / frameTime;
      setPerformanceMetrics(metrics => ({
        ...metrics,
        canvasRenderFPS: fps,
        averageMovementTime: frameTime,
        transformOverhead: frameTime - 16.67
      }));

      // Continue animation or complete
      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(enhancedAnimationLoop);
        return { ...prev, progress };
      } else {
        // Animation complete
        onMovementComplete(prev.movement);
        shotCounterRef.current++;

        return {
          ...prev,
          isActive: false,
          movement: null,
          rafId: null,
          progress: 1
        };
      }
    });
  }, [calculateEnhancedPosition, actions.canvas, onMovementComplete]);

  // Execute enhanced camera movement
  const executeEnhancedMovement = useCallback(async (
    movement: CameraMovement,
    targetPosition: CanvasPosition,
    customConfig?: Partial<EnhancedCameraConfig>
  ) => {
    const baseConfig = { ...DEFAULT_CAMERA_MOVEMENTS[movement] };
    const enhancedConfig: EnhancedCameraConfig = {
      ...baseConfig,
      equipment: cameraSettings.equipment,
      lens: cameraSettings.lens,
      style: cameraSettings.style,
      professionalEffects: true,
      operatorSkill: 'professional',
      ...customConfig
    };

    const startTime = performance.now();

    // Calculate photography metadata
    const photographyMetadata = calculatePhotographyMetadata(
      movement,
      canvasState.currentPosition,
      targetPosition
    );

    // Cancel any existing animation
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Start new enhanced animation
    setAnimationState({
      isActive: true,
      movement,
      startTime,
      duration: enhancedConfig.duration,
      startPosition: canvasState.currentPosition,
      targetPosition,
      config: enhancedConfig,
      rafId: null,
      progress: 0,
      equipment: enhancedConfig.equipment,
      lens: enhancedConfig.lens,
      style: enhancedConfig.style,
      photographyMetadata
    });

    // Execute callback with enhanced config
    await onMovementExecute(movement, enhancedConfig);

    // Start enhanced animation loop
    rafIdRef.current = requestAnimationFrame(enhancedAnimationLoop);

    // Update lens preset for rack focus
    if (movement === 'rack-focus') {
      enhancedRackFocus.setLensPreset(cameraSettings.lens);
    }
  }, [
    cameraSettings,
    canvasState.currentPosition,
    calculatePhotographyMetadata,
    onMovementExecute,
    enhancedAnimationLoop
  ]);

  // Enhanced camera API with professional controls
  const enhancedCameraAPI = useMemo(() => ({
    // Professional movement controls
    pan: (targetPosition: CanvasPosition, equipment?: CameraEquipment) =>
      executeEnhancedMovement('pan-tilt', targetPosition, { equipment }),

    tilt: (targetPosition: CanvasPosition, equipment?: CameraEquipment) =>
      executeEnhancedMovement('pan-tilt', targetPosition, { equipment }),

    zoom: (targetPosition: CanvasPosition, type: 'in' | 'out' = 'in') =>
      executeEnhancedMovement(type === 'in' ? 'zoom-in' : 'zoom-out', targetPosition),

    dollyZoom: (targetPosition: CanvasPosition) =>
      executeEnhancedMovement('dolly-zoom', targetPosition),

    rackFocus: (targetElement?: HTMLElement) => {
      if (targetElement) {
        return enhancedRackFocus.executeRackFocus(targetElement);
      } else {
        return executeEnhancedMovement('rack-focus', canvasState.currentPosition);
      }
    },

    matchCut: (targetPosition: CanvasPosition) =>
      executeEnhancedMovement('match-cut', targetPosition),

    // Equipment and lens controls
    setEquipment: (equipment: CameraEquipment) => {
      setCameraSettings(prev => ({ ...prev, equipment }));
    },

    setLens: (lens: LensType) => {
      setCameraSettings(prev => ({ ...prev, lens }));
      enhancedRackFocus.setLensPreset(lens);
    },

    setStyle: (style: ShootingStyle) => {
      setCameraSettings(prev => ({ ...prev, style }));
    },

    // Photography terminology access
    getMovementTerminology: (movement: CameraMovement) =>
      PHOTOGRAPHY_TERMINOLOGY.movements[movement],

    getEquipmentDescription: (equipment: CameraEquipment) =>
      PHOTOGRAPHY_TERMINOLOGY.equipment[equipment],

    getLensDescription: (lens: LensType) =>
      PHOTOGRAPHY_TERMINOLOGY.lenses[lens],

    // Professional features
    enableProfessionalEffects: (enabled: boolean) => {
      setCameraSettings(prev => ({ ...prev, enableRackFocus: enabled }));
    },

    // Current state access
    getCurrentMetadata: () => animationState.photographyMetadata,
    getPerformanceMetrics: () => performanceMetrics,
    isAnimating: animationState.isActive,
    currentMovement: animationState.movement,
    currentEquipment: cameraSettings.equipment,
    currentLens: cameraSettings.lens,
    shotNumber: shotCounterRef.current,

    // Enhanced test methods
    demonstrateEquipment: async (equipment: CameraEquipment) => {
      setCameraSettings(prev => ({ ...prev, equipment }));
      const testPosition = { x: 100, y: 100, scale: 1.2 };
      return executeEnhancedMovement('pan-tilt', testPosition, { equipment });
    },

    cinematicSequence: async () => {
      // Demonstrate professional camera sequence
      await executeEnhancedMovement('pan-tilt', { x: -100, y: 0, scale: 1.0 });
      await new Promise(resolve => setTimeout(resolve, 500));
      await executeEnhancedMovement('zoom-in', { x: -100, y: 0, scale: 1.5 });
      await new Promise(resolve => setTimeout(resolve, 300));
      await executeEnhancedMovement('rack-focus', { x: -100, y: 0, scale: 1.5 });
    }
  }), [
    executeEnhancedMovement,
    canvasState.currentPosition,
    animationState,
    cameraSettings,
    performanceMetrics
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      enhancedRackFocus.clearRackFocus();
    };
  }, []);

  // Report performance metrics
  useEffect(() => {
    onPerformanceUpdate(performanceMetrics);
  }, [performanceMetrics, onPerformanceUpdate]);

  // Expose enhanced API via ref
  useImperativeHandle(ref, () => enhancedCameraAPI, [enhancedCameraAPI]);

  // Enhanced debug information
  const enhancedDebugInfo = process.env.NODE_ENV === 'development' ? (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="text-athletic-court-orange font-semibold mb-2">ENHANCED CAMERA CONTROLLER</div>

      <div className="space-y-1 mb-3">
        <div className="text-athletic-neutral-300 font-medium">Camera Status</div>
        <div>Status: {animationState.isActive ? 'ROLLING' : 'STANDBY'}</div>
        <div>Movement: {animationState.movement || 'None'}</div>
        <div>Progress: {(animationState.progress * 100).toFixed(1)}%</div>
        <div>Shot #{shotCounterRef.current}</div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="text-athletic-neutral-300 font-medium">Equipment</div>
        <div>Camera: {cameraSettings.equipment}</div>
        <div>Lens: {cameraSettings.lens}</div>
        <div>Style: {cameraSettings.style}</div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="text-athletic-neutral-300 font-medium">Current Shot</div>
        <div>Type: {animationState.photographyMetadata.shotType}</div>
        <div>Angle: {animationState.photographyMetadata.cameraAngle}</div>
        <div>Composition: {animationState.photographyMetadata.frameComposition}</div>
        <div>Focus: {animationState.photographyMetadata.focusPoint}</div>
      </div>

      <div className="space-y-1">
        <div className="text-athletic-neutral-300 font-medium">Performance</div>
        <div>FPS: {performanceMetrics.canvasRenderFPS.toFixed(1)}</div>
        <div>Frame Time: {performanceMetrics.averageMovementTime.toFixed(1)}ms</div>
        <div>GPU: {performanceMetrics.gpuUtilization}%</div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-600 text-[10px] text-gray-400">
        Professional Camera System v2.0
      </div>
    </div>
  ) : null;

  return (
    <>
      {enhancedDebugInfo}
    </>
  );
});

// Set display name
EnhancedCameraController.displayName = 'EnhancedCameraController';

export default EnhancedCameraController;