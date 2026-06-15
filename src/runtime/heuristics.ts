/**
 * Heuristic Warning Analyzer
 *
 * Processes accessibility events one at a time and emits WARNING events
 * when common runtime accessibility anti-patterns are detected. Operates
 * independently of baselines, providing value from the first run.
 *
 * Detected patterns:
 * - Focus not moved into modal dialog within configured timeout (default: 100ms)
 * - Focus escaped modal dialog (focus moved to element outside open dialog)
 * - Rapid announcements (too many in a short window)
 * - Keyboard action with no accessibility response within timeout
 * - Focused element removed from DOM without explicit focus management
 *
 * Uses event timestamps (not real-time timers) for timeout detection,
 * enabling deterministic testing with jsdom.
 *
 * @module runtime/heuristics
 */

import type {
  AccessibilityEvent,
  EventTarget as A11yEventTarget,
  DialogOpenedPayload,
  WarningPayload,
} from './types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for heuristic warning thresholds.
 */
export interface HeuristicConfig {
  /** Time window to detect focus moving into dialog (default: 100ms) */
  dialogFocusTimeout: number;
  /** Time window to detect rapid announcements (default: 500ms) */
  rapidAnnouncementWindow: number;
  /** Threshold for rapid announcement count (default: 3) */
  rapidAnnouncementThreshold: number;
  /** Time window to detect keyboard action response (default: 200ms) */
  keyboardResponseTimeout: number;
}

const DEFAULT_CONFIG: HeuristicConfig = {
  dialogFocusTimeout: 100,
  rapidAnnouncementWindow: 500,
  rapidAnnouncementThreshold: 3,
  keyboardResponseTimeout: 200,
};

// ---------------------------------------------------------------------------
// Internal State Types
// ---------------------------------------------------------------------------

/** Tracks a pending dialog focus check */
interface PendingDialogFocus {
  /** Selector of the dialog that opened */
  dialogSelector: string;
  /** Name of the dialog for warning messages */
  dialogName: string;
  /** Timestamp when the dialog was opened */
  openedAt: number;
  /** Whether this dialog is modal */
  isModal: boolean;
  /** Whether focus has been moved into the dialog */
  resolved: boolean;
}

/** Tracks a pending keyboard response check */
interface PendingKeyboardResponse {
  /** The keyboard action event that started the check */
  event: AccessibilityEvent;
  /** Timestamp when the keyboard action occurred */
  timestamp: number;
  /** Whether an accessibility response has been received */
  resolved: boolean;
}

/** Tracks an open dialog for focus escape detection */
interface TrackedDialog {
  /** CSS selector of the dialog container */
  selector: string;
  /** Accessible name of the dialog */
  name: string;
  /** Whether this is a modal dialog */
  isModal: boolean;
}

// ---------------------------------------------------------------------------
// Heuristic Analyzer Interface
// ---------------------------------------------------------------------------

/**
 * Processes accessibility events and detects runtime anti-patterns.
 */
export interface HeuristicAnalyzer {
  /** Process an event and return any warnings it triggers */
  process(event: AccessibilityEvent): AccessibilityEvent[];
  /** Get current open dialog selectors (for focus escape detection) */
  readonly openDialogs: string[];
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a heuristic analyzer that processes accessibility events and
 * emits warnings when common anti-patterns are detected.
 *
 * The analyzer uses event timestamps for timeout detection rather than
 * real-time timers, making it deterministic and testable with jsdom.
 */
export function createHeuristicAnalyzer(
  config?: Partial<HeuristicConfig>
): HeuristicAnalyzer {
  const cfg: HeuristicConfig = { ...DEFAULT_CONFIG, ...config };

  // Internal state
  const trackedDialogs: TrackedDialog[] = [];
  const pendingDialogFocusChecks: PendingDialogFocus[] = [];
  const pendingKeyboardResponses: PendingKeyboardResponse[] = [];
  const announcementTimestamps: number[] = [];

  // Track the last known focused element selector for DOM removal detection
  let lastFocusedSelector: string | null = null;

  // ---------------------------------------------------------------------------
  // Helper: Create a WARNING event
  // ---------------------------------------------------------------------------

  function createWarning(
    timestamp: number,
    message: string,
    target: A11yEventTarget,
    relatedEvent?: AccessibilityEvent
  ): AccessibilityEvent {
    const payload: WarningPayload = {
      kind: 'warning',
      message,
      relatedEvent,
    };

    return {
      type: 'WARNING',
      timestamp,
      target,
      payload,
    };
  }

  // ---------------------------------------------------------------------------
  // Check: Dialog focus timeout expired
  // ---------------------------------------------------------------------------

  function checkExpiredDialogFocusTimeouts(
    currentTimestamp: number
  ): AccessibilityEvent[] {
    const warnings: AccessibilityEvent[] = [];

    for (let i = pendingDialogFocusChecks.length - 1; i >= 0; i--) {
      const pending = pendingDialogFocusChecks[i];
      if (pending.resolved) continue;

      const elapsed = currentTimestamp - pending.openedAt;
      if (elapsed > cfg.dialogFocusTimeout) {
        // Only emit warning for modal dialogs
        if (pending.isModal) {
          warnings.push(
            createWarning(
              currentTimestamp,
              'Focus was not moved into modal dialog',
              {
                role: 'dialog',
                accessibleName: pending.dialogName,
                selector: pending.dialogSelector,
              }
            )
          );
        }
        // Mark as resolved (expired) to avoid duplicate warnings
        pending.resolved = true;
      }
    }

    return warnings;
  }

  // ---------------------------------------------------------------------------
  // Check: Keyboard response timeout expired
  // ---------------------------------------------------------------------------

  function checkExpiredKeyboardResponses(
    currentTimestamp: number
  ): AccessibilityEvent[] {
    const warnings: AccessibilityEvent[] = [];

    for (let i = pendingKeyboardResponses.length - 1; i >= 0; i--) {
      const pending = pendingKeyboardResponses[i];
      if (pending.resolved) continue;

      const elapsed = currentTimestamp - pending.timestamp;
      if (elapsed > cfg.keyboardResponseTimeout) {
        warnings.push(
          createWarning(
            currentTimestamp,
            'Keyboard action produced no accessibility response',
            pending.event.target,
            pending.event
          )
        );
        pending.resolved = true;
      }
    }

    return warnings;
  }

  // ---------------------------------------------------------------------------
  // Check: Rapid announcements
  // ---------------------------------------------------------------------------

  function checkRapidAnnouncements(
    currentTimestamp: number
  ): AccessibilityEvent[] {
    const warnings: AccessibilityEvent[] = [];

    // Remove old timestamps outside the window
    const windowStart = currentTimestamp - cfg.rapidAnnouncementWindow;
    while (announcementTimestamps.length > 0 && announcementTimestamps[0] < windowStart) {
      announcementTimestamps.shift();
    }

    // Check if threshold exceeded
    if (announcementTimestamps.length > cfg.rapidAnnouncementThreshold) {
      warnings.push(
        createWarning(
          currentTimestamp,
          'Rapid announcements detected: assistive technology users may miss content',
          {
            role: 'region',
            accessibleName: '',
            selector: 'body',
          }
        )
      );

      // Clear timestamps to avoid repeated warnings for the same burst
      announcementTimestamps.length = 0;
    }

    return warnings;
  }

  // ---------------------------------------------------------------------------
  // Check: Focus escape from modal dialog
  // ---------------------------------------------------------------------------

  function checkFocusEscape(event: AccessibilityEvent): AccessibilityEvent[] {
    const warnings: AccessibilityEvent[] = [];

    if (event.type !== 'FOCUS_CHANGED') return warnings;

    // Only check if there are open modal dialogs
    const modalDialogs = trackedDialogs.filter((d) => d.isModal);
    if (modalDialogs.length === 0) return warnings;

    const focusedSelector = event.target.selector;

    // Check if the focused element is outside all open modal dialogs
    for (const dialog of modalDialogs) {
      // Focus is outside the dialog if the focused element's selector
      // does not start with/contain the dialog's selector
      if (!isSelectorInside(focusedSelector, dialog.selector)) {
        warnings.push(
          createWarning(
            event.timestamp,
            'Focus escaped modal dialog',
            event.target,
            event
          )
        );
        break; // One warning is enough
      }
    }

    return warnings;
  }

  // ---------------------------------------------------------------------------
  // Check: Focused element removed from DOM
  // ---------------------------------------------------------------------------

  function checkFocusedElementRemoved(
    event: AccessibilityEvent
  ): AccessibilityEvent[] {
    const warnings: AccessibilityEvent[] = [];

    // DOM_MUTATION events where the target matches the last focused element
    // indicate the focused element may have been removed
    if (event.type === 'DOM_MUTATION' && lastFocusedSelector !== null) {
      if (event.target.selector === lastFocusedSelector) {
        warnings.push(
          createWarning(
            event.timestamp,
            'Focused element removed without focus management',
            event.target,
            event
          )
        );
      }
    }

    return warnings;
  }

  // ---------------------------------------------------------------------------
  // Selector Containment Check
  // ---------------------------------------------------------------------------

  /**
   * Determines if `childSelector` represents an element inside the container
   * identified by `containerSelector`.
   *
   * Uses a simple heuristic: the child selector starts with the container
   * selector followed by a combinator (space, >, ~, +).
   */
  function isSelectorInside(
    childSelector: string,
    containerSelector: string
  ): boolean {
    // Direct match - element IS the container
    if (childSelector === containerSelector) return true;

    // Child selector starts with container selector path
    // e.g., container is "#modal" and child is "#modal > .content > button"
    if (childSelector.startsWith(containerSelector + ' ')) return true;
    if (childSelector.startsWith(containerSelector + ' > ')) return true;

    // Handle nth-child and descendant patterns
    // e.g., container is "body > div:nth-child(2)" and child is "body > div:nth-child(2) > button"
    if (childSelector.startsWith(containerSelector + '>')) return true;

    return false;
  }

  // ---------------------------------------------------------------------------
  // Event Processing
  // ---------------------------------------------------------------------------

  function processEvent(event: AccessibilityEvent): AccessibilityEvent[] {
    const warnings: AccessibilityEvent[] = [];

    // First, check for timeouts that may have expired given the current timestamp
    warnings.push(...checkExpiredDialogFocusTimeouts(event.timestamp));
    warnings.push(...checkExpiredKeyboardResponses(event.timestamp));

    // Process the event based on its type
    switch (event.type) {
      case 'DIALOG_OPENED': {
        const payload = event.payload as DialogOpenedPayload;
        const dialog: TrackedDialog = {
          selector: event.target.selector,
          name: payload.dialogName,
          isModal: payload.isModal,
        };
        trackedDialogs.push(dialog);

        // Set up pending focus check for modal dialogs
        if (payload.isModal) {
          pendingDialogFocusChecks.push({
            dialogSelector: event.target.selector,
            dialogName: payload.dialogName,
            openedAt: event.timestamp,
            isModal: true,
            resolved: false,
          });
        }
        break;
      }

      case 'DIALOG_CLOSED': {
        // Remove the dialog from tracked list
        const closedSelector = event.target.selector;
        const idx = trackedDialogs.findIndex(
          (d) => d.selector === closedSelector
        );
        if (idx !== -1) {
          trackedDialogs.splice(idx, 1);
        }

        // Resolve any pending focus checks for this dialog
        for (const pending of pendingDialogFocusChecks) {
          if (pending.dialogSelector === closedSelector && !pending.resolved) {
            pending.resolved = true;
          }
        }
        break;
      }

      case 'FOCUS_CHANGED': {
        // Resolve pending dialog focus checks if focus moved into dialog
        for (const pending of pendingDialogFocusChecks) {
          if (pending.resolved) continue;
          if (isSelectorInside(event.target.selector, pending.dialogSelector)) {
            pending.resolved = true;
          }
        }

        // Resolve pending keyboard responses (focus change is an accessibility response)
        for (const pending of pendingKeyboardResponses) {
          if (!pending.resolved) {
            pending.resolved = true;
          }
        }

        // Check for focus escaping modal dialogs
        warnings.push(...checkFocusEscape(event));

        // Update last focused element
        lastFocusedSelector = event.target.selector;
        break;
      }

      case 'ANNOUNCEMENT': {
        // Track timestamp for rapid announcement detection
        announcementTimestamps.push(event.timestamp);

        // Resolve pending keyboard responses (announcement is an accessibility response)
        for (const pending of pendingKeyboardResponses) {
          if (!pending.resolved) {
            pending.resolved = true;
          }
        }

        // Check for rapid announcements
        warnings.push(...checkRapidAnnouncements(event.timestamp));
        break;
      }

      case 'KEYBOARD_ACTION': {
        // Register pending keyboard response check
        pendingKeyboardResponses.push({
          event,
          timestamp: event.timestamp,
          resolved: false,
        });
        break;
      }

      case 'DOM_MUTATION': {
        // Check if the focused element was removed
        warnings.push(...checkFocusedElementRemoved(event));

        // DOM mutation is an accessibility response to keyboard action
        for (const pending of pendingKeyboardResponses) {
          if (!pending.resolved) {
            pending.resolved = true;
          }
        }
        break;
      }

      case 'STATE_CHANGED':
      case 'ROLE_CHANGED':
      case 'ACCESSIBLE_NAME_CHANGED': {
        // These are all accessibility responses to keyboard actions
        for (const pending of pendingKeyboardResponses) {
          if (!pending.resolved) {
            pending.resolved = true;
          }
        }
        break;
      }

      default:
        // WARNING, REGRESSION, and other event types don't trigger heuristics
        break;
    }

    // Clean up resolved pending checks to prevent unbounded memory growth
    cleanupResolvedChecks();

    return warnings;
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  function cleanupResolvedChecks(): void {
    // Remove resolved pending checks
    for (let i = pendingDialogFocusChecks.length - 1; i >= 0; i--) {
      if (pendingDialogFocusChecks[i].resolved) {
        pendingDialogFocusChecks.splice(i, 1);
      }
    }

    for (let i = pendingKeyboardResponses.length - 1; i >= 0; i--) {
      if (pendingKeyboardResponses[i].resolved) {
        pendingKeyboardResponses.splice(i, 1);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Public Interface
  // ---------------------------------------------------------------------------

  return {
    process(event: AccessibilityEvent): AccessibilityEvent[] {
      return processEvent(event);
    },

    get openDialogs(): string[] {
      return trackedDialogs.map((d) => d.selector);
    },
  };
}
