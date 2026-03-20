import { useState, useEffect, useCallback } from 'react';
import type { DodgeMapping } from '@/types';

const DODGE_MAPPINGS_STORAGE_KEY = 'crm-dodge-mappings';

/**
 * Client-side Dodge mappings state with localStorage persistence.
 * Mirrors the original DataContext dodge mappings behavior.
 */
export function useDodgeMappings() {
  const [dodgeMappings, setDodgeMappingsState] = useState<Record<string, DodgeMapping[]>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(DODGE_MAPPINGS_STORAGE_KEY);
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  });

  const setDodgeMappings = useCallback((type: string, mappings: DodgeMapping[]) => {
    setDodgeMappingsState(prev => {
      const updated = { ...prev, [type]: mappings };
      localStorage.setItem(DODGE_MAPPINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { dodgeMappings, setDodgeMappings };
}
