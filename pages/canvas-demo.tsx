/**
 * Canvas Demo Page
 *
 * Demonstrates the new 2D Canvas Layout System with spatial navigation,
 * cinematic camera movements, and enhanced CursorLens integration.
 */

import React, { useState } from 'react';
import { LightboxCanvas } from '../components/LightboxCanvas';
import { SpatialSection } from '../components/SpatialSection';
import { CameraController } from '../components/CameraController';
import { CursorLens } from '../components/CursorLens';
import { UnifiedGameFlowProvider } from '../contexts/UnifiedGameFlowContext';
import type { CanvasPosition, PhotoWorkflowSection } from '../types/canvas';

// Demo content for each section
const sectionContent = {
  capture: {
    title: "Capture",
    content: "Introduction and readiness - the foundation of every great shot."
  },
  focus: {
    title: "Focus",
    content: "Attention to detail - precision in execution and technique."
  },
  frame: {
    title: "Frame",
    content: "Composition and planning - strategic positioning and timing."
  },
  exposure: {
    title: "Exposure",
    content: "Technical execution - mastering light, aperture, and timing."
  },
  develop: {
    title: "Develop",
    content: "Process and refinement - transforming captures into art."
  },
  portfolio: {
    title: "Portfolio",
    content: "Results and showcase - presenting finished work professionally."
  }
};

export default function CanvasDemo() {
  const [currentPosition, setCurrentPosition] = useState<CanvasPosition>({
    x: 0, y: 0, scale: 1.0
  });

  const handleCanvasPositionChange = (position: CanvasPosition) => {
    console.log('Canvas navigation to:', position);
    setCurrentPosition(position);
  };

  const handleSectionSelect = (section: PhotoWorkflowSection) => {
    console.log('Section selected:', section);
  };

  return (
    <UnifiedGameFlowProvider debugMode={true}>
      <div className="relative w-full h-screen bg-black overflow-hidden">

        {/* Canvas-enabled CursorLens */}
        <CursorLens
          isEnabled={true}
          canvasMode={true}
          onCanvasPositionChange={handleCanvasPositionChange}
          onSectionSelect={handleSectionSelect}
        />

        {/* Camera Controller for cinematic movements */}
        <CameraController
          canvasState={{
            currentPosition,
            targetPosition: null,
            activeSection: 'capture',
            isAnimating: false
          }}
          onMovementExecute={async (movement, config) => {
            console.log('Camera movement:', movement, config);
          }}
          onMovementComplete={(movement) => {
            console.log('Movement complete:', movement);
          }}
        />

        {/* 2D Canvas Container */}
        <LightboxCanvas
          sections={Object.keys(sectionContent) as PhotoWorkflowSection[]}
          currentPosition={currentPosition}
          onPositionChange={setCurrentPosition}
        >
          {/* Spatially positioned sections */}
          {Object.entries(sectionContent).map(([section, content]) => (
            <SpatialSection
              key={section}
              section={section as PhotoWorkflowSection}
              sectionMap={{
                section: section as PhotoWorkflowSection,
                coordinates: { gridX: 0, gridY: 0 }, // LightboxCanvas will calculate
                canvasPosition: { x: 0, y: 0, scale: 1.0 }, // LightboxCanvas will calculate
                metadata: {
                  title: content.title,
                  description: content.content,
                  cameraMetaphor: section === 'capture' ? 'Introduction' :
                                 section === 'focus' ? 'Detail Work' :
                                 section === 'frame' ? 'Composition' :
                                 section === 'exposure' ? 'Execution' :
                                 section === 'develop' ? 'Refinement' : 'Showcase',
                  priority: Object.keys(sectionContent).indexOf(section) + 1
                }
              }}
              isActive={false}
              scale={1.0}
              className="border border-gray-300"
            >
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-4 text-orange-400">{content.title}</h2>
                <p className="text-gray-300">{content.content}</p>

                {/* Demo controls */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="text-gray-400">Canvas Features:</div>
                  <div className="text-green-400">• Spatial positioning ✓</div>
                  <div className="text-green-400">• CursorLens integration ✓</div>
                  <div className="text-green-400">• Camera movements ✓</div>
                </div>
              </div>
            </SpatialSection>
          ))}
        </LightboxCanvas>

        {/* Demo instructions overlay */}
        <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg max-w-md">
          <h3 className="text-lg font-bold text-orange-400 mb-2">Canvas Demo</h3>
          <div className="text-sm space-y-1">
            <div>• <strong>Hover + Hold:</strong> Activate CursorLens</div>
            <div>• <strong>Click sections:</strong> Navigate in 2D space</div>
            <div>• <strong>Camera movements:</strong> Cinematic transitions</div>
            <div>• <strong>Spatial layout:</strong> 6 sections in 2D grid</div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Position: ({currentPosition.x}, {currentPosition.y}) Scale: {currentPosition.scale}
          </div>
        </div>
      </div>
    </UnifiedGameFlowProvider>
  );
}