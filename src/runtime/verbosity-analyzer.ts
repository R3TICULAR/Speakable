/**
 * Verbosity Analyzer
 *
 * Detects redundant and duplicate announcement patterns in accessibility
 * event timelines. While the heuristic analyzer catches "too many announcements
 * in a time window," this module performs deeper semantic analysis to identify
 * WHY announcements are being duplicated, and provides specific remediation
 * guidance.
 *
 * Detected patterns:
 *
 * 1. **Redundant state + live region** — When aria-selected/aria-checked changes
 *    on an element AND a live region announces the same state change, screen
 *    readers (especially VoiceOver) will read both.
 *
 * 2. **ActiveDescendant + state change on same element** — When
 *    aria-activedescendant moves to an element AND that element's state changes
 *    in the same interaction frame, VoiceOver reads the element twice.
 *
 * 3. **Name change + live region echo** — When an element's accessible name
 *    changes and a live region repeats that same content.
 *
 * 4. **Focus + activedescendant conflict** — When real DOM focus moves AND
 *    aria-activedescendant changes in the same frame, causing double-read.
 *
 * 5. **Multiple state changes on one element** — When several ARIA attributes
 *    change simultaneously on a single element, each triggering a separate read.
 *
 * @module runtime/verbosity-analyzer
 */

import type { AccessibilityEvent, StateChangedPayload, AnnouncementPayload } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Severity of a verbosity issue.
 * - "high": Users will definitely hear duplicate content (e.g., VoiceOver triple-read)
 * - "medium": Users will likely hear repeated info depending on screen reader settings
 * - "low": Potential redundancy that may only affect certain screen readers
 */
export type VerbositySeverity = 'high' | 'medium' | 'low';

/**
 * Category of the verbosity pattern detected.
 */
export type VerbosityPattern =
  | 'redundant-state-and-live-region'
  | 'activedescendant-plus-state-change'
  | 'name-change-plus-live-region'
  | 'focus-plus-activedescendant'
  | 'multiple-state-changes-same-element'
  | 'rapid-identical-announcements';

/**
 * A single verbosity finding with context and remediation guidance.
 */
export interface VerbosityFinding {
  /** Pattern category */
  pattern: VerbosityPattern;
  /** Severity level */
  severity: VerbositySeverity;
  /** Human-readable description of the problem */
  description: string;
  /** Specific remediation steps */
  remediation: string[];
  /** Which screen readers are most affected */
  affectedReaders: string[];
  /** The events that triggered this finding */
  relatedEvents: AccessibilityEvent[];
  /** Timestamp window where the duplicate occurred */
  timeWindow: { start: number; end: number };
  /** CSS selector of the element involved */
  elementSelector: string;
}

/**
 * Complete verbosity analysis report for a timeline.
 */
export interface VerbosityReport {
  /** All findings sorted by severity (high first) */
  findings: VerbosityFinding[];
  /** Summary counts by severity */
  summary: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  /** Overall verbosity score (0-100, lower is better) */
  score: number;
}

/**
 * Configuration for the verbosity analyzer.
 */
export interface VerbosityConfig {
  /** Time window (ms) to group related events into a single interaction frame (default: 150) */
  interactionFrameWindow: number;
  /** Minimum text similarity ratio to consider live region content redundant (default: 0.6) */
  textSimilarityThreshold: number;
}

const DEFAULT_CONFIG: VerbosityConfig = {
  interactionFrameWindow: 150,
  textSimilarityThreshold: 0.6,
};

// ---------------------------------------------------------------------------
// Text Similarity
// ---------------------------------------------------------------------------

/**
 * Computes a simple word-overlap similarity ratio between two strings.
 * Returns a value between 0 and 1.
 */
function textSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap++;
  }

  const maxSize = Math.max(wordsA.size, wordsB.size);
  return overlap / maxSize;
}

// ---------------------------------------------------------------------------
// Interaction Frame Grouping
// ---------------------------------------------------------------------------

interface InteractionFrame {
  start: number;
  end: number;
  events: AccessibilityEvent[];
}

/**
 * Groups events into interaction frames based on temporal proximity.
 * Events within `windowMs` of each other are considered part of the
 * same user interaction.
 */
function groupIntoFrames(events: AccessibilityEvent[], windowMs: number): InteractionFrame[] {
  if (events.length === 0) return [];

  const frames: InteractionFrame[] = [];
  let currentFrame: InteractionFrame = {
    start: events[0].timestamp,
    end: events[0].timestamp,
    events: [events[0]],
  };

  for (let i = 1; i < events.length; i++) {
    const event = events[i];
    if (event.timestamp - currentFrame.end <= windowMs) {
      currentFrame.events.push(event);
      currentFrame.end = event.timestamp;
    } else {
      frames.push(currentFrame);
      currentFrame = {
        start: event.timestamp,
        end: event.timestamp,
        events: [event],
      };
    }
  }

  frames.push(currentFrame);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern Detection
// ---------------------------------------------------------------------------

function detectRedundantStateAndLiveRegion(
  frame: InteractionFrame,
  _config: VerbosityConfig
): VerbosityFinding[] {
  const findings: VerbosityFinding[] = [];

  const stateChanges = frame.events.filter((e) => e.type === 'STATE_CHANGED');
  const announcements = frame.events.filter((e) => e.type === 'ANNOUNCEMENT');

  for (const stateEvent of stateChanges) {
    const payload = stateEvent.payload as StateChangedPayload;

    // Only relevant for state attributes that screen readers announce
    const announcedAttributes = [
      'aria-selected', 'aria-checked', 'aria-pressed', 'aria-expanded',
      'aria-disabled', 'aria-invalid', 'aria-current',
    ];
    if (!announcedAttributes.includes(payload.attribute)) continue;

    for (const announcement of announcements) {
      const annoPayload = announcement.payload as AnnouncementPayload;
      const annoText = annoPayload.text.toLowerCase();
      const elementName = stateEvent.target.accessibleName.toLowerCase();

      // Check if the live region text contains the element's name
      // (which indicates it's providing feedback about the same element
      // whose state just changed, meaning the SR will announce both)
      const nameInAnnouncement = elementName.length > 0 && annoText.includes(elementName);

      // Also check for state-related words that echo what the SR already announces
      const stateEchoWords = ['selected', 'deselected', 'checked', 'unchecked', 'expanded', 'collapsed', 'pressed'];
      const hasStateEcho = stateEchoWords.some((word) => annoText.includes(word));

      if (nameInAnnouncement && hasStateEcho) {
        findings.push({
          pattern: 'redundant-state-and-live-region',
          severity: 'high',
          description:
            `The ${payload.attribute} state change on "${stateEvent.target.accessibleName}" ` +
            `(${stateEvent.target.role}) is already announced by the screen reader, but a live ` +
            `region also announces similar content ("${annoPayload.text}"). ` +
            `This causes VoiceOver to read the information 2-3 times.`,
          remediation: [
            `Remove the live region announcement when ${payload.attribute} changes on the active element, ` +
            `since the screen reader already announces state transitions on the focused/active item.`,
            `If you need the live region for summary info (e.g., "3 of 5 selected"), ` +
            `debounce it with a 150ms+ delay and ensure the text does NOT repeat the option name.`,
            `Use a summary-only pattern in the live region: "3 of 5 selected" instead of ` +
            `"JavaScript selected. 3 of 5 selected." The element name is already announced ` +
            `via the state change.`,
            `Consider removing the live region entirely and relying on aria-selected/aria-checked ` +
            `state changes for per-item feedback.`,
          ],
          affectedReaders: ['VoiceOver (macOS)', 'VoiceOver (iOS)'],
          relatedEvents: [stateEvent, announcement],
          timeWindow: { start: frame.start, end: frame.end },
          elementSelector: stateEvent.target.selector,
        });
      }
    }
  }

  return findings;
}

function detectActiveDescendantPlusStateChange(
  frame: InteractionFrame,
  _config: VerbosityConfig
): VerbosityFinding[] {
  const findings: VerbosityFinding[] = [];

  // Look for STATE_CHANGED events where attribute is aria-activedescendant
  const activedescendantChanges = frame.events.filter(
    (e) => e.type === 'STATE_CHANGED' &&
      (e.payload as StateChangedPayload).attribute === 'aria-activedescendant'
  );

  const otherStateChanges = frame.events.filter(
    (e) => e.type === 'STATE_CHANGED' &&
      (e.payload as StateChangedPayload).attribute !== 'aria-activedescendant'
  );

  for (const adChange of activedescendantChanges) {
    const adPayload = adChange.payload as StateChangedPayload;
    const newValue = String(adPayload.newValue);
    const previousValue = String(adPayload.previousValue ?? '');

    // If activedescendant is being re-set to the SAME value, that's always a bug.
    // If it's moving to a DIFFERENT element, we only flag it if a state change
    // occurs on that same target within the frame (which causes double-read on VoiceOver).
    const isSameElement = newValue === previousValue;

    for (const stateChange of otherStateChanges) {
      const statePayload = stateChange.payload as StateChangedPayload;

      // Check if the state change is on the element that activedescendant points to
      const targetMatchesAD = stateChange.target.selector.includes(newValue) ||
        stateChange.target.selector === adChange.target.selector;

      if (!targetMatchesAD) continue;

      if (isSameElement) {
        // Definite bug: re-setting activedescendant to same element AND changing its state
        findings.push({
          pattern: 'activedescendant-plus-state-change',
          severity: 'high',
          description:
            `aria-activedescendant was re-set to the same value ("${newValue}") ` +
            `AND ${statePayload.attribute} changed on that element within ${frame.end - frame.start}ms. ` +
            `VoiceOver reads the element once for the activedescendant update, then again for the state change.`,
          remediation: [
            `When toggling selection on the already-active option, do NOT re-set aria-activedescendant ` +
            `to the same value. Only update it when the user navigates to a different option.`,
            `Batch DOM attribute changes: set aria-selected BEFORE updating aria-activedescendant, ` +
            `or skip the activedescendant update entirely when the active item hasn't changed.`,
            `For click interactions on options, avoid calling both setActiveDescendant() and ` +
            `toggleSelection() if the clicked item is already the active descendant.`,
          ],
          affectedReaders: ['VoiceOver (macOS)', 'VoiceOver (iOS)', 'Narrator'],
          relatedEvents: [adChange, stateChange],
          timeWindow: { start: frame.start, end: frame.end },
          elementSelector: stateChange.target.selector,
        });
      } else {
        // Moving to a different element + changing state is borderline.
        // Only flag as low severity since VoiceOver announcing the navigation
        // AND the state is sometimes the desired UX (click = navigate + select).
        findings.push({
          pattern: 'activedescendant-plus-state-change',
          severity: 'low',
          description:
            `aria-activedescendant moved to "${stateChange.target.accessibleName}" ` +
            `AND ${statePayload.attribute} changed on that element within ${frame.end - frame.start}ms. ` +
            `VoiceOver may announce the option name twice (once for navigation, once for state).`,
          remediation: [
            `If this is a click-to-select interaction, consider separating the activedescendant ` +
            `update and the state change by a microtask (Promise.resolve()) so VoiceOver ` +
            `processes them as separate assertions.`,
            `Alternatively, accept this as expected behavior for click interactions where ` +
            `navigation and selection happen simultaneously.`,
          ],
          affectedReaders: ['VoiceOver (macOS)'],
          relatedEvents: [adChange, stateChange],
          timeWindow: { start: frame.start, end: frame.end },
          elementSelector: stateChange.target.selector,
        });
      }
    }
  }

  return findings;
}

function detectNameChangePlusLiveRegion(
  frame: InteractionFrame,
  config: VerbosityConfig
): VerbosityFinding[] {
  const findings: VerbosityFinding[] = [];

  const nameChanges = frame.events.filter((e) => e.type === 'ACCESSIBLE_NAME_CHANGED');
  const announcements = frame.events.filter((e) => e.type === 'ANNOUNCEMENT');

  for (const nameEvent of nameChanges) {
    for (const announcement of announcements) {
      const annoPayload = announcement.payload as AnnouncementPayload;
      const similarity = textSimilarity(nameEvent.target.accessibleName, annoPayload.text);

      if (similarity >= config.textSimilarityThreshold) {
        findings.push({
          pattern: 'name-change-plus-live-region',
          severity: 'medium',
          description:
            `The accessible name of "${nameEvent.target.accessibleName}" (${nameEvent.target.role}) ` +
            `changed AND a live region announced similar content ("${annoPayload.text}"). ` +
            `Screen readers may announce both the name change and the live region.`,
          remediation: [
            `Choose one announcement channel: either update the element's accessible name ` +
            `(which the screen reader reads if the element is focused) OR use a live region, not both.`,
            `If the element is focused, prefer the name change. If it's not focused, prefer the live region.`,
            `Add a 200ms+ debounce to the live region update to let the name change announce first.`,
          ],
          affectedReaders: ['VoiceOver (macOS)', 'NVDA', 'JAWS'],
          relatedEvents: [nameEvent, announcement],
          timeWindow: { start: frame.start, end: frame.end },
          elementSelector: nameEvent.target.selector,
        });
      }
    }
  }

  return findings;
}

function detectFocusPlusActiveDescendant(
  frame: InteractionFrame,
  _config: VerbosityConfig
): VerbosityFinding[] {
  const findings: VerbosityFinding[] = [];

  const focusEvents = frame.events.filter((e) => e.type === 'FOCUS_CHANGED');
  const adChanges = frame.events.filter(
    (e) => e.type === 'STATE_CHANGED' &&
      (e.payload as StateChangedPayload).attribute === 'aria-activedescendant'
  );

  if (focusEvents.length > 0 && adChanges.length > 0) {
    findings.push({
      pattern: 'focus-plus-activedescendant',
      severity: 'medium',
      description:
        `Both real DOM focus moved AND aria-activedescendant changed within ${frame.end - frame.start}ms. ` +
        `Screen readers may announce the focused element AND then re-announce via activedescendant, ` +
        `causing a double-read.`,
      remediation: [
        `Choose one focus management strategy: either move real DOM focus to options (roving tabindex) ` +
        `OR use aria-activedescendant on the container. Do not mix both.`,
        `If using aria-activedescendant, keep DOM focus on the container (listbox/combobox) ` +
        `and only change the activedescendant attribute.`,
        `If using roving tabindex, set tabindex="0" on the active item and tabindex="-1" on others, ` +
        `and move focus directly via element.focus().`,
      ],
      affectedReaders: ['VoiceOver (macOS)', 'NVDA', 'JAWS', 'Narrator'],
      relatedEvents: [...focusEvents, ...adChanges],
      timeWindow: { start: frame.start, end: frame.end },
      elementSelector: focusEvents[0].target.selector,
    });
  }

  return findings;
}

function detectMultipleStateChangesSameElement(
  frame: InteractionFrame,
  _config: VerbosityConfig
): VerbosityFinding[] {
  const findings: VerbosityFinding[] = [];

  const stateChanges = frame.events.filter((e) => e.type === 'STATE_CHANGED');

  // Group by target selector
  const bySelector = new Map<string, AccessibilityEvent[]>();
  for (const event of stateChanges) {
    const existing = bySelector.get(event.target.selector) || [];
    existing.push(event);
    bySelector.set(event.target.selector, existing);
  }

  for (const [selector, events] of bySelector) {
    if (events.length >= 3) {
      const attributes = events.map((e) => (e.payload as StateChangedPayload).attribute);
      findings.push({
        pattern: 'multiple-state-changes-same-element',
        severity: 'medium',
        description:
          `${events.length} ARIA attributes changed simultaneously on "${events[0].target.accessibleName}" ` +
          `(${events[0].target.role}): ${attributes.join(', ')}. ` +
          `Some screen readers announce each attribute change individually, ` +
          `causing a verbose multi-part announcement.`,
        remediation: [
          `Batch attribute changes into a single DOM mutation frame by setting all attributes ` +
          `before the next microtask. Use requestAnimationFrame() or Promise.resolve() to group them.`,
          `Evaluate which attributes actually need to be communicated. For example, ` +
          `if aria-selected changes, the screen reader already announces it; additional ` +
          `aria-checked or aria-pressed changes may be redundant.`,
          `Consider using a single composite state (e.g., just aria-selected for listbox options) ` +
          `rather than multiple state attributes.`,
        ],
        affectedReaders: ['VoiceOver (macOS)', 'Narrator'],
        relatedEvents: events,
        timeWindow: { start: frame.start, end: frame.end },
        elementSelector: selector,
      });
    }
  }

  return findings;
}

function detectRapidIdenticalAnnouncements(
  frame: InteractionFrame,
  _config: VerbosityConfig
): VerbosityFinding[] {
  const findings: VerbosityFinding[] = [];

  const announcements = frame.events.filter((e) => e.type === 'ANNOUNCEMENT');

  // Check for identical or near-identical announcement text
  const seen = new Map<string, AccessibilityEvent[]>();
  for (const event of announcements) {
    const text = (event.payload as AnnouncementPayload).text.toLowerCase().trim();
    const existing = seen.get(text) || [];
    existing.push(event);
    seen.set(text, existing);
  }

  for (const [text, events] of seen) {
    if (events.length >= 2) {
      findings.push({
        pattern: 'rapid-identical-announcements',
        severity: 'high',
        description:
          `The same live region content ("${text}") was announced ${events.length} times ` +
          `within ${frame.end - frame.start}ms. Users will hear the same information repeated.`,
        remediation: [
          `Debounce live region updates. Clear the live region text content first, ` +
          `then set the new value after a 100-200ms delay.`,
          `If updating a live region's textContent to the same value, the screen reader ` +
          `may ignore it OR re-read it depending on implementation. Clear to empty string first.`,
          `Avoid updating the live region inside a loop or rapid event handler. ` +
          `Compute the final state and announce once.`,
        ],
        affectedReaders: ['VoiceOver (macOS)', 'VoiceOver (iOS)', 'NVDA', 'Narrator'],
        relatedEvents: events,
        timeWindow: { start: frame.start, end: frame.end },
        elementSelector: events[0].target.selector,
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyzes a timeline of accessibility events for verbosity issues.
 *
 * Groups events into interaction frames (events within a short time window
 * of each other), then checks each frame for patterns that cause screen
 * readers to announce redundant or duplicate content.
 *
 * @param events - Chronologically ordered accessibility events
 * @param config - Optional configuration overrides
 * @returns A VerbosityReport with all findings and a score
 */
export function analyzeVerbosity(
  events: AccessibilityEvent[],
  config?: Partial<VerbosityConfig>
): VerbosityReport {
  const cfg: VerbosityConfig = { ...DEFAULT_CONFIG, ...config };

  // Group events into interaction frames
  const frames = groupIntoFrames(events, cfg.interactionFrameWindow);

  // Run all detectors on each frame
  const findings: VerbosityFinding[] = [];

  for (const frame of frames) {
    findings.push(...detectRedundantStateAndLiveRegion(frame, cfg));
    findings.push(...detectActiveDescendantPlusStateChange(frame, cfg));
    findings.push(...detectNameChangePlusLiveRegion(frame, cfg));
    findings.push(...detectFocusPlusActiveDescendant(frame, cfg));
    findings.push(...detectMultipleStateChangesSameElement(frame, cfg));
    findings.push(...detectRapidIdenticalAnnouncements(frame, cfg));
  }

  // Sort by severity (high first)
  const severityOrder: Record<VerbositySeverity, number> = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Compute summary
  const summary = {
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
    total: findings.length,
  };

  // Score: 100 (perfect) minus weighted deductions
  const deductions = summary.high * 25 + summary.medium * 10 + summary.low * 3;
  const score = Math.max(0, 100 - deductions);

  return { findings, summary, score };
}

/**
 * Formats a verbosity report as human-readable text output.
 */
export function formatVerbosityReport(report: VerbosityReport): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('=== VERBOSITY ANALYSIS REPORT ===');
  lines.push('');
  lines.push(`Score: ${report.score}/100 ${report.score >= 80 ? '(Good)' : report.score >= 50 ? '(Needs attention)' : '(Critical verbosity issues)'}`);
  lines.push(`Findings: ${report.summary.total} (${report.summary.high} high, ${report.summary.medium} medium, ${report.summary.low} low)`);
  lines.push('');

  if (report.findings.length === 0) {
    lines.push('No verbosity issues detected. Announcements appear clean.');
    return lines.join('\n');
  }

  for (let i = 0; i < report.findings.length; i++) {
    const finding = report.findings[i];
    const severityIcon = finding.severity === 'high' ? '\u2718' : finding.severity === 'medium' ? '\u26A0' : '\u2139';

    lines.push(`${severityIcon} [${finding.severity.toUpperCase()}] ${finding.pattern}`);
    lines.push(`  Element: ${finding.elementSelector}`);
    lines.push(`  Window: ${finding.timeWindow.start}ms - ${finding.timeWindow.end}ms`);
    lines.push(`  ${finding.description}`);
    lines.push('');
    lines.push('  Affected: ' + finding.affectedReaders.join(', '));
    lines.push('');
    lines.push('  Remediation:');
    for (const step of finding.remediation) {
      lines.push(`    - ${step}`);
    }
    lines.push('');

    if (i < report.findings.length - 1) {
      lines.push('  ' + '\u2500'.repeat(60));
      lines.push('');
    }
  }

  return lines.join('\n');
}
