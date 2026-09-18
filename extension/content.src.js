/**
 * Speakable Browser Extension — Content Script (source wrapper)
 *
 * Runs in the page context. Analyzes the LIVE DOM using the shared Speakable
 * browser bundle (window.__SPEAKABLE__), so JS-set state and open shadow roots
 * are captured — consistent with the CLI and Storybook addon.
 *
 * BUILD: `bash extension/build.sh` concatenates the IIFE bundle
 * (speakable-browser.global.js) followed by this file into `extension/content.js`.
 * The bundle assigns window.__SPEAKABLE__ before this wrapper runs.
 */

(function () {
  function getBundle() {
    return window.__SPEAKABLE__ || null;
  }

  function resolveRoots(selector) {
    if (selector) {
      const matches = Array.from(document.querySelectorAll(selector));
      return matches.length ? matches : [];
    }
    return [document.documentElement];
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type !== 'ANALYZE') return false;

    const bundle = getBundle();
    if (!bundle) {
      sendResponse({ success: false, error: 'Speakable bundle not loaded in page.' });
      return true;
    }

    const selector = message.selector || null;

    (async () => {
      try {
        const roots = resolveRoots(selector);
        if (selector && roots.length === 0) {
          sendResponse({
            success: false,
            error: `No elements match selector: "${selector}"`,
          });
          return;
        }

        // Analyze each matched root (or the whole document) and merge.
        const results = [];
        for (const root of roots) {
          // analyzeElementWithUpgrade waits for web components to hydrate.
          results.push(await bundle.analyzeElementWithUpgrade(root));
        }

        const merged = mergeResults(results);
        sendResponse({
          success: true,
          result: merged,
          url: window.location.href,
          title: document.title,
          elementCount: selector ? roots.length : merged.stats.totalElements,
        });
      } catch (err) {
        sendResponse({ success: false, error: String(err && err.message ? err.message : err) });
      }
    })();

    // Async response.
    return true;
  });

  function mergeResults(results) {
    if (results.length === 1) return results[0];
    const merged = {
      nvda: [], jaws: [], voiceover: [], narrator: [],
      audit: [], warnings: [],
      stats: { totalElements: 0, interactiveElements: 0, landmarks: 0, headings: 0 },
    };
    for (const r of results) {
      merged.nvda.push(...r.nvda);
      merged.jaws.push(...r.jaws);
      merged.voiceover.push(...r.voiceover);
      merged.narrator.push(...r.narrator);
      merged.audit.push(...r.audit);
      merged.warnings.push(...r.warnings);
      merged.stats.totalElements += r.stats.totalElements;
      merged.stats.interactiveElements += r.stats.interactiveElements;
      merged.stats.landmarks += r.stats.landmarks;
      merged.stats.headings += r.stats.headings;
    }
    return merged;
  }
})();
