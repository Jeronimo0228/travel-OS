import { z } from 'zod';

const dateSchema = z.string().datetime({ offset: true });

export const createReservationSchema = z
  .object({
    leadId: z.string().trim().min(1),
    travelerName: z.string().trim().min(1).max(160),
    travelerEmail: z.string().trim().email().max(320),
    destination: z.string().trim().min(1).max(160),
    startsAt: dateSchema,
    endsAt: dateSchema,
  })
  .refine(
    (reservation) =>
      Date.parse(reservation.endsAt) > Date.parse(reservation.startsAt),
    {
      path: ['endsAt'],
      message: 'End date must be after start date',
    },
  );

const documentUrlSchema = z
  .string()
  .trim()
  .url()
  .max(2048)
  .refine((value) => {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
  }, 'Document URL must use HTTPS without embedded credentials');

export const createItineraryItemSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    details: z.string().trim().max(2000).optional(),
    location: z.string().trim().max(240).optional(),
    startsAt: dateSchema.optional(),
    endsAt: dateSchema.optional(),
    position: z.number().int().min(0).max(10_000).optional(),
  })
  .refine(
    (item) =>
      !item.startsAt ||
      !item.endsAt ||
      Date.parse(item.endsAt) > Date.parse(item.startsAt),
    {
      path: ['endsAt'],
      message: 'End date must be after start date',
    },
  );

export const updateItineraryItemSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    details: z.string().trim().max(2000).nullable(),
    location: z.string().trim().max(240).nullable(),
    startsAt: dateSchema.nullable(),
    endsAt: dateSchema.nullable(),
    position: z.number().int().min(0).max(10_000),
  })
  .partial()
  .refine((item) => Object.keys(item).length > 0, {
    message: 'At least one field is required',
  })
  .refine(
    (item) =>
      !item.startsAt ||
      !item.endsAt ||
      Date.parse(item.endsAt) > Date.parse(item.startsAt),
    {
      path: ['endsAt'],
      message: 'End date must be after start date',
    },
  );

export const documentUploadLimits = {
  // 4 MB: las Vercel Functions aceptan cuerpos de hasta 4,5 MB.
  maxBytes: 4 * 1024 * 1024,
  contentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

export const createReservationDocumentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  url: documentUrlSchema,
  contentType: z.string().trim().max(120).optional(),
});

export const createPortalMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type CreateItineraryItemInput = z.infer<
  typeof createItineraryItemSchema
>;
export type UpdateItineraryItemInput = z.infer<
  typeof updateItineraryItemSchema
>;
export type CreateReservationDocumentInput = z.infer<
  typeof createReservationDocumentSchema
>;
export type CreatePortalMessageInput = z.infer<
  typeof createPortalMessageSchema
>;
