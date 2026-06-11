import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { generateSelector } from '../../../src/runtime/selector.js';

function createElement(html: string): { document: Document; element: Element } {
  const dom = new JSDOM(html);
  return { document: dom.window.document, element: dom.window.document.body };
}

function createDOM(html: string): Document {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
  return dom.window.document;
}

describe('generateSelector', () => {
  describe('ID-based selectors', () => {
    it('should return #id when element has an ID', () => {
      const doc = createDOM('<div id="main"><button id="submit">Submit</button></div>');
      const button = doc.querySelector('#submit')!;
      expect(generateSelector(button)).toBe('#submit');
    });

    it('should escape special characters in IDs', () => {
      const doc = createDOM('<div id="my.element">content</div>');
      const el = doc.querySelector('[id="my.element"]')!;
      const selector = generateSelector(el);
      expect(selector).toBe('#my\\.element');
    });
  });

  describe('tag uniqueness', () => {
    it('should use tag alone when unique among siblings', () => {
      const doc = createDOM('<div><header>Header</header><main>Main</main><footer>Footer</footer></div>');
      const main = doc.querySelector('main')!;
      const selector = generateSelector(main);
      // Should produce a short selector using tag name
      expect(doc.querySelectorAll(selector).length).toBe(1);
      expect(doc.querySelector(selector)).toBe(main);
    });
  });

  describe('class-based selectors', () => {
    it('should use tag+class when it uniquely identifies among siblings', () => {
      const doc = createDOM('<ul><li class="active">Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
      const activeItem = doc.querySelector('li.active')!;
      const selector = generateSelector(activeItem);
      expect(doc.querySelectorAll(selector).length).toBe(1);
      expect(doc.querySelector(selector)).toBe(activeItem);
    });

    it('should sort classes for deterministic output', () => {
      const doc = createDOM('<div><span class="zebra alpha">text</span><span>other</span></div>');
      const span = doc.querySelector('span.zebra')!;
      const selector = generateSelector(span);
      // Classes should be sorted alphabetically
      expect(selector).toContain('alpha');
      expect(selector).toContain('zebra');
      expect(selector.indexOf('alpha')).toBeLessThan(selector.indexOf('zebra'));
    });

    it('should filter out dynamic-looking class names', () => {
      const doc = createDOM('<div><span class="button button_a1b2c3d4e5">text</span><span>other</span></div>');
      const span = doc.querySelector('span.button')!;
      const selector = generateSelector(span);
      // Should not include the hash-like class
      expect(selector).not.toContain('a1b2c3d4e5');
    });
  });

  describe('nth-child fallback', () => {
    it('should use nth-child when tag and classes are not unique', () => {
      const doc = createDOM('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
      const secondItem = doc.querySelectorAll('li')[1];
      const selector = generateSelector(secondItem);
      expect(doc.querySelectorAll(selector).length).toBe(1);
      expect(doc.querySelector(selector)).toBe(secondItem);
    });

    it('should handle deeply nested elements', () => {
      const doc = createDOM(`
        <div>
          <div>
            <div>
              <span>Target</span>
            </div>
          </div>
        </div>
      `);
      const span = doc.querySelector('span')!;
      const selector = generateSelector(span);
      expect(doc.querySelectorAll(selector).length).toBe(1);
      expect(doc.querySelector(selector)).toBe(span);
    });
  });

  describe('selector uniqueness', () => {
    it('should produce unique selectors for all elements in a complex document', () => {
      const doc = createDOM(`
        <header>
          <nav>
            <a href="/home">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
        </header>
        <main>
          <article>
            <h2>Title 1</h2>
            <p>Content 1</p>
            <button>Read more</button>
          </article>
          <article>
            <h2>Title 2</h2>
            <p>Content 2</p>
            <button>Read more</button>
          </article>
        </main>
        <footer>
          <p>Footer text</p>
        </footer>
      `);

      const allElements = doc.querySelectorAll('*');
      const selectors = new Map<string, Element>();

      for (const el of allElements) {
        // Skip html, head, body as they are structural
        if (['html', 'head', 'body'].includes(el.tagName.toLowerCase())) continue;

        const selector = generateSelector(el);

        // Verify uniqueness: selector should resolve to exactly one element
        const matches = doc.querySelectorAll(selector);
        expect(matches.length).toBe(1);
        expect(matches[0]).toBe(el);
      }
    });

    it('should produce stable selectors (deterministic)', () => {
      const doc = createDOM(`
        <div>
          <span class="highlight">First</span>
          <span class="highlight">Second</span>
          <span>Third</span>
        </div>
      `);

      const secondSpan = doc.querySelectorAll('span.highlight')[1];

      // Call generateSelector twice - should produce identical result
      const selector1 = generateSelector(secondSpan);
      const selector2 = generateSelector(secondSpan);
      expect(selector1).toBe(selector2);
    });
  });

  describe('edge cases', () => {
    it('should handle the body element', () => {
      const doc = createDOM('<p>Hello</p>');
      const body = doc.body;
      const selector = generateSelector(body);
      expect(doc.querySelectorAll(selector).length).toBe(1);
      expect(doc.querySelector(selector)).toBe(body);
    });

    it('should handle elements with no classes and duplicate tags', () => {
      const doc = createDOM('<div><div><div>Nested</div></div></div>');
      const innerDiv = doc.querySelector('div > div > div')!;
      const selector = generateSelector(innerDiv);
      expect(doc.querySelectorAll(selector).length).toBe(1);
      expect(doc.querySelector(selector)).toBe(innerDiv);
    });

    it('should handle elements with special characters in classes', () => {
      const doc = createDOM('<div><span class="foo:bar">text</span><span>other</span></div>');
      const span = doc.querySelector('[class="foo:bar"]')!;
      const selector = generateSelector(span);
      expect(doc.querySelectorAll(selector).length).toBe(1);
      expect(doc.querySelector(selector)).toBe(span);
    });
  });
});
