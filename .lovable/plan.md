
# Fix Changelog Table Misalignment

## Problem
The `Collapsible` component from Radix wraps each table row with a `<div>`, breaking the valid HTML table structure (`<tbody> > <div> > <tr>` instead of `<tbody> > <tr>`). This causes columns to lose their alignment.

## Solution
Remove the `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent` wrappers and use plain React state (`open` boolean) to conditionally render the details row. This keeps the table DOM valid.

### File: `src/pages/JobSiteChangeLog.tsx`

- Remove `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` imports
- In `ExpandableRow`, replace the `Collapsible` wrapper with a React Fragment (`<>`)
- Replace `CollapsibleTrigger` with a plain `Button` that calls `setOpen(!open)`
- Replace `CollapsibleContent` with a conditional render: `{open && hasDetails && <tr>...</tr>}`
- Change the Summary `TableCell` from `className="flex items-center gap-1"` to use `inline-flex` or a wrapper `<div>` inside the cell to avoid breaking cell layout
