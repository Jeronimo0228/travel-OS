import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/crm/EmptyState";

export default function HomePage() {
  return (
    <AppShell>
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">
          Comando de Inteligencia
        </h2>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm">
        <EmptyState
          icon="dashboard"
          title="El panel de control llega en un próximo sprint"
          description="Mientras tanto, tu pipeline de ventas y prospectos ya está activo en el CRM Inteligente."
          action={
            <Link
              href="/crm"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-custom text-label-md hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              Ir al CRM Inteligente
            </Link>
          }
        />
      </div>
    </AppShell>
  );
}
