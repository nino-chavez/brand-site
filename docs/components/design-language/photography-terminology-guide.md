# Photography Terminology Usage Guide for UI Elements

## Overview

This guide establishes consistent photography terminology for UI elements within the LightboxCanvas system. The terminology maintains the camera metaphor while ensuring accessibility and user comprehension across different skill levels with photography.

## Core Photography Terms Mapping

### Navigation and Movement

| UI Element | Photography Term | User-Facing Label | ARIA Description | Tooltip/Help Text |
|------------|------------------|-------------------|------------------|-------------------|
| Left Navigation | Camera Pan Left | "Pan Left" | "Pan camera left to view previous content" | "Move the camera view leftward like panning on a tripod" |
| Right Navigation | Camera Pan Right | "Pan Right" | "Pan camera right to view next content" | "Move the camera view rightward like panning on a tripod" |
| Up Navigation | Camera Tilt Up | "Tilt Up" | "Tilt camera up to view content above" | "Angle the camera upward to see content above" |
| Down Navigation | Camera Tilt Down | "Tilt Down" | "Tilt camera down to view content below" | "Angle the camera downward to see content below" |
| Zoom In | Telephoto / Zoom In | "Zoom In" | "Zoom in for a closer view" | "Use telephoto effect to magnify and focus on details" |
| Zoom Out | Wide Angle / Zoom Out | "Zoom Out" | "Zoom out for a wider view" | "Use wide-angle view to see more of the scene" |

### Focus and Selection

| UI Element | Photography Term | User-Facing Label | ARIA Description | Tooltip/Help Text |
|------------|------------------|-------------------|------------------|-------------------|
| Focus Element | Pull Focus | "Focus" | "Focus on selected item" | "Shift focus to this element like pulling focus on a lens" |
| Select Item | Take Shot | "Capture" | "Select and capture this item" | "Capture this moment by selecting it" |
| Preview Mode | Viewfinder Preview | "Preview" | "Preview item in viewfinder" | "View through the camera's viewfinder before capturing" |
| Full View | Developed Photo | "View Full" | "View full resolution image" | "See the fully developed photograph" |

### Interface Controls

| UI Element | Photography Term | User-Facing Label | ARIA Description | Tooltip/Help Text |
|------------|------------------|-------------------|------------------|-------------------|
| Settings Panel | Camera Controls | "Camera Settings" | "Open camera control panel" | "Adjust camera settings like aperture, ISO, and exposure" |
| Search | Light Meter | "Search" | "Search content using light meter" | "Find content like using a light meter to locate the perfect shot" |
| Filter Options | Lens Filters | "Filters" | "Apply content filters" | "Apply filters like using different lens filters for effects" |
| Sort Options | Contact Sheet | "Arrange" | "Arrange content layout" | "Organize content like arranging photos on a contact sheet" |

## Terminology Implementation

### 1. Button Labels and Microcopy

```typescript
const PhotographyTerminology = {
  // Primary actions
  navigation: {
    panLeft: 'Pan Left',
    panRight: 'Pan Right',
    tiltUp: 'Tilt Up',
    tiltDown: 'Tilt Down',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out'
  },

  // Focus and selection
  interaction: {
    focus: 'Focus',
    capture: 'Capture',
    preview: 'Preview',
    develop: 'View Full',
    compose: 'Compose Shot'
  },

  // Interface controls
  controls: {
    settings: 'Camera Settings',
    search: 'Light Meter',
    filters: 'Lens Filters',
    arrange: 'Contact Sheet',
    exposure: 'Exposure Settings'
  },

  // Status and feedback
  status: {
    inFocus: 'In Focus',
    outOfFocus: 'Out of Focus',
    exposing: 'Exposing...',
    developing: 'Developing...',
    captured: 'Captured',
    metering: 'Metering Light...'
  }
} as const;

// Usage in components
class CameraButton {
  render(action: keyof typeof PhotographyTerminology.navigation) {
    const label = PhotographyTerminology.navigation[action];
    const ariaDescription = this.getAriaDescription(action);

    return `
      <button
        class="camera-button"
        aria-label="${ariaDescription}"
        title="${this.getTooltip(action)}"
      >
        <span class="button-text">${label}</span>
        <span class="camera-icon icon-${action}"></span>
      </button>
    `;
  }

  private getAriaDescription(action: string): string {
    const descriptions = {
      panLeft: 'Pan camera left to view previous content',
      panRight: 'Pan camera right to view next content',
      tiltUp: 'Tilt camera up to view content above',
      tiltDown: 'Tilt camera down to view content below',
      zoomIn: 'Zoom in for a closer view',
      zoomOut: 'Zoom out for a wider view'
    };

    return descriptions[action as keyof typeof descriptions] || action;
  }

  private getTooltip(action: string): string {
    const tooltips = {
      panLeft: 'Move the camera view leftward like panning on a tripod',
      panRight: 'Move the camera view rightward like panning on a tripod',
      tiltUp: 'Angle the camera upward to see content above',
      tiltDown: 'Angle the camera downward to see content below',
      zoomIn: 'Use telephoto effect to magnify and focus on details',
      zoomOut: 'Use wide-angle view to see more of the scene'
    };

    return tooltips[action as keyof typeof tooltips] || action;
  }
}
```

### 2. Status Messages and Feedback

```typescript
class CameraStatusMessaging {
  static getStatusMessage(state: CameraState): StatusMessage {
    const messages = {
      idle: {
        primary: 'Camera Ready',
        secondary: 'Ready to capture your next shot',
        accessibility: 'Camera is ready for operation'
      },
      focusing: {
        primary: 'Pulling Focus...',
        secondary: 'Adjusting focus for optimal clarity',
        accessibility: 'Camera is focusing on selected content'
      },
      capturing: {
        primary: 'Capturing...',
        secondary: 'Taking the shot',
        accessibility: 'Capturing selected content'
      },
      developing: {
        primary: 'Developing...',
        secondary: 'Processing your captured image',
        accessibility: 'Processing captured content'
      },
      exposed: {
        primary: 'Shot Captured',
        secondary: 'Successfully captured and ready to develop',
        accessibility: 'Content successfully captured'
      },
      metering: {
        primary: 'Metering Light...',
        secondary: 'Analyzing scene for optimal exposure',
        accessibility: 'Analyzing content for optimal display'
      }
    };

    return messages[state];
  }

  static getErrorMessage(error: CameraError): ErrorMessage {
    const errorMessages = {
      outOfRange: {
        primary: 'Out of Range',
        secondary: 'Move closer to your subject',
        accessibility: 'Selected content is out of camera range',
        suggestion: 'Try zooming in or moving to a different position'
      },
      poorLighting: {
        primary: 'Insufficient Light',
        secondary: 'Scene is too dark for optimal capture',
        accessibility: 'Content visibility is poor',
        suggestion: 'Try adjusting your display brightness or contrast'
      },
      focusError: {
        primary: 'Focus Error',
        secondary: 'Unable to achieve sharp focus',
        accessibility: 'Unable to focus on selected content',
        suggestion: 'Try selecting a different element or refreshing the view'
      }
    };

    return errorMessages[error];
  }
}

interface StatusMessage {
  primary: string;
  secondary: string;
  accessibility: string;
}

interface ErrorMessage extends StatusMessage {
  suggestion: string;
}

type CameraState = 'idle' | 'focusing' | 'capturing' | 'developing' | 'exposed' | 'metering';
type CameraError = 'outOfRange' | 'poorLighting' | 'focusError';
```

### 3. Help Text and Documentation

```typescript
class CameraHelpSystem {
  static getHelpContent(topic: HelpTopic): HelpContent {
    const helpContent = {
      panning: {
        title: 'Camera Panning',
        description: 'Move your view horizontally across the content',
        instructions: [
          'Use arrow keys or swipe left/right to pan',
          'Panning is like rotating a camera on a tripod',
          'Smooth panning maintains your current viewing height'
        ],
        tips: [
          'Hold Shift while panning for faster movement',
          'Double-click to center on specific content'
        ],
        accessibility: 'Use Tab and arrow keys for keyboard navigation'
      },

      focusing: {
        title: 'Focus Control',
        description: 'Bring specific content into sharp focus',
        instructions: [
          'Click or tap content to focus on it',
          'Use Enter key to focus when navigating with keyboard',
          'Focus creates depth by blurring other elements'
        ],
        tips: [
          'Focused elements appear sharper and more prominent',
          'Focus automatically adjusts lighting and contrast'
        ],
        accessibility: 'Screen readers announce focus changes'
      },

      composition: {
        title: 'Shot Composition',
        description: 'Arrange and frame your view like a photographer',
        instructions: [
          'Use zoom to adjust your focal length',
          'Pan and tilt to frame your subject',
          'Focus to create depth and emphasis'
        ],
        tips: [
          'Wide shots show context and relationships',
          'Close-ups reveal details and emotions',
          'Off-center subjects create dynamic compositions'
        ],
        accessibility: 'All composition tools work with keyboard and screen readers'
      }
    };

    return helpContent[topic];
  }

  static generateContextualHelp(currentState: CameraState): string[] {
    const contextualHelp = {
      idle: [
        'Use arrow keys or mouse to pan around the scene',
        'Click on any element to focus on it',
        'Use + and - keys to zoom in and out'
      ],
      focusing: [
        'Wait for focus to complete for the sharpest view',
        'Press Escape to cancel focusing'
      ],
      capturing: [
        'Content is being captured - please wait',
        'Captured content will be available in your collection'
      ]
    };

    return contextualHelp[currentState] || [];
  }
}

interface HelpContent {
  title: string;
  description: string;
  instructions: string[];
  tips: string[];
  accessibility: string;
}

type HelpTopic = 'panning' | 'focusing' | 'composition';
```

## Accessibility-First Terminology

### 1. Screen Reader Announcements

```typescript
class CameraAccessibilityAnnouncer {
  private liveRegion: HTMLElement;

  constructor() {
    this.createLiveRegion();
  }

  announceAction(action: CameraAction, context?: string) {
    const announcements = {
      panLeft: 'Camera panning left',
      panRight: 'Camera panning right',
      tiltUp: 'Camera tilting up',
      tiltDown: 'Camera tilting down',
      zoomIn: 'Zooming in for closer view',
      zoomOut: 'Zooming out for wider view',
      focus: 'Focus shifting to selected content',
      capture: 'Content captured successfully'
    };

    let message = announcements[action];

    if (context) {
      message += `. ${context}`;
    }

    this.announce(message);
  }

  announceState(state: CameraState, details?: string) {
    const stateAnnouncements = {
      idle: 'Camera ready for operation',
      focusing: 'Camera focusing on content',
      capturing: 'Capturing content',
      developing: 'Processing captured content',
      exposed: 'Content successfully captured',
      metering: 'Analyzing scene lighting'
    };

    let message = stateAnnouncements[state];

    if (details) {
      message += `. ${details}`;
    }

    this.announce(message);
  }

  private announce(message: string) {
    this.liveRegion.textContent = message;

    // Clear after announcement to allow for repeated messages
    setTimeout(() => {
      this.liveRegion.textContent = '';
    }, 1000);
  }

  private createLiveRegion() {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only camera-announcer';
    document.body.appendChild(this.liveRegion);
  }
}

type CameraAction = 'panLeft' | 'panRight' | 'tiltUp' | 'tiltDown' | 'zoomIn' | 'zoomOut' | 'focus' | 'capture';
```

### 2. Alternative Terminology for Non-Photographers

```typescript
class AdaptiveTerminology {
  private userPreference: TerminologyLevel = 'balanced';

  setTerminologyLevel(level: TerminologyLevel) {
    this.userPreference = level;
    this.updateInterface();
  }

  getTerminology(key: string): TerminologyVariant {
    const terminologyMap = {
      panLeft: {
        photography: 'Pan Left',
        balanced: 'Move Left',
        simple: 'Previous'
      },
      panRight: {
        photography: 'Pan Right',
        balanced: 'Move Right',
        simple: 'Next'
      },
      zoomIn: {
        photography: 'Zoom In',
        balanced: 'Get Closer',
        simple: 'Bigger'
      },
      zoomOut: {
        photography: 'Zoom Out',
        balanced: 'Step Back',
        simple: 'Smaller'
      },
      focus: {
        photography: 'Pull Focus',
        balanced: 'Focus',
        simple: 'Select'
      },
      capture: {
        photography: 'Capture Shot',
        balanced: 'Save Item',
        simple: 'Save'
      }
    };

    const variants = terminologyMap[key as keyof typeof terminologyMap];
    return variants ? variants[this.userPreference] : key;
  }

  private updateInterface() {
    // Update all interface elements with new terminology
    document.querySelectorAll('[data-terminology]').forEach(element => {
      const key = element.getAttribute('data-terminology');
      if (key) {
        element.textContent = this.getTerminology(key);
      }
    });
  }
}

type TerminologyLevel = 'photography' | 'balanced' | 'simple';

interface TerminologyVariant {
  photography: string;
  balanced: string;
  simple: string;
}
```

## Localization Considerations

### 1. Photography Terms by Locale

```typescript
const LocalizedTerminology = {
  'en-US': {
    pan: 'Pan',
    tilt: 'Tilt',
    zoom: 'Zoom',
    focus: 'Focus',
    capture: 'Capture',
    develop: 'Develop',
    expose: 'Expose'
  },
  'es-ES': {
    pan: 'Panorámica',
    tilt: 'Inclinar',
    zoom: 'Zoom',
    focus: 'Enfocar',
    capture: 'Capturar',
    develop: 'Revelar',
    expose: 'Exponer'
  },
  'fr-FR': {
    pan: 'Panoramique',
    tilt: 'Incliner',
    zoom: 'Zoom',
    focus: 'Mise au point',
    capture: 'Capturer',
    develop: 'Développer',
    expose: 'Exposer'
  },
  'de-DE': {
    pan: 'Schwenken',
    tilt: 'Neigen',
    zoom: 'Zoom',
    focus: 'Fokus',
    capture: 'Aufnahme',
    develop: 'Entwickeln',
    expose: 'Belichten'
  }
};

class LocalizedCameraTerminology {
  private locale: string = 'en-US';

  setLocale(locale: string) {
    this.locale = locale;
  }

  getTerm(key: string): string {
    const terms = LocalizedTerminology[this.locale as keyof typeof LocalizedTerminology];
    return terms?.[key as keyof typeof terms] || key;
  }

  getLocalizedAria(action: string): string {
    const ariaDescriptions = {
      'en-US': {
        panLeft: 'Pan camera left to view previous content',
        focus: 'Focus on selected item for detailed view'
      },
      'es-ES': {
        panLeft: 'Panorámica de la cámara hacia la izquierda para ver contenido anterior',
        focus: 'Enfocar el elemento seleccionado para vista detallada'
      }
      // Additional locales...
    };

    const descriptions = ariaDescriptions[this.locale as keyof typeof ariaDescriptions];
    return descriptions?.[action as keyof typeof descriptions] || action;
  }
}
```

## Implementation Guidelines

### 1. Developer Usage

```typescript
// Use terminology constants instead of hardcoded strings
import { PhotographyTerminology } from './photography-terminology';

// ✅ Correct usage
const buttonLabel = PhotographyTerminology.navigation.panLeft;

// ❌ Avoid hardcoded strings
const buttonLabel = 'Pan Left';

// ✅ Use accessibility helpers
const announcer = new CameraAccessibilityAnnouncer();
announcer.announceAction('panLeft', 'Moving to previous photo in gallery');

// ✅ Provide fallback terminology
const adaptiveTerms = new AdaptiveTerminology();
adaptiveTerms.setTerminologyLevel('balanced'); // For general users
```

### 2. Content Guidelines

```markdown
## Photography Terminology Best Practices

### Do:
- Use consistent terminology across all UI elements
- Provide tooltips that explain photography metaphors
- Offer alternative terminology for non-photographers
- Include context in announcements ("panning left to previous photo")

### Don't:
- Mix photography terms with generic UI language inconsistently
- Use overly technical photography jargon without explanation
- Assume all users understand camera operation
- Forget to provide accessible alternatives

### Testing Checklist:
- [ ] All buttons have consistent photography terminology
- [ ] ARIA labels explain camera metaphors clearly
- [ ] Screen readers announce actions in photography terms
- [ ] Tooltips provide helpful context for non-photographers
- [ ] Alternative terminology is available for different user levels
```

This photography terminology guide ensures consistent, accessible, and user-friendly language throughout the LightboxCanvas interface while maintaining the immersive camera metaphor.