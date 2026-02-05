
# Restrict Contact Addition to Existing Company Contacts

## Overview
Modify the "Add Contact" workflow in the ManageCompanyContactsModal so users can only select from contacts that already exist for that company across other job sites, rather than creating new contacts freely.

## Current Behavior
- When clicking "Add Another Contact", a form appears with free-text inputs for Name, Title, Phone, and Email
- Users can enter any values to create a new contact
- No validation against existing company contacts

## Proposed Behavior
- When clicking "Add Another Contact", users see a list of available contacts from that company (collected from other job sites)
- Users select which existing contacts to add to this site
- If all company contacts are already at this site, show an appropriate message
- Contacts that are already assigned to the current site are excluded from the selection list

## Implementation Details

### 1. Data Gathering Logic
Create a helper function to collect all unique contacts for a company across all job sites:

```typescript
const getAllCompanyContacts = (companyName: string): CompanyContact[] => {
  const contactsMap = new Map<string, CompanyContact>();
  
  jobSites.forEach(site => {
    site.siteCompanies.forEach(company => {
      if (company.companyName === companyName) {
        company.companyContacts.forEach(contact => {
          // Use email as unique identifier
          if (!contactsMap.has(contact.email)) {
            contactsMap.set(contact.email, contact);
          }
        });
      }
    });
  });
  
  return Array.from(contactsMap.values());
};
```

### 2. Update ManageCompanyContactsModal

**Props Changes**:
- Add `allCompanyContacts: CompanyContact[]` prop passed from parent
- Or pass `jobSites` and derive internally

**UI Changes**:
Replace the free-form "Add New Contact" form with a selection interface:

| Current UI | New UI |
|------------|--------|
| Input fields for name, title, phone, email | Checkbox list of available contacts |
| Manual data entry | Click to select, then "Add Selected" |

**New Add Contact Section Layout**:
```text
+------------------------------------------------+
| Add Contacts from JDT CONTRACTOR               |
+------------------------------------------------+
| Select contacts to add to this site:           |
|                                                |
| [ ] Marcus Johnson                             |
|     Site Foreman                               |
|     312-555-0193 | m.johnson@jdtcontractor.com |
|                                                |
| [ ] Latisha Tyler                              |
|     Fleet Manager                              |
|     312-555-0192 | latisha.tyler@jdt...        |
|                                                |
|              [Cancel]  [Add Selected]          |
+------------------------------------------------+
```

**Empty State**:
When no additional contacts are available:
```text
+------------------------------------------------+
| All contacts from this company are already     |
| assigned to this site.                         |
+------------------------------------------------+
```

### 3. Files to Modify

| File | Changes |
|------|---------|
| `src/components/ManageCompanyContactsModal.tsx` | Replace free-form add with selection UI; add prop for available contacts |
| `src/components/SiteCompaniesTable.tsx` | Compute and pass available contacts to modal |
| `src/contexts/DataContext.tsx` | Add helper function to get all contacts for a company (optional, could be local) |

### 4. Component Changes Detail

**ManageCompanyContactsModal.tsx**:
- Remove `addForm` state and free-text inputs
- Add `selectedAvailableContacts: Set<string>` state (using email as key)
- Compute `availableContacts` = all company contacts - current site contacts
- Replace add form with checkbox list of available contacts
- "Add Selected" button adds checked contacts to local `contacts` state

**SiteCompaniesTable.tsx**:
- Import `useData` to access `jobSites`
- Create helper to gather all contacts for the company being edited
- Pass `allCompanyContacts` prop to ManageCompanyContactsModal

### 5. Edge Cases

| Scenario | Handling |
|----------|----------|
| Company only exists at this site | Show message: "No other contacts available. This company only exists at this site." |
| All contacts already at site | Show message: "All contacts from this company are already assigned to this site." |
| Same contact exists with slightly different data | Use email as unique identifier; show most recent version |

### 6. UX Considerations

- Keep the ability to **edit** existing contacts inline (current behavior preserved)
- Keep the ability to **remove** contacts from this site (current behavior preserved)
- Keep the ability to **set primary contact** (current behavior preserved)
- Only the "add new" workflow changes from free-form to selection-based

### 7. Technical Notes

- Contact uniqueness determined by email address
- When the same contact appears on multiple sites with different data, use the version from the first site found (or could show the most recently updated)
- The selection list shows contact details (name, title, phone, email) for easy identification
- Multi-select with checkboxes allows adding multiple contacts at once
