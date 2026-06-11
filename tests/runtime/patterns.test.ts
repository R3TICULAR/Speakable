/**
 * Unit tests for built-in interaction patterns.
 *
 * Tests that each pattern returns a valid InteractionSequence with expected
 * actions, and that selector overrides work correctly.
 */

import { describe, it, expect } from 'vitest';
import { getBuiltinPattern } from '../../src/runtime/patterns';
import type { PatternSelectorMap } from '../../src/runtime/patterns';

describe('getBuiltinPattern', () => {
  describe('modal-dialog', () => {
    it('returns a sequence with click trigger, tabs, and escape', () => {
      const seq = getBuiltinPattern('modal-dialog');

      expect(seq.description).toContain('Modal dialog');
      expect(seq.actions.length).toBeGreaterThan(0);

      // First action: click the trigger
      expect(seq.actions[0]).toEqual({ type: 'click', selector: 'button' });

      // Should have tab actions for navigating dialog content
      const tabActions = seq.actions.filter((a) => a.type === 'tab');
      expect(tabActions.length).toBeGreaterThanOrEqual(1);

      // Should end with escape to close dialog
      const lastActions = seq.actions.slice(-1);
      expect(lastActions[0]).toEqual({ type: 'escape' });
    });

    it('uses custom trigger selector when provided', () => {
      const selectors: PatternSelectorMap = { trigger: '#open-dialog-btn' };
      const seq = getBuiltinPattern('modal-dialog', selectors);

      expect(seq.actions[0]).toEqual({ type: 'click', selector: '#open-dialog-btn' });
    });
  });

  describe('combobox', () => {
    it('returns a sequence with input focus, type, arrows, and enter', () => {
      const seq = getBuiltinPattern('combobox');

      expect(seq.description).toContain('Combobox');
      expect(seq.actions.length).toBeGreaterThan(0);

      // First action: click/focus the input
      expect(seq.actions[0]).toEqual({
        type: 'click',
        selector: '[role="combobox"], input[type="text"]',
      });

      // Should have a key action for typing
      const keyActions = seq.actions.filter((a) => a.type === 'key');
      expect(keyActions.length).toBeGreaterThanOrEqual(1);

      // Should have arrowDown for navigating options
      const arrowDownActions = seq.actions.filter((a) => a.type === 'arrowDown');
      expect(arrowDownActions.length).toBeGreaterThanOrEqual(1);

      // Should end with enter to select
      const enterActions = seq.actions.filter((a) => a.type === 'enter');
      expect(enterActions.length).toBeGreaterThanOrEqual(1);
    });

    it('uses custom input selector when provided', () => {
      const selectors: PatternSelectorMap = { input: '.my-combobox-input' };
      const seq = getBuiltinPattern('combobox', selectors);

      expect(seq.actions[0]).toEqual({ type: 'click', selector: '.my-combobox-input' });
    });
  });

  describe('tabs', () => {
    it('returns a sequence with tablist focus, arrows, enter, and space', () => {
      const seq = getBuiltinPattern('tabs');

      expect(seq.description).toContain('Tabs');
      expect(seq.actions.length).toBeGreaterThan(0);

      // First action: click/focus the tablist container
      expect(seq.actions[0]).toEqual({ type: 'click', selector: '[role="tablist"]' });

      // Should have arrow right actions for tab navigation
      const arrowRightActions = seq.actions.filter((a) => a.type === 'arrowRight');
      expect(arrowRightActions.length).toBeGreaterThanOrEqual(1);

      // Should have enter and/or space for activation
      const enterActions = seq.actions.filter((a) => a.type === 'enter');
      const spaceActions = seq.actions.filter((a) => a.type === 'space');
      expect(enterActions.length + spaceActions.length).toBeGreaterThanOrEqual(1);
    });

    it('uses custom container selector when provided', () => {
      const selectors: PatternSelectorMap = { container: '.tab-nav' };
      const seq = getBuiltinPattern('tabs', selectors);

      expect(seq.actions[0]).toEqual({ type: 'click', selector: '.tab-nav' });
    });
  });

  describe('accordion', () => {
    it('returns a sequence with header focus, enter/space toggle, and arrow navigation', () => {
      const seq = getBuiltinPattern('accordion');

      expect(seq.description).toContain('Accordion');
      expect(seq.actions.length).toBeGreaterThan(0);

      // First action: click/focus the accordion header
      expect(seq.actions[0]).toEqual({
        type: 'click',
        selector: 'button[aria-expanded]',
      });

      // Should have enter and space for toggling
      const enterActions = seq.actions.filter((a) => a.type === 'enter');
      const spaceActions = seq.actions.filter((a) => a.type === 'space');
      expect(enterActions.length).toBeGreaterThanOrEqual(1);
      expect(spaceActions.length).toBeGreaterThanOrEqual(1);

      // Should have arrow navigation between headers
      const arrowDownActions = seq.actions.filter((a) => a.type === 'arrowDown');
      expect(arrowDownActions.length).toBeGreaterThanOrEqual(1);
    });

    it('uses custom trigger selector when provided', () => {
      const selectors: PatternSelectorMap = { trigger: '.accordion-header' };
      const seq = getBuiltinPattern('accordion', selectors);

      expect(seq.actions[0]).toEqual({ type: 'click', selector: '.accordion-header' });
    });
  });

  describe('selector override', () => {
    it('ignores irrelevant selectors for each pattern', () => {
      // Providing input selector to modal-dialog should not affect it
      const seq = getBuiltinPattern('modal-dialog', { input: '.some-input' });
      expect(seq.actions[0]).toEqual({ type: 'click', selector: 'button' });
    });

    it('all patterns return valid InteractionSequence with description and actions', () => {
      const patterns: Array<'modal-dialog' | 'combobox' | 'tabs' | 'accordion'> = [
        'modal-dialog',
        'combobox',
        'tabs',
        'accordion',
      ];

      for (const name of patterns) {
        const seq = getBuiltinPattern(name);
        expect(seq.description).toBeTruthy();
        expect(Array.isArray(seq.actions)).toBe(true);
        expect(seq.actions.length).toBeGreaterThan(0);
      }
    });
  });
});
