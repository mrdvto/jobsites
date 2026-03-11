

## Move Assignees Up, Add Revenue Section, Relabel to "Leads / Opportunities"

### Changes to `src/pages/ProjectDetail.tsx`

**1. Move Assignees into the Project Information section**
- Add an Assignees field after the Project Owner block (after line 473, before Description), showing with User icon, label "Assignees", and names via `getUserNames()`.

**2. Replace the "Assignment" section (lines 556-573) with a "Revenue" section**
- Use `DollarSign` icon from lucide-react, label "Revenue"
- Display a 2x2 grid with:
  - **Open Leads / Opportunities**: count where stage's phaseid is 1 or 2
  - **Total Leads / Opportunities**: `project.associatedOpportunities.length`
  - **Pipeline Revenue**: sum of `revenue` from opps in phaseid 1 or 2
  - **Won Revenue**: sum of `revenue` from opps with stageId === 16
- Format currency values with `$` and `toLocaleString()`

**3. Relabel "Opportunities" → "Leads / Opportunities" throughout the page**
- Section heading (line 580): "Leads / Opportunities"
- Empty state text (line 600): "No leads or opportunities associated..."
- "Current Opportunities" label in the revenue section → use new metric labels
- Import `DollarSign` from lucide-react

