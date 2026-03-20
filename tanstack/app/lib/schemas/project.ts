import { z } from 'zod';
import { externalReferenceSchema, optionalLookupId } from './shared';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Please enter a project name.'),
  description: z.string(),
  statusId: z.string(),
  assigneeIds: z.array(z.number()).min(1, 'Please select at least one assignee.'),
  ownerCompanyId: z.string().min(1, 'Please select a project owner company.'),
  ownerContactIds: z.array(z.number()),
  locationType: z.enum(['address', 'coordinates']),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  valuation: z.string(),
  primaryStageId: optionalLookupId,
  primaryProjectTypeId: optionalLookupId,
  ownershipTypeId: optionalLookupId,
  bidDate: z.date().optional(),
  targetStartDate: z.date().optional(),
  targetCompletionDate: z.date().optional(),
  externalReference: externalReferenceSchema,
}).superRefine((data, ctx) => {
  if (data.locationType === 'address') {
    if (!data.street.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please fill in all address fields.', path: ['street'] });
    if (!data.city.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please fill in all address fields.', path: ['city'] });
    if (!data.state.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please fill in all address fields.', path: ['state'] });
    if (!data.zipCode.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please fill in all address fields.', path: ['zipCode'] });
    if (!data.country.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please fill in all address fields.', path: ['country'] });
  } else {
    const lat = parseFloat(data.latitude);
    const lon = parseFloat(data.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter valid coordinates (latitude: -90 to 90).', path: ['latitude'] });
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter valid coordinates (longitude: -180 to 180).', path: ['longitude'] });
    }
  }
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const CREATE_PROJECT_DEFAULTS: CreateProjectInput = {
  name: '',
  description: '',
  statusId: 'Active',
  assigneeIds: [],
  ownerCompanyId: '',
  ownerContactIds: [],
  locationType: 'address',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'USA',
  latitude: '',
  longitude: '',
  valuation: '',
  primaryStageId: '',
  primaryProjectTypeId: '',
  ownershipTypeId: '',
  bidDate: undefined,
  targetStartDate: undefined,
  targetCompletionDate: undefined,
  externalReference: undefined,
};
