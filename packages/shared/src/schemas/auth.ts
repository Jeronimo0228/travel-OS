import { z } from 'zod';
import { ROLES } from '../roles';

export const registerAgencySchema = z.object({
  agencyName: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase kebab-case'),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8).max(128),
  adminName: z.string().min(2).max(120),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const roleSchema = z.enum(ROLES);

export type RegisterAgencyInput = z.infer<typeof registerAgencySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
