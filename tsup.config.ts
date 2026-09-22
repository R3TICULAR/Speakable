import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };
const versionDefine = { __SPEAKABLE_VERSION__: JSON.stringify(pkg.version) };

export default defineConfig([
  // CLI entry point with shebang
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    target: 'node18',
    shims: true,
    define: versionDefine,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // MCP server entry point with shebang
  {
    entry: ['src/mcp.ts'],
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: true,
    minify: false,
    target: 'node18',
    shims: true,
    define: versionDefine,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // Library entry point without shebang
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    minify: false,
    target: 'node18',
    shims: true,
    define: versionDefine,
  },
  // Browser bundle — ESM module for bundler consumers (addon, harness importers)
  {
    entry: { 'browser/index': 'src/browser/index.ts', 'harness/index': 'src/harness/index.ts' },
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    minify: false,
    platform: 'browser',
    target: 'es2020',
    define: versionDefine,
  },
  // Browser bundle — IIFE for injection into pages/iframes (harness, extension)
  {
    entry: { 'speakable-browser': 'src/browser/inject-entry.ts' },
    format: ['iife'],
    globalName: 'SpeakableBrowser',
    outExtension: () => ({ js: '.global.js' }),
    dts: false,
    clean: false,
    sourcemap: true,
    minify: true,
    platform: 'browser',
    target: 'es2020',
    define: versionDefine,
  },
]);
