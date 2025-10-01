import type { Preview } from '@storybook/react-vite';
import { AthleticTokenProvider } from '../tokens/simple-provider';
import React from 'react';
import '../src/index.css'; // Import global styles and Tailwind

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0a0a0a',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
    layout: 'fullscreen',
    // Accessibility addon configuration
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
      manual: false,
    },
  },
  decorators: [
    (Story) => (
      <AthleticTokenProvider>
        <div className="bg-brand-dark text-brand-light min-h-screen">
          <Story />
        </div>
      </AthleticTokenProvider>
    ),
  ],
};

export default preview;