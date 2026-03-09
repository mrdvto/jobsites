

## Add "More Fields" Section & Fix Description Input

### Changes to `src/components/ActivityModal.tsx`

1. **Description → single-line Input**: Replace the `<Textarea rows={3}>` for description (lines 322-329) with a standard `<Input>` component.

2. **"More fields" collapsible section**: Add a `showMoreFields` boolean state. Render a clickable text button (e.g. `ChevronDown` + "More fields") below the Notes field. When toggled, reveal:
   - **Campaign** dropdown — a `<Select>` listing all items from `Campaigns.json`, with a "None" option to clear
   - **Issue** dropdown — a `<Select>` listing issues from `Issues.json`, filtered by `selectedCompanyId` when a company is selected (show all if no company selected), with a "None" option to clear

3. **State additions**: `campaignId` (number | '') and `issueId` (number | ''). Initialize from `activity.campaignId` / `activity.issueId` in edit mode. Reset on create. Include in `activityData` on submit (only if set).

4. **Auto-expand**: When editing an activity that has `campaignId` or `issueId`, auto-set `showMoreFields = true`.

5. **Imports**: Add `campaignsData` from `Campaigns.json`, `issuesData` from `Issues.json`, and `ChevronDown`/`ChevronUp` from lucide-react.

