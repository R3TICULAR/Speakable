/**
 * Preview (iframe) side of the addon.
 * Runs inside the story iframe. After each story renders, it extracts
 * the DOM and sends an accessibility analysis to the manager (panel).
 * Also watches for DOM changes (triggered by args/controls updates)
 * and re-analyzes automatically.
 */

import { ADDON_ID, EVENT_RESULT } from './index';
import { analyzeDOM } from './analyzer';

let currentObserver: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
const withSpeakable = (storyFn: any, _context: any) => {
  const result = storyFn();

  // Use requestAnimationFrame + delay to wait for render to complete
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      setTimeout(() => {
        runAnalysis();
        startObserving();
      }, 100);
    });
  }

  return result;
};

export const decorators = [withSpeakable];
