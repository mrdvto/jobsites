import { useState } from 'react';
import { SiteCompany } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ManageCompanyContactsModal } from './ManageCompanyContactsModal';
import { ChevronRight, ChevronDown, Star, Pencil, X, Phone, Mail, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SiteCompaniesTableProps {
  siteId: number;
  companies: SiteCompany[];
  onRemoveCompany: (companyName: string) => void;
}

export const SiteCompaniesTable = ({ siteId, companies, onRemoveCompany }: SiteCompaniesTableProps) => {
  const { updateSiteCompany } = useData();
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [editingCompany, setEditingCompany] = useState<SiteCompany | null>(null);

  const toggleExpanded = (companyName: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyName)) {
      newExpanded.delete(companyName);
    } else {
      newExpanded.add(companyName);
    }
    setExpandedCompanies(newExpanded);
  };

  const handleSaveContacts = (updatedCompany: SiteCompany) => {
    if (editingCompany) {
      updateSiteCompany(siteId, editingCompany.companyName, updatedCompany);
      setEditingCompany(null);
    }
  };

  if (companies.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No companies associated with this site yet.
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contacts</TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company, idx) => {
            const isExpanded = expandedCompanies.has(company.companyName);
            const contacts = company.companyContacts || [];
            const primaryContact = contacts[company.primaryContactIndex || 0];
            const contactCount = contacts.length;

            return (
              <Collapsible key={idx} asChild open={isExpanded} onOpenChange={() => toggleExpanded(company.companyName)}>
                <>
                  <TableRow className={cn(isExpanded && "border-b-0")}>
                    <TableCell className="p-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell>
                      <Badge variant={company.roleId === 'GC' ? 'default' : 'secondary'}>
                        {company.roleDescription}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {contactCount} {contactCount === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingCompany(company)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onRemoveCompany(company.companyName)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <tr>
                      <td colSpan={5} className="p-0">
                        <div className="bg-muted/30 border-b px-6 py-4">
                          <div className="grid gap-3">
                            {contacts.map((contact, contactIdx) => (
                              <div
                                key={contact.id}
                                className={cn(
                                  "flex items-start justify-between p-3 rounded-lg bg-background border",
                                  contactIdx === (company.primaryContactIndex || 0) && "ring-2 ring-primary"
                                )}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {contactIdx === (company.primaryContactIndex || 0) && (
                                      <Star className="h-4 w-4 text-primary fill-primary" />
                                    )}
                                    <span className="font-medium">{contact.name}</span>
                                    {contact.title && (
                                      <span className="text-muted-foreground text-sm">• {contact.title}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {contact.phone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        <span>{contact.phone}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                        {contact.email}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </CollapsibleContent>
                </>
              </Collapsible>
            );
          })}
        </TableBody>
      </Table>

      {editingCompany && (
        <ManageCompanyContactsModal
          company={editingCompany}
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          onSave={handleSaveContacts}
        />
      )}
    </>
  );
};
