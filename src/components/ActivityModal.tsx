import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import activityTypesData from '@/data/ActivityTypes.json';

const ACTIVITY_TYPES = activityTypesData.content;

interface ActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  activity?: Activity;
  mode: 'create' | 'edit';
}

export const ActivityModal = ({ open, onOpenChange, projectId, activity, mode }: ActivityModalProps) => {
  const { users, addActivity, updateActivity } = useData();
  const { toast } = useToast();

  const [salesRepId, setSalesRepId] = useState<string>('');
  const [typeId, setTypeId] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (activity && mode === 'edit') {
      setSalesRepId(activity.salesRepId.toString());
      setTypeId(activity.typeId);
      setDate(activity.date ? new Date(activity.date) : undefined);
      setDescription(activity.description);
      setContactName(activity.contactName || '');
      setNotes(activity.notes || '');
    } else {
      setSalesRepId('');
      setTypeId('');
      setDate(undefined);
      setDescription('');
      setContactName('');
      setNotes('');
    }
  }, [activity, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!salesRepId || !typeId || !date || !description.trim() || !contactName.trim() || !notes.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const statusId = date < new Date() ? 2 : 1;

    const activityData = {
      statusId,
      salesRepId: parseInt(salesRepId),
      typeId,
      date: date.toISOString(),
      description: description.trim(),
      contactName: contactName.trim(),
      notes: notes.trim()
    };

    if (mode === 'create') {
      addActivity(projectId, activityData);
      toast({
        title: "Success",
        description: "Activity created successfully."
      });
    } else if (activity) {
      updateActivity(projectId, activity.id, activityData);
      toast({
        title: "Success",
        description: "Activity updated successfully."
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Activity' : 'Edit Activity'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salesRep">Sales Rep</Label>
            <Select value={salesRepId} onValueChange={setSalesRepId}>
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="typeId">Activity Type</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Enter contact name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter activity description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
