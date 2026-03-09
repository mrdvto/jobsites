

## Plan: Create New Prospect Modal

### Overview
Add a "Create New" secondary action button next to the existing "Associate Existing" button in the Companies section. This opens a "Create New Prospect" modal with company details, address fields with country-dependent behavior, and a primary contact record.

### New Component: `CreateProspectModal.tsx`

**Company Fields:**
- Company Name (required)
- Phone Number (required, with input mask for US/CA/AU)

**Address Fields:**
- Address Line 1, Address Line 2, Address Line 3 (at least one required)
- Country (required, searchable dropdown via simulated API - US/CA/AU pinned at top)
- State/Province (searchable dropdown, required for US/AU, labeled "Province" for CA, populated from simulated API)
- City (required)
- ZIP/Postal/Post Code (required, mask varies by country)

**Contact Fields:**
- First Name, Last Name (required)
- Title (required)
- Mobile Phone (required, with country mask)
- Business Phone (optional)
- Email (required)

### Input Masks by Country
| Country | Phone Mask | ZIP Mask |
|---------|-----------|----------|
| US | (999) 999-9999 | 99999 or 99999-9999 |
| Canada | (999) 999-9999 | A9A 9A9 |
| Australia | 9999 999 999 | 9999 |
| Other | No mask | No mask |

### Simulated API Data
Create `src/data/Countries.ts` and `src/data/StatesProvinces.ts` with:
- Countries list (US, CA, AU pinned first, then alphabetical)
- US states, Canadian provinces, Australian states/territories

### Validation
- Company phone: required, format validated for US/CA/AU
- Address: at least one of address1/address2/address3 required
- State: required only if US or AU; optional but available for CA
- ZIP: format validated per country
- Contact: first name, last name, title, mobile phone, email all required

### Files to Create/Modify
1. **New:** `src/data/Countries.ts` — country list with codes
2. **New:** `src/data/StatesProvinces.ts` — states/provinces for US, CA, AU
3. **New:** `src/components/CreateProspectModal.tsx` — the modal component
4. **Modify:** `src/pages/ProjectDetail.tsx` — add "Create New" button and modal state
5. **Modify:** `src/contexts/DataContext.tsx` — optionally add company to a global store (or just attach to project)

### Button Placement (following existing pattern)
Per the existing button hierarchy standard, for Companies "Associate Existing" is primary and "Create New" is secondary (outline variant):
```text
[Create New (outline)] [Associate Existing (default)]
```

