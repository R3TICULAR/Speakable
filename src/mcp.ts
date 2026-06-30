#!/usr/bin/env node
/**
 * Speakable MCP Server
 *
 * Model Context Protocol server that exposes Speakable's accessibility
 * analysis engine as tools for AI assistants.
 *
 * Tools:
 *   - analyze_html: Predict screen reader output for HTML
 *   - audit_html: Generate accessibility audit report
 *   - diff_html: Compare two HTML snippets for accessibility changes
 *
 * Usage:
 *   npx @reticular/speakable --mcp
 *   # or directly:
 *   speakable-mcp
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { parseHTML } from './parser/index.js';
import { buildAccessibilityTree, buildAccessibilityTreeWithSelector } from './extractor/index.js';
import { renderNVDA } from './renderer/nvda-renderer.js';
import { renderJAWS } from './renderer/jaws-renderer.js';
import { renderVoiceOver } from './renderer/voiceover-renderer.js';
import { renderNarrator } from './renderer/narrator-renderer.js';
import { renderAuditReport } from './renderer/audit-renderer.js';
import { diffAccessibilityTrees, formatDiffAsText } from './diff/index.js';
import { analyzeVerbosity, formatVerbosityReport } from './runtime/verbosity-analyzer.js';
import type { AnnouncementModel } from './model/types.js';
import type { AccessibilityEvent } from './runtime/types.js';

// --- Helpers ---

type ScreenReader = 'nvda' | 'jaws' | 'voiceover' | 'narrator' | 'all';

function renderOutput(model: AnnouncementModel, screenReader: ScreenReader): string {
  if (screenReader === 'all') {
    return [
      '--- NVDA ---',
      renderNVDA(model),
      '',
      '--- JAWS ---',
      renderJAWS(model),
      '',
      '--- VoiceOver ---',
      renderVoiceOver(model),
      '',
      '--- Narrator ---',
      renderNarrator(model),
    ].join('\n');
  }

  switch (screenReader) {
    case 'nvda': return renderNVDA(model);
    case 'jaws': return renderJAWS(model);
    case 'voiceover': return renderVoiceOver(model);
    case 'narrator': return renderNarrator(model);
  }
}

function analyzeHTML(html: string, screenReader: ScreenReader, selector?: string) {
  const { document, warnings: parseWarnings } = parseHTML(html);
  const body = document.body;

  if (!body) {
    return { output: '', warnings: ['Document has no body element.'], model: null };
  }

  const warnings: string[] = parseWarnings.map((w: { message: string }) => w.message);

  if (selector) {
    const results = buildAccessibilityTreeWithSelector(body, selector);
    for (const r of results) {
      warnings.push(...r.warnings.map((w: { message: string }) => w.message));
    }

    const outputs = results.map((r, i) => {
      const prefix = results.length > 1 ? `=== Element ${i + 1} ===\n` : '';
      return prefix + renderOutput(r.model, screenReader);
    });

    return { output: outputs.join('\n\n'), warnings, model: results[0]?.model || null };
  }

  const { model, warnings: treeWarnings } = buildAccessibilityTree(body);
  warnings.push(...treeWarnings.map((w: { message: string }) => w.message));

  return { output: renderOutput(model, screenReader), warnings, model };
}

// --- MCP Server ---

const server = new McpServer({
  name: 'speakable',
  version: '1.0.0',
});

// Tool: analyze_html
server.tool(
  'analyze_html',
  'Predict how screen readers (NVDA, JAWS, VoiceOver, Narrator) will announce HTML content. Returns the predicted speech output line by line.',
  {
    html: z.string().describe('The HTML content to analyze'),
    screen_reader: z.enum(['nvda', 'jaws', 'voiceover', 'narrator', 'all']).default('all').describe('Which screen reader to simulate (default: all)'),
    selector: z.string().optional().describe('Optional CSS selector to focus analysis on specific elements'),
  },
  async ({ html, screen_reader, selector }) => {
    try {
      const { output, warnings } = analyzeHTML(html, screen_reader, selector);
      const warningText = warnings.length > 0 ? `\n\nWarnings:\n${warnings.join('\n')}` : '';
      return {
        content: [{ type: 'text', text: output + warningText }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Tool: audit_html
server.tool(
  'audit_html',
  'Generate an accessibility audit report for HTML content. Reports landmark structure, heading hierarchy, interactive elements, missing names, and issues with severity levels.',
  {
    html: z.string().describe('The HTML content to audit'),
    selector: z.string().optional().describe('Optional CSS selector to focus audit on specific elements'),
  },
  async ({ html, selector }) => {
    try {
      const { document, warnings: parseWarnings } = parseHTML(html);
      const body = document.body;

      if (!body) {
        return {
          content: [{ type: 'text', text: 'Error: Document has no body element.' }],
          isError: true,
        };
      }

      let model: AnnouncementModel;
      const warnings: string[] = parseWarnings.map((w: { message: string }) => w.message);

      if (selector) {
        const results = buildAccessibilityTreeWithSelector(body, selector);
        for (const r of results) {
          warnings.push(...r.warnings.map((w: { message: string }) => w.message));
        }
        if (results.length === 0) {
          return {
            content: [{ type: 'text', text: `No elements found matching selector: ${selector}` }],
          };
        }
        model = results[0].model;
      } else {
        const result = buildAccessibilityTree(body);
        warnings.push(...result.warnings.map((w: { message: string }) => w.message));
        model = result.model;
      }

      const audit = renderAuditReport(model);
      const warningText = warnings.length > 0 ? `\n\nParser warnings:\n${warnings.join('\n')}` : '';

      return {
        content: [{ type: 'text', text: audit + warningText }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Tool: diff_html
server.tool(
  'diff_html',
  'Compare two HTML versions and report accessibility changes. Shows added, removed, and changed nodes in the accessibility tree — useful for detecting regressions.',
  {
    before_html: z.string().describe('The original (before) HTML content'),
    after_html: z.string().describe('The updated (after) HTML content'),
    selector: z.string().optional().describe('Optional CSS selector to focus diff on specific elements'),
  },
  async ({ before_html, after_html, selector }) => {
    try {
      const beforeDoc = parseHTML(before_html);
      const afterDoc = parseHTML(after_html);

      if (!beforeDoc.document.body || !afterDoc.document.body) {
        return {
          content: [{ type: 'text', text: 'Error: One or both documents have no body element.' }],
          isError: true,
        };
      }

      let beforeModel: AnnouncementModel;
      let afterModel: AnnouncementModel;

      if (selector) {
        const beforeResults = buildAccessibilityTreeWithSelector(beforeDoc.document.body, selector);
        const afterResults = buildAccessibilityTreeWithSelector(afterDoc.document.body, selector);
        if (beforeResults.length === 0 || afterResults.length === 0) {
          return {
            content: [{ type: 'text', text: `No elements found matching selector: ${selector}` }],
          };
        }
        beforeModel = beforeResults[0].model;
        afterModel = afterResults[0].model;
      } else {
        beforeModel = buildAccessibilityTree(beforeDoc.document.body).model;
        afterModel = buildAccessibilityTree(afterDoc.document.body).model;
      }

      const diff = diffAccessibilityTrees(beforeModel.root, afterModel.root);

      if (diff.changes.length === 0) {
        return {
          content: [{ type: 'text', text: 'No accessibility changes detected between the two versions.' }],
        };
      }

      const summary = `+${diff.summary.added} added  -${diff.summary.removed} removed  ~${diff.summary.changed} changed\n\n`;
      const diffText = formatDiffAsText(diff);

      return {
        content: [{ type: 'text', text: summary + diffText }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Tool: analyze_verbosity
server.tool(
  'analyze_verbosity',
  'Detect redundant and duplicate screen reader announcements in a sequence of accessibility events. Identifies patterns like simultaneous aria-selected + live region updates that cause VoiceOver to read the same content 2-3 times. Provides specific remediation steps and affected screen readers.',
  {
    events: z.array(z.object({
      type: z.string().describe('Event type: STATE_CHANGED, ANNOUNCEMENT, FOCUS_CHANGED, ACCESSIBLE_NAME_CHANGED, etc.'),
      timestamp: z.number().describe('Milliseconds since session start'),
      target: z.object({
        role: z.string().describe('ARIA role of the target element'),
        accessibleName: z.string().describe('Computed accessible name'),
        selector: z.string().describe('CSS selector for the element'),
      }),
      payload: z.record(z.unknown()).describe('Event payload (kind field discriminates type)'),
    })).describe('Chronologically ordered accessibility events (from runtime engine or manual capture)'),
    interaction_frame_window: z.number().optional().describe('Time window (ms) to group related events into a single interaction (default: 150)'),
  },
  async ({ events, interaction_frame_window }) => {
    try {
      const config = interaction_frame_window ? { interactionFrameWindow: interaction_frame_window } : undefined;
      const report = analyzeVerbosity(events as AccessibilityEvent[], config);
      const output = formatVerbosityReport(report);
      return {
        content: [{ type: 'text', text: output }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// --- Start server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Speakable MCP server error:', error);
  process.exit(1);
});
