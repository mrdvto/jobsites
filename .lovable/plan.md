

## Plan: Move Columns button to table toolbar (Option A)

### Changes

**1. `src/pages/ProjectList.tsx`**
- Remove `<ColumnVisibilitySelector />` from the header buttons area
- Remove its import

**2. `src/components/ProjectTable.tsx`**
- Import `ColumnVisibilitySelector`
- Add a flex toolbar row above the `<Table>` but inside the `<Card>`, showing project count on the left and the Columns button on the right

