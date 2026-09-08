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

export const updateLeadSchema = createLeadSchema.omit({ assigneeId: true }).partial();

export const assignLeadSchema = z.object({
  assigneeId: z.string().cuid(),
});

export const listLeadsQuerySchema = z.object({
  stage: z.enum(leadStages).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  assigneeId: z.string().cuid().optional(),
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
