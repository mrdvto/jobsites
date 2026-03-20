import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Activity, ProjectCompany } from '@/types';

export interface ActivityFilters {
  assigneeIds: string[];
  companyIds: string[];
  contactNames: string[];
  roleIds: string[];
  typeIds: string[];
  statuses: string[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  hideCompleted: boolean;
}

export const DEFAULT_ACTIVITY_FILTERS: ActivityFilters = {
  assigneeIds: [],
  companyIds: [],
  contactNames: [],
  roleIds: [],
  typeIds: [],
  statuses: [],
  dateFrom: undefined,
  dateTo: undefined,
  hideCompleted: false,
};

interface ActivityFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ActivityFilters;
  setFilters: (filters: ActivityFilters) => void;
  activities: Activity[];
  projectCompanies: ProjectCompany[];
  getSalesRepName: (id: number) => string;
}

const ACTIVITY_TYPE_MAP: Record<string, string> = {
  E: 'Email',
  P: 'Phone',
  F: 'Face-to-Face',
  Q: 'Quote',
};

export const ActivityFilterModal = ({
  open,
  onOpenChange,
  filters,
  setFilters,
  activities,
  projectCompanies,
  getSalesRepName,
}: ActivityFilterModalProps) => {
  const assigneeOptions = useMemo(() => {
    const ids = Array.from(new Set(activities.map(a => a.salesRepId)));
    return ids
      .map(id => ({ value: id.toString(), label: getSalesRepName(id) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [activities, getSalesRepName]);

  const companyOptions = useMemo(() => {
    const companies = projectCompanies.filter(c => {
      const roles = c.roleIds || [c.roleId];
      return !roles.every(r => r === 'OWNER');
    });
    return companies
      .map(c => ({ value: c.companyId, label: c.companyName }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [projectCompanies]);

  const contactOptions = useMemo(() => {
    const names = Array.from(new Set(activities.map(a => a.contactName).filter(Boolean)));
    return names.sort().map(name => ({ value: name, label: name }));
  }, [activities]);

  const roleOptions = useMemo(() => {
    const roleSet = new Map<string, string>();
    projectCompanies.forEach(c => {
      const ids = c.roleIds || [c.roleId];
      const descs = c.roleDescriptions || [c.roleDescription];
      ids.forEach((id, i) => {
        if (id && id !== 'OWNER') roleSet.set(id, descs[i] || id);
      });
    });
    return Array.from(roleSet.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [projectCompanies]);

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(activities.map(a => a.typeId)));
    return types.map(t => ({ value: t, label: ACTIVITY_TYPE_MAP[t] || t }));
  }, [activities]);

  const statusOptions = [
    { value: 'outstanding', label: 'Outstanding' },
    { value: 'completed', label: 'Completed' },
  ];

  const clearAll = () => setFilters(DEFAULT_ACTIVITY_FILTERS);

  const hasActiveFilters =
    filters.assigneeIds.length > 0 ||
    filters.companyIds.length > 0 ||
    filters.contactNames.length > 0 ||
    filters.roleIds.length > 0 ||
    filters.typeIds.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined ||
    filters.hideCompleted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Activity Filters</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>Assignee</Label>
            <MultiSelectFilter
              label="Assignees"
              options={assigneeOptions}
              selected={filters.assigneeIds}
              onSelectionChange={(v) => setFilters({ ...filters, assigneeIds: v })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <MultiSelectFilter
              label="Companies"
              options={companyOptions}
              selected={filters.companyIds}
              onSelectionChange={(v) => setFilters({ ...filters, companyIds: v })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact</Label>
            <MultiSelectFilter
              label="Contacts"
              options={contactOptions}
              selected={filters.contactNames}
              onSelectionChange={(v) => setFilters({ ...filters, contactNames: v })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <MultiSelectFilter
              label="Roles"
              options={roleOptions}
              selected={filters.roleIds}
              onSelectionChange={(v) => setFilters({ ...filters, roleIds: v })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <MultiSelectFilter
              label="Types"
              options={typeOptions}
              selected={filters.typeIds}
              onSelectionChange={(v) => setFilters({ ...filters, typeIds: v })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <MultiSelectFilter
              label="Statuses"
              options={statusOptions}
              selected={filters.statuses}
              onSelectionChange={(v) => setFilters({ ...filters, statuses: v })}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "MMM d, yyyy") : "Any"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(d) => setFilters({ ...filters, dateFrom: d })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {filters.dateFrom && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setFilters({ ...filters, dateFrom: undefined })}>
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "MMM d, yyyy") : "Any"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(d) => setFilters({ ...filters, dateTo: d })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {filters.dateTo && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setFilters({ ...filters, dateTo: undefined })}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="actHideCompleted"
              checked={filters.hideCompleted}
              onCheckedChange={(checked) => setFilters({ ...filters, hideCompleted: checked })}
            />
            <Label htmlFor="actHideCompleted" className="text-sm font-normal cursor-pointer">
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
