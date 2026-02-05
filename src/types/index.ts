// Type definitions for CRM data structures

export interface Activity {
  id: number;
  assigneeId: number;
  activityType: string;
  date: string;
  description: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Note {
  id: number;
  content: string;
  createdAt: string;
  createdById: number;
  tagIds: string[];
  attachments: Attachment[];
}

export interface NoteTag {
  id: string;
  label: string;
  displayOrder: number;
  color: string;
}

export interface JobSite {
  id: number;
  name: string;
  description: string;
  statusId: string;
  salesRepId: number;
  plannedAnnualRate: number;
  parStartDate?: string;
  projectPrimaryContact: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  siteCompanies: Array<{
    companyId: string;
    companyName: string;
    roleId: string;
    roleDescription: string;
    isPrimaryContact: boolean;
    companyContact: {
      name: string;
      title: string;
      phone: string;
      email: string;
    };
  }>;
  associatedOpportunities: Array<{
    id: number;
    type: string;
    description: string;
    status: string;
    revenue: number;
  }>;
  notes: Note[];
  activities: Activity[];
}

export interface SalesRep {
  salesrepid: number;
  firstname: string;
  lastname: string;
  email: string | null;
}

export interface Opportunity {
  id: number;
  estimateDeliveryMonth?: number;
  isUrgent: boolean;
  typeId: number;
  probabilityOfClosingId: string | number;
  estimateDeliveryYear?: number;
  stageId: number;
  phaseId: number;
  stageIdEnteredAt: number;
  jobSiteId: number;
  salesRepId: number;
  ownerUserId: number;
  originatorUserId: number;
  sourceId: number;
  campaignId: number;
  classificationId: string;
  cmCaseId: string;
  estimateRevenue: number;
  enterDate: string;
  changeDate: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerZipCode: string;
  customerState: string;
  principalWorkCodeId: string;
  externalReferenceNumber: string;
  branchId: number;
  olgaOpportunityId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  industryCodeId: string;
  workOrderId: string;
  customerCountry: string;
  divisionId: string;
  PSETypeId: number;
  additionalSourceIds: number[];
  productGroups?: Array<{
    statusId: number;
    id: number;
    order: number;
    products: Array<{
      partCategoryId: number;
      rentDurationTypeId: number;
      isPrimary: boolean;
      quantity: number;
      id: number;
      rentDuration: number;
      familyId: number;
      age: number;
      hours: number;
      unitPrice: number;
      description: string;
      makeId: string;
      baseModelId: string;
      stockNumber: string;
    }>;
  }>;
}

export interface OpportunityStage {
  stageid: number;
  stagename: string;
  languageid: number;
  phaseid: number;
  displayorder: number;
  psopportunitydisplayorder: number;
  DisplayStageName: string;
  phase: string;
  marketingprobability: number | null;
  salesprobability: number | null;
  oppitemtypeid: number;
  readonlyind: number;
}

export interface Filters {
  salesRepId: string;
  division: string;
  generalContractor: string;
  showBehindPAR: boolean;
  status: string;
  hideCompleted: boolean;
}
