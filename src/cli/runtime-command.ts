import { JSDOM } from 'jsdom';
import { createTimelineGenerator } from '../runtime/timeline-generator.js';
import { getBuiltinPattern } from '../runtime/patterns.js';
import { serializeTimeline, deserializeInteractionSequence } from '../runtime/serialization.js';
import { diffTimelines } from '../runtime/diff-engine.js';
import { classifyDiff, type SeverityLevel } from '../runtime/severity.js';
import { createBaselineStorage } from '../runtime/baseline-storage.js';
import { runStorybookPipeline } from '../storybook/pipeline.js';
import type { InteractionSequence } from '../runtime/types.js';
import { readFile } from 'fs/promises';

export interface RuntimeCommandOptions {
  url: string;
  storybook?: boolean;
  story?: string;
  interaction?: string;
  interactionFile?: string;
  format?: 'json' | 'summary';
  runtimeSnapshot?: string;
  updateRuntimeSnapshot?: boolean;
  runtimeCi?: boolean;
  runtimeFailOn?: SeverityLevel;
}

export async function executeRuntimeCommand(options: RuntimeCommandOptions): Promise<number> {
  try {
    if (options.storybook) {
      return await handleStorybookMode(options);
    }
    return await handleSingleUrlMode(options);
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    return 3;
  }
}

async function handleSingleUrlMode(options: RuntimeCommandOptions): Promise<number> {
  const html = await fetchHtml(options.url);
  const dom = new JSDOM(html, { url: options.url });
  const doc = dom.window.document;
  const componentName = extractComponentName(options.url);

  const sequence = await resolveSequence(options);

  const generator = createTimelineGenerator({
    document: doc,
    componentName,
    heuristics: true,
  });

  const timeline = await generator.capture(sequence);

  // Handle baseline comparison
  if (options.runtimeSnapshot) {
    const storage = createBaselineStorage(options.runtimeSnapshot);

    if (options.updateRuntimeSnapshot) {
      await storage.save(componentName, 'default', timeline);
      if (options.runtimeCi) process.stderr.write(`Baseline saved for ${componentName}\n`);
    } else {
      const existing = await storage.load(componentName, 'default');
      if (existing) {
        const diff = diffTimelines(existing.timeline, timeline);
        const classified = classifyDiff(diff);

        if (options.format === 'json') {
          process.stdout.write(JSON.stringify(classified, null, 2) + '\n');
        } else {
          printSummary(classified);
        }

        return getExitCode(classified.highestSeverity, options.runtimeFailOn);
      }
      // No existing baseline: save as new
      await storage.save(componentName, 'default', timeline);
    }
  }

  // Output timeline
  if (options.format === 'json') {
    process.stdout.write(serializeTimeline(timeline) + '\n');
  } else {
    printTimelineSummary(timeline);
  }

  return 0;
}

async function handleStorybookMode(options: RuntimeCommandOptions): Promise<number> {
  if (options.runtimeCi) process.stderr.write(`Connecting to Storybook at ${options.url}...\n`);

  const result = await runStorybookPipeline({
    storybookUrl: options.url,
    componentFilter: options.story,
    interactionPattern: options.interaction,
    interactionFile: options.interactionFile,
  });

  if (options.runtimeCi) {
    process.stderr.write(`Analyzed ${result.totalStories} stories, ${result.totalWarnings} warnings\n`);
  }

  if (options.runtimeSnapshot) {
    const storage = createBaselineStorage(options.runtimeSnapshot);
    let worstSeverity: SeverityLevel | null = null;

    for (const story of result.stories) {
      if (options.updateRuntimeSnapshot) {
        await storage.save(story.componentName, story.storyName, story.timeline, { storybookUrl: options.url });
      } else {
        const existing = await storage.load(story.componentName, story.storyName);
        if (existing) {
          const diff = diffTimelines(existing.timeline, story.timeline);
          const classified = classifyDiff(diff);
          if (classified.highestSeverity && (!worstSeverity || severityRank(classified.highestSeverity) > severityRank(worstSeverity))) {
            worstSeverity = classified.highestSeverity;
          }
        } else {
          await storage.save(story.componentName, story.storyName, story.timeline, { storybookUrl: options.url });
        }
      }
    }

    return getExitCode(worstSeverity, options.runtimeFailOn);
  }

  if (options.format === 'json') {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    process.stdout.write(`Analyzed ${result.totalStories} stories\n`);
    process.stdout.write(`Warnings: ${result.totalWarnings}\n`);
  }

  return 0;
}

// Helpers

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return response.text();
}

async function resolveSequence(options: RuntimeCommandOptions): Promise<InteractionSequence> {
  if (options.interactionFile) {
    const content = await readFile(options.interactionFile, 'utf-8');
    return deserializeInteractionSequence(content);
  }
  if (options.interaction) {
    const valid = ['modal-dialog', 'combobox', 'tabs', 'accordion'] as const;
    if (valid.includes(options.interaction as typeof valid[number])) {
      return getBuiltinPattern(options.interaction as typeof valid[number]);
    }
  }
  return { description: 'Default exploration', actions: [{ type: 'tab' }, { type: 'tab' }, { type: 'tab' }] };
}

function extractComponentName(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\/$/, '').split('/').pop() || 'page';
    return path.replace(/\.html?$/, '');
  } catch {
    return 'component';
  }
}

function getExitCode(severity: SeverityLevel | null, failOn?: SeverityLevel): number {
  if (!severity) return 0;
  const rank = severityRank(severity);
  const threshold = failOn ? severityRank(failOn) : severityRank('high');
  return rank >= threshold ? 1 : 0;
}

function severityRank(level: SeverityLevel): number {
  switch (level) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
  }
}

function printSummary(classified: ReturnType<typeof classifyDiff>): void {
  process.stdout.write(`Regressions: ${classified.entries.length}\n`);
  if (classified.criticalCount) process.stdout.write(`  Critical: ${classified.criticalCount}\n`);
  if (classified.highCount) process.stdout.write(`  High: ${classified.highCount}\n`);
  if (classified.mediumCount) process.stdout.write(`  Medium: ${classified.mediumCount}\n`);
  if (classified.lowCount) process.stdout.write(`  Low: ${classified.lowCount}\n`);
}

function printTimelineSummary(timeline: { events: { type: string }[], warnings: unknown[] }): void {
  const counts: Record<string, number> = {};
  for (const e of timeline.events) {
    counts[e.type] = (counts[e.type] || 0) + 1;
  }
  process.stdout.write(`Timeline: ${timeline.events.length} events, ${timeline.warnings.length} warnings\n`);
  for (const [type, count] of Object.entries(counts)) {
    process.stdout.write(`  ${type}: ${count}\n`);
  }
}
