import { z } from 'zod';

export const createEquipmentSchema = z.object({
  companyId: z.string().min(1, 'Company is required.'),
  make: z.string().min(1, 'Make is required.'),
  fpc: z.string().min(1, 'Family Product Code is required.'),
  compatibilityCode: z.string().min(1, 'Compatibility Code is required.'),
  model: z.string().min(1, 'Model is required.'),
  serialNumber: z.string().min(1, 'Serial Number is required.'),
  yearOfManufacture: z.string().min(1, 'Year of Manufacture is required.'),
  territory: z.enum(['in', 'out']),
  // Additional fields
  equipmentNumber: z.string(),
  smu: z.string(),
  smuDate: z.date().optional(),
  industryGroup: z.string(),
  industryCode: z.string(),
  principalWorkCode: z.string(),
  applicationCode: z.string(),
  annualUseHours: z.string(),
  engineMake: z.string(),
  engineModel: z.string(),
  engineSerialNumber: z.string(),
  purchaseDate: z.date().optional(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;

export const EQUIPMENT_DEFAULTS: CreateEquipmentInput = {
  companyId: '',
  make: '',
  fpc: '',
  compatibilityCode: '',
  model: '',
  serialNumber: '',
  yearOfManufacture: '',
  territory: 'in',
  equipmentNumber: '',
  smu: '',
  smuDate: undefined,
  industryGroup: '',
  industryCode: '',
  principalWorkCode: '',
  applicationCode: '',
  annualUseHours: '',
  engineMake: '',
  engineModel: '',
  engineSerialNumber: '',
  purchaseDate: undefined,
};
