/**
 * Accessible Multi-Select Component
 * 
 * Implements WAI-ARIA Listbox pattern with multi-selection:
 * - role="listbox" with aria-multiselectable="true"
 * - role="option" for each item with aria-selected state
 * - Keyboard navigation: Arrow keys, Space to toggle, Ctrl+A to select all
 * - Summary-only live region (no element name repetition)
 * - aria-activedescendant for focus management (no roving tabindex mixing)
 *
 * Verbosity fixes applied based on Speakable Verbosity Analyzer:
 * 1. Live region uses summary-only text ("2 of 6 selected") without repeating
 *    the option name, since VoiceOver already reads it from aria-selected.
 * 2. aria-activedescendant is NOT re-set when toggling the already-active option.
 * 3. On open, aria-activedescendant is set AFTER focus moves (in a microtask)
 *    to avoid focus + activedescendant collision.
 * 4. Live region debounced at 200ms to separate from state change announcements.
 */

export interface MultiSelectOption {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selected?: string[];
  placeholder?: string;
}

export function createMultiSelect(props: MultiSelectProps): HTMLElement {
  const { label, options, selected = [], placeholder = 'Select options...' } = props;

  const container = document.createElement('div');
  container.className = 'multi-select-container';

  // Label
  const labelEl = document.createElement('label');
  labelEl.id = `multi-select-label-${label.replace(/\s+/g, '-').toLowerCase()}`;
  labelEl.className = 'multi-select-label';
  labelEl.textContent = label;

  // Combobox trigger button
  const trigger = document.createElement('button');
  trigger.className = 'multi-select-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-labelledby', labelEl.id);
  trigger.type = 'button';

  const triggerText = document.createElement('span');
  triggerText.className = 'multi-select-trigger-text';
  triggerText.textContent = selected.length > 0
    ? `${selected.length} selected`
    : placeholder;

  const triggerIcon = document.createElement('span');
  triggerIcon.className = 'multi-select-trigger-icon';
  triggerIcon.setAttribute('aria-hidden', 'true');
  triggerIcon.textContent = '\u25BC';

  trigger.appendChild(triggerText);
  trigger.appendChild(triggerIcon);

  // Dropdown listbox
  // Focus stays here; we use aria-activedescendant exclusively (no roving tabindex)
  const listbox = document.createElement('ul');
  listbox.setAttribute('role', 'listbox');
  listbox.setAttribute('aria-multiselectable', 'true');
  listbox.setAttribute('aria-labelledby', labelEl.id);
  listbox.className = 'multi-select-listbox';
  listbox.id = `multi-select-listbox-${label.replace(/\s+/g, '-').toLowerCase()}`;
  listbox.tabIndex = -1;
  listbox.hidden = true;

  // Live region for summary announcements only.
  // IMPORTANT: Do NOT include the option name here. The screen reader already
  // announces the option name + state from the aria-selected change.
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';

  // Track state
  const state = {
    selectedIds: new Set(selected),
    activeIndex: 0,
    isOpen: false,
  };

  // Create options
  options.forEach((option, index) => {
    const optionEl = document.createElement('li');
    optionEl.setAttribute('role', 'option');
    optionEl.setAttribute('aria-selected', state.selectedIds.has(option.id) ? 'true' : 'false');
    optionEl.id = `option-${option.id}`;
    optionEl.className = 'multi-select-option';
    optionEl.dataset.index = String(index);
    optionEl.dataset.optionId = option.id;

    if (option.disabled) {
      optionEl.setAttribute('aria-disabled', 'true');
      optionEl.classList.add('disabled');
    }

    // Checkbox visual indicator (decorative)
    const checkbox = document.createElement('span');
    checkbox.className = 'multi-select-checkbox';
    checkbox.setAttribute('aria-hidden', 'true');
    checkbox.textContent = state.selectedIds.has(option.id) ? '\u2611' : '\u2610';

    const optionLabel = document.createElement('span');
    optionLabel.className = 'multi-select-option-label';
    optionLabel.textContent = option.label;

    optionEl.appendChild(checkbox);
    optionEl.appendChild(optionLabel);
    listbox.appendChild(optionEl);
  });

  // ─── FIX 2: Only update aria-activedescendant when navigating to a DIFFERENT option.
  // Never re-set it to the same value (which causes VoiceOver to re-read the element).
  function setActiveOption(index: number) {
    const allOptions = listbox.querySelectorAll('[role="option"]');
    allOptions.forEach((opt) => opt.classList.remove('active'));

    const target = allOptions[index] as HTMLElement;
    if (target) {
      target.classList.add('active');
      target.scrollIntoView({ block: 'nearest' });

      // Only update activedescendant if pointing to a different element
      if (state.activeIndex !== index) {
        listbox.setAttribute('aria-activedescendant', target.id);
      }
      state.activeIndex = index;
    }
  }

  // ─── FIX 4: Debounce live region at 200ms to ensure it fires AFTER
  // the aria-selected state change announcement completes.
  let liveRegionTimer: ReturnType<typeof setTimeout> | null = null;

  function announceLiveRegion(message: string) {
    if (liveRegionTimer) {
      clearTimeout(liveRegionTimer);
    }
    // Clear first to force VoiceOver to treat the next update as new content
    liveRegion.textContent = '';
    liveRegionTimer = setTimeout(() => {
      liveRegion.textContent = message;
      liveRegionTimer = null;
    }, 200);
  }

  // ─── FIX 1: Live region uses summary-only text without the option name.
  // The screen reader already announces "[OptionName], selected/not selected"
  // from the aria-selected state change. Repeating the name here causes double-read.
  function toggleSelection(optionId: string) {
    const option = options.find((o) => o.id === optionId);
    if (!option || option.disabled) return;

    const optionEl = listbox.querySelector(`#option-${optionId}`) as HTMLElement;
    if (!optionEl) return;

    const checkbox = optionEl.querySelector('.multi-select-checkbox') as HTMLElement;

    if (state.selectedIds.has(optionId)) {
      state.selectedIds.delete(optionId);
      optionEl.setAttribute('aria-selected', 'false');
      checkbox.textContent = '\u2610';
    } else {
      state.selectedIds.add(optionId);
      optionEl.setAttribute('aria-selected', 'true');
      checkbox.textContent = '\u2611';
    }

    // Summary-only: just the count, no option name
    announceLiveRegion(`${state.selectedIds.size} of ${options.length} selected.`);

    // Update trigger text
    triggerText.textContent = state.selectedIds.size > 0
      ? `${state.selectedIds.size} selected`
      : placeholder;
  }

  // ─── FIX 3: On open, move focus first, then set activedescendant in a microtask.
  // This prevents VoiceOver from announcing both the focus move AND the
  // activedescendant target in the same frame.
  function openDropdown() {
    state.isOpen = true;
    listbox.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    listbox.focus();

    // Set activedescendant after focus has settled (next microtask)
    Promise.resolve().then(() => {
      const allOptions = listbox.querySelectorAll('[role="option"]');
      const target = allOptions[state.activeIndex] as HTMLElement;
      if (target) {
        target.classList.add('active');
        listbox.setAttribute('aria-activedescendant', target.id);
      }
    });

    announceLiveRegion(`${options.length} options available.`);
  }

  function closeDropdown() {
    state.isOpen = false;
    listbox.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    listbox.removeAttribute('aria-activedescendant');
    trigger.focus();
  }

  // Event: trigger click
  trigger.addEventListener('click', () => {
    if (state.isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Event: trigger keyboard
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!state.isOpen) openDropdown();
    }
    if (e.key === 'Escape' && state.isOpen) {
      e.preventDefault();
      closeDropdown();
    }
  });

  // Event: listbox keyboard navigation
  listbox.addEventListener('keydown', (e) => {
    const enabledIndices: number[] = [];
    listbox.querySelectorAll('[role="option"]').forEach((opt, i) => {
      if (opt.getAttribute('aria-disabled') !== 'true') {
        enabledIndices.push(i);
      }
    });

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const currentPos = enabledIndices.indexOf(state.activeIndex);
        const nextPos = Math.min(currentPos + 1, enabledIndices.length - 1);
        setActiveOption(enabledIndices[nextPos]);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const currentPos2 = enabledIndices.indexOf(state.activeIndex);
        const prevPos = Math.max(currentPos2 - 1, 0);
        setActiveOption(enabledIndices[prevPos]);
        break;
      }
      case ' ': {
        e.preventDefault();
        const activeEl = listbox.querySelector('.active') as HTMLElement;
        if (activeEl?.dataset.optionId) {
          // Only toggle selection. Do NOT call setActiveOption here.
          // The option is already active; re-setting activedescendant
          // would cause VoiceOver to re-read the element.
          toggleSelection(activeEl.dataset.optionId);
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        setActiveOption(enabledIndices[0]);
        break;
      }
      case 'End': {
        e.preventDefault();
        setActiveOption(enabledIndices[enabledIndices.length - 1]);
        break;
      }
      case 'a':
      case 'A': {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          options.forEach((opt) => {
            if (!opt.disabled && !state.selectedIds.has(opt.id)) {
              toggleSelection(opt.id);
            }
          });
          announceLiveRegion(`All selected. ${state.selectedIds.size} of ${options.length} selected.`);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        closeDropdown();
        break;
      }
      case 'Tab': {
        closeDropdown();
        break;
      }
    }
  });

  // Event: option click
  listbox.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[role="option"]') as HTMLElement;
    if (target?.dataset.optionId) {
      const index = parseInt(target.dataset.index || '0', 10);
      // Only update active index if clicking a different option than current.
      // This avoids the activedescendant + state change collision.
      if (state.activeIndex !== index) {
        setActiveOption(index);
      }
      toggleSelection(target.dataset.optionId);
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (state.isOpen && !container.contains(e.target as Node)) {
      closeDropdown();
    }
  });

  // Assemble
  container.appendChild(labelEl);
  container.appendChild(trigger);
  container.appendChild(listbox);
  container.appendChild(liveRegion);

  return container;
}
