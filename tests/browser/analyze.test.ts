/**
 * Tests for the transport-agnostic browser bundle: analyzeElement.
 *
 * Validates Requirements 1.1 (reuses core engine output), 1.6 (empty/detached
 * input returns a well-formed empty result), and 5.3 / warnings surfacing.
 */

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { analyzeElement } from '../../src/browser/analyze.js';
import { buildAccessibilityTree } from '../../src/extractor/tree-builder.js';
import { renderNVDA } from '../../src/renderer/nvda-renderer.js';

function elementFrom(html: string): Element {
  const dom = new JSDOM(html);
  return dom.window.document.body;
}

describe('analyzeElement', () => {
  it('produces per-reader announcement arrays for a simple element', () => {
    const el = elementFrom('<button>Save</button>');
    const result = analyzeElement(el);

    expect(result.nvda.some(line => line.includes('Save') && line.includes('button'))).toBe(true);
    expect(result.jaws.length).toBeGreaterThan(0);
    expect(result.voiceover.length).toBeGreaterThan(0);
    expect(result.narrator.length).toBeGreaterThan(0);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('matches the core engine output (parity with buildAccessibilityTree + renderNVDA)', () => {
    const el = elementFrom('<nav><a href="/">Home</a><a href="/about">About</a></nav>');
    const result = analyzeElement(el);

    const { model } = buildAccessibilityTree(el);
    const expectedNvda = renderNVDA(model, false).split('\n').filter(Boolean);

    expect(result.nvda).toEqual(expectedNvda);
  });

  it('computes stats from the accessibility tree', () => {
    const el = elementFrom(
      '<main><h1>Title</h1><nav><a href="/">Home</a></nav><button>Go</button></main>'
    );
    const result = analyzeElement(el);

    expect(result.stats.headings).toBeGreaterThanOrEqual(1);
    expect(result.stats.landmarks).toBeGreaterThanOrEqual(1);
    expect(result.stats.interactiveElements).toBeGreaterThanOrEqual(1);
    expect(result.stats.totalElements).toBeGreaterThan(0);
  });

  it('returns a well-formed empty result for null input (no throw)', () => {
    const result = analyzeElement(null);
    expect(result.nvda).toEqual([]);
    expect(result.jaws).toEqual([]);
    expect(result.voiceover).toEqual([]);
    expect(result.narrator).toEqual([]);
    expect(result.audit).toEqual([]);
    expect(result.stats).toEqual({
      totalElements: 0,
      interactiveElements: 0,
      landmarks: 0,
      headings: 0,
    });
    expect(result.warnings).toEqual([]);
  });

  it('returns a well-formed empty result for undefined input (no throw)', () => {
    const result = analyzeElement(undefined);
    expect(result.stats.totalElements).toBe(0);
  });

  it('folds extra warnings (e.g. upgrade timeouts) into the result', () => {
    const el = elementFrom('<button>Save</button>');
    const result = analyzeElement(el, ['upgrade timed out for <my-el>']);
    expect(result.warnings).toContain('upgrade timed out for <my-el>');
  });
});
