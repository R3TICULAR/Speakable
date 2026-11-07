/**
 * Corpus manifest loader + validator.
 *
 * Loads bench/corpus/manifest.json and validates it before any stage runs:
 *   - unique ids
 *   - every referenced file exists
 *   - static cases have interaction === null
 *   - runtime cases have an interaction (pattern or actions)
 *
 * Fails fast with a descriptive error naming the offending case id.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { ManifestEntry } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Absolute path to bench/corpus/. */
export const CORPUS_DIR = resolve(__dirname, '..', 'corpus');
/** Absolute path to the manifest. */
export const MANIFEST_PATH = join(CORPUS_DIR, 'manifest.json');

export class ManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManifestError';
  }
}

function validateEntry(entry: ManifestEntry, index: number): void {
  const where = entry?.id ? `case "${entry.id}"` : `entry at index ${index}`;

  if (!entry || typeof entry !== 'object') {
    throw new ManifestError(`Manifest ${where} is not an object.`);
  }
  for (const field of ['id', 'category', 'file', 'mode', 'notes'] as const) {
    if (typeof entry[field] !== 'string' || entry[field].length === 0) {
      throw new ManifestError(`Manifest ${where} is missing required string field "${field}".`);
    }
  }
  if (entry.mode !== 'static' && entry.mode !== 'runtime') {
    throw new ManifestError(`Manifest ${where} has invalid mode "${entry.mode}" (expected "static" or "runtime").`);
  }

  // mode / interaction consistency
  if (entry.mode === 'static' && entry.interaction !== null) {
    throw new ManifestError(`Manifest ${where} is static but has a non-null interaction.`);
  }
  if (entry.mode === 'runtime') {
    const i = entry.interaction;
    const ok =
      i !== null &&
      typeof i === 'object' &&
      (('pattern' in i && typeof i.pattern === 'string') ||
        ('actions' in i && Array.isArray(i.actions)));
    if (!ok) {
      throw new ManifestError(
        `Manifest ${where} is runtime but has no valid interaction (expected { pattern } or { actions: [...] }).`
      );
    }
  }

  // referenced file must exist
  const abs = join(CORPUS_DIR, entry.file);
  if (!existsSync(abs)) {
    throw new ManifestError(`Manifest ${where} references a file that does not exist: ${entry.file}`);
  }
}

/**
 * Load and validate the corpus manifest.
 * @param path Optional override for the manifest path (defaults to bench/corpus/manifest.json).
 */
export function loadManifest(path: string = MANIFEST_PATH): ManifestEntry[] {
  if (!existsSync(path)) {
    throw new ManifestError(`Manifest not found at ${path}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    throw new ManifestError(`Manifest is not valid JSON: ${(err as Error).message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new ManifestError('Manifest must be a JSON array of case entries.');
  }

  const entries = parsed as ManifestEntry[];
  const seen = new Set<string>();

  entries.forEach((entry, index) => {
    validateEntry(entry, index);
    if (seen.has(entry.id)) {
      throw new ManifestError(`Manifest has duplicate id "${entry.id}".`);
    }
    seen.add(entry.id);
  });

  return entries;
}
