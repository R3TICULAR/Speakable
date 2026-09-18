/**
 * Preview (iframe) side of the addon.
 * Runs inside the story iframe. After each story renders, it:
 *   - extracts the DOM and sends a static accessibility analysis (EVENT_RESULT),
 *   - if the story defines an interaction sequence, captures an interaction
 *     timeline and sends it (EVENT_TIMELINE).
 * Also watches for DOM changes (args/controls updates) and re-analyzes.
 */

import { EVENT_RESULT, EVENT_TIMELINE } from './index';
import { analyzeDOM } from './analyzer';
import { captureTimeline } from '../../src/browser/capture';
import { resolveSequence } from './sequence';
import type { AccessibilityTimeline } from '../../src/runtime/types';

let currentObserver: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let captureToken = 0;

function getChannel() {
  return (window as any).__STORYBOOK_ADDONS_CHANNEL__;
}

function findStoryRoot(): Element | null {
  return (
    document.getElementById('storybook-root') ||
    document.getElementById('root') ||
    document.body
  );
}

function runAnalysis() {
  const root = findStoryRoot();
  if (!root) return;

  const analysis = analyzeDOM(root);
  const channel = getChannel();
  if (channel) {
    channel.emit(EVENT_RESULT, analysis);
  }
}

/**
 * Capture an interaction timeline for the current story, if a sequence applies.
 * Guards against overlapping captures on story change via a monotonic token.
 */
async function runTimelineCapture(context: any) {
  const sequence = resolveSequence(context || {});
  if (!sequence) return;

  const token = ++captureToken;

  const componentName: string =
    context?.title || context?.kind || context?.componentId || 'Component';
  const storyName: string = context?.name || context?.story || 'Story';

  let timeline: AccessibilityTimeline;
  try {
    timeline = await captureTimeline(document, {
      componentName,
      storyName,
      sequence,
    });
  } catch {
    return;
  }

  // A newer capture (story change) superseded this one — drop the result.
  if (token !== captureToken) return;

  const channel = getChannel();
  if (channel) {
    channel.emit(EVENT_TIMELINE, timeline);
  }
}

function debouncedAnalysis() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runAnalysis();
    debounceTimer = null;
  }, 150);
}

function startObserving() {
  // Disconnect previous observer if any
  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }

  const root = findStoryRoot();
  if (!root) return;

  // Watch for DOM changes (triggered by args/controls updates causing re-render)
  currentObserver = new MutationObserver(() => {
    debouncedAnalysis();
  });

  currentObserver.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'aria-expanded', 'aria-selected', 'aria-checked', 'aria-disabled',
      'aria-hidden', 'aria-pressed', 'aria-label', 'aria-labelledby',
      'role', 'disabled', 'hidden',
    ],
  });
}

// Storybook decorator that captures the rendered story DOM
const withSpeakable = (storyFn: any, context: any) => {
  const result = storyFn();

  // Invalidate any in-flight timeline capture from a previous story.
  captureToken++;

  // Use requestAnimationFrame + delay to wait for render to complete
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      setTimeout(() => {
        runAnalysis();
        startObserving();
        // Fire-and-forget timeline capture (does not block static analysis).
        void runTimelineCapture(context);
      }, 100);
    });
  }

  return result;
};

export const decorators = [withSpeakable];
