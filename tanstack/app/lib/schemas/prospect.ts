import { z } from 'zod';
import { validatePhone, validateEmail, validateZip } from '@/utils/phoneValidation';

const MASKED_COUNTRIES = ['US', 'CA', 'AU'];

export const prospectSchema = z.object({
  companyName: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  divisionIds: z.array(z.string()).min(1, 'Select at least one division'),
  selectedRoles: z.array(z.string()).min(1, 'Select at least one role'),
  address1: z.string(),
  address2: z.string(),
  address3: z.string(),
  city: z.string().min(1, 'Required'),
  countryCode: z.string().min(1, 'Required'),
  stateCode: z.string(),
  zipCode: z.string().min(1, 'Required'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  mobilePhone: z.string().min(1, 'Required'),
  businessPhone: z.string(),
  email: z.string().min(1, 'Required'),
}).superRefine((data, ctx) => {
  const hasMask = MASKED_COUNTRIES.includes(data.countryCode);
  if (hasMask && data.phone && !validatePhone(data.phone, data.countryCode)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid format', path: ['phone'] });
  }
  if (!data.address1.trim() && !data.address2.trim() && !data.address3.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'At least one address line is required', path: ['address1'] });
  }
  if (hasMask && data.zipCode && !validateZip(data.zipCode, data.countryCode)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid format', path: ['zipCode'] });
  }
  if (data.email && !validateEmail(data.email)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid email', path: ['email'] });
  }
  if (hasMask && data.mobilePhone && !validatePhone(data.mobilePhone, data.countryCode)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid format', path: ['mobilePhone'] });
  }
  if (data.businessPhone.trim() && hasMask && !validatePhone(data.businessPhone, data.countryCode)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid format', path: ['businessPhone'] });
  }
});

export type ProspectInput = z.infer<typeof prospectSchema>;

export const PROSPECT_DEFAULTS: ProspectInput = {
  companyName: '',
  phone: '',
  divisionIds: [],
  selectedRoles: [],
  address1: '',
  address2: '',
  address3: '',
  city: '',
  countryCode: '',
  stateCode: '',
  zipCode: '',
  firstName: '',
  lastName: '',
  title: '',
  mobilePhone: '',
  businessPhone: '',
  email: '',
};
