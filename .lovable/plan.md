

# Add Inline Revenue Breakdown by Type to KPI Card

## Overview
Fill the whitespace to the right of the total revenue number by adding per-type revenue subtotals. Only types with non-zero revenue are shown. If total revenue is zero, the breakdown is hidden entirely.

## Changes

### 1. `src/contexts/DataContext.tsx` -- Add `getRevenueByType()` helper

New function that:
- Gets filtered sites (respects current filters)
- For each site's `associatedOpportunities`, finds the full opportunity record to get `typeId`
- Groups and sums revenue by type
- Returns only types with revenue > 0, sorted by `displayorder`

Returns: `{ typeId: number; typeName: string; revenue: number }[]`

Also add to context interface and provider value.

### 2. `src/components/KPICard.tsx` -- Display breakdown

- Change the card layout to `flex items-center justify-between` so the total stays left and the breakdown fills the right
- Call `getRevenueByType()` from context
- Render a flex row of small labeled amounts on the right side, each showing:
  - Type name as a small muted label
  - Revenue formatted compactly (e.g., `$125,000`)
- Only render the breakdown section when total revenue > 0
- Use small vertical dividers between type amounts for visual separation

### Edge Cases
- **Total = $0**: No breakdown shown, just the $0.00 total
- **One type only**: Still shows on the right for context
- **Filters change**: Breakdown updates automatically since it uses `getFilteredSites()`

## Files Modified

| File | Changes |
|------|---------|
| `src/contexts/DataContext.tsx` | Add `getRevenueByType()` to interface, implementation, and provider |
| `src/components/KPICard.tsx` | Add per-type revenue subtotals to right side of card |

