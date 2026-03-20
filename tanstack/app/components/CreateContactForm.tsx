import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { CompanyContact } from '@/types';
import { getCountryByCode } from '@/data/Countries';
import { fetchStatesProvinces, hasStatesProvinces, type StateProvince } from '@/data/StatesProvinces';
import { applyPhoneMask, validatePhone, applyZipMask, validateZip } from '@/utils/phoneValidation';
import contactTypesData from '@/data/ContactTypes.json';
import mailCodesData from '@/data/MailCodes.json';
import { X, Check, UserPlus, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { contactSchema, CONTACT_DEFAULTS, type ContactInput } from '@/lib/schemas/contact';

interface Division {
  code: string;
  name: string;
}

interface CreateContactFormProps {
  availableDivisions: Division[];
  countryCode: string;
  companyId: string;
  onSave: (contact: CompanyContact) => void;
  onCancel: () => void;
}

export const CreateContactForm = ({ availableDivisions, countryCode, companyId, onSave, onCancel }: CreateContactFormProps) => {
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: CONTACT_DEFAULTS,
  });

  const [additionalFieldsOpen, setAdditionalFieldsOpen] = useState(false);
  const [mailCodesPopoverOpen, setMailCodesPopoverOpen] = useState(false);
  const [availableStates, setAvailableStates] = useState<StateProvince[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);

  const mobilePhone = watch('mobilePhone');
  const businessPhone = watch('businessPhone');
  const phone = watch('phone');
  const fax = watch('fax');
  const divisionIds = watch('divisionIds');
  const addressType = watch('addressType');
  const stateCode = watch('stateCode');
  const zipCodeVal = watch('zipCode');
  const mailCodes = watch('mailCodes');

  const selectedCountry = useMemo(() => getCountryByCode(countryCode), [countryCode]);
  const hasMaskedCountry = ['US', 'CA', 'AU'].includes(countryCode);
  const zipLabel = selectedCountry?.zipLabel || 'ZIP Code';
  const stateLabel = selectedCountry?.stateLabel || 'State';
  const showStateField = hasStatesProvinces(countryCode);

  useEffect(() => {
    if (hasStatesProvinces(countryCode)) {
      setStatesLoading(true);
      fetchStatesProvinces(countryCode).then(states => {
        setAvailableStates(states);
        setStatesLoading(false);
      });
    } else {
      setAvailableStates([]);
    }
  }, [countryCode]);

  const handlePhoneChange = (value: string, field: 'mobilePhone' | 'businessPhone' | 'phone' | 'fax') => {
    setValue(field, hasMaskedCountry ? applyPhoneMask(value, countryCode) : value);
  };

  const handleZipChange = (value: string) => {
    setValue('zipCode', hasMaskedCountry ? applyZipMask(value, countryCode) : value);
  };

  const toggleDivision = (code: string) => {
    setValue('divisionIds', divisionIds.includes(code) ? divisionIds.filter(d => d !== code) : [...divisionIds, code]);
  };

  const toggleMailCode = (code: string) => {
    setValue('mailCodes', mailCodes.includes(code) ? mailCodes.filter(c => c !== code) : [...mailCodes, code]);
  };

  const removeMailCode = (code: string) => {
    setValue('mailCodes', mailCodes.filter(c => c !== code));
  };

  const onSubmit = (data: ContactInput) => {
    // Additional phone/zip validation with country context
    if (hasMaskedCountry) {
      if (data.mobilePhone && !validatePhone(data.mobilePhone, countryCode)) {
        toast({ title: 'Validation Error', description: 'Invalid mobile phone format.', variant: 'destructive' }); return;
      }
      if (data.businessPhone && !validatePhone(data.businessPhone, countryCode)) {
        toast({ title: 'Validation Error', description: 'Invalid business phone format.', variant: 'destructive' }); return;
      }
      if (data.phone.trim() && !validatePhone(data.phone, countryCode)) {
        toast({ title: 'Validation Error', description: 'Invalid phone format.', variant: 'destructive' }); return;
      }
      if (data.fax.trim() && !validatePhone(data.fax, countryCode)) {
        toast({ title: 'Validation Error', description: 'Invalid fax format.', variant: 'destructive' }); return;
      }
      if (data.addressType === 'different' && data.zipCode.trim() && !validateZip(data.zipCode, countryCode)) {
        toast({ title: 'Validation Error', description: 'Invalid zip format.', variant: 'destructive' }); return;
      }
    }

    const typeDesc = contactTypesData.find(t => t.code === data.typeCode)?.description;
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
    const isDifferentAddress = data.addressType === 'different';

    const newContact: CompanyContact = {
      id: Date.now(),
      name: fullName,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      title: data.title.trim(),
      typeCode: data.typeCode || undefined,
      typeDescription: typeDesc,
      phone: data.phone || data.mobilePhone,
      mobilePhone: data.mobilePhone,
      businessPhone: data.businessPhone,
      email: data.email.trim(),
      fax: data.fax.trim() || undefined,
      address1: isDifferentAddress ? (data.address1.trim() || undefined) : undefined,
      address2: isDifferentAddress ? (data.address2.trim() || undefined) : undefined,
      address3: isDifferentAddress ? (data.address3.trim() || undefined) : undefined,
      city: isDifferentAddress ? (data.city.trim() || undefined) : undefined,
      state: isDifferentAddress ? (data.stateCode || undefined) : undefined,
      zipCode: isDifferentAddress ? (data.zipCode.trim() || undefined) : undefined,
      mainDivision: data.divisionIds[0],
      divisionIds: data.divisionIds,
      mailCodes: data.mailCodes.length > 0 ? data.mailCodes : undefined,
    };

    console.log('Simulated API payload - Create Contact:', {
      customerId: companyId,
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      name: newContact.name,
      typeCode: newContact.typeCode,
      typeDescription: newContact.typeDescription,
      title: newContact.title,
      phone: newContact.phone,
      mainDivision: newContact.mainDivision,
      divisions: newContact.divisionIds,
      homePhone: newContact.businessPhone,
      mobilePhone: newContact.mobilePhone,
      email: newContact.email,
      fax: newContact.fax || null,
      address1: newContact.address1 || null,
      address2: newContact.address2 || null,
      address3: newContact.address3 || null,
      city: newContact.city || null,
      state: newContact.state || null,
      zipCode: newContact.zipCode || null,
      mailCodes: newContact.mailCodes || [],
    });

    onSave(newContact);
  };

  const onError = () => {
    toast({ title: 'Validation Error', description: 'Please fix the highlighted fields.', variant: 'destructive' });
  };

  const FieldError = ({ name }: { name: keyof ContactInput }) => {
    const error = errors[name];
    return error?.message ? <p className="text-xs text-destructive mt-1">{error.message as string}</p> : null;
  };

  const phonePlaceholder = selectedCountry?.phoneMask || 'Phone number';

  return (
    <Card className="p-4 border-dashed">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium">Create New Contact</h4>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">First Name <span className="text-destructive">*</span></Label>
            <Input {...register('firstName')} placeholder="First name" className={`h-8 ${errors.firstName ? 'border-destructive' : ''}`} />
            <FieldError name="firstName" />
          </div>
          <div>
            <Label className="text-xs">Last Name <span className="text-destructive">*</span></Label>
            <Input {...register('lastName')} placeholder="Last name" className={`h-8 ${errors.lastName ? 'border-destructive' : ''}`} />
            <FieldError name="lastName" />
          </div>
        </div>

        {/* Title & Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Title <span className="text-destructive">*</span></Label>
            <Input {...register('title')} placeholder="Job title" className={`h-8 ${errors.title ? 'border-destructive' : ''}`} />
            <FieldError name="title" />
          </div>
          <div>
            <Label className="text-xs">Contact Type</Label>
            <Select value={watch('typeCode')} onValueChange={(v) => setValue('typeCode', v)}>
              <SelectTrigger className="h-8"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {contactTypesData.map(t => (
                  <SelectItem key={t.code} value={t.code}>{t.description}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Phones */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Mobile Phone <span className="text-destructive">*</span></Label>
            <Input value={mobilePhone} onChange={e => handlePhoneChange(e.target.value, 'mobilePhone')} placeholder={phonePlaceholder} className={`h-8 ${errors.mobilePhone ? 'border-destructive' : ''}`} />
            <FieldError name="mobilePhone" />
          </div>
          <div>
            <Label className="text-xs">Business Phone <span className="text-destructive">*</span></Label>
            <Input value={businessPhone} onChange={e => handlePhoneChange(e.target.value, 'businessPhone')} placeholder={phonePlaceholder} className={`h-8 ${errors.businessPhone ? 'border-destructive' : ''}`} />
            <FieldError name="businessPhone" />
          </div>
        </div>

        {/* Email & Main Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Email <span className="text-destructive">*</span></Label>
            <Input type="email" {...register('email')} placeholder="email@example.com" className={`h-8 ${errors.email ? 'border-destructive' : ''}`} />
            <FieldError name="email" />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input value={phone} onChange={e => handlePhoneChange(e.target.value, 'phone')} placeholder={phonePlaceholder} className={`h-8 ${errors.phone ? 'border-destructive' : ''}`} />
            <FieldError name="phone" />
          </div>
        </div>

        {/* Fax */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Fax</Label>
            <Input value={fax} onChange={e => handlePhoneChange(e.target.value, 'fax')} placeholder={phonePlaceholder} className={`h-8 ${errors.fax ? 'border-destructive' : ''}`} />
            <FieldError name="fax" />
          </div>
        </div>

        {/* Divisions */}
        <div>
          <Label className="text-xs">Division(s) <span className="text-destructive">*</span></Label>
          <div className={`flex gap-1.5 flex-wrap mt-1 ${errors.divisionIds ? 'ring-1 ring-destructive rounded p-1' : ''}`}>
            {availableDivisions.map(div => (
              <Badge
                key={div.code}
                variant={divisionIds.includes(div.code) ? "default" : "outline"}
                className="cursor-pointer text-xs px-2 py-0.5 select-none"
                onClick={() => toggleDivision(div.code)}
              >
                {div.code} – {div.name}
              </Badge>
            ))}
          </div>
          <FieldError name="divisionIds" />
        </div>

        <Separator />

        {/* Address Toggle */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</h5>
          <div className="flex rounded-md border border-border overflow-hidden w-fit">
            <Button
              type="button"
              size="sm"
              variant={addressType === 'same' ? 'default' : 'ghost'}
              className="rounded-none h-8 text-xs"
              onClick={() => {
                setValue('addressType', 'same');
                setValue('address1', ''); setValue('address2', ''); setValue('address3', '');
                setValue('city', ''); setValue('stateCode', ''); setValue('zipCode', '');
              }}
            >
              Same as Company
            </Button>
            <Button
              type="button"
              size="sm"
              variant={addressType === 'different' ? 'default' : 'ghost'}
              className="rounded-none h-8 text-xs"
              onClick={() => setValue('addressType', 'different')}
            >
              Different Address
            </Button>
          </div>

          {addressType === 'different' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Address Line 1</Label>
                <Input {...register('address1')} placeholder="Street address" className="h-8" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Address Line 2</Label>
                  <Input {...register('address2')} placeholder="Suite, unit, etc." className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Address Line 3</Label>
                  <Input {...register('address3')} placeholder="Additional info" className="h-8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">City</Label>
                  <Input {...register('city')} placeholder="City" className="h-8" />
                </div>
                {showStateField ? (
                  <div>
                    <Label className="text-xs">{stateLabel}</Label>
                    <Select value={stateCode} onValueChange={(v) => setValue('stateCode', v)} disabled={statesLoading}>
                      <SelectTrigger className="h-8"><SelectValue placeholder={`Select ${stateLabel.toLowerCase()}`} /></SelectTrigger>
                      <SelectContent>
                        {availableStates.map(s => (
                          <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs">{stateLabel}</Label>
                    <Input {...register('stateCode')} placeholder={stateLabel} className="h-8" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{zipLabel}</Label>
                  <Input value={zipCodeVal} onChange={e => handleZipChange(e.target.value)} placeholder={selectedCountry?.zipMask || zipLabel} className={`h-8 ${errors.zipCode ? 'border-destructive' : ''}`} />
                  <FieldError name="zipCode" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Fields (collapsible) */}
        <Collapsible open={additionalFieldsOpen} onOpenChange={setAdditionalFieldsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground px-0">
              {additionalFieldsOpen ? <ChevronDown className="h-3.5 w-3.5 mr-1.5" /> : <ChevronRight className="h-3.5 w-3.5 mr-1.5" />}
              Additional Fields
              {mailCodes.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{mailCodes.length}</Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Mail Codes</Label>
              <Popover open={mailCodesPopoverOpen} onOpenChange={setMailCodesPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs font-normal mt-1">
                    {mailCodes.length === 0 ? 'Select mail codes...' : `${mailCodes.length} selected`}
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search mail codes..." className="h-8" />
                    <CommandList>
                      <CommandEmpty>No mail codes found.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {mailCodesData.map(mc => (
                          <CommandItem
                            key={mc.code}
                            value={`${mc.code} ${mc.description}`}
                            onSelect={() => toggleMailCode(mc.code)}
                            className="text-xs"
                          >
                            <Checkbox
                              checked={mailCodes.includes(mc.code)}
                              className="mr-2 h-3.5 w-3.5"
                            />
                            <span className="font-mono font-medium mr-2">{mc.code}</span>
                            <span className="text-muted-foreground truncate">{mc.description}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {mailCodes.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {mailCodes.map(code => {
                    const mc = mailCodesData.find(m => m.code === code);
                    return (
                      <Badge key={code} variant="secondary" className="text-[10px] px-1.5 py-0.5 gap-1">
                        <span className="font-mono">{code}</span>
                        <button type="button" onClick={() => removeMailCode(code)} className="ml-0.5 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" type="submit">
            <Check className="h-4 w-4 mr-1" /> Create Contact
          </Button>
        </div>
      </form>
    </Card>
  );
};
