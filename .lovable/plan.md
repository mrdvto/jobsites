

## Remove GC Card, Redesign Layout, Protect GC Role

### Current State
The detail page top section is a 3-column grid: Project Information (2 cols) + right sidebar (1 col) containing Assignment card and GC card. Removing the GC card leaves only a small Assignment card on the right, wasting space.

### Proposed Layout Change

**Merge Assignment into the Project Information card** and make it full-width (no more right sidebar column).

```text
BEFORE:                              AFTER:
┌──────────────────┐ ┌────────┐     ┌─────────────────────────────────┐
│ Project Info     │ │Assignmt│     │ Project Information        [Edit]│
│ (2 cols)         │ ├────────┤     │                                 │
│                  │ │ GC Card│     │ Location  │ Assignment          │
│                  │ │        │     │ Owner     │ Assignees: ...      │
│                  │ └────────┘     │ Desc      │ Opportunities: 5    │
└──────────────────┘               └─────────────────────────────────┘
```

The Assignment fields (Assignees, Current Opportunities count) move into the Project Information card as another section after the existing content, separated by a divider.

GC companies are already shown in the Companies table below -- no information is lost.

### Changes

**1. `src/pages/ProjectDetail.tsx`**
- Remove the `lg:grid-cols-3` grid and right sidebar column entirely (lines ~573-660: Assignment card + GC card)
- Change top card from `lg:col-span-2` to full-width
- Add Assignment section (Assignees + Opportunity count) inside the Project Information card, after the existing content, with a `<Separator />`
- Remove GC-related state variables (`showAddGCModal`, `showRemoveGCDialog`, `showEditGCModal`) and handlers (`handleRemoveGC`, `primaryGC` logic)
- Remove GC-related modal renders (`AddGCModal`, `EditGCModal`, GC remove `AlertDialog`)
- Remove unused imports (`AddGCModal`, `EditGCModal`)

**2. `src/pages/ManageDropdowns.tsx`**
- Make the "General Contractor" (id: `GC`) row in the Subcontractor Role dropdown non-editable and non-deletable
- When rendering rows, if `selectedDropdown === 'subcontractorRole'` and `item.id === 'GC'`:
  - In edit mode: disable the label input (make it read-only)
  - Hide the delete button
- When deleting via confirmation: block deletion if item.id === 'GC' (safety net)
- In edit mode label inputs: make the GC row's input `readOnly` with muted styling

