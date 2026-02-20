

# Allow Multiple Sales Reps per Job Site

## Overview
Currently each job site has a single `salesRepId: number` field. This change converts it to an array (`salesRepIds: number[]`) and updates every touchpoint across the app.

## All Areas That Need to Change

### 1. Data Model (`src/types/index.ts`)
- Change `salesRepId: number` to `salesRepIds: number[]` on the `JobSite` interface

### 2. Source Data (`src/data/JobSite.json`)
- Convert every job site's `salesRepId` field from a single number to an array (e.g., `"salesRepIds": [236]`)

### 3. DataContext (`src/contexts/DataContext.tsx`)
- Update `getSalesRepName` or add a new `getSalesRepNames(ids: number[]): string` helper that returns a comma-separated list
- Update the **Sales Rep filter** logic -- a site should match if *any* of its assigned reps matches the selected filter value
- Update `addNote` -- currently uses `site.salesRepId` as the default `createdById`; will need to pick the first rep or handle differently
- Update `getFilteredSites()` filter comparison from `site.salesRepId !== parseInt(...)` to `site.salesRepIds.includes(parseInt(...))`

### 4. Job Site Detail Page (`src/pages/JobSiteDetail.tsx`)
- Update the "Sales Rep" display in the Sales Information card to list all assigned reps (e.g., as comma-separated names or stacked list)

### 5. Job Site Table (`src/components/JobSiteTable.tsx`)
- Update the Sales Rep column to display multiple names (e.g., "Merritt, Trina; Miles, Theron")
- Update sorting logic -- sort by the first rep's name or concatenated names

### 6. Edit Job Site Modal (`src/components/EditJobSiteModal.tsx`)
- Replace the single sales rep combobox with a multi-select that shows selected reps as removable chips/badges
- Track state as `salesRepIds: number[]` instead of `salesRepId: number`
- Allow adding and removing reps from the list

### 7. Create Job Site Modal (`src/components/CreateJobSiteModal.tsx`)
- Same multi-select treatment as the Edit modal
- Require at least one sales rep to be selected
- Save as `salesRepIds: number[]`

### 8. Filter Bar (`src/components/FilterBar.tsx`)
- No structural change needed -- the single-select filter stays (you pick one rep and see all sites where that rep is assigned), but the matching logic change happens in DataContext

### 9. Create Opportunity Modal (`src/components/CreateOpportunityModal.tsx`)
- Currently auto-fills `salesRepId` from the site -- will need to either pick the first rep or let the user choose which rep owns the opportunity

## Technical Details

| File | Action |
|------|--------|
| `src/types/index.ts` | Rename `salesRepId` to `salesRepIds: number[]` |
| `src/data/JobSite.json` | Convert all `salesRepId` values to `salesRepIds` arrays |
| `src/contexts/DataContext.tsx` | Update filter logic, add multi-rep helper, update note creation |
| `src/pages/JobSiteDetail.tsx` | Display list of rep names |
| `src/components/JobSiteTable.tsx` | Display and sort by multiple reps |
| `src/components/EditJobSiteModal.tsx` | Multi-select sales rep picker |
| `src/components/CreateJobSiteModal.tsx` | Multi-select sales rep picker |
| `src/components/CreateOpportunityModal.tsx` | Handle default rep selection from array |

