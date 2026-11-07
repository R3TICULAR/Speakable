/**
 * Matcher core tests (no browser).
 *
 * Exercises the prediction + field/phrase comparison that both matchers use,
 * against real HTML through Speakable's engine. Browser-level wiring
 * (`expect(locator).toAnnounce`) is validated in an integration spec.
 */
import { describe, it, expect } from 'vitest';
import { predictFromHtml } from './predict.js';
import { compareFields, comparePhrase, actualFields } from './matcher.js';

describe('predictFromHtml', () => {
  it('predicts a plain button for VoiceOver', () => {
    const p = predictFromHtml('<button>Save</button>', 'voiceover');
    expect(p.node?.role).toBe('button');
    expect(p.node?.name).toBe('Save');
    expect(p.phrase.toLowerCase()).toContain('button');
  });

  it('predicts a switch with on/off state (VoiceOver engine fix)', () => {
    const p = predictFromHtml('<button role="switch" aria-checked="true">Dark mode</button>', 'voiceover');
    expect(p.node?.role).toBe('switch');
    expect(actualFields(p).state).toContain('checked:true');
  });
});

describe('compareFields (field-level, primary)', () => {
  it('passes when specified fields match, ignoring unspecified ones', () => {
    const p = predictFromHtml('<button>Save</button>', 'voiceover');
    expect(compareFields(p, { role: 'button' }).pass).toBe(true);
    expect(compareFields(p, { role: 'button', name: 'Save' }).pass).toBe(true);
  });

  it('fails with a helpful message on a role mismatch', () => {
    const p = predictFromHtml('<a href="#">Home</a>', 'voiceover');
    const c = compareFields(p, { role: 'button' });
    expect(c.pass).toBe(false);
    expect(c.mismatches[0]).toContain('role');
  });

  it('checks state when asserted', () => {
    const p = predictFromHtml('<input type="checkbox" checked aria-label="Subscribe">', 'voiceover');
    expect(compareFields(p, { role: 'checkbox', state: ['checked:true'] }).pass).toBe(true);
    expect(compareFields(p, { state: ['checked:false'] }).pass).toBe(false);
  });
});

describe('comparePhrase (phrase-level convenience)', () => {
  it('matches a normalized substring of the rendered phrase', () => {
    const p = predictFromHtml('<button>Save changes</button>', 'voiceover');
    expect(comparePhrase(p, 'save changes, button').pass).toBe(true);
    expect(comparePhrase(p, 'Save changes').pass).toBe(true);
  });

  it('fails when the phrase is not present', () => {
    const p = predictFromHtml('<button>Save</button>', 'voiceover');
    expect(comparePhrase(p, 'Cancel, button').pass).toBe(false);
  });
});

describe('reader selection', () => {
  it('uses NVDA phrasing when reader=nvda', () => {
    const p = predictFromHtml('<input type="text" aria-label="Email">', 'nvda');
    // NVDA says "edit"; VoiceOver says "edit text". Just assert it rendered for NVDA.
    expect(p.node?.role).toBe('textbox');
    expect(p.phrase.toLowerCase()).toContain('edit');
  });
});
