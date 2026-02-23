

# Fix Chevron Rotation for Equipment Group Expansion State

## Problem
The chevron icon in the equipment group headers doesn't visually indicate whether the group is expanded or collapsed.

## Solution
The CSS class `[&[data-state=open]>svg.chevron]:rotate-90` on the `CollapsibleTrigger` already handles rotation based on the Radix `data-state` attribute. This should already work -- but let me verify the current markup is correct.

### File: `src/pages/JobSiteDetail.tsx` (line ~870)

The trigger currently has:
```
className="... [&[data-state=open]>svg.chevron]:rotate-90"
```

And the chevron:
```
<ChevronRight className="chevron h-4 w-4 shrink-0 transition-transform duration-200" />
```

This CSS selector targets a direct child (`>`) SVG with class `chevron` of the trigger element. However, the `ChevronRight` is nested inside a `<div>` wrapper, not a direct child of `CollapsibleTrigger`. The selector `>svg.chevron` won't match because the SVG is inside `<div className="flex items-center gap-2">`.

### Fix
Move the CSS rotation selector to target the nested SVG properly. Change the selector from:
- `[&[data-state=open]>svg.chevron]:rotate-90`

to:
- `[&[data-state=open]_svg.chevron]:rotate-90`

(Replace `>` with `_` which maps to a descendant selector in Tailwind, matching the SVG regardless of nesting depth.)

