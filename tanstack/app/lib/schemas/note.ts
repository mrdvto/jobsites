import { z } from 'zod';
import type { Attachment } from '@/types';

export const noteSchema = z.object({
  content: z.string().min(1, 'Please enter note content.'),
  selectedTagIds: z.array(z.string()),
  attachments: z.array(z.custom<Attachment>()),
});

export type NoteInput = z.infer<typeof noteSchema>;

export const NOTE_DEFAULTS: NoteInput = {
  content: '',
  selectedTagIds: [],
  attachments: [],
};
