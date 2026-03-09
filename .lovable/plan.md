

## Plan: Add Quick Search Input to Table Toolbar

Add a search input to the toolbar that filters projects by name in real-time.

### Changes

**`src/components/ProjectTable.tsx`**
- Add `searchQuery` state and `Search` icon import
- Add an `Input` with search icon in the toolbar, between the project count and filter badges
- Filter `filteredProjects` by `project.name` matching the search query (case-insensitive) before sorting/pagination

### Layout
```text
[count] [🔍 Search projects...] [badges...] [Filters] [Columns]
```

The search input will be compact (`h-8 w-48`) with a search icon, and filtering happens client-side on the already-filtered project list.

