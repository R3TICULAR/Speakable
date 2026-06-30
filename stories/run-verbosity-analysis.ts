/**
 * Run verbosity analysis against the multi-select component.
 * 
 * Simulates user interactions (open dropdown, navigate, select options)
 * and captures the accessibility events that would fire, then runs
 * the verbosity analyzer to detect duplicate announcement patterns.
 *
 * Run: npx tsx stories/run-verbosity-analysis.ts
 */

import { analyzeVerbosity, formatVerbosityReport } from '../src/runtime/verbosity-analyzer.js';
import type { AccessibilityEvent } from '../src/runtime/types.js';

// Simulate the full interaction sequence for the multi-select component
// as it currently exists in stories/MultiSelect.ts

const events: AccessibilityEvent[] = [

  // === Interaction 1: User clicks the trigger button to open dropdown ===
  {
    type: 'FOCUS_CHANGED',
    timestamp: 0,
    target: { role: 'button', accessibleName: 'Programming Languages', selector: 'button.multi-select-trigger' },
    payload: { kind: 'focus_changed', previousTarget: null },
  },
  {
    type: 'STATE_CHANGED',
    timestamp: 5,
    target: { role: 'button', accessibleName: 'Programming Languages', selector: 'button.multi-select-trigger' },
    payload: { kind: 'state_changed', attribute: 'aria-expanded', previousValue: 'false', newValue: 'true' },
  },
  // Focus moves to the listbox
  {
    type: 'FOCUS_CHANGED',
    timestamp: 10,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'focus_changed', previousTarget: { role: 'button', accessibleName: 'Programming Languages', selector: 'button.multi-select-trigger' } },
  },
  // aria-activedescendant set to first option
  {
    type: 'STATE_CHANGED',
    timestamp: 12,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: null, newValue: 'option-js' },
  },
  // Live region fires on open
  {
    type: 'ANNOUNCEMENT',
    timestamp: 60,
    target: { role: 'status', accessibleName: '', selector: 'div[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: '6 options available. Use arrow keys to navigate, Space to select.' },
  },

  // === Interaction 2: User presses ArrowDown to navigate to TypeScript ===
  {
    type: 'STATE_CHANGED',
    timestamp: 500,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-js', newValue: 'option-ts' },
  },

  // === Interaction 3: User presses Space to select TypeScript ===
  // This is where the triple-announcement bug lives:

  // 3a. aria-activedescendant re-set to same element (setActiveOption called)
  {
    type: 'STATE_CHANGED',
    timestamp: 1000,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-ts', newValue: 'option-ts' },
  },
  // 3b. aria-selected toggles on the option
  {
    type: 'STATE_CHANGED',
    timestamp: 1002,
    target: { role: 'option', accessibleName: 'TypeScript', selector: '#option-ts' },
    payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
  },
  // 3c. Live region announces the selection (includes the option name)
  {
    type: 'ANNOUNCEMENT',
    timestamp: 1005,
    target: { role: 'status', accessibleName: '', selector: 'div[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: 'TypeScript selected. 1 of 6 selected.' },
  },

  // === Interaction 4: User presses ArrowDown then Space to select Python ===
  {
    type: 'STATE_CHANGED',
    timestamp: 1500,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-ts', newValue: 'option-py' },
  },
  // Space pressed on Python
  {
    type: 'STATE_CHANGED',
    timestamp: 2000,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-py', newValue: 'option-py' },
  },
  {
    type: 'STATE_CHANGED',
    timestamp: 2002,
    target: { role: 'option', accessibleName: 'Python', selector: '#option-py' },
    payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
  },
  {
    type: 'ANNOUNCEMENT',
    timestamp: 2005,
    target: { role: 'status', accessibleName: '', selector: 'div[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: 'Python selected. 2 of 6 selected.' },
  },

  // === Interaction 5: User clicks an option (JavaScript) with mouse ===
  // Click handler calls setActiveOption(index) then toggleSelection()
  {
    type: 'STATE_CHANGED',
    timestamp: 3000,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-py', newValue: 'option-js' },
  },
  {
    type: 'STATE_CHANGED',
    timestamp: 3002,
    target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
    payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
  },
  {
    type: 'ANNOUNCEMENT',
    timestamp: 3005,
    target: { role: 'status', accessibleName: '', selector: 'div[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: 'JavaScript selected. 3 of 6 selected.' },
  },
];

console.log('='.repeat(70));
console.log(' SPEAKABLE VERBOSITY ANALYSIS: Multi-Select Component');
console.log('='.repeat(70));
console.log('');
console.log('Simulating: open dropdown, navigate, select 3 options');
console.log(`Total events captured: ${events.length}`);
console.log('');

const report = analyzeVerbosity(events);
console.log(formatVerbosityReport(report));

// ─── Now simulate the FIXED version ───

const fixedEvents: AccessibilityEvent[] = [

  // === Interaction 1: User clicks trigger to open dropdown ===
  // FIX 3: Focus moves to listbox, activedescendant set in next microtask (separate frame)
  {
    type: 'FOCUS_CHANGED',
    timestamp: 0,
    target: { role: 'button', accessibleName: 'Programming Languages', selector: 'button.multi-select-trigger' },
    payload: { kind: 'focus_changed', previousTarget: null },
  },
  {
    type: 'STATE_CHANGED',
    timestamp: 5,
    target: { role: 'button', accessibleName: 'Programming Languages', selector: 'button.multi-select-trigger' },
    payload: { kind: 'state_changed', attribute: 'aria-expanded', previousValue: 'false', newValue: 'true' },
  },
  {
    type: 'FOCUS_CHANGED',
    timestamp: 10,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'focus_changed', previousTarget: { role: 'button', accessibleName: 'Programming Languages', selector: 'button.multi-select-trigger' } },
  },
  // Activedescendant set AFTER focus settles (200ms later via microtask + debounce)
  {
    type: 'STATE_CHANGED',
    timestamp: 210,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: null, newValue: 'option-js' },
  },
  // Live region fires with summary only (debounced 200ms after open)
  {
    type: 'ANNOUNCEMENT',
    timestamp: 220,
    target: { role: 'status', accessibleName: '', selector: 'div[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: '6 options available.' },
  },

  // === Interaction 2: ArrowDown to TypeScript ===
  {
    type: 'STATE_CHANGED',
    timestamp: 500,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-js', newValue: 'option-ts' },
  },

  // === Interaction 3: Space to select TypeScript ===
  // FIX 2: No activedescendant change (already pointing to option-ts)
  // FIX 1: Live region only announces count, not option name
  {
    type: 'STATE_CHANGED',
    timestamp: 1000,
    target: { role: 'option', accessibleName: 'TypeScript', selector: '#option-ts' },
    payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
  },
  // FIX 4: Live region fires 200ms later with summary-only text
  {
    type: 'ANNOUNCEMENT',
    timestamp: 1200,
    target: { role: 'status', accessibleName: '', selector: 'div[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: '1 of 6 selected.' },
  },

  // === Interaction 4: ArrowDown + Space to select Python ===
  {
    type: 'STATE_CHANGED',
    timestamp: 1500,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-ts', newValue: 'option-py' },
  },
  {
    type: 'STATE_CHANGED',
    timestamp: 2000,
    target: { role: 'option', accessibleName: 'Python', selector: '#option-py' },
    payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
  },
  {
    type: 'ANNOUNCEMENT',
    timestamp: 2200,
    target: { role: 'status', accessibleName: '', selector: 'div[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: '2 of 6 selected.' },
  },

  // === Interaction 5: Click JavaScript (different from active) ===
  {
    type: 'STATE_CHANGED',
    timestamp: 3000,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-py', newValue: 'option-js' },
  },
  {
    type: 'STATE_CHANGED',
    timestamp: 3002,
    target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
    payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
  },
  {
    type: 'ANNOUNCEMENT',
    timestamp: 3200,
    target: { role: 'status', accessibleName: '', selector: 'div[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: '3 of 6 selected.' },
  },
];

console.log('');
console.log('='.repeat(70));
console.log(' AFTER APPLYING VERBOSITY FIXES');
console.log('='.repeat(70));
console.log('');
console.log('Changes made:');
console.log('  1. Live region: "3 of 6 selected." (no option name)');
console.log('  2. No activedescendant re-set on same element');
console.log('  3. Activedescendant set 200ms after focus on open');
console.log('  4. Live region debounced to 200ms after state change');
console.log(`Total events captured: ${fixedEvents.length}`);
console.log('');

const fixedReport = analyzeVerbosity(fixedEvents);
console.log(formatVerbosityReport(fixedReport));
