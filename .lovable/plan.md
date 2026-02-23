

# Limit Displayed Edit History with "Show All" Expansion

## Problem
As notes accumulate edits, the modification history list grows unbounded, cluttering the note card and the edit modal.

## Solution
Show only the **3 most recent edits** by default, with a "Show all X edits" link that expands the full list inside a scroll-constrained container (max ~200px). This keeps the UI compact while preserving full access to history.

## Changes

### 1. `src/components/NotesSection.tsx`
- Slice the reversed `modificationHistory` to the first 3 entries by default.
- Add local state per note (or inline toggle) to expand the full list.
- When expanded, wrap entries in a `ScrollArea` with `max-h-[200px]` so very long histories don't blow out the card.
- Show a small link: "Show all 12 edits" / "Show less" to toggle.

### 2. `src/components/NoteModal.tsx`
- Apply the same pattern to the edit modal's history section: show 3 most recent, with a toggle and scroll area for the rest.

## Technical Details

| Aspect | Detail |
|--------|--------|
| Default visible entries | 3 (most recent) |
| Expanded container | `ScrollArea` with `max-h-[200px]` |
| Toggle text | "Show all N edits" / "Show less" |
| State management | Local `useState` boolean per component instance |
| Files changed | `NotesSection.tsx`, `NoteModal.tsx` |

No data model or context changes needed -- this is purely a UI display concern.

