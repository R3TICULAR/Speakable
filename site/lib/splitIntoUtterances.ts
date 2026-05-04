/**
 * Splits screen reader output text into a queue of speakable utterances.
 *
 * For single-reader output: splits by newline, each line becomes one utterance.
 * For "All" mode output: detects section headers (=== NVDA ===, --- JAWS ---),
 * inserts a spoken header announcement, and uses longer pauses between sections.
 */

export interface QueuedUtterance {
  /** The text content for this utterance */
  text: string;
  /** Pause duration (ms) to wait AFTER this utterance finishes */
  pauseAfterMs: number;
  /** Whether this is a section header (e.g., "NVDA output") */
  isHeader: boolean;
}

const HEADER_PATTERN = /^[=-]{3}\s*(.+?)\s*[=-]{3}$/;

/**
 * Splits screen reader output text into an ordered queue of utterances.
 *
 * @param text - The raw screen reader output text
 * @param linePauseMs - Pause between regular lines (default 300)
 * @param sectionPauseMs - Pause after section headers (default 600)
 * @returns Ordered array of QueuedUtterance objects
 */
export function splitIntoUtterances(
  text: string,
  linePauseMs: number = 300,
  sectionPauseMs: number = 600
): QueuedUtterance[] {
  if (!text || !text.trim()) {
    return [];
  }

  const lines = text.split('\n');
  const queue: QueuedUtterance[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = HEADER_PATTERN.exec(trimmed);
    if (match) {
      queue.push({
        text: `${match[1]} output`,
        pauseAfterMs: sectionPauseMs,
        isHeader: true,
      });
    } else {
      queue.push({
        text: trimmed,
        pauseAfterMs: linePauseMs,
        isHeader: false,
      });
    }
  }

  // Last utterance gets no trailing pause
  if (queue.length > 0) {
    queue[queue.length - 1].pauseAfterMs = 0;
  }

  return queue;
}
