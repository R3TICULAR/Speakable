/**
 * Browser-side accessibility analyzer for the Storybook addon.
 *
 * This module is now a thin compatibility shim over the shared,
 * transport-agnostic browser bundle in `src/browser`. The analysis
 * pipeline lives there so the addon, the iframe harness, and the
 * browser extension all share a single source of truth.
 */

import { analyzeElement } from '../../src/browser/analyze';
import type { AnalysisResult, AuditFinding } from '../../src/browser/analyze';

export type { AnalysisResult, AuditFinding };

/**
 * Analyze a live DOM element using the core Speakable engine.
 * Returns differentiated per-reader output.
 *
 * @deprecated Prefer importing `analyzeElement` from `src/browser`.
 * Retained for backward compatibility within the addon.
 */
export function analyzeDOM(root: Element): AnalysisResult {
  return analyzeElement(root);
}
