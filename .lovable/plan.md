

## Plan: Filters Modal + Full-Height Table (Option B)

### Overview
Move the filter controls into a modal dialog, replace the FilterBar card with a compact toolbar showing a "Filters" button (next to the Columns button) and active filter badges. Make the table fill the remaining viewport height so there's only one scroll context.

### Changes

**1. New `FilterModal.tsx` component**
- A Dialog containing the current FilterBar form fields (Assignee, Division, Status, GC, Hide Completed)
- Opened via a `Filter` icon button placed in the table toolbar next to the Columns button
- Include a "Clear All" button in the modal footer

**2. New `ActiveFilterBadges.tsx` component**
- Renders inline badges summarizing active filters (e.g., "Status: Active, Planning", "Division: G, C", "GC: Smith")
- Each badge has an X to remove that filter
- Displayed in the table toolbar row between the project count and the buttons

**3. Update `ProjectTable.tsx`**
- Add the Filters button and ActiveFilterBadges to the existing toolbar (the `div` with project count + ColumnVisibilitySelector)
- Replace `max-h-[70vh]` with a dynamic calc-based height

**4. Update `ProjectList.tsx`**
- Remove `<FilterBar />` and `<KPICard />` from `<main>`
- Change layout to a flex column filling the viewport: header stays at top, table area grows to fill remaining space
- Structure becomes:
```text
┌─────────────────────────────┐
│ Header (fixed height)       │
├─────────────────────────────┤
│ KPI Card (fixed height)     │
├─────────────────────────────┤
│ Table toolbar: count │ badges │ [Filters] [Columns] │
│ ─────────────────────────── │
│ Table (flex-1, overflow-y)  │
│ ─────────────────────────── │
│ Pagination footer           │
└─────────────────────────────┘
```
- Use `h-screen flex flex-col` on the root, `flex-1 overflow-hidden` on the table card, and `flex-1 overflow-auto` on the table scroll area

**5. Remove `FilterBar.tsx`** (or keep as the modal's inner content)

### Files touched
- `src/components/FilterModal.tsx` — new
- `src/components/ActiveFilterBadges.tsx` — new
- `src/components/ProjectTable.tsx` — add filter button + badges to toolbar, change height to flex-1
- `src/pages/ProjectList.tsx` — remove FilterBar, restructure to full-height flex layout

