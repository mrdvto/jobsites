import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortIconProps {
  active: boolean;
  direction: 'asc' | 'desc' | null;
}

export function SortIcon({ active, direction }: SortIconProps) {
  if (!active)
    return (
      <ArrowUpDown className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
    );
  if (direction === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
  return <ArrowDown className="h-4 w-4 ml-1" />;
}
