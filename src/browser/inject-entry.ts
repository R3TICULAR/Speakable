/**
 * Injectable IIFE entry point.
 *
 * Built as an IIFE and injected into a page or iframe by the harness and the
 * browser extension. Exposes the browser bundle on `window.__SPEAKABLE__` and
 * installs the in-iframe harness agent so a parent controller can drive it
 * over `postMessage`.
 */

import { analyzeElement, analyzeElementWithUpgrade } from './analyze.js';
import { captureTimeline } from './capture.js';
import { awaitCustomElementsReady } from './upgrade.js';
import { installAgent } from '../harness/agent.js';
import { SPEAKABLE_VERSION } from '../version.js';

const api = {
  analyzeElement,
  analyzeElementWithUpgrade,
  captureTimeline,
  awaitCustomElementsReady,
  version: SPEAKABLE_VERSION,
};

// Expose the API for direct invocation (extension content script, manual use).
(window as unknown as { __SPEAKABLE__?: typeof api }).__SPEAKABLE__ = api;

// Install the harness agent so a parent frame can drive analysis over postMessage.
// Only meaningful when running inside an iframe, but harmless at top level.
try {
  installAgent();
} catch {
  // Non-fatal: direct-invocation use (extension) does not need the agent.
}

export {};
