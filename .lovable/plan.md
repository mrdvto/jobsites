

# Update Opportunity Details to Match Their Types

## Overview
Update the sample opportunity data so that each record's description, revenue, product groups, and other details are realistic and consistent with its opportunity type (Sales, Rent, Parts, Service, Rental Service, or Lease).

## Type Assignments and Realistic Updates

### 100002 -- typeId: 2 (Rent) -- KEEP, already realistic
- Description: "12-month rental of 950M Heavy Duty Loader for industrial site grading." -- fits Rent
- No changes needed

### 100003 -- typeId: 8 -> change to 8 (Service)
- Current description mentions "rental of asphalt paver" which is not a service
- New description: "Scheduled 500-hour preventive maintenance service on AP655F Asphalt Paver including undercarriage inspection and hydraulic system flush."
- Revenue: adjust to ~$15,000 (reasonable for a major service job)
- Remove rental/delivery language

### 100004 -- typeId: 8 -> change to 32 (Lease)
- Current description mentions "rental" -- change to lease language
- New description: "36-month full-service lease of CAT 3508 Generator Set for permanent standby power at distribution facility."
- Update product group: rentDuration to 36, rentDurationTypeId for monthly lease, unitPrice as monthly lease rate
- Equipment status: "New"

### 100005 -- typeId: 8 -> change to 16 (Rental Service)
- New description: "Rental service contract -- CAT 3516 Diesel Engine with operator and on-site fuel management for 6-month pipeline project."
- Adjust product group to reflect rental service (equipment + labor bundled)

### 100015 -- typeId: 8 -> change to 1 (Sales)
- Description already says "Purchase of new CAT 320 Excavator" -- fits Sales perfectly
- Update typeId to 1
- Adjust product group: rentDuration to 0 or 1 (one-time sale), rentDurationTypeId for purchase

### 100016 -- typeId: 8 -> change to 4 (Parts)
- Current description mentions service -- shift focus to parts order
- New description: "Parts order for high-pressure air compressor rebuild kit including cylinder heads, gaskets, valves, and filtration components."
- Revenue: $12,500 (reasonable parts order)
- Clear product groups (parts orders typically don't have equipment line items in the same structure)

### 100018 -- typeId: 2 -> change to 8 (Service)
- Description already says "Undercarriage overhaul and scheduled maintenance for fleet Dozer" -- fits Service
- Update typeId to 8

### 100024 -- typeId: 4 -> change to 2 (Rent)
- Description already says "Short-term rental of mini excavator and skid steer" -- fits Rent
- Update typeId to 2

### 100025 -- typeId: 8 -> change to 16 (Rental Service)
- Current description mentions rental of generator -- adjust to rental service
- New description: "Rental service package -- portable XQ575 power generator with certified operator, fuel delivery, and 24/7 monitoring for marina dock expansion."
- Update typeId to 16

### 100026 -- typeId: 2 -> change to 1 (Sales)
- Description already says "Purchase of CAT D6 Dozer" -- fits Sales
- Update typeId to 1

### 100027 -- typeId: 8 -> change to 4 (Parts)
- Current description mentions rental of vibratory roller -- change to parts
- New description: "Replacement drum assembly, vibration bearings, and wear plates for CS56B Vibratory Roller fleet maintenance."
- Revenue: $8,200 (reasonable for major parts order)

## Summary of Changes

| ID | New typeId | Type Name | Updated Description |
|----|-----------|-----------|---------------------|
| 100002 | 2 | Rent | No change |
| 100003 | 8 | Service | Preventive maintenance on paver |
| 100004 | 32 | Lease | 36-month full-service lease of generator |
| 100005 | 16 | Rental Service | Engine rental with operator and fuel mgmt |
| 100015 | 1 | Sales | No change (already purchase language) |
| 100016 | 4 | Parts | Air compressor rebuild kit parts order |
| 100018 | 8 | Service | No change (already service language) |
| 100024 | 2 | Rent | No change (already rental language) |
| 100025 | 16 | Rental Service | Generator with operator and monitoring |
| 100026 | 1 | Sales | No change (already purchase language) |
| 100027 | 4 | Parts | Drum assembly and wear parts for roller |

## Files Modified

| File | Changes |
|------|---------|
| `src/data/Opportunity.json` | Update typeId values and descriptions/details for all 11 opportunities |

