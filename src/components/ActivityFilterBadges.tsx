import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ActivityFilters, DEFAULT_ACTIVITY_FILTERS } from './ActivityFilterModal';
import { ProjectCompany } from '@/types';
import { format } from 'date-fns';

const ACTIVITY_TYPE_MAP: Record<string, string> = {
  E: 'Email',
  P: 'Phone',
  F: 'Face-to-Face',
  Q: 'Quote',
};

interface Props {
  filters: ActivityFilters;
  setFilters: (filters: ActivityFilters) => void;
  projectCompanies: ProjectCompany[];
  getSalesRepName: (id: number) => string;
}

export const ActivityFilterBadges = ({ filters, setFilters, projectCompanies, getSalesRepName }: Props) => {
  const badges: { label: string; onRemove: () => void }[] = [];

  if (filters.assigneeIds.length > 0) {
    const names = filters.assigneeIds.map(id => getSalesRepName(parseInt(id)));
    badges.push({
      label: `Assignee: ${names.join(', ')}`,
      onRemove: () => setFilters({ ...filters, assigneeIds: [] }),
    });
  }

  if (filters.companyIds.length > 0) {
    const names = filters.companyIds.map(id => projectCompanies.find(c => c.companyId === id)?.companyName || id);
    badges.push({
      label: `Company: ${names.join(', ')}`,
      onRemove: () => setFilters({ ...filters, companyIds: [] }),
    });
  }

  if (filters.contactNames.length > 0) {
    badges.push({
      label: `Contact: ${filters.contactNames.join(', ')}`,
      onRemove: () => setFilters({ ...filters, contactNames: [] }),
    });
  }

  if (filters.roleIds.length > 0) {
    const roleMap = new Map<string, string>();
    projectCompanies.forEach(c => {
      const ids = c.roleIds || [c.roleId];
      const descs = c.roleDescriptions || [c.roleDescription];
      ids.forEach((id, i) => roleMap.set(id, descs[i] || id));
    });
    badges.push({
      label: `Role: ${filters.roleIds.map(id => roleMap.get(id) || id).join(', ')}`,
      onRemove: () => setFilters({ ...filters, roleIds: [] }),
    });
  }

  if (filters.typeIds.length > 0) {
    badges.push({
      label: `Type: ${filters.typeIds.map(t => ACTIVITY_TYPE_MAP[t] || t).join(', ')}`,
      onRemove: () => setFilters({ ...filters, typeIds: [] }),
    });
  }

  if (filters.statuses.length > 0) {
    badges.push({
      label: `Status: ${filters.statuses.map(s => s === 'completed' ? 'Completed' : 'Outstanding').join(', ')}`,
      onRemove: () => setFilters({ ...filters, statuses: [] }),
    });
  }

  if (filters.dateFrom) {
    badges.push({
      label: `From: ${format(filters.dateFrom, 'MMM d, yyyy')}`,
      onRemove: () => setFilters({ ...filters, dateFrom: undefined }),
    });
  }

  if (filters.dateTo) {
    badges.push({
      label: `To: ${format(filters.dateTo, 'MMM d, yyyy')}`,
      onRemove: () => setFilters({ ...filters, dateTo: undefined }),
    });
  }

  if (filters.hideCompleted) {
    badges.push({
      label: 'Hide Completed',
      onRemove: () => setFilters({ ...filters, hideCompleted: false }),
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-3">
      {badges.map((badge) => (
        <Badge
          key={badge.label}
          variant="secondary"
          className="text-xs gap-1 pr-1"
        >
          {badge.label}
          <button
            onClick={badge.onRemove}
            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
};
