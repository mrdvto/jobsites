import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LookupOption, NoteTag } from '@/types';
import {
  getSalesReps,
  getUsers,
  getOpportunityStages,
  getOpportunityTypes,
  getLookups,
  getNoteTags,
  updateLookups as updateLookupsFn,
  updateNoteTags as updateNoteTagsFn,
} from '@/server/lookups';

// --- Query options ---

export const salesRepsQueryOptions = () => ({
  queryKey: ['salesReps'] as const,
  queryFn: () => getSalesReps(),
});

export const usersQueryOptions = () => ({
  queryKey: ['users'] as const,
  queryFn: () => getUsers(),
});

export const stagesQueryOptions = () => ({
  queryKey: ['stages'] as const,
  queryFn: () => getOpportunityStages(),
});

export const typesQueryOptions = () => ({
  queryKey: ['types'] as const,
  queryFn: () => getOpportunityTypes(),
});

export const lookupsQueryOptions = () => ({
  queryKey: ['lookups'] as const,
  queryFn: () => getLookups(),
});

export const noteTagsQueryOptions = () => ({
  queryKey: ['noteTags'] as const,
  queryFn: () => getNoteTags(),
});

// --- Hooks ---

export function useSalesReps() {
  return useQuery(salesRepsQueryOptions());
}

export function useUsers() {
  return useQuery(usersQueryOptions());
}

export function useOpportunityStages() {
  return useQuery(stagesQueryOptions());
}

export function useOpportunityTypes() {
  return useQuery(typesQueryOptions());
}

export function useLookups() {
  return useQuery(lookupsQueryOptions());
}

export function useNoteTags() {
  return useQuery(noteTagsQueryOptions());
}

export function useUpdateLookups() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { primaryStages?: LookupOption[]; primaryProjectTypes?: LookupOption[]; ownershipTypes?: LookupOption[] }) =>
      updateLookupsFn({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lookups'] });
    },
  });
}

export function useUpdateNoteTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { tags: NoteTag[] }) =>
      updateNoteTagsFn({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['noteTags'] });
    },
  });
}
