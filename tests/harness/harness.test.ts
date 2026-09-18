/**
 * Tests for the iframe harness parent controller and message protocol.
 *
 * Validates Requirements 2.2/2.3 (request/response correlation),
 * 2.4 (origin/source validation), 2.5 (cross-origin + timeout errors),
 * 2.6 (harness lifecycle).
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHarness } from '../../src/harness/index.js';
import {
  HARNESS_CHANNEL,
  isHarnessRequest,
  isHarnessResponse,
  isHarnessReady,
} from '../../src/harness/protocol.js';

describe('harness protocol guards', () => {
  it('recognizes valid requests and rejects malformed data', () => {
    expect(isHarnessRequest({ channel: HARNESS_CHANNEL, id: 'x', kind: 'analyze' })).toBe(true);
    expect(isHarnessRequest({ channel: HARNESS_CHANNEL, id: 'x', kind: 'capture', options: {} })).toBe(true);
    expect(isHarnessRequest({ channel: 'other', id: 'x', kind: 'analyze' })).toBe(false);
    expect(isHarnessRequest({ id: 'x' })).toBe(false);
    expect(isHarnessRequest(null)).toBe(false);
  });

  it('recognizes valid responses and ready messages', () => {
    expect(isHarnessResponse({ channel: HARNESS_CHANNEL, id: 'x', ok: true })).toBe(true);
    expect(isHarnessResponse({ channel: HARNESS_CHANNEL, id: 'x' })).toBe(false);
    expect(isHarnessReady({ channel: HARNESS_CHANNEL, kind: 'ready' })).toBe(true);
    expect(isHarnessReady({ channel: HARNESS_CHANNEL, kind: 'nope' })).toBe(false);
  });
});

describe('createHarness', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('rejects cross-origin URL loads with a descriptive error', async () => {
    const harness = createHarness({ target: { container }, timeoutMs: 200 });
    await expect(harness.load({ url: 'https://example.com/other-origin' })).rejects.toThrow(
      /cross-origin/i
    );
    harness.destroy();
  });

  it('rejects analyze() before load() (no content window driver)', async () => {
    const harness = createHarness({ target: { container }, timeoutMs: 200 });
    // An iframe created but never loaded has a contentWindow in jsdom; the
    // request will time out rather than resolve.
    await expect(harness.analyze()).rejects.toThrow();
    harness.destroy();
  });

  it('times out an unanswered request', async () => {
    const iframe = document.createElement('iframe');
    container.appendChild(iframe);
    const harness = createHarness({ target: iframe, timeoutMs: 100, allowedOrigins: ['*'] });
    await expect(harness.analyze()).rejects.toThrow(/timed out/i);
    harness.destroy();
  });

  it('correlates a response to a pending request by id', async () => {
    // Drive the harness against a stub "iframe" whose contentWindow echoes a
    // correlated response, exercising the correlation path.
    const iframe = document.createElement('iframe');
    container.appendChild(iframe);

    const win = iframe.contentWindow as Window;
    // Intercept postMessage from parent -> iframe, and reply as the iframe.
    const originalPost = win.postMessage.bind(win);
    vi.spyOn(win, 'postMessage').mockImplementation((msg: unknown) => {
      if (isHarnessRequest(msg)) {
        const response = {
          channel: HARNESS_CHANNEL,
          id: msg.id,
          ok: true,
          kind: 'analyze',
          result: {
            nvda: ['stub'], jaws: [], voiceover: [], narrator: [],
            audit: [], stats: { totalElements: 0, interactiveElements: 0, landmarks: 0, headings: 0 },
            warnings: [],
          },
        };
        // Dispatch a message event on the parent window, sourced from the iframe.
        const event = new MessageEvent('message', {
          data: response,
          origin: window.location.origin,
        });
        Object.defineProperty(event, 'source', { value: iframe.contentWindow });
        window.dispatchEvent(event);
      }
      return originalPost;
    });

    const harness = createHarness({ target: iframe, timeoutMs: 500, allowedOrigins: ['*'] });
    const result = await harness.analyze();
    expect(result.nvda).toEqual(['stub']);
    harness.destroy();
  });

  it('rejects pending requests when destroyed', async () => {
    const iframe = document.createElement('iframe');
    container.appendChild(iframe);
    const harness = createHarness({ target: iframe, timeoutMs: 5000, allowedOrigins: ['*'] });
    const pending = harness.analyze();
    harness.destroy();
    await expect(pending).rejects.toThrow(/destroyed/i);
  });
});
