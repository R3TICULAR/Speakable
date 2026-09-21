/**
 * Iframe harness — parent-page controller.
 *
 * Runs in a parent page, mounts a component (URL or HTML string) into an
 * iframe, injects the browser bundle, and drives analysis/capture over
 * `postMessage`. This is the Storybook-independent runtime testing surface.
 */

import type { AnalysisResult } from '../browser/analyze.js';
import type { AccessibilityTimeline } from '../runtime/types.js';
import {
  HARNESS_CHANNEL,
  isHarnessReady,
  isHarnessResponse,
  type HarnessResponse,
  type SerializableCaptureOptions,
} from './protocol.js';

export interface HarnessOptions {
  /** An existing iframe to drive, or a container to create one inside. */
  target: HTMLIFrameElement | { container: HTMLElement };
  /** Load + inject + request timeout in ms (default: 10000). */
  timeoutMs?: number;
  /** Origins allowed for postMessage. Defaults to same-origin only. */
  allowedOrigins?: string[];
  /**
   * URL to the injectable IIFE bundle. When omitted, the harness assumes the
   * bundle is already present in the iframe (e.g. bundled into the page).
   */
  bundleUrl?: string;
}

export type LoadSource = { url: string } | { html: string };

export interface Harness {
  load(source: LoadSource): Promise<void>;
  analyze(selector?: string): Promise<AnalysisResult>;
  captureTimeline(options: SerializableCaptureOptions): Promise<AccessibilityTimeline>;
  destroy(): void;
}

const DEFAULT_TIMEOUT = 10000;

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `req-${Date.now()}-${idCounter}`;
}

function isCrossOrigin(url: string): boolean {
  try {
    const resolved = new URL(url, window.location.href);
    return resolved.origin !== window.location.origin;
  } catch {
    // Relative or malformed — treat as same-origin.
    return false;
  }
}

export function createHarness(options: HarnessOptions): Harness {
  const { timeoutMs = DEFAULT_TIMEOUT, allowedOrigins, bundleUrl } = options;

  // Resolve or create the iframe.
  let ownsIframe = false;
  let iframe: HTMLIFrameElement;
  if (options.target instanceof HTMLIFrameElement) {
    iframe = options.target;
  } else {
    iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'speakable-harness');
    options.target.container.appendChild(iframe);
    ownsIframe = true;
  }

  const pending = new Map<
    string,
    { resolve: (r: HarnessResponse) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }
  >();

  function onMessage(event: MessageEvent) {
    // Only accept messages originating from our iframe's window.
    if (event.source !== iframe.contentWindow) return;
    if (allowedOrigins && allowedOrigins.length > 0 && !allowedOrigins.includes('*')) {
      if (!allowedOrigins.includes(event.origin)) return;
    }
    const data = event.data;
    if (!isHarnessResponse(data)) return;
    const entry = pending.get(data.id);
    if (!entry) return;
    clearTimeout(entry.timer);
    pending.delete(data.id);
    entry.resolve(data);
  }

  window.addEventListener('message', onMessage);

  function targetOrigin(): string {
    if (allowedOrigins && allowedOrigins.includes('*')) return '*';
    try {
      return iframe.contentWindow ? new URL(iframe.src || window.location.href).origin : '*';
    } catch {
      return '*';
    }
  }

  function request(payload: Record<string, unknown>): Promise<HarnessResponse> {
    const id = nextId();
    const win = iframe.contentWindow;
    if (!win) {
      return Promise.reject(new Error('Harness iframe has no content window; call load() first.'));
    }
    return new Promise<HarnessResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Harness request "${payload.kind}" timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      win.postMessage({ channel: HARNESS_CHANNEL, id, ...payload }, targetOrigin());
    });
  }

  function waitForReady(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        window.removeEventListener('message', onReady);
        reject(new Error(`Harness bundle did not signal ready within ${timeoutMs}ms`));
      }, timeoutMs);
      function onReady(event: MessageEvent) {
        if (event.source !== iframe.contentWindow) return;
        if (!isHarnessReady(event.data)) return;
        clearTimeout(timer);
        window.removeEventListener('message', onReady);
        resolve();
      }
      window.addEventListener('message', onReady);
    });
  }

  function waitForLoad(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        iframe.removeEventListener('load', onLoad);
        reject(new Error(`Harness iframe failed to load within ${timeoutMs}ms`));
      }, timeoutMs);
      function onLoad() {
        clearTimeout(timer);
        iframe.removeEventListener('load', onLoad);
        resolve();
      }
      iframe.addEventListener('load', onLoad);
    });
  }

  function injectBundle(): void {
    const doc = iframe.contentDocument;
    if (!doc) {
      throw new Error(
        'Cannot access iframe document for bundle injection. Cross-origin content is not supported; use { html } (srcdoc) or a same-origin URL.'
      );
    }
    const script = doc.createElement('script');
    if (bundleUrl) {
      script.src = bundleUrl;
    } else {
      // No bundle URL provided and no bundle detected — surface a clear error
      // rather than hanging on waitForReady.
      const injected = (iframe.contentWindow as unknown as { __SPEAKABLE__?: unknown })?.__SPEAKABLE__;
      if (!injected) {
        throw new Error(
          'No bundleUrl provided and the iframe does not already include the Speakable bundle. Pass options.bundleUrl.'
        );
      }
      return;
    }
    doc.head?.appendChild(script) ?? doc.documentElement.appendChild(script);
  }

  return {
    async load(source: LoadSource): Promise<void> {
      // Validate before starting any timers so we don't leak a pending
      // load-wait rejection when we bail out synchronously.
      if ('url' in source && isCrossOrigin(source.url)) {
        throw new Error(
          `Cannot inject into cross-origin URL "${source.url}". Use { html } (srcdoc) or a same-origin URL.`
        );
      }

      const loaded = waitForLoad();
      if ('url' in source) {
        iframe.src = source.url;
      } else {
        iframe.srcdoc = source.html;
      }
      await loaded;

      const ready = waitForReady();
      injectBundle();
      // If the bundle was already present, it may have signaled ready before we
      // attached the listener; fall back to a short probe.
      const alreadyPresent = (iframe.contentWindow as unknown as { __SPEAKABLE__?: unknown })?.__SPEAKABLE__;
      if (alreadyPresent) return;
      await ready;
    },

    async analyze(selector?: string): Promise<AnalysisResult> {
      const res = await request({ kind: 'analyze', ...(selector && { selector }) });
      if (res.ok && res.kind === 'analyze') return res.result;
      throw new Error(res.ok ? 'Unexpected response kind' : res.error);
    },

    async captureTimeline(opts: SerializableCaptureOptions): Promise<AccessibilityTimeline> {
      const res = await request({ kind: 'capture', options: opts });
      if (res.ok && res.kind === 'capture') return res.result;
      throw new Error(res.ok ? 'Unexpected response kind' : res.error);
    },

    destroy(): void {
      window.removeEventListener('message', onMessage);
      for (const [, entry] of pending) {
        clearTimeout(entry.timer);
        entry.reject(new Error('Harness destroyed'));
      }
      pending.clear();
      if (ownsIframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    },
  };
}

export type { SerializableCaptureOptions } from './protocol.js';
