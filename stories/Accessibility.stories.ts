import type { Meta, StoryObj } from '@storybook/html';

/**
 * Stories specifically designed to showcase cross-reader differences.
 * Each story uses elements that produce meaningfully different announcements
 * across NVDA, JAWS, VoiceOver, and Narrator.
 */

const meta: Meta = {
  title: 'Accessibility/Cross-Reader Differences',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// ─── Navigation with Headings and Links ──────────────────────────────────────

/**
 * Navigation landmark with headings and links.
 * 
 * Expected differences:
 * - NVDA: "navigation landmark", "heading level 2", "link"
 * - JAWS: "navigation region", "heading 2", "clickable"
 * - VoiceOver: role-first ordering ("navigation, Main", "heading level 2, Docs")
 * - Narrator: role-first for links ("link, Home"), capitalized "Heading level 1"
 */
export const NavigationWithLinks: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <nav aria-label="Main">
        <h2>Documentation</h2>
        <ul>
          <li><a href="/getting-started">Getting Started</a></li>
          <li><a href="/api-reference">API Reference</a></li>
          <li><a href="/examples">Examples</a></li>
        </ul>
      </nav>
      <main>
        <h1>Welcome to Speakable</h1>
        <p>Predict screen reader output for your components.</p>
      </main>
    `;
    return container;
  },
};

// ─── Form with Mixed States ──────────────────────────────────────────────────

/**
 * Form with checkboxes, radio buttons, and text inputs.
 * 
 * Expected differences:
 * - NVDA: "check box", "not checked", "radio button", "edit", "unavailable"
 * - JAWS: "check box", "not checked", uses "unavailable" for disabled
 * - VoiceOver: "checkbox", "unchecked", uses "dimmed" for disabled, "edit text"
 * - Narrator: "check box", "unchecked", uses "disabled" directly
 */
export const FormWithStates: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <form aria-label="User preferences">
        <fieldset>
          <legend>Notification Settings</legend>
          
          <label>
            <input type="checkbox" checked aria-label="Email notifications" />
            Email notifications
          </label>
          
          <label>
            <input type="checkbox" aria-label="SMS notifications" />
            SMS notifications
          </label>
          
          <label>
            <input type="checkbox" aria-checked="mixed" aria-label="Push notifications" />
            Push notifications (some channels)
          </label>
        </fieldset>
        
        <fieldset>
          <legend>Theme</legend>
          <label>
            <input type="radio" name="theme" checked aria-label="Light theme" />
            Light
          </label>
          <label>
            <input type="radio" name="theme" aria-label="Dark theme" />
            Dark
          </label>
          <label>
            <input type="radio" name="theme" disabled aria-label="System theme" />
            System (unavailable)
          </label>
        </fieldset>
        
        <label for="username">Username</label>
        <input type="text" id="username" value="speakable_user" aria-required="true" />
        
        <button type="submit">Save Preferences</button>
        <button type="button" disabled>Reset (disabled)</button>
      </form>
    `;
    return container;
  },
};

// ─── Expandable Accordion ────────────────────────────────────────────────────

/**
 * Accordion with expanded/collapsed sections.
 * 
 * Expected differences:
 * - NVDA: "expanded"/"collapsed", "button"
 * - JAWS: "expanded"/"collapsed", "button"  
 * - VoiceOver: "expanded"/"collapsed", "button"
 * - Narrator: "expanded"/"collapsed", "button"
 * The landmark and heading differences are more visible here.
 */
export const Accordion: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <section aria-label="FAQ">
        <h2>Frequently Asked Questions</h2>
        
        <h3>
          <button aria-expanded="true" aria-controls="answer-1">
            What is Speakable?
          </button>
        </h3>
        <div id="answer-1" role="region" aria-label="What is Speakable?">
          <p>Speakable is a tool that predicts screen reader output for your HTML components.</p>
        </div>
        
        <h3>
          <button aria-expanded="false" aria-controls="answer-2">
            How accurate are the predictions?
          </button>
        </h3>
        <div id="answer-2" role="region" aria-label="How accurate are the predictions?" hidden>
          <p>Predictions are heuristic-based approximations. Always verify with real screen readers.</p>
        </div>
        
        <h3>
          <button aria-expanded="false" aria-controls="answer-3">
            Which screen readers are supported?
          </button>
        </h3>
        <div id="answer-3" role="region" aria-label="Which screen readers are supported?" hidden>
          <p>NVDA, JAWS, VoiceOver, and Windows Narrator.</p>
        </div>
      </section>
    `;
    return container;
  },
};

// ─── Image Gallery with Landmarks ────────────────────────────────────────────

/**
 * Page with multiple landmarks and images.
 * 
 * Expected differences:
 * - NVDA: "graphic", "navigation landmark", "complementary", "content info"
 * - JAWS: "graphic", "navigation region", "complementary region", "content information region"
 * - VoiceOver: "image", "navigation", "complementary", "content information"  
 * - Narrator: "image", "navigation", "complementary", "content info"
 */
export const PageWithLandmarks: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <header>
        <nav aria-label="Primary">
          <a href="/">Home</a>
          <a href="/docs">Docs</a>
          <a href="/blog">Blog</a>
        </nav>
      </header>
      
      <main>
        <h1>Image Gallery</h1>
        <figure>
          <img src="sunset.jpg" alt="Sunset over the ocean" />
          <figcaption>A beautiful sunset captured at the coast</figcaption>
        </figure>
        <figure>
          <img src="mountains.jpg" alt="Mountain landscape" />
          <figcaption>Snow-capped peaks in winter</figcaption>
        </figure>
      </main>
      
      <aside aria-label="Related content">
        <h2>Related Articles</h2>
        <a href="/photo-tips">Photography Tips</a>
        <a href="/best-cameras">Best Cameras 2024</a>
      </aside>
      
      <footer>
        <p>© 2024 Speakable. All rights reserved.</p>
        <nav aria-label="Footer">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </nav>
      </footer>
    `;
    return container;
  },
};

// ─── Interactive Table ───────────────────────────────────────────────────────

/**
 * Data table with sortable headers and selectable rows.
 * 
 * Expected differences:
 * - NVDA: "table with X rows and Y columns", "column header"
 * - JAWS: "table with X rows and Y columns", "column header"
 * - VoiceOver: "table, X rows, Y columns"
 * - Narrator: "table, X rows, Y columns"
 */
export const DataTable: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <main>
        <h1>User Management</h1>
        <table aria-label="Users list">
          <thead>
            <tr>
              <th scope="col" aria-sort="ascending">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alice Johnson</td>
              <td>alice@example.com</td>
              <td>Admin</td>
              <td><span aria-label="Active status">Active</span></td>
            </tr>
            <tr>
              <td>Bob Smith</td>
              <td>bob@example.com</td>
              <td>Editor</td>
              <td><span aria-label="Inactive status">Inactive</span></td>
            </tr>
            <tr>
              <td>Carol Davis</td>
              <td>carol@example.com</td>
              <td>Viewer</td>
              <td><span aria-label="Active status">Active</span></td>
            </tr>
          </tbody>
        </table>
      </main>
    `;
    return container;
  },
};

// ─── Toggle Buttons and Pressed State ────────────────────────────────────────

/**
 * Toolbar with toggle buttons showing pressed/not-pressed states.
 * 
 * Expected differences:
 * - NVDA: "pressed"/"not pressed", "half pressed" for mixed
 * - JAWS: "pressed"/"not pressed", "partially pressed" for mixed
 * - VoiceOver: "pressed"/"not pressed", "mixed" for mixed
 * - Narrator: "pressed"/"not pressed", "partially pressed" for mixed
 */
export const ToggleButtons: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div role="toolbar" aria-label="Text formatting">
        <button aria-pressed="true" aria-label="Bold">B</button>
        <button aria-pressed="false" aria-label="Italic">I</button>
        <button aria-pressed="true" aria-label="Underline">U</button>
        <button aria-pressed="false" aria-label="Strikethrough">S</button>
      </div>
      
      <div role="toolbar" aria-label="View options">
        <button aria-pressed="true" aria-label="Grid view">Grid</button>
        <button aria-pressed="false" aria-label="List view">List</button>
        <button aria-pressed="mixed" aria-label="Compact mode">Compact</button>
      </div>
    `;
    return container;
  },
};

// ─── Dialog with Live Region ─────────────────────────────────────────────────

/**
 * Open dialog with form controls inside.
 * 
 * Expected differences:
 * - NVDA: "dialog"
 * - JAWS: "dialog"
 * - VoiceOver: "web dialog"
 * - Narrator: "dialog"
 */
export const DialogExample: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div role="dialog" aria-label="Confirm deletion" aria-modal="true">
        <h2>Delete Item?</h2>
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        <div role="status" aria-live="polite" aria-label="Status message">
          This will permanently remove the item from your account.
        </div>
        <button aria-label="Cancel deletion">Cancel</button>
        <button aria-label="Confirm deletion">Delete</button>
      </div>
    `;
    return container;
  },
};
