import { apiFetch } from "./api-client";

export type LeadStage =
  "PROSPECTO" | "COTIZANDO" | "CIERRE" | "GANADO" | "PERDIDO";

export type DashboardMetrics = {
  sales: { totalLeads: number; wonLeads: number; conversionRate: number };
  advisors: { id: string; name: string; leads: number; wonLeads: number }[];
  destinations: { destination: string; leads: number; wonLeads: number }[];
};

export type UpcomingTrip = {
  id: string;
  travelerName: string;
  destination: string;
  startsAt: string;
  endsAt: string;
};

export type OperationsMetrics = {
  pipeline: { stage: LeadStage; count: number }[];
  revenue: { currency: string; won: number; open: number; quotes: number };
  trips: { active: number; travelingNow: number; upcoming: UpcomingTrip[] };
  followUps: { overdueTasks: number; unreadReminders: number };
  portal: { travelerMessagesLast7Days: number };
};

export function getDashboardMetrics() {
  return apiFetch<DashboardMetrics>("/api/metrics");
}

export function getOperationsMetrics() {
  return apiFetch<OperationsMetrics>("/api/metrics/operations");
}

export const stageLabels: Record<LeadStage, string> = {
  PROSPECTO: "Prospecto",
  COTIZANDO: "Cotizando",
  CIERRE: "Cierre",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
};

export function winRate(leads: number, won: number): number {
  if (leads === 0) return 0;
  return Math.round((won / leads) * 100);
}

export function shareOfMax(value: number, values: number[]): number {
  const max = Math.max(0, ...values);
  if (max === 0) return 0;
  return Math.round((value / max) * 100);
}

export function daysUntil(isoDate: string, now: number = Date.now()): number {
  return Math.ceil((new Date(isoDate).getTime() - now) / 86_400_000);
}
