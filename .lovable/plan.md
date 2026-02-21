

# Replace Opportunity Number with Type & Add Filters to Opportunities Table

## Overview
Replace the "Opportunity Number" column with an "Opportunity Type" column in the opportunities table on the job site detail page, and add filter dropdowns above the table for Stage, Division, and Type.

## Changes

### 1. Replace Column (in `src/pages/JobSiteDetail.tsx`)

- Remove the "Opportunity Number" column header and its corresponding `TableCell` (which shows `opp.id`)
- Add a new "Type" column header (sortable) that displays `opp.type` as a badge
- Update the `oppSortColumn` state type to replace `'id'` with `'type'`
- Update the sort logic: replace the numeric `id` comparison with a `localeCompare` on `opp.type`

### 2. Add Filter Row Above Table

Add three filter dropdowns between the action buttons and the table, displayed inline:

- **Stage filter**: populated from the site's associated opportunities' unique `status` values; filters to matching rows
- **Division filter**: populated from the full opportunity data's unique `divisionId` values; filters to matching rows
- **Type filter**: populated from the site's associated opportunities' unique `type` values; filters to matching rows

Each defaults to "All" and can be independently selected.

### 3. New State

- `oppFilterStage` (string, default `'all'`)
- `oppFilterDivision` (string, default `'all'`)
- `oppFilterType` (string, default `'all'`)

### 4. Filtering Logic

Applied before sorting: filter `site.associatedOpportunities` by matching `status`, `type`, and `divisionId` (looked up from the full `opportunities` array) against the selected filter values.

## Technical Details

| File | Change |
|------|--------|
| `src/pages/JobSiteDetail.tsx` | Replace `'id'` with `'type'` in sort column type and sort logic; swap the first column from Opportunity Number to Type; add 3 filter state variables; add filter UI row with Select dropdowns; apply filtering before sorting |

No other files are changed. The `opp.type` field already exists on associated opportunities in the data model.
