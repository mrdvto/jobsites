

# Rename Everything: "Job Site" AND "Site" to "Project"

## Overview
Expand the previous rename plan so that **all** references to "site" (not just "job site") become "project" — in code identifiers, file names, UI text, types, and routes. The only exception is external URLs/paths that are out of our control.

## Scope — Every Rename

### Types (`src/types/index.ts`)

| Before | After |
|--------|-------|
| `interface JobSite` | `interface Project` |
| `interface SiteCompany` | `interface ProjectCompany` |
| `siteCompanies: SiteCompany[]` | `projectCompanies: ProjectCompany[]` |
| `Opportunity.jobSiteId` | `Opportunity.projectId` |
| `ChangeLogEntry.siteId` | `ChangeLogEntry.projectId` |
| `ChangeLogEntry.category: 'Site'` | `ChangeLogEntry.category: 'Project'` |

### Data Context (`src/contexts/DataContext.tsx`)

| Before | After |
|--------|-------|
| `jobSites` / `setJobSites` state | `projects` / `setProjects` |
| `createJobSite()` | `createProject()` |
| `updateJobSite()` | `updateProject()` |
| `addSiteCompany()` | `addProjectCompany()` |
| `removeSiteCompany()` | `removeProjectCompany()` |
| `updateSiteCompany()` | `updateProjectCompany()` |
| `addOpportunityToSite()` | `addOpportunityToProject()` |
| `getChangeLog(siteId)` | `getChangeLog(projectId)` |
| All internal `site` variable names | `project` |
| All `siteId` parameters | `projectId` |
| Import `jobSitesData` | `projectsData` from `Project.json` |
| All user-facing strings ("Job site", "site") | "Project" |

### Data File

| Before | After |
|--------|-------|
| `src/data/JobSite.json` | `src/data/Project.json` |

Inside the JSON, the `siteCompanies` key on each record becomes `projectCompanies`.

### Page Files — Rename and Update

| Old File | New File | Key Internal Changes |
|----------|----------|---------------------|
| `JobSiteList.tsx` | `ProjectList.tsx` | Component name, all `site`/`jobSite` refs become `project`, UI text |
| `JobSiteDetail.tsx` | `ProjectDetail.tsx` | Component name, `site` variable becomes `project`, `siteId` becomes `projectId`, UI text ("Back to Project", "Project Not Found") |
| `JobSiteChangeLog.tsx` | `ProjectChangeLog.tsx` | Component name, `siteId` becomes `projectId`, "Back to Site" becomes "Back to Project" |

### Component Files — Rename and Update

| Old File | New File | Key Internal Changes |
|----------|----------|---------------------|
| `JobSiteTable.tsx` | `ProjectTable.tsx` | Export name, `site` variables become `project` |
| `CreateJobSiteModal.tsx` | `CreateProjectModal.tsx` | Props, dialog title, toast text, `createJobSite` becomes `createProject` |
| `EditJobSiteModal.tsx` | `EditProjectModal.tsx` | Props `site` becomes `project`, `updateJobSite` becomes `updateProject` |
| `SiteCompaniesTable.tsx` | `ProjectCompaniesTable.tsx` | Props `siteId` becomes `projectId`, `SiteCompany` becomes `ProjectCompany`, function calls renamed |

### Components — Internal Changes Only (no file rename)

| File | Changes |
|------|---------|
| `AddGCModal.tsx` | `siteId` prop becomes `projectId`, `addSiteCompany` becomes `addProjectCompany`, dialog text |
| `EditGCModal.tsx` | `siteId` prop becomes `projectId`, `updateSiteCompany` becomes `updateProjectCompany`, `SiteCompany` type becomes `ProjectCompany`, all `site` iteration vars become `project` |
| `AssociateCompanyModal.tsx` | `siteId` prop becomes `projectId`, `addSiteCompany` becomes `addProjectCompany`, all `site` refs, dialog text |
| `AssociateOpportunityModal.tsx` | `siteId` prop becomes `projectId`, `addOpportunityToSite` becomes `addOpportunityToProject` |
| `AssociateActivityModal.tsx` | `siteId` prop becomes `projectId` |
| `ManageCompanyContactsModal.tsx` | "this site" text becomes "this project" |
| `AddCustomerEquipmentModal.tsx` | `siteCompanies` refs become `projectCompanies` |
| `CreateOpportunityModal.tsx` | `jobSiteId` becomes `projectId` |
| `FilterBar.tsx` | `jobSites` becomes `projects` |
| `KPICard.tsx` | Any "site" labels become "project" |
| `NotesSection.tsx` | Any `siteId` params become `projectId` |
| `NoteModal.tsx` | Any site references |
| `SettingsPanel.tsx` | Menu label changes |
| `OpportunityDetailModal.tsx` | `jobSiteId` references become `projectId` |
| `NavLink.tsx` | Any site text |

### Router (`src/App.tsx`)

- Update imports to new page names (`ProjectList`, `ProjectDetail`, `ProjectChangeLog`)
- Route paths change: `/site/:id` becomes `/project/:id`, `/site/:id/changelog` becomes `/project/:id/changelog`

### Hooks

| File | Changes |
|------|---------|
| `useStatusColors.ts` | Update any "site" references in comments |

### HTML Metadata (`index.html`)

- Title: "Prototype - Projects"
- Description: "A prototype for managing construction project-related data in your CRM."
- OG/Twitter titles and descriptions updated similarly

### Opportunity JSON (`src/data/Opportunity.json`)

- `jobSiteId` field becomes `projectId` on every record

## Implementation Order

1. Rename types and data files first (`types/index.ts`, `JobSite.json` to `Project.json`, `Opportunity.json`)
2. Update `DataContext.tsx` (the central hub — all state, functions, parameters)
3. Rename and update all three page files
4. Rename and update the four component files that get new names
5. Update remaining ~12 components with internal reference and text changes
6. Update `App.tsx` imports and route paths
7. Update `index.html` metadata

