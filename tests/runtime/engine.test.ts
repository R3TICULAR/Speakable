/**
 * Unit tests for the RuntimeAccessibilityEngine.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, afterEach } from 'vitest';
import { createEngine } from '../../src/runtime/engine.js';

function setupBody(html: string): void {
  document.body.innerHTML = html;
}

describe('RuntimeAccessibilityEngine', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('createEngine', () => {
    it('should create an engine with isAttached initially false', () => {
      setupBody('<div></div>');
      const engine = createEngine({ document });
      expect(engine.isAttached).toBe(false);
    });

    it('should return empty events before attach', () => {
      setupBody('<div></div>');
      const engine = createEngine({ document });
      expect(engine.getEvents()).toEqual([]);
    });
  });

  describe('attach()', () => {
    it('should set isAttached to true', () => {
      setupBody('<div></div>');
      const engine = createEngine({ document });
      engine.attach();
      expect(engine.isAttached).toBe(true);
      engine.detach();
    });

    it('should be idempotent (calling attach twice does not error)', () => {
      setupBody('<div></div>');
      const engine = createEngine({ document });
      engine.attach();
      engine.attach();
      expect(engine.isAttached).toBe(true);
      engine.detach();
    });

    it('should start collecting focus events after attach', () => {
      setupBody('<button id="btn">Click me</button>');
      const engine = createEngine({ document });
      engine.attach();

      const btn = document.getElementById('btn')!;
      btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const events = engine.getEvents();
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0].type).toBe('FOCUS_CHANGED');
      expect(events[0].target.role).toBe('button');
      expect(events[0].target.accessibleName).toBe('Click me');

      engine.detach();
    });
  });

  describe('detach()', () => {
    it('should set isAttached to false', () => {
      setupBody('<div></div>');
      const engine = createEngine({ document });
      engine.attach();
      engine.detach();
      expect(engine.isAttached).toBe(false);
    });

    it('should stop collecting events after detach', () => {
      setupBody('<button id="btn">Click me</button>');
      const engine = createEngine({ document });
      engine.attach();
      engine.detach();

      const btn = document.getElementById('btn')!;
      btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      expect(engine.getEvents()).toEqual([]);
    });

    it('should be idempotent (calling detach twice does not error)', () => {
      setupBody('<div></div>');
      const engine = createEngine({ document });
      engine.attach();
      engine.detach();
      engine.detach();
      expect(engine.isAttached).toBe(false);
    });
  });

  describe('getEvents()', () => {
    it('should return events in chronological order', () => {
      setupBody(`
        <button id="btn1">First</button>
        <button id="btn2">Second</button>
      `);
      const engine = createEngine({ document });
      engine.attach();

      const btn1 = document.getElementById('btn1')!;
      const btn2 = document.getElementById('btn2')!;
      btn1.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      btn2.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const events = engine.getEvents();
      expect(events.length).toBe(2);
      expect(events[0].target.accessibleName).toBe('First');
      expect(events[1].target.accessibleName).toBe('Second');

      engine.detach();
    });

    it('should return a copy of events (not the internal array)', () => {
      setupBody('<button id="btn">Go</button>');
      const engine = createEngine({ document });
      engine.attach();

      const btn = document.getElementById('btn')!;
      btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const events1 = engine.getEvents();
      const events2 = engine.getEvents();
      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2);

      engine.detach();
    });
  });

  describe('reset()', () => {
    it('should clear collected events', () => {
      setupBody('<button id="btn">Go</button>');
      const engine = createEngine({ document });
      engine.attach();

      const btn = document.getElementById('btn')!;
      btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      expect(engine.getEvents().length).toBeGreaterThan(0);
      engine.reset();
      expect(engine.getEvents()).toEqual([]);

      engine.detach();
    });

    it('should not detach observers (new events still collected after reset)', () => {
      setupBody(`
        <button id="btn1">A</button>
        <button id="btn2">B</button>
      `);
      const engine = createEngine({ document });
      engine.attach();

      const btn1 = document.getElementById('btn1')!;
      btn1.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      engine.reset();

      const btn2 = document.getElementById('btn2')!;
      btn2.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const events = engine.getEvents();
      expect(events.length).toBe(1);
      expect(events[0].target.accessibleName).toBe('B');
      expect(engine.isAttached).toBe(true);

      engine.detach();
    });
  });

  describe('monotonically increasing timestamps', () => {
    it('should assign non-decreasing timestamps to events', () => {
      setupBody(`
        <button id="btn1">A</button>
        <button id="btn2">B</button>
        <button id="btn3">C</button>
      `);
      const engine = createEngine({ document });
      engine.attach();

      const btn1 = document.getElementById('btn1')!;
      const btn2 = document.getElementById('btn2')!;
      const btn3 = document.getElementById('btn3')!;
      btn1.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      btn2.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      btn3.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const events = engine.getEvents();
      for (let i = 1; i < events.length; i++) {
        expect(events[i].timestamp).toBeGreaterThanOrEqual(events[i - 1].timestamp);
      }

      engine.detach();
    });

    it('should have timestamps relative to session start (starting near 0)', () => {
      setupBody('<button id="btn">Go</button>');
      const engine = createEngine({ document });
      engine.attach();

      const btn = document.getElementById('btn')!;
      btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const events = engine.getEvents();
      expect(events[0].timestamp).toBeGreaterThanOrEqual(0);
      expect(events[0].timestamp).toBeLessThan(1000);

      engine.detach();
    });
  });

  describe('mutation observer integration', () => {
    it('should collect STATE_CHANGED events from mutation observer', async () => {
      setupBody('<button id="btn" aria-expanded="false">Toggle</button>');
      const engine = createEngine({ document });
      engine.attach();

      const btn = document.getElementById('btn')!;
      btn.setAttribute('aria-expanded', 'true');

      // MutationObserver callbacks are async
      await new Promise((resolve) => setTimeout(resolve, 0));

      const events = engine.getEvents();
      const stateEvent = events.find((e) => e.type === 'STATE_CHANGED');
      expect(stateEvent).toBeDefined();
      expect(stateEvent!.payload).toMatchObject({
        kind: 'state_changed',
        attribute: 'aria-expanded',
        previousValue: false,
        newValue: true,
      });

      engine.detach();
    });
  });

  describe('live region observer integration', () => {
    it('should collect ANNOUNCEMENT events from live region observer', async () => {
      setupBody('<div id="live" aria-live="polite"></div>');
      const engine = createEngine({ document });
      engine.attach();

      const live = document.getElementById('live')!;
      live.textContent = 'New announcement';

      // MutationObserver callbacks are async
      await new Promise((resolve) => setTimeout(resolve, 0));

      const events = engine.getEvents();
      const announcement = events.find((e) => e.type === 'ANNOUNCEMENT');
      expect(announcement).toBeDefined();
      expect(announcement!.payload).toMatchObject({
        kind: 'announcement',
        politeness: 'polite',
        text: 'New announcement',
      });

      engine.detach();
    });
  });

  describe('dialog observer integration', () => {
    it('should collect DIALOG_OPENED events from dialog observer', async () => {
      setupBody('<dialog id="dlg" aria-label="Confirm">Content</dialog>');
      const engine = createEngine({ document });
      engine.attach();

      const dlg = document.getElementById('dlg')!;
      dlg.setAttribute('open', '');

      // MutationObserver callbacks are async
      await new Promise((resolve) => setTimeout(resolve, 0));

      const events = engine.getEvents();
      const dialogEvent = events.find((e) => e.type === 'DIALOG_OPENED');
      expect(dialogEvent).toBeDefined();
      expect(dialogEvent!.payload).toMatchObject({
        kind: 'dialog_opened',
        dialogName: 'Confirm',
        isModal: false,
      });

      engine.detach();
    });

    it('should expose open dialogs through dialogObserver', async () => {
      setupBody('<dialog id="dlg" aria-label="My Dialog">Content</dialog>');
      const engine = createEngine({ document });
      engine.attach();

      const dlg = document.getElementById('dlg')!;
      dlg.setAttribute('open', '');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(engine.dialogObserver.getOpenDialogs()).toContain('My Dialog');

      engine.detach();
    });
  });

  describe('multiple observer coordination', () => {
    it('should collect events from all observers into a single stream', async () => {
      setupBody(`
        <button id="btn" aria-expanded="false">Menu</button>
        <div id="live" aria-live="assertive"></div>
      `);
      const engine = createEngine({ document });
      engine.attach();

      // Focus event
      const btn = document.getElementById('btn')!;
      btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      // State change
      btn.setAttribute('aria-expanded', 'true');

      // Live region
      const live = document.getElementById('live')!;
      live.textContent = 'Alert!';

      await new Promise((resolve) => setTimeout(resolve, 0));

      const events = engine.getEvents();
      const types = events.map((e) => e.type);

      expect(types).toContain('FOCUS_CHANGED');
      expect(types).toContain('STATE_CHANGED');
      expect(types).toContain('ANNOUNCEMENT');

      engine.detach();
    });
  });
});
