/**
 * Speakable Browser Extension — Content Script
 *
 * Runs on every page. Listens for messages from the popup
 * and responds with the page's HTML for analysis.
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_PAGE_HTML') {
    const selector = message.selector || null;

    if (selector) {
      // Return only matching elements' outerHTML
      try {
        const elements = document.querySelectorAll(selector);
        const fragments = Array.from(elements).map((el) => el.outerHTML);
        sendResponse({
          success: true,
          html: fragments.join('\n'),
          url: window.location.href,
          title: document.title,
          elementCount: elements.length,
        });
      } catch (err) {
        sendResponse({
          success: false,
          error: `Invalid selector: ${selector}`,
        });
      }
    } else {
      // Clone the document and strip style/script/noscript elements
      // to prevent CSS/JS content from leaking into accessibility output
      const clone = document.documentElement.cloneNode(true);
      clone.querySelectorAll('style, script, noscript, link[rel="stylesheet"]').forEach(el => el.remove());

      // Also strip any remaining inline style content via regex on the serialized HTML
      // (catches edge cases where style tags aren't properly removed from cloned DOM)
      let html = clone.outerHTML;
      html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

      sendResponse({
        success: true,
        html,
        url: window.location.href,
        title: document.title,
      });
    }
  }

  // Return true to indicate async response
  return true;
});
