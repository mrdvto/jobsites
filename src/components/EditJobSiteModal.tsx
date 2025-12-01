import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { JobSite } from '@/types';
import { Plus, X } from 'lucide-react';

interface EditJobSiteModalProps {
  site: JobSite;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditJobSiteModal = ({ site, open, onOpenChange }: EditJobSiteModalProps) => {
  const { updateJobSite } = useData();
  const { toast } = useToast();

  const [description, setDescription] = useState(site.description);
  const [notes, setNotes] = useState<string[]>(site.notes || []);
  const [contactName, setContactName] = useState(site.projectPrimaryContact.name);
  const [contactTitle, setContactTitle] = useState(site.projectPrimaryContact.title);
  const [contactPhone, setContactPhone] = useState(site.projectPrimaryContact.phone);
  const [contactEmail, setContactEmail] = useState(site.projectPrimaryContact.email);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (open) {
      setDescription(site.description);
      setNotes(site.notes || []);
      setContactName(site.projectPrimaryContact.name);
      setContactTitle(site.projectPrimaryContact.title);
      setContactPhone(site.projectPrimaryContact.phone);
      setContactEmail(site.projectPrimaryContact.email);
      setNewNote('');
    }
  }, [open, site]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all primary contact fields.",
        variant: "destructive"
      });
      return;
    }

    updateJobSite(site.id, {
      description: description.trim(),
      notes,
      projectPrimaryContact: {
        name: contactName.trim(),
        title: contactTitle.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim()
      }
    });

    toast({
      title: "Success",
      description: "Job site updated successfully."
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Site Details</DialogTitle>
          <DialogDescription>
            Update the description, notes, and primary contact information for {site.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter site description..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <div className="space-y-2">
              {notes.map((note, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-md">
                  <span className="flex-1 text-sm">{note}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleRemoveNote(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a new note..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Primary Contact</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Name *</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Contact name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactTitle">Title</Label>
                <Input
                  id="contactTitle"
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  placeholder="Contact title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone *</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
