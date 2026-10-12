import { z } from 'zod';

export const catalogKindSchema = z.enum(['HOTEL', 'ACTIVITY']);

export const catalogQuerySchema = z.object({
  kind: catalogKindSchema.optional(),
  destination: z.string().trim().min(1).max(120).optional(),
});

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
