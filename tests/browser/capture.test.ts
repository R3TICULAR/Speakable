/**
 * Tests for the transport-agnostic interaction capture (src/browser/capture.ts).
 *
 * This is the core of the runtime testing capability: attach the runtime
 * engine to a live document, run an interaction sequence, and return a
 * serializable timeline. These tests cover:
 *   - a real sequence against live DOM produces a populated, well-formed timeline
 *   - metadata (component/story/interactionSequence) is carried through
 *   - custom-element upgrade warnings are folded in as t=0 WARNING events
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, afterEach } from 'vitest';
import { captureTimeline } from '../../src/browser/capture.js';
import type { InteractionSequence } from '../../src/runtime/types.js';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('captureTimeline', () => {
  it('produces a well-formed timeline with carried-through metadata', async () => {
    document.body.innerHTML = `
      <button id="a">First</button>
      <button id="b">Second</button>
    `;

    const sequence: InteractionSequence = {
      description: 'Tab between two buttons',
      actions: [{ type: 'tab' }, { type: 'tab' }],
    };

    const timeline = await captureTimeline(document, {
      componentName: 'TwoButtons',
      storyName: 'Default',
      sequence,
      // Keep the settle period short so the test is fast.
      settlePeriod: 20,
    });

    expect(timeline.component).toBe('TwoButtons');
    expect(timeline.story).toBe('Default');
    expect(timeline.interactionSequence).toBe('Tab between two buttons');
    expect(Array.isArray(timeline.events)).toBe(true);
    expect(Array.isArray(timeline.warnings)).toBe(true);
    expect(timeline.metadata).toBeTruthy();
    expect(typeof timeline.metadata.capturedAt).toBe('string');
  });

  it('captures keyboard-action events from the interaction sequence', async () => {
    document.body.innerHTML = `<button id="a">First</button><button id="b">Second</button>`;

    const timeline = await captureTimeline(document, {
      componentName: 'Buttons',
      sequence: {
        description: 'tab walk',
        actions: [{ type: 'tab' }, { type: 'tab' }],
      },
      settlePeriod: 20,
    });

    // Tab actions emit KEYBOARD_ACTION events (see runtime/interactions.ts).
    const keyboardEvents = timeline.events.filter(e => e.type === 'KEYBOARD_ACTION');
    expect(keyboardEvents.length).toBeGreaterThan(0);
  });

  it('records a WARNING when a click target selector does not resolve', async () => {
    document.body.innerHTML = `<div>no matching button here</div>`;

    const timeline = await captureTimeline(document, {
      componentName: 'MissingTarget',
      sequence: {
        description: 'click a missing element',
        actions: [{ type: 'click', selector: '#does-not-exist' }],
      },
      settlePeriod: 20,
    });

    const warnings = timeline.events.filter(e => e.type === 'WARNING');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('folds custom-element upgrade timeouts into the timeline as t=0 WARNINGs', async () => {
    // An unupgraded custom element that never gets defined triggers a timeout
    // warning from awaitCustomElementsReady, which capture folds into the timeline.
    document.body.innerHTML = `<never-upgrades-el></never-upgrades-el>`;

    const timeline = await captureTimeline(document, {
      componentName: 'UpgradeTimeout',
      sequence: { description: 'noop', actions: [{ type: 'wait', ms: 1 }] },
      settlePeriod: 20,
      awaitUpgrade: true,
      upgradeTimeoutMs: 50,
    });

    const upgradeWarnings = timeline.warnings.filter(
      w => w.type === 'WARNING' && w.timestamp === 0 &&
        (w.payload as { message?: string }).message?.includes('did not upgrade')
    );
    expect(upgradeWarnings.length).toBeGreaterThan(0);
    // The same warning is present in the ordered event stream.
    expect(timeline.events.some(e => e.type === 'WARNING' && e.timestamp === 0)).toBe(true);
  });

  it('skips upgrade awaiting when awaitUpgrade is false (no upgrade warnings)', async () => {
    document.body.innerHTML = `<never-upgrades-el></never-upgrades-el>`;

    const timeline = await captureTimeline(document, {
      componentName: 'NoUpgradeWait',
      sequence: { description: 'noop', actions: [{ type: 'wait', ms: 1 }] },
      settlePeriod: 20,
      awaitUpgrade: false,
    });

    const upgradeWarnings = timeline.warnings.filter(
      w => (w.payload as { message?: string }).message?.includes('did not upgrade')
    );
    expect(upgradeWarnings.length).toBe(0);
  });
});
