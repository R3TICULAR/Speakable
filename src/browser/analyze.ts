/**
 * Transport-agnostic static accessibility analysis.
 *
 * Wraps the core Speakable engine (tree-builder + per-reader renderers +
 * audit) to produce differentiated screen reader output predictions from a
 * live DOM element. This is the single source of truth consumed by the
 * Storybook addon, the iframe harness, and the browser extension.
 */

import { buildAccessibilityTree } from '../extractor/tree-builder.js';
import { renderNVDA } from '../renderer/nvda-renderer.js';
import { renderJAWS } from '../renderer/jaws-renderer.js';
import { renderVoiceOver } from '../renderer/voiceover-renderer.js';
import { renderNarrator } from '../renderer/narrator-renderer.js';
import { generateAuditReport } from '../renderer/audit-renderer.js';
import type { AccessibleNode } from '../model/types.js';

export interface AuditFinding {
  severity: 'error' | 'warning' | 'info';
  message: string;
  selector: string;
}

export interface AnalysisResult {
  nvda: string[];
  jaws: string[];
  voiceover: string[];
  narrator: string[];
  audit: AuditFinding[];
  stats: {
    totalElements: number;
    interactiveElements: number;
    landmarks: number;
    headings: number;
  };
  /** Tree-build and upgrade warnings surfaced to the user. */
  warnings: string[];
}

// Roles that count as landmarks
const LANDMARK_ROLES = new Set([
  'navigation', 'main', 'banner', 'contentinfo',
  'complementary', 'region', 'form', 'search',
]);

// Roles that count as interactive
const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'textbox', 'checkbox', 'radio',
  'combobox', 'listbox', 'option',
]);

/**
 * Count tree stats by walking the AccessibleNode tree.
 */
function countStats(node: AccessibleNode): AnalysisResult['stats'] {
  const stats = { totalElements: 0, interactiveElements: 0, landmarks: 0, headings: 0 };

  function walk(n: AccessibleNode) {
    if (n.role !== 'generic' && n.role !== 'staticText') {
      stats.totalElements++;
    }
    if (INTERACTIVE_ROLES.has(n.role)) stats.interactiveElements++;
    if (LANDMARK_ROLES.has(n.role)) stats.landmarks++;
    if (n.role === 'heading') stats.headings++;
    for (const child of n.children) walk(child);
  }

  walk(node);
  return stats;
}

/**
 * Convert core audit issues to the panel's AuditFinding format.
 */
function convertAuditFindings(
  model: ReturnType<typeof buildAccessibilityTree>['model']
): AuditFinding[] {
  const report = generateAuditReport(model);
  return report.issues.map(issue => ({
    severity: issue.severity,
    message: issue.message,
    selector: issue.element
      ? `${issue.element.role}${issue.element.name ? ` "${issue.element.name}"` : ''}`
      : issue.suggestion || '',
  }));
}

/**
 * An empty, well-formed result for empty/detached/invalid input.
 */
function emptyResult(extraWarnings: string[] = []): AnalysisResult {
  return {
    nvda: [],
    jaws: [],
    voiceover: [],
    narrator: [],
    audit: [],
    stats: { totalElements: 0, interactiveElements: 0, landmarks: 0, headings: 0 },
    warnings: [...extraWarnings],
  };
}

/**
 * Analyze a live DOM element using the core Speakable engine.
 *
 * Reuses buildAccessibilityTree + the four renderers + generateAuditReport.
 * Never throws on empty or detached input — returns a well-formed empty result.
 *
 * @param root - DOM element to analyze
 * @param extraWarnings - Optional warnings to fold in (e.g. upgrade timeouts)
 * @returns Differentiated per-reader analysis result
 */
export function analyzeElement(root: Element | null | undefined, extraWarnings: string[] = []): AnalysisResult {
  if (!root) {
    return emptyResult(extraWarnings);
  }

  let built: ReturnType<typeof buildAccessibilityTree>;
  try {
    built = buildAccessibilityTree(root);
  } catch (err) {
    return emptyResult([
      ...extraWarnings,
      `Analysis failed: ${err instanceof Error ? err.message : String(err)}`,
    ]);
  }

  const { model, warnings: treeWarnings } = built;

  // Render per-reader output (colorize=false to get plain text)
  const nvda = renderNVDA(model, false).split('\n').filter(Boolean);
  const jaws = renderJAWS(model, false).split('\n').filter(Boolean);
  const voiceover = renderVoiceOver(model, false).split('\n').filter(Boolean);
  const narrator = renderNarrator(model, false).split('\n').filter(Boolean);

  const audit = convertAuditFindings(model);
  const stats = countStats(model.root);

  const warnings = [
    ...extraWarnings,
    ...treeWarnings.map(w => w.message),
  ];

  return { nvda, jaws, voiceover, narrator, audit, stats, warnings };
}

/**
 * Analyze a live DOM element after awaiting custom-element upgrade.
 *
 * Waits for web components under `root` to upgrade/render (bounded by
 * `upgradeTimeoutMs`), then runs `analyzeElement`, folding any upgrade
 * warnings into `result.warnings`. Use this in real-browser surfaces
 * (harness, extension, addon) where components may hydrate asynchronously.
 */
export async function analyzeElementWithUpgrade(
  root: Element | null | undefined,
  upgradeTimeoutMs?: number
): Promise<AnalysisResult> {
  // Imported lazily to keep the sync `analyzeElement` path dependency-free.
  const { awaitCustomElementsReady } = await import('./upgrade.js');
  const target = root ?? undefined;
  const scope: Document | Element | undefined =
    target && target.ownerDocument ? target.ownerDocument : target;
  const upgradeWarnings = scope
    ? await awaitCustomElementsReady(scope, upgradeTimeoutMs)
    : [];
  return analyzeElement(root, upgradeWarnings.map(w => w.message));
}
