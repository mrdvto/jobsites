import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CompanyContact, SiteCompany } from '@/types';
import { Star, Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManageCompanyContactsModalProps {
  company: SiteCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedCompany: SiteCompany) => void;
}

interface ContactFormData {
  name: string;
  title: string;
  phone: string;
  email: string;
}

const emptyContact: ContactFormData = {
  name: '',
  title: '',
  phone: '',
  email: '',
};

export const ManageCompanyContactsModal = ({ 
  company, 
  open, 
  onOpenChange, 
  onSave 
}: ManageCompanyContactsModalProps) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ContactFormData>(emptyContact);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<ContactFormData>(emptyContact);

  useEffect(() => {
    if (open && company) {
      setContacts([...(company.companyContacts || [])]);
      setPrimaryIndex(company.primaryContactIndex || 0);
      setEditingId(null);
      setShowAddForm(false);
      setAddForm(emptyContact);
    }
  }, [open, company]);

  const handleSetPrimary = (index: number) => {
    setPrimaryIndex(index);
  };

  const handleStartEdit = (contact: CompanyContact) => {
    setEditingId(contact.id);
    setEditForm({
      name: contact.name,
      title: contact.title || '',
      phone: contact.phone,
      email: contact.email,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyContact);
  };

  const handleSaveEdit = (contactId: number) => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Name and email are required.",
        variant: "destructive"
      });
      return;
    }

    setContacts(prev => prev.map(c => 
      c.id === contactId 
        ? { ...c, name: editForm.name.trim(), title: editForm.title.trim(), phone: editForm.phone.trim(), email: editForm.email.trim() }
        : c
    ));
    setEditingId(null);
    setEditForm(emptyContact);
  };

  const handleRemoveContact = (contactId: number) => {
    if (contacts.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one contact is required per company.",
        variant: "destructive"
      });
      return;
    }

    const contactIndex = contacts.findIndex(c => c.id === contactId);
    setContacts(prev => prev.filter(c => c.id !== contactId));
    
    // Adjust primary index if needed
    if (contactIndex < primaryIndex) {
      setPrimaryIndex(prev => prev - 1);
    } else if (contactIndex === primaryIndex) {
      setPrimaryIndex(0);
    }
  };

  const handleAddContact = () => {
    if (!addForm.name.trim() || !addForm.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Name and email are required.",
        variant: "destructive"
      });
      return;
    }

    const newId = Math.max(...contacts.map(c => c.id), 0) + 1;
    const newContact: CompanyContact = {
      id: newId,
      name: addForm.name.trim(),
      title: addForm.title.trim() || undefined,
      phone: addForm.phone.trim(),
      email: addForm.email.trim(),
    };

    setContacts(prev => [...prev, newContact]);
    setShowAddForm(false);
    setAddForm(emptyContact);
  };

  const handleSave = () => {
    if (contacts.length === 0) {
      toast({
        title: "No Contacts",
        description: "At least one contact is required.",
        variant: "destructive"
      });
      return;
    }

    const updatedCompany: SiteCompany = {
      ...company,
      companyContacts: contacts,
      primaryContactIndex: primaryIndex,
    };

    onSave(updatedCompany);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage {company.companyName} Contacts</DialogTitle>
          <DialogDescription>
            <Badge variant="outline">{company.roleDescription}</Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">
              Contacts at this site ({contacts.length})
            </h3>
          </div>

          {contacts.map((contact, index) => (
            <Card key={contact.id} className={cn(
              "p-4 relative",
              index === primaryIndex && "ring-2 ring-primary"
            )}>
              {editingId === contact.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Name *</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Contact name"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Job title"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email *</Label>
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleSaveEdit(contact.id)}>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {index === primaryIndex && (
                        <Star className="h-4 w-4 text-primary fill-primary" />
                      )}
                      <span className="font-medium">{contact.name}</span>
                      {contact.title && (
                        <span className="text-muted-foreground text-sm">• {contact.title}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      {contact.phone && <p>{contact.phone}</p>}
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline block">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {index !== primaryIndex && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetPrimary(index)}
                        className="text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" /> Set Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleStartEdit(contact)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {showAddForm ? (
            <Card className="p-4 border-dashed">
              <h4 className="font-medium mb-3">Add New Contact</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name *</Label>
                    <Input
                      value={addForm.name}
                      onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Contact name"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={addForm.title}
                      onChange={(e) => setAddForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Job title"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input
                      value={addForm.phone}
                      onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Email *</Label>
                    <Input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddContact}>
                    <Plus className="h-4 w-4 mr-1" /> Add Contact
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Contact
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
