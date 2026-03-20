import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EditProjectModal } from '@/components/EditProjectModal';
import { NotesSection } from '@/components/NotesSection';
import { useToast } from '@/hooks/use-toast';

// Hooks
import { useProject, useUpdateProject, useAddNote, useUpdateNote, useDeleteNote, useAllKnownCompanies } from '@/hooks/useProjects';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useSalesReps, useUsers, useOpportunityStages, useNoteTags, useLookups } from '@/hooks/useLookups';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getSalesRepName as getSalesRepNameHelper, getUserName as getUserNameHelper, getUserNames as getUserNamesHelper, getStageName as getStageNameHelper, getStage as getStageHelper, getLookupLabel as getLookupLabelHelper } from '@/lib/lookupHelpers';

// Decomposed sections
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectInfoCard } from './components/ProjectInfoCard';
import { OpportunitiesSection } from './components/OpportunitiesSection';
import { CompaniesSection } from './components/CompaniesSection';
import { ActivitiesSection } from './components/ActivitiesSection';
import { EquipmentSection } from './components/EquipmentSection';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </header>
      <div className="container mx-auto px-6 py-6 space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

function RouteErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-destructive/50 p-4">
        <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/project/$id')({
  component: ProjectDetailPage,
  pendingComponent: LoadingSkeleton,
  errorComponent: RouteErrorComponent,
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(parseInt(id || '0'));
  const { data: salesReps } = useSalesReps();
  const { data: users } = useUsers();
  const { data: allOpportunities } = useOpportunities();
  const { data: stages } = useOpportunityStages();
  const { data: noteTagsData } = useNoteTags();
  const { data: lookupsData } = useLookups();
  const { data: allKnownCompanies } = useAllKnownCompanies();
  const { currentUserId } = useCurrentUser();
  const { toast } = useToast();

  const allSalesReps = salesReps || [];
  const allUsers = users || [];
  const opportunities = allOpportunities || [];
  const allStages = stages || [];
  const noteTags = noteTagsData || [];
  const lookups = lookupsData || { primaryStages: [], primaryProjectTypes: [], ownershipTypes: [] };
  const knownCompanies = allKnownCompanies || [];

  // Mutations
  const updateProjectMutation = useUpdateProject();
  const addNoteMutation = useAddNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  // Helper wrappers
  const getSalesRepName = (repId: number) => getSalesRepNameHelper(allSalesReps, repId);
  const getUserName = (userId: number) => getUserNameHelper(allUsers, userId);
  const getUserNames = (ids: number[]) => getUserNamesHelper(allUsers, ids);
  const getStageName = (stageId: number) => getStageNameHelper(allStages, stageId);
  const getStage = (stageId: number) => getStageHelper(allStages, stageId);
  const getCompanyById = (companyId: string) => knownCompanies.find(c => c.companyId === companyId);

  const getLookupLabel = (type: string, lookupId: string): string => {
    let options: { id: string; label: string }[] = [];
    if (type === 'primaryStage') options = lookups.primaryStages || [];
    else if (type === 'primaryProjectType') options = lookups.primaryProjectTypes || [];
    else if (type === 'ownershipType') options = lookups.ownershipTypes || [];
    return getLookupLabelHelper(options, lookupId);
  };

  // Edit project modal
  const [showEditModal, setShowEditModal] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (!project) return;
    updateProjectMutation.mutate({ projectId: project.id, updates: { statusId: newStatus }, userId: currentUserId });
    toast({ title: 'Status updated', description: `Project status changed to "${newStatus}".` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <Button onClick={() => navigate({ to: '/' })}>Return to List</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProjectHeader project={project} onStatusChange={handleStatusChange} />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <ProjectInfoCard
            project={project}
            getUserNames={getUserNames}
            getCompanyById={getCompanyById}
            getLookupLabel={getLookupLabel}
            getStage={getStage}
            onEditClick={() => setShowEditModal(true)}
          />
        </div>

        <OpportunitiesSection
          project={project}
          opportunities={opportunities}
          getSalesRepName={getSalesRepName}
          getStageName={getStageName}
          getStage={getStage}
        />

        <CompaniesSection project={project} />

        <ActivitiesSection project={project} getSalesRepName={getSalesRepName} />

        <EquipmentSection project={project} getLookupLabel={getLookupLabel} />

        <NotesSection
          notes={project.notes || []}
          noteTags={noteTags}
          onAddNote={(noteData) => addNoteMutation.mutate({ projectId: project.id, noteData, userId: currentUserId })}
          onUpdateNote={(noteId, noteData) => updateNoteMutation.mutate({ projectId: project.id, noteId, updates: noteData, userId: currentUserId })}
          onDeleteNote={(noteId) => deleteNoteMutation.mutate({ projectId: project.id, noteId, userId: currentUserId })}
          getSalesRepName={getUserName}
          projectId={project.id}
        />
      </main>

      <EditProjectModal project={project} open={showEditModal} onOpenChange={setShowEditModal} />
    </div>
  );
}
