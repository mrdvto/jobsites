import { useState, useEffect } from 'react';

export interface StatusColorConfig {
  id: string;
  label: string;
  color: string;
}

export const STATUS_COLORS = [
  { id: 'emerald', label: 'Green', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  { id: 'sky', label: 'Blue', bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300' },
  { id: 'amber', label: 'Yellow', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  { id: 'rose', label: 'Red', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
  { id: 'violet', label: 'Purple', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
  { id: 'slate', label: 'Gray', bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-300' },
];

const STORAGE_KEY = 'project-status-colors';

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  'Active': 'emerald',
  'Planning': 'sky',
  'On Hold': 'amber',
  'Completed': 'slate',
};

export const useStatusColors = () => {
  const [statusColors, setStatusColors] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_STATUS_COLORS;
      }
    }
    return DEFAULT_STATUS_COLORS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statusColors));
  }, [statusColors]);

  const getStatusColorClasses = (statusId: string): string => {
    const colorId = statusColors[statusId] || 'slate';
    const colorConfig = STATUS_COLORS.find(c => c.id === colorId);
    if (colorConfig) {
      return `${colorConfig.bg} ${colorConfig.text}`;
    }
    return 'bg-muted text-muted-foreground';
  };

  const updateStatusColor = (statusId: string, colorId: string) => {
    setStatusColors(prev => ({
      ...prev,
      [statusId]: colorId
    }));
  };

  const updateAllStatusColors = (colors: Record<string, string>) => {
    setStatusColors(colors);
  };

  return {
    statusColors,
    getStatusColorClasses,
    updateStatusColor,
    updateAllStatusColors,
    STATUS_COLORS,
  };
};
