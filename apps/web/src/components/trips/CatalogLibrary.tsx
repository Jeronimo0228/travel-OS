"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import type { CreateItineraryItemInput } from "@travelos/shared";
import { listCatalog, type CatalogItem, type CatalogKind } from "@/lib/catalog";
import { formatCop } from "@/lib/format";
import type { ReservationDetail } from "@/lib/reservations";
import {
  buildCatalogActivityInput,
  isValidTime,
  tripDays,
  type TripDay,
} from "@/lib/trip-planning";

const GROUPS: Array<{ kind: CatalogKind; label: string }> = [
  { kind: "HOTEL", label: "Hoteles" },
  { kind: "ACTIVITY", label: "Actividades" },
];

const UNIT_LABELS = { PER_NIGHT: "noche", PER_PERSON: "persona" } as const;

const field =
  "w-full bg-surface-container-low rounded-lg px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-secondary-container";

function errorText(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

function AddToDayForm({
  days,
  onSubmit,
  onCancel,
}: {
  days: TripDay[];
  onSubmit: (dayKey: string, time: string) => Promise<void>;
  onCancel: () => void;
}) {
  const id = useId();
  const [dayKey, setDayKey] = useState(days[0]?.key ?? "");
  const [time, setTime] = useState("09:00");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dayKey) return setError("Elige el día.");
    if (!isValidTime(time)) return setError("Elige la hora.");
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(dayKey, time);
    } catch (cause) {
      setError(errorText(cause, "No se pudo añadir la actividad."));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-3 grid gap-3">
      <div>
        <label htmlFor={`${id}-day`} className="text-label-sm text-on-surface-variant">
          Día
        </label>
        <select
          id={`${id}-day`}
          value={dayKey}
          onChange={(event) => setDayKey(event.target.value)}
          className={field}
        >
          {days.map((day, index) => (
            <option key={day.key} value={day.key}>
              Día {index + 1} · {day.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-time`} className="text-label-sm text-on-surface-variant">
          Hora
        </label>
        <input
          id={`${id}-time`}
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className={field}
        />
      </div>
      {error && (
        <p role="alert" className="text-error text-body-sm">
          {error}
        </p>
      )}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 border border-outline-variant rounded-lg text-label-md"
        >
          Cancelar
        </button>
        <button
          disabled={submitting}
          className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-60"
        >
          Añadir al itinerario
        </button>
      </div>
    </form>
  );
}

export function CatalogLibrary({
  trip,
  onAdd,
}: {
  trip: ReservationDetail;
  onAdd: (input: CreateItineraryItemInput) => Promise<void>;
}) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const days = tripDays(trip.startsAt, trip.endsAt);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCatalog({ destination: trip.destination })
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((cause) => {
        if (!cancelled)
          setError(errorText(cause, "No se pudo cargar el catálogo."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trip.destination, reloadToken]);

  async function handleAdd(item: CatalogItem, dayKey: string, time: string) {
    await onAdd(
      buildCatalogActivityInput(item, {
        dayKey,
        time,
        position: trip.itinerary.length,
      }),
    );
    setOpenId(null);
    setNotice(
      `«${item.name}» añadida al día ${days.findIndex((day) => day.key === dayKey) + 1}.`,
    );
  }

  return (
    <section
      aria-labelledby="catalog-title"
      className="mt-6 pt-6 border-t border-outline-variant"
    >
      <h4 id="catalog-title" className="font-headline text-body-lg font-bold mb-1">
        Añadir desde el catálogo
      </h4>
      <p className="text-body-sm text-on-surface-variant mb-4">
        Hoteles y actividades de tu agencia para {trip.destination}.
      </p>

      {loading && (
        <div className="h-24 rounded-xl bg-surface-container-low animate-pulse" />
      )}

      {!loading && error && (
        <div role="alert" className="text-error text-body-sm">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setReloadToken((token) => token + 1)}
            className="mt-2 px-3 py-1 border border-error rounded-lg text-label-md"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-body-sm text-on-surface-variant">
          Tu agencia no tiene hoteles ni actividades en el catálogo para este
          destino. Puedes agregar una actividad con el formulario de abajo.
        </p>
      )}

      {!loading &&
        !error &&
        GROUPS.map((group) => {
          const groupItems = items.filter((item) => item.kind === group.kind);
          if (groupItems.length === 0) return null;
          return (
            <div key={group.kind} className="mb-4">
              <h5 className="text-label-md uppercase tracking-wider text-on-surface-variant mb-2">
                {group.label}
              </h5>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupItems.map((item) => {
                  const isOpen = openId === item.id;
                  return (
                    <li
                      key={item.id}
                      className="rounded-lg border border-outline-variant p-3"
                    >
                      <p className="text-label-md font-bold">{item.name}</p>
                      <p className="text-body-sm text-on-surface-variant line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-label-sm">
                          {formatCop(item.price, item.currency)} /{" "}
                          {UNIT_LABELS[item.pricingUnit]}
                        </span>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                          className="px-3 py-1 border border-outline-variant rounded-lg text-label-md"
                        >
                          {isOpen ? "Cerrar" : "Añadir"}
                        </button>
                      </div>
                      {isOpen && (
                        <AddToDayForm
                          days={days}
                          onSubmit={(dayKey, time) =>
                            handleAdd(item, dayKey, time)
                          }
                          onCancel={() => setOpenId(null)}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

      <p role="status" aria-live="polite" className="text-body-sm text-secondary empty:hidden">
        {notice}
      </p>
    </section>
  );
}
