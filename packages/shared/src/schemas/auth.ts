import { z } from 'zod';
import { ROLES } from '../roles';

export const registerAgencySchema = z.object({
  agencyName: z.string().min(2).max(120),
  nit: z.string().trim().min(5).max(30),
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

/** HU-37 / HU-38: tokens de un solo uso enviados por enlace (base64url de 32 bytes). */
export const oneTimeTokenSchema = z.string().trim().regex(/^[A-Za-z0-9_-]{43}$/, 'invalid token');
export const passwordSchema = z.string().min(8).max(128);

export const forgotPasswordSchema = z.object({ email: z.string().trim().toLowerCase().email().max(200) });
export const resetPasswordSchema = z.object({ token: oneTimeTokenSchema, password: passwordSchema });
export const acceptInvitationSchema = z.object({
  token: oneTimeTokenSchema,
  name: z.string().trim().min(2).max(120),
  password: passwordSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
