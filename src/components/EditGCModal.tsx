import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditGCModalProps {
  siteId: number;
  currentGC: {
    companyId: string;
    companyName: string;
    roleId: string;
    roleDescription: string;
    isPrimaryContact: boolean;
    companyContact: {
      name: string;
      title: string;
      phone: string;
      email: string;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditGCModal = ({ siteId, currentGC, open, onOpenChange }: EditGCModalProps) => {
  const { jobSites, updateSiteCompany } = useData();
  const { toast } = useToast();
  
  const [selectedCompany, setSelectedCompany] = useState(currentGC.companyName);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [contactName, setContactName] = useState(currentGC.companyContact.name);
  const [contactTitle, setContactTitle] = useState(currentGC.companyContact.title);
  const [contactPhone, setContactPhone] = useState(currentGC.companyContact.phone);
  const [contactEmail, setContactEmail] = useState(currentGC.companyContact.email);

  // Get all unique companies from all job sites that are GCs
  const availableCompanies = useMemo(() => {
    const companiesMap = new Map();
    
    jobSites.forEach(site => {
      site.siteCompanies.forEach(company => {
        if (company.roleId === 'GC') {
          const key = company.companyName;
          if (!companiesMap.has(key)) {
            companiesMap.set(key, company);
          }
        }
      });
    });
    
    return Array.from(companiesMap.values()).sort((a, b) => 
      a.companyName.localeCompare(b.companyName)
    );
  }, [jobSites]);

  // Reset form when modal opens or current GC changes
  useEffect(() => {
    if (open) {
      setSelectedCompany(currentGC.companyName);
      setContactName(currentGC.companyContact.name);
      setContactTitle(currentGC.companyContact.title);
      setContactPhone(currentGC.companyContact.phone);
      setContactEmail(currentGC.companyContact.email);
    }
  }, [open, currentGC]);

  // When a different company is selected, populate with their contact info
  const handleCompanyChange = (companyName: string) => {
    setSelectedCompany(companyName);
    
    const company = availableCompanies.find(c => c.companyName === companyName);
    if (company) {
      setContactName(company.companyContact.name);
      setContactTitle(company.companyContact.title);
      setContactPhone(company.companyContact.phone);
      setContactEmail(company.companyContact.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompany) {
      toast({
        title: "Missing Information",
        description: "Please select a company.",
        variant: "destructive"
      });
      return;
    }

    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all contact fields.",
        variant: "destructive"
      });
      return;
    }

    const updatedGC = {
      companyId: currentGC.companyId,
      companyName: selectedCompany,
      roleId: 'GC',
      roleDescription: 'General Contractor',
      isPrimaryContact: true,
      companyContact: {
        name: contactName.trim(),
        title: contactTitle.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim()
      }
    };

    updateSiteCompany(siteId, currentGC.companyName, updatedGC);
    
    toast({
      title: "Success",
      description: "General Contractor updated successfully."
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit General Contractor</DialogTitle>
          <DialogDescription>
            Change the GC company or update the contact information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Company *</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="company"
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between"
                  >
                    {selectedCompany || "Select a company..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50">
                  <Command>
                    <CommandInput placeholder="Search companies..." />
                    <CommandList>
                      <CommandEmpty>No company found.</CommandEmpty>
                      <CommandGroup>
                        {availableCompanies.map((company) => (
                          <CommandItem
                            key={company.companyName}
                            value={company.companyName}
                            onSelect={(currentValue) => {
                              handleCompanyChange(currentValue);
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCompany === company.companyName ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {company.companyName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">Contact Information</h3>
              
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};