import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";
import { SeeAlso } from "../../../components/SeeAlso";

export default function HowScreenReadersWorkPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">How Screen Readers Work</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">How Screen Readers Work</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Screen readers are assistive technologies that convert visual interfaces into spoken or braille output,
          enabling people who are blind or have low vision to navigate software independently. They don&apos;t &quot;see&quot;
          your page the way a sighted user does. Instead, they rely on a structured representation of your content
          built by the browser. Understanding this pipeline (how HTML becomes speech) helps developers write more
          accessible markup from the start. When you know what a screen reader actually receives, you can anticipate
          problems before they reach users: missing labels, broken relationships, invisible states. This page walks
          through that pipeline end to end, from raw HTML to spoken output, and shows how Speakable fits into the
          picture as a static analysis tool that mirrors part of the same process.
        </p>
      </header>

      {/* Section 1: The Accessibility Tree */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">The Accessibility Tree</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When a browser parses your HTML and builds the DOM (Document Object Model), it also constructs a parallel
          data structure called the <strong>accessibility tree</strong>. This tree is a simplified version of the DOM
          that strips away everything visual (colors, font sizes, layout) and exposes only what assistive
          technologies need to communicate your interface to users.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The accessibility tree exposes four categories of information for each node:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2 leading-relaxed">
          <li><strong>Role</strong>: what the element is (button, link, heading, list, navigation landmark)</li>
          <li><strong>Name</strong>: the accessible name, computed from text content, labels, or ARIA attributes</li>
          <li><strong>State</strong>: current status like checked, expanded, disabled, required</li>
          <li><strong>Relationships</strong>: how elements connect to each other (label-to-input, description-to-control, group membership)</li>
        </ul>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
          <p className="text-sm font-bold text-slate-700 mb-2">Key concept</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The accessibility tree is not a theoretical model. It&apos;s an actual data structure that browsers expose
            through platform accessibility APIs. You can inspect it in Chrome DevTools (Accessibility tab), Firefox
            (Accessibility Inspector), or Safari (Web Inspector &gt; Node &gt; Accessibility).
          </p>
        </div>

        <p className="text-slate-600 mb-4 leading-relaxed">
          Here&apos;s a comparison showing how a navigation structure maps from DOM to accessibility tree:
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">DOM vs Accessibility Tree</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`DOM:                          Accessibility Tree:
<nav aria-label="Main">       navigation "Main"
  <ul>                          list
    <li>                          listitem
      <a href="/">Home</a>          link "Home"
    </li>                         
  </ul>                         
</nav>`}
            </pre>
          </div>
        </div>

        <p className="text-slate-600 mb-4 leading-relaxed">
          Notice how the tree flattens the structure. The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;nav&gt;</code> element
          becomes a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">navigation</code> role with
          the name &quot;Main&quot; (from <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-label</code>).
          The anchor tag becomes a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">link</code> role
          with the name &quot;Home&quot; (from its text content). Structural elements
          like <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;ul&gt;</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;li&gt;</code> map
          to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">list</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">listitem</code> roles.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Not every DOM node appears in the accessibility tree. Elements that exist purely for visual purposes,
          decorative images with empty <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">alt=&quot;&quot;</code>,
          wrapper <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;div&gt;</code>s and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;span&gt;</code>s
          used for layout, are pruned from the tree. Similarly, elements hidden
          with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">display: none</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">visibility: hidden</code>,
          or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-hidden=&quot;true&quot;</code> are
          excluded entirely. This is by design: the tree represents what should be communicated, not what is rendered visually.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Conversely, elements hidden visually but present for screen readers (using techniques like the
          &quot;visually-hidden&quot; CSS pattern) remain in the accessibility tree. This asymmetry is intentional: it
          gives developers fine-grained control over what assistive technology users perceive versus what sighted users see.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Generic elements like <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;div&gt;</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;span&gt;</code> without
          explicit roles are typically represented as generic containers or flattened entirely. Their children are exposed
          but the container itself carries no semantic meaning. This is why &quot;div soup&quot; is problematic for
          accessibility: without semantic elements, the accessibility tree becomes a flat list of text nodes with no
          structural information for the screen reader to convey to users. Using native HTML elements
          like <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;nav&gt;</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;main&gt;</code>, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;button&gt;</code>,
          and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;h1&gt;</code> to <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">&lt;h6&gt;</code> ensures
          the tree carries meaningful structure automatically.
        </p>
      </section>

      {/* Section 2: From HTML to Speech */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">From HTML to Speech: The Pipeline</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Understanding the full path from HTML source code to spoken words helps demystify screen reader behavior.
          The pipeline has distinct stages, each owned by a different piece of software:
        </p>

        <div className="space-y-4 text-sm text-slate-600 mb-6">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <div>
              <p className="font-bold text-slate-900 mb-1">Browser parses HTML → DOM</p>
              <p>The browser reads your HTML source and constructs the Document Object Model, a live, in-memory tree of elements, attributes, and text nodes.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <div>
              <p className="font-bold text-slate-900 mb-1">Browser builds Accessibility Tree from DOM</p>
              <p>Using ARIA mappings, HTML semantics, and computed styles, the browser generates the accessibility tree. This is where roles, names, states, and relationships are determined.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <div>
              <p className="font-bold text-slate-900 mb-1">Screen reader queries via Platform Accessibility API</p>
              <p>The screen reader doesn&apos;t read the DOM directly. It communicates with the browser through the operating system&apos;s accessibility API: MSAA/UIA on Windows, NSAccessibility on macOS, AT-SPI on Linux.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <div>
              <p className="font-bold text-slate-900 mb-1">Screen reader converts to speech/braille output</p>
              <p>The screen reader takes the role, name, state, and value information and formats it into natural language that gets sent to a speech synthesizer or braille display.</p>
            </div>
          </div>
        </div>

        <p className="text-slate-600 mb-4 leading-relaxed">
          Here&apos;s the full pipeline as a flow:
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Pipeline Flow</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`HTML Source → DOM → Accessibility Tree → Platform API → Screen Reader → Speech`}
            </pre>
          </div>
        </div>

        <p className="text-slate-600 mb-4 leading-relaxed">
          Each stage introduces potential failure points. If your HTML lacks semantic structure, the DOM won&apos;t carry
          meaningful information forward. If ARIA attributes are misused, the accessibility tree will contain incorrect
          data. If the platform API has bugs (they do), even correct HTML might be announced poorly. And each screen
          reader has its own interpretation logic. NVDA, JAWS, VoiceOver, and Narrator can all announce the same
          accessibility tree differently.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
          <p className="text-sm font-bold text-slate-700 mb-2">How Speakable mirrors this</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Speakable&apos;s analysis pipeline replicates the browser&apos;s portion of this flow:
            {" "}<code className="rounded bg-white px-1.5 py-0.5 text-xs font-mono border border-slate-200">HTML → parse → extract → model → render</code>.
            It parses HTML into a DOM-like structure, extracts an accessibility tree representation, models how each
            screen reader would interpret it, and renders the predicted speech output. This gives you visibility into
            steps 1-4 without needing to run an actual screen reader.
          </p>
        </div>

        <SeeAlso
          href="/docs"
          title="API Reference - Pipeline stages"
          description="See the parse, extract, and render functions that mirror each pipeline stage."
        />
      </section>

      {/* Section 3: Browse Mode vs Focus Mode */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Browse Mode vs Focus Mode</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Screen readers operate in two primary interaction modes. Understanding these modes is essential because they
          determine what gets announced and how users navigate your content.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Browse Mode (Virtual Cursor)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              In browse mode, the screen reader maintains a virtual cursor that moves through <em>all</em> content
              on the page: headings, paragraphs, links, images, lists, everything. Users navigate linearly with
              arrow keys, or jump between elements using shortcut keys (H for headings, K for links, T for tables).
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              This is the default mode. Everything in the accessibility tree is reachable. The screen reader announces
              each element as the virtual cursor lands on it, reading out the role, name, and any relevant state.
            </p>
          </div>
          <div className="p-6 border border-slate-200 rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Focus Mode (Forms Mode)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              In focus mode, keyboard events pass directly to interactive controls. Users interact with form fields,
              type text, select options, and press buttons. Only focusable elements are reachable; static text and
              headings between form controls are skipped.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              The switch from browse to focus mode happens automatically when a user activates certain controls:
              pressing Enter on a text input, entering a composite widget like a listbox, or activating an application
              role region.
            </p>
          </div>
        </div>

        <p className="text-slate-600 mb-4 leading-relaxed">
          The mode switch changes the announcement model dramatically. In browse mode, a form might be announced as:
          &quot;heading level 2, Contact Form, name, edit text, required, email, edit text, required, submit, button.&quot;
          Every label, every piece of descriptive text between fields is read. In focus mode, the user tabs between
          controls and hears only: &quot;name, edit text, required&quot; → &quot;email, edit text, required&quot; →
          &quot;submit, button.&quot; The surrounding prose vanishes from the interaction model.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          This distinction matters for developers because it affects how you structure forms. Instructions placed
          as plain text between inputs will be heard in browse mode but missed in focus mode. To ensure critical
          instructions reach users in both modes, associate them with
          controls using <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-describedby</code>.
          This makes the description part of the control&apos;s announced information regardless of mode.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Some screen readers also support an &quot;auto forms mode&quot; setting, where focus mode activates automatically
          when the virtual cursor encounters a form control. NVDA enables this by default; JAWS requires a setting change.
          This means that some users will never hear the browse-mode version of your form. They&apos;ll land on the first
          input and immediately enter focus mode. Design your forms with this in mind: every input needs a properly
          associated label, and critical instructions should be linked via <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-describedby</code> rather
          than relying on surrounding text.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <p className="text-sm font-bold text-slate-700 mb-2">Speakable and browse mode</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Speakable&apos;s output corresponds to <strong>browse mode</strong> announcements. It walks through all content
            linearly, announcing every accessible element in document order. This is the most comprehensive view of
            what a screen reader user would encounter when first landing on your page and reading through it.
          </p>
        </div>
      </section>

      {/* Section 4: What Gets Announced */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Gets Announced</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          When a screen reader encounters an element, it assembles an announcement from the accessibility tree node&apos;s
          properties following a general pattern: <strong>Role → Name → State → Value</strong>. However, the exact
          ordering and phrasing varies between screen readers.
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-start gap-4">
              <code className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0 mt-0.5">Example 1</code>
              <div>
                <p className="text-sm text-slate-900 font-bold mb-1">A submit button</p>
                <p className="text-sm text-slate-600 mb-2">
                  HTML: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">&lt;button&gt;Submit&lt;/button&gt;</code>
                </p>
                <div className="rounded-lg overflow-hidden bg-slate-900 px-4 py-3">
                  <p className="text-xs font-mono text-emerald-400">NVDA: &quot;Submit, button&quot;</p>
                  <p className="text-xs font-mono text-emerald-400">VoiceOver: &quot;Submit, button&quot;</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">role=button, name=&quot;Submit&quot;</p>
              </div>
            </div>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-start gap-4">
              <code className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0 mt-0.5">Example 2</code>
              <div>
                <p className="text-sm text-slate-900 font-bold mb-1">A required email input</p>
                <p className="text-sm text-slate-600 mb-2">
                  HTML: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">&lt;input type=&quot;email&quot; aria-label=&quot;Email&quot; required /&gt;</code>
                </p>
                <div className="rounded-lg overflow-hidden bg-slate-900 px-4 py-3">
                  <p className="text-xs font-mono text-emerald-400">NVDA: &quot;Email, edit, required&quot;</p>
                  <p className="text-xs font-mono text-emerald-400">VoiceOver: &quot;Email, required, text field&quot;</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">role=textbox, name=&quot;Email&quot;, state=required</p>
              </div>
            </div>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <div className="flex items-start gap-4">
              <code className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0 mt-0.5">Example 3</code>
              <div>
                <p className="text-sm text-slate-900 font-bold mb-1">An expanded disclosure widget</p>
                <p className="text-sm text-slate-600 mb-2">
                  HTML: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">&lt;button aria-expanded=&quot;true&quot;&gt;Menu&lt;/button&gt;</code>
                </p>
                <div className="rounded-lg overflow-hidden bg-slate-900 px-4 py-3">
                  <p className="text-xs font-mono text-emerald-400">NVDA: &quot;Menu, button, expanded&quot;</p>
                  <p className="text-xs font-mono text-emerald-400">JAWS: &quot;Menu, button, expanded&quot;</p>
                  <p className="text-xs font-mono text-emerald-400">VoiceOver: &quot;Menu, expanded, pop-up button&quot;</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">role=button, name=&quot;Menu&quot;, state=expanded</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-600 mb-4 leading-relaxed">
          Notice the differences between screen readers. NVDA typically follows a <strong>name → role → state</strong> pattern.
          VoiceOver sometimes places role last, sometimes inserts state between name and role, and uses different terminology
          (e.g., &quot;pop-up button&quot; instead of just &quot;button&quot;). JAWS closely matches NVDA for many elements
          but diverges on complex widgets. Narrator has its own patterns on Windows, often being more verbose about states.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          These differences aren&apos;t bugs. They&apos;re design decisions by each screen reader vendor based on user research
          and conventions in their user communities. As a developer, your job isn&apos;t to control the exact output phrasing.
          Instead, focus on providing the right <em>inputs</em>: correct roles (use semantic HTML), meaningful names
          (labels and text content), and accurate states (ARIA attributes that reflect current UI state).
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Beyond individual elements, screen readers also announce <strong>context changes</strong>: entering and leaving
          landmarks (&quot;navigation region&quot;), list boundaries (&quot;list, 5 items&quot;), table dimensions
          (&quot;table, 3 columns, 10 rows&quot;), and heading levels (&quot;heading level 2&quot;). These structural
          announcements help users build a mental model of your page&apos;s organization.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Understanding what gets announced also means understanding what does <em>not</em> get announced. Decorative
          images (with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">alt=&quot;&quot;</code>),
          elements with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-hidden=&quot;true&quot;</code>,
          and presentation-role elements are skipped entirely. CSS-generated content
          (via <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">::before</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">::after</code>)
          is handled inconsistently. Some screen readers announce it, others don&apos;t. Avoid relying on pseudo-elements
          for meaningful content.
        </p>

        <div className="mt-6">
          <SeeAlso
            href="/docs/screen-reader-comparison"
            title="Screen Reader Comparison"
            description="Detailed side-by-side comparison of how NVDA, JAWS, VoiceOver, and Narrator handle different element types."
          />
        </div>
      </section>

      {/* Section 5: How Speakable Fits In */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Speakable Fits In</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable performs <strong>static analysis</strong> of HTML. It replicates step 2 of the pipeline described
          above. Given HTML input, it builds an accessibility tree representation, computes accessible names using the
          same algorithm browsers use (the{" "}
          <Link href="https://www.w3.org/TR/accname-1.2/" className="text-blue-600 hover:text-blue-800 underline">
            Accessible Name and Description Computation
          </Link>
          ), and then models how each screen reader would format the resulting information into speech.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 border border-green-200 rounded-xl bg-green-50/50">
            <h3 className="text-sm font-bold text-green-800 mb-3">Best for</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                Catching structural issues (missing labels, broken landmark hierarchy, invalid ARIA)
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                Regression testing: detecting when a refactor changes what screen readers would announce
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                CI/CD integration: automated checks on every pull request
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                Fast iteration: immediate feedback without launching a screen reader
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                Education: understanding what screen readers receive from your HTML
              </li>
            </ul>
          </div>
          <div className="p-6 border border-amber-200 rounded-xl bg-amber-50/50">
            <h3 className="text-sm font-bold text-amber-800 mb-3">Limitations</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex gap-2">
                <span className="text-amber-600 shrink-0">△</span>
                Doesn&apos;t execute JavaScript: dynamic content changes won&apos;t be captured
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 shrink-0">△</span>
                Doesn&apos;t simulate user interaction (focus, click, type): no focus-mode testing
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 shrink-0">△</span>
                Can&apos;t detect timing issues (live regions that fire too fast, race conditions)
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 shrink-0">△</span>
                Screen reader heuristics vary by version. Predictions are approximations.
              </li>
            </ul>
          </div>
        </div>

        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable is a <strong>complement to</strong>, not a replacement for, testing with actual screen readers and
          real users. Think of it like a linter for accessibility: it catches a wide class of issues automatically and
          gives you fast feedback, but it can&apos;t fully replicate the experience of navigating your app with assistive
          technology. The testing pyramid for accessibility looks like this:
        </p>

        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Accessibility Testing Pyramid</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`                    ╱╲
                   ╱  ╲         User testing with disabled people
                  ╱    ╲        (highest fidelity, lowest frequency)
                 ╱──────╲
                ╱        ╲      Manual screen reader testing
               ╱          ╲    (NVDA, VoiceOver, JAWS)
              ╱────────────╲
             ╱              ╲   Automated tools: Speakable, axe, Lighthouse
            ╱                ╲  (fast feedback, CI/CD, broad coverage)
           ╱──────────────────╲
          ╱                    ╲ Semantic HTML & ARIA linting
         ╱______________________╲(foundation — catches basics early)`}
            </pre>
          </div>
        </div>

        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable sits in the automation layer. It gives development teams the confidence to ship accessible HTML by
          providing continuous validation. When it flags an issue, you know something is wrong structurally. When it
          passes, you have a strong baseline, but you should still validate complex interactions with manual testing.
        </p>
        <p className="text-slate-600 leading-relaxed">
          For a practical guide on integrating Speakable into your workflow, including snapshot testing, CI pipeline
          configuration, and combining it with manual testing, see the{" "}
          <Link href="/docs/advanced-guide" className="text-blue-600 hover:text-blue-800 underline">Usage Guide</Link>
          {" "}and{" "}
          <Link href="/docs/cicd-integration" className="text-blue-600 hover:text-blue-800 underline">CI/CD Integration</Link>
          {" "}pages.
        </p>
      </section>

      <RelatedPages
        pages={[
          {
            href: "/docs/aria-roles",
            title: "ARIA Roles",
            description: "Complete reference for ARIA roles, how they map to the accessibility tree, and when to use them.",
          },
          {
            href: "/docs/testing-checklist",
            title: "Testing Checklist",
            description: "Step-by-step checklist for validating accessibility across your application.",
          },
          {
            href: "/docs/screen-reader-comparison",
            title: "Screen Reader Comparison",
            description: "Side-by-side comparison of how NVDA, JAWS, VoiceOver, and Narrator announce elements.",
          },
          {
            href: "/docs",
            title: "API Reference",
            description: "Full API documentation for Speakable's parse, extract, and render pipeline.",
          },
        ]}
      />
    </>
  );
}
