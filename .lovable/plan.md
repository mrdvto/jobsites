
# Multiple Contacts per Company at Job Sites

## Status: ✅ COMPLETED

## Overview
Transformed the single-contact-per-company model into a multi-contact system, allowing users to specify that multiple people from the same company are working at a particular job site.

## Implementation Summary

### 1. Type Updates (src/types/index.ts) ✅
- Added `CompanyContact` interface with id, name, title, phone, email
- Added `SiteCompany` interface with `companyContacts: CompanyContact[]` array
- Added optional `primaryContactIndex` field to designate primary contact
- Kept legacy `companyContact` field for backward compatibility during migration

### 2. Data Migration ✅
- `DataContext.tsx` includes `migrateSiteCompanies()` function that converts legacy single-contact data
- First sample site (St. Mary's Hospital) updated with multiple contacts per company in JSON

### 3. New Components ✅
- **ManageCompanyContactsModal** (`src/components/ManageCompanyContactsModal.tsx`)
  - Full CRUD for contacts within a company association
  - Set primary contact designation
  - Inline editing and add contact forms
  
- **SiteCompaniesTable** (`src/components/SiteCompaniesTable.tsx`)
  - Expandable row pattern using Collapsible component
  - Shows contact count badge per company
  - Expands to reveal all contacts with primary indicator (star)
  - Edit button opens ManageCompanyContactsModal

### 4. Updated Components ✅
- **AddGCModal**: Now creates company with `companyContacts` array
- **AssociateCompanyModal**: Associates company with full contact list
- **EditGCModal**: Refactored to work with multi-contact structure, includes "Manage Contacts" button
- **JobSiteDetail**: Updated GC card to display primary contact from array, uses new SiteCompaniesTable

## UI/UX Design

### Expandable Row Pattern (Implemented)
```
+----------------------------------------------------------+
| ▶ | Company          | Role     | Contacts  | Actions    |
+----------------------------------------------------------+
| ▶ | TURNER CONST     | GC       | 3 people  | [✎] [X]    |
+----------------------------------------------------------+
| ▼ | JDT CONTRACTOR   | Plumbing | 2 people  | [✎] [X]    |
|   +------------------------------------------------------+
|   | ★ Latisha Tyler, Fleet Manager                       |
|   |   312-555-0192 | latisha.tyler@jdtcontractor.com     |
|   +------------------------------------------------------+
|   |   Marcus Johnson, Site Foreman                       |
|   |   312-555-0193 | m.johnson@jdtcontractor.com         |
|   +------------------------------------------------------+
+----------------------------------------------------------+
```

### Key Features
- Click chevron to expand/collapse contact list
- Primary contact indicated with star icon
- Email addresses are clickable mailto links
- Edit button opens full contact management modal
- At least one contact required per company

## Technical Notes

### Backward Compatibility
- Migration function converts legacy `companyContact` to `companyContacts` array
- Migration runs automatically on data load in DataContext
- Legacy field kept optional in type definition

### Validation Rules
- Each company must have at least one contact
- Primary contact defaults to index 0
- Email required for all contacts
