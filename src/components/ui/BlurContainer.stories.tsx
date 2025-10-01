import type { Meta, StoryObj } from '@storybook/react';
import BlurContainer from './BlurContainer';

const meta = {
  title: 'UI/BlurContainer',
  component: BlurContainer,
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
    children: {
    },
    focusCenter: {
    },
    focusRadius: {
      control: { type: 'number' },
    },
    maxBlurIntensity: {
      control: { type: 'number' },
    },
    isActive: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
    heroMode: {
      control: 'boolean',
    },
    heroFocusAnimation: {
    },
  },
} satisfies Meta<typeof BlurContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: undefined,
  },
};


export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const HeroMode: Story = {
  args: {
    heroMode: true,
  },
};