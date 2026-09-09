"use client";

import { useMemo, useState } from "react";
import { leadStages } from "@travelos/shared";
import type { Lead } from "@/lib/leads";
import { useCrmStore } from "./CrmStoreProvider";
import { stageBadge } from "./mock-data";

const boardStages = leadStages;

export function PipelineBoard() {
  const { leads, updateStage } = useCrmStore();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<Lead["stage"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(() => {
    return boardStages.map((stage) => ({
      stage,
      label: stageBadge[stage],
      items: leads.filter((lead) => lead.stage === stage),
    }));
  }, [leads]);

  async function moveLead(leadId: string, stage: Lead["stage"]) {
    setError(null);
    try {
      await updateStage(leadId, stage);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo mover el lead.",
      );
    }
  }

  return (
    <section className="col-span-12 lg:col-span-8" aria-label="Pipeline visual por etapas">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-headline text-headline-md text-primary">
              Pipeline por etapas
            </h3>
            <p className="font-body-custom text-body-sm text-on-surface-variant">
              Arrastra un prospecto a otra columna para cambiar su etapa.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mb-3 text-body-sm text-alert-coral">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3 min-h-[280px]">
          {columns.map((column) => (
            <div
              key={column.stage}
              onDragOver={(event) => {
                event.preventDefault();
                setDropTarget(column.stage);
              }}
              onDragLeave={() =>
                setDropTarget((current) =>
                  current === column.stage ? null : current,
                )
              }
              onDrop={(event) => {
                event.preventDefault();
                const leadId =
                  event.dataTransfer.getData("text/lead-id") || draggingId;
                setDropTarget(null);
                setDraggingId(null);
                if (leadId) void moveLead(leadId, column.stage);
              }}
              className={`rounded-xl border p-3 flex flex-col gap-2 transition-colors ${
                dropTarget === column.stage
                  ? "border-secondary bg-secondary/10"
                  : "border-outline-variant bg-surface-container-low/40"
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <span className="font-body-custom text-label-md text-primary">
                  {column.label}
                </span>
                <span className="font-body-custom text-label-sm text-on-surface-variant">
                  {column.items.length}
                </span>
              </div>

              <div className="flex flex-col gap-2 min-h-[180px]">
                {column.items.map((lead) => (
                  <article
                    key={lead.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/lead-id", lead.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDraggingId(lead.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDropTarget(null);
                    }}
                    className={`rounded-lg border border-outline-variant bg-surface-container-lowest p-3 cursor-grab active:cursor-grabbing shadow-sm ${
                      draggingId === lead.id ? "opacity-60" : ""
                    }`}
                  >
                    <p className="font-body-custom text-label-md text-primary truncate">
                      {lead.name}
                    </p>
                    <p className="text-body-sm text-on-surface-variant truncate">
                      {lead.destination ?? lead.email ?? "Sin detalle"}
                    </p>
                  </article>
                ))}
                {column.items.length === 0 && (
                  <p className="text-body-sm text-on-surface-variant/70 px-1 py-6 text-center">
                    Suelta aquí
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
