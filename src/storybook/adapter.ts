/**
 * Storybook Adapter - Connection and Story Discovery
 *
 * Connects to a running Storybook instance, discovers available stories,
 * and filters them by component name glob patterns. Supports Storybook 7.x
 * and 8.x stories index formats.
 */

// --- Public Types ---

export interface StorybookAdapterOptions {
  /** Base URL of the running Storybook instance (e.g., "http://localhost:6006") */
  url: string;
  /** Glob pattern to filter stories by component name (supports * and ? wildcards) */
  componentFilter?: string;
  /** Authorization header value for protected Storybook instances (e.g., "Bearer <token>") */
  authHeader?: string;
  /** Custom headers to include with all requests (for cookie-based auth, API keys, etc.) */
  headers?: Record<string, string>;
  /** Skip TLS certificate verification for self-signed certs (default: false) */
  insecure?: boolean;
}

export interface StoryInfo {
  /** Unique story identifier (e.g., "button--primary") */
  id: string;
  /** Component name extracted from the story title (e.g., "Button") */
  componentName: string;
  /** Individual story name (e.g., "Primary") */
  storyName: string;
  /** Whether the story has an associated play function (interaction test) */
  hasPlayFunction: boolean;
}

export interface StorybookAdapter {
  /** Connect to the Storybook instance and fetch the stories index */
  connect(): Promise<void>;
  /** Parse the fetched index and return discovered stories (filtered if componentFilter is set) */
  discoverStories(): Promise<StoryInfo[]>;
  /** Cleanup (no-op for now, reserved for future resource release) */
  disconnect(): void;
}

// --- Internal Types for Storybook Index Formats ---

/**
 * Storybook 7.x/8.x index format (index.json).
 * Both versions use entries keyed by story ID.
 */
interface StorybookIndexV4 {
  v: number;
  entries: Record<string, StorybookIndexEntry>;
}

/**
 * Older Storybook format (stories.json).
 * Uses a flat "stories" record.
 */
interface StorybookStoriesJson {
  v?: number;
  stories: Record<string, StorybookLegacyEntry>;
}

interface StorybookIndexEntry {
  id: string;
  title: string;
  name: string;
  type?: 'story' | 'docs' | 'component';
  tags?: string[];
  /** Storybook 8.x may include importPath */
  importPath?: string;
}

interface StorybookLegacyEntry {
  id: string;
  kind?: string;
  title?: string;
  name: string;
  story?: string;
  parameters?: {
    __isArgsStory?: boolean;
    [key: string]: unknown;
  };
}

// --- Errors ---

export class StorybookConnectionError extends Error {
  constructor(
    public readonly url: string,
    public readonly reason: string
  ) {
    super(`Failed to connect to Storybook at ${url}: ${reason}`);
    this.name = 'StorybookConnectionError';
  }
}

export class StorybookIndexError extends Error {
  constructor(
    public readonly url: string,
    public readonly reason: string
  ) {
    super(
      `Failed to read stories index from ${url}: ${reason}. ` +
        'The Storybook version may be unsupported (requires Storybook 7.x or 8.x).'
    );
    this.name = 'StorybookIndexError';
  }
}

// --- Glob Matching Utility ---

/**
 * Simple glob matcher supporting * (any sequence) and ? (single char) wildcards.
 * Matching is case-insensitive.
 */
export function globMatch(pattern: string, value: string): boolean {
  const regex = globToRegex(pattern);
  return regex.test(value);
}

function globToRegex(pattern: string): RegExp {
  let regexStr = '^';
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    switch (ch) {
      case '*':
        regexStr += '.*';
        break;
      case '?':
        regexStr += '.';
        break;
      case '.':
      case '(':
      case ')':
      case '+':
      case '{':
      case '}':
      case '[':
      case ']':
      case '^':
      case '$':
      case '|':
      case '\\':
        regexStr += '\\' + ch;
        break;
      default:
        regexStr += ch;
    }
  }
  regexStr += '$';
  return new RegExp(regexStr, 'i');
}

// --- Adapter Factory ---

export function createStorybookAdapter(options: StorybookAdapterOptions): StorybookAdapter {
  const { url, componentFilter, authHeader, headers: customHeaders, insecure } = options;
  const normalizedUrl = url.replace(/\/$/, '');

  // Build request headers from options
  const requestHeaders: Record<string, string> = { ...customHeaders };
  if (authHeader) {
    requestHeaders['Authorization'] = authHeader;
  }

  // Set NODE_TLS_REJECT_UNAUTHORIZED for insecure mode
  if (insecure && typeof process !== 'undefined') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  let indexData: StorybookIndexV4 | StorybookStoriesJson | null = null;

  return {
    async connect(): Promise<void> {
      indexData = await fetchStoriesIndex(normalizedUrl, requestHeaders);
    },

    async discoverStories(): Promise<StoryInfo[]> {
      if (!indexData) {
        throw new StorybookConnectionError(
          normalizedUrl,
          'Not connected. Call connect() before discoverStories().'
        );
      }

      const stories = parseIndex(indexData);

      if (componentFilter) {
        return stories.filter((story) => globMatch(componentFilter, story.componentName));
      }

      return stories;
    },

    disconnect(): void {
      indexData = null;
    },
  };
}

// --- Internal Helpers ---

/**
 * Fetch the stories index from a Storybook instance.
 * Tries index.json (Storybook 7+) first, falls back to stories.json.
 */
async function fetchStoriesIndex(
  baseUrl: string,
  headers?: Record<string, string>
): Promise<StorybookIndexV4 | StorybookStoriesJson> {
  const fetchOptions: RequestInit = headers && Object.keys(headers).length > 0
    ? { headers }
    : {};

  // Try Storybook 7+/8.x index.json first
  const indexUrl = `${baseUrl}/index.json`;
  try {
    const response = await fetch(indexUrl, fetchOptions);
    if (response.ok) {
      const data = (await response.json()) as StorybookIndexV4 | StorybookStoriesJson;
      return data;
    }
  } catch (error: unknown) {
    // index.json not available, try fallback
    const message = error instanceof Error ? error.message : String(error);
    // Only throw if it's a network-level failure (not a 404)
    if (isNetworkError(message)) {
      throw new StorybookConnectionError(baseUrl, message);
    }
  }

  // Fallback: try stories.json (older Storybook format)
  const storiesUrl = `${baseUrl}/stories.json`;
  try {
    const response = await fetch(storiesUrl, fetchOptions);
    if (response.ok) {
      const data = (await response.json()) as StorybookStoriesJson;
      return data;
    }
    // Both endpoints returned non-OK
    throw new StorybookIndexError(
      baseUrl,
      `Neither index.json nor stories.json returned a valid response`
    );
  } catch (error: unknown) {
    if (error instanceof StorybookIndexError || error instanceof StorybookConnectionError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new StorybookConnectionError(baseUrl, message);
  }
}

/**
 * Parse a Storybook index (either v4 entries format or legacy stories format)
 * into a normalized StoryInfo array.
 */
function parseIndex(data: StorybookIndexV4 | StorybookStoriesJson): StoryInfo[] {
  // Storybook 7.x/8.x format: has "entries" property
  if ('entries' in data && data.entries) {
    return parseEntriesFormat(data as StorybookIndexV4);
  }

  // Legacy format: has "stories" property
  if ('stories' in data && data.stories) {
    return parseLegacyFormat(data as StorybookStoriesJson);
  }

  return [];
}

/**
 * Parse Storybook 7.x/8.x entries format.
 * Entries use { id, title, name, type, tags } structure.
 */
function parseEntriesFormat(data: StorybookIndexV4): StoryInfo[] {
  const stories: StoryInfo[] = [];

  for (const entry of Object.values(data.entries)) {
    // Skip docs-only entries
    if (entry.type === 'docs') {
      continue;
    }

    const componentName = extractComponentName(entry.title);
    const hasPlayFunction = entry.tags?.includes('play-fn') ?? false;

    stories.push({
      id: entry.id,
      componentName,
      storyName: entry.name,
      hasPlayFunction,
    });
  }

  return stories;
}

/**
 * Parse legacy Storybook stories.json format.
 * Uses { id, kind/title, name/story } structure.
 */
function parseLegacyFormat(data: StorybookStoriesJson): StoryInfo[] {
  const stories: StoryInfo[] = [];

  for (const entry of Object.values(data.stories)) {
    // "kind" is the older field name for component grouping, "title" is newer
    const title = entry.title ?? entry.kind ?? '';
    const componentName = extractComponentName(title);
    const storyName = entry.name ?? entry.story ?? '';

    stories.push({
      id: entry.id,
      componentName,
      storyName,
      hasPlayFunction: false, // Legacy format doesn't expose play function info
    });
  }

  return stories;
}

/**
 * Extract the component name from a Storybook title path.
 * Storybook titles use "/" separators (e.g., "Components/Button" → "Button").
 * Returns the last segment.
 */
function extractComponentName(title: string): string {
  const parts = title.split('/');
  return parts[parts.length - 1].trim();
}

/**
 * Detect network-level errors (connection refused, DNS failure, etc.)
 * vs HTTP-level errors (404, 500, etc.).
 */
function isNetworkError(message: string): boolean {
  const networkPatterns = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    'fetch failed',
    'network',
    'Failed to fetch',
    'unable to connect',
  ];
  const lower = message.toLowerCase();
  return networkPatterns.some((pattern) => lower.includes(pattern.toLowerCase()));
}
