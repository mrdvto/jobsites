import { createServerFn } from '@tanstack/react-start';
import type { CustomerEquipment } from '@/types';

import companyEquipmentData from '@/data/CompanyEquipment.json';

// In-memory state
let masterEquipment: CustomerEquipment[] = companyEquipmentData as CustomerEquipment[];

export const getEquipment = createServerFn({ method: 'GET' }).handler(async () => {
  return masterEquipment;
});

export const getEquipmentByCompany = createServerFn({ method: 'GET' })
  .validator((data: { companyId: string }) => data)
  .handler(async ({ data }) => {
    return masterEquipment.filter(e => e.companyId === data.companyId);
  });

export const addEquipmentToMaster = createServerFn({ method: 'POST' })
  .validator((data: { equipment: CustomerEquipment }) => data)
  .handler(async ({ data }) => {
    masterEquipment = [...masterEquipment, data.equipment];
    return data.equipment;
  });
