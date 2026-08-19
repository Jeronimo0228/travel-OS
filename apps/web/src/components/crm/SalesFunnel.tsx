"use client";

import { useCrmStore } from "./CrmStoreProvider";
import { funnelStageOrder } from "./mock-data";

const columnOverlay = [
  "bg-secondary/5 group-hover:bg-secondary/10",
  "bg-indigo-500/10 group-hover:bg-indigo-500/20",
  "bg-success-emerald/10 group-hover:bg-success-emerald/20",
  "bg-gradient-to-br from-secondary/40 to-transparent",
];

export function SalesFunnel() {
  const { leads } = useCrmStore();
  const lastIndex = funnelStageOrder.length - 1;

  const total = leads.filter((lead) =>
    funnelStageOrder.some((stage) => stage.stage === lead.stage),
  ).length;

  const funnelStages = funnelStageOrder.map((stage) => {
    const count = leads.filter((lead) => lead.stage === stage.stage).length;
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return { ...stage, count, percent };
  });

  return (
    <section className="col-span-12 lg:col-span-8">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 h-full">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-headline text-headline-md text-primary">
            Embudo de Ventas
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary" />
            <span className="font-body-custom text-label-sm text-on-surface-variant">
              Seguimiento Automatizado
            </span>
          </div>
        </div>

        <div className="flex h-64 gap-2">
          {funnelStages.map((stage, index) => {
            const isWon = index === lastIndex;
            return (
              <div key={stage.stage} className="flex-1 flex flex-col group">
                <div
                  className={`flex-grow rounded-t-lg relative flex items-center justify-center overflow-hidden ${
                    isWon ? "bg-primary" : "bg-slate-100"
                  }`}
                >
                  <div
                    className={`absolute inset-0 transition-colors ${columnOverlay[index]}`}
                  />
                  <span
                    className={`relative z-10 font-headline text-display-lg ${
                      isWon ? "text-white/20" : "text-primary/10"
                    }`}
                  >
                    {stage.percent}%
                  </span>
                  <div
                    className={`absolute bottom-4 left-1/2 -translate-x-1/2 font-body-custom text-label-md ${
                      isWon ? "text-white" : "text-primary"
                    }`}
                  >
                    {stage.count} {stage.label}
                  </div>
                </div>
                <div
                  className={`h-10 rounded-b-lg mt-1 flex items-center justify-center font-body-custom text-label-sm ${
                    isWon
                      ? "bg-slate-800 text-white/60"
                      : "bg-slate-200 text-on-surface-variant"
                  }`}
                >
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4 p-4 bg-surface-container-low rounded-lg border-l-4 border-secondary">
          <span className="material-symbols-outlined text-secondary">
            info
          </span>
          <p className="font-body-custom text-body-sm text-on-surface-variant italic">
            &ldquo;La fase de &lsquo;Cotización&rsquo; ha aumentado un 12%
            desde la implementación de la nueva Plantilla Inteligente de IA.
            Los ingresos proyectados para el T3 han subido $240k.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
