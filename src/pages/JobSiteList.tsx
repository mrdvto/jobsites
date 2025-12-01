import { useState } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { KPICard } from '@/components/KPICard';
import { JobSiteTable } from '@/components/JobSiteTable';
import { CreateJobSiteModal } from '@/components/CreateJobSiteModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const JobSiteList = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Job Site Management</h1>
              <p className="text-sm text-muted-foreground">Manage construction sites and opportunities</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Job Site
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <KPICard />
        <FilterBar />
        <JobSiteTable />
      </main>

      <CreateJobSiteModal 
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
};

export default JobSiteList;
