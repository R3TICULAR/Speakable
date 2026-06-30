/**
 * Verbosity Analyzer Tests
 *
 * Tests the detection of redundant/duplicate announcement patterns.
 */
import { describe, it, expect } from 'vitest';
import { analyzeVerbosity, formatVerbosityReport } from '../../src/runtime/verbosity-analyzer.js';
import type { AccessibilityEvent } from '../../src/runtime/types.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<AccessibilityEvent> & Pick<AccessibilityEvent, 'type' | 'timestamp' | 'payload'>): AccessibilityEvent {
  return {
    target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Verbosity Analyzer', () => {

  describe('Redundant State + Live Region', () => {
    it('detects when aria-selected change and live region announce the same content', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 100,
          target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        }),
        makeEvent({
          type: 'ANNOUNCEMENT',
          timestamp: 110,
          target: { role: 'status', accessibleName: '', selector: '#live-region' },
          payload: { kind: 'announcement', politeness: 'polite', text: 'JavaScript selected. 1 of 5 selected.' },
        }),
      ];

      const report = analyzeVerbosity(events);
      expect(report.findings.length).toBeGreaterThan(0);
      expect(report.findings[0].pattern).toBe('redundant-state-and-live-region');
      expect(report.findings[0].severity).toBe('high');
      expect(report.findings[0].affectedReaders).toContain('VoiceOver (macOS)');
      expect(report.findings[0].remediation.length).toBeGreaterThan(0);
    });

    it('does not flag when live region text is unrelated to state change', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 100,
          target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        }),
        makeEvent({
          type: 'ANNOUNCEMENT',
          timestamp: 110,
          target: { role: 'status', accessibleName: '', selector: '#live-region' },
          payload: { kind: 'announcement', politeness: 'polite', text: 'Loading complete.' },
        }),
      ];

      const report = analyzeVerbosity(events);
      const redundant = report.findings.filter((f) => f.pattern === 'redundant-state-and-live-region');
      expect(redundant.length).toBe(0);
    });
  });

  describe('ActiveDescendant + State Change', () => {
    it('detects when activedescendant is re-set to same value and state changes', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 100,
          target: { role: 'listbox', accessibleName: 'Languages', selector: '#listbox' },
          payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-js', newValue: 'option-js' },
        }),
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 105,
          target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        }),
      ];

      const report = analyzeVerbosity(events);
      const adFindings = report.findings.filter((f) => f.pattern === 'activedescendant-plus-state-change');
      expect(adFindings.length).toBeGreaterThan(0);
      expect(adFindings[0].severity).toBe('high');
    });

    it('flags low severity when moving to a different element with state change', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 100,
          target: { role: 'listbox', accessibleName: 'Languages', selector: '#listbox' },
          payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-py', newValue: 'option-js' },
        }),
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 105,
          target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        }),
      ];

      const report = analyzeVerbosity(events);
      const adFindings = report.findings.filter((f) => f.pattern === 'activedescendant-plus-state-change');
      expect(adFindings.length).toBeGreaterThan(0);
      expect(adFindings[0].severity).toBe('low');
    });
  });

  describe('Focus + ActiveDescendant Conflict', () => {
    it('detects when real focus moves AND activedescendant changes in same frame', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'FOCUS_CHANGED',
          timestamp: 100,
          target: { role: 'listbox', accessibleName: 'Languages', selector: '#listbox' },
          payload: { kind: 'focus_changed', previousTarget: null },
        }),
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 110,
          target: { role: 'listbox', accessibleName: 'Languages', selector: '#listbox' },
          payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: null, newValue: 'option-js' },
        }),
      ];

      const report = analyzeVerbosity(events);
      const focusFindings = report.findings.filter((f) => f.pattern === 'focus-plus-activedescendant');
      expect(focusFindings.length).toBeGreaterThan(0);
      expect(focusFindings[0].severity).toBe('medium');
    });
  });

  describe('Multiple State Changes Same Element', () => {
    it('detects 3+ attribute changes on one element in one frame', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 100,
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        }),
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 102,
          payload: { kind: 'state_changed', attribute: 'aria-checked', previousValue: 'false', newValue: 'true' },
        }),
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 104,
          payload: { kind: 'state_changed', attribute: 'aria-pressed', previousValue: 'false', newValue: 'true' },
        }),
      ];

      const report = analyzeVerbosity(events);
      const multiFindings = report.findings.filter((f) => f.pattern === 'multiple-state-changes-same-element');
      expect(multiFindings.length).toBeGreaterThan(0);
    });
  });

  describe('Rapid Identical Announcements', () => {
    it('detects the same live region text announced multiple times', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'ANNOUNCEMENT',
          timestamp: 100,
          target: { role: 'status', accessibleName: '', selector: '#live' },
          payload: { kind: 'announcement', politeness: 'polite', text: 'JavaScript selected.' },
        }),
        makeEvent({
          type: 'ANNOUNCEMENT',
          timestamp: 120,
          target: { role: 'status', accessibleName: '', selector: '#live' },
          payload: { kind: 'announcement', politeness: 'polite', text: 'JavaScript selected.' },
        }),
      ];

      const report = analyzeVerbosity(events);
      const rapidFindings = report.findings.filter((f) => f.pattern === 'rapid-identical-announcements');
      expect(rapidFindings.length).toBeGreaterThan(0);
      expect(rapidFindings[0].severity).toBe('high');
    });
  });

  describe('Scoring', () => {
    it('returns score of 100 for clean events', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'FOCUS_CHANGED',
          timestamp: 100,
          payload: { kind: 'focus_changed', previousTarget: null },
        }),
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 500, // far enough apart to be a different frame
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        }),
      ];

      const report = analyzeVerbosity(events);
      expect(report.score).toBe(100);
      expect(report.summary.total).toBe(0);
    });

    it('deducts heavily for high severity findings', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'ANNOUNCEMENT',
          timestamp: 100,
          target: { role: 'status', accessibleName: '', selector: '#live' },
          payload: { kind: 'announcement', politeness: 'polite', text: 'Selected item.' },
        }),
        makeEvent({
          type: 'ANNOUNCEMENT',
          timestamp: 110,
          target: { role: 'status', accessibleName: '', selector: '#live' },
          payload: { kind: 'announcement', politeness: 'polite', text: 'Selected item.' },
        }),
      ];

      const report = analyzeVerbosity(events);
      expect(report.score).toBeLessThan(80);
    });
  });

  describe('Report Formatting', () => {
    it('produces readable text output', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 100,
          target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        }),
        makeEvent({
          type: 'ANNOUNCEMENT',
          timestamp: 110,
          target: { role: 'status', accessibleName: '', selector: '#live-region' },
          payload: { kind: 'announcement', politeness: 'polite', text: 'JavaScript selected. 1 of 5 selected.' },
        }),
      ];

      const report = analyzeVerbosity(events);
      const output = formatVerbosityReport(report);

      expect(output).toContain('VERBOSITY ANALYSIS REPORT');
      expect(output).toContain('Score:');
      expect(output).toContain('Remediation');
      expect(output).toContain('VoiceOver');
    });
  });

  describe('Frame Windowing', () => {
    it('events far apart are in separate frames and do not trigger findings', () => {
      const events: AccessibilityEvent[] = [
        makeEvent({
          type: 'STATE_CHANGED',
          timestamp: 100,
          target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        }),
        makeEvent({
          type: 'ANNOUNCEMENT',
          timestamp: 5000, // 5 seconds later, clearly a different interaction
          target: { role: 'status', accessibleName: '', selector: '#live-region' },
          payload: { kind: 'announcement', politeness: 'polite', text: 'JavaScript selected. 1 of 5 selected.' },
        }),
      ];

      const report = analyzeVerbosity(events);
      const redundant = report.findings.filter((f) => f.pattern === 'redundant-state-and-live-region');
      expect(redundant.length).toBe(0);
    });
  });
});
