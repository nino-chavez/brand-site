import type { Meta, StoryObj } from '@storybook/react';
import SplitScreenManager from './SplitScreenManager';

const meta = {
  title: 'Sports/SplitScreenManager',
  component: SplitScreenManager,
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
    onMorphingStart: {
    },
    onMorphingComplete: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof SplitScreenManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPhase: undefined,
    phaseProgress: 0,
    isPlaying: true,
  },
};


export const Playing: Story = {
  args: {
    isPlaying: true,
  },
};