import type {
  CreateItineraryItemInput,
  CreateReservationDocumentInput,
  CreateReservationInput,
  UpdateItineraryItemInput,
} from "@travelos/shared";
import { apiFetch } from "./api-client";

export type ItineraryItem = {
  id: string;
  reservationId: string;
  title: string;
  details: string | null;
  location: string | null;
  startsAt: string | null;
  endsAt: string | null;
  position: number;
};

export type TripDocument = {
  id: string;
  reservationId: string;
  name: string;
  url: string;
  contentType: string | null;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  reservationId: string;
  sender: "TRAVELER" | "AGENCY";
  body: string;
  createdAt: string;
};

export type Reservation = {
  id: string;
  leadId: string;
  travelerName: string;
  travelerEmail: string;
  destination: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
};

export type ReservationDetail = Reservation & {
  itinerary: ItineraryItem[];
  documents: TripDocument[];
};

export type PortalAccess = { accessToken: string; expiresAt: string };

const json = (body: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(body),
});

export const listReservations = () =>
  apiFetch<Reservation[]>("/api/reservations");

export const getReservation = (id: string) =>
  apiFetch<ReservationDetail>(`/api/reservations/${id}`);

export const createReservation = (input: CreateReservationInput) =>
  apiFetch<Reservation>("/api/reservations", json(input));

export const addItineraryItem = (id: string, input: CreateItineraryItemInput) =>
  apiFetch<ItineraryItem>(`/api/reservations/${id}/itinerary`, json(input));

export const addTripDocument = (
  id: string,
  input: CreateReservationDocumentInput,
) => apiFetch<TripDocument>(`/api/reservations/${id}/documents`, json(input));

// Endpoints below are specified in documentation/plans/sprint-4/frontend-backend-contract.md
// and stay behind feature flags (lib/features.ts) until the API ships them.
export const updateItineraryItem = (
  id: string,
  itemId: string,
  input: UpdateItineraryItemInput,
) =>
  apiFetch<ItineraryItem>(`/api/reservations/${id}/itinerary/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const deleteItineraryItem = (id: string, itemId: string) =>
  apiFetch<void>(`/api/reservations/${id}/itinerary/${itemId}`, {
    method: "DELETE",
  });

export const uploadTripDocument = (id: string, file: File, name?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (name) form.append("name", name);
  return apiFetch<TripDocument>(`/api/reservations/${id}/documents/upload`, {
    method: "POST",
    body: form,
  });
};

export const issuePortalAccess = (id: string) =>
  apiFetch<PortalAccess>(`/api/reservations/${id}/portal-access`, json({}));

export const listTripMessages = (id: string) =>
  apiFetch<ChatMessage[]>(`/api/reservations/${id}/messages`);

export const sendAgencyMessage = (id: string, body: string) =>
  apiFetch<ChatMessage>(`/api/reservations/${id}/messages`, json({ body }));
