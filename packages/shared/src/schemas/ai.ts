import { z } from 'zod';

export const prioritizedLeadsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).default(20),
});

export type PrioritizedLeadsQuery = z.infer<typeof prioritizedLeadsQuerySchema>;
