export default function ExamplesPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Examples</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Examples</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Common HTML patterns and their predicted screen reader output. Each example shows
          the HTML input and what NVDA, VoiceOver, and Narrator would announce.
        </p>
      </header>

      {EXAMPLES.map((ex) => (
        <section key={ex.title} className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{ex.title}</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">{ex.description}</p>
          <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-4">
            <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTML</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed text-blue-400">{ex.html}</pre>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg mb-4">
            <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">NVDA Output</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed text-green-400">{ex.nvda}</pre>
            </div>
          </div>
          {ex.voiceover && (
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg mb-4">
              <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">VoiceOver Output</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed text-purple-400">{ex.voiceover}</pre>
              </div>
            </div>
          )}
          {ex.narrator && (
            <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
              <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Narrator Output</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed text-amber-400">{ex.narrator}</pre>
              </div>
            </div>
          )}
        </section>
      ))}
    </>
  );
}

const EXAMPLES: {
  title: string;
  description: string;
  html: string;
  nvda: string;
  voiceover?: string;
  narrator?: string;
}[] = [
  {
    title: 'Button with aria-label',
    description: 'A button using aria-label overrides the visible text content for screen readers.',
    html: '<button aria-label="Submit payment">Pay now</button>',
    nvda: '"Submit payment, button"',
    voiceover: '"Submit payment, button"',
    narrator: '"Submit payment, button"',
  },
  {
    title: 'Navigation landmark',
    description:
      'A nav element with aria-label creates a named navigation landmark. Each screen reader announces landmarks differently.',
    html: '<nav aria-label="Main">\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</nav>',
    nvda: '"Main, navigation landmark\n  Home, link\n  About, link"',
    voiceover: '"navigation, Main\n  Home, link\n  About, link"',
    narrator: '"navigation, Main\n  link, Home\n  link, About"',
  },
  {
    title: 'Form with labels',
    description: 'Properly associated labels are announced before the input type.',
    html: '<label for="email">Email address</label>\n<input type="email" id="email" />',
    nvda: '"Email address, edit"',
    voiceover: '"Email address, edit text"',
    narrator: '"Email address, edit"',
  },
  {
    title: 'Heading hierarchy',
    description:
      'Headings are announced with their level. Screen readers let users navigate by heading level, so proper hierarchy matters.',
    html: '<h1>Welcome</h1>\n<h2>Getting Started</h2>\n<h3>Installation</h3>',
    nvda: '"Welcome, heading level 1\nGetting Started, heading level 2\nInstallation, heading level 3"',
    voiceover: '"heading level 1, Welcome\nheading level 2, Getting Started\nheading level 3, Installation"',
    narrator: '"Heading level 1, Welcome\nHeading level 2, Getting Started\nHeading level 3, Installation"',
  },
  {
    title: 'Checkbox with states',
    description:
      'Checkboxes announce their checked state. NVDA uses "not checked", VoiceOver uses "unchecked", and Narrator uses "unchecked" / "partially selected" for mixed state.',
    html: `<input type="checkbox" id="terms" />\n<label for="terms">Accept terms</label>\n\n<!-- Checked -->\n<input type="checkbox" id="news" checked />\n<label for="news">Subscribe</label>\n\n<!-- Mixed (indeterminate) -->\n<input type="checkbox" aria-checked="mixed" id="all" />\n<label for="all">Select all</label>`,
    nvda: '"Accept terms, checkbox, not checked\nSubscribe, checkbox, checked\nSelect all, checkbox, half checked"',
    voiceover: '"Accept terms, checkbox, unchecked\nSubscribe, checkbox, checked\nSelect all, checkbox, mixed"',
    narrator: '"Accept terms, check box, unchecked\nSubscribe, check box, checked\nSelect all, check box, partially selected"',
  },
  {
    title: 'Image with alt text',
    description:
      'Images with alt text are announced as graphics (NVDA/JAWS) or images (VoiceOver/Narrator). Images without alt text are flagged as missing accessible names in audit reports.',
    html: `<!-- With alt text -->\n<img src="logo.png" alt="Speakable logo" />\n\n<!-- Without alt text (accessibility issue) -->\n<img src="hero.png" />`,
    nvda: '"Speakable logo, graphic\ngraphic"',
    voiceover: '"Speakable logo, image\nimage"',
    narrator: '"Speakable logo, image\nimage"',
  },
  {
    title: 'Expandable button',
    description:
      'Buttons with aria-expanded announce their expanded/collapsed state. Useful for accordions, dropdowns, and disclosure widgets.',
    html: `<button aria-expanded="false">Show details</button>\n\n<!-- After clicking -->\n<button aria-expanded="true">Show details</button>`,
    nvda: '"Show details, button, collapsed\nShow details, button, expanded"',
    voiceover: '"Show details, button, collapsed\nShow details, button, expanded"',
    narrator: '"Show details, button, collapsed\nShow details, button, expanded"',
  },
  {
    title: 'Table structure',
    description:
      'Tables are announced with their dimensions. Each screen reader formats table announcements differently.',
    html: `<table>\n  <tr>\n    <th>Name</th>\n    <th>Role</th>\n  </tr>\n  <tr>\n    <td>Alice</td>\n    <td>Engineer</td>\n  </tr>\n</table>`,
    nvda: '"table\n  row\n    Name, column header\n    Role, column header\n  row\n    Alice\n    Engineer"',
    voiceover: '"table, 2 rows, 2 columns\n  row\n    Name, column header\n    Role, column header\n  row\n    Alice\n    Engineer"',
    narrator: '"table, 2 rows, 2 columns\n  row\n    Name, column header\n    Role, column header\n  row\n    Alice\n    Engineer"',
  },
  {
    title: 'Semantic diff',
    description:
      'Compare two HTML versions to detect accessibility changes. The diff shows added, removed, and changed nodes with property-level detail.',
    html: `# Before (old.html)\n<button>Save</button>\n\n# After (new.html)\n<button aria-label="Save document">Save</button>\n\n# CLI command\nspeakable new.html --diff old.html`,
    nvda: `# Diff output shows:\nChanged: root.children[0]\n  name: "Save" → "Save document"`,
  },
  {
    title: 'Selector filtering',
    description:
      'Use CSS selectors to narrow analysis to specific elements. Useful for component-level testing.',
    html: `<!-- page.html contains many elements -->\n<nav aria-label="Main">...</nav>\n<main>\n  <button>Submit</button>\n  <button>Cancel</button>\n</main>\n\n# Analyze only buttons\nspeakable page.html --selector "button"`,
    nvda: '"Submit, button\nCancel, button"',
    narrator: '"Submit, button\nCancel, button"',
  },
];
