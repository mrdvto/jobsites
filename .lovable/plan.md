
# Add Est. Close Date Column and Default Sort by Stage + Close Date

## Overview
Add an "Est. Close" column to the opportunities table using the `estimateDeliveryMonth` and `estimateDeliveryYear` fields from the full Opportunity record. Set the default primary sort to Stage (ascending by `displayorder`) and secondary sort to Est. Close Date (ascending).

## Changes

### File: `src/pages/JobSiteDetail.tsx`

**1. Update default sort state and sort column type**
- Change initial `oppSortColumn` to `'stage'` and `oppSortDirection` to `'asc'`
- Add `'estClose'` to the `oppSortColumn` union type

**2. Update sort logic**
- Change `'stage'` case to compare by `getStage(id)?.displayorder` instead of alphabetical `getStageName()` comparison
- Add `'estClose'` case that compares by year then month from the full Opportunity record
- Add a secondary sort: when two opportunities have equal primary sort values, break ties by estimated close date (year then month ascending)

**3. Add Est. Close column to the table header**
- New sortable `TableHead` for "Est. Close" placed after Sales Rep and before Est. Revenue

**4. Add Est. Close cell to each table row**
- Display as "Mon YYYY" (e.g., "Mar 2025") using the full opportunity's `estimateDeliveryMonth` and `estimateDeliveryYear`
- Show "-" if either field is missing

### No other files change
The `estimateDeliveryMonth` and `estimateDeliveryYear` fields already exist on the `Opportunity` interface and sample data. The column is resolved at render time from the full opportunity record, same pattern as Division and Sales Rep.
