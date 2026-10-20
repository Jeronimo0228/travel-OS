import { apiFetch } from "./api-client";

export type FollowUpReminder = {
  id: string;
  taskId: string;
  dueAt: string;
  createdAt: string;
  readAt: string | null;
  task: {
    id: string;
    title: string;
    dueAt: string | null;
    lead: { id: string; name: string; destination: string | null };
  };
};

export const listReminders = () =>
  apiFetch<FollowUpReminder[]>("/api/tasks/reminders");

export const markReminderRead = (id: string) =>
  apiFetch<FollowUpReminder>(`/api/tasks/reminders/${id}/read`, {
    method: "PATCH",
  });

export function unreadCount(reminders: FollowUpReminder[]): number {
  return reminders.filter((reminder) => !reminder.readAt).length;
}

export function overdueLabel(dueAt: string, now: number = Date.now()): string {
  const hours = Math.max(0, Math.floor((now - Date.parse(dueAt)) / 3_600_000));
  if (hours < 1) return "vencido hace menos de 1 h";
  if (hours < 24) return `vencido hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `vencido hace ${days} ${days === 1 ? "día" : "días"}`;
}
