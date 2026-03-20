import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { KPICard } from '@/components/KPICard';
import { ProjectTable } from '@/components/ProjectTable';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ColumnVisibilityProvider } from '@/contexts/ColumnVisibilityContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function LoadingSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card shrink-0">
        <div className="container mx-auto px-6 py-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
      </header>
      <div className="shrink-0 container mx-auto px-6 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
      <div className="flex-1 container mx-auto px-6 py-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
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

export const Route = createFileRoute('/')({
  component: ProjectListPage,
  pendingComponent: LoadingSkeleton,
  errorComponent: RouteErrorComponent,
});

function ProjectListPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <ColumnVisibilityProvider>
      <div className="h-screen flex flex-col bg-background">
        <header className="border-b bg-card shrink-0">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Projects List</h1>
                <p className="text-sm text-muted-foreground">Manage construction projects and opportunities</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
                <SettingsPanel />
              </div>
            </div>
          </div>
        </header>

        <div className="shrink-0 container mx-auto px-6 pt-6">
          <KPICard />
        </div>

        <main className="flex-1 min-h-0 container mx-auto px-6 py-4">
          <ProjectTable />
        </main>

        <CreateProjectModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal} />
      </div>
    </ColumnVisibilityProvider>
  );
}
