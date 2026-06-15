/**
 * Unit tests for the Heuristic Warning Analyzer.
 *
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { createHeuristicAnalyzer } from '../../src/runtime/heuristics.js';
import type { AccessibilityEvent, EventTarget as A11yEventTarget } from '../../src/runtime/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTarget(overrides?: Partial<A11yEventTarget>): A11yEventTarget {
  return {
    role: 'button',
    accessibleName: 'Test',
    selector: 'body > button',
    ...overrides,
  };
}

function makeDialogOpenedEvent(
  timestamp: number,
  isModal: boolean,
  dialogSelector = 'body > dialog'
): AccessibilityEvent {
  return {
    type: 'DIALOG_OPENED',
    timestamp,
    target: {
      role: 'dialog',
      accessibleName: 'Confirm',
      selector: dialogSelector,
    },
    payload: {
      kind: 'dialog_opened',
      dialogName: 'Confirm',
      isModal,
    },
  };
}

function makeDialogClosedEvent(
  timestamp: number,
  dialogSelector = 'body > dialog'
): AccessibilityEvent {
  return {
    type: 'DIALOG_CLOSED',
    timestamp,
    target: {
      role: 'dialog',
      accessibleName: 'Confirm',
      selector: dialogSelector,
    },
    payload: {
      kind: 'dialog_closed',
      dialogName: 'Confirm',
    },
  };
}

function makeFocusChangedEvent(
  timestamp: number,
  selector: string,
  previousSelector?: string
): AccessibilityEvent {
  return {
    type: 'FOCUS_CHANGED',
    timestamp,
    target: {
      role: 'button',
      accessibleName: 'Focused Element',
      selector,
    },
    payload: {
      kind: 'focus_changed',
      previousTarget: previousSelector
        ? { role: 'button', accessibleName: 'Prev', selector: previousSelector }
        : null,
    },
  };
}

function makeAnnouncementEvent(timestamp: number): AccessibilityEvent {
  return {
    type: 'ANNOUNCEMENT',
    timestamp,
    target: {
      role: 'region',
      accessibleName: 'Status',
      selector: 'body > div[aria-live]',
    },
    payload: {
      kind: 'announcement',
      politeness: 'polite',
      text: 'Something happened',
    },
  };
}

function makeKeyboardActionEvent(timestamp: number): AccessibilityEvent {
  return {
    type: 'KEYBOARD_ACTION',
    timestamp,
    target: makeTarget(),
    payload: {
      kind: 'keyboard_action',
      key: 'Enter',
      modifiers: [],
    },
  };
}

function makeStateChangedEvent(timestamp: number): AccessibilityEvent {
  return {
    type: 'STATE_CHANGED',
    timestamp,
    target: makeTarget(),
    payload: {
      kind: 'state_changed',
      attribute: 'aria-expanded',
      previousValue: false,
      newValue: true,
    },
  };
}

function makeDomMutationEvent(
  timestamp: number,
  selector: string
): AccessibilityEvent {
  return {
    type: 'DOM_MUTATION',
    timestamp,
    target: {
      role: 'button',
      accessibleName: 'Removed',
      selector,
    },
    payload: {
      kind: 'state_changed',
      attribute: 'aria-hidden',
      previousValue: null,
      newValue: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HeuristicAnalyzer', () => {
  describe('createHeuristicAnalyzer', () => {
    it('should create an analyzer with default config', () => {
      const analyzer = createHeuristicAnalyzer();
      expect(analyzer).toBeDefined();
      expect(analyzer.openDialogs).toEqual([]);
    });

    it('should accept partial config overrides', () => {
      const analyzer = createHeuristicAnalyzer({
        dialogFocusTimeout: 200,
      });
      expect(analyzer).toBeDefined();
    });
  });

  describe('Requirement 12.1: Focus not moved into modal dialog', () => {
    it('should emit warning when focus is not moved into modal dialog within timeout', () => {
      const analyzer = createHeuristicAnalyzer({ dialogFocusTimeout: 100 });

      // Dialog opens at t=0
      const dialogOpen = makeDialogOpenedEvent(0, true);
      let warnings = analyzer.process(dialogOpen);
      expect(warnings).toEqual([]);

      // Some other event arrives at t=150 (after the 100ms timeout)
      // without focus being moved into the dialog
      const laterEvent = makeAnnouncementEvent(150);
      warnings = analyzer.process(laterEvent);

      // Should contain a warning about focus not being moved
      expect(warnings.some(
        (w) => w.type === 'WARNING' &&
          (w.payload as { message: string }).message === 'Focus was not moved into modal dialog'
      )).toBe(true);
    });

    it('should NOT emit warning when focus moves into dialog within timeout', () => {
      const analyzer = createHeuristicAnalyzer({ dialogFocusTimeout: 100 });

      // Dialog opens at t=0
      const dialogOpen = makeDialogOpenedEvent(0, true, 'body > dialog');
      analyzer.process(dialogOpen);

      // Focus moves inside dialog at t=50 (within timeout)
      const focusInDialog = makeFocusChangedEvent(50, 'body > dialog > button');
      const warnings = analyzer.process(focusInDialog);

      // No dialog focus warning
      const dialogWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message === 'Focus was not moved into modal dialog'
      );
      expect(dialogWarnings).toEqual([]);
    });

    it('should NOT emit warning for non-modal dialogs', () => {
      const analyzer = createHeuristicAnalyzer({ dialogFocusTimeout: 100 });

      // Non-modal dialog opens at t=0
      const dialogOpen = makeDialogOpenedEvent(0, false);
      analyzer.process(dialogOpen);

      // Event at t=200 (well past timeout)
      const laterEvent = makeAnnouncementEvent(200);
      const warnings = analyzer.process(laterEvent);

      // No warning - non-modal dialogs don't require focus management
      const dialogWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message === 'Focus was not moved into modal dialog'
      );
      expect(dialogWarnings).toEqual([]);
    });
  });

  describe('Requirement 12.2: Focus escaped modal dialog', () => {
    it('should emit warning when focus moves outside open modal dialog', () => {
      const analyzer = createHeuristicAnalyzer();

      // Modal dialog opens
      const dialogOpen = makeDialogOpenedEvent(0, true, 'body > dialog');
      analyzer.process(dialogOpen);

      // Focus moves inside dialog first (to resolve focus check)
      const focusIn = makeFocusChangedEvent(10, 'body > dialog > button');
      analyzer.process(focusIn);

      // Focus escapes to element outside dialog
      const focusEscape = makeFocusChangedEvent(100, 'body > nav > a');
      const warnings = analyzer.process(focusEscape);

      expect(warnings.some(
        (w) => w.type === 'WARNING' &&
          (w.payload as { message: string }).message === 'Focus escaped modal dialog'
      )).toBe(true);
    });

    it('should NOT emit warning when focus moves within modal dialog', () => {
      const analyzer = createHeuristicAnalyzer();

      // Modal dialog opens
      const dialogOpen = makeDialogOpenedEvent(0, true, 'body > dialog');
      analyzer.process(dialogOpen);

      // Focus moves within the dialog
      const focusIn = makeFocusChangedEvent(10, 'body > dialog > input');
      const warnings = analyzer.process(focusIn);

      const escapeWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message === 'Focus escaped modal dialog'
      );
      expect(escapeWarnings).toEqual([]);
    });

    it('should NOT emit focus escape warning after dialog is closed', () => {
      const analyzer = createHeuristicAnalyzer();

      // Modal dialog opens
      const dialogOpen = makeDialogOpenedEvent(0, true, 'body > dialog');
      analyzer.process(dialogOpen);

      // Focus into dialog
      const focusIn = makeFocusChangedEvent(10, 'body > dialog > button');
      analyzer.process(focusIn);

      // Dialog closes
      const dialogClose = makeDialogClosedEvent(50, 'body > dialog');
      analyzer.process(dialogClose);

      // Focus moves to element outside (after close - this is expected)
      const focusOut = makeFocusChangedEvent(60, 'body > button');
      const warnings = analyzer.process(focusOut);

      const escapeWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message === 'Focus escaped modal dialog'
      );
      expect(escapeWarnings).toEqual([]);
    });
  });

  describe('Requirement 12.3: Rapid announcements', () => {
    it('should emit warning when more than 3 announcements occur within 500ms', () => {
      const analyzer = createHeuristicAnalyzer({
        rapidAnnouncementWindow: 500,
        rapidAnnouncementThreshold: 3,
      });

      // 4 announcements within 500ms
      analyzer.process(makeAnnouncementEvent(0));
      analyzer.process(makeAnnouncementEvent(100));
      analyzer.process(makeAnnouncementEvent(200));
      const warnings = analyzer.process(makeAnnouncementEvent(300));

      expect(warnings.some(
        (w) => w.type === 'WARNING' &&
          (w.payload as { message: string }).message ===
            'Rapid announcements detected: assistive technology users may miss content'
      )).toBe(true);
    });

    it('should NOT emit warning when announcements are within threshold', () => {
      const analyzer = createHeuristicAnalyzer({
        rapidAnnouncementWindow: 500,
        rapidAnnouncementThreshold: 3,
      });

      // Only 3 announcements (at threshold, not exceeding)
      analyzer.process(makeAnnouncementEvent(0));
      analyzer.process(makeAnnouncementEvent(100));
      const warnings = analyzer.process(makeAnnouncementEvent(200));

      const rapidWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message ===
          'Rapid announcements detected: assistive technology users may miss content'
      );
      expect(rapidWarnings).toEqual([]);
    });

    it('should NOT emit warning when announcements are spread outside the window', () => {
      const analyzer = createHeuristicAnalyzer({
        rapidAnnouncementWindow: 500,
        rapidAnnouncementThreshold: 3,
      });

      // Announcements spread across more than 500ms
      analyzer.process(makeAnnouncementEvent(0));
      analyzer.process(makeAnnouncementEvent(200));
      analyzer.process(makeAnnouncementEvent(400));
      // This one is at 600ms - the first one at 0 is now outside the window
      const warnings = analyzer.process(makeAnnouncementEvent(600));

      const rapidWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message ===
          'Rapid announcements detected: assistive technology users may miss content'
      );
      expect(rapidWarnings).toEqual([]);
    });
  });

  describe('Requirement 12.4: Keyboard action with no accessibility response', () => {
    it('should emit warning when keyboard action gets no response within timeout', () => {
      const analyzer = createHeuristicAnalyzer({ keyboardResponseTimeout: 200 });

      // Keyboard action at t=0
      analyzer.process(makeKeyboardActionEvent(0));

      // Next event at t=250 (past 200ms timeout) - not an accessibility response type
      // Actually any event after timeout triggers the check
      const laterEvent = makeKeyboardActionEvent(250);
      const warnings = analyzer.process(laterEvent);

      expect(warnings.some(
        (w) => w.type === 'WARNING' &&
          (w.payload as { message: string }).message ===
            'Keyboard action produced no accessibility response'
      )).toBe(true);
    });

    it('should NOT emit warning when keyboard action gets state change response', () => {
      const analyzer = createHeuristicAnalyzer({ keyboardResponseTimeout: 200 });

      // Keyboard action at t=0
      analyzer.process(makeKeyboardActionEvent(0));

      // State change at t=50 (within timeout)
      const stateChange = makeStateChangedEvent(50);
      const warnings = analyzer.process(stateChange);

      const noResponseWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message ===
          'Keyboard action produced no accessibility response'
      );
      expect(noResponseWarnings).toEqual([]);
    });

    it('should NOT emit warning when keyboard action gets focus change response', () => {
      const analyzer = createHeuristicAnalyzer({ keyboardResponseTimeout: 200 });

      // Keyboard action at t=0
      analyzer.process(makeKeyboardActionEvent(0));

      // Focus change at t=30 (within timeout)
      const focusChange = makeFocusChangedEvent(30, 'body > input');
      const warnings = analyzer.process(focusChange);

      const noResponseWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message ===
          'Keyboard action produced no accessibility response'
      );
      expect(noResponseWarnings).toEqual([]);
    });

    it('should NOT emit warning when keyboard action gets announcement response', () => {
      const analyzer = createHeuristicAnalyzer({ keyboardResponseTimeout: 200 });

      // Keyboard action at t=0
      analyzer.process(makeKeyboardActionEvent(0));

      // Announcement at t=100 (within timeout)
      const announcement = makeAnnouncementEvent(100);
      const warnings = analyzer.process(announcement);

      const noResponseWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message ===
          'Keyboard action produced no accessibility response'
      );
      expect(noResponseWarnings).toEqual([]);
    });
  });

  describe('Requirement 12.5: Focused element removed without focus management', () => {
    it('should emit warning when focused element is removed from DOM', () => {
      const analyzer = createHeuristicAnalyzer();

      // Focus moves to an element
      const focusEvent = makeFocusChangedEvent(0, 'body > button#save');
      analyzer.process(focusEvent);

      // DOM mutation removes that element
      const mutation = makeDomMutationEvent(50, 'body > button#save');
      const warnings = analyzer.process(mutation);

      expect(warnings.some(
        (w) => w.type === 'WARNING' &&
          (w.payload as { message: string }).message ===
            'Focused element removed without focus management'
      )).toBe(true);
    });

    it('should NOT emit warning when a non-focused element is removed', () => {
      const analyzer = createHeuristicAnalyzer();

      // Focus on one element
      const focusEvent = makeFocusChangedEvent(0, 'body > button#save');
      analyzer.process(focusEvent);

      // A different element is removed
      const mutation = makeDomMutationEvent(50, 'body > div#toast');
      const warnings = analyzer.process(mutation);

      const removeWarnings = warnings.filter(
        (w) => (w.payload as { message: string }).message ===
          'Focused element removed without focus management'
      );
      expect(removeWarnings).toEqual([]);
    });
  });

  describe('openDialogs property', () => {
    it('should track open dialogs', () => {
      const analyzer = createHeuristicAnalyzer();

      const dialogOpen = makeDialogOpenedEvent(0, true, 'body > dialog#confirm');
      analyzer.process(dialogOpen);

      expect(analyzer.openDialogs).toContain('body > dialog#confirm');
    });

    it('should remove closed dialogs', () => {
      const analyzer = createHeuristicAnalyzer();

      const dialogOpen = makeDialogOpenedEvent(0, true, 'body > dialog#confirm');
      analyzer.process(dialogOpen);

      const dialogClose = makeDialogClosedEvent(100, 'body > dialog#confirm');
      analyzer.process(dialogClose);

      expect(analyzer.openDialogs).not.toContain('body > dialog#confirm');
    });

    it('should track multiple open dialogs', () => {
      const analyzer = createHeuristicAnalyzer();

      analyzer.process(makeDialogOpenedEvent(0, true, 'body > dialog#first'));
      analyzer.process(makeDialogOpenedEvent(50, true, 'body > dialog#second'));

      expect(analyzer.openDialogs).toHaveLength(2);
      expect(analyzer.openDialogs).toContain('body > dialog#first');
      expect(analyzer.openDialogs).toContain('body > dialog#second');
    });
  });
});
