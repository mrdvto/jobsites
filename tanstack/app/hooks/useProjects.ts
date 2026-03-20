import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Project, Activity, Note, ProjectCompany } from '@/types';
import {
  getProjects,
  getProjectById,
  createProject as createProjectFn,
  updateProject as updateProjectFn,
  addProjectCompany as addProjectCompanyFn,
  removeProjectCompany as removeProjectCompanyFn,
  updateProjectCompany as updateProjectCompanyFn,
  addActivity as addActivityFn,
  updateActivity as updateActivityFn,
  deleteActivity as deleteActivityFn,
  addNote as addNoteFn,
  updateNote as updateNoteFn,
  deleteNote as deleteNoteFn,
  addCustomerEquipment as addCustomerEquipmentFn,
  deleteCustomerEquipment as deleteCustomerEquipmentFn,
  addOpportunityToProject as addOpportunityToProjectFn,
  createNewOpportunityOnProject as createNewOpportunityOnProjectFn,
  getEquipmentProjectAssignment as getEquipmentProjectAssignmentFn,
  getChangeLog,
  getAllKnownCompanies as getAllKnownCompaniesFn,
} from '@/server/projects';

// --- Query options (reusable for loaders + hooks) ---

export const projectsQueryOptions = () => ({
  queryKey: ['projects'] as const,
  queryFn: () => getProjects(),
});

export const projectQueryOptions = (id: number) => ({
  queryKey: ['projects', id] as const,
  queryFn: () => getProjectById({ data: { id } }),
});

export const changeLogQueryOptions = (projectId: number) => ({
  queryKey: ['changelog', projectId] as const,
  queryFn: () => getChangeLog({ data: { projectId } }),
});

export const allKnownCompaniesQueryOptions = () => ({
  queryKey: ['allKnownCompanies'] as const,
  queryFn: () => getAllKnownCompaniesFn(),
});

// --- Hooks ---

export function useProjects() {
  return useQuery(projectsQueryOptions());
}

export function useProject(id: number) {
  return useQuery(projectQueryOptions(id));
}

export function useChangeLog(projectId: number) {
  return useQuery(changeLogQueryOptions(projectId));
}

export function useAllKnownCompanies() {
  return useQuery(allKnownCompaniesQueryOptions());
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { project: Omit<Project, 'id'>; userId: number }) =>
      createProjectFn({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; updates: Partial<Project>; userId: number }) =>
      updateProjectFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useAddProjectCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; company: any; userId: number }) =>
      addProjectCompanyFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['allKnownCompanies'] });
    },
  });
}

export function useRemoveProjectCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; companyName: string; userId: number }) =>
      removeProjectCompanyFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useUpdateProjectCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; oldCompanyName: string; updatedCompany: ProjectCompany; userId: number }) =>
      updateProjectCompanyFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useAddActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; activity: Omit<Activity, 'id'>; userId: number }) =>
      addActivityFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; activityId: number; updates: Partial<Activity>; userId: number }) =>
      updateActivityFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; activityId: number; userId: number }) =>
      deleteActivityFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>; userId: number }) =>
      addNoteFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; noteId: number; updates: Partial<Note>; userId: number }) =>
      updateNoteFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; noteId: number; userId: number }) =>
      deleteNoteFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useAddCustomerEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; equipmentId: number; equipmentLabel?: string; userId: number }) =>
      addCustomerEquipmentFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useDeleteCustomerEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; equipmentId: number; equipmentLabel?: string; userId: number }) =>
      deleteCustomerEquipmentFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useAddOpportunityToProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; opportunity: { id: number; typeId: number; description: string; stageId: number; estimateRevenue: number }; userId: number }) =>
      addOpportunityToProjectFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useCreateNewOpportunityOnProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: number; opportunity: { id: number; typeId: number; description: string; stageId: number; estimateRevenue: number }; userId: number }) =>
      createNewOpportunityOnProjectFn({ data }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', variables.projectId] });
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      qc.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
    },
  });
}

export function useEquipmentProjectAssignment(equipmentId: number, excludeProjectId?: number) {
  return useQuery({
    queryKey: ['equipmentAssignment', equipmentId, excludeProjectId] as const,
    queryFn: () => getEquipmentProjectAssignmentFn({ data: { equipmentId, excludeProjectId } }),
    enabled: equipmentId > 0,
  });
}
