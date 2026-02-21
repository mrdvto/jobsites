

# Fix: Auto-expand equipment groups during search

## Problem
The collapsible groups use `defaultOpen={hasSearch}`, which only takes effect when the component first mounts. When the user types into the search box, already-mounted groups remain collapsed, hiding the filtered results.

## Solution
Switch from the uncontrolled `defaultOpen` to the controlled `open` prop so that groups expand automatically whenever a search query is active.

- When `hasSearch` is true (search box has text), force all groups open via `open={true}`
- When `hasSearch` is false, leave `open` unset (omit the prop) so groups behave as normal toggle-able collapsibles

Since Radix's `Collapsible` does not support switching between controlled and uncontrolled cleanly with a single prop, the simplest approach is:
- Use `open={hasSearch ? true : undefined}` -- but Radix requires `open` to be boolean, not undefined, once set
- Better approach: use controlled state. Pass `open={hasSearch || undefined}` and `onOpenChange` only when not searching

The cleanest fix: always pass `open` and `onOpenChange` but override when searching:
```
<Collapsible open={hasSearch ? true : undefined}>
```

Actually the simplest working approach: just pass `open={true}` when searching and `defaultOpen={false}` when not. Since the `key` already includes `companyId`, we can add `hasSearch` to the key to force a remount when search state changes. This is the least code:

```
<Collapsible key={`${companyId}-${hasSearch}`} defaultOpen={hasSearch}>
```

## Technical Details

| File | Change |
|------|--------|
| `src/pages/JobSiteDetail.tsx` | Line 653: change `key={companyId}` to `key={\`${companyId}-${hasSearch}\`}` so the collapsible remounts when search toggles, making `defaultOpen={hasSearch}` re-evaluate |

This is a one-line change.

