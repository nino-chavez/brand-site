import type { Meta, StoryObj } from '@storybook/react';
import ContactSheetGrid from './ContactSheetGrid';

const meta = {
  title: 'Gallery/ContactSheetGrid',
  component: ContactSheetGrid,
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
    categories: {
    },
    onImageClick: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof ContactSheetGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    images: [],
    categories: [],
    onImageClick: () => console.log('onImageClick'),
  },
};

