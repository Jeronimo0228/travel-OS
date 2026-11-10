"use client";

import { useCrmStore } from "./CrmStoreProvider";
import { crmKpis } from "@/lib/crm-kpis";

export function KpiCards() {
  const { leads, loading } = useCrmStore();
  const kpis = crmKpis(leads);
  const cards = [
    { label: "Prospectos activos", value: String(kpis.active), hint: `${kpis.closing} en cierre` },
    {
      label: "Conversión",
      value: kpis.conversion === null ? "—" : `${kpis.conversion} %`,
      hint: `${kpis.won} ganados · ${kpis.lost} perdidos`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant"
        >
          <p className="font-body-custom text-label-sm text-on-surface-variant uppercase mb-2">
            {kpi.label}
          </p>
          <h4 className="font-headline text-headline-lg tabular-nums">{loading ? "…" : kpi.value}</h4>
          <p className="text-[12px] font-bold text-secondary">{loading ? "" : kpi.hint}</p>
        </div>
      ))}
    </div>
  );
}
