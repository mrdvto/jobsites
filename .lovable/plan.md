
# Multiple Contacts per Company at Job Sites

## Overview
Transform the current single-contact-per-company model into a multi-contact system, allowing users to specify that multiple people from the same company are working at a particular job site.

## Current State
- Each company association has a single `companyContact` object
- Site Companies table shows one row per company with one contact displayed
- Modals (AddGCModal, EditGCModal, AssociateCompanyModal) capture only one contact

## Proposed Data Model Changes

### Update SiteCompany Type
Change from single contact to an array of contacts:

| Field | Current Type | New Type |
|-------|-------------|----------|
| companyContact | `{ name, title, phone, email }` | Removed |
| companyContacts | N/A | `CompanyContact[]` |
| primaryContactIndex | N/A | `number` (optional, defaults to 0) |

### New CompanyContact Interface

| Field | Data Type | Mandatory | Description |
|-------|-----------|-----------|-------------|
| id | number | Yes | Unique identifier within the company |
| name | string | Yes | Contact person's name |
| title | string | No | Job title |
| phone | string | Yes | Phone number |
| email | string | Yes | Email address (clickable mailto link) |

## UI/UX Design

### Option A: Expandable Row Pattern (Recommended)
The Site Companies table shows one row per company. Clicking a row expands to reveal all contacts for that company in a sub-table or card layout.

```text
+----------------------------------------------------------+
| Company          | Role     | Contacts  | Actions        |
+----------------------------------------------------------+
| ▶ TURNER CONST   | GC       | 3 people  | [Edit] [X]     |
+----------------------------------------------------------+
| ▼ JDT CONTRACTOR | Plumbing | 2 people  | [Edit] [X]     |
|   ┌────────────────────────────────────────────────────┐ |
|   │ ★ Latisha Tyler, Fleet Manager                     │ |
|   │   312-555-0192 | latisha.tyler@jdtcontractor.com   │ |
|   ├────────────────────────────────────────────────────┤ |
|   │   Marcus Johnson, Site Foreman                     │ |
|   │   312-555-0193 | m.johnson@jdtcontractor.com       │ |
|   └────────────────────────────────────────────────────┘ |
+----------------------------------------------------------+
```

Benefits:
- Keeps table compact when viewing many companies
- Clear visual hierarchy between company and contacts
- Primary contact indicated with star icon
- Easy to scan which companies have multiple contacts

### Option B: Badge Count with Dialog
Keep the table simple with a "View X contacts" link that opens a dialog showing all contacts.

### Manage Contacts Modal
When clicking Edit on a company row, open a modal that allows:
1. Viewing all current contacts in a list
2. Adding new contacts (via form at bottom or "Add Contact" button)
3. Setting one contact as "Primary" (starred)
4. Removing individual contacts
5. Editing contact details inline or via sub-modal

```text
+------------------------------------------------+
|     Manage JDT CONTRACTOR Contacts      [X]    |
+------------------------------------------------+
| Role: Plumbing Subcontractor                   |
+------------------------------------------------+
| Contacts at this site:                         |
|                                                |
| ┌────────────────────────────────────────────┐ |
| │ ★ Latisha Tyler              [Set Primary] │ |
| │   Fleet Manager                             │ |
| │   312-555-0192                              │ |
| │   latisha.tyler@jdtcontractor.com           │ |
| │                          [Edit] [Remove]    │ |
| └────────────────────────────────────────────┘ |
|                                                |
| ┌────────────────────────────────────────────┐ |
| │   Marcus Johnson             [Set Primary] │ |
| │   Site Foreman                              │ |
| │   312-555-0193                              │ |
| │   m.johnson@jdtcontractor.com               │ |
| │                          [Edit] [Remove]    │ |
| └────────────────────────────────────────────┘ |
|                                                |
|              [+ Add Another Contact]           |
|                                                |
|                              [Done]            |
+------------------------------------------------+
```

### Adding a New Company
When adding a GC or associating a subcontractor:
1. First step: Select/enter company name and role
2. Second step: Add at least one contact (required)
3. Allow adding additional contacts before saving
4. Or: Keep initial flow simple (one contact), then use "Manage Contacts" to add more

## Implementation Plan

### 1. Type Updates (src/types/index.ts)
- Add `CompanyContact` interface with id, name, title, phone, email
- Update `JobSite.siteCompanies` to use `companyContacts: CompanyContact[]` instead of `companyContact`
- Add optional `primaryContactIndex` field

### 2. Data Migration (src/data/JobSite.json)
- Convert existing `companyContact` objects to `companyContacts` arrays
- Add sample sites with multiple contacts per company for demonstration

### 3. Context Updates (src/contexts/DataContext.tsx)
- Update `addSiteCompany` to accept contacts array
- Add `addContactToCompany(siteId, companyName, contact)` function
- Add `updateCompanyContact(siteId, companyName, contactId, updates)` function
- Add `removeCompanyContact(siteId, companyName, contactId)` function
- Add `setPrimaryContact(siteId, companyName, contactIndex)` function
- Migrate legacy single-contact data on load

### 4. New Component: ManageCompanyContactsModal
- Create `src/components/ManageCompanyContactsModal.tsx`
- Display list of all contacts for a company at this site
- Add/edit/remove contacts
- Set primary contact designation
- Validation: at least one contact required

### 5. Update AddGCModal
- Allow adding multiple contacts during creation
- Or keep simple and direct to ManageContacts modal after creation

### 6. Update AssociateCompanyModal
- When associating existing company, show available contacts from that company
- Allow selecting which contacts to include at this site
- Multi-select checkbox pattern for contacts

### 7. Update Site Companies Table (JobSiteDetail.tsx)
- Implement expandable row pattern
- Show contact count badge
- Display contacts on expand with primary indicator
- Replace single-row edit with "Manage Contacts" action

### 8. Update EditGCModal
- Refactor to use ManageCompanyContactsModal or extend for GC-specific handling

## Technical Considerations

### Backward Compatibility
- Migration function to convert `companyContact` to `companyContacts` array
- Run migration on DataContext initialization

### Validation Rules
- Each company at a site must have at least one contact
- Primary contact is always index 0 or explicitly set
- Contact email format validation
- Phone format should be consistent

### Performance
- Expandable rows use local state, no additional data fetching needed
- Contact list is typically small (<10 per company)

## Implementation Sequence

1. Update types and interfaces
2. Update sample data with multi-contact examples
3. Update DataContext with new functions and migration
4. Create ManageCompanyContactsModal component
5. Update Site Companies table with expandable rows
6. Update AddGCModal and AssociateCompanyModal
7. Test all workflows end-to-end
