import { z } from 'zod';
import { validatePhone, validateEmail, validateZip } from '@/utils/phoneValidation';

const MASKED_COUNTRIES = ['US', 'CA', 'AU'];

export const contactSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  typeCode: z.string(),
  mobilePhone: z.string().min(1, 'Required'),
  businessPhone: z.string().min(1, 'Required'),
  email: z.string().min(1, 'Required'),
  phone: z.string(),
  fax: z.string(),
  divisionIds: z.array(z.string()).min(1, 'Select at least one division'),
  addressType: z.enum(['same', 'different']),
  address1: z.string(),
  address2: z.string(),
  address3: z.string(),
  city: z.string(),
  stateCode: z.string(),
  zipCode: z.string(),
  mailCodes: z.array(z.string()),
}).superRefine((data, ctx) => {
  // countryCode is passed externally, so phone/zip validation
  // is handled at the component level where countryCode is available
  if (data.email && !validateEmail(data.email)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid email', path: ['email'] });
  }
});

export type ContactInput = z.infer<typeof contactSchema>;

export const CONTACT_DEFAULTS: ContactInput = {
  firstName: '',
  lastName: '',
  title: '',
  typeCode: '',
  mobilePhone: '',
  businessPhone: '',
  email: '',
  phone: '',
  fax: '',
  divisionIds: [],
  addressType: 'same',
  address1: '',
  address2: '',
  address3: '',
  city: '',
  stateCode: '',
  zipCode: '',
  mailCodes: [],
};
