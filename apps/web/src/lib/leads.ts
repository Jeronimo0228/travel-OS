import type { CreateLeadInput, UpdateLeadInput, leadStages } from "@travelos/shared";
import { apiFetch } from "./api-client";

export type Lead = {
  id: string;
  agencyId: string;
  name: string;
  email: string | null;
  phone: string | null;
  destination: string | null;
  notes: string | null;
  stage: (typeof leadStages)[number];
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListLeadsParams = {
  stage?: (typeof leadStages)[number];
  name?: string;
  assigneeId?: string;
  skip?: number;
  take?: number;
};

export function listLeads(params: ListLeadsParams = {}) {
  const query = new URLSearchParams();
  if (params.stage) query.set("stage", params.stage);
  if (params.name) query.set("name", params.name);
  if (params.assigneeId) query.set("assigneeId", params.assigneeId);
  if (params.skip !== undefined) query.set("skip", String(params.skip));
  if (params.take !== undefined) query.set("take", String(params.take));

  const qs = query.toString();
  return apiFetch<{ items: Lead[]; total: number }>(
    `/api/leads${qs ? `?${qs}` : ""}`,
  );
}

export function assignLead(id: string, assigneeId: string) {
  return apiFetch<Lead>(`/api/leads/${id}/assignee`, {
    method: "PUT",
    body: JSON.stringify({ assigneeId }),
  });
}

export function deleteLead(id: string) {
  return apiFetch<void>(`/api/leads/${id}`, { method: "DELETE" });
}

export function createLead(input: CreateLeadInput) {
  return apiFetch<Lead>("/api/leads", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateLead(id: string, input: UpdateLeadInput) {
  return apiFetch<Lead>(`/api/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteLead(id: string) {
  return apiFetch<void>(`/api/leads/${id}`, { method: "DELETE" });
}
