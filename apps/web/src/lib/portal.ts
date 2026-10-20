import { apiFetch } from "./api-client";
import type { ChatMessage, ItineraryItem, TripDocument } from "./reservations";

export type TravelerTrip = {
  id: string;
  travelerName: string;
  destination: string;
  startsAt: string;
  endsAt: string;
};

export const PORTAL_TOKEN_KEY = "travelos.portal.token";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function readTokenFromHash(hash: string): string | null {
  const token = new URLSearchParams(hash.replace(/^#/, "")).get("t");
  return token && TOKEN_PATTERN.test(token) ? token : null;
}

export function buildPortalLink(origin: string, token: string): string {
  return `${origin}/portal#t=${token}`;
}

function portalFetch<T>(token: string, path: string, init: RequestInit = {}) {
  return apiFetch<T>(`/api/portal${path}`, {
    ...init,
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export const getTravelerTrip = (token: string) =>
  portalFetch<TravelerTrip>(token, "/reservation");
export const getTravelerItinerary = (token: string) =>
  portalFetch<ItineraryItem[]>(token, "/itinerary");
export const getTravelerDocuments = (token: string) =>
  portalFetch<TripDocument[]>(token, "/documents");
export const getTravelerMessages = (token: string) =>
  portalFetch<ChatMessage[]>(token, "/messages");
export const sendTravelerMessage = (token: string, body: string) =>
  portalFetch<ChatMessage>(token, "/messages", {
    method: "POST",
    body: JSON.stringify({ body }),
  });

export type ItineraryDay = {
  key: string;
  label: string;
  items: ItineraryItem[];
};

export function groupItineraryByDay(
  items: ItineraryItem[],
  timeZone = "America/Bogota",
): ItineraryDay[] {
  const keyFormat = new Intl.DateTimeFormat("en-CA", { timeZone });
  const labelFormat = new Intl.DateTimeFormat("es-CO", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const days = new Map<string, ItineraryDay>();
  const sorted = [...items].sort((left, right) => {
    const a = left.startsAt ? Date.parse(left.startsAt) : Infinity;
    const b = right.startsAt ? Date.parse(right.startsAt) : Infinity;
    return a - b || left.position - right.position;
  });
  for (const item of sorted) {
    const date = item.startsAt ? new Date(item.startsAt) : null;
    const key = date ? keyFormat.format(date) : "sin-fecha";
    const label = date ? labelFormat.format(date) : "Por confirmar";
    const day = days.get(key) ?? { key, label, items: [] };
    day.items.push(item);
    days.set(key, day);
  }
  return [...days.values()];
}

export type TripPhase =
  | { phase: "upcoming"; days: number }
  | { phase: "traveling"; day: number; totalDays: number }
  | { phase: "finished" };

export function tripPhase(
  startsAt: string,
  endsAt: string,
  now = Date.now(),
): TripPhase {
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  const dayMs = 86_400_000;
  if (now < start)
    return { phase: "upcoming", days: Math.ceil((start - now) / dayMs) };
  if (now <= end) {
    return {
      phase: "traveling",
      day: Math.floor((now - start) / dayMs) + 1,
      totalDays: Math.max(1, Math.ceil((end - start) / dayMs)),
    };
  }
  return { phase: "finished" };
}

export function documentIcon(contentType: string | null, name: string): string {
  const value = `${contentType ?? ""} ${name}`.toLowerCase();
  if (value.includes("pasaporte") || value.includes("passport")) return "badge";
  if (value.includes("voucher") || value.includes("hotel")) return "hotel";
  if (
    value.includes("vuelo") ||
    value.includes("tiquete") ||
    value.includes("boarding")
  )
    return "flight";
  if (value.includes("seguro") || value.includes("insurance"))
    return "health_and_safety";
  if (value.includes("pdf")) return "picture_as_pdf";
  if (value.includes("image")) return "image";
  return "description";
}
