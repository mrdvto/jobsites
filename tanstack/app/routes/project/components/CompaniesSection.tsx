import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ProjectCompaniesTable } from '@/components/ProjectCompaniesTable';
import { AssociateCompanyModal } from '@/components/AssociateCompanyModal';
import { CreateProspectModal, type ProspectData } from '@/components/CreateProspectModal';
import { getRoleLabel } from '@/components/RoleMultiSelect';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRemoveProjectCompany, useAddProjectCompany } from '@/hooks/useProjects';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Project } from '@/types';

interface CompaniesSectionProps {
  project: Project;
}

export function CompaniesSection({ project }: CompaniesSectionProps) {
  const { toast } = useToast();
  const { currentUserId } = useCurrentUser();
  const removeProjectCompanyMutation = useRemoveProjectCompany();
  const addProjectCompanyMutation = useAddProjectCompany();

  const [showCustomerNumber, setShowCustomerNumber] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showCreateProspectModal, setShowCreateProspectModal] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [companyToRemove, setCompanyToRemove] = useState<string | null>(null);

  const handleRemoveCompany = () => {
    if (companyToRemove) {
      removeProjectCompanyMutation.mutate({ projectId: project.id, companyName: companyToRemove, userId: currentUserId });
      toast({ title: 'Success', description: 'Company removed successfully.' });
      setCompanyToRemove(null);
      setShowRemoveDialog(false);
    }
  };

  const initiateRemoveCompany = (companyName: string) => {
    setCompanyToRemove(companyName);
    setShowRemoveDialog(true);
  };

  const nonOwnerCompanies = project.projectCompanies.filter((c) => {
    const roles = c.roleIds || [c.roleId];
    return !roles.every((r) => r === 'OWNER');
  });

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Companies</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="show-customer-number" className="text-xs text-muted-foreground cursor-pointer">
                Customer #
              </Label>
              <Switch id="show-customer-number" checked={showCustomerNumber} onCheckedChange={setShowCustomerNumber} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowCreateProspectModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
            <Button size="sm" onClick={() => setShowAssociateModal(true)}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Associate Existing
            </Button>
          </div>
        </div>
        {nonOwnerCompanies.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No companies associated with this project yet.
          </p>
        ) : (
          <ProjectCompaniesTable
            projectId={project.id}
            companies={nonOwnerCompanies}
            onRemoveCompany={initiateRemoveCompany}
            showCustomerNumber={showCustomerNumber}
          />
        )}
      </Card>

      <AssociateCompanyModal
        projectId={project.id}
        currentCompanyNames={project.projectCompanies.map((c) => c.companyName)}
        open={showAssociateModal}
        onOpenChange={setShowAssociateModal}
      />
      <CreateProspectModal
        open={showCreateProspectModal}
        onOpenChange={setShowCreateProspectModal}
        onSave={(data: ProspectData) => {
          const companyId = `PROSPECT-${Date.now()}`;
          const roleIds = data.roleIds.length > 0 ? data.roleIds : ['PROSPECT'];
          const roleDescriptions = roleIds.map((id) => (id === 'PROSPECT' ? 'Prospect' : getRoleLabel(id)));
          addProjectCompanyMutation.mutate({
            projectId: project.id,
            company: {
              companyId,
              companyName: data.companyName,
              roleId: roleIds[0],
              roleDescription: roleDescriptions[0],
              roleIds,
              roleDescriptions,
              isPrimaryContact: false,
              divisionIds: data.divisionIds,
              companyContacts: [
                {
                  id: 1,
                  name: `${data.contact.firstName} ${data.contact.lastName}`,
                  title: data.contact.title,
                  phone: data.contact.mobilePhone,
                  email: data.contact.email,
                },
              ],
            },
            userId: currentUserId,
          });
        }}
      />
      <ConfirmDeleteDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="Remove Company?"
        description={`Are you sure you want to remove ${companyToRemove} from this project? This action cannot be undone.`}
        onConfirm={handleRemoveCompany}
        confirmLabel="Remove"
      />
    </>
  );
}
