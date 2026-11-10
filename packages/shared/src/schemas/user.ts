import { z } from 'zod';
import { roleSchema } from './auth';

export const changeUserRoleSchema = z.object({
  role: roleSchema,
});

export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;
export const createInvitationSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  role: roleSchema.default('ASESOR'),
});
export const changeUserStatusSchema = z.object({ active: z.boolean() });

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type ChangeUserStatusInput = z.infer<typeof changeUserStatusSchema>;
