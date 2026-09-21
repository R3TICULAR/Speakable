/**
 * Custom-element upgrade awaiting.
 *
 * Runs in a real browser (needs `customElements`). Waits for custom elements
 * under a root to be defined and, where supported, to finish rendering
 * (Lit's `updateComplete`) before analysis/capture proceeds. Bounded by a
 * timeout so it never blocks indefinitely; unresolved tags become warnings.
 */

export interface UpgradeWarning {
  message: string;
  tag: string;
}

const DEFAULT_UPGRADE_TIMEOUT_MS = 2000;

/**
 * Resolve a promise, or resolve with a sentinel when the timeout elapses.
 * Returns true if the promise resolved in time, false on timeout.
 */
function withTimeout(promise: Promise<unknown>, timeoutMs: number): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
    }, timeoutMs);

    promise.then(
      () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(true);
        }
      },
      () => {
        // A rejected upgrade promise still means "no longer pending".
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(true);
        }
      }
    );
  });
}

/**
 * Collect distinct custom-element tag names present under a root.
 * A custom element tag always contains a hyphen.
 */
function collectCustomElementTags(root: Document | Element): string[] {
  const tags = new Set<string>();
  const rootEl: Element | null =
    'documentElement' in root ? (root as Document).documentElement : (root as Element);
  if (!rootEl) return [];

  const consider = (el: Element) => {
    if (el.localName && el.localName.includes('-')) {
      tags.add(el.localName);
    }
  };

  consider(rootEl);
  const all = rootEl.querySelectorAll('*');
  all.forEach(consider);

  return Array.from(tags);
}

/**
 * Collect elements that expose an `updateComplete` thenable (e.g. Lit).
 */
function collectUpdateCompletables(root: Document | Element): Promise<unknown>[] {
  const rootEl: Element | null =
    'documentElement' in root ? (root as Document).documentElement : (root as Element);
  if (!rootEl) return [];

  const promises: Promise<unknown>[] = [];
  const consider = (el: Element) => {
    const uc = (el as unknown as { updateComplete?: unknown }).updateComplete;
    if (uc && typeof (uc as Promise<unknown>).then === 'function') {
      promises.push(uc as Promise<unknown>);
    }
  };

  consider(rootEl);
  rootEl.querySelectorAll('*').forEach(consider);
  return promises;
}

/**
 * Wait for custom elements under `root` to upgrade and render.
 *
 * - Awaits `customElements.whenDefined(tag)` for each custom tag (bounded).
 * - Awaits any `updateComplete` promises found (bounded).
 * - On timeout, resolves anyway and returns a warning per unresolved tag.
 * - Never blocks indefinitely. No-op when `customElements` is unavailable.
 */
export async function awaitCustomElementsReady(
  root: Document | Element,
  timeoutMs: number = DEFAULT_UPGRADE_TIMEOUT_MS
): Promise<UpgradeWarning[]> {
  const warnings: UpgradeWarning[] = [];

  const hasCustomElements =
    typeof customElements !== 'undefined' && customElements !== null;

  if (!hasCustomElements) {
    return warnings;
  }

  const tags = collectCustomElementTags(root);

  // Await definitions.
  await Promise.all(
    tags.map(async tag => {
      // Already defined — nothing to wait for.
      if (customElements.get(tag)) return;
      const defined = await withTimeout(customElements.whenDefined(tag), timeoutMs);
      if (!defined) {
        warnings.push({
          tag,
          message: `Custom element "${tag}" did not upgrade within ${timeoutMs}ms; analysis may reflect a pre-hydration state.`,
        });
      }
    })
  );

  // Await render completion where components expose it (Lit et al.).
  const updateCompletables = collectUpdateCompletables(root);
  if (updateCompletables.length > 0) {
    await withTimeout(Promise.all(updateCompletables), timeoutMs);
  }

  return warnings;
}
