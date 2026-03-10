

## Add Lead Stage to Create Opportunity Modal

### Change

**`src/components/CreateOpportunityModal.tsx`** (line ~50)
- Change the stage filter from `stage.phaseid === 2` to `stage.phaseid === 1 || stage.phaseid === 2`
- This adds "Lead" (phaseid 1) alongside Outstanding, Development, and Proposal (phaseid 2)

