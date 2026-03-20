import type { Project, Opportunity, OpportunityStage, OpportunityType } from '@/types';

/**
 * Total revenue across all associated opportunities for a project.
 */
export const calculateProjectRevenue = (project: Project): number => {
  return project.associatedOpportunities.reduce((sum, opp) => sum + opp.revenue, 0);
};

/**
 * Won revenue: stage 16 (Won/Sold) only.
 */
export const calculateProjectWonRevenue = (project: Project): number => {
  return project.associatedOpportunities
    .filter(ao => ao.stageId === 16)
    .reduce((sum, ao) => sum + ao.revenue, 0);
};

/**
 * Pipeline revenue: phase 1 (Prospecting) or phase 2 (Qualifying).
 */
export const calculateProjectPipelineRevenue = (
  project: Project,
  stages: OpportunityStage[]
): number => {
  return project.associatedOpportunities
    .filter(ao => {
      const stage = stages.find(s => s.stageid === ao.stageId);
      return stage && (stage.phaseid === 1 || stage.phaseid === 2);
    })
    .reduce((sum, ao) => sum + ao.revenue, 0);
};

/**
 * Classify revenue into won vs pipeline, both totals and by-type maps.
 */
export const classifyRevenue = (
  filteredProjects: Project[],
  opportunities: Opportunity[],
  stages: OpportunityStage[]
) => {
  let wonTotal = 0;
  let pipelineTotal = 0;
  const wonByType = new Map<number, number>();
  const pipelineByType = new Map<number, number>();

  filteredProjects.forEach(project => {
    project.associatedOpportunities.forEach(ao => {
      const opp = opportunities.find(o => o.id === ao.id);
      if (!opp) return;
      const stage = stages.find(s => s.stageid === ao.stageId);
      if (!stage) return;

      if (stage.stageid === 16) {
        wonTotal += ao.revenue;
        wonByType.set(opp.typeId, (wonByType.get(opp.typeId) || 0) + ao.revenue);
      } else if (stage.phaseid === 1 || stage.phaseid === 2) {
        pipelineTotal += ao.revenue;
        pipelineByType.set(opp.typeId, (pipelineByType.get(opp.typeId) || 0) + ao.revenue);
      }
    });
  });

  return { wonTotal, pipelineTotal, wonByType, pipelineByType };
};

/**
 * Convert a typeId → revenue map into a sorted array with type names.
 */
export const buildRevenueByType = (
  revenueMap: Map<number, number>,
  types: OpportunityType[]
): { typeId: number; typeName: string; revenue: number }[] => {
  return Array.from(revenueMap.entries())
    .filter(([, revenue]) => revenue > 0)
    .map(([typeId, revenue]) => {
      const type = types.find(t => t.opptypeid === typeId);
      return {
        typeId,
        typeName: type ? type.opptypedesc : 'Unknown',
        revenue,
        displayOrder: type ? type.displayorder : 999,
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(({ typeId, typeName, revenue }) => ({ typeId, typeName, revenue }));
};

/**
 * Total revenue by type for a set of projects (all stages).
 */
export const getRevenueByType = (
  filteredProjects: Project[],
  opportunities: Opportunity[],
  types: OpportunityType[]
): { typeId: number; typeName: string; revenue: number }[] => {
  const revenueMap = new Map<number, number>();
  filteredProjects.forEach(project => {
    project.associatedOpportunities.forEach(ao => {
      const opp = opportunities.find(o => o.id === ao.id);
      if (opp) revenueMap.set(opp.typeId, (revenueMap.get(opp.typeId) || 0) + ao.revenue);
    });
  });
  return buildRevenueByType(revenueMap, types);
};
