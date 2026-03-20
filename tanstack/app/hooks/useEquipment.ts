import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CustomerEquipment } from '@/types';
import {
  getEquipment,
  getEquipmentByCompany,
  addEquipmentToMaster as addEquipmentToMasterFn,
} from '@/server/equipment';

export const equipmentQueryOptions = () => ({
  queryKey: ['equipment'] as const,
  queryFn: () => getEquipment(),
});

export function useEquipment() {
  return useQuery(equipmentQueryOptions());
}

export function useCompanyEquipment(companyId: string) {
  return useQuery({
    queryKey: ['equipment', 'company', companyId] as const,
    queryFn: () => getEquipmentByCompany({ data: { companyId } }),
    enabled: !!companyId,
  });
}

export function useAddEquipmentToMaster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { equipment: CustomerEquipment }) =>
      addEquipmentToMasterFn({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}
