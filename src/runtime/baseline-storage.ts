import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import type { AccessibilityTimeline } from './types.js';

const SPEAKABLE_VERSION = '1.3.0';

export interface BaselineFile {
  baseline: {
    createdAt: string;
    speakableVersion: string;
    storybookUrl?: string;
    interactionSequence: string;
  };
  timeline: AccessibilityTimeline;
}

export interface BaselineStorage {
  save(componentName: string, storyName: string, timeline: AccessibilityTimeline, meta?: { storybookUrl?: string }): Promise<void>;
  load(componentName: string, storyName: string): Promise<BaselineFile | null>;
  exists(componentName: string, storyName: string): Promise<boolean>;
  getBaselinePath(componentName: string, storyName: string): string;
}

export function createBaselineStorage(baseDir: string): BaselineStorage {
  function sanitize(name: string): string {
    return name.toLowerCase().replace(/[/\\]/g, '-').replace(/[^a-z0-9._-]/g, '-');
  }

  function getPath(componentName: string, storyName: string): string {
    return join(baseDir, sanitize(componentName), `${sanitize(storyName)}.timeline.json`);
  }

  return {
    async save(componentName, storyName, timeline, meta) {
      const filePath = getPath(componentName, storyName);
      const dir = dirname(filePath);

      try {
        await mkdir(dir, { recursive: true });
      } catch (err) {
        throw new Error(`Cannot create baseline directory "${dir}": ${(err as Error).message}`);
      }

      const baselineFile: BaselineFile = {
        baseline: {
          createdAt: new Date().toISOString(),
          speakableVersion: SPEAKABLE_VERSION,
          storybookUrl: meta?.storybookUrl,
          interactionSequence: timeline.interactionSequence,
        },
        timeline,
      };

      const json = JSON.stringify(baselineFile, null, 2);

      try {
        await writeFile(filePath, json, 'utf-8');
      } catch (err) {
        throw new Error(`Cannot write baseline file "${filePath}": ${(err as Error).message}`);
      }
    },

    async load(componentName, storyName) {
      const filePath = getPath(componentName, storyName);
      try {
        const content = await readFile(filePath, 'utf-8');
        const parsed = JSON.parse(content) as BaselineFile;
        return parsed;
      } catch {
        return null;
      }
    },

    async exists(componentName, storyName) {
      const filePath = getPath(componentName, storyName);
      try {
        await access(filePath);
        return true;
      } catch {
        return false;
      }
    },

    getBaselinePath(componentName, storyName) {
      return getPath(componentName, storyName);
    },
  };
}
