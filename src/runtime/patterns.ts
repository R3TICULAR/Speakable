/**
 * Built-in Interaction Patterns
 *
 * Provides pre-defined interaction sequences for common ARIA widget patterns.
 * Each pattern exercises standard keyboard interaction behavior as defined by
 * the WAI-ARIA Authoring Practices. Patterns use configurable selectors that
 * can be overridden to match component-specific markup.
 *
 * @module runtime/patterns
 */

import type { InteractionSequence, InteractionAction } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Optional map of CSS selectors to override defaults for built-in patterns.
 *
 * - `trigger` — element that opens/activates the widget
 * - `container` — wrapper/container element for the widget
 * - `content` — the content region within the widget
 * - `items` — individual items within the widget (options, tabs, etc.)
 * - `input` — text input element within the widget
 */
export interface PatternSelectorMap {
  trigger?: string;
  container?: string;
  content?: string;
  items?: string;
  input?: string;
}

/**
 * Names of built-in interaction patterns.
 */
export type BuiltinPatternName = 'modal-dialog' | 'combobox' | 'tabs' | 'accordion';

// ---------------------------------------------------------------------------
// Default Selectors
// ---------------------------------------------------------------------------

const MODAL_DIALOG_DEFAULTS: Required<Pick<PatternSelectorMap, 'trigger' | 'container'>> = {
  trigger: 'button',
  container: '[role="dialog"], dialog',
};

const COMBOBOX_DEFAULTS: Required<Pick<PatternSelectorMap, 'input' | 'items'>> = {
  input: '[role="combobox"], input[type="text"]',
  items: '[role="option"]',
};

const TABS_DEFAULTS: Required<Pick<PatternSelectorMap, 'container' | 'items'>> = {
  container: '[role="tablist"]',
  items: '[role="tab"]',
};

const ACCORDION_DEFAULTS: Required<Pick<PatternSelectorMap, 'trigger'>> = {
  trigger: 'button[aria-expanded]',
};

// ---------------------------------------------------------------------------
// Pattern Builders
// ---------------------------------------------------------------------------

/**
 * Modal dialog pattern:
 * 1. Click trigger to open dialog
 * 2. Tab through dialog content (verify focus is in dialog)
 * 3. Tab through more content
 * 4. Press Escape to close
 * 5. Verify focus returns to trigger (implicit via focus observer)
 */
function buildModalDialogPattern(selectors?: PatternSelectorMap): InteractionSequence {
  const trigger = selectors?.trigger ?? MODAL_DIALOG_DEFAULTS.trigger;

  const actions: InteractionAction[] = [
    { type: 'click', selector: trigger },
    { type: 'tab' },
    { type: 'tab' },
    { type: 'tab' },
    { type: 'escape' },
  ];

  return {
    description:
      'Modal dialog: click trigger to open, tab through dialog content, press Escape to close, verify focus returns to trigger',
    actions,
  };
}

/**
 * Combobox pattern:
 * 1. Click/focus the combobox input
 * 2. Type to filter (simulated via key events)
 * 3. Arrow down through options
 * 4. Arrow down again
 * 5. Enter to select
 */
function buildComboboxPattern(selectors?: PatternSelectorMap): InteractionSequence {
  const input = selectors?.input ?? COMBOBOX_DEFAULTS.input;

  const actions: InteractionAction[] = [
    { type: 'click', selector: input },
    { type: 'key', combo: 'a' },
    { type: 'arrowDown' },
    { type: 'arrowDown' },
    { type: 'enter' },
  ];

  return {
    description:
      'Combobox: focus input, type to filter, navigate options with arrow keys, select with Enter',
    actions,
  };
}

/**
 * Tabs pattern:
 * 1. Click/focus the tablist container
 * 2. Arrow right to next tab
 * 3. Arrow right to next tab
 * 4. Enter to activate
 * 5. Arrow left to previous tab
 * 6. Space to activate
 */
function buildTabsPattern(selectors?: PatternSelectorMap): InteractionSequence {
  const container = selectors?.container ?? TABS_DEFAULTS.container;

  const actions: InteractionAction[] = [
    { type: 'click', selector: container },
    { type: 'arrowRight' },
    { type: 'arrowRight' },
    { type: 'enter' },
    { type: 'arrowLeft' },
    { type: 'space' },
  ];

  return {
    description:
      'Tabs: focus tablist, navigate between tabs with arrow keys, activate with Enter/Space',
    actions,
  };
}

/**
 * Accordion pattern:
 * 1. Click/focus the first accordion header
 * 2. Enter to toggle expanded/collapsed
 * 3. Arrow down to next header
 * 4. Space to toggle
 * 5. Arrow down to next header
 * 6. Enter to toggle
 */
function buildAccordionPattern(selectors?: PatternSelectorMap): InteractionSequence {
  const trigger = selectors?.trigger ?? ACCORDION_DEFAULTS.trigger;

  const actions: InteractionAction[] = [
    { type: 'click', selector: trigger },
    { type: 'enter' },
    { type: 'arrowDown' },
    { type: 'space' },
    { type: 'arrowDown' },
    { type: 'enter' },
  ];

  return {
    description:
      'Accordion: focus header, toggle with Enter/Space, navigate between headers with arrow keys',
    actions,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get a built-in interaction pattern by name.
 *
 * Each pattern returns an InteractionSequence with a descriptive name and the
 * appropriate actions for testing common ARIA widget patterns. Optional selectors
 * can override the defaults used to locate trigger, container, and content elements.
 *
 * Default selectors:
 * - modal-dialog: trigger = 'button', container = '[role="dialog"], dialog'
 * - combobox: input = '[role="combobox"], input[type="text"]', items = '[role="option"]'
 * - tabs: container = '[role="tablist"]', items = '[role="tab"]'
 * - accordion: trigger = 'button[aria-expanded]'
 *
 * @param name - The built-in pattern name
 * @param selectors - Optional CSS selectors to override defaults
 * @returns An InteractionSequence representing the pattern
 */
export function getBuiltinPattern(
  name: BuiltinPatternName,
  selectors?: PatternSelectorMap
): InteractionSequence {
  switch (name) {
    case 'modal-dialog':
      return buildModalDialogPattern(selectors);
    case 'combobox':
      return buildComboboxPattern(selectors);
    case 'tabs':
      return buildTabsPattern(selectors);
    case 'accordion':
      return buildAccordionPattern(selectors);
  }
}
