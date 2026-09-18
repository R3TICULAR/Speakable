import type { Meta, StoryObj } from '@storybook/html';
import { createMultiSelect, type MultiSelectProps } from './MultiSelect';

/**
 * Runtime Timeline examples.
 *
 * These stories demonstrate the runtime interaction-testing capability added
 * by the Speakable addon. Open the "Screen Readers" panel and select the
 * **Timeline** tab to watch the predicted announcement stream produced as the
 * configured interaction sequence runs. Use **Set baseline** on the Timeline
 * tab, then re-render (or edit the component) and open the **Diff** tab to see
 * behavioral changes classified by severity.
 *
 * The sequence for each story is declared under `parameters.speakable`:
 *   - `sequence`: a full interaction sequence (highest priority)
 *   - `pattern`:  a named built-in pattern ('modal-dialog' | 'combobox' | 'tabs' | 'accordion')
 *   - `selectors`: optional selector overrides for the built-in pattern
 *   - `timeline: false`: opt out of timeline capture for a story
 */

const meta: Meta = {
  title: 'Runtime/Timeline',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE EXAMPLE — a disclosure button toggled with the keyboard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simple: Disclosure button.
 *
 * A single button that expands/collapses a region via `aria-expanded`. The
 * interaction sequence tabs to the button and presses Enter, so the Timeline
 * shows the focus change followed by the aria-expanded state change.
 *
 * This is the minimal setup: give a story a `sequence` and the addon captures
 * a timeline automatically after render.
 */
export const SimpleDisclosure: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button id="disclosure-btn" aria-expanded="false" aria-controls="disclosure-panel">
        Shipping details
      </button>
      <div id="disclosure-panel" hidden>
        <p>Ships in 2-3 business days.</p>
      </div>
    `;

    const btn = container.querySelector('#disclosure-btn') as HTMLButtonElement;
    const panel = container.querySelector('#disclosure-panel') as HTMLElement;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });

    return container;
  },
  parameters: {
    speakable: {
      sequence: {
        description: 'Tab to the disclosure button and toggle it open',
        actions: [
          { type: 'tab' },
          { type: 'enter' },
        ],
      },
    },
  },
};

/**
 * Simple (static only): the same disclosure, with timeline capture disabled.
 *
 * Demonstrates the `timeline: false` opt-out. The Timeline/Diff tabs will
 * prompt you to add a sequence; the static reader tabs work as usual.
 */
export const SimpleStaticOnly: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button aria-expanded="false">More options</button>
    `;
    return container;
  },
  parameters: {
    speakable: { timeline: false },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLEX EXAMPLE — an ARIA multi-select listbox exercised two ways
// ─────────────────────────────────────────────────────────────────────────────

const COMPLEX_ARGS: MultiSelectProps = {
  label: 'Programming Languages',
  placeholder: 'Choose languages...',
  options: [
    { id: 'js', label: 'JavaScript' },
    { id: 'ts', label: 'TypeScript' },
    { id: 'py', label: 'Python' },
    { id: 'rs', label: 'Rust' },
    { id: 'go', label: 'Go' },
    { id: 'rb', label: 'Ruby' },
  ],
  selected: [],
};

/**
 * Complex (built-in pattern): MultiSelect driven by the `combobox` pattern.
 *
 * Instead of hand-writing actions, this uses the built-in `combobox` pattern
 * and overrides its selectors to match the MultiSelect markup (the trigger is
 * a button with aria-haspopup="listbox"; options are role="option"). The
 * pattern focuses the control, types to filter, arrows through options, and
 * selects with Enter — the Timeline captures focus moves, activedescendant
 * changes, aria-selected updates, and the live-region "N of M selected".
 */
export const ComplexCombobox: Story = {
  render: () => createMultiSelect(COMPLEX_ARGS),
  parameters: {
    speakable: {
      pattern: 'combobox',
      selectors: {
        input: 'button.multi-select-trigger',
        items: '[role="option"]',
      },
    },
  },
};

/**
 * Complex (custom sequence): MultiSelect with an explicit, precise sequence.
 *
 * When a built-in pattern doesn't match your component's exact interaction
 * model, declare the sequence yourself. This opens the listbox, walks down
 * three options, toggles two with Space, then closes with Escape — a realistic
 * multi-select flow. Compare its Timeline against `ComplexCombobox` to see how
 * the interaction model changes the announcement stream.
 *
 * Try this: open the Timeline tab, click "Set baseline", then change an arg
 * (e.g. pre-select an option via Controls) and open the Diff tab.
 */
export const ComplexCustomSequence: Story = {
  render: () => createMultiSelect(COMPLEX_ARGS),
  parameters: {
    speakable: {
      sequence: {
        description: 'Open listbox, navigate and toggle two options, then close',
        actions: [
          { type: 'click', selector: 'button.multi-select-trigger' },
          { type: 'arrowDown' },
          { type: 'space' },
          { type: 'arrowDown' },
          { type: 'arrowDown' },
          { type: 'space' },
          { type: 'escape' },
        ],
      },
    },
  },
};
