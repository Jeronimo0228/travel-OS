import { apiFetch } from "./api-client";

export type AuditLog = {
  id: string;
  agencyId: string;
  userId: string | null;
  action: string;
  meta: unknown;
  createdAt: string;
};

export function listAuditLogs(params: { take?: number } = {}) {
  const query = new URLSearchParams();
  if (params.take) query.set("take", String(params.take));
  const qs = query.toString();
  return apiFetch<{ items: AuditLog[]; total: number }>(
    `/api/audit-logs${qs ? `?${qs}` : ""}`,
  );
}
