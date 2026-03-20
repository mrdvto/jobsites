import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Opportunity } from '@/types';
import {
  getOpportunities,
  createOpportunity as createOpportunityFn,
  updateOpportunity as updateOpportunityFn,
} from '@/server/opportunities';

export const opportunitiesQueryOptions = () => ({
  queryKey: ['opportunities'] as const,
  queryFn: () => getOpportunities(),
});

export function useOpportunities() {
  return useQuery(opportunitiesQueryOptions());
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { opportunity: Opportunity }) =>
      createOpportunityFn({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { opportunityId: number; updates: Partial<Opportunity> }) =>
      updateOpportunityFn({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
