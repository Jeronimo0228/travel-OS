import { kpiCards } from "./mock-data";

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {kpiCards.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant"
        >
          <p className="font-body-custom text-label-sm text-on-surface-variant uppercase mb-2">
            {kpi.label}
          </p>
          <div className="flex items-baseline gap-2">
            <h4 className="font-headline text-headline-lg">{kpi.value}</h4>
            <span className={`text-[12px] font-bold ${kpi.deltaClass}`}>
              {kpi.delta}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
