import type { AccessibilityEvent } from './types.js';
import type { BehaviorDiffReport, DiffEntry } from './diff-engine.js';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ClassifiedDiffEntry {
  event: AccessibilityEvent;
  previousEvent?: AccessibilityEvent;
  message: string;
  severity: SeverityLevel;
}

export interface ClassifiedDiffReport {
  entries: ClassifiedDiffEntry[];
  highestSeverity: SeverityLevel | null;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export function classifyDiff(report: BehaviorDiffReport): ClassifiedDiffReport {
  const entries: ClassifiedDiffEntry[] = [];

  // Removed events
  for (const entry of report.removed) {
    const severity = classifyRemoved(entry);
    entries.push({ ...entry, severity });
  }

  // Added events
  for (const entry of report.added) {
    const severity = classifyAdded(entry);
    entries.push({ ...entry, severity });
  }

  // Modified events
  for (const entry of report.modified) {
    const severity = classifyModified(entry);
    entries.push({ ...entry, severity });
  }

  const criticalCount = entries.filter(e => e.severity === 'critical').length;
  const highCount = entries.filter(e => e.severity === 'high').length;
  const mediumCount = entries.filter(e => e.severity === 'medium').length;
  const lowCount = entries.filter(e => e.severity === 'low').length;

  let highestSeverity: SeverityLevel | null = null;
  if (criticalCount > 0) highestSeverity = 'critical';
  else if (highCount > 0) highestSeverity = 'high';
  else if (mediumCount > 0) highestSeverity = 'medium';
  else if (lowCount > 0) highestSeverity = 'low';

  return { entries, highestSeverity, criticalCount, highCount, mediumCount, lowCount };
}

function classifyRemoved(entry: DiffEntry): SeverityLevel {
  switch (entry.event.type) {
    case 'FOCUS_CHANGED': return 'critical';
    case 'ANNOUNCEMENT': return 'critical';
    case 'DIALOG_OPENED': return 'high';
    case 'DIALOG_CLOSED': return 'high';
    case 'STATE_CHANGED': return 'high';
    case 'KEYBOARD_ACTION': return 'medium';
    default: return 'medium';
  }
}

function classifyAdded(entry: DiffEntry): SeverityLevel {
  switch (entry.event.type) {
    case 'WARNING': return 'high';
    case 'REGRESSION': return 'critical';
    case 'ANNOUNCEMENT': return 'medium';
    case 'FOCUS_CHANGED': return 'medium';
    default: return 'low';
  }
}

function classifyModified(entry: DiffEntry): SeverityLevel {
  switch (entry.event.type) {
    case 'FOCUS_CHANGED': return 'high';
    case 'STATE_CHANGED': return 'high';
    case 'ACCESSIBLE_NAME_CHANGED': return 'medium';
    case 'ANNOUNCEMENT': return 'medium';
    default: return 'medium';
  }
}
