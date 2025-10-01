import type { Meta, StoryObj } from '@storybook/react';
import AboutContentAdapter from './AboutContentAdapter';

const meta = {
  title: 'Content/AboutContentAdapter',
  component: AboutContentAdapter,
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
    canvasPosition: {
    },
    forcedLevel: {
    },
    onInteraction: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof AboutContentAdapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};

