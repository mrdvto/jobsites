

## Plan: Add Division Dropdown to Create Prospect Modal

### Problem
Creating a prospect requires selecting a division, but the modal currently has no division field.

### Changes

**`src/components/CreateProspectModal.tsx`**
1. Import `DIVISIONS` from `@/contexts/DataContext` and `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` from the UI select component.
2. Add `divisionId` state (initially `''`).
3. Add a Division dropdown in the Company Information section (alongside Company Name and Phone), using the same `DIVISIONS` array as the Create Opportunity modal (`G`, `C`, `P`, `R`, `S`, `V`, `X`). Display as `"G - General Line"` format.
4. Add `divisionId` validation — required field, show error if empty on submit.
5. Add `divisionId` to `ProspectData` interface and include it in the `onSave` payload.
6. Reset `divisionId` in `resetForm`.

**`src/contexts/DataContext.tsx`** (or callers)
- No changes needed — `DIVISIONS` is already exported.

### Layout
The Company Information grid becomes 3 fields. On desktop they'll sit in the 2-col grid; the division dropdown will flow naturally as a third item. Alternatively, place it on its own row or adjust to a 3-col grid on larger screens — keeping the existing `sm:grid-cols-2` is simplest and the division field will wrap to the next row.

