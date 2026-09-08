"use client";

import { useEffect, useState } from "react";
import {
  listLeadTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
} from "@/lib/tasks";
import { ApiError } from "@/lib/api-client";
import { EmptyState } from "./EmptyState";

function isOverdue(task: Task) {
  if (task.completedAt || !task.dueAt) return false;
  return new Date(task.dueAt).getTime() < Date.now();
}

function formatDate(dueAt: string) {
  return new Date(dueAt).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

export function LeadTasksPanel({ leadId }: { leadId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listLeadTasks(leadId)
      .then((result) => {
        if (!cancelled) setTasks(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "No se pudieron cargar las tareas.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  async function handleAddTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    const task = await createTask(leadId, {
      title: title.trim(),
      dueAt: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : undefined,
    });
    setTasks((prev) => [task, ...prev]);
    setTitle("");
    setDueDate("");
  }

  async function handleToggle(task: Task) {
    const updated = await updateTask(task.id, {
      completedAt: task.completedAt ? null : new Date().toISOString(),
    });
    setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setTasks((prev) => prev.filter((item) => item.id !== id));
  }

  const sorted = [...tasks].sort((a, b) => {
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    const aDone = Boolean(a.completedAt);
    const bDone = Boolean(b.completedAt);
    if (aDone !== bDone) return aDone ? 1 : -1;
    return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
  });

  return (
    <div className="bg-surface-container-low border-t border-outline-variant px-6 py-4">
      <form onSubmit={handleAddTask} className="flex flex-wrap items-center gap-2 mb-3">
        <label className="sr-only" htmlFor={`task-title-${leadId}`}>
          Nueva tarea
        </label>
        <input
          id={`task-title-${leadId}`}
          type="text"
          placeholder="Nueva tarea..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="flex-1 min-w-[160px] border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm outline-none focus:ring-2 focus:ring-secondary-container bg-surface-container-lowest"
        />
        <label className="sr-only" htmlFor={`task-due-${leadId}`}>
          Fecha límite
        </label>
        <input
          id={`task-due-${leadId}`}
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm outline-none focus:ring-2 focus:ring-secondary-container bg-surface-container-lowest"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-body-custom text-label-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Agregar
        </button>
      </form>

      {loading && (
        <p className="font-body-custom text-body-sm text-on-surface-variant">
          Cargando tareas...
        </p>
      )}
      {error && (
        <p className="font-body-custom text-body-sm text-alert-coral">{error}</p>
      )}
      {!loading && !error && sorted.length === 0 && (
        <EmptyState
          icon="task_alt"
          title="Sin tareas pendientes"
          description="Añade un seguimiento o recordatorio para este prospecto."
        />
      )}
      {!loading && sorted.length > 0 && (
        <ul className="divide-y divide-outline-variant">
          {sorted.map((task) => {
            const overdue = isOverdue(task);
            return (
              <li key={task.id} className="flex items-center gap-3 py-2">
                <input
                  id={`task-${task.id}`}
                  type="checkbox"
                  checked={Boolean(task.completedAt)}
                  onChange={() => handleToggle(task)}
                  className="w-4 h-4 accent-secondary cursor-pointer"
                />
                <label htmlFor={`task-${task.id}`} className="flex-1 cursor-pointer">
                  <p
                    className={`font-body-custom text-body-sm ${
                      task.completedAt
                        ? "text-on-surface-variant line-through"
                        : "text-primary"
                    }`}
                  >
                    {task.title}
                  </p>
                </label>
                {task.dueAt && (
                  <span
                    className={`font-body-custom text-label-sm shrink-0 ${
                      overdue ? "text-alert-coral font-bold" : "text-on-surface-variant"
                    }`}
                  >
                    {overdue && (
                      <span
                        className="material-symbols-outlined text-[16px] align-middle mr-1"
                        aria-hidden="true"
                      >
                        warning
                      </span>
                    )}
                    {formatDate(task.dueAt)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  aria-label={`Eliminar tarea ${task.title}`}
                  className="text-on-surface-variant hover:text-alert-coral transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
