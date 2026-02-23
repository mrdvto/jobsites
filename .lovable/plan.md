
# Default Equipment Groups to Expanded and Remove Chevron Icon

## Changes

### File: `src/pages/JobSiteDetail.tsx`

Two small tweaks on the equipment collapsible groups:

1. **Default open**: Change `defaultOpen={hasSearch}` to `defaultOpen={true}` on line 875 so groups are always expanded by default (not just during search).

2. **Remove chevron icon**: Remove the `<ChevronRight>` element on line 878 and its surrounding `gap-2` div, leaving just the company name and badge.

| Line | Before | After |
|------|--------|-------|
| 875 | `defaultOpen={hasSearch}` | `defaultOpen={true}` |
| 877-879 | `<div className="flex items-center gap-2"><ChevronRight .../><span>` | `<div className="flex items-center gap-2"><span>` |

Also remove the `[&[data-state=open]>svg.chevron]:rotate-90` class from the `CollapsibleTrigger` on line 876 since the chevron is gone.
