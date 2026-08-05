import { coPilotInsights } from "./mock-data";
import { KpiCards } from "./KpiCards";

export function CoPilotPanel() {
  return (
    <section className="col-span-12 lg:col-span-4 flex flex-col gap-4">
      <div className="bg-primary-container text-white p-6 rounded-xl relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary-fixed">
              bolt
            </span>
            <h3 className="font-headline text-headline-md">Co-Piloto IA</h3>
          </div>
          <div className="space-y-4">
            {coPilotInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-start gap-3 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span
                  className={`material-symbols-outlined mt-1 ${insight.iconClass}`}
                >
                  {insight.icon}
                </span>
                <div>
                  <p className="font-body-custom text-label-md">
                    {insight.title}
                  </p>
                  <p className="text-[12px] opacity-70 mt-1">
                    {insight.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <KpiCards />
    </section>
  );
}
