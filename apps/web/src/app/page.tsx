import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-headline-xl text-primary mb-1">
            Comando de Inteligencia
          </h2>
          <p className="font-body-custom text-body-md text-on-surface-variant">
            Panel de control en construcción. El CRM inteligente ya está
            disponible.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant shadow-sm max-w-xl">
        <p className="font-body-custom text-body-md text-on-surface-variant mb-4">
          Este panel se construirá en un sprint posterior. Mientras tanto,
          revisa el pipeline de ventas en el CRM Inteligente.
        </p>
        <Link
          href="/crm"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-body-custom text-label-md hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">group</span>
          Ir al CRM Inteligente
        </Link>
      </div>
    </AppShell>
  );
}
