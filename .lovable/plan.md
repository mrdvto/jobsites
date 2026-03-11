

## Add Subtle Bordered Cards to Project Information Columns

Wrap each of the 3 grid columns in a lightly bordered, rounded container with a faint background to visually distinguish sections.

### Changes to `src/pages/ProjectDetail.tsx`

**Line 380** — Column 1 (Location):
- Change `<div className="flex items-start gap-3">` to `<div className="rounded-lg border bg-muted/20 p-4 flex items-start gap-3">`

**Line 427** — Column 2 (Project Owner):
- Same change: add `rounded-lg border bg-muted/20 p-4` to the outer div

**Line 482** — Column 3 (Assignees + Description):
- Change `<div className="space-y-4">` to `<div className="rounded-lg border bg-muted/20 p-4 space-y-4">`

Three lines changed total. Cards stack naturally on mobile.

