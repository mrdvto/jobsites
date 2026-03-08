

# Replace Primary Contact with Project Owner (ID-based references)

## Concept
Replace the embedded `projectPrimaryContact` object (name, title, phone, email) with a lean `projectOwner` that stores only IDs. Company and contact details are resolved at display time from the existing company directory (i.e., the `projectCompanies` data across all projects).

## Data Model

### `src/types/index.ts`
- Remove `projectPrimaryContact` from `Project`
- Add to `Project`:
```typescript
projectOwner: {
  companyId: string;
  contactIds: number[];  // references CompanyContact.id within that company
};
```

### `src/data/Project.json`
- Replace each `projectPrimaryContact` block with a `projectOwner` containing a `companyId` (referencing an existing company in that project's `projectCompanies`) and `contactIds` array

## Context Layer

### `src/contexts/DataContext.tsx`
- Add a helper function `getCompanyById(companyId: string)` that searches all projects' `projectCompanies` to find a company by ID and return its full data (name, contacts)
- Update `createProject` / `updateProject` to handle `projectOwner` instead of `projectPrimaryContact`
- Remove any changelog references to `projectPrimaryContact`

## UI Changes

### `src/components/CreateProjectModal.tsx`
- Remove the 4 free-text contact fields (contactName, contactTitle, contactPhone, contactEmail)
- Add "Project Owner" section:
  - Step 1: Searchable company combobox (same pattern as `AssociateCompanyModal`) sourcing from all known companies across projects
  - Step 2: Once company selected, show checkboxes for that company's contacts to select one or more
- Store only `{ companyId, contactIds }` in the created project

### `src/components/EditProjectModal.tsx`
- Same transformation: remove free-text fields, add company selector + contact picker
- Pre-populate from existing `project.projectOwner`

### `src/pages/ProjectDetail.tsx`
- Replace "Primary Contact" display block with "Project Owner"
- Resolve company name and contact details at render time using `getCompanyById`
- Show company name + each selected contact's name, phone, email

### `src/components/ProjectTable.tsx`
- Update the "Contact" column sort and display to resolve the owner company name from the ID
- Change column header from "Contact" to "Owner"

## Files Touched
`src/types/index.ts`, `src/data/Project.json`, `src/contexts/DataContext.tsx`, `src/components/CreateProjectModal.tsx`, `src/components/EditProjectModal.tsx`, `src/pages/ProjectDetail.tsx`, `src/components/ProjectTable.tsx`

