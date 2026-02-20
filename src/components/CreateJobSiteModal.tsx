import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown, CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CreateJobSiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateJobSiteModal = ({ open, onOpenChange }: CreateJobSiteModalProps) => {
  const { createJobSite, salesReps, getSalesRepName, getSalesRepNames } = useData();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('Active');
  const [salesRepIds, setSalesRepIds] = useState<number[]>([]);
  const [salesRepOpen, setSalesRepOpen] = useState(false);
  const [plannedAnnualRate, setPlannedAnnualRate] = useState('0');
  const [parStartDate, setParStartDate] = useState<Date | undefined>(undefined);
  const [parStartDateOpen, setParStartDateOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [locationType, setLocationType] = useState<'address' | 'coordinates'>('address');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatusId('Active');
    setSalesRepIds([]);
    setPlannedAnnualRate('0');
    setParStartDate(undefined);
    setContactName('');
    setContactTitle('');
    setContactPhone('');
    setContactEmail('');
    setLocationType('address');
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('USA');
    setLatitude('');
    setLongitude('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job site name.",
        variant: "destructive"
      });
      return;
    }

    if (salesRepIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one sales rep.",
        variant: "destructive"
      });
      return;
    }

    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all primary contact fields.",
        variant: "destructive"
      });
      return;
    }

    if (locationType === 'address') {
      if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all address fields.",
          variant: "destructive"
        });
        return;
      }
    } else {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        toast({
          title: "Error",
          description: "Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180).",
          variant: "destructive"
        });
        return;
      }
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

    createJobSite({
      name: name.trim(),
      description: description.trim(),
      statusId,
      salesRepIds,
      plannedAnnualRate: parsedRate,
      parStartDate: parStartDate ? parStartDate.toISOString() : undefined,
      projectPrimaryContact: {
        name: contactName.trim(),
        title: contactTitle.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim()
      },
      address: locationType === 'address' 
        ? {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
            country: country.trim(),
            latitude: 0,
            longitude: 0
          }
        : {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
      siteCompanies: [],
      associatedOpportunities: [],
      notes: [],
      activities: []
    });

    toast({
      title: "Success",
      description: `Job site "${name.trim()}" created successfully.`
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Site</DialogTitle>
          <DialogDescription>
            Enter the details for the new job site.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 pb-4 border-b">
            <h3 className="font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Job Site Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter job site name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={statusId} onValueChange={setStatusId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salesRep">Assigned Sales Rep(s) *</Label>
                <Popover open={salesRepOpen} onOpenChange={setSalesRepOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={salesRepOpen}
                      className="w-full justify-between h-auto min-h-10"
                    >
                      <div className="flex flex-wrap gap-1">
                        {salesRepIds.length > 0
                          ? salesRepIds.map(id => (
                              <span key={id} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                                {getSalesRepName(id)}
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSalesRepIds(prev => prev.filter(r => r !== id));
                                  }}
                                />
                              </span>
                            ))
                          : <span className="text-muted-foreground">Select sales reps...</span>}
                      </div>
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
                                setSalesRepIds(prev =>
                                  prev.includes(rep.salesrepid)
                                    ? prev.filter(id => id !== rep.salesrepid)
                                    : [...prev, rep.salesrepid]
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  salesRepIds.includes(rep.salesrepid) ? "opacity-100" : "opacity-0"
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
                <Label htmlFor="plannedAnnualRate">Planned Annual Rate *</Label>
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

            <div className="space-y-2">
              <Label>PAR Start Date</Label>
              <Popover open={parStartDateOpen} onOpenChange={setParStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !parStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {parStartDate ? format(parStartDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parStartDate}
                    onSelect={(date) => {
                      setParStartDate(date);
                      setParStartDateOpen(false);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4 pb-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Location</h3>
              <div className="flex rounded-md border border-input overflow-hidden">
                <Button
                  type="button"
                  variant={locationType === 'address' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none h-7 text-xs"
                  onClick={() => setLocationType('address')}
                >
                  Address
                </Button>
                <Button
                  type="button"
                  variant={locationType === 'coordinates' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none h-7 text-xs"
                  onClick={() => setLocationType('coordinates')}
                >
                  Coordinates
                </Button>
              </div>
            </div>
            
            {locationType === 'address' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="123 Main Street"
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="12345"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="USA"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="-90 to 90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-180 to 180"
                  />
                </div>
              </div>
            )}
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
            <Button type="submit">Create Job Site</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};