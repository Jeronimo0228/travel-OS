import type { CreateQuoteInput } from "@travelos/shared";
import { API_URL, ApiError, apiFetch } from "./api-client";

export type PdfStatus = "NOT_REQUESTED" | "PENDING" | "READY" | "FAILED";

export type QuoteItem = {
  id: string;
  nameSnapshot: string;
  descriptionSnapshot: string;
  pricingUnit: "PER_NIGHT" | "PER_PERSON";
  quantity: number;
  unitPrice: string;
};

export type QuoteOption = {
  id: string;
  position: number;
  title: string;
  summary: string;
  totalPrice: string;
  currency: string;
  items: QuoteItem[];
};

export type Quote = {
  id: string;
  leadId: string | null;
  prompt: string;
  destination: string;
  durationDays: number;
  travelerCount: number;
  pdfStatus: PdfStatus;
  createdAt: string;
  updatedAt: string;
  options: QuoteOption[];
};

export function createQuote(input: CreateQuoteInput) {
  return apiFetch<Quote>("/api/quotes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listQuotes(take = 20) {
  return apiFetch<{ items: Quote[]; total: number }>(
    `/api/quotes?take=${take}`,
  );
}

export function getQuote(id: string) {
  return apiFetch<Quote>(`/api/quotes/${id}`);
}

export function linkQuoteLead(id: string, leadId: string) {
  return apiFetch<Quote>(`/api/quotes/${id}/lead`, {
    method: "PUT",
    body: JSON.stringify({ leadId }),
  });
}

export function requestQuotePdf(id: string) {
  return apiFetch<{ status: PdfStatus }>(`/api/quotes/${id}/pdf`, {
    method: "POST",
  });
}

export async function downloadQuotePdf(id: string): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/quotes/${id}/pdf`, {
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que la API esté disponible.",
    );
  }

  if (!res.ok) {
    throw new ApiError(
      `No se pudo descargar el PDF (${res.status}).`,
      undefined,
      res.status,
    );
  }
  if (!res.headers.get("content-type")?.includes("application/pdf")) {
    throw new ApiError("El PDF todavía no está listo. Inténtalo de nuevo.");
  }

  return res.blob();
}
