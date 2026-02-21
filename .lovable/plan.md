
# Collapsible & Searchable Customer Equipment List

## Overview
Redesign the equipment table so entries are grouped by company and collapsed by default. Add a search bar to filter equipment across all fields. This handles the case where many companies each have multiple machines on a large site.

## Changes

### 1. Equipment Section in `src/pages/JobSiteDetail.tsx`

**Search bar**
- Add a text input with a search icon below the section header / "Add Equipment" button
- Filter equipment entries by matching the search query (case-insensitive) against: company name, equipment type, make, model, year, serial number

**Group by company**
- Group the equipment array by `companyId`
- Each group becomes a collapsible section using the existing `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` components from `@/components/ui/collapsible`
- The trigger row shows: company name, a count badge (e.g., "3 machines"), and a chevron icon
- The content contains the equipment table rows for that company (same columns as today minus the "Company" column, since it is now the group header)
- Groups default to collapsed; clicking the trigger toggles open/closed
- If a search is active, auto-expand all groups that have matching results

**State additions**
- `equipmentSearch: string` -- the search query
- No additional state needed for collapsible -- each `Collapsible` manages its own open/closed state, but we will use controlled `open` prop to force-open when search is active

**New imports**
- `Input` from `@/components/ui/input`
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`
- `Search`, `ChevronRight` from `lucide-react`

### 2. Layout per company group

```text
+------------------------------------------------------+
| [v] Granite Excavation and Demolition    (2 machines) |
|   Type       Make        Model   Year  Serial#  Hours |
|   Excavator  Caterpillar 320F    2019  CAT320.. 3,450 |
|   Boom Lift  JLG         600S    2020  JLG600.. 1,200 |
+------------------------------------------------------+
| [>] Mortenson Construction               (1 machine) |
+------------------------------------------------------+
```

### 3. No changes to other files
- No data model changes
- No modal changes
- No context changes

## Technical Details

| File | Change |
|------|--------|
| `src/pages/JobSiteDetail.tsx` | Add search input, group equipment by `companyId`, render each group as a `Collapsible` with an equipment sub-table, remove "Company" column from rows (now in group header) |

### Grouping logic (pseudocode)
```
filtered = equipment.filter(eq => matches search across all fields)
grouped = Map<companyId, { companyName, items: CustomerEquipment[] }>
for each filtered eq:
  grouped[eq.companyId].items.push(eq)
render each group as Collapsible
```
