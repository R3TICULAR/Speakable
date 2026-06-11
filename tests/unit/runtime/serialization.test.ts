import { describe, it, expect } from 'vitest';
import {
  serializeEvent,
  deserializeEvent,
  serializeTimeline,
  deserializeTimeline,
  serializeInteractionSequence,
  deserializeInteractionSequence,
  timelinesEqual,
} from '../../../src/runtime/serialization.js';
import type {
  AccessibilityEvent,
  AccessibilityTimeline,
  InteractionSequence,
} from '../../../src/runtime/types.js';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const sampleTarget = {
  role: 'button',
  accessibleName: 'Submit',
  selector: 'form > button[type=submit]',
};

const sampleEvent: AccessibilityEvent = {
  type: 'FOCUS_CHANGED',
  timestamp: 1250,
  target: sampleTarget,
  payload: {
    kind: 'focus_changed',
    previousTarget: {
      role: 'textbox',
      accessibleName: 'Email',
      selector: '#email-input',
    },
  },
};

const sampleTimeline: AccessibilityTimeline = {
  version: '1.0',
  component: 'LoginForm',
  story: 'Default',
  interactionSequence: 'Tab through form fields and submit',
  duration: 3200,
  events: [sampleEvent],
  warnings: [],
  metadata: {
    capturedAt: '2024-01-15T10:30:00.000Z',
    speakableVersion: '1.3.0',
    sourceUrl: 'http://localhost:6006/iframe.html?id=loginform--default',
    userAgent: 'jsdom/23.0.0',
  },
};

const sampleSequence: InteractionSequence = {
  description: 'Open dialog, tab through content, close with escape',
  actions: [
    { type: 'click', selector: 'button.trigger' },
    { type: 'tab' },
    { type: 'tab' },
    { type: 'escape' },
  ],
};

// ---------------------------------------------------------------------------
// Event serialization
// ---------------------------------------------------------------------------

describe('serializeEvent', () => {
  it('produces deterministic JSON with sorted keys', () => {
    const json = serializeEvent(sampleEvent);
    const parsed = JSON.parse(json);

    // Top-level keys should be sorted
    const keys = Object.keys(parsed);
    expect(keys).toEqual([...keys].sort());
  });

  it('uses 2-space indentation', () => {
    const json = serializeEvent(sampleEvent);
    // The second line should start with 2 spaces (sorted keys, first is payload)
    const lines = json.split('\n');
    expect(lines[1]).toMatch(/^ {2}"/);
  });

  it('produces byte-identical output on repeated calls', () => {
    const first = serializeEvent(sampleEvent);
    const second = serializeEvent(sampleEvent);
    expect(first).toBe(second);
  });

  it('sorts nested object keys', () => {
    const json = serializeEvent(sampleEvent);
    const parsed = JSON.parse(json);

    // target keys should be sorted
    const targetKeys = Object.keys(parsed.target);
    expect(targetKeys).toEqual([...targetKeys].sort());

    // payload keys should be sorted
    const payloadKeys = Object.keys(parsed.payload);
    expect(payloadKeys).toEqual([...payloadKeys].sort());
  });
});

describe('deserializeEvent', () => {
  it('round-trips a valid event', () => {
    const json = serializeEvent(sampleEvent);
    const deserialized = deserializeEvent(json);
    expect(deserialized).toEqual(sampleEvent);
  });

  it('throws on invalid JSON', () => {
    expect(() => deserializeEvent('not json')).toThrow();
  });

  it('throws on missing type field', () => {
    const invalid = JSON.stringify({ timestamp: 0, target: sampleTarget, payload: { kind: 'warning', message: 'x' } });
    expect(() => deserializeEvent(invalid)).toThrow(/type/);
  });

  it('throws on invalid event type', () => {
    const invalid = JSON.stringify({
      type: 'INVALID_TYPE',
      timestamp: 0,
      target: sampleTarget,
      payload: { kind: 'warning', message: 'x' },
    });
    expect(() => deserializeEvent(invalid)).toThrow(/type/i);
  });

  it('throws on missing target', () => {
    const invalid = JSON.stringify({
      type: 'WARNING',
      timestamp: 0,
      payload: { kind: 'warning', message: 'x' },
    });
    expect(() => deserializeEvent(invalid)).toThrow(/target/i);
  });
});

// ---------------------------------------------------------------------------
// Timeline serialization
// ---------------------------------------------------------------------------

describe('serializeTimeline', () => {
  it('produces deterministic JSON with sorted keys', () => {
    const json = serializeTimeline(sampleTimeline);
    const parsed = JSON.parse(json);
    const keys = Object.keys(parsed);
    expect(keys).toEqual([...keys].sort());
  });

  it('produces byte-identical output on repeated calls', () => {
    const first = serializeTimeline(sampleTimeline);
    const second = serializeTimeline(sampleTimeline);
    expect(first).toBe(second);
  });

  it('produces byte-identical output after round-trip', () => {
    const first = serializeTimeline(sampleTimeline);
    const deserialized = deserializeTimeline(first);
    const second = serializeTimeline(deserialized);
    expect(first).toBe(second);
  });
});

describe('deserializeTimeline', () => {
  it('round-trips a valid timeline', () => {
    const json = serializeTimeline(sampleTimeline);
    const deserialized = deserializeTimeline(json);
    expect(deserialized).toEqual(sampleTimeline);
  });

  it('throws on missing version', () => {
    const invalid = { ...sampleTimeline, version: undefined };
    expect(() => deserializeTimeline(JSON.stringify(invalid))).toThrow(/version/i);
  });

  it('throws on invalid events array', () => {
    const invalid = { ...sampleTimeline, events: 'not an array' };
    expect(() => deserializeTimeline(JSON.stringify(invalid))).toThrow(/events/i);
  });

  it('throws on invalid event inside events array', () => {
    const invalid = { ...sampleTimeline, events: [{ bad: true }] };
    expect(() => deserializeTimeline(JSON.stringify(invalid))).toThrow();
  });
});

// ---------------------------------------------------------------------------
// InteractionSequence serialization
// ---------------------------------------------------------------------------

describe('serializeInteractionSequence', () => {
  it('produces deterministic JSON with sorted keys', () => {
    const json = serializeInteractionSequence(sampleSequence);
    const parsed = JSON.parse(json);
    const keys = Object.keys(parsed);
    expect(keys).toEqual([...keys].sort());
  });

  it('produces byte-identical output on repeated calls', () => {
    const first = serializeInteractionSequence(sampleSequence);
    const second = serializeInteractionSequence(sampleSequence);
    expect(first).toBe(second);
  });

  it('handles all action types', () => {
    const allActions: InteractionSequence = {
      description: 'All actions',
      actions: [
        { type: 'click', selector: '.btn' },
        { type: 'tab' },
        { type: 'shiftTab' },
        { type: 'escape' },
        { type: 'enter' },
        { type: 'space' },
        { type: 'arrowUp' },
        { type: 'arrowDown' },
        { type: 'arrowLeft' },
        { type: 'arrowRight' },
        { type: 'key', combo: 'Control+A' },
        { type: 'wait', ms: 500 },
      ],
    };
    const json = serializeInteractionSequence(allActions);
    const deserialized = deserializeInteractionSequence(json);
    expect(deserialized).toEqual(allActions);
  });
});

describe('deserializeInteractionSequence', () => {
  it('round-trips a valid sequence', () => {
    const json = serializeInteractionSequence(sampleSequence);
    const deserialized = deserializeInteractionSequence(json);
    expect(deserialized).toEqual(sampleSequence);
  });

  it('throws on missing description', () => {
    const invalid = JSON.stringify({ actions: [] });
    expect(() => deserializeInteractionSequence(invalid)).toThrow(/description/i);
  });

  it('throws on invalid action type', () => {
    const invalid = JSON.stringify({
      description: 'test',
      actions: [{ type: 'invalid' }],
    });
    expect(() => deserializeInteractionSequence(invalid)).toThrow(/type/i);
  });

  it('throws on click action without selector', () => {
    const invalid = JSON.stringify({
      description: 'test',
      actions: [{ type: 'click' }],
    });
    expect(() => deserializeInteractionSequence(invalid)).toThrow(/selector/i);
  });
});

// ---------------------------------------------------------------------------
// timelinesEqual
// ---------------------------------------------------------------------------

describe('timelinesEqual', () => {
  it('returns true for identical timelines', () => {
    expect(timelinesEqual(sampleTimeline, sampleTimeline)).toBe(true);
  });

  it('returns true for equivalent timelines with different key order', () => {
    // Create a timeline with different property insertion order
    const reordered: AccessibilityTimeline = {
      metadata: sampleTimeline.metadata,
      warnings: sampleTimeline.warnings,
      events: sampleTimeline.events,
      duration: sampleTimeline.duration,
      interactionSequence: sampleTimeline.interactionSequence,
      story: sampleTimeline.story,
      component: sampleTimeline.component,
      version: sampleTimeline.version,
    };
    expect(timelinesEqual(sampleTimeline, reordered)).toBe(true);
  });

  it('returns false for timelines with different events', () => {
    const different: AccessibilityTimeline = {
      ...sampleTimeline,
      events: [],
    };
    expect(timelinesEqual(sampleTimeline, different)).toBe(false);
  });

  it('handles null story correctly', () => {
    const a: AccessibilityTimeline = { ...sampleTimeline, story: null };
    const b: AccessibilityTimeline = { ...sampleTimeline, story: null };
    expect(timelinesEqual(a, b)).toBe(true);
  });
});
