/**
 * Deterministic serialization and deserialization for Runtime Accessibility
 * Timeline types.
 *
 * All serializers produce JSON with recursively sorted keys and 2-space
 * indentation, guaranteeing:
 *  - Byte-identical output for equivalent inputs (determinism)
 *  - Round-trip integrity (serialize → deserialize → serialize = identical)
 *  - Stable version-control diffs
 */

import type {
  AccessibilityEvent,
  AccessibilityTimeline,
  EventPayload,
  EventTarget,
  EventType,
  InteractionAction,
  InteractionSequence,
  TimelineMetadata,
} from './types.js';

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------

const VALID_EVENT_TYPES: ReadonlySet<string> = new Set<EventType>([
  'FOCUS_CHANGED',
  'ANNOUNCEMENT',
  'DOM_MUTATION',
  'ROLE_CHANGED',
  'ACCESSIBLE_NAME_CHANGED',
  'STATE_CHANGED',
  'KEYBOARD_ACTION',
  'DIALOG_OPENED',
  'DIALOG_CLOSED',
  'WARNING',
  'REGRESSION',
]);

const VALID_PAYLOAD_KINDS: ReadonlySet<string> = new Set([
  'focus_changed',
  'announcement',
  'role_changed',
  'accessible_name_changed',
  'state_changed',
  'dialog_opened',
  'dialog_closed',
  'keyboard_action',
  'warning',
]);

const VALID_ACTION_TYPES: ReadonlySet<string> = new Set([
  'click',
  'tab',
  'shiftTab',
  'escape',
  'enter',
  'space',
  'arrowUp',
  'arrowDown',
  'arrowLeft',
  'arrowRight',
  'key',
  'wait',
]);

// ---------------------------------------------------------------------------
// Recursive key sorting
// ---------------------------------------------------------------------------

/**
 * Recursively sorts all object keys in a value. Arrays are traversed but
 * their element order is preserved. Primitives pass through unchanged.
 */
function sortKeysDeep<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sortKeysDeep) as unknown as T;
  }

  if (typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(value as Record<string, unknown>).sort();
    for (const key of keys) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted as T;
  }

  return value;
}

// ---------------------------------------------------------------------------
// Event Serialization
// ---------------------------------------------------------------------------

/**
 * Serializes an AccessibilityEvent to deterministic JSON with sorted keys
 * and 2-space indentation.
 *
 * @param event - The accessibility event to serialize
 * @returns Deterministic JSON string
 */
export function serializeEvent(event: AccessibilityEvent): string {
  const sorted = sortKeysDeep(event);
  return JSON.stringify(sorted, null, 2);
}

/**
 * Deserializes a JSON string into a validated AccessibilityEvent.
 *
 * @param json - JSON string to parse
 * @returns Validated AccessibilityEvent
 * @throws Error if the JSON is invalid or does not conform to the event schema
 */
export function deserializeEvent(json: string): AccessibilityEvent {
  const parsed = JSON.parse(json);
  validateEvent(parsed);
  return parsed as AccessibilityEvent;
}

// ---------------------------------------------------------------------------
// Timeline Serialization
// ---------------------------------------------------------------------------

/**
 * Serializes an AccessibilityTimeline to deterministic JSON with sorted keys
 * and 2-space indentation.
 *
 * @param timeline - The accessibility timeline to serialize
 * @returns Deterministic JSON string
 */
export function serializeTimeline(timeline: AccessibilityTimeline): string {
  const sorted = sortKeysDeep(timeline);
  return JSON.stringify(sorted, null, 2);
}

/**
 * Deserializes a JSON string into a validated AccessibilityTimeline.
 *
 * @param json - JSON string to parse
 * @returns Validated AccessibilityTimeline
 * @throws Error if the JSON is invalid or does not conform to the timeline schema
 */
export function deserializeTimeline(json: string): AccessibilityTimeline {
  const parsed = JSON.parse(json);
  validateTimeline(parsed);
  return parsed as AccessibilityTimeline;
}

// ---------------------------------------------------------------------------
// InteractionSequence Serialization
// ---------------------------------------------------------------------------

/**
 * Serializes an InteractionSequence to deterministic JSON with sorted keys
 * and 2-space indentation.
 *
 * @param seq - The interaction sequence to serialize
 * @returns Deterministic JSON string
 */
export function serializeInteractionSequence(seq: InteractionSequence): string {
  const sorted = sortKeysDeep(seq);
  return JSON.stringify(sorted, null, 2);
}

/**
 * Deserializes a JSON string into a validated InteractionSequence.
 *
 * @param json - JSON string to parse
 * @returns Validated InteractionSequence
 * @throws Error if the JSON is invalid or does not conform to the interaction schema
 */
export function deserializeInteractionSequence(json: string): InteractionSequence {
  const parsed = JSON.parse(json);
  validateInteractionSequence(parsed);
  return parsed as InteractionSequence;
}

// ---------------------------------------------------------------------------
// Deep Equality
// ---------------------------------------------------------------------------

/**
 * Checks whether two AccessibilityTimelines are deeply equal by comparing
 * their deterministic serializations. Because serialization sorts keys
 * recursively, structurally equivalent timelines produce identical strings.
 *
 * @param a - First timeline
 * @param b - Second timeline
 * @returns true if timelines are equivalent
 */
export function timelinesEqual(
  a: AccessibilityTimeline,
  b: AccessibilityTimeline,
): boolean {
  return serializeTimeline(a) === serializeTimeline(b);
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateEvent(obj: unknown): asserts obj is AccessibilityEvent {
  if (obj === null || typeof obj !== 'object') {
    throw new Error('Event must be a non-null object');
  }

  const event = obj as Record<string, unknown>;

  // type
  if (typeof event.type !== 'string' || !VALID_EVENT_TYPES.has(event.type)) {
    throw new Error(
      `Event "type" must be one of: ${[...VALID_EVENT_TYPES].join(', ')}. Got: ${String(event.type)}`,
    );
  }

  // timestamp
  if (typeof event.timestamp !== 'number' || !Number.isFinite(event.timestamp)) {
    throw new Error('Event "timestamp" must be a finite number');
  }

  // target
  validateEventTarget(event.target, 'Event "target"');

  // payload
  validatePayload(event.payload);
}

function validateEventTarget(obj: unknown, label: string): asserts obj is EventTarget {
  if (obj === null || typeof obj !== 'object') {
    throw new Error(`${label} must be a non-null object`);
  }

  const target = obj as Record<string, unknown>;

  if (typeof target.role !== 'string') {
    throw new Error(`${label}.role must be a string`);
  }
  if (typeof target.accessibleName !== 'string') {
    throw new Error(`${label}.accessibleName must be a string`);
  }
  if (typeof target.selector !== 'string') {
    throw new Error(`${label}.selector must be a string`);
  }
}

function validatePayload(obj: unknown): asserts obj is EventPayload {
  if (obj === null || typeof obj !== 'object') {
    throw new Error('Event "payload" must be a non-null object');
  }

  const payload = obj as Record<string, unknown>;

  if (typeof payload.kind !== 'string' || !VALID_PAYLOAD_KINDS.has(payload.kind)) {
    throw new Error(
      `Payload "kind" must be one of: ${[...VALID_PAYLOAD_KINDS].join(', ')}. Got: ${String(payload.kind)}`,
    );
  }

  // Type-specific validation
  switch (payload.kind) {
    case 'focus_changed':
      if (payload.previousTarget !== null) {
        validateEventTarget(payload.previousTarget, 'FocusChangedPayload.previousTarget');
      }
      break;

    case 'announcement':
      if (payload.politeness !== 'polite' && payload.politeness !== 'assertive') {
        throw new Error('AnnouncementPayload.politeness must be "polite" or "assertive"');
      }
      if (typeof payload.text !== 'string') {
        throw new Error('AnnouncementPayload.text must be a string');
      }
      break;

    case 'role_changed':
      if (typeof payload.previousRole !== 'string') {
        throw new Error('RoleChangedPayload.previousRole must be a string');
      }
      if (typeof payload.newRole !== 'string') {
        throw new Error('RoleChangedPayload.newRole must be a string');
      }
      break;

    case 'accessible_name_changed':
      if (typeof payload.previousName !== 'string') {
        throw new Error('AccessibleNameChangedPayload.previousName must be a string');
      }
      if (typeof payload.newName !== 'string') {
        throw new Error('AccessibleNameChangedPayload.newName must be a string');
      }
      break;

    case 'state_changed':
      if (typeof payload.attribute !== 'string') {
        throw new Error('StateChangedPayload.attribute must be a string');
      }
      validateStateValue(payload.previousValue, 'StateChangedPayload.previousValue');
      validateStateValue(payload.newValue, 'StateChangedPayload.newValue');
      break;

    case 'dialog_opened':
      if (typeof payload.dialogName !== 'string') {
        throw new Error('DialogOpenedPayload.dialogName must be a string');
      }
      if (typeof payload.isModal !== 'boolean') {
        throw new Error('DialogOpenedPayload.isModal must be a boolean');
      }
      break;

    case 'dialog_closed':
      if (typeof payload.dialogName !== 'string') {
        throw new Error('DialogClosedPayload.dialogName must be a string');
      }
      break;

    case 'keyboard_action':
      if (typeof payload.key !== 'string') {
        throw new Error('KeyboardActionPayload.key must be a string');
      }
      if (!Array.isArray(payload.modifiers)) {
        throw new Error('KeyboardActionPayload.modifiers must be an array');
      }
      for (const mod of payload.modifiers) {
        if (typeof mod !== 'string') {
          throw new Error('KeyboardActionPayload.modifiers must contain only strings');
        }
      }
      break;

    case 'warning':
      if (typeof payload.message !== 'string') {
        throw new Error('WarningPayload.message must be a string');
      }
      if (payload.relatedEvent !== undefined && payload.relatedEvent !== null) {
        validateEvent(payload.relatedEvent);
      }
      break;
  }
}

function validateStateValue(value: unknown, label: string): void {
  if (value !== null && typeof value !== 'string' && typeof value !== 'boolean') {
    throw new Error(`${label} must be a string, boolean, or null`);
  }
}

function validateTimeline(obj: unknown): asserts obj is AccessibilityTimeline {
  if (obj === null || typeof obj !== 'object') {
    throw new Error('Timeline must be a non-null object');
  }

  const timeline = obj as Record<string, unknown>;

  // version
  if (typeof timeline.version !== 'string') {
    throw new Error('Timeline "version" must be a string');
  }

  // component
  if (typeof timeline.component !== 'string') {
    throw new Error('Timeline "component" must be a string');
  }

  // story (string | null)
  if (timeline.story !== null && typeof timeline.story !== 'string') {
    throw new Error('Timeline "story" must be a string or null');
  }

  // interactionSequence
  if (typeof timeline.interactionSequence !== 'string') {
    throw new Error('Timeline "interactionSequence" must be a string');
  }

  // duration
  if (typeof timeline.duration !== 'number' || !Number.isFinite(timeline.duration)) {
    throw new Error('Timeline "duration" must be a finite number');
  }

  // events
  if (!Array.isArray(timeline.events)) {
    throw new Error('Timeline "events" must be an array');
  }
  for (let i = 0; i < timeline.events.length; i++) {
    try {
      validateEvent(timeline.events[i]);
    } catch (err) {
      throw new Error(
        `Timeline events[${i}]: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // warnings
  if (!Array.isArray(timeline.warnings)) {
    throw new Error('Timeline "warnings" must be an array');
  }
  for (let i = 0; i < timeline.warnings.length; i++) {
    try {
      validateEvent(timeline.warnings[i]);
    } catch (err) {
      throw new Error(
        `Timeline warnings[${i}]: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // metadata
  validateTimelineMetadata(timeline.metadata);
}

function validateTimelineMetadata(obj: unknown): asserts obj is TimelineMetadata {
  if (obj === null || typeof obj !== 'object') {
    throw new Error('Timeline "metadata" must be a non-null object');
  }

  const meta = obj as Record<string, unknown>;

  if (typeof meta.capturedAt !== 'string') {
    throw new Error('Timeline metadata.capturedAt must be a string');
  }
  if (typeof meta.speakableVersion !== 'string') {
    throw new Error('Timeline metadata.speakableVersion must be a string');
  }
  if (typeof meta.sourceUrl !== 'string') {
    throw new Error('Timeline metadata.sourceUrl must be a string');
  }
  if (typeof meta.userAgent !== 'string') {
    throw new Error('Timeline metadata.userAgent must be a string');
  }
}

function validateInteractionSequence(obj: unknown): asserts obj is InteractionSequence {
  if (obj === null || typeof obj !== 'object') {
    throw new Error('InteractionSequence must be a non-null object');
  }

  const seq = obj as Record<string, unknown>;

  if (typeof seq.description !== 'string') {
    throw new Error('InteractionSequence "description" must be a string');
  }

  if (!Array.isArray(seq.actions)) {
    throw new Error('InteractionSequence "actions" must be an array');
  }

  for (let i = 0; i < seq.actions.length; i++) {
    validateAction(seq.actions[i], i);
  }
}

function validateAction(obj: unknown, index: number): asserts obj is InteractionAction {
  if (obj === null || typeof obj !== 'object') {
    throw new Error(`InteractionSequence actions[${index}] must be a non-null object`);
  }

  const action = obj as Record<string, unknown>;

  if (typeof action.type !== 'string' || !VALID_ACTION_TYPES.has(action.type)) {
    throw new Error(
      `InteractionSequence actions[${index}].type must be one of: ${[...VALID_ACTION_TYPES].join(', ')}. Got: ${String(action.type)}`,
    );
  }

  switch (action.type) {
    case 'click':
      if (typeof action.selector !== 'string') {
        throw new Error(
          `InteractionSequence actions[${index}].selector must be a string for click actions`,
        );
      }
      break;

    case 'key':
      if (typeof action.combo !== 'string') {
        throw new Error(
          `InteractionSequence actions[${index}].combo must be a string for key actions`,
        );
      }
      break;

    case 'wait':
      if (typeof action.ms !== 'number' || !Number.isFinite(action.ms)) {
        throw new Error(
          `InteractionSequence actions[${index}].ms must be a finite number for wait actions`,
        );
      }
      break;
  }
}
