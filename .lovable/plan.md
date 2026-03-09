

## Align Equipment Buttons with Existing Pattern

The Opportunities, Companies, and Activities sections already use "Associate Existing" (outline/secondary) and "Create New" (primary) buttons. The Equipment section currently has a single "Add Equipment" button. This plan aligns it with the existing pattern and swaps button prominence so "Associate Existing" is primary across all tables.

### Changes

**`src/pages/ProjectDetail.tsx`** (lines 891-895)
- Replace the single "Add Equipment" button with two buttons matching the other sections:
  - **"Associate Existing"** — primary button (default variant), opens the equipment picker modal. Uses `LinkIcon`.
  - **"Create New"** — secondary button (outline variant), opens the create equipment flow. Uses `Plus` icon.
- Swap button order/variant for **all four sections** (Opportunities, Companies, Activities, Equipment):
  - "Associate Existing" becomes `default` variant (primary), listed first
  - "Create New" becomes `outline` variant (secondary), listed second

**`src/components/AddCustomerEquipmentModal.tsx`**
- Rename dialog title from "Add Equipment to Project" to "Associate Existing Equipment"
- Rename confirm button from "Add Equipment" to "Associate"

### Sections affected (button variant swaps)

| Section | Associate Existing | Create New |
|---|---|---|
| Opportunities (lines 642-656) | `outline` → `default` | `default` → `outline` |
| Activities (lines 813-824) | `outline` → `default` | `default` → `outline` |
| Equipment (lines 891-895) | New button, `default` | Existing → `outline` |
| Companies (line 787) | `outline` → `default` | N/A (only one button) |

