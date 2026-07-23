import Link from "next/link";
import type { Metadata } from "next";
import { RelatedPages } from "../../../components/RelatedPages";
import { SeeAlso } from "../../../components/SeeAlso";

export const metadata: Metadata = {
  title: "Screen Reader Accessibility Testing Strategy",
  description: "Build a screen reader testing strategy combining automated prediction with manual verification. Plan coverage across NVDA, JAWS, and VoiceOver.",
};

export default function TestingStrategyPage() {
  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-slate-600 transition-colors">Docs</Link>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">Testing Strategy</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Screen Reader Accessibility Testing Strategy</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          A screen reader accessibility testing strategy requires more than good intentions. It requires a structured program
          that catches issues early, measures progress over time, and balances automation with human judgment.
          This guide helps teams build a comprehensive accessibility testing strategy. It covers what to automate,
          what requires manual testing, and how to measure progress. Whether you are starting from scratch or
          maturing an existing program, the framework here scales from a single developer running lint rules
          to a full organization with dedicated accessibility champions and user testing panels.
        </p>
      </header>

      {/* Section 1: Shift-Left Testing */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Shift-Left Testing</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The principle behind shift-left testing is simple: the earlier you catch a problem, the cheaper it is to
          fix. An accessibility issue caught during design review might take five minutes to resolve. The same
          issue found in production after launch could require a full sprint of rework, affect real users in the
          meantime, and carry legal risk. Every stage in your development pipeline presents an opportunity to
          catch different categories of accessibility issues.
        </p>
        <p className="text-slate-600 mb-6 leading-relaxed">
          The key insight is that each stage catches different types of problems. Design review catches structural
          issues (missing focus states, insufficient contrast in mockups, unclear interaction patterns). Development
          catches implementation issues (missing ARIA attributes, broken keyboard navigation). Code review catches
          patterns that automated tools miss (whether alt text is actually meaningful, whether focus management
          makes sense in context). CI catches regressions. Staging catches issues that only appear when components
          interact. Production monitoring catches issues that slip through everything else.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-900">Stage</th>
                <th className="py-3 px-4 font-bold text-slate-900">What It Catches</th>
                <th className="py-3 px-4 font-bold text-slate-900">Cost to Fix</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Design Review</td>
                <td className="py-3 px-4">Missing focus states, contrast issues in mockups, unclear interaction patterns, missing keyboard flows</td>
                <td className="py-3 px-4 text-green-700 font-medium">Very low</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Development</td>
                <td className="py-3 px-4">Missing labels, broken ARIA, heading hierarchy issues, form association errors</td>
                <td className="py-3 px-4 text-green-700 font-medium">Low</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Code Review</td>
                <td className="py-3 px-4">Meaningless alt text, poor focus management logic, incorrect live region usage</td>
                <td className="py-3 px-4 text-yellow-700 font-medium">Low-Medium</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">CI Pipeline</td>
                <td className="py-3 px-4">Regressions in screen reader output, broken heading structure, missing accessible names</td>
                <td className="py-3 px-4 text-yellow-700 font-medium">Medium</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Staging</td>
                <td className="py-3 px-4">Component interaction issues, focus loss between views, announcement timing problems</td>
                <td className="py-3 px-4 text-orange-700 font-medium">Medium-High</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Production</td>
                <td className="py-3 px-4">Real-world assistive technology incompatibilities, edge cases in user flows</td>
                <td className="py-3 px-4 text-red-700 font-medium">High</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-slate-600 leading-relaxed">
          A comprehensive testing strategy covers all six stages. Most teams start from the right side (reacting to
          production issues) and gradually shift left over time. The goal is not to eliminate later-stage testing.
          It is to ensure that most issues are caught before they reach users. Even a mature team will still find
          issues in production that slipped through earlier checks, but those should be rare exceptions, not the norm.
        </p>
      </section>

      {/* Section 2: What to Automate */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What to Automate</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Automated accessibility testing tools typically catch between 30% and 50% of accessibility issues. That
          number might sound low, but the issues they catch are the ones that appear most frequently and are easiest
          to prevent with consistent tooling. Automation is not a replacement for manual testing: it is a safety
          net that catches the low-hanging fruit so your manual testing time can focus on the complex, nuanced
          problems that require human judgment.
        </p>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The types of issues best suited to automation include:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
          <li><span className="font-medium">Missing form labels</span>: inputs without associated labels or aria-label attributes</li>
          <li><span className="font-medium">Broken heading hierarchy</span>: skipping heading levels (h1 → h3) or multiple h1 elements</li>
          <li><span className="font-medium">Color contrast violations</span>: text that does not meet WCAG minimum contrast ratios</li>
          <li><span className="font-medium">Invalid ARIA usage</span>: roles with missing required attributes, invalid state values</li>
          <li><span className="font-medium">Focus order structure</span>: positive tabindex values, focusable elements hidden from the tab order</li>
          <li><span className="font-medium">Missing accessible names</span>: buttons, links, and images without discernible text</li>
          <li><span className="font-medium">Landmark structure</span>: missing main landmark, duplicate landmarks without labels</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-900 mb-3">How Tools Complement Each Other</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">
          No single tool covers everything. A strong automated strategy combines tools that approach accessibility
          from different angles:
        </p>
        <div className="space-y-4 mb-6">
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Speakable: Screen Reader Output Prediction</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Shows exactly what screen reader users will hear when they navigate your content. This catches issues
              that rule-based tools miss: an element might technically have an accessible name, but the announced
              output might be confusing, redundant, or missing context. Speakable makes invisible output visible,
              so developers can evaluate quality (not just presence) of accessible content.
            </p>
          </div>
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <h4 className="text-sm font-bold text-slate-900 mb-2">axe-core: Rule-Based Violation Detection</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Checks HTML against a comprehensive ruleset based on WCAG success criteria. Flags definitive violations
              with high confidence. Strong at catching structural issues: missing roles, broken associations, invalid
              attributes. Reports issues with severity levels and links to remediation guidance.
            </p>
          </div>
          <div className="p-5 border border-slate-200 rounded-xl bg-white">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Lighthouse: Overall Scoring and Auditing</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Provides a high-level accessibility score and runs a subset of axe-core rules in the context of a
              full page load. Useful for tracking trends over time and giving stakeholders a quick health metric.
              Less granular than axe-core for individual component testing but valuable for page-level monitoring.
            </p>
          </div>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Used together, these tools form a layered defense: Speakable shows you what screen reader users actually
          experience, axe-core flags rule violations you might overlook, and Lighthouse provides a trend metric for
          stakeholders. None of them replaces manual testing with real assistive technology, but they catch the
          majority of common, preventable issues before code reaches users.
        </p>
      </section>

      {/* Section 3: What Requires Manual Testing */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Requires Manual Testing</h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          The remaining 50-70% of accessibility issues require human judgment to identify. These are problems that
          automated tools cannot reliably detect because they depend on context, intent, timing, or subjective
          evaluation of user experience quality. Manual testing is not optional: it is where you catch the issues
          that matter most to real users.
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Focus Management in Dynamic Interfaces</p>
              <p className="text-sm text-slate-600">
                When a modal opens, does focus move to it? When it closes, does focus return to the trigger? When
                content is dynamically inserted, is focus handled appropriately? These flows depend on interaction
                sequences that static analysis cannot evaluate.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Screen Reader Announcement Timing</p>
              <p className="text-sm text-slate-600">
                Live regions need to announce at the right moment: not too early (before the user has context),
                not too late (after they have moved on), and not so frequently that they overwhelm. Timing and
                interruption behavior vary by screen reader and require real-world testing to validate.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Cognitive Accessibility</p>
              <p className="text-sm text-slate-600">
                Clear language, predictable behavior, consistent navigation, and logical page structure all require
                human evaluation. No tool can determine whether instructions are confusing or whether an interaction
                pattern is intuitive for the target audience.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Complex Widget Keyboard Interaction</p>
              <p className="text-sm text-slate-600">
                Custom widgets (comboboxes, date pickers, data grids, drag-and-drop interfaces) implement keyboard
                patterns that need to be tested holistically. Does the full interaction flow work? Are all states
                reachable? Do keyboard shortcuts conflict with assistive technology commands?
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">5.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Content Meaning and Context</p>
              <p className="text-sm text-slate-600">
                Automated tools can check that an image has alt text. They cannot judge whether the alt text is
                meaningful, accurate, or appropriate for the context. A link can have text content but still be
                incomprehensible out of context. These quality judgments require human evaluation.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold">Recommendation:</span> Combine manual testing with actual screen readers
            (NVDA on Windows, VoiceOver on macOS/iOS, TalkBack on Android) with periodic user testing sessions
            involving people with disabilities. Developers testing with screen readers catch implementation issues.
            User testing catches experience issues: problems that are technically correct but practically unusable.
          </p>
        </div>
      </section>

      {/* Section 4: Testing Frequency */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Testing Frequency</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Different types of testing belong at different cadences. Automated checks should run on every commit because
          they are fast and cheap. Manual testing should happen on a regular schedule because it is expensive but
          essential. User testing should happen quarterly because it requires coordination with external participants
          but provides insights that nothing else can replicate.
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-5 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Every Commit</span>
            </div>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              Run automated lint rules and accessibility checks. Include Speakable in CI to generate screen reader
              output snapshots for changed components. This catches regressions instantly: if a code change alters
              what a screen reader announces, you know about it before the PR merges.
            </p>
          </div>
          <div className="p-5 border-l-4 border-teal-500 bg-teal-50/50 rounded-r-lg">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Every Sprint</span>
            </div>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              Manual screen reader walkthrough of new features and changed interactions. A developer spends 30-60
              minutes navigating new UI with NVDA or VoiceOver, verifying focus management, announcement quality,
              and keyboard operability. Document findings and file issues for the next sprint.
            </p>
          </div>
          <div className="p-5 border-l-4 border-purple-500 bg-purple-50/50 rounded-r-lg">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Every Release</span>
            </div>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              Full regression test across multiple screen readers (NVDA, JAWS, VoiceOver) covering core user flows.
              Test with different browsers. Screen reader behavior varies between Chrome, Firefox, and Safari.
              This catches cross-reader inconsistencies that per-commit automation cannot detect.
            </p>
          </div>
          <div className="p-5 border-l-4 border-amber-500 bg-amber-50/50 rounded-r-lg">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Quarterly</span>
            </div>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              User testing with assistive technology users. Recruit participants who use screen readers, switch
              controls, voice navigation, or magnification in their daily workflow. Observe them completing real
              tasks. This reveals usability issues that even expert manual testers miss because they do not rely
              on assistive technology full-time.
            </p>
          </div>
        </div>

        <SeeAlso
          href="/docs/cicd-integration"
          title="CI/CD Integration Guide"
          description="Learn how to add Speakable to your CI pipeline for automated screen reader output testing on every commit."
        />
      </section>

      {/* Section 5: Metrics to Track */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Metrics to Track</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Good metrics make progress visible and help teams prioritize. The right accessibility metrics tell you
          whether your testing strategy is working, where gaps exist, and whether you are improving over time.
          Avoid vanity metrics that create a false sense of security. Track metrics that drive action.
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-green-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Automated Issues Per Component</p>
              <p className="text-sm text-slate-600 mt-1">
                Track the number of axe-core violations and Speakable warnings per component or page. Trend this
                over time. A healthy codebase shows this number decreasing or staying at zero for existing components.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-green-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Test Coverage Percentage</p>
              <p className="text-sm text-slate-600 mt-1">
                What percentage of your components have dedicated accessibility tests? This includes unit tests
                with testing-library queries that verify accessible names, integration tests that check keyboard
                navigation, and Speakable snapshots that track screen reader output.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-green-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Screen Reader Announcement Regression Rate</p>
              <p className="text-sm text-slate-600 mt-1">
                When using Speakable diffs in CI, track how often PRs introduce changes to screen reader output.
                Not all changes are regressions (some are improvements), but unexpected changes should trigger
                review. A high rate of unintentional changes suggests accessibility is not being considered during
                development.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-green-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Time to Fix Accessibility Bugs</p>
              <p className="text-sm text-slate-600 mt-1">
                Measure the time between an accessibility bug being filed and its fix being deployed. Set an SLA
                (for example: critical issues fixed within one sprint, moderate issues within two sprints). This
                metric reveals whether accessibility is being prioritized alongside other bugs.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-lg border border-slate-200">
            <span className="material-symbols-outlined text-green-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <div>
              <p className="text-sm font-bold text-slate-900">Speakable Coverage</p>
              <p className="text-sm text-slate-600 mt-1">
                Track the number of pages and components tested with Speakable versus your total inventory. This
                shows how much of your application has verified screen reader output and where blind spots remain.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-sm font-bold text-red-800 mb-2">What Not to Track</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            Avoid tracking a single &quot;compliance score&quot; as your primary metric. Compliance is binary per
            WCAG checkpoint: you either meet a success criterion or you do not. A percentage score (like
            &quot;87% accessible&quot;) is misleading because it obscures which specific requirements are unmet
            and creates false confidence. A page with a 95% score might still be completely unusable for screen
            reader users if the 5% failure is in navigation or form submission. Track specific, actionable metrics
            instead.
          </p>
        </div>
      </section>

      {/* Section 6: Team Maturity Model */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Team Maturity Model</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Accessibility maturity does not happen overnight. Teams typically progress through distinct levels as they
          build knowledge, adopt tooling, and integrate accessibility into their workflow. Use this model to assess
          where your team is today and identify concrete next steps. Moving up one level at a time is more sustainable
          than trying to jump from Level 1 to Level 5 in a single quarter.
        </p>

        <div className="space-y-4">
          <div className="p-5 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-sm font-bold">1</span>
              <h3 className="text-base font-bold text-slate-900">Reactive</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed ml-11">
              Fix accessibility issues only when reported by users or flagged in audits. No automated testing in
              place. Team has basic awareness that accessibility matters but no systematic approach. Issues are
              treated as one-off bugs rather than symptoms of process gaps.
            </p>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">2</span>
              <h3 className="text-base font-bold text-slate-900">Aware</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed ml-11">
              Lint rules for accessibility enabled in CI (eslint-plugin-jsx-a11y or equivalent). Team members
              occasionally test with keyboard navigation. Some training has happened. At minimum, developers
              know what ARIA is and why semantic HTML matters. Issues are tracked but fixes are not prioritized
              consistently.
            </p>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-sm font-bold">3</span>
              <h3 className="text-base font-bold text-slate-900">Proactive</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed ml-11">
              Speakable integrated in CI/CD pipeline to catch screen reader output regressions. Regular manual
              testing with screen readers (at least once per sprint). Accessibility is an explicit item in code
              review checklists. Team uses a dedicated testing checklist for new features. Issues have SLAs for
              resolution.
            </p>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">4</span>
              <h3 className="text-base font-bold text-slate-900">Integrated</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed ml-11">
              Accessibility is part of the design process. Designers annotate mockups with focus order, heading
              levels, and ARIA states before handoff. Automated regression testing covers all critical user flows.
              User testing program with assistive technology users runs quarterly. Cross-reader output is tracked
              and compared across NVDA, JAWS, and VoiceOver.
            </p>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">5</span>
              <h3 className="text-base font-bold text-slate-900">Mature</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed ml-11">
              Dedicated accessibility champion role embedded in the team. Continuous feedback loop with users who
              rely on assistive technology. Proactive pattern library with verified accessible components that
              the entire organization can use with confidence. Internal training program onboards new developers
              with accessibility fundamentals. The team contributes back to the accessibility community through
              shared tooling, documentation, or standards participation.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Building Your Strategy */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Building Your Strategy</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Start where the impact is highest and the effort is lowest. Automation provides the quickest wins because
          it runs continuously without human effort once configured. From there, layer in manual testing, training,
          and user testing as your team matures. Here is a practical sequence for building your accessibility
          testing program from the ground up.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Start With Automation</p>
              <p className="text-sm text-slate-600">
                Enable eslint-plugin-jsx-a11y (or your framework equivalent) and axe-core in your test suite.
                These catch the most common issues with zero ongoing effort. Fix existing violations to establish
                a clean baseline, then treat new violations as CI failures.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Add Speakable to Your CI Pipeline</p>
              <p className="text-sm text-slate-600">
                Generate screen reader output snapshots for your components. When a PR changes what a screen reader
                announces, reviewers see the diff and can evaluate whether the change is intentional. This catches
                a category of regressions that lint rules miss entirely.
                See the <Link href="/docs/cicd-integration" className="text-blue-600 hover:text-blue-800 underline">CI/CD Integration guide</Link> for
                setup instructions.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Train the Team on Screen Reader Basics</p>
              <p className="text-sm text-slate-600">
                Every developer should be able to turn on a screen reader and navigate a page. This does not require
                expert proficiency: basic navigation (headings, landmarks, tab key, reading mode) is sufficient
                to catch most issues. Even 30 minutes of hands-on experience changes how developers think about
                their markup.
                See <Link href="/docs/how-screen-readers-work" className="text-blue-600 hover:text-blue-800 underline">How Screen Readers Work</Link> for
                background knowledge.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Build a Code Review Checklist</p>
              <p className="text-sm text-slate-600">
                Create a lightweight checklist that reviewers reference during code review. Does the component have
                an accessible name? Is keyboard navigation handled? Are state changes announced to screen readers?
                A checklist ensures consistency and helps less-experienced reviewers catch issues.
                See the <Link href="/docs/testing-checklist" className="text-blue-600 hover:text-blue-800 underline">Testing Checklist</Link> for
                a ready-to-use template.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">5.</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Establish Quarterly User Testing</p>
              <p className="text-sm text-slate-600">
                Partner with organizations that connect you with assistive technology users for usability testing.
                Services like{" "}
                <Link href="https://www.accessibilityoz.com" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">AccessibilityOz</Link>,{" "}
                <Link href="https://www.fable-tech.com" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Fable</Link>, and{" "}
                <Link href="https://www.deque.com" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Deque</Link>{" "}
                offer user testing panels. Budget for at least four sessions per year (one per quarter) to
                maintain a consistent feedback loop with real users.
              </p>
            </div>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed">
          This sequence is a starting point, not a rigid prescription. Some teams will skip straight to step 3
          because they already have automation in place. Others will start with user testing because they have
          an immediate compliance deadline. Adapt the sequence to your context, but aim to cover all five areas
          within a year. The combination of automated checks, screen reader output tracking, team education,
          structured reviews, and user feedback creates a testing program that catches issues across the full
          spectrum of accessibility concerns.
        </p>
      </section>

      <RelatedPages
        pages={[
          {
            href: "/docs/automated-screen-reader-testing",
            title: "Automated Screen Reader Testing",
            description: "Set up automated testing with CLI, Node API, and CI integration using Speakable.",
          },
          {
            href: "/docs/screen-reader-testing-without-screen-reader",
            title: "Testing Without a Screen Reader",
            description: "How predictive testing fills the gap when you cannot run a real screen reader.",
          },
          {
            href: "/docs/testing-checklist",
            title: "Screen Reader Testing Checklist",
            description: "A step-by-step checklist for verifying accessibility in components and pages during development and code review.",
          },
          {
            href: "/docs/cicd-integration",
            title: "CI/CD Integration",
            description: "Add automated screen reader output testing to your continuous integration pipeline with Speakable.",
          },
          {
            href: "/docs/testing-ecosystem",
            title: "Testing Ecosystem",
            description: "Overview of accessibility testing tools and how they complement each other in a comprehensive testing strategy.",
          },
          {
            href: "/docs/how-screen-readers-work",
            title: "How Screen Readers Work",
            description: "Understand the pipeline from HTML to speech output and how screen readers interpret your markup.",
          },
        ]}
      />
    </>
  );
}
