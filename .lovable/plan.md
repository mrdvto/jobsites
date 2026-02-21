

# Add "No Lead" to Closed Statuses List

## Overview
Add "No Lead" (singular) to the list of statuses hidden by the "Show Open Only" toggle. Currently the list includes "No Leads" (plural) but the sample data uses "No Lead" (singular), so both variants should be covered.

## Changes

### File: `src/pages/JobSiteDetail.tsx`

Update the `closedStatuses` array (currently around line 241) from:

```typescript
const closedStatuses = ['Won', 'Lost', 'No Deal', 'Closed', 'No Leads'];
```

to:

```typescript
const closedStatuses = ['Won', 'Lost', 'No Deal', 'Closed', 'No Leads', 'No Lead'];
```

No other files are changed.

