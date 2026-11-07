# Speakable Drift Report — voiceover

_Generated: 2026-11-04T23:27:37.323Z_

**Version pins:** VoiceOver 0.0.1-VoiceOver4 · macOS 15.6.1 · webkit

Each row is a **correction candidate**: a place where Speakable diverges from what the real screen reader announced, on the pinned versions above. These are **advisory** — a human reviews them and decides whether the engine should change. A divergence caused by a bad capture is quarantined, not chased. The engine is never auto-mutated from this report.

Scored: **63** cases · Quarantined (excluded): **4** · Correction candidates: **66**.

## Systematic gaps (buckets, most impactful first)

| Bucket | Count |
|---|---|
| name: mismatch | 31 |
| role: mismatch | 15 |
| role: missing | 5 |
| state: extra | 5 |
| state: mismatch | 3 |
| state: missing | 3 |
| name: missing | 2 |
| role: extra | 2 |

## Correction candidates

| Case | Category | Field | Kind | Ground truth | Prediction |
|---|---|---|---|---|---|
| button-aria-label | buttons-links | name | mismatch | close dialog | close dialog / × |
| input-placeholder-only | form-controls | name | missing | search products | (none) |
| input-required-describedby | form-controls | role | missing | textbox | (none) |
| input-required-describedby | form-controls | name | mismatch | must be at least 8 characters / password must be at least 8 characters. required invalid data secure | must be at least 8 characters / password, edit text, required, must be at least 8 characters |
| radio-group | form-controls | name | mismatch | express / express / shipping speed / standard / standard | express / shipping speed / standard |
| heading-h1 | headings-structure | name | mismatch | level 1 welcome to speakable | welcome to speakable |
| heading-h1 | headings-structure | state | extra | (none) | level:1 |
| heading-role-arialevel | headings-structure | name | mismatch | level 2 billing settings | billing settings |
| heading-role-arialevel | headings-structure | state | extra | (none) | level:2 |
| nav-labelled | landmarks | role | mismatch | link / link | link / link / navigation |
| nav-labelled | landmarks | name | mismatch | docs / home | docs / home / primary |
| main-and-aside | landmarks | role | mismatch | complementary | complementary / main |
| button-aria-expanded | aria-states | role | mismatch | button | button / textbox |
| button-aria-expanded | aria-states | name | mismatch | options | delete / options |
| button-aria-expanded | aria-states | state | mismatch | expanded:false | expanded:false / position:1/2 / position:2/2 |
| link-image-only | buttons-links | role | mismatch | link | img / link |
| link-image-only | buttons-links | name | mismatch | image speakable home | speakable home |
| link-image-empty-alt | buttons-links | role | mismatch | link | img / link |
| link-image-empty-alt | buttons-links | name | missing | http://127.0.0.1:49309/ | (none) |
| button-submit | buttons-links | name | mismatch | place order | form |
| select-single | form-controls | name | mismatch | united states country | united states, country |
| input-invalid | form-controls | role | missing | textbox | (none) |
| input-invalid | form-controls | name | mismatch | email enter a valid email. invalid data / enter a valid email | email, edit text, invalid data, enter a valid email / enter a valid email |
| input-readonly | form-controls | role | missing | textbox | (none) |
| input-readonly | form-controls | name | mismatch | acc-1024 account id | account id, edit text, read only, acc-1024 |
| fieldset-group | form-controls | name | mismatch | billing address / city / city / street / street | billing address / city / street |
| input-number-spin | form-controls | role | mismatch | textbox | spinbutton |
| input-number-spin | form-controls | name | mismatch | 2 insertion on word: 2 quantity incrementable | quantity |
| ordered-list | headings-structure | name | mismatch | 1. first 1 of 3 / 2. second 2 of 3 / 3. third 3 of 3 | first / second / third |
| ordered-list | headings-structure | state | extra | (none) | position:1/3 / position:2/3 / position:3/3 |
| definition-list | headings-structure | name | mismatch | role 1 of 2 / the type of an element. 2 of 2 | role / the type of an element |
| blockquote | headings-structure | name | mismatch | accessibility is not a feature | accessibility is not a feature / blockquote |
| banner-contentinfo | landmarks | role | mismatch | contentinfo | banner / contentinfo |
| region-labelled | landmarks | role | extra | (none) | region |
| region-labelled | landmarks | name | mismatch | plans and pricing | plans and pricing / pricing |
| duplicate-nav-unlabelled | landmarks | role | mismatch | link / link / navigation | link / link / navigation / navigation |
| form-landmark | landmarks | name | mismatch | name / name | form, contact / name |
| tab-selected | aria-states | role | mismatch | tab | tab / tab / tablist |
| tab-selected | aria-states | name | mismatch | details | details / overview |
| tab-selected | aria-states | state | mismatch | position:2/2 | position:1/2 / position:2/2 |
| option-selected | aria-states | role | extra | (none) | listbox |
| option-selected | aria-states | name | mismatch | colors list box 1 item selected. red red selected (1 of 2) | blue, option, unselected / colors / red, option |
| option-selected | aria-states | state | extra | (none) | position:1/2 / position:2/2 / selected:true |
| aria-current-step | aria-states | role | mismatch | link | link / navigation |
| aria-current-step | aria-states | name | mismatch | current step link cart / payment | cart, link, current step / checkout / payment |
| progressbar | aria-states | name | mismatch | upload | 60% / upload |
| live-atomic | live-regions | name | mismatch | saved at 10:04 | at 10:04 / saved |
| conflicting-role-presentation | edge-cases | role | missing | button | (none) |
| hidden-but-focusable | edge-cases | role | mismatch | button | button / button |
| hidden-but-focusable | edge-cases | name | mismatch | real | ghost / real |
| empty-heading | edge-cases | role | mismatch | heading | heading / heading |
| empty-heading | edge-cases | state | extra | (none) | level:2 |
| nested-interactive | edge-cases | role | mismatch | link | button / link |
| nested-interactive | edge-cases | name | mismatch | outer inner | inner / outer / outer inner |
| runtime-disclosure | interactive-components | state | missing | expanded:false | (none) |
| runtime-tabs | interactive-components | role | mismatch | tab / tab | tab / tab / tab |
| runtime-tabs | interactive-components | name | mismatch | alerts / billing / profile selected tab, 1 of 3 account tab group | alerts / alerts / alerts, tab, selected true / billing / billing / billing, tab, selected false / billing, tab, selected true / profile / profile, tab, selected false |
| runtime-tabs | interactive-components | state | mismatch | position:2/3 / position:3/3 / selected:true / selected:true | selected:true / selected:true |
| runtime-accordion | interactive-components | name | mismatch | heading level 3 section one | section one |
| runtime-accordion | interactive-components | state | missing | expanded:false | (none) |
| runtime-combobox | interactive-components | name | mismatch | apple apple selected (1 of 3) / banana / banana banana selected (2 of 3) / fruit list box pop up | apple / apple, option, selected false / apple, option, selected true / apple, option, selected true / banana / banana, option, selected false / banana, option, selected true / cherry, option, selected false / fruit |
| runtime-combobox | interactive-components | state | missing | expanded:true | (none) |
| button-aria-labelledby | buttons-links | role | mismatch | button | button / listitem |
| button-aria-labelledby | buttons-links | name | mismatch | delete item | delete / delete item / 🗑 |
| button-icon-title | buttons-links | role | missing | button | (none) |
| button-icon-title | buttons-links | name | mismatch | ⚙ | ⚙, button, settings |

