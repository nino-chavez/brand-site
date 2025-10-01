import type { Meta, StoryObj } from '@storybook/react';
import LeftViewport from './LeftViewport';

const meta = {
  title: 'Sports/LeftViewport',
  component: LeftViewport,
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
    onReferencePointHover: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof LeftViewport>;

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