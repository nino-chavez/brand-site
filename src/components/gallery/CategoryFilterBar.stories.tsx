import type { Meta, StoryObj } from '@storybook/react';
import CategoryFilterBar from './CategoryFilterBar';

const meta = {
  title: 'Gallery/CategoryFilterBar',
  component: CategoryFilterBar,
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
    categories: {
    },
    activeCategory: {
    },
    onCategoryChange: {
    },
    enableKeyboardShortcuts: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof CategoryFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    categories: [],
    activeCategory: undefined,
    onCategoryChange: () => console.log('onCategoryChange'),
  },
};


export const EnableKeyboardShortcuts: Story = {
  args: {
    enableKeyboardShortcuts: true,
  },
};