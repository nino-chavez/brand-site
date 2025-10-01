import type { Meta, StoryObj } from '@storybook/react';
import RightViewport from './RightViewport';

const meta = {
  title: 'Sports/RightViewport',
  component: RightViewport,
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
    morphingProgress: {
      control: { type: 'number' },
    },
    onActionPointHover: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof RightViewport>;

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