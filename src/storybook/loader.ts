/**
 * Storybook Story Loader
 *
 * Loads individual Storybook stories in an isolated jsdom context for
 * runtime accessibility analysis. Handles load timeouts, play function
 * detection, and custom viewport dimensions.
 */

import { JSDOM } from 'jsdom';

// --- Public Types ---

export interface StoryLoaderOptions {
  /** Base Storybook URL (e.g., "http://localhost:6006") */
  storybookUrl: string;
  /** Viewport dimensions (default: 1280x720) */
  viewport?: { width: number; height: number };
  /** Load timeout in ms (default: 10000) */
  loadTimeout?: number;
  /** Custom headers for authenticated Storybook instances */
  headers?: Record<string, string>;
}

export interface LoadedStory {
  /** The loaded document ready for analysis */
  document: Document;
  /** Story ID that was loaded */
  storyId: string;
  /** Whether the story has a play function */
  hasPlayFunction: boolean;
}

export interface StoryLoader {
  /** Load a story by ID and return the ready document */
  loadStory(storyId: string, hasPlayFunction?: boolean): Promise<LoadedStory>;
  /** Release resources */
  destroy(): void;
}

// --- Errors ---

export class StoryLoadError extends Error {
  constructor(
    public readonly storyId: string,
    public readonly reason: string
  ) {
    super(`Failed to load story "${storyId}": ${reason}`);
    this.name = 'StoryLoadError';
  }
}

export class StoryLoadTimeoutError extends StoryLoadError {
  constructor(storyId: string, timeoutMs: number) {
    super(storyId, `Story did not load within ${timeoutMs}ms`);
    this.name = 'StoryLoadTimeoutError';
  }
}

// --- Constants ---

const DEFAULT_VIEWPORT = { width: 1280, height: 720 };
const DEFAULT_LOAD_TIMEOUT = 10000;

// --- Factory ---

export function createStoryLoader(options: StoryLoaderOptions): StoryLoader {
  const { storybookUrl, viewport = DEFAULT_VIEWPORT, loadTimeout = DEFAULT_LOAD_TIMEOUT, headers } =
    options;
  const normalizedUrl = storybookUrl.replace(/\/$/, '');

  let destroyed = false;

  return {
    async loadStory(storyId: string, hasPlayFunction = false): Promise<LoadedStory> {
      if (destroyed) {
        throw new StoryLoadError(storyId, 'Loader has been destroyed');
      }

      const iframeUrl = buildStoryIframeUrl(normalizedUrl, storyId);
      const html = await fetchStoryHtml(iframeUrl, storyId, loadTimeout, headers);
      const document = parseStoryHtml(html, iframeUrl, viewport);

      await waitForStoryReady(document, storyId, loadTimeout);

      return {
        document,
        storyId,
        hasPlayFunction,
      };
    },

    destroy(): void {
      destroyed = true;
    },
  };
}

// --- Internal Helpers ---

/**
 * Build the Storybook iframe URL for a given story ID.
 * Uses the standard Storybook iframe format with viewMode=story.
 */
function buildStoryIframeUrl(baseUrl: string, storyId: string): string {
  return `${baseUrl}/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`;
}

/**
 * Fetch the story iframe HTML content with timeout handling.
 */
async function fetchStoryHtml(
  url: string,
  storyId: string,
  timeoutMs: number,
  headers?: Record<string, string>
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions: RequestInit = { signal: controller.signal };
  if (headers && Object.keys(headers).length > 0) {
    fetchOptions.headers = headers;
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new StoryLoadError(
        storyId,
        `HTTP ${response.status} ${response.statusText} from ${url}`
      );
    }

    return await response.text();
  } catch (error: unknown) {
    if (error instanceof StoryLoadError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('abort') || message.includes('AbortError')) {
      throw new StoryLoadTimeoutError(storyId, timeoutMs);
    }

    throw new StoryLoadError(storyId, message);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parse story HTML into a jsdom Document with the specified viewport dimensions.
 */
function parseStoryHtml(
  html: string,
  url: string,
  viewport: { width: number; height: number }
): Document {
  const dom = new JSDOM(html, {
    url,
    contentType: 'text/html',
    pretendToBeVisual: true,
  });

  // Apply viewport dimensions to the jsdom window
  Object.defineProperty(dom.window, 'innerWidth', { value: viewport.width });
  Object.defineProperty(dom.window, 'innerHeight', { value: viewport.height });

  return dom.window.document;
}

/**
 * Wait for the story document to be ready for analysis.
 * A story is considered ready when the body exists and has meaningful content
 * (at least one child element or text node).
 */
async function waitForStoryReady(
  document: Document,
  storyId: string,
  timeoutMs: number
): Promise<void> {
  const startTime = Date.now();
  const pollInterval = 50;

  while (Date.now() - startTime < timeoutMs) {
    if (isStoryReady(document)) {
      return;
    }
    await sleep(pollInterval);
  }

  throw new StoryLoadTimeoutError(storyId, timeoutMs);
}

/**
 * Check if the story document has rendered content.
 * The document is ready when the body has child elements or non-empty text content.
 */
function isStoryReady(document: Document): boolean {
  const body = document.body;
  if (!body) {
    return false;
  }

  // Check for child elements (rendered components)
  if (body.children.length > 0) {
    return true;
  }

  // Check for text content (simple text-only stories)
  if (body.textContent && body.textContent.trim().length > 0) {
    return true;
  }

  return false;
}

/**
 * Utility sleep function for polling.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
