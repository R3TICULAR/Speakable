/**
 * Dialog Observer
 *
 * Observes dialog open/close events on a document and emits DIALOG_OPENED
 * and DIALOG_CLOSED accessibility events. Tracks:
 * - Native `<dialog>` elements gaining/losing the `open` attribute
 * - Elements with role="dialog" or role="alertdialog" being added to the DOM
 *   or having aria-modal change
 *
 * Maintains an internal stack of open dialogs for use by the heuristic
 * warnings module.
 *
 * @module runtime/observers/dialog-observer
 */

import type { AccessibilityEvent, EventTarget as A11yEventTarget } from '../types';
import { generateSelector } from '../selector';

// ---------------------------------------------------------------------------
// Accessible Name Computation (self-contained, dialog-aware)
// ---------------------------------------------------------------------------

/**
 * Compute the accessible name for a dialog element.
 * Checks aria-label, then aria-labelledby, then title attribute,
 * then falls back to the first heading's textContent within the dialog.
 */
function computeDialogAccessibleName(element: Element, document: Document): string {
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

  // 3. title attribute
  const title = element.getAttribute('title');
  if (title && title.trim()) {
    return title.trim();
  }

  // 4. First heading within the dialog
  const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.textContent && heading.textContent.trim()) {
    return heading.textContent.trim();
  }

  return '';
}

// ---------------------------------------------------------------------------
// Role Resolution
// ---------------------------------------------------------------------------

/**
 * Determine the role of a dialog element.
 * Returns the explicit role attribute value, or 'dialog' for native <dialog>.
 */
function getDialogRole(element: Element): string {
  const explicitRole = element.getAttribute('role');
  if (explicitRole && explicitRole.trim()) {
    return explicitRole.trim();
  }

  if (element.tagName.toLowerCase() === 'dialog') {
    return 'dialog';
  }

  return 'generic';
}

// ---------------------------------------------------------------------------
// Dialog Detection Helpers
// ---------------------------------------------------------------------------

/**
 * Check if an element is a dialog (native <dialog> or role="dialog" / role="alertdialog").
 */
function isDialogElement(element: Element): boolean {
  if (element.tagName.toLowerCase() === 'dialog') {
    return true;
  }
  const role = element.getAttribute('role');
  return role === 'dialog' || role === 'alertdialog';
}

/**
 * Determine if a dialog is modal.
 * A dialog is modal if:
 * - It's a native <dialog> opened via showModal() (has the `open` attribute and is the top layer)
 * - It has aria-modal="true"
 */
function isDialogModal(element: Element): boolean {
  const ariaModal = element.getAttribute('aria-modal');
  if (ariaModal === 'true') {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Dialog Observer
// ---------------------------------------------------------------------------

/** Callback type for emitting accessibility events from the observer. */
export type DialogEventEmitter = (event: AccessibilityEvent) => void;

export interface DialogObserverOptions {
  /** The document to observe dialog events on */
  document: Document;
  /** Callback to emit accessibility events */
  onEvent: DialogEventEmitter;
  /** Function to get the current timestamp (ms since session start) */
  getTimestamp: () => number;
}

export interface DialogObserver {
  /** Start observing dialog open/close events */
  start(): void;
  /** Stop observing dialog events */
  stop(): void;
  /** Whether the observer is currently active */
  readonly isActive: boolean;
  /** Get the current stack of open dialog names */
  getOpenDialogs(): string[];
}

/** Internal representation of a tracked open dialog */
interface TrackedDialog {
  element: Element;
  name: string;
  selector: string;
}

/**
 * Creates a DialogObserver that watches for dialog open/close events
 * and emits DIALOG_OPENED / DIALOG_CLOSED accessibility events.
 */
export function createDialogObserver(options: DialogObserverOptions): DialogObserver {
  const { document: doc, onEvent, getTimestamp } = options;

  let active = false;
  let mutationObserver: MutationObserver | null = null;
  const openDialogStack: TrackedDialog[] = [];

  function buildEventTarget(element: Element): A11yEventTarget {
    return {
      role: getDialogRole(element),
      accessibleName: computeDialogAccessibleName(element, doc),
      selector: generateSelector(element),
    };
  }

  function emitDialogOpened(element: Element): void {
    const name = computeDialogAccessibleName(element, doc);
    const isModal = isDialogModal(element);
    const target = buildEventTarget(element);

    // Add to open dialog stack
    openDialogStack.push({
      element,
      name,
      selector: target.selector,
    });

    const a11yEvent: AccessibilityEvent = {
      type: 'DIALOG_OPENED',
      timestamp: getTimestamp(),
      target,
      payload: {
        kind: 'dialog_opened',
        dialogName: name,
        isModal,
      },
    };

    onEvent(a11yEvent);
  }

  function emitDialogClosed(element: Element): void {
    const name = computeDialogAccessibleName(element, doc);
    const target = buildEventTarget(element);

    // Remove from open dialog stack
    const index = openDialogStack.findIndex((d) => d.element === element);
    if (index !== -1) {
      openDialogStack.splice(index, 1);
    }

    const a11yEvent: AccessibilityEvent = {
      type: 'DIALOG_CLOSED',
      timestamp: getTimestamp(),
      target,
      payload: {
        kind: 'dialog_closed',
        dialogName: name,
      },
    };

    onEvent(a11yEvent);
  }

  function isTrackedAsOpen(element: Element): boolean {
    return openDialogStack.some((d) => d.element === element);
  }

  function handleMutations(mutations: MutationRecord[]): void {
    if (!active) return;

    for (const mutation of mutations) {
      // Handle attribute changes
      if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (!(target instanceof doc.defaultView!.Element)) continue;

        // Native <dialog> open attribute change
        if (
          mutation.attributeName === 'open' &&
          target.tagName.toLowerCase() === 'dialog'
        ) {
          if (target.hasAttribute('open')) {
            // Dialog opened
            if (!isTrackedAsOpen(target)) {
              emitDialogOpened(target);
            }
          } else {
            // Dialog closed
            if (isTrackedAsOpen(target)) {
              emitDialogClosed(target);
            }
          }
        }

        // aria-modal change on role="dialog" or role="alertdialog"
        if (mutation.attributeName === 'aria-modal' && isDialogElement(target)) {
          // If the dialog is already tracked, the modal status changed but
          // it's still open - we could emit an update, but per spec we just
          // track open/close. The modal status is captured at open time.
          // If it wasn't tracked and now has aria-modal="true", check visibility.
          if (!isTrackedAsOpen(target) && isVisibleDialog(target)) {
            emitDialogOpened(target);
          }
        }

        // role attribute change - element might have become a dialog
        if (mutation.attributeName === 'role') {
          const oldRole = mutation.oldValue;
          const newRole = target.getAttribute('role');
          const wasDialog = oldRole === 'dialog' || oldRole === 'alertdialog';
          const isNowDialog = newRole === 'dialog' || newRole === 'alertdialog';

          if (!wasDialog && isNowDialog && isVisibleDialog(target)) {
            emitDialogOpened(target);
          } else if (wasDialog && !isNowDialog && isTrackedAsOpen(target)) {
            emitDialogClosed(target);
          }
        }
      }

      // Handle added nodes (role="dialog" elements added to the DOM)
      if (mutation.type === 'childList') {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (!(node instanceof doc.defaultView!.Element)) continue;

          // Check the added node itself
          if (isDialogElement(node) && isVisibleDialog(node)) {
            if (!isTrackedAsOpen(node)) {
              emitDialogOpened(node);
            }
          }

          // Check descendants of the added node
          const dialogDescendants = node.querySelectorAll(
            'dialog[open], [role="dialog"], [role="alertdialog"]'
          );
          for (let j = 0; j < dialogDescendants.length; j++) {
            const dialog = dialogDescendants[j];
            if (isVisibleDialog(dialog) && !isTrackedAsOpen(dialog)) {
              emitDialogOpened(dialog);
            }
          }
        }

        // Handle removed nodes - dialogs removed from DOM
        for (let i = 0; i < mutation.removedNodes.length; i++) {
          const node = mutation.removedNodes[i];
          if (!(node instanceof doc.defaultView!.Element)) continue;

          // Check the removed node itself
          if (isTrackedAsOpen(node)) {
            emitDialogClosed(node);
          }

          // Check descendants of the removed node
          const trackedInRemoved = openDialogStack.filter((d) =>
            node.contains(d.element)
          );
          for (const tracked of trackedInRemoved) {
            emitDialogClosed(tracked.element);
          }
        }
      }
    }
  }

  /**
   * Determine if a dialog element is considered "visible" / open.
   * - Native <dialog>: must have `open` attribute
   * - ARIA dialog: considered visible when added to DOM (we can't reliably
   *   detect CSS visibility in jsdom, so we assume role="dialog" elements
   *   in the DOM are intended to be visible)
   */
  function isVisibleDialog(element: Element): boolean {
    if (element.tagName.toLowerCase() === 'dialog') {
      return element.hasAttribute('open');
    }
    // For ARIA dialogs, we treat presence in the DOM as "visible"
    // In a real browser, we'd check computed styles, but jsdom doesn't support that reliably
    return true;
  }

  return {
    start(): void {
      if (active) return;
      active = true;
      openDialogStack.length = 0;

      // Scan existing open dialogs on start
      const existingDialogs = doc.querySelectorAll(
        'dialog[open], [role="dialog"], [role="alertdialog"]'
      );
      for (let i = 0; i < existingDialogs.length; i++) {
        const dialog = existingDialogs[i];
        if (isVisibleDialog(dialog)) {
          // Track them without emitting events (they were already open before observation)
          openDialogStack.push({
            element: dialog,
            name: computeDialogAccessibleName(dialog, doc),
            selector: generateSelector(dialog),
          });
        }
      }

      // Set up MutationObserver
      mutationObserver = new MutationObserver(handleMutations);
      mutationObserver.observe(doc.body || doc.documentElement, {
        attributes: true,
        attributeFilter: ['open', 'role', 'aria-modal'],
        attributeOldValue: true,
        childList: true,
        subtree: true,
      });
    },

    stop(): void {
      if (!active) return;
      active = false;

      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }

      openDialogStack.length = 0;
    },

    get isActive(): boolean {
      return active;
    },

    getOpenDialogs(): string[] {
      return openDialogStack.map((d) => d.name);
    },
  };
}
