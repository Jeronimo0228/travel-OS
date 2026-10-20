"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ChatThread } from "@/components/portal/ChatThread";
import { DocumentList } from "@/components/portal/DocumentList";
import { ItineraryTimeline } from "@/components/portal/ItineraryTimeline";
import { buildPortalLink } from "@/lib/portal";
import {
  addItineraryItem,
  addTripDocument,
  getReservation,
  issuePortalAccess,
  listTripMessages,
  sendAgencyMessage,
  type ChatMessage,
  type ReservationDetail,
} from "@/lib/reservations";

const input =
  "w-full bg-surface-container-low rounded-lg px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-secondary-container";
const card =
  "bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant shadow-sm";

function optional(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? text : undefined;
}

function localToIso(value: FormDataEntryValue | null) {
  const text = optional(value);
  return text ? new Date(`${text}:00-05:00`).toISOString() : undefined;
}

export function TripWorkspace({ id }: { id: string }) {
  const [trip, setTrip] = useState<ReservationDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [portalLink, setPortalLink] = useState<{
    url: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const [detail, chat] = await Promise.all([
        getReservation(id),
        listTripMessages(id),
      ]);
      setTrip(detail);
      setMessages(chat);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo cargar el viaje.",
      );
    }
  }, [id]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(
      () =>
        void listTripMessages(id)
          .then(setMessages)
          .catch(() => undefined),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [id, load]);

  async function submit(
    event: FormEvent<HTMLFormElement>,
    action: (form: FormData) => Promise<unknown>,
  ) {
    event.preventDefault();
    const element = event.currentTarget;
    setError(null);
    try {
      await action(new FormData(element));
      element.reset();
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar.");
    }
  }

  async function handlePortalLink() {
    setError(null);
    try {
      const access = await issuePortalAccess(id);
      setPortalLink({
        url: buildPortalLink(window.location.origin, access.accessToken),
        expiresAt: access.expiresAt,
      });
      setCopied(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo generar el enlace.",
      );
    }
  }

  if (!trip) {
    return error ? (
      <p role="alert" className="text-error">
        {error}
      </p>
    ) : (
      <div className="h-48 rounded-xl bg-surface-container-low animate-pulse" />
    );
  }

  return (
    <div className="flex flex-col gap-gutter">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <Link
            href="/viajes"
            className="text-secondary text-label-md flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>{" "}
            Viajes
          </Link>
          <h2 className="font-headline text-headline-xl text-primary mt-2">
            {trip.destination}
          </h2>
          <p className="text-body-md text-on-surface-variant">
            {trip.travelerName} · {trip.travelerEmail}
          </p>
        </div>
        <button
          type="button"
          onClick={handlePortalLink}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary to-tertiary-fixed-dim text-white rounded-full text-label-md shadow-lg shadow-secondary/20"
        >
          <span className="material-symbols-outlined">link</span> Generar enlace
          del portal
        </button>
      </div>

      {portalLink && (
        <div className={`${card} border-secondary`} role="status">
          <p className="text-label-md mb-2">
            Enlace seguro para el viajero (vence{" "}
            {new Date(portalLink.expiresAt).toLocaleString("es-CO", {
              timeZone: "America/Bogota",
            })}
            ). Generar uno nuevo revoca el anterior.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={portalLink.url}
              className={`${input} font-mono text-body-sm`}
              aria-label="Enlace del portal"
            />
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(portalLink.url);
                setCopied(true);
              }}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md whitespace-nowrap"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
            <a
              href={portalLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-outline-variant rounded-lg text-label-md whitespace-nowrap"
            >
              Abrir
            </a>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-error text-body-md">
          {error}
        </p>
      )}

      <div className="grid grid-cols-12 gap-gutter">
        <section
          className={`${card} col-span-12 xl:col-span-7`}
          aria-labelledby="itinerary-title"
        >
          <h3
            id="itinerary-title"
            className="font-headline text-headline-md mb-4"
          >
            Itinerario por días
          </h3>
          <ItineraryTimeline
            items={trip.itinerary}
            emptyText="Agrega la primera actividad del viaje."
          />
          <form
            onSubmit={(event) =>
              submit(event, (form) =>
                addItineraryItem(id, {
                  title: String(form.get("title")),
                  location: optional(form.get("location")),
                  details: optional(form.get("details")),
                  startsAt: localToIso(form.get("startsAt")),
                  position: trip.itinerary.length,
                }),
              )
            }
            className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 pt-6 border-t border-outline-variant"
          >
            <input
              name="title"
              required
              placeholder="Actividad (ej. Tour Islas del Rosario)"
              aria-label="Actividad"
              className={input}
            />
            <input
              name="startsAt"
              type="datetime-local"
              aria-label="Fecha y hora"
              className={input}
            />
            <input
              name="location"
              placeholder="Lugar"
              aria-label="Lugar"
              className={input}
            />
            <input
              name="details"
              placeholder="Detalles para el viajero"
              aria-label="Detalles"
              className={input}
            />
            <button className="md:col-span-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md">
              Agregar al itinerario
            </button>
          </form>
        </section>

        <div className="col-span-12 xl:col-span-5 flex flex-col gap-gutter">
          <section className={card} aria-labelledby="docs-title">
            <h3 id="docs-title" className="font-headline text-headline-md mb-4">
              Documentos del viaje
            </h3>
            <DocumentList
              documents={trip.documents}
              emptyText="Sin documentos todavía."
            />
            <form
              onSubmit={(event) =>
                submit(event, (form) =>
                  addTripDocument(id, {
                    name: String(form.get("name")),
                    url: String(form.get("url")),
                    contentType: optional(form.get("contentType")),
                  }),
                )
              }
              className="grid gap-3 mt-4"
            >
              <input
                name="name"
                required
                placeholder="Nombre (ej. Voucher hotel)"
                aria-label="Nombre del documento"
                className={input}
              />
              <input
                name="url"
                type="url"
                required
                pattern="https://.*"
                placeholder="https://..."
                aria-label="URL HTTPS"
                className={input}
              />
              <select
                name="contentType"
                aria-label="Tipo"
                className={input}
                defaultValue="application/pdf"
              >
                <option value="application/pdf">PDF</option>
                <option value="image/jpeg">Imagen</option>
              </select>
              <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md">
                Adjuntar documento
              </button>
            </form>
          </section>

          <section
            className={`${card} h-[480px] flex flex-col`}
            aria-labelledby="chat-title"
          >
            <h3 id="chat-title" className="font-headline text-headline-md mb-2">
              Chat con el viajero
            </h3>
            <div className="flex-1 min-h-0">
              <ChatThread
                messages={messages}
                viewer="AGENCY"
                placeholder="Responder al viajero..."
                emptyText="Aún no hay mensajes."
                onSend={async (body) => {
                  await sendAgencyMessage(id, body);
                  setMessages(await listTripMessages(id));
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
