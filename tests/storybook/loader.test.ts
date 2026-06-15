/**
 * Unit tests for the Storybook Story Loader.
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createStoryLoader,
  StoryLoadError,
  StoryLoadTimeoutError,
} from '../../src/storybook/loader.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- Test Data ---

const minimalStoryHtml = `
<!DOCTYPE html>
<html>
<head><title>Story</title></head>
<body>
  <div id="storybook-root">
    <button>Click me</button>
  </div>
</body>
</html>
`;

const emptyBodyHtml = `
<!DOCTYPE html>
<html>
<head><title>Story</title></head>
<body></body>
</html>
`;

const complexStoryHtml = `
<!DOCTYPE html>
<html>
<head><title>Dialog Story</title></head>
<body>
  <div id="storybook-root">
    <button aria-haspopup="dialog">Open Dialog</button>
    <dialog aria-label="Confirm">
      <h2>Confirm Action</h2>
      <button>Cancel</button>
      <button>OK</button>
    </dialog>
  </div>
</body>
</html>
`;

// --- Helpers ---

function mockResponse(body: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

// --- Tests ---

describe('Storybook Story Loader', () => {
  describe('createStoryLoader', () => {
    it('should create a loader with default options', () => {
      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      expect(loader).toBeDefined();
      expect(loader.loadStory).toBeInstanceOf(Function);
      expect(loader.destroy).toBeInstanceOf(Function);
    });
  });

  describe('loadStory()', () => {
    /**
     * Validates: Requirement 5.1
     * WHEN a story ID is provided, THE Storybook_Adapter SHALL load the story
     * in an isolated iframe using the Storybook iframe URL format.
     */
    it('should fetch story from correct iframe URL', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      await loader.loadStory('button--primary');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchUrl = mockFetch.mock.calls[0][0];
      expect(fetchUrl).toBe(
        'http://localhost:6006/iframe.html?id=button--primary&viewMode=story'
      );
    });

    it('should normalize trailing slash in storybook URL', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006/' });
      await loader.loadStory('button--primary');

      const fetchUrl = mockFetch.mock.calls[0][0];
      expect(fetchUrl).toBe(
        'http://localhost:6006/iframe.html?id=button--primary&viewMode=story'
      );
    });

    it('should encode special characters in story ID', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      await loader.loadStory('components/button--with spaces');

      const fetchUrl = mockFetch.mock.calls[0][0];
      expect(fetchUrl).toContain('id=components%2Fbutton--with%20spaces');
    });

    /**
     * Validates: Requirement 5.2
     * WHEN the story iframe has loaded and rendered, THE Storybook_Adapter
     * SHALL signal readiness to the Timeline_Generator.
     */
    it('should return a ready document when story has content', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      const result = await loader.loadStory('button--primary');

      expect(result.document).toBeDefined();
      expect(result.document.body).toBeDefined();
      expect(result.document.body.children.length).toBeGreaterThan(0);
    });

    it('should return the correct story ID in the result', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      const result = await loader.loadStory('dialog--default');

      expect(result.storyId).toBe('dialog--default');
    });

    it('should parse complex story HTML correctly', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(complexStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      const result = await loader.loadStory('dialog--default');

      const dialog = result.document.querySelector('dialog');
      expect(dialog).not.toBeNull();
      expect(dialog?.getAttribute('aria-label')).toBe('Confirm');
    });

    /**
     * Validates: Requirement 5.3
     * IF the story iframe fails to load within 10 seconds, THEN THE
     * Storybook_Adapter SHALL return an error containing the story ID
     * and failure reason.
     */
    it('should throw StoryLoadTimeoutError when fetch times out', async () => {
      // Simulate abort due to timeout
      mockFetch.mockImplementationOnce(
        (_url: string, opts: { signal: AbortSignal }) => {
          return new Promise((_resolve, reject) => {
            opts.signal.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            });
          });
        }
      );

      const loader = createStoryLoader({
        storybookUrl: 'http://localhost:6006',
        loadTimeout: 50, // Very short timeout for test
      });

      await expect(loader.loadStory('slow--story')).rejects.toThrow(StoryLoadTimeoutError);
    });

    it('should include story ID in timeout error', async () => {
      mockFetch.mockImplementationOnce(
        (_url: string, opts: { signal: AbortSignal }) => {
          return new Promise((_resolve, reject) => {
            opts.signal.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            });
          });
        }
      );

      const loader = createStoryLoader({
        storybookUrl: 'http://localhost:6006',
        loadTimeout: 50,
      });

      try {
        await loader.loadStory('timeout--story');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(StoryLoadTimeoutError);
        expect((error as StoryLoadTimeoutError).storyId).toBe('timeout--story');
      }
    });

    it('should throw StoryLoadError when HTTP response is not OK', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse('', false, 404));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });

      await expect(loader.loadStory('missing--story')).rejects.toThrow(StoryLoadError);
    });

    it('should include story ID in HTTP error', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse('', false, 500));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });

      try {
        await loader.loadStory('error--story');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(StoryLoadError);
        expect((error as StoryLoadError).storyId).toBe('error--story');
        expect((error as StoryLoadError).reason).toContain('500');
      }
    });

    it('should throw StoryLoadError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fetch failed: ECONNREFUSED'));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });

      await expect(loader.loadStory('network--fail')).rejects.toThrow(StoryLoadError);
    });

    /**
     * Validates: Requirement 5.4
     * WHEN the story has associated Storybook interaction tests (play functions),
     * THE Storybook_Adapter SHALL detect and report their availability.
     */
    it('should report play function availability when passed true', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      const result = await loader.loadStory('button--primary', true);

      expect(result.hasPlayFunction).toBe(true);
    });

    it('should default hasPlayFunction to false', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      const result = await loader.loadStory('button--primary');

      expect(result.hasPlayFunction).toBe(false);
    });

    it('should report no play function when passed false', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      const result = await loader.loadStory('button--primary', false);

      expect(result.hasPlayFunction).toBe(false);
    });

    /**
     * Validates: Requirement 5.5
     * THE Storybook_Adapter SHALL support loading stories with custom viewports
     * by accepting a viewport width and height parameter.
     */
    it('should apply custom viewport dimensions', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({
        storybookUrl: 'http://localhost:6006',
        viewport: { width: 375, height: 667 },
      });

      const result = await loader.loadStory('button--primary');

      // Access the window via the document's defaultView
      const window = result.document.defaultView;
      expect(window?.innerWidth).toBe(375);
      expect(window?.innerHeight).toBe(667);
    });

    it('should use default viewport (1280x720) when none specified', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(minimalStoryHtml));

      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      const result = await loader.loadStory('button--primary');

      const window = result.document.defaultView;
      expect(window?.innerWidth).toBe(1280);
      expect(window?.innerHeight).toBe(720);
    });
  });

  describe('destroy()', () => {
    it('should prevent further story loads after destroy', async () => {
      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      loader.destroy();

      await expect(loader.loadStory('button--primary')).rejects.toThrow(StoryLoadError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should include descriptive error message after destroy', async () => {
      const loader = createStoryLoader({ storybookUrl: 'http://localhost:6006' });
      loader.destroy();

      try {
        await loader.loadStory('button--primary');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(StoryLoadError);
        expect((error as StoryLoadError).reason).toContain('destroyed');
      }
    });
  });

  describe('readiness detection', () => {
    it('should timeout when body has no content', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(emptyBodyHtml));

      const loader = createStoryLoader({
        storybookUrl: 'http://localhost:6006',
        loadTimeout: 200, // Short timeout for test
      });

      await expect(loader.loadStory('empty--story')).rejects.toThrow(
        StoryLoadTimeoutError
      );
    });
  });
});
