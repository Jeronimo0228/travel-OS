"use client";

import { useId, useState, type FormEvent } from "react";
import type { UpdateItineraryItemInput } from "@travelos/shared";
import type { ItineraryItem } from "@/lib/reservations";
import {
  buildUpdateInput,
  itemToFormValues,
  validateItemForm,
  type ItemFormErrors,
  type ItemFormValues,
} from "@/lib/trip-editing";

const field =
  "w-full bg-surface-container-low rounded-lg px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-secondary-container";
const smallButton =
  "px-3 py-1.5 border border-outline-variant rounded-lg text-label-md";

function messageOf(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

export function ItineraryItemActions({
  item,
  onUpdate,
  onDelete,
}: {
  item: ItineraryItem;
  onUpdate: (itemId: string, input: UpdateItineraryItemInput) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}) {
  const id = useId();
  const [mode, setMode] = useState<"idle" | "editing" | "deleting">("idle");
  const [values, setValues] = useState<ItemFormValues>(() => itemToFormValues(item));
  const [errors, setErrors] = useState<ItemFormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const changes = buildUpdateInput(item, values);
  const hasChanges = Object.keys(changes).length > 0;

  function change<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function open(next: "editing" | "deleting") {
    setValues(itemToFormValues(item));
    setErrors({});
    setError(null);
    setMode(next);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const found = validateItemForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0 || !hasChanges) return;
    setBusy(true);
    setError(null);
    try {
      await onUpdate(item.id, changes);
      setMode("idle");
    } catch (cause) {
      setError(messageOf(cause, "No se pudo guardar la actividad."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await onDelete(item.id);
    } catch (cause) {
      setError(messageOf(cause, "No se pudo eliminar la actividad."));
      setBusy(false);
    }
  }

  if (mode === "idle") {
    return (
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => open("editing")} className={smallButton}>
          Editar
        </button>
        <button type="button" onClick={() => open("deleting")} className={smallButton}>
          Eliminar
        </button>
      </div>
    );
  }

  if (mode === "deleting") {
    return (
      <div className="mt-3" role="group" aria-label={`Eliminar ${item.title}`}>
        <p className="text-body-sm mb-2">¿Eliminar «{item.title}» del itinerario?</p>
        {error && (
          <p role="alert" className="text-error text-body-sm mb-2">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("idle")} className={smallButton}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="px-3 py-1.5 bg-error text-on-error rounded-lg text-label-md disabled:opacity-60"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} noValidate className="mt-3 grid gap-3">
      <div>
        <label htmlFor={`${id}-title`} className="text-label-sm text-on-surface-variant">
          Título
        </label>
        <input
          id={`${id}-title`}
          value={values.title}
          maxLength={200}
          onChange={(event) => change("title", event.target.value)}
          className={field}
        />
        {errors.title && <p className="text-error text-body-sm mt-1">{errors.title}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-date`} className="text-label-sm text-on-surface-variant">
            Día
          </label>
          <input
            id={`${id}-date`}
            type="date"
            value={values.date}
            onChange={(event) => change("date", event.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${id}-time`} className="text-label-sm text-on-surface-variant">
            Hora
          </label>
          <input
            id={`${id}-time`}
            type="time"
            value={values.time}
            onChange={(event) => change("time", event.target.value)}
            className={field}
          />
          {errors.time && <p className="text-error text-body-sm mt-1">{errors.time}</p>}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-location`} className="text-label-sm text-on-surface-variant">
          Lugar
        </label>
        <input
          id={`${id}-location`}
          value={values.location}
          maxLength={240}
          onChange={(event) => change("location", event.target.value)}
          className={field}
        />
      </div>
      <div>
        <label htmlFor={`${id}-details`} className="text-label-sm text-on-surface-variant">
          Detalles
        </label>
        <textarea
          id={`${id}-details`}
          rows={2}
          value={values.details}
          maxLength={2000}
          onChange={(event) => change("details", event.target.value)}
          className={field}
        />
      </div>
      {error && (
        <p role="alert" className="text-error text-body-sm">
          {error}
        </p>
      )}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setMode("idle")} className={smallButton}>
          Cancelar
        </button>
        <button
          disabled={busy || !hasChanges}
          className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-60"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
