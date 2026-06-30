/**
 * Verbosity Analyzer Demo
 *
 * Simulates the exact event sequence that causes VoiceOver to triple-read
 * when selecting an option in a multi-select, then runs the verbosity
 * analyzer to detect and provide remediation guidance.
 *
 * Run: npx tsx stories/verbosity-demo.ts
 */

import { analyzeVerbosity, formatVerbosityReport } from '../src/runtime/verbosity-analyzer.js';
import type { AccessibilityEvent } from '../src/runtime/types.js';

// Simulate what happens in the DOM when a user clicks "JavaScript" option
// in a multi-select listbox. All three things happen within ~20ms:
const multiSelectClickEvents: AccessibilityEvent[] = [
  // 1. aria-activedescendant changes on the listbox (pointing to the clicked option)
  {
    type: 'STATE_CHANGED',
    timestamp: 100,
    target: { role: 'listbox', accessibleName: 'Programming Languages', selector: 'ul[role="listbox"]' },
    payload: { kind: 'state_changed', attribute: 'aria-activedescendant', previousValue: 'option-py', newValue: 'option-js' },
  },
  // 2. aria-selected changes on the option element
  {
    type: 'STATE_CHANGED',
    timestamp: 105,
    target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
    payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
  },
  // 3. Live region announces the selection
  {
    type: 'ANNOUNCEMENT',
    timestamp: 115,
    target: { role: 'status', accessibleName: '', selector: '.sr-only[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: 'JavaScript selected. 1 of 6 selected.' },
  },
];

console.log('='.repeat(70));
console.log(' SPEAKABLE VERBOSITY ANALYZER DEMO');
console.log(' Detecting duplicate announcement patterns');
console.log('='.repeat(70));
console.log('');
console.log('Scenario: User clicks "JavaScript" option in a multi-select listbox');
console.log('');
console.log('Events fired within 15ms:');
console.log('  1. aria-activedescendant -> "option-js"  (VoiceOver reads option)');
console.log('  2. aria-selected="true" on #option-js    (VoiceOver reads state)');
console.log('  3. Live region: "JavaScript selected..."  (VoiceOver reads status)');
console.log('');
console.log('Result: VoiceOver announces "JavaScript" 2-3 times.');
console.log('');

const report = analyzeVerbosity(multiSelectClickEvents);
console.log(formatVerbosityReport(report));

console.log('');
console.log('='.repeat(70));
console.log(' CLEAN VERSION (after remediation)');
console.log('='.repeat(70));
console.log('');

// The fixed version: only state change + debounced summary-only live region
const cleanEvents: AccessibilityEvent[] = [
  // aria-selected changes (the screen reader announces this on the active option)
  {
    type: 'STATE_CHANGED',
    timestamp: 100,
    target: { role: 'option', accessibleName: 'JavaScript', selector: '#option-js' },
    payload: { kind: 'state_changed', attribute: 'aria-selected', previousValue: 'false', newValue: 'true' },
  },
  // Debounced summary live region (200ms later, no option name repeated)
  {
    type: 'ANNOUNCEMENT',
    timestamp: 300, // 200ms later, separate interaction frame
    target: { role: 'status', accessibleName: '', selector: '.sr-only[role="status"]' },
    payload: { kind: 'announcement', politeness: 'polite', text: '1 of 6 selected.' },
  },
];

const cleanReport = analyzeVerbosity(cleanEvents);
console.log(formatVerbosityReport(cleanReport));
