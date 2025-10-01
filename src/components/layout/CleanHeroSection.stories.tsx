import type { Meta, StoryObj } from '@storybook/react';
import CleanHeroSection from './CleanHeroSection';

const meta = {
  title: 'Layout/CleanHeroSection',
  component: CleanHeroSection,
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
    onNavigate: {
    },
  },
} satisfies Meta<typeof CleanHeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    setRef: () => console.log('setRef'),
    onNavigate: () => console.log('onNavigate'),
  },
};

