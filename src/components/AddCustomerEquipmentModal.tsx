import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerEquipment, SiteCompany } from '@/types';

interface AddCustomerEquipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equipment: Omit<CustomerEquipment, 'id'>) => void;
  equipment?: CustomerEquipment;
  mode: 'create' | 'edit';
  siteCompanies: SiteCompany[];
}

export const AddCustomerEquipmentModal = ({ open, onOpenChange, onSave, equipment, mode, siteCompanies }: AddCustomerEquipmentModalProps) => {
  const [companyId, setCompanyId] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [hours, setHours] = useState('');

  useEffect(() => {
    if (mode === 'edit' && equipment) {
      setCompanyId(equipment.companyId || '');
      setEquipmentType(equipment.equipmentType);
      setMake(equipment.make);
      setModel(equipment.model);
      setYear(equipment.year?.toString() || '');
      setSerialNumber(equipment.serialNumber || '');
      setHours(equipment.hours?.toString() || '');
    } else {
      setCompanyId('');
      setEquipmentType('');
      setMake('');
      setModel('');
      setYear('');
      setSerialNumber('');
      setHours('');
    }
  }, [open, mode, equipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !equipmentType.trim() || !make.trim() || !model.trim()) return;

    onSave({
      companyId,
      equipmentType: equipmentType.trim(),
      make: make.trim(),
      model: model.trim(),
      year: year ? parseInt(year) : undefined,
      serialNumber: serialNumber.trim() || undefined,
      hours: hours ? parseFloat(hours) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Customer Equipment' : 'Edit Customer Equipment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Select value={companyId} onValueChange={setCompanyId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {siteCompanies.map(c => (
                  <SelectItem key={c.companyId} value={c.companyId}>
                    {c.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipmentType">Equipment Type *</Label>
            <Input id="equipmentType" value={equipmentType} onChange={e => setEquipmentType(e.target.value)} placeholder="e.g. Excavator, Dozer, Loader" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <Input id="make" value={make} onChange={e => setMake(e.target.value)} placeholder="e.g. Caterpillar, Komatsu" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input id="model" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. 320F, D6T" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2022" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input id="hours" type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 3500" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input id="serialNumber" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="e.g. CAT0320FXYZ" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{mode === 'create' ? 'Add Equipment' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
