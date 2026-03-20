import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building2, User, Phone, Mail, FileText, ClipboardList, ExternalLink, DollarSign, Pencil } from 'lucide-react';
import type { Project } from '@/types';
import type { CompanyContact } from '@/types';

type LocationViewType = 'address' | 'coordinates';

interface ProjectInfoCardProps {
  project: Project;
  getUserNames: (ids: number[]) => string;
  getCompanyById: (id: string) => { companyName: string; companyContacts: CompanyContact[] } | undefined;
  getLookupLabel: (type: string, id: string) => string;
  getStage: (stageId: number) => { phaseid?: number } | undefined;
  onEditClick: () => void;
}

export function ProjectInfoCard({
  project,
  getUserNames,
  getCompanyById,
  getLookupLabel,
  getStage,
  onEditClick,
}: ProjectInfoCardProps) {
  const [locationViewType, setLocationViewType] = useState<LocationViewType>('address');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const hasAddress = project?.address.street && project?.address.city && project?.address.state;
  const hasCoordinates =
    project?.address.latitude != null &&
    project?.address.longitude != null &&
    !isNaN(project?.address.latitude) &&
    !isNaN(project?.address.longitude);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Set initial location view based on available data
  const effectiveLocationView =
    locationViewType === 'address' && !hasAddress && hasCoordinates
      ? 'coordinates'
      : locationViewType === 'coordinates' && !hasCoordinates && hasAddress
        ? 'address'
        : locationViewType;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Project Information</h2>
        <Button variant="outline" size="sm" onClick={onEditClick}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Location */}
        <div className="rounded-lg border bg-muted/20 p-4 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium">Location</p>
              {(hasAddress || hasCoordinates) && (
                <div className="flex rounded-md border border-input overflow-hidden">
                  <Button
                    type="button"
                    variant={effectiveLocationView === 'address' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none h-7 text-xs"
                    onClick={() => setLocationViewType('address')}
                    disabled={!hasAddress}
                  >
                    Address
                  </Button>
                  <Button
                    type="button"
                    variant={effectiveLocationView === 'coordinates' ? 'default' : 'ghost'}
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
            {effectiveLocationView === 'address' ? (
              hasAddress ? (
                <p className="text-sm text-muted-foreground">
                  {project.address.street}
                  <br />
                  {project.address.city}, {project.address.state} {project.address.zipCode}
                  <br />
                  {project.address.country}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No address available</p>
              )
            ) : hasCoordinates ? (
              <p className="text-sm text-muted-foreground">
                Latitude: {project.address.latitude}
                <br />
                Longitude: {project.address.longitude}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No coordinates available</p>
            )}
          </div>
        </div>

        {/* Column 2: Project Owner */}
        <div className="rounded-lg border bg-muted/20 p-4 flex items-start gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">Project Owner</p>
            {(() => {
              const ownerCompany = project.projectOwner?.companyId
                ? getCompanyById(project.projectOwner.companyId)
                : undefined;
              if (!ownerCompany)
                return (
                  <p className="text-sm text-muted-foreground italic">No owner assigned</p>
                );
              const selectedContacts = ownerCompany.companyContacts.filter((c) =>
                project.projectOwner.contactIds.includes(c.id)
              );
              const isExpanded = expandedSections.has('owner');
              const visibleContacts = isExpanded
                ? selectedContacts
                : selectedContacts.slice(0, 2);
              const hasMore = selectedContacts.length > 2;
              return (
                <div>
                  <p className="text-sm font-medium">{ownerCompany.companyName}</p>
                  {selectedContacts.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {visibleContacts.map((contact) => (
                        <div key={contact.id} className="text-sm">
                          <p>
                            {contact.name}
                            {contact.title ? ` — ${contact.title}` : ''}
                          </p>
                          <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                            {contact.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-primary hover:underline"
                                >
                                  {contact.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {hasMore && (
                        <button
                          className="text-primary text-xs cursor-pointer hover:underline"
                          onClick={() => toggleSection('owner')}
                        >
                          {isExpanded
                            ? 'Show less'
                            : `Show ${selectedContacts.length - 2} more`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic mt-1">
                      No contacts selected
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Column 3: Assignees + Description stacked */}
        <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">
                Assignee{project.assigneeIds.length > 1 ? 's' : ''}
              </p>
              {(() => {
                const assigneeText = getUserNames(project.assigneeIds);
                const isExpanded = expandedSections.has('assignees');
                const isLong = assigneeText.length > 80;
                return (
                  <div>
                    <p
                      className={`text-sm text-muted-foreground ${isLong && !isExpanded ? 'line-clamp-2' : ''}`}
                    >
                      {assigneeText}
                    </p>
                    {isLong && (
                      <button
                        className="text-primary text-xs cursor-pointer hover:underline mt-1"
                        onClick={() => toggleSection('assignees')}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium mb-2">Description</p>
              {(() => {
                const desc = project.description || '';
                const isExpanded = expandedSections.has('description');
                const isLong = desc.length > 120;
                return (
                  <div>
                    <p
                      className={`text-sm text-muted-foreground ${isLong && !isExpanded ? 'line-clamp-3' : ''}`}
                    >
                      {desc || <span className="italic">No description</span>}
                    </p>
                    {isLong && (
                      <button
                        className="text-primary text-xs cursor-pointer hover:underline mt-1"
                        onClick={() => toggleSection('description')}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {/* Project Details fields */}
        {(project.valuation ||
          project.primaryStageId ||
          project.primaryProjectTypeId ||
          project.ownershipTypeId ||
          project.bidDate ||
          project.targetStartDate ||
          project.targetCompletionDate) && (
          <>
            <Separator />
            <div>
              <p className="font-medium mb-3 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-muted-foreground shrink-0" />
                Project Details
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                {project.valuation != null && (
                  <div>
                    <span className="text-muted-foreground">Valuation</span>
                    <p className="font-medium">
                      ${Math.round(project.valuation).toLocaleString('en-US')}
                    </p>
                  </div>
                )}
                {project.ownershipTypeId && (
                  <div>
                    <span className="text-muted-foreground">Ownership Type</span>
                    <p className="font-medium">
                      {getLookupLabel('ownershipType', project.ownershipTypeId)}
                    </p>
                  </div>
                )}
                {project.primaryStageId && (
                  <div>
                    <span className="text-muted-foreground">Primary Stage</span>
                    <p className="font-medium">
                      {getLookupLabel('primaryStage', project.primaryStageId)}
                    </p>
                  </div>
                )}
                {project.primaryProjectTypeId && (
                  <div>
                    <span className="text-muted-foreground">Primary Project Type</span>
                    <p className="font-medium">
                      {getLookupLabel('primaryProjectType', project.primaryProjectTypeId)}
                    </p>
                  </div>
                )}
                {project.bidDate && (
                  <div>
                    <span className="text-muted-foreground">Bid Date</span>
                    <p className="font-medium">
                      {new Date(project.bidDate + 'T00:00:00').toLocaleDateString('en-US')}
                    </p>
                  </div>
                )}
                {project.targetStartDate && (
                  <div>
                    <span className="text-muted-foreground">Target Start Date</span>
                    <p className="font-medium">
                      {new Date(project.targetStartDate + 'T00:00:00').toLocaleDateString(
                        'en-US'
                      )}
                    </p>
                  </div>
                )}
                {project.targetCompletionDate && (
                  <div>
                    <span className="text-muted-foreground">Target Completion Date</span>
                    <p className="font-medium">
                      {new Date(
                        project.targetCompletionDate + 'T00:00:00'
                      ).toLocaleDateString('en-US')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {project.externalReference && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{project.externalReference.source}</p>
                <a
                  href={project.externalReference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {project.externalReference.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </>
        )}
        <Separator />

        {/* Revenue Summary */}
        {(() => {
          const projectOpps = project.associatedOpportunities;
          const openOpps = projectOpps.filter((ao) => {
            const stage = getStage(ao.stageId);
            return stage && (stage.phaseid === 1 || stage.phaseid === 2);
          });
          const pipelineRevenue = openOpps.reduce(
            (sum, ao) => sum + (ao.revenue || 0),
            0
          );
          const wonRevenue = projectOpps.reduce(
            (sum, ao) => (ao.stageId === 16 ? sum + (ao.revenue || 0) : sum),
            0
          );
          return (
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Revenue</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2 text-sm mt-1">
                  <div>
                    <span className="text-muted-foreground">
                      Open Leads & Opportunities
                    </span>
                    <p className="font-medium">{openOpps.length}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Total Leads & Opportunities
                    </span>
                    <p className="font-medium">{projectOpps.length}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pipeline Revenue</span>
                    <p className="font-medium">
                      ${Math.round(pipelineRevenue).toLocaleString('en-US')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Won Revenue</span>
                    <p className="font-medium">
                      ${Math.round(wonRevenue).toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </Card>
  );
}
