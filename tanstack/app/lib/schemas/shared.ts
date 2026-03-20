import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export const externalReferenceSchema = z.object({
  source: z.string(),
  name: z.string(),
  url: z.string(),
}).optional();

export const optionalLookupId = z.string().transform(v => v === '__none__' ? undefined : v || undefined);
