import type { CreateTaskInput, UpdateTaskInput } from "@travelos/shared";
import { apiFetch } from "./api-client";

export type Task = {
  id: string;
  agencyId: string;
  leadId: string;
  title: string;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
};

export function listLeadTasks(leadId: string, params: { overdue?: boolean } = {}) {
  const query = new URLSearchParams();
  if (params.overdue !== undefined) query.set("overdue", String(params.overdue));
  const qs = query.toString();
  return apiFetch<Task[]>(`/api/leads/${leadId}/tasks${qs ? `?${qs}` : ""}`);
}

export function createTask(leadId: string, input: CreateTaskInput) {
  return apiFetch<Task>(`/api/leads/${leadId}/tasks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTask(id: string, input: UpdateTaskInput) {
  return apiFetch<Task>(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTask(id: string) {
  return apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" });
}
