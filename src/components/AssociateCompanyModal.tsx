import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssociateCompanyModalProps {
  siteId: number;
  currentCompanyNames: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_OPTIONS = [
  { id: 'SUB_PLUMBING', label: 'Plumbing Subcontractor' },
  { id: 'SUB_ELECTRICAL', label: 'Electrical Subcontractor' },
  { id: 'SUB_HVAC', label: 'HVAC Subcontractor' },
  { id: 'SUB_CONCRETE', label: 'Concrete Subcontractor' },
  { id: 'SUB_FRAMING', label: 'Framing Subcontractor' },
  { id: 'SUB_ROOFING', label: 'Roofing Subcontractor' },
  { id: 'SUB_DRYWALL', label: 'Drywall Subcontractor' },
  { id: 'SUB_PAINTING', label: 'Painting Subcontractor' },
  { id: 'SUB_FLOORING', label: 'Flooring Subcontractor' },
  { id: 'SUPPLIER', label: 'Supplier' },
  { id: 'ARCHITECT', label: 'Architect' },
  { id: 'ENGINEER', label: 'Engineer' },
  { id: 'OTHER', label: 'Other' },
];

export const AssociateCompanyModal = ({ siteId, currentCompanyNames, open, onOpenChange }: AssociateCompanyModalProps) => {
  const { jobSites, addSiteCompany } = useData();
  const { toast } = useToast();
  
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // Get all unique companies from all job sites, excluding current site's companies
  const availableCompanies = useMemo(() => {
    const companiesMap = new Map();
    
    jobSites.forEach(site => {
      site.siteCompanies.forEach(company => {
        if (!currentCompanyNames.includes(company.companyName)) {
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
  }, [jobSites, currentCompanyNames]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompany || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please select both a company and a role.",
        variant: "destructive"
      });
      return;
    }

    const company = availableCompanies.find(c => c.companyName === selectedCompany);
    if (!company) return;

    const roleOption = ROLE_OPTIONS.find(r => r.id === selectedRole);
    if (!roleOption) return;

    const newCompany = {
      companyName: company.companyName,
      roleId: selectedRole,
      roleDescription: roleOption.label,
      isPrimaryContact: isPrimaryContact,
      companyContact: company.companyContact
    };

    addSiteCompany(siteId, newCompany);
    
    toast({
      title: "Success",
      description: `${company.companyName} associated as ${roleOption.label}.`
    });

    setSelectedCompany('');
    setSelectedRole('');
    setIsPrimaryContact(false);
    setComboboxOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Associate Existing Company</DialogTitle>
          <DialogDescription>
            Associate an existing company from another job site as a subcontractor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {availableCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No companies available. All companies from other job sites are already associated.
              </p>
            ) : (
              <>
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
                                  setSelectedCompany(currentValue === selectedCompany ? "" : currentValue);
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

                <div className="grid gap-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="primary" 
                    checked={isPrimaryContact}
                    onCheckedChange={(checked) => setIsPrimaryContact(checked === true)}
                  />
                  <Label 
                    htmlFor="primary" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Set as primary contact for this role
                  </Label>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={availableCompanies.length === 0}>
              Associate Company
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
