

## Plan: Multi-Division Prospects + Division Display

### Problem
A prospect company can belong to multiple divisions, but the current model only stores a single `divisionId`. Additionally, division info is not displayed anywhere in the project detail view.

### Changes

**1. Update `ProspectData` interface (`src/components/CreateProspectModal.tsx`)**
- Rename `divisionId: string` to `divisionIds: string[]`

**2. Update Create Prospect Modal UI (`src/components/CreateProspectModal.tsx`)**
- Replace the single `Select` dropdown with a multi-select using checkboxes (similar pattern to `MultiSelectFilter` component already in the codebase)
- Use a `Popover` with checkboxes listing all 7 divisions. Display selected count or names on the trigger button.
- Update validation: at least one division must be selected
- Update `resetForm` to clear to `[]`
- Update `handleSubmit` and `onSave` payload

**3. Update `ProjectCompany` type (`src/types/index.ts`)**
- Add optional `divisionIds?: string[]` field to `ProjectCompany`

**4. Store divisions when creating prospect (`src/pages/ProjectDetail.tsx`)**
- In the `onSave` handler for `CreateProspectModal`, pass `data.divisionIds` into the `addProjectCompany` call

**5. Display divisions in Companies table (`src/components/ProjectCompaniesTable.tsx`)**
- Add a "Divisions" column to the table header (after Role)
- Render division badges for each company using `DIVISIONS` lookup for display names
- Only show badges if `divisionIds` exists and is non-empty; otherwise show "—"

### UI Details
- The multi-select will use a Popover with checkboxes (matching existing patterns in the app), showing division codes as badges when selected
- The Companies table gets a new narrow column showing division badges like `G`, `C`, `P`

