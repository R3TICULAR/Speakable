import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

export default defineConfig({
  define: {
    __SPEAKABLE_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
    },
    include: ['tests/**/*.test.ts'],
  },
});
