

## Fix Tablet Layout Issues on Project Detail Page

At 768px (the `md` breakpoint), several elements are too cramped or overflow their containers. The core problem is that multi-column grids activate at `md` when they need more room.

### Issues Identified

1. **Project Information 3-column grid** (line 378): `md:grid-cols-3` activates at exactly 768px, making the Location, Project Owner, and Assignees+Description cards too narrow. The Address/Coordinates toggle buttons overflow within the Location card.

2. **Revenue 4-column grid** (line 636): `md:grid-cols-4` is cramped at tablet width with long labels like "Open Leads & Opportunities".

3. **Activities table** (line 864): No responsive hiding of columns — all 6 columns (Assignee, Activity Type, Date, Status, Description, Actions) render at tablet width, causing text wrapping and cramped cells.

4. **Companies table header** (line 810-826): The "Create New" and "Associate Existing" buttons don't wrap gracefully — missing `flex-wrap gap-2`.

### Changes

**`src/pages/ProjectDetail.tsx`**

1. **Line 378** — Change Project Information grid from `md:grid-cols-3` to `lg:grid-cols-3`. At tablet, columns stack to single-column, giving each card full width.

2. **Line 636** — Change Revenue grid from `md:grid-cols-4` to `lg:grid-cols-4`, keeping `grid-cols-2` as the base so it shows a 2x2 grid on tablet.

3. **Line 812** — Add `flex-wrap gap-2` to the Companies header button container (same pattern already used in Leads & Opportunities header on line 665).

4. **Lines 867-881** — Hide the "Description" column at tablet by adding `hidden lg:table-cell` to its `TableHead`, and do the same for the corresponding `TableCell` on line 910. This matches the pattern already used in the Leads & Opportunities table.

5. **Line 864** — Wrap the Activities table in `<div className="overflow-x-auto -mx-6 px-6">` to allow horizontal scrolling as a safety net, matching the Leads & Opportunities table wrapper on line 735.

