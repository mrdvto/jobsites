
## Overview

Two changes combined into one implementation:
1. Rename `dodgeProject` → generic `externalReference` (with a `source` field) so it can point to Dodge, IIR PEC Reports, or any future external system
2. Replace the two plain text inputs with an async search/lookup widget that simulates calling an external API (easy to wire to a real endpoint later)

---

## Data Model Change

```text
// Before
dodgeProject?: { url: string; name: string }

// After
externalReference?: { source: string; url: string; name: string }
// source examples: "Dodge Data & Analytics", "IIR PEC Reports"
```

---

## New Files

### `src/hooks/useExternalReferenceSearch.ts`
A self-contained async search hook. Simulates an API call with a 300ms debounce + 400ms fake network delay. Returns `{ results, isLoading }`. Mock dataset includes ~14 records across both Dodge and IIR PEC. This is the single place to swap in a real `fetch()` call later.

### `src/components/ExternalReferenceSearch.tsx`
A reusable controlled component used in both modals:

```text
Props:
  value: { source; name; url } | undefined
  onChange: (val: { source; name; url } | undefined) => void

Empty state:
  [ 🔍 Search for external project...   ]
        (type 2+ chars to search)

Loading state:
  [ 🔍 st. mary's...          ⏳ ]

Results dropdown (inline, no Popover overhead):
  ┌──────────────────────────────────────────┐
  │  St. Mary's Hospital West Wing Exp.      │
  │  Dodge Data & Analytics                  │
  ├──────────────────────────────────────────┤
  │  St. Mary's South Tower Renovation       │
  │  IIR PEC Reports                         │
  └──────────────────────────────────────────┘

Selected state (replaces search input entirely):
  ┌──────────────────────────────────────────┐
  │  Dodge Data & Analytics  [badge]         │
  │  St. Mary's Hospital West Wing Exp.  ↗   │
  │                                [Remove]  │
  └──────────────────────────────────────────┘
```

---

## Modified Files

### `src/types/index.ts`
- Remove `dodgeProject?: { url; name }`
- Add `externalReference?: { source: string; url: string; name: string }`

### `src/data/Project.json`
- For all 4 linked projects: rename key, add `"source": "Dodge Data & Analytics"`

### `src/pages/ProjectDetail.tsx`
- Change `project.dodgeProject` → `project.externalReference`
- Section header becomes `project.externalReference.source` (not hard-coded "Dodge Project")

### `src/components/EditProjectModal.tsx`
- Remove `dodgeProjectName`, `dodgeProjectUrl` state variables and their validation
- Replace the two `<Input>` fields with `<ExternalReferenceSearch value={...} onChange={...} />`
- Initialize from `project.externalReference`

### `src/components/CreateProjectModal.tsx`
- Same treatment as Edit modal
- Initializes empty on open

**`src/contexts/DataContext.tsx`**: No changes — it uses `Partial<Project>` for all updates so the renamed field flows through automatically.

---

## Key UX Details

- Search triggers at ≥2 characters
- Debounce of 300ms prevents firing on every keystroke
- Simulated 400ms "network" delay shows a loading spinner (prepares for real API swap)
- Each result row shows the project name prominently + source as a muted label below
- Once selected, the search input is replaced by a styled card — user must click "Remove" to change, preventing accidental overwrites
- The hook's mock data file is structured identically to what a real API response would return, so the swap is a 1-line change from `setTimeout` to `fetch`
