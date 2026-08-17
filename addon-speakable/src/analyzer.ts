/**
 * Browser-side accessibility analyzer for the Storybook addon.
 *
 * This module is a thin bridge that uses the core Speakable engine
 * (tree-builder + per-reader renderers) to produce differentiated
 * screen reader output predictions.
 */

import { buildAccessibilityTree } from '../../src/extractor/tree-builder';
import { renderNVDA } from '../../src/renderer/nvda-renderer';
import { renderJAWS } from '../../src/renderer/jaws-renderer';
import { renderVoiceOver } from '../../src/renderer/voiceover-renderer';
import { renderNarrator } from '../../src/renderer/narrator-renderer';
import { generateAuditReport } from '../../src/renderer/audit-renderer';
import type { AccessibleNode } from '../../src/model/types';

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
function countStats(node: AccessibleNode): {
  totalElements: number;
  interactiveElements: number;
  landmarks: number;
  headings: number;
} {
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
function convertAuditFindings(model: ReturnType<typeof buildAccessibilityTree>['model']): AuditFinding[] {
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
 * Analyze a live DOM element using the core Speakable engine.
 * Returns differentiated per-reader output.
 */
export function analyzeDOM(root: Element): AnalysisResult {
  const { model } = buildAccessibilityTree(root);

  // Render per-reader output (colorize=false to get plain text)
  const nvdaText = renderNVDA(model, false);
  const jawsText = renderJAWS(model, false);
  const voiceoverText = renderVoiceOver(model, false);
  const narratorText = renderNarrator(model, false);

  // Split into lines, filter empties
  const nvda = nvdaText.split('\n').filter(Boolean);
  const jaws = jawsText.split('\n').filter(Boolean);
  const voiceover = voiceoverText.split('\n').filter(Boolean);
  const narrator = narratorText.split('\n').filter(Boolean);

  // Generate audit findings
  const audit = convertAuditFindings(model);

  // Compute stats from the accessibility tree
  const stats = countStats(model.root);

  return { nvda, jaws, voiceover, narrator, audit, stats };
}
