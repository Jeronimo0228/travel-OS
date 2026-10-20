"use client";

import { EmptyState } from "@/components/crm/EmptyState";
import { formatRelativeTime, pluralize } from "@/lib/format";
import { cheapestOptionId } from "@/lib/quote-logic";
import { QuoteOptionCard } from "./QuoteOptionCard";
import { useQuoterStore } from "./QuoterStoreProvider";

export function QuoteCanvas() {
  const { selected, loading } = useQuoterStore();

  if (!selected) {
    return (
      <section
        aria-label="Propuesta"
        className="h-full rounded-xl border border-outline-variant bg-surface-container-lowest"
      >
        {loading ? (
          <div className="space-y-3 p-6" aria-hidden="true">
            <div className="shimmer h-6 w-1/2 rounded-full bg-surface-container-highest" />
            <div className="shimmer h-40 w-full rounded-xl bg-surface-container-highest" />
          </div>
        ) : (
          <EmptyState
            icon="request_quote"
            title="Aún no hay cotizaciones"
            description="Escribe un pedido en el chat y TravelOS IA armará 2 o 3 alternativas comparables."
          />
        )}
      </section>
    );
  }

  const cheapestId = cheapestOptionId(selected.options);

  return (
    <section
      aria-label="Propuesta"
      className="custom-scrollbar @container flex h-full flex-col gap-6 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-6 pb-24"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-headline-lg text-primary">
            Borrador de propuesta: {selected.destination}
          </h2>
          <p className="font-body-custom text-body-sm text-on-surface-variant">
            {pluralize(selected.durationDays, "día", "días")} ·{" "}
            {pluralize(selected.travelerCount, "viajero", "viajeros")} ·
            Actualizado {formatRelativeTime(selected.updatedAt)}
          </p>
        </div>
      </header>

      <div
        className={`grid gap-4 @xl:grid-cols-2 ${
          selected.options.length >= 3 ? "@4xl:grid-cols-3" : ""
        }`}
      >
        {selected.options.map((option) => (
          <QuoteOptionCard
            key={option.id}
            option={option}
            cheapest={option.id === cheapestId}
          />
        ))}
      </div>
    </section>
  );
}
