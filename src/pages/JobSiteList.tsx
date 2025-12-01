import { FilterBar } from '@/components/FilterBar';
import { KPICard } from '@/components/KPICard';
import { JobSiteTable } from '@/components/JobSiteTable';

const JobSiteList = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Job Site Management</h1>
          <p className="text-sm text-muted-foreground">Manage construction sites and opportunities</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <KPICard />
        <FilterBar />
        <JobSiteTable />
      </main>
    </div>
  );
};

export default JobSiteList;
