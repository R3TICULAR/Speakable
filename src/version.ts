/**
 * Single source of truth for the package version.
 *
 * The value is injected at build/test time via the `__SPEAKABLE_VERSION__`
 * define, which reads it from package.json:
 *   - production bundles: defined in tsup.config.ts (all entries)
 *   - the test suite: defined in vitest.config.ts
 *
 * This keeps runtime-reported versions (timeline metadata, baseline files, the
 * browser bundle) in lockstep with the published version, with no hardcoded
 * strings to drift. This module is browser-safe: it has no Node-only imports,
 * so it can be bundled into the browser/IIFE build.
 */

declare const __SPEAKABLE_VERSION__: string | undefined;

/** The resolved package version (e.g. "1.7.0"), or "dev" if the define is absent. */
export const SPEAKABLE_VERSION: string =
  typeof __SPEAKABLE_VERSION__ !== 'undefined' && __SPEAKABLE_VERSION__
    ? __SPEAKABLE_VERSION__
    : 'dev';
