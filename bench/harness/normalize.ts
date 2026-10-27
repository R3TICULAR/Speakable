/**
 * Normalization + semantic-field parsing.
 *
 * Applied IDENTICALLY to both ground truth (real SR phrases) and Speakable
 * predictions so comparison scores MEANING, not wording.
 *
 * Two layers:
 *   A. Text normalization: lowercase, collapse whitespace, strip trailing punctuation.
 *   B. Semantic-field parsing: pull { role, name, state, value } out of a phrase
 *      using the documented, data-driven token tables below.
 *
 * Parsing strategy (position-aware): NVDA and VoiceOver both speak the
 * accessible NAME first, then the ROLE, then STATE(s). So we consume role and
 * state tokens greedily from the END of the comma-separated phrase, and
 * whatever remains at the front is the name. This matters for integrity: a
 * phrase like "Edit, list item" must parse as name="edit" + role=listitem, NOT
 * mistake the leading word "edit" for the NVDA "edit" (textbox) role token.
 *
 * INTEGRITY GUARDRAIL: this normalization must be CONSERVATIVE, not flattering.
 * The token tables are exported as data so a reviewer can audit exactly what is
 * and is not collapsed. When a token is ambiguous, prefer leaving it in the
 * name over forcing a role/state. Over-collapsing to inflate the score is the
 * integrity risk. A flattering-but-fishy number is worse than an honest one.
 */

import type { NormalizedPhrase } from './types.js';

// ---------------------------------------------------------------------------
// Canonical ROLE table (auditable data)
// ---------------------------------------------------------------------------
// Maps the role phrasings NVDA and VoiceOver actually speak (confirmed against
// src/renderer/{nvda,voiceover}-renderer.ts) to one canonical token. The
// per-reader wording difference is preserved in `raw`; only the shared meaning
// is extracted into `role`.

export const ROLE_SYNONYMS: Record<string, string> = {
  // button
  'button': 'button',
  'toggle button': 'button',
  // link
  'link': 'link',
  // headings (level captured separately as state level:N)
  'heading': 'heading',
  // text input (NVDA "edit", VoiceOver "edit text" / "text field")
  'edit': 'textbox',
  'edit text': 'textbox',
  'text field': 'textbox',
  'textbox': 'textbox',
  // checkbox
  'checkbox': 'checkbox',
  'check box': 'checkbox',
  // radio
  'radio button': 'radio',
  'radio': 'radio',
  // combobox
  'combobox': 'combobox',
  'combo box': 'combobox',
  // switch (VoiceOver speaks "switch"; state on/off handled separately)
  'switch': 'switch',
  // slider / progress (VoiceOver: "slider", "progress indicator")
  'slider': 'slider',
  'progress indicator': 'progressbar',
  'progressbar': 'progressbar',
  // spin button / stepper (VoiceOver: "stepper" for number inputs)
  'stepper': 'spinbutton',
  'spinbutton': 'spinbutton',
  'spin button': 'spinbutton',
  // read-only text (VoiceOver: "clickable text" for a read-only input)
  'clickable text': 'textbox',
  // tab (VoiceOver: "tab"; NVDA: "tab")
  'tab': 'tab',
  // listbox
  'listbox': 'listbox',
  'list box': 'listbox',
  // lists
  'list': 'list',
  'list item': 'listitem',
  'listitem': 'listitem',
  'item': 'listitem',
  // landmarks (NVDA appends "landmark"; VoiceOver often does not)
  'navigation': 'navigation',
  'navigation landmark': 'navigation',
  'main': 'main',
  'main landmark': 'main',
  'complementary': 'complementary',
  'complementary landmark': 'complementary',
  'banner': 'banner',
  'banner landmark': 'banner',
  'content information': 'contentinfo',
  'content information landmark': 'contentinfo',
  'region': 'region',
  'region landmark': 'region',
  'form landmark': 'form',
  'search landmark': 'search',
  // live-region roles
  'status': 'status',
  'alert': 'alert',
  // media / graphics
  'graphic': 'img',
  'image': 'img',
  // tables
  'table': 'table',
  'row': 'row',
  'cell': 'cell',
  'row header': 'rowheader',
  'rowheader': 'rowheader',
  'column header': 'columnheader',
  // grouping / dialog
  'group': 'group',
  'grouping': 'group',
  'dialog': 'dialog',
  'web dialog': 'dialog',
  'article': 'article',
};

// ---------------------------------------------------------------------------
// Canonical STATE table (auditable data)
// ---------------------------------------------------------------------------

export const STATE_SYNONYMS: Record<string, string> = {
  'expanded': 'expanded:true',
  'collapsed': 'expanded:false',
  'not expanded': 'expanded:false',
  'checked': 'checked:true',
  'ticked': 'checked:true',
  'not checked': 'checked:false',
  'unchecked': 'checked:false',
  'not ticked': 'checked:false',
  'half checked': 'checked:mixed',
  'partially checked': 'checked:mixed',
  'mixed': 'checked:mixed',
  'pressed': 'pressed:true',
  'not pressed': 'pressed:false',
  'selected': 'selected:true',
  'not selected': 'selected:false',
  'disabled': 'disabled:true',
  'unavailable': 'disabled:true',
  'dimmed': 'disabled:true',
  'required': 'required:true',
  'invalid': 'invalid:true',
  'invalid entry': 'invalid:true',
  'current page': 'current:page',
  'current': 'current:true',
};

// ---------------------------------------------------------------------------
// Layer A: text normalization
// ---------------------------------------------------------------------------

/** Lowercase, collapse internal whitespace, strip surrounding whitespace and trailing punctuation. */
export function normalizeText(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:!]+$/g, '')
    .trim();
}

/**
 * Longest multi-word role/state phrasings, sorted longest-first, so that when
 * we peel trailing space-delimited tokens we match "edit text" before "edit"
 * and "radio button" before "button". Derived from the auditable tables above.
 */
const ROLE_PHRASES_BY_LEN = Object.keys(ROLE_SYNONYMS).sort((a, b) => b.split(' ').length - a.split(' ').length);
const STATE_PHRASES_BY_LEN = Object.keys(STATE_SYNONYMS).sort((a, b) => b.split(' ').length - a.split(' ').length);

/**
 * VoiceOver speaks a single space-delimited phrase ("name [states] role") with
 * NO commas, unlike NVDA's comma-separated output. Peel known role and state
 * phrasings off the END of a space-delimited segment so both readers parse into
 * the same fields.
 *
 * Conservative by design (integrity guardrail): only tokens present in the
 * audited ROLE/STATE tables are peeled; anything unknown stays in the name.
 * Returns the leftover name words plus any extracted role/states.
 */
// Input-type words VoiceOver appends AFTER the "edit text" role, e.g.
// "Email address edit text email". Audited, closed set — not peeled as name.
const VO_INPUT_TYPES = new Set(['email', 'search', 'number', 'telephone', 'phone', 'url', 'password', 'date', 'time']);

// "on"/"off" are only state words in the context of a switch role (otherwise
// they are ordinary name words like "Turn on"). Scoped, never global.
const VO_SWITCH_STATE: Record<string, string> = { on: 'checked:true', off: 'checked:false' };

function peelTrailingTokens(seg: string): {
  name: string;
  role?: string;
  states: string[];
} {
  let words = seg.split(' ').filter(Boolean);
  let role: string | undefined;
  const states: string[] = [];

  const tryMatch = (phrases: string[]): string | null => {
    for (const phrase of phrases) {
      const parts = phrase.split(' ');
      if (parts.length > words.length) continue;
      const tail = words.slice(words.length - parts.length).join(' ');
      if (tail === phrase) return phrase;
    }
    return null;
  };

  // (0) VoiceOver appends "blank" to an empty text field ("... edit text blank",
  // "... text field blank"). It is an empty-value marker, not name content; drop
  // it so the role below is at the tail. Only when a role precedes it.
  if (words.length >= 2 && words[words.length - 1] === 'blank') {
    const beforeBlank = words.slice(0, words.length - 1).join(' ');
    for (const phrase of ROLE_PHRASES_BY_LEN) {
      if (beforeBlank.endsWith(phrase)) {
        words = words.slice(0, words.length - 1);
        break;
      }
    }
  }

  // (1) VoiceOver appends an input TYPE after "edit text" ("... edit text email").
  // Peel a single known type word so the role match below can see "edit text".
  if (words.length >= 1 && VO_INPUT_TYPES.has(words[words.length - 1])) {
    const maybeRoleTail = words.slice(0, words.length - 1).join(' ');
    // Only treat the trailing word as a type if what precedes it ends in a role.
    for (const phrase of ROLE_PHRASES_BY_LEN) {
      if (maybeRoleTail.endsWith(phrase) && ROLE_SYNONYMS[phrase] === 'textbox') {
        words = words.slice(0, words.length - 1); // drop the type word
        break;
      }
    }
  }

  // (2) Peel the outermost trailing role. VoiceOver order is name → state → role.
  const roleMatch = tryMatch(ROLE_PHRASES_BY_LEN);
  if (roleMatch) {
    role = ROLE_SYNONYMS[roleMatch];
    words = words.slice(0, words.length - roleMatch.split(' ').length);
  }

  // (3) Switch-scoped on/off, which sits between name and the "switch" role
  // ("Dark mode on switch"). Only valid when the role we just peeled is switch.
  if (role === 'switch' && words.length > 0) {
    const last = words[words.length - 1];
    if (VO_SWITCH_STATE[last]) {
      states.unshift(VO_SWITCH_STATE[last]);
      words = words.slice(0, words.length - 1);
    }
  }

  // (4) Peel any remaining trailing state phrasings (e.g. "checked", "collapsed").
  let peeledState = true;
  while (peeledState && words.length > 0) {
    peeledState = false;
    const stateMatch = tryMatch(STATE_PHRASES_BY_LEN);
    if (stateMatch) {
      states.unshift(STATE_SYNONYMS[stateMatch]);
      words = words.slice(0, words.length - stateMatch.split(' ').length);
      peeledState = true;
    }
  }

  // (5) Leading role/state (VoiceOver speaks links role-first, and may prepend a
  // state: "link View pricing", "current page link Docs"). Only when no trailing
  // role was found, so we don't double-assign. Match from the FRONT, longest-first.
  if (!role) {
    const tryLead = (phrases: string[]): string | null => {
      for (const phrase of phrases) {
        const parts = phrase.split(' ');
        if (parts.length > words.length) continue;
        if (words.slice(0, parts.length).join(' ') === phrase) return phrase;
      }
      return null;
    };
    // Optional leading state(s) before the leading role ("current page link ...").
    const leadStates: string[] = [];
    let leadStateMatch = tryLead(STATE_PHRASES_BY_LEN);
    while (leadStateMatch) {
      // Only accept a leading state if a leading role ultimately follows; defer
      // commit until we confirm the role to avoid eating name words.
      const afterState = words.slice(leadStateMatch.split(' ').length);
      const roleAfter = (() => {
        for (const phrase of ROLE_PHRASES_BY_LEN) {
          const parts = phrase.split(' ');
          if (parts.length > afterState.length) continue;
          if (afterState.slice(0, parts.length).join(' ') === phrase) return phrase;
        }
        return null;
      })();
      if (!roleAfter) break;
      leadStates.push(STATE_SYNONYMS[leadStateMatch]);
      words = afterState;
      leadStateMatch = tryLead(STATE_PHRASES_BY_LEN);
    }
    const leadRole = tryLead(ROLE_PHRASES_BY_LEN);
    if (leadRole) {
      role = ROLE_SYNONYMS[leadRole];
      words = words.slice(leadRole.split(' ').length);
      for (const s of leadStates) states.push(s);
    } else if (leadStates.length) {
      // No role materialized; we already guarded above, so this is unreachable,
      // but keep states consistent if it ever is.
      for (const s of leadStates) states.push(s);
    }
  }

  return { name: words.join(' '), role, states };
}

/** Classify a single comma-segment. Returns a tagged token or null (unknown). */
function classifySegment(seg: string): { kind: 'role'; value: string } | { kind: 'state'; value: string } | null {
  // Heading level, e.g. "heading level 2" → role heading + state level:2
  const lvl = seg.match(/^heading level (\d)$/);
  if (lvl) return { kind: 'role', value: 'heading' }; // level captured by caller
  if (Object.prototype.hasOwnProperty.call(ROLE_SYNONYMS, seg)) {
    return { kind: 'role', value: ROLE_SYNONYMS[seg] };
  }
  if (Object.prototype.hasOwnProperty.call(STATE_SYNONYMS, seg)) {
    return { kind: 'state', value: STATE_SYNONYMS[seg] };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Layer B: semantic-field parsing (position-aware, consumes role/state from end)
// ---------------------------------------------------------------------------

export function parsePhrase(rawInput: string): NormalizedPhrase {
  const text = normalizeText(rawInput);
  const result: NormalizedPhrase = { raw: text };
  if (!text) return result;

  const segments = text.split(',').map((s) => s.trim()).filter(Boolean);
  const states: string[] = [];
  let role: string | undefined;

  // Switch context: "on"/"off" are checked states ONLY alongside a switch role
  // (scoped, never global — "on" is otherwise an ordinary name word). Applies to
  // both VoiceOver's space format and the comma-joined prediction format.
  const isSwitch = segments.some((s) => s === 'switch');

  // Consume trailing segments as role/state until we hit a non-classifiable
  // segment, which (with everything before it) forms the name.
  let end = segments.length;
  while (end > 0) {
    const seg = segments[end - 1];
    if (isSwitch && (seg === 'on' || seg === 'off')) {
      states.unshift(seg === 'on' ? 'checked:true' : 'checked:false');
      end--;
      continue;
    }
    const cls = classifySegment(seg);
    if (!cls) break;

    if (cls.kind === 'state') {
      states.unshift(cls.value);
      end--;
      continue;
    }
    // role: only the last (outermost) role wins; a second trailing role phrasing
    // is unusual, so stop consuming once a role is found to protect the name.
    role = cls.value;
    const lvl = seg.match(/^heading level (\d)$/);
    if (lvl) states.unshift(`level:${lvl[1]}`);
    end--;
    break;
  }

  let nameParts = segments.slice(0, end);

  // Leading-role phrasing (VoiceOver landmarks speak role first, e.g.
  // "navigation, Primary"). If we didn't find a trailing role and the FIRST
  // remaining segment is a role token, consume it from the front so the same
  // landmark parses identically across NVDA (role-last) and VoiceOver (role-first).
  if (!role && nameParts.length > 1) {
    const first = classifySegment(nameParts[0]);
    if (first && first.kind === 'role') {
      role = first.value;
      const lvl = nameParts[0].match(/^heading level (\d)$/);
      if (lvl) states.unshift(`level:${lvl[1]}`);
      nameParts = nameParts.slice(1);
    }
  }

  // Space-delimited trailing tokens (VoiceOver: "name [states] role" with no
  // commas). Only when the comma pass found no role, and only on a single
  // remaining name segment, so NVDA's comma format is untouched. Conservative:
  // peels only audited role/state phrasings; unknown words stay in the name.
  if (!role && nameParts.length === 1) {
    const peeled = peelTrailingTokens(nameParts[0]);
    if (peeled.role || peeled.states.length > 0) {
      if (peeled.role) role = peeled.role;
      for (const s of peeled.states.reverse()) states.unshift(s);
      nameParts = peeled.name ? [peeled.name] : [];
    }
  }

  // A value phrase ("value: 42") can appear in the name region; pull it out.
  const remaining: string[] = [];
  for (const seg of nameParts) {
    const v = seg.match(/^(?:value|current value)[:,]?\s*(.+)$/);
    if (v) result.value = v[1].trim();
    else remaining.push(seg);
  }

  if (role) result.role = role;
  if (remaining.length > 0) result.name = remaining.join(', ');
  if (states.length > 0) result.state = states;
  return result;
}

/**
 * Normalize an ordered list of raw phrases into parsed phrases, dropping empties
 * and collapsing CONSECUTIVE duplicates.
 *
 * Real screen readers (VoiceOver especially) re-announce the same element when
 * the reading cursor can't advance past it, so capture logs the identical
 * phrase several times in a row. That repetition is a capture artifact, not new
 * information, and left in it breaks multiset field comparison (ground truth
 * would carry N copies of a name vs. the prediction's one). We collapse only
 * ADJACENT identical phrases, preserving a genuine later re-announcement that is
 * separated by other content.
 */
export function normalizePhrases(rawPhrases: string[]): NormalizedPhrase[] {
  const parsed = rawPhrases
    .map((p) => parsePhrase(p))
    .filter((p) => p.raw.length > 0 && !isBoundaryAnnouncement(p.raw));
  const out: NormalizedPhrase[] = [];
  for (const p of parsed) {
    const prev = out[out.length - 1];
    if (prev && prev.raw === p.raw) continue; // collapse consecutive duplicate
    out.push(p);
  }
  return out;
}

/**
 * True for VoiceOver cursor-boundary announcements that are NOT element output.
 *
 * VoiceOver speaks "end of <container>" when the reading cursor exits a landmark
 * or group. That is an artifact of WALKING the cursor during capture, not an
 * element announcement Speakable is meant to predict — and the exited
 * container's actual content is always announced by its separate entry phrase.
 * Dropping these removes capture noise without hiding content (not flattering:
 * the content is still scored via the entry phrase).
 */
function isBoundaryAnnouncement(raw: string): boolean {
  return /^end of\b/.test(raw);
}
