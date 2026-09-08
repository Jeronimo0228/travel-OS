import { z } from 'zod';
import { roleSchema } from './auth';

export const changeUserRoleSchema = z.object({
  role: roleSchema,
});

export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;