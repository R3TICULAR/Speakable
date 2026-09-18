/**
 * Tests for the Storybook addon's timeline/baseline/diff wiring.
 *
 * Validates Requirements 6.2 (sequence resolution priority), 7.1 (baseline
 * save), 7.2/7.3 (diff + classify against baseline). The panel React view is
 * exercised indirectly via the pure logic it depends on.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { resolveSequence } from '../../addon-speakable/src/sequence';
import { createPanelBaselineStore } from '../../addon-speakable/src/baseline-store';
import { diffTimelines } from '../../src/runtime/diff-engine';
import { classifyDiff } from '../../src/runtime/severity';
import type { AccessibilityTimeline } from '../../src/runtime/types';

function makeTimeline(overrides: Partial<AccessibilityTimeline> = {}): AccessibilityTimeline {
  return {
    version: '1.0',
    component: 'Button',
    story: 'Primary',
    interactionSequence: 'test',
    duration: 100,
    events: [
      {
        type: 'FOCUS_CHANGED',
        timestamp: 10,
        target: { role: 'button', accessibleName: 'Save', selector: 'button' },
        payload: { kind: 'focus_changed', previousTarget: null },
      },
    ],
    warnings: [],
    metadata: {
      capturedAt: new Date().toISOString(),
      speakableVersion: 'test',
      sourceUrl: 'local',
      userAgent: 'jsdom',
    },
    ...overrides,
  };
}

describe('resolveSequence', () => {
  it('prefers an explicit sequence parameter', () => {
    const seq = { description: 'custom', actions: [{ type: 'tab' as const }] };
    const result = resolveSequence({ parameters: { speakable: { sequence: seq } } });
    expect(result).toBe(seq);
  });

  it('falls back to a named built-in pattern', () => {
    const result = resolveSequence({ parameters: { speakable: { pattern: 'modal-dialog' } } });
    expect(result).not.toBeNull();
    expect(result!.description.toLowerCase()).toContain('modal dialog');
  });

  it('uses a keyboard-walk probe when only a play function exists', () => {
    const result = resolveSequence({ playFunction: () => {} });
    expect(result).not.toBeNull();
    expect(result!.actions.every(a => a.type === 'tab')).toBe(true);
  });

  it('returns null when nothing applies', () => {
    expect(resolveSequence({})).toBeNull();
  });

  it('respects an explicit timeline:false opt-out', () => {
    const result = resolveSequence({
      parameters: { speakable: { timeline: false, pattern: 'tabs' } },
    });
    expect(result).toBeNull();
  });
});

describe('PanelBaselineStore', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch { /* ignore */ }
  });

  it('saves and loads a baseline by component::story key', async () => {
    const store = createPanelBaselineStore();
    const tl = makeTimeline();
    expect(await store.load('Button', 'Primary')).toBeNull();
    await store.save('Button', 'Primary', tl);
    const loaded = await store.load('Button', 'Primary');
    expect(loaded).not.toBeNull();
    expect(loaded!.component).toBe('Button');
    expect(store.key('Button', 'Primary')).toContain('Button::Primary');
  });

  it('keeps baselines isolated per story', async () => {
    const store = createPanelBaselineStore();
    await store.save('Button', 'Primary', makeTimeline());
    expect(await store.load('Button', 'Secondary')).toBeNull();
  });
});

describe('baseline diff + classify wiring', () => {
  it('reports no entries when current equals baseline', () => {
    const tl = makeTimeline();
    const report = classifyDiff(diffTimelines(tl, tl));
    expect(report.entries.length).toBe(0);
  });

  it('classifies a removed focus change as critical', () => {
    const baseline = makeTimeline();
    const current = makeTimeline({ events: [] });
    const report = classifyDiff(diffTimelines(baseline, current));
    expect(report.entries.length).toBeGreaterThan(0);
    expect(report.highestSeverity).toBe('critical');
  });
});
