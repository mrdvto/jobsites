
# Add Division Support for Opportunities

## Overview
Update the prototype to properly reflect that opportunities are division-specific while job sites are not. This involves updating the division filter dropdown with realistic division codes, adding division display to opportunity views, updating sample data with proper divisions, and allowing division selection when creating opportunities.

## Division Codes
The following divisions will be used throughout the application:

| Code | Name |
|------|------|
| G | General Line |
| C | Compact |
| P | Paving |
| R | Heavy Rents |
| S | Power Systems |
| V | Rental Services |
| X | Power Rental |

## Changes Required

### 1. Update FilterBar Division Dropdown
**File**: `src/components/FilterBar.tsx`

Replace the current placeholder divisions (E, A, B, C, D) with the correct division codes and include full names for clarity:

| Current | New |
|---------|-----|
| E, A, B, C, D | G - General Line, C - Compact, P - Paving, R - Heavy Rents, S - Power Systems, V - Rental Services, X - Power Rental |

### 2. Update Opportunity Sample Data
**File**: `src/data/Opportunity.json`

Update all opportunity records to use the new division codes with realistic distribution:
- Change `divisionId` from "E" to one of: G, C, P, R, S, V, X
- Distribute divisions logically based on equipment type in descriptions (e.g., Paving equipment = "P", Power generators = "S", Rental equipment = "V")

### 3. Add Division to Opportunity Table on Job Site Detail
**File**: `src/pages/JobSiteDetail.tsx`

Add a "Division" column to the opportunities table within the job site detail page:

| Current Columns | New Columns |
|-----------------|-------------|
| Opportunity Number, Description, Stage, Est. Revenue | Opportunity Number, Description, **Division**, Stage, Est. Revenue |

This requires looking up the full opportunity data to get the divisionId.

### 4. Add Division to Opportunity Detail Modal
**File**: `src/components/OpportunityDetailModal.tsx`

The division is already displayed in the footer section. Update it to show the full division name alongside the code for better readability:
- Current: "Division: E"
- New: "Division: G - General Line"

### 5. Add Division Selection to Create Opportunity Modal
**File**: `src/components/CreateOpportunityModal.tsx`

Add a Division dropdown field so users can specify which division the new opportunity belongs to:
- Required field
- Dropdown with all 7 division options
- Default: empty (user must select)

### 6. Add Division to Associate Opportunity Modal
**File**: `src/components/AssociateOpportunityModal.tsx`

Add a Division column to the selection table so users can see which division an opportunity belongs to before associating it.

### 7. Create Division Helper Function
**File**: `src/contexts/DataContext.tsx`

Add a helper function to get the full division name from a code:

```typescript
const getDivisionName = (code: string): string => {
  const divisions: Record<string, string> = {
    'G': 'General Line',
    'C': 'Compact',
    'P': 'Paving',
    'R': 'Heavy Rents',
    'S': 'Power Systems',
    'V': 'Rental Services',
    'X': 'Power Rental',
  };
  return divisions[code] || code;
};
```

## Implementation Sequence

1. Add `getDivisionName` helper to DataContext
2. Update FilterBar with correct division dropdown options
3. Update sample Opportunity.json data with realistic divisions
4. Add Division column to JobSiteDetail opportunities table
5. Update OpportunityDetailModal to show full division name
6. Add Division field to CreateOpportunityModal
7. Add Division column to AssociateOpportunityModal table

## Technical Details

### Division Constants
Create a shared constant for divisions that can be reused:

```typescript
export const DIVISIONS = [
  { code: 'G', name: 'General Line' },
  { code: 'C', name: 'Compact' },
  { code: 'P', name: 'Paving' },
  { code: 'R', name: 'Heavy Rents' },
  { code: 'S', name: 'Power Systems' },
  { code: 'V', name: 'Rental Services' },
  { code: 'X', name: 'Power Rental' },
] as const;
```

### Sample Data Distribution
Opportunity data will be updated based on equipment/description context:
- Loader, Excavator, Dozer equipment = G (General Line)
- Mini excavators, skid steers = C (Compact)
- Asphalt paver, compactor = P (Paving)
- Long-term heavy equipment rentals = R (Heavy Rents)
- Generators, power equipment = S (Power Systems)
- Short-term rentals = V (Rental Services)
- Power equipment rentals = X (Power Rental)

### UI Display Format
Divisions will be displayed consistently as:
- In tables/compact views: Just the code (e.g., "G")
- In detail views/dropdowns: Code with name (e.g., "G - General Line")

### Files Modified

| File | Changes |
|------|---------|
| `src/contexts/DataContext.tsx` | Add `getDivisionName` helper and `DIVISIONS` constant |
| `src/components/FilterBar.tsx` | Update division dropdown options |
| `src/data/Opportunity.json` | Update all divisionId values |
| `src/pages/JobSiteDetail.tsx` | Add Division column to opportunities table |
| `src/components/OpportunityDetailModal.tsx` | Display full division name |
| `src/components/CreateOpportunityModal.tsx` | Add division selection dropdown |
| `src/components/AssociateOpportunityModal.tsx` | Add Division column |
