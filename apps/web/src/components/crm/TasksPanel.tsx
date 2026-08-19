"use client";

import { useCrmStore } from "./CrmStoreProvider";

function isOverdue(dueDate: string, done: boolean) {
  if (done) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

function formatDate(dueDate: string) {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

export function TasksPanel() {
  const { tasks, leads, toggleTask } = useCrmStore();

  const sorted = [...tasks].sort((a, b) => {
    const aOverdue = isOverdue(a.dueDate, a.done);
    const bOverdue = isOverdue(b.dueDate, b.done);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <section className="col-span-12">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline text-headline-md text-primary">
            Tareas y Recordatorios
          </h3>
          <span className="font-body-custom text-label-sm text-on-surface-variant">
            {tasks.filter((task) => !task.done).length} pendientes
          </span>
        </div>

        {sorted.length === 0 ? (
          <p className="p-6 font-body-custom text-body-sm text-on-surface-variant">
            No hay tareas registradas.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {sorted.map((task) => {
              const overdue = isOverdue(task.dueDate, task.done);
              const lead = leads.find((item) => item.id === task.leadId);
              return (
                <li
                  key={task.id}
                  className={`flex items-center gap-4 px-6 py-4 ${
                    overdue ? "bg-error-container/20" : ""
                  }`}
                >
                  <input
                    id={`task-${task.id}`}
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 accent-secondary cursor-pointer"
                  />
                  <label htmlFor={`task-${task.id}`} className="flex-1 cursor-pointer">
                    <p
                      className={`font-body-custom text-label-md ${
                        task.done
                          ? "text-on-surface-variant line-through"
                          : "text-primary"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {lead ? lead.name : "Prospecto eliminado"}
                    </p>
                  </label>
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
                    {formatDate(task.dueDate)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
