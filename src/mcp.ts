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
import { serializeModel } from './model/serialization.js';
import { renderNVDA } from './renderer/nvda-renderer.js';
import { renderJAWS } from './renderer/jaws-renderer.js';
import { renderVoiceOver } from './renderer/voiceover-renderer.js';
import { renderAuditReport } from './renderer/audit-renderer.js';
import { diffAccessibilityTrees, formatDiffAsText } from './diff/index.js';
import type { AnnouncementModel } from './model/types.js';

// --- Helpers ---

type ScreenReader = 'nvda' | 'jaws' | 'voiceover' | 'all';

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
    ].join('\n');
  }

  switch (screenReader) {
    case 'nvda': return renderNVDA(model);
    case 'jaws': return renderJAWS(model);
    case 'voiceover': return renderVoiceOver(model);
  }
}

function analyzeHTML(html: string, screenReader: ScreenReader, selector?: string) {
  const { document, warnings: parseWarnings } = parseHTML(html);
  const body = document.body;

  if (!body) {
    return { output: '', warnings: ['Document has no body element.'], model: null };
  }

  const warnings = parseWarnings.map(w => w.message);

  if (selector) {
    const { models, warnings: treeWarnings } = buildAccessibilityTreeWithSelector(body, selector);
    warnings.push(...treeWarnings.map(w => w.message));

    const outputs = models.map((m, i) => {
      const prefix = models.length > 1 ? `=== Element ${i + 1} ===\n` : '';
      return prefix + renderOutput(m, screenReader);
    });

    return { output: outputs.join('\n\n'), warnings, model: models[0] || null };
  }

  const { model, warnings: treeWarnings } = buildAccessibilityTree(body);
  warnings.push(...treeWarnings.map(w => w.message));

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
  'Predict how screen readers (NVDA, JAWS, VoiceOver) will announce HTML content. Returns the predicted speech output line by line.',
  {
    html: z.string().describe('The HTML content to analyze'),
    screen_reader: z.enum(['nvda', 'jaws', 'voiceover', 'all']).default('all').describe('Which screen reader to simulate (default: all)'),
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
      const warnings = parseWarnings.map(w => w.message);

      if (selector) {
        const { models, warnings: treeWarnings } = buildAccessibilityTreeWithSelector(body, selector);
        warnings.push(...treeWarnings.map(w => w.message));
        if (models.length === 0) {
          return {
            content: [{ type: 'text', text: `No elements found matching selector: ${selector}` }],
          };
        }
        model = models[0];
      } else {
        const result = buildAccessibilityTree(body);
        warnings.push(...result.warnings.map(w => w.message));
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
        const beforeResult = buildAccessibilityTreeWithSelector(beforeDoc.document.body, selector);
        const afterResult = buildAccessibilityTreeWithSelector(afterDoc.document.body, selector);
        if (beforeResult.models.length === 0 || afterResult.models.length === 0) {
          return {
            content: [{ type: 'text', text: `No elements found matching selector: ${selector}` }],
          };
        }
        beforeModel = beforeResult.models[0];
        afterModel = afterResult.models[0];
      } else {
        beforeModel = buildAccessibilityTree(beforeDoc.document.body).model;
        afterModel = buildAccessibilityTree(afterDoc.document.body).model;
      }

      const diff = diffAccessibilityTrees(beforeModel, afterModel);

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

// --- Start server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Speakable MCP server error:', error);
  process.exit(1);
});
