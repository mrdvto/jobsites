import type { Note, ProjectCompany, CompanyContact } from '@/types';

/**
 * Migrate old string notes to new Note structure.
 * Handles both legacy string[] and modern Note[] formats.
 */
export const migrateNotes = (notes: any[]): Note[] => {
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

/**
 * Migrate single companyContact to companyContacts array.
 * Ensures roleIds/roleDescriptions are always arrays.
 */
export const migrateProjectCompanies = (companies: any[]): ProjectCompany[] => {
  if (!companies || companies.length === 0) return [];

  return companies.map(company => {
    const roleIds = company.roleIds || [company.roleId];
    const roleDescriptions = company.roleDescriptions || [company.roleDescription];

    if (company.companyContacts && Array.isArray(company.companyContacts)) {
      return { ...company, roleIds, roleDescriptions } as ProjectCompany;
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
      roleIds,
      roleDescriptions,
      isPrimaryContact: company.isPrimaryContact,
      companyContacts: contacts,
      primaryContactIndex: 0,
    } as ProjectCompany;
  });
};
