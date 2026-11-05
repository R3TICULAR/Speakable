/**
 * Prediction bridge: turn an element's HTML into Speakable's predicted
 * screen-reader output, for one reader.
 *
 * Uses Speakable's public pipeline (parser → tree-builder → renderer). No
 * screen reader or Guidepup is involved — this is the fast, cross-platform
 * prediction path that runs on every commit.
 */
import { parseHTML } from '@reticular/speakable';
import { buildAccessibilityTree } from '@reticular/speakable';
import { renderNVDA, renderVoiceOver } from '@reticular/speakable';
import type { AccessibleNode, AnnouncementModel } from '@reticular/speakable';

export type Reader = 'voiceover' | 'nvda';

/** The semantic fields a caller can assert against. */
export interface ExpectedAnnouncement {
  role?: string;
  name?: string;
  state?: string[];
  value?: string;
}

/** Prediction result for one element: the model's primary node + rendered phrase. */
export interface Prediction {
  /** The first meaningful announced node (the element under assertion). */
  node: AccessibleNode | null;
  /** The reader-rendered phrase string, for phrase-level assertions. */
  phrase: string;
  /** The full model, for advanced callers. */
  model: AnnouncementModel;
}

function renderFor(reader: Reader, model: AnnouncementModel): string {
  return reader === 'nvda' ? renderNVDA(model, false) : renderVoiceOver(model, false);
}

/** Find the first node that carries a role or name — the element being asserted. */
function firstMeaningful(node: AccessibleNode): AccessibleNode | null {
  if (node.role !== 'generic' && (node.name || node.role)) return node;
  for (const child of node.children) {
    const found = firstMeaningful(child);
    if (found) return found;
  }
  return null;
}

/** Predict Speakable's output for a single element's HTML, for one reader. */
export function predictFromHtml(html: string, reader: Reader): Prediction {
  const { document } = parseHTML(html);
  const root = (document.body ?? document.documentElement) as unknown as Element;
  const { model } = buildAccessibilityTree(root);
  const phrase = renderFor(reader, model).split('\n').map((l) => l.trim()).filter(Boolean).join(' ');
  return { node: firstMeaningful(model.root), phrase, model };
}
