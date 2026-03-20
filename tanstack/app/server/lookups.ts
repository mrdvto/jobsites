import { createServerFn } from '@tanstack/react-start';
import type { SalesRep, User, OpportunityStage, OpportunityType, LookupOption, NoteTag } from '@/types';

import salesRepsData from '@/data/SalesReps.json';
import usersData from '@/data/Users.json';
import opportunityStagesData from '@/data/OpportunityStages.json';
import opportunityTypesData from '@/data/OpportunityTypes.json';
import lookupsData from '@/data/Lookups.json';

// In-memory state (ephemeral — resets on server restart)
let salesReps: SalesRep[] = salesRepsData.content as unknown as SalesRep[];
let users: User[] = usersData.content as User[];
let stages: OpportunityStage[] = opportunityStagesData.content as unknown as OpportunityStage[];
let types: OpportunityType[] = opportunityTypesData.content as unknown as OpportunityType[];

let primaryStages: LookupOption[] = lookupsData.primaryStages as LookupOption[];
let primaryProjectTypes: LookupOption[] = lookupsData.primaryProjectTypes as LookupOption[];
let ownershipTypes: LookupOption[] = lookupsData.ownershipTypes as LookupOption[];
let uomTypes: LookupOption[] = (lookupsData as any).uomTypes || [];

const defaultNoteTags: NoteTag[] = [
  { id: 'SAFETY', label: 'Safety', displayOrder: 1, color: 'red' },
  { id: 'SECURITY', label: 'Security', displayOrder: 2, color: 'amber' },
  { id: 'COMPLIANCE', label: 'Compliance', displayOrder: 3, color: 'sky' },
  { id: 'GENERAL', label: 'General', displayOrder: 4, color: 'slate' },
];
let noteTags: NoteTag[] = [...defaultNoteTags];

// --- Read functions ---

export const getSalesReps = createServerFn({ method: 'GET' }).handler(async () => {
  return salesReps;
});

export const getUsers = createServerFn({ method: 'GET' }).handler(async () => {
  return users;
});

export const getOpportunityStages = createServerFn({ method: 'GET' }).handler(async () => {
  return stages;
});

export const getOpportunityTypes = createServerFn({ method: 'GET' }).handler(async () => {
  return types;
});

export const getLookups = createServerFn({ method: 'GET' }).handler(async () => {
  return { primaryStages, primaryProjectTypes, ownershipTypes, uomTypes };
});

export const getNoteTags = createServerFn({ method: 'GET' }).handler(async () => {
  return noteTags;
});

// --- Write functions ---

export const updateLookups = createServerFn({ method: 'POST' })
  .inputValidator((data: { primaryStages?: LookupOption[]; primaryProjectTypes?: LookupOption[]; ownershipTypes?: LookupOption[] }) => data)
  .handler(async ({ data }) => {
    if (data.primaryStages) primaryStages = data.primaryStages;
    if (data.primaryProjectTypes) primaryProjectTypes = data.primaryProjectTypes;
    if (data.ownershipTypes) ownershipTypes = data.ownershipTypes;
    return { primaryStages, primaryProjectTypes, ownershipTypes, uomTypes };
  });

export const updateNoteTags = createServerFn({ method: 'POST' })
  .inputValidator((data: { tags: NoteTag[] }) => data)
  .handler(async ({ data }) => {
    noteTags = data.tags;
    return noteTags;
  });
