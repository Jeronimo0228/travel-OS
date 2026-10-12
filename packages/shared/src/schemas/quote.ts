import { z } from 'zod';

export const quoteIdSchema = z.string().cuid();

export const createQuoteSchema = z.object({
  prompt: z.string().trim().min(10).max(2000),
  leadId: z.string().cuid().optional(),
});

export const linkQuoteLeadSchema = z.object({
  leadId: z.string().cuid(),
});

export const listQuotesQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type LinkQuoteLeadInput = z.infer<typeof linkQuoteLeadSchema>;
export type ListQuotesQuery = z.infer<typeof listQuotesQuerySchema>;
