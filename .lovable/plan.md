

## Plan: Replace Revenue Column with Won Revenue + Pipeline Revenue

### Overview
Replace the single "Revenue" column with two separate columns: "Won Revenue" (stage 16) and "Pipeline Revenue" (phases 1/2, excluding closed-negative stages). This reuses the existing `classifyRevenue` logic from `DataContext`.

### Changes

**1. `src/hooks/useColumnVisibility.ts`**
- Remove `'revenue'` from `ColumnId` type and `ALL_COLUMN_IDS`
- Add `'wonRevenue'` and `'pipelineRevenue'`

**2. `src/contexts/ColumnVisibilityContext.tsx`**
- Update `DEFAULT_VISIBLE` to replace `'revenue'` with `'wonRevenue'`, `'pipelineRevenue'`

**3. `src/contexts/DataContext.tsx`**
- Add per-project revenue classification helpers: `calculateProjectWonRevenue(project)` and `calculateProjectPipelineRevenue(project)` using the same stage 16 / phase 1-2 logic from `classifyRevenue`
- Expose both in context

**4. `src/components/ProjectTable.tsx`**
- Replace the single `revenue` column def with two column defs: `wonRevenue` and `pipelineRevenue`
- Update `RenderHelpers` interface, helpers object, and sort cases accordingly
- Remove old `'revenue'` sort case, add `'wonRevenue'` and `'pipelineRevenue'` sort cases
- Update `SortColumn` type

**5. `src/components/ColumnVisibilitySelector.tsx`**
- If column labels are defined here, update to show "Won Revenue" and "Pipeline Revenue" instead of "Revenue"

### Migration
Users with `'revenue'` saved in localStorage will have it filtered out (existing `loadFromStorage` already filters against `ALL_COLUMN_IDS`), so they'll just lose that column and can re-add the new ones. The new defaults will apply for fresh users.

