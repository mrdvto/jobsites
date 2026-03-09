import { useData } from '@/contexts/DataContext';
import { DIVISIONS } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export const ActiveFilterBadges = () => {
  const { filters, setFilters, users } = useData();

  const getUserLabel = (id: string) => {
    const user = users.find(u => u.id.toString() === id);
    return user ? `${user.lastName}, ${user.firstName}` : id;
  };

  const getDivisionLabel = (code: string) => {
    const div = DIVISIONS.find(d => d.code === code);
    return div ? div.code : code;
  };

  const badges: { label: string; onRemove: () => void }[] = [];

  if (filters.assigneeIds.length > 0) {
    badges.push({
      label: `Assignee: ${filters.assigneeIds.map(getUserLabel).join(', ')}`,
      onRemove: () => setFilters({ ...filters, assigneeIds: [] }),
    });
  }

  if (filters.divisions.length > 0) {
    badges.push({
      label: `Division: ${filters.divisions.map(getDivisionLabel).join(', ')}`,
      onRemove: () => setFilters({ ...filters, divisions: [] }),
    });
  }

  if (filters.statuses.length > 0) {
    badges.push({
      label: `Status: ${filters.statuses.join(', ')}`,
      onRemove: () => setFilters({ ...filters, statuses: [] }),
    });
  }

  if (filters.generalContractor) {
    badges.push({
      label: `GC: ${filters.generalContractor}`,
      onRemove: () => setFilters({ ...filters, generalContractor: '' }),
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
    <div className="flex flex-wrap items-center gap-1.5">
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
