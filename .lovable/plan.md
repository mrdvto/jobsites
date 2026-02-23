

# Add Full Modification History Log to Notes

## Overview
Replace the single "last modified" tracking with a full edit history array, so every edit is recorded and users can see all past modifications.

## Changes

### 1. Add `NoteModification` type and update `Note` (`src/types/index.ts`)

Add a new interface and a history array to the Note:

```
interface NoteModification {
  modifiedAt: string;       // ISO timestamp
  modifiedById: number;     // sales rep ID
  summary: string;          // e.g. "Content updated", "Tags changed"
}

interface Note {
  ...existing fields...
  lastModifiedAt?: string;          // keep for quick display
  lastModifiedById?: number;        // keep for quick display
  modificationHistory?: NoteModification[];  // full log
}
```

### 2. Update `updateNote` in DataContext (`src/contexts/DataContext.tsx`)

When a note is updated, push a new entry onto `modificationHistory` in addition to stamping `lastModifiedAt`/`lastModifiedById`. Generate a human-readable summary based on which fields changed (content, tags, attachments).

### 3. Show expandable history on note cards (`src/components/NotesSection.tsx`)

Below the "Created" / "Modified" lines, if `modificationHistory` has entries, add a small clickable "View history (N edits)" link. When clicked, expand to show a compact list of all edits with timestamp and author, newest first.

### 4. Show history in edit modal (`src/components/NoteModal.tsx`)

In edit mode, below the created/modified metadata, show the full modification history as a scrollable list so the editor has full context before making changes.

## Technical Details

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `NoteModification` interface; add `modificationHistory?: NoteModification[]` to `Note` |
| `src/contexts/DataContext.tsx` | In `updateNote`, build a summary string from changed fields, push `{ modifiedAt, modifiedById, summary }` onto the history array |
| `src/components/NotesSection.tsx` | Add collapsible "View history" toggle below metadata showing timestamped edit entries |
| `src/components/NoteModal.tsx` | Add scrollable history list in edit mode metadata section |

