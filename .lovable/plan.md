

## Add Company/Contact/Role Columns to Activities List

The ActivityModal already supports selecting a company and contact. The changes needed are adding three new columns to the activities table in `ProjectDetail.tsx` and ensuring sort support.

### Changes

**1. `src/pages/ProjectDetail.tsx`**

Add three new sortable columns to the activities table between "Assignee" and "Activity Type":
- **Company** — Look up `activity.customerId` in `project.projectCompanies` to display the company name. Hidden on small screens (`hidden lg:table-cell`).
- **Contact** — Display `activity.contactName`. Hidden on small screens.
- **Role** — Show the company's role badges (using `roleIds`/`roleDescriptions` or fallback to `roleId`). Hidden on small screens.

Add sort cases for `company`, `contact`, and `role` in the `sortedActivities` logic, comparing by company name, contact name, and joined role descriptions respectively.

Update the `actSortColumn` type to include the new column keys.

### Files

| File | Action |
|------|--------|
| `src/pages/ProjectDetail.tsx` | Add Company, Contact, Role columns + sort logic |

