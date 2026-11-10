import { z } from 'zod';

export const prioritizedLeadsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).default(20),
});

export type PrioritizedLeadsQuery = z.infer<typeof prioritizedLeadsQuerySchema>;

/** Rutas internas que el asistente puede sugerir (nada fuera de la app). */
export const ASSISTANT_ROUTES = [
  "/",
  "/crm",
  "/cotizador",
  "/viajes",
  "/ayuda",
  "/settings/knowledge",
  "/settings/branding",
  "/settings/audit",
  "/settings/catalog",
  "/settings/users",
  "/red",
  "/recuperar",
  "/agentes",
] as const;

export const assistantRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().trim().min(1).max(1200),
      }),
    )
    .max(6)
    .default([]),
});

export const assistantReplySchema = z.object({
  reply: z.string().trim().min(1).max(1500),
  suggestions: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(60),
        href: z.enum(ASSISTANT_ROUTES),
      }),
    )
    .max(3)
    .default([]),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
export type AssistantReply = z.infer<typeof assistantReplySchema>;
