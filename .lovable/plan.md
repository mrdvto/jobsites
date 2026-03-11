

## Option C: Three-Column Layout with Responsive Fallback & Expandable Sections

### Layout

```text
Desktop (md+):
┌─────────────────────────────────────────────────────────┐
│ Project Information                              [Edit] │
│                                                         │
│  📍 Location          │ 🏢 Project Owner  │ 👤 Assignees │
│  123 Main St          │ ABC Company       │ Jane, Bob    │
│  City, ST 12345       │ John Doe — PM     │              │
│  [Addr | Coords]      │ 📞 ... [▸ more]  │ 📝 Descript. │
│                       │                   │ Lorem i[▸]   │
│─────────────────────────────────────────────────────────│
│  Project Details (2-col grid)                           │
│─────────────────────────────────────────────────────────│
│  💲 Revenue (4 metrics in a row)                        │
└─────────────────────────────────────────────────────────┘

Mobile (<md): Single column, stacked vertically as today
```

### Changes to `src/pages/ProjectDetail.tsx`

**1. Three-column grid (lines ~377-490)**
- Replace the vertical `space-y-4` stack + separators with a `grid grid-cols-1 md:grid-cols-3 gap-6` container
- **Column 1**: Location (existing content, unchanged)
- **Column 2**: Project Owner (existing content)
- **Column 3**: Assignees + Description stacked

**2. Expandable/truncation for long content**
- Add state: `expandedSections` as `Set<string>` tracking which of `'owner'`, `'assignees'`, `'description'` are expanded
- **Owner contacts**: If `selectedContacts.length > 2` and not expanded, show first 2 contacts + a "Show N more" button
- **Assignees**: If text length > 80 chars and not expanded, truncate with `line-clamp-2` + "Show more" button
- **Description**: If text length > 120 chars and not expanded, truncate with `line-clamp-3` + "Show more" button
- Toggle buttons styled as small text links (`text-primary text-xs cursor-pointer`)

**3. Revenue metrics in a single row**
- Change revenue grid from `grid-cols-2` to `grid-cols-2 md:grid-cols-4` so all 4 metrics sit in one row on desktop

**4. Remove separators** between Location/Owner/Assignees blocks (the grid gap handles spacing). Keep separator before Project Details and Revenue.

