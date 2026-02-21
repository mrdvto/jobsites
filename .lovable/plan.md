

# Enrich Example Data

## Overview
Update both `JobSite.json` and `Opportunity.json` with richer sample data: fill in missing estimated close dates, add 3 new opportunities and 3 new customer equipment entries per site, and fix subcontractor role labels to match the Manage Dropdowns configuration.

## Summary of Changes

### Files Changed

| File | What changes |
|------|-------------|
| `src/data/JobSite.json` | Add 30 new associated opportunities (3 per site), add 30 new customer equipment entries (3 per site), fix misaligned role IDs and descriptions |
| `src/data/Opportunity.json` | Add 30 new full opportunity records with estimated close dates; all existing records already have close dates |

---

### 1. Fix Subcontractor Role Alignment

The Manage Dropdowns configuration defines these roles:

| ID | Label |
|----|-------|
| GC | General Contractor |
| SUB-EXC | Subcontractor - Excavation |
| SUB-PAV | Subcontractor - Paving |
| SUB-ELEC | Subcontractor - Electrical |
| SUB-MECH | Subcontractor - Mechanical |
| SUB-SPEC | Subcontractor - Specialized |
| SUB-STEEL | Subcontractor - Steel |

Current mismatches to fix:

| Site | Company | Current roleId / Description | Fix to |
|------|---------|------------------------------|--------|
| 500102 | Turner Construction | SUB-STRUCT / "Structural" | SUB-STEEL / "Subcontractor - Steel" |
| 500103 | Curran Contracting | SUB-PAV / "Finish Paving" | SUB-PAV / "Subcontractor - Paving" |
| 500105 | Rosendin Electric | SUB-ELEC / "Power Systems" | SUB-ELEC / "Subcontractor - Electrical" |
| 500106 | Layne Christensen | SUB-SPEC / "Specialized Drilling" | SUB-SPEC / "Subcontractor - Specialized" |
| 500106 | Rosendin Electric | SUB-ELEC / "Power Systems" | SUB-ELEC / "Subcontractor - Electrical" |
| 500108 | Stupp Bridge | SUB-STEEL / "Steel Fabrication" | SUB-STEEL / "Subcontractor - Steel" |
| 500109 | Christy Webber | SUB-LAND / "Landscaping" | SUB-SPEC / "Subcontractor - Specialized" |
| 500110 | Layne Christensen | SUB-SPEC / "Specialized Drilling" | SUB-SPEC / "Subcontractor - Specialized" |
| 500110 | Curran Contracting | SUB-PAV / "Finish Paving" | SUB-PAV / "Subcontractor - Paving" |

---

### 2. Add 3 New Opportunities per Job Site

Each site gets 3 new opportunities with varying types (Sales, Rent, Parts, Service, Rental Service, Lease) and sales reps matching those assigned to that site. All new opportunities will have `estimateDeliveryMonth` and `estimateDeliveryYear` set.

New opportunity IDs will start at 300001 and increment. Each will have a full record in `Opportunity.json` and a summary entry in the site's `associatedOpportunities` array in `JobSite.json`. Stages will vary across Lead, Outstanding, Development, Proposal, Won, Lost to provide diverse test data.

---

### 3. Add 3 New Customer Equipment per Job Site

Each site gets 3 additional equipment entries associated with companies already on that site. Equipment types will vary (Excavator, Dozer, Wheel Loader, Skid Steer, Compactor, Generator, Boom Lift, etc.) with realistic makes (Caterpillar, Komatsu, John Deere, Volvo, Case, Bobcat), model numbers, years, serial numbers, and hour readings.

---

### Scale of Changes

- 30 new opportunities across both JSON files
- 30 new customer equipment entries in JobSite.json
- 9 role description fixes in JobSite.json
- No code/logic changes needed -- data files only

