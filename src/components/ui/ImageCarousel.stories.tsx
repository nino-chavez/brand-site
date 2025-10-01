import type { Meta, StoryObj } from '@storybook/react';
import ImageCarousel from './ImageCarousel';

const meta = {
  title: 'UI/ImageCarousel',
  component: ImageCarousel,
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
    images: {
    },
    autoPlayInterval: {
      control: { type: 'number' },
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof ImageCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    images: [],
  },
};

