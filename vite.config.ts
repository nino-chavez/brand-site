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
            // Dynamic chunking based on patterns - more maintainable than hardcoded paths
            manualChunks(id: string) {
              // Vendor libraries
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor';
                }
                return 'vendor';
              }

              // Volleyball/sports components based on naming patterns
              if (id.includes('components/') &&
                  (id.includes('Volleyball') || id.includes('Sports') ||
                   id.includes('Timing') || id.includes('Court'))) {
                return 'volleyball';
              }

              // UI framework components
              if (id.includes('components/') &&
                  (id.includes('Navigation') || id.includes('Viewport') ||
                   id.includes('Controls') || id.includes('HUD'))) {
                return 'ui';
              }

              // Return undefined for default chunk
              return undefined;
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
        include: ['**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'dist', '.git'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          include: ['components/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}'],
          exclude: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'node_modules/**'],
        }
      }
    };
});