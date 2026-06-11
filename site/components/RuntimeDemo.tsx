'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TimelineVisualizer, AccessibilityEvent } from './TimelineVisualizer';

type DemoType = 'modal' | 'combobox';
type DemoVariant = 'working' | 'broken';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
];

function useEventCapture() {
  const [events, setEvents] = useState<AccessibilityEvent[]>([]);
  const sessionStart = useRef(Date.now());

  const capture = useCallback((event: Omit<AccessibilityEvent, 'timestamp'>) => {
    const timestamp = Date.now() - sessionStart.current;
    setEvents((prev) => [...prev, { ...event, timestamp } as AccessibilityEvent]);
  }, []);

  const clear = useCallback(() => {
    setEvents([]);
    sessionStart.current = Date.now();
  }, []);

  return { events, capture, clear };
}

function ModalDemo({ variant, capture }: { variant: DemoVariant; capture: (e: Omit<AccessibilityEvent, 'timestamp'>) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isWorking = variant === 'working';

  const openDialog = () => {
    setIsOpen(true);
    capture({
      type: 'STATE_CHANGED',
      target: { role: 'button', accessibleName: 'Open Settings', selector: 'button.trigger' },
      payload: { kind: 'state_changed', attribute: 'aria-expanded', previousValue: 'false', newValue: 'true' },
    });
    capture({
      type: 'DIALOG_OPENED',
      target: { role: 'dialog', accessibleName: 'Settings', selector: 'div[role="dialog"]' },
      payload: { kind: 'dialog_opened', dialogName: 'Settings', isModal: true },
    });
  };

  const closeDialog = () => {
    setIsOpen(false);
    capture({
      type: 'DIALOG_CLOSED',
      target: { role: 'dialog', accessibleName: 'Settings', selector: 'div[role="dialog"]' },
      payload: { kind: 'dialog_closed', dialogName: 'Settings' },
    });
    if (isWorking) {
      triggerRef.current?.focus();
    }
  };

  useEffect(() => {
    if (isOpen && isWorking) {
      // Move focus into dialog
      setTimeout(() => closeRef.current?.focus(), 50);
    }
    if (isOpen && !isWorking) {
      // Broken: don't move focus, log warning
      setTimeout(() => {
        capture({
          type: 'WARNING',
          target: { role: 'dialog', accessibleName: 'Settings', selector: 'div[role="dialog"]' },
          payload: { kind: 'warning', message: 'Focus was not moved into modal dialog on open' },
        });
      }, 100);
    }
  }, [isOpen, isWorking, capture]);

  // Focus trap for working variant
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeDialog();
      return;
    }

    if (e.key === 'Tab' && isWorking && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    if (e.key === 'Tab' && !isWorking) {
      // Broken: allow focus to escape, log warning after a tick
      setTimeout(() => {
        if (dialogRef.current && !dialogRef.current.contains(document.activeElement)) {
          capture({
            type: 'WARNING',
            target: { role: 'dialog', accessibleName: 'Settings', selector: 'div[role="dialog"]' },
            payload: { kind: 'warning', message: 'Focus escaped modal dialog' },
          });
        }
      }, 50);
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        onClick={openDialog}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Open Settings
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeDialog}
            aria-hidden="true"
          />
          {/* Dialog */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
                <button
                  ref={closeRef}
                  onClick={closeDialog}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                <label htmlFor="display-name" className="block text-sm font-medium text-slate-700">
                  Display name
                </label>
                <input
                  id="display-name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={closeDialog}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ComboboxDemo({ variant, capture }: { variant: DemoVariant; capture: (e: Omit<AccessibilityEvent, 'timestamp'>) => void }) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedValue, setSelectedValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const isWorking = variant === 'working';

  const filtered = query
    ? US_STATES.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : US_STATES;

  const announce = useCallback((text: string, politeness: 'polite' | 'assertive') => {
    if (!isWorking) return;
    if (liveRef.current) {
      liveRef.current.textContent = text;
    }
    capture({
      type: 'ANNOUNCEMENT',
      target: { role: 'listbox', accessibleName: 'State suggestions', selector: 'ul[role="listbox"]' },
      payload: { kind: 'announcement', politeness, text },
    });
  }, [isWorking, capture]);

  const expand = (filteredCount: number) => {
    if (!isExpanded) {
      setIsExpanded(true);
      capture({
        type: 'STATE_CHANGED',
        target: { role: 'combobox', accessibleName: 'State', selector: 'input[role="combobox"]' },
        payload: { kind: 'state_changed', attribute: 'aria-expanded', previousValue: 'false', newValue: 'true' },
      });
      announce(`${filteredCount} results available`, 'polite');
    }
  };

  const collapse = () => {
    if (isExpanded) {
      setIsExpanded(false);
      setHighlightedIndex(-1);
      capture({
        type: 'STATE_CHANGED',
        target: { role: 'combobox', accessibleName: 'State', selector: 'input[role="combobox"]' },
        payload: { kind: 'state_changed', attribute: 'aria-expanded', previousValue: 'true', newValue: 'false' },
      });
    }
  };

  const selectOption = (value: string) => {
    setSelectedValue(value);
    setQuery(value);
    collapse();
    announce(`${value} selected`, 'assertive');
    if (!isWorking) {
      capture({
        type: 'WARNING',
        target: { role: 'combobox', accessibleName: 'State', selector: 'input[role="combobox"]' },
        payload: { kind: 'warning', message: 'No selection announcement provided to screen readers' },
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setHighlightedIndex(-1);
    const count = val
      ? US_STATES.filter((s) => s.toLowerCase().includes(val.toLowerCase())).length
      : US_STATES.length;
    if (val) {
      expand(count);
      if (isWorking) {
        announce(`${count} results available`, 'polite');
      }
    } else {
      collapse();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isExpanded) {
        expand(filtered.length);
      }
      const next = Math.min(highlightedIndex + 1, filtered.length - 1);
      setHighlightedIndex(next);
      if (isWorking) {
        capture({
          type: 'STATE_CHANGED',
          target: { role: 'option', accessibleName: filtered[next], selector: `li[data-index="${next}"]` },
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        });
        announce(`${filtered[next]}, ${next + 1} of ${filtered.length}`, 'assertive');
      } else {
        capture({
          type: 'WARNING',
          target: { role: 'combobox', accessibleName: 'State', selector: 'input[role="combobox"]' },
          payload: { kind: 'warning', message: 'Keyboard navigation produced no accessibility announcement' },
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.max(highlightedIndex - 1, 0);
      setHighlightedIndex(next);
      if (isWorking) {
        capture({
          type: 'STATE_CHANGED',
          target: { role: 'option', accessibleName: filtered[next], selector: `li[data-index="${next}"]` },
          payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
        });
        announce(`${filtered[next]}, ${next + 1} of ${filtered.length}`, 'assertive');
      }
    } else if (e.key === 'Enter' && isExpanded && highlightedIndex >= 0) {
      e.preventDefault();
      selectOption(filtered[highlightedIndex]);
    } else if (e.key === 'Escape') {
      collapse();
    }
  };

  const activeDescendant = isExpanded && highlightedIndex >= 0
    ? `option-${highlightedIndex}`
    : undefined;

  return (
    <div className="w-full max-w-xs relative">
      <label htmlFor="state-combobox" className="block text-sm font-medium text-slate-700 mb-1">
        State
      </label>
      <input
        ref={inputRef}
        id="state-combobox"
        role="combobox"
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (query) expand(filtered.length); }}
        onBlur={() => { setTimeout(collapse, 150); }}
        aria-expanded={isExpanded}
        aria-controls="state-listbox"
        aria-autocomplete="list"
        aria-activedescendant={activeDescendant}
        autoComplete="off"
        placeholder="Type to search states..."
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      {isExpanded && filtered.length > 0 && (
        <ul
          ref={listboxRef}
          id="state-listbox"
          role="listbox"
          aria-label="State suggestions"
          className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filtered.slice(0, 10).map((state, i) => (
            <li
              key={state}
              id={`option-${i}`}
              role="option"
              data-index={i}
              aria-selected={isWorking ? i === highlightedIndex : undefined}
              onClick={() => selectOption(state)}
              className={`px-3 py-2 text-sm cursor-pointer ${
                i === highlightedIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {state}
            </li>
          ))}
        </ul>
      )}

      {/* Live region for announcements (working variant only) */}
      <div
        ref={liveRef}
        aria-live={isWorking ? 'polite' : undefined}
        aria-atomic="true"
        className="sr-only"
        role="status"
      />

      {selectedValue && (
        <p className="mt-2 text-xs text-slate-500">
          Selected: <span className="font-medium text-slate-700">{selectedValue}</span>
        </p>
      )}
    </div>
  );
}

export function RuntimeDemo() {
  const [activeDemo, setActiveDemo] = useState<DemoType>('modal');
  const [activeVariant, setActiveVariant] = useState<DemoVariant>('working');
  const { events, capture, clear } = useEventCapture();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<string>('');

  // Track focus changes on the demo container
  const handleFocusCapture = (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    const role = target.getAttribute('role') || target.tagName.toLowerCase();
    const name = target.getAttribute('aria-label')
      || target.textContent?.slice(0, 30)
      || '';

    const currentId = `${role}:${name}`;
    if (currentId === lastFocusRef.current) return;

    const previousName = lastFocusRef.current.split(':')[1] || '';
    lastFocusRef.current = currentId;

    capture({
      type: 'FOCUS_CHANGED',
      target: { role, accessibleName: name, selector: target.tagName.toLowerCase() },
      payload: {
        kind: 'focus_changed',
        previousTarget: previousName
          ? { role: 'element', accessibleName: previousName, selector: '' }
          : null,
      },
    });
  };

  // Reset events when switching demo or variant
  const switchDemo = (demo: DemoType) => {
    setActiveDemo(demo);
    setActiveVariant('working');
    clear();
    lastFocusRef.current = '';
  };

  const switchVariant = (variant: DemoVariant) => {
    setActiveVariant(variant);
    clear();
    lastFocusRef.current = '';
  };

  return (
    <div className="space-y-6">
      {/* Demo selector tabs */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => switchDemo('modal')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeDemo === 'modal'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          aria-pressed={activeDemo === 'modal'}
        >
          Modal Demo
        </button>
        <button
          onClick={() => switchDemo('combobox')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeDemo === 'combobox'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          aria-pressed={activeDemo === 'combobox'}
        >
          Combobox Demo
        </button>
      </div>

      {/* Demo card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Header with variant toggle */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {activeDemo === 'modal' ? 'Modal Dialog' : 'Combobox'} Pattern
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeDemo === 'modal'
                ? 'Interact with the button below to see focus management in action'
                : 'Type and use arrow keys to navigate options'}
            </p>
          </div>

          {/* Working / Broken toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => switchVariant('working')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeVariant === 'working'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-pressed={activeVariant === 'working'}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Working
            </button>
            <button
              onClick={() => switchVariant('broken')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeVariant === 'broken'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-pressed={activeVariant === 'broken'}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
              Broken
            </button>
          </div>
        </div>

        {/* Interactive component area */}
        <div
          ref={containerRef}
          onFocusCapture={handleFocusCapture}
          className="px-5 py-8 bg-slate-50 border-b border-slate-100 min-h-[120px] flex items-start"
        >
          {activeDemo === 'modal' ? (
            <ModalDemo variant={activeVariant} capture={capture} />
          ) : (
            <ComboboxDemo variant={activeVariant} capture={capture} />
          )}
        </div>

        {/* Clear timeline button */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {events.length} event{events.length !== 1 ? 's' : ''} captured
          </span>
          <button
            onClick={clear}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            Clear Timeline
          </button>
        </div>

        {/* Timeline visualization */}
        <div className="p-5">
          <TimelineVisualizer events={events} />
        </div>
      </div>
    </div>
  );
}
