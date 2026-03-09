import { Columns2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { type ColumnId, useColumnVisibility } from '@/hooks/useColumnVisibility';

interface ColumnDef {
  id: ColumnId;
  label: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { id: 'address', label: 'Address' },
  { id: 'assignee', label: 'Assignee' },
  { id: 'owner', label: 'Owner' },
  { id: 'status', label: 'Status' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'valuation', label: 'Valuation' },
  { id: 'primaryStage', label: 'Primary Stage' },
  { id: 'projectType', label: 'Project Type' },
  { id: 'ownershipType', label: 'Ownership Type' },
  { id: 'bidDate', label: 'Bid Date' },
  { id: 'targetStartDate', label: 'Target Start' },
  { id: 'targetCompletionDate', label: 'Target Completion' },
  { id: 'externalRef', label: 'External Reference' },
];

export const ColumnVisibilitySelector = () => {
  const { visibleColumns, toggleColumn, isVisible } = useColumnVisibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Columns2 className="h-4 w-4" />
          Columns
          {visibleColumns.length !== ALL_COLUMNS.length && (
            <span className="ml-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              {visibleColumns.length + 1}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="end">
        <p className="mb-1.5 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Visible Columns
        </p>

        {/* Locked row — Project Name */}
        <label className="flex cursor-not-allowed items-center gap-2 rounded-sm px-2 py-1.5 opacity-50">
          <Checkbox checked disabled />
          <span className="flex-1 text-sm">Project Name</span>
          <span className="text-[10px] text-muted-foreground">required</span>
        </label>

        <div className="my-1 border-t" />

        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {ALL_COLUMNS.map(col => (
            <label
              key={col.id}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <Checkbox
                checked={isVisible(col.id)}
                onCheckedChange={() => toggleColumn(col.id)}
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
