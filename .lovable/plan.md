

## Fix: Column Visibility Not Syncing Between Selector and Table

### Root Cause
`useColumnVisibility()` uses `useState` internally. Each component calling it (`ColumnVisibilitySelector` and `ProjectTable`) gets its own independent state copy. Changes in one don't propagate to the other — only localStorage is updated, which only takes effect on page reload.

### Solution
Lift the column visibility state into a React Context provider so all consumers share a single state instance.

### Changes

**New file: `src/contexts/ColumnVisibilityContext.tsx`**
- Create a `ColumnVisibilityProvider` that wraps the existing hook logic
- Expose `visibleColumns`, `toggleColumn`, `isVisible`, `moveColumn`, `setVisibleColumns` via context
- Export a `useColumnVisibility()` hook that reads from context (replacing the current standalone hook)

**Modified: `src/hooks/useColumnVisibility.ts`**
- Keep type exports (`ColumnId`, `ALL_COLUMN_IDS`) and the storage/default constants
- Remove the hook itself (logic moves to context)
- Re-export `useColumnVisibility` from the context module for backward compatibility

**Modified: `src/pages/ProjectList.tsx`**
- Wrap the page content with `<ColumnVisibilityProvider>` so both `ColumnVisibilitySelector` and `ProjectTable` share state

**No changes needed to:**
- `ColumnVisibilitySelector.tsx` — imports stay the same
- `ProjectTable.tsx` — imports stay the same

### Technical Detail
The context provider will hold the `useState` and `useCallback` logic currently in the hook. Both the selector popover and the table will consume the same context, so toggling/reordering columns updates both immediately without requiring a page refresh.

