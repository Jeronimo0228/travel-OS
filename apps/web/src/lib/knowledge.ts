import { apiFetch } from "./api-client";

export type KnowledgeFaq = { question: string; answer: string };

export type AgencyKnowledge = {
  tone: string;
  policies: string;
  faqs: KnowledgeFaq[];
  updatedAt?: string;
};

export function getAgencyKnowledge() {
  return apiFetch<AgencyKnowledge>("/api/agency/knowledge");
}

export function updateAgencyKnowledge(input: AgencyKnowledge) {
  return apiFetch<AgencyKnowledge>("/api/agency/knowledge", {
    method: "PUT",
    body: JSON.stringify({
      tone: input.tone,
      policies: input.policies,
      faqs: cleanFaqs(input.faqs),
    }),
  });
}

/** Drops empty FAQ rows and trims text before saving. */
export function cleanFaqs(faqs: KnowledgeFaq[]): KnowledgeFaq[] {
  return faqs
    .map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }))
    .filter((faq) => faq.question.length > 0 && faq.answer.length > 0);
}

/** Share of the three knowledge sections that are filled (0–100). */
export function knowledgeCompleteness(knowledge: AgencyKnowledge): number {
  const filled = [
    knowledge.tone.trim().length > 0,
    knowledge.policies.trim().length > 0,
    cleanFaqs(knowledge.faqs).length > 0,
  ].filter(Boolean).length;
  return Math.round((filled / 3) * 100);
}
