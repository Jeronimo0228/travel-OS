"use client";

import { useEffect, useState } from "react";
import { pluralize } from "@/lib/format";
import {
  listPrioritizedLeads,
  priorityBand,
  type PrioritizedLead,
  type PriorityBand,
} from "@/lib/lead-priority";
import { quoteErrorMessage } from "@/lib/quote-logic";
import { stageBadge } from "./mock-data";

const VISIBLE_LEADS = 3;

const BAND_PRESENTATION: Record<
  PriorityBand,
  { icon: string; iconClass: string; caption: string }
> = {
  high: {
    icon: "call",
    iconClass: "text-success-emerald",
    caption: "Contactar ahora",
  },
  medium: {
    icon: "schedule",
    iconClass: "text-secondary-fixed",
    caption: "Dar seguimiento",
  },
  low: {
    icon: "ac_unit",
    iconClass: "text-alert-coral",
    caption: "Se está enfriando",
  },
};

function leadMeta({ lead, overdueTaskCount }: PrioritizedLead): string {
  return [
    lead.destination,
    stageBadge[lead.stage],
    overdueTaskCount > 0
      ? pluralize(overdueTaskCount, "tarea vencida", "tareas vencidas")
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function PriorityInsights() {
  const [items, setItems] = useState<PrioritizedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    listPrioritizedLeads()
      .then((result) => {
        if (!cancelled) setItems(result.slice(0, VISIBLE_LEADS));
      })
      .catch((err) => {
        if (!cancelled) setError(quoteErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refresh = () => setReloadToken((token) => token + 1);

  return (
    <div aria-live="polite">
      {loading && (
        <div className="space-y-4" aria-hidden="true">
          {Array.from({ length: VISIBLE_LEADS }, (_, index) => (
            <div key={index} className="shimmer h-20 rounded-lg bg-white/10" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-lg border border-white/20 bg-white/10 p-4 text-[12px]"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 rounded-lg border border-white/30 px-3 py-1 font-body-custom text-label-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-[12px] opacity-80">
          No hay leads activos para priorizar.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((item) => {
            const band = BAND_PRESENTATION[priorityBand(item.score)];
            return (
              <li
                key={item.lead.id}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <span
                  className={`material-symbols-outlined mt-1 ${band.iconClass}`}
                  aria-hidden="true"
                >
                  {band.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-body-custom text-label-md">
                      {item.lead.name}
                    </p>
                    <span className="shrink-0 font-body-custom text-label-sm opacity-80">
                      Score {item.score}
                    </span>
                  </div>
                  <p className="mt-1 font-body-custom text-label-sm">
                    {band.caption}
                  </p>
                  <p className="mt-1 text-[12px] opacity-70">{item.reason}</p>
                  <p className="mt-1 text-[12px] opacity-70">
                    {leadMeta(item)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !error && (
        <button
          type="button"
          onClick={refresh}
          className="mt-4 flex items-center gap-1 rounded-lg px-3 py-1 font-body-custom text-label-sm text-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed"
        >
          <span
            className="material-symbols-outlined text-[18px]"
            aria-hidden="true"
          >
            refresh
          </span>
          Actualizar priorización
        </button>
      )}
    </div>
  );
}
