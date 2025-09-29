# Photography-Inspired Accessibility Announcements

## Overview

This guide establishes comprehensive patterns for accessibility announcements that maintain the photography metaphor while ensuring clear, helpful communication for screen reader users. The announcements progressively disclose photography concepts and provide context for camera-inspired interactions.

## Core Announcement Principles

### 1. Clarity First, Metaphor Second

All announcements prioritize functional clarity over metaphorical consistency, with photography terms used to enhance rather than obscure meaning.

```typescript
class PhotographyAccessibilityAnnouncer {
  private liveRegion: HTMLElement;
  private userPreferences: AccessibilityPreferences;
  private announcementQueue: AnnouncementItem[] = [];

  constructor(preferences: AccessibilityPreferences = {}) {
    this.userPreferences = {
      verbosity: 'balanced',
      photographyTerms: true,
      contextualHelp: true,
      ...preferences
    };

    this.createLiveRegion();
    this.setupAnnouncementQueue();
  }

  // Core navigation announcements
  announceNavigation(action: NavigationAction, context: NavigationContext): void {
    const announcement = this.buildNavigationAnnouncement(action, context);
    this.announce(announcement, 'polite');
  }

  private buildNavigationAnnouncement(action: NavigationAction, context: NavigationContext): string {
    const { direction, distance, targetType, targetDescription } = context;

    // Base announcement with photography metaphor
    let message = this.getActionDescription(action, direction);

    // Add distance/scope information
    if (distance) {
      message += ` ${this.getDistanceDescription(distance)}`;
    }

    // Add target information
    if (targetType && targetDescription) {
      message += ` to ${this.getTargetDescription(targetType, targetDescription)}`;
    }

    // Add contextual help for first-time users
    if (this.userPreferences.contextualHelp && this.isFirstTimeAction(action)) {
      message += `. ${this.getContextualHelp(action)}`;
    }

    return message;
  }

  private getActionDescription(action: NavigationAction, direction: string): string {
    const descriptions = {
      pan: {
        left: 'Camera panning left',
        right: 'Camera panning right',
        up: 'Camera panning up',
        down: 'Camera panning down'
      },
      tilt: {
        up: 'Camera tilting upward',
        down: 'Camera tilting downward'
      },
      zoom: {
        in: 'Zooming in for a closer view',
        out: 'Zooming out for a wider perspective'
      },
      focus: {
        pull: 'Shifting camera focus',
        rack: 'Pulling focus to new subject'
      },
      dolly: {
        in: 'Camera moving closer to subject',
        out: 'Camera backing away from subject'
      }
    };

    const actionDescriptions = descriptions[action];
    return actionDescriptions?.[direction as keyof typeof actionDescriptions] ||
           `Camera ${action} ${direction}`;
  }

  private getDistanceDescription(distance: 'near' | 'medium' | 'far'): string {
    const distances = {
      near: 'slightly',
      medium: 'moderately',
      far: 'significantly'
    };

    return distances[distance];
  }

  private getTargetDescription(type: string, description: string): string {
    const typeDescriptions = {
      image: 'photograph',
      gallery: 'photo collection',
      thumbnail: 'preview image',
      detail: 'detailed view',
      navigation: 'navigation control'
    };

    const typeLabel = typeDescriptions[type as keyof typeof typeDescriptions] || type;
    return `${typeLabel}: ${description}`;
  }

  private getContextualHelp(action: NavigationAction): string {
    const helpText = {
      pan: 'Panning moves your view horizontally across the scene like turning your head',
      tilt: 'Tilting adjusts your vertical viewing angle like looking up or down',
      zoom: 'Zooming changes how close or far away things appear',
      focus: 'Focus brings specific elements into sharp detail while softening others',
      dolly: 'Dolly movements simulate physically moving the camera position'
    };

    return helpText[action] || '';
  }
}
```

### 2. Progressive Disclosure System

```typescript
class ProgressivePhotographyExplanation {
  private userKnowledge: PhotographyKnowledgeLevel = 'beginner';
  private explainedConcepts: Set<string> = new Set();

  announceWithProgression(concept: PhotographyConcept, context: string): string {
    const baseAnnouncement = this.getBaseAnnouncement(concept, context);

    if (this.shouldExplainConcept(concept)) {
      const explanation = this.getConceptExplanation(concept);
      this.explainedConcepts.add(concept);
      return `${baseAnnouncement}. ${explanation}`;
    }

    return baseAnnouncement;
  }

  private shouldExplainConcept(concept: PhotographyConcept): boolean {
    return !this.explainedConcepts.has(concept) &&
           this.userKnowledge !== 'expert';
  }

  private getConceptExplanation(concept: PhotographyConcept): string {
    const explanations = {
      'depth-of-field': 'Depth of field controls what appears sharp or blurred in the image',
      'focal-length': 'Focal length determines how much of the scene is visible and how close objects appear',
      'aperture': 'Aperture controls how much light enters the camera and affects focus depth',
      'composition': 'Composition refers to how elements are arranged within the frame',
      'exposure': 'Exposure determines how bright or dark the image appears',
      'white-balance': 'White balance adjusts colors to appear natural under different lighting',
      'iso-sensitivity': 'ISO sensitivity controls how responsive the camera is to light'
    };

    return explanations[concept] || 'This is a photography technique that affects image appearance';
  }

  setUserKnowledgeLevel(level: PhotographyKnowledgeLevel): void {
    this.userKnowledge = level;

    // Adjust explanation frequency based on knowledge
    if (level === 'expert') {
      this.explainedConcepts.clear();
    }
  }

  private getBaseAnnouncement(concept: PhotographyConcept, context: string): string {
    const announcements = {
      'depth-of-field': `Adjusting depth of field ${context}`,
      'focal-length': `Changing focal length ${context}`,
      'aperture': `Setting aperture ${context}`,
      'composition': `Recomposing shot ${context}`,
      'exposure': `Adjusting exposure ${context}`,
      'white-balance': `Correcting white balance ${context}`,
      'iso-sensitivity': `Changing ISO sensitivity ${context}`
    };

    return announcements[concept] || `Adjusting ${concept} ${context}`;
  }
}

type PhotographyConcept = 'depth-of-field' | 'focal-length' | 'aperture' | 'composition' |
                         'exposure' | 'white-balance' | 'iso-sensitivity';
type PhotographyKnowledgeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
```

### 3. Dynamic Status Announcements

```typescript
class CameraStatusAnnouncer {
  private currentStatus: CameraStatus = 'idle';
  private statusHistory: CameraStatus[] = [];

  announceStatusChange(newStatus: CameraStatus, details?: StatusDetails): void {
    const announcement = this.buildStatusAnnouncement(newStatus, details);

    // Use appropriate politeness level based on urgency
    const politeness = this.getStatusPoliteness(newStatus);
    this.announce(announcement, politeness);

    this.updateStatusHistory(newStatus);
  }

  private buildStatusAnnouncement(status: CameraStatus, details?: StatusDetails): string {
    const baseAnnouncement = this.getStatusDescription(status);

    if (details) {
      const additionalInfo = this.getStatusDetails(status, details);
      return `${baseAnnouncement}. ${additionalInfo}`;
    }

    return baseAnnouncement;
  }

  private getStatusDescription(status: CameraStatus): string {
    const descriptions = {
      idle: 'Camera ready for operation',
      focusing: 'Camera focusing on subject',
      capturing: 'Taking photograph',
      processing: 'Processing captured image',
      reviewing: 'Reviewing captured photograph',
      adjusting: 'Adjusting camera settings',
      metering: 'Measuring scene lighting',
      stabilizing: 'Stabilizing camera position',
      error: 'Camera encountered an issue'
    };

    return descriptions[status] || 'Camera status updated';
  }

  private getStatusDetails(status: CameraStatus, details: StatusDetails): string {
    switch (status) {
      case 'focusing':
        return `Focus point: ${details.target || 'center frame'}. ${details.progress ? `${details.progress}% complete` : ''}`;

      case 'capturing':
        return `Shutter speed: ${details.shutterSpeed || 'automatic'}. ${details.flash ? 'Flash enabled' : 'Available light'}`;

      case 'processing':
        return `Processing ${details.format || 'image'}. ${details.progress ? `${details.progress}% complete` : 'Please wait'}`;

      case 'metering':
        return `Light reading: ${details.lightLevel || 'calculating'}. Suggested ${details.suggestion || 'settings being determined'}`;

      case 'adjusting':
        return `Modifying ${details.setting || 'camera parameters'}. New value: ${details.value || 'updating'}`;

      case 'error':
        return `Error: ${details.error || 'Unknown issue'}. ${details.suggestion || 'Please try again'}`;

      default:
        return details.message || '';
    }
  }

  private getStatusPoliteness(status: CameraStatus): 'polite' | 'assertive' {
    const urgentStatuses: CameraStatus[] = ['error', 'capturing'];
    return urgentStatuses.includes(status) ? 'assertive' : 'polite';
  }

  private updateStatusHistory(status: CameraStatus): void {
    this.statusHistory.push(this.currentStatus);
    this.currentStatus = status;

    // Keep only last 5 statuses
    if (this.statusHistory.length > 5) {
      this.statusHistory.shift();
    }
  }
}

type CameraStatus = 'idle' | 'focusing' | 'capturing' | 'processing' | 'reviewing' |
                   'adjusting' | 'metering' | 'stabilizing' | 'error';

interface StatusDetails {
  target?: string;
  progress?: number;
  shutterSpeed?: string;
  flash?: boolean;
  format?: string;
  lightLevel?: string;
  suggestion?: string;
  setting?: string;
  value?: string;
  error?: string;
  message?: string;
}
```

### 4. Error Messages with Photography Context

```typescript
class PhotographyErrorAnnouncer {
  announceError(error: CameraError, context: ErrorContext): void {
    const announcement = this.buildErrorAnnouncement(error, context);
    this.announce(announcement, 'assertive');
  }

  private buildErrorAnnouncement(error: CameraError, context: ErrorContext): string {
    const errorDescription = this.getErrorDescription(error);
    const photographyContext = this.getPhotographyContext(error, context);
    const solution = this.getSolution(error, context);

    return `${errorDescription}. ${photographyContext}. ${solution}`;
  }

  private getErrorDescription(error: CameraError): string {
    const descriptions = {
      'out-of-focus': 'Unable to achieve sharp focus',
      'low-light': 'Insufficient lighting for optimal capture',
      'overexposed': 'Scene is too bright for current settings',
      'underexposed': 'Scene is too dark for current settings',
      'motion-blur': 'Subject movement detected during capture',
      'out-of-range': 'Subject is outside camera range',
      'lens-obstruction': 'Lens view is blocked',
      'memory-full': 'Camera memory is full',
      'battery-low': 'Camera battery is low'
    };

    return descriptions[error] || 'Camera error occurred';
  }

  private getPhotographyContext(error: CameraError, context: ErrorContext): string {
    const contexts = {
      'out-of-focus': 'The autofocus system cannot lock onto the selected subject',
      'low-light': 'Current ISO and aperture settings are insufficient for available light',
      'overexposed': 'Too much light is reaching the sensor, causing blown highlights',
      'underexposed': 'Not enough light is reaching the sensor, resulting in dark shadows',
      'motion-blur': 'Shutter speed is too slow for moving subjects',
      'out-of-range': 'Subject distance exceeds the lens focal range',
      'lens-obstruction': 'Something is blocking the camera view',
      'memory-full': 'No space available to store additional photographs',
      'battery-low': 'Insufficient power to continue camera operation'
    };

    return contexts[error] || 'This affects camera operation';
  }

  private getSolution(error: CameraError, context: ErrorContext): string {
    const solutions = {
      'out-of-focus': 'Try selecting a different focus point or switching to manual focus',
      'low-light': 'Increase ISO sensitivity, open aperture wider, or use flash',
      'overexposed': 'Reduce ISO, close aperture, or increase shutter speed',
      'underexposed': 'Increase ISO, open aperture, or decrease shutter speed',
      'motion-blur': 'Use faster shutter speed or activate image stabilization',
      'out-of-range': 'Move closer to subject or use different focal length',
      'lens-obstruction': 'Clear any obstructions from the camera view',
      'memory-full': 'Delete unnecessary images or insert new memory card',
      'battery-low': 'Replace or recharge camera battery'
    };

    return solutions[error] || 'Please check camera settings and try again';
  }
}

type CameraError = 'out-of-focus' | 'low-light' | 'overexposed' | 'underexposed' |
                  'motion-blur' | 'out-of-range' | 'lens-obstruction' |
                  'memory-full' | 'battery-low';

interface ErrorContext {
  currentSettings?: CameraSettings;
  environment?: EnvironmentData;
  userAction?: string;
}
```

### 5. Interactive Help and Guidance

```typescript
class PhotographyHelpAnnouncer {
  private helpMode: HelpMode = 'contextual';
  private currentContext: string = '';

  announceHelp(topic: HelpTopic, triggerType: HelpTriggerType = 'manual'): void {
    const helpContent = this.buildHelpContent(topic, triggerType);
    this.announce(helpContent, 'polite');
  }

  private buildHelpContent(topic: HelpTopic, triggerType: HelpTriggerType): string {
    const content = this.getHelpContent(topic);

    if (triggerType === 'contextual') {
      return `Help: ${content.brief}. ${content.context}`;
    } else {
      return `${content.title}. ${content.detailed}. ${content.example}`;
    }
  }

  private getHelpContent(topic: HelpTopic): HelpContent {
    const helpDatabase = {
      panning: {
        title: 'Camera Panning',
        brief: 'Move view horizontally like turning your head',
        detailed: 'Panning rotates the camera horizontally to follow action or reveal scene elements. Use arrow keys or drag to pan smoothly',
        context: 'Useful for exploring wide scenes or following moving subjects',
        example: 'Try pressing the right arrow key to pan toward the next photo'
      },

      focusing: {
        title: 'Focus Control',
        brief: 'Make specific elements sharp and clear',
        detailed: 'Focus determines which part of the scene appears sharp. Click on any element to focus on it, or use Tab to cycle through focusable items',
        context: 'Focus draws attention and creates visual hierarchy',
        example: 'Click on a photo thumbnail to bring it into sharp focus'
      },

      composition: {
        title: 'Shot Composition',
        brief: 'Frame your view like a photographer',
        detailed: 'Composition involves positioning elements within the frame. Use pan, tilt, and zoom to create compelling views of the content',
        context: 'Good composition guides the viewer eye and creates visual interest',
        example: 'Try zooming out to see more photos in the frame, then zoom in on one that interests you'
      },

      exposure: {
        title: 'Exposure Control',
        brief: 'Adjust brightness and contrast of the view',
        detailed: 'Exposure affects how bright or dark the scene appears. Use the exposure controls to optimize visibility',
        context: 'Proper exposure ensures all important details are visible',
        example: 'If photos appear too dark, try increasing the exposure setting'
      },

      navigation: {
        title: 'Camera Navigation',
        brief: 'Move through the gallery like operating a camera',
        detailed: 'Use camera movements - pan left and right, tilt up and down, zoom in and out, and focus on specific items',
        context: 'Camera navigation provides intuitive control over your view',
        example: 'Use arrow keys to pan, plus and minus to zoom, and click to focus'
      }
    };

    return helpDatabase[topic] || {
      title: 'Photography Help',
      brief: 'Camera operation assistance',
      detailed: 'This feature helps you understand camera-style navigation',
      context: 'Photography concepts make navigation more intuitive',
      example: 'Experiment with different controls to learn camera operation'
    };
  }

  announceAvailableHelp(): void {
    const availableTopics = ['panning', 'focusing', 'composition', 'exposure', 'navigation'];
    const announcement = `Photography help available for: ${availableTopics.join(', ')}. Press H for help menu`;
    this.announce(announcement, 'polite');
  }

  announceShortcuts(): void {
    const shortcuts = [
      'Arrow keys: Pan camera view',
      'Plus/Minus: Zoom in and out',
      'Enter: Focus on selected item',
      'Space: Capture current view',
      'Tab: Cycle through focusable elements',
      'H: Open help menu',
      'Escape: Reset camera position'
    ];

    const announcement = `Camera shortcuts: ${shortcuts.join('. ')}`;
    this.announce(announcement, 'polite');
  }
}

type HelpTopic = 'panning' | 'focusing' | 'composition' | 'exposure' | 'navigation';
type HelpTriggerType = 'manual' | 'contextual' | 'automatic';
type HelpMode = 'brief' | 'detailed' | 'contextual';

interface HelpContent {
  title: string;
  brief: string;
  detailed: string;
  context: string;
  example: string;
}
```

### 6. Spatial Position Announcements

```typescript
class SpatialPositionAnnouncer {
  private currentPosition: SpatialPosition = { x: 0, y: 0, z: 0 };
  private gridSize: GridDimensions = { rows: 3, cols: 3 };

  announcePosition(newPosition: SpatialPosition, context?: PositionContext): void {
    const positionDescription = this.buildPositionDescription(newPosition, context);
    this.announce(positionDescription, 'polite');
    this.currentPosition = newPosition;
  }

  private buildPositionDescription(position: SpatialPosition, context?: PositionContext): string {
    const gridPosition = this.calculateGridPosition(position);
    const photographyDescription = this.getPhotographyPositionDescription(position);
    const relativeMovement = this.getRelativeMovement(position);

    let description = `Camera positioned at ${gridPosition}`;

    if (photographyDescription) {
      description += `. ${photographyDescription}`;
    }

    if (relativeMovement) {
      description += `. ${relativeMovement}`;
    }

    if (context?.landmark) {
      description += `. ${context.landmark}`;
    }

    return description;
  }

  private calculateGridPosition(position: SpatialPosition): string {
    const col = Math.floor((position.x + 1) * this.gridSize.cols / 2);
    const row = Math.floor((position.y + 1) * this.gridSize.rows / 2);

    const colName = ['left', 'center', 'right'][Math.min(col, 2)];
    const rowName = ['top', 'middle', 'bottom'][Math.min(row, 2)];

    if (colName === 'center' && rowName === 'middle') {
      return 'center frame';
    }

    return `${rowName} ${colName}`;
  }

  private getPhotographyPositionDescription(position: SpatialPosition): string {
    const descriptions = [];

    // Horizontal composition
    if (position.x < -0.3) {
      descriptions.push('wide left composition');
    } else if (position.x > 0.3) {
      descriptions.push('wide right composition');
    } else {
      descriptions.push('balanced horizontal composition');
    }

    // Vertical composition
    if (position.y < -0.3) {
      descriptions.push('low angle view');
    } else if (position.y > 0.3) {
      descriptions.push('high angle view');
    } else {
      descriptions.push('eye level view');
    }

    // Depth/zoom level
    if (position.z > 0.5) {
      descriptions.push('close-up framing');
    } else if (position.z < -0.5) {
      descriptions.push('wide shot framing');
    } else {
      descriptions.push('medium shot framing');
    }

    return descriptions.join(', ');
  }

  private getRelativeMovement(newPosition: SpatialPosition): string {
    const deltaX = newPosition.x - this.currentPosition.x;
    const deltaY = newPosition.y - this.currentPosition.y;
    const deltaZ = newPosition.z - this.currentPosition.z;

    const movements = [];

    if (Math.abs(deltaX) > 0.1) {
      movements.push(deltaX > 0 ? 'panned right' : 'panned left');
    }

    if (Math.abs(deltaY) > 0.1) {
      movements.push(deltaY > 0 ? 'tilted up' : 'tilted down');
    }

    if (Math.abs(deltaZ) > 0.1) {
      movements.push(deltaZ > 0 ? 'zoomed in' : 'zoomed out');
    }

    return movements.length > 0 ? `Movement: ${movements.join(', ')}` : '';
  }
}

interface SpatialPosition {
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (bottom to top)
  z: number; // -1 to 1 (far to near)
}

interface GridDimensions {
  rows: number;
  cols: number;
}

interface PositionContext {
  landmark?: string;
  contentType?: string;
  totalItems?: number;
  currentIndex?: number;
}
```

## Implementation Guidelines

### 1. Announcement Priority System

```typescript
class AnnouncementPriorityManager {
  private priorities: AnnouncementPriority[] = [
    'critical',    // Errors, warnings
    'important',   // Status changes, completions
    'informative', // Navigation, position updates
    'contextual'   // Help, supplementary information
  ];

  private queue: PriorityAnnouncement[] = [];
  private isAnnouncing: boolean = false;

  queueAnnouncement(
    message: string,
    priority: AnnouncementPriority,
    politeness: 'polite' | 'assertive' = 'polite'
  ): void {
    this.queue.push({ message, priority, politeness, timestamp: Date.now() });
    this.queue.sort((a, b) => this.priorities.indexOf(a.priority) - this.priorities.indexOf(b.priority));

    this.processQueue();
  }

  private processQueue(): void {
    if (this.isAnnouncing || this.queue.length === 0) return;

    const announcement = this.queue.shift()!;
    this.isAnnouncing = true;

    this.announce(announcement.message, announcement.politeness);

    // Allow time for announcement before processing next
    setTimeout(() => {
      this.isAnnouncing = false;
      this.processQueue();
    }, this.getAnnouncementDuration(announcement.message));
  }

  private getAnnouncementDuration(message: string): number {
    // Estimate reading time at 150 words per minute
    const wordCount = message.split(' ').length;
    const estimatedDuration = (wordCount / 150) * 60 * 1000;
    return Math.max(estimatedDuration, 1000); // Minimum 1 second
  }
}

type AnnouncementPriority = 'critical' | 'important' | 'informative' | 'contextual';

interface PriorityAnnouncement {
  message: string;
  priority: AnnouncementPriority;
  politeness: 'polite' | 'assertive';
  timestamp: number;
}
```

This photography-inspired accessibility announcements system ensures that screen reader users receive clear, helpful, and contextually appropriate information while maintaining the immersive camera metaphor throughout their interaction with the spatial navigation system.