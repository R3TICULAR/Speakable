/**
 * Storybook Preset for @reticular/storybook-addon-speakable
 *
 * This file runs in Node.js at Storybook build time.
 * It tells Storybook where to find the manager and preview bundles.
 * MUST be compiled to CommonJS because Storybook's builder uses require().
 */

import { join } from 'path';

export function managerEntries(entry: string[] = []): string[] {
  return [...entry, join(__dirname, 'manager.js')];
}

export function previewAnnotations(entry: string[] = []): string[] {
  return [...entry, join(__dirname, 'preview.js')];
}
