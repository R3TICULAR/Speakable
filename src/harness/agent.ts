/**
 * In-iframe harness agent.
 *
 * Bundled into the injectable IIFE. Runs inside the target iframe, listens
 * for harness requests over `postMessage`, validates their origin/source,
 * dispatches them to the browser bundle, and posts correlated responses.
 */

import { analyzeElementWithUpgrade } from '../browser/analyze.js';
import { captureTimeline } from '../browser/capture.js';
import {
  HARNESS_CHANNEL,
  isHarnessRequest,
  type HarnessRequest,
  type HarnessResponse,
} from './protocol.js';

export interface AgentOptions {
  /** Origins allowed to send requests. If omitted, only same-origin as the parent. */
  allowedOrigins?: string[];
}

function originAllowed(origin: string, allowed: string[] | undefined): boolean {
  // '*' explicitly opts out of origin checking.
  if (allowed && allowed.includes('*')) return true;
  if (allowed && allowed.length > 0) return allowed.includes(origin);
  // Default: only accept messages from our own origin.
  try {
    return origin === window.location.origin;
  } catch {
    return false;
  }
}

function resolveRoot(selector?: string): Element | null {
  if (selector) {
    return document.querySelector(selector);
  }
  return document.documentElement;
}

async function handleRequest(req: HarnessRequest): Promise<HarnessResponse> {
  try {
    if (req.kind === 'analyze') {
      const root = resolveRoot(req.selector);
      const result = await analyzeElementWithUpgrade(root);
      return { channel: HARNESS_CHANNEL, id: req.id, ok: true, kind: 'analyze', result };
    }
    // capture
    const result = await captureTimeline(document, req.options);
    return { channel: HARNESS_CHANNEL, id: req.id, ok: true, kind: 'capture', result };
  } catch (err) {
    return {
      channel: HARNESS_CHANNEL,
      id: req.id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Install the agent's message listener and announce readiness to the parent.
 * Idempotent: repeated calls install a single listener.
 */
export function installAgent(options: AgentOptions = {}): void {
  const w = window as unknown as { __SPEAKABLE_AGENT_INSTALLED__?: boolean };
  if (w.__SPEAKABLE_AGENT_INSTALLED__) return;
  w.__SPEAKABLE_AGENT_INSTALLED__ = true;

  window.addEventListener('message', async (event: MessageEvent) => {
    // Validate source: only accept from the parent that mounted us.
    if (event.source !== window.parent) return;
    if (!originAllowed(event.origin, options.allowedOrigins)) return;
    if (!isHarnessRequest(event.data)) return;

    const response = await handleRequest(event.data);
    // Post back to the requesting origin (or '*' when wildcarded).
    const targetOrigin =
      options.allowedOrigins && options.allowedOrigins.includes('*')
        ? '*'
        : event.origin;
    window.parent.postMessage(response, targetOrigin);
  });

  // Announce readiness.
  try {
    window.parent.postMessage({ channel: HARNESS_CHANNEL, kind: 'ready' }, '*');
  } catch {
    // parent may be unavailable in some contexts; ignore.
  }
}
