import { z } from 'zod';

export const knowledgeFaqSchema = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(1).max(1500),
});

export const updateAgencyKnowledgeSchema = z.object({
  tone: z.string().trim().max(1000).default(''),
  policies: z.string().trim().max(6000).default(''),
  faqs: z.array(knowledgeFaqSchema).max(30).default([]),
});

export type KnowledgeFaq = z.infer<typeof knowledgeFaqSchema>;
export type UpdateAgencyKnowledgeInput = z.infer<
  typeof updateAgencyKnowledgeSchema
>;
