/**
 * Tests for shadow-DOM slot projection in the accessibility tree builder.
 *
 * Validates Requirements 3.1 (slotted content in shadow-tree order),
 * 3.2 (flattened assigned nodes), 3.3 (default slot content),
 * 3.4 (no double emission), 3.5 (no-shadow / no-slot unchanged).
 */

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from '../../../src/extractor/tree-builder.js';
import type { AccessibleNode } from '../../../src/model/types.js';

/**
 * Collect all names in tree order (depth-first) for order assertions.
 */
function names(node: AccessibleNode): string[] {
  const out: string[] = [];
  const walk = (n: AccessibleNode) => {
    if (n.name) out.push(n.name);
    n.children.forEach(walk);
  };
  walk(node);
  return out;
}

function defineCard(dom: JSDOM, shadowHtml: string, tag = 'my-card'): void {
  const { customElements, HTMLElement } = dom.window;
  class Card extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = shadowHtml;
    }
  }
  customElements.define(tag, Card as unknown as CustomElementConstructor);
}

describe('slot projection', () => {
  it('places slotted light-DOM content in shadow-tree order', () => {
    const dom = new JSDOM('<my-card><span>Body text</span></my-card>');
    defineCard(dom, '<h2>Card Title</h2><slot></slot><footer>Card Footer</footer>');
    const el = dom.window.document.querySelector('my-card')!;

    const { model } = buildAccessibilityTree(el);
    const order = names(model.root);

    // Shadow order: Title, [slotted Body text], Footer
    const titleIdx = order.indexOf('Card Title');
    const bodyIdx = order.indexOf('Body text');
    const footerIdx = order.indexOf('Card Footer');

    expect(titleIdx).toBeGreaterThanOrEqual(0);
    expect(bodyIdx).toBeGreaterThanOrEqual(0);
    expect(footerIdx).toBeGreaterThanOrEqual(0);
    expect(titleIdx).toBeLessThan(bodyIdx);
    expect(bodyIdx).toBeLessThan(footerIdx);
  });

  it('uses default slot content when nothing is assigned', () => {
    const dom = new JSDOM('<my-card></my-card>');
    defineCard(dom, '<slot><em>Default content</em></slot>');
    const el = dom.window.document.querySelector('my-card')!;

    const { model } = buildAccessibilityTree(el);
    expect(names(model.root)).toContain('Default content');
  });

  it('does not emit slotted nodes twice', () => {
    const dom = new JSDOM('<my-card><span>Unique body</span></my-card>');
    defineCard(dom, '<h2>Header</h2><slot></slot>');
    const el = dom.window.document.querySelector('my-card')!;

    const { model } = buildAccessibilityTree(el);
    const occurrences = names(model.root).filter(n => n === 'Unique body').length;
    expect(occurrences).toBe(1);
  });

  it('preserves plain light-DOM behavior when there is no shadow root', () => {
    const dom = new JSDOM('<div><h1>Heading</h1><p>Paragraph</p></div>');
    const el = dom.window.document.querySelector('div')!;

    const { model } = buildAccessibilityTree(el);
    const order = names(model.root);
    expect(order.indexOf('Heading')).toBeLessThan(order.indexOf('Paragraph'));
  });

  it('handles a shadow root with no slots (shadow content only)', () => {
    const dom = new JSDOM('<my-card>ignored light content</my-card>');
    defineCard(dom, '<h2>Only Shadow</h2>');
    const el = dom.window.document.querySelector('my-card')!;

    const { model } = buildAccessibilityTree(el);
    const order = names(model.root);
    expect(order).toContain('Only Shadow');
    // Light content is not projected (no slot), so it must not appear.
    expect(order).not.toContain('ignored light content');
  });

  it('projects multiple assigned nodes in order into a single slot', () => {
    const dom = new JSDOM('<my-card><span>First</span><span>Second</span></my-card>');
    defineCard(dom, '<slot></slot>');
    const el = dom.window.document.querySelector('my-card')!;

    const { model } = buildAccessibilityTree(el);
    const order = names(model.root);
    expect(order.indexOf('First')).toBeLessThan(order.indexOf('Second'));
  });
});
