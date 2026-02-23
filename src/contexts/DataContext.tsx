import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { JobSite, SalesRep, Opportunity, OpportunityStage, OpportunityType, Filters, Activity, Note, NoteTag, SiteCompany, CompanyContact, CustomerEquipment, ChangeLogEntry } from '@/types';
import jobSitesData from '@/data/JobSite.json';
import salesRepsData from '@/data/SalesReps.json';
import opportunitiesData from '@/data/Opportunity.json';
import opportunityStagesData from '@/data/OpportunityStages.json';
import opportunityTypesData from '@/data/OpportunityTypes.json';

// Division constants
export const DIVISIONS = [
  { code: 'G', name: 'General Line' },
  { code: 'C', name: 'Compact' },
  { code: 'P', name: 'Paving' },
  { code: 'R', name: 'Heavy Rents' },
  { code: 'S', name: 'Power Systems' },
  { code: 'V', name: 'Rental Services' },
  { code: 'X', name: 'Power Rental' },
] as const;

export const getDivisionName = (code: string): string => {
  const division = DIVISIONS.find(d => d.code === code);
  return division ? division.name : code;
};

interface DataContextType {
  jobSites: JobSite[];
  salesReps: SalesRep[];
  opportunities: Opportunity[];
  opportunityStages: OpportunityStage[];
  noteTags: NoteTag[];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  currentUserId: number;
  setCurrentUserId: (id: number) => void;
  getChangeLog: (siteId: number) => ChangeLogEntry[];
  addOpportunityToSite: (siteId: number, opportunityId: number) => void;
  createNewOpportunity: (opportunity: Opportunity) => void;
  updateOpportunity: (opportunityId: number, updates: Partial<Opportunity>) => void;
  createJobSite: (site: Omit<JobSite, 'id'>) => void;
  addSiteCompany: (siteId: number, company: Omit<SiteCompany, 'companyContacts' | 'primaryContactIndex'> & { companyContacts?: CompanyContact[], companyContact?: { name: string; title: string; phone: string; email: string } }) => void;
  removeSiteCompany: (siteId: number, companyName: string) => void;
  updateSiteCompany: (siteId: number, oldCompanyName: string, updatedCompany: SiteCompany) => void;
  updateJobSite: (siteId: number, updates: Partial<JobSite>) => void;
  addActivity: (siteId: number, activity: Omit<Activity, 'id'>) => void;
  updateActivity: (siteId: number, activityId: number, updates: Partial<Activity>) => void;
  deleteActivity: (siteId: number, activityId: number) => void;
  addNote: (siteId: number, noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>) => void;
  updateNote: (siteId: number, noteId: number, updates: Partial<Note>) => void;
  deleteNote: (siteId: number, noteId: number) => void;
  addCustomerEquipment: (siteId: number, equipment: Omit<CustomerEquipment, 'id'>) => void;
  updateCustomerEquipment: (siteId: number, equipmentId: number, updates: Partial<CustomerEquipment>) => void;
  deleteCustomerEquipment: (siteId: number, equipmentId: number) => void;
  setNoteTags: (tags: NoteTag[]) => void;
  getSalesRepName: (id: number) => string;
  getSalesRepNames: (ids: number[]) => string;
  getStageName: (id: number) => string;
  getStage: (id: number) => OpportunityStage | undefined;
  getTypeName: (typeId: number) => string;
  calculateSiteRevenue: (site: JobSite) => number;
  getFilteredSites: () => JobSite[];
  getTotalPipelineRevenue: () => number;
  getRevenueByType: () => { typeId: number; typeName: string; revenue: number }[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const FILTERS_STORAGE_KEY = 'crm-filters';
const NOTE_TAGS_STORAGE_KEY = 'crm-note-tags';

// Default note tags
const defaultNoteTags: NoteTag[] = [
  { id: 'SAFETY', label: 'Safety', displayOrder: 1, color: 'red' },
  { id: 'SECURITY', label: 'Security', displayOrder: 2, color: 'amber' },
  { id: 'COMPLIANCE', label: 'Compliance', displayOrder: 3, color: 'sky' },
  { id: 'GENERAL', label: 'General', displayOrder: 4, color: 'slate' },
];

// Helper to migrate old string notes to new Note structure
const migrateNotes = (notes: any[]): Note[] => {
  if (!notes || notes.length === 0) return [];
  
  return notes.map((note, index) => {
    if (typeof note === 'object' && note.content) {
      return note as Note;
    }
    return {
      id: index + 1,
      content: String(note),
      createdAt: new Date().toISOString(),
      createdById: 313,
      tagIds: [],
      attachments: [],
    };
  });
};

// Helper to migrate single companyContact to companyContacts array
const migrateSiteCompanies = (companies: any[]): SiteCompany[] => {
  if (!companies || companies.length === 0) return [];
  
  return companies.map(company => {
    if (company.companyContacts && Array.isArray(company.companyContacts)) {
      return company as SiteCompany;
    }
    
    const contacts: CompanyContact[] = [];
    if (company.companyContact) {
      contacts.push({
        id: 1,
        name: company.companyContact.name,
        title: company.companyContact.title || undefined,
        phone: company.companyContact.phone || '',
        email: company.companyContact.email || '',
      });
    }
    
    return {
      companyId: company.companyId,
      companyName: company.companyName,
      roleId: company.roleId,
      roleDescription: company.roleDescription,
      isPrimaryContact: company.isPrimaryContact,
      companyContacts: contacts,
      primaryContactIndex: 0,
    } as SiteCompany;
  });
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunityStages, setOpportunityStages] = useState<OpportunityStage[]>([]);
  const [opportunityTypes] = useState<OpportunityType[]>(opportunityTypesData.content as OpportunityType[]);
  const [noteTags, setNoteTagsState] = useState<NoteTag[]>([]);
  const [filters, setFilters] = useState<Filters>({
    salesRepId: '',
    division: '',
    generalContractor: '',
    showBehindPAR: false,
    status: '',
    hideCompleted: true,
  });

  // Current user and change log
  const [currentUserId, setCurrentUserId] = useState<number>(313);

  // Seed example change log entries
  const seedChangeLog: ChangeLogEntry[] = [
    { id: 1, siteId: 500101, timestamp: '2025-11-02T09:15:00Z', action: 'SITE_CREATED', category: 'Site', summary: 'Job site "Highway 50 Expansion" created', changedById: 313 },
    { id: 2, siteId: 500101, timestamp: '2025-11-03T14:22:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Walsh Construction" added as General Contractor', changedById: 313 },
    { id: 3, siteId: 500101, timestamp: '2025-11-05T10:45:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "D6 Dozer rental for clearing phase" created', changedById: 260 },
    { id: 4, siteId: 500101, timestamp: '2025-11-08T16:30:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "Caterpillar 320F" added', changedById: 260 },
    { id: 5, siteId: 500101, timestamp: '2025-11-12T08:10:00Z', action: 'NOTE_ADDED', category: 'Note', summary: 'Note added', changedById: 313 },
    { id: 6, siteId: 500101, timestamp: '2025-11-15T11:05:00Z', action: 'SITE_UPDATED', category: 'Site', summary: 'Site details updated (statusId)', changedById: 292, details: { field: 'statusId', from: 'Planning', to: 'Active' } },
    { id: 7, siteId: 500101, timestamp: '2025-11-18T13:40:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Site Visit" added', changedById: 260 },
    { id: 8, siteId: 500101, timestamp: '2025-11-22T09:55:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Rosendin Electric" added as Subcontractor - Electrical', changedById: 313 },
    { id: 9, siteId: 500101, timestamp: '2025-12-01T15:20:00Z', action: 'OPPORTUNITY_UPDATED', category: 'Opportunity', summary: 'Opportunity "D6 Dozer rental for clearing phase" updated (stageId, estimateRevenue)', changedById: 292, details: { stageId: { from: 2, to: 4 }, estimateRevenue: { from: 45000, to: 52000 } } },
    { id: 10, siteId: 500101, timestamp: '2025-12-05T10:30:00Z', action: 'EQUIPMENT_DELETED', category: 'Equipment', summary: 'Equipment "Komatsu PC210" removed', changedById: 260 },
    { id: 11, siteId: 500101, timestamp: '2025-12-10T14:15:00Z', action: 'COMPANY_REMOVED', category: 'Company', summary: 'Company "Rosendin Electric" disassociated', changedById: 313 },
    { id: 12, siteId: 500101, timestamp: '2025-12-15T08:45:00Z', action: 'NOTE_UPDATED', category: 'Note', summary: 'Note updated', changedById: 292 },

    { id: 13, siteId: 500102, timestamp: '2025-10-20T09:00:00Z', action: 'SITE_CREATED', category: 'Site', summary: 'Job site "Metro Line Extension" created', changedById: 262 },
    { id: 14, siteId: 500102, timestamp: '2025-10-25T11:30:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Turner Construction" added as Subcontractor - Steel', changedById: 262 },
    { id: 15, siteId: 500102, timestamp: '2025-11-01T14:00:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Excavator fleet for foundation work" created', changedById: 303 },
    { id: 16, siteId: 500102, timestamp: '2025-11-10T16:20:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Phone Call" added', changedById: 262 },
    { id: 17, siteId: 500102, timestamp: '2025-11-20T10:10:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "Volvo EC220E" added', changedById: 303 },
    { id: 18, siteId: 500102, timestamp: '2025-12-02T13:45:00Z', action: 'SITE_UPDATED', category: 'Site', summary: 'Site details updated (description, plannedAnnualRate)', changedById: 262 },

    { id: 19, siteId: 500103, timestamp: '2025-09-15T08:30:00Z', action: 'SITE_CREATED', category: 'Site', summary: 'Job site "Riverside Commercial Park" created', changedById: 304 },
    { id: 20, siteId: 500103, timestamp: '2025-09-20T12:00:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Paving equipment package" created', changedById: 304 },
    { id: 21, siteId: 500103, timestamp: '2025-10-05T09:15:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Curran Contracting" added as Subcontractor - Paving', changedById: 305 },
    { id: 22, siteId: 500103, timestamp: '2025-10-15T15:30:00Z', action: 'NOTE_ADDED', category: 'Note', summary: 'Note added', changedById: 304 },
    { id: 23, siteId: 500103, timestamp: '2025-11-01T10:45:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "Case SV340B" added', changedById: 305 },
    { id: 24, siteId: 500103, timestamp: '2025-11-20T14:00:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Email" added', changedById: 304 },

    { id: 25, siteId: 500104, timestamp: '2025-10-01T08:00:00Z', action: 'SITE_CREATED', category: 'Site', summary: 'Job site created', changedById: 292 },
    { id: 26, siteId: 500104, timestamp: '2025-10-10T11:20:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Generator rental for temp power" created', changedById: 292 },
    { id: 27, siteId: 500104, timestamp: '2025-10-18T14:30:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company added as General Contractor', changedById: 292 },
    { id: 28, siteId: 500104, timestamp: '2025-11-05T09:00:00Z', action: 'SITE_UPDATED', category: 'Site', summary: 'Site details updated (statusId)', changedById: 313, details: { field: 'statusId', from: 'Planning', to: 'Active' } },

    { id: 29, siteId: 500105, timestamp: '2025-08-20T10:00:00Z', action: 'SITE_CREATED', category: 'Site', summary: 'Job site created', changedById: 305 },
    { id: 30, siteId: 500105, timestamp: '2025-09-01T13:15:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Rosendin Electric" added as Subcontractor - Electrical', changedById: 305 },
    { id: 31, siteId: 500105, timestamp: '2025-09-15T16:45:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Boom lift rental" created', changedById: 262 },
    { id: 32, siteId: 500105, timestamp: '2025-10-01T08:30:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "JLG 800S" added', changedById: 305 },
    { id: 33, siteId: 500105, timestamp: '2025-10-20T11:00:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Site Inspection" added', changedById: 262 },
    { id: 34, siteId: 500105, timestamp: '2025-11-10T14:30:00Z', action: 'NOTE_ADDED', category: 'Note', summary: 'Note added', changedById: 305 },
  ];

  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>(seedChangeLog);
  const nextLogId = useRef(seedChangeLog.length + 1);
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

  const logChange = useCallback((
    siteId: number,
    action: string,
    category: ChangeLogEntry['category'],
    summary: string,
    details?: Record<string, any>
  ) => {
    const entry: ChangeLogEntry = {
      id: nextLogId.current++,
      siteId,
      timestamp: new Date().toISOString(),
      action,
      category,
      summary,
      changedById: currentUserIdRef.current,
      details,
    };
    setChangeLog(prev => [...prev, entry]);
  }, []);

  const getChangeLog = useCallback((siteId: number): ChangeLogEntry[] => {
    return changeLog.filter(e => e.siteId === siteId);
  }, [changeLog]);

  // Load data on mount
  useEffect(() => {
    const sitesWithMigratedData = jobSitesData.content.map(site => ({
      ...site,
      activities: (site as any).activities || [],
      notes: migrateNotes((site as any).notes || []),
      siteCompanies: migrateSiteCompanies((site as any).siteCompanies || []),
      customerEquipment: (site as any).customerEquipment || [],
    })) as JobSite[];
    
    setJobSites(sitesWithMigratedData);
    setSalesReps(salesRepsData.content);
    setOpportunities(opportunitiesData.content);
    setOpportunityStages(opportunityStagesData.content);

    const savedNoteTags = localStorage.getItem(NOTE_TAGS_STORAGE_KEY);
    if (savedNoteTags) {
      try {
        setNoteTagsState(JSON.parse(savedNoteTags));
      } catch (e) {
        setNoteTagsState(defaultNoteTags);
      }
    } else {
      setNoteTagsState(defaultNoteTags);
    }

    const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const setNoteTags = (tags: NoteTag[]) => {
    setNoteTagsState(tags);
    localStorage.setItem(NOTE_TAGS_STORAGE_KEY, JSON.stringify(tags));
  };

  const getSalesRepName = (id: number): string => {
    const rep = salesReps.find(r => r.salesrepid === id);
    return rep ? `${rep.lastname}, ${rep.firstname}` : 'Unknown';
  };

  const getSalesRepNames = (ids: number[]): string => {
    return ids.map(id => getSalesRepName(id)).join('; ');
  };

  const getStageName = (id: number): string => {
    const stage = opportunityStages.find(s => s.stageid === id);
    return stage ? stage.stagename : 'Unknown';
  };

  const getStage = (id: number): OpportunityStage | undefined => {
    return opportunityStages.find(s => s.stageid === id);
  };

  const getTypeName = (typeId: number): string => {
    const type = opportunityTypes.find(t => t.opptypeid === typeId);
    return type ? type.opptypedesc : 'Unknown';
  };

  const calculateSiteRevenue = (site: JobSite): number => {
    return site.associatedOpportunities.reduce((sum, opp) => sum + opp.revenue, 0);
  };

  const getFilteredSites = (): JobSite[] => {
    return jobSites.filter(site => {
      if (filters.hideCompleted && site.statusId === 'Completed') return false;
      if (filters.salesRepId && !site.salesRepIds.includes(parseInt(filters.salesRepId))) return false;
      if (filters.status && site.statusId !== filters.status) return false;
      if (filters.division) {
        const siteOpps = site.associatedOpportunities
          .map(ao => opportunities.find(o => o.id === ao.id))
          .filter(Boolean) as Opportunity[];
        const division = siteOpps.length > 0 ? siteOpps[0].divisionId : 'E';
        if (division !== filters.division) return false;
      }
      if (filters.generalContractor) {
        const hasMatchingGC = site.siteCompanies.some(
          company => company.roleId === 'GC' && company.companyName.toLowerCase().includes(filters.generalContractor.toLowerCase())
        );
        if (!hasMatchingGC) return false;
      }
      if (filters.showBehindPAR) {
        const oppCount = site.associatedOpportunities.length;
        if (oppCount >= site.plannedAnnualRate) return false;
      }
      return true;
    });
  };

  const getTotalPipelineRevenue = (): number => {
    const filteredSites = getFilteredSites();
    return filteredSites.reduce((total, site) => total + calculateSiteRevenue(site), 0);
  };

  const getRevenueByType = (): { typeId: number; typeName: string; revenue: number }[] => {
    const filteredSites = getFilteredSites();
    const revenueMap = new Map<number, number>();
    filteredSites.forEach(site => {
      site.associatedOpportunities.forEach(ao => {
        const opp = opportunities.find(o => o.id === ao.id);
        if (opp) revenueMap.set(opp.typeId, (revenueMap.get(opp.typeId) || 0) + ao.revenue);
      });
    });
    return Array.from(revenueMap.entries())
      .filter(([, revenue]) => revenue > 0)
      .map(([typeId, revenue]) => {
        const type = opportunityTypes.find(t => t.opptypeid === typeId);
        return { typeId, typeName: type ? type.opptypedesc : 'Unknown', revenue, displayOrder: type ? type.displayorder : 999 };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(({ typeId, typeName, revenue }) => ({ typeId, typeName, revenue }));
  };

  const addOpportunityToSite = (siteId: number, opportunityId: number) => {
    const opp = opportunities.find(o => o.id === opportunityId);
    setJobSites(prevSites => 
      prevSites.map(site => {
        if (site.id === siteId) {
          if (opp && !site.associatedOpportunities.find(ao => ao.id === opportunityId)) {
            return {
              ...site,
              associatedOpportunities: [
                ...site.associatedOpportunities,
                { id: opp.id, type: opp.typeId === 1 ? 'Sale' : 'Rental', description: opp.description, stageId: opp.stageId, revenue: opp.estimateRevenue }
              ]
            };
          }
        }
        return site;
      })
    );
    if (opp) logChange(siteId, 'OPPORTUNITY_ASSOCIATED', 'Opportunity', `Opportunity "${opp.description}" associated`);
  };

  const createNewOpportunity = (opportunity: Opportunity) => {
    setOpportunities(prev => [...prev, opportunity]);
    setJobSites(prevSites => 
      prevSites.map(site => {
        if (site.id === opportunity.jobSiteId) {
          return {
            ...site,
            associatedOpportunities: [
              ...site.associatedOpportunities,
              { id: opportunity.id, type: opportunity.typeId === 1 ? 'Sale' : 'Rental', description: opportunity.description, stageId: opportunity.stageId, revenue: opportunity.estimateRevenue }
            ]
          };
        }
        return site;
      })
    );
    logChange(opportunity.jobSiteId, 'OPPORTUNITY_CREATED', 'Opportunity', `Opportunity "${opportunity.description}" created`);
  };

  const updateOpportunity = (opportunityId: number, updates: Partial<Opportunity>) => {
    const existing = opportunities.find(o => o.id === opportunityId);
    setOpportunities(prev => prev.map(opp => opp.id === opportunityId ? { ...opp, ...updates } : opp));
    if (existing) {
      const changedFields = Object.keys(updates).filter(k => (updates as any)[k] !== (existing as any)[k]);
      logChange(existing.jobSiteId, 'OPPORTUNITY_UPDATED', 'Opportunity', `Opportunity "${existing.description}" updated (${changedFields.join(', ')})`);
    }
  };

  const addSiteCompany = (siteId: number, company: any) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return { ...site, siteCompanies: [...site.siteCompanies, company] };
        }
        return site;
      })
    );
    logChange(siteId, 'COMPANY_ADDED', 'Company', `Company "${company.companyName}" added as ${company.roleDescription || company.roleId}`);
  };

  const removeSiteCompany = (siteId: number, companyName: string) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return { ...site, siteCompanies: site.siteCompanies.filter(c => c.companyName !== companyName) };
        }
        return site;
      })
    );
    logChange(siteId, 'COMPANY_REMOVED', 'Company', `Company "${companyName}" disassociated`);
  };

  const updateSiteCompany = (siteId: number, oldCompanyName: string, updatedCompany: any) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return { ...site, siteCompanies: site.siteCompanies.map(c => c.companyName === oldCompanyName ? updatedCompany : c) };
        }
        return site;
      })
    );
    logChange(siteId, 'COMPANY_UPDATED', 'Company', `Company "${updatedCompany.companyName}" updated`);
  };

  const updateJobSite = (siteId: number, updates: Partial<JobSite>) => {
    setJobSites(prevSites => {
      const existing = prevSites.find(s => s.id === siteId);
      if (existing) {
        const changedFields = Object.keys(updates).filter(k => JSON.stringify((updates as any)[k]) !== JSON.stringify((existing as any)[k]));
        if (changedFields.length > 0) {
          logChange(siteId, 'SITE_UPDATED', 'Site', `Site details updated (${changedFields.join(', ')})`);
        }
      }
      return prevSites.map(site => site.id === siteId ? { ...site, ...updates } : site);
    });
  };

  const createJobSite = (site: Omit<JobSite, 'id'>) => {
    const newId = Math.max(...jobSites.map(s => s.id), 0) + 1;
    const newSite: JobSite = { ...site, id: newId };
    setJobSites(prevSites => [...prevSites, newSite]);
    logChange(newId, 'SITE_CREATED', 'Site', `Job site "${site.name}" created`);
  };

  const addActivity = (siteId: number, activity: Omit<Activity, 'id'>) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          const maxActivityId = Math.max(...site.activities.map(a => a.id), 0);
          const newActivity: Activity = { ...activity, id: maxActivityId + 1 };
          return { ...site, activities: [...site.activities, newActivity] };
        }
        return site;
      })
    );
    logChange(siteId, 'ACTIVITY_ADDED', 'Activity', `Activity "${activity.activityType}" added`);
  };

  const updateActivity = (siteId: number, activityId: number, updates: Partial<Activity>) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return { ...site, activities: site.activities.map(a => a.id === activityId ? { ...a, ...updates } : a) };
        }
        return site;
      })
    );
    logChange(siteId, 'ACTIVITY_UPDATED', 'Activity', `Activity updated`);
  };

  const deleteActivity = (siteId: number, activityId: number) => {
    let desc = '';
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          const act = site.activities.find(a => a.id === activityId);
          if (act) desc = act.activityType;
          return { ...site, activities: site.activities.filter(a => a.id !== activityId) };
        }
        return site;
      })
    );
    logChange(siteId, 'ACTIVITY_DELETED', 'Activity', `Activity "${desc}" deleted`);
  };

  const addNote = (siteId: number, noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          const maxNoteId = Math.max(...(site.notes || []).map(n => n.id), 0);
          const newNote: Note = {
            ...noteData,
            id: maxNoteId + 1,
            createdAt: new Date().toISOString(),
            createdById: currentUserIdRef.current,
          };
          return { ...site, notes: [...(site.notes || []), newNote] };
        }
        return site;
      })
    );
    logChange(siteId, 'NOTE_ADDED', 'Note', `Note added`);
  };

  const updateNote = (siteId: number, noteId: number, updates: Partial<Note>) => {
    const now = new Date().toISOString();
    const userId = currentUserIdRef.current;

    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return {
            ...site,
            notes: (site.notes || []).map(note => {
              if (note.id !== noteId) return note;

              // Build summary of what changed
              const changes: string[] = [];
              if (updates.content !== undefined && updates.content !== note.content) changes.push('Content updated');
              if (updates.tagIds !== undefined && JSON.stringify(updates.tagIds) !== JSON.stringify(note.tagIds)) changes.push('Tags changed');
              if (updates.attachments !== undefined && JSON.stringify(updates.attachments) !== JSON.stringify(note.attachments)) changes.push('Attachments changed');
              const summary = changes.length > 0 ? changes.join(', ') : 'Note updated';

              const modification = { modifiedAt: now, modifiedById: userId, summary };
              const history = [...(note.modificationHistory || []), modification];

              return {
                ...note,
                ...updates,
                lastModifiedAt: now,
                lastModifiedById: userId,
                modificationHistory: history,
              };
            }),
          };
        }
        return site;
      })
    );
    logChange(siteId, 'NOTE_UPDATED', 'Note', `Note updated`);
  };

  const deleteNote = (siteId: number, noteId: number) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return { ...site, notes: (site.notes || []).filter(note => note.id !== noteId) };
        }
        return site;
      })
    );
    logChange(siteId, 'NOTE_DELETED', 'Note', `Note deleted`);
  };

  const addCustomerEquipment = (siteId: number, equipment: Omit<CustomerEquipment, 'id'>) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          const maxId = Math.max(...(site.customerEquipment || []).map(e => e.id), 0);
          return { ...site, customerEquipment: [...(site.customerEquipment || []), { ...equipment, id: maxId + 1 }] };
        }
        return site;
      })
    );
    logChange(siteId, 'EQUIPMENT_ADDED', 'Equipment', `Equipment "${equipment.make} ${equipment.model}" added`);
  };

  const updateCustomerEquipment = (siteId: number, equipmentId: number, updates: Partial<CustomerEquipment>) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return { ...site, customerEquipment: (site.customerEquipment || []).map(e => e.id === equipmentId ? { ...e, ...updates } : e) };
        }
        return site;
      })
    );
    logChange(siteId, 'EQUIPMENT_UPDATED', 'Equipment', `Equipment updated`);
  };

  const deleteCustomerEquipment = (siteId: number, equipmentId: number) => {
    let desc = '';
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          const eq = (site.customerEquipment || []).find(e => e.id === equipmentId);
          if (eq) desc = `${eq.make} ${eq.model}`;
          return { ...site, customerEquipment: (site.customerEquipment || []).filter(e => e.id !== equipmentId) };
        }
        return site;
      })
    );
    logChange(siteId, 'EQUIPMENT_DELETED', 'Equipment', `Equipment "${desc}" removed`);
  };

  return (
    <DataContext.Provider
      value={{
        jobSites,
        salesReps,
        opportunities,
        opportunityStages,
        noteTags,
        filters,
        setFilters,
        currentUserId,
        setCurrentUserId,
        getChangeLog,
        addOpportunityToSite,
        createNewOpportunity,
        updateOpportunity,
        createJobSite,
        addSiteCompany,
        removeSiteCompany,
        updateSiteCompany,
        updateJobSite,
        addActivity,
        updateActivity,
        deleteActivity,
        addNote,
        updateNote,
        deleteNote,
        addCustomerEquipment,
        updateCustomerEquipment,
        deleteCustomerEquipment,
        setNoteTags,
        getSalesRepName,
        getSalesRepNames,
        getStageName,
        getStage,
        getTypeName,
        calculateSiteRevenue,
        getFilteredSites,
        getTotalPipelineRevenue,
        getRevenueByType,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
