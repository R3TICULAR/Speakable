/**
 * Browser baseline store for the Storybook manager panel.
 *
 * The preview iframe cannot write to disk, so panel baselines are persisted
 * in `localStorage`, keyed by a stable `component::story` key. The fs-based
 * `createBaselineStorage` in `src/runtime` remains for CLI/CI use.
 */

import type { AccessibilityTimeline } from '../../src/runtime/types';

const STORAGE_PREFIX = 'speakable:baseline:';

export interface PanelBaselineStore {
  key(component: string, story: string): string;
  save(component: string, story: string, timeline: AccessibilityTimeline): Promise<void>;
  load(component: string, story: string): Promise<AccessibilityTimeline | null>;
}

function getStorage(): Storage | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // Access to localStorage can throw in some sandboxed contexts.
  }
  return null;
}

export function createPanelBaselineStore(): PanelBaselineStore {
  // In-memory fallback when localStorage is unavailable.
  const memory = new Map<string, string>();

  function storageKey(component: string, story: string): string {
    return `${STORAGE_PREFIX}${component}::${story}`;
  }

  return {
    key(component, story) {
      return storageKey(component, story);
    },

    async save(component, story, timeline) {
      const k = storageKey(component, story);
      const json = JSON.stringify(timeline);
      const storage = getStorage();
      if (storage) {
        storage.setItem(k, json);
      } else {
        memory.set(k, json);
      }
    },

    async load(component, story) {
      const k = storageKey(component, story);
      const storage = getStorage();
      const json = storage ? storage.getItem(k) : memory.get(k) ?? null;
      if (!json) return null;
      try {
        return JSON.parse(json) as AccessibilityTimeline;
      } catch {
        return null;
      }
    },
  };
}
