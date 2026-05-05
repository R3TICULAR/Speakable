'use client';

import { useState, useCallback } from 'react';

/**
 * Converts a DOM element's content to a simplified Markdown string.
 * Handles headings, paragraphs, code blocks, inline code, lists, links, tables, and emphasis.
 */
function htmlToMarkdown(el: HTMLElement): string {
  const lines: string[] = [];

  function walk(node: Node, context?: { listDepth?: number; ordered?: boolean; itemIndex?: number }) {
    if (node.nodeType === 3) {
      // Text node
      const text = node.textContent || '';
      if (text.trim()) lines.push(text.replace(/\s+/g, ' '));
      return;
    }

    if (node.nodeType !== 1) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Skip hidden elements, nav breadcrumbs, and buttons
    if (el.getAttribute('aria-hidden') === 'true' && tag !== 'span') return;
    if (tag === 'nav') return;
    if (tag === 'button') return;
    if (tag === 'svg') return;

    switch (tag) {
      case 'h1':
        lines.push(`\n# ${getTextContent(el)}\n`);
        break;
      case 'h2':
        lines.push(`\n## ${getTextContent(el)}\n`);
        break;
      case 'h3':
        lines.push(`\n### ${getTextContent(el)}\n`);
        break;
      case 'h4':
        lines.push(`\n#### ${getTextContent(el)}\n`);
        break;
      case 'h5':
        lines.push(`\n##### ${getTextContent(el)}\n`);
        break;
      case 'h6':
        lines.push(`\n###### ${getTextContent(el)}\n`);
        break;
      case 'p':
        lines.push(`\n${getInlineContent(el)}\n`);
        break;
      case 'pre': {
        const code = el.querySelector('code');
        const text = code ? code.textContent || '' : el.textContent || '';
        lines.push(`\n\`\`\`\n${text.trim()}\n\`\`\`\n`);
        break;
      }
      case 'code': {
        // Only handle inline code (not inside pre)
        if (el.parentElement?.tagName.toLowerCase() !== 'pre') {
          lines.push(`\`${el.textContent || ''}\``);
        }
        break;
      }
      case 'ul':
      case 'ol': {
        lines.push('');
        const items = el.querySelectorAll(':scope > li');
        items.forEach((li, i) => {
          const prefix = tag === 'ol' ? `${i + 1}. ` : '- ';
          const depth = context?.listDepth || 0;
          const indent = '  '.repeat(depth);
          lines.push(`${indent}${prefix}${getInlineContent(li as HTMLElement)}`);
        });
        lines.push('');
        break;
      }
      case 'table': {
        const rows = el.querySelectorAll('tr');
        if (rows.length === 0) break;
        lines.push('');
        rows.forEach((row, rowIdx) => {
          const cells = row.querySelectorAll('th, td');
          const cellTexts = Array.from(cells).map(c => (c.textContent || '').trim());
          lines.push(`| ${cellTexts.join(' | ')} |`);
          if (rowIdx === 0) {
            lines.push(`| ${cellTexts.map(() => '---').join(' | ')} |`);
          }
        });
        lines.push('');
        break;
      }
      case 'a': {
        const href = el.getAttribute('href') || '';
        const text = getTextContent(el);
        if (href && text) {
          lines.push(`[${text}](${href})`);
        } else {
          lines.push(text);
        }
        break;
      }
      case 'strong':
      case 'b':
        lines.push(`**${getTextContent(el)}**`);
        break;
      case 'em':
      case 'i':
        lines.push(`*${getTextContent(el)}*`);
        break;
      case 'br':
        lines.push('\n');
        break;
      case 'hr':
        lines.push('\n---\n');
        break;
      case 'div':
      case 'section':
      case 'article':
      case 'main':
      case 'header':
      case 'footer':
      case 'aside':
      case 'span':
      case 'label':
      case 'td':
      case 'th':
      case 'li':
      case 'figcaption':
      case 'figure':
      case 'blockquote':
      default:
        // Recurse into children
        for (const child of Array.from(el.childNodes)) {
          walk(child, context);
        }
        break;
    }
  }

  function getTextContent(el: HTMLElement): string {
    return (el.textContent || '').trim().replace(/\s+/g, ' ');
  }

  function getInlineContent(el: HTMLElement): string {
    let result = '';
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === 3) {
        result += child.textContent || '';
      } else if (child.nodeType === 1) {
        const childEl = child as HTMLElement;
        const childTag = childEl.tagName.toLowerCase();
        if (childTag === 'code') {
          result += `\`${childEl.textContent || ''}\``;
        } else if (childTag === 'strong' || childTag === 'b') {
          result += `**${childEl.textContent || ''}**`;
        } else if (childTag === 'em' || childTag === 'i') {
          result += `*${childEl.textContent || ''}*`;
        } else if (childTag === 'a') {
          const href = childEl.getAttribute('href') || '';
          const text = (childEl.textContent || '').trim();
          result += href ? `[${text}](${href})` : text;
        } else if (childTag === 'br') {
          result += '\n';
        } else {
          result += childEl.textContent || '';
        }
      }
    }
    return result.trim().replace(/\s+/g, ' ');
  }

  for (const child of Array.from(el.childNodes)) {
    walk(child);
  }

  // Clean up excessive newlines
  return lines
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function CopyMarkdownButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const contentEl = document.getElementById('docs-content');
    if (!contentEl) return;

    const markdown = htmlToMarkdown(contentEl);

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = markdown;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy page content as Markdown"
      title="Copy as Markdown — paste into your LLM"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
    >
      <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden="true">
        {copied ? 'check' : 'content_copy'}
      </span>
      {copied ? 'Copied!' : 'Copy as Markdown'}
    </button>
  );
}
