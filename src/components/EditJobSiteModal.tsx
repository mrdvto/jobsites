import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { JobSite } from '@/types';
import { Plus, X, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditJobSiteModalProps {
  site: JobSite;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditJobSiteModal = ({ site, open, onOpenChange }: EditJobSiteModalProps) => {
  const { updateJobSite, salesReps, getSalesRepName } = useData();
  const { toast } = useToast();

  const [salesRepId, setSalesRepId] = useState(site.salesRepId);
  const [salesRepOpen, setSalesRepOpen] = useState(false);
  const [plannedAnnualRate, setPlannedAnnualRate] = useState(site.plannedAnnualRate.toString());
  const [description, setDescription] = useState(site.description);
  const [notes, setNotes] = useState<string[]>(site.notes || []);
  const [contactName, setContactName] = useState(site.projectPrimaryContact.name);
  const [contactTitle, setContactTitle] = useState(site.projectPrimaryContact.title);
  const [contactPhone, setContactPhone] = useState(site.projectPrimaryContact.phone);
  const [contactEmail, setContactEmail] = useState(site.projectPrimaryContact.email);
  const [street, setStreet] = useState(site.address.street);
  const [city, setCity] = useState(site.address.city);
  const [state, setState] = useState(site.address.state);
  const [zipCode, setZipCode] = useState(site.address.zipCode);
  const [country, setCountry] = useState(site.address.country);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (open) {
      setSalesRepId(site.salesRepId);
      setPlannedAnnualRate(site.plannedAnnualRate.toString());
      setDescription(site.description);
      setNotes(site.notes || []);
      setContactName(site.projectPrimaryContact.name);
      setContactTitle(site.projectPrimaryContact.title);
      setContactPhone(site.projectPrimaryContact.phone);
      setContactEmail(site.projectPrimaryContact.email);
      setStreet(site.address.street);
      setCity(site.address.city);
      setState(site.address.state);
      setZipCode(site.address.zipCode);
      setCountry(site.address.country);
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

    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all address fields.",
        variant: "destructive"
      });
      return;
    }

    const parsedRate = parseFloat(plannedAnnualRate);
    if (isNaN(parsedRate) || parsedRate < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid planned annual rate (must be 0 or greater).",
        variant: "destructive"
      });
      return;
    }

    updateJobSite(site.id, {
      salesRepId,
      plannedAnnualRate: parseFloat(plannedAnnualRate),
      description: description.trim(),
      notes,
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country.trim(),
        latitude: site.address.latitude,
        longitude: site.address.longitude
      },
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
            Update the details for {site.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-semibold">Sales Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesRep">Assigned Sales Rep *</Label>
                <Popover open={salesRepOpen} onOpenChange={setSalesRepOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={salesRepOpen}
                      className="w-full justify-between"
                    >
                      {salesRepId ? getSalesRepName(salesRepId) : "Select sales rep..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search sales rep..." />
                      <CommandList>
                        <CommandEmpty>No sales rep found.</CommandEmpty>
                        <CommandGroup>
                          {salesReps.map((rep) => (
                            <CommandItem
                              key={rep.salesrepid}
                              value={`${rep.firstname} ${rep.lastname}`}
                              onSelect={() => {
                                setSalesRepId(rep.salesrepid);
                                setSalesRepOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  salesRepId === rep.salesrepid ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {rep.firstname} {rep.lastname}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedAnnualRate">Planned Annual Rate ($) *</Label>
                <Input
                  id="plannedAnnualRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={plannedAnnualRate}
                  onChange={(e) => setPlannedAnnualRate(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-semibold">Address</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="CA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="USA"
                  required
                />
              </div>
            </div>
          </div>

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
