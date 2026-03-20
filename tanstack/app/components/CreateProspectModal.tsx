import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DIVISIONS } from '@/lib/constants';
import { countries, pinnedCountryCodes, getCountryByCode, type Country } from '@/data/Countries';
import { fetchStatesProvinces, hasStatesProvinces, type StateProvince } from '@/data/StatesProvinces';
import { RoleMultiSelect } from '@/components/RoleMultiSelect';
import { applyPhoneMask, applyZipMask } from '@/utils/phoneValidation';
import { prospectSchema, PROSPECT_DEFAULTS, type ProspectInput } from '@/lib/schemas/prospect';

// TODO: Replace with actual API call
const createCompanyApi = async (data: ProspectData): Promise<string> => {
  console.log('[API STUB] Creating company:', data);
  await new Promise(resolve => setTimeout(resolve, 500));
  const companyId = `PROSPECT-${Date.now()}`;
  return companyId;
};

interface CreateProspectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProspectData) => void;
}

export interface ProspectData {
  companyName: string;
  phone: string;
  divisionIds: string[];
  roleIds: string[];
  address1: string;
  address2: string;
  address3: string;
  city: string;
  stateCode: string;
  zipCode: string;
  countryCode: string;
  contact: {
    firstName: string;
    lastName: string;
    title: string;
    mobilePhone: string;
    businessPhone: string;
    email: string;
  };
}

// ---- Searchable Combobox ----
interface SearchableSelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string; pinned?: boolean }[];
  placeholder: string;
  emptyText?: string;
  disabled?: boolean;
}

const SearchableSelect = ({ value, onValueChange, options, placeholder, emptyText = 'No results.', disabled }: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled}
          className="w-full justify-between font-normal h-10">
          <span className={cn(!selectedLabel && 'text-muted-foreground')}>
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option, idx) => (
                <span key={option.value}>
                  {option.pinned && idx > 0 && !options[idx - 1]?.pinned && <Separator className="my-1" />}
                  {!option.pinned && idx > 0 && options[idx - 1]?.pinned && <Separator className="my-1" />}
                  <CommandItem value={option.label} onSelect={() => { onValueChange(option.value); setOpen(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                </span>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ---- Main component ----

export const CreateProspectModal = ({ open, onOpenChange, onSave }: CreateProspectModalProps) => {
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ProspectInput>({
    resolver: zodResolver(prospectSchema),
    defaultValues: PROSPECT_DEFAULTS,
  });

  const [divisionOpen, setDivisionOpen] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [availableStates, setAvailableStates] = useState<StateProvince[]>([]);

  const countryCode = watch('countryCode');
  const divisionIds = watch('divisionIds');
  const selectedRoles = watch('selectedRoles');
  const phone = watch('phone');
  const mobilePhone = watch('mobilePhone');
  const businessPhone = watch('businessPhone');
  const zipCode = watch('zipCode');

  const selectedCountry = useMemo(() => getCountryByCode(countryCode), [countryCode]);
  const hasMaskedCountry = ['US', 'CA', 'AU'].includes(countryCode);
  const zipLabel = selectedCountry?.zipLabel || 'ZIP Code';
  const stateLabel = selectedCountry?.stateLabel || 'State';
  const isStateRequired = selectedCountry?.stateRequired ?? false;
  const showStateField = hasStatesProvinces(countryCode);

  // Load states when country changes
  useEffect(() => {
    setValue('stateCode', '');
    if (hasStatesProvinces(countryCode)) {
      setStatesLoading(true);
      fetchStatesProvinces(countryCode).then(states => {
        setAvailableStates(states);
        setStatesLoading(false);
      });
    } else {
      setAvailableStates([]);
    }
  }, [countryCode, setValue]);

  // Re-apply masks when country changes
  useEffect(() => {
    if (hasMaskedCountry) {
      setValue('phone', applyPhoneMask(phone, countryCode));
      setValue('mobilePhone', applyPhoneMask(mobilePhone, countryCode));
      if (businessPhone) setValue('businessPhone', applyPhoneMask(businessPhone, countryCode));
      setValue('zipCode', applyZipMask(zipCode, countryCode));
    }
  }, [countryCode]);

  const countryOptions = useMemo(() =>
    countries.map(c => ({
      value: c.code,
      label: c.name,
      pinned: pinnedCountryCodes.includes(c.code),
    })), []);

  const stateOptions = useMemo(() =>
    availableStates.map(s => ({ value: s.code, label: s.name })), [availableStates]);

  const handlePhoneChange = (value: string, field: 'phone' | 'mobilePhone' | 'businessPhone') => {
    setValue(field, hasMaskedCountry ? applyPhoneMask(value, countryCode) : value);
  };

  const handleZipChange = (value: string) => {
    setValue('zipCode', hasMaskedCountry ? applyZipMask(value, countryCode) : value);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset(PROSPECT_DEFAULTS);
    onOpenChange(isOpen);
  };

  const onSubmit = (data: ProspectInput) => {
    const companyData: ProspectData = {
      companyName: data.companyName.trim(),
      phone: data.phone,
      divisionIds: data.divisionIds,
      roleIds: data.selectedRoles,
      address1: data.address1.trim(),
      address2: data.address2.trim(),
      address3: data.address3.trim(),
      city: data.city.trim(),
      stateCode: data.stateCode,
      zipCode: data.zipCode,
      countryCode: data.countryCode,
      contact: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        title: data.title.trim(),
        mobilePhone: data.mobilePhone,
        businessPhone: data.businessPhone,
        email: data.email.trim(),
      },
    };

    createCompanyApi(companyData);
    onSave(companyData);
    reset(PROSPECT_DEFAULTS);
    onOpenChange(false);
    toast({ title: 'Success', description: 'Prospect created successfully.' });
  };

  const onError = () => {
    toast({ title: 'Validation Error', description: 'Please fix the highlighted fields.', variant: 'destructive' });
  };

  const FieldError = ({ name }: { name: keyof ProspectInput }) => {
    const error = errors[name];
    return error?.message ? <p className="text-xs text-destructive mt-1">{error.message as string}</p> : null;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Prospect</DialogTitle>
          <DialogDescription>Add a new prospect company with a primary contact.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Company Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Company Name <span className="text-destructive">*</span></Label>
                <Input {...register('companyName')} placeholder="Company name" className={errors.companyName ? 'border-destructive' : ''} />
                <FieldError name="companyName" />
              </div>
              <div>
                <Label>Division(s) <span className="text-destructive">*</span></Label>
                <Popover open={divisionOpen} onOpenChange={setDivisionOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-between font-normal h-10", errors.divisionIds && "border-destructive")}>
                      <span className={cn(divisionIds.length === 0 && "text-muted-foreground")}>
                        {divisionIds.length === 0
                          ? "Select divisions"
                          : divisionIds.length <= 3
                            ? divisionIds.join(', ')
                            : `${divisionIds.length} selected`}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                    <div className="space-y-0.5">
                      {DIVISIONS.map(div => (
                        <label key={div.code} className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground">
                          <Checkbox
                            checked={divisionIds.includes(div.code)}
                            onCheckedChange={(checked) => {
                              setValue('divisionIds',
                                checked ? [...divisionIds, div.code] : divisionIds.filter(c => c !== div.code)
                              );
                            }}
                          />
                          <span>{div.code} - {div.name}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <FieldError name="divisionIds" />
              </div>
              <div>
                <Label>Role(s) <span className="text-destructive">*</span></Label>
                <RoleMultiSelect
                  selectedRoles={selectedRoles}
                  onRolesChange={(roles) => setValue('selectedRoles', roles)}
                  placeholder="Select role(s)..."
                  required
                />
                <FieldError name="selectedRoles" />
              </div>
              <div>
                <Label>Phone Number <span className="text-destructive">*</span></Label>
                <Input value={phone} onChange={e => handlePhoneChange(e.target.value, 'phone')}
                  placeholder={selectedCountry?.phoneMask || 'Phone number'}
                  className={errors.phone ? 'border-destructive' : ''} />
                <FieldError name="phone" />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Address</h3>
            {errors.address1?.type === 'custom' && (
              <p className="text-xs text-destructive">{errors.address1.message}</p>
            )}
            <div className="space-y-3">
              <div>
                <Label>Address Line 1</Label>
                <Input {...register('address1')} placeholder="Street address" className={errors.address1 ? 'border-destructive' : ''} />
              </div>
              <div>
                <Label>Address Line 2</Label>
                <Input {...register('address2')} placeholder="Suite, unit, etc." />
              </div>
              <div>
                <Label>Address Line 3</Label>
                <Input {...register('address3')} placeholder="Additional address info" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Country <span className="text-destructive">*</span></Label>
                <SearchableSelect value={countryCode} onValueChange={(v) => setValue('countryCode', v)}
                  options={countryOptions} placeholder="Select country" emptyText="No countries found." />
                <FieldError name="countryCode" />
              </div>
              {showStateField && (
                <div>
                  <Label>{stateLabel} {isStateRequired && <span className="text-destructive">*</span>}</Label>
                  <SearchableSelect value={watch('stateCode')} onValueChange={(v) => setValue('stateCode', v)}
                    options={stateOptions} placeholder={`Select ${stateLabel.toLowerCase()}`}
                    disabled={statesLoading} emptyText={`No ${stateLabel.toLowerCase()}s found.`} />
                  <FieldError name="stateCode" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>City <span className="text-destructive">*</span></Label>
                <Input {...register('city')} placeholder="City" className={errors.city ? 'border-destructive' : ''} />
                <FieldError name="city" />
              </div>
              <div>
                <Label>{zipLabel} <span className="text-destructive">*</span></Label>
                <Input value={zipCode} onChange={e => handleZipChange(e.target.value)}
                  placeholder={selectedCountry?.zipMask || 'ZIP / Postal code'}
                  className={errors.zipCode ? 'border-destructive' : ''} />
                <FieldError name="zipCode" />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Primary Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input {...register('firstName')} placeholder="First name" className={errors.firstName ? 'border-destructive' : ''} />
                <FieldError name="firstName" />
              </div>
              <div>
                <Label>Last Name <span className="text-destructive">*</span></Label>
                <Input {...register('lastName')} placeholder="Last name" className={errors.lastName ? 'border-destructive' : ''} />
                <FieldError name="lastName" />
              </div>
            </div>
            <div>
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input {...register('title')} placeholder="Job title" className={errors.title ? 'border-destructive' : ''} />
              <FieldError name="title" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Mobile Phone <span className="text-destructive">*</span></Label>
                <Input value={mobilePhone} onChange={e => handlePhoneChange(e.target.value, 'mobilePhone')}
                  placeholder={selectedCountry?.phoneMask || 'Mobile phone'}
                  className={errors.mobilePhone ? 'border-destructive' : ''} />
                <FieldError name="mobilePhone" />
              </div>
              <div>
                <Label>Business Phone</Label>
                <Input value={businessPhone} onChange={e => handlePhoneChange(e.target.value, 'businessPhone')}
                  placeholder={selectedCountry?.phoneMask || 'Business phone (optional)'}
                  className={errors.businessPhone ? 'border-destructive' : ''} />
                <FieldError name="businessPhone" />
              </div>
            </div>
            <div>
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input type="email" {...register('email')} placeholder="email@example.com" className={errors.email ? 'border-destructive' : ''} />
              <FieldError name="email" />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Prospect</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
