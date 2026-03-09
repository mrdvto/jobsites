import { useState, useCallback } from 'react';

export type ColumnId =
  | 'address'
  | 'assignee'
  | 'owner'
  | 'status'
  | 'revenue'
  | 'valuation'
  | 'primaryStage'
  | 'projectType'
  | 'ownershipType'
  | 'bidDate'
  | 'targetStartDate'
  | 'targetCompletionDate'
  | 'externalRef';

const STORAGE_KEY = 'crm-project-columns';

const DEFAULT_VISIBLE: ColumnId[] = ['address', 'assignee', 'owner', 'status', 'revenue'];

function loadFromStorage(): ColumnId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as ColumnId[];
    }
  } catch {
    // ignore
  }
  return DEFAULT_VISIBLE;
}

export function useColumnVisibility() {
  const [visibleColumns, setVisibleColumnsState] = useState<ColumnId[]>(loadFromStorage);

  const setVisibleColumns = useCallback((columns: ColumnId[]) => {
    setVisibleColumnsState(columns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, []);

  const toggleColumn = useCallback((id: ColumnId) => {
    setVisibleColumnsState(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isVisible = useCallback(
    (id: ColumnId) => visibleColumns.includes(id),
    [visibleColumns],
  );

  return { visibleColumns, setVisibleColumns, toggleColumn, isVisible };
}
