import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JobSite, SalesRep, Opportunity, OpportunityStage, OpportunityType, Filters, Activity, Note, NoteTag, SiteCompany, CompanyContact } from '@/types';
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
  addOpportunityToSite: (siteId: number, opportunityId: number) => void;
  createNewOpportunity: (opportunity: Opportunity) => void;
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
  setNoteTags: (tags: NoteTag[]) => void;
  getSalesRepName: (id: number) => string;
  getStageName: (id: number) => string;
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
    // If it's already a Note object, return as-is
    if (typeof note === 'object' && note.content) {
      return note as Note;
    }
    // Otherwise, migrate from string
    return {
      id: index + 1,
      content: String(note),
      createdAt: new Date().toISOString(),
      createdById: 313, // Default sales rep
      tagIds: [],
      attachments: [],
    };
  });
};

// Helper to migrate single companyContact to companyContacts array
const migrateSiteCompanies = (companies: any[]): SiteCompany[] => {
  if (!companies || companies.length === 0) return [];
  
  return companies.map(company => {
    // If already has companyContacts array, return as-is
    if (company.companyContacts && Array.isArray(company.companyContacts)) {
      return company as SiteCompany;
    }
    
    // Migrate from single companyContact to companyContacts array
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

  // Load data on mount
  useEffect(() => {
    // Migrate notes, activities, and siteCompanies on job sites
    const sitesWithMigratedData = jobSitesData.content.map(site => ({
      ...site,
      activities: (site as any).activities || [],
      notes: migrateNotes((site as any).notes || []),
      siteCompanies: migrateSiteCompanies((site as any).siteCompanies || []),
    })) as JobSite[];
    
    setJobSites(sitesWithMigratedData);
    setSalesReps(salesRepsData.content);
    setOpportunities(opportunitiesData.content);
    setOpportunityStages(opportunityStagesData.content);

    // Load note tags from localStorage
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

    // Load filters from localStorage
    const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  // Save note tags to localStorage
  const setNoteTags = (tags: NoteTag[]) => {
    setNoteTagsState(tags);
    localStorage.setItem(NOTE_TAGS_STORAGE_KEY, JSON.stringify(tags));
  };

  const getSalesRepName = (id: number): string => {
    const rep = salesReps.find(r => r.salesrepid === id);
    return rep ? `${rep.lastname}, ${rep.firstname}` : 'Unknown';
  };

  const getStageName = (id: number): string => {
    const stage = opportunityStages.find(s => s.stageid === id);
    return stage ? stage.stagename : 'Unknown';
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
      // Hide Completed filter
      if (filters.hideCompleted && site.statusId === 'Completed') {
        return false;
      }

      // Sales Rep filter
      if (filters.salesRepId && site.salesRepId !== parseInt(filters.salesRepId)) {
        return false;
      }

      // Status filter
      if (filters.status && site.statusId !== filters.status) {
        return false;
      }

      // Division filter - check first opportunity's divisionId
      if (filters.division) {
        const siteOpps = site.associatedOpportunities
          .map(ao => opportunities.find(o => o.id === ao.id))
          .filter(Boolean) as Opportunity[];
        
        const division = siteOpps.length > 0 ? siteOpps[0].divisionId : 'E';
        if (division !== filters.division) {
          return false;
        }
      }

      // General Contractor filter
      if (filters.generalContractor) {
        const hasMatchingGC = site.siteCompanies.some(
          company => 
            company.roleId === 'GC' && 
            company.companyName.toLowerCase().includes(filters.generalContractor.toLowerCase())
        );
        if (!hasMatchingGC) {
          return false;
        }
      }

      // PAR Status filter
      if (filters.showBehindPAR) {
        const oppCount = site.associatedOpportunities.length;
        if (oppCount >= site.plannedAnnualRate) {
          return false;
        }
      }

      return true;
    });
  };

  const getTotalPipelineRevenue = (): number => {
    const filteredSites = getFilteredSites();
    return filteredSites.reduce((total, site) => {
      return total + calculateSiteRevenue(site);
    }, 0);
  };

  const getRevenueByType = (): { typeId: number; typeName: string; revenue: number }[] => {
    const filteredSites = getFilteredSites();
    const revenueMap = new Map<number, number>();

    filteredSites.forEach(site => {
      site.associatedOpportunities.forEach(ao => {
        const opp = opportunities.find(o => o.id === ao.id);
        if (opp) {
          revenueMap.set(opp.typeId, (revenueMap.get(opp.typeId) || 0) + ao.revenue);
        }
      });
    });

    return Array.from(revenueMap.entries())
      .filter(([, revenue]) => revenue > 0)
      .map(([typeId, revenue]) => {
        const type = opportunityTypes.find(t => t.opptypeid === typeId);
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

  const addOpportunityToSite = (siteId: number, opportunityId: number) => {
    setJobSites(prevSites => 
      prevSites.map(site => {
        if (site.id === siteId) {
          const opp = opportunities.find(o => o.id === opportunityId);
          if (opp && !site.associatedOpportunities.find(ao => ao.id === opportunityId)) {
            return {
              ...site,
              associatedOpportunities: [
                ...site.associatedOpportunities,
                {
                  id: opp.id,
                  type: opp.typeId === 1 ? 'Sale' : 'Rental',
                  description: opp.description,
                  status: getStageName(opp.stageId),
                  revenue: opp.estimateRevenue,
                }
              ]
            };
          }
        }
        return site;
      })
    );
  };

  const createNewOpportunity = (opportunity: Opportunity) => {
    setOpportunities(prev => [...prev, opportunity]);
    
    // Also add to the associated job site
    setJobSites(prevSites => 
      prevSites.map(site => {
        if (site.id === opportunity.jobSiteId) {
          return {
            ...site,
            associatedOpportunities: [
              ...site.associatedOpportunities,
              {
                id: opportunity.id,
                type: opportunity.typeId === 1 ? 'Sale' : 'Rental',
                description: opportunity.description,
                status: getStageName(opportunity.stageId),
                revenue: opportunity.estimateRevenue,
              }
            ]
          };
        }
        return site;
      })
    );
  };

  const addSiteCompany = (siteId: number, company: any) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return {
            ...site,
            siteCompanies: [...site.siteCompanies, company]
          };
        }
        return site;
      })
    );
  };

  const removeSiteCompany = (siteId: number, companyName: string) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return {
            ...site,
            siteCompanies: site.siteCompanies.filter(c => c.companyName !== companyName)
          };
        }
        return site;
      })
    );
  };

  const updateSiteCompany = (siteId: number, oldCompanyName: string, updatedCompany: any) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return {
            ...site,
            siteCompanies: site.siteCompanies.map(c => 
              c.companyName === oldCompanyName ? updatedCompany : c
            )
          };
        }
        return site;
      })
    );
  };

  const updateJobSite = (siteId: number, updates: Partial<JobSite>) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return {
            ...site,
            ...updates
          };
        }
        return site;
      })
    );
  };

  const createJobSite = (site: Omit<JobSite, 'id'>) => {
    const newId = Math.max(...jobSites.map(s => s.id), 0) + 1;
    const newSite: JobSite = {
      ...site,
      id: newId
    };
    setJobSites(prevSites => [...prevSites, newSite]);
  };

  const addActivity = (siteId: number, activity: Omit<Activity, 'id'>) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          const maxActivityId = Math.max(...site.activities.map(a => a.id), 0);
          const newActivity: Activity = {
            ...activity,
            id: maxActivityId + 1
          };
          return {
            ...site,
            activities: [...site.activities, newActivity]
          };
        }
        return site;
      })
    );
  };

  const updateActivity = (siteId: number, activityId: number, updates: Partial<Activity>) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return {
            ...site,
            activities: site.activities.map(activity =>
              activity.id === activityId ? { ...activity, ...updates } : activity
            )
          };
        }
        return site;
      })
    );
  };

  const deleteActivity = (siteId: number, activityId: number) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return {
            ...site,
            activities: site.activities.filter(activity => activity.id !== activityId)
          };
        }
        return site;
      })
    );
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
            createdById: site.salesRepId, // Use site's sales rep as default creator
          };
          return {
            ...site,
            notes: [...(site.notes || []), newNote]
          };
        }
        return site;
      })
    );
  };

  const updateNote = (siteId: number, noteId: number, updates: Partial<Note>) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return {
            ...site,
            notes: (site.notes || []).map(note =>
              note.id === noteId ? { ...note, ...updates } : note
            )
          };
        }
        return site;
      })
    );
  };

  const deleteNote = (siteId: number, noteId: number) => {
    setJobSites(prevSites =>
      prevSites.map(site => {
        if (site.id === siteId) {
          return {
            ...site,
            notes: (site.notes || []).filter(note => note.id !== noteId)
          };
        }
        return site;
      })
    );
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
        addOpportunityToSite,
        createNewOpportunity,
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
        setNoteTags,
        getSalesRepName,
        getStageName,
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
