import { ApiError } from "./api-client";
import type { QuoteOption } from "./quotes";

const STATUS_MESSAGES: Record<number, string> = {
  400: "No pudimos armar una cotización con ese pedido. Revisa que el destino esté en el catálogo de tu agencia e inténtalo de nuevo.",
  403: "No tienes permiso para realizar esta acción.",
  502: "La IA devolvió una respuesta inválida. Reformula tu pedido o inténtalo de nuevo.",
  503: "El servicio de IA no está disponible en este momento. Inténtalo de nuevo más tarde.",
};

export function cheapestOptionId(options: QuoteOption[]): string | null {
  if (options.length < 2) return null;
  const totals = options.map((option) => ({
    id: option.id,
    total: Number(option.totalPrice),
  }));
  const lowest = Math.min(...totals.map((entry) => entry.total));
  const winners = totals.filter((entry) => entry.total === lowest);
  return winners.length === 1 ? winners[0].id : null;
}

export function quoteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const mapped = error.status ? STATUS_MESSAGES[error.status] : undefined;
    return mapped ?? error.message;
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
