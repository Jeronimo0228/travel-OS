"use client";

import { Fragment, useState } from "react";
import { leadStages } from "@travelos/shared";
import type { Lead } from "@/lib/leads";
import type { AgencyUser } from "@/lib/users";
import { Avatar } from "@/components/shared/Avatar";
import { useCrmStore } from "./CrmStoreProvider";
import { EmptyState } from "./EmptyState";
import { LeadTasksPanel } from "./LeadTasksPanel";
import { stageBadge } from "./mock-data";

const stageBadgeClass: Record<Lead["stage"], string> = {
  PROSPECTO: "bg-surface-container-high text-on-surface-variant",
  COTIZANDO: "bg-secondary-fixed text-on-secondary-fixed",
  CIERRE: "bg-tertiary-fixed-dim/40 text-on-tertiary-container",
  GANADO: "bg-success-emerald text-white",
  PERDIDO: "bg-error-container text-on-error-container",
};

type ClientsTableProps = {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (lead: Lead) => void;
  advisors: AgencyUser[];
  canAssign: boolean;
};

const SKELETON_ROWS = 3;

export function ClientsTable({
  leads,
  loading,
  error,
  onRetry,
  onEdit,
  advisors,
  canAssign,
}: ClientsTableProps) {
  const { updateStage, assignLead } = useCrmStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const colSpan = canAssign ? 6 : 5;

  async function handleAssign(leadId: string, assigneeId: string) {
    if (!assigneeId) return;
    setAssignError(null);
    try {
      await assignLead(leadId, assigneeId);
    } catch (err) {
      setAssignError(
        err instanceof Error ? err.message : "No se pudo asignar el lead.",
      );
    }
  }

  return (
    <section className="col-span-12">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-data-table-header/30">
          <h3 className="font-headline text-headline-md text-primary">
            Inteligencia de Clientes Activos
          </h3>
          {assignError && (
            <p role="alert" className="mt-2 text-body-sm text-alert-coral">
              {assignError}
            </p>
          )}
        </div>

        {error ? (
          <div className="p-6 flex flex-col items-center gap-3 text-center">
            <p className="font-body-custom text-body-sm text-alert-coral">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-custom text-label-md hover:bg-surface-container-low transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <div className="p-6 space-y-3" aria-busy="true" aria-label="Cargando prospectos">
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <div key={index} className="h-14 rounded-lg bg-surface-container-low animate-pulse" />
            ))}
          </div>
        ) : leads.length === 0 ? (
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
                  {canAssign && (
                    <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Asesor
                    </th>
                  )}
                  <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Notas
                  </th>
                  <th className="px-6 py-4 font-body-custom text-label-sm text-on-surface-variant uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {leads.map((lead) => {
                  const stage = lead.stage;
                  const isExpanded = expandedId === lead.id;
                  return (
                    <Fragment key={lead.id}>
                      <tr className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={lead.name} />
                            <div>
                              <p className="font-body-custom text-label-md text-primary">
                                {lead.name}
                              </p>
                              <p className="text-body-sm text-on-surface-variant">
                                {lead.email ?? lead.phone ?? "Sin contacto"}
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
                              updateStage(lead.id, event.target.value as Lead["stage"])
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
                        {canAssign && (
                          <td className="px-6 py-4">
                            <label className="sr-only" htmlFor={`assignee-${lead.id}`}>
                              Asesor de {lead.name}
                            </label>
                            <select
                              id={`assignee-${lead.id}`}
                              value={lead.assigneeId ?? ""}
                              onChange={(event) =>
                                void handleAssign(lead.id, event.target.value)
                              }
                              className="border border-outline-variant rounded-lg px-2 py-1 font-body-custom text-body-sm bg-surface-container-lowest max-w-[160px]"
                            >
                              <option value="" disabled>
                                Sin asignar
                              </option>
                              {advisors.map((advisor) => (
                                <option key={advisor.id} value={advisor.id}>
                                  {advisor.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        )}
                        <td className="px-6 py-4 text-body-sm">
                          {lead.destination ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-body-sm text-on-surface-variant max-w-xs truncate">
                          {lead.notes ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : lead.id)
                              }
                              aria-label={`${isExpanded ? "Ocultar" : "Ver"} tareas de ${lead.name}`}
                              aria-expanded={isExpanded}
                              className="text-on-surface-variant hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined">
                                {isExpanded ? "expand_less" : "checklist"}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onEdit(lead)}
                              aria-label={`Editar ${lead.name}`}
                              className="text-on-surface-variant hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={colSpan} className="p-0">
                            <LeadTasksPanel leadId={lead.id} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
