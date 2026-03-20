import { createServerFn } from '@tanstack/react-start';
import type { Opportunity } from '@/types';

import opportunitiesData from '@/data/Opportunity.json';

// In-memory state
let opportunities: Opportunity[] = opportunitiesData.content.map((o: any) => ({
  ...o,
  projectId: o.projectId ?? o.jobSiteId,
})) as Opportunity[];

export const getOpportunities = createServerFn({ method: 'GET' }).handler(async () => {
  return opportunities;
});

export const createOpportunity = createServerFn({ method: 'POST' })
  .validator((data: { opportunity: Opportunity }) => data)
  .handler(async ({ data }) => {
    opportunities = [...opportunities, data.opportunity];
    return data.opportunity;
  });

export const updateOpportunity = createServerFn({ method: 'POST' })
  .validator((data: { opportunityId: number; updates: Partial<Opportunity> }) => data)
  .handler(async ({ data }) => {
    opportunities = opportunities.map(o =>
      o.id === data.opportunityId ? { ...o, ...data.updates } : o
    );
    return opportunities.find(o => o.id === data.opportunityId) || null;
  });
