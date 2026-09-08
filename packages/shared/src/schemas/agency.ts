import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'primaryColor must be a #RRGGBB hex color');

const logoUrl = z
  .string()
  .max(500_000)
  .refine(
    (value) =>
      value.startsWith('data:image/') ||
      value.startsWith('https://') ||
      value.startsWith('http://'),
    'logoUrl must be an http(s) URL or a data:image URI',
  );

export const updateAgencyBrandingSchema = z.object({
  primaryColor: hexColor,
  logoUrl: logoUrl.nullable(),
});

export type UpdateAgencyBrandingInput = z.infer<
  typeof updateAgencyBrandingSchema
>;
