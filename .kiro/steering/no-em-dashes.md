---
inclusion: fileMatch
fileMatchPattern: "site/**/*.tsx"
---

# Writing Style: No Em Dashes or En Dashes

Never use em dashes (—) or en dashes (–) in prose text. They break cadence and feel overly formal. Use these alternatives instead:

## Replacement Rules

1. **Introducing an explanation or elaboration** → Use a colon (:)
   - Bad: "The tool catches issues — missing labels, broken hierarchy, incorrect roles"
   - Good: "The tool catches issues: missing labels, broken hierarchy, incorrect roles"

2. **Creating an aside or parenthetical** → Use commas or parentheses
   - Bad: "Focus management — critical for keyboard users — requires explicit control"
   - Good: "Focus management, critical for keyboard users, requires explicit control"
   - Good: "Focus management (critical for keyboard users) requires explicit control"

3. **Separating two independent clauses** → Split into two sentences with a period
   - Bad: "The button has no name — screen readers just say 'button'"
   - Good: "The button has no name. Screen readers just say 'button'."

4. **Ranges** → Use "to" or a hyphen
   - Bad: "2–3 days"
   - Good: "2-3 days" or "2 to 3 days"

5. **Attribution or source** → Use a comma
   - Bad: "According to the spec — ARIA 1.2 — this role requires..."
   - Good: "According to the spec (ARIA 1.2), this role requires..."

## Where This Applies

- All prose text in documentation pages (site/app/docs/)
- All user-facing strings in components
- README and markdown content

## Exceptions

- Code comments in template literal code blocks (already inside `<pre>` tags)
- ASCII art diagrams
- Technical syntax where a dash is part of the format (e.g., CLI flags like `--diff`)
