

# Add Sorting to All Job Site Detail Tables

## Overview
Add column-header sorting to each of the four tables on the job site detail page, following the same pattern already used in the `JobSiteTable` component (click to cycle asc / desc / none, with sort icons).

## Shared Pattern
Each table gets its own sort state (`sortColumn` + `sortDirection`) and a `handleSort` function. Clicking a column header cycles through ascending, descending, then unsorted. Sort icons (ArrowUpDown, ArrowUp, ArrowDown) are already imported via `lucide-react`.

A reusable `SortIcon` helper will be extracted or inlined per table, matching the existing JobSiteTable pattern.

## Changes

### 1. Opportunities Table (in `src/pages/JobSiteDetail.tsx`)

**Sortable columns:** Opportunity Number (numeric), Description (string), Division (string), Stage (string), Est. Revenue (numeric)

**State:**
- `oppSortColumn` / `oppSortDirection`

**Sort logic:**
- Number: numeric comparison on `opp.id`
- Description: `localeCompare`
- Division: `localeCompare` on `fullOpp?.divisionId`
- Stage: `localeCompare` on `opp.status`
- Revenue: numeric comparison on `opp.revenue`

**UI:** Each `TableHead` gets `cursor-pointer`, `group`, `hover:bg-muted/50` classes and an `onClick` handler; sort icon appended.

### 2. Subcontractors & Companies Table (`src/components/SiteCompaniesTable.tsx`)

**Sortable columns:** Company (string), Role (string), Contacts (numeric count)

**State:**
- `sortColumn` / `sortDirection` added to the component

**Sort logic:**
- Company: `localeCompare` on `companyName`
- Role: `localeCompare` on `roleDescription`
- Contacts: numeric comparison on `companyContacts.length`

**UI:** Same header pattern. The expand/collapse chevron column and action column remain unsortable.

### 3. Activities Table (in `src/pages/JobSiteDetail.tsx`)

**Sortable columns:** Assignee (string), Activity Type (string), Date (date), Description (string)

**State:**
- `actSortColumn` / `actSortDirection`

**Sort logic:**
- Assignee: `localeCompare` on resolved `getSalesRepName(activity.assigneeId)`
- Activity Type: `localeCompare` on `activityType`
- Date: numeric comparison on `new Date(activity.date).getTime()`
- Description: `localeCompare` on `description`

**UI:** The action column (edit/delete buttons) remains unsortable.

### 4. Equipment Table (in `src/pages/JobSiteDetail.tsx`, inside each collapsible group)

**Sortable columns:** Type (string), Make (string), Model (string), Year (numeric), Serial # (string), Hours (numeric)

**State:**
- `eqSortColumn` / `eqSortDirection` (shared across all groups -- sorting applies uniformly within each group)

**Sort logic:**
- Type/Make/Model/Serial: `localeCompare`
- Year/Hours: numeric comparison (treating undefined as 0)

**UI:** Same header pattern. Action column remains unsortable.

## Technical Details

| File | Change |
|------|--------|
| `src/pages/JobSiteDetail.tsx` | Add 3 sets of sort state (opp, activities, equipment), sort handlers, sorted arrays, and sortable column headers with icons for the Opportunities, Activities, and Equipment tables |
| `src/components/SiteCompaniesTable.tsx` | Add sort state, sort handler, sorted array, and sortable column headers with icons |

### New imports needed
- `ArrowUpDown`, `ArrowUp`, `ArrowDown` from `lucide-react` (already used in JobSiteTable, need to add to both files' imports)

### No changes to
- Data model / types
- DataContext
- Any other components

