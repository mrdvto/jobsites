
# Enhanced Notes Feature for Job Sites

## Overview
Transform the current simple text-based notes system into a rich, structured notes management system with metadata tracking, file attachments, and tagging capabilities.

## Current State
- Notes are stored as a simple array of strings: `notes: string[]`
- Displayed as a basic bullet list in the Job Site Detail view
- No metadata, no attachments, no categorization

## Proposed Changes

### 1. Data Model Updates

#### New Note Interface
Create a structured `Note` type replacing the simple string array:

| UI Label | Field Name | Data Type | Example Value | Mandatory | Notes |
|----------|------------|-----------|---------------|-----------|-------|
| Note ID | id | number | 1001 | Yes | Auto-generated unique identifier |
| Content | content | string | "Safety briefing completed" | Yes | Main note text |
| Created Date | createdAt | string (ISO) | "2025-02-05T14:30:00Z" | Yes | Auto-populated on creation |
| Created By | createdById | number | 313 | Yes | Sales Rep ID of note author |
| Tags | tagIds | string[] | ["SAFETY", "COMPLIANCE"] | No | Array of tag IDs |
| Attachments | attachments | Attachment[] | See below | No | Array of file references |

#### New Attachment Interface

| UI Label | Field Name | Data Type | Example Value | Mandatory | Notes |
|----------|------------|-----------|---------------|-----------|-------|
| Attachment ID | id | number | 1 | Yes | Auto-generated |
| File Name | fileName | string | "safety_report.pdf" | Yes | Original file name |
| File URL | fileUrl | string | "blob:..." or external URL | Yes | Location of file |
| File Type | fileType | string | "application/pdf" | Yes | MIME type |
| File Size | fileSize | number | 102400 | Yes | Size in bytes |
| Uploaded At | uploadedAt | string (ISO) | "2025-02-05T14:30:00Z" | Yes | Upload timestamp |

#### New NoteTag Interface (for Manage Dropdowns)

| UI Label | Field Name | Data Type | Example Value | Mandatory | Notes |
|----------|------------|-----------|---------------|-----------|-------|
| Tag ID | id | string | "SAFETY" | Yes | Auto-generated from label |
| Label | label | string | "Safety" | Yes | Display name |
| Display Order | displayOrder | number | 1 | Yes | Sort order |
| Color | color | string | "red" | No | Badge color identifier |

### 2. Component Changes

#### Types (src/types/index.ts)
- Add `Attachment` interface
- Add `Note` interface  
- Update `JobSite` interface: change `notes: string[]` to `notes: Note[]`

#### Data Context (src/contexts/DataContext.tsx)
- Add `noteTags` state and management
- Add `addNote(siteId, note)` function
- Add `updateNote(siteId, noteId, updates)` function
- Add `deleteNote(siteId, noteId)` function
- Migrate existing string notes to new structure on load

#### Job Site Detail Page (src/pages/JobSiteDetail.tsx)
- Replace simple note list with rich Notes section card
- Display notes with:
  - Note content
  - Created date (formatted)
  - Created by (Sales Rep name)
  - Tag badges (filterable)
  - Attachment list with download/preview links
- Add "Add Note" button opening NoteModal
- Add note filtering by tag dropdown
- Add edit/delete actions per note

#### New Component: NoteModal (src/components/NoteModal.tsx)
- Modal for creating/editing notes
- Fields:
  - Content textarea (required)
  - Tag multi-select with available tags
  - Attachment upload area (drag-drop or file picker)
- Show existing attachments with remove option when editing
- Display created metadata (read-only when editing)

#### Manage Dropdowns (src/pages/ManageDropdowns.tsx)
- Add new "Note Tags" dropdown type
- Include color picker for tag badge colors
- Standard CRUD operations matching existing dropdown patterns

### 3. UI/UX Design

#### Notes Section Layout
```text
+------------------------------------------+
| Notes                        [+ Add Note] |
+------------------------------------------+
| [Filter by Tag: All ▼]                    |
+------------------------------------------+
| ┌──────────────────────────────────────┐ |
| │ Safety briefing completed for all    │ |
| │ personnel on site.                   │ |
| │                                      │ |
| │ [Safety] [Compliance]                │ |
| │                                      │ |
| │ 📎 safety_checklist.pdf (View)       │ |
| │                                      │ |
| │ Created: Feb 5, 2025 by Smith, John  │ |
| │                           [Edit] [X] │ |
| └──────────────────────────────────────┘ |
+------------------------------------------+
```

#### Note Modal Layout
```text
+------------------------------------------+
|          Add Note              [X]       |
+------------------------------------------+
| Note Content *                           |
| +--------------------------------------+ |
| |                                      | |
| |                                      | |
| +--------------------------------------+ |
|                                          |
| Tags                                     |
| [Safety ×] [Compliance ×] [+ Add Tag]    |
|                                          |
| Attachments                              |
| +--------------------------------------+ |
| | Drop files here or click to upload  | |
| +--------------------------------------+ |
| 📎 safety_checklist.pdf         [Remove] |
|                                          |
|              [Cancel]  [Save Note]       |
+------------------------------------------+
```

### 4. File Attachment Handling

For this prototype phase, attachments will be handled using:
- Browser File API for file selection
- Object URLs (blob:) for local preview/storage
- Base64 encoding for persistence in localStorage (prototype only)

**Note for Production**: A proper implementation would use Supabase Storage or similar cloud storage solution. The current approach is suitable for prototyping but would need refactoring for production use.

### 5. Implementation Sequence

1. **Types & Data Layer**
   - Update `src/types/index.ts` with new interfaces
   - Update `src/contexts/DataContext.tsx` with note management functions
   - Add note tags to dropdown management state

2. **Dropdown Management**
   - Add "Note Tags" to `ManageDropdowns.tsx`
   - Include color picker matching Project Status pattern

3. **Note Modal Component**
   - Create `src/components/NoteModal.tsx`
   - Implement form with validation
   - Add file upload handling
   - Add tag multi-select

4. **Job Site Detail Updates**
   - Redesign Notes section as dedicated card
   - Add filtering by tag
   - Display rich note cards with metadata
   - Integrate NoteModal for add/edit

5. **Data Migration**
   - Add migration logic for existing string notes to new structure
   - Assign default values (current user, current date) for migrated notes

### 6. Technical Notes

- **Tag Storage**: Tags stored in localStorage alongside other dropdown configurations
- **File Limits**: Suggest reasonable limits (e.g., 5MB per file, 10 files per note) for prototype
- **Filtering**: Client-side filtering by selected tag(s)
- **Sorting**: Notes displayed newest-first by default
