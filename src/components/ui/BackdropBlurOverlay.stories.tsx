import type { Meta, StoryObj } from '@storybook/react';
import BackdropBlurOverlay from './BackdropBlurOverlay';

const meta = {
  title: 'UI/BackdropBlurOverlay',
  component: BackdropBlurOverlay,
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
    isActive: {
      control: 'boolean',
    },
    focusRadius: {
      control: { type: 'number' },
    },
    maxBlurIntensity: {
      control: { type: 'number' },
    },
    children: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof BackdropBlurOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};


export const Active: Story = {
  args: {
    isActive: true,
  },
};