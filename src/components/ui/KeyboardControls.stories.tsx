import type { Meta, StoryObj } from '@storybook/react';
import KeyboardControls from './KeyboardControls';

const meta = {
  title: 'UI/KeyboardControls',
  component: KeyboardControls,
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
    onToggleViewfinder: {
    },
    onCapture: {
    },
    onFocusAreaChange: {
    },
    onBlurAdjust: {
    },
    onModeChange: {
    },
    children: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof KeyboardControls>;

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