import type { Meta, StoryObj } from '@storybook/react';
import ReelSection from './ReelSection';

const meta = {
  title: 'Layout/ReelSection',
  component: ReelSection,
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
    setRef: {
    },
  },
} satisfies Meta<typeof ReelSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    setRef: () => console.log('setRef'),
  },
};

