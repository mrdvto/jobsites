

# Add Modification Tracking to Notes

## Overview
Currently, notes track who created them and when, but there's no record of modifications. This plan adds a modification history to each note so users can see who last edited it and a full log of all edits.

## Changes

### 1. Update the `Note` type (`src/types/index.ts`)

Add two new fields to the `Note` interface:
- `lastModifiedAt?: string` -- ISO timestamp of the most recent edit
- `lastModifiedById?: number` -- the sales rep ID who last made the edit

These optional fields keep backward compatibility with existing notes that haven't been edited.

### 2. Update `updateNote` in `DataContext` (`src/contexts/DataContext.tsx`)

When a note is updated, automatically stamp `lastModifiedAt` and `lastModifiedById` using the current user and current time, so the caller doesn't need to pass these explicitly:

```
const updateNote = (siteId, noteId, updates) => {
  // Merge updates + set lastModifiedAt/lastModifiedById automatically
};
```

### 3. Display modification info on each note (`src/components/NotesSection.tsx`)

In the footer of each note card (line ~227-231), add a "Modified" line below the existing "Created" line when `lastModifiedAt` is present:

```
Created: 1/15/2025 by John Smith
Modified: 1/18/2025 by Jane Doe
```

### 4. Show modification info in the edit modal (`src/components/NoteModal.tsx`)

In edit mode, the modal already shows "Created: ... by ...". Add a second line showing the last modification info if present, so the editor can see the full history before making further changes.

## Technical Details

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `lastModifiedAt?: string` and `lastModifiedById?: number` to `Note` interface |
| `src/contexts/DataContext.tsx` | In `updateNote`, merge `lastModifiedAt: new Date().toISOString()` and `lastModifiedById: currentUserIdRef.current` into the update |
| `src/components/NotesSection.tsx` | Below the "Created" span (~line 229), conditionally render a "Modified" span with date and author |
| `src/components/NoteModal.tsx` | In edit mode metadata block (~line 148), conditionally show last modified info |

