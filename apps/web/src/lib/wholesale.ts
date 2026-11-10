import { apiFetch } from "./api-client";

export type AgencyKind = "AGENCY" | "WHOLESALER";
export type PartnershipStatus = "PENDING" | "ACTIVE" | "ENDED";
export type BookingStatus = "REQUESTED" | "CONFIRMED" | "CANCELLED";

export type Overview = { kind: AgencyKind; slug: string; name: string; pendingInvites: number; activeWholesalers: number };
export type Departure = { id: string; startsOn: string; seats: number; seatsLeft: number };
export type Program = {
  id: string;
  name: string;
  destination: string;
  days: number;
  description: string;
  netPrice: string;
  currency: string;
  publishedAt: string | null;
  departures: Departure[];
};
export type NetworkProgram = Omit<Program, "publishedAt"> & { wholesalerName: string; commissionPct: string };
export type Partner = {
  id: string;
  status: PartnershipStatus;
  commissionPct: string;
  createdAt: string;
  agency?: { name: string; slug: string };
  wholesaler?: { name: string; slug: string };
};
export type Booking = {
  id: string;
  travelerName: string;
  pax: number;
  status: BookingStatus;
  netTotal: string;
  commissionPct: string;
  commissionTotal: string;
  createdAt: string;
  agency: { name: string };
  wholesaler: { name: string };
  departure: { startsOn: string; program: { name: string; destination: string } };
};

const json = (method: string, body?: unknown) => ({ method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export const getOverview = () => apiFetch<Overview>("/api/wholesale/overview");
export const setAgencyKind = (kind: AgencyKind) => apiFetch<{ kind: AgencyKind }>("/api/wholesale/kind", json("PATCH", { kind }));
export const listPartners = () => apiFetch<Partner[]>("/api/wholesale/partners");
export const invitePartner = (agencySlug: string, commissionPct: number) =>
  apiFetch<Partner>("/api/wholesale/partners", json("POST", { agencySlug, commissionPct }));
export const updatePartner = (id: string, patch: { commissionPct?: number; status?: "ACTIVE" | "ENDED" }) =>
  apiFetch<Partner>(`/api/wholesale/partners/${id}`, json("PATCH", patch));
export const listPrograms = () => apiFetch<Program[]>("/api/wholesale/programs");
export const createProgram = (input: {
  name: string;
  destination: string;
  days: number;
  description: string;
  netPrice: number;
  departures: { startsOn: string; seats: number }[];
}) => apiFetch<Program>("/api/wholesale/programs", json("POST", input));
export const publishProgram = (id: string, published: boolean) =>
  apiFetch<Program>(`/api/wholesale/programs/${id}`, json("PATCH", { published }));
export const archiveProgram = (id: string) => apiFetch<void>(`/api/wholesale/programs/${id}`, json("DELETE"));
export const addDeparture = (programId: string, startsOn: string, seats: number) =>
  apiFetch<Departure>(`/api/wholesale/programs/${programId}/departures`, json("POST", { startsOn, seats }));
export const incomingBookings = () => apiFetch<Booking[]>("/api/wholesale/bookings");
export const decideBooking = (id: string, status: "CONFIRMED" | "CANCELLED") =>
  apiFetch<Booking>(`/api/wholesale/bookings/${id}`, json("PATCH", { status }));

export const myPartnerships = () => apiFetch<Partner[]>("/api/network/partnerships");
export const answerPartnership = (id: string, accept: boolean) =>
  apiFetch<Partner>(`/api/network/partnerships/${id}`, json("PATCH", { accept }));
export const networkPrograms = () => apiFetch<NetworkProgram[]>("/api/network/programs");
export const myBookings = () => apiFetch<Booking[]>("/api/network/bookings");
export const requestBooking = (departureId: string, travelerName: string, pax: number) =>
  apiFetch<Booking>("/api/network/bookings", json("POST", { departureId, travelerName, pax }));
export const cancelBooking = (id: string) => apiFetch<Booking>(`/api/network/bookings/${id}/cancel`, json("PATCH"));

/** Total neto y comisión estimados antes de reservar (el API recalcula con sus datos). */
export function bookingEstimate(netPrice: string | number, pax: number, commissionPct: string | number) {
  const net = Number(netPrice) * pax;
  const commission = Math.round(net * Number(commissionPct)) / 100;
  return { net, commission };
}

export const BOOKING_LABEL: Record<BookingStatus, string> = { REQUESTED: "Solicitada", CONFIRMED: "Confirmada", CANCELLED: "Cancelada" };
export const PARTNER_LABEL: Record<PartnershipStatus, string> = { PENDING: "Pendiente", ACTIVE: "Activa", ENDED: "Terminada" };

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
