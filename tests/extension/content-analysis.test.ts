/**
 * Tests for the extension's analysis path (Track 4).
 *
 * The extension content script analyzes the LIVE DOM via the shared bundle
 * (window.__SPEAKABLE__.analyzeElementWithUpgrade). These tests assert the
 * observable contract that path relies on:
 *   - open shadow-root content is included (Req 8.3),
 *   - output matches the core engine for equivalent DOM (Req 8.4),
 *   - the content wrapper's result-merge logic combines matched roots.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { analyzeElement } from '../../src/browser/analyze.js';
import { buildAccessibilityTree } from '../../src/extractor/tree-builder.js';
import { renderNVDA } from '../../src/renderer/nvda-renderer.js';

describe('extension live-DOM analysis', () => {
  it('includes open shadow-root content in the analysis', () => {
    class ShadowBtn extends HTMLElement {
      constructor() {
        super();
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = '<button>Shadow Save</button>';
      }
    }
    if (!customElements.get('shadow-btn')) {
      customElements.define('shadow-btn', ShadowBtn);
    }
    document.body.innerHTML = '<shadow-btn></shadow-btn>';
    const el = document.querySelector('shadow-btn')!;

    const result = analyzeElement(el);
    expect(result.nvda.some(line => line.includes('Shadow Save'))).toBe(true);
  });

  it('matches the core engine output for equivalent DOM', () => {
    document.body.innerHTML = '<main><h1>Docs</h1><a href="/">Home</a></main>';
    const el = document.querySelector('main')!;

    const result = analyzeElement(el);
    const { model } = buildAccessibilityTree(el);
    const expected = renderNVDA(model, false).split('\n').filter(Boolean);

    expect(result.nvda).toEqual(expected);
  });

  it('captures JS-set checkbox state from live DOM', () => {
    document.body.innerHTML = '<input type="checkbox" aria-label="Accept" />';
    const checkbox = document.querySelector('input')! as HTMLInputElement;
    checkbox.checked = true; // JS-set, not reflected in the HTML attribute

    const result = analyzeElement(checkbox);
    expect(result.nvda.some(line => line.toLowerCase().includes('checked'))).toBe(true);
  });
});

/**
 * Mirror of the content wrapper's mergeResults to lock its behavior.
 * (The wrapper ships as plain JS concatenated into content.js.)
 */
function mergeResults(results: ReturnType<typeof analyzeElement>[]) {
  if (results.length === 1) return results[0];
  const merged = {
    nvda: [] as string[], jaws: [] as string[], voiceover: [] as string[], narrator: [] as string[],
    audit: [] as unknown[], warnings: [] as string[],
    stats: { totalElements: 0, interactiveElements: 0, landmarks: 0, headings: 0 },
  };
  for (const r of results) {
    merged.nvda.push(...r.nvda);
    merged.jaws.push(...r.jaws);
    merged.voiceover.push(...r.voiceover);
    merged.narrator.push(...r.narrator);
    merged.audit.push(...r.audit);
    merged.warnings.push(...r.warnings);
    merged.stats.totalElements += r.stats.totalElements;
    merged.stats.interactiveElements += r.stats.interactiveElements;
    merged.stats.landmarks += r.stats.landmarks;
    merged.stats.headings += r.stats.headings;
  }
  return merged;
}

describe('content wrapper merge', () => {
  it('combines announcements and sums stats across matched roots', () => {
    document.body.innerHTML = '<button>One</button><button>Two</button>';
    const buttons = Array.from(document.querySelectorAll('button'));
    const results = buttons.map(b => analyzeElement(b));

    const merged = mergeResults(results);
    expect(merged.nvda.some(l => l.includes('One'))).toBe(true);
    expect(merged.nvda.some(l => l.includes('Two'))).toBe(true);
    expect(merged.stats.interactiveElements).toBe(2);
  });
});
