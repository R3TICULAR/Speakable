/**
 * Focus Observer
 *
 * Observes focus changes on a document and emits FOCUS_CHANGED accessibility
 * events. Tracks the previously focused element to populate the previousTarget
 * field in each event.
 *
 * @module runtime/observers/focus-observer
 */

import type { AccessibilityEvent, EventTarget as A11yEventTarget } from '../types';
import { generateSelector } from '../selector';

// ---------------------------------------------------------------------------
// Accessible Name Computation (self-contained)
// ---------------------------------------------------------------------------

/**
 * Compute the accessible name for an element.
 * Checks aria-label, then aria-labelledby (resolves referenced element textContent),
 * then falls back to the element's own textContent.
 */
function computeAccessibleName(element: Element, document: Document): string {
  // 1. aria-label takes precedence
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) {
    return ariaLabel.trim();
  }

  // 2. aria-labelledby: resolve referenced element(s) text content
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
    if (combined) {
      return combined;
    }
  }

  // 3. Fall back to element's own textContent
  const textContent = element.textContent;
  if (textContent && textContent.trim()) {
    return textContent.trim();
  }

  return '';
}

// ---------------------------------------------------------------------------
// Implicit Role Mapping
// ---------------------------------------------------------------------------

/**
 * Determine the ARIA role of an element.
 * Checks the explicit `role` attribute first, then falls back to implicit
 * role mapping based on tag name and attributes.
 */
function getElementRole(element: Element): string {
  // Explicit role takes priority
  const explicitRole = element.getAttribute('role');
  if (explicitRole && explicitRole.trim()) {
    return explicitRole.trim();
  }

  // Implicit role mapping
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
    case 'nav':
      return 'navigation';
    case 'main':
      return 'main';
    case 'header':
      return 'banner';
    case 'footer':
      return 'contentinfo';
    case 'aside':
      return 'complementary';
    case 'form':
      return 'form';
    case 'section':
      return element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')
        ? 'region'
        : 'generic';
    case 'article':
      return 'article';
    case 'dialog':
      return 'dialog';
    case 'table':
      return 'table';
    case 'ul':
    case 'ol':
      return 'list';
    case 'li':
      return 'listitem';
    case 'img':
      return element.getAttribute('alt') === '' ? 'presentation' : 'img';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'option':
      return 'option';
    case 'progress':
      return 'progressbar';
    case 'output':
      return 'status';
    case 'menu':
      return 'menu';
    default:
      return 'generic';
  }
}

// ---------------------------------------------------------------------------
// Focus Observer
// ---------------------------------------------------------------------------

/** Callback type for emitting accessibility events from the observer. */
export type FocusEventEmitter = (event: AccessibilityEvent) => void;

export interface FocusObserverOptions {
  /** The document to observe focus changes on */
  document: Document;
  /** Callback to emit accessibility events */
  onEvent: FocusEventEmitter;
  /** Function to get the current timestamp (ms since session start) */
  getTimestamp: () => number;
}

export interface FocusObserver {
  /** Start listening for focus changes */
  start(): void;
  /** Stop listening for focus changes */
  stop(): void;
  /** Whether the observer is currently active */
  readonly isActive: boolean;
}

/**
 * Creates a FocusObserver that listens to focusin events on the document
 * and emits FOCUS_CHANGED accessibility events.
 */
export function createFocusObserver(options: FocusObserverOptions): FocusObserver {
  const { document: doc, onEvent, getTimestamp } = options;

  let active = false;
  let previousTarget: A11yEventTarget | null = null;

  function buildEventTarget(element: Element): A11yEventTarget {
    return {
      role: getElementRole(element),
      accessibleName: computeAccessibleName(element, doc),
      selector: generateSelector(element),
    };
  }

  function handleFocusIn(event: Event): void {
    if (!active) return;

    const target = event.target;
    if (!target || !(target instanceof doc.defaultView!.Element)) {
      return;
    }

    const currentTarget = buildEventTarget(target);

    const a11yEvent: AccessibilityEvent = {
      type: 'FOCUS_CHANGED',
      timestamp: getTimestamp(),
      target: currentTarget,
      payload: {
        kind: 'focus_changed',
        previousTarget: previousTarget,
      },
    };

    onEvent(a11yEvent);
    previousTarget = currentTarget;
  }

  return {
    start(): void {
      if (active) return;
      active = true;
      previousTarget = null;
      doc.addEventListener('focusin', handleFocusIn);
    },

    stop(): void {
      if (!active) return;
      active = false;
      doc.removeEventListener('focusin', handleFocusIn);
    },

    get isActive(): boolean {
      return active;
    },
  };
}
