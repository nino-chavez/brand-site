import type { Meta, StoryObj } from '@storybook/react';
import NavigationControls from './NavigationControls';

const meta = {
  title: 'UI/NavigationControls',
  component: NavigationControls,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'landmark-unique', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentPhase: {
    },
    phaseProgress: {
      control: { type: 'number' },
    },
    isPlaying: {
      control: 'boolean',
    },
    onPhaseChange: {
    },
    onPlayPause: {
    },
    onNextPhase: {
    },
    onPreviousPhase: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof NavigationControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPhase: undefined,
    phaseProgress: 0,
    isPlaying: true,
    onPhaseChange: () => console.log('onPhaseChange'),
    onPlayPause: () => console.log('onPlayPause'),
    onNextPhase: () => console.log('onNextPhase'),
    onPreviousPhase: () => console.log('onPreviousPhase'),
  },
};


export const Playing: Story = {
  args: {
    isPlaying: true,
  },
};