

# Change Log with User Attribution

## Overview
Extend the previously approved change log plan to include who made each change. Since this is a single-user demo app without authentication, we will use a "Current User" setting (defaulting to the first sales rep) that can be changed via the Settings panel. Every log entry will record the acting user's sales rep ID.

## Changes

### 1. `src/types/index.ts` -- Add ChangeLogEntry type

```typescript
export interface ChangeLogEntry {
  id: number;
  siteId: number;
  timestamp: string;
  action: string;           // e.g. "COMPANY_REMOVED"
  category: string;         // "Site" | "Opportunity" | "Company" | "Activity" | "Note" | "Equipment"
  summary: string;          // Human-readable description
  changedById: number;      // Sales rep ID of the person who made the change
  details?: Record<string, any>;
}
```

### 2. `src/contexts/DataContext.tsx` -- Track current user and log changes

- Add `currentUserId` state (defaults to first sales rep ID from data, e.g. 313) and `setCurrentUserId` setter, both exposed on the context.
- Add `changeLog` state array and internal `logChange(siteId, action, category, summary, details?)` helper that appends an entry with `changedById: currentUserId` and the current timestamp.
- Expose `getChangeLog(siteId): ChangeLogEntry[]` on the context.
- Instrument all mutation functions to call `logChange` with descriptive summaries:
  - `updateJobSite` -- "Site details updated (fields: ...)"
  - `addOpportunityToSite` -- "Opportunity '[desc]' associated"
  - `createNewOpportunity` -- "Opportunity '[desc]' created"
  - `updateOpportunity` -- "Opportunity updated (fields: ...)"
  - `addSiteCompany` / `removeSiteCompany` / `updateSiteCompany`
  - `addActivity` / `updateActivity` / `deleteActivity`
  - `addNote` / `updateNote` / `deleteNote`
  - `addCustomerEquipment` / `updateCustomerEquipment` / `deleteCustomerEquipment`

### 3. `src/pages/JobSiteChangeLog.tsx` -- New page

- Route: `/site/:id/changelog`
- Header with back button, site name, and "Change Log" title
- Category filter tabs: All, Site, Opportunity, Company, Activity, Note, Equipment
- Table columns: **Date/Time**, **Changed By** (formatted name via `getSalesRepName`), **Category** (badge), **Summary**
- Expandable rows to show `details` when present
- Empty state when no entries exist

### 4. `src/App.tsx` -- Add route

- `<Route path="/site/:id/changelog" element={<JobSiteChangeLog />} />`

### 5. `src/pages/JobSiteDetail.tsx` -- Add navigation button

- Add a "Change Log" button with a `History` icon in the header, linking to `/site/${site.id}/changelog`

### 6. `src/components/SettingsPanel.tsx` -- Add current user selector

- Add a "Current User" dropdown populated from `salesReps`, bound to `currentUserId` / `setCurrentUserId` from context
- This lets the demo simulate different users making changes

---

### Files Changed

| File | What changes |
|------|-------------|
| `src/types/index.ts` | Add `ChangeLogEntry` interface with `changedById` field |
| `src/contexts/DataContext.tsx` | Add `currentUserId`, `changeLog`, `logChange`, `getChangeLog`; instrument all mutations |
| `src/pages/JobSiteChangeLog.tsx` | New page with filtered table showing who changed what and when |
| `src/App.tsx` | Add changelog route |
| `src/pages/JobSiteDetail.tsx` | Add "Change Log" button in header |
| `src/components/SettingsPanel.tsx` | Add "Current User" selector |

