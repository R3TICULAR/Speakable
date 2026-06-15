import { describe, it, expect } from 'vitest';
import { diffTimelines } from '../../../src/runtime/diff-engine.js';
import type { AccessibilityTimeline, AccessibilityEvent } from '../../../src/runtime/types.js';

/**
 * Unit tests for the Behavior Diff Engine.
 * Validates requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7.
 */

function makeTimeline(events: AccessibilityEvent[]): AccessibilityTimeline {
  return {
    version: '1.0',
    component: 'TestComponent',
    story: 'Default',
    interactionSequence: 'test sequence',
    duration: 1000,
    events,
    warnings: [],
    metadata: {
      capturedAt: '2024-01-01T00:00:00.000Z',
      speakableVersion: '1.0.0',
      sourceUrl: 'http://localhost',
      userAgent: 'test',
    },
  };
}

function makeFocusEvent(selector: string, timestamp: number, name = 'Element'): AccessibilityEvent {
  return {
    type: 'FOCUS_CHANGED',
    timestamp,
    target: { role: 'button', accessibleName: name, selector },
    payload: { kind: 'focus_changed', previousTarget: null },
  };
}

function makeStateEvent(
  selector: string,
  timestamp: number,
  attribute: string,
  previousValue: string | boolean | null,
  newValue: string | boolean | null
): AccessibilityEvent {
  return {
    type: 'STATE_CHANGED',
    timestamp,
    target: { role: 'button', accessibleName: 'Toggle', selector },
    payload: { kind: 'state_changed', attribute, previousValue, newValue },
  };
}

describe('diffTimelines', () => {
  it('should return empty diff for identical timelines', () => {
    const events: AccessibilityEvent[] = [
      makeFocusEvent('button.submit', 100),
      makeFocusEvent('button.cancel', 200),
    ];

    const baseline = makeTimeline(events);
    const current = makeTimeline(events);

    const report = diffTimelines(baseline, current);

    expect(report.added).toHaveLength(0);
    expect(report.removed).toHaveLength(0);
    expect(report.modified).toHaveLength(0);
    expect(report.summary.added).toBe(0);
    expect(report.summary.removed).toBe(0);
    expect(report.summary.modified).toBe(0);
  });

  it('should ignore timestamp-only differences (Req 8.6)', () => {
    const baselineEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.submit', 100),
      makeFocusEvent('button.cancel', 200),
    ];

    const currentEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.submit', 150), // different timestamp
      makeFocusEvent('button.cancel', 350), // different timestamp
    ];

    const report = diffTimelines(makeTimeline(baselineEvents), makeTimeline(currentEvents));

    expect(report.added).toHaveLength(0);
    expect(report.removed).toHaveLength(0);
    expect(report.modified).toHaveLength(0);
  });

  it('should detect added events (Req 8.3)', () => {
    const baselineEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.submit', 100),
    ];

    const currentEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.submit', 100),
      makeFocusEvent('button.cancel', 200), // added
    ];

    const report = diffTimelines(makeTimeline(baselineEvents), makeTimeline(currentEvents));

    expect(report.added).toHaveLength(1);
    expect(report.added[0].event.target.selector).toBe('button.cancel');
    expect(report.removed).toHaveLength(0);
    expect(report.modified).toHaveLength(0);
    expect(report.summary.added).toBe(1);
  });

  it('should detect removed events (Req 8.4)', () => {
    const baselineEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.submit', 100),
      makeFocusEvent('button.cancel', 200),
    ];

    const currentEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.submit', 100),
      // button.cancel removed
    ];

    const report = diffTimelines(makeTimeline(baselineEvents), makeTimeline(currentEvents));

    expect(report.removed).toHaveLength(1);
    expect(report.removed[0].event.target.selector).toBe('button.cancel');
    expect(report.added).toHaveLength(0);
    expect(report.modified).toHaveLength(0);
    expect(report.summary.removed).toBe(1);
  });

  it('should detect modified events with different payloads (Req 8.5)', () => {
    const baselineEvents: AccessibilityEvent[] = [
      makeStateEvent('button.toggle', 100, 'aria-expanded', 'false', 'true'),
    ];

    const currentEvents: AccessibilityEvent[] = [
      makeStateEvent('button.toggle', 100, 'aria-expanded', 'true', 'false'), // different payload
    ];

    const report = diffTimelines(makeTimeline(baselineEvents), makeTimeline(currentEvents));

    expect(report.modified).toHaveLength(1);
    expect(report.modified[0].event).toEqual(currentEvents[0]);
    expect(report.modified[0].previousEvent).toEqual(baselineEvents[0]);
    expect(report.added).toHaveLength(0);
    expect(report.removed).toHaveLength(0);
    expect(report.summary.modified).toBe(1);
  });

  it('should match events by type + target selector (Req 8.2)', () => {
    const baselineEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.first', 100),
      makeFocusEvent('button.second', 200),
    ];

    // Same events, different order of timestamps but same keys
    const currentEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.second', 50),
      makeFocusEvent('button.first', 150),
    ];

    const report = diffTimelines(makeTimeline(baselineEvents), makeTimeline(currentEvents));

    // All events match by type + selector, timestamps differ but are ignored
    expect(report.added).toHaveLength(0);
    expect(report.removed).toHaveLength(0);
    expect(report.modified).toHaveLength(0);
  });

  it('should handle multiple events with the same key', () => {
    const baselineEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.submit', 100),
      makeFocusEvent('button.submit', 200),
    ];

    const currentEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.submit', 100),
      makeFocusEvent('button.submit', 200),
      makeFocusEvent('button.submit', 300), // extra
    ];

    const report = diffTimelines(makeTimeline(baselineEvents), makeTimeline(currentEvents));

    expect(report.added).toHaveLength(1);
    expect(report.removed).toHaveLength(0);
    expect(report.modified).toHaveLength(0);
  });

  it('should include correct summary counts matching array lengths (Req 8.7)', () => {
    const baselineEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.a', 100),
      makeFocusEvent('button.b', 200),
      makeStateEvent('button.c', 300, 'aria-expanded', 'false', 'true'),
    ];

    const currentEvents: AccessibilityEvent[] = [
      makeFocusEvent('button.a', 100),
      // button.b removed
      makeStateEvent('button.c', 300, 'aria-expanded', 'true', 'false'), // modified
      makeFocusEvent('button.d', 400), // added
    ];

    const report = diffTimelines(makeTimeline(baselineEvents), makeTimeline(currentEvents));

    expect(report.summary.totalBaseline).toBe(3);
    expect(report.summary.totalCurrent).toBe(3);
    expect(report.summary.added).toBe(report.added.length);
    expect(report.summary.removed).toBe(report.removed.length);
    expect(report.summary.modified).toBe(report.modified.length);
    expect(report.baseline.totalEvents).toBe(3);
    expect(report.current.totalEvents).toBe(3);
  });

  it('should handle empty timelines', () => {
    const report = diffTimelines(makeTimeline([]), makeTimeline([]));

    expect(report.added).toHaveLength(0);
    expect(report.removed).toHaveLength(0);
    expect(report.modified).toHaveLength(0);
    expect(report.summary.totalBaseline).toBe(0);
    expect(report.summary.totalCurrent).toBe(0);
  });

  it('should detect modification when accessible name changes', () => {
    const baselineEvents: AccessibilityEvent[] = [{
      type: 'FOCUS_CHANGED',
      timestamp: 100,
      target: { role: 'button', accessibleName: 'Submit', selector: 'button.submit' },
      payload: { kind: 'focus_changed', previousTarget: null },
    }];

    const currentEvents: AccessibilityEvent[] = [{
      type: 'FOCUS_CHANGED',
      timestamp: 100,
      target: { role: 'button', accessibleName: 'Send', selector: 'button.submit' },
      payload: { kind: 'focus_changed', previousTarget: null },
    }];

    const report = diffTimelines(makeTimeline(baselineEvents), makeTimeline(currentEvents));

    expect(report.modified).toHaveLength(1);
    expect(report.modified[0].message).toContain('accessible name changed');
    expect(report.modified[0].message).toContain('Submit');
    expect(report.modified[0].message).toContain('Send');
  });

  it('should produce a BehaviorDiffReport (Req 8.1)', () => {
    const report = diffTimelines(makeTimeline([]), makeTimeline([]));

    // Verify all required fields are present
    expect(report).toHaveProperty('baseline');
    expect(report).toHaveProperty('current');
    expect(report).toHaveProperty('added');
    expect(report).toHaveProperty('removed');
    expect(report).toHaveProperty('modified');
    expect(report).toHaveProperty('summary');
    expect(report.summary).toHaveProperty('totalBaseline');
    expect(report.summary).toHaveProperty('totalCurrent');
    expect(report.summary).toHaveProperty('added');
    expect(report.summary).toHaveProperty('removed');
    expect(report.summary).toHaveProperty('modified');
  });
});
