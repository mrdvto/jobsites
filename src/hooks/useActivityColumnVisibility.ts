import { useState, useCallback } from 'react';

export type ActivityColumnId =
  | 'assignee'
  | 'company'
  | 'contact'
  | 'role'
  | 'activityType'
  | 'date'
  | 'status'
  | 'description';

export const ALL_ACTIVITY_COLUMN_IDS: ActivityColumnId[] = [
  'assignee',
  'company',
  'contact',
  'role',
  'activityType',
  'date',
  'status',
  'description',
];

export const ACTIVITY_COLUMN_LABELS: Record<ActivityColumnId, string> = {
  assignee: 'Assignee',
  company: 'Company',
  contact: 'Contact',
  role: 'Role',
  activityType: 'Activity Type',
  date: 'Date',
  status: 'Status',
  description: 'Description',
};

const STORAGE_KEY = 'crm-activity-columns';
const DEFAULT_VISIBLE: ActivityColumnId[] = ['assignee', 'activityType', 'date', 'status', 'description'];

function loadFromStorage(): ActivityColumnId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is ActivityColumnId => ALL_ACTIVITY_COLUMN_IDS.includes(id));
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_VISIBLE;
}

export function useActivityColumnVisibility() {
  const [visibleColumns, setVisibleColumnsState] = useState<ActivityColumnId[]>(loadFromStorage);

  const persist = useCallback((columns: ActivityColumnId[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, []);

  const toggleColumn = useCallback((id: ActivityColumnId) => {
    setVisibleColumnsState(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      persist(next);
      return next;
    });
  }, [persist]);

  const isVisible = useCallback(
    (id: ActivityColumnId) => visibleColumns.includes(id),
    [visibleColumns],
  );

  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    setVisibleColumnsState(prev => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length || fromIndex === toIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      persist(next);
      return next;
    });
  }, [persist]);

  return { visibleColumns, toggleColumn, isVisible, moveColumn };
}
