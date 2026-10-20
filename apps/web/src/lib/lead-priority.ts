import type { leadStages } from "@travelos/shared";
import { apiFetch } from "./api-client";

export type PriorityBand = "high" | "medium" | "low";

export type PrioritizedLead = {
  lead: {
    id: string;
    name: string;
    destination: string | null;
    stage: (typeof leadStages)[number];
    createdAt: string;
  };
  score: number;
  reason: string;
  overdueTaskCount: number;
};

export function priorityBand(score: number): PriorityBand {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function listPrioritizedLeads(take = 20) {
  return apiFetch<PrioritizedLead[]>(`/api/ai/leads/prioritized?take=${take}`);
}
