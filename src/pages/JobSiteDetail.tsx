import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useStatusColors, STATUS_COLORS } from '@/hooks/useStatusColors';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { OpportunityDetailModal } from '@/components/OpportunityDetailModal';
import { AssociateOpportunityModal } from '@/components/AssociateOpportunityModal';
import { CreateOpportunityModal } from '@/components/CreateOpportunityModal';
import { AddGCModal } from '@/components/AddGCModal';
import { AssociateCompanyModal } from '@/components/AssociateCompanyModal';
import { EditJobSiteModal } from '@/components/EditJobSiteModal';
import { EditGCModal } from '@/components/EditGCModal';
import { ActivityModal } from '@/components/ActivityModal';
import { AssociateActivityModal } from '@/components/AssociateActivityModal';
import { ArrowLeft, MapPin, User, Phone, Mail, Building2, Plus, Link as LinkIcon, X, Pencil, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/types';

type LocationViewType = 'address' | 'coordinates';

const JobSiteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobSites, getSalesRepName, opportunities, getStageName, removeSiteCompany, updateJobSite, deleteActivity } = useData();
  const { statusColors, getStatusColorClasses } = useStatusColors();
  const { toast } = useToast();
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddGCModal, setShowAddGCModal] = useState(false);
  const [showRemoveGCDialog, setShowRemoveGCDialog] = useState(false);
  const [showAssociateCompanyModal, setShowAssociateCompanyModal] = useState(false);
  const [showRemoveCompanyDialog, setShowRemoveCompanyDialog] = useState(false);
  const [companyToRemove, setCompanyToRemove] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditGCModal, setShowEditGCModal] = useState(false);
  const [locationViewType, setLocationViewType] = useState<LocationViewType>('address');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [activityModalMode, setActivityModalMode] = useState<'create' | 'edit'>('create');
  const [showDeleteActivityDialog, setShowDeleteActivityDialog] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [showAssociateActivityModal, setShowAssociateActivityModal] = useState(false);

  const site = jobSites.find(s => s.id === parseInt(id || '0'));

  const hasAddress = site?.address.street && site?.address.city && site?.address.state;
  const hasCoordinates = site?.address.latitude != null && site?.address.longitude != null && 
    !isNaN(site?.address.latitude) && !isNaN(site?.address.longitude);
  
  // Determine default location view: address if available, otherwise coordinates
  const defaultLocationView: LocationViewType = hasAddress ? 'address' : (hasCoordinates ? 'coordinates' : 'address');
  
  // Set initial location view when site changes - must be before any early returns
  useEffect(() => {
    if (site) {
      setLocationViewType(defaultLocationView);
    }
  }, [site?.id, defaultLocationView]);

  if (!site) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Job Site Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to List</Button>
        </div>
      </div>
    );
  }

  const handleOpportunityClick = (oppId: number) => {
    const fullOpp = opportunities.find(o => o.id === oppId);
    if (fullOpp) {
      setSelectedOpportunity(fullOpp);
      setShowOpportunityDetail(true);
    }
  };

  const primaryGC = site.siteCompanies.find(c => c.roleId === 'GC' && c.isPrimaryContact);

  const handleRemoveGC = () => {
    if (primaryGC) {
      removeSiteCompany(site.id, primaryGC.companyName);
      toast({
        title: "Success",
        description: "General Contractor removed successfully."
      });
      setShowRemoveGCDialog(false);
    }
  };

  const handleRemoveCompany = () => {
    if (companyToRemove) {
      removeSiteCompany(site.id, companyToRemove);
      toast({
        title: "Success",
        description: "Company removed successfully."
      });
      setCompanyToRemove(null);
      setShowRemoveCompanyDialog(false);
    }
  };

  const initiateRemoveCompany = (companyName: string) => {
    setCompanyToRemove(companyName);
    setShowRemoveCompanyDialog(true);
  };

  // Get available status options from saved colors
  const statusOptions = Object.keys(statusColors);

  const handleStatusChange = (newStatus: string) => {
    updateJobSite(site.id, { statusId: newStatus });
    toast({
      title: "Status updated",
      description: `Project status changed to "${newStatus}".`
    });
  };

  const handleCreateActivity = () => {
    setSelectedActivity(undefined);
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
      deleteActivity(site.id, activityToDelete);
      toast({
        title: "Success",
        description: "Activity deleted successfully."
      });
      setActivityToDelete(null);
      setShowDeleteActivityDialog(false);
    }
  };

  const initiateDeleteActivity = (activityId: number) => {
    setActivityToDelete(activityId);
    setShowDeleteActivityDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-3xl font-bold">{site.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Select value={site.statusId} onValueChange={handleStatusChange}>
              <SelectTrigger className={`w-auto h-7 text-xs font-medium rounded-full border-0 ${getStatusColorClasses(site.statusId)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => {
                  const colorId = statusColors[status];
                  const colorConfig = STATUS_COLORS.find(c => c.id === colorId);
                  return (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${colorConfig?.bg || 'bg-muted'}`} />
                        {status}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">ID: {site.id}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Site Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">Location</p>
                    {(hasAddress || hasCoordinates) && (
                      <div className="flex rounded-md border border-input overflow-hidden">
                        <Button
                          type="button"
                          variant={locationViewType === 'address' ? 'default' : 'ghost'}
                          size="sm"
                          className="rounded-none h-7 text-xs"
                          onClick={() => setLocationViewType('address')}
                          disabled={!hasAddress}
                        >
                          Address
                        </Button>
                        <Button
                          type="button"
                          variant={locationViewType === 'coordinates' ? 'default' : 'ghost'}
                          size="sm"
                          className="rounded-none h-7 text-xs"
                          onClick={() => setLocationViewType('coordinates')}
                          disabled={!hasCoordinates}
                        >
                          Coordinates
                        </Button>
                      </div>
                    )}
                  </div>
                  {locationViewType === 'address' ? (
                    hasAddress ? (
                      <p className="text-sm text-muted-foreground">
                        {site.address.street}<br />
                        {site.address.city}, {site.address.state} {site.address.zipCode}<br />
                        {site.address.country}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No address available</p>
                    )
                  ) : (
                    hasCoordinates ? (
                      <p className="text-sm text-muted-foreground">
                        Latitude: {site.address.latitude}<br />
                        Longitude: {site.address.longitude}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No coordinates available</p>
                    )
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Primary Contact</p>
                  <p className="text-sm">{site.projectPrimaryContact.name}</p>
                  <p className="text-sm text-muted-foreground">{site.projectPrimaryContact.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{site.projectPrimaryContact.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${site.projectPrimaryContact.email}`} className="text-primary hover:underline">
                        {site.projectPrimaryContact.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{site.description}</p>
              </div>

              {site.notes && site.notes.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Notes</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {site.notes.map((note, idx) => (
                        <li key={idx}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Sales Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Sales Rep</span>
                  <p className="font-medium">{getSalesRepName(site.salesRepId)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Planned Annual Rate</span>
                  <p className="font-medium">{site.plannedAnnualRate} sales activities/year</p>
                </div>
                <div>
                  <span className="text-muted-foreground">PAR Start Date</span>
                  <p className="font-medium">{site.parStartDate ? new Date(site.parStartDate).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Opportunities</span>
                  <p className="font-medium">{site.associatedOpportunities.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <h3 className="font-semibold">General Contractor</h3>
                </div>
                {primaryGC && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowEditGCModal(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowRemoveGCDialog(true)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {primaryGC ? (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{primaryGC.companyName}</p>
                  <p className="text-muted-foreground">{primaryGC.companyContact.name}</p>
                  <p className="text-muted-foreground">{primaryGC.companyContact.title}</p>
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{primaryGC.companyContact.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${primaryGC.companyContact.email}`} className="text-primary hover:underline">
                        {primaryGC.companyContact.email}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No general contractor assigned</p>
                  <Button size="sm" onClick={() => setShowAddGCModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add GC
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Opportunities</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAssociateModal(true)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Associate Existing
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>

          {site.associatedOpportunities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No opportunities associated with this site yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Est. Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {site.associatedOpportunities.map(opp => (
                  <TableRow 
                    key={opp.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleOpportunityClick(opp.id)}
                  >
                    <TableCell className="font-mono text-sm">{opp.id}</TableCell>
                    <TableCell>{opp.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{opp.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${opp.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Subcontractors & Companies</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAssociateCompanyModal(true)}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Associate Existing
            </Button>
          </div>
          {site.siteCompanies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No companies associated with this site yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {site.siteCompanies.map((company, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell>
                      <Badge variant={company.roleId === 'GC' ? 'default' : 'secondary'}>
                        {company.roleDescription}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{company.companyContact.name}</p>
                        <p className="text-xs text-muted-foreground">{company.companyContact.title}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{company.companyContact.phone}</TableCell>
                    <TableCell className="text-sm">
                      <a href={`mailto:${company.companyContact.email}`} className="text-primary hover:underline">
                        {company.companyContact.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => initiateRemoveCompany(company.companyName)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Activities</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAssociateActivityModal(true)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Associate Existing
              </Button>
              <Button size="sm" onClick={handleCreateActivity}>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>

          {(!site.activities || site.activities.length === 0) ? (
            <p className="text-center text-muted-foreground py-8">
              No activities recorded for this site yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {site.activities.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{getSalesRepName(activity.assigneeId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{activity.activityType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(activity.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">{activity.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditActivity(activity)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => initiateDeleteActivity(activity.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        open={showOpportunityDetail}
        onOpenChange={setShowOpportunityDetail}
      />

      <AssociateOpportunityModal
        siteId={site.id}
        currentOpportunityIds={site.associatedOpportunities.map(o => o.id)}
        open={showAssociateModal}
        onOpenChange={setShowAssociateModal}
      />

      <CreateOpportunityModal
        siteId={site.id}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <AddGCModal
        siteId={site.id}
        open={showAddGCModal}
        onOpenChange={setShowAddGCModal}
      />

      <AssociateCompanyModal
        siteId={site.id}
        currentCompanyNames={site.siteCompanies.map(c => c.companyName)}
        open={showAssociateCompanyModal}
        onOpenChange={setShowAssociateCompanyModal}
      />

      <AlertDialog open={showRemoveGCDialog} onOpenChange={setShowRemoveGCDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove General Contractor?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {primaryGC?.companyName} as the general contractor for this job site? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveGC}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRemoveCompanyDialog} onOpenChange={setShowRemoveCompanyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Company?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {companyToRemove} from this job site? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveCompany}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditJobSiteModal
        site={site}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />

      {primaryGC && (
        <EditGCModal
          siteId={site.id}
          currentGC={primaryGC}
          open={showEditGCModal}
          onOpenChange={setShowEditGCModal}
        />
      )}

      <ActivityModal
        open={showActivityModal}
        onOpenChange={setShowActivityModal}
        siteId={site.id}
        activity={selectedActivity}
        mode={activityModalMode}
      />

      <AlertDialog open={showDeleteActivityDialog} onOpenChange={setShowDeleteActivityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActivity}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AssociateActivityModal
        siteId={site.id}
        currentActivityIds={site.activities?.map(a => a.id) || []}
        open={showAssociateActivityModal}
        onOpenChange={setShowAssociateActivityModal}
      />
    </div>
  );
};

export default JobSiteDetail;
