import { KpiCards } from "./KpiCards";
import { PriorityInsights } from "./PriorityInsights";

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
          <PriorityInsights />
        </div>
      </div>

      <KpiCards />
    </section>
  );
}
