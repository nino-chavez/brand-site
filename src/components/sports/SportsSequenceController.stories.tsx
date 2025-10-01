import type { Meta, StoryObj } from '@storybook/react';
import SportsSequenceController from './SportsSequenceController';

const meta = {
  title: 'Sports/SportsSequenceController',
  component: SportsSequenceController,
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
    leftViewportFrame: {
      control: { type: 'number' },
    },
    rightViewportFrame: {
      control: { type: 'number' },
    },
    onSyncUpdate: {
    },
    onIntensityChange: {
    },
    children: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof SportsSequenceController>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPhase: undefined,
    phaseProgress: 0,
    isPlaying: true,
    leftViewportFrame: 0,
    rightViewportFrame: 0,
  },
};


export const Playing: Story = {
  args: {
    isPlaying: true,
  },
};