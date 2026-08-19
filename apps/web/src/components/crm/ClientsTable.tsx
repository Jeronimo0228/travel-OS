"use client";

import { leadStages } from "@travelos/shared";
import { useCrmStore } from "./CrmStoreProvider";
import { EmptyState } from "./EmptyState";
import { stageBadge, type MockLead } from "./mock-data";

const stageBadgeClass: Record<MockLead["stage"], string> = {
  PROSPECTO: "bg-surface-container-high text-on-surface-variant",
  COTIZANDO: "bg-secondary-fixed text-on-secondary-fixed",
  CIERRE: "bg-tertiary-fixed-dim/40 text-on-tertiary-container",
  GANADO: "bg-success-emerald text-white",
  PERDIDO: "bg-error-container text-on-error-container",
};

const sentimentIcon: Record<MockLead["sentiment"], { icon: string; className: string }> = {
  satisfecho: { icon: "sentiment_very_satisfied", className: "text-success-emerald" },
  neutral: { icon: "sentiment_satisfied", className: "text-secondary" },
  urgente: { icon: "sentiment_dissatisfied", className: "text-alert-coral" },
};

const nextActionClass: Record<MockLead["sentiment"], string> = {
  satisfecho: "text-secondary",
  neutral: "text-on-surface-variant",
  urgente: "text-alert-coral",
};

type ClientsTableProps = {
  leads: MockLead[];
  onEdit: (lead: MockLead) => void;
};

export function ClientsTable({ leads, onEdit }: ClientsTableProps) {
  const { updateStage } = useCrmStore();

  return (
    <section className="col-span-12">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-data-table-header/30">
          <h3 className="font-headline text-headline-md text-primary">
            Inteligencia de Clientes Activos
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant font-body-custom text-label-sm">
              <span className="w-2 h-2 rounded-full bg-success-emerald" />{" "}
              Satisfecho
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-custom text-label-sm">
              <span className="w-2 h-2 rounded-full bg-secondary" /> Neutral
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-custom text-label-sm">
              <span className="w-2 h-2 rounded-full bg-alert-coral" /> Urgente
            </div>
          </div>
        </div>

        {leads.length === 0 ? (
          <EmptyState
            icon="person_search"
            title="Sin resultados"
            description="Ningún prospecto coincide con los filtros aplicados. Ajusta la búsqueda o la etapa seleccionada."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-data-table-header border-b border-outline-variant">
                  <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Tipo de Viaje
                  </th>
                  <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Puntaje Sentimiento
                  </th>
                  <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Próxima Acción
                  </th>
                  <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {leads.map((lead) => {
                  const sentiment = sentimentIcon[lead.sentiment];
                  const stage = lead.stage ?? "PROSPECTO";
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container" />
                          <div>
                            <p className="font-body-custom text-label-md text-primary">
                              {lead.name}
                            </p>
                            <p className="text-body-sm text-on-surface-variant">
                              {lead.notes}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <label className="sr-only" htmlFor={`stage-${lead.id}`}>
                          Etapa de {lead.name}
                        </label>
                        <select
                          id={`stage-${lead.id}`}
                          value={stage}
                          onChange={(event) =>
                            updateStage(
                              lead.id,
                              event.target.value as MockLead["stage"],
                            )
                          }
                          className={`px-3 py-1 text-[12px] font-bold rounded-full border-none outline-none cursor-pointer ${stageBadgeClass[stage]}`}
                        >
                          {leadStages.map((option) => (
                            <option key={option} value={option}>
                              {stageBadge[option]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-body-sm">{lead.tripType}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined ${sentiment.className}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {sentiment.icon}
                          </span>
                          <span className="font-body-custom text-data-mono font-bold">
                            {lead.sentimentScore}/100
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className={`text-body-sm font-medium ${nextActionClass[lead.sentiment]}`}
                        >
                          {lead.nextAction}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onEdit(lead)}
                          aria-label={`Editar ${lead.name}`}
                          className="text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
