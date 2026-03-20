import { z } from 'zod';

export const activitySchema = z.object({
  salesRepId: z.string().min(1, 'Please select a sales rep.'),
  typeId: z.string().min(1, 'Please select an activity type.'),
  date: z.date({ required_error: 'Please select a date.' }),
  timeValue: z.string(),
  description: z.string().min(1, 'Please enter a description.'),
  notes: z.string().min(1, 'Please enter notes.'),
  selectedCompanyId: z.string(),
  selectedContactId: z.union([z.number(), z.literal('')]),
  showMoreFields: z.boolean(),
  campaignId: z.string(),
  issueId: z.string(),
  linkedActivityId: z.string(),
});

export type ActivityInput = z.infer<typeof activitySchema>;

export const ACTIVITY_DEFAULTS: ActivityInput = {
  salesRepId: '',
  typeId: '',
  date: undefined as unknown as Date,
  timeValue: '12:00',
  description: '',
  notes: '',
  selectedCompanyId: '',
  selectedContactId: '',
  showMoreFields: false,
  campaignId: '',
  issueId: '',
  linkedActivityId: '',
};
