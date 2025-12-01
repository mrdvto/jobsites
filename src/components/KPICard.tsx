import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export const KPICard = () => {
  const { getTotalPipelineRevenue } = useData();
  const revenue = getTotalPipelineRevenue();

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <DollarSign className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Revenue in Pipeline</p>
          <p className="text-3xl font-bold">
            ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </Card>
  );
};
