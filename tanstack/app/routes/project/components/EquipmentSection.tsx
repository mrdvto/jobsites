import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { SortIcon } from '@/components/shared/SortIcon';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { useSortable } from '@/hooks/useSortable';
import { AddCustomerEquipmentModal } from '@/components/AddCustomerEquipmentModal';
import { CreateEquipmentModal } from '@/components/CreateEquipmentModal';
import { Plus, Link as LinkIcon, Search, ChevronRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAddCustomerEquipment, useDeleteCustomerEquipment } from '@/hooks/useProjects';
import { useEquipment, useAddEquipmentToMaster } from '@/hooks/useEquipment';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Project, CustomerEquipment } from '@/types';

type EqSortColumn = 'type' | 'make' | 'model' | 'year' | 'serial' | 'smu' | 'ownership';

interface EquipmentSectionProps {
  project: Project;
  getLookupLabel: (type: string, id: string) => string;
}

export function EquipmentSection({ project, getLookupLabel }: EquipmentSectionProps) {
  const { toast } = useToast();
  const { currentUserId } = useCurrentUser();
  const { data: allEquipment } = useEquipment();
  const equipmentList = allEquipment || [];
  const addCustomerEquipmentMutation = useAddCustomerEquipment();
  const deleteCustomerEquipmentMutation = useDeleteCustomerEquipment();
  const addEquipmentToMasterMutation = useAddEquipmentToMaster();

  const { sortColumn, sortDirection, handleSort, sortData } = useSortable<EqSortColumn>();

  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [showUom, setShowUom] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('showEquipmentUom') === 'true' : false
  );

  // Modals
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<number | null>(null);

  const getEquipmentById = (eqId: number) => equipmentList.find((e) => e.id === eqId);

  const handleSaveEquipment = (equipmentId: number) => {
    const eq = getEquipmentById(equipmentId);
    addCustomerEquipmentMutation.mutate({
      projectId: project.id,
      equipmentId,
      equipmentLabel: eq ? `${eq.make} ${eq.model}` : undefined,
      userId: currentUserId,
    });
    toast({ title: 'Success', description: 'Equipment added.' });
  };

  const handleSaveNewEquipment = (equipment: CustomerEquipment) => {
    addEquipmentToMasterMutation.mutate({ equipment });
    addCustomerEquipmentMutation.mutate({
      projectId: project.id,
      equipmentId: equipment.id,
      equipmentLabel: `${equipment.make} ${equipment.model}`,
      userId: currentUserId,
    });
    toast({ title: 'Success', description: 'Equipment created and added to project.' });
  };

  const handleDeleteEquipment = () => {
    if (equipmentToDelete !== null) {
      const eq = getEquipmentById(equipmentToDelete);
      deleteCustomerEquipmentMutation.mutate({
        projectId: project.id,
        equipmentId: equipmentToDelete,
        equipmentLabel: eq ? `${eq.make} ${eq.model}` : undefined,
        userId: currentUserId,
      });
      toast({ title: 'Success', description: 'Equipment removed.' });
      setEquipmentToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const eqCompareFn = (a: CustomerEquipment, b: CustomerEquipment, column: EqSortColumn): number => {
    switch (column) {
      case 'type': return (a.equipmentType || '').localeCompare(b.equipmentType || '');
      case 'make': return (a.make || '').localeCompare(b.make || '');
      case 'model': return (a.model || '').localeCompare(b.model || '');
      case 'year': return (a.year || 0) - (b.year || 0);
      case 'serial': return (a.serialNumber || '').localeCompare(b.serialNumber || '');
      case 'smu': return (a.smu || 0) - (b.smu || 0);
      case 'ownership': return (a.ownershipStatus || '').localeCompare(b.ownershipStatus || '');
      default: return 0;
    }
  };

  const resolvedEquipment = (project.customerEquipment || [])
    .map((eqId) => getEquipmentById(eqId))
    .filter((eq): eq is CustomerEquipment => eq !== undefined);

  const searchLower = equipmentSearch.toLowerCase();
  const hasSearch = searchLower.length > 0;

  const filteredEquipment = resolvedEquipment.filter((eq) => {
    if (!hasSearch) return true;
    const companyName = project.projectCompanies.find((c) => c.companyId === eq.companyId)?.companyName || '';
    const searchStr = `${companyName} ${eq.equipmentType} ${eq.make} ${eq.model} ${eq.year || ''} ${eq.serialNumber || ''} ${eq.ownershipStatus}`.toLowerCase();
    return searchStr.includes(searchLower);
  });

  const grouped = filteredEquipment.reduce<Record<string, { companyName: string; items: CustomerEquipment[] }>>((acc, eq) => {
    if (!acc[eq.companyId]) {
      acc[eq.companyId] = {
        companyName: project.projectCompanies.find((c) => c.companyId === eq.companyId)?.companyName || 'Unknown',
        items: [],
      };
    }
    acc[eq.companyId].items.push(eq);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Customer Equipment</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="show-uom"
                checked={showUom}
                onCheckedChange={(checked) => {
                  setShowUom(checked);
                  if (typeof window !== 'undefined') localStorage.setItem('showEquipmentUom', String(checked));
                }}
              />
              <Label htmlFor="show-uom" className="text-sm cursor-pointer">Show UOM</Label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
              <Button size="sm" onClick={() => setShowAssociateModal(true)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Associate Existing
              </Button>
            </div>
          </div>
        </div>

        {!project.customerEquipment || project.customerEquipment.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No customer equipment recorded for this project.
          </p>
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {groupEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No equipment matches your search.</p>
            ) : (
              <div className="space-y-2">
                {groupEntries.map(([companyId, group]) => (
                  <Collapsible key={`${companyId}-${hasSearch}`} defaultOpen={true}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors [&[data-state=open]_svg.chevron]:rotate-90">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="chevron h-4 w-4 shrink-0 transition-transform duration-200" />
                        <span>{group.companyName}</span>
                        <Badge variant="secondary" className="ml-1">
                          {group.items.length} {group.items.length === 1 ? 'machine' : 'machines'}
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('type')}>
                              <div className="flex items-center">Type<SortIcon active={sortColumn === 'type'} direction={sortDirection} /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('make')}>
                              <div className="flex items-center">Make<SortIcon active={sortColumn === 'make'} direction={sortDirection} /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('model')}>
                              <div className="flex items-center">Model<SortIcon active={sortColumn === 'model'} direction={sortDirection} /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('year')}>
                              <div className="flex items-center">Year<SortIcon active={sortColumn === 'year'} direction={sortDirection} /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('serial')}>
                              <div className="flex items-center">Serial #<SortIcon active={sortColumn === 'serial'} direction={sortDirection} /></div>
                            </TableHead>
                            <TableHead className="text-right cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('smu')}>
                              <div className="flex items-center justify-end">SMU<SortIcon active={sortColumn === 'smu'} direction={sortDirection} /></div>
                            </TableHead>
                            {showUom && <TableHead>UOM</TableHead>}
                            <TableHead className="cursor-pointer select-none group hover:bg-muted/50" onClick={() => handleSort('ownership')}>
                              <div className="flex items-center">Ownership<SortIcon active={sortColumn === 'ownership'} direction={sortDirection} /></div>
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortData(group.items, eqCompareFn).map((eq) => (
                            <TableRow key={eq.id}>
                              <TableCell>{eq.equipmentType}</TableCell>
                              <TableCell>{eq.make}</TableCell>
                              <TableCell>{eq.model}</TableCell>
                              <TableCell>{eq.year || '\u2014'}</TableCell>
                              <TableCell className="font-mono text-sm">{eq.serialNumber || '\u2014'}</TableCell>
                              <TableCell className="text-right">{eq.smu?.toLocaleString() || '\u2014'}</TableCell>
                              {showUom && <TableCell>{eq.uom ? getLookupLabel('uomTypes', eq.uom) : '\u2014'}</TableCell>}
                              <TableCell>
                                <Badge variant={eq.ownershipStatus === 'owned' ? 'default' : 'secondary'}>
                                  {eq.ownershipStatus === 'owned' ? 'Owned' : 'Rented'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => { setEquipmentToDelete(eq.id); setShowDeleteDialog(true); }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      <AddCustomerEquipmentModal
        open={showAssociateModal}
        onOpenChange={setShowAssociateModal}
        onSave={handleSaveEquipment}
        projectId={project.id}
        projectCompanies={project.projectCompanies}
        existingEquipmentIds={project.customerEquipment}
      />
      <CreateEquipmentModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSave={handleSaveNewEquipment}
        projectId={project.id}
        projectCompanies={project.projectCompanies}
      />
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Remove Equipment?"
        description="This will remove the equipment record from this project. This action cannot be undone."
        onConfirm={handleDeleteEquipment}
        confirmLabel="Remove"
      />
    </>
  );
}
