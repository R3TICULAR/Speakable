/**
 * Unit tests for the FocusObserver.
 *
 * Validates: Requirements 1.1
 */

import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { createFocusObserver } from '../../../src/runtime/observers/focus-observer.js';
import type { AccessibilityEvent } from '../../../src/runtime/types.js';

function createDocument(html: string): Document {
  const dom = new JSDOM(html, { url: 'http://localhost' });
  return dom.window.document;
}

describe('FocusObserver', () => {
  it('should emit FOCUS_CHANGED event when an element receives focus', () => {
    const doc = createDocument(`
      <button id="btn1">Submit</button>
      <button id="btn2">Cancel</button>
    `);

    const events: AccessibilityEvent[] = [];
    let timestamp = 0;
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => timestamp++,
    });

    observer.start();

    const btn1 = doc.getElementById('btn1')!;
    btn1.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('FOCUS_CHANGED');
    expect(events[0].target.role).toBe('button');
    expect(events[0].target.accessibleName).toBe('Submit');
    expect(events[0].target.selector).toBe('#btn1');
    expect(events[0].payload).toEqual({
      kind: 'focus_changed',
      previousTarget: null,
    });
  });

  it('should track previous focus target', () => {
    const doc = createDocument(`
      <button id="btn1">Submit</button>
      <button id="btn2">Cancel</button>
    `);

    const events: AccessibilityEvent[] = [];
    let timestamp = 0;
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => timestamp++,
    });

    observer.start();

    const btn1 = doc.getElementById('btn1')!;
    const btn2 = doc.getElementById('btn2')!;

    btn1.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));
    btn2.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    expect(events).toHaveLength(2);
    expect(events[1].payload).toEqual({
      kind: 'focus_changed',
      previousTarget: {
        role: 'button',
        accessibleName: 'Submit',
        selector: '#btn1',
      },
    });
  });

  it('should compute accessible name from aria-label', () => {
    const doc = createDocument(`
      <button id="close-btn" aria-label="Close dialog">X</button>
    `);

    const events: AccessibilityEvent[] = [];
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => 0,
    });

    observer.start();

    const btn = doc.getElementById('close-btn')!;
    btn.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    expect(events[0].target.accessibleName).toBe('Close dialog');
  });

  it('should compute accessible name from aria-labelledby', () => {
    const doc = createDocument(`
      <span id="label-text">Username</span>
      <input id="username-input" aria-labelledby="label-text" />
    `);

    const events: AccessibilityEvent[] = [];
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => 0,
    });

    observer.start();

    const input = doc.getElementById('username-input')!;
    input.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    expect(events[0].target.accessibleName).toBe('Username');
    expect(events[0].target.role).toBe('textbox');
  });

  it('should use implicit role for headings', () => {
    const doc = createDocument(`
      <h1 id="title">Page Title</h1>
    `);

    const events: AccessibilityEvent[] = [];
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => 0,
    });

    observer.start();

    const heading = doc.getElementById('title')!;
    heading.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    expect(events[0].target.role).toBe('heading');
  });

  it('should use explicit role attribute over implicit role', () => {
    const doc = createDocument(`
      <div id="custom-btn" role="button">Click me</div>
    `);

    const events: AccessibilityEvent[] = [];
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => 0,
    });

    observer.start();

    const div = doc.getElementById('custom-btn')!;
    div.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    expect(events[0].target.role).toBe('button');
  });

  it('should use link role for anchor with href', () => {
    const doc = createDocument(`
      <a id="link" href="/home">Home</a>
    `);

    const events: AccessibilityEvent[] = [];
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => 0,
    });

    observer.start();

    const link = doc.getElementById('link')!;
    link.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    expect(events[0].target.role).toBe('link');
    expect(events[0].target.accessibleName).toBe('Home');
  });

  it('should not emit events when stopped', () => {
    const doc = createDocument(`
      <button id="btn1">Submit</button>
    `);

    const events: AccessibilityEvent[] = [];
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => 0,
    });

    observer.start();
    observer.stop();

    const btn = doc.getElementById('btn1')!;
    btn.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    expect(events).toHaveLength(0);
  });

  it('should reset previous target on start', () => {
    const doc = createDocument(`
      <button id="btn1">Submit</button>
      <button id="btn2">Cancel</button>
    `);

    const events: AccessibilityEvent[] = [];
    let timestamp = 0;
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => timestamp++,
    });

    observer.start();

    const btn1 = doc.getElementById('btn1')!;
    btn1.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    observer.stop();
    observer.start();

    const btn2 = doc.getElementById('btn2')!;
    btn2.dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    // After restart, previous target should be null
    expect(events[1].payload).toEqual({
      kind: 'focus_changed',
      previousTarget: null,
    });
  });

  it('should report isActive correctly', () => {
    const doc = createDocument(`<button>Test</button>`);
    const observer = createFocusObserver({
      document: doc,
      onEvent: () => {},
      getTimestamp: () => 0,
    });

    expect(observer.isActive).toBe(false);
    observer.start();
    expect(observer.isActive).toBe(true);
    observer.stop();
    expect(observer.isActive).toBe(false);
  });

  it('should use generateSelector for element identification', () => {
    const doc = createDocument(`
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
      </nav>
    `);

    const events: AccessibilityEvent[] = [];
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => 0,
    });

    observer.start();

    const links = doc.querySelectorAll('a');
    links[1].dispatchEvent(new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true }));

    // Selector should be a valid CSS selector that resolves to the element
    const selector = events[0].target.selector;
    expect(doc.querySelector(selector)).toBe(links[1]);
  });

  it('should assign timestamps from getTimestamp callback', () => {
    const doc = createDocument(`
      <button id="btn1">First</button>
      <button id="btn2">Second</button>
    `);

    const events: AccessibilityEvent[] = [];
    let time = 100;
    const observer = createFocusObserver({
      document: doc,
      onEvent: (event) => events.push(event),
      getTimestamp: () => { time += 50; return time; },
    });

    observer.start();

    doc.getElementById('btn1')!.dispatchEvent(
      new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true })
    );
    doc.getElementById('btn2')!.dispatchEvent(
      new (doc.defaultView!.FocusEvent)('focusin', { bubbles: true })
    );

    expect(events[0].timestamp).toBe(150);
    expect(events[1].timestamp).toBe(200);
  });
});
