/**
 * Windows Narrator screen reader announcement renderer.
 * 
 * Generates heuristic announcement text approximating Windows Narrator output.
 * This is NOT a perfect emulation - real Narrator behavior varies by version,
 * settings, and context. Use for development guidance only.
 */

import type { AccessibleNode, AccessibleRole, AnnouncementModel } from '../model/types.js';
import { createColors, type ColorFunctions } from '../cli/colors.js';

/**
 * Renders an announcement model as Narrator-style announcement text.
 * 
 * @param model - Announcement model to render
 * @param colorize - Whether to apply ANSI color codes to the output
 * @returns Narrator-style announcement text
 */
export function renderNarrator(model: AnnouncementModel, colorize?: boolean): string {
  const c = createColors(colorize ?? false);
  const announcements: string[] = [];
  renderNodeNarrator(model.root, announcements, c);
  return announcements.join('\n');
}

/**
 * Recursively renders a node and its children as Narrator announcements.
 * 
 * @param node - Node to render
 * @param announcements - Array to collect announcement strings
 * @param c - Color functions for formatting
 */
function renderNodeNarrator(node: AccessibleNode, announcements: string[], c: ColorFunctions): void {
  const announcement = formatNodeNarrator(node, c);
  if (announcement) {
    announcements.push(announcement);
  }

  // Recursively render children, collapsing redundant same-name children
  for (const child of node.children) {
    if (child.name && child.name === node.name && node.children.length === 1) {
      // Skip child that repeats parent name — recurse into grandchildren
      for (const grandchild of child.children) {
        renderNodeNarrator(grandchild, announcements, c);
      }
      continue;
    }
    renderNodeNarrator(child, announcements, c);
  }
}

/**
 * Formats a single node as a Narrator announcement.
 * 
 * @param node - Node to format
 * @param c - Color functions for formatting
 * @returns Formatted announcement string or empty string if node should not be announced
 */
function formatNodeNarrator(node: AccessibleNode, c: ColorFunctions): string {
  const parts: string[] = [];

  const roleFirst = shouldAnnounceRoleFirst(node.role);

  if (roleFirst) {
    // Role-first: role, name, state, value, description
    const roleText = formatRoleNarrator(node);
    if (roleText) {
      parts.push(c.roleName(roleText));
    }

    if (node.name) {
      parts.push(c.elementName(node.name));
    }
  } else {
    // Name-first: name, role, state, value, description
    if (node.name) {
      parts.push(c.elementName(node.name));
    }

    const roleText = formatRoleNarrator(node);
    if (roleText) {
      parts.push(c.roleName(roleText));
    }
  }

  // Add states
  const stateText = formatStatesNarrator(node);
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

  // Add description (if present)
  if (node.description) {
    parts.push(c.description(node.description));
  }

  return parts.join(', ');
}

/**
 * Determines if role should be announced before name.
 * 
 * Narrator announces role first for links, headings, landmarks,
 * and structural containers.
 * 
 * @param role - Role to check
 * @returns true if role should be announced first
 */
function shouldAnnounceRoleFirst(role: AccessibleRole): boolean {
  const roleFirstRoles: AccessibleRole[] = [
    'link',
    'heading',
    'navigation',
    'main',
    'banner',
    'contentinfo',
    'complementary',
    'region',
    'form',
    'search',
    'blockquote',
    'figure',
    'dialog',
    'group',
    'document',
  ];
  return roleFirstRoles.includes(role);
}

/**
 * Formats the role portion of a Narrator announcement.
 * 
 * @param node - Node to format
 * @returns Role text or empty string
 */
function formatRoleNarrator(node: AccessibleNode): string {
  const role = node.role;

  switch (role) {
    case 'button':
      return 'button';

    case 'link':
      return 'link';

    case 'heading':
      if (node.state.level) {
        return `Heading level ${node.state.level}`;
      }
      return 'Heading';

    case 'textbox':
      return 'edit';

    case 'checkbox':
      return 'check box';

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
      return 'list item';

    case 'navigation':
      return 'navigation';

    case 'main':
      return 'main';

    case 'banner':
      return 'banner';

    case 'contentinfo':
      return 'content info';

    case 'complementary':
      return 'complementary';

    case 'form':
      return 'form';

    case 'search':
      return 'search';

    case 'region':
      return 'region';

    case 'img':
      return 'image';

    case 'article':
      return 'article';

    case 'generic':
      return '';

    case 'staticText':
    case 'paragraph':
    case 'cell':
    case 'term':
    case 'definition':
    case 'caption':
      return '';

    case 'blockquote':
      return 'block quote';

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
      return 'dialog';

    case 'meter':
      return 'meter';

    case 'progressbar':
      return 'progress bar';

    case 'status':
      return 'status';

    case 'group':
      return node.name ? 'group' : '';

    case 'document':
      return 'document';

    case 'application':
      return 'application';

    case 'separator':
      return 'separator';

    default:
      return role;
  }
}

/**
 * Formats the state portion of a Narrator announcement.
 * 
 * @param node - Node to format
 * @returns State text or empty string
 */
function formatStatesNarrator(node: AccessibleNode): string {
  const states: string[] = [];

  // Expanded/collapsed state
  if (node.state.expanded !== undefined) {
    states.push(node.state.expanded ? 'expanded' : 'collapsed');
  }

  // Checked state (checkbox/radio)
  if (node.state.checked !== undefined) {
    if (node.state.checked === 'mixed') {
      states.push('partially selected');
    } else {
      states.push(node.state.checked ? 'checked' : 'unchecked');
    }
  }

  // Pressed state (toggle button)
  if (node.state.pressed !== undefined) {
    if (node.state.pressed === 'mixed') {
      states.push('partially pressed');
    } else {
      states.push(node.state.pressed ? 'pressed' : 'not pressed');
    }
  }

  // Selected state
  if (node.state.selected !== undefined) {
    states.push(node.state.selected ? 'selected' : 'not selected');
  }

  // Disabled state
  if (node.state.disabled) {
    states.push('disabled');
  }

  // Invalid state
  if (node.state.invalid) {
    states.push('invalid');
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
