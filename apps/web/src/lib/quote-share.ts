import { formatCop } from "./format";
import type { Quote } from "./quotes";

/** Texto para enviar la cotización al viajero; sin datos internos (IDs, catálogo). */
export function quoteShareText(quote: Pick<Quote, "destination" | "durationDays" | "travelerCount" | "options">) {
  const lines = [
    `Hola, te comparto las opciones para tu viaje a ${quote.destination} ` +
      `(${quote.durationDays} días, ${quote.travelerCount} viajero${quote.travelerCount === 1 ? "" : "s"}):`,
    "",
    ...quote.options.map(
      (option, index) => `${index + 1}. ${option.title}: ${formatCop(option.totalPrice, option.currency)}`,
    ),
    "",
    "Te envío el PDF con el detalle. ¿Cuál prefieres?",
  ];
  return lines.join("\n");
}

export function quoteWhatsAppLink(quote: Parameters<typeof quoteShareText>[0]) {
  return `https://wa.me/?text=${encodeURIComponent(quoteShareText(quote))}`;
}
