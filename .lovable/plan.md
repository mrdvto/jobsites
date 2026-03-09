

## Fix: Equipment Dialog Elements Cut Off on Focus

### Problem
The `DialogContent` on line 73 has `overflow-hidden`, which clips the Select dropdown and any focus rings that extend beyond the dialog boundary.

### Solution
Remove `overflow-hidden` from the `DialogContent` className. The inner scrollable area (`max-h-[60vh] overflow-y-auto`) already handles content overflow, so `overflow-hidden` on the outer container is unnecessary and actively harmful — it clips the Select popover and focus outlines.

### Change

**`src/components/AddCustomerEquipmentModal.tsx`** (line 73)
- Change `className="sm:max-w-[800px] overflow-hidden"` to `className="sm:max-w-[800px]"`

