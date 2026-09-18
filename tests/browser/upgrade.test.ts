/**
 * Tests for custom-element upgrade awaiting and closed-root warnings.
 *
 * Validates Requirements 4.1 (whenDefined), 4.2 (updateComplete),
 * 4.3 (timeout warning), 4.4 (never blocks indefinitely),
 * 5.1/5.2 (closed shadow root warning without throwing).
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { awaitCustomElementsReady } from '../../src/browser/upgrade.js';
import { buildAccessibilityTree } from '../../src/extractor/tree-builder.js';

describe('awaitCustomElementsReady', () => {
  it('resolves immediately when there are no custom elements', async () => {
    document.body.innerHTML = '<div><button>Hi</button></div>';
    const warnings = await awaitCustomElementsReady(document, 500);
    expect(warnings).toEqual([]);
  });

  it('waits for a late-defined custom element and returns no warning', async () => {
    document.body.innerHTML = '<late-el></late-el>';
    // Define after a short delay.
    setTimeout(() => {
      class LateEl extends HTMLElement {}
      customElements.define('late-el', LateEl);
    }, 50);

    const warnings = await awaitCustomElementsReady(document, 1000);
    expect(warnings).toEqual([]);
    expect(customElements.get('late-el')).toBeTruthy();
  });

  it('returns a warning when an element never upgrades within the timeout', async () => {
    document.body.innerHTML = '<never-defined-el></never-defined-el>';
    const warnings = await awaitCustomElementsReady(document, 100);
    expect(warnings.length).toBe(1);
    expect(warnings[0].tag).toBe('never-defined-el');
    expect(warnings[0].message).toContain('did not upgrade');
  });

  it('awaits an updateComplete promise when present (Lit-style)', async () => {
    class ReadyEl extends HTMLElement {
      resolved = false;
      updateComplete = new Promise<void>(resolve => {
        setTimeout(() => {
          this.resolved = true;
          resolve();
        }, 40);
      });
    }
    customElements.define('ready-el', ReadyEl);
    document.body.innerHTML = '<ready-el></ready-el>';
    const el = document.querySelector('ready-el') as unknown as { resolved: boolean };

    await awaitCustomElementsReady(document, 1000);
    expect(el.resolved).toBe(true);
  });

  it('does not block indefinitely (bounded by timeout)', async () => {
    document.body.innerHTML = '<stuck-el></stuck-el>';
    const start = Date.now();
    await awaitCustomElementsReady(document, 120);
    const elapsed = Date.now() - start;
    // Should return shortly after the timeout, not hang.
    expect(elapsed).toBeLessThan(1000);
  });
});

describe('closed shadow root warnings', () => {
  it('warns for a custom element with no light children and does not throw', () => {
    document.body.innerHTML = '<closed-widget></closed-widget>';
    const el = document.querySelector('closed-widget')!;

    let result!: ReturnType<typeof buildAccessibilityTree>;
    expect(() => {
      result = buildAccessibilityTree(el);
    }).not.toThrow();

    expect(
      result.warnings.some(w => w.message.includes('closed shadow root'))
    ).toBe(true);
  });

  it('does not warn for a custom element that has light children', () => {
    document.body.innerHTML = '<open-widget><span>content</span></open-widget>';
    const el = document.querySelector('open-widget')!;
    const result = buildAccessibilityTree(el);
    expect(result.warnings.some(w => w.message.includes('closed shadow root'))).toBe(false);
  });
});
