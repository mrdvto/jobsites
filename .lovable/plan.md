
## Plan: Fix Sticky Column Headers

### Problem
The `Table` component in `table.tsx` wraps the `<table>` in its own `<div className="relative w-full overflow-auto">`. This creates a nested scroll context that conflicts with the `max-h-[70vh] overflow-auto` wrapper in `ProjectTable.tsx`. The sticky header sticks relative to the inner wrapper, but scrolling happens on the outer one.

### Solution
Remove the wrapper div from the base `Table` component and handle the scroll container explicitly in `ProjectTable.tsx`.

### Changes

**1. `src/components/ui/table.tsx`**
- Remove the wrapper `<div className="relative w-full overflow-auto">` from the `Table` component
- Return just the `<table>` element directly

**2. `src/components/ProjectTable.tsx`**  
- The existing `<div className="max-h-[70vh] overflow-auto">` wrapper becomes the single scroll container
- Add `relative w-full` to this wrapper to maintain layout

This ensures there's only one scroll container, and the `<thead>` with `sticky top-0` will properly stick to it.
