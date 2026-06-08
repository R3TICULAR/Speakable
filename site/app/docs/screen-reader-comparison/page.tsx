import Link from "next/link";
import { RelatedPages } from "../../../components/RelatedPages";
import { SeeAlso } from "../../../components/SeeAlso";

export default function ScreenReaderComparisonPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Screen Reader Comparison</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Screen Reader Comparison</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          A side-by-side comparison of the four major screen readers used today: NVDA, JAWS, VoiceOver, and Narrator.
          Each has its own announcement patterns, terminology preferences, and interaction quirks. This guide documents
          those differences so you can understand what users actually hear when they navigate your interfaces. Keep in
          mind that this is approximate: actual behavior varies by screen reader version, browser pairing, operating
          system build, and individual user settings. No two setups produce identical output, but the patterns described
          here reflect default configurations as of mid-2024.
        </p>
      </header>

      {/* Section 1: Overview Table */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview Table</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The screen reader landscape is dominated by four products, each tied to specific platforms and browsers.
          Understanding their market positions, cost models, and default verbosity helps you prioritize testing
          and set expectations for what users will experience. The table below summarizes the key differences at a
          glance. Market share numbers come from the WebAIM Screen Reader User Survey and other accessibility
          community surveys. They shift year over year and vary significantly depending on whether you measure
          desktop-only or include mobile users.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Screen Reader</th>
                <th className="py-3 px-4 font-bold text-slate-900">Platform</th>
                <th className="py-3 px-4 font-bold text-slate-900">Browser</th>
                <th className="py-3 px-4 font-bold text-slate-900">Market Share</th>
                <th className="py-3 px-4 font-bold text-slate-900">Cost</th>
                <th className="py-3 px-4 font-bold text-slate-900">Verbosity</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">NVDA</td>
                <td className="py-3 px-4">Windows</td>
                <td className="py-3 px-4">Firefox, Chrome</td>
                <td className="py-3 px-4">~40% (desktop)</td>
                <td className="py-3 px-4">Free</td>
                <td className="py-3 px-4">Configurable</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">JAWS</td>
                <td className="py-3 px-4">Windows</td>
                <td className="py-3 px-4">Chrome, Edge</td>
                <td className="py-3 px-4">~30% (desktop)</td>
                <td className="py-3 px-4">$1000+ license</td>
                <td className="py-3 px-4">Verbose by default</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium text-slate-900">VoiceOver</td>
                <td className="py-3 px-4">macOS, iOS</td>
                <td className="py-3 px-4">Safari</td>
                <td className="py-3 px-4">~25% (desktop + mobile)</td>
                <td className="py-3 px-4">Built-in</td>
                <td className="py-3 px-4">Moderate</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Narrator</td>
                <td className="py-3 px-4">Windows</td>
                <td className="py-3 px-4">Edge</td>
                <td className="py-3 px-4">~5%</td>
                <td className="py-3 px-4">Built-in</td>
                <td className="py-3 px-4">Concise</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Note:</strong> Market share estimates vary significantly by survey methodology and user population.
            The WebAIM survey skews toward power users who actively respond to surveys. Mobile usage (where VoiceOver
            dominates on iOS) is often underrepresented in desktop-focused studies. These numbers are directional, not
            definitive.
          </p>
        </div>

        <p className="text-slate-600 mt-6 leading-relaxed">
          NVDA (NonVisual Desktop Access) is the most popular free screen reader on Windows. It&apos;s open source,
          actively developed by NV Access, and pairs best with Firefox, though Chrome support has improved
          significantly in recent years. Its verbosity is highly configurable, which means experienced users often
          reduce announcement detail to speed up navigation. For testing purposes, use NVDA&apos;s default settings
          to establish a baseline.
        </p>
        <p className="text-slate-600 mt-4 leading-relaxed">
          JAWS (Job Access With Speech) by Freedom Scientific is the oldest commercial screen reader still in
          active use. It dominated the market for decades before NVDA gained traction as a free alternative.
          JAWS is verbose by default: it announces more context about elements, uses slightly different terminology,
          and has deep customization options through its scripting language. Many enterprise accessibility teams still
          test primarily with JAWS because their user base includes long-time JAWS customers in corporate environments.
        </p>
        <p className="text-slate-600 mt-4 leading-relaxed">
          VoiceOver is Apple&apos;s built-in screen reader, available on macOS and iOS. On desktop, it pairs exclusively
          with Safari for web content. Using VoiceOver with Chrome on macOS produces inconsistent results. On iOS,
          VoiceOver is the dominant screen reader by a massive margin since there are no third-party alternatives.
          VoiceOver uses comma-separated announcements and tends to announce the name before the role, separated by
          a pause.
        </p>
        <p className="text-slate-600 mt-4 leading-relaxed">
          Narrator is Microsoft&apos;s built-in screen reader for Windows. It&apos;s seen major improvements in recent
          years and works best with Microsoft Edge. While its market share is small among experienced screen reader
          users, it&apos;s often the first screen reader that casual users encounter because it comes pre-installed.
          Narrator tends toward concise announcements, using fewer words than JAWS or VoiceOver for the same elements.
        </p>
      </section>

      {/* Section 2: How Each Reader Announces Common Patterns */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Each Reader Announces Common Patterns</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The most practical way to understand screen reader differences is to see exactly what each one says for
          the same HTML element. The table below shows the default announcement for common patterns. These are
          based on default verbosity settings with no user customizations applied. In practice, experienced users
          often reduce verbosity, change punctuation settings, or use custom dictionaries, but these defaults
          represent what a typical user hears out of the box.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Pay attention to the ordering patterns. NVDA and JAWS typically announce the accessible name followed by
          the role as a continuous phrase. VoiceOver and Narrator separate them with commas, creating a more
          punctuated rhythm. Neither approach is better; they&apos;re just different conventions that users adapt to
          over time. The important thing is that the semantic information is complete and correct, regardless of
          presentation order.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Element</th>
                <th className="py-3 px-4 font-bold text-slate-900">NVDA</th>
                <th className="py-3 px-4 font-bold text-slate-900">JAWS</th>
                <th className="py-3 px-4 font-bold text-slate-900">VoiceOver</th>
                <th className="py-3 px-4 font-bold text-slate-900">Narrator</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 font-mono text-xs">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">Link</td>
                <td className="py-3 px-4">&quot;Home link&quot;</td>
                <td className="py-3 px-4">&quot;Home link&quot;</td>
                <td className="py-3 px-4">&quot;Home, link&quot;</td>
                <td className="py-3 px-4">&quot;Home, link&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">Button</td>
                <td className="py-3 px-4">&quot;Submit button&quot;</td>
                <td className="py-3 px-4">&quot;Submit button&quot;</td>
                <td className="py-3 px-4">&quot;Submit, button&quot;</td>
                <td className="py-3 px-4">&quot;Submit, button&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">Heading h2</td>
                <td className="py-3 px-4">&quot;heading level 2 About&quot;</td>
                <td className="py-3 px-4">&quot;About heading level 2&quot;</td>
                <td className="py-3 px-4">&quot;About, heading level 2&quot;</td>
                <td className="py-3 px-4">&quot;About, heading, level 2&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">Checkbox (checked)</td>
                <td className="py-3 px-4">&quot;Accept checkbox checked&quot;</td>
                <td className="py-3 px-4">&quot;Accept check box checked&quot;</td>
                <td className="py-3 px-4">&quot;Accept, ticked, checkbox&quot;</td>
                <td className="py-3 px-4">&quot;Accept, checkbox, checked&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">Navigation landmark</td>
                <td className="py-3 px-4">&quot;Main navigation landmark&quot;</td>
                <td className="py-3 px-4">&quot;Main navigation region&quot;</td>
                <td className="py-3 px-4">&quot;navigation, Main&quot;</td>
                <td className="py-3 px-4">&quot;navigation, Main&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">Required input</td>
                <td className="py-3 px-4">&quot;Email edit required&quot;</td>
                <td className="py-3 px-4">&quot;Email edit type in text&quot;</td>
                <td className="py-3 px-4">&quot;Email, required, text field&quot;</td>
                <td className="py-3 px-4">&quot;Email, edit, required&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">Expanded button</td>
                <td className="py-3 px-4">&quot;Menu button expanded&quot;</td>
                <td className="py-3 px-4">&quot;Menu button expanded&quot;</td>
                <td className="py-3 px-4">&quot;Menu, expanded, pop-up button&quot;</td>
                <td className="py-3 px-4">&quot;Menu, button, expanded&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">Image</td>
                <td className="py-3 px-4">&quot;graphic Company logo&quot;</td>
                <td className="py-3 px-4">&quot;Company logo graphic&quot;</td>
                <td className="py-3 px-4">&quot;Company logo, image&quot;</td>
                <td className="py-3 px-4">&quot;Company logo, image&quot;</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">List</td>
                <td className="py-3 px-4">&quot;list with 5 items&quot;</td>
                <td className="py-3 px-4">&quot;list of 5 items&quot;</td>
                <td className="py-3 px-4">&quot;list, 5 items&quot;</td>
                <td className="py-3 px-4">&quot;list, 5 items&quot;</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-sm font-medium text-slate-900">Alert</td>
                <td className="py-3 px-4">&quot;alert Error message&quot;</td>
                <td className="py-3 px-4">&quot;Alert Error message&quot;</td>
                <td className="py-3 px-4">&quot;Error message&quot;</td>
                <td className="py-3 px-4">&quot;alert, Error message&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 mt-6 leading-relaxed">
          Notice that VoiceOver doesn&apos;t announce &quot;alert&quot; as a separate word for the alert role. It
          relies on the distinct audio cue (a sound effect) to signal the alert, then reads only the message content.
          This is a common pattern with VoiceOver: it uses audio cues more aggressively than other readers, reducing
          spoken verbosity while still conveying role information through non-speech sounds. Narrator and NVDA prefer
          to speak the role explicitly, which makes them slightly more verbose but also more predictable for users who
          aren&apos;t familiar with all the audio cues.
        </p>
        <p className="text-slate-600 mt-4 leading-relaxed">
          The heading announcements show another interesting divergence. NVDA announces the role and level first
          (&quot;heading level 2&quot;), then the content. JAWS puts the content first, then the role metadata.
          VoiceOver and Narrator both lead with content but differ in how they break up the level information.
          These ordering differences are purely presentational. All four readers convey the same semantic
          information (name, role, level), just in different sequences.
        </p>
      </section>

      {/* Section 3: Key Behavioral Differences */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Key Behavioral Differences</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Beyond the element-level announcement patterns shown above, screen readers differ in several systematic
          ways. These behavioral differences affect how users perceive your interface and can influence design
          decisions around labeling, state communication, and landmark structure. Understanding these patterns
          helps you write markup that works well everywhere rather than optimizing for a single reader.
        </p>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Announcement Order</h3>
            <p className="text-slate-600 leading-relaxed">
              NVDA and JAWS concatenate the accessible name and role into a single phrase without punctuation:
              &quot;Submit button&quot;, &quot;Home link&quot;. VoiceOver and Narrator insert a comma between
              name and role: &quot;Submit, button&quot;, &quot;Home, link&quot;. This creates a slight pause
              in speech synthesis that separates the label from the type. Both approaches are valid: the
              comma-separated style can be clearer for complex names, while the concatenated style feels faster
              for simple elements. Neither approach requires any developer action to work correctly; it&apos;s
              purely a reader-side presentation choice.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Landmark Terminology</h3>
            <p className="text-slate-600 leading-relaxed">
              When announcing landmark regions (navigation, main, complementary, etc.), NVDA uses the word
              &quot;landmark&quot; explicitly: &quot;Main navigation landmark&quot;. JAWS uses the word
              &quot;region&quot; instead: &quot;Main navigation region&quot;. VoiceOver and Narrator announce
              the landmark role as a prefix followed by the label: &quot;navigation, Main&quot;. This
              terminology difference is worth knowing because if a user reports hearing &quot;region&quot;
              vs &quot;landmark&quot;, it tells you which screen reader they&apos;re using. From a development
              perspective, all four readers correctly identify the same landmark. The terminology is cosmetic.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Disabled State</h3>
            <p className="text-slate-600 leading-relaxed">
              The way screen readers communicate that an element is disabled (via the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">disabled</code> attribute
              or <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">aria-disabled=&quot;true&quot;</code>) varies
              significantly in word choice. NVDA says &quot;unavailable&quot;, a term that clearly communicates
              the element exists but cannot be interacted with. VoiceOver says &quot;dimmed&quot;, a visual
              metaphor that originated from macOS native UI conventions where disabled controls appear grayed out.
              Narrator says &quot;disabled&quot;, the most literal and technical term. JAWS varies between
              &quot;unavailable&quot; and &quot;grayed&quot; depending on context and version. Despite different
              words, users of each reader understand the meaning. You don&apos;t need to add extra ARIA to
              compensate for these differences. Just use the standard disabled pattern.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Images</h3>
            <p className="text-slate-600 leading-relaxed">
              When encountering an image with alt text, NVDA announces it as &quot;graphic&quot; followed by the
              alt text: &quot;graphic Company logo&quot;. VoiceOver and Narrator both use &quot;image&quot; as
              the role word: &quot;Company logo, image&quot;. JAWS varies: in some versions it says
              &quot;graphic&quot; and in others &quot;image&quot;, and the position relative to the alt text
              can change with settings. The key takeaway: always provide meaningful alt text, and don&apos;t
              worry about whether users hear &quot;graphic&quot; or &quot;image&quot;. Both words are universally
              understood by screen reader users to mean &quot;this is a non-text visual element.&quot;
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Checkboxes</h3>
            <p className="text-slate-600 leading-relaxed">
              Unchecked checkboxes demonstrate vocabulary differences clearly. NVDA says &quot;not checked&quot;,
              direct and unambiguous. VoiceOver says &quot;unticked&quot;, using the British English metaphor of
              a tick mark. Narrator says &quot;unchecked&quot;, a simple prefix negation. For checked state,
              VoiceOver says &quot;ticked&quot; while others say &quot;checked&quot;. These are cosmetic vocabulary
              choices that don&apos;t affect usability. Users learn their reader&apos;s vocabulary quickly and
              never confuse the meaning.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Form Fields</h3>
            <p className="text-slate-600 leading-relaxed">
              Text inputs reveal some of the biggest divergences in announcement style. JAWS says &quot;type in
              text&quot; as a prompt, actively instructing the user what to do. NVDA says &quot;edit blank&quot;
              for an empty field or &quot;edit&quot; followed by the current value if populated, a more
              descriptive approach. VoiceOver says &quot;text field&quot;, clean and minimal. These differences
              mean that automated testing output will look different for each reader, but the semantic content
              (this is a text input, here is its label, here is its current value) remains consistent across
              all four readers.
            </p>
          </div>
        </div>

        <SeeAlso
          href="/docs/advanced-guide"
          title="Advanced Guide: Cross-reader debugging"
          description="Techniques for debugging accessibility issues that manifest differently across screen readers."
        />
      </section>

      {/* Section 4: How Speakable Models These Differences */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">How Speakable Models These Differences</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Speakable includes dedicated rendering engines for each of the four major screen readers. Rather than
          producing a single generic output, it applies the specific announcement patterns, vocabulary choices,
          and ordering conventions documented above. When you run Speakable against a piece of HTML, you get
          four distinct outputs that approximate what each reader would say.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Each renderer is built around the default verbosity settings for its target screen reader. NVDA&apos;s
          renderer uses concatenated name-role patterns and the &quot;graphic&quot;/&quot;unavailable&quot;/&quot;not
          checked&quot; vocabulary. JAWS&apos;s renderer applies &quot;region&quot; for landmarks and &quot;type in
          text&quot; for form fields. VoiceOver&apos;s renderer uses comma separation, &quot;dimmed&quot; for disabled
          state, and &quot;ticked&quot;/&quot;unticked&quot; for checkboxes. Narrator&apos;s renderer uses comma
          separation with the &quot;disabled&quot; vocabulary and concise phrasing.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          It&apos;s important to note that each real screen reader has extensive verbosity configuration. Users can
          increase or decrease how much information gets spoken, change punctuation behavior, and even create custom
          pronunciation dictionaries. Speakable models the default experience: what a user hears on a fresh
          installation with no customization. This represents the most common baseline and is the appropriate target
          for development-time testing.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The renderers are deterministic. The same HTML always produces the same output for a given screen reader
          target. This makes them suitable for snapshot testing, CI/CD assertions, and regression detection. If your
          HTML changes in a way that alters the predicted screen reader output, Speakable will flag it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">menu_book</span>
            API Reference: Renderer functions
          </Link>
          <Link
            href="/docs/advanced-guide"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">bug_report</span>
            Advanced Guide: Cross-reader debugging
          </Link>
        </div>
      </section>

      {/* Section 5: Practical Implications for Developers */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Practical Implications for Developers</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Now that you understand how screen readers differ, the natural question is: what should you actually do
          about it? The answer is simpler than you might expect. The differences documented above are presentation-layer
          concerns. They affect how information is spoken, not what information is available. Your job as a developer
          is to provide correct semantic structure; each screen reader handles the presentation according to its own
          conventions.
        </p>

        <div className="space-y-6 mb-8">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-blue-600 mt-0.5 shrink-0" aria-hidden="true">do_not_disturb</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Don&apos;t try to make all readers say the same thing</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Each reader has its own vocabulary and ordering conventions developed over decades. Users are fluent in
                their reader&apos;s language. Attempting to force uniformity (e.g., adding extra ARIA to make VoiceOver
                announce things more like NVDA) creates confusion rather than clarity. Embrace the differences. They
                exist for good reasons and users expect them.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-blue-600 mt-0.5 shrink-0" aria-hidden="true">code</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Focus on correct semantic structure</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Use the right HTML elements. Add labels to form fields. Provide alt text for images. Set ARIA states
                correctly. If your semantics are right, every screen reader will convey the correct meaning, just
                with different words and ordering. The accessibility tree is your contract; how readers present it is
                their responsibility.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-blue-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Test that meaning is preserved, not exact wording</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                When reviewing Speakable output across readers, ask: &quot;Does each reader convey the same functional
                information?&quot; Not: &quot;Do they all say the exact same words?&quot; A button labeled
                &quot;Delete&quot; might be announced as &quot;Delete button&quot; (NVDA) or &quot;Delete, button&quot;
                (VoiceOver), both correct. A missing label is a problem regardless of reader; different wording for
                the same semantic content is not.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-blue-600 mt-0.5 shrink-0" aria-hidden="true">compare_arrows</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">View all outputs simultaneously</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Speakable shows all four screen reader outputs side by side using the <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">-s all</code> flag.
                This is the fastest way to spot issues that affect one reader but not others, for example, a landmark
                that NVDA announces correctly but VoiceOver skips due to a missing label.
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-3">CLI Commands</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Use the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">-s</code> flag to target specific
          screen readers or view all outputs at once:
        </p>
        <div className="rounded-xl overflow-hidden bg-slate-900 shadow-2xl mb-6">
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-slate-300">
{`# Show all four screen reader outputs
speakable analyze index.html -s all

# Check individual readers
speakable analyze index.html -s nvda
speakable analyze index.html -s jaws
speakable analyze index.html -s voiceover
speakable analyze index.html -s narrator`}
            </pre>
          </div>
        </div>

        <p className="text-slate-600 mb-4 leading-relaxed">
          The <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-mono">-s all</code> output groups results
          by screen reader with clear headers, making it easy to scan for inconsistencies. When running in CI, you can
          assert against individual reader outputs to catch regressions specific to one reader&apos;s rendering path.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          For programmatic use, the renderer functions are available individually through the JavaScript API. Each
          renderer takes the same parsed accessibility tree and applies its own formatting rules, so you can integrate
          cross-reader testing directly into your test suite without spawning CLI processes.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-sm font-bold text-blue-900 mb-2">Important caveat</p>
          <p className="text-sm text-blue-800 leading-relaxed">
            Speakable approximates screen reader behavior. Actual output varies by version, settings, and browser.
            Always validate complex interactions with real assistive technology. Speakable is a development-time
            linter, not a replacement for manual testing with actual screen readers. Use it to catch obvious issues
            early and to maintain consistency across code changes. Then confirm critical flows with real AT before
            shipping.
          </p>
        </div>
      </section>

      <RelatedPages
        pages={[
          {
            href: "/docs/advanced-guide",
            title: "Advanced Guide",
            description: "Deep dive into advanced Speakable features including cross-reader debugging and custom configurations.",
          },
          {
            href: "/docs/how-screen-readers-work",
            title: "How Screen Readers Work",
            description: "Understand the pipeline from HTML to spoken output: the accessibility tree, browse mode, and rendering.",
          },
          {
            href: "/docs/aria-roles",
            title: "ARIA Roles",
            description: "Complete reference for ARIA roles, how they map to the accessibility tree, and when to use them.",
          },
          {
            href: "/docs/usage-guide",
            title: "Usage Guide",
            description: "Getting started with Speakable: installation, basic commands, and common workflows.",
          },
        ]}
      />
    </>
  );
}
