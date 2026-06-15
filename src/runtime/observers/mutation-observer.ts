/**
 * Mutation Observer for Accessibility-Relevant Attribute Changes
 *
 * Wraps MutationObserver to detect changes to:
 * - `role` attribute → emits ROLE_CHANGED events
 * - `aria-label`, `aria-labelledby` → emits ACCESSIBLE_NAME_CHANGED events
 * - `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled`, `aria-hidden` → emits STATE_CHANGED events
 *
 * Filters out irrelevant mutations (text content in non-live regions, style changes).
 * Uses `attributeOldValue: true` to capture previous values for diff reporting.
 *
 * @module runtime/observers/mutation-observer
 */

import type {
  AccessibilityEvent,
  EventTarget as A11yEventTarget,
  RoleChangedPayload,
  AccessibleNameChangedPayload,
  StateChangedPayload,
} from '../types';
import { generateSelector } from '../selector';

// ---------------------------------------------------------------------------
// Observed attribute sets
// ---------------------------------------------------------------------------

/** Attribute that triggers ROLE_CHANGED */
const ROLE_ATTRIBUTE = 'role';

/** Attributes that trigger ACCESSIBLE_NAME_CHANGED */
const NAME_ATTRIBUTES = new Set(['aria-label', 'aria-labelledby']);

/** Attributes that trigger STATE_CHANGED */
const STATE_ATTRIBUTES = new Set([
  'aria-expanded',
  'aria-selected',
  'aria-checked',
  'aria-disabled',
  'aria-hidden',
]);

/** All observed attributes combined (for MutationObserver attributeFilter) */
const OBSERVED_ATTRIBUTES = [
  ROLE_ATTRIBUTE,
  'aria-label',
  'aria-labelledby',
  'aria-expanded',
  'aria-selected',
  'aria-checked',
  'aria-disabled',
  'aria-hidden',
];

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
// Mutation Observer Types
// ---------------------------------------------------------------------------

/** Callback type for emitting accessibility events from the observer. */
export type MutationEventEmitter = (event: AccessibilityEvent) => void;

export interface MutationObserverOptions {
  /** The document to observe attribute changes on */
  document: Document;
  /** Callback to emit accessibility events */
  onEvent: MutationEventEmitter;
  /** Function to get the current timestamp (ms since session start) */
  getTimestamp: () => number;
}

export interface AccessibilityMutationObserver {
  /** Start observing the document for attribute mutations */
  start(): void;
  /** Stop observing and disconnect the MutationObserver */
  stop(): void;
  /** Whether the observer is currently active */
  readonly isActive: boolean;
}

// ---------------------------------------------------------------------------
// Mutation Observer Implementation
// ---------------------------------------------------------------------------

/**
 * Creates an accessibility-focused MutationObserver that watches for
 * role, accessible name, and ARIA state attribute changes, emitting
 * normalized accessibility events.
 *
 * Only observes attribute mutations on the specific ARIA attributes listed.
 * Text content changes, style changes, and child list mutations are ignored.
 */
export function createMutationObserver(
  options: MutationObserverOptions
): AccessibilityMutationObserver {
  const { document: doc, onEvent, getTimestamp } = options;

  let observer: MutationObserver | null = null;
  let active = false;

  function handleMutations(mutations: MutationRecord[]): void {
    if (!active) return;

    for (const mutation of mutations) {
      if (mutation.type !== 'attributes') {
        continue;
      }

      const attributeName = mutation.attributeName;
      if (!attributeName) {
        continue;
      }

      const target = mutation.target;
      if (!(target instanceof Element)) {
        continue;
      }

      // Route to the appropriate handler based on attribute category
      if (attributeName === ROLE_ATTRIBUTE) {
        handleRoleChange(target, mutation.oldValue);
      } else if (NAME_ATTRIBUTES.has(attributeName)) {
        handleNameChange(target, attributeName, mutation.oldValue);
      } else if (STATE_ATTRIBUTES.has(attributeName)) {
        handleStateChange(target, attributeName, mutation.oldValue);
      }
      // All other attributes are filtered out by the attributeFilter config
    }
  }

  function handleRoleChange(element: Element, oldValue: string | null): void {
    const previousRole = oldValue?.trim() || getImplicitRole(element);
    const newRole = element.getAttribute('role')?.trim() || getImplicitRole(element);

    // Don't emit if the effective role hasn't actually changed
    if (previousRole === newRole) {
      return;
    }

    const eventTarget = buildEventTarget(element);
    const payload: RoleChangedPayload = {
      kind: 'role_changed',
      previousRole,
      newRole,
    };

    onEvent({
      type: 'ROLE_CHANGED',
      timestamp: getTimestamp(),
      target: eventTarget,
      payload,
    });
  }

  function handleNameChange(
    element: Element,
    attributeName: string,
    oldValue: string | null
  ): void {
    let previousName: string;
    let newName: string;

    if (attributeName === 'aria-label') {
      // For aria-label changes, the old value is the previous label
      previousName = oldValue?.trim() || '';
      newName = computeAccessibleName(element, doc);

      // If old value was empty, try to compute what the name was from other sources
      if (!previousName && oldValue === null) {
        // aria-label was just added; previous name was from labelledby or textContent
        // We can approximate by checking other sources
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy) {
          previousName = resolveAriaLabelledBy(element, labelledBy);
        } else {
          previousName = element.textContent?.trim() || '';
        }
      }
    } else {
      // aria-labelledby changed
      // Resolve the old labelledby references for the previous name
      previousName = oldValue ? resolveAriaLabelledBy(element, oldValue) : '';
      if (!previousName && oldValue === null) {
        // aria-labelledby was just added; previous name was from aria-label or textContent
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) {
          previousName = ariaLabel.trim();
        } else {
          previousName = element.textContent?.trim() || '';
        }
      }
      newName = computeAccessibleName(element, doc);
    }

    // Don't emit if the accessible name hasn't actually changed
    if (previousName === newName) {
      return;
    }

    const eventTarget = buildEventTarget(element);
    const payload: AccessibleNameChangedPayload = {
      kind: 'accessible_name_changed',
      previousName,
      newName,
    };

    onEvent({
      type: 'ACCESSIBLE_NAME_CHANGED',
      timestamp: getTimestamp(),
      target: eventTarget,
      payload,
    });
  }

  function handleStateChange(
    element: Element,
    attributeName: string,
    oldValue: string | null
  ): void {
    const currentValue = element.getAttribute(attributeName);

    // Normalize values: treat "true"/"false" as booleans
    const normalizedOld = normalizeStateValue(oldValue);
    const normalizedNew = normalizeStateValue(currentValue);

    // Don't emit if the state hasn't actually changed
    if (normalizedOld === normalizedNew) {
      return;
    }

    const eventTarget = buildEventTarget(element);
    const payload: StateChangedPayload = {
      kind: 'state_changed',
      attribute: attributeName,
      previousValue: normalizedOld,
      newValue: normalizedNew,
    };

    onEvent({
      type: 'STATE_CHANGED',
      timestamp: getTimestamp(),
      target: eventTarget,
      payload,
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function buildEventTarget(element: Element): A11yEventTarget {
    return {
      role: getElementRole(element),
      accessibleName: computeAccessibleName(element, doc),
      selector: generateSelector(element),
    };
  }

  /**
   * Get the implicit role for an element based on tag name.
   * Used as fallback when the explicit role attribute is absent.
   */
  function getImplicitRole(element: Element): string {
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
          default:
            return 'textbox';
        }
      }
      default:
        return 'generic';
    }
  }

  function resolveAriaLabelledBy(
    element: Element,
    idRefs: string
  ): string {
    const ownerDoc = element.ownerDocument;
    if (!ownerDoc) {
      return '';
    }

    const ids = idRefs.trim().split(/\s+/).filter(Boolean);
    const parts: string[] = [];
    for (const id of ids) {
      const referenced = ownerDoc.getElementById(id);
      if (referenced && referenced.textContent) {
        parts.push(referenced.textContent.trim());
      }
    }

    return parts.join(' ');
  }

  function normalizeStateValue(value: string | null): string | boolean | null {
    if (value === null) {
      return null;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return value;
  }

  // ---------------------------------------------------------------------------
  // Public interface
  // ---------------------------------------------------------------------------

  return {
    start(): void {
      if (active) return;
      active = true;

      observer = new MutationObserver(handleMutations);
      observer.observe(doc.body ?? doc.documentElement, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: OBSERVED_ATTRIBUTES,
        subtree: true,
      });
    },

    stop(): void {
      if (!active) return;
      active = false;

      if (observer) {
        observer.disconnect();
        observer = null;
      }
    },

    get isActive(): boolean {
      return active;
    },
  };
}
