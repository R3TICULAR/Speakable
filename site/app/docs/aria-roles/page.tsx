'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RelatedPages } from '../../../components/RelatedPages';

interface RoleEntry {
  name: string;
  implicitElement?: string;
  ariaStates?: string[];
  speakableOutput: {
    nvda: string;
    jaws: string;
    voiceover: string;
    narrator: string;
  };
  commonlyMisused?: boolean;
}

interface RoleCategory {
  name: string;
  description: string;
  roles: RoleEntry[];
}

const roleCategories: RoleCategory[] = [
  {
    name: 'Landmark',
    description:
      'Landmark roles identify large content areas and help assistive technology users navigate page structure quickly.',
    roles: [
      {
        name: 'banner',
        implicitElement: '<header>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'banner landmark',
          jaws: 'banner region',
          voiceover: 'banner',
          narrator: 'banner',
        },
      },
      {
        name: 'complementary',
        implicitElement: '<aside>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'complementary landmark',
          jaws: 'complementary region',
          voiceover: 'complementary',
          narrator: 'complementary',
        },
      },
      {
        name: 'contentinfo',
        implicitElement: '<footer>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'content information landmark',
          jaws: 'content info region',
          voiceover: 'content information',
          narrator: 'content info',
        },
      },
      {
        name: 'form',
        implicitElement: '<form>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'Contact form landmark',
          jaws: 'Contact form region',
          voiceover: 'Contact, form',
          narrator: 'Contact, form landmark',
        },
      },
      {
        name: 'main',
        implicitElement: '<main>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'main landmark',
          jaws: 'main region',
          voiceover: 'main',
          narrator: 'main landmark',
        },
      },
      {
        name: 'navigation',
        implicitElement: '<nav>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'Main navigation landmark',
          jaws: 'Main navigation region',
          voiceover: 'navigation, Main',
          narrator: 'navigation, Main',
        },
      },
      {
        name: 'region',
        implicitElement: '<section>',
        ariaStates: ['aria-label (required)', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'Features region landmark',
          jaws: 'Features region',
          voiceover: 'Features, region',
          narrator: 'Features, region',
        },
      },
      {
        name: 'search',
        implicitElement: '<search>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'search landmark',
          jaws: 'search region',
          voiceover: 'search',
          narrator: 'search landmark',
        },
      },
    ],
  },
  {
    name: 'Widget',
    description:
      'Widget roles define interactive UI elements. These roles communicate the type of control and its current state to assistive technologies.',
    roles: [
      {
        name: 'button',
        implicitElement: '<button>',
        ariaStates: ['aria-pressed', 'aria-expanded', 'aria-disabled'],
        commonlyMisused: true,
        speakableOutput: {
          nvda: 'Submit button',
          jaws: 'Submit button',
          voiceover: 'Submit, button',
          narrator: 'Submit, button',
        },
      },
      {
        name: 'checkbox',
        implicitElement: '<input type="checkbox">',
        ariaStates: ['aria-checked (required)', 'aria-disabled', 'aria-required'],
        speakableOutput: {
          nvda: 'Accept terms checkbox not checked',
          jaws: 'Accept terms check box not checked',
          voiceover: 'Accept terms, unticked, checkbox',
          narrator: 'Accept terms, checkbox, unchecked',
        },
      },
      {
        name: 'combobox',
        ariaStates: ['aria-expanded (required)', 'aria-controls', 'aria-activedescendant', 'aria-autocomplete'],
        speakableOutput: {
          nvda: 'Country edit combo collapsed has autocomplete',
          jaws: 'Country combo box edit',
          voiceover: 'Country, collapsed, combo box',
          narrator: 'Country, combo box, collapsed, editable',
        },
      },
      {
        name: 'dialog',
        implicitElement: '<dialog>',
        ariaStates: ['aria-label (required)', 'aria-labelledby', 'aria-modal'],
        speakableOutput: {
          nvda: 'Confirm deletion dialog',
          jaws: 'Confirm deletion dialog',
          voiceover: 'Confirm deletion, web dialog',
          narrator: 'Confirm deletion, dialog',
        },
      },
      {
        name: 'link',
        implicitElement: '<a href>',
        ariaStates: ['aria-current', 'aria-disabled'],
        commonlyMisused: true,
        speakableOutput: {
          nvda: 'Learn more link',
          jaws: 'Learn more link',
          voiceover: 'Learn more, link',
          narrator: 'Learn more, link',
        },
      },
      {
        name: 'listbox',
        implicitElement: '<select>',
        ariaStates: ['aria-multiselectable', 'aria-required', 'aria-activedescendant', 'aria-orientation'],
        speakableOutput: {
          nvda: 'Country list box',
          jaws: 'Country list box',
          voiceover: 'Country, list box',
          narrator: 'Country, list box',
        },
      },
      {
        name: 'menu',
        ariaStates: ['aria-activedescendant', 'aria-orientation'],
        speakableOutput: {
          nvda: 'File menu',
          jaws: 'File menu',
          voiceover: 'File, menu',
          narrator: 'File, menu',
        },
      },
      {
        name: 'menuitem',
        ariaStates: ['aria-disabled', 'aria-expanded', 'aria-haspopup'],
        speakableOutput: {
          nvda: 'Save menu item',
          jaws: 'Save',
          voiceover: 'Save, menu item',
          narrator: 'Save, menu item',
        },
      },
      {
        name: 'option',
        implicitElement: '<option>',
        ariaStates: ['aria-selected (required)', 'aria-disabled'],
        speakableOutput: {
          nvda: 'United States 3 of 195',
          jaws: 'United States',
          voiceover: 'United States',
          narrator: 'United States, 3 of 195',
        },
      },
      {
        name: 'progressbar',
        implicitElement: '<progress>',
        ariaStates: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext'],
        speakableOutput: {
          nvda: 'Upload progress bar 75 percent',
          jaws: 'Upload progress bar 75%',
          voiceover: '75%, Upload, progress indicator',
          narrator: 'Upload, progress bar, 75%',
        },
      },
      {
        name: 'radio',
        implicitElement: '<input type="radio">',
        ariaStates: ['aria-checked (required)', 'aria-disabled', 'aria-posinset', 'aria-setsize'],
        speakableOutput: {
          nvda: 'Express shipping radio button checked 2 of 3',
          jaws: 'Express shipping radio button checked',
          voiceover: 'Express shipping, selected, radio button, 2 of 3',
          narrator: 'Express shipping, radio button, checked, 2 of 3',
        },
      },
      {
        name: 'slider',
        implicitElement: '<input type="range">',
        ariaStates: ['aria-valuenow (required)', 'aria-valuemin', 'aria-valuemax', 'aria-valuetext', 'aria-orientation'],
        speakableOutput: {
          nvda: 'Volume slider 80',
          jaws: 'Volume slider 80',
          voiceover: 'Volume, 80, slider',
          narrator: 'Volume, slider, 80',
        },
      },
      {
        name: 'switch',
        ariaStates: ['aria-checked (required)', 'aria-disabled'],
        speakableOutput: {
          nvda: 'Dark mode switch on',
          jaws: 'Dark mode switch On',
          voiceover: 'Dark mode, on, switch',
          narrator: 'Dark mode, toggle switch, on',
        },
      },
      {
        name: 'tab',
        ariaStates: ['aria-selected (required)', 'aria-controls', 'aria-disabled'],
        speakableOutput: {
          nvda: 'Settings tab selected 2 of 4',
          jaws: 'Settings tab 2 of 4',
          voiceover: 'Settings, selected, tab, 2 of 4',
          narrator: 'Settings, tab, 2 of 4, selected',
        },
      },
      {
        name: 'tabpanel',
        ariaStates: ['aria-labelledby'],
        speakableOutput: {
          nvda: 'Settings tab panel',
          jaws: 'Settings tab panel',
          voiceover: 'Settings, tab panel',
          narrator: 'Settings, tab panel',
        },
      },
      {
        name: 'textbox',
        implicitElement: '<input type="text">, <textarea>',
        ariaStates: ['aria-multiline', 'aria-placeholder', 'aria-readonly', 'aria-required'],
        speakableOutput: {
          nvda: 'Email edit required has autocomplete blank',
          jaws: 'Email edit type in text',
          voiceover: 'Email, required, text field',
          narrator: 'Email, edit, required',
        },
      },
      {
        name: 'tree',
        ariaStates: ['aria-multiselectable', 'aria-activedescendant', 'aria-orientation'],
        speakableOutput: {
          nvda: 'File browser tree view',
          jaws: 'File browser tree view',
          voiceover: 'File browser, tree',
          narrator: 'File browser, tree view',
        },
      },
    ],
  },
  {
    name: 'Document Structure',
    description:
      'Document structure roles describe the organization of content on a page. They provide semantic meaning without implying interactivity.',
    roles: [
      {
        name: 'article',
        implicitElement: '<article>',
        ariaStates: ['aria-label', 'aria-labelledby', 'aria-posinset', 'aria-setsize'],
        speakableOutput: {
          nvda: 'article',
          jaws: 'article',
          voiceover: 'article',
          narrator: 'article',
        },
      },
      {
        name: 'cell',
        implicitElement: '<td>',
        ariaStates: ['aria-colindex', 'aria-colspan', 'aria-rowindex', 'aria-rowspan'],
        speakableOutput: {
          nvda: 'column 2 row 3 Price $49.99',
          jaws: 'Price column $49.99',
          voiceover: 'row 3, Price, $49.99',
          narrator: 'row 3, column 2, $49.99',
        },
      },
      {
        name: 'columnheader',
        implicitElement: '<th scope="col">',
        ariaStates: ['aria-sort', 'aria-colindex'],
        speakableOutput: {
          nvda: 'Price column header sorted ascending',
          jaws: 'Price column header sort ascending',
          voiceover: 'Price, sorted ascending, column header',
          narrator: 'Price, column header, sorted ascending',
        },
      },
      {
        name: 'definition',
        implicitElement: '<dd>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'definition',
          jaws: 'definition',
          voiceover: 'definition',
          narrator: 'definition',
        },
      },
      {
        name: 'directory',
        ariaStates: ['aria-label'],
        speakableOutput: {
          nvda: 'directory',
          jaws: 'directory',
          voiceover: 'directory',
          narrator: 'directory',
        },
      },
      {
        name: 'document',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'document',
          jaws: 'document',
          voiceover: 'web content',
          narrator: 'document',
        },
      },
      {
        name: 'feed',
        ariaStates: ['aria-label', 'aria-labelledby', 'aria-busy'],
        speakableOutput: {
          nvda: 'News feed',
          jaws: 'News feed',
          voiceover: 'News, feed',
          narrator: 'News, feed',
        },
      },
      {
        name: 'figure',
        implicitElement: '<figure>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'Performance chart figure',
          jaws: 'figure Performance chart',
          voiceover: 'Performance chart, figure',
          narrator: 'Performance chart, figure',
        },
      },
      {
        name: 'grid',
        ariaStates: ['aria-multiselectable', 'aria-readonly', 'aria-activedescendant', 'aria-colcount', 'aria-rowcount'],
        speakableOutput: {
          nvda: 'Spreadsheet grid with 10 columns and 50 rows',
          jaws: 'Spreadsheet grid',
          voiceover: 'Spreadsheet, grid, 10 columns, 50 rows',
          narrator: 'Spreadsheet, grid',
        },
      },
      {
        name: 'group',
        implicitElement: '<fieldset>',
        ariaStates: ['aria-label', 'aria-labelledby', 'aria-activedescendant', 'aria-disabled'],
        speakableOutput: {
          nvda: 'Shipping options grouping',
          jaws: 'Shipping options group',
          voiceover: 'Shipping options, group',
          narrator: 'Shipping options, group',
        },
      },
      {
        name: 'heading',
        implicitElement: '<h1>-<h6>',
        ariaStates: ['aria-level (required)'],
        commonlyMisused: true,
        speakableOutput: {
          nvda: 'heading level 2 Getting Started',
          jaws: 'Getting Started heading level 2',
          voiceover: 'Getting Started, heading level 2',
          narrator: 'Getting Started, heading, level 2',
        },
      },
      {
        name: 'img',
        implicitElement: '<img>',
        ariaStates: ['aria-label (required)', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'graphic Company logo',
          jaws: 'Company logo graphic',
          voiceover: 'Company logo, image',
          narrator: 'Company logo, image',
        },
      },
      {
        name: 'list',
        implicitElement: '<ul>, <ol>',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'list with 5 items',
          jaws: 'list of 5 items',
          voiceover: 'list, 5 items',
          narrator: 'list, 5 items',
        },
      },
      {
        name: 'listitem',
        implicitElement: '<li>',
        ariaStates: ['aria-level', 'aria-posinset', 'aria-setsize'],
        speakableOutput: {
          nvda: 'bullet Install dependencies',
          jaws: 'bullet Install dependencies',
          voiceover: 'Install dependencies',
          narrator: 'Install dependencies, list item',
        },
      },
      {
        name: 'math',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'math',
          jaws: 'math',
          voiceover: 'mathematical expression',
          narrator: 'math',
        },
      },
      {
        name: 'note',
        ariaStates: ['aria-label', 'aria-labelledby'],
        speakableOutput: {
          nvda: 'note',
          jaws: 'note',
          voiceover: 'note',
          narrator: 'note',
        },
      },
      {
        name: 'row',
        implicitElement: '<tr>',
        ariaStates: ['aria-rowindex', 'aria-selected', 'aria-expanded', 'aria-level'],
        speakableOutput: {
          nvda: 'row 3',
          jaws: 'row 3',
          voiceover: 'row 3 of 10',
          narrator: 'row 3',
        },
      },
      {
        name: 'rowgroup',
        implicitElement: '<tbody>, <thead>, <tfoot>',
        ariaStates: [],
        speakableOutput: {
          nvda: '',
          jaws: '',
          voiceover: '',
          narrator: '',
        },
      },
      {
        name: 'rowheader',
        implicitElement: '<th scope="row">',
        ariaStates: ['aria-sort', 'aria-rowindex'],
        speakableOutput: {
          nvda: 'row header January',
          jaws: 'January row header',
          voiceover: 'January, row header',
          narrator: 'January, row header',
        },
      },
      {
        name: 'separator',
        implicitElement: '<hr>',
        ariaStates: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-orientation'],
        speakableOutput: {
          nvda: 'separator',
          jaws: 'separator',
          voiceover: 'separator',
          narrator: 'separator',
        },
      },
      {
        name: 'table',
        implicitElement: '<table>',
        ariaStates: ['aria-label', 'aria-labelledby', 'aria-colcount', 'aria-rowcount'],
        speakableOutput: {
          nvda: 'Pricing table with 3 columns and 5 rows',
          jaws: 'Pricing table 3 columns 5 rows',
          voiceover: 'Pricing, table, 3 columns, 5 rows',
          narrator: 'Pricing, table, 3 columns, 5 rows',
        },
      },
      {
        name: 'term',
        implicitElement: '<dt>',
        ariaStates: [],
        speakableOutput: {
          nvda: 'Accessibility',
          jaws: 'Accessibility',
          voiceover: 'Accessibility, term',
          narrator: 'Accessibility',
        },
      },
      {
        name: 'toolbar',
        ariaStates: ['aria-label', 'aria-labelledby', 'aria-activedescendant', 'aria-orientation'],
        speakableOutput: {
          nvda: 'Formatting toolbar',
          jaws: 'Formatting tool bar',
          voiceover: 'Formatting, toolbar',
          narrator: 'Formatting, toolbar',
        },
      },
    ],
  },
  {
    name: 'Live Region',
    description:
      'Live region roles indicate areas of the page that update dynamically. Screen readers announce changes to these regions without requiring focus.',
    roles: [
      {
        name: 'alert',
        ariaStates: ['aria-atomic', 'aria-live (implicit: assertive)'],
        speakableOutput: {
          nvda: 'alert Form submission failed. Please check your inputs.',
          jaws: 'Alert Form submission failed. Please check your inputs.',
          voiceover: 'Form submission failed. Please check your inputs., alert',
          narrator: 'alert, Form submission failed. Please check your inputs.',
        },
      },
      {
        name: 'log',
        ariaStates: ['aria-atomic', 'aria-live (implicit: polite)'],
        speakableOutput: {
          nvda: 'log',
          jaws: 'log',
          voiceover: 'log',
          narrator: 'log',
        },
      },
      {
        name: 'marquee',
        ariaStates: ['aria-atomic', 'aria-live (implicit: off)'],
        speakableOutput: {
          nvda: 'marquee',
          jaws: 'marquee',
          voiceover: 'marquee',
          narrator: 'marquee',
        },
      },
      {
        name: 'status',
        ariaStates: ['aria-atomic (implicit: true)', 'aria-live (implicit: polite)'],
        speakableOutput: {
          nvda: '3 items in cart',
          jaws: '3 items in cart',
          voiceover: '3 items in cart, status',
          narrator: '3 items in cart, status',
        },
      },
      {
        name: 'timer',
        ariaStates: ['aria-atomic', 'aria-live'],
        speakableOutput: {
          nvda: 'timer 5 minutes remaining',
          jaws: '5 minutes remaining timer',
          voiceover: '5 minutes remaining, timer',
          narrator: '5 minutes remaining, timer',
        },
      },
    ],
  },
  {
    name: 'Window',
    description:
      'Window roles define overlay containers like dialogs and alert dialogs that demand or request user interaction.',
    roles: [
      {
        name: 'alertdialog',
        ariaStates: ['aria-label (required)', 'aria-labelledby', 'aria-describedby', 'aria-modal'],
        speakableOutput: {
          nvda: 'Delete account alert dialog Are you sure? This cannot be undone.',
          jaws: 'Alert dialog Delete account Are you sure? This cannot be undone.',
          voiceover: 'Delete account, alert, web dialog, Are you sure? This cannot be undone.',
          narrator: 'Delete account, alert dialog, Are you sure? This cannot be undone.',
        },
      },
      {
        name: 'dialog',
        implicitElement: '<dialog>',
        ariaStates: ['aria-label (required)', 'aria-labelledby', 'aria-modal'],
        speakableOutput: {
          nvda: 'Edit profile dialog',
          jaws: 'Edit profile dialog',
          voiceover: 'Edit profile, web dialog',
          narrator: 'Edit profile, dialog',
        },
      },
    ],
  },
];

export default function AriaRolesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = roleCategories
    .map((category) => ({
      ...category,
      roles: category.roles.filter((role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.roles.length > 0);

  return (
    <>
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <span>Docs</span>
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">chevron_right</span>
          <span className="text-slate-600">ARIA Roles</span>
        </nav>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          ARIA Roles Quick Reference
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          A comprehensive reference for all WAI-ARIA roles with details on how Speakable handles each one.
          Use this guide to understand how different screen readers announce role semantics, what HTML
          elements map implicitly to each role, and which ARIA states are required or supported.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Note:</strong> Speakable approximates screen reader behavior through static HTML analysis.
            Actual output varies by screen reader version and user settings.
          </p>
        </div>
      </header>

      {/* Search/Filter */}
      <div className="mb-12">
        <label htmlFor="role-search" className="block text-sm font-medium text-slate-700 mb-2">
          Filter roles by name
        </label>
        <input
          id="role-search"
          type="text"
          placeholder="Search roles (e.g. button, navigation, alert)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full max-w-md"
        />
        {searchQuery && (
          <p className="mt-2 text-xs text-slate-500">
            Showing {filteredCategories.reduce((acc, cat) => acc + cat.roles.length, 0)} role{filteredCategories.reduce((acc, cat) => acc + cat.roles.length, 0) !== 1 ? 's' : ''} matching &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>

      {/* Role Categories */}
      {filteredCategories.map((category, categoryIndex) => (
        <section key={category.name} className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">{category.name} Roles</h2>
            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {category.roles.length}
            </span>
          </div>
          <p className="text-slate-600 mb-6 leading-relaxed">{category.description}</p>

          <div className="space-y-6">
            {category.roles.map((role) => (
              <div
                key={role.name}
                className="p-6 border border-slate-200 rounded-lg bg-white"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <code className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    role=&quot;{role.name}&quot;
                  </code>
                  {role.implicitElement && (
                    <span className="text-xs text-slate-500">
                      Implicit:{' '}
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">
                        {role.implicitElement}
                      </code>
                    </span>
                  )}
                  {role.commonlyMisused && (
                    <Link
                      href="/docs/common-mistakes"
                      className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded hover:bg-amber-100 transition-colors"
                    >
                      ⚠ Commonly misused
                    </Link>
                  )}
                </div>

                {/* ARIA States */}
                {role.ariaStates && role.ariaStates.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Supported ARIA States
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.ariaStates.map((state) => (
                        <code
                          key={state}
                          className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                            state.includes('(required)')
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {state}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* Speakable Output */}
                <div className="rounded-xl overflow-hidden bg-slate-900 shadow-lg">
                  <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Speakable Output
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">NVDA</span>
                      <p className="text-sm font-mono text-slate-300 mt-0.5">
                        {role.speakableOutput.nvda || <span className="text-slate-600 italic">not announced</span>}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">JAWS</span>
                      <p className="text-sm font-mono text-slate-300 mt-0.5">
                        {role.speakableOutput.jaws || <span className="text-slate-600 italic">not announced</span>}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">VoiceOver</span>
                      <p className="text-sm font-mono text-slate-300 mt-0.5">
                        {role.speakableOutput.voiceover || <span className="text-slate-600 italic">not announced</span>}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Narrator</span>
                      <p className="text-sm font-mono text-slate-300 mt-0.5">
                        {role.speakableOutput.narrator || <span className="text-slate-600 italic">not announced</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider between categories */}
          {categoryIndex < filteredCategories.length - 1 && (
            <hr className="mt-12 border-slate-200" />
          )}
        </section>
      ))}

      {/* No results */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">No roles found matching &ldquo;{searchQuery}&rdquo;</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Key differences section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Key Differences Across Screen Readers</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Screen readers differ in announcement order, terminology, and level of detail. Understanding
          these differences helps you write more inclusive content and verify your accessibility testing covers
          real-world behavior.
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Announcement Order</h3>
            <p className="text-sm text-slate-600">
              NVDA and JAWS typically announce the role after the name (&ldquo;Submit button&rdquo;), while VoiceOver
              and Narrator separate them with a comma and often put the role after the name
              (&ldquo;Submit, button&rdquo;). This comma-separated pattern is what Speakable models for
              macOS/iOS and Windows Narrator output.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Terminology Variations</h3>
            <p className="text-sm text-slate-600">
              NVDA uses &ldquo;landmark&rdquo; for landmark roles while JAWS uses &ldquo;region.&rdquo;
              VoiceOver says &ldquo;web dialog&rdquo; instead of just &ldquo;dialog.&rdquo;
              Checkboxes are &ldquo;not checked&rdquo; in NVDA but &ldquo;unticked&rdquo; in VoiceOver.
              These variations are modeled in Speakable&rsquo;s per-reader renderers.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Position and Count Information</h3>
            <p className="text-sm text-slate-600">
              NVDA and Narrator include position information for options and radio buttons
              (&ldquo;3 of 195&rdquo;), while JAWS typically omits this. VoiceOver includes position
              for radio buttons but not always for options. Speakable includes position info where
              the respective reader would announce it in its default verbosity settings.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">State Announcements</h3>
            <p className="text-sm text-slate-600">
              Each reader handles states differently. NVDA says &ldquo;collapsed&rdquo; or &ldquo;expanded,&rdquo;
              JAWS may omit the state in some contexts, VoiceOver often announces it before the role,
              and Narrator places it after. Required fields are announced as &ldquo;required&rdquo; by
              all readers but at different positions in the output string.
            </p>
          </div>
        </div>
      </section>

      {/* Using with Speakable */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Using This Reference with Speakable</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          When Speakable analyzes your HTML, it maps elements to their implicit or explicit ARIA roles
          and generates output based on the patterns shown above. You can use this reference to:
        </p>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">1.</span>
            <p>Verify that your elements have the correct implicit role by using native HTML elements instead of ARIA overrides.</p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">2.</span>
            <p>Understand why Speakable output differs between readers. It reflects real-world variation, not bugs.</p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">3.</span>
            <p>Check which ARIA states are required for a role to ensure screen readers get complete information.</p>
          </div>
          <div className="flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-blue-600 font-bold text-lg shrink-0">4.</span>
            <p>Cross-reference with the <Link href="/docs/common-mistakes" className="text-blue-600 hover:underline">Common Mistakes</Link> page when roles like button, link, or heading show unexpected output.</p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Best Practices</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Prefer native HTML elements.</strong> Use{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;button&gt;</code> instead of{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;div role=&quot;button&quot;&gt;</code>.
              Native elements provide keyboard support and states for free.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Always provide accessible names for landmarks.</strong> A bare{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;nav&gt;</code> is announced
              as just &ldquo;navigation&rdquo;. Add <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-label</code> to
              differentiate multiple landmarks of the same type.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Include required states.</strong> Roles like{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">checkbox</code> require{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">aria-checked</code>. Without it,
              the screen reader cannot communicate the control&rsquo;s state.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Test with multiple readers.</strong> An element that sounds clear
              in NVDA may be confusing in VoiceOver due to different announcement order. Speakable shows all
              four outputs simultaneously to catch these gaps.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-600 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Don&rsquo;t override implicit roles.</strong> Adding{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">role=&quot;button&quot;</code> to a{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">&lt;button&gt;</code> is redundant.
              Adding conflicting roles (like <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">role=&quot;link&quot;</code> on a button)
              creates confusing output.
            </p>
          </div>
        </div>
      </section>

      <RelatedPages
        pages={[
          {
            href: '/docs',
            title: 'API Reference',
            description: 'Complete Speakable API documentation including all methods, options, and return types.',
          },
          {
            href: '/docs/component-patterns',
            title: 'Component Patterns',
            description: 'Accessible implementation patterns for common UI components with Speakable testing examples.',
          },
          {
            href: '/docs/glossary',
            title: 'Glossary',
            description: 'Definitions of accessibility terms, ARIA concepts, and screen reader terminology.',
          },
          {
            href: '/docs/how-screen-readers-work',
            title: 'How Screen Readers Work',
            description: 'Deep dive into how assistive technologies parse HTML and generate speech output.',
          },
        ]}
      />
    </>
  );
}
