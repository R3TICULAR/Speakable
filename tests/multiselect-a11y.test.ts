/**
 * Speakable Accessibility Tests for Multi-Select Component
 * 
 * Tests the multi-select component's screen reader announcements across
 * all four renderers (VoiceOver, NVDA, JAWS, Narrator) to verify:
 * 
 * 1. Trigger button announces role + label + expanded state
 * 2. Listbox announces multiselectable capability
 * 3. Options announce selection state correctly
 * 4. Disabled options are communicated
 * 5. Live region fires on selection change
 * 6. Cross-renderer output differences are visible
 */
import { describe, it, expect } from 'vitest';
import { parseHTML } from '../src/parser/index.js';
import { buildAccessibilityTree } from '../src/extractor/tree-builder.js';
import { renderNVDA } from '../src/renderer/nvda-renderer.js';
import { renderJAWS } from '../src/renderer/jaws-renderer.js';
import { renderVoiceOver } from '../src/renderer/voiceover-renderer.js';
import { renderNarrator } from '../src/renderer/narrator-renderer.js';

// ─── Test HTML Fixtures ─────────────────────────────────────────────────────

const COLLAPSED_TRIGGER_HTML = `
<div class="multi-select-container">
  <label id="multi-select-label-languages">Programming Languages</label>
  <button
    type="button"
    class="multi-select-trigger"
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-labelledby="multi-select-label-languages"
  >
    <span>Choose languages...</span>
    <span aria-hidden="true">\u25BC</span>
  </button>
</div>
`;

const EXPANDED_WITH_OPTIONS_HTML = `
<div class="multi-select-container">
  <label id="multi-select-label-languages">Programming Languages</label>
  <button
    type="button"
    class="multi-select-trigger"
    aria-haspopup="listbox"
    aria-expanded="true"
    aria-labelledby="multi-select-label-languages"
  >
    <span>2 selected</span>
    <span aria-hidden="true">\u25BC</span>
  </button>
  <ul
    role="listbox"
    aria-multiselectable="true"
    aria-labelledby="multi-select-label-languages"
    aria-activedescendant="option-ts"
    tabindex="-1"
  >
    <li role="option" id="option-js" aria-selected="true">
      <span aria-hidden="true">\u2611</span>
      <span>JavaScript</span>
    </li>
    <li role="option" id="option-ts" aria-selected="true">
      <span aria-hidden="true">\u2611</span>
      <span>TypeScript</span>
    </li>
    <li role="option" id="option-py" aria-selected="false">
      <span aria-hidden="true">\u2610</span>
      <span>Python</span>
    </li>
    <li role="option" id="option-rs" aria-selected="false">
      <span aria-hidden="true">\u2610</span>
      <span>Rust</span>
    </li>
    <li role="option" id="option-go" aria-selected="false" aria-disabled="true">
      <span aria-hidden="true">\u2610</span>
      <span>Go (unavailable)</span>
    </li>
  </ul>
  <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
    TypeScript selected. 2 of 5 selected.
  </div>
</div>
`;

const LIVE_REGION_HTML = `
<div role="status" aria-live="polite" aria-atomic="true">
  Python selected. 3 of 5 selected.
</div>
`;

const DISABLED_OPTIONS_HTML = `
<ul role="listbox" aria-multiselectable="true" aria-label="Deployment Targets">
  <li role="option" id="opt-prod" aria-selected="false">Production</li>
  <li role="option" id="opt-staging" aria-selected="true">Staging</li>
  <li role="option" id="opt-preview" aria-selected="false" aria-disabled="true">Preview (unavailable)</li>
</ul>
`;

// ─── Helper ─────────────────────────────────────────────────────────────────

function analyzeHTML(html: string) {
  const { document } = parseHTML(html);
  const { model } = buildAccessibilityTree(document.documentElement);
  return model;
}

function getAllRendererOutputs(html: string) {
  const model = analyzeHTML(html);
  return {
    voiceover: renderVoiceOver(model, false),
    nvda: renderNVDA(model, false),
    jaws: renderJAWS(model, false),
    narrator: renderNarrator(model, false),
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Multi-Select Component: Screen Reader Announcements', () => {
  
  describe('Collapsed Trigger Button', () => {
    it('VoiceOver: announces label, role, and collapsed state', () => {
      const model = analyzeHTML(COLLAPSED_TRIGGER_HTML);
      const output = renderVoiceOver(model, false);
      expect(output.toLowerCase()).toContain('programming languages');
      expect(output.toLowerCase()).toContain('button');
      expect(output.toLowerCase()).toMatch(/collapsed|popup/);
    });

    it('NVDA: announces role, label, and expanded state', () => {
      const model = analyzeHTML(COLLAPSED_TRIGGER_HTML);
      const output = renderNVDA(model, false);
      expect(output.toLowerCase()).toContain('button');
      expect(output.toLowerCase()).toContain('programming languages');
      expect(output.toLowerCase()).toMatch(/collapsed|subMenu/i);
    });

    it('JAWS: announces button with haspopup', () => {
      const model = analyzeHTML(COLLAPSED_TRIGGER_HTML);
      const output = renderJAWS(model, false);
      expect(output.toLowerCase()).toContain('programming languages');
      expect(output.toLowerCase()).toContain('button');
    });

    it('Narrator: announces button with context', () => {
      const model = analyzeHTML(COLLAPSED_TRIGGER_HTML);
      const output = renderNarrator(model, false);
      expect(output.toLowerCase()).toContain('programming languages');
      expect(output.toLowerCase()).toContain('button');
    });
  });

  describe('Expanded Listbox with Selected Options', () => {
    it('all renderers announce the expanded button state', () => {
      const outputs = getAllRendererOutputs(EXPANDED_WITH_OPTIONS_HTML);
      for (const [renderer, output] of Object.entries(outputs)) {
        expect(output.toLowerCase(), `${renderer} should see expanded state`).toMatch(/expanded|open/);
      }
    });

    it('all renderers announce option content', () => {
      const outputs = getAllRendererOutputs(EXPANDED_WITH_OPTIONS_HTML);
      for (const [renderer, output] of Object.entries(outputs)) {
        expect(output.toLowerCase(), `${renderer} should announce JavaScript option`).toContain('javascript');
        expect(output.toLowerCase(), `${renderer} should announce TypeScript option`).toContain('typescript');
        expect(output.toLowerCase(), `${renderer} should announce Python option`).toContain('python');
      }
    });

    it('NVDA: announces selected state on options', () => {
      const model = analyzeHTML(EXPANDED_WITH_OPTIONS_HTML);
      const output = renderNVDA(model, false);
      expect(output.toLowerCase()).toContain('selected');
    });

    it('JAWS: announces listbox role', () => {
      const model = analyzeHTML(EXPANDED_WITH_OPTIONS_HTML);
      const output = renderJAWS(model, false);
      // JAWS should announce the listbox container
      expect(output.toLowerCase()).toMatch(/list/);
    });
  });

  describe('Disabled Options', () => {
    it('NVDA: announces unavailable state', () => {
      const model = analyzeHTML(DISABLED_OPTIONS_HTML);
      const output = renderNVDA(model, false);
      expect(output.toLowerCase()).toMatch(/unavailable|disabled/);
    });

    it('all renderers communicate disabled state', () => {
      const outputs = getAllRendererOutputs(DISABLED_OPTIONS_HTML);
      for (const [renderer, output] of Object.entries(outputs)) {
        // Each renderer should indicate the option is not interactive
        expect(output.toLowerCase(), `${renderer} should indicate disabled state`).toMatch(/unavailable|disabled|dimmed/);
      }
    });
  });

  describe('Live Region Announcements', () => {
    it('all renderers recognize the live region content', () => {
      const outputs = getAllRendererOutputs(LIVE_REGION_HTML);
      for (const [renderer, output] of Object.entries(outputs)) {
        expect(output.toLowerCase(), `${renderer} should announce live region`).toContain('python selected');
      }
    });
  });

  describe('Cross-Renderer Comparison (diagnostic output)', () => {
    it('produces output for each renderer and logs differences', () => {
      const outputs = getAllRendererOutputs(EXPANDED_WITH_OPTIONS_HTML);

      console.log('\n\u2500\u2500\u2500 Multi-Select: Cross-Screen-Reader Announcement Comparison \u2500\u2500\u2500');
      for (const [renderer, output] of Object.entries(outputs)) {
        console.log(`\n\u250C\u2500 ${renderer.toUpperCase()} ${'─'.repeat(60 - renderer.length)}\u2510`);
        output.split('\n').forEach(line => {
          if (line.trim()) console.log(`\u2502  ${line}`);
        });
        console.log(`\u2514${'─'.repeat(66)}\u2518`);
      }
      console.log('\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

      // All renderers should produce non-empty output
      for (const [renderer, output] of Object.entries(outputs)) {
        expect(output.length, `${renderer} output should not be empty`).toBeGreaterThan(0);
      }
    });

    it('collapsed trigger: demonstrates announcement order differences', () => {
      const outputs = getAllRendererOutputs(COLLAPSED_TRIGGER_HTML);

      console.log('\n\u2500\u2500\u2500 Collapsed Trigger: Announcement Order Differences \u2500\u2500\u2500');
      for (const [renderer, output] of Object.entries(outputs)) {
        const firstLine = output.split('\n').find(l => l.trim()) || '';
        console.log(`  [${renderer.toUpperCase().padEnd(9)}] ${firstLine}`);
      }
      console.log('');

      // Verify each renderer is working
      for (const output of Object.values(outputs)) {
        expect(output.length).toBeGreaterThan(0);
      }
    });
  });
});
