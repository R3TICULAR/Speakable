/**
 * Tests for the benchmark scoring core (scorePairs).
 *
 * Covers: per-field match/miss, a known false positive, a known false
 * negative, and runtime ordered-timeline precision/recall.
 */

import { describe, it, expect } from 'vitest';
import { scorePairs } from '../../bench/harness/score.js';
import type { CaseRecord, NormalizedPhrase } from '../../bench/harness/types.js';

function rec(
  id: string,
  mode: 'static' | 'runtime',
  normalized: NormalizedPhrase[]
): CaseRecord {
  return {
    id,
    reader: 'nvda',
    mode,
    rawPhrases: normalized.map((n) => n.raw),
    normalized,
  };
}

describe('scorePairs — per-field accuracy', () => {
  it('counts a role+name match', () => {
    const truth = rec('c1', 'static', [{ raw: 'save, button', role: 'button', name: 'save' }]);
    const pred = rec('c1', 'static', [{ raw: 'save, button', role: 'button', name: 'save' }]);
    const s = scorePairs([{ truth, pred }]);
    expect(s.role.applicable).toBe(1);
    expect(s.role.matched).toBe(1);
    expect(s.role.rate).toBe(1);
    expect(s.name.matched).toBe(1);
  });

  it('counts a role miss (wrong role predicted)', () => {
    const truth = rec('c1', 'static', [{ raw: 'x, button', role: 'button', name: 'x' }]);
    const pred = rec('c1', 'static', [{ raw: 'x, link', role: 'link', name: 'x' }]);
    const s = scorePairs([{ truth, pred }]);
    expect(s.role.applicable).toBe(1);
    expect(s.role.matched).toBe(0);
    expect(s.role.rate).toBe(0);
    // name still matches
    expect(s.name.matched).toBe(1);
  });
});

describe('scorePairs — false positive / false negative', () => {
  it('flags a false positive when prediction adds a state the truth lacks', () => {
    const truth = rec('c1', 'static', [{ raw: 'opt, button', role: 'button', name: 'opt' }]);
    const pred = rec('c1', 'static', [
      { raw: 'opt, button, pressed', role: 'button', name: 'opt', state: ['pressed:true'] },
    ]);
    const s = scorePairs([{ truth, pred }]);
    // truth has no state → prediction's state is a false positive
    expect(s.falsePositives).toBeGreaterThanOrEqual(1);
  });

  it('flags a false negative when prediction misses a state the truth has', () => {
    const truth = rec('c1', 'static', [
      { raw: 'opt, button, collapsed', role: 'button', name: 'opt', state: ['expanded:false'] },
    ]);
    const pred = rec('c1', 'static', [{ raw: 'opt, button', role: 'button', name: 'opt' }]);
    const s = scorePairs([{ truth, pred }]);
    expect(s.falseNegatives).toBeGreaterThanOrEqual(1);
  });
});

describe('scorePairs — runtime timeline fidelity', () => {
  it('computes precision and recall over ordered phrases', () => {
    const truth = rec('d1', 'runtime', [
      { raw: 'settings, dialog' },
      { raw: 'keep subscription, button' },
      { raw: 'confirm cancel, button' },
    ]);
    // prediction misses the middle event and adds one extra at the end
    const pred = rec('d1', 'runtime', [
      { raw: 'settings, dialog' },
      { raw: 'confirm cancel, button' },
      { raw: 'extra noise' },
    ]);
    const s = scorePairs([{ truth, pred }]);
    expect(s.timeline).toBeDefined();
    // LCS = ["settings, dialog", "confirm cancel, button"] = 2
    // recall = 2/3, precision = 2/3
    expect(s.timeline!.recall).toBeCloseTo(2 / 3, 5);
    expect(s.timeline!.precision).toBeCloseTo(2 / 3, 5);
  });

  it('gives perfect precision/recall for identical timelines', () => {
    const phrases = [{ raw: 'a, button' }, { raw: 'b, link' }];
    const s = scorePairs([{ truth: rec('d2', 'runtime', phrases), pred: rec('d2', 'runtime', phrases) }]);
    expect(s.timeline!.precision).toBe(1);
    expect(s.timeline!.recall).toBe(1);
  });
});
