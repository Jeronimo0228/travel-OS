import { z } from 'zod';

export const leadStages = [
  'PROSPECTO',
  'COTIZANDO',
  'CIERRE',
  'GANADO',
  'PERDIDO',
] as const;

export const createLeadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(30).optional(),
  destination: z.string().max(120).optional(),
  notes: z.string().max(2000).optional(),
  stage: z.enum(leadStages).default('PROSPECTO'),
  assigneeId: z.string().cuid().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
