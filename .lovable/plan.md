

# Normalize Opportunity Stages to Lookup Table

## Overview
Currently, opportunity stages are partially normalized -- the full `Opportunity` records use `stageId` (looked up via `getStageName`), but the `associatedOpportunities` on each job site store `status` as a denormalized string. The "Show Open Only" toggle uses a hardcoded list of closed status names. This plan fully normalizes stage handling so all stage references go through the lookup table, using `phaseid` and `readonlyind` from the stages data to determine open/closed status.

The `OpportunityStages.json` file already contains the exact payload provided -- no changes needed there.

## Changes

### 1. `src/types/index.ts` -- Update `associatedOpportunities` type

Replace the `status: string` field in the inline `associatedOpportunities` type on `JobSite` with `stageId: number`. The stage name will be resolved at render time via `getStageName`.

### 2. `src/data/JobSite.json` -- Update sample data

In each job site's `associatedOpportunities` array, replace the `"status": "StageName"` field with `"stageId": <number>` matching the corresponding stage ID from the stages table (e.g., `"Outstanding"` becomes `"stageId": 2`, `"Won"` becomes `"stageId": 16`, etc.).

### 3. `src/contexts/DataContext.tsx` -- Use stageId in addOpportunityToSite / createNewOpportunity

Update the two places that build `associatedOpportunities` entries (lines ~316-320 and ~343-348) to store `stageId: opp.stageId` instead of `status: getStageName(opp.stageId)`.

Add a new helper function exposed on the context:

```
getStage(id: number): OpportunityStage | undefined
```

This lets consumers access the full stage record (including `phaseid`, `phase`, `readonlyind`) for any `stageId`.

### 4. `src/pages/JobSiteDetail.tsx` -- Remove hardcoded closedStatuses

**"Show Open Only" toggle logic**: Instead of comparing `opp.status` against a hardcoded `closedStatuses` array, look up the stage by `opp.stageId` and check whether its `phaseid` indicates a closed phase. Based on the data:
- `phaseid` 3 = "Closed Opportunity" 
- `phaseid` 4 = "Closed Lead"

So the check becomes: if `oppShowOpenOnly` is true, exclude opportunities whose stage has `phaseid` 3 or 4.

**Stage filter**: Change `oppFilterStage` from matching `opp.status` string to matching `opp.stageId` (stored as string in the select value, parsed to number for comparison). The dropdown items use stage names from the lookup table.

**Stage column display**: Change `opp.status` references to `getStageName(opp.stageId)`.

**Unique stages derivation**: Derive from `opp.stageId` values, looking up names from the stages table.

**Sort by stage**: Compare using `getStageName(a.stageId)` instead of `a.status`.

### 5. `src/components/CreateOpportunityModal.tsx` -- No changes needed
Already uses `stageId` numeric values.

### 6. `src/components/OpportunityDetailModal.tsx` -- No changes needed
Already uses `getStageName(opportunity.stageId)`.

## Summary of files changed

| File | What changes |
|------|-------------|
| `src/types/index.ts` | `associatedOpportunities[].status` becomes `stageId: number` |
| `src/data/JobSite.json` | Replace `"status"` strings with `"stageId"` numbers in sample data |
| `src/contexts/DataContext.tsx` | Store `stageId` in associated opp entries; expose `getStage()` helper |
| `src/pages/JobSiteDetail.tsx` | Use `stageId` + lookup for filters, sorting, display, and open/closed logic |

