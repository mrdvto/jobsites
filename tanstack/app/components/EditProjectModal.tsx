import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalReferenceSearch } from '@/components/ExternalReferenceSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';

import { useUsers, useLookups } from '@/hooks/useLookups';
import { useAllKnownCompanies, useUpdateProject } from '@/hooks/useProjects';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getUserName } from '@/lib/lookupHelpers';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types';
import { X, Check, ChevronsUpDown, Building2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { createProjectSchema, type CreateProjectInput } from '@/lib/schemas/project';

interface EditProjectModalProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function projectToFormValues(project: Project): CreateProjectInput {
  const hasAddress = project.address.street && project.address.city && project.address.state;
  return {
    name: project.name,
    description: project.description,
    statusId: project.statusId,
    assigneeIds: project.assigneeIds,
    ownerCompanyId: project.projectOwner?.companyId || '',
    ownerContactIds: project.projectOwner?.contactIds || [],
    locationType: hasAddress ? 'address' : 'coordinates',
    street: project.address.street,
    city: project.address.city,
    state: project.address.state,
    zipCode: project.address.zipCode,
    country: project.address.country,
    latitude: project.address.latitude?.toString() || '',
    longitude: project.address.longitude?.toString() || '',
    valuation: project.valuation?.toString() || '',
    primaryStageId: project.primaryStageId || '',
    primaryProjectTypeId: project.primaryProjectTypeId || '',
    ownershipTypeId: project.ownershipTypeId || '',
    bidDate: project.bidDate ? parseISO(project.bidDate) : undefined,
    targetStartDate: project.targetStartDate ? parseISO(project.targetStartDate) : undefined,
    targetCompletionDate: project.targetCompletionDate ? parseISO(project.targetCompletionDate) : undefined,
    externalReference: project.externalReference,
  };
}

export const EditProjectModal = ({ project, open, onOpenChange }: EditProjectModalProps) => {
  const { data: usersData } = useUsers();
  const { data: lookupsData } = useLookups();
  const { data: knownCompaniesData } = useAllKnownCompanies();
  const updateProjectMutation = useUpdateProject();
  const { currentUserId } = useCurrentUser();
  const { toast } = useToast();

  const allUsers = usersData || [];
  const primaryStages = lookupsData?.primaryStages || [];
  const primaryProjectTypes = lookupsData?.primaryProjectTypes || [];
  const ownershipTypes = lookupsData?.ownershipTypes || [];
  const allCompanies = knownCompaniesData || [];

  const { control, register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: projectToFormValues(project),
  });

  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [ownerCompanyOpen, setOwnerCompanyOpen] = useState(false);
  const [bidDateOpen, setBidDateOpen] = useState(false);
  const [targetStartOpen, setTargetStartOpen] = useState(false);
  const [targetCompletionOpen, setTargetCompletionOpen] = useState(false);

  const locationType = watch('locationType');
  const assigneeIds = watch('assigneeIds');
  const ownerCompanyId = watch('ownerCompanyId');
  const ownerContactIds = watch('ownerContactIds');
  const bidDate = watch('bidDate');
  const targetStartDate = watch('targetStartDate');
  const targetCompletionDate = watch('targetCompletionDate');

  useEffect(() => {
    if (open) {
      reset(projectToFormValues(project));
    }
  }, [open, project, reset]);

  const selectedOwnerCompany = ownerCompanyId ? allCompanies.find(c => c.companyId === ownerCompanyId) : undefined;

  const onSubmit = (data: CreateProjectInput) => {
    const parsedValuation = data.valuation ? parseFloat(data.valuation.replace(/,/g, '')) : undefined;

    updateProjectMutation.mutate({
      projectId: project.id,
      updates: {
        assigneeIds: data.assigneeIds,
        description: data.description.trim(),
        address: {
          street: data.locationType === 'address' ? data.street.trim() : '',
          city: data.locationType === 'address' ? data.city.trim() : '',
          state: data.locationType === 'address' ? data.state.trim() : '',
          zipCode: data.locationType === 'address' ? data.zipCode.trim() : '',
          country: data.locationType === 'address' ? data.country.trim() : '',
          latitude: data.locationType === 'coordinates' ? parseFloat(data.latitude) : project.address.latitude,
          longitude: data.locationType === 'coordinates' ? parseFloat(data.longitude) : project.address.longitude
        },
        projectOwner: {
          companyId: data.ownerCompanyId,
          contactIds: data.ownerContactIds,
        },
        valuation: parsedValuation,
        primaryStageId: data.primaryStageId,
        primaryProjectTypeId: data.primaryProjectTypeId,
        ownershipTypeId: data.ownershipTypeId,
        bidDate: data.bidDate ? format(data.bidDate, 'yyyy-MM-dd') : undefined,
        targetStartDate: data.targetStartDate ? format(data.targetStartDate, 'yyyy-MM-dd') : undefined,
        targetCompletionDate: data.targetCompletionDate ? format(data.targetCompletionDate, 'yyyy-MM-dd') : undefined,
        externalReference: data.externalReference,
      },
      userId: currentUserId,
    });

    toast({ title: "Success", description: "Project updated successfully." });
    onOpenChange(false);
  };

  const onError = () => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast({ title: "Error", description: firstError.message as string, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project Details</DialogTitle>
          <DialogDescription>Update the details for {project.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-semibold">Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee(s) *</Label>
                <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={assigneeOpen} className={cn("w-full justify-between h-auto min-h-10", errors.assigneeIds && "border-destructive")}>
                      <div className="flex flex-wrap gap-1">
                        {assigneeIds.length > 0 ? assigneeIds.map(id => (
                          <span key={id} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                            {getUserName(allUsers, id)}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={(e) => { e.stopPropagation(); setValue('assigneeIds', assigneeIds.filter(r => r !== id)); }} />
                          </span>
                        )) : <span className="text-muted-foreground">Select assignees...</span>}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search user..." />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {allUsers.map((user) => (
                            <CommandItem key={user.id} value={`${user.firstName} ${user.lastName}`} onSelect={() => { setValue('assigneeIds', assigneeIds.includes(user.id) ? assigneeIds.filter(id => id !== user.id) : [...assigneeIds, user.id]); }}>
                              <Check className={cn("mr-2 h-4 w-4", assigneeIds.includes(user.id) ? "opacity-100" : "opacity-0")} />
                              {user.firstName} {user.lastName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="space-y-4 pb-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Location</h3>
              <div className="flex rounded-md border border-input overflow-hidden">
                <Button type="button" variant={locationType === 'address' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setValue('locationType', 'address')}>Address</Button>
                <Button type="button" variant={locationType === 'coordinates' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setValue('locationType', 'coordinates')}>Coordinates</Button>
              </div>
            </div>
            {locationType === 'address' ? (
              <>
                <div className="space-y-2"><Label htmlFor="street">Street Address *</Label><Input id="street" {...register('street')} placeholder="123 Main Street" className={errors.street ? 'border-destructive' : ''} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="city">City *</Label><Input id="city" {...register('city')} placeholder="City" className={errors.city ? 'border-destructive' : ''} /></div>
                  <div className="space-y-2"><Label htmlFor="state">State *</Label><Input id="state" {...register('state')} placeholder="CA" className={errors.state ? 'border-destructive' : ''} /></div>
                  <div className="space-y-2"><Label htmlFor="zipCode">Zip Code *</Label><Input id="zipCode" {...register('zipCode')} placeholder="12345" className={errors.zipCode ? 'border-destructive' : ''} /></div>
                  <div className="space-y-2"><Label htmlFor="country">Country *</Label><Input id="country" {...register('country')} placeholder="USA" className={errors.country ? 'border-destructive' : ''} /></div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="latitude">Latitude *</Label><Input id="latitude" type="number" step="any" {...register('latitude')} placeholder="e.g. 37.7749" className={errors.latitude ? 'border-destructive' : ''} /><p className="text-xs text-muted-foreground">Range: -90 to 90</p></div>
                <div className="space-y-2"><Label htmlFor="longitude">Longitude *</Label><Input id="longitude" type="number" step="any" {...register('longitude')} placeholder="e.g. -122.4194" className={errors.longitude ? 'border-destructive' : ''} /><p className="text-xs text-muted-foreground">Range: -180 to 180</p></div>
              </div>
            )}
          </div>
          <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" {...register('description')} placeholder="Enter project description..." rows={4} /></div>

          {/* Project Metadata */}
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-semibold">Project Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valuation">Valuation ($)</Label>
                <Input id="valuation" type="number" min="0" step="1" {...register('valuation')} placeholder="e.g. 5000000" />
              </div>
              <div className="space-y-2">
                <Label>Ownership Type</Label>
                <Controller control={control} name="ownershipTypeId" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {ownershipTypes.sort((a, b) => a.displayOrder - b.displayOrder).map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <Label>Primary Stage</Label>
                <Controller control={control} name="primaryStageId" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {primaryStages.sort((a, b) => a.displayOrder - b.displayOrder).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <Label>Primary Project Type</Label>
                <Controller control={control} name="primaryProjectTypeId" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {primaryProjectTypes.sort((a, b) => a.displayOrder - b.displayOrder).map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Bid Date</Label>
                <Popover open={bidDateOpen} onOpenChange={setBidDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !bidDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bidDate ? format(bidDate, 'MM/dd/yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={bidDate} onSelect={(d) => { setValue('bidDate', d); setBidDateOpen(false); }} initialFocus />
                  </PopoverContent>
                </Popover>
                {bidDate && <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setValue('bidDate', undefined)}>Clear</Button>}
              </div>
              <div className="space-y-2">
                <Label>Target Start Date</Label>
                <Popover open={targetStartOpen} onOpenChange={setTargetStartOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !targetStartDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetStartDate ? format(targetStartDate, 'MM/dd/yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={targetStartDate} onSelect={(d) => { setValue('targetStartDate', d); setTargetStartOpen(false); }} initialFocus />
                  </PopoverContent>
                </Popover>
                {targetStartDate && <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setValue('targetStartDate', undefined)}>Clear</Button>}
              </div>
              <div className="space-y-2">
                <Label>Target Completion</Label>
                <Popover open={targetCompletionOpen} onOpenChange={setTargetCompletionOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !targetCompletionDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetCompletionDate ? format(targetCompletionDate, 'MM/dd/yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={targetCompletionDate} onSelect={(d) => { setValue('targetCompletionDate', d); setTargetCompletionOpen(false); }} initialFocus />
                  </PopoverContent>
                </Popover>
                {targetCompletionDate && <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setValue('targetCompletionDate', undefined)}>Clear</Button>}
              </div>
            </div>
          </div>

          {/* External Reference */}
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-semibold">External Reference</h3>
            <Controller control={control} name="externalReference" render={({ field }) => (
              <ExternalReferenceSearch value={field.value} onChange={field.onChange} />
            )} />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" /> Project Owner</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Popover open={ownerCompanyOpen} onOpenChange={setOwnerCompanyOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={ownerCompanyOpen} className={cn("w-full justify-between", errors.ownerCompanyId && "border-destructive")}>
                      {selectedOwnerCompany ? selectedOwnerCompany.companyName : <span className="text-muted-foreground">Select a company...</span>}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search company..." />
                      <CommandList>
                        <CommandEmpty>No company found.</CommandEmpty>
                        <CommandGroup>
                          {allCompanies.map((company) => (
                            <CommandItem
                              key={company.companyId}
                              value={company.companyName}
                              onSelect={() => {
                                setValue('ownerCompanyId', company.companyId);
                                setValue('ownerContactIds', []);
                                setOwnerCompanyOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", ownerCompanyId === company.companyId ? "opacity-100" : "opacity-0")} />
                              {company.companyName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedOwnerCompany && selectedOwnerCompany.companyContacts.length > 0 && (
                <div className="space-y-2">
                  <Label>Contact(s)</Label>
                  <div className="space-y-2 rounded-md border border-input p-3">
                    {selectedOwnerCompany.companyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-owner-contact-${contact.id}`}
                          checked={ownerContactIds.includes(contact.id)}
                          onCheckedChange={(checked) => {
                            setValue('ownerContactIds',
                              checked ? [...ownerContactIds, contact.id] : ownerContactIds.filter(id => id !== contact.id)
                            );
                          }}
                        />
                        <label htmlFor={`edit-owner-contact-${contact.id}`} className="text-sm cursor-pointer flex-1">
                          <span className="font-medium">{contact.name}</span>
                          {contact.title && <span className="text-muted-foreground"> — {contact.title}</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
