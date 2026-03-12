

## Replace "Add Role" Select with Searchable Popover + Command

Replace the `Select` dropdown for adding roles (lines 194-201 in `ManageCompanyContactsModal.tsx`) with a `Popover` + `Command` searchable pattern — same approach used for mail codes and company search elsewhere in the app.

### Change in `src/components/ManageCompanyContactsModal.tsx`

- Add `rolePopoverOpen` state.
- Replace the `<Select>` with a `<Popover>` containing a `<Command>` with `<CommandInput>` for searching, and `<CommandItem>` entries for each available role.
- Clicking a role calls `handleAddRole` and closes the popover.
- Trigger button styled as `+ Add Role` (matching current size/appearance).

