import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SortIcon } from '@/components/shared/SortIcon';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { useSortable } from '@/hooks/useSortable';
import { ActivityModal } from '@/components/ActivityModal';
import { ActivityColumnSelector } from '@/components/ActivityColumnSelector';
import { useActivityColumnVisibility, ACTIVITY_COLUMN_LABELS } from '@/hooks/useActivityColumnVisibility';
import type { ActivityColumnId } from '@/hooks/useActivityColumnVisibility';
import { ActivityFilterModal, type ActivityFilters, DEFAULT_ACTIVITY_FILTERS } from '@/components/ActivityFilterModal';
import { ActivityFilterBadges } from '@/components/ActivityFilterBadges';
import { Plus, Pencil, X, CornerDownRight, Link2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeleteActivity } from '@/hooks/useProjects';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Activity, Project, ProjectCompany } from '@/types';

type ActSortColumn = 'assignee' | 'company' | 'contact' | 'role' | 'activityType' | 'date' | 'status' | 'description';

interface ActivitiesSectionProps {
  project: Project;
  getSalesRepName: (id: number) => string;
}

export function ActivitiesSection({ project, getSalesRepName }: ActivitiesSectionProps) {
  const { toast } = useToast();
  const { currentUserId } = useCurrentUser();
  const deleteActivityMutation = useDeleteActivity();
  const actColVis = useActivityColumnVisibility();

  const { sortColumn, sortDirection, handleSort } = useSortable<ActSortColumn>({
    defaultColumn: 'date',
    defaultDirection: 'desc',
  });

  // Filters
  const [filters, setFilters] = useState<ActivityFilters>(DEFAULT_ACTIVITY_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Activity modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [activityModalMode, setActivityModalMode] = useState<'create' | 'edit'>('create');
  const [followUpFromActivity, setFollowUpFromActivity] = useState<Activity | undefined>(undefined);

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);

  const handleCreateActivity = () => {
    setSelectedActivity(undefined);
    setFollowUpFromActivity(undefined);
    setActivityModalMode('create');
    setShowActivityModal(true);
  };

  const handleFollowUpActivity = (activity: Activity) => {
    setSelectedActivity(undefined);
    setFollowUpFromActivity(activity);
    setActivityModalMode('create');
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setActivityModalMode('edit');
    setShowActivityModal(true);
  };

  const handleDeleteActivity = () => {
    if (activityToDelete !== null) {
      deleteActivityMutation.mutate({ projectId: project.id, activityId: activityToDelete, userId: currentUserId });
      toast({ title: 'Success', description: 'Activity deleted successfully.' });
      setActivityToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Filter activities
  const filteredActivities = (project.activities || []).filter((activity: any) => {
    if (filters.assigneeIds.length > 0 && !filters.assigneeIds.includes(activity.salesRepId.toString())) return false;
    if (filters.companyIds.length > 0 && (!activity.customerId || !filters.companyIds.includes(activity.customerId))) return false;
    if (filters.contactNames.length > 0 && (!activity.contactName || !filters.contactNames.includes(activity.contactName))) return false;
    if (filters.roleIds.length > 0) {
      const company = project.projectCompanies?.find((c) => c.companyId === activity.customerId);
      if (!company) return false;
      const companyRoles = company.roleIds || [company.roleId];
      if (!filters.roleIds.some((r) => companyRoles.includes(r))) return false;
    }
    if (filters.typeIds.length > 0 && !filters.typeIds.includes(activity.typeId)) return false;
    if (filters.statuses.length > 0) {
      const status = activity.statusId === 2 ? 'completed' : 'outstanding';
      if (!filters.statuses.includes(status)) return false;
    }
    if (filters.dateFrom && new Date(activity.date) < filters.dateFrom) return false;
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(activity.date) > end) return false;
    }
    if (filters.hideCompleted && activity.statusId === 2) return false;
    return true;
  });

  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;
    let cmp = 0;
    switch (sortColumn) {
      case 'assignee': cmp = getSalesRepName(a.salesRepId).localeCompare(getSalesRepName(b.salesRepId)); break;
      case 'activityType': cmp = (a.typeId || '').localeCompare(b.typeId || ''); break;
      case 'date': cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
      case 'status': cmp = Number(a.statusId === 2) - Number(b.statusId === 2); break;
      case 'description': cmp = (a.description || '').localeCompare(b.description || ''); break;
      case 'company': {
        const compA = project.projectCompanies?.find((c) => c.companyId === a.customerId)?.companyName || '';
        const compB = project.projectCompanies?.find((c) => c.companyId === b.customerId)?.companyName || '';
        cmp = compA.localeCompare(compB);
        break;
      }
      case 'contact': cmp = (a.contactName || '').localeCompare(b.contactName || ''); break;
      case 'role': {
        const roleA = (project.projectCompanies?.find((c) => c.companyId === a.customerId)?.roleDescriptions || []).join(', ');
        const roleB = (project.projectCompanies?.find((c) => c.companyId === b.customerId)?.roleDescriptions || []).join(', ');
        cmp = roleA.localeCompare(roleB);
        break;
      }
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const filterCount = [
    filters.assigneeIds.length > 0,
    filters.companyIds.length > 0,
    filters.contactNames.length > 0,
    filters.roleIds.length > 0,
    filters.typeIds.length > 0,
    filters.statuses.length > 0,
    filters.dateFrom !== undefined,
    filters.dateTo !== undefined,
    filters.hideCompleted,
  ].filter(Boolean).length;

  const ACTIVITY_TYPE_LABELS: Record<string, string> = { E: 'Email', P: 'Phone', F: 'Face-to-Face', Q: 'Quote' };

  const renderCell = (colId: ActivityColumnId, activity: Activity) => {
    const actCompany = project.projectCompanies?.find((c) => c.companyId === activity.customerId);
    const parentActivity = activity.previousRelatedActivityId
      ? project.activities?.find((a) => a.id === activity.previousRelatedActivityId)
      : undefined;

    switch (colId) {
      case 'assignee':
        return <TableCell key={colId} className="font-medium">{getSalesRepName(activity.salesRepId)}</TableCell>;
      case 'company':
        return <TableCell key={colId} className="text-sm">{actCompany?.companyName || '\u2014'}</TableCell>;
      case 'contact':
        return <TableCell key={colId} className="text-sm">{activity.contactName || '\u2014'}</TableCell>;
      case 'role':
        return (
          <TableCell key={colId}>
            {actCompany ? (
              <div className="flex flex-wrap gap-1">
                {(actCompany.roleDescriptions || [actCompany.roleDescription]).filter(Boolean).map((role, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{role}</Badge>
                ))}
              </div>
            ) : '\u2014'}
          </TableCell>
        );
      case 'activityType':
        return (
          <TableCell key={colId}>
            <Badge variant="outline">{ACTIVITY_TYPE_LABELS[activity.typeId] || activity.typeId}</Badge>
          </TableCell>
        );
      case 'date':
        return <TableCell key={colId} className="text-sm">{new Date(activity.date).toLocaleDateString()}</TableCell>;
      case 'status':
        return (
          <TableCell key={colId}>
            <Badge
              variant="outline"
              className={
                activity.statusId === 2
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }
            >
              {activity.statusId === 2 ? 'Completed' : 'Outstanding'}
            </Badge>
          </TableCell>
        );
      case 'description':
        return (
          <TableCell key={colId} className="text-sm">
            <div className="flex items-center gap-1.5">
              {parentActivity && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Follow-up to: {parentActivity.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {activity.description}
            </div>
          </TableCell>
        );
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Activities</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowFilterModal(true)}>
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 && (
                <span className="ml-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                  {filterCount}
                </span>
              )}
            </Button>
            <ActivityColumnSelector
              visibleColumns={actColVis.visibleColumns}
              toggleColumn={actColVis.toggleColumn}
              isVisible={actColVis.isVisible}
              moveColumn={actColVis.moveColumn}
            />
            <Button size="sm" onClick={handleCreateActivity}>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>

        <ActivityFilterBadges
          filters={filters}
          setFilters={setFilters}
          projectCompanies={project.projectCompanies || []}
          getSalesRepName={getSalesRepName}
        />

        {!project.activities || project.activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No activities recorded for this project yet.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  {actColVis.visibleColumns.map((colId) => (
                    <TableHead
                      key={colId}
                      className="cursor-pointer select-none group hover:bg-muted/50"
                      onClick={() => handleSort(colId)}
                    >
                      <div className="flex items-center">
                        {ACTIVITY_COLUMN_LABELS[colId]}
                        <SortIcon active={sortColumn === colId} direction={sortDirection} />
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    {actColVis.visibleColumns.map((colId) => renderCell(colId, activity))}
                    <TableCell>
                      <div className="flex gap-1">
                        {activity.statusId === 2 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFollowUpActivity(activity)}>
                                  <CornerDownRight className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Follow up</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditActivity(activity)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setActivityToDelete(activity.id); setShowDeleteDialog(true); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ActivityModal
        open={showActivityModal}
        onOpenChange={setShowActivityModal}
        projectId={project.id}
        activity={selectedActivity}
        mode={activityModalMode}
        followUpFrom={followUpFromActivity}
      />
      <ActivityFilterModal
        open={showFilterModal}
        onOpenChange={setShowFilterModal}
        filters={filters}
        setFilters={setFilters}
        activities={project.activities || []}
        projectCompanies={project.projectCompanies || []}
        getSalesRepName={getSalesRepName}
      />
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Activity?"
        description="This action cannot be undone. This will permanently delete the activity."
        onConfirm={handleDeleteActivity}
      />
    </>
  );
}
