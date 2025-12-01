import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OpportunityDetailModal } from '@/components/OpportunityDetailModal';
import { AssociateOpportunityModal } from '@/components/AssociateOpportunityModal';
import { CreateOpportunityModal } from '@/components/CreateOpportunityModal';
import { ArrowLeft, MapPin, User, Phone, Mail, Building2, Plus, Link as LinkIcon } from 'lucide-react';

const JobSiteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobSites, getSalesRepName, opportunities, getStageName } = useData();
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const site = jobSites.find(s => s.id === parseInt(id || '0'));

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

  const getOpportunityStatus = (oppId: number): string => {
    const fullOpp = opportunities.find(o => o.id === oppId);
    if (!fullOpp) return 'Unknown';
    // Phase 3 is Closed, otherwise Open
    return fullOpp.phaseId === 3 || fullOpp.phaseId === 4 ? 'Closed' : 'Open';
  };

  const primaryGC = site.siteCompanies.find(c => c.roleId === 'GC' && c.isPrimaryContact);

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
            <Badge variant={site.statusId === 'Active' ? 'default' : 'secondary'}>
              {site.statusId}
            </Badge>
            <span className="text-sm text-muted-foreground">ID: {site.id}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Site Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {site.address.street}<br />
                    {site.address.city}, {site.address.state} {site.address.zipCode}<br />
                    {site.address.country}
                  </p>
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
                      <span>{site.projectPrimaryContact.email}</span>
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
                  <span className="text-muted-foreground">Current Opportunities</span>
                  <p className="font-medium">{site.associatedOpportunities.length}</p>
                </div>
              </div>
            </Card>

            {primaryGC && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4" />
                  <h3 className="font-semibold">General Contractor</h3>
                </div>
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
                      <span>{primaryGC.companyContact.email}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
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
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>
                      <Badge variant={getOpportunityStatus(opp.id) === 'Open' ? 'default' : 'secondary'}>
                        {getOpportunityStatus(opp.id)}
                      </Badge>
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
          <h2 className="text-lg font-semibold mb-4">Subcontractors & Companies</h2>
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
                    <TableCell className="text-sm">{company.companyContact.email}</TableCell>
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
    </div>
  );
};

export default JobSiteDetail;
