

## Fix: Dialog Content Overflow

The table with 7 columns at `max-w-[600px]` is too wide, causing content to spill outside the dialog.

### Changes

**`src/components/AddCustomerEquipmentModal.tsx`**

1. Widen the dialog: change `sm:max-w-[600px]` to `sm:max-w-[800px]`
2. Add `overflow-hidden` to `DialogContent` to prevent any remaining overflow
3. Ensure the inner content area scrolls properly by wrapping the `space-y-4` div with `overflow-y-auto` and a max height so the footer stays visible

