import { useState } from 'react';

type SortDirection = 'asc' | 'desc' | null;

interface UseSortableOptions<TColumn extends string> {
  defaultColumn?: TColumn | null;
  defaultDirection?: SortDirection;
}

export function useSortable<TColumn extends string>(
  options?: UseSortableOptions<TColumn>
) {
  const [sortColumn, setSortColumn] = useState<TColumn | null>(
    options?.defaultColumn ?? null
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    options?.defaultDirection ?? null
  );

  const handleSort = (column: TColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortData = <T,>(
    data: T[],
    compareFn: (a: T, b: T, column: TColumn) => number
  ): T[] => {
    if (!sortColumn || !sortDirection) return data;
    return [...data].sort((a, b) => {
      const cmp = compareFn(a, b, sortColumn);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  };

  return { sortColumn, sortDirection, handleSort, sortData };
}
