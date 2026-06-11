/**
 * Runtime Accessibility Timeline - Type System
 *
 * Normalized event structures for representing accessibility-relevant
 * changes during component interaction. All events use a discriminated
 * union via the `kind` field on payloads and the `type` field on actions.
 */

// ---------------------------------------------------------------------------
// Event Types
// ---------------------------------------------------------------------------

/**
 * Classification of accessibility-relevant events observed during runtime.
 */
export type EventType =
  | 'FOCUS_CHANGED'
  | 'ANNOUNCEMENT'
  | 'DOM_MUTATION'
  | 'ROLE_CHANGED'
  | 'ACCESSIBLE_NAME_CHANGED'
  | 'STATE_CHANGED'
  | 'KEYBOARD_ACTION'
  | 'DIALOG_OPENED'
  | 'DIALOG_CLOSED'
  | 'WARNING'
  | 'REGRESSION';

// ---------------------------------------------------------------------------
// Event Target
// ---------------------------------------------------------------------------

/**
 * Identifies the DOM element targeted by an accessibility event.
 */
export interface EventTarget {
  /** ARIA role of the target element */
  role: string;
  /** Computed accessible name */
  accessibleName: string;
  /** Stable CSS selector path for element identification */
  selector: string;
}

// ---------------------------------------------------------------------------
// Event Payloads (discriminated union via `kind`)
// ---------------------------------------------------------------------------

export interface FocusChangedPayload {
  kind: 'focus_changed';
  previousTarget: EventTarget | null;
}

export interface AnnouncementPayload {
  kind: 'announcement';
  politeness: 'polite' | 'assertive';
  text: string;
}

export interface RoleChangedPayload {
  kind: 'role_changed';
  previousRole: string;
  newRole: string;
}

export interface AccessibleNameChangedPayload {
  kind: 'accessible_name_changed';
  previousName: string;
  newName: string;
}

export interface StateChangedPayload {
  kind: 'state_changed';
  attribute: string;
  previousValue: string | boolean | null;
  newValue: string | boolean | null;
}

export interface DialogOpenedPayload {
  kind: 'dialog_opened';
  dialogName: string;
  isModal: boolean;
}

export interface DialogClosedPayload {
  kind: 'dialog_closed';
  dialogName: string;
}

export interface KeyboardActionPayload {
  kind: 'keyboard_action';
  key: string;
  modifiers: string[];
}

export interface WarningPayload {
  kind: 'warning';
  message: string;
  relatedEvent?: AccessibilityEvent;
}

/**
 * Discriminated union of all event payload types.
 * Use the `kind` field to narrow the type.
 */
export type EventPayload =
  | FocusChangedPayload
  | AnnouncementPayload
  | RoleChangedPayload
  | AccessibleNameChangedPayload
  | StateChangedPayload
  | DialogOpenedPayload
  | DialogClosedPayload
  | KeyboardActionPayload
  | WarningPayload;

// ---------------------------------------------------------------------------
// Accessibility Event
// ---------------------------------------------------------------------------

/**
 * A normalized event representing a single accessibility-relevant change.
 * Contains common fields for classification, timing, targeting, and
 * type-specific payload data.
 */
export interface AccessibilityEvent {
  /** Event classification */
  type: EventType;
  /** Milliseconds elapsed since session start */
  timestamp: number;
  /** Target element information */
  target: EventTarget;
  /** Type-specific payload data */
  payload: EventPayload;
}

// ---------------------------------------------------------------------------
// Interaction Sequence
// ---------------------------------------------------------------------------

/**
 * Discriminated union of interaction actions.
 * Use the `type` field to narrow the action kind.
 */
export type InteractionAction =
  | { type: 'click'; selector: string }
  | { type: 'tab' }
  | { type: 'shiftTab' }
  | { type: 'escape' }
  | { type: 'enter' }
  | { type: 'space' }
  | { type: 'arrowUp' }
  | { type: 'arrowDown' }
  | { type: 'arrowLeft' }
  | { type: 'arrowRight' }
  | { type: 'key'; combo: string }
  | { type: 'wait'; ms: number };

/**
 * An ordered sequence of user actions to perform during timeline capture.
 */
export interface InteractionSequence {
  /** Human-readable description of the interaction */
  description: string;
  /** Ordered list of actions to perform */
  actions: InteractionAction[];
}

// ---------------------------------------------------------------------------
// Timeline Metadata
// ---------------------------------------------------------------------------

/**
 * Metadata captured alongside an accessibility timeline session.
 */
export interface TimelineMetadata {
  /** ISO timestamp of when the timeline was captured */
  capturedAt: string;
  /** Speakable package version used for capture */
  speakableVersion: string;
  /** The URL that was analyzed */
  sourceUrl: string;
  /** Browser context identifier (e.g., "jsdom/23.0.0") */
  userAgent: string;
}

// ---------------------------------------------------------------------------
// Accessibility Timeline
// ---------------------------------------------------------------------------

/**
 * A complete accessibility timeline captured during an interaction session.
 * Contains the ordered event sequence, session metadata, and extracted warnings.
 */
export interface AccessibilityTimeline {
  /** Timeline format version string (e.g., "1.0") */
  version: string;
  /** Component name */
  component: string;
  /** Story or variant name */
  story: string | null;
  /** Human-readable description of the interaction sequence performed */
  interactionSequence: string;
  /** Total session duration in milliseconds */
  duration: number;
  /** All accessibility events in chronological order */
  events: AccessibilityEvent[];
  /** WARNING-type events extracted for quick reference */
  warnings: AccessibilityEvent[];
  /** Session capture metadata */
  metadata: TimelineMetadata;
}
