

## Plan: Add UOM field to Equipment with toggle visibility

### 1. Add UOM lookup data to `src/data/Lookups.json`
Add a new `"uomTypes"` array with three values: `HOURS`, `MILES`, `KILOMETRES`.

### 2. Update `src/types/index.ts`
Add optional `uom?: string` field to `CustomerEquipment` interface.

### 3. Update `src/data/CompanyEquipment.json`
Add `"uom"` to a subset of entries (not all, since it's optional). Mix of `"HOURS"`, `"MILES"`, `"KILOMETRES"` values.

### 4. Update `src/pages/ProjectDetail.tsx`
- Add state: `const [showUom, setShowUom] = useState(() => localStorage.getItem('showEquipmentUom') === 'true')` 
- Add toggle effect to persist to localStorage
- Add a `Switch` + label ("Show UOM") in the equipment card header area (between the title and buttons)
- Conditionally render a "UOM" column in the equipment table header and body when `showUom` is true
- Display the UOM value resolved from the lookups (e.g., "Hours", "Miles", "Kilometres"), or "—" if not set

### 5. Update `src/components/AddCustomerEquipmentModal.tsx`
- Add UOM column to the equipment table displayed in the modal, always visible there since it's a data attribute

