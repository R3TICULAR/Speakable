import { createStorybookAdapter } from './adapter.js';
import { createStoryLoader } from './loader.js';
import { createTimelineGenerator } from '../runtime/timeline-generator.js';
import { getBuiltinPattern } from '../runtime/patterns.js';
import type { AccessibilityTimeline, InteractionSequence } from '../runtime/types.js';
import { deserializeInteractionSequence } from '../runtime/serialization.js';
import { readFile } from 'fs/promises';

export interface StorybookPipelineOptions {
  storybookUrl: string;
  componentFilter?: string;
  viewport?: { width: number; height: number };
  interactionPattern?: string;
  interactionFile?: string;
  heuristics?: boolean;
  settlePeriod?: number;
  authHeader?: string;
  headers?: Record<string, string>;
  insecure?: boolean;
}

export interface StoryResult {
  storyId: string;
  componentName: string;
  storyName: string;
  timeline: AccessibilityTimeline;
  hasWarnings: boolean;
}

export interface PipelineResult {
  stories: StoryResult[];
  totalStories: number;
  totalWarnings: number;
}

export async function runStorybookPipeline(options: StorybookPipelineOptions): Promise<PipelineResult> {
  // Build auth headers from options
  const authHeaders: Record<string, string> = { ...options.headers };
  if (options.authHeader) {
    authHeaders['Authorization'] = options.authHeader;
  }

  const adapter = createStorybookAdapter({
    url: options.storybookUrl,
    componentFilter: options.componentFilter,
    authHeader: options.authHeader,
    headers: options.headers,
    insecure: options.insecure,
  });

  await adapter.connect();
  const stories = await adapter.discoverStories();

  const loader = createStoryLoader({
    storybookUrl: options.storybookUrl,
    viewport: options.viewport,
    headers: Object.keys(authHeaders).length > 0 ? authHeaders : undefined,
  });

  const sequence = await resolveInteraction(options);
  const results: StoryResult[] = [];

  for (const story of stories) {
    try {
      const loaded = await loader.loadStory(story.id, story.hasPlayFunction);

      const generator = createTimelineGenerator({
        document: loaded.document,
        componentName: story.componentName,
        storyName: story.storyName,
        heuristics: options.heuristics ?? true,
        settlePeriod: options.settlePeriod,
      });

      const timeline = await generator.capture(sequence);

      results.push({
        storyId: story.id,
        componentName: story.componentName,
        storyName: story.storyName,
        timeline,
        hasWarnings: timeline.warnings.length > 0,
      });
    } catch (err) {
      process.stderr.write(`Warning: failed to analyze story "${story.id}": ${(err as Error).message}\n`);
    }
  }

  loader.destroy();
  adapter.disconnect();

  const totalWarnings = results.reduce((sum, r) => sum + r.timeline.warnings.length, 0);

  return {
    stories: results,
    totalStories: results.length,
    totalWarnings,
  };
}

async function resolveInteraction(options: StorybookPipelineOptions): Promise<InteractionSequence> {
  if (options.interactionFile) {
    const content = await readFile(options.interactionFile, 'utf-8');
    return deserializeInteractionSequence(content);
  }

  if (options.interactionPattern) {
    const validPatterns = ['modal-dialog', 'combobox', 'tabs', 'accordion'] as const;
    if (validPatterns.includes(options.interactionPattern as typeof validPatterns[number])) {
      return getBuiltinPattern(options.interactionPattern as typeof validPatterns[number]);
    }
  }

  // Default: basic keyboard exploration
  return {
    description: 'Default keyboard exploration',
    actions: [{ type: 'tab' }, { type: 'tab' }, { type: 'tab' }, { type: 'escape' }],
  };
}
