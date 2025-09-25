import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createTokenPlugin } from './tokens/vite-plugin-tokens';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), createTokenPlugin()],
      build: {
        // Optimize bundle splitting
        rollupOptions: {
          output: {
            manualChunks: {
              // Separate vendor libraries
              vendor: ['react', 'react-dom'],
              // Volleyball timing system components
              volleyball: [
                './components/SplitScreenManager',
                './components/TimingController',
                './components/PerformanceMonitor',
                './components/InteractivePauseSystem',
                './components/VisualContinuitySystem',
                './components/SportsSequenceController'
              ],
              // UI components
              ui: [
                './components/NavigationControls',
                './components/LeftViewport',
                './components/RightViewport',
                './components/PhaseSpecificSportsContent'
              ]
            }
          }
        },
        // Enable minification and compression
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production'
          }
        },
        // Chunk size warnings
        chunkSizeWarningLimit: 600,
        // Asset optimization
        assetsInlineLimit: 4096
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@tokens': path.resolve(__dirname, './tokens'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          include: ['components/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}'],
          exclude: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'node_modules/**'],
        },
      }
    };
});
