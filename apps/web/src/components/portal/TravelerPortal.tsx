"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatThread } from "./ChatThread";
import { DocumentList } from "./DocumentList";
import { ItineraryTimeline } from "./ItineraryTimeline";
import {
  PORTAL_TOKEN_KEY,
  getTravelerDocuments,
  getTravelerItinerary,
  getTravelerMessages,
  getTravelerTrip,
  readTokenFromHash,
  sendTravelerMessage,
  tripPhase,
  type TravelerTrip,
} from "@/lib/portal";
import type {
  ChatMessage,
  ItineraryItem,
  TripDocument,
} from "@/lib/reservations";

type Tab = "itinerary" | "documents" | "chat";
type PortalData = {
  trip: TravelerTrip;
  itinerary: ItineraryItem[];
  documents: TripDocument[];
};

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "itinerary", label: "Itinerario", icon: "map" },
  { id: "documents", label: "Documentos", icon: "folder_open" },
  { id: "chat", label: "Chat", icon: "forum" },
];

const dateFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "numeric",
  month: "short",
});

function PhaseBadge({ trip }: { trip: TravelerTrip }) {
  const phase = tripPhase(trip.startsAt, trip.endsAt);
  const text =
    phase.phase === "upcoming"
      ? `Faltan ${phase.days} ${phase.days === 1 ? "día" : "días"}`
      : phase.phase === "traveling"
        ? `Día ${phase.day} de ${phase.totalDays}`
        : "Viaje finalizado";
  return (
    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-label-sm">
      <span className="material-symbols-outlined text-[16px]">schedule</span>
      {text}
    </span>
  );
}

export function TravelerPortal() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<PortalData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("itinerary");

  useEffect(() => {
    const fromHash = readTokenFromHash(window.location.hash);
    if (fromHash) {
      sessionStorage.setItem(PORTAL_TOKEN_KEY, fromHash);
      window.history.replaceState(null, "", window.location.pathname);
    }
    setToken(fromHash ?? sessionStorage.getItem(PORTAL_TOKEN_KEY));
    setReady(true);
  }, []);

  const refreshMessages = useCallback(async () => {
    if (!token) return;
    setMessages(await getTravelerMessages(token));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getTravelerTrip(token),
      getTravelerItinerary(token),
      getTravelerDocuments(token),
      getTravelerMessages(token),
    ])
      .then(([trip, itinerary, documents, chat]) => {
        setData({ trip, itinerary, documents });
        setMessages(chat);
      })
      .catch(() => {
        sessionStorage.removeItem(PORTAL_TOKEN_KEY);
        setError(
          "Tu enlace venció o ya no es válido. Pide a tu agencia uno nuevo.",
        );
      });
  }, [token]);

  useEffect(() => {
    if (!data) return;
    const timer = window.setInterval(
      () => void refreshMessages().catch(() => undefined),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [data, refreshMessages]);

  if (ready && (!token || error)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="max-w-sm text-center bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm">
          <span className="material-symbols-outlined text-secondary text-5xl">
            lock
          </span>
          <h1 className="font-headline text-headline-md mt-4">
            Portal del viajero
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            {error ??
              "Abre el enlace seguro que te envió tu agencia para ver tu viaje."}
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-surface"
        aria-busy="true"
      >
        <span className="material-symbols-outlined animate-spin text-secondary text-4xl">
          progress_activity
        </span>
      </main>
    );
  }

  const { trip } = data;
  const firstName = trip.travelerName.split(" ")[0];

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-8">
      <header className="relative overflow-hidden bg-gradient-to-br from-primary-container via-secondary to-secondary-container text-white">
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10"
          aria-hidden
        />
        <div
          className="absolute right-10 bottom-[-60px] w-40 h-40 rounded-full bg-white/10"
          aria-hidden
        />
        <div className="relative max-w-2xl mx-auto px-5 pt-8 pb-10">
          <p className="text-label-sm uppercase tracking-widest opacity-80 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              travel_explore
            </span>{" "}
            TravelOS · Portal del viajero
          </p>
          <h1 className="font-headline text-headline-xl mt-3">
            Hola, {firstName}
          </h1>
          <p className="text-body-lg opacity-90 mt-1 flex items-center gap-2">
            <span className="material-symbols-outlined">flight_takeoff</span>
            {trip.destination}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-body-md">
              {dateFormat.format(new Date(trip.startsAt))} –{" "}
              {dateFormat.format(new Date(trip.endsAt))}
            </span>
            <PhaseBadge trip={trip} />
          </div>
          <dl className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Actividades", value: data.itinerary.length },
              { label: "Documentos", value: data.documents.length },
              { label: "Mensajes", value: messages.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/15 backdrop-blur rounded-xl px-3 py-2"
              >
                <dt className="text-[11px] uppercase opacity-80">
                  {stat.label}
                </dt>
                <dd className="font-headline text-headline-md">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <nav
        aria-label="Secciones del portal"
        className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest border-t border-outline-variant md:static md:max-w-2xl md:mx-auto md:mt-4 md:rounded-full md:border"
      >
        <ul className="grid grid-cols-3">
          {tabs.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => setTab(entry.id)}
                aria-current={tab === entry.id ? "page" : undefined}
                className={`w-full flex flex-col md:flex-row md:justify-center items-center gap-1 py-3 text-label-sm transition ${
                  tab === entry.id
                    ? "text-secondary font-bold"
                    : "text-on-surface-variant"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    tab === entry.id
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {entry.icon}
                </span>
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="max-w-2xl mx-auto px-5 mt-6">
        {tab === "itinerary" && (
          <ItineraryTimeline
            items={data.itinerary}
            emptyText="Tu agencia aún está armando el itinerario."
          />
        )}
        {tab === "documents" && (
          <DocumentList
            documents={data.documents}
            emptyText="Todavía no hay documentos cargados."
          />
        )}
        {tab === "chat" && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 h-[60vh]">
            <ChatThread
              messages={messages}
              viewer="TRAVELER"
              placeholder="Escribe a tu agencia..."
              emptyText="¿Tienes dudas? Escríbele a tu agencia."
              onSend={async (body) => {
                await sendTravelerMessage(token as string, body);
                await refreshMessages();
              }}
            />
          </div>
        )}
      </section>
    </main>
  );
}
