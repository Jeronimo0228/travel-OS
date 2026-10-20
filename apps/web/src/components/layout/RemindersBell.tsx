"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  listReminders,
  markReminderRead,
  overdueLabel,
  unreadCount,
  type FollowUpReminder,
} from "@/lib/reminders";

const POLL_MS = 60_000;

export function RemindersBell() {
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    listReminders()
      .then(setReminders)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  async function markRead(id: string) {
    await markReminderRead(id).catch(() => undefined);
    refresh();
  }

  const unread = unreadCount(reminders);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={`Recordatorios de seguimiento: ${unread} sin leer`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-alert-coral text-white text-[11px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="bg-surface-container-low px-4 py-3 flex justify-between items-center">
            <p className="text-label-md flex items-center gap-2">
              <span
                className="material-symbols-outlined text-alert-coral"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                notification_important
              </span>
              Follow-ups vencidos
            </p>
            <span className="text-label-sm text-on-surface-variant">
              {unread} sin leer
            </span>
          </div>
          <ul className="max-h-96 overflow-y-auto divide-y divide-outline-variant">
            {reminders.length === 0 && (
              <li className="p-6 text-center text-body-sm text-on-surface-variant">
                Todo al día. No hay seguimientos vencidos.
              </li>
            )}
            {reminders.map((reminder) => (
              <li
                key={reminder.id}
                className={`p-4 flex gap-3 ${reminder.readAt ? "opacity-60" : "border-l-4 border-alert-coral"}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-label-md truncate">
                    {reminder.task.title}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {reminder.task.lead.name}
                    {reminder.task.lead.destination
                      ? ` · ${reminder.task.lead.destination}`
                      : ""}
                  </p>
                  <p className="text-label-sm text-alert-coral mt-1">
                    {overdueLabel(reminder.dueAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Link
                    href="/crm"
                    className="text-secondary text-label-sm hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Abrir CRM
                  </Link>
                  {!reminder.readAt && (
                    <button
                      type="button"
                      onClick={() => markRead(reminder.id)}
                      className="text-label-sm text-on-surface-variant hover:text-primary"
                    >
                      Marcar leído
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
