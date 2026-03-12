

## Fix: New Equipment Not Appearing in Table

**Root cause:** The `createEquipmentApi` stub returns a mock ID that gets added to the project's `customerEquipment` array. However, the equipment table resolves IDs via `getEquipmentById`, which searches the static `masterEquipment` list from `CompanyEquipment.json`. The new equipment record is never added to that list, so it resolves to `undefined` and gets filtered out.

**Fix:**

### 1. `src/contexts/DataContext.tsx`
- Change `masterEquipment` from a static `const` to a `useState` initialized from the JSON data.
- Add a new `addEquipmentToMaster(equipment: CustomerEquipment)` function that appends to this state.
- Expose `addEquipmentToMaster` in the context value.

### 2. `src/components/CreateEquipmentModal.tsx`
- After `createEquipmentApi` returns the mock ID, build a full `CustomerEquipment` object from the form data.
- Pass the full equipment object back via `onSave` (change signature from `(id: number)` to `(equipment: CustomerEquipment)`).

### 3. `src/pages/ProjectDetail.tsx`
- In `handleSaveNewEquipment`, call the new `addEquipmentToMaster(equipment)` to register the record in the master list, then call `addCustomerEquipment(project.id, equipment.id)` to associate it with the project.

This ensures the equipment table can resolve the new ID immediately.

| File | Change |
|------|--------|
| `src/contexts/DataContext.tsx` | Make equipment list stateful; add `addEquipmentToMaster` |
| `src/components/CreateEquipmentModal.tsx` | Return full equipment object from `onSave` |
| `src/pages/ProjectDetail.tsx` | Call `addEquipmentToMaster` before associating |

