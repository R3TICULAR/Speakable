/**
 * Interaction Execution
 *
 * Executes interaction sequences against a document, dispatching proper
 * DOM events (keyboard, mouse, focus) and emitting KEYBOARD_ACTION
 * accessibility events for each action.
 *
 * @module runtime/interactions
 */

import type { InteractionAction, InteractionSequence, AccessibilityEvent } from './types';
import { generateSelector } from './selector';

// ---------------------------------------------------------------------------
// Key Mappings
// ---------------------------------------------------------------------------

interface KeyInfo {
  key: string;
  code: string;
  keyCode: number;
}

const KEY_MAP: Record<string, KeyInfo> = {
  Tab: { key: 'Tab', code: 'Tab', keyCode: 9 },
  Escape: { key: 'Escape', code: 'Escape', keyCode: 27 },
  Enter: { key: 'Enter', code: 'Enter', keyCode: 13 },
  ' ': { key: ' ', code: 'Space', keyCode: 32 },
  ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
  ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
  ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
  ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
};

// ---------------------------------------------------------------------------
// Focusable Element Detection
// ---------------------------------------------------------------------------

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Get all focusable elements in DOM order, excluding those with tabindex="-1".
 */
function getFocusableElements(document: Document): Element[] {
  return Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR));
}

// ---------------------------------------------------------------------------
// Accessible Name and Role (lightweight versions for event target)
// ---------------------------------------------------------------------------

function computeAccessibleName(element: Element, document: Document): string {
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) {
    return ariaLabel.trim();
  }

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy && labelledBy.trim()) {
    const ids = labelledBy.trim().split(/\s+/);
    const parts: string[] = [];
    for (const id of ids) {
      const referenced = document.getElementById(id);
      if (referenced && referenced.textContent) {
        parts.push(referenced.textContent.trim());
      }
    }
    const combined = parts.join(' ');
    if (combined) return combined;
  }

  const textContent = element.textContent;
  if (textContent && textContent.trim()) {
    return textContent.trim();
  }

  return '';
}

function getElementRole(element: Element): string {
  const explicitRole = element.getAttribute('role');
  if (explicitRole && explicitRole.trim()) {
    return explicitRole.trim();
  }

  const tagName = element.tagName.toLowerCase();
  switch (tagName) {
    case 'button':
      return 'button';
    case 'a':
      return element.hasAttribute('href') ? 'link' : 'generic';
    case 'input': {
      const type = (element.getAttribute('type') || 'text').toLowerCase();
      switch (type) {
        case 'button':
        case 'submit':
        case 'reset':
        case 'image':
          return 'button';
        case 'checkbox':
          return 'checkbox';
        case 'radio':
          return 'radio';
        case 'range':
          return 'slider';
        case 'search':
          return 'searchbox';
        default:
          return 'textbox';
      }
    }
    case 'textarea':
      return 'textbox';
    case 'select':
      return element.hasAttribute('multiple') ? 'listbox' : 'combobox';
    case 'dialog':
      return 'dialog';
    default:
      return 'generic';
  }
}

// ---------------------------------------------------------------------------
// Event Target Builder
// ---------------------------------------------------------------------------

function buildEventTarget(element: Element, document: Document) {
  return {
    role: getElementRole(element),
    accessibleName: computeAccessibleName(element, document),
    selector: generateSelector(element),
  };
}

// ---------------------------------------------------------------------------
// Keyboard Event Dispatching
// ---------------------------------------------------------------------------

interface KeyboardEventOptions {
  key: string;
  code: string;
  keyCode: number;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

/**
 * Dispatch a full keyboard event sequence (keydown, keypress, keyup)
 * on the currently focused element.
 */
function dispatchKeyboardEvent(
  document: Document,
  options: KeyboardEventOptions
): void {
  const target = document.activeElement || document.body;

  const commonProps = {
    key: options.key,
    code: options.code,
    keyCode: options.keyCode,
    which: options.keyCode,
    shiftKey: options.shiftKey || false,
    ctrlKey: options.ctrlKey || false,
    altKey: options.altKey || false,
    metaKey: options.metaKey || false,
    bubbles: true,
    cancelable: true,
  };

  target.dispatchEvent(new KeyboardEvent('keydown', commonProps));
  // keypress is deprecated but still dispatched for compatibility
  // Only dispatch keypress for printable characters
  if (options.key.length === 1) {
    target.dispatchEvent(new KeyboardEvent('keypress', commonProps));
  }
  target.dispatchEvent(new KeyboardEvent('keyup', commonProps));
}

// ---------------------------------------------------------------------------
// Key Combo Parsing
// ---------------------------------------------------------------------------

interface ParsedCombo {
  key: string;
  modifiers: string[];
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/**
 * Parse a key combination string like "Control+Shift+A" into its parts.
 */
function parseKeyCombo(combo: string): ParsedCombo {
  const parts = combo.split('+');
  const modifiers: string[] = [];
  let shiftKey = false;
  let ctrlKey = false;
  let altKey = false;
  let metaKey = false;

  // The last part is the key, everything else is a modifier
  const key = parts[parts.length - 1];

  for (let i = 0; i < parts.length - 1; i++) {
    const mod = parts[i].toLowerCase();
    switch (mod) {
      case 'shift':
        shiftKey = true;
        modifiers.push('Shift');
        break;
      case 'control':
      case 'ctrl':
        ctrlKey = true;
        modifiers.push('Control');
        break;
      case 'alt':
        altKey = true;
        modifiers.push('Alt');
        break;
      case 'meta':
      case 'cmd':
      case 'command':
        metaKey = true;
        modifiers.push('Meta');
        break;
    }
  }

  return { key, modifiers, shiftKey, ctrlKey, altKey, metaKey };
}

/**
 * Get KeyInfo for a key string. Falls back to generating info from the key name.
 */
function getKeyInfo(key: string): KeyInfo {
  if (KEY_MAP[key]) {
    return KEY_MAP[key];
  }
  // For single character keys
  if (key.length === 1) {
    return {
      key,
      code: `Key${key.toUpperCase()}`,
      keyCode: key.toUpperCase().charCodeAt(0),
    };
  }
  // For other named keys
  return {
    key,
    code: key,
    keyCode: 0,
  };
}

// ---------------------------------------------------------------------------
// Action Executors
// ---------------------------------------------------------------------------

/**
 * Execute a click action on the element matching the selector.
 * Dispatches mousedown, mouseup, click events, and focuses the element.
 * If the element is not found, emits a WARNING event and continues.
 */
function executeClick(
  selector: string,
  document: Document,
  onEvent: (event: AccessibilityEvent) => void,
  getTimestamp: () => number
): void {
  const element = document.querySelector(selector);

  if (!element) {
    // Emit WARNING for missing element
    const warningEvent: AccessibilityEvent = {
      type: 'WARNING',
      timestamp: getTimestamp(),
      target: {
        role: 'generic',
        accessibleName: '',
        selector: selector,
      },
      payload: {
        kind: 'warning',
        message: `Element not found: ${selector}`,
      },
    };
    onEvent(warningEvent);
    return;
  }

  const eventProps = { bubbles: true, cancelable: true };

  element.dispatchEvent(new MouseEvent('mousedown', eventProps));
  element.dispatchEvent(new MouseEvent('mouseup', eventProps));
  element.dispatchEvent(new MouseEvent('click', eventProps));

  // Focus the element if it's focusable
  if ('focus' in element && typeof (element as HTMLElement).focus === 'function') {
    (element as HTMLElement).focus();
  }
}

/**
 * Execute a tab action: move focus to the next focusable element.
 */
function executeTab(
  document: Document,
  onEvent: (event: AccessibilityEvent) => void,
  getTimestamp: () => number
): void {
  const focusableElements = getFocusableElements(document);
  if (focusableElements.length === 0) return;

  const activeElement = document.activeElement;
  let currentIndex = -1;

  if (activeElement) {
    currentIndex = focusableElements.indexOf(activeElement);
  }

  // Move to next, wrapping around
  const nextIndex = (currentIndex + 1) % focusableElements.length;
  const nextElement = focusableElements[nextIndex] as HTMLElement;

  // Dispatch keyboard event on current element
  dispatchKeyboardEvent(document, {
    ...KEY_MAP['Tab'],
    shiftKey: false,
  });

  // Move focus
  if (nextElement && typeof nextElement.focus === 'function') {
    nextElement.focus();
  }

  // Emit KEYBOARD_ACTION event
  const target = document.activeElement || document.body;
  const keyboardEvent: AccessibilityEvent = {
    type: 'KEYBOARD_ACTION',
    timestamp: getTimestamp(),
    target: buildEventTarget(target as Element, document),
    payload: {
      kind: 'keyboard_action',
      key: 'Tab',
      modifiers: [],
    },
  };
  onEvent(keyboardEvent);
}

/**
 * Execute a shift+tab action: move focus to the previous focusable element.
 */
function executeShiftTab(
  document: Document,
  onEvent: (event: AccessibilityEvent) => void,
  getTimestamp: () => number
): void {
  const focusableElements = getFocusableElements(document);
  if (focusableElements.length === 0) return;

  const activeElement = document.activeElement;
  let currentIndex = -1;

  if (activeElement) {
    currentIndex = focusableElements.indexOf(activeElement);
  }

  // Move to previous, wrapping around
  const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
  const prevElement = focusableElements[prevIndex] as HTMLElement;

  // Dispatch keyboard event on current element
  dispatchKeyboardEvent(document, {
    ...KEY_MAP['Tab'],
    shiftKey: true,
  });

  // Move focus
  if (prevElement && typeof prevElement.focus === 'function') {
    prevElement.focus();
  }

  // Emit KEYBOARD_ACTION event
  const target = document.activeElement || document.body;
  const keyboardEvent: AccessibilityEvent = {
    type: 'KEYBOARD_ACTION',
    timestamp: getTimestamp(),
    target: buildEventTarget(target as Element, document),
    payload: {
      kind: 'keyboard_action',
      key: 'Tab',
      modifiers: ['Shift'],
    },
  };
  onEvent(keyboardEvent);
}

/**
 * Execute a simple keyboard action (escape, enter, space, arrow keys).
 */
function executeKeyAction(
  keyName: string,
  document: Document,
  onEvent: (event: AccessibilityEvent) => void,
  getTimestamp: () => number
): void {
  const keyInfo = KEY_MAP[keyName];
  if (!keyInfo) return;

  dispatchKeyboardEvent(document, {
    ...keyInfo,
  });

  // Emit KEYBOARD_ACTION event
  const target = document.activeElement || document.body;
  const keyboardEvent: AccessibilityEvent = {
    type: 'KEYBOARD_ACTION',
    timestamp: getTimestamp(),
    target: buildEventTarget(target as Element, document),
    payload: {
      kind: 'keyboard_action',
      key: keyName,
      modifiers: [],
    },
  };
  onEvent(keyboardEvent);
}

/**
 * Execute a custom key combination (e.g., "Control+A", "Shift+Tab").
 */
function executeKeyCombo(
  combo: string,
  document: Document,
  onEvent: (event: AccessibilityEvent) => void,
  getTimestamp: () => number
): void {
  const parsed = parseKeyCombo(combo);
  const keyInfo = getKeyInfo(parsed.key);

  dispatchKeyboardEvent(document, {
    ...keyInfo,
    shiftKey: parsed.shiftKey,
    ctrlKey: parsed.ctrlKey,
    altKey: parsed.altKey,
    metaKey: parsed.metaKey,
  });

  // Emit KEYBOARD_ACTION event
  const target = document.activeElement || document.body;
  const keyboardEvent: AccessibilityEvent = {
    type: 'KEYBOARD_ACTION',
    timestamp: getTimestamp(),
    target: buildEventTarget(target as Element, document),
    payload: {
      kind: 'keyboard_action',
      key: parsed.key,
      modifiers: parsed.modifiers,
    },
  };
  onEvent(keyboardEvent);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute a single interaction action against the document.
 *
 * For keyboard actions, dispatches proper KeyboardEvent sequences (keydown, keypress, keyup).
 * For tab/shiftTab, computes next/previous focusable element and moves focus.
 * Emits KEYBOARD_ACTION events for each keyboard action.
 * Handles missing elements by emitting WARNING events and continuing.
 *
 * Click and wait actions do not emit KEYBOARD_ACTION events.
 */
export async function executeAction(
  action: InteractionAction,
  document: Document,
  onEvent: (event: AccessibilityEvent) => void,
  getTimestamp: () => number
): Promise<void> {
  switch (action.type) {
    case 'click':
      executeClick(action.selector, document, onEvent, getTimestamp);
      break;

    case 'tab':
      executeTab(document, onEvent, getTimestamp);
      break;

    case 'shiftTab':
      executeShiftTab(document, onEvent, getTimestamp);
      break;

    case 'escape':
      executeKeyAction('Escape', document, onEvent, getTimestamp);
      break;

    case 'enter':
      executeKeyAction('Enter', document, onEvent, getTimestamp);
      break;

    case 'space':
      executeKeyAction(' ', document, onEvent, getTimestamp);
      break;

    case 'arrowUp':
      executeKeyAction('ArrowUp', document, onEvent, getTimestamp);
      break;

    case 'arrowDown':
      executeKeyAction('ArrowDown', document, onEvent, getTimestamp);
      break;

    case 'arrowLeft':
      executeKeyAction('ArrowLeft', document, onEvent, getTimestamp);
      break;

    case 'arrowRight':
      executeKeyAction('ArrowRight', document, onEvent, getTimestamp);
      break;

    case 'key':
      executeKeyCombo(action.combo, document, onEvent, getTimestamp);
      break;

    case 'wait':
      // Wait does not emit any events
      await new Promise((resolve) => setTimeout(resolve, action.ms));
      break;
  }
}

/**
 * Execute an interaction sequence in order, with DOM stability waits between actions.
 *
 * Runs each action sequentially, waiting for `settleTime` milliseconds between actions
 * to allow the DOM to stabilize. This ensures observers can capture resulting changes
 * before the next action fires.
 *
 * @param sequence - The interaction sequence to execute
 * @param document - The target document
 * @param onEvent - Callback to emit accessibility events
 * @param getTimestamp - Function returning current timestamp in ms since session start
 * @param settleTime - Milliseconds to wait between actions for DOM stability (default: 100)
 */
export async function executeSequence(
  sequence: InteractionSequence,
  document: Document,
  onEvent: (event: AccessibilityEvent) => void,
  getTimestamp: () => number,
  settleTime: number = 100
): Promise<void> {
  for (let i = 0; i < sequence.actions.length; i++) {
    const action = sequence.actions[i];

    await executeAction(action, document, onEvent, getTimestamp);

    // Wait for DOM stability between actions (except after the last action)
    if (i < sequence.actions.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, settleTime));
    }
  }
}
