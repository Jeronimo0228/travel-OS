import { z } from 'zod';

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD');

export const agencyKindSchema = z.enum(['AGENCY', 'WHOLESALER']);
export const updateAgencyKindSchema = z.object({ kind: agencyKindSchema });

export const createPartnershipSchema = z.object({
  agencySlug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/),
  commissionPct: z.coerce.number().min(0).max(50),
});
export const updatePartnershipSchema = z
  .object({ commissionPct: z.coerce.number().min(0).max(50), status: z.enum(['ACTIVE', 'ENDED']) })
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const departureInputSchema = z.object({ startsOn: dateOnly, seats: z.coerce.number().int().min(1).max(500) });

export const programInputSchema = z.object({
  name: z.string().trim().min(3).max(160),
  destination: z.string().trim().min(2).max(120),
  days: z.coerce.number().int().min(1).max(60),
  description: z.string().trim().max(2000).default(''),
  netPrice: z.coerce.number().positive().max(999_999_999),
  currency: z.string().trim().length(3).toUpperCase().default('COP'),
  departures: z.array(departureInputSchema).max(52).default([]),
});
export const updateProgramSchema = programInputSchema
  .omit({ departures: true })
  .extend({ published: z.boolean() })
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const createProgramBookingSchema = z.object({
  departureId: z.string().min(1).max(40),
  travelerName: z.string().trim().min(2).max(160),
  pax: z.coerce.number().int().min(1).max(50),
});
export const updateProgramBookingSchema = z.object({ status: z.enum(['CONFIRMED', 'CANCELLED']) });

export type CreatePartnershipInput = z.infer<typeof createPartnershipSchema>;
export type UpdatePartnershipInput = z.infer<typeof updatePartnershipSchema>;
export type ProgramInput = z.infer<typeof programInputSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type DepartureInput = z.infer<typeof departureInputSchema>;
export type CreateProgramBookingInput = z.infer<typeof createProgramBookingSchema>;
export type UpdateProgramBookingInput = z.infer<typeof updateProgramBookingSchema>;
export type UpdateAgencyKindInput = z.infer<typeof updateAgencyKindSchema>;
