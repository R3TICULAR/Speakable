/**
 * Transport-agnostic browser bundle — public API.
 *
 * A single source of truth for real-browser accessibility analysis and
 * interaction capture, consumed by the Storybook addon, the iframe harness,
 * and the browser extension. Contains no transport- or Storybook-specific
 * code in its analysis path.
 */

export { analyzeElement, analyzeElementWithUpgrade } from './analyze.js';
export type { AnalysisResult, AuditFinding } from './analyze.js';

export { captureTimeline } from './capture.js';
export type { CaptureOptions } from './capture.js';

export { awaitCustomElementsReady } from './upgrade.js';
export type { UpgradeWarning } from './upgrade.js';
