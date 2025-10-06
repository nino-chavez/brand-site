export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: ['default', {
              discardComments: { removeAll: true },
              reduceIdents: false, // Preserve Tailwind class names
              zindex: false, // Don't optimize z-index
            }],
          },
        }
      : {}),
  },
}