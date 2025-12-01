import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JobSite, SalesRep, Opportunity, OpportunityStage, Filters } from '@/types';
import jobSitesData from '@/data/JobSite.json';
import salesRepsData from '@/data/SalesReps.json';
import opportunitiesData from '@/data/Opportunity.json';
import opportunityStagesData from '@/data/OpportunityStages.json';

interface DataContextType {
  jobSites: JobSite[];
  salesReps: SalesRep[];
  opportunities: Opportunity[];
  opportunityStages: OpportunityStage[];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  addOpportunityToSite: (siteId: number, opportunityId: number) => void;
  createNewOpportunity: (opportunity: Opportunity) => void;
  createJobSite: (site: Omit<JobSite, 'id'>) => void;
  addSiteCompany: (siteId: number, company: any) => void;
  removeSiteCompany: (siteId: number, companyName: string) => void;
  updateJobSite: (siteId: number, updates: Partial<JobSite>) => void;
  getSalesRepName: (id: number) => string;
  getStageName: (id: number) => string;
  calculateSiteRevenue: (site: JobSite) => number;
  getFilteredSites: () => JobSite[];
  getTotalPipelineRevenue: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const FILTERS_STORAGE_KEY = 'crm-filters';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunityStages, setOpportunityStages] = useState<OpportunityStage[]>([]);
  const [filters, setFilters] = useState<Filters>({
    salesRepId: '',
    division: '',
    generalContractor: '',
    showBehindPAR: false,
    status: '',
  });

  // Load data on mount
  useEffect(() => {
    setJobSites(jobSitesData.content);
    setSalesReps(salesRepsData.content);
    setOpportunities(opportunitiesData.content);
    setOpportunityStages(opportunityStagesData.content);

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

  const getSalesRepName = (id: number): string => {
    const rep = salesReps.find(r => r.salesrepid === id);
    return rep ? `${rep.lastname}, ${rep.firstname}` : 'Unknown';
  };

  const getStageName = (id: number): string => {
    const stage = opportunityStages.find(s => s.stageid === id);
    return stage ? stage.stagename : 'Unknown';
  };

  const calculateSiteRevenue = (site: JobSite): number => {
    return site.associatedOpportunities.reduce((sum, opp) => sum + opp.revenue, 0);
  };

  const getFilteredSites = (): JobSite[] => {
    return jobSites.filter(site => {
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

  return (
    <DataContext.Provider
      value={{
        jobSites,
        salesReps,
        opportunities,
        opportunityStages,
        filters,
        setFilters,
        addOpportunityToSite,
        createNewOpportunity,
        createJobSite,
        addSiteCompany,
        removeSiteCompany,
        updateJobSite,
        getSalesRepName,
        getStageName,
        calculateSiteRevenue,
        getFilteredSites,
        getTotalPipelineRevenue,
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
