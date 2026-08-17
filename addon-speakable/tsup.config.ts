import { defineConfig } from 'tsup';

export default defineConfig([
  // Browser bundles (ESM) - manager, preview, and shared constants
  {
    entry: {
      index: 'src/index.ts',
      manager: 'src/manager.tsx',
      preview: 'src/preview.ts',
    },
    format: ['esm'],
    dts: false,
    external: ['react', 'react-dom', '@storybook/manager-api'],
    platform: 'browser',
    outDir: 'dist',
    clean: true,
  },
  // Node preset (CJS) - runs at Storybook build time via require()
  {
    entry: { preset: 'src/preset.ts' },
    format: ['cjs'],
    dts: false,
    platform: 'node',
    outDir: 'dist',
    outExtension: () => ({ js: '.js' }),
    // Don't clean here, we already cleaned above
  },
]);
