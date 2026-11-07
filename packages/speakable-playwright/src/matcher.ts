/**
 * The field-level comparison at the heart of both matchers.
 *
 * Compares Speakable's predicted semantic fields (role, name, state, value) for
 * an element against the caller's expectation. Only fields the caller specifies
 * are checked, so `{ role: 'button' }` asserts the role and ignores the name.
 */
import type { AccessibleNode } from '@reticular/speakable';
import type { ExpectedAnnouncement, Prediction, Reader } from './predict.js';

export interface FieldComparison {
  pass: boolean;
  /** Human-readable mismatches, one per failed field. */
  mismatches: string[];
  /** The actual fields Speakable predicted, for the failure message. */
  actual: ExpectedAnnouncement;
}

function nodeState(node: AccessibleNode): string[] {
  const s = node.state;
  const out: string[] = [];
  if (s.expanded !== undefined) out.push(`expanded:${s.expanded}`);
  if (s.checked !== undefined) out.push(`checked:${s.checked}`);
  if (s.pressed !== undefined) out.push(`pressed:${s.pressed}`);
  if (s.selected !== undefined) out.push(`selected:${s.selected}`);
  if (s.disabled) out.push('disabled:true');
  if (s.required) out.push('required:true');
  if (s.invalid) out.push('invalid:true');
  if (s.current) out.push(`current:${s.current}`);
  if (s.level !== undefined) out.push(`level:${s.level}`);
  return out.sort();
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

/** Extract the asserted-upon fields from the predicted node. */
export function actualFields(prediction: Prediction): ExpectedAnnouncement {
  const node = prediction.node;
  if (!node) return {};
  const out: ExpectedAnnouncement = {};
  if (node.role) out.role = node.role;
  if (node.name) out.name = node.name;
  const state = nodeState(node);
  if (state.length) out.state = state;
  if (node.value) out.value = node.value.text ?? String(node.value.current);
  return out;
}

/** Field-level comparison: only the fields present in `expected` are checked. */
export function compareFields(prediction: Prediction, expected: ExpectedAnnouncement): FieldComparison {
  const actual = actualFields(prediction);
  const mismatches: string[] = [];

  if (expected.role !== undefined && norm(expected.role) !== norm(actual.role ?? '')) {
    mismatches.push(`role: expected "${expected.role}", predicted "${actual.role ?? '(none)'}"`);
  }
  if (expected.name !== undefined && norm(expected.name) !== norm(actual.name ?? '')) {
    mismatches.push(`name: expected "${expected.name}", predicted "${actual.name ?? '(none)'}"`);
  }
  if (expected.value !== undefined && norm(expected.value) !== norm(actual.value ?? '')) {
    mismatches.push(`value: expected "${expected.value}", predicted "${actual.value ?? '(none)'}"`);
  }
  if (expected.state !== undefined) {
    const exp = expected.state.map(norm);
    const act = (actual.state ?? []).map(norm);
    if (!sameSet(exp, act)) {
      mismatches.push(`state: expected [${exp.join(', ')}], predicted [${act.join(', ') || '(none)'}]`);
    }
  }

  return { pass: mismatches.length === 0, mismatches, actual };
}

/** Phrase-level comparison: substring-tolerant, normalized. */
export function comparePhrase(prediction: Prediction, expectedPhrase: string): FieldComparison {
  const actual = norm(prediction.phrase);
  const expected = norm(expectedPhrase);
  const pass = actual === expected || actual.includes(expected);
  return {
    pass,
    mismatches: pass ? [] : [`phrase: expected ~"${expectedPhrase}", predicted "${prediction.phrase}"`],
    actual: { name: prediction.phrase },
  };
}

export type { Reader, ExpectedAnnouncement } from './predict.js';
