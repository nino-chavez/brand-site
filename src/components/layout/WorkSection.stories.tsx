import type { Meta, StoryObj } from '@storybook/react';
import WorkSection from './WorkSection';

const meta = {
  title: 'Layout/WorkSection',
  component: WorkSection,
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
} satisfies Meta<typeof WorkSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    setRef: () => console.log('setRef'),
  },
};

