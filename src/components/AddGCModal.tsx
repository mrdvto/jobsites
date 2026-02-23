import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AddGCModalProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddGCModal = ({ projectId, open, onOpenChange }: AddGCModalProps) => {
  const { addProjectCompany } = useData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ companyName: '', contactName: '', contactTitle: '', contactPhone: '', contactEmail: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactName || !formData.contactEmail) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    addProjectCompany(projectId, {
      companyId: `NEW-${Date.now()}`, companyName: formData.companyName, roleId: 'GC', roleDescription: 'General Contractor', isPrimaryContact: true,
      companyContacts: [{ id: 1, name: formData.contactName, title: formData.contactTitle || undefined, phone: formData.contactPhone, email: formData.contactEmail }]
    });
    toast({ title: "Success", description: "General Contractor added successfully." });
    setFormData({ companyName: '', contactName: '', contactTitle: '', contactPhone: '', contactEmail: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add General Contractor</DialogTitle>
          <DialogDescription>Add a general contractor for this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="companyName">Company Name *</Label><Input id="companyName" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="ABC Construction Co." /></div>
            <div className="grid gap-2"><Label htmlFor="contactName">Contact Name *</Label><Input id="contactName" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} placeholder="John Smith" /></div>
            <div className="grid gap-2"><Label htmlFor="contactTitle">Contact Title</Label><Input id="contactTitle" value={formData.contactTitle} onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })} placeholder="Project Manager" /></div>
            <div className="grid gap-2"><Label htmlFor="contactPhone">Phone</Label><Input id="contactPhone" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="(555) 123-4567" /></div>
            <div className="grid gap-2"><Label htmlFor="contactEmail">Email *</Label><Input id="contactEmail" type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} placeholder="john@abcconstruction.com" /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add General Contractor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
