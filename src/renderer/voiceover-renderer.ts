/**
 * VoiceOver screen reader announcement renderer.
 * 
 * Generates heuristic announcement text approximating VoiceOver output.
 * This is NOT a perfect emulation - real VoiceOver behavior varies by version,
 * settings, and context. Use for development guidance only.
 */

import type { AccessibleNode, AccessibleRole, AnnouncementModel } from '../model/types.js';
import { createColors, type ColorFunctions } from '../cli/colors.js';

/**
 * Renders an announcement model as VoiceOver-style announcement text.
 * 
 * @param model - Announcement model to render
 * @param colorize - Whether to apply ANSI color codes to the output
 * @returns VoiceOver-style announcement text
 */
export function renderVoiceOver(model: AnnouncementModel, colorize?: boolean): string {
  const c = createColors(colorize ?? false);
  const announcements: string[] = [];
  renderNodeVoiceOver(model.root, announcements, c);
  return announcements.join('\n');
}

/**
 * Recursively renders a node and its children as VoiceOver announcements.
 * 
 * @param node - Node to render
 * @param announcements - Array to collect announcement strings
 * @param c - Color functions for formatting
 */
function renderNodeVoiceOver(node: AccessibleNode, announcements: string[], c: ColorFunctions): void {
  const announcement = formatNodeVoiceOver(node, c);
  if (announcement) {
    announcements.push(announcement);
  }
  
  // Recursively render children, collapsing redundant same-name children
  for (const child of node.children) {
    if (child.name && child.name === node.name && node.children.length === 1) {
      for (const grandchild of child.children) {
        renderNodeVoiceOver(grandchild, announcements, c);
      }
      continue;
    }
    renderNodeVoiceOver(child, announcements, c);
  }
}

/**
 * Formats a single node as a VoiceOver announcement.
 * 
 * @param node - Node to format
 * @param c - Color functions for formatting
 * @returns Formatted announcement string or empty string if node should not be announced
 */
/**
 * Widgets whose VALUE VoiceOver announces FIRST, e.g. "7 Volume slider".
 * Sliders and spinbuttons lead with the value.
 */
function isValueFirstWidget(role: AccessibleNode['role']): boolean {
  // slider/spinbutton lead with the numeric value; a combobox (native <select>,
  // "pop up button") leads with its selected value: "United States Country ...".
  return role === 'slider' || role === 'spinbutton' || role === 'combobox';
}

/**
 * Widgets whose VALUE VoiceOver announces AFTER the name but BEFORE the role,
 * e.g. "Upload 60% progress indicator". The normal path puts value after role.
 */
function isValueBeforeRoleWidget(role: AccessibleNode['role']): boolean {
  return role === 'progressbar' || role === 'meter';
}

/**
 * Pure structural containers for which VoiceOver's continuous reading cursor
 * emits NO standalone entry announcement — it reads the content and marks only
 * an "end of <container>" boundary on exit. Confirmed against ground truth:
 * a `<ol>`/`<dl>`, a role="status", and a role="log" produce no "list"/"status"
 * entry line in a single VoiceOver pass. We therefore suppress the role-only
 * container line for these in VoiceOver (NVDA/JAWS DO announce them, so this is
 * strictly a VoiceOver-renderer behavior).
 *
 * Scoped deliberately narrow: landmarks (region/navigation/main/etc.) are NOT
 * included — they are navigationally meaningful and announced differently.
 */
function isSilentContainerVoiceOver(node: AccessibleNode): boolean {
  if (node.role !== 'list' && node.role !== 'status' && node.role !== 'log') return false;
  // Only suppress when the container itself carries no accessible name; a named
  // container still announces its name.
  if (node.name) return false;
  // Only suppress a true container (it has children to carry the content).
  return node.children.length > 0;
}

function formatNodeVoiceOver(node: AccessibleNode, c: ColorFunctions): string {
  // Silent structural containers: emit no standalone line (see helper).
  if (isSilentContainerVoiceOver(node)) {
    return '';
  }

  const parts: string[] = [];
  
  // Value-first widgets: VoiceOver leads with the value ("7 Volume slider"),
  // then name, then role — unlike form controls where the value trails.
  const valueFirst = isValueFirstWidget(node.role) && node.value !== undefined;
  if (valueFirst) {
    const valueText = node.value!.text || String(node.value!.current);
    if (valueText) parts.push(valueText);
    if (node.name) parts.push(c.elementName(node.name));
    const roleText = formatRoleVoiceOver(node);
    if (roleText) parts.push(c.roleName(roleText));
    const stateText = formatStatesVoiceOver(node);
    if (stateText) parts.push(c.stateName(stateText));
    if (node.description) parts.push(c.description(node.description));
    return parts.join(', ');
  }

  // Value-before-role widgets: "Upload 60% progress indicator" → name, value, role.
  if (isValueBeforeRoleWidget(node.role) && node.value !== undefined) {
    if (node.name) parts.push(c.elementName(node.name));
    const valueText = node.value.text || String(node.value.current);
    if (valueText) parts.push(valueText);
    const roleText = formatRoleVoiceOver(node);
    if (roleText) parts.push(c.roleName(roleText));
    const stateText = formatStatesVoiceOver(node);
    if (stateText) parts.push(c.stateName(stateText));
    if (node.description) parts.push(c.description(node.description));
    return parts.join(', ');
  }

  // VoiceOver often announces role before name for some elements
  const roleFirst = shouldAnnounceRoleFirst(node.role);
  
  if (roleFirst) {
    // Add role first
    const roleText = formatRoleVoiceOver(node);
    if (roleText) {
      parts.push(c.roleName(roleText));
    }
    
    // Then name
    if (node.name) {
      parts.push(c.elementName(node.name));
    }
  } else {
    // Add name first
    if (node.name) {
      parts.push(c.elementName(node.name));
    }
    
    // Then role
    const roleText = formatRoleVoiceOver(node);
    if (roleText) {
      parts.push(c.roleName(roleText));
    }
  }
  
  // Add states
  const stateText = formatStatesVoiceOver(node);
  if (stateText) {
    parts.push(c.stateName(stateText));
  }
  
  // Add value (for form controls)
  if (node.value) {
    const valueText = node.value.text || String(node.value.current);
    if (valueText) {
      parts.push(valueText);
    }
  }
  
  // Add set position ("N of M"). VoiceOver announces an item's position within a
  // set (radios, options, tabs, list items), e.g. "Standard, selected, radio
  // button, 1 of 2". Only when both position and size are known.
  if (node.state.posinset !== undefined && node.state.setsize !== undefined) {
    parts.push(`${node.state.posinset} of ${node.state.setsize}`);
  }
  
  // Add description (if present)
  if (node.description) {
    parts.push(c.description(node.description));
  }
  
  return parts.join(', ');
}

/**
 * Determines if role should be announced before name.
 * 
 * VoiceOver announces role first for headings and some landmarks.
 * 
 * @param role - Role to check
 * @returns true if role should be announced first
 */
function shouldAnnounceRoleFirst(role: AccessibleRole): boolean {
  return role === 'heading' || 
         role === 'navigation' ||
         role === 'main' ||
         role === 'banner' ||
         role === 'contentinfo' ||
         role === 'complementary' ||
         role === 'region' ||
         role === 'form' ||
         role === 'search' ||
         role === 'blockquote' ||
         role === 'figure' ||
         role === 'dialog' ||
         role === 'group' ||
         role === 'document';
}

/**
 * Formats the role portion of a VoiceOver announcement.
 * 
 * @param node - Node to format
 * @returns Role text or empty string
 */
function formatRoleVoiceOver(node: AccessibleNode): string {
  const role = node.role;
  
  switch (role) {
    case 'button':
      return 'button';
    
    case 'link':
      return 'link';
    
    case 'heading':
      if (node.state.level) {
        return `heading level ${node.state.level}`;
      }
      return 'heading';
    
    case 'textbox':
      return 'edit text';
    
    case 'checkbox':
      return 'checkbox';
    
    case 'radio':
      return 'radio button';
    
    case 'combobox':
      return 'combo box';
    
    case 'listbox':
      return 'list box';
    
    case 'option':
      return 'option';
    
    case 'list':
      return 'list';
    
    case 'listitem':
      // VoiceOver does NOT speak "item" for a list item; it announces the item's
      // text with its set position (confirmed by GT "1. First 1 of 3"). The
      // position is rendered as the "N of M" suffix elsewhere.
      return '';
    
    case 'navigation':
      return 'navigation';
    
    case 'main':
      return 'main';
    
    case 'banner':
      return 'banner';
    
    case 'contentinfo':
      return 'content information';
    
    case 'region':
      return 'region';
    
    case 'complementary':
      return 'complementary';
    
    case 'form':
      return 'form';
    
    case 'search':
      return 'search';
    
    case 'img':
      return 'image';
    
    case 'article':
      return 'article';
    
    case 'generic':
      // Generic containers are typically not announced
      return '';
    
    case 'staticText':
    case 'paragraph':
    case 'cell':
    case 'term':
    case 'definition':
    case 'caption':
      return '';
    
    case 'blockquote':
      return 'blockquote';
    
    case 'code':
      return 'code';
    
    case 'table': {
      const rows = node.children.filter(c => c.role === 'row');
      const rowCount = rows.length;
      const colCount = rows.length > 0 ? rows[0].children.length : 0;
      return `table, ${rowCount} rows, ${colCount} columns`;
    }
    
    case 'row':
      return 'row';
    
    case 'columnheader':
      return 'column header';
    
    case 'rowheader':
      return 'row header';
    
    case 'figure':
      return 'figure';
    
    case 'dialog':
      return 'web dialog';
    
    case 'meter':
      return 'level indicator';
    
    case 'progressbar':
      return 'progress indicator';
    
    case 'status':
      return 'status';
    
    case 'switch':
      return 'switch';
    
    case 'slider':
      return 'slider';
    
    case 'spinbutton':
      // VoiceOver announces a number input / spinbutton as "stepper".
      return 'stepper';
    
    case 'tab':
      return 'tab';
    
    case 'tablist':
      // VoiceOver announces the container as "tab group".
      return node.name ? 'tab group' : 'tab group';
    
    case 'tabpanel':
      return 'tab panel';
    
    case 'group':
      return node.name ? 'group' : '';
    
    case 'document':
      return 'frame';
    
    case 'application':
      return 'embedded object';
    
    case 'separator':
      return 'separator';
    
    default:
      return role;
  }
}

/**
 * Formats the state portion of a VoiceOver announcement.
 * 
 * @param node - Node to format
 * @returns State text or empty string
 */
function formatStatesVoiceOver(node: AccessibleNode): string {
  const states: string[] = [];
  
  // Expanded/collapsed state
  if (node.state.expanded !== undefined) {
    states.push(node.state.expanded ? 'expanded' : 'collapsed');
  }
  
  // Checked state. VoiceOver speaks it differently by role:
  //   switch   → "on"/"off"
  //   radio    → "selected" (only when on; VoiceOver stays silent when off),
  //              confirmed by GT "Standard selected radio button, 1 of 2"
  //   checkbox → "checked"/"unchecked"
  if (node.state.checked !== undefined) {
    if (node.state.checked === 'mixed') {
      states.push('mixed');
    } else if (node.role === 'switch') {
      states.push(node.state.checked ? 'on' : 'off');
    } else if (node.role === 'radio') {
      if (node.state.checked) states.push('selected');
    } else {
      states.push(node.state.checked ? 'checked' : 'unchecked');
    }
  }
  
  // Pressed state (toggle button). VoiceOver announces a pressed toggle button
  // as "selected"/"unselected" (not "pressed"), confirmed against real VoiceOver
  // ground truth ("Bold selected toggle button"). NVDA/JAWS say "pressed".
  if (node.state.pressed !== undefined) {
    if (node.state.pressed === 'mixed') {
      states.push('mixed');
    } else {
      states.push(node.state.pressed ? 'selected' : 'unselected');
    }
  }
  
  // Selected state. VoiceOver omits spoken selection wording for TABS (the
  // position "N of M" and which tab is current convey it); it speaks "selected"
  // for options and other selectable widgets. Confirmed by GT "Details tab, 2 of 2".
  if (node.state.selected !== undefined && node.role !== 'tab') {
    states.push(node.state.selected ? 'selected' : 'unselected');
  }
  
  // Disabled state
  if (node.state.disabled) {
    states.push('dimmed');
  }
  
  // Invalid state
  if (node.state.invalid) {
    states.push('invalid data');
  }
  
  // Required state
  if (node.state.required) {
    states.push('required');
  }
  
  // Read-only state
  if (node.state.readonly) {
    states.push('read only');
  }
  
  // Busy state
  if (node.state.busy) {
    states.push('busy');
  }
  
  // Current state
  if (node.state.current) {
    if (node.state.current === 'page') {
      states.push('current page');
    } else if (node.state.current === 'step') {
      states.push('current step');
    } else if (node.state.current === 'location') {
      states.push('current location');
    } else if (node.state.current === 'date') {
      states.push('current date');
    } else if (node.state.current === 'time') {
      states.push('current time');
    } else if (node.state.current === 'true') {
      states.push('current');
    }
  }
  
  // Grabbed state (drag and drop)
  if (node.state.grabbed !== undefined) {
    states.push(node.state.grabbed ? 'grabbed' : 'not grabbed');
  }
  
  return states.join(', ');
}
