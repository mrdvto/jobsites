import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '@/hooks/useLookups';
import { useProject, useAddActivity, useUpdateActivity } from '@/hooks/useProjects';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { CalendarIcon, Check, ChevronDown, ChevronUp, ChevronsUpDown, X, Link2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import activityTypesData from '@/data/ActivityTypes.json';
import campaignsData from '@/data/Campaigns.json';
import issuesData from '@/data/Issues.json';
import { activitySchema, ACTIVITY_DEFAULTS, type ActivityInput } from '@/lib/schemas/activity';

const ACTIVITY_TYPES = activityTypesData.content;

interface ActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  activity?: Activity;
  mode: 'create' | 'edit';
  followUpFrom?: Activity;
}

function activityToFormValues(activity: Activity, projectCompanies: any[]): ActivityInput {
  const actDate = activity.date ? new Date(activity.date) : undefined;
  let contactId: number | '' = '';
  if (activity.customerId) {
    const company = projectCompanies.find(c => c.companyId === activity.customerId);
    if (company && activity.contactName) {
      const contact = company.companyContacts.find((c: any) => c.name === activity.contactName);
      contactId = contact?.id ?? '';
    }
  }
  return {
    salesRepId: activity.salesRepId.toString(),
    typeId: activity.typeId,
    date: actDate as Date,
    timeValue: actDate ? format(actDate, 'HH:mm') : '12:00',
    description: activity.description,
    notes: activity.notes || '',
    selectedCompanyId: activity.customerId || '',
    selectedContactId: contactId,
    showMoreFields: !!(activity.campaignId || activity.issueId || activity.previousRelatedActivityId),
    campaignId: activity.campaignId?.toString() || '',
    issueId: activity.issueId?.toString() || '',
    linkedActivityId: activity.previousRelatedActivityId?.toString() || '',
  };
}

function followUpToFormValues(followUp: Activity, projectCompanies: any[]): ActivityInput {
  let contactId: number | '' = '';
  if (followUp.customerId) {
    const company = projectCompanies.find(c => c.companyId === followUp.customerId);
    if (company && followUp.contactName) {
      const contact = company.companyContacts.find((c: any) => c.name === followUp.contactName);
      contactId = contact?.id ?? '';
    }
  }
  return {
    ...ACTIVITY_DEFAULTS,
    salesRepId: followUp.salesRepId.toString(),
    typeId: followUp.typeId,
    selectedCompanyId: followUp.customerId || '',
    selectedContactId: contactId,
  };
}

export const ActivityModal = ({ open, onOpenChange, projectId, activity, mode, followUpFrom }: ActivityModalProps) => {
  const { data: users = [] } = useUsers();
  const { data: project } = useProject(projectId);
  const addActivityMutation = useAddActivity();
  const updateActivityMutation = useUpdateActivity();
  const { currentUserId } = useCurrentUser();
  const { toast } = useToast();

  const projectCompanies = project?.projectCompanies ?? [];

  const { control, register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: ACTIVITY_DEFAULTS,
  });

  const [companyPopoverOpen, setCompanyPopoverOpen] = useState(false);
  const [contactPopoverOpen, setContactPopoverOpen] = useState(false);

  const selectedCompanyId = watch('selectedCompanyId');
  const selectedContactId = watch('selectedContactId');
  const date = watch('date');
  const timeValue = watch('timeValue');
  const showMoreFields = watch('showMoreFields');

  const selectedCompany = projectCompanies.find(c => c.companyId === selectedCompanyId);
  const companyContacts = selectedCompany?.companyContacts ?? [];

  useEffect(() => {
    if (!open) return;
    if (activity && mode === 'edit') {
      reset(activityToFormValues(activity, projectCompanies));
    } else if (mode === 'create' && followUpFrom) {
      reset(followUpToFormValues(followUpFrom, projectCompanies));
    } else {
      reset(ACTIVITY_DEFAULTS);
    }
  }, [activity, mode, open, followUpFrom, reset]);

  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) { setValue('date', undefined as unknown as Date); return; }
    const [hours, minutes] = timeValue.split(':').map(Number);
    const merged = new Date(selectedDay);
    merged.setHours(hours, minutes, 0, 0);
    setValue('date', merged);
  };

  const handleTimeChange = (newTime: string) => {
    setValue('timeValue', newTime);
    if (!date) return;
    const [hours, minutes] = newTime.split(':').map(Number);
    const merged = new Date(date);
    merged.setHours(hours, minutes, 0, 0);
    setValue('date', merged);
  };

  const status = useMemo(() => {
    if (!date) return null;
    return isPast(date) ? 'Completed' : 'Outstanding';
  }, [date]);

  const filteredIssues = useMemo(() => {
    const allIssues = issuesData.content;
    if (!selectedCompanyId) return allIssues;
    return allIssues.filter(issue => issue.customerId === selectedCompanyId);
  }, [selectedCompanyId]);

  const handleCompanyChange = (companyId: string) => {
    setValue('selectedCompanyId', companyId);
    setValue('selectedContactId', '');
    setCompanyPopoverOpen(false);
  };

  const onSubmit = (data: ActivityInput) => {
    const statusId = isPast(data.date) ? 2 : 1;
    const selectedContact = companyContacts.find(c => c.id === data.selectedContactId);

    const activityData = {
      statusId,
      salesRepId: parseInt(data.salesRepId),
      typeId: data.typeId,
      date: data.date.toISOString(),
      description: data.description.trim(),
      contactName: selectedContact?.name || '',
      notes: data.notes.trim(),
      customerId: data.selectedCompanyId || undefined,
      campaignId: data.campaignId && data.campaignId !== 'none' ? parseInt(data.campaignId) : undefined,
      issueId: data.issueId && data.issueId !== 'none' ? parseInt(data.issueId) : undefined,
      previousRelatedActivityId: followUpFrom?.id || (data.linkedActivityId && data.linkedActivityId !== 'none' ? parseInt(data.linkedActivityId) : undefined)
    };

    if (mode === 'create') {
      addActivityMutation.mutate({ projectId, activity: activityData, userId: currentUserId });
      toast({ title: "Success", description: "Activity created successfully." });
    } else if (activity) {
      updateActivityMutation.mutate({ projectId, activityId: activity.id, updates: activityData, userId: currentUserId });
      toast({ title: "Success", description: "Activity updated successfully." });
    }

    onOpenChange(false);
  };

  const onError = () => {
    toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Activity' : 'Edit Activity'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 py-1">
          <div className="space-y-4">
            {followUpFrom && mode === 'create' && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Follow-up to:</span>
                <span className="font-medium truncate">{followUpFrom.description}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="salesRep">Sales Rep</Label>
              <Controller control={control} name="salesRepId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.salesRepId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select sales rep" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.lastName}, {user.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeId">Activity Type</Label>
              <Controller control={control} name="typeId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.typeId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Date & Time</Label>
                {status && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs pointer-events-none",
                      status === 'Completed'
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    )}
                  >
                    {status}
                  </Badge>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      errors.date && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMM d, yyyy 'at' h:mm a") : "Select date & time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                  <div className="border-t border-border px-3 py-2">
                    <Label className="text-xs text-muted-foreground">Time</Label>
                    <Input
                      type="time"
                      value={timeValue}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="mt-1 h-8"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Company (optional)</Label>
              <Popover open={companyPopoverOpen} onOpenChange={setCompanyPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn("w-full justify-between font-normal", !selectedCompanyId && "text-muted-foreground")}
                  >
                    {selectedCompany?.companyName || "Select company..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search companies..." />
                    <CommandList>
                      <CommandEmpty>No companies found.</CommandEmpty>
                      <CommandGroup>
                        {projectCompanies.map(company => (
                          <CommandItem
                            key={company.companyId}
                            value={company.companyName}
                            onSelect={() => handleCompanyChange(company.companyId)}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedCompanyId === company.companyId ? "opacity-100" : "opacity-0")} />
                            <span>{company.companyName}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{(company.roleDescriptions || [company.roleDescription]).join(', ')}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCompanyId && (
                <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setValue('selectedCompanyId', ''); setValue('selectedContactId', ''); }}>
                  <X className="h-3 w-3 mr-1" /> Clear company
                </Button>
              )}
            </div>

            {selectedCompanyId && companyContacts.length > 0 && (
              <div className="space-y-2">
                <Label>Contact</Label>
                <Popover open={contactPopoverOpen} onOpenChange={setContactPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between font-normal", !selectedContactId && "text-muted-foreground")}
                    >
                      {selectedContactId ? companyContacts.find(c => c.id === selectedContactId)?.name || "Select contact..." : "Select contact..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search contacts..." />
                      <CommandList>
                        <CommandEmpty>No contacts found.</CommandEmpty>
                        <CommandGroup>
                          {companyContacts.map(contact => (
                            <CommandItem
                              key={contact.id}
                              value={contact.name}
                              onSelect={() => { setValue('selectedContactId', contact.id); setContactPopoverOpen(false); }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selectedContactId === contact.id ? "opacity-100" : "opacity-0")} />
                              <div>
                                <div>{contact.name}</div>
                                {contact.title && <div className="text-xs text-muted-foreground">{contact.title}</div>}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Enter activity description"
                className={errors.description ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Enter notes"
                rows={2}
                className={errors.notes ? 'border-destructive' : ''}
              />
            </div>

            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-xs text-muted-foreground px-0"
                onClick={() => setValue('showMoreFields', !showMoreFields)}
              >
                {showMoreFields ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                More fields
              </Button>
              {showMoreFields && (
                <div className="mt-2 space-y-4">
                  <div className="space-y-2">
                    <Label>Campaign</Label>
                    <Controller control={control} name="campaignId" render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {campaignsData.content.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue</Label>
                    <Controller control={control} name="issueId" render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {filteredIssues.map(issue => (
                            <SelectItem key={issue.id} value={issue.id.toString()}>{issue.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )} />
                  </div>
                  {!followUpFrom && (
                    <div className="space-y-2">
                      <Label>Follow-up to</Label>
                      <Controller control={control} name="linkedActivityId" render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {(project?.activities || [])
                              .filter(a => !(mode === 'edit' && activity && a.id === activity.id))
                              .map(a => (
                                <SelectItem key={a.id} value={a.id.toString()}>
                                  {a.description}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="flex justify-end gap-2 pt-4 border-t border-border bg-background">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
