/**
 * Stable CSS Selector Generation
 *
 * Generates unique, deterministic CSS selectors for DOM elements.
 * The selector strategy prioritizes stability and readability:
 *
 * 1. If the element has an ID, return `#id`
 * 2. Walk up from the element to the document root, building a path
 * 3. At each level, try tag name alone, then tag+classes, then tag:nth-child(n)
 * 4. Stop building the path when the partial selector already uniquely identifies the element
 */

/**
 * Generate a stable CSS selector that uniquely identifies the given element
 * within its document.
 *
 * The selector is deterministic: given the same DOM structure, the same element
 * will always produce the same selector string.
 */
export function generateSelector(element: Element): string {
  // If the element has an ID, use it directly (IDs are unique within a document)
  if (element.id) {
    return `#${escapeCSSIdentifier(element.id)}`;
  }

  const document = element.ownerDocument;
  if (!document) {
    return getTagName(element);
  }

  // Build path segments from element up to document root
  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    const segment = buildSegment(current, document);
    segments.unshift(segment);

    // Check if the current partial path already uniquely identifies the element
    const partialSelector = segments.join(' > ');
    try {
      const matches = document.querySelectorAll(partialSelector);
      if (matches.length === 1 && matches[0] === element) {
        return partialSelector;
      }
    } catch {
      // If querySelectorAll fails (invalid selector), continue building path
    }

    current = current.parentElement;
  }

  // Include html root if needed
  if (segments.length === 0) {
    return getTagName(element);
  }

  const fullSelector = segments.join(' > ');

  // Final uniqueness check - if still not unique, shouldn't happen for well-formed DOM
  // but return what we have as it's the most specific path we can build
  return fullSelector;
}

/**
 * Build a selector segment for a single element in the path.
 * Tries strategies in order of preference: tag alone, tag+classes, tag:nth-child.
 */
function buildSegment(element: Element, document: Document): string {
  const tag = getTagName(element);
  const parent = element.parentElement;

  // Strategy 1: Tag name alone is unique among siblings
  if (parent) {
    const siblingsWithSameTag = Array.from(parent.children).filter(
      (child) => getTagName(child) === tag
    );
    if (siblingsWithSameTag.length === 1) {
      return tag;
    }
  } else {
    // No parent - tag alone is our best option at root level
    return tag;
  }

  // Strategy 2: Tag + class combination is unique among siblings
  const classes = getStableClasses(element);
  if (classes.length > 0) {
    const tagWithClasses = `${tag}.${classes.join('.')}`;
    if (parent) {
      const siblingsMatchingClasses = Array.from(parent.children).filter(
        (child) => {
          if (getTagName(child) !== tag) return false;
          return classes.every((cls) => child.classList.contains(cls));
        }
      );
      if (siblingsMatchingClasses.length === 1) {
        return tagWithClasses;
      }
    }
  }

  // Strategy 3: nth-child fallback (always unique among siblings)
  const index = getNthChildIndex(element);
  return `${tag}:nth-child(${index})`;
}

/**
 * Get the lowercase tag name for an element.
 */
function getTagName(element: Element): string {
  return element.tagName.toLowerCase();
}

/**
 * Get sorted, stable class names for an element.
 * Filters out classes that look dynamic (contain random characters/hashes).
 * Sorting ensures deterministic output regardless of class order in markup.
 */
function getStableClasses(element: Element): string[] {
  const classes = Array.from(element.classList);
  if (classes.length === 0) return [];

  // Filter out classes that look like generated hashes (e.g., CSS modules)
  const stableClasses = classes.filter((cls) => !looksLikeDynamicClass(cls));

  // Sort for determinism
  return stableClasses.sort().map(escapeCSSIdentifier);
}

/**
 * Heuristic to detect dynamic/generated class names.
 * Classes with patterns like hex hashes, random strings, or auto-generated
 * suffixes are considered unstable.
 */
function looksLikeDynamicClass(className: string): boolean {
  // Classes that are purely hex strings of 5+ chars
  if (/^[a-f0-9]{5,}$/i.test(className)) return true;

  // Classes ending with a hash-like suffix (e.g., "button_a1b2c3")
  if (/[_-][a-f0-9]{5,}$/i.test(className)) return true;

  // CSS module style hashes (e.g., "styles__button___2xF3d")
  if (/_{2,}[A-Za-z0-9]{4,}$/.test(className)) return true;

  return false;
}

/**
 * Get the 1-based nth-child index of an element among its parent's children.
 */
function getNthChildIndex(element: Element): number {
  const parent = element.parentElement;
  if (!parent) return 1;

  const children = Array.from(parent.children);
  const index = children.indexOf(element);
  return index + 1;
}

/**
 * Escape special characters in a CSS identifier.
 * Handles characters that have special meaning in CSS selectors.
 */
function escapeCSSIdentifier(value: string): string {
  // If the value is empty, return it as-is
  if (!value) return value;

  let result = '';
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    const code = char.charCodeAt(0);

    // If it starts with a digit, escape it
    if (i === 0 && code >= 0x30 && code <= 0x39) {
      result += `\\3${char} `;
      continue;
    }

    // Characters that need escaping in CSS identifiers
    if (
      char === '!' ||
      char === '"' ||
      char === '#' ||
      char === '$' ||
      char === '%' ||
      char === '&' ||
      char === "'" ||
      char === '(' ||
      char === ')' ||
      char === '*' ||
      char === '+' ||
      char === ',' ||
      char === '.' ||
      char === '/' ||
      char === ':' ||
      char === ';' ||
      char === '<' ||
      char === '=' ||
      char === '>' ||
      char === '?' ||
      char === '@' ||
      char === '[' ||
      char === '\\' ||
      char === ']' ||
      char === '^' ||
      char === '`' ||
      char === '{' ||
      char === '|' ||
      char === '}' ||
      char === '~' ||
      char === ' '
    ) {
      result += `\\${char}`;
      continue;
    }

    result += char;
  }

  return result;
}
