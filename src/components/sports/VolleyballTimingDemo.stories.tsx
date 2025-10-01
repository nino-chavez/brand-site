import type { Meta, StoryObj } from '@storybook/react';
import VolleyballTimingDemo from './VolleyballTimingDemo';

const meta = {
  title: 'Sports/VolleyballTimingDemo',
  component: VolleyballTimingDemo,
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
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof VolleyballTimingDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};

