"use client";

import { leadStages } from "@travelos/shared";
import { stageBadge } from "./mock-data";

export type StageFilter = "ALL" | (typeof leadStages)[number];

type CrmFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  stage: StageFilter;
  onStageChange: (value: StageFilter) => void;
};

export function CrmFilters({
  search,
  onSearchChange,
  stage,
  onStageChange,
}: CrmFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
      <div className="relative flex-1 min-w-[220px]">
        <label className="sr-only" htmlFor="crm-search">
          Buscar por nombre
        </label>
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          id="crm-search"
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-custom text-body-sm outline-none focus:ring-2 focus:ring-secondary-container"
        />
      </div>

      <div>
        <label className="sr-only" htmlFor="crm-stage-filter">
          Filtrar por etapa
        </label>
        <select
          id="crm-stage-filter"
          value={stage}
          onChange={(event) => onStageChange(event.target.value as StageFilter)}
          className="border border-outline-variant rounded-lg px-3 py-2 font-body-custom text-body-sm outline-none focus:ring-2 focus:ring-secondary-container bg-surface-container-lowest"
        >
          <option value="ALL">Todas las etapas</option>
          {leadStages.map((option) => (
            <option key={option} value={option}>
              {stageBadge[option]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
