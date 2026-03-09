

## Plan: Fix Opportunities Table at Tablet Resolution

### Problem
At tablet width (~834px), the 7-column opportunities table is too cramped. Description text wraps to 3-4 lines, columns are squeezed, and the table is difficult to read.

### Solution
Make the table responsive by wrapping it in a horizontal scroll container at tablet widths, and hide less-essential columns on smaller screens.

### Changes

**`src/pages/ProjectDetail.tsx`**

1. **Wrap table in overflow container**: Add `<div className="overflow-x-auto -mx-6 px-6">` around the `<Table>` to allow horizontal scrolling when the table is too wide, rather than crushing columns.

2. **Hide "Division" and "Sales Rep" columns on tablet**: Use `hidden md:table-cell lg:table-cell` to hide the Division column below `lg` breakpoint, and similarly for Sales Rep. These are the least critical columns — Stage and Revenue are most important.
   - Division column: `hidden lg:table-cell`
   - Sales Rep column: `hidden lg:table-cell`
   - This reduces to 5 columns at tablet (Type, Description, Stage, Est. Close, Est. Revenue)

3. **Update footer `colSpan`**: Adjust the footer total row `colSpan` to account for hidden columns (use a responsive approach or reduce to match visible columns).

4. **Header buttons**: Make the "Create New" and "Associate Existing" buttons stack or shrink on smaller screens using `flex-wrap`.

### Result
- At desktop (1024px+): All 7 columns visible
- At tablet (768-1024px): 5 columns visible (Type, Description, Stage, Est. Close, Est. Revenue), comfortable spacing
- Table scrolls horizontally if content still overflows

