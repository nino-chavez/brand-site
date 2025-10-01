import type { Meta, StoryObj } from '@storybook/react';
import ShutterEffect from './ShutterEffect';

const meta = {
  title: 'Effects/ShutterEffect',
  component: ShutterEffect,
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
    isTriggered: {
      control: 'boolean',
    },
    onComplete: {
    },
    flashDuration: {
      control: { type: 'number' },
    },
    shakeDuration: {
      control: { type: 'number' },
    },
    enableSound: {
      control: 'boolean',
    },
    soundVolume: {
      control: { type: 'number' },
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof ShutterEffect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};


export const Triggered: Story = {
  args: {
    isTriggered: true,
  },
};

export const EnableSound: Story = {
  args: {
    enableSound: true,
  },
};