"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { listLeads, type Lead } from "@/lib/leads";
import { tripPhase } from "@/lib/portal";
import {
  createReservation,
  listReservations,
  type Reservation,
} from "@/lib/reservations";

const dateFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const input =
  "w-full bg-surface-container-low rounded-lg px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-secondary-container";

function toIso(date: string) {
  return new Date(`${date}T00:00:00-05:00`).toISOString();
}

function phaseLabel(trip: Reservation) {
  const phase = tripPhase(trip.startsAt, trip.endsAt);
  if (phase.phase === "upcoming")
    return {
      text: `Sale en ${phase.days} d`,
      tone: "bg-secondary/10 text-secondary",
    };
  if (phase.phase === "traveling")
    return {
      text: `En viaje · día ${phase.day}`,
      tone: "bg-success-emerald/10 text-success-emerald",
    };
  return {
    text: "Finalizado",
    tone: "bg-surface-container-high text-on-surface-variant",
  };
}

export function TripsBoard() {
  const [trips, setTrips] = useState<Reservation[] | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [reservations, leadPage] = await Promise.all([
        listReservations(),
        listLeads({ take: 100 }),
      ]);
      setTrips(reservations);
      setLeads(leadPage.items);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron cargar los viajes.",
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await createReservation({
        leadId: String(form.get("leadId")),
        travelerName: String(form.get("travelerName")),
        travelerEmail: String(form.get("travelerEmail")),
        destination: String(form.get("destination")),
        startsAt: toIso(String(form.get("startsAt"))),
        endsAt: toIso(String(form.get("endsAt"))),
      });
      setShowForm(false);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo crear el viaje.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-gutter">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-headline-xl text-primary mb-1">
            Viajes y portal del viajero
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Arma el itinerario, comparte documentos y conversa con cada viajero
            desde un solo lugar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg text-label-md shadow-lg shadow-secondary/20"
        >
          <span className="material-symbols-outlined">add_circle</span> Nuevo
          viaje
        </button>
      </div>

      {error && (
        <p role="alert" className="text-error text-body-md">
          {error}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant"
        >
          <label className="text-label-md flex flex-col gap-1 md:col-span-3">
            Lead ganado o en cierre
            <select name="leadId" required className={input}>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} · {lead.destination ?? "sin destino"} ·{" "}
                  {lead.stage}
                </option>
              ))}
            </select>
          </label>
          <label className="text-label-md flex flex-col gap-1">
            Viajero
            <input name="travelerName" required className={input} />
          </label>
          <label className="text-label-md flex flex-col gap-1">
            Correo
            <input
              name="travelerEmail"
              type="email"
              required
              className={input}
            />
          </label>
          <label className="text-label-md flex flex-col gap-1">
            Destino
            <input name="destination" required className={input} />
          </label>
          <label className="text-label-md flex flex-col gap-1">
            Salida
            <input name="startsAt" type="date" required className={input} />
          </label>
          <label className="text-label-md flex flex-col gap-1">
            Regreso
            <input name="endsAt" type="date" required className={input} />
          </label>
          <div className="flex items-end">
            <button
              disabled={saving}
              className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md disabled:opacity-50"
            >
              {saving ? "Creando..." : "Crear viaje"}
            </button>
          </div>
        </form>
      )}

      {trips === null ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-36 rounded-xl bg-surface-container-low animate-pulse"
            />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">
          Aún no hay viajes. Crea el primero desde un lead ganado.
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {trips.map((trip) => {
            const badge = phaseLabel(trip);
            return (
              <li key={trip.id}>
                <Link
                  href={`/viajes/${trip.id}`}
                  className="block bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant shadow-sm hover:shadow-md hover:border-secondary transition"
                >
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-secondary text-3xl">
                      luggage
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-label-sm ${badge.tone}`}
                    >
                      {badge.text}
                    </span>
                  </div>
                  <p className="font-headline text-headline-md mt-3">
                    {trip.destination}
                  </p>
                  <p className="text-body-md">{trip.travelerName}</p>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    {dateFormat.format(new Date(trip.startsAt))} →{" "}
                    {dateFormat.format(new Date(trip.endsAt))}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
