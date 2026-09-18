/**
 * Cross-surface consistency (Requirement 9).
 *
 * All real-browser surfaces (Storybook addon, iframe harness/agent, browser
 * extension) analyze via the single shared engine. This asserts identical
 * per-reader announcements for a shared fixture set, regardless of entry point.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { analyzeElement } from '../../src/browser/analyze.js';
import { analyzeDOM } from '../../addon-speakable/src/analyzer';
import { buildAccessibilityTree } from '../../src/extractor/tree-builder.js';
import { renderNVDA } from '../../src/renderer/nvda-renderer.js';
import { renderJAWS } from '../../src/renderer/jaws-renderer.js';
import { renderVoiceOver } from '../../src/renderer/voiceover-renderer.js';
import { renderNarrator } from '../../src/renderer/narrator-renderer.js';

const FIXTURES: Record<string, string> = {
  button: '<button>Save changes</button>',
  link: '<a href="/home">Home</a>',
  landmarks: '<main><h1>Title</h1><nav><a href="/">Home</a></nav></main>',
  form: '<form><label for="n">Name</label><input id="n" /></form>',
  list: '<ul><li>One</li><li>Two</li></ul>',
  headings: '<div><h1>A</h1><h2>B</h2><h3>C</h3></div>',
};

function root(html: string): Element {
  document.body.innerHTML = html;
  return document.body;
}

describe('cross-surface output consistency', () => {
  for (const [name, html] of Object.entries(FIXTURES)) {
    it(`addon shim === browser bundle for "${name}"`, () => {
      const viaBundle = analyzeElement(root(html));
      const viaAddon = analyzeDOM(root(html));
      // Addon shim adds no warnings; compare the announcement channels.
      expect(viaAddon.nvda).toEqual(viaBundle.nvda);
      expect(viaAddon.jaws).toEqual(viaBundle.jaws);
      expect(viaAddon.voiceover).toEqual(viaBundle.voiceover);
      expect(viaAddon.narrator).toEqual(viaBundle.narrator);
    });

    it(`browser bundle === core engine for "${name}"`, () => {
      const el = root(html);
      const viaBundle = analyzeElement(el);
      const { model } = buildAccessibilityTree(el);

      expect(viaBundle.nvda).toEqual(renderNVDA(model, false).split('\n').filter(Boolean));
      expect(viaBundle.jaws).toEqual(renderJAWS(model, false).split('\n').filter(Boolean));
      expect(viaBundle.voiceover).toEqual(renderVoiceOver(model, false).split('\n').filter(Boolean));
      expect(viaBundle.narrator).toEqual(renderNarrator(model, false).split('\n').filter(Boolean));
    });
  }
});
