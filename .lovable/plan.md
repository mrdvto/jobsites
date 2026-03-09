

## Plan: Fix Sticky Column Headers

The `TableHeader` component already has `sticky top-0 z-10 bg-card` classes applied in `table.tsx`, but the sticky behavior isn't working because of CSS stacking context issues with the scroll container.

### Issue
The sticky positioning is applied to `<thead>` but for sticky to work properly within a scrollable container, the header needs to be sticky relative to the scroll container. The current implementation looks correct, so the issue is likely that `hover:bg-muted/50` on individual `TableHead` cells overrides the background, making content show through.

### Fix

**`src/components/ProjectTable.tsx`**
- Remove `hover:bg-muted/50` from `TableHead` elements or ensure the hover background is opaque
- The `TableHead` already has `bg-card` from `table.tsx`, but the hover class uses a semi-transparent muted color which breaks the visual during scroll

Change the hover class from `hover:bg-muted/50` to `hover:bg-muted` (fully opaque) on lines 329 and 341.

