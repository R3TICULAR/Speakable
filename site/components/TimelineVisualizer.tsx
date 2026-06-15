'use client';

import { useState, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Inlined types (subset of src/runtime/types.ts for the client component)
// ---------------------------------------------------------------------------

type EventType =
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

interface EventTarget {
  role: string;
  accessibleName: string;
  selector: string;
}

interface FocusChangedPayload {
  kind: 'focus_changed';
  previousTarget: EventTarget | null;
}

interface AnnouncementPayload {
  kind: 'announcement';
  politeness: 'polite' | 'assertive';
  text: string;
}

interface RoleChangedPayload {
  kind: 'role_changed';
  previousRole: string;
  newRole: string;
}

interface AccessibleNameChangedPayload {
  kind: 'accessible_name_changed';
  previousName: string;
  newName: string;
}

interface StateChangedPayload {
  kind: 'state_changed';
  attribute: string;
  previousValue: string | boolean | null;
  newValue: string | boolean | null;
}

interface DialogOpenedPayload {
  kind: 'dialog_opened';
  dialogName: string;
  isModal: boolean;
}

interface DialogClosedPayload {
  kind: 'dialog_closed';
  dialogName: string;
}

interface KeyboardActionPayload {
  kind: 'keyboard_action';
  key: string;
  modifiers: string[];
}

interface WarningPayload {
  kind: 'warning';
  message: string;
}

type EventPayload =
  | FocusChangedPayload
  | AnnouncementPayload
  | RoleChangedPayload
  | AccessibleNameChangedPayload
  | StateChangedPayload
  | DialogOpenedPayload
  | DialogClosedPayload
  | KeyboardActionPayload
  | WarningPayload;

export interface AccessibilityEvent {
  type: EventType;
  timestamp: number;
  target: EventTarget;
  payload: EventPayload;
}

// ---------------------------------------------------------------------------
// Filter categories
// ---------------------------------------------------------------------------

type FilterCategory = 'all' | 'focus' | 'announcements' | 'state' | 'warnings';

const FILTER_OPTIONS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'focus', label: 'Focus' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'state', label: 'State Changes' },
  { key: 'warnings', label: 'Warnings' },
];

function getEventCategory(type: EventType): FilterCategory {
  switch (type) {
    case 'FOCUS_CHANGED':
      return 'focus';
    case 'ANNOUNCEMENT':
      return 'announcements';
    case 'STATE_CHANGED':
    case 'ROLE_CHANGED':
    case 'ACCESSIBLE_NAME_CHANGED':
    case 'DIALOG_OPENED':
    case 'DIALOG_CLOSED':
      return 'state';
    case 'WARNING':
    case 'REGRESSION':
      return 'warnings';
    default:
      return 'all';
  }
}

// ---------------------------------------------------------------------------
// Event display helpers
// ---------------------------------------------------------------------------

function getEventColor(type: EventType): { dot: string; bg: string; text: string } {
  switch (type) {
    case 'FOCUS_CHANGED':
      return { dot: 'bg-blue-400', bg: 'bg-blue-400/10', text: 'text-blue-300' };
    case 'ANNOUNCEMENT':
      return { dot: 'bg-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-300' };
    case 'STATE_CHANGED':
      return { dot: 'bg-amber-400', bg: 'bg-amber-400/10', text: 'text-amber-300' };
    case 'ROLE_CHANGED':
    case 'ACCESSIBLE_NAME_CHANGED':
      return { dot: 'bg-amber-400', bg: 'bg-amber-400/10', text: 'text-amber-300' };
    case 'WARNING':
      return { dot: 'bg-red-400', bg: 'bg-red-400/10', text: 'text-red-300' };
    case 'REGRESSION':
      return { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400' };
    case 'DIALOG_OPENED':
    case 'DIALOG_CLOSED':
      return { dot: 'bg-purple-400', bg: 'bg-purple-400/10', text: 'text-purple-300' };
    case 'KEYBOARD_ACTION':
      return { dot: 'bg-slate-400', bg: 'bg-slate-400/10', text: 'text-slate-300' };
    default:
      return { dot: 'bg-slate-400', bg: 'bg-slate-400/10', text: 'text-slate-300' };
  }
}

function getEventTypeLabel(type: EventType): string {
  switch (type) {
    case 'FOCUS_CHANGED': return 'Focus';
    case 'ANNOUNCEMENT': return 'Announce';
    case 'STATE_CHANGED': return 'State';
    case 'ROLE_CHANGED': return 'Role';
    case 'ACCESSIBLE_NAME_CHANGED': return 'Name';
    case 'DIALOG_OPENED': return 'Dialog Open';
    case 'DIALOG_CLOSED': return 'Dialog Close';
    case 'KEYBOARD_ACTION': return 'Keyboard';
    case 'WARNING': return 'Warning';
    case 'REGRESSION': return 'Regression';
    default: return type;
  }
}

function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const millis = ms % 1000;
  return `${seconds}.${String(millis).padStart(3, '0')}s`;
}

function buildDescription(event: AccessibilityEvent): string {
  const { payload, target } = event;

  switch (payload.kind) {
    case 'focus_changed': {
      const from = payload.previousTarget?.accessibleName || 'nothing';
      const to = target.accessibleName || target.role;
      return `Focus moved from "${from}" to "${to}"`;
    }
    case 'announcement':
      return `Announced: "${payload.text}" (${payload.politeness})`;
    case 'role_changed':
      return `Role changed: ${payload.previousRole} to ${payload.newRole}`;
    case 'accessible_name_changed':
      return `Name changed: "${payload.previousName}" to "${payload.newName}"`;
    case 'state_changed':
      return `${payload.attribute}: ${String(payload.previousValue)} to ${String(payload.newValue)}`;
    case 'dialog_opened':
      return `Dialog opened: "${payload.dialogName}"${payload.isModal ? ' (modal)' : ''}`;
    case 'dialog_closed':
      return `Dialog closed: "${payload.dialogName}"`;
    case 'keyboard_action': {
      const mods = payload.modifiers.length > 0 ? payload.modifiers.join('+') + '+' : '';
      return `Key pressed: ${mods}${payload.key}`;
    }
    case 'warning':
      return payload.message;
    default:
      return target.accessibleName || target.selector;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface TimelineVisualizerProps {
  events: AccessibilityEvent[];
}

export function TimelineVisualizer({ events }: TimelineVisualizerProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter((e) => getEventCategory(e.type) === activeFilter);
  }, [events, activeFilter]);

  const isWarningMode = activeFilter === 'warnings';

  return (
    <div className="rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border-b border-slate-800">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="ml-3 text-[11px] text-slate-500 font-mono">
          accessibility timeline
        </span>
        <span className="ml-auto text-[11px] text-slate-600 font-mono">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-slate-800/60 bg-slate-900/80">
        {FILTER_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === key
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            aria-pressed={activeFilter === key}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="max-h-[400px] overflow-y-auto" role="list" aria-label="Accessibility events timeline">
        {filteredEvents.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            No events to display
          </div>
        )}

        {filteredEvents.map((event, i) => {
          const colors = getEventColor(event.type);
          const isHighSeverity = isWarningMode && (event.type === 'WARNING' || event.type === 'REGRESSION');

          return (
            <div
              key={i}
              role="listitem"
              className={`flex items-start gap-3 px-4 py-3 border-b border-slate-800/40 last:border-b-0 transition-colors ${
                isHighSeverity ? 'bg-red-500/5 border-l-2 border-l-red-500' : ''
              }`}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-1 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} aria-hidden="true" />
                {i < filteredEvents.length - 1 && (
                  <div className="w-px h-full min-h-[16px] bg-slate-800 mt-1" aria-hidden="true" />
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-mono ${colors.text} px-1.5 py-0.5 rounded ${colors.bg}`}>
                    {getEventTypeLabel(event.type)}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed truncate ${isHighSeverity ? 'text-red-300' : 'text-slate-300'}`}>
                  {buildDescription(event)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-slate-800/40 border-t border-slate-800 text-[10px] font-mono">
        <span className="text-blue-400">
          {events.filter((e) => e.type === 'FOCUS_CHANGED').length} focus
        </span>
        <span className="text-emerald-400">
          {events.filter((e) => e.type === 'ANNOUNCEMENT').length} announcements
        </span>
        <span className="text-amber-400">
          {events.filter((e) => getEventCategory(e.type) === 'state').length} state
        </span>
        <span className="text-red-400">
          {events.filter((e) => e.type === 'WARNING' || e.type === 'REGRESSION').length} warnings
        </span>
      </div>
    </div>
  );
}
