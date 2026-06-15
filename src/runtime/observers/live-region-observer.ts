/**
 * Live Region Observer
 *
 * Detects text content changes within elements marked with aria-live or
 * implicit live region roles (alert, status, log, marquee, timer).
 * Emits ANNOUNCEMENT events with politeness level and announced text.
 *
 * Handles:
 * - Elements with explicit aria-live attribute (polite/assertive)
 * - Elements with role="alert" (implicit assertive)
 * - Elements with role="status"/"log"/"marquee"/"timer" (implicit polite)
 * - aria-atomic="true" (read entire region vs changed nodes only)
 * - Dynamically added live regions (watched via document-level observer)
 */

import type { AccessibilityEvent, EventTarget as A11yEventTarget } from '../types';
import { generateSelector } from '../selector';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Callback invoked when the observer detects a live region announcement. */
export type LiveRegionEventCallback = (event: Omit<AccessibilityEvent, 'timestamp'>) => void;

/** Roles that implicitly create live regions. */
const IMPLICIT_LIVE_ROLES = new Set(['alert', 'status', 'log', 'marquee', 'timer']);

/** Map from implicit role to politeness level. */
const ROLE_POLITENESS_MAP: Record<string, 'polite' | 'assertive'> = {
  alert: 'assertive',
  status: 'polite',
  log: 'polite',
  marquee: 'polite',
  timer: 'polite',
};

// ---------------------------------------------------------------------------
// Observer Interface
// ---------------------------------------------------------------------------

export interface LiveRegionObserver {
  /** Start observing live regions for content changes. */
  start(): void;
  /** Stop observing and clean up all mutation observers. */
  stop(): void;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Creates a live region observer that watches for content changes in
 * aria-live regions and emits ANNOUNCEMENT events.
 *
 * @param document - The document to observe
 * @param callback - Function called with AccessibilityEvent for each announcement
 * @returns LiveRegionObserver with start/stop lifecycle methods
 */
export function createLiveRegionObserver(
  document: Document,
  callback: LiveRegionEventCallback
): LiveRegionObserver {
  /** MutationObserver for content changes within known live regions. */
  let contentObserver: MutationObserver | null = null;

  /** MutationObserver for detecting new live regions added to the document. */
  let documentObserver: MutationObserver | null = null;

  /** Set of currently tracked live region elements. */
  const trackedRegions = new Set<Element>();

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /**
   * Determine if an element is a live region and return its politeness level.
   * Returns null if the element is not a live region.
   */
  function getLiveRegionPoliteness(element: Element): 'polite' | 'assertive' | null {
    // Explicit aria-live takes precedence
    const ariaLive = element.getAttribute('aria-live');
    if (ariaLive === 'assertive') return 'assertive';
    if (ariaLive === 'polite') return 'polite';
    // aria-live="off" means not a live region
    if (ariaLive === 'off') return null;

    // Check implicit live region roles
    const role = element.getAttribute('role');
    if (role && IMPLICIT_LIVE_ROLES.has(role)) {
      return ROLE_POLITENESS_MAP[role] || 'polite';
    }

    // If aria-live has another value (non-standard), treat as polite
    if (ariaLive && ariaLive !== 'off') return 'polite';

    return null;
  }

  /**
   * Determine whether the live region uses atomic reading
   * (entire region text vs only changed nodes).
   */
  function isAtomic(element: Element): boolean {
    return element.getAttribute('aria-atomic') === 'true';
  }

  /**
   * Build the EventTarget info for a live region element.
   */
  function buildEventTarget(element: Element): A11yEventTarget {
    const role = element.getAttribute('role') || 'region';
    const accessibleName =
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      '';
    const selector = generateSelector(element);

    return { role, accessibleName, selector };
  }

  /**
   * Extract text content from a list of added nodes (text nodes and elements).
   */
  function getTextFromNodes(nodes: NodeList): string {
    const parts: string[] = [];
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) parts.push(text);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const text = (node as Element).textContent?.trim();
        if (text) parts.push(text);
      }
    });
    return parts.join(' ').trim();
  }

  /**
   * Emit an ANNOUNCEMENT event for a live region content change.
   */
  function emitAnnouncement(
    liveRegion: Element,
    text: string,
    politeness: 'polite' | 'assertive'
  ): void {
    if (!text) return;

    const target = buildEventTarget(liveRegion);

    callback({
      type: 'ANNOUNCEMENT',
      target,
      payload: {
        kind: 'announcement',
        politeness,
        text,
      },
    });
  }

  /**
   * Find the closest ancestor (or self) that is a tracked live region.
   */
  function findLiveRegionAncestor(node: Node): Element | null {
    let current: Node | null = node;
    while (current) {
      if (current.nodeType === Node.ELEMENT_NODE && trackedRegions.has(current as Element)) {
        return current as Element;
      }
      current = current.parentNode;
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // Content Mutation Handling
  // -------------------------------------------------------------------------

  /**
   * Handle mutations within tracked live regions.
   */
  function handleContentMutations(mutations: MutationRecord[]): void {
    // Group mutations by their live region ancestor to avoid duplicate announcements
    const regionChanges = new Map<Element, { addedText: string[]; charDataChanged: boolean }>();

    for (const mutation of mutations) {
      const liveRegion = findLiveRegionAncestor(mutation.target);
      if (!liveRegion) continue;

      if (!regionChanges.has(liveRegion)) {
        regionChanges.set(liveRegion, { addedText: [], charDataChanged: false });
      }
      const changes = regionChanges.get(liveRegion)!;

      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        const text = getTextFromNodes(mutation.addedNodes);
        if (text) {
          changes.addedText.push(text);
        }
      } else if (mutation.type === 'characterData') {
        changes.charDataChanged = true;
      }
    }

    // Emit announcements for each live region that had changes
    for (const [region, changes] of regionChanges) {
      const politeness = getLiveRegionPoliteness(region);
      if (!politeness) continue;

      let text: string;
      if (isAtomic(region)) {
        // aria-atomic="true": read the entire region's text content
        text = region.textContent?.trim() || '';
      } else {
        // Non-atomic: only announce changed/added content
        if (changes.addedText.length > 0) {
          text = changes.addedText.join(' ').trim();
        } else if (changes.charDataChanged) {
          // characterData changed but no new nodes — read updated text
          text = region.textContent?.trim() || '';
        } else {
          text = '';
        }
      }

      emitAnnouncement(region, text, politeness);
    }
  }

  // -------------------------------------------------------------------------
  // Document Mutation Handling (detect new live regions)
  // -------------------------------------------------------------------------

  /**
   * Handle document-level mutations to detect new live regions being added.
   */
  function handleDocumentMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') continue;

      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const element = node as Element;

        // Check if the added element itself is a live region
        if (getLiveRegionPoliteness(element) !== null && !trackedRegions.has(element)) {
          trackRegion(element);
        }

        // Check descendants for live regions
        const descendants = element.querySelectorAll('[aria-live], [role]');
        descendants.forEach((desc) => {
          if (getLiveRegionPoliteness(desc) !== null && !trackedRegions.has(desc)) {
            trackRegion(desc);
          }
        });
      });

      // Handle removed nodes: untrack regions that are removed from DOM
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const element = node as Element;

        if (trackedRegions.has(element)) {
          trackedRegions.delete(element);
        }

        // Remove descendants
        const descendants = element.querySelectorAll('[aria-live], [role]');
        descendants.forEach((desc) => {
          trackedRegions.delete(desc);
        });
      });
    }
  }

  /**
   * Track a new live region element.
   */
  function trackRegion(element: Element): void {
    trackedRegions.add(element);
  }

  // -------------------------------------------------------------------------
  // Discovery
  // -------------------------------------------------------------------------

  /**
   * Find all existing live regions in the document and start tracking them.
   */
  function discoverExistingRegions(): void {
    // Elements with explicit aria-live
    const ariaLiveElements = document.querySelectorAll('[aria-live]');
    ariaLiveElements.forEach((el) => {
      if (getLiveRegionPoliteness(el) !== null) {
        trackRegion(el);
      }
    });

    // Elements with implicit live region roles
    IMPLICIT_LIVE_ROLES.forEach((role) => {
      const roleElements = document.querySelectorAll(`[role="${role}"]`);
      roleElements.forEach((el) => {
        if (!trackedRegions.has(el)) {
          trackRegion(el);
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  function start(): void {
    // Discover existing live regions
    discoverExistingRegions();

    // Set up content observer for changes within live regions
    contentObserver = new MutationObserver(handleContentMutations);

    // Observe the entire document body for childList and characterData changes
    // in subtrees. We filter by live region ancestry in the handler.
    const body = document.body;
    if (body) {
      contentObserver.observe(body, {
        childList: true,
        characterData: true,
        subtree: true,
        characterDataOldValue: true,
      });
    }

    // Set up document observer for detecting new live regions being added
    documentObserver = new MutationObserver(handleDocumentMutations);
    if (body) {
      documentObserver.observe(body, {
        childList: true,
        subtree: true,
      });
    }
  }

  function stop(): void {
    if (contentObserver) {
      contentObserver.disconnect();
      contentObserver = null;
    }
    if (documentObserver) {
      documentObserver.disconnect();
      documentObserver = null;
    }
    trackedRegions.clear();
  }

  return { start, stop };
}
