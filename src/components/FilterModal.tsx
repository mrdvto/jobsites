import { useData } from '@/contexts/DataContext';
import { DIVISIONS } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FilterModal = ({ open, onOpenChange }: FilterModalProps) => {
  const { filters, setFilters, users, projects } = useData();
  const sortedUsers = [...users].sort((a, b) => a.lastName.localeCompare(b.lastName));
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.statusId))).sort();

  const assigneeOptions = sortedUsers.map(user => ({
    value: user.id.toString(),
    label: `${user.lastName}, ${user.firstName}`,
  }));

  const divisionOptions = DIVISIONS.map(d => ({
    value: d.code,
    label: `${d.code} - ${d.name}`,
  }));

  const statusOptions = uniqueStatuses.map(status => ({
    value: status,
    label: status,
  }));

  const clearAll = () => {
    setFilters({
      assigneeIds: [],
      divisions: [],
      statuses: [],
      generalContractor: '',
      hideCompleted: false,
    });
  };

  const hasActiveFilters =
    filters.assigneeIds.length > 0 ||
    filters.divisions.length > 0 ||
    filters.statuses.length > 0 ||
    filters.generalContractor !== '' ||
    filters.hideCompleted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Assignee</Label>
            <MultiSelectFilter
              label="Assignees"
              options={assigneeOptions}
              selected={filters.assigneeIds}
              onSelectionChange={(values) => setFilters({ ...filters, assigneeIds: values })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Division</Label>
            <MultiSelectFilter
              label="Divisions"
              options={divisionOptions}
              selected={filters.divisions}
              onSelectionChange={(values) => setFilters({ ...filters, divisions: values })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <MultiSelectFilter
              label="Statuses"
              options={statusOptions}
              selected={filters.statuses}
              onSelectionChange={(values) => setFilters({ ...filters, statuses: values })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gc-filter">General Contractor</Label>
            <Input
              id="gc-filter"
              placeholder="Search GC name..."
              value={filters.generalContractor}
              onChange={(e) => setFilters({ ...filters, generalContractor: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="hideCompletedModal"
              checked={filters.hideCompleted}
              onCheckedChange={(checked) => setFilters({ ...filters, hideCompleted: checked })}
            />
            <Label htmlFor="hideCompletedModal" className="text-sm font-normal cursor-pointer">
              Hide Completed
            </Label>
          </div>
        </div>
        <DialogFooter>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
