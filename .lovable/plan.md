

# Show Opportunity Type in Detail Modal

## Overview
Display the opportunity type (Sales, Rent, Parts, Service, Rental Service, Lease) prominently in the Opportunity Detail Modal. This requires creating the OpportunityTypes lookup data and wiring it into the DataContext, then adding the type to the modal UI.

## Changes

### 1. Create `src/data/OpportunityTypes.json`
New file with the lookup data provided earlier (6 types: Sales, Rent, Parts, Service, Rental Service, Lease).

### 2. Add `OpportunityType` interface to `src/types/index.ts`

```typescript
export interface OpportunityType {
  opptypeid: number;
  opptypecode: string;
  opptypedesc: string;
  displayorder: number;
  multiproductitemind: number;
  allprimaryproductitemind: number;
  languageid: number;
}
```

### 3. Update `src/contexts/DataContext.tsx`
- Import `OpportunityTypes.json`
- Add `opportunityTypes` to state
- Add `getTypeName(typeId: number): string` helper that returns the `opptypedesc` for a given `opptypeid`
- Expose both in the context

### 4. Update `src/components/OpportunityDetailModal.tsx`
- Pull `getTypeName` from `useData()`
- Display the type as a Badge next to the Opportunity Number in the header area, e.g.:

```
Opportunity Number: 100003  [Service]  [Urgent]
```

This keeps the type visible at a glance without cluttering the layout.

## Files

| File | Action |
|------|--------|
| `src/data/OpportunityTypes.json` | Create |
| `src/types/index.ts` | Edit -- add `OpportunityType` interface |
| `src/contexts/DataContext.tsx` | Edit -- load types, add `getTypeName`, expose in context |
| `src/components/OpportunityDetailModal.tsx` | Edit -- show type badge in header |
