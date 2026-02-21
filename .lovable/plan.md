

# Associate Customer Equipment with Companies by ID

## Overview
Add a `companyId` field to customer equipment records, linking each piece of equipment to the contractor that owns it. The UI will display company names by resolving the ID against the site's company list.

## Changes

### 1. Data Model (`src/types/index.ts`)
- Add `companyId: string` to the `CustomerEquipment` interface

### 2. Sample Data (`src/data/JobSite.json`)
Add `companyId` to all existing equipment entries, referencing actual site companies:

- **St. Mary's Hospital (500101)**: Both machines get `"1019550"` (Granite Excavation and Demolition -- the excavation sub)
- **Amazon Fulfillment Center (500105)**: Komatsu PC210 and Cat D6T get `"1067200"` (Mortenson Construction -- GC), JD 644K gets `"1035040"` (Southland Industries)
- **Willow Creek Subdivision (500107)**: Both machines get `"1174395"` (Ryan Companies US Inc -- GC)
- **Limestone Quarry (500110)**: Cat 777G and Komatsu PC490 get `"1067200"` (Mortenson Construction), Sandvik QJ341 gets `"1293500"` (Layne Christensen Company)

### 3. Add/Edit Equipment Modal (`src/components/AddCustomerEquipmentModal.tsx`)
- Accept a new prop: `siteCompanies: SiteCompany[]`
- Add a required "Company" select dropdown at the top of the form, populated from the site companies list (showing company name, storing company ID)
- Include `companyId` in the submitted data
- Pre-populate the dropdown when editing existing equipment

### 4. Equipment Table (`src/pages/JobSiteDetail.tsx`)
- Add a "Company" column as the first column in the table
- Resolve `companyId` to display name via `site.siteCompanies.find(c => c.companyId === eq.companyId)?.companyName`
- Pass `site.siteCompanies` to the `AddCustomerEquipmentModal`

## Technical Details

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `companyId: string` to `CustomerEquipment` |
| `src/data/JobSite.json` | Add `companyId` to all 10 sample equipment entries |
| `src/components/AddCustomerEquipmentModal.tsx` | Add `siteCompanies` prop, company select field, include `companyId` in output |
| `src/pages/JobSiteDetail.tsx` | Add "Company" column to table, resolve ID to name, pass `siteCompanies` to modal |

No changes needed to `DataContext.tsx` -- the existing CRUD methods already pass through all fields via the `Omit<CustomerEquipment, 'id'>` type, so `companyId` will flow through automatically.

