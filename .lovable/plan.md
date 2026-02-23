

# Save Previous Note Content in Modification History

## Overview
When a note is edited, capture a snapshot of the old content and tags so users can see exactly what the note said before each edit.

## Changes

### 1. Extend `NoteModification` type (`src/types/index.ts`)

Add two optional fields to store the previous state:
- `previousContent?: string` -- the note content before the edit
- `previousTagIds?: string[]` -- the tag IDs before the edit

### 2. Capture old values in `updateNote` (`src/contexts/DataContext.tsx`)

Before applying the update, save the current `content` and `tagIds` into the new modification entry (only when those fields actually changed).

### 3. Display old content in history UI (`src/components/NotesSection.tsx`)

In the collapsible history list, show the previous content as a small quoted block below each edit entry when available.

### 4. Display old content in edit modal history (`src/components/NoteModal.tsx`)

Same treatment in the edit modal's history section -- show the previous content snippet under each entry.

## Technical Details

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `previousContent?: string` and `previousTagIds?: string[]` to `NoteModification` |
| `src/contexts/DataContext.tsx` | In `updateNote`, set `previousContent: note.content` when content changed; set `previousTagIds: note.tagIds` when tags changed |
| `src/components/NotesSection.tsx` | Render `mod.previousContent` as a truncated quote block inside history entries |
| `src/components/NoteModal.tsx` | Render `mod.previousContent` in the modal's history section |

