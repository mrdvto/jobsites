

# Add Customer Equipment with Sample Data

## Overview
Implement the customer equipment feature (from the previously approved plan) and populate several job sites with realistic sample machine data.

## Changes

### 1. Data Model (`src/types/index.ts`)
Add a `CustomerEquipment` interface with fields: `id`, `equipmentType`, `make`, `model`, `year` (optional), `serialNumber` (optional), `hours` (optional). Add `customerEquipment: CustomerEquipment[]` to the `JobSite` interface.

### 2. Sample Data (`src/data/JobSite.json`)
Add `customerEquipment` arrays to several job sites. Examples:

- **St. Mary's Hospital**: 2 machines (Caterpillar 320F Excavator, JLG 600S Boom Lift)
- **Amazon Fulfillment Center**: 3 machines (Komatsu PC210 Excavator, Caterpillar D6T Dozer, John Deere 644K Wheel Loader)
- **Willow Creek Subdivision**: 2 machines (Case 580N Backhoe, Volvo EC140E Excavator)
- **Limestone Quarry**: 3 machines (Caterpillar 777G Haul Truck, Komatsu PC490 Excavator, Sandvik QJ341 Jaw Crusher)
- Remaining sites get empty arrays `[]`

### 3. Data Context (`src/contexts/DataContext.tsx`)
- Add `addCustomerEquipment(siteId, equipment)`, `updateCustomerEquipment(siteId, equipmentId, updates)`, and `deleteCustomerEquipment(siteId, equipmentId)` methods
- Initialize `customerEquipment: []` for any sites missing the field during data load
- Expose all three methods in the context interface and provider

### 4. Add/Edit Equipment Modal (`src/components/AddCustomerEquipmentModal.tsx`)
New modal with form fields: Equipment Type, Make, Model, Year, Serial Number, Hours. Supports create and edit modes.

### 5. Job Site Detail Page (`src/pages/JobSiteDetail.tsx`)
Add a "Customer Equipment" card section with:
- Table columns: Type, Make, Model, Year, Serial #, Hours, Actions
- Add Equipment button in the card header
- Edit and Delete actions per row (delete with confirmation)
- Empty state when no equipment exists

## Files Modified

| File | Action |
|------|--------|
| `src/types/index.ts` | Add `CustomerEquipment` interface, add field to `JobSite` |
| `src/data/JobSite.json` | Add sample equipment to 4 sites, empty arrays for the rest |
| `src/contexts/DataContext.tsx` | Add CRUD methods, migration, expose in context |
| `src/components/AddCustomerEquipmentModal.tsx` | New modal component |
| `src/pages/JobSiteDetail.tsx` | New equipment table section |
