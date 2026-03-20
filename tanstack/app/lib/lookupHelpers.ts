import type { SalesRep, User, OpportunityStage, OpportunityType, LookupOption } from '@/types';

export const getSalesRepName = (reps: SalesRep[], id: number): string => {
  const rep = reps.find(r => r.salesrepid === id);
  return rep ? `${rep.lastname}, ${rep.firstname}` : 'Unknown';
};

export const getSalesRepNames = (reps: SalesRep[], ids: number[]): string => {
  return ids.map(id => getSalesRepName(reps, id)).join('; ');
};

export const getUserName = (users: User[], id: number): string => {
  const user = users.find(u => u.id === id);
  return user ? `${user.lastName}, ${user.firstName}` : 'Unknown';
};

export const getUserNames = (users: User[], ids: number[]): string => {
  return ids.map(id => getUserName(users, id)).join('; ');
};

export const getStageName = (stages: OpportunityStage[], id: number): string => {
  const stage = stages.find(s => s.stageid === id);
  return stage ? stage.stagename : 'Unknown';
};

export const getStage = (stages: OpportunityStage[], id: number): OpportunityStage | undefined => {
  return stages.find(s => s.stageid === id);
};

export const getTypeName = (types: OpportunityType[], typeId: number): string => {
  const type = types.find(t => t.opptypeid === typeId);
  return type ? type.opptypedesc : 'Unknown';
};

export const getLookupLabel = (
  options: LookupOption[],
  id: string
): string => {
  return options.find(item => item.id === id)?.label || id;
};
