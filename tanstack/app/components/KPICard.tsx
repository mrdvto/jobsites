import { Card } from '@/components/ui/card';
import { DollarSign, Trophy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useProjects } from '@/hooks/useProjects';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useOpportunityStages, useOpportunityTypes } from '@/hooks/useLookups';
import { useFilters, filterProjects } from '@/hooks/useFilters';
import { classifyRevenue, buildRevenueByType } from '@/lib/revenue';

const RevenueSection = ({
  icon: Icon,
  label,
  total,
  byType,
}: {
  icon: React.ElementType;
  label: string;
  total: number;
  byType: { typeId: number; typeName: string; revenue: number }[];
}) => (
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between flex-1 min-w-0 gap-2">
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl md:text-3xl font-bold">
          ${Math.round(total).toLocaleString('en-US')}
        </p>
      </div>
    </div>

    {total > 0 && byType.length > 0 && (
      <div className="flex flex-wrap items-center gap-4 pl-16 lg:pl-0">
        {byType.map((item, index) => (
          <div key={item.typeId} className="flex items-center gap-4">
            {index > 0 && <Separator orientation="vertical" className="h-8" />}
            <div className="lg:text-right">
              <p className="text-xs text-muted-foreground">{item.typeName}</p>
              <p className="text-sm font-semibold">
                ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const KPICard = () => {
  const { data: projects } = useProjects();
  const { data: opportunities } = useOpportunities();
  const { data: stages } = useOpportunityStages();
  const { data: types } = useOpportunityTypes();
  const { filters } = useFilters();

  const allProjects = projects || [];
  const allOpportunities = opportunities || [];
  const allStages = stages || [];
  const allTypes = types || [];

  const filtered = filterProjects(allProjects, filters, allOpportunities);
  const { wonTotal, pipelineTotal, wonByType, pipelineByType } = classifyRevenue(filtered, allOpportunities, allStages);

  const pipelineByTypeArr = buildRevenueByType(pipelineByType, allTypes);
  const wonByTypeArr = buildRevenueByType(wonByType, allTypes);

  return (
    <Card className="p-6 mb-6">
      <div className="flex flex-col md:flex-row items-stretch gap-6">
        <RevenueSection
          icon={DollarSign}
          label="Pipeline Revenue"
          total={pipelineTotal}
          byType={pipelineByTypeArr}
        />
        <Separator orientation="vertical" className="hidden md:block h-auto" />
        <Separator className="md:hidden" />
        <RevenueSection
          icon={Trophy}
          label="Won Revenue"
          total={wonTotal}
          byType={wonByTypeArr}
        />
      </div>
    </Card>
  );
};
