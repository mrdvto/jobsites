

# Add Example Modification History Data to Notes

## Overview
Seed several notes in `src/data/JobSite.json` with `modificationHistory` entries so the expandable "View history" feature is visible with realistic data out of the box.

## Changes

### File: `src/data/JobSite.json`

Add `lastModifiedAt`, `lastModifiedById`, and `modificationHistory` fields to select notes across multiple job sites. This will make the history UI immediately visible without requiring users to edit notes first.

**Site 500101 (St. Mary's Hospital) - Notes 1 and 2:**
- Note 1: Two edits -- first to update the shutdown time from 6 PM to 5:45 PM, then to add the compliance tag.
- Note 2: One edit -- updated to add details about the security trailer check-in.

**Site 500102 (MetLife Stadium) - Note 1:**
- One edit -- schedule details refined after coordination with stadium operations.

**Site 500103 (I-95 Corridor) - Note 2:**
- One edit -- delivery window adjusted based on DOT feedback.

Each `modificationHistory` entry will include a realistic `modifiedAt` timestamp (after the note's `createdAt`), a `modifiedById` referencing an existing sales rep, and a descriptive `summary` string (e.g., "Content updated", "Tags changed", "Content updated, Tags changed").

## Technical Details

| Field | Example Value |
|-------|--------------|
| `modifiedAt` | `"2025-01-18T10:15:00.000Z"` |
| `modifiedById` | `313` (or other valid sales rep IDs) |
| `summary` | `"Content updated"`, `"Tags changed"`, `"Content updated, Tags changed"` |

No code logic changes needed -- only JSON data updates to the existing notes array entries.
