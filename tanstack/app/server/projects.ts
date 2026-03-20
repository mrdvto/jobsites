import { createServerFn } from '@tanstack/react-start';
import type { Project, Activity, Note, ProjectCompany, ChangeLogEntry } from '@/types';
import { migrateNotes, migrateProjectCompanies } from '@/lib/migrations';

import projectsData from '@/data/Project.json';

// --- In-memory state ---

const initializeProjects = (): Project[] => {
  return projectsData.content.map(p => ({
    ...p,
    assigneeIds: (p as any).assigneeIds || (p as any).salesRepIds || [],
    projectOwner: (p as any).projectOwner || { companyId: '', contactIds: [] },
    activities: (p as any).activities || [],
    notes: migrateNotes((p as any).notes || []),
    projectCompanies: migrateProjectCompanies((p as any).siteCompanies || (p as any).projectCompanies || []),
    customerEquipment: ((p as any).customerEquipment || []).map((e: any) => typeof e === 'number' ? e : e.id) as number[],
  })) as Project[];
};

let projects: Project[] = initializeProjects();

// Seed change log
const seedChangeLog: ChangeLogEntry[] = [
  { id: 1, projectId: 500101, timestamp: '2025-11-02T09:15:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project "Highway 50 Expansion" created', changedById: 313 },
  { id: 2, projectId: 500101, timestamp: '2025-11-03T14:22:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Walsh Construction" added as General Contractor', changedById: 313 },
  { id: 3, projectId: 500101, timestamp: '2025-11-05T10:45:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "D6 Dozer rental for clearing phase" created', changedById: 260 },
  { id: 4, projectId: 500101, timestamp: '2025-11-08T16:30:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "Caterpillar 320F" added', changedById: 260 },
  { id: 5, projectId: 500101, timestamp: '2025-11-12T08:10:00Z', action: 'NOTE_ADDED', category: 'Note', summary: 'Note added', changedById: 313 },
  { id: 6, projectId: 500101, timestamp: '2025-11-15T11:05:00Z', action: 'PROJECT_UPDATED', category: 'Project', summary: 'Project details updated (statusId)', changedById: 292, details: { field: 'statusId', from: 'Planning', to: 'Active' } },
  { id: 7, projectId: 500101, timestamp: '2025-11-18T13:40:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Site Visit" added', changedById: 260 },
  { id: 8, projectId: 500101, timestamp: '2025-11-22T09:55:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Rosendin Electric" added as Subcontractor - Electrical', changedById: 313 },
  { id: 9, projectId: 500101, timestamp: '2025-12-01T15:20:00Z', action: 'OPPORTUNITY_UPDATED', category: 'Opportunity', summary: 'Opportunity "D6 Dozer rental for clearing phase" updated (stageId, estimateRevenue)', changedById: 292, details: { stageId: { from: 2, to: 4 }, estimateRevenue: { from: 45000, to: 52000 } } },
  { id: 10, projectId: 500101, timestamp: '2025-12-05T10:30:00Z', action: 'EQUIPMENT_DELETED', category: 'Equipment', summary: 'Equipment "Komatsu PC210" removed', changedById: 260 },
  { id: 11, projectId: 500101, timestamp: '2025-12-10T14:15:00Z', action: 'COMPANY_REMOVED', category: 'Company', summary: 'Company "Rosendin Electric" disassociated', changedById: 313 },
  { id: 12, projectId: 500101, timestamp: '2025-12-15T08:45:00Z', action: 'NOTE_UPDATED', category: 'Note', summary: 'Note updated', changedById: 292 },
  { id: 13, projectId: 500102, timestamp: '2025-10-20T09:00:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project "Metro Line Extension" created', changedById: 262 },
  { id: 14, projectId: 500102, timestamp: '2025-10-25T11:30:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Turner Construction" added as Subcontractor - Steel', changedById: 262 },
  { id: 15, projectId: 500102, timestamp: '2025-11-01T14:00:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Excavator fleet for foundation work" created', changedById: 303 },
  { id: 16, projectId: 500102, timestamp: '2025-11-10T16:20:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Phone Call" added', changedById: 262 },
  { id: 17, projectId: 500102, timestamp: '2025-11-20T10:10:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "Volvo EC220E" added', changedById: 303 },
  { id: 18, projectId: 500102, timestamp: '2025-12-02T13:45:00Z', action: 'PROJECT_UPDATED', category: 'Project', summary: 'Project details updated (description)', changedById: 262 },
  { id: 19, projectId: 500103, timestamp: '2025-09-15T08:30:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project "Riverside Commercial Park" created', changedById: 304 },
  { id: 20, projectId: 500103, timestamp: '2025-09-20T12:00:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Paving equipment package" created', changedById: 304 },
  { id: 21, projectId: 500103, timestamp: '2025-10-05T09:15:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Curran Contracting" added as Subcontractor - Paving', changedById: 305 },
  { id: 22, projectId: 500103, timestamp: '2025-10-15T15:30:00Z', action: 'NOTE_ADDED', category: 'Note', summary: 'Note added', changedById: 304 },
  { id: 23, projectId: 500103, timestamp: '2025-11-01T10:45:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "Case SV340B" added', changedById: 305 },
  { id: 24, projectId: 500103, timestamp: '2025-11-20T14:00:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Email" added', changedById: 304 },
  { id: 25, projectId: 500104, timestamp: '2025-10-01T08:00:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project created', changedById: 292 },
  { id: 26, projectId: 500104, timestamp: '2025-10-10T11:20:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Generator rental for temp power" created', changedById: 292 },
  { id: 27, projectId: 500104, timestamp: '2025-10-18T14:30:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company added as General Contractor', changedById: 292 },
  { id: 28, projectId: 500104, timestamp: '2025-11-05T09:00:00Z', action: 'PROJECT_UPDATED', category: 'Project', summary: 'Project details updated (statusId)', changedById: 313, details: { field: 'statusId', from: 'Planning', to: 'Active' } },
  { id: 29, projectId: 500105, timestamp: '2025-08-20T10:00:00Z', action: 'PROJECT_CREATED', category: 'Project', summary: 'Project created', changedById: 305 },
  { id: 30, projectId: 500105, timestamp: '2025-09-01T13:15:00Z', action: 'COMPANY_ADDED', category: 'Company', summary: 'Company "Rosendin Electric" added as Subcontractor - Electrical', changedById: 305 },
  { id: 31, projectId: 500105, timestamp: '2025-09-15T16:45:00Z', action: 'OPPORTUNITY_CREATED', category: 'Opportunity', summary: 'Opportunity "Boom lift rental" created', changedById: 262 },
  { id: 32, projectId: 500105, timestamp: '2025-10-01T08:30:00Z', action: 'EQUIPMENT_ADDED', category: 'Equipment', summary: 'Equipment "JLG 800S" added', changedById: 305 },
  { id: 33, projectId: 500105, timestamp: '2025-10-20T11:00:00Z', action: 'ACTIVITY_ADDED', category: 'Activity', summary: 'Activity "Site Inspection" added', changedById: 262 },
  { id: 34, projectId: 500105, timestamp: '2025-11-10T14:30:00Z', action: 'NOTE_ADDED', category: 'Note', summary: 'Note added', changedById: 305 },
];

let changeLog: ChangeLogEntry[] = [...seedChangeLog];
let nextLogId = seedChangeLog.length + 1;

function logChange(
  projectId: number,
  action: string,
  category: ChangeLogEntry['category'],
  summary: string,
  changedById: number,
  details?: Record<string, any>
) {
  changeLog.push({
    id: nextLogId++,
    projectId,
    timestamp: new Date().toISOString(),
    action,
    category,
    summary,
    changedById,
    details,
  });
}

// --- Read functions ---

export const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  return projects;
});

export const getProjectById = createServerFn({ method: 'GET' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return projects.find(p => p.id === data.id) || null;
  });

export const getChangeLog = createServerFn({ method: 'GET' })
  .validator((data: { projectId: number }) => data)
  .handler(async ({ data }) => {
    return changeLog.filter(e => e.projectId === data.projectId);
  });

export const getAllKnownCompanies = createServerFn({ method: 'GET' }).handler(async () => {
  const seen = new Set<string>();
  const result: ProjectCompany[] = [];
  for (const project of projects) {
    for (const company of project.projectCompanies) {
      if (!seen.has(company.companyId)) {
        seen.add(company.companyId);
        result.push(company);
      }
    }
  }
  return result.sort((a, b) => a.companyName.localeCompare(b.companyName));
});

// --- Write functions ---

export const createProject = createServerFn({ method: 'POST' })
  .validator((data: { project: Omit<Project, 'id'>; userId: number }) => data)
  .handler(async ({ data }) => {
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    const newProject: Project = { ...data.project, id: newId } as Project;
    projects = [...projects, newProject];
    logChange(newId, 'PROJECT_CREATED', 'Project', `Project "${data.project.name}" created`, data.userId);
    return newProject;
  });

export const updateProject = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; updates: Partial<Project>; userId: number }) => data)
  .handler(async ({ data }) => {
    const existing = projects.find(p => p.id === data.projectId);
    if (existing) {
      const changedFields = Object.keys(data.updates).filter(
        k => JSON.stringify((data.updates as any)[k]) !== JSON.stringify((existing as any)[k])
      );
      if (changedFields.length > 0) {
        logChange(data.projectId, 'PROJECT_UPDATED', 'Project', `Project details updated (${changedFields.join(', ')})`, data.userId);
      }
    }
    projects = projects.map(p => p.id === data.projectId ? { ...p, ...data.updates } : p);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const addProjectCompany = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; company: any; userId: number }) => data)
  .handler(async ({ data }) => {
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        return { ...p, projectCompanies: [...p.projectCompanies, data.company] };
      }
      return p;
    });
    logChange(data.projectId, 'COMPANY_ADDED', 'Company', `Company "${data.company.companyName}" added as ${data.company.roleDescription || data.company.roleId}`, data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const removeProjectCompany = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; companyName: string; userId: number }) => data)
  .handler(async ({ data }) => {
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        return { ...p, projectCompanies: p.projectCompanies.filter(c => c.companyName !== data.companyName) };
      }
      return p;
    });
    logChange(data.projectId, 'COMPANY_REMOVED', 'Company', `Company "${data.companyName}" disassociated`, data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const updateProjectCompany = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; oldCompanyName: string; updatedCompany: ProjectCompany; userId: number }) => data)
  .handler(async ({ data }) => {
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        return { ...p, projectCompanies: p.projectCompanies.map(c => c.companyName === data.oldCompanyName ? data.updatedCompany : c) };
      }
      return p;
    });
    logChange(data.projectId, 'COMPANY_UPDATED', 'Company', `Company "${data.updatedCompany.companyName}" updated`, data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const addActivity = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; activity: Omit<Activity, 'id'>; userId: number }) => data)
  .handler(async ({ data }) => {
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        const maxId = Math.max(...p.activities.map(a => a.id), 0);
        const newActivity: Activity = { ...data.activity, id: maxId + 1 };
        return { ...p, activities: [...p.activities, newActivity] };
      }
      return p;
    });
    logChange(data.projectId, 'ACTIVITY_ADDED', 'Activity', `Activity "${data.activity.typeId}" added`, data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const updateActivity = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; activityId: number; updates: Partial<Activity>; userId: number }) => data)
  .handler(async ({ data }) => {
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        return { ...p, activities: p.activities.map(a => a.id === data.activityId ? { ...a, ...data.updates } : a) };
      }
      return p;
    });
    logChange(data.projectId, 'ACTIVITY_UPDATED', 'Activity', 'Activity updated', data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const deleteActivity = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; activityId: number; userId: number }) => data)
  .handler(async ({ data }) => {
    let desc = '';
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        const act = p.activities.find(a => a.id === data.activityId);
        if (act) desc = act.typeId;
        return { ...p, activities: p.activities.filter(a => a.id !== data.activityId) };
      }
      return p;
    });
    logChange(data.projectId, 'ACTIVITY_DELETED', 'Activity', `Activity "${desc}" deleted`, data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const addNote = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; noteData: Omit<Note, 'id' | 'createdAt' | 'createdById'>; userId: number }) => data)
  .handler(async ({ data }) => {
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        const maxId = Math.max(...(p.notes || []).map(n => n.id), 0);
        const newNote: Note = {
          ...data.noteData,
          id: maxId + 1,
          createdAt: new Date().toISOString(),
          createdById: data.userId,
        };
        return { ...p, notes: [...(p.notes || []), newNote] };
      }
      return p;
    });
    logChange(data.projectId, 'NOTE_ADDED', 'Note', 'Note added', data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const updateNote = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; noteId: number; updates: Partial<Note>; userId: number }) => data)
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        return {
          ...p,
          notes: (p.notes || []).map(note => {
            if (note.id !== data.noteId) return note;

            const changes: string[] = [];
            if (data.updates.content !== undefined && data.updates.content !== note.content) changes.push('Content updated');
            if (data.updates.tagIds !== undefined && JSON.stringify(data.updates.tagIds) !== JSON.stringify(note.tagIds)) changes.push('Tags changed');
            if (data.updates.attachments !== undefined && JSON.stringify(data.updates.attachments) !== JSON.stringify(note.attachments)) changes.push('Attachments changed');
            const summary = changes.length > 0 ? changes.join(', ') : 'Note updated';

            const modification: any = { modifiedAt: now, modifiedById: data.userId, summary };
            if (data.updates.content !== undefined && data.updates.content !== note.content) {
              modification.previousContent = note.content;
            }
            if (data.updates.tagIds !== undefined && JSON.stringify(data.updates.tagIds) !== JSON.stringify(note.tagIds)) {
              modification.previousTagIds = note.tagIds;
            }

            return {
              ...note,
              ...data.updates,
              lastModifiedAt: now,
              lastModifiedById: data.userId,
              modificationHistory: [...(note.modificationHistory || []), modification],
            };
          }),
        };
      }
      return p;
    });
    logChange(data.projectId, 'NOTE_UPDATED', 'Note', 'Note updated', data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const deleteNote = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; noteId: number; userId: number }) => data)
  .handler(async ({ data }) => {
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        return { ...p, notes: (p.notes || []).filter(n => n.id !== data.noteId) };
      }
      return p;
    });
    logChange(data.projectId, 'NOTE_DELETED', 'Note', 'Note deleted', data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

// --- Equipment assignment (project-level) ---

export const addCustomerEquipment = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; equipmentId: number; equipmentLabel?: string; userId: number }) => data)
  .handler(async ({ data }) => {
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        if (p.customerEquipment.includes(data.equipmentId)) return p;
        return { ...p, customerEquipment: [...p.customerEquipment, data.equipmentId] };
      }
      return p;
    });
    logChange(data.projectId, 'EQUIPMENT_ADDED', 'Equipment', `Equipment "${data.equipmentLabel || data.equipmentId}" added`, data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const deleteCustomerEquipment = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; equipmentId: number; equipmentLabel?: string; userId: number }) => data)
  .handler(async ({ data }) => {
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        return { ...p, customerEquipment: p.customerEquipment.filter(id => id !== data.equipmentId) };
      }
      return p;
    });
    logChange(data.projectId, 'EQUIPMENT_DELETED', 'Equipment', `Equipment "${data.equipmentLabel || data.equipmentId}" removed`, data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

// --- Opportunity ↔ Project linking ---

export const addOpportunityToProject = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; opportunity: { id: number; typeId: number; description: string; stageId: number; estimateRevenue: number }; userId: number }) => data)
  .handler(async ({ data }) => {
    const { opportunity: opp } = data;
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        if (p.associatedOpportunities.find(ao => ao.id === opp.id)) return p;
        return {
          ...p,
          associatedOpportunities: [
            ...p.associatedOpportunities,
            { id: opp.id, type: opp.typeId === 1 ? 'Sale' : 'Rental', description: opp.description, stageId: opp.stageId, revenue: opp.estimateRevenue },
          ],
        };
      }
      return p;
    });
    logChange(data.projectId, 'OPPORTUNITY_ASSOCIATED', 'Opportunity', `Opportunity "${opp.description}" associated`, data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

export const createNewOpportunityOnProject = createServerFn({ method: 'POST' })
  .validator((data: { projectId: number; opportunity: { id: number; typeId: number; description: string; stageId: number; estimateRevenue: number }; userId: number }) => data)
  .handler(async ({ data }) => {
    const { opportunity: opp } = data;
    projects = projects.map(p => {
      if (p.id === data.projectId) {
        return {
          ...p,
          associatedOpportunities: [
            ...p.associatedOpportunities,
            { id: opp.id, type: opp.typeId === 1 ? 'Sale' : 'Rental', description: opp.description, stageId: opp.stageId, revenue: opp.estimateRevenue },
          ],
        };
      }
      return p;
    });
    logChange(data.projectId, 'OPPORTUNITY_CREATED', 'Opportunity', `Opportunity "${opp.description}" created`, data.userId);
    return projects.find(p => p.id === data.projectId) || null;
  });

// --- Equipment assignment lookup ---

export const getEquipmentProjectAssignment = createServerFn({ method: 'GET' })
  .validator((data: { equipmentId: number; excludeProjectId?: number }) => data)
  .handler(async ({ data }) => {
    for (const p of projects) {
      if (data.excludeProjectId !== undefined && p.id === data.excludeProjectId) continue;
      if (p.customerEquipment.includes(data.equipmentId)) {
        return { projectId: p.id, projectName: p.name };
      }
    }
    return null;
  });
