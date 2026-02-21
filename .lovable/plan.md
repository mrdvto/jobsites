
# Add Sales Rep to Opportunities Table and Filters

## Overview
Each opportunity already has a `salesRepId` in the full Opportunity data (`src/data/Opportunity.json`). This plan adds a Sales Rep column to the opportunities table on the job site detail page, along with a Sales Rep filter dropdown, by looking up the rep from the full opportunity record.

## Changes

### File: `src/pages/JobSiteDetail.tsx`

**1. Add Sales Rep filter state**
- New state: `oppFilterSalesRep` (string, default `'all'`)

**2. Add `'salesRep'` to sort column type**
- Update the `oppSortColumn` type union to include `'salesRep'`

**3. Update filter logic**
- In `filteredOpportunities`, when `oppFilterSalesRep !== 'all'`, look up the full opportunity's `salesRepId` and compare

**4. Compute unique sales reps for the filter dropdown**
- Derive `uniqueOppSalesReps` from the site's associated opportunities by looking up each one's `salesRepId` from the full opportunities array, then deduplicating

**5. Add sort logic for sales rep**
- In the `sortedOpportunities` switch, add a `'salesRep'` case that compares `getSalesRepName(fullA.salesRepId)` vs `getSalesRepName(fullB.salesRepId)` using `localeCompare`

**6. Add Sales Rep filter dropdown to the filter row**
- New `Select` dropdown between the existing filters and the "Show Open Only" toggle, populated with unique sales rep names

**7. Add Sales Rep column to the table**
- New sortable `TableHead` for "Sales Rep" (placed after Stage, before Est. Revenue)
- New `TableCell` displaying `getSalesRepName(fullOpp.salesRepId)`

### File: `src/data/Opportunity.json`

**8. Vary `salesRepId` values across the 200001-200006 sample opportunities**
- Currently they may all use the same rep. Update a few to use different reps (e.g., 260, 313, 305, 262) so the filter has meaningful options to demonstrate

No type changes needed -- the `associatedOpportunities` inline type is unchanged; the sales rep is looked up from the full Opportunity record at render time.
