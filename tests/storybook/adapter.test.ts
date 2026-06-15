/**
 * Unit tests for the Storybook Adapter.
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createStorybookAdapter,
  globMatch,
  StorybookConnectionError,
  StorybookIndexError,
} from '../../src/storybook/adapter.js';

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

const storybookV4Index = {
  v: 4,
  entries: {
    'button--primary': {
      id: 'button--primary',
      title: 'Components/Button',
      name: 'Primary',
      type: 'story' as const,
      tags: ['play-fn'],
    },
    'button--secondary': {
      id: 'button--secondary',
      title: 'Components/Button',
      name: 'Secondary',
      type: 'story' as const,
      tags: [],
    },
    'dialog--default': {
      id: 'dialog--default',
      title: 'Overlays/Dialog',
      name: 'Default',
      type: 'story' as const,
      tags: ['play-fn'],
    },
    'button--docs': {
      id: 'button--docs',
      title: 'Components/Button',
      name: 'Docs',
      type: 'docs' as const,
      tags: [],
    },
  },
};

const storybookV5Index = {
  v: 5,
  entries: {
    'input--text': {
      id: 'input--text',
      title: 'Forms/Input',
      name: 'Text',
      type: 'story' as const,
      tags: [],
      importPath: './src/components/Input.stories.tsx',
    },
    'input--disabled': {
      id: 'input--disabled',
      title: 'Forms/Input',
      name: 'Disabled',
      type: 'story' as const,
      tags: ['play-fn'],
      importPath: './src/components/Input.stories.tsx',
    },
  },
};

const legacyStoriesJson = {
  v: 3,
  stories: {
    'card--default': {
      id: 'card--default',
      kind: 'UI/Card',
      name: 'Default',
      story: 'Default',
    },
    'card--with-image': {
      id: 'card--with-image',
      kind: 'UI/Card',
      name: 'With Image',
      story: 'With Image',
    },
  },
};

// --- Helper ---

function mockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  };
}

// --- Tests ---

describe('Storybook Adapter', () => {
  describe('createStorybookAdapter', () => {
    it('should create an adapter with provided options', () => {
      const adapter = createStorybookAdapter({
        url: 'http://localhost:6006',
      });
      expect(adapter).toBeDefined();
      expect(adapter.connect).toBeInstanceOf(Function);
      expect(adapter.discoverStories).toBeInstanceOf(Function);
      expect(adapter.disconnect).toBeInstanceOf(Function);
    });
  });

  describe('connect()', () => {
    it('should fetch index.json from the Storybook URL', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await adapter.connect();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:6006/index.json', {});
    });

    it('should normalize trailing slash from URL', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006/' });
      await adapter.connect();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:6006/index.json', {});
    });

    it('should fall back to stories.json when index.json returns non-OK', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
      mockFetch.mockResolvedValueOnce(mockResponse(legacyStoriesJson));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await adapter.connect();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:6006/index.json', {});
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:6006/stories.json', {});
    });

    it('should throw StorybookConnectionError when URL is unreachable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fetch failed: ECONNREFUSED'));

      const adapter = createStorybookAdapter({ url: 'http://localhost:9999' });
      await expect(adapter.connect()).rejects.toThrow(StorybookConnectionError);
    });

    it('should throw StorybookIndexError when both endpoints fail with non-network errors', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
      mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await expect(adapter.connect()).rejects.toThrow(StorybookIndexError);
    });

    it('should include URL in connection error message', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fetch failed: ECONNREFUSED'));

      const adapter = createStorybookAdapter({ url: 'http://localhost:9999' });
      try {
        await adapter.connect();
      } catch (e) {
        expect((e as StorybookConnectionError).url).toBe('http://localhost:9999');
        expect((e as StorybookConnectionError).message).toContain('http://localhost:9999');
      }
    });

    it('should include unsupported version message in index error', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
      mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      try {
        await adapter.connect();
      } catch (e) {
        expect((e as StorybookIndexError).message).toContain('unsupported');
      }
    });
  });

  describe('discoverStories()', () => {
    it('should throw if connect() was not called first', async () => {
      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await expect(adapter.discoverStories()).rejects.toThrow(StorybookConnectionError);
    });

    it('should parse Storybook 7.x/8.x entries format', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      // Should skip docs-type entries
      expect(stories).toHaveLength(3);
      expect(stories).toContainEqual({
        id: 'button--primary',
        componentName: 'Button',
        storyName: 'Primary',
        hasPlayFunction: true,
      });
      expect(stories).toContainEqual({
        id: 'button--secondary',
        componentName: 'Button',
        storyName: 'Secondary',
        hasPlayFunction: false,
      });
      expect(stories).toContainEqual({
        id: 'dialog--default',
        componentName: 'Dialog',
        storyName: 'Default',
        hasPlayFunction: true,
      });
    });

    it('should parse Storybook 8.x entries with importPath', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV5Index));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      expect(stories).toHaveLength(2);
      expect(stories[0]).toEqual({
        id: 'input--text',
        componentName: 'Input',
        storyName: 'Text',
        hasPlayFunction: false,
      });
      expect(stories[1]).toEqual({
        id: 'input--disabled',
        componentName: 'Input',
        storyName: 'Disabled',
        hasPlayFunction: true,
      });
    });

    it('should parse legacy stories.json format', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
      mockFetch.mockResolvedValueOnce(mockResponse(legacyStoriesJson));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      expect(stories).toHaveLength(2);
      expect(stories).toContainEqual({
        id: 'card--default',
        componentName: 'Card',
        storyName: 'Default',
        hasPlayFunction: false,
      });
      expect(stories).toContainEqual({
        id: 'card--with-image',
        componentName: 'Card',
        storyName: 'With Image',
        hasPlayFunction: false,
      });
    });

    it('should detect play functions from tags array', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      const primary = stories.find((s) => s.id === 'button--primary');
      expect(primary?.hasPlayFunction).toBe(true);

      const secondary = stories.find((s) => s.id === 'button--secondary');
      expect(secondary?.hasPlayFunction).toBe(false);
    });

    it('should extract component name from last segment of title', async () => {
      const index = {
        v: 4,
        entries: {
          'deep--story': {
            id: 'deep--story',
            title: 'Design System/Atoms/Typography/Heading',
            name: 'H1',
            type: 'story' as const,
            tags: [],
          },
        },
      };
      mockFetch.mockResolvedValueOnce(mockResponse(index));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      expect(stories[0].componentName).toBe('Heading');
    });

    it('should filter stories by componentFilter glob pattern', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({
        url: 'http://localhost:6006',
        componentFilter: 'Button',
      });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      expect(stories).toHaveLength(2);
      expect(stories.every((s) => s.componentName === 'Button')).toBe(true);
    });

    it('should support wildcard * in componentFilter', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({
        url: 'http://localhost:6006',
        componentFilter: 'B*',
      });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      expect(stories).toHaveLength(2);
      expect(stories.every((s) => s.componentName === 'Button')).toBe(true);
    });

    it('should support wildcard ? in componentFilter', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({
        url: 'http://localhost:6006',
        componentFilter: '??????',
      });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      // "Button" = 6 chars, "Dialog" = 6 chars
      expect(stories).toHaveLength(3);
    });

    it('should be case-insensitive in componentFilter matching', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({
        url: 'http://localhost:6006',
        componentFilter: 'button',
      });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      expect(stories).toHaveLength(2);
    });

    it('should return all stories when no componentFilter is set', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      // 3 stories (docs entry is excluded)
      expect(stories).toHaveLength(3);
    });

    it('should return empty array when filter matches nothing', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({
        url: 'http://localhost:6006',
        componentFilter: 'NonExistent*',
      });
      await adapter.connect();
      const stories = await adapter.discoverStories();

      expect(stories).toHaveLength(0);
    });
  });

  describe('disconnect()', () => {
    it('should clear internal state', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(storybookV4Index));

      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      await adapter.connect();
      adapter.disconnect();

      // After disconnect, discoverStories should throw
      await expect(adapter.discoverStories()).rejects.toThrow(StorybookConnectionError);
    });

    it('should not throw when called multiple times', async () => {
      const adapter = createStorybookAdapter({ url: 'http://localhost:6006' });
      expect(() => adapter.disconnect()).not.toThrow();
      expect(() => adapter.disconnect()).not.toThrow();
    });
  });
});

describe('globMatch', () => {
  it('should match exact strings', () => {
    expect(globMatch('Button', 'Button')).toBe(true);
    expect(globMatch('Button', 'Dialog')).toBe(false);
  });

  it('should support * wildcard (any sequence)', () => {
    expect(globMatch('B*', 'Button')).toBe(true);
    expect(globMatch('B*', 'Banner')).toBe(true);
    expect(globMatch('B*', 'Dialog')).toBe(false);
    expect(globMatch('*ton', 'Button')).toBe(true);
    expect(globMatch('*ut*', 'Button')).toBe(true);
  });

  it('should support ? wildcard (single char)', () => {
    expect(globMatch('B?tton', 'Button')).toBe(true);
    expect(globMatch('B?tton', 'Botton')).toBe(true);
    expect(globMatch('B?tton', 'Bton')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(globMatch('button', 'Button')).toBe(true);
    expect(globMatch('BUTTON', 'button')).toBe(true);
    expect(globMatch('Button*', 'BUTTON')).toBe(true);
  });

  it('should escape regex special characters', () => {
    expect(globMatch('Button.Primary', 'Button.Primary')).toBe(true);
    expect(globMatch('Button.Primary', 'ButtonXPrimary')).toBe(false);
    expect(globMatch('(Component)', '(Component)')).toBe(true);
  });

  it('should handle empty pattern and value', () => {
    expect(globMatch('', '')).toBe(true);
    expect(globMatch('*', '')).toBe(true);
    expect(globMatch('', 'something')).toBe(false);
  });

  it('should handle pattern with only wildcards', () => {
    expect(globMatch('*', 'anything')).toBe(true);
    expect(globMatch('???', 'abc')).toBe(true);
    expect(globMatch('???', 'ab')).toBe(false);
  });
});
