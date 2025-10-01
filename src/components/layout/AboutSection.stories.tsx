import type { Meta, StoryObj } from '@storybook/react';
import AboutSection from './AboutSection';

const meta = {
  title: 'Layout/AboutSection',
  component: AboutSection,
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
} satisfies Meta<typeof AboutSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    setRef: () => console.log('setRef'),
  },
};

