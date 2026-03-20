import { useState, useEffect, useCallback } from 'react';
import type { Filters, Project, Opportunity } from '@/types';

const FILTERS_STORAGE_KEY = 'crm-filters';

const defaultFilters: Filters = {
  assigneeIds: [],
  divisions: [],
  generalContractor: '',
  statuses: [],
  hideCompleted: true,
};

/**
 * Client-side filter state with localStorage persistence.
 * Mirrors the original DataContext filter behavior.
 */
export function useFilters() {
  const [filters, setFiltersState] = useState<Filters>(() => {
    if (typeof window === 'undefined') return defaultFilters;
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!saved) return defaultFilters;
    try {
      const parsed = JSON.parse(saved);
      // Migrate legacy single-value fields to arrays
      if ('assigneeId' in parsed && !('assigneeIds' in parsed)) {
        parsed.assigneeIds = parsed.assigneeId ? [parsed.assigneeId] : [];
        delete parsed.assigneeId;
      }
      if ('salesRepId' in parsed) {
        parsed.assigneeIds = parsed.salesRepId ? [String(parsed.salesRepId)] : [];
        delete parsed.salesRepId;
      }
      if ('division' in parsed && !('divisions' in parsed)) {
        parsed.divisions = parsed.division ? [parsed.division] : [];
        delete parsed.division;
      }
      if ('status' in parsed && !('statuses' in parsed)) {
        parsed.statuses = parsed.status ? [parsed.status] : [];
        delete parsed.status;
      }
      return parsed as Filters;
    } catch {
      return defaultFilters;
    }
  });

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const setFilters = useCallback((newFilters: Filters) => {
    setFiltersState(newFilters);
  }, []);

  return { filters, setFilters };
}

/**
 * Pure function: apply filters to a project list.
 * Replaces DataContext.getFilteredProjects().
 */
export function filterProjects(
  projects: Project[],
  filters: Filters,
  opportunities: Opportunity[]
): Project[] {
  return projects.filter(project => {
    if (filters.hideCompleted && project.statusId === 'Completed') return false;
    if (filters.assigneeIds.length > 0 && !project.assigneeIds.some(id => filters.assigneeIds.includes(id.toString()))) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(project.statusId)) return false;
    if (filters.divisions.length > 0) {
      const projectOpps = project.associatedOpportunities
        .map(ao => opportunities.find(o => o.id === ao.id))
        .filter(Boolean) as Opportunity[];
      const division = projectOpps.length > 0 ? projectOpps[0].divisionId : 'E';
      if (!filters.divisions.includes(division)) return false;
    }
    if (filters.generalContractor) {
      const hasMatchingGC = project.projectCompanies.some(company => {
        const roles = company.roleIds || [company.roleId];
        return roles.includes('GC') && company.companyName.toLowerCase().includes(filters.generalContractor.toLowerCase());
      });
      if (!hasMatchingGC) return false;
    }
    return true;
  });
}
