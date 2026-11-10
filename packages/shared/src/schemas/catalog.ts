import { z } from 'zod';

export const catalogKindSchema = z.enum(['HOTEL', 'ACTIVITY']);

export const catalogQuerySchema = z.object({
  kind: catalogKindSchema.optional(),
  destination: z.string().trim().min(1).max(120).optional(),
});

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

export const catalogPricingUnitSchema = z.enum(['PER_NIGHT', 'PER_PERSON']);

/** HU-34: crear o editar un ítem del catálogo. */
export const catalogItemInputSchema = z.object({
  kind: catalogKindSchema,
  name: z.string().trim().min(2).max(160),
  destination: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).default(''),
  pricingUnit: catalogPricingUnitSchema,
  price: z.coerce.number().positive().max(999_999_999),
  currency: z.string().trim().length(3).toUpperCase().default('COP'),
});
export const updateCatalogItemSchema = catalogItemInputSchema.partial().refine((v) => Object.keys(v).length > 0, {
  message: 'At least one field is required',
});
export const catalogImportSchema = z.object({ csv: z.string().min(1).max(200_000) });
export const catalogAdminQuerySchema = z.object({
  includeArchived: z.enum(['true', 'false']).optional(),
});

export type CatalogItemInput = z.infer<typeof catalogItemInputSchema>;
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>;
export type CatalogImportInput = z.infer<typeof catalogImportSchema>;
export type CatalogAdminQuery = z.infer<typeof catalogAdminQuerySchema>;

/** Columnas esperadas del CSV de importación (encabezado obligatorio). */
export const CATALOG_CSV_COLUMNS = ['tipo', 'nombre', 'destino', 'descripcion', 'unidad', 'precio', 'moneda'] as const;
export const CATALOG_IMPORT_MAX_ROWS = 200;
