import { useState, useRef } from 'react';
import { Columns2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
  type ActivityColumnId,
  ALL_ACTIVITY_COLUMN_IDS,
  ACTIVITY_COLUMN_LABELS,
} from '@/hooks/useActivityColumnVisibility';
import { cn } from '@/lib/utils';

interface Props {
  visibleColumns: ActivityColumnId[];
  toggleColumn: (id: ActivityColumnId) => void;
  isVisible: (id: ActivityColumnId) => boolean;
  moveColumn: (from: number, to: number) => void;
}

export const ActivityColumnSelector = ({ visibleColumns, toggleColumn, isVisible, moveColumn }: Props) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const orderedColumns = [
    ...visibleColumns.map(id => ({ id, label: ACTIVITY_COLUMN_LABELS[id] })),
    ...ALL_ACTIVITY_COLUMN_IDS.filter(id => !visibleColumns.includes(id)).map(id => ({ id, label: ACTIVITY_COLUMN_LABELS[id] })),
  ];

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (index >= visibleColumns.length) return;
    setDraggedIndex(index);
    dragNodeRef.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setTimeout(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = () => {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index >= visibleColumns.length) return;
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || toIndex >= visibleColumns.length) return;
    moveColumn(draggedIndex, toIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Columns2 className="h-4 w-4" />
          Columns
          {visibleColumns.length !== ALL_ACTIVITY_COLUMN_IDS.length && (
            <span className="ml-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              {visibleColumns.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <p className="mb-1.5 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Visible Columns
        </p>
        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {orderedColumns.map((col, index) => {
            const isVisibleCol = index < visibleColumns.length;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={col.id}
                draggable={isVisibleCol}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors',
                  isVisibleCol
                    ? 'cursor-grab hover:bg-accent hover:text-accent-foreground'
                    : 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
                  isDragging && 'opacity-50',
                  isDragOver && 'bg-accent ring-2 ring-primary ring-inset',
                )}
              >
                {isVisibleCol ? (
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <div className="w-4" />
                )}
                <Checkbox
                  checked={isVisible(col.id)}
                  onCheckedChange={() => toggleColumn(col.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="flex-1">{col.label}</span>
              </div>
            );
          })}
        </div>
        {visibleColumns.length > 0 && (
          <p className="mt-2 px-2 text-[10px] text-muted-foreground">
            Drag to reorder visible columns
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};
