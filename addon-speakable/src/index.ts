/**
 * @reticular/storybook-addon-speakable
 *
 * Storybook addon that predicts screen reader output (NVDA, JAWS, VoiceOver, Narrator)
 * for the currently rendered story. Shows a "Screen Readers" panel in the Storybook UI
 * with predicted speech output, cross-reader differences, and accessibility audit findings.
 *
 * Installation:
 *   npm install @reticular/storybook-addon-speakable
 *
 * Configuration (.storybook/main.ts):
 *   addons: ['@reticular/storybook-addon-speakable']
 */

export const ADDON_ID = 'speakable';
export const PANEL_ID = `${ADDON_ID}/panel`;
export const EVENT_RENDER = `${ADDON_ID}/render`;
export const EVENT_RESULT = `${ADDON_ID}/result`;
