

# Add "Show Open Only" Toggle to Opportunities Filter Area

## Overview
Add a toggle switch to the opportunities filter row that hides closed/completed opportunities (Won, Lost, No Deal, Closed, No Leads). It defaults to enabled, matching the existing pattern used in the main FilterBar's "Hide Completed" toggle.

## Changes

### File: `src/pages/JobSiteDetail.tsx`

**1. Add state variable**
- `oppShowOpenOnly` (boolean, default `true`)

**2. Add Switch import**
- Import `Switch` from `@/components/ui/switch`

**3. Update filter logic**
- In the `filteredOpportunities` filter function, when `oppShowOpenOnly` is true, exclude opportunities whose `status` is one of: `Won`, `Lost`, `No Deal`, `Closed`, `No Leads`

**4. Add toggle to filter row UI**
- Append a Switch + Label pair to the existing `div` containing the Stage, Division, and Type dropdowns
- Label text: "Show Open Only"
- Follows the same visual pattern as FilterBar toggles (Switch + Label with `cursor-pointer`)

No other files are changed.
