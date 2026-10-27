/**
 * Tests for the benchmark normalization + semantic-field parser.
 *
 * This is the integrity surface: the token tables must canonicalize equivalent
 * NVDA/VoiceOver wording to the same fields WITHOUT erasing distinct meaning or
 * over-collapsing to inflate scores.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  parsePhrase,
  normalizePhrases,
  ROLE_SYNONYMS,
  STATE_SYNONYMS,
} from '../../bench/harness/normalize.js';

describe('normalizeText', () => {
  it('lowercases, collapses whitespace, strips trailing punctuation', () => {
    expect(normalizeText('  Save   Changes.  ')).toBe('save changes');
    expect(normalizeText('Button,')).toBe('button');
    expect(normalizeText('Heading level 2!')).toBe('heading level 2');
  });
});

describe('role canonicalization', () => {
  it('maps NVDA and VoiceOver navigation wording to the same role token', () => {
    const nvda = parsePhrase('Primary, navigation landmark');
    const vo = parsePhrase('Primary, navigation');
    expect(nvda.role).toBe('navigation');
    expect(vo.role).toBe('navigation');
    // but the raw wording difference is preserved
    expect(nvda.raw).not.toBe(vo.raw);
  });

  it('maps edit / edit text / text field to textbox', () => {
    expect(parsePhrase('Email, edit').role).toBe('textbox');
    expect(parsePhrase('Email, edit text').role).toBe('textbox');
    expect(parsePhrase('Email, text field').role).toBe('textbox');
  });

  it('maps check box / checkbox / tick box to checkbox', () => {
    expect(parsePhrase('Accept terms, check box').role).toBe('checkbox');
    expect(parsePhrase('Accept terms, checkbox').role).toBe('checkbox');
  });

  it('does not merge semantically distinct roles', () => {
    // button and link must stay distinct
    expect(parsePhrase('Save, button').role).toBe('button');
    expect(parsePhrase('Save, link').role).toBe('link');
    expect(ROLE_SYNONYMS['button']).not.toBe(ROLE_SYNONYMS['link']);
  });
});

describe('name extraction', () => {
  it('pulls the accessible name out as the non-role, non-state segment', () => {
    expect(parsePhrase('Save changes, button').name).toBe('save changes');
    expect(parsePhrase('Close dialog, button').name).toBe('close dialog');
  });

  it('handles role-first phrasing (VoiceOver landmarks)', () => {
    const p = parsePhrase('navigation, Primary');
    expect(p.role).toBe('navigation');
    expect(p.name).toBe('primary');
  });
});

describe('state canonicalization', () => {
  it('maps collapsed/not expanded to expanded:false', () => {
    expect(parsePhrase('Options, button, collapsed').state).toContain('expanded:false');
    expect(parsePhrase('Options, button, not expanded').state).toContain('expanded:false');
  });

  it('maps checked synonyms consistently', () => {
    expect(parsePhrase('Accept, checkbox, checked').state).toContain('checked:true');
    expect(parsePhrase('Accept, checkbox, ticked').state).toContain('checked:true');
    expect(parsePhrase('Accept, checkbox, not checked').state).toContain('checked:false');
    expect(parsePhrase('Select all, checkbox, mixed').state).toContain('checked:mixed');
    expect(parsePhrase('Select all, checkbox, half checked').state).toContain('checked:mixed');
  });

  it('maps disabled synonyms (unavailable/dimmed) to disabled:true', () => {
    expect(parsePhrase('Submit, button, unavailable').state).toContain('disabled:true');
    expect(parsePhrase('Submit, button, dimmed').state).toContain('disabled:true');
    expect(STATE_SYNONYMS['unavailable']).toBe('disabled:true');
    expect(STATE_SYNONYMS['dimmed']).toBe('disabled:true');
  });

  it('maps pressed and current', () => {
    expect(parsePhrase('Bold, toggle button, pressed').state).toContain('pressed:true');
    expect(parsePhrase('Docs, link, current page').state).toContain('current:page');
  });

  it('captures heading level into state', () => {
    const p = parsePhrase('Welcome to Speakable, heading level 1');
    expect(p.role).toBe('heading');
    expect(p.state).toContain('level:1');
  });
});

describe('conservative behavior', () => {
  it('leaves unknown tokens in raw rather than forcing a field', () => {
    const p = parsePhrase('Mysterious widget, frobnicator');
    // "frobnicator" matches no role/state table, so it is treated as name text,
    // never silently dropped or mis-mapped to a role.
    expect(p.role).toBeUndefined();
    expect(p.name).toContain('frobnicator');
    expect(p.raw).toContain('frobnicator');
  });

  it('does not assign a role when none is spoken', () => {
    const p = parsePhrase('3 items added to cart');
    expect(p.role).toBeUndefined();
    expect(p.name).toBe('3 items added to cart');
  });
});

describe('VoiceOver space-delimited phrasing (no commas)', () => {
  it('peels a trailing role spoken as a plain word', () => {
    expect(parsePhrase('Place order button')).toMatchObject({ role: 'button', name: 'place order' });
    expect(parsePhrase('Close dialog button')).toMatchObject({ role: 'button', name: 'close dialog' });
  });

  it('peels trailing role + state (VoiceOver order: name state role)', () => {
    expect(parsePhrase('Subscribe to newsletter checked checkbox')).toMatchObject({
      role: 'checkbox',
      name: 'subscribe to newsletter',
      state: ['checked:true'],
    });
    expect(parsePhrase('Options collapsed button')).toMatchObject({
      role: 'button',
      name: 'options',
      state: ['expanded:false'],
    });
  });

  it('parses a switch with scoped on/off state', () => {
    expect(parsePhrase('Dark mode on switch')).toMatchObject({
      role: 'switch',
      name: 'dark mode',
      state: ['checked:true'],
    });
  });

  it('does NOT read "on" as a state when the role is not a switch', () => {
    // Integrity: "on" is an ordinary name word here, not a switch state.
    const p = parsePhrase('Turn on notifications button');
    expect(p.role).toBe('button');
    expect(p.name).toBe('turn on notifications');
    expect(p.state).toBeUndefined();
  });

  it('drops the VoiceOver input-type suffix after "edit text"', () => {
    expect(parsePhrase('Email address edit text email')).toMatchObject({
      role: 'textbox',
      name: 'email address',
    });
    // without a type suffix it still parses
    expect(parsePhrase('Search edit text')).toMatchObject({ role: 'textbox', name: 'search' });
  });

  it('handles VoiceOver role-first links, with optional leading state', () => {
    expect(parsePhrase('link View pricing')).toMatchObject({ role: 'link', name: 'view pricing' });
    expect(parsePhrase('current page link Docs')).toMatchObject({
      role: 'link',
      name: 'docs',
      state: ['current:page'],
    });
  });

  it('leaves a plain sentence with no spoken role untouched', () => {
    const p = parsePhrase('Welcome to Speakable');
    expect(p.role).toBeUndefined();
    expect(p.name).toBe('welcome to speakable');
  });
});

describe('normalizePhrases', () => {
  it('drops empty phrases and preserves order', () => {
    const out = normalizePhrases(['Save, button', '   ', 'Email, edit']);
    expect(out).toHaveLength(2);
    expect(out[0].role).toBe('button');
    expect(out[1].role).toBe('textbox');
  });

  it('collapses CONSECUTIVE duplicate phrases (capture over-walk artifact)', () => {
    // VoiceOver re-announces the same element when the cursor cannot advance;
    // these repeats are not new information and must not inflate field multisets.
    const out = normalizePhrases([
      'Place order button',
      '',
      'Place order button',
      '',
      'Place order button',
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ role: 'button', name: 'place order' });
  });

  it('keeps a genuine re-announcement separated by other content', () => {
    const out = normalizePhrases(['Home, link', 'Docs, link', 'Home, link']);
    expect(out).toHaveLength(3);
  });
});
