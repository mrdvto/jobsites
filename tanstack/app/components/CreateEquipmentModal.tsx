import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar as CalendarIcon, Check, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProjectCompany, CustomerEquipment } from '@/types';
import { createEquipmentSchema, EQUIPMENT_DEFAULTS, type CreateEquipmentInput } from '@/lib/schemas/equipment';

// ── API Stubs ──

interface LookupOption {
  value: string;
  description: string;
}

interface FPCOption {
  value: string;
  text: string;
  oems: string[];
}

const fetchMakes = async (): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching makes');
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: 'AA', description: 'Caterpillar' },
    { value: 'YD', description: 'Volvo CE' },
    { value: 'AM', description: 'Case Construction' },
  ];
};

const ALL_FPCS: FPCOption[] = [
  { value: 'Q', text: 'ADT(ARTICULATED DUMP) & MINING TRUCKS', oems: ['YD', 'AA'] },
  { value: 'O', text: 'BACKHOE LOADERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'F', text: 'EXCAVATORS, SHOVELS AND DRAGLINE', oems: ['YD', 'AA', 'AM'] },
  { value: '9', text: 'MANTSINEN MATERIAL HANDLER', oems: ['YD', 'AA'] },
  { value: '8', text: 'MISC PRODUCT TYPE', oems: ['YD', 'AA', 'AM'] },
  { value: 'H', text: 'MOTOR GRADERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'J', text: 'OFF-HIGHWAY TRUCKS', oems: ['YD', 'AA', 'AM'] },
  { value: 'P', text: 'PAVERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'N', text: 'PROFILERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'R', text: 'ROLLERS', oems: ['YD', 'AA', 'AM'] },
  { value: '6', text: 'SURFACE MINING PRODUCTS', oems: ['YD', 'AA'] },
  { value: 'Y', text: 'TELESCOPIC HANDLERS', oems: ['YD', 'AA'] },
  { value: 'C', text: 'TRACK TYPE LOADERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'A', text: 'TRACK TYPE TRACTORS', oems: ['YD', 'AA', 'AM'] },
  { value: 'T', text: 'TRAILERS', oems: ['YD', 'AA'] },
  { value: '7', text: 'UNDERGROUND MINING PRODUCTS', oems: ['YD', 'AA', 'AM'] },
  { value: 'E', text: 'WHEEL DOZERS AND COMPACTORS', oems: ['YD', 'AA', 'AM'] },
  { value: '2', text: 'WHEEL HYD EXCAVATORS', oems: ['YD', 'AA', 'AM'] },
  { value: 'G', text: 'WHEEL SCRAPERS', oems: ['YD', 'AA', 'AM'] },
  { value: 'K', text: 'WHEEL SKIDDERS & FOREST PRODUCTS', oems: ['YD', 'AA', 'AM'] },
  { value: 'D', text: 'WHEEL TYPE LOADERS', oems: ['YD', 'AA', 'AM'] },
];

const fetchFPCs = async (makeId: string): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching FPCs for make:', makeId);
  await new Promise(r => setTimeout(r, 100));
  return ALL_FPCS
    .filter(f => f.oems.includes(makeId))
    .map(f => ({ value: f.value, description: f.text }));
};

const fetchCompatibilityCodes = async (fpcId: string): Promise<LookupOption[]> => {
  console.log('[API STUB] Fetching compatibility codes for FPC:', fpcId);
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: '0V2319', description: '0V2319' },
    { value: '414', description: '414' },
    { value: '415', description: '415' },
    { value: '416', description: '416' },
    { value: '420', description: '420' },
    { value: '422', description: '422' },
    { value: '424', description: '424' },
    { value: '426', description: '426' },
    { value: '427', description: '427' },
    { value: '428', description: '428' },
    { value: '430', description: '430' },
    { value: '432', description: '432' },
    { value: '434', description: '434' },
    { value: '436', description: '436' },
    { value: '438', description: '438' },
    { value: '440', description: '440' },
    { value: '442', description: '442' },
    { value: '444', description: '444' },
    { value: '446', description: '446' },
    { value: '450', description: '450' },
    { value: '7155', description: '7155' },
    { value: 'C11', description: 'C11' },
    { value: 'C13', description: 'C13' },
    { value: 'C7', description: 'C7' },
    { value: 'CSG6491', description: 'CSG6491' },
    { value: 'CX31P600', description: 'CX31P600' },
    { value: 'FORKLIFT', description: 'FORKLIFT' },
    { value: 'INDFAN', description: 'INDFAN' },
    { value: 'OEM SOL', description: 'OEM SOL' },
    { value: 'PSDBULK', description: 'PSDBULK' },
    { value: 'PSDMISC', description: 'PSDMISC' },
    { value: 'PVALVE', description: 'PVALVE' },
    { value: 'SPILL BERM', description: 'SPILL BERM' },
  ];
};

const fetchPrincipalWorkCodes = async (): Promise<LookupOption[]> => {
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: '105', description: 'SPECIALTY CROPS' },
    { value: '110', description: 'CROP PRODUCTION' },
    { value: '120', description: 'LAND IMPROVEMENT' },
    { value: '128', description: 'LIVESTOCK PRODUCTION' },
    { value: '130', description: 'LIVESTOCK/CROP PRODUCTION' },
    { value: '131', description: 'DAIRY FARMS' },
    { value: '132', description: 'DAIRY FARMS/CROP PRODUCTION' },
    { value: '140', description: 'CUSTOM OPERATORS' },
    { value: '150', description: 'NURSERIES' },
    { value: '155', description: 'LANDSCAPING' },
    { value: '160', description: 'HOBBY FARMING' },
    { value: 'K63', description: 'HYDRAULIC POWER UNITS' },
    { value: 'K64', description: 'LAWN AND GARDEN' },
    { value: 'K65', description: 'LIGHT PLANTS/TOWERS' },
    { value: 'K66', description: 'REFRIGERATION/AC' },
    { value: 'K67', description: 'SCRUBBERS/SWEEPERS' },
    { value: 'K68', description: 'WELDERS' },
    { value: 'K69', description: 'OTHER GENERAL INDUSTRIAL' },
    { value: 'L11', description: 'LOCOMOTIVE' },
    { value: 'L12', description: 'RAIL WAY HEAD END POWER' },
    { value: 'L13', description: 'RAIL MAINTENANCE EQUIPMENT' },
    { value: 'L14', description: 'DIESEL MULTIPLE UNITS/ RAILCARS' },
  ];
};

const fetchApplicationCodes = async (): Promise<LookupOption[]> => {
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: '1', description: 'Light' },
    { value: '2', description: 'Medium' },
    { value: '3', description: 'Heavy' },
  ];
};

const fetchEngineMakes = async (): Promise<LookupOption[]> => {
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: 'AA', description: 'Caterpillar' },
    { value: '2C', description: 'Doosan' },
    { value: 'DW', description: 'Daewoo' },
  ];
};

const fetchIndustryGroups = async (): Promise<LookupOption[]> => {
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: '199', description: 'Agriculture' },
    { value: '388', description: 'Automotive/Truck Services' },
    { value: '305', description: 'Commercial Services' },
    { value: '392', description: 'Electric Power' },
    { value: '207', description: 'Equipment Services' },
    { value: '203', description: 'Forestry' },
    { value: '257', description: 'Government' },
    { value: '202', description: 'Industrial' },
    { value: '391', description: 'Industrial Engines' },
    { value: '198', description: 'Large Contractor (Heavy Const)' },
    { value: '200', description: 'Local Contractor (General Con)' },
    { value: '306', description: 'Marine' },
    { value: '204', description: 'Mining' },
    { value: '307', description: 'Oil & Gas' },
    { value: '262', description: 'Pipeline' },
    { value: '205', description: 'Quarry & Aggregates' },
    { value: '308', description: 'Transportation' },
    { value: '206', description: 'Waste' },
  ];
};

const fetchIndustryCodes = async (groupId: string): Promise<LookupOption[]> => {
  await new Promise(r => setTimeout(r, 100));
  return [
    { value: 'LG40', description: 'ASPHALT PRODUCTION' },
    { value: 'LG25', description: 'BRIDGE & ELEVATED HIGHWAY CONSTRUCT' },
    { value: 'LG35', description: 'COMMERCIAL CONTRACTORS' },
    { value: 'LG50', description: 'EXPLORATION & DRILLING CONTRACTORS' },
    { value: 'LG30', description: 'GENERAL EXCAVATION - LARGE CONTRACTR' },
    { value: 'LG15', description: 'LANDSCAPING - LARGE CONTRACTOR' },
    { value: 'LG95', description: 'MANUFACTURER OF SPECIALTY EQUIPMENT' },
    { value: 'LG45', description: 'PAVING/RESURFACING -HIGHWAY & STREET' },
    { value: 'LG20', description: 'ROAD CONSTRUCTION - LARGE CONTRACTOR' },
    { value: 'LG10', description: 'SITE DEVELOPMENT' },
    { value: 'LG70', description: 'UTILITIES CONTRACTORS' },
  ];
};

const createEquipmentApi = async (data: Record<string, unknown>): Promise<number> => {
  console.log('[API STUB] Creating equipment:', data);
  await new Promise(r => setTimeout(r, 300));
  return Math.floor(Math.random() * 10000) + 5000;
};

const associateEquipmentToProjectApi = async (projectId: number, equipmentId: number): Promise<void> => {
  console.log('[API STUB] Associating equipment', equipmentId, 'to project', projectId);
  await new Promise(r => setTimeout(r, 200));
};

// ── Searchable Combobox ──

interface SearchableSelectProps {
  options: LookupOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabledPlaceholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  formatLabel?: (opt: LookupOption) => string;
}

function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  disabledPlaceholder,
  disabled = false,
  hasError = false,
  formatLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const getLabel = (opt: LookupOption) =>
    formatLabel ? formatLabel(opt) : `${opt.value} - ${opt.description}`;

  const selectedOption = options.find(o => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            hasError && 'border-destructive',
          )}
        >
          <span className="truncate">
            {selectedOption ? getLabel(selectedOption) : (disabled && disabledPlaceholder ? disabledPlaceholder : placeholder)}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(opt => (
                <CommandItem
                  key={opt.value}
                  value={`${opt.value} ${opt.description}`}
                  onSelect={() => {
                    onValueChange(opt.value === value ? '' : opt.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === opt.value ? 'opacity-100' : 'opacity-0')} />
                  {getLabel(opt)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Component ──

interface CreateEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equipment: CustomerEquipment) => void;
  projectId: number;
  projectCompanies: ProjectCompany[];
}

export function CreateEquipmentModal({ open, onOpenChange, onSave, projectId, projectCompanies }: CreateEquipmentModalProps) {
  const { control, register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CreateEquipmentInput>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: EQUIPMENT_DEFAULTS,
  });

  // Lookup data (not form state)
  const [makes, setMakes] = useState<LookupOption[]>([]);
  const [fpcs, setFpcs] = useState<LookupOption[]>([]);
  const [compCodes, setCompCodes] = useState<LookupOption[]>([]);
  const [principalWorkCodes, setPrincipalWorkCodes] = useState<LookupOption[]>([]);
  const [applicationCodes, setApplicationCodes] = useState<LookupOption[]>([]);
  const [engineMakes, setEngineMakes] = useState<LookupOption[]>([]);
  const [industryGroups, setIndustryGroups] = useState<LookupOption[]>([]);
  const [industryCodes, setIndustryCodes] = useState<LookupOption[]>([]);

  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [smuDateOpen, setSmuDateOpen] = useState(false);
  const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);

  const make = watch('make');
  const fpc = watch('fpc');
  const industryGroup = watch('industryGroup');
  const smuDate = watch('smuDate');
  const purchaseDate = watch('purchaseDate');
  const territory = watch('territory');

  const companyOptions: LookupOption[] = useMemo(
    () => (projectCompanies || []).map(c => ({ value: c.companyId, description: c.companyName })),
    [projectCompanies],
  );

  // Load static lookups on open
  useEffect(() => {
    if (open) {
      Promise.all([
        fetchMakes(),
        fetchPrincipalWorkCodes(),
        fetchApplicationCodes(),
        fetchEngineMakes(),
        fetchIndustryGroups(),
      ]).then(([m, pwc, ac, em, ig]) => {
        setMakes(m);
        setPrincipalWorkCodes(pwc);
        setApplicationCodes(ac);
        setEngineMakes(em);
        setIndustryGroups(ig);
      });
    }
  }, [open]);

  // Cascade: Make → FPC
  useEffect(() => {
    if (make) {
      fetchFPCs(make).then(setFpcs);
    } else {
      setFpcs([]);
    }
    setValue('fpc', '');
    setValue('compatibilityCode', '');
    setCompCodes([]);
  }, [make, setValue]);

  // Cascade: FPC → Compatibility Code
  useEffect(() => {
    if (fpc) {
      fetchCompatibilityCodes(fpc).then(setCompCodes);
    } else {
      setCompCodes([]);
    }
    setValue('compatibilityCode', '');
  }, [fpc, setValue]);

  // Cascade: Industry Group → Industry Code
  useEffect(() => {
    if (industryGroup) {
      fetchIndustryCodes(industryGroup).then(setIndustryCodes);
    } else {
      setIndustryCodes([]);
    }
    setValue('industryCode', '');
  }, [industryGroup, setValue]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset(EQUIPMENT_DEFAULTS);
      setAdditionalOpen(false);
      setFpcs([]); setCompCodes([]); setIndustryCodes([]);
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: CreateEquipmentInput) => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        companyId: data.companyId, make: data.make, fpc: data.fpc, compatibilityCode: data.compatibilityCode,
        model: data.model, serialNumber: data.serialNumber,
        yearOfManufacture: parseInt(data.yearOfManufacture),
        territory: data.territory === 'in' ? 'In Territory' : 'Out of Territory',
        ...(data.equipmentNumber && { equipmentNumber: data.equipmentNumber }),
        ...(data.smu && { smu: parseFloat(data.smu) }),
        ...(data.smuDate && { smuDate: format(data.smuDate, 'yyyy-MM-dd') }),
        ...(data.industryGroup && { industryGroup: data.industryGroup }),
        ...(data.industryCode && { industryCode: data.industryCode }),
        ...(data.principalWorkCode && { principalWorkCode: data.principalWorkCode }),
        ...(data.applicationCode && { applicationCode: data.applicationCode }),
        ...(data.annualUseHours && { annualUseHours: parseInt(data.annualUseHours) }),
        ...(data.engineMake && { engineMake: data.engineMake }),
        ...(data.engineModel && { engineModel: data.engineModel }),
        ...(data.engineSerialNumber && { engineSerialNumber: data.engineSerialNumber }),
        ...(data.purchaseDate && { purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd') }),
      };

      const newId = await createEquipmentApi(payload);
      await associateEquipmentToProjectApi(projectId, newId);

      const selectedMake = makes.find(m => m.value === data.make);
      const newEquipment: CustomerEquipment = {
        id: newId,
        companyId: data.companyId,
        equipmentType: fpcs.find(f => f.value === data.fpc)?.description || data.fpc,
        make: selectedMake?.description || data.make,
        model: data.model,
        year: parseInt(data.yearOfManufacture),
        serialNumber: data.serialNumber,
        ...(data.smu && { smu: parseFloat(data.smu) }),
        ownershipStatus: 'owned',
      };
      onSave(newEquipment);
      handleClose(false);
    } finally {
      setSubmitting(false);
    }
  };

  const DatePickerField = ({ label, date, onSelect, isOpen, setOpen }: {
    label: string;
    date: Date | undefined;
    onSelect: (d: Date | undefined) => void;
    isOpen: boolean;
    setOpen: (o: boolean) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'MMM d, yyyy') : 'Select date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => { onSelect(d); setOpen(false); }} />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Equipment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Company */}
          <div className="space-y-2">
            <Label>Company <span className="text-destructive">*</span></Label>
            <Controller control={control} name="companyId" render={({ field }) => (
              <SearchableSelect
                options={companyOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select company"
                hasError={!!errors.companyId}
                formatLabel={(opt) => opt.description}
              />
            )} />
          </div>

          {/* Required Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Make <span className="text-destructive">*</span></Label>
              <Controller control={control} name="make" render={({ field }) => (
                <SearchableSelect options={makes} value={field.value} onValueChange={field.onChange} placeholder="Select make" hasError={!!errors.make} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Family Product Code <span className="text-destructive">*</span></Label>
              <Controller control={control} name="fpc" render={({ field }) => (
                <SearchableSelect options={fpcs} value={field.value} onValueChange={field.onChange} placeholder="Select FPC" disabledPlaceholder="Select make first" disabled={!make} hasError={!!errors.fpc} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Compatibility Code <span className="text-destructive">*</span></Label>
              <Controller control={control} name="compatibilityCode" render={({ field }) => (
                <SearchableSelect options={compCodes} value={field.value} onValueChange={field.onChange} placeholder="Select code" disabledPlaceholder="Select FPC first" disabled={!fpc} hasError={!!errors.compatibilityCode} />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Model <span className="text-destructive">*</span></Label>
              <Input {...register('model')} placeholder="Enter model" className={cn(errors.model && 'border-destructive')} />
            </div>
            <div className="space-y-2">
              <Label>Serial Number <span className="text-destructive">*</span></Label>
              <Input {...register('serialNumber')} placeholder="Enter serial number" className={cn(errors.serialNumber && 'border-destructive')} />
            </div>
            <div className="space-y-2">
              <Label>Year of Manufacture <span className="text-destructive">*</span></Label>
              <Input type="number" {...register('yearOfManufacture')} placeholder="e.g. 2024" className={cn(errors.yearOfManufacture && 'border-destructive')} />
            </div>
          </div>

          {/* Territory */}
          <div className="space-y-2">
            <Label>Territory <span className="text-destructive">*</span></Label>
            <Controller control={control} name="territory" render={({ field }) => (
              <ToggleGroup type="single" value={field.value} onValueChange={(v) => v && field.onChange(v)} className="justify-start">
                <ToggleGroupItem value="in" className="px-4">In Territory</ToggleGroupItem>
                <ToggleGroupItem value="out" className="px-4">Out of Territory</ToggleGroupItem>
              </ToggleGroup>
            )} />
          </div>

          {/* Additional Fields */}
          <Collapsible open={additionalOpen} onOpenChange={setAdditionalOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
                <span className="text-sm font-medium">Additional Fields</span>
                {additionalOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Equipment Number</Label>
                  <Input {...register('equipmentNumber')} placeholder="Enter equipment number" />
                </div>
                <div className="space-y-2">
                  <Label>SMU</Label>
                  <Input type="number" {...register('smu')} placeholder="Enter SMU" />
                </div>
                <DatePickerField label="SMU Date" date={smuDate} onSelect={(d) => setValue('smuDate', d)} isOpen={smuDateOpen} setOpen={setSmuDateOpen} />
                <div className="space-y-2">
                  <Label>Industry Group</Label>
                  <Controller control={control} name="industryGroup" render={({ field }) => (
                    <SearchableSelect options={industryGroups} value={field.value} onValueChange={field.onChange} placeholder="Select industry group" formatLabel={(opt) => opt.description} />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label>Industry Code</Label>
                  <Controller control={control} name="industryCode" render={({ field }) => (
                    <SearchableSelect options={industryCodes} value={field.value} onValueChange={field.onChange} placeholder="Select industry code" disabledPlaceholder="Select group first" disabled={!industryGroup} />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label>Principal Work Code</Label>
                  <Controller control={control} name="principalWorkCode" render={({ field }) => (
                    <SearchableSelect options={principalWorkCodes} value={field.value} onValueChange={field.onChange} placeholder="Select work code" />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label>Application Code</Label>
                  <Controller control={control} name="applicationCode" render={({ field }) => (
                    <SearchableSelect options={applicationCodes} value={field.value} onValueChange={field.onChange} placeholder="Select application" formatLabel={(opt) => opt.description} />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label>Annual Use Hours</Label>
                  <Input type="number" {...register('annualUseHours')} placeholder="Enter hours" />
                </div>
                <div className="space-y-2">
                  <Label>Engine Make</Label>
                  <Controller control={control} name="engineMake" render={({ field }) => (
                    <SearchableSelect options={engineMakes} value={field.value} onValueChange={field.onChange} placeholder="Select engine make" />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label>Engine Model</Label>
                  <Input {...register('engineModel')} placeholder="Enter engine model" />
                </div>
                <div className="space-y-2">
                  <Label>Engine Serial Number</Label>
                  <Input {...register('engineSerialNumber')} placeholder="Enter engine serial" />
                </div>
                <DatePickerField label="Purchase Date" date={purchaseDate} onSelect={(d) => setValue('purchaseDate', d)} isOpen={purchaseDateOpen} setOpen={setPurchaseDateOpen} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => handleClose(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Equipment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
